/**
 * Shared domain Command API — types + mappings.
 * Handlers live in AppContext.dispatchCommand; this module owns the contract.
 *
 * DomainCommand = payload union for the main dispatchCommand path.
 * CommandName (commandNames.ts) is the full string set used by audit / labels.
 * Today CommandName is a strict superset: docketEscalate / docketComplete are
 * named for audit but not yet members of this union (dedicated AppContext path).
 * Do not invent a second name table elsewhere — extend this union when closing the gap.
 */
import type { HandoffAction, HandoffArtifactKey, StageId } from './keys.js'
import type { CommandName } from './commandNames.js'

export type { CommandName } from './commandNames.js'
export { COMMAND_LABELS } from './commandNames.js'
export {
  AUDIT_SCHEMA_VERSION,
  type AuditSchemaVersion,
  type AuditEntry,
  auditSchemaVersionLabel,
  isLegacyAudit,
} from './audit.js'

export interface CommandMeta {
  actor: 'user' | 'agent'
  agentId?: string
  detail?: string
}

export type DomainCommand =
  | {
      type: 'submitResearch'
      caseId: string
      note?: string
      artifactName?: string
    }
  | {
      type: 'approveHandoff'
      caseId: string
      handoffKey: HandoffArtifactKey
      note?: string
    }
  | {
      type: 'requestChanges'
      caseId: string
      handoffKey: HandoffArtifactKey
      note?: string
      annotation?: string
    }
  | {
      type: 'advanceStage'
      caseId: string
      note?: string
    }
  | {
      type: 'submitClaims'
      caseId: string
      note?: string
    }
  | {
      type: 'analyzeAndSubmitOA'
      caseId: string
      note?: string
    }
  | {
      type: 'authorizeFile'
      caseId: string
      handoffKey: HandoffArtifactKey
      note?: string
    }
  | {
      type: 'fileResponse'
      caseId: string
      handoffKey: HandoffArtifactKey
      receiptNo: string
      filedAt: string
      note?: string
    }
  | {
      type: 'confirmQuote'
      caseId: string
      note?: string
    }
  | {
      type: 'assignAgency'
      caseId: string
      agencyName: string
    }
  | {
      type: 'issueInvoice'
      caseId: string
      invoiceId: string
    }
  | {
      type: 'payInvoice'
      caseId: string
      invoiceId: string
    }
  | {
      type: 'createCaseFromInsight'
      title: string
      stage: StageId
      summary?: string
      inventor?: string
      ownerTeam?: string
      agencyName?: string
      fromInsight?: boolean
    }
  | {
      type: 'saveDraft'
      caseId: string
      handoffKey: HandoffArtifactKey
      note?: string
    }
  | {
      type: 'submitHandoff'
      caseId: string
      handoffKey: HandoffArtifactKey
      note?: string
    }
  | {
      type: 'startReview'
      caseId: string
      handoffKey: HandoffArtifactKey
      note?: string
    }

export interface CommandResult {
  ok: boolean
  message: string
  caseId?: string
  command?: CommandName
}

/** Agent tool name → domain command (formal apply) */
export const TOOL_TO_COMMAND: Record<string, CommandName | null> = {
  commercial_patent_search: null,
  cluster_hits: null,
  draft_research_report: null,
  bind_novelty: null,
  submit_for_review: 'submitResearch',
  score_patentability: null,
  estimate_quote: null,
  draft_intake_memo: null,
  structure_disclosure: null,
  extract_features: null,
  prior_art_lite: null,
  flag_gaps: null,
  draft_claims: null,
  expand_dependent: null,
  check_support: null,
  country_strategy: null,
  analyze_oa: null,
  propose_amendments: null,
  draft_opinion: null,
  write_docket_event: 'fileResponse',
  file_oa_response: 'fileResponse',
  list_annuity_schedule: null,
  estimate_official_fees: null,
  draft_license_terms: null,
  benchmark_royalty: null,
  link_watch_alert: null,
  scan_new_publications: null,
  score_threat: null,
  draft_watch_alert: null,
  map_layout_matrix: null,
  find_blank_spots: null,
  suggest_filings: null,
  assign_agency: 'assignAgency',
  create_case_from_insight: 'createCaseFromInsight',
  issue_inquiry: 'confirmQuote',
  patent_search: null,
  generate_report: null,
  docket_write: 'fileResponse',
}

export function commandForHandoffAction(
  action: HandoffAction,
  key: HandoffArtifactKey,
): CommandName {
  if (action === 'save_draft') return 'saveDraft'
  if (action === 'start_review') return 'startReview'
  if (action === 'request_changes') return 'requestChanges'
  if (action === 'approve') {
    if (key === 'intake_quote') return 'confirmQuote'
    return 'approveHandoff'
  }
  if (action === 'authorize') return 'authorizeFile'
  if (action === 'file') return 'fileResponse'
  if (action === 'submit') {
    if (key === 'research_report') return 'submitResearch'
    if (key === 'draft_claims') return 'submitClaims'
    if (key === 'prosecution_response') return 'analyzeAndSubmitOA'
    if (key === 'intake_quote') return 'submitHandoff'
    return 'submitHandoff'
  }
  return 'submitHandoff'
}

export function handoffActionForCommand(type: CommandName): HandoffAction | null {
  switch (type) {
    case 'saveDraft':
      return 'save_draft'
    case 'submitResearch':
    case 'submitClaims':
    case 'analyzeAndSubmitOA':
    case 'submitHandoff':
      return 'submit'
    case 'startReview':
      return 'start_review'
    case 'requestChanges':
      return 'request_changes'
    case 'approveHandoff':
    case 'confirmQuote':
      return 'approve'
    case 'authorizeFile':
      return 'authorize'
    case 'fileResponse':
      return 'file'
    default:
      return null
  }
}

export function defaultHandoffKeyForCommand(
  type: CommandName,
): HandoffArtifactKey | undefined {
  switch (type) {
    case 'submitResearch':
      return 'research_report'
    case 'submitClaims':
      return 'draft_claims'
    case 'analyzeAndSubmitOA':
    case 'fileResponse':
      return 'prosecution_response'
    case 'confirmQuote':
      return 'intake_quote'
    default:
      return undefined
  }
}
