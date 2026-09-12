import { NavLink, Outlet } from 'react-router-dom'
import {
  Database,
  Download,
  Filter,
  GitBranch,
  LayoutDashboard,
  Layers,
  Plug,
  ShieldAlert,
} from 'lucide-react'

const AI_INFRA_URL = 'http://localhost:5179'
const OPS_URL = 'http://localhost:5176'

const NAV = [
  { to: '/', end: true, label: '总览', icon: LayoutDashboard },
  { to: '/sources', end: false, label: '数据源', icon: Plug },
  { to: '/pipelines', end: false, label: '流水线', icon: GitBranch },
  { to: '/datasets', end: false, label: '数据集', icon: Database },
  { to: '/recipes', end: false, label: '配比 / 采样', icon: Filter },
  { to: '/quality', end: false, label: '质量与安全', icon: ShieldAlert },
  { to: '/lineage', end: false, label: '血缘', icon: Layers },
  { to: '/exports', end: false, label: '脱敏导出', icon: Download },
] as const

function linkClass(active: boolean): string {
  return active
    ? 'sidebar-link list-row-active flex items-center gap-2 rounded-[var(--radius-sm)] px-3 py-2 text-sm font-medium'
    : 'sidebar-link flex items-center gap-2 rounded-[var(--radius-sm)] px-3 py-2 text-sm text-slate-600 hover:bg-slate-100 hover:text-slate-900'
}

export function AiDataShell() {
  return (
    <div className="app-shell-bg flex min-h-screen flex-col text-slate-900">
      <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-200 bg-white px-4 py-2 text-xs text-slate-600">
        <span>数据 Pipeline 平面 · 与 ai-infra / ops 并行 · 不改 APP_PORTS</span>
        <span className="inline-flex flex-wrap items-center gap-3">
          <a
            href={AI_INFRA_URL}
            className="font-medium text-slate-800 underline decoration-slate-300 underline-offset-2 hover:decoration-slate-600"
          >
            训推面 ai-infra → http://localhost:5179
          </a>
          <a
            href={OPS_URL}
            className="font-medium text-slate-800 underline decoration-slate-300 underline-offset-2 hover:decoration-slate-600"
          >
            运维面 ops → http://localhost:5176
          </a>
          <span className="text-slate-400">只深链、不改邻居</span>
        </span>
      </div>
      <div role="status" className="shell-banner-demo px-4 py-2 text-center">
        样机 · 非真 Spark / 湖仓 / PII
      </div>
      <div className="flex min-h-0 flex-1">
        <aside className="shell-aside hidden w-56 shrink-0 md:block">
          <div className="px-4 pt-5 pb-2">
            <p className="shell-page-kicker">apps/ai-data</p>
            <p className="mt-1 text-[15px] font-semibold tracking-tight text-slate-900">
              数据 Pipeline
            </p>
          </div>
          <nav aria-label="数据分区" className="flex flex-col gap-0.5 px-3 py-2">
            {NAV.map((item) => {
              const Icon = item.icon
              return (
                <NavLink
                  key={item.to}
                  to={item.to}
                  end={item.end}
                  className={({ isActive }) => linkClass(isActive)}
                >
                  <Icon className="h-4 w-4 shrink-0" aria-hidden />
                  {item.label}
                </NavLink>
              )
            })}
          </nav>
        </aside>
        <div className="flex min-w-0 flex-1 flex-col">
          <nav
            aria-label="数据分区（窄屏）"
            className="flex flex-wrap gap-1 border-b border-slate-200 bg-white px-3 py-2 md:hidden"
          >
            {NAV.map((item) => (
              <NavLink
                key={item.to}
                to={item.to}
                end={item.end}
                className={({ isActive }) =>
                  isActive
                    ? 'rounded-[var(--radius-sm)] bg-[var(--color-accent-soft)] px-2.5 py-1 text-xs font-medium text-slate-900'
                    : 'rounded-[var(--radius-sm)] px-2.5 py-1 text-xs text-slate-600 hover:bg-slate-100'
                }
              >
                {item.label}
              </NavLink>
            ))}
          </nav>
          <main id="main" className="app-shell-bg flex-1 overflow-auto px-4 py-6 sm:px-6 lg:px-8">
            <div className="mx-auto max-w-5xl">
              <Outlet />
            </div>
          </main>
        </div>
      </div>
    </div>
  )
}
