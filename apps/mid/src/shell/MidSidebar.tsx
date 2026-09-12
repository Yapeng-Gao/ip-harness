import { NavLink, useLocation } from 'react-router-dom'
import {
  LayoutDashboard,
  GitBranch,
  Settings,
  CalendarDays,
  Receipt,
  FolderOpen,
  Briefcase,
  Search,
  FilePlus,
  PenLine,
  MessageSquare,
  ShieldCheck,
  Coins,
  Radar,
  Lightbulb,
  FlaskConical,
  Grid3x3,
  Link2,
  Store,
  UserCircle,
  ChevronDown,
} from 'lucide-react'
import { useState } from 'react'
import { useApp } from '@shared/context/AppContext'
import { ProductSwitcher } from '@shared/components/ProductSwitcher'
import { PersonaSwitcher } from '@shared/components/PersonaSwitcher'
import { APP_DEV_URLS } from '@ip/contracts'
import { MidWorkspaceMenu } from './MidWorkspaceMenu'

type NavItem = {
  to: string
  label: string
  icon: typeof LayoutDashboard
  end?: boolean
}

function linkClass(isActive: boolean, emphasize?: boolean) {
  return `sidebar-link list-row flex items-center gap-2.5 px-3 py-2 text-sm transition-[background-color,color,box-shadow] duration-150 ease-out ${
    isActive
      ? 'list-row-active text-slate-900 font-medium'
      : emphasize
        ? 'text-slate-800 hover:bg-slate-50 font-medium'
        : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
  }`
}

/** External cross-app link — never "active" on mid. */
function externalLinkClass(emphasize?: boolean) {
  return linkClass(false, emphasize)
}

function workbenchHref(path: string) {
  return `${APP_DEV_URLS.workbench}${path}`
}

const midNav: NavItem[] = [
  { to: '/', label: '仪表盘', icon: LayoutDashboard, end: true },
  { to: '/pipeline', label: '流水线', icon: GitBranch },
  { to: '/cases', label: '案件库', icon: FolderOpen },
  { to: '/docket', label: '官方期限', icon: CalendarDays },
  { to: '/billing/cases', label: '费用中心', icon: Receipt },
]

const insightNav: NavItem[] = [
  { to: '/insight/tracks', label: '赛道洞察', icon: Lightbulb },
  { to: '/insight/innovate', label: '创新机会', icon: FlaskConical },
  { to: '/insight/layout', label: '布局矩阵', icon: Grid3x3 },
  { to: '/insight/chain', label: '产业链', icon: Link2 },
]

const workbenchNav: NavItem[] = [
  { to: '/workbench', label: '工作台首页', icon: Briefcase, end: true },
  { to: '/workbench/research', label: '立项前调研', icon: Search },
  { to: '/workbench/intake', label: '立项决策', icon: FilePlus },
  { to: '/workbench/draft', label: '撰写申请', icon: PenLine },
  { to: '/workbench/prosecution', label: '审查答复', icon: MessageSquare },
  { to: '/workbench/maintain', label: '授权维持', icon: ShieldCheck },
  { to: '/workbench/monetize', label: '运用转化', icon: Coins },
  { to: '/workbench/watch', label: '监控办理', icon: Radar },
]

const inventorHref = `${APP_DEV_URLS.workbench}/inventor`

