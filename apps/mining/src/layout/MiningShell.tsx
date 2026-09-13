import { NavLink, Outlet, useLocation } from 'react-router-dom'
import {
  FileText,
  ListChecks,
  Send,
  Sparkles,
  Star,
} from 'lucide-react'
import {
  DOC_HARNESS_DEEPLINK,
  HONESTY_BANNER,
  SEARCH_DEEPLINK,
  STEPS,
  WORKBENCH_DEEPLINK,
} from '../state/types'
import { useMiningStore } from '../state/store'
import { Chip } from '../components/ui'

const NAV = [
  { to: '/disclosure', label: '① 交底/技术点', icon: FileText },
  { to: '/candidates', label: '② 候选发明点', icon: Sparkles },
  { to: '/score', label: '③ 评分', icon: Star },
  { to: '/send', label: '④ 送立项/撰写', icon: Send },
] as const

function linkClass(active: boolean): string {
  return active
    ? 'sidebar-link list-row-active focus-ring flex items-center gap-2 rounded-[var(--radius-sm)] px-3 py-2 text-sm font-medium'
    : 'sidebar-link focus-ring flex items-center gap-2 rounded-[var(--radius-sm)] px-3 py-2 text-sm text-slate-600 hover:bg-slate-100 hover:text-slate-900'
}

export function MiningShell() {
  const loc = useLocation()
  const { candidates, intents } = useMiningStore()
  const stepIdx = STEPS.findIndex((s) => loc.pathname.startsWith(s.path))

  return (
    <div className="app-shell-bg flex min-h-screen flex-col text-slate-900">
      <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-200 bg-white px-4 py-2 text-xs text-slate-600">
        <span>专利挖掘平面 · 交底 → 候选 → 评分 → 送出占位 · 不改 APP_PORTS</span>
        <span className="inline-flex flex-wrap items-center gap-3">
          <a
            href={SEARCH_DEEPLINK}
            className="focus-ring rounded font-medium text-slate-800 underline decoration-slate-300 underline-offset-2 hover:decoration-slate-600"
            title={SEARCH_DEEPLINK}
          >
            search → {SEARCH_DEEPLINK}
          </a>
          <a
            href={WORKBENCH_DEEPLINK}
            className="focus-ring rounded font-medium text-slate-800 underline decoration-slate-300 underline-offset-2 hover:decoration-slate-600"
            title={WORKBENCH_DEEPLINK}
          >
            workbench → {WORKBENCH_DEEPLINK}
          </a>
          <a
            href={DOC_HARNESS_DEEPLINK}
            className="focus-ring rounded font-medium text-slate-800 underline decoration-slate-300 underline-offset-2 hover:decoration-slate-600"
            title={DOC_HARNESS_DEEPLINK}
          >
            doc-harness → {DOC_HARNESS_DEEPLINK}
          </a>
          <span className="text-slate-400">只深链、不改邻居</span>
        </span>
      </div>
      <div role="status" className="shell-banner-demo px-4 py-2 text-center">
        {HONESTY_BANNER}
      </div>

      {/* 顶栏步骤条 */}
      <div className="border-b border-slate-200 bg-white px-4 py-2">
        <ol className="mx-auto flex max-w-5xl flex-wrap items-center gap-1.5">
          {STEPS.map((s, i) => {
            const active = stepIdx === i
            const warn = s.path === '/send' && candidates.length === 0
            return (
              <li key={s.path} className="flex items-center gap-1.5">
                {i > 0 ? <span className="text-slate-300">→</span> : null}
                <NavLink
                  to={s.path}
                  className={`focus-ring inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-xs font-medium ${
                    active
                      ? 'bg-[var(--color-accent-soft)] text-slate-900'
                      : 'text-slate-600 hover:bg-slate-100'
                  }`}
                >
                  <span className="tabular-nums text-slate-400">{s.step}</span>
                  {s.short}
                  {warn ? (
                    <ListChecks className="h-3 w-3 text-amber-500" aria-hidden />
                  ) : null}
                </NavLink>
              </li>
            )
          })}
          <li className="ml-auto">
            <Chip tone="mock">intents {intents.length}</Chip>
          </li>
        </ol>
      </div>

      <div className="flex min-h-0 flex-1">
        <aside className="shell-aside hidden w-56 shrink-0 lg:block">
          <div className="px-4 pt-5 pb-2">
            <p className="shell-page-kicker">apps/mining</p>
            <p className="mt-1 text-[15px] font-semibold tracking-tight text-slate-900">
              专利挖掘
            </p>
          </div>
          <nav aria-label="挖掘步骤" className="flex flex-col gap-0.5 px-3 py-2">
            {NAV.map((item) => {
              const Icon = item.icon
              return (
                <NavLink
                  key={item.to}
                  to={item.to}
                  className={({ isActive }) => linkClass(isActive)}
                >
                  <Icon className="h-4 w-4 shrink-0" aria-hidden />
                  {item.label}
                </NavLink>
              )
            })}
          </nav>
          <div className="mt-4 px-4 text-[11px] leading-relaxed text-slate-400">
            入口项目卡见 <code className="text-slate-500">/</code>
          </div>
        </aside>

        <div className="flex min-w-0 flex-1 flex-col">
          <nav
            aria-label="挖掘步骤（窄屏）"
            className="flex flex-wrap gap-1 border-b border-slate-200 bg-white px-3 py-2 lg:hidden"
          >
            {NAV.map((item) => (
              <NavLink
                key={item.to}
                to={item.to}
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
