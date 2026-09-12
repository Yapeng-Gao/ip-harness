import { useEffect, useMemo } from 'react'
import { useSearchParams } from 'react-router-dom'
import { AppLink } from '../components/AppLink'
import { useApp } from '../context/AppContext'
import { STAGES } from '../data/stages'
import { RiskBadge } from '../components/RiskBadge'
import { ProgressBar } from '../components/ProgressBar'
import type { StageId } from '../types'
import { Filter, Briefcase } from 'lucide-react'
import { workbenchPathForStage } from '../data/workbenchMap'
import { daysUntil } from '../utils/deadline'
import { TenantBanner } from '../components/TenantBanner'
import { PageHeader, EmptyState } from '../components/PageHeader'

export function Pipeline() {
  const { visibleCases: cases, stageFilter, setStageFilter, workspace } = useApp()
  const [params, setParams] = useSearchParams()
  const urlStage = params.get('stage') as StageId | null

  const activeFilter = urlStage && STAGES.some((s) => s.id === urlStage)
    ? urlStage
    : stageFilter

  useEffect(() => {
    if (urlStage && STAGES.some((s) => s.id === urlStage) && stageFilter !== urlStage) {
      setStageFilter(urlStage)
    }
  }, [urlStage, stageFilter, setStageFilter])

  const setFilter = (s: StageId | 'all') => {
    setStageFilter(s)
    const next = new URLSearchParams(params)
    if (s === 'all') next.delete('stage')
    else next.set('stage', s)
    setParams(next, { replace: true })
  }

  const filtered = useMemo(() => {
    if (activeFilter === 'all') return cases
    return cases.filter((c) => c.stage === activeFilter)
  }, [cases, activeFilter])

  const columns = activeFilter === 'all'
    ? STAGES
    : STAGES.filter((s) => s.id === activeFilter)

  const stageCounts = useMemo(() => {
    const m: Record<string, number> = { all: cases.length }
    for (const s of STAGES) m[s.id] = cases.filter((c) => c.stage === s.id).length
    return m
  }, [cases])

  const totalVisible = filtered.length

  return (
    <div className="flex h-full flex-col p-6 lg:p-8">
      <TenantBanner />
      <PageHeader
        sticky
        title="Harness 流水线"
        context={`七阶段闸门看板 · 仅显示本租户可见案件 · ${workspace.chipLabel} · ${totalVisible} 件`}
        primary={{
          label: '打开工作台待办',
          to: '/workbench',
          icon: <Briefcase className="h-4 w-4" aria-hidden />,
        }}
        secondary={{
          label: '查看案件库',
          to: '/cases',
        }}
      >
        <div className="mt-4 flex flex-wrap items-center gap-2" role="group" aria-label="阶段筛选">
          <Filter className="h-3.5 w-3.5 text-slate-500" aria-hidden />
          <button
            type="button"
            onClick={() => setFilter('all')}
            className={`btn-press focus-ring rounded-full px-3 py-1 text-xs transition-colors ${
              activeFilter === 'all'
                ? 'bg-slate-900 text-white'
                : 'bg-slate-100 text-slate-500 hover:bg-slate-200 hover:text-slate-800'
            }`}
            aria-pressed={activeFilter === 'all'}
          >
            全部 <span className="ml-1 tabular-nums opacity-80">{stageCounts.all}</span>
          </button>
          {STAGES.map((s) => (
            <button
              key={s.id}
              type="button"
              onClick={() => setFilter(s.id)}
              className={`btn-press focus-ring rounded-full px-3 py-1 text-xs transition-colors ${
                activeFilter === s.id
                  ? 'bg-slate-900 text-white'
                  : 'bg-slate-100 text-slate-500 hover:bg-slate-200 hover:text-slate-800'
              }`}
              aria-pressed={activeFilter === s.id}
            >
              {s.shortName}{' '}
              <span className="ml-0.5 tabular-nums opacity-80">{stageCounts[s.id] ?? 0}</span>
            </button>
          ))}
        </div>
      </PageHeader>

      {totalVisible === 0 ? (
        <div className="flat-card flex-1">
          <EmptyState
            title="流水线暂无可见案件"
            description={
              activeFilter !== 'all'
                ? '当前阶段筛选下无案件，可清除筛选或前往工作台。'
                : '本租户暂无案件，可前往案件库或工作台。'
            }
            primary={
              activeFilter !== 'all'
                ? { label: '清除阶段筛选', onClick: () => setFilter('all') }
                : { label: '打开工作台待办', to: '/workbench' }
            }
            secondary={{ label: '查看案件库', to: '/cases' }}
          />
        </div>
      ) : (
        <div className="flex flex-1 gap-3 overflow-x-auto pb-4">
          {columns.map((stage) => {
            const stageCases = filtered.filter((c) => c.stage === stage.id)
            return (
              <div
                key={stage.id}
                className="flex w-64 shrink-0 flex-col flat-card"
              >
                <div className="flex items-center gap-2 border-b border-slate-200 px-3 py-3">
                  <span
                    className="h-2 w-2 rounded-full"
                    style={{ background: stage.color }}
                  />
                  <span className="text-sm font-medium text-slate-800">{stage.name}</span>
                  <span className="ml-auto rounded-full bg-slate-100 px-2 py-0.5 text-xs tabular-nums text-slate-500">
                    {stageCases.length}
                  </span>
                </div>
                <div className="flex flex-1 flex-col gap-2 overflow-y-auto p-2">
                  {stageCases.length === 0 && (
                    <div className="nest-card border-dashed bg-slate-50/80 py-8 text-center text-xs text-slate-500">
                      本列暂无可见案件
                    </div>
                  )}
                  {stageCases.map((c) => {
                    const needsAction =
                      c.checklist.some((i) => !i.done) || daysUntil(c.nextDeadline) <= 14
                    const wb = workbenchPathForStage(stage.id, c.id)
                    return (
                      <div
                        key={c.id}
                        className="nest-card bg-slate-50/70 p-3"
                      >
                        <AppLink
                          to={needsAction ? wb : `/cases/${c.id}`}
                          className="card-hover btn-press block focus-ring rounded-lg"
                          aria-label={
                            needsAction
                              ? `去办理 ${c.title}`
                              : `打开案件 ${c.title}`
                          }
                        >
                          <div className="mb-1.5 flex flex-wrap items-center gap-1.5">
                            <span className="text-sm leading-snug text-slate-800">{c.title}</span>
                            {needsAction && (
                              <span className="rounded-full bg-amber-50 px-1.5 py-0.5 text-xs font-medium text-amber-800 ring-1 ring-amber-200">
                                待办理
                              </span>
                            )}
                            {workspace.kind === 'agency' && (
                              <span className="rounded-full bg-emerald-50 px-1.5 py-0.5 text-xs font-medium text-emerald-700 ring-1 ring-emerald-200">
                                我方承办
                              </span>
                            )}
                          </div>
                          <div className="mb-2 font-mono text-xs text-slate-500">{c.caseNo}</div>
                          <div className="mb-2 flex items-center justify-between gap-2">
                            <span className="rounded bg-slate-100 px-1.5 py-0.5 text-xs text-slate-500">
                              {c.type}
                            </span>
                            <RiskBadge risk={c.risk} />
                          </div>
                          <ProgressBar value={c.progress} color={stage.color} />
                          <div className="mt-2 flex justify-between text-xs text-slate-500">
                            <span>{c.ownerTeam}</span>
                            <span className="tabular-nums">{c.nextDeadline}</span>
                          </div>
                        </AppLink>
                        {needsAction && (
                          <AppLink
                            to={wb}
                            className="btn-press cta-work mt-2 flex w-full items-center justify-center gap-1 rounded-lg px-2 py-1.5 text-xs font-medium focus-ring"
                          >
                            <Briefcase className="h-3 w-3" aria-hidden />
                            一键进入办理
                          </AppLink>
                        )}
                        {!needsAction && (
                          <AppLink
                            to={`/cases/${c.id}`}
                            className="mt-2 block text-center text-xs text-slate-500 hover:text-slate-900"
                          >
                            查看案件详情
                          </AppLink>
                        )}
                      </div>
                    )
                  })}
                </div>
                <div className="border-t border-slate-200 text-xs">
                  <AppLink
                    to={workbenchPathForStage(stage.id)}
                    className="flex items-center justify-center gap-1 px-2 py-2 text-center font-medium text-slate-700 hover:bg-slate-50"
                  >
                    <Briefcase className="h-3 w-3" aria-hidden />
                    进入办理流程
                  </AppLink>
                </div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
