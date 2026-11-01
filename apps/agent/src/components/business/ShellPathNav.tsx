import { Link, useLocation, useMatch } from 'react-router-dom'
import { useMemo } from 'react'
import { useBusinessCases } from '../../business/BusinessCaseContext'
import { pickLatestCaseId } from '../../business/entryRole'

/**
 * §97 顶栏路径段控 · 大厅 · 本案/多案 · 待确认
 * 一期真源办事路径（非 lifecycle 助手/项目/专业；非项目管理/部门管理 Tab）
 */
export function ShellPathNav() {
  const loc = useLocation()
  const { cases, getProgress, getPendingConfirms, getProcessLogs, getCase } =
    useBusinessCases()

  const caseMatch = useMatch({ path: '/agent/cases/:caseId', end: false })
  const routeCaseId =
    caseMatch?.params.caseId && caseMatch.params.caseId !== 'new'
      ? caseMatch.params.caseId
      : undefined

  const getLogAt = useMemo(
    () => (id: string) => {
      const logs = getProcessLogs(id)
      if (logs.length === 0) return undefined
      return logs.reduce((max, l) => (l.at > max ? l.at : max), logs[0]!.at)
    },
    [getProcessLogs],
  )

  const latestId = useMemo(
    () =>
      pickLatestCaseId(
        cases,
        (id) => getProgress(id).updatedAt,
        getLogAt,
      ),
    [cases, getProgress, getLogAt],
  )

  const currentCaseId = routeCaseId ?? latestId
  const currentCase = currentCaseId ? getCase(currentCaseId) : undefined
  const hasCase = Boolean(currentCaseId && currentCase)
  const pendingN = getPendingConfirms().length

  const inHall =
    loc.pathname === '/agent' || loc.pathname === '/agent/'
  const inPending = loc.pathname.startsWith('/agent/pending')
  const inCasesList =
    loc.pathname === '/agent/cases' || loc.pathname === '/agent/cases/'
  const inCaseShell = Boolean(routeCaseId)

  const caseTabLabel = hasCase ? '本案' : '多案'
  const caseTabTo = hasCase
    ? `/agent/cases/${currentCaseId}`
    : '/agent/cases'
  const caseAria = hasCase
    ? `本案（${currentCase?.title ?? '当前案'}）`
    : '多案'
  const caseCurrent = hasCase
    ? inCaseShell
    : inCasesList || loc.pathname.startsWith('/agent/cases/')

  type Tab = {
    id: 'hall' | 'case' | 'pending'
    label: string
    to: string
    aria: string
    current: boolean
    badge?: number
  }

  const tabs: Tab[] = [
    {
      id: 'hall',
      label: '大厅',
      to: '/agent',
      aria: '大厅',
      current: inHall,
    },
    {
      id: 'case',
      label: caseTabLabel,
      to: caseTabTo,
      aria: caseAria,
      current: caseCurrent && !inPending && !inHall,
    },
    {
      id: 'pending',
      label: '待确认',
      to: '/agent/pending',
      aria: pendingN > 0 ? `待确认，${pendingN} 项` : '待确认，0 项',
      current: inPending,
      badge: pendingN,
    },
  ]

  return (
    <nav
      className="shell-path-nav mx-1 flex min-w-0 items-center rounded-lg border border-slate-200/90 bg-slate-50/80 p-0.5"
      aria-label="路径"
      data-testid="shell-path-nav"
      data-path-nav="v97"
    >
      {tabs.map((tab) => {
        const selected = tab.current
        return (
          <Link
            key={tab.id}
            to={tab.to}
            aria-label={tab.aria}
            aria-current={selected ? 'page' : undefined}
            data-testid={`shell-path-${tab.id}`}
            data-selected={selected ? '1' : '0'}
            data-case-mode={tab.id === 'case' ? (hasCase ? 'case' : 'multi') : undefined}
            className={`btn-press focus-ring hit-40 relative inline-flex min-h-10 min-w-[4.5rem] flex-1 items-center justify-center gap-1 rounded-md px-2.5 text-[12px] transition-colors motion-safe:duration-150 sm:flex-none sm:px-3 ${
              selected
                ? 'border border-slate-900/90 bg-white font-semibold text-slate-900 shadow-sm'
                : 'border border-transparent font-medium text-slate-600 hover:bg-white/70 hover:text-slate-900'
            }`}
          >
            <span>{tab.label}</span>
            {tab.id === 'pending' && (tab.badge ?? 0) > 0 ? (
              <span
                className="tabular-nums inline-flex min-w-[1.125rem] items-center justify-center rounded-full bg-amber-600 px-1 py-px text-[10px] font-semibold text-white"
                data-testid="shell-path-pending-badge"
              >
                {(tab.badge ?? 0) > 9 ? '9+' : tab.badge}
              </span>
            ) : null}
          </Link>
        )
      })}
    </nav>
  )
}
