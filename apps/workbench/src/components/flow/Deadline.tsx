import { Clock } from 'lucide-react'
import {
  daysUntil,
  urgencyBannerClass,
  urgencyChipClass,
  urgencyLabel,
  urgencyLevel,
} from '@shared/utils/deadline'

export function DeadlineChip({
  deadline,
  compact,
}: {
  deadline: string
  compact?: boolean
}) {
  const days = daysUntil(deadline)
  const level = urgencyLevel(days)
  return (
    <span
      className={`inline-flex items-center gap-1 rounded-full border px-2 py-0.5 text-xs font-medium ${urgencyChipClass(level)}`}
    >
      <Clock className="h-3 w-3" />
      {compact ? urgencyLabel(days) : `${urgencyLabel(days)} · ${deadline}`}
    </span>
  )
}

export function DeadlineBanner({ deadline }: { deadline: string }) {
  const days = daysUntil(deadline)
  const level = urgencyLevel(days)
  return (
    <div
      className={`mb-4 flex items-center gap-2 rounded-lg border px-3 py-2 text-xs font-medium ${urgencyBannerClass(level)}`}
    >
      <Clock className="h-3.5 w-3.5 shrink-0" />
      {urgencyLabel(days)}（下一期限 {deadline}）
      {level === 'critical' && <span className="ml-auto text-xs">请优先处理</span>}
      {level === 'warn' && <span className="ml-auto text-xs">临近期限</span>}
    </div>
  )
}
