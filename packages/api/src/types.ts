/**
 * Thin DTOs + re-exports from @ip/contracts for the mock API client.
 */
export type {
  CommandName,
  DomainCommand,
  CommandMeta,
  CommandResult,
  AuditEntry,
} from '@ip/contracts'

/** Case list / detail summary used by api-mock (not full PatentCase). */
export interface CaseSummary {
  id: string
  title: string
  caseNo: string
  stage: string
  risk: string
  nextDeadline: string
  summary: string
  /** Optional mock handoff note flipped by submitResearch etc. */
  handoffNote?: string
}

/** Inbox item DTO from GET /v1/inbox */
export interface InboxItem {
  id: string
  caseId: string
  title: string
  kind: string
  due: string
  risk: string
  /** Optional persona filter tags: enterprise_ip | agency | … */
  personas?: string[]
}

export interface HealthResponse {
  ok: boolean
  mock: boolean
  service: string
}
