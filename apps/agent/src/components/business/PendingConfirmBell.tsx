import { Link, useMatch } from 'react-router-dom'
import { Bell } from 'lucide-react'
import { useBusinessCases } from '../../business/BusinessCaseContext'

/** 顶栏「待我确认」铃铛 · 无案时 getPendingConfirms() 含种子（与首页同源）；案页只计本案 */
export function PendingConfirmBell() {
  const { getPendingConfirms } = useBusinessCases()
  const caseMatch = useMatch({ path: '/agent/cases/:caseId', end: false })
  const activeCaseId = caseMatch?.params.caseId
  const pending = getPendingConfirms(activeCaseId)
  const n = pending.length
  const to = activeCaseId
    ? `/agent/pending?audit=1&caseId=${encodeURIComponent(activeCaseId)}`
    : '/agent/pending?audit=1'
  return (
    <Link
      to={to}
      className="btn-press focus-ring hit-40 relative inline-flex items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-2.5 py-1.5 text-xs font-medium text-slate-700 hover:bg-slate-50"
      data-testid="pending-confirm-bell"
      data-case-scoped={activeCaseId ? '1' : '0'}
      aria-label={
        n > 0
          ? activeCaseId
            ? `本案待确认 ${n} 项`
            : `待我确认 ${n} 项`
          : activeCaseId
            ? '本案待确认'
            : '待我确认'
      }
    >
      <Bell className="h-3.5 w-3.5" aria-hidden />
      <span className="hidden sm:inline">
        {activeCaseId ? '本案待确认' : '待我确认'}
      </span>
      {n > 0 && (
        <span className="tabular absolute -right-1 -top-1 inline-flex min-w-[1.125rem] items-center justify-center rounded-full bg-amber-600 px-1 py-px text-[10px] font-semibold text-white">
          {n > 9 ? '9+' : n}
        </span>
      )}
    </Link>
  )
}
