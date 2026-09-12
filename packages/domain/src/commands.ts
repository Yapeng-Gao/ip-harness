/**
 * Re-exports @ip/contracts command surface (no second CommandName table).
 * See contracts: CommandName ⊇ DomainCommand["type"] (docket* gap documented there).
 * Handlers live in AppContext.dispatchCommand.
 */
export {
  type CommandName,
  COMMAND_LABELS,
  AUDIT_SCHEMA_VERSION,
  type AuditSchemaVersion,
  type AuditEntry,
  auditSchemaVersionLabel,
  isLegacyAudit,
  type CommandMeta,
  type DomainCommand,
  type CommandResult,
  TOOL_TO_COMMAND,
  commandForHandoffAction,
  handoffActionForCommand,
  defaultHandoffKeyForCommand,
} from '@ip/contracts'
