import { NavLink, Outlet, useLocation } from 'react-router-dom'
import { Heart, Lightbulb, Send, Wand2 } from 'lucide-react'
import {
  DOC_HARNESS_DEEPLINK,
  HONESTY_BANNER,
  MINING_DEEPLINK,
  SEARCH_DEEPLINK,
  STEPS,
} from '../state/types'
import { useInspireStore } from '../state/store'
import { Chip } from '../components/ui'

const NAV = [
  { to: '/', label: '① 输入台', icon: Wand2, end: true },
  { to: '/sparks', label: '② 扩召墙', icon: Lightbulb, end: false },
  { to: '/favorites', label: '③ 收藏', icon: Heart, end: false },
  { to: '/send', label: '④ 送交底/挖掘', icon: Send, end: false },
] as const

function linkClass(active: boolean): string {
  return active
    ? 'sidebar-link list-row-active focus-ring flex items-center gap-2 rounded-[var(--radius-sm)] px-3 py-2 text-sm font-medium'
    : 'sidebar-link focus-ring flex items-center gap-2 rounded-[var(--radius-sm)] px-3 py-2 text-sm text-slate-600 hover:bg-slate-100 hover:text-slate-900'
}

function stepIndex(pathname: string): number {
  if (pathname === '/' || pathname === '') return 0
  const i = STEPS.findIndex((s) => s.path !== '/' && pathname.startsWith(s.path))
  return i >= 0 ? i : 0
}

export function InspireShell() {
  const loc = useLocation()
  const { favorites, intents, cards, backend } = useInspireStore()
  const stepIdx = stepIndex(loc.pathname)

  return (
    <div className="app-shell-bg flex min-h-screen flex-col text-slate-900">
      <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-200 bg-white px-4 py-2 text-xs text-slate-600">
        <span>创新激发平面 · 技术点 → 扩召 → 收藏 → 送交底/挖掘占位 · 不改 APP_PORTS</span>
        <span className="inline-flex flex-wrap items-center gap-3">
          <a
            href={MINING_DEEPLINK}
            className="focus-ring rounded font-medium text-slate-800 underline decoration-slate-300 underline-offset-2 hover:decoration-slate-600"
            title={MINING_DEEPLINK}
          >
            mining → {MINING_DEEPLINK}
          </a>
          <a
            href={DOC_HARNESS_DEEPLINK}
            className="focus-ring rounded font-medium text-slate-800 underline decoration-slate-300 underline-offset-2 hover:decoration-slate-600"
            title={DOC_HARNESS_DEEPLINK}
          >
            doc-harness → {DOC_HARNESS_DEEPLINK}
          </a>
          <a
            href={SEARCH_DEEPLINK}
            className="focus-ring rounded font-medium text-slate-800 underline decoration-slate-300 underline-offset-2 hover:decoration-slate-600"
            title={SEARCH_DEEPLINK}
          >
            search → {SEARCH_DEEPLINK}
          </a>
          <span className="text-slate-400">只深链、不改邻居</span>
        </span>
      </div>
      <div role="status" className="shell-banner-demo px-4 py-2 text-center">
        {HONESTY_BANNER}
      </div>

      <div className="border-b border-slate-200 bg-white px-4 py-2">
        <ol className="mx-auto flex max-w-5xl flex-wrap items-center gap-1.5">
          {STEPS.map((s, i) => {
            const active = stepIdx === i
            return (
              <li key={s.path} className="flex items-center gap-1.5">
                {i > 0 ? <span className="text-slate-300">→</span> : null}
                <NavLink
                  to={s.path}
                  end={s.path === '/'}
                  className={`focus-ring inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-xs font-medium ${
                    active
                      ? 'bg-[var(--color-accent-soft)] text-slate-900'
                      : 'text-slate-600 hover:bg-slate-100'
                  }`}
                >
                  <span className="tabular-nums text-slate-400">{s.step}</span>
                  {s.short}
                </NavLink>
              </li>
            )
          })}
          <li className="ml-auto flex flex-wrap items-center gap-1.5">
            <Chip tone="mock">{backend}</Chip>
            <Chip tone="neutral">卡 {cards.length}</Chip>
            <Chip tone="accent">藏 {favorites.length}</Chip>
            <Chip tone="mock">intents {intents.length}</Chip>
          </li>
        </ol>
      </div>

      <div className="flex min-h-0 flex-1">
        <aside className="shell-aside hidden w-56 shrink-0 lg:block">
          <div className="px-4 pt-5 pb-2">
            <p className="shell-page-kicker">apps/inspire</p>
            <p className="mt-1 text-[15px] font-semibold tracking-tight text-slate-900">
              创新激发
            </p>
          </div>
          <nav aria-label="激发步骤" className="flex flex-col gap-0.5 px-3 py-2">
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
          <div className="mt-4 px-4 text-[11px] leading-relaxed text-slate-400">
            扩召为词表模板拼装，非真 LLM
          </div>
        </aside>

        <div className="flex min-w-0 flex-1 flex-col">
          <nav
            aria-label="激发步骤（窄屏）"
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
              </NavLink>
            ))}
          </nav>
          <main id="main" className="app-shell-bg flex-1 overflow-auto px-4 py-6 sm:px-6">
            <div className="mx-auto max-w-5xl">
              <Outlet />
            </div>
          </main>
        </div>
      </div>
    </div>
  )
}
