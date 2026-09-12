import type { RiskLevel } from '@ip/domain'

const styles: Record<RiskLevel, string> = {
  低: 'border-emerald-200 bg-emerald-50 text-emerald-700',
  中: 'status-pending border',
  高: 'status-risk border',
}

export function RiskBadge({ risk }: { risk: RiskLevel }) {
  return (
    <span
      className={`inline-flex items-center rounded-full border px-2 py-0.5 text-xs font-medium ${styles[risk]}`}
    >
      {risk}风险
    </span>
  )
}
