/**
 * Cross-app identity / state key contracts (Phase 0 harness).
 *
 * Honest limits:
 * - Cookies (`ip_harness_*`) are shared across localhost ports → use for persona / workspace.
 * - localStorage is origin+port isolated → snapshot syncs same-port tabs only (storage event),
 *   unless a mid:5173 iframe bridge is running (see @shared crossPortStore).
 * - Do NOT claim "one localStorage for all apps" in IAM copy.
 */

/** Cookie · PersonaId string · path=/ · localhost cross-port */
export const CROSS_PORT_PERSONA_COOKIE = 'ip_harness_persona'

/** Cookie · workspace id string · path=/ · localhost cross-port */
export const CROSS_PORT_WORKSPACE_COOKIE = 'ip_harness_workspace'

/** localStorage · JSON snapshot blob (cases/handoffs/audit/flowProgress…) · same origin only */
export const CROSS_PORT_SNAPSHOT_LS_KEY = 'ip-harness.cross.v1.snapshot'

/** localStorage · ProductContext active product (pre-existing) */
export const ACTIVE_PRODUCT_LS_KEY = 'ip-harness-activeProduct'

/** localStorage · committee hard-block Go (pre-existing; same-origin) */
export const COMMITTEE_VOTE_HARD_BLOCK_LS_KEY =
  'ip-harness-committee-vote-hard-block-go'

/** BroadcastChannel name · same-origin tabs only */
export const CROSS_PORT_BROADCAST_CHANNEL = 'ip-harness-cross-port-v1'

/** postMessage type for mid bridge iframe (if used) */
export const CROSS_PORT_BRIDGE_MESSAGE_TYPE = 'ip-harness.cross.v1'
