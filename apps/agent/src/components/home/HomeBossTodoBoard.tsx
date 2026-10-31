import { Link } from 'react-router-dom'
import { HomeTodoStrip } from './HomeTodoStrip'
import { HomeInProgressStrip } from './HomeInProgressStrip'
import { useBusinessCases } from '../../business/BusinessCaseContext'
import { ArrowRight } from 'lucide-react'

type Props = {
  latestId?: string
}

/**
 * 大厅「老板待办」单区 · 交互大纲 §2.2
 * A 待你拍 / B 期限催办 / C 进行中 —— 同一块，不拆成三张抢视线的卡片墙。
 * 机制：老板第一眼看见要你拍·催办·进行中；点进部处理。非运营 KPI 看板。
 */
export function HomeBossTodoBoard({ latestId }: Props) {
  const { cases, getPendingConfirms, getProgress } = useBusinessCases()
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
  // C count left to InProgressStrip empty/data; summary chip uses presence

  const topOa = oaPending[0]
  const oaHref = topOa
    ? `/agent/cases/${topOa.caseId}/depts/oa?ask=oa_strategy&confirmId=${encodeURIComponent(topOa.item.id)}`
    : filedWatch[0]
      ? `/agent/cases/${filedWatch[0]!.id}/depts/oa`
      : latestId
        ? `/agent/cases/${latestId}/depts/oa`
        : '/agent/cases'

  const showB = oaPending.length > 0 || filedWatch.length > 0

  return (
    <section
      className="mb-5 overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm"
      data-testid="home-boss-todo"
      aria-labelledby="home-boss-todo-title"
    >
      <header className="flex flex-wrap items-center gap-2 border-b border-slate-100 bg-slate-50/80 px-3 py-2">
        <h2
          id="home-boss-todo-title"
          className="text-[13px] font-semibold text-slate-900"
        >
          老板待办
        </h2>
        <span className="text-[11px] text-slate-500">要你拍 · 催办 · 进行中</span>
        <div className="ml-auto flex flex-wrap gap-1.5 text-[10px] font-semibold">
          <span
            className={`rounded-full px-2 py-0.5 ${a ? 'bg-amber-600 text-white' : 'bg-slate-200 text-slate-600'}`}
            data-testid="home-boss-chip-a"
          >
            待拍 {a}
          </span>
          <span
            className={`rounded-full px-2 py-0.5 ${showB ? 'bg-rose-700 text-white' : 'bg-slate-200 text-slate-600'}`}
            data-testid="home-boss-chip-b"
          >
            催办 {showB ? Math.max(b, 1) : 0}
          </span>
          <span
            className="rounded-full bg-sky-700/90 px-2 py-0.5 text-white"
            data-testid="home-boss-chip-c"
          >
            进行中
          </span>
        </div>
      </header>

      <div className="space-y-0 divide-y divide-slate-100" data-testid="home-boss-todo-body">
        <div className="px-2 py-2" data-testid="home-boss-a">
          <p className="mb-1 px-1 text-[10px] font-bold uppercase tracking-wide text-amber-800/80">
            A · 待你拍
          </p>
          <HomeTodoStrip />
        </div>

        {showB ? (
          <div className="px-3 py-2.5" data-testid="home-oa-nudge">
            <div className="flex flex-wrap items-start justify-between gap-2">
              <div className="min-w-0">
                <p className="text-[10px] font-bold uppercase tracking-wide text-rose-800/80">
                  B · 期限催办
                </p>
                <p className="mt-0.5 text-[12px] leading-relaxed text-rose-950/90">
                  {topOa
                    ? `「${topOa.title}」有待拍答复策略 · 逾期风险演示`
                    : `已递交案 ${filedWatch.length} 件在答复阶段 · 请进答复部盯期限`}
                </p>
                <p className="mt-0.5 text-[10px] text-rose-800/60">
                  示意 · 非官报通道
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

        <div className="px-2 py-2" data-testid="home-boss-c">
          <p className="mb-1 px-1 text-[10px] font-bold uppercase tracking-wide text-sky-800/80">
            C · 进行中
          </p>
          <HomeInProgressStrip latestId={latestId} />
        </div>
      </div>
    </section>
  )
}
