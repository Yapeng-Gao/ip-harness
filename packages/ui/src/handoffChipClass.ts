import type { HandoffStatus } from '@ip/domain'

/** Tailwind / CSS-var chip classes for handoff status */
export function handoffChipClass(status: HandoffStatus): string {
  switch (status) {
    case 'drafting':
      return 'bg-slate-100 text-slate-700 border-slate-200'
    case 'submitted_to_enterprise':
    case 'enterprise_review':
      return 'border-sky-200 bg-[color:var(--color-status-info-bg)] text-sky-700'
    case 'changes_requested':
      return 'status-pending border'
    case 'approved':
    case 'authorized_to_file':
      return 'border-emerald-200 bg-[color:var(--color-status-success-bg)] text-emerald-700'
    case 'filed':
      return 'bg-slate-100 text-slate-800 border-slate-200'
    default:
      return 'bg-slate-100 text-slate-600 border-slate-200'
  }
}
