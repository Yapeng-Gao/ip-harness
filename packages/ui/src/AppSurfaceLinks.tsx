import { APP_DEV_URLS, APP_PORTS } from '@ip/contracts'

type Surface = 'mid' | 'workbench' | 'agent' | 'ops' | 'iam'

const LABELS: Record<Surface, string> = {
  mid: '作业中台',
  workbench: '办理台',
  agent: '知产 Agent',
  ops: '运维',
  iam: 'IAM',
}

/**
 * Phase 0 monorepo deep-links across Vite apps (dev ports).
 * Not a micro-frontend shell — plain <a> to sibling localhost ports.
 */
export function AppSurfaceLinks({ current }: { current: Surface }) {
  const surfaces: Surface[] = ['mid', 'workbench', 'agent', 'ops', 'iam']
  return (
    <nav
      aria-label="应用面切换"
      className="flex flex-wrap items-center gap-2 border-b border-slate-200/80 bg-surface-50 px-3 py-2 text-[11px] text-slate-600"
    >
      <span className="mr-1 font-semibold tracking-tight text-slate-800">IP Apps</span>
      <div className="segmented" role="list">
        {surfaces.map((s) => {
          const active = s === current
          return (
            <a
              key={s}
              href={APP_DEV_URLS[s]}
              role="listitem"
              className={`segmented-item btn-press focus-ring inline-flex items-center ${
                active ? 'font-medium' : ''
              }`}
              aria-current={active ? 'page' : undefined}
              title={`port ${APP_PORTS[s]}`}
            >
              {LABELS[s]}
            </a>
          )
        })}
      </div>
      <span className="ml-auto hidden text-slate-400 sm:inline">Phase 0 · monorepo</span>
    </nav>
  )
}
