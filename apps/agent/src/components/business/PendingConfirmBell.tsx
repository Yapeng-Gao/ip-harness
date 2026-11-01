import { Link, useMatch } from 'react-router-dom'
import { Bell } from 'lucide-react'
import { useBusinessCases } from '../../business/BusinessCaseContext'

/**
 * 顶栏「待我确认」铃铛 · 与大厅老板待办待拍同源（getPendingConfirms）。
 * §96：大厅仅图标+角标（静默）；公司案/部台恢复「本案待确认」文案；
 * 其它页「待我确认」。点开进同源待拍列表（pending?audit=1），不另起计数。
 */
export function PendingConfirmBell() {
  const { getPendingConfirms } = useBusinessCases()
  const caseMatch = useMatch({ path: '/agent/cases/:caseId', end: false })
  const hallMatch = useMatch({ path: '/agent', end: true })
  const activeCaseId = caseMatch?.params.caseId
  const onHall = Boolean(hallMatch) && !activeCaseId
  const pending = getPendingConfirms(activeCaseId)
  const n = pending.length
  const to = activeCaseId
    ? `/agent/pending?audit=1&caseId=${encodeURIComponent(activeCaseId)}`
    : '/agent/pending?audit=1'
  const label = onHall
    ? n > 0
      ? `待确认 ${n} 项`
      : '待确认列表'
    : activeCaseId
      ? n > 0
        ? `本案待确认 ${n} 项`
        : '本案待确认'
      : n > 0
        ? `待我确认 ${n} 项`
        : '待我确认'
  return (
    <Link
      to={to}
      className={`btn-press focus-ring hit-40 relative inline-flex items-center gap-1.5 rounded-lg border px-2.5 py-1.5 text-xs font-medium hover:bg-slate-50 ${
        onHall
          ? 'border-slate-200/70 bg-white/90 text-slate-400'
          : 'border-slate-200 bg-white text-slate-700'
      }`}
      data-testid="pending-confirm-bell"
      data-case-scoped={activeCaseId ? '1' : '0'}
      data-hall-quiet={onHall ? '1' : '0'}
      data-bell-mode={onHall ? 'hall-silent' : activeCaseId ? 'case-label' : 'global-label'}
      title={label}
      aria-label={label}
    >
      <Bell className="h-3.5 w-3.5" aria-hidden />
      {!onHall ? (
        <span className="hidden sm:inline" data-testid="pending-confirm-bell-label">
          {activeCaseId ? '本案待确认' : '待我确认'}
        </span>
      ) : (
        <span className="sr-only">待确认</span>
      )}
      {n > 0 && (
        <span
          className="tabular absolute -right-1 -top-1 inline-flex min-w-[1.125rem] items-center justify-center rounded-full bg-amber-600 px-1 py-px text-[10px] font-semibold text-white"
          data-testid="pending-confirm-bell-badge"
        >
          {n > 9 ? '9+' : n}
        </span>
      )}
    </Link>
  )
}
