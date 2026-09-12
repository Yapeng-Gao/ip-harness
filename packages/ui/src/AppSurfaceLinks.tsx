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
      className="flex flex-wrap items-center gap-1 border-b border-slate-200 bg-slate-50 px-3 py-1.5 text-[11px] text-slate-600"
    >
      <span className="mr-2 font-medium text-slate-800">IP Apps</span>
      {surfaces.map((s) => {
        const active = s === current
        return (
          <a
            key={s}
            href={APP_DEV_URLS[s]}
            className={
              active
                ? 'rounded-md bg-slate-900 px-2 py-0.5 font-medium text-white'
                : 'rounded-md px-2 py-0.5 hover:bg-slate-200'
            }
            aria-current={active ? 'page' : undefined}
            title={`port ${APP_PORTS[s]}`}
          >
            {LABELS[s]}
          </a>
        )
      })}
      <span className="ml-auto text-slate-400">Phase 0 · monorepo</span>
    </nav>
  )
}
