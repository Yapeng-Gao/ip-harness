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
import { TenantBanner } from '../components/TenantBanner'
import { getLastCaseId, getLastAgentSessionId } from '../utils/lastVisited'
import { buildOpsInbox, countOpsInbox } from '../utils/opsInbox'
import { flattenMaintainSchedules } from '../utils/slaInbox'
import { DashboardSecondary } from './DashboardSecondary'
import { BillingHoldBanner } from '../components/BillingHoldBanner'
import { AppLink } from '../components/AppLink'

const SOURCE_PILL: Record<string, string> = {
  工作台: 'border-slate-200 bg-slate-50 text-slate-800',
  Agent: 'border-sky-200 bg-sky-50 text-sky-900',
  期限: 'border-amber-200 bg-amber-50 text-amber-900',
  '监控·维持': 'border-rose-200 bg-rose-50 text-rose-900',
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

  return (
    <div className="p-6 lg:p-8 xl:px-10">
      <TenantBanner />
      <header className="sticky-chrome mb-6 -mx-2 flex flex-wrap items-start justify-between gap-4 border-b border-slate-100 px-2 py-3">
        <div>
          <h1 className="text-balance text-[22px] font-semibold tracking-tight text-slate-900">资产与任务看板</h1>
          <p className="mt-1 text-sm text-slate-500">
            {workspace.chipLabel} · {workspace.homeEmphasis} · {cases.length} 件在管 · 期限{' '}
            {docketEvents.length} 条
          </p>
          <div
            className={`mt-2 inline-flex rounded-full border px-2.5 py-0.5 text-xs font-medium ${workspace.brandColor} border-current/20 bg-white`}
          >
            {workspace.orgName}
          </div>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <AppLink
            to={lastCase ? workbenchPathForStage(lastCase.stage, lastCase.id) : '/workbench'}
            className="btn-press cta-work focus-ring inline-flex items-center gap-1.5 rounded-md px-4 py-2 text-sm font-medium"
            aria-label={lastCase ? `办理 ${lastCase.title}` : '进入业务工作台'}
          >
            {lastCase ? `办理 · ${lastCase.title.slice(0, 12)}` : '进入业务工作台'}
            <ArrowRight className="h-4 w-4" aria-hidden />
          </AppLink>
          <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-sm text-slate-500">
            {lastSession && (
              <AppLink
                to={`/agent/sessions/${lastSession.id}`}
                className="hover:text-slate-900 focus-ring rounded"
                aria-label={`继续会话 ${lastSession.title}`}
              >
                继续会话
              </AppLink>
            )}
            <AppLink to="/agent" className="hover:text-slate-900 focus-ring rounded inline-flex items-center gap-1">
              <Bot className="h-3.5 w-3.5" aria-hidden /> 知产 Agent
            </AppLink>
            <AppLink to="/docket" className="hover:text-slate-900 focus-ring rounded">
              官方期限
            </AppLink>
            {role === 'enterprise' ? (
              <AppLink to="/agencies" className="hover:text-slate-900 focus-ring rounded">
                派单代理
              </AppLink>
            ) : (
              <AppLink to="/workbench/prosecution" className="hover:text-slate-900 focus-ring rounded">
                我方承办 · 答复
              </AppLink>
            )}
          </div>
        </div>
      </header>

      <div className="mb-6 grid gap-px overflow-hidden rounded-[var(--radius-lg)] border border-slate-200/90 bg-slate-200/80 shadow-[var(--shadow-rest)] sm:grid-cols-3">
        <a
          href="#ops-inbox"
          className="list-row bg-white px-4 py-3 focus-ring hover:bg-slate-50"
          aria-label="待我办理 Inbox"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-500">待我办理</span>
            <Inbox className="h-4 w-4 text-slate-600" aria-hidden />
          </div>
          <div className="mt-1 text-2xl font-semibold tabular-nums text-slate-900">
            {inboxCounts.total}
          </div>
          <div className="mt-0.5 text-xs text-slate-500">
            工作台 {inboxCounts.workbench} · Agent {inboxCounts.agent} · 期限{' '}
            {inboxCounts.docket}
            {inboxCounts.sla > 0 ? ` · 监控·维持 ${inboxCounts.sla}` : ''}
          </div>
        </a>
        <AppLink
          to="/docket"
          className="list-row bg-white px-4 py-3 focus-ring hover:bg-slate-50"
          aria-label="期限压力"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-500">期限压力</span>
            <Clock className="h-4 w-4 text-amber-600" aria-hidden />
          </div>
          <div className="mt-1 text-2xl font-semibold tabular-nums text-slate-900">
            {inboxCounts.docket + inboxCounts.sla}
          </div>
          <div className="mt-0.5 text-xs text-slate-500">
            期限 {inboxCounts.docket} · 监控·维持 {inboxCounts.sla}（分口径）· 待付款{' '}
            {pendingPayInvoiceCount}
          </div>
        </AppLink>
        <AppLink
          to="/billing/cases"
          className="list-row bg-white px-4 py-3 focus-ring hover:bg-slate-50"
          aria-label="待付款发票"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-500">待付款发票</span>
            <CreditCard className="h-4 w-4 text-slate-600" aria-hidden />
          </div>
          <div className="mt-1 text-2xl font-semibold tabular-nums text-slate-900">
            {pendingPayInvoiceCount}
          </div>
          <div className="mt-0.5 text-xs text-slate-500">已开票 / 逾期 · 在管 {cases.length}</div>
        </AppLink>
      </div>

      <BillingHoldBanner className="mb-4" />

      <section id="ops-inbox" ref={inboxSectionRef} className="mb-6 scroll-mt-20">
        <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
          <h2 className="flex items-center gap-2 text-sm font-medium text-slate-800">
            <Inbox className="h-4 w-4 text-slate-600" aria-hidden />
            待我办理
            <span className="rounded-full bg-slate-100 px-2 py-0.5 text-xs font-normal text-slate-600">
              {inboxCounts.total}
            </span>
          </h2>
          <p className="text-xs text-slate-400">
            {role === 'enterprise'
              ? '企业审核 / 确认闸 / 期限 / 监控·维持 SLA'
              : '代理办理队列 · 监控·维持可处置 · 企业专属闸已隐藏'}
          </p>
        </div>

        {inbox.length === 0 ? (
          <div className="rounded-[var(--radius-lg)] border border-dashed border-slate-200 bg-white px-6 py-8 text-center shadow-[var(--shadow-rest)]">
            <p className="text-sm text-slate-600">暂无待我办理事项</p>
            <p className="mt-1 text-xs text-slate-400">
              工作台 {inboxCounts.workbench} · Agent {inboxCounts.agent} · 期限{' '}
              {inboxCounts.docket}
              {inboxCounts.sla > 0 ? ` · 监控·维持 ${inboxCounts.sla}` : ''}
              {workspace.kind === 'agency'
                ? ' · 等待企业派单或继续起草中案件'
                : ' · 可从工作台或知产 Agent 发起'}
            </p>
          </div>
        ) : (
          <ul className="space-y-2">
            {inbox.map((item) => {
              const focused = inboxFocusId === item.id
              return (
              <li key={item.id} id={`ops-inbox-row-${item.id}`}>
                <AppLink
                  to={item.href}
                  className={`card-hover flex flex-wrap items-center justify-between gap-3 rounded-[var(--radius-lg)] border bg-white px-4 py-3 shadow-[var(--shadow-rest)] focus-ring ${
                    focused
                      ? 'border-amber-400 ring-2 ring-amber-300/70'
                      : 'border-slate-200'
                  }`}
                >
                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <span
                        className={`rounded-full border px-1.5 py-0.5 text-xs font-medium ${SOURCE_PILL[item.sourceLabel] ?? 'border-slate-200 bg-slate-50 text-slate-600'}`}
                      >
                        {item.sourceLabel}
                      </span>
                      <span className="truncate text-sm font-medium text-slate-900">
                        {item.title}
                      </span>
                      {item.source === 'agent' && item.gateLabel && (
                        <span className="rounded-full border border-sky-200 bg-sky-50 px-1.5 py-0.5 text-xs font-medium text-sky-900">
                          闸 · {item.gateLabel}
                        </span>
                      )}
                      <span className="rounded-full border border-slate-200 bg-white px-1.5 py-0.5 text-xs text-slate-600">
                        谁该动 · {item.whoShouldAct}
                      </span>
                    </div>
                    {item.subtitle && (
                      <p className="mt-1 truncate text-xs text-slate-500">{item.subtitle}</p>
                    )}
                    {item.sameCaseHint && (
                      <p className="mt-0.5 truncate text-[11px] text-slate-400">{item.sameCaseHint}</p>
                    )}
                  </div>
                  <div className="flex shrink-0 items-center gap-2 text-xs text-slate-600">
                    {item.due && (
                      <span className="tabular-nums text-slate-500">{item.due}</span>
                    )}
                    <span className="inline-flex items-center gap-1 font-medium text-slate-700">
                      {item.source === 'agent' ? '确认' : '办理'}{' '}
                      <ArrowRight className="h-3.5 w-3.5" aria-hidden />
                    </span>
                  </div>
                </AppLink>
              </li>
              )
            })}
          </ul>
        )}

        {/* 诚实空态分类：有总量但某源为 0 时提示 */}
        {inbox.length > 0 &&
          (inboxCounts.workbench === 0 ||
            inboxCounts.agent === 0 ||
            inboxCounts.docket === 0 ||
            inboxCounts.sla === 0) && (
            <p className="mt-2 text-xs text-slate-400">
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
        <div className="mb-6 rounded-lg border border-dashed border-slate-200 bg-white px-6 py-10 text-center">
          <p className="text-sm text-slate-600">本租户暂无可见案件</p>
          <p className="mt-1 text-xs text-slate-400">
            {workspace.kind === 'agency'
              ? '等待企业派单后，承办案件将出现在此。'
              : '可通过研发交底或洞察生成调研案。'}
          </p>
        </div>
      )}

      {workspace.kind === 'enterprise' && pendingDisclosures.length > 0 && (
        <div className="mb-6 rounded-2xl border border-amber-200 bg-amber-50/40 p-5">
          <div className="mb-3 flex items-center justify-between gap-2">
            <h2 className="flex items-center gap-2 text-sm font-medium text-amber-950">
              <FileCheck className="h-4 w-4 text-amber-700" aria-hidden />
              待审交底
            </h2>
            <AppLink to="/inventor" className="text-xs text-slate-700 hover:text-slate-900">
              打开交底门户 →
            </AppLink>
          </div>
          <ul className="space-y-2">
            {pendingDisclosures.slice(0, 4).map((d) => (
              <li
                key={d.id}
                className="flex flex-wrap items-center justify-between gap-2 rounded-xl border border-amber-100 bg-white px-3 py-2.5"
              >
                <div className="min-w-0">
                  <div className="truncate text-sm font-medium text-slate-800">{d.title}</div>
                  <div className="text-xs text-slate-500">
                    {d.inventor} · {d.dept} · {d.status}
                  </div>
                </div>
                <div className="flex flex-wrap gap-1.5">
                  {d.status === '部门审核' && (
                    <button
                      type="button"
                      onClick={() => advanceDisclosure(d.id, 'IP受理', '仪表盘 · 部门通过')}
                      className="btn-press cta-work focus-ring rounded-md px-2.5 py-1 text-xs font-medium"
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
                      className="btn-press focus-ring rounded-lg bg-emerald-600 px-2.5 py-1 text-xs font-medium text-white hover:bg-emerald-500"
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

      <details className="mb-6 rounded-lg border border-slate-200 bg-white">
        <summary className="focus-ring cursor-pointer list-none rounded-lg px-4 py-3 text-sm font-medium text-slate-700 hover:bg-slate-50 [&::-webkit-details-marker]:hidden">
          <span className="inline-flex items-center gap-2">
            <Bot className="h-4 w-4 text-slate-600" aria-hidden />
            活跃 Agent 会话
            {activeAgentRuns.length > 0 && (
              <span className="rounded-full bg-slate-100 px-2 py-0.5 text-xs font-normal text-slate-600">
                {activeAgentRuns.length}
              </span>
            )}
          </span>
          <span className="ml-2 text-xs font-normal text-slate-400">展开</span>
        </summary>
        <div className="border-t border-slate-100 p-4">
          <div className="mb-3 flex items-center justify-between">
            <h2 className="text-sm font-semibold text-slate-800">运行中 / 待确认</h2>
            <AppLink to="/agent/sessions" className="text-xs text-slate-700 hover:underline">
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
                      className="flex items-center justify-between gap-3 rounded-lg py-2.5 -mx-1 px-1 hover:bg-slate-50/80"
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
            <span>洞察驱动立案 {insightDrivenCount}</span>
            <AppLink to="/agent/agents" className="text-slate-700 hover:underline">
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
