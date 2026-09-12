import type { AuditActor } from './keys.js'
import type { CommandName } from './commandNames.js'

/** Bump when AuditEntry shape / command audit semantics change */
export const AUDIT_SCHEMA_VERSION = '2026.09.1' as const
export type AuditSchemaVersion = typeof AUDIT_SCHEMA_VERSION

export interface AuditEntry {
  id: string
  actor: AuditActor
  agentId?: string
  command: CommandName
  caseId: string
  at: string
  detail: string
  /**
   * Present on all new writes via pushAudit.
   * Absent / empty = legacy entry (pre–Wave3 AuditReplay).
   */
  schemaVersion?: string
}

export function auditSchemaVersionLabel(v?: string | null): string {
  if (v == null || v === '') return 'legacy'
  return v
}

export function isLegacyAudit(entry: Pick<AuditEntry, 'schemaVersion'>): boolean {
  return entry.schemaVersion == null || entry.schemaVersion === ''
}
