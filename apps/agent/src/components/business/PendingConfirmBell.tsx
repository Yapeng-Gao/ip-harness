import { Link, useMatch } from 'react-router-dom'
import { Bell } from 'lucide-react'
import { useBusinessCases } from '../../business/BusinessCaseContext'

/**
 * §98 顶栏铃铛 · 与路径 Tab「待确认」同源计数，但不抢全局文案。
 * 路径段控在场时：始终图标-only（无「本案待确认/待我确认」可见字）；
 * 大厅仍静默（§96）；角标可留作捷径，主入口文案只留路径 Tab。
 */
export function PendingConfirmBell() {
  const { getPendingConfirms } = useBusinessCases()
  const caseMatch = useMatch({ path: '/agent/cases/:caseId', end: false })
  const hallMatch = useMatch({ path: '/agent', end: true })
  const pathNavRoutes = useMatch({ path: '/agent', end: false })
  const activeCaseId =
    caseMatch?.params.caseId && caseMatch.params.caseId !== 'new'
      ? caseMatch.params.caseId
      : undefined
  const onHall = Boolean(hallMatch) && !activeCaseId
  /** ShellPathNav 覆盖大厅/业务/部门/资产；有路径段控时铃铛不写可见「待确认」 */
  const pathNavPresent = Boolean(pathNavRoutes)
  const pending = getPendingConfirms(activeCaseId)
  const n = pending.length
  const to = activeCaseId
    ? `/agent/pending?caseId=${encodeURIComponent(activeCaseId)}`
    : '/agent/pending'
  const aria =
    n > 0
      ? activeCaseId
        ? `本案待确认 ${n} 项`
        : `待确认 ${n} 项`
      : activeCaseId
        ? '本案待确认'
        : '待确认列表'

  return (
    <Link
      to={to}
      className={`btn-press focus-ring hit-40 relative inline-flex items-center gap-1.5 rounded-lg border px-2.5 py-1.5 text-xs font-medium hover:bg-slate-50 ${
        onHall || pathNavPresent
          ? 'border-slate-200/70 bg-white/90 text-slate-400'
          : 'border-slate-200 bg-white text-slate-700'
      }`}
      data-testid="pending-confirm-bell"
      data-case-scoped={activeCaseId ? '1' : '0'}
      data-hall-quiet={onHall ? '1' : '0'}
      data-bell-mode={
        pathNavPresent || onHall ? 'icon-only-v98' : 'legacy-label'
      }
      title={aria}
      aria-label={aria}
    >
      <Bell className="h-3.5 w-3.5" aria-hidden />
      {/* §98：路径 Tab 已有「待确认」可见字；铃铛永不叠第二处可见标签 */}
      <span className="sr-only">待确认</span>
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
