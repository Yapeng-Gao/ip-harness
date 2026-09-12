/**
 * Compat surface for @shared/data/handoff.
 * Pure domain handoff logic in packages/domain; chip class in @ip/ui.
 */
export {
  HANDOFF_LABELS,
  HANDOFF_ARTIFACT_LABELS,
  ARTIFACT_FOR_STAGE,
  HANDOFF_ACTION_LABELS,
  DRAFT_FILING_CHECK_ITEMS,
  EMPTY_DRAFT_FILING_CHECK,
  DISCLOSURE_PACK_CHECK_ITEMS,
  EMPTY_DISCLOSURE_PACK_CHECK,
  FULL_DISCLOSURE_PACK_CHECK,
  disclosurePackMissing,
  disclosurePackComplete,
  REQUIRED_BEFORE_SUBMIT,
  type HandoffAction,
  COMMITTEE_VOTE_HARD_GATE_MSG,
  COMMITTEE_VOTE_HARD_BLOCK_STORAGE_KEY,
  canPerformHandoff,
  nextStatusForAction,
  nextVersionLabel,
  actionLabel,
  FULFILLMENT_MODE_LABELS,
  CNIPA_FEE_HINTS,
} from '../../packages/domain/src/handoff'

/** UI chip classes — canonical in @ip/ui; re-exported for @shared/data/handoff */
export { handoffChipClass } from '@ip/ui'
