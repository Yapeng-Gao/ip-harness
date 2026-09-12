/**
 * @ip/domain — types + domain logic (Phase 1).
 * Contracts (@ip/contracts) remain the single source for command names / schemas.
 * This package depends on and re-exports/extends contracts; it does not fork them.
 */

export * from './types/index'
export * from './commands'
export * from './handoff'
export * from './guardrails'
export * from './caseContextContract'
export * from './fullFilingCheck'
export * from './persona'
export * from './stages'
export * from './agentLabels'
