import { useSearchParams } from 'react-router-dom'
import {
  ArrowRight,
  Clock,
  FileCheck,
  CreditCard,
  Bot,
  Inbox,
} from 'lucide-react'
import { useEffect, useMemo, useRef } from 'react'
import { useApp } from '../context/AppContext'
import { useAgents } from '../context/AgentContext'
import { RUN_STATUS_LABEL } from '../data/agents'
import { workbenchPathForStage } from '../data/workbenchMap'
import { EmptyState } from '../components/PageHeader'
import { getLastCaseId, getLastAgentSessionId } from '../utils/lastVisited'
import {
  buildOpsInbox,
  countOpsInbox,
  type OpsInboxItem,
  type OpsInboxSource,
} from '../utils/opsInbox'
import { flattenMaintainSchedules } from '../utils/slaInbox'
import { DashboardSecondary } from './DashboardSecondary'
import { BillingHoldBanner } from '../components/BillingHoldBanner'
import { AppLink } from '../components/AppLink'

type ScanChipKind = 'sla' | 'deadline' | 'risk' | 'who' | 'gate'
type ScanChip = { kind: ScanChipKind; k: string; v: string }

/** Presentation-only: split SLA / risk / who into chips. Does not change inbox data. */
function scanChipsFromInbox(item: OpsInboxItem): { chips: ScanChip[]; residual?: string } {
  const bits = (item.subtitle ?? '')
    .split(' · ')
    .map((part) => part.trim())
    .filter(Boolean)

  let sla: string | undefined
  let slaOver = false
  let slaSoon = false
  let slaOverdueLabel = false
  let risk: string | undefined
  const residual: string[] = []

  for (const bit of bits) {
    if (bit === '超 SLA') {
      slaOver = true
      continue
    }
    const slaDate = bit.match(/^SLA\s+(\d{4}-\d{2}-\d{2})$/)
    if (slaDate) {
      sla = slaDate[1]
      continue
    }
    if (bit === '已逾期' || bit === '逾期') {
      slaOverdueLabel = true
      sla = sla ? `${bit} · ${sla}` : bit
      continue
    }
    if (bit === '即将到期') {
      slaSoon = true
      sla = sla ? `${bit} · ${sla}` : bit
      continue
    }
    if (bit === '风险旗标' || bit === '期限升级') {
      risk = risk ? `${risk} · ${bit}` : bit
      continue
    }
    if (bit.startsWith('风险')) {
      risk = bit.slice(2) || '有'
      continue
    }
    if (item.gateLabel && (bit === `闸 ${item.gateLabel}` || bit === '待确认')) continue
    if (bit === item.title) continue
    residual.push(bit)
  }

  if (!sla && item.due) sla = item.due
  else if (slaOver && sla) sla = `已超 · ${sla}`
  else if (slaOver) sla = '已超'

  // 危急色：已逾期/超 SLA → risk；即将到期 → deadline；其余 SLA 保底 deadline（勿一律 amber sla）
  const slaKind: ScanChipKind =
    slaOver || slaOverdueLabel ? 'risk' : slaSoon || !!sla ? 'deadline' : 'sla'

  const chips: ScanChip[] = []
  if (sla) chips.push({ kind: slaKind, k: 'SLA', v: sla })
  if (risk) chips.push({ kind: 'risk', k: '风险', v: risk })
  chips.push({ kind: 'who', k: '谁该动', v: item.whoShouldAct })
  if (item.gateLabel) chips.push({ kind: 'gate', k: '闸', v: item.gateLabel })

  return { chips, residual: residual.length ? residual.join(' · ') : undefined }
}

function ScanChips({
  chips,
  className,
  label,
}: {
  chips: ScanChip[]
  className?: string
  label: string
}) {
  return (
    <div className={className ?? 'dash-scan-chips'} aria-label={label}>
      {chips.map((c) => (
        <span key={`${c.kind}-${c.v}`} className="dash-scan-chip" data-kind={c.kind}>
          <span className="dash-scan-chip-k">{c.k}</span>
          <span className="dash-scan-chip-v tabular">{c.v}</span>
        </span>
      ))}
    </div>
  )
}

