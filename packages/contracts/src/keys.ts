/** Shared domain keys — single source for apps + mid/workbench/agent */

export type StageId =
  | 'pre_research'
  | 'decision'
  | 'drafting'
  | 'prosecution'
  | 'maintenance'
  | 'commercialization'
  | 'monitoring'

export type HandoffStatus =
  | 'drafting'
  | 'submitted_to_enterprise'
  | 'enterprise_review'
  | 'changes_requested'
  | 'approved'
  | 'authorized_to_file'
  | 'filed'

export type HandoffArtifactKey =
  | 'research_report'
  | 'intake_quote'
  | 'disclosure_pack'
  | 'layout_insight'
  | 'draft_claims'
  | 'prosecution_response'
  | 'maintain_annuity'
  | 'monetize_terms'
  | 'watch_alert'

export type HandoffAction =
  | 'save_draft'
  | 'submit'
  | 'start_review'
  | 'request_changes'
  | 'approve'
  | 'authorize'
  | 'file'

export type HitlGateId =
  | 'go_nogo'
  | 'approve_strategy'
  | 'authorize_file'
  | 'pay_unlock'
  | 'confirm_quote'

export type PersonaId = 'enterprise_ip' | 'agency' | 'inventor' | 'committee'

export type AuditActor = 'user' | 'agent'

/** Agent catalog maturity tier (Wave3) */
export type AgentTier = 'core' | 'assist' | 'beta'
