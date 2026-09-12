import type { AgentTier } from '../../types'
import { AGENT_TIER_LABEL, AGENT_TIER_SHORT } from '../../data/agents'

export type AgentTierBadgeProps = {
  tier: AgentTier
  /** Show short Chinese hint after label */
  withHint?: boolean
  className?: string
}

/** Platform maturity badge — Core / Assist / Beta (mirrored apps/agent tokens) */
export function AgentTierBadge({
  tier,
  withHint = false,
  className = '',
}: AgentTierBadgeProps) {
  return (
    <span
      className={`agent-tier-badge ${className}`.trim()}
      data-tier={tier}
      title={AGENT_TIER_SHORT[tier]}
    >
      {AGENT_TIER_LABEL[tier]}
      {withHint ? (
        <span className="font-normal opacity-80">{AGENT_TIER_SHORT[tier]}</span>
      ) : null}
    </span>
  )
}
