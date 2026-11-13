import type { DemoCase } from '../types'

type Props = {
  cases: DemoCase[]
  activeCaseId: string
  onSwitch: (caseId: string) => void
  compact?: boolean
}

export function CaseSwitcher({ cases, activeCaseId, onSwitch, compact }: Props) {
  return (
    <div
      className={
        compact
          ? 'flex flex-wrap items-center gap-1'
          : 'flex flex-col gap-1'
      }
      role="listbox"
      aria-label="切换演示案"
    >
      {!compact ? (
        <div className="px-1 text-[10px] font-medium uppercase tracking-wide text-slate-400">
          演示案
        </div>
      ) : null}
      <div className={compact ? 'flex flex-wrap gap-1' : 'flex flex-col gap-0.5'}>
        {cases.map((c) => {
          const active = c.id === activeCaseId
          return (
            <button
              key={c.id}
              type="button"
              role="option"
              aria-selected={active}
              title={`${c.title} · ${c.blurb}`}
              onClick={() => onSwitch(c.id)}
              className={`btn-press focus-ring rounded-md px-2 py-1.5 text-left text-[11px] font-medium transition-colors ${
                active
                  ? 'bg-slate-900 text-white shadow-sm'
                  : compact
                    ? 'border border-slate-200 bg-white text-slate-600 hover:bg-slate-50'
                    : 'text-slate-600 hover:bg-white/80 hover:text-slate-900'
              }`}
            >
              <span className="block truncate">{c.shortLabel}</span>
              {!compact ? (
                <span
                  className={`mt-0.5 block truncate text-[10px] font-normal ${
                    active ? 'text-slate-300' : 'text-slate-400'
                  }`}
                >
                  {c.stageId}
                </span>
              ) : null}
            </button>
          )
        })}
      </div>
    </div>
  )
}
