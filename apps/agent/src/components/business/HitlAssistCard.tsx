import {
  buildHitlAssistReview,
  hitlAssistOwnerLabel,
  hitlAssistTitle,
  type HitlAssistPass,
} from '../../business/hitlAssist'
import type { BusinessConfirmKind } from '../../business/businessSeats'

type Props = {
  kind: BusinessConfirmKind
  /** 首轮 / 改稿后再交 */
  pass?: HitlAssistPass
  priorReturnNote?: string
  /** 点「按审校意见退回」时：预填备注并退回 */
  onApplyReturn: (note: string) => void
  disabled?: boolean
}

/**
 * 待确认详情 · 助手审校卡（样机）
 */
export function HitlAssistCard({
  kind,
  pass = 'first',
  priorReturnNote,
  onApplyReturn,
  disabled,
}: Props) {
  const review = buildHitlAssistReview(kind, { pass, priorReturnNote })
  const isReturn = review.verdict === 'return'
  const owner = hitlAssistOwnerLabel(kind)

  return (
    <section
      className={`rounded-xl border p-4 shadow-sm ${
        isReturn
          ? 'border-rose-200 bg-rose-50/60'
          : 'border-teal-200 bg-teal-50/50'
      }`}
      data-testid="hitl-assist-card"
      data-verdict={review.verdict}
      data-assist-pass={review.pass}
    >
      <div className="flex flex-wrap items-baseline justify-between gap-2">
        <h2 className="text-xs font-semibold text-slate-800">
          {hitlAssistTitle(kind)}
          {pass === 'after_revise' ? ' · 改稿后' : ''}
        </h2>
        <span
          className={`rounded-md px-2 py-0.5 text-[11px] font-semibold ${
            isReturn
              ? 'bg-rose-100 text-rose-900'
              : 'bg-teal-100 text-teal-900'
          }`}
          data-testid="hitl-assist-verdict"
        >
          {review.verdictLabel}
        </span>
      </div>
      <p className="mt-1 text-[10px] text-slate-500">{review.disclaimer}</p>

      <ul className="mt-3 list-disc space-y-1 pl-4 text-sm leading-relaxed text-slate-800">
        {review.reasons.map((r) => (
          <li key={r}>{r}</li>
        ))}
      </ul>

      <p
        className="mt-3 rounded-lg border border-slate-200/80 bg-white/70 px-2.5 py-1.5 text-[11px] text-slate-600"
        data-testid="hitl-assist-self-check"
      >
        {owner}自检 · {review.ownerSelfCheck}
      </p>

      {isReturn ? (
        <button
          type="button"
          disabled={disabled}
          onClick={() => onApplyReturn(review.returnNote)}
          className="btn-press focus-ring mt-3 rounded-md border border-rose-300 bg-white px-3 py-1.5 text-xs font-medium text-rose-950 hover:bg-rose-50 disabled:opacity-50"
          data-testid="hitl-assist-apply-return"
        >
          按审校意见退回
        </button>
      ) : (
        <p className="mt-3 text-[11px] text-slate-500">
          下方主按钮仍是你拍板的「确认」· 助手只建议不代点
        </p>
      )}
    </section>
  )
}
