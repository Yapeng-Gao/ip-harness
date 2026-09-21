import { Link } from 'react-router-dom'
import { PACK_HITL8, type PackHitlStatus } from '../../projects/pack/patentHitl8'
import { getProjectExpert } from '../../projects/experts'
import type { ProjectExpertId } from '../../projects/types'

type Props = {
  /** Cleared gate seat ids */
  clearedSeatIds?: ProjectExpertId[]
  /** Seats with validator pass + pending HITL */
  readySeatIds?: ProjectExpertId[]
  compact?: boolean
  projectId?: string
}

function statusFor(
  seatId: ProjectExpertId,
  phase: boolean | undefined,
  cleared: Set<string>,
  ready: Set<string>,
): PackHitlStatus {
  if (phase) return 'phase_locked'
  if (cleared.has(seatId)) return 'cleared'
  if (ready.has(seatId)) return 'ready'
  return 'pending'
}

const STATUS_UI: Record<
  PackHitlStatus,
  { label: string; className: string }
> = {
  pending: {
    label: '未到',
    className: 'border-slate-200 bg-slate-50 text-slate-400',
  },
  ready: {
    label: '待 Confirm',
    className: 'border-amber-300 bg-amber-50 text-amber-900',
  },
  cleared: {
    label: '已过',
    className: 'border-emerald-300 bg-emerald-50 text-emerald-900',
  },
  phase_locked: {
    label: 'Phase',
    className: 'border-slate-200 bg-slate-100 text-slate-400 opacity-70',
  },
}

/**
 * HITL×8 overview — patent-pack-design §1
 */
export function PackHitlOverview({
  clearedSeatIds = [],
  readySeatIds = [],
  compact,
  projectId,
}: Props) {
  const cleared = new Set(clearedSeatIds)
  const ready = new Set(readySeatIds)

  return (
    <section
      className={
        compact
          ? 'rounded-lg border border-violet-200 bg-violet-50/40 p-2'
          : 'rounded-xl border border-violet-200 bg-white p-3 shadow-sm'
      }
      data-testid="pack-hitl8-overview"
    >
      <div className="mb-2 flex flex-wrap items-baseline justify-between gap-1">
        <h2 className="text-xs font-semibold text-violet-900">
          Pack HITL×8
        </h2>
        <span className="text-[10px] text-slate-400">
          过检才进审批 · Phase 灰显
        </span>
      </div>
      <ol
        className={
          compact
            ? 'grid grid-cols-2 gap-1 sm:grid-cols-4'
            : 'grid gap-1.5 sm:grid-cols-2 lg:grid-cols-4'
        }
      >
        {PACK_HITL8.map((g) => {
          const st = statusFor(g.seatId, g.phase, cleared, ready)
          const ui = STATUS_UI[st]
          const def = getProjectExpert(g.seatId)
          const href = projectId
            ? `/agent/projects/${projectId}/bots/${g.seatId}`
            : `/agent/seats/${g.seatId}`
          const locked = st === 'phase_locked' || st === 'pending'
          return (
            <li key={g.n}>
              <Link
                to={href}
                className={`block rounded-md border px-2 py-1.5 transition hover:ring-1 hover:ring-violet-300 ${ui.className}`}
                data-testid={`pack-hitl-${g.n}`}
                aria-disabled={locked && g.phase ? true : undefined}
              >
                <div className="flex items-center justify-between gap-1">
                  <span className="text-[10px] font-bold">
                    {['①', '②', '③', '④', '⑤', '⑥', '⑦', '⑧'][g.n - 1]}
                  </span>
                  <span className="text-[9px] uppercase tracking-wide">
                    {ui.label}
                  </span>
                </div>
                <div className="mt-0.5 text-[11px] font-semibold leading-tight">
                  {g.label}
                </div>
                <div className="mt-0.5 truncate text-[9px] opacity-80">
                  {def.name} · {g.gate}
                </div>
              </Link>
            </li>
          )
        })}
      </ol>
    </section>
  )
}
