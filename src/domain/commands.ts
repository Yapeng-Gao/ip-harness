/**
 * Compat re-export — Command API via packages/domain → @ip/contracts.
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
} from '../../packages/domain/src/commands'
