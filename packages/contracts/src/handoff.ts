import type { HandoffArtifactKey, HandoffStatus, StageId } from './keys.js'

export const HANDOFF_LABELS: Record<HandoffStatus, string> = {
  drafting: '代理起草中',
  submitted_to_enterprise: '已提交企业',
  enterprise_review: '企业审核中',
  changes_requested: '退回修改',
  approved: '已批准',
  authorized_to_file: '已授权递交',
  filed: '已递交/归档',
}

export const HANDOFF_ARTIFACT_LABELS: Record<HandoffArtifactKey, string> = {
  research_report: '调研报告',
  intake_quote: '立项/报价',
  disclosure_pack: '交底包',
  layout_insight: '布局洞察',
  draft_claims: '权利要求草稿',
  prosecution_response: '审查答复',
  maintain_annuity: '授权维持',
  monetize_terms: '转化条款',
  watch_alert: '监控告警',
}

export const ARTIFACT_FOR_STAGE: Partial<Record<StageId, HandoffArtifactKey>> = {
  pre_research: 'research_report',
  decision: 'intake_quote',
  drafting: 'draft_claims',
  prosecution: 'prosecution_response',
  maintenance: 'maintain_annuity',
  commercialization: 'monetize_terms',
  monitoring: 'watch_alert',
}

/** Handoff action display (contracts surface) */
export const HANDOFF_ACTION_LABELS: Record<
  import('./keys.js').HandoffAction,
  string
> = {
  save_draft: '保存草稿',
  submit: '提交',
  start_review: '开始审核',
  request_changes: '退回修改',
  approve: '批准',
  authorize: '授权递交',
  file: '递交归档',
}
