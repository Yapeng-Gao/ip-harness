import { Link, useLocation, useMatch } from 'react-router-dom'
import {
  ClipboardCheck,
  FolderKanban,
  LayoutGrid,
  Users,
} from 'lucide-react'
import { useBusinessCases } from '../../business/BusinessCaseContext'

/**
 * §99 左栏路径轨（Kimi 式）· 大厅 · 项目 · 待确认 | 编制
 * Tab 文案锁定「项目」（勿用 多案/本案）；有路由案 → 链该案且 aria「项目（案名）」
 * 待确认 = 壳层唯一全局可见「待确认」字样+角标；编制弱入口 → /agent/departments
 * 顶栏段控已卸，勿双轨并存
 */
export function ShellPathNav() {
  const loc = useLocation()
  const { getPendingConfirms, getCase } = useBusinessCases()

  const caseMatch = useMatch({ path: '/agent/cases/:caseId', end: false })
  const routeCaseId =
    caseMatch?.params.caseId && caseMatch.params.caseId !== 'new'
      ? caseMatch.params.caseId
      : undefined

  const selectedCase = routeCaseId ? getCase(routeCaseId) : undefined
  const hasSelectedCase = Boolean(routeCaseId && selectedCase)
  const pendingN = getPendingConfirms().length

  const inHall =
    loc.pathname === '/agent' || loc.pathname === '/agent/'
  const inPending = loc.pathname.startsWith('/agent/pending')
  const inCasesList =
    loc.pathname === '/agent/cases' || loc.pathname === '/agent/cases/'
  const inCaseShell = Boolean(routeCaseId)
  const inRoster =
    loc.pathname === '/agent/departments' ||
    loc.pathname.startsWith('/agent/departments/') ||
    loc.pathname === '/agent/roster' ||
    loc.pathname.startsWith('/agent/roster/')
  /** §111 Approach A：部台 = Cursor 图标轨（省操作成本） */
  const inDeptWorkbench = /\/agent\/cases\/[^/]+\/depts\//.test(loc.pathname)
  const iconRail = inDeptWorkbench

  const caseTabTo = hasSelectedCase
    ? `/agent/cases/${routeCaseId}`
    : '/agent/cases'
  const caseAria = hasSelectedCase
    ? `项目（${selectedCase?.title ?? '当前案'}）`
    : '项目'
  const caseCurrent = hasSelectedCase
    ? inCaseShell
    : inCasesList || loc.pathname.startsWith('/agent/cases/')

  type Primary = {
    id: 'hall' | 'case' | 'pending'
    label: string
    to: string
    aria: string
    current: boolean
    badge?: number
    Icon: typeof LayoutGrid
  }

  const primary: Primary[] = [
    {
      id: 'hall',
      label: '大厅',
      to: '/agent',
      aria: '大厅',
      current: inHall,
      Icon: LayoutGrid,
    },
    {
      id: 'case',
      label: '项目',
      to: caseTabTo,
      aria: caseAria,
      current: caseCurrent && !inPending && !inHall && !inRoster,
      Icon: FolderKanban,
    },
    {
      id: 'pending',
      label: '待确认',
      to: '/agent/pending',
      aria: pendingN > 0 ? `待确认，${pendingN} 项` : '待确认，0 项',
      current: inPending,
      badge: pendingN,
      Icon: ClipboardCheck,
    },
  ]

  const linkClass = (selected: boolean, weak = false) =>
    iconRail
      ? `btn-press focus-ring relative flex h-10 w-10 items-center justify-center rounded-lg transition-colors motion-safe:duration-150 ${
          selected
            ? 'bg-white text-slate-900 shadow-sm ring-1 ring-slate-900/10'
            : weak
              ? 'text-slate-400 hover:bg-white/70 hover:text-slate-700'
              : 'text-slate-500 hover:bg-white/70 hover:text-slate-900'
        }`
      : `btn-press focus-ring hit-40 relative flex min-h-10 w-full items-center gap-2.5 rounded-lg px-2.5 text-left text-[13px] transition-colors motion-safe:duration-150 ${
          selected
            ? 'bg-white font-semibold text-slate-900 shadow-sm ring-1 ring-slate-900/10'
            : weak
              ? 'font-medium text-slate-500 hover:bg-white/70 hover:text-slate-800'
              : 'font-medium text-slate-600 hover:bg-white/70 hover:text-slate-900'
        }`

  return (
    <nav
      className={`shell-path-nav shell-path-rail flex shrink-0 flex-col border-r border-slate-200/90 bg-[#eef0f3] py-3 ${
        iconRail ? 'w-12 items-center px-1.5' : 'w-[12.5rem] px-2'
      }`}
      aria-label="路径"
      data-testid="shell-path-nav"
      data-path-nav="v99"
      data-shell-rail="1"
      data-rail-mode={iconRail ? 'icons' : 'labeled'}
    >
      <div className="flex min-h-0 flex-1 flex-col gap-0.5">
        {primary.map((tab) => {
          const selected = tab.current
          const Icon = tab.Icon
          return (
            <Link
              key={tab.id}
              to={tab.to}
              aria-label={tab.aria}
              aria-current={selected ? 'page' : undefined}
              title={tab.label}
              data-testid={`shell-path-${tab.id}`}
              data-selected={selected ? '1' : '0'}
              data-case-mode={
                tab.id === 'case'
                  ? hasSelectedCase
                    ? 'case'
                    : 'list'
                  : undefined
              }
              className={linkClass(selected)}
            >
              <Icon
                className={`h-4 w-4 shrink-0 ${
                  selected
                    ? 'fill-slate-900/10 text-slate-900'
                    : 'fill-none text-slate-500'
                }`}
                strokeWidth={selected ? 2.25 : 1.75}
                aria-hidden
              />
              {iconRail ? (
                <span className="sr-only">{tab.label}</span>
              ) : (
                <span className="min-w-0 flex-1 truncate">{tab.label}</span>
              )}
              {tab.id === 'pending' && (tab.badge ?? 0) > 0 ? (
                <span
                  className={`tabular-nums inline-flex items-center justify-center rounded-full bg-amber-600 font-semibold text-white ${
                    iconRail
                      ? 'absolute -right-0.5 -top-0.5 min-w-[0.95rem] px-0.5 py-px text-[9px]'
                      : 'min-w-[1.125rem] px-1 py-px text-[10px]'
                  }`}
                  data-testid="shell-path-pending-badge"
                >
                  {(tab.badge ?? 0) > 9 ? '9+' : tab.badge}
                </span>
              ) : null}
              {selected ? (
                <span
                  className="absolute left-0 top-1/2 h-5 w-0.5 -translate-y-1/2 rounded-full bg-slate-900"
                  aria-hidden
                />
              ) : null}
            </Link>
          )
        })}

        <div
          className="my-2 border-t border-slate-300/70"
          role="separator"
          data-testid="shell-path-divider"
        />

        <Link
          to="/agent/departments"
          aria-label="编制"
          aria-current={inRoster ? 'page' : undefined}
          data-testid="shell-path-roster"
          data-selected={inRoster ? '1' : '0'}
          className={linkClass(inRoster, true)}
        >
          <Users
            className={`h-4 w-4 shrink-0 ${
              inRoster
                ? 'fill-slate-900/10 text-slate-900'
                : 'fill-none text-slate-400'
            }`}
            strokeWidth={inRoster ? 2.25 : 1.75}
            aria-hidden
          />
          {iconRail ? (
            <span className="sr-only">编制</span>
          ) : (
            <span className="min-w-0 flex-1 truncate">编制</span>
          )}
        </Link>
      </div>

    </nav>
  )
}
