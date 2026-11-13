import { Link, useLocation, useMatch } from 'react-router-dom'
import { useEffect, useMemo } from 'react'
import {
  ClipboardCheck,
  FolderKanban,
  LayoutGrid,
  Users,
} from 'lucide-react'
import { useBusinessCases } from '../../business/BusinessCaseContext'
import { collectBossTodos } from '../../business/bossTodos'

/**
 * 左栏路径轨 · 大厅 · 项目 · 待办 | 编制
 * 待办 = 老板 A/B/C 唯一全局入口；角标 = A+B（C 仅灰点）
 * 项目角标 = 含 A/B 的案数
 */
export function ShellPathNav() {
  const loc = useLocation()
  const { getPendingConfirms, cases, getProgress } = useBusinessCases()

  const caseMatch = useMatch({ path: '/agent/cases/:caseId', end: false })
  const routeCaseId =
    caseMatch?.params.caseId && caseMatch.params.caseId !== 'new'
      ? caseMatch.params.caseId
      : undefined
  useEffect(() => {
    if (!routeCaseId) return
    try {
      sessionStorage.setItem('ip-agent-last-case-id', routeCaseId)
    } catch {
      /* ignore quota */
    }
  }, [routeCaseId])

  const progressById = useMemo(() => {
    const map: Record<string, ReturnType<typeof getProgress>> = {}
    for (const c of cases) map[c.id] = getProgress(c.id)
    return map
  }, [cases, getProgress])

  const { counts } = useMemo(
    () =>
      collectBossTodos({
        pending: getPendingConfirms(),
        cases,
        progressById,
      }),
    [getPendingConfirms, cases, progressById],
  )

  const inHall =
    loc.pathname === '/agent' || loc.pathname === '/agent/'
  const inPending = loc.pathname.startsWith('/agent/pending')
  const inCasesList =
    loc.pathname === '/agent/cases' || loc.pathname === '/agent/cases/'
  const inCaseShell = Boolean(routeCaseId)
  /** 编制 = 公司级部门管理；案级专业面不占此 Tab */
  const inDepartments =
    loc.pathname === '/agent/departments' ||
    loc.pathname.startsWith('/agent/departments/') ||
    loc.pathname === '/agent/roster' ||
    loc.pathname.startsWith('/agent/roster/')
  const inDeptWorkbench = /\/agent\/cases\/[^/]+\/depts\//.test(loc.pathname)
  const iconRail = inDeptWorkbench

  const caseTabTo = '/agent/cases'
  const caseCurrent =
    inCasesList || inCaseShell || loc.pathname.startsWith('/agent/cases/')

  type Primary = {
    id: 'hall' | 'case' | 'pending'
    label: string
    to: string
    aria: string
    current: boolean
    badge?: number
    weakDot?: boolean
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
      aria:
        counts.casesWithAb > 0
          ? `项目，${counts.casesWithAb} 案有待办`
          : '项目',
      current: caseCurrent && !inPending && !inHall && !inDepartments,
      badge: counts.casesWithAb > 0 ? counts.casesWithAb : undefined,
      Icon: FolderKanban,
    },
    {
      id: 'pending',
      label: '待办',
      to: '/agent/pending',
      aria:
        counts.badge > 0
          ? `待办，${counts.badge} 项要你拍或催办`
          : counts.weakC
            ? '待办，有进行中工单'
            : '待办，0 项',
      current: inPending,
      badge: counts.badge > 0 ? counts.badge : undefined,
      weakDot: counts.weakC,
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
      data-boss-todo="abc-v1"
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
              data-case-mode={tab.id === 'case' ? 'list' : undefined}
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
              {(tab.badge ?? 0) > 0 ? (
                <span
                  className={`tabular-nums inline-flex items-center justify-center rounded-full font-semibold text-white ${
                    tab.id === 'case' ? 'bg-slate-700' : 'bg-amber-600'
                  } ${
                    iconRail
                      ? 'absolute -right-0.5 -top-0.5 min-w-[0.95rem] px-0.5 py-px text-[9px]'
                      : 'min-w-[1.125rem] px-1 py-px text-[10px]'
                  }`}
                  data-testid={
                    tab.id === 'pending'
                      ? 'shell-path-pending-badge'
                      : `shell-path-${tab.id}-badge`
                  }
                >
                  {(tab.badge ?? 0) > 9 ? '9+' : tab.badge}
                </span>
              ) : tab.weakDot ? (
                <span
                  className={`rounded-full bg-slate-400 ${
                    iconRail
                      ? 'absolute -right-0.5 -top-0.5 h-2 w-2'
                      : 'h-2 w-2'
                  }`}
                  data-testid="shell-path-pending-weak-c"
                  title="有进行中工单"
                  aria-hidden
                />
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
          aria-label="编制 · 部门管理"
          aria-current={inDepartments ? 'page' : undefined}
          data-testid="shell-path-roster"
          data-selected={inDepartments ? '1' : '0'}
          data-roster-target="departments"
          className={linkClass(inDepartments, true)}
        >
          <Users
            className={`h-4 w-4 shrink-0 ${
              inDepartments
                ? 'fill-slate-900/10 text-slate-900'
                : 'fill-none text-slate-400'
            }`}
            strokeWidth={inDepartments ? 2.25 : 1.75}
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
