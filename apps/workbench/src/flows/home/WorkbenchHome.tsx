import { Link, useSearchParams } from 'react-router-dom'
import { AppLink } from '@shared/components/AppLink'
import {
  ArrowRight,
  Building2,
  Scale,
  Search,
  ClipboardCheck,
  PenLine,
  MessageSquareReply,
  BadgeCheck,
  Handshake,
  Radar,
  Inbox,
  LayoutGrid,
} from 'lucide-react'
import { useApp } from '@shared/context/AppContext'
import { getStageMeta } from '@ip/domain'
import { STAGE_WORKBENCH_PATH } from '@shared/data/workbenchMap'
import { filterWorkbenchQueue } from '@shared/data/workspaces'
import { DeadlineChip } from '../../components/FlowChrome'
import { daysUntil, urgencyLevel } from '@shared/utils/deadline'
import { TenantBanner } from '@shared/components/TenantBanner'
import { PageHeader } from '@shared/components/PageHeader'
import { WorkbenchBillingHoldBanner } from '../../components/WorkbenchBillingHoldBanner'
import { StageSkuDemoPanel } from '../../components/StageSkuDemoPanel'

const stageCards = [
  { stage: 'pre_research' as const, icon: Search, path: '/workbench/research' },
  { stage: 'decision' as const, icon: ClipboardCheck, path: '/workbench/intake' },
  { stage: 'drafting' as const, icon: PenLine, path: '/workbench/draft' },
  { stage: 'prosecution' as const, icon: MessageSquareReply, path: '/workbench/prosecution' },
  { stage: 'maintenance' as const, icon: BadgeCheck, path: '/workbench/maintain' },
  { stage: 'commercialization' as const, icon: Handshake, path: '/workbench/monetize' },
  { stage: 'monitoring' as const, icon: Radar, path: '/workbench/watch' },
]

const priorityColor = {
  高: 'text-rose-700 bg-rose-50 border-rose-200',
  中: 'text-amber-700 bg-amber-50 border-amber-200',
  低: 'text-slate-600 bg-slate-100 border-slate-200',
}

