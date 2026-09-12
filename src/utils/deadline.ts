/** Demo anchor date for SLA calculations (matches product review). */
export const DEMO_ANCHOR = '2026-09-11'

export type UrgencyLevel = 'critical' | 'warn' | 'ok'

export function daysUntil(
  deadline: string,
  anchor: string | Date = DEMO_ANCHOR,
): number {
  const end = new Date(deadline.slice(0, 10) + 'T00:00:00')
  const start =
    typeof anchor === 'string'
      ? new Date(anchor.slice(0, 10) + 'T00:00:00')
      : new Date(anchor.toISOString().slice(0, 10) + 'T00:00:00')
  return Math.ceil((end.getTime() - start.getTime()) / 86400000)
}

export function urgencyLevel(days: number): UrgencyLevel {
  if (days <= 3) return 'critical'
  if (days <= 7) return 'warn'
  return 'ok'
}

export function urgencyBannerClass(level: UrgencyLevel): string {
  switch (level) {
    case 'critical':
      return 'status-risk border'
    case 'warn':
      return 'status-deadline border'
    default:
      return 'border-slate-200 bg-slate-50 text-slate-600'
  }
}

export function urgencyChipClass(level: UrgencyLevel): string {
  switch (level) {
    case 'critical':
      return 'status-risk border'
    case 'warn':
      return 'status-deadline border'
    default:
      return 'border-slate-200 bg-slate-100 text-slate-600'
  }
}

export function urgencyLabel(days: number): string {
  if (days < 0) return `已逾期 ${Math.abs(days)} 天`
  if (days === 0) return '今天到期'
  if (days <= 3) return `仅剩 ${days} 天`
  if (days <= 7) return `剩余 ${days} 天`
  return `还有 ${days} 天`
}
