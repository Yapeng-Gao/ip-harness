import { FULFILLMENT_MODE_LABELS, type FulfillmentMode } from '@ip/domain'

export function FulfillmentModeBadge({
  mode,
  onToggle,
}: {
  mode: FulfillmentMode
  onToggle?: () => void
}) {
  const isSelf = mode === 'self_serve'
  const inner = (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-0.5 text-[11px] font-medium ${
        isSelf
          ? 'border-sky-200 bg-sky-50 text-sky-800'
          : 'border-violet-200 bg-violet-50 text-violet-800'
      }`}
    >
      <span className="text-slate-500">办理模式：</span>
      {FULFILLMENT_MODE_LABELS[mode]}
    </span>
  )
  if (!onToggle) return inner
  return (
    <button type="button" onClick={onToggle} title="切换办理模式（演示）" className="cursor-pointer">
      {inner}
    </button>
  )
}