export function WorkbenchHome() {
  const { role, persona, workspaceTodos, visibleCases: cases, workspace } = useApp()
  const [params, setParams] = useSearchParams()
  const tab = params.get('tab') ?? 'queue'

  const setTab = (t: string) => {
    const next = new URLSearchParams(params)
    if (t === 'queue') next.delete('tab')
    else next.set('tab', t)
    setParams(next, { replace: true })
  }

  const sorted = [...workspaceTodos].sort((a, b) => {
    const p = { 高: 0, 中: 1, 低: 2 }
    const daysA = daysUntil(a.due)
    const daysB = daysUntil(b.due)
    return p[a.priority] - p[b.priority] || daysA - daysB || a.due.localeCompare(b.due)
  })

  const queue = filterWorkbenchQueue(sorted, cases, role, persona)
  const layoutPoolCount = cases.filter(
    (c) => c.stage === 'pre_research' && !!c.handoffs.layout_insight,
  ).length


  return (
    <div className="p-6 lg:p-8 xl:px-10">
      <TenantBanner />
      <PageHeader
        title="业务工作台"
        context={
          <>
            {workspace.homeBlurb} · {workspace.chipLabel} · 待办{' '}
            <span className="tabular-nums">{queue.length}</span> 项
          </>
        }
        primary={{
          label: queue[0]
            ? `办理「${queue[0].title.slice(0, 12)}」`
            : '查看流水线看板',
          to: queue[0]?.actionPath ?? '/pipeline',
          icon: <ArrowRight className="h-4 w-4" aria-hidden />,
        }}
        secondary={{ label: '切换工作区', to: '/login' }}
      >
        <div className={`mt-2 inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-xs font-medium ${workspace.brandColor} border-current/20 bg-white`}>
          {workspace.kind === 'enterprise' ? <Building2 className="h-3 w-3" /> : <Scale className="h-3 w-3" />}
          {workspace.chipLabel}
        </div>
      </PageHeader>

      <WorkbenchBillingHoldBanner className="mb-4" />

      <StageSkuDemoPanel />

      <div className="segmented mb-5" role="tablist" aria-label="工作台页签">
        {(
          [
            ['queue', '待办队列'],
            ['stages', '阶段入口'],
          ] as const
        ).map(([id, label]) => (
          <button
            key={id}
            type="button"
            role="tab"
            aria-selected={tab === id}
            onClick={() => setTab(id)}
            className={`segmented-item btn-press focus-ring ${
              tab === id ? 'font-medium' : ''
            }`}
            aria-label={label}
          >
            {label}
          </button>
        ))}
      </div>

      {(tab === 'queue' || tab === 'all') && (
      <section className="mb-8">
        <h2 className="mb-3 text-sm font-medium text-slate-700">
          {workspace.homeEmphasis}
          <span className="ml-2 text-xs font-normal text-slate-500">
            待办 {queue.length} 项
          </span>
        </h2>
        <div className="space-y-2">
          {queue.length === 0 && (
            <div className="flex flex-col items-center justify-center rounded-[var(--radius-lg)] border border-dashed border-slate-200 bg-white px-6 py-12 text-center shadow-[var(--shadow-rest)]">
              <Inbox className="mb-2 h-8 w-8 text-slate-300" />
              <p className="text-sm text-slate-600">当前工作区暂无待办</p>
              <p className="mt-1 text-xs text-slate-400">
                可切换工作区查看对方队列，或打开「阶段入口」页签办理
              </p>
            </div>
          )}
          {queue.map((t) => {
            const c = cases.find((x) => x.id === t.caseId)
            const meta = getStageMeta(t.stage)
            const days = daysUntil(t.due)
            const level = urgencyLevel(days)
            const rowBorder =
              level === 'critical'
                ? 'border-rose-200 bg-rose-50/40'
                : level === 'warn'
                  ? 'border-amber-200 bg-amber-50/30'
                  : 'border-slate-200 bg-white'
            return (
              <AppLink
                key={t.id}
                to={t.actionPath}
                className={`card-hover flex flex-wrap items-center justify-between gap-3 rounded-[var(--radius-lg)] border px-4 py-3 shadow-[var(--shadow-rest)] ${rowBorder}`}
              >
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <span
                      className={`rounded border px-1.5 py-0.5 text-xs ${priorityColor[t.priority]}`}
                    >
                      {t.priority}优先
                    </span>
                    <span
                      className="rounded px-1.5 py-0.5 text-xs text-slate-700"
                      style={{ background: `${meta.color}22`, color: meta.color }}
                    >
                      {meta.shortName}
                    </span>
                    <span className="truncate text-sm text-slate-800">{t.title}</span>
                    {t.assignee && (
                      <span className="rounded-full border border-slate-200 bg-white px-1.5 py-0.5 text-xs text-slate-600">
                        谁该动 ·{' '}
                        {t.assigneePersona === 'enterprise_ip'
                          ? '企业 IP'
                          : t.assigneePersona === 'agency'
                            ? '代理'
                            : t.assignee === 'enterprise'
                              ? '企业'
                              : t.assignee === 'agency'
                                ? '代理'
                                : '双方'}
                      </span>
                    )}
                    {t.source === 'handoff' && (
                      <span className="rounded-full border border-[color-mix(in_srgb,var(--color-accent)_30%,transparent)] bg-accent-soft px-1.5 py-0.5 text-xs text-accent-muted">
                        交接驱动
                      </span>
                    )}
                    {t.source === 'docket' && (
                      <span className="rounded-full border border-amber-200 bg-amber-50 px-1.5 py-0.5 text-xs text-amber-900">
                        期限升级
                      </span>
                    )}
                    {c && (
                      <span
                        className={`rounded-full border px-1.5 py-0.5 text-xs ${
                          c.fulfillmentMode === 'self_serve'
                            ? 'border-slate-200 bg-slate-50 text-slate-600'
                            : 'border-slate-200 bg-white text-slate-500'
                        }`}
                      >
                        {c.fulfillmentMode === 'self_serve' ? '自助' : '委托'}
                      </span>
                    )}
                  </div>
                  <p className="mt-1 text-xs text-slate-500">
                    {c?.fulfillmentMode === 'self_serve' && role === 'enterprise'
                      ? `自助执行 · ${t.agencyLabel}`
                      : role === 'enterprise'
                        ? t.enterpriseLabel
                        : t.agencyLabel}
                    {c && ` · ${c.ownerTeam}`}
                  </p>
                </div>
                <div className="flex items-center gap-3">
                  <DeadlineChip deadline={t.due} compact />
                  <span className="inline-flex items-center gap-1 text-xs text-slate-700">
                    进入办理 <ArrowRight className="h-3.5 w-3.5" />
                  </span>
                </div>
              </AppLink>
            )
          })}
        </div>
      </section>
      )}

      {tab === 'stages' && (
      <section className="mb-8">
        <h2 className="mb-3 text-sm font-medium text-slate-700">按阶段进入业务办理</h2>
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {stageCards.map(({ stage, icon: Icon, path }) => {
            const meta = getStageMeta(stage)
            const count = cases.filter((c) => c.stage === stage).length
            return (
              <Link
                key={stage}
                to={path}
                className="card-hover btn-press flat-card p-4 focus-ring shadow-[var(--shadow-rest)]"
              >
                <div className="mb-2 flex items-center gap-2">
                  <div
                    className="flex h-8 w-8 items-center justify-center rounded-lg"
                    style={{ background: `${meta.color}22` }}
                  >
                    <Icon className="h-4 w-4" style={{ color: meta.color }} />
                  </div>
                  <div>
                    <div className="text-sm font-medium text-slate-800">{meta.name}</div>
                    <div className="text-xs text-slate-500">{count} 件在办</div>
                  </div>
                </div>
                <p className="text-xs leading-relaxed text-slate-500">{meta.description}</p>
                <div className="mt-2 text-xs text-slate-700">
                  {STAGE_WORKBENCH_PATH[stage]} →
                </div>
              </Link>
            )
          })}
          {/* layout 非 STAGE_ORDER：薄入口，挂调研案的 layout_insight */}
          <Link
            to="/workbench/layout"
            className="card-hover btn-press flat-card p-4 focus-ring shadow-[var(--shadow-rest)]"
          >
            <div className="mb-2 flex items-center gap-2">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-accent-soft">
                <LayoutGrid className="h-4 w-4 text-accent-muted" />
              </div>
              <div>
                <div className="text-sm font-medium text-slate-800">布局洞察</div>
                <div className="text-xs text-slate-500">
                  非阶段卡 · layout_insight · 可办{' '}
                  <span className="tabular-nums font-medium text-accent-muted">{layoutPoolCount}</span> 件
                </div>
              </div>
            </div>
            <p className="text-xs leading-relaxed text-slate-500">
              矩阵空白与补强方向；CasePicker 仅列带 layout_insight 的案；空池可「补挂」源案。不占 research_report。
            </p>
            <div className="mt-2 text-xs text-slate-700">/workbench/layout →</div>
          </Link>
        </div>
      </section>
      )}
    </div>
  )
}
