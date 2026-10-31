/**
 * apps/agent 写库示意 · Office 人话标签单源（§79）。
 * 与 packages COMMAND_LABELS（审计英名）分立；本表只服务壳 UI。
 */
import type { CommandName } from '@ip/domain'

/** DomainCommand 写库示意 · 中文名 */
export const DOMAIN_COMMAND_OFFICE_LABEL: Record<CommandName, string> = {
  submitResearch: '提交查新',
  approveHandoff: '批准交接',
  requestChanges: '退回修改',
  advanceStage: '推进阶段',
  submitClaims: '交权要',
  analyzeAndSubmitOA: '分析并交答复',
  authorizeFile: '授权递交',
  fileResponse: '递交答复',
  confirmQuote: '确认报价',
  assignAgency: '派所',
  issueInvoice: '开票',
  payInvoice: '付款',
  createCaseFromInsight: '由洞察建案',
  saveDraft: '存稿',
  submitHandoff: '提交交接',
  startReview: '开始审校',
  docketEscalate: '期限升级',
  docketComplete: '期限办结',
}

/** 交接点键 · 中文名（壳展示；内部键不变） */
export const HANDOFF_KEY_OFFICE_LABEL: Record<string, string> = {
  research_report: '查新报告',
  intake_quote: '立项报价',
  disclosure_pack: '交底包',
  draft_claims: '权要稿',
  prosecution_response: '答复稿',
  maintain_annuity: '年费台账',
  monetize_terms: '转化条款',
  layout_insight: '布局洞察',
}

export function domainCommandOfficeLabel(
  cmd: string | null | undefined,
): string {
  if (!cmd) return '—'
  return (
    DOMAIN_COMMAND_OFFICE_LABEL[cmd as CommandName] ?? cmd
  )
}

export function handoffKeyOfficeLabel(k: string): string {
  return HANDOFF_KEY_OFFICE_LABEL[k] ?? k
}
