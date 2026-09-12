import type { AgentTier } from '../../types'
import { AGENT_TIER_LABEL, AGENT_TIER_SHORT } from '../../data/agents'

const TIER_CLASS: Record<AgentTier, string> = {
  core: 'border-emerald-200 bg-emerald-50 text-emerald-800',
  assist: 'border-[color-mix(in_srgb,var(--color-accent)_28%,transparent)] bg-accent-soft text-accent-muted',
  beta: 'border-amber-200 bg-amber-50 text-amber-900',
}

export type AgentTierBadgeProps = {
  tier: AgentTier
  /** Show short Chinese hint after label */
  withHint?: boolean
  className?: string
}

/** Platform maturity badge — Core / Assist / Beta */
export function AgentTierBadge({
  tier,
  withHint = false,
  className = '',
}: AgentTierBadgeProps) {
  return (
    <span
      className={`inline-flex items-center gap-1 rounded-full border px-1.5 py-px text-[10px] font-medium ${TIER_CLASS[tier]} ${className}`}
      title={AGENT_TIER_SHORT[tier]}
    >
      {AGENT_TIER_LABEL[tier]}
      {withHint ? (
        <span className="font-normal opacity-80">{AGENT_TIER_SHORT[tier]}</span>
      ) : null}
    </span>
  )
}
