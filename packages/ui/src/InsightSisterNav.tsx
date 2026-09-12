import { Link, useLocation } from 'react-router-dom'

const LINKS = [
  { to: '/insight/tracks', label: '赛道洞察' },
  { to: '/insight/innovate', label: '创新激发' },
  { to: '/insight/layout', label: '专利布局' },
  { to: '/insight/chain', label: '产业链' },
] as const

/** Subtle text-link strip — replaces equal-weight sister card grids. */
export function InsightSisterNav() {
  const { pathname } = useLocation()
  return (
    <nav
      aria-label="洞察姊妹页"
      className="mb-5 flex flex-wrap items-center gap-x-1 gap-y-1 border-b border-slate-100 pb-3 text-xs text-slate-500"
    >
      <span className="mr-2 text-slate-400">洞察</span>
      {LINKS.map((l, i) => {
        const active = pathname === l.to || pathname.startsWith(l.to + '/')
        return (
          <span key={l.to} className="inline-flex items-center">
            {i > 0 && (
              <span className="mx-2 text-slate-200" aria-hidden>
                ·
              </span>
            )}
            <Link
              to={l.to}
              className={
                active
                  ? 'focus-ring rounded-sm font-medium text-slate-900'
                  : 'focus-ring rounded-sm text-slate-500 hover:text-slate-800'
              }
              aria-current={active ? 'page' : undefined}
            >
              {l.label}
            </Link>
          </span>
        )
      })}
    </nav>
  )
}
