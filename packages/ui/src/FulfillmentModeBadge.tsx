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
        isSelf ? 'badge-fulfillment-self' : 'badge-fulfillment-delegated'
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
