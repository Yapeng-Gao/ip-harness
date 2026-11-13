import { NavLink, Outlet } from 'react-router-dom'
import { OPS_URL } from '../lib/opsLinks'
import {
  Activity,
  Bell,
  Cpu,
  GitBranch,
  LayoutDashboard,
  Layers,
  Server,
  SquareTerminal,
} from 'lucide-react'

const NAV = [
  { to: '/', end: true, label: '总览', icon: LayoutDashboard },
  { to: '/gpus', end: false, label: 'GPU 资源', icon: Cpu },
  { to: '/jobs', end: false, label: '作业', icon: SquareTerminal },
  { to: '/endpoints', end: false, label: '在线推理', icon: Server },
  { to: '/models', end: false, label: '模型注册', icon: Layers },
  { to: '/pipelines', end: false, label: '训推门禁', icon: GitBranch },
  { to: '/loadtest', end: false, label: '压测', icon: Activity },
  { to: '/alerts', end: false, label: '训推告警', icon: Bell },
] as const

function linkClass(active: boolean): string {
  return active
    ? 'sidebar-link list-row-active focus-ring flex items-center gap-2 rounded-[var(--radius-sm)] px-3 py-2 text-sm font-medium'
    : 'sidebar-link focus-ring flex items-center gap-2 rounded-[var(--radius-sm)] px-3 py-2 text-sm text-slate-600 hover:bg-slate-100 hover:text-slate-900'
}

export function AiInfraShell() {
  return (
    <div className="app-shell-bg flex min-h-screen flex-col text-slate-900">
      <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-200 bg-white px-4 py-2 text-xs text-slate-600">
        <span>训推基建平面 · 与 ops 并行 · 不改 APP_PORTS</span>
        <span className="inline-flex flex-wrap items-center gap-2">
          <a
            href={OPS_URL}
            className="focus-ring rounded font-medium text-slate-800 underline decoration-slate-300 underline-offset-2 hover:decoration-slate-600"
            title={OPS_URL}
          >
            运维面
          </a>
          <span className="text-slate-400">只深链、不改 ops</span>
        </span>
      </div>
      <div role="status" className="shell-banner-demo px-4 py-2 text-center">
        样机 · 非真 GPU / 非真 K8s
      </div>
      <div className="flex min-h-0 flex-1">
        <aside className="shell-aside hidden w-56 shrink-0 md:block">
          <div className="px-4 pt-5 pb-2">
            <p className="shell-page-kicker">apps/ai-infra</p>
            <p className="mt-1 text-[15px] font-semibold tracking-tight text-slate-900">训推基建</p>
          </div>
          <nav aria-label="训推分区" className="flex flex-col gap-0.5 px-3 py-2">
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
            aria-label="训推分区（窄屏）"
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
