/**
 * @ip/app-state — React app state (Phase 2).
 * Contexts + cross-port store. Domain/contracts stay the source for types and keys.
 */

export { AppProvider, useApp } from './AppContext'
export {
  AgentProvider,
  useAgents,
  type HitlSessionAction,
  type HitlActionResult,
  type AgentContextValue,
} from './AgentContext'
export type { SessionSearchState } from './AgentContext'
export { ProductProvider, useProduct } from './ProductContext'
export {
  type CrossPortSnapshotV1,
  readCookie,
  writeCookie,
  readPersonaCookie,
  writePersonaCookie,
  readWorkspaceCookie,
  writeWorkspaceCookie,
  readLocalSnapshot,
  writeLocalSnapshot,
  pickNewerSnapshot,
  requestBridgeSnapshot,
  subscribeCrossPortSnapshot,
  CROSS_PORT_LIMITS_ZH,
} from './crossPortStore'