export function MidSidebar() {
  const { workspace, persona } = useApp()
  const loc = useLocation()
  const [insightOpen, setInsightOpen] = useState(() => {
    try {
      const v = localStorage.getItem('ip-harness-insight-nav')
      if (v === '1') return true
      if (v === '0') return false
    } catch {
      /* ignore */
    }
    return false
  })
  const [workbenchOpen, setWorkbenchOpen] = useState(() => {
    try {
      const v = localStorage.getItem('ip-harness-workbench-nav')
      if (v === '1') return true
      if (v === '0') return false
    } catch {
      /* ignore */
    }
    // R6: default collapsed — stages only auto-show when already on a stage route
    return false
  })

  const toggleInsight = () => {
    setInsightOpen((v) => {
      const next = !v
      try {
        localStorage.setItem('ip-harness-insight-nav', next ? '1' : '0')
      } catch {
        /* ignore */
      }
      return next
    })
  }

  const toggleWorkbench = () => {
    setWorkbenchOpen((v) => {
      const next = !v
      try {
        localStorage.setItem('ip-harness-workbench-nav', next ? '1' : '0')
      } catch {
        /* ignore */
      }
      return next
    })
  }

  type OtherItem =
    | { kind: 'local'; to: string; label: string; icon: typeof LayoutDashboard }
    | { kind: 'external'; href: string; label: string; icon: typeof LayoutDashboard }

  const otherNav: OtherItem[] =
    workspace.kind === 'agency'
      ? [
          { kind: 'external', href: inventorHref, label: '交底门户', icon: UserCircle },
          { kind: 'local', to: '/settings', label: '设置', icon: Settings },
        ]
      : [
          { kind: 'local', to: '/agencies', label: '代理所市场', icon: Store },
          { kind: 'external', href: inventorHref, label: '交底门户', icon: UserCircle },
          { kind: 'local', to: '/settings', label: '设置', icon: Settings },
        ]

  const inventorMode =
    persona === 'inventor' ||
    loc.pathname.startsWith('/inventor') ||
    loc.pathname.startsWith('/portal/inventor')
  const insightActive = insightNav.some((i) => loc.pathname.startsWith(i.to))
  const workbenchStageActive = workbenchNav
    .filter((i) => i.to !== '/workbench')
    .some((i) => loc.pathname.startsWith(i.to))
  const showWorkbenchStages = workbenchOpen || workbenchStageActive

  return (
    <aside className="flex w-60 shrink-0 flex-col border-r border-slate-200 bg-white">
      <div className="flex items-center gap-2.5 border-b border-slate-200 px-5 py-4">
        <div className="flex h-8 w-8 items-center justify-center rounded-md bg-slate-900 text-xs font-bold text-white">
          中
        </div>
        <div className="min-w-0">
          <div className="truncate text-sm font-semibold tracking-tight text-slate-900">
            作业中台
          </div>
          <div className="truncate text-xs text-slate-500">{workspace.orgName}</div>
        </div>
      </div>

      <div className="border-b border-slate-200 p-3">
        <ProductSwitcher current="saas" />
      </div>

      <div className="border-b border-slate-200 p-3">
        <MidWorkspaceMenu variant="sidebar" />
      </div>

      <div className="border-b border-slate-200 p-3">
        <PersonaSwitcher variant="sidebar" />
      </div>

      <nav className="flex flex-1 flex-col gap-0.5 overflow-y-auto p-3" aria-label="作业中台导航">
        {inventorMode ? (
          <>
            <div className="mb-2 rounded-lg border border-violet-200 bg-violet-50 px-3 py-2.5">
              <div className="text-xs font-medium text-violet-900">
                {persona === 'inventor' ? '发明人 Persona' : '交底入口'}
              </div>
              <div className="mt-0.5 text-xs text-violet-700">
                {persona === 'inventor'
                  ? '深链门户为主 · 工作台敏感动作已禁用'
                  : '精简导航 · 仅交底与返回'}
              </div>
            </div>
            <a href={inventorHref} className={externalLinkClass(true)}>
              <UserCircle className="h-4 w-4" aria-hidden />
              交底门户
            </a>
            <NavLink to="/cases" className={({ isActive }) => linkClass(isActive)}>
              <FolderOpen className="h-4 w-4" aria-hidden />
              返回案件库
            </NavLink>
            <NavLink to="/settings" className={({ isActive }) => linkClass(isActive)}>
              <Settings className="h-4 w-4" aria-hidden />
              设置
            </NavLink>
          </>
        ) : (
          <>
        <div className="mb-1 px-2 text-xs uppercase tracking-wider text-slate-400">中台</div>
        {(persona === 'committee'
          ? midNav.filter((item) => item.to !== '/billing/cases')
          : midNav
        ).map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            end={item.end}
            className={({ isActive }) => linkClass(isActive)}
          >
            <item.icon className="h-4 w-4" aria-hidden />
            {item.label}
          </NavLink>
        ))}

        <button
          type="button"
          onClick={toggleInsight}
          className="btn-press mt-4 mb-1 flex w-full items-center justify-between px-2 text-xs uppercase tracking-wider text-slate-400 hover:text-slate-600"
          aria-expanded={insightOpen || insightActive}
        >
          <span>洞察</span>
          <ChevronDown
            className={`h-3.5 w-3.5 transition-transform ${insightOpen || insightActive ? 'rotate-0' : '-rotate-90'}`}
            aria-hidden
          />
        </button>
        {(insightOpen || insightActive) &&
          insightNav.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              className={({ isActive }) => linkClass(isActive)}
            >
              <item.icon className="h-4 w-4" aria-hidden />
              {item.label}
            </NavLink>
          ))}

        <div className="mb-1 mt-4 px-2 text-xs uppercase tracking-wider text-slate-400">
          业务工作台
        </div>
        <a href={workbenchHref('/workbench')} className={externalLinkClass()}>
          <Briefcase className="h-4 w-4" aria-hidden />
          工作台首页
        </a>
        {showWorkbenchStages ? (
          <>
            {workbenchNav
              .filter((item) => item.to !== '/workbench')
              .filter((item) =>
                persona === 'committee'
                  ? item.to.startsWith('/workbench/intake')
                  : true,
              )
              .map((item) => (
                <a
                  key={item.to}
                  href={workbenchHref(item.to)}
                  className={externalLinkClass()}
                >
                  <item.icon className="h-4 w-4" aria-hidden />
                  {item.label}
                </a>
              ))}
            {/* Collapse only when manually expanded off a stage route */}
            {workbenchOpen && !workbenchStageActive && (
              <button
                type="button"
                onClick={toggleWorkbench}
                className="btn-press focus-ring flex w-full items-center gap-2.5 px-3 py-1.5 text-xs text-slate-400 hover:text-slate-600"
                aria-expanded={true}
              >
                <ChevronDown className="h-3.5 w-3.5" aria-hidden />
                收起阶段
              </button>
            )}
          </>
        ) : (
          <button
            type="button"
            onClick={toggleWorkbench}
            className="btn-press focus-ring flex w-full items-center gap-2.5 px-3 py-2 text-sm text-slate-600 hover:bg-slate-50 hover:text-slate-900"
            aria-expanded={false}
          >
            <GitBranch className="h-4 w-4" aria-hidden />
            全部阶段
            <ChevronDown className="-rotate-90 ml-auto h-3.5 w-3.5 text-slate-400" aria-hidden />
          </button>
        )}

        <div className="mb-1 mt-4 px-2 text-xs uppercase tracking-wider text-slate-400">更多</div>
        {otherNav.map((item) =>
          item.kind === 'external' ? (
            <a key={item.href} href={item.href} className={externalLinkClass()}>
              <item.icon className="h-4 w-4" aria-hidden />
              {item.label}
            </a>
          ) : (
            <NavLink
              key={item.to}
              to={item.to}
              className={({ isActive }) => linkClass(isActive)}
            >
              <item.icon className="h-4 w-4" aria-hidden />
              {item.label}
            </NavLink>
          ),
        )}
          </>
        )}
      </nav>

      <div className="border-t border-slate-200 px-4 py-3">
        <div className="text-xs text-slate-500">作业中台 · 闸门与期限</div>
      </div>
    </aside>
  )
}