const SOURCE_PILL: Record<string, string> = {
  工作台: 'border-slate-200 bg-slate-50 text-slate-800',
  Agent: 'token-info-chip',
  期限: 'border-amber-200 bg-amber-50 text-amber-900',
  '监控·维持': 'border-rose-200 bg-rose-50 text-rose-900',
}

const INBOX_GROUPS: {
  id: string
  label: string
  sources: OpsInboxSource[]
}[] = [
  { id: 'deadline', label: '期限与监控', sources: ['docket', 'sla'] },
  { id: 'workbench', label: '工作台', sources: ['workbench'] },
  { id: 'agent', label: 'Agent', sources: ['agent'] },
]

const GROUP_TIE: Record<string, number> = {
  deadline: 0,
  workbench: 1,
  agent: 2,
}

/** Remind P2 · 组序按组内最小紧迫 band，避免 Agent 段视觉压过期限 */
function groupMinBand(items: OpsInboxItem[]): string {
  let min = '9'
  for (const it of items) {
    const b = (it.sortKey ?? '9')[0] ?? '9'
    if (b < min) min = b
  }
  return min
}

function groupInbox(items: OpsInboxItem[]) {
  return INBOX_GROUPS.map((g) => ({
    ...g,
    items: items.filter((it) => g.sources.includes(it.source)),
  }))
    .filter((g) => g.items.length > 0)
    .sort((a, b) => {
      const ba = groupMinBand(a.items)
      const bb = groupMinBand(b.items)
      if (ba !== bb) return ba.localeCompare(bb)
      return (GROUP_TIE[a.id] ?? 9) - (GROUP_TIE[b.id] ?? 9)
    })
}

