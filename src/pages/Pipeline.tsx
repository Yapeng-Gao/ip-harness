import { useEffect, useMemo, useState } from 'react'
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

  /** P1-A · 默认折叠空阶段，避免空列主导未完工感 */
  const [showEmptyStages, setShowEmptyStages] = useState(false)
  const emptyStageCount = useMemo(() => {
    if (activeFilter !== 'all') return 0
    return STAGES.filter((s) => !filtered.some((c) => c.stage === s.id)).length
  }, [filtered, activeFilter])
  const boardColumns = useMemo(() => {
    if (activeFilter !== 'all' || showEmptyStages) return columns
    return columns.filter((s) => filtered.some((c) => c.stage === s.id))
  }, [columns, filtered, activeFilter, showEmptyStages])

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
          <div className="segmented flex-wrap">
            <button
              type="button"
              onClick={() => setFilter('all')}
              className="segmented-item btn-press focus-ring"
              aria-pressed={activeFilter === 'all'}
            >
              全部 <span className="ml-1 tabular opacity-80">{stageCounts.all}</span>
            </button>
            {STAGES.map((s) => (
              <button
                key={s.id}
                type="button"
                onClick={() => setFilter(s.id)}
                className="segmented-item btn-press focus-ring"
                aria-pressed={activeFilter === s.id}
              >
                {s.shortName}{' '}
                <span className="ml-0.5 tabular opacity-80">{stageCounts[s.id] ?? 0}</span>
              </button>
            ))}
          </div>
        </div>
        {activeFilter === 'all' && emptyStageCount > 0 && (
          <div className="mt-3 flex flex-wrap items-center gap-2">
            <button
              type="button"
              className="ui-btn ui-btn-secondary ui-btn-sm btn-press focus-ring"
              aria-pressed={showEmptyStages}
              onClick={() => setShowEmptyStages((v) => !v)}
            >
              {showEmptyStages ? '隐藏空阶段' : '显示空阶段'}
              <span className="ml-1 tabular text-slate-500">({emptyStageCount})</span>
            </button>
            {!showEmptyStages && (
              <span className="text-xs text-slate-500">
                已折叠 {emptyStageCount} 个空阶段 · 专注有案阶段
              </span>
            )}
          </div>
        )}
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
          {boardColumns.map((stage) => {
            const stageCases = filtered.filter((c) => c.stage === stage.id)
            const isEmpty = stageCases.length === 0
            return (
              <div
                key={stage.id}
                className="mid-pipeline-col"
                data-empty={isEmpty ? 'true' : 'false'}
              >
                <div className="mid-pipeline-col-head">
                  <span
                    className="h-2 w-2 shrink-0 rounded-full"
                    style={{ background: stage.color }}
                    aria-hidden
                  />
                  <span className="min-w-0 flex-1 truncate text-sm font-medium text-slate-800">
                    {stage.name}
                  </span>
                  <span className="rounded-full bg-white px-2 py-0.5 text-xs tabular text-slate-500 ring-1 ring-slate-200/80">
                    {stageCases.length}
                  </span>
                </div>
                <div className="flex flex-1 flex-col gap-2 overflow-y-auto p-2">
                  {isEmpty && (
                    <div className="ui-empty rounded-[calc(var(--radius-lg)-0.5rem)] border border-dashed border-slate-200 bg-slate-50/80 px-2 py-6 text-center">
                      <div className="ui-empty-title text-xs">本列暂无可见案件</div>
                      <div className="ui-empty-desc mt-1 text-[11px]">
                        可筛选本阶段或前往工作台办理
                      </div>
                      <AppLink
                        to="/workbench"
                        className="ui-btn ui-btn-secondary ui-btn-sm btn-press focus-ring mt-3 inline-flex"
                      >
                        打开工作台
                      </AppLink>
                    </div>
                  )}
                  {stageCases.map((c) => {
                    const needsAction =
                      c.checklist.some((i) => !i.done) || daysUntil(c.nextDeadline) <= 14
                    const wb = workbenchPathForStage(stage.id, c.id)
                    return (
                      <div
                        key={c.id}
                        className="mid-pipeline-card"
                        data-action={needsAction ? 'true' : 'false'}
                      >
                        <AppLink
                          to={needsAction ? wb : `/cases/${c.id}`}
                          className="btn-press block focus-ring rounded-[var(--radius-sm)]"
                          aria-label={
                            needsAction
                              ? `去办理 ${c.title}`
                              : `打开案件 ${c.title}`
                          }
                        >
                          <div className="mb-1 flex flex-wrap items-center gap-1.5">
                            <span
                              className="line-clamp-2 text-sm font-medium leading-snug text-slate-900 text-pretty"
                              title={c.title}
                            >
                              {c.title}
                            </span>
                            {needsAction && (
                              <span className="rounded-full bg-amber-50 px-1.5 py-0.5 text-[10px] font-medium text-amber-800 ring-1 ring-amber-200">
                                待办理
                              </span>
                            )}
                            {workspace.kind === 'agency' && (
                              <span className="rounded-full bg-emerald-50 px-1.5 py-0.5 text-[10px] font-medium text-emerald-700 ring-1 ring-emerald-200">
                                我方承办
                              </span>
                            )}
                          </div>
                          <div className="mb-2 font-mono text-[11px] tabular text-slate-500">
                            {c.caseNo}
                          </div>
                          <div className="mb-2 flex items-center justify-between gap-2">
                            <span className="rounded-md bg-slate-100 px-1.5 py-0.5 text-[11px] text-slate-500">
                              {c.type}
                            </span>
                            <RiskBadge risk={c.risk} />
                          </div>
                          <ProgressBar value={c.progress} color={stage.color} />
                          <div className="mt-2 flex justify-between gap-2 text-[11px] text-slate-500">
                            <span className="truncate">{c.ownerTeam}</span>
                            <span className="shrink-0 tabular">{c.nextDeadline}</span>
                          </div>
                        </AppLink>
                        {needsAction && (
                          <AppLink
                            to={wb}
                            className="btn-press cta-work mt-2 flex w-full items-center justify-center gap-1 rounded-[var(--radius-sm)] px-2 py-1.5 text-xs font-medium focus-ring"
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
                <div className="border-t border-slate-200/90 text-xs">
                  <AppLink
                    to={workbenchPathForStage(stage.id)}
                    className="btn-press flex items-center justify-center gap-1 px-2 py-2.5 text-center font-medium text-slate-700 hover:bg-slate-50 focus-ring"
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
