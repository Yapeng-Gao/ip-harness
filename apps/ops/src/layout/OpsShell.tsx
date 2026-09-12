import { NavLink, Outlet } from 'react-router-dom'
import {
  Activity,
  Cpu,
  LayoutDashboard,
  ScrollText,
  Server,
  Settings2,
} from 'lucide-react'
import { AppSurfaceLinks } from '@shared/components/AppSurfaceLinks'

const NAV = [
  { to: '/', end: true, label: '总览', icon: LayoutDashboard },
  { to: '/logs', end: false, label: '日志', icon: ScrollText },
  { to: '/monitor', end: false, label: '监控', icon: Activity },
  { to: '/models', end: false, label: '模型', icon: Cpu },
  { to: '/infra', end: false, label: '基础设施', icon: Server },
  { to: '/config', end: false, label: '配置', icon: Settings2 },
] as const

function linkClass(active: boolean): string {
  return active
    ? 'sidebar-link list-row-active flex items-center gap-2 rounded-[var(--radius-sm)] px-3 py-2 text-sm font-medium'
    : 'sidebar-link flex items-center gap-2 rounded-[var(--radius-sm)] px-3 py-2 text-sm text-slate-600 hover:bg-slate-100 hover:text-slate-900'
}

export function OpsShell() {
  return (
    <div className="app-shell-bg flex min-h-screen flex-col text-slate-900">
      <AppSurfaceLinks current="ops" />
      <div
        role="status"
        className="shell-banner-demo px-4 py-2 text-center"
      >
        样机·非生产可观测 — 不接真 ELK / Prometheus / GPU 集群；不接邮件 / 短信 / Webhook 通道
      </div>
      <div className="flex min-h-0 flex-1">
        <aside className="shell-aside hidden w-56 shrink-0 md:block">
          <div className="px-4 pt-5 pb-2">
            <p className="shell-page-kicker">apps/ops</p>
            <p className="mt-1 text-[15px] font-semibold tracking-tight text-slate-900">运维面</p>
          </div>
          <nav aria-label="运维分区" className="flex flex-col gap-0.5 px-3 py-2">
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
            aria-label="运维分区（窄屏）"
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