export function Dashboard() {
  const [searchParams] = useSearchParams()
  const inboxFocusId = searchParams.get('inbox')
  const inboxSectionRef = useRef<HTMLElement | null>(null)
  const {
    visibleCases: cases,
    recentActivity,
    workspace,
    visibleDocketEvents: docketEvents,
    workspaceTodos,
    role,
    persona,
    pendingPayInvoiceCount,
    pendingDisclosures,
    advanceDisclosure,
    insightDrivenCount,
    hasBlockingInvoiceForCase,
    getWatchAlerts,
    getMaintainSchedule,
  } = useApp()
  const { visibleSessions, agents } = useAgents()
  const lastCaseId = getLastCaseId()
  const lastSessionId = getLastAgentSessionId()
  const lastCase = lastCaseId ? cases.find((c) => c.id === lastCaseId) : undefined
  const lastSession = lastSessionId
    ? visibleSessions.find((s) => s.id === lastSessionId)
    : undefined
  const activeAgentRuns = visibleSessions.filter((r) =>
    ['running', 'queued', 'needs_human'].includes(r.status),
  )

  const selfServeCount = cases.filter((c) => c.fulfillmentMode === 'self_serve').length
  const delegatedCount = cases.filter((c) => c.fulfillmentMode !== 'self_serve').length
  const selfServePct = Math.round((selfServeCount / Math.max(cases.length, 1)) * 100)
  const delegatedPct = Math.round((delegatedCount / Math.max(cases.length, 1)) * 100)

  /** Wave2 SlaInbox · 可见案 Watch 告警扁平化 */
  const watchAlertsFlat = useMemo(
    () =>
      cases.flatMap((c) =>
        getWatchAlerts(c.id).map((alert) => ({ caseId: c.id, alert })),
      ),
    [cases, getWatchAlerts],
  )

  /** Wave2 SlaInbox · Maintain 日程（AppContext 单源；与 Docket 年费去重在 buildOpsInbox） */
  const maintainSchedulesFlat = useMemo(
    () => flattenMaintainSchedules(cases.map((c) => c.id), getMaintainSchedule),
    [cases, getMaintainSchedule],
  )

  /** 统一 Inbox：工作台 + Agent + 期限 + Watch/年费 SLA */
  const inbox = useMemo(
    () =>
      buildOpsInbox({
        role,
        persona,
        cases,
        todos: workspaceTodos,
        sessions: visibleSessions,
        agents,
        docketEvents,
        isInvoiceBlocked: (caseId) =>
          hasBlockingInvoiceForCase(caseId).blocked,
        watchAlerts: watchAlertsFlat,
        maintainSchedules: maintainSchedulesFlat,
      }),
    [
      role,
      persona,
      cases,
      workspaceTodos,
      visibleSessions,
      agents,
      docketEvents,
      hasBlockingInvoiceForCase,
      watchAlertsFlat,
      maintainSchedulesFlat,
    ],
  )
  const inboxCounts = useMemo(() => countOpsInbox(inbox), [inbox])
  const inboxGroups = useMemo(() => groupInbox(inbox), [inbox])
  const nextItem = inbox[0]
  const nextScan = nextItem ? scanChipsFromInbox(nextItem) : null

  useEffect(() => {
    if (!inboxFocusId) return
    const reduce =
      typeof window !== 'undefined' &&
      window.matchMedia('(prefers-reduced-motion: reduce)').matches
    const tid = window.setTimeout(() => {
      const row = document.getElementById(`ops-inbox-row-${inboxFocusId}`)
      const target = row ?? inboxSectionRef.current
      target?.scrollIntoView({ behavior: reduce ? 'auto' : 'smooth', block: 'center' })
    }, 60)
    return () => window.clearTimeout(tid)
  }, [inboxFocusId, inbox.length])

  const secondaryActions = [
    ...(lastSession
      ? [
          {
            label: '继续会话',
            to: `/agent/sessions/${lastSession.id}`,
            ariaLabel: `继续会话 ${lastSession.title}`,
          },
        ]
      : [
          {
            label: '知产 Agent',
            to: '/agent',
            icon: <Bot className="h-3.5 w-3.5" aria-hidden />,
          },
        ]),
  ]

  return (
    <div className="px-5 py-5 lg:px-8 lg:py-6">
      <section className="dash-board-top mb-6" aria-label="资产与任务看板">
        <div className="dash-board-head">
          <div className="dash-board-copy min-w-0">
            <div className="dash-board-title-row">
              <h1 className="dash-board-title">资产与任务看板</h1>
              <span
                className={`dash-board-org ${workspace.brandColor} border-current/20`}
              >
                {workspace.orgName}
              </span>
            </div>
            <p className="dash-board-status">
              <span>
                {workspace.chipLabel} · {workspace.homeEmphasis} ·{' '}
                <span className="tabular">{cases.length}</span> 件在管 · 期限{' '}
                <span className="tabular">{docketEvents.length}</span> 条
              </span>
              <span className="dash-board-status-links" aria-label="快捷入口">
                {lastSession && (
                  <AppLink
                    to="/agent"
                    className="dash-board-quiet-link focus-ring"
                  >
                    <Bot className="h-3.5 w-3.5" aria-hidden />
                    知产 Agent
                  </AppLink>
                )}
                <AppLink to="/docket" className="dash-board-quiet-link focus-ring">
                  官方期限
                </AppLink>
                {role === 'enterprise' ? (
                  <AppLink
                    to="/agencies"
                    className="dash-board-quiet-link focus-ring"
                  >
                    派单代理
                  </AppLink>
                ) : (
                  <AppLink
                    to="/workbench/prosecution"
                    className="dash-board-quiet-link focus-ring"
                  >
                    我方承办 · 答复
                  </AppLink>
                )}
              </span>
            </p>
          </div>
          <div className="dash-board-ctas">
            {secondaryActions.map((a) => (
              <AppLink
                key={a.label + (a.to ?? '')}
                to={a.to!}
                className="ui-btn ui-btn-secondary btn-press focus-ring"
                aria-label={a.ariaLabel ?? a.label}
              >
                {'icon' in a ? a.icon : null}
                {a.label}
              </AppLink>
            ))}
            <AppLink
              to={
                lastCase
                  ? workbenchPathForStage(lastCase.stage, lastCase.id)
                  : '/workbench'
              }
              className="ui-btn ui-btn-primary btn-press cta-work focus-ring"
              aria-label={lastCase ? `办理 ${lastCase.title}` : '进入业务工作台'}
            >
              <ArrowRight className="h-4 w-4" aria-hidden />
              {lastCase
                ? `办理 · ${lastCase.title.slice(0, 12)}`
                : '进入业务工作台'}
            </AppLink>
          </div>
        </div>

        {nextItem && (
          <div
            className="dash-next"
            role="region"
            aria-label="下一步 · 优先办理"
          >
            <div className="dash-next-main min-w-0">
              <div className="dash-next-kicker">下一步 · 优先办理</div>
              <div className="dash-next-body">
                <span
                  className={`dash-inbox-tag ${SOURCE_PILL[nextItem.sourceLabel] ?? 'border-slate-200 bg-slate-50 text-slate-600'}`}
                >
                  {nextItem.sourceLabel}
                </span>
                <div className="min-w-0">
                  <p className="dash-next-title truncate" title={nextItem.title}>{nextItem.title}</p>
                  {nextScan?.residual && (
                    <p className="dash-next-sub">{nextScan.residual}</p>
                  )}
                </div>
              </div>
            </div>
            <ScanChips
              className="dash-next-meta dash-scan-chips"
              label="优先事项要点"
              chips={nextScan?.chips ?? []}
            />
            <AppLink
              to={nextItem.href}
              className="ui-btn ui-btn-primary btn-press cta-work focus-ring dash-next-cta"
              aria-label={`${nextItem.source === 'agent' ? '确认' : '办理'} ${nextItem.title}`}
            >
              {nextItem.source === 'agent' ? '去确认' : '去办理'}
              <ArrowRight className="h-4 w-4" aria-hidden />
            </AppLink>
          </div>
        )}
      </section>

      <div className="kpi-strip kpi-stagger mb-8">
        <a
          href="#ops-inbox"
          className="kpi-tile focus-ring"
          aria-label="待我办理 Inbox"
        >
          <div className="flex items-center justify-between gap-2">
            <span className="kpi-tile-label">待我办理</span>
            <Inbox className="h-4 w-4 text-slate-500" aria-hidden />
          </div>
          <div className="kpi-tile-value">{inboxCounts.total}</div>
          <div className="kpi-tile-chips">
            <span className="kpi-chip">
              工作台 <b>{inboxCounts.workbench}</b>
            </span>
            <span className="kpi-chip">
              Agent <b>{inboxCounts.agent}</b>
            </span>
            <span className="kpi-chip">
              期限 <b>{inboxCounts.docket}</b>
            </span>
            {inboxCounts.sla > 0 && (
              <span className="kpi-chip">
                监控·维持 <b>{inboxCounts.sla}</b>
              </span>
            )}
          </div>
        </a>
        <AppLink
          to="/docket"
          className="kpi-tile focus-ring"
          aria-label="期限压力"
        >
          <div className="flex items-center justify-between gap-2">
            <span className="kpi-tile-label">期限压力</span>
            <Clock className="h-4 w-4 text-amber-600" aria-hidden />
          </div>
          <div className="kpi-tile-value">
            {inboxCounts.docket + inboxCounts.sla}
          </div>
          <div className="kpi-tile-chips">
            <span className="kpi-chip">
              期限 <b>{inboxCounts.docket}</b>
            </span>
            <span className="kpi-chip">
              监控·维持 <b>{inboxCounts.sla}</b>
            </span>
            <span className="kpi-chip">
              待付款 <b>{pendingPayInvoiceCount}</b>
            </span>
          </div>
        </AppLink>
        <AppLink
          to="/billing/cases"
          className="kpi-tile focus-ring"
          aria-label="待付款发票"
        >
          <div className="flex items-center justify-between gap-2">
            <span className="kpi-tile-label">待付款发票</span>
            <CreditCard className="h-4 w-4 text-slate-500" aria-hidden />
          </div>
          <div className="kpi-tile-value">{pendingPayInvoiceCount}</div>
          <div className="kpi-tile-chips">
            <span className="kpi-chip">已开票 / 逾期</span>
            <span className="kpi-chip">
              在管 <b>{cases.length}</b>
            </span>
          </div>
        </AppLink>
      </div>

      <BillingHoldBanner className="mb-4" />

      <section
        id="ops-inbox"
        ref={inboxSectionRef}
        className="surface-card dash-inbox mb-6 scroll-mt-20"
      >
        <div className="dash-inbox-head">
          <h2 className="flex items-center gap-2 text-sm font-semibold text-slate-900">
            <Inbox className="h-4 w-4 text-slate-600" aria-hidden />
            待我办理
            <span className="rounded-full bg-slate-100 px-2 py-0.5 text-xs font-medium tabular text-slate-600">
              {inboxCounts.total}
            </span>
          </h2>
          <p className="text-xs text-slate-500">
            {role === 'enterprise'
              ? '企业审核 / 确认闸 / 期限 / 监控·维持 SLA'
              : '代理办理队列 · 监控·维持可处置 · 企业专属闸已隐藏'}
          </p>
        </div>

        {inbox.length === 0 ? (
          <div className="p-4">
            <EmptyState
              title="暂无待我办理事项"
              description={
                workspace.kind === 'agency'
                  ? `工作台 ${inboxCounts.workbench} · Agent ${inboxCounts.agent} · 期限 ${inboxCounts.docket}${inboxCounts.sla > 0 ? ` · 监控·维持 ${inboxCounts.sla}` : ''} · 等待企业派单或继续起草中案件`
                  : `工作台 ${inboxCounts.workbench} · Agent ${inboxCounts.agent} · 期限 ${inboxCounts.docket}${inboxCounts.sla > 0 ? ` · 监控·维持 ${inboxCounts.sla}` : ''} · 可从工作台或知产 Agent 发起`
              }
              primary={{
                label: '进入业务工作台',
                to: '/workbench',
                icon: <ArrowRight className="h-4 w-4" aria-hidden />,
              }}
              secondary={{
                label: '知产 Agent',
                to: '/agent',
                icon: <Bot className="h-3.5 w-3.5" aria-hidden />,
              }}
            />
          </div>
        ) : (
          <>
            <div className="dash-inbox-cols" aria-hidden>
              <span>来源</span>
              <span>事项</span>
              <span>SLA · 风险 · 谁该动</span>
              <span className="text-right">动作</span>
            </div>
            {inboxGroups.map((group) => {
              const band = groupMinBand(group.items)
              const weight =
                group.id === 'deadline' || band <= '1' ? 'high' : 'normal'
              return (
              <div
                key={group.id}
                className="dash-inbox-group"
                data-group={group.id}
                data-weight={weight}
              >
                <div
                  className={`dash-inbox-group-label${
                    group.id === 'deadline' || weight === 'high'
                      ? ' dash-inbox-group-label-urgent'
                      : ''
                  }`}
                >
                  {group.label}
                  <span className="rounded-full bg-white/80 px-1.5 py-0.5 text-[10px] font-medium tabular text-slate-500 ring-1 ring-slate-200/80">
                    {group.items.length}
                  </span>
                </div>
                <ul>
                  {group.items.map((item) => {
                    const focused = inboxFocusId === item.id
                    const scan = scanChipsFromInbox(item)
                    return (
                      <li key={item.id} id={`ops-inbox-row-${item.id}`}>
                        <AppLink
                          to={item.href}
                          data-focused={focused ? 'true' : undefined}
                          className="dash-inbox-row list-row focus-ring"
                          aria-label={`${item.sourceLabel} · ${item.title}`}
                        >
                          <span
                            className={`dash-inbox-tag ${SOURCE_PILL[item.sourceLabel] ?? 'border-slate-200 bg-slate-50 text-slate-600'}`}
                          >
                            {item.sourceLabel}
                          </span>
                          <div className="min-w-0">
                            <div className="flex flex-wrap items-center gap-1.5">
                              <span className="dash-inbox-title truncate" title={item.title}>
                                {item.title}
                              </span>
                              {item.source === 'agent' && item.gateLabel && (
                                <span className="dash-inbox-tag token-info-chip">
                                  闸 · {item.gateLabel}
                                </span>
                              )}
                            </div>
                            {scan.residual && (
                              <p className="dash-inbox-sub">{scan.residual}</p>
                            )}
                            {item.sameCaseHint && (
                              <p className="dash-inbox-hint truncate">
                                {item.sameCaseHint}
                              </p>
                            )}
                          </div>
                          <ScanChips
                            className="dash-inbox-meta"
                            label="SLA 风险 谁该动"
                            chips={scan.chips.filter((c) => c.kind !== 'gate')}
                          />
                          <span className="dash-inbox-action">
                            {item.source === 'agent' ? '确认' : '办理'}
                            <ArrowRight className="h-3.5 w-3.5" aria-hidden />
                          </span>
                        </AppLink>
                      </li>
                    )
                  })}
                </ul>
              </div>
            )})}
          </>
        )}

        {/* 诚实空态分类：有总量但某源为 0 时提示 */}
        {inbox.length > 0 &&
          (inboxCounts.workbench === 0 ||
            inboxCounts.agent === 0 ||
            inboxCounts.docket === 0 ||
            inboxCounts.sla === 0) && (
            <p className="border-t border-slate-100 px-4 py-2.5 text-xs text-slate-400">
              分类空态：
              {inboxCounts.workbench === 0 ? ' 工作台无待办 ·' : ''}
              {inboxCounts.agent === 0
                ? role === 'agency'
                  ? ' 无待我确认 Agent（企业专属闸已隐藏）·'
                  : ' 无待确认 Agent ·'
                : ''}
              {inboxCounts.docket === 0 ? ' 无 due_soon/overdue 期限 ·' : ''}
              {inboxCounts.sla === 0 ? ' 无监控·维持 SLA' : ''}
            </p>
          )}
      </section>

      {cases.length === 0 && (
        <div className="mb-6">
          <EmptyState
            title="本租户暂无可见案件"
            description={
              workspace.kind === 'agency'
                ? '等待企业派单后，承办案件将出现在此。'
                : '可通过研发交底或洞察生成调研案。'
            }
            primary={{
              label: '进入业务工作台',
              to: '/workbench',
            }}
          />
        </div>
      )}

      {workspace.kind === 'enterprise' && pendingDisclosures.length > 0 && (
        <div className="surface-card mb-6 border-amber-200 bg-amber-50/40 p-5">
          <div className="mb-3 flex items-center justify-between gap-2">
            <h2 className="flex items-center gap-2 text-sm font-medium text-amber-950">
              <FileCheck className="h-4 w-4 text-amber-700" aria-hidden />
              待审交底
            </h2>
            <AppLink
              to="/inventor"
              className="text-xs text-slate-700 hover:text-slate-900 focus-ring rounded"
            >
              打开交底门户 →
            </AppLink>
          </div>
          <ul className="space-y-2">
            {pendingDisclosures.slice(0, 4).map((d) => (
              <li
                key={d.id}
                className="flex flex-wrap items-center justify-between gap-2 rounded-[var(--radius-md)] border border-amber-100 bg-white px-3 py-2.5"
              >
                <div className="min-w-0">
                  <div className="truncate text-sm font-medium text-slate-800" title={d.title}>
                    {d.title}
                  </div>
                  <div className="text-xs text-slate-500">
                    {d.inventor} · {d.dept} · {d.status}
                  </div>
                </div>
                <div className="flex flex-wrap gap-1.5">
                  {d.status === '部门审核' && (
                    <button
                      type="button"
                      onClick={() =>
                        advanceDisclosure(d.id, 'IP受理', '仪表盘 · 部门通过')
                      }
                      className="ui-btn ui-btn-primary ui-btn-sm btn-press cta-work focus-ring"
                      aria-label={`部门通过 ${d.title}`}
                    >
                      部门通过
                    </button>
                  )}
                  {d.status === 'IP受理' && (
                    <button
                      type="button"
                      onClick={() => {
                        advanceDisclosure(d.id, '已立案', '仪表盘 · IP 立案')
                      }}
                      className="ui-btn ui-btn-success ui-btn-sm btn-press focus-ring"
                      aria-label={`IP 立案 ${d.title}`}
                    >
                      IP 立案
                    </button>
                  )}
                </div>
              </li>
            ))}
          </ul>
        </div>
      )}

      <details className="surface-card mb-6">
        <summary className="focus-ring cursor-pointer list-none rounded-[var(--radius-lg)] px-4 py-3 text-sm font-medium text-slate-700 hover:bg-slate-50/80 [&::-webkit-details-marker]:hidden">
          <span className="inline-flex items-center gap-2">
            <Bot className="h-4 w-4 text-slate-600" aria-hidden />
            活跃 Agent 会话
            {activeAgentRuns.length > 0 && (
              <span className="rounded-full bg-slate-100 px-2 py-0.5 text-xs font-normal tabular text-slate-600">
                {activeAgentRuns.length}
              </span>
            )}
          </span>
          <span className="ml-2 text-xs font-normal text-slate-400">展开</span>
        </summary>
        <div className="border-t border-slate-100 p-4">
          <div className="mb-3 flex items-center justify-between">
            <h2 className="text-sm font-semibold text-slate-800">运行中 / 待确认</h2>
            <AppLink
              to="/agent/sessions"
              className="text-xs text-slate-700 hover:underline focus-ring rounded"
            >
              全部会话
            </AppLink>
          </div>
          {activeAgentRuns.length === 0 ? (
            <p className="text-xs text-slate-500">暂无运行中任务 · 从知产 Agent 发起</p>
          ) : (
            <ul className="divide-y divide-slate-100">
              {activeAgentRuns.slice(0, 5).map((r) => {
                const ag = agents.find((a) => a.id === r.agentId)
                const c = cases.find((x) => x.id === r.caseId)
                return (
                  <li key={r.id}>
                    <AppLink
                      to={
                        r.status === 'needs_human' || r.hitlPending
                          ? `/agent/sessions/${r.id}?focus=hitl`
                          : `/agent/sessions/${r.id}`
                      }
                      className="list-row flex items-center justify-between gap-3 -mx-1 rounded-[var(--radius-sm)] px-1 py-2.5 hover:bg-slate-50/80"
                    >
                      <div className="min-w-0">
                        <div className="truncate text-sm text-slate-800">
                          {ag?.name} · {r.goal}
                        </div>
                        <div className="truncate text-xs text-slate-400">
                          {c
                            ? `${c.caseNo ? `${c.caseNo} · ` : ''}${c.title}`
                            : (r.caseId ?? '未关联案件')}
                        </div>
                      </div>
                      <span className="shrink-0 rounded-full bg-slate-50 px-2 py-0.5 text-xs text-slate-600 ring-1 ring-slate-200">
                        {RUN_STATUS_LABEL[r.status]}
                      </span>
                    </AppLink>
                  </li>
                )
              })}
            </ul>
          )}
          <div className="mt-3 flex flex-wrap gap-3 text-xs text-slate-500">
            <span>
              洞察驱动立案{' '}
              <span className="tabular font-medium text-slate-700">
                {insightDrivenCount}
              </span>
            </span>
            <AppLink
              to="/agent/agents"
              className="text-slate-700 hover:underline focus-ring rounded"
            >
              发起办理任务
            </AppLink>
          </div>
        </div>
      </details>

      <DashboardSecondary
        cases={cases}
        recentActivity={recentActivity}
        selfServeCount={selfServeCount}
        delegatedCount={delegatedCount}
        selfServePct={selfServePct}
        delegatedPct={delegatedPct}
      />
    </div>
  )
}
