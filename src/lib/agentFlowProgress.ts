import type { CommandName } from '../domain/commands'
import type { FlowKey, HandoffArtifactKey, StageId } from '../types'
import { FLOW_KEY_BY_STAGE, stepsForFlow } from '../data/flowSteps'

const HANDOFF_TO_FLOW: Partial<Record<HandoffArtifactKey, FlowKey>> = {
  research_report: 'research',
  intake_quote: 'intake',
  disclosure_pack: 'intake',
  layout_insight: 'layout',
  draft_claims: 'draft',
  prosecution_response: 'prosecution',
  maintain_annuity: 'maintain',
  monetize_terms: 'monetize',
  watch_alert: 'watch',
}

/** Map agent/command write → FLOW_CATALOG key */
export function resolveFlowKey(input: {
  stage?: StageId
  handoffKey?: HandoffArtifactKey
}): FlowKey | undefined {
  if (input.handoffKey && HANDOFF_TO_FLOW[input.handoffKey]) {
    return HANDOFF_TO_FLOW[input.handoffKey]
  }
  if (input.stage) return FLOW_KEY_BY_STAGE[input.stage]
  return undefined
}

/** Monotonic floor for NodeProgress after a successful domain command */
export function progressFloorForCommand(
  command: CommandName | undefined,
  flowKey: FlowKey,
): number {
  const n = stepsForFlow(flowKey).length
  if (n <= 0) return 0
  switch (command) {
    case 'fileResponse':
    case 'advanceStage':
      return n - 1
    case 'approveHandoff':
    case 'authorizeFile':
    case 'confirmQuote':
      return Math.max(1, n - 2)
    case 'submitResearch':
    case 'submitClaims':
    case 'analyzeAndSubmitOA':
    case 'submitHandoff':
    case 'startReview':
      return Math.max(1, Math.floor(n / 2))
    case 'saveDraft':
    case 'requestChanges':
      return Math.min(1, n - 1)
    default:
      return Math.min(1, n - 1)
  }
}
