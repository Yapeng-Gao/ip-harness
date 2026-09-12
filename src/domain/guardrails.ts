/** Compat re-export — guardrails in packages/domain */
export {
  type GuardrailAction,
  type GuardrailBlocker,
  type GuardrailEvalResult,
  type GuardrailSessionSnap,
  type EvaluateGuardrailsInput,
  mergeBlockers,
  blockersToResult,
  hasVerifiableResearchHitsFromSession,
  evaluateGuardrails,
  firstGuardrailMessage,
  evaluatePayUnlock,
} from '../../packages/domain/src/guardrails'
