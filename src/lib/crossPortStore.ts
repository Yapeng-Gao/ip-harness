/**
 * Compat re-export — cross-port runtime store lives in @ip/app-state (Phase 2).
 * Keys remain in @ip/contracts (crossPortKeys).
 */
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
} from '@ip/app-state'
