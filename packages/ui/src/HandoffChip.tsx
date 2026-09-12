import { HANDOFF_LABELS, type HandoffStatus } from '@ip/domain'
import { handoffChipClass } from './handoffChipClass'

export function HandoffChip({ status }: { status: HandoffStatus }) {
  return (
    <span
      className={`inline-flex items-center rounded-full border px-2 py-0.5 text-xs font-medium ${handoffChipClass(status)}`}
    >
      交接：{HANDOFF_LABELS[status]}
    </span>
  )
}
