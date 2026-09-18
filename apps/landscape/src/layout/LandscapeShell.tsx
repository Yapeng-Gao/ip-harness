import { NavLink, Outlet } from 'react-router-dom'
import {
  Building2,
  Database,
  Lightbulb,
  Network,
  TreePine,
} from 'lucide-react'
import { HONESTY_BANNER, SEARCH_DEEPLINK } from '../state/types'
import { Chip } from '../components/ui'
import { graphCounts, setVersionLabel, useLandscapeStore } from '../state/store'

const NAV = [
  { to: '/', label: '域选择', icon: Network, end: true },
  { to: '/tree', label: '技术树', icon: TreePine, end: false },
  { to: '/insights', label: '洞察卡', icon: Lightbulb, end: false },
  { to: '/ingest', label: '入库示意', icon: Database, end: false },
] as const

function linkClass(active: boolean): string {
  return active
    ? 'sidebar-link list-row-active focus-ring flex items-center gap-2 rounded-[var(--radius-sm)] px-3 py-2 text-sm font-medium'
    : 'sidebar-link focus-ring flex items-center gap-2 rounded-[var(--radius-sm)] px-3 py-2 text-sm text-slate-600 hover:bg-slate-100 hover:text-slate-900'
}

export function LandscapeShell() {
  const { version, versionId, availableVersions, backend } = useLandscapeStore()
  const counts = graphCounts()

  return (
    <div className="app-shell-bg flex min-h-screen flex-col text-slate-900">
      <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-200 bg-white px-4 py-2 text-xs text-slate-600">
        <span>产业全景平面 · 加深图谱 · 不改 APP_PORTS · 不开 5191</span>
        <span className="inline-flex flex-wrap items-center gap-3">
          <a
            href={SEARCH_DEEPLINK}
            className="focus-ring rounded font-medium text-slate-800 underline decoration-slate-300 underline-offset-2 hover:decoration-slate-600"
            title={SEARCH_DEEPLINK}
          >
            检索
          </a>
          <span className="text-slate-400">只深链、不改邻居</span>
        </span>
      </div>
      <div role="status" className="shell-banner-demo px-4 py-2 text-center">
        {HONESTY_BANNER}
      </div>

      <div className="flex min-h-0 flex-1">
        <aside className="shell-aside hidden w-56 shrink-0 lg:block">
          <div className="px-4 pt-5 pb-2">
            <p className="shell-page-kicker">apps/landscape</p>
            <p className="mt-1 text-[15px] font-semibold tracking-tight text-slate-900">
              产业全景
            </p>
            <div className="mt-2 flex flex-wrap gap-1">
              <Chip tone="mock">{backend}</Chip>
              <Chip tone="accent">汽车</Chip>
            </div>
            <label className="mt-3 block text-[11px] text-slate-500">
              图版本（只读标签）
              <select
                className="focus-ring mt-1 w-full rounded border border-slate-200 bg-white px-2 py-1 text-xs text-slate-800"
                value={versionId}
                onChange={(e) => setVersionLabel(e.target.value)}
                aria-label="图版本只读切换"
              >
                {availableVersions.map((v) => (
                  <option key={v.id} value={v.id}>
                    {v.label}
                  </option>
                ))}
              </select>
            </label>
            <p className="mt-1 text-[10px] text-slate-400">当前：{version.label}</p>
          </div>
          <nav aria-label="全景导航" className="flex flex-col gap-0.5 px-3 py-2">
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
          <div className="mt-4 space-y-1 px-4 text-[11px] leading-relaxed text-slate-400">
            <p>
              节点 {counts.nodes} · 深 0–{counts.maxDepth} · 企业 {counts.orgs}
            </p>
            <p>
              边 {counts.edges} · Hit {counts.hits} · 洞察 {counts.insights}
            </p>
            <p className="inline-flex items-center gap-1">
              <Building2 className="h-3 w-3" aria-hidden />
              企业档案经树节点进入
            </p>
          </div>
        </aside>

        <div className="flex min-w-0 flex-1 flex-col">
          <nav
            aria-label="全景导航（窄屏）"
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
            <div className="mx-auto max-w-6xl">
              <Outlet />
            </div>
          </main>
        </div>
      </div>
    </div>
  )
}
