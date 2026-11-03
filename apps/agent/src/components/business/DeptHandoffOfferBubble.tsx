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
  /** 接手专家显示名（J3） */
  nextLeadName?: string
  qualifyLine?: string
  /** 预计分钟 · 样机 */
  etaMinutes?: number
  onLater: () => void
}

/**
 * §128 / 01c J3：本站硬请示通过后的收口汇报
 * 话术：原因 + 接手专家 + 预计时间 + 会向您汇报
 */
export function DeptHandoffOfferBubble({
  fromLabel,
  toLabel,
  nowHref,
  leadName,
  nextLeadName,
  qualifyLine,
  etaMinutes,
  onLater,
}: Props) {
  const nextExpert = nextLeadName?.trim() || `${toLabel}负责人`
  return (
    <div
      className="max-w-[95%] rounded-[14px] border-[1.5px] border-emerald-300 bg-gradient-to-b from-emerald-50 to-white px-3 py-3 text-[12px] leading-relaxed text-slate-900 shadow-sm"
      role="status"
      data-testid="dept-handoff-report"
      data-handoff-offer="1"
      data-handoff-j3="1"
    >
      <p className="text-[9px] font-semibold uppercase tracking-wide text-emerald-800/80">
        {leadName} · 交接汇报
      </p>
      <p
        className="mt-1 text-[14px] font-bold leading-snug text-slate-900"
        data-testid="dept-handoff-report-q"
      >
        要不要现在开{toLabel}？
      </p>
      <p
        className="mt-1 text-[11px] leading-snug text-slate-600"
        data-testid="dept-handoff-j3-line"
      >
        {fromLabel}本站范围已告一段落
        {qualifyLine ? `（${qualifyLine}）` : ''}
        。请 {nextExpert}（{toLabel}）接手，同一案卷中的材料和已确认事项可继续查看。
        {etaMinutes ? `演示预计用时约 ${etaMinutes} 分钟，实际用时尚未接入。` : '实际用时尚未接入。'}
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
        本部门成果已确认；是否现在交接由你决定。后续材料有疑问，可从同一案卷回到本部门继续补充。
      </p>
    </div>
  )
}
