import { NavLink, Outlet, useLocation } from 'react-router-dom'
import { FilePlus2, Images, Link2, History, PenTool, Sparkles } from 'lucide-react'
import { DOC_HARNESS_DEEPLINK, HONESTY_BANNER, STEPS } from '../state/types'
import { useFigureStore } from '../state/store'

const NAV = [
  { to: '/', end: true, label: '资产列表', icon: Images },
  { to: '/new', end: false, label: '① 上下文', icon: FilePlus2 },
] as const

function linkClass(active: boolean): string {
  return active
    ? 'sidebar-link list-row-active focus-ring flex items-center gap-2 rounded-[var(--radius-sm)] px-3 py-2 text-sm font-medium'
    : 'sidebar-link focus-ring flex items-center gap-2 rounded-[var(--radius-sm)] px-3 py-2 text-sm text-slate-600 hover:bg-slate-100 hover:text-slate-900'
}

function stepPath(key: string, draftId: string | null, assetId: string | null): string | null {
  if (key === 'list') return '/'
  if (key === 'new') return '/new'
  if (key === 'generate') return draftId ? `/generate/${draftId}` : null
  if (key === 'edit') return assetId ? `/edit/${assetId}` : null
  if (key === 'versions') return assetId ? `/versions/${assetId}` : null
  if (key === 'attach') return assetId ? `/attach/${assetId}` : null
  return null
}

export function FigureShell() {
  const loc = useLocation()
  const { activeAssetId, activeDraftId, assets } = useFigureStore()
  const isCanvas = loc.pathname.startsWith('/edit/')
  const currentStep =
    loc.pathname === '/'
      ? 'list'
      : loc.pathname.startsWith('/new')
        ? 'new'
        : loc.pathname.startsWith('/generate/')
          ? 'generate'
          : loc.pathname.startsWith('/edit/')
            ? 'edit'
            : loc.pathname.startsWith('/versions/')
              ? 'versions'
              : loc.pathname.startsWith('/attach/')
                ? 'attach'
                : ''

  const extraNav = [
    {
      to: activeDraftId ? `/generate/${activeDraftId}` : null,
      label: '② mock 生成',
      icon: Sparkles,
    },
    {
      to: activeAssetId ? `/edit/${activeAssetId}` : null,
      label: '③ 画布编辑',
      icon: PenTool,
    },
    {
      to: activeAssetId ? `/versions/${activeAssetId}` : null,
      label: '④ 版本',
      icon: History,
    },
    {
      to: activeAssetId ? `/attach/${activeAssetId}` : null,
      label: '⑤ 挂文档章',
      icon: Link2,
    },
  ] as const

  return (
    <div className="app-shell-bg flex min-h-screen flex-col text-slate-900">
      <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-200 bg-white px-4 py-2 text-xs text-slate-600">
        <span>附图生成·编辑平面 · 不改 APP_PORTS · 不改五壳</span>
        <span className="inline-flex flex-wrap items-center gap-3">
          <a
            href={DOC_HARNESS_DEEPLINK}
            className="focus-ring rounded font-medium text-slate-800 underline decoration-slate-300 underline-offset-2 hover:decoration-slate-600"
            title={DOC_HARNESS_DEEPLINK}
          >
            文档
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
            const to = stepPath(s.key, activeDraftId, activeAssetId)
            const active = currentStep === s.key
            const cls = `focus-ring inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-xs font-medium ${
              active
                ? 'bg-[var(--color-accent-soft)] text-slate-900'
                : to
                  ? 'text-slate-600 hover:bg-slate-100'
                  : 'cursor-not-allowed text-slate-300'
            }`
            return (
              <li key={s.key} className="flex items-center gap-1.5">
                {i > 0 ? <span className="text-slate-300">→</span> : null}
                {to ? (
                  <NavLink to={to} className={cls}>
                    {s.short}
                  </NavLink>
                ) : (
                  <span className={cls}>{s.short}</span>
                )}
              </li>
            )
          })}
          {activeAssetId && assets[activeAssetId] ? (
            <li className="ml-auto text-[11px] text-slate-400">
              {assets[activeAssetId]!.title} · rev {assets[activeAssetId]!.rev}
            </li>
          ) : null}
        </ol>
      </div>

      <div className="flex min-h-0 flex-1">
        <aside className="shell-aside hidden w-56 shrink-0 lg:block">
          <div className="px-4 pt-5 pb-2">
            <p className="shell-page-kicker">apps/figure</p>
            <p className="mt-1 text-[15px] font-semibold tracking-tight text-slate-900">
              附图生成·编辑
            </p>
          </div>
          <nav aria-label="附图分区" className="flex flex-col gap-0.5 px-3 py-2">
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
            {extraNav.map((item) => {
              const Icon = item.icon
              if (!item.to) {
                return (
                  <span
                    key={item.label}
                    className="flex items-center gap-2 rounded-[var(--radius-sm)] px-3 py-2 text-sm text-slate-300"
                  >
                    <Icon className="h-4 w-4 shrink-0" aria-hidden />
                    {item.label}
                  </span>
                )
              }
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
            SVG/Canvas 模板占位 · 无真文生图
          </div>
        </aside>

        <div className="flex min-w-0 flex-1 flex-col">
          <nav
            aria-label="附图分区（窄屏）"
            className="flex flex-wrap gap-1 border-b border-slate-200 bg-white px-3 py-2 lg:hidden"
          >
            {[
              { to: '/', label: '资产', end: true },
              { to: '/new', label: '上下文', end: false },
              ...(activeDraftId
                ? [{ to: `/generate/${activeDraftId}`, label: '生成', end: false }]
                : []),
              ...(activeAssetId
                ? [
                    { to: `/edit/${activeAssetId}`, label: '画布', end: false },
                    { to: `/versions/${activeAssetId}`, label: '版本', end: false },
                    { to: `/attach/${activeAssetId}`, label: '挂章', end: false },
                  ]
                : []),
            ].map((item) => (
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
            <div className={isCanvas ? 'mx-auto w-full max-w-6xl' : 'mx-auto max-w-5xl'}>
              <Outlet />
            </div>
          </main>
        </div>
      </div>
    </div>
  )
}
