import { Link } from 'react-router-dom'
import { ArrowRight } from 'lucide-react'

type Props = {
  /** 本站部名 */
  fromLabel: string
  /** 下一部名 */
  toLabel: string
  /** 现在做 · 进下一部（含 ?ticket=1） */
  nowHref: string
  leadName: string
  qualifyLine?: string
  onLater: () => void
}

/**
 * §128 / §127：本站硬请示通过后的收口汇报
 * 「要不要现在开下一部」· 现在做 / 以后做 —— 不可与合格线、确认钮糊成一把。
 */
export function DeptHandoffOfferBubble({
  fromLabel,
  toLabel,
  nowHref,
  leadName,
  qualifyLine,
  onLater,
}: Props) {
  return (
    <div
      className="max-w-[95%] rounded-[14px] border-[1.5px] border-emerald-300 bg-gradient-to-b from-emerald-50 to-white px-3 py-3 text-[12px] leading-relaxed text-slate-900 shadow-sm"
      role="status"
      data-testid="dept-handoff-report"
      data-handoff-offer="1"
    >
      <p className="text-[9px] font-semibold uppercase tracking-wide text-emerald-800/80">
        {leadName} · 收口汇报
      </p>
      <p
        className="mt-1 text-[14px] font-bold leading-snug text-slate-900"
        data-testid="dept-handoff-report-q"
      >
        要不要现在开{toLabel}？
      </p>
      <p className="mt-0.5 text-[11px] text-slate-600">
        {fromLabel}已确认可交下一站
        {qualifyLine ? ` · ${qualifyLine}` : ''}
      </p>
      <div className="mt-2.5 flex flex-col gap-1.5" data-testid="dept-handoff-report-acts">
        <Link
          to={nowHref}
          className="btn-press focus-ring inline-flex w-full items-center justify-center gap-1 rounded-full bg-slate-900 px-3 py-1.5 text-[11px] font-semibold text-white"
          data-testid="handoff-do-now"
        >
          现在做 · {toLabel}
          <ArrowRight className="h-3.5 w-3.5" aria-hidden />
        </Link>
        <button
          type="button"
          onClick={onLater}
          className="btn-press focus-ring inline-flex w-full items-center justify-center rounded-full border border-slate-200 bg-white px-3 py-1.5 text-[11px] font-medium text-slate-700"
          data-testid="handoff-do-later"
        >
          以后做
        </button>
      </div>
      <p className="mt-2 text-[10px] text-slate-400" data-testid="dept-handoff-report-note">
        齐套是闸，不是汇报 · 换站靠本条，不靠左栏切部
      </p>
    </div>
  )
}
