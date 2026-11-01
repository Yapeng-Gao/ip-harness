import { useState } from 'react'
import { Link } from 'react-router-dom'
import { ChevronDown, ChevronRight, ArrowRight } from 'lucide-react'
import { HomeTodoStrip } from './HomeTodoStrip'
import { HomeInProgressStrip } from './HomeInProgressStrip'
import { HomeRelayStrip } from './HomeRelayStrip'
import { useBusinessCases } from '../../business/BusinessCaseContext'

type Props = {
  latestId?: string
  /** 大厅首屏：默认只露摘要一行，点开再看清单 */
  compactDefault?: boolean
  /** 接力条刷新（交代分发后） */
  relayRefreshKey?: number
}

/**
 * 大厅轻量轨「老板待办」单区 · 一期-产品逻辑 / 交互大纲 §2.2
 * 待你拍 / 催办 / 进行中 —— 同一块；首屏摘要，忌整墙默认展开。
 * §94/§96：薄轨芯片一眼扫；展开才列表；omitPending 不回双轨；大厅唯一待办主轨。
 */
export function HomeBossTodoBoard({
  latestId,
  compactDefault = false,
  relayRefreshKey = 0,
}: Props) {
  const { cases, getPendingConfirms, getProgress } = useBusinessCases()
  const [bodyOpen, setBodyOpen] = useState(!compactDefault)
  const pending = getPendingConfirms()
  const oaPending = cases.flatMap((c) =>
    getPendingConfirms(c.id)
      .filter((p) => p.kind === 'oa_strategy' && p.status === 'pending')
      .map((p) => ({ caseId: c.id, title: c.title, item: p })),
  )
  const filedWatch = cases.filter((c) => {
    const prog = getProgress(c.id)
    return Boolean(prog.filed) && (prog.stageId === 'oa' || (prog.oaRound ?? 0) > 0)
  })
  const a = pending.length
  const b = oaPending.length + (oaPending.length === 0 ? filedWatch.length : 0)

  const topOa = oaPending[0]
  const oaHref = topOa
    ? `/agent/cases/${topOa.caseId}/depts/oa?ask=oa_strategy&confirmId=${encodeURIComponent(topOa.item.id)}`
    : filedWatch[0]
      ? `/agent/cases/${filedWatch[0]!.id}/depts/oa`
      : latestId
        ? `/agent/cases/${latestId}/depts/oa`
        : '/agent/cases'
  const showB = oaPending.length > 0 || filedWatch.length > 0
  const summaryLine =
    a || showB
      ? '点开看清单'
      : '暂无待拍'

  return (
    <section
      className="overflow-hidden rounded-md border border-slate-200/90 bg-white"
      data-testid="home-boss-todo"
      data-compact={bodyOpen ? '0' : '1'}
      data-hall-todo-single="v96"
      aria-labelledby="home-boss-todo-title"
    >
      <header className="flex flex-wrap items-center gap-1.5 bg-slate-50/70 px-2 py-1">
        <button
          type="button"
          className="focus-ring flex min-w-0 flex-1 items-center gap-1.5 rounded-md text-left"
          onClick={() => setBodyOpen((o) => !o)}
          aria-expanded={bodyOpen}
          data-testid="home-boss-todo-toggle"
        >
          {bodyOpen ? (
            <ChevronDown className="h-3.5 w-3.5 shrink-0 text-slate-500" aria-hidden />
          ) : (
            <ChevronRight className="h-3.5 w-3.5 shrink-0 text-slate-500" aria-hidden />
          )}
          <h2
            id="home-boss-todo-title"
            className="text-[12px] font-semibold text-slate-900"
          >
            老板待办
          </h2>
          <span className="truncate text-[10px] text-slate-500">{summaryLine}</span>
        </button>
        <div className="flex flex-wrap gap-1 text-[10px] font-semibold">
          <span
            className={`rounded-full px-1.5 py-px ${a ? 'bg-amber-600 text-white' : 'bg-slate-200 text-slate-600'}`}
            data-testid="home-boss-chip-a"
          >
            待拍 {a}
          </span>
          <span
            className={`rounded-full px-1.5 py-px ${showB ? 'bg-rose-700 text-white' : 'bg-slate-200 text-slate-600'}`}
            data-testid="home-boss-chip-b"
          >
            催办 {showB ? Math.max(b, 1) : 0}
          </span>
          <span
            className="rounded-full bg-sky-700/90 px-1.5 py-px text-white"
            data-testid="home-boss-chip-c"
          >
            进行中
          </span>
        </div>
      </header>

      {bodyOpen ? (
        <div
          className="space-y-0 divide-y divide-slate-100 border-t border-slate-100"
          data-testid="home-boss-todo-body"
        >
          <div className="px-2 py-1.5" data-testid="home-boss-a">
            <p className="mb-0.5 px-1 text-[10px] font-bold uppercase tracking-wide text-amber-800/80">
              待你拍
            </p>
            <HomeTodoStrip embedded />
          </div>

          {showB ? (
            <div className="px-2.5 py-2" data-testid="home-oa-nudge">
              <div className="flex flex-wrap items-start justify-between gap-2">
                <div className="min-w-0">
                  <p className="text-[10px] font-bold uppercase tracking-wide text-rose-800/80">
                    期限催办
                  </p>
                  <p className="mt-0.5 text-[12px] leading-relaxed text-rose-950/90">
                    {topOa
                      ? `「${topOa.title}」有待拍答复策略 · 逾期风险演示`
                      : `已递交案 ${filedWatch.length} 件在答复阶段 · 请进答复部盯期限`}
                  </p>
                </div>
                <Link
                  to={oaHref}
                  className="btn-press focus-ring inline-flex shrink-0 items-center gap-1 rounded-md bg-rose-900 px-2.5 py-1.5 text-[11px] font-semibold text-white"
                  data-testid="home-oa-nudge-cta"
                >
                  去答复部
                  <ArrowRight className="h-3 w-3" aria-hidden />
                </Link>
              </div>
            </div>
          ) : null}

          <div className="px-2 py-1.5" data-testid="home-boss-c">
            <p className="mb-0.5 px-1 text-[10px] font-bold uppercase tracking-wide text-sky-800/80">
              进行中
            </p>
            <HomeInProgressStrip latestId={latestId} embedded />
          </div>

          <div className="px-2 py-1.5" data-testid="home-boss-relay">
            <HomeRelayStrip
              refreshKey={relayRefreshKey}
              compact
              omitPending
            />
          </div>
        </div>
      ) : null}
    </section>
  )
}
