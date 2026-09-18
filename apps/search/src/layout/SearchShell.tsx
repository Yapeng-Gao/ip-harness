import { NavLink, Outlet } from 'react-router-dom'
import { Bookmark, Database, Search, Users } from 'lucide-react'
import { API_STATUS_BANNER, HONESTY_BANNER } from '../state/types'
import { AgentPanel } from '../components/AgentPanel'
import { useSearchStore } from '../state/store'

function linkClass(active: boolean): string {
  return active
    ? 'sidebar-link list-row-active focus-ring flex items-center gap-2 rounded-[var(--radius-sm)] px-3 py-2 text-sm font-medium'
    : 'sidebar-link focus-ring flex items-center gap-2 rounded-[var(--radius-sm)] px-3 py-2 text-sm text-slate-600 hover:bg-slate-100 hover:text-slate-900'
}

const NAV = [
  { to: '/', end: true, label: '检索工作台', icon: Search },
  { to: '/saved', end: false, label: '收藏 / 工作篮', icon: Bookmark },
  { to: '/corpus', end: false, label: '语料 / 索引', icon: Database },
] as const

export function SearchShell() {
  const { basketIds, lastResponse } = useSearchStore()
  const apiLive = lastResponse?.backend === 'sqlite-fts'
  return (
    <div className="app-shell-bg flex min-h-screen flex-col text-slate-900">
      <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-200 bg-white px-4 py-2 text-xs text-slate-600">
        <span>检索平面 · 人机与 Agent 同引擎形状 · 不改 APP_PORTS</span>
        <span className="text-slate-400">≠ ai-data（语料 Pipeline）</span>
      </div>
      <div role="status" className="shell-banner-demo px-4 py-2 text-center">
        {apiLive ? (
          <>
            {API_STATUS_BANNER}
            {lastResponse?.indexVersion ? (
              <span className="ml-2 tabular-nums opacity-80">
                · index {lastResponse.indexVersion}
              </span>
            ) : null}
          </>
        ) : (
          HONESTY_BANNER
        )}
      </div>
      <div className="flex min-h-0 flex-1">
        <aside className="shell-aside hidden w-52 shrink-0 lg:block">
          <div className="px-4 pt-5 pb-2">
            <p className="shell-page-kicker">apps/search</p>
            <p className="mt-1 text-[15px] font-semibold tracking-tight text-slate-900">
              检索服务
            </p>
          </div>
          <nav aria-label="检索分区" className="flex flex-col gap-0.5 px-3 py-2">
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
                  {item.to === '/saved' && basketIds.length > 0 ? (
                    <span className="ml-auto rounded-full bg-slate-900 px-1.5 text-[10px] font-medium text-white">
                      {basketIds.length}
                    </span>
                  ) : null}
                </NavLink>
              )
            })}
            <div className="mt-3 px-3 text-[11px] leading-relaxed text-slate-400">
              <Users className="mb-1 inline h-3.5 w-3.5" aria-hidden />{' '}
              从结果进入同族
            </div>
          </nav>
        </aside>

        <div className="flex min-w-0 flex-1 flex-col xl:flex-row">
          <div className="flex min-w-0 flex-1 flex-col">
            <nav
              aria-label="检索分区（窄屏）"
              className="flex flex-wrap gap-1 border-b border-slate-200 bg-white px-3 py-2 lg:hidden"
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
                  {item.to === '/saved' && basketIds.length > 0
                    ? ` (${basketIds.length})`
                    : ''}
                </NavLink>
              ))}
            </nav>
            <main id="main" className="app-shell-bg flex-1 overflow-auto px-4 py-6 sm:px-6">
              <div className="mx-auto max-w-4xl">
                <Outlet />
              </div>
            </main>
          </div>
          <aside className="hidden w-[340px] shrink-0 border-l border-slate-200 bg-white xl:block">
            <AgentPanel />
          </aside>
        </div>
      </div>
      <div className="border-t border-slate-200 bg-white xl:hidden">
        <details className="px-4 py-3">
          <summary className="cursor-pointer text-sm font-medium text-slate-800">
            Agent JSON 面板
          </summary>
          <AgentPanel compact />
        </details>
      </div>
    </div>
  )
}
