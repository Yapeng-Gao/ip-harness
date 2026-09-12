/**
 * CommandName — full set of auditable command string literals (labels + audit).
 * CommandName 与 DomainCommand['type'] 已对齐（见 commands.ts；含 docketEscalate / docketComplete）。
 */
export type CommandName =
  | 'submitResearch'
  | 'approveHandoff'
  | 'requestChanges'
  | 'advanceStage'
  | 'submitClaims'
  | 'analyzeAndSubmitOA'
  | 'authorizeFile'
  | 'fileResponse'
  | 'confirmQuote'
  | 'assignAgency'
  | 'issueInvoice'
  | 'payInvoice'
  | 'createCaseFromInsight'
  | 'saveDraft'
  | 'submitHandoff'
  | 'startReview'
  | 'docketEscalate'
  | 'docketComplete'

export const COMMAND_LABELS: Record<CommandName, string> = {
  submitResearch: 'SubmitResearch',
  approveHandoff: 'ApproveHandoff',
  requestChanges: 'RequestChanges',
  advanceStage: 'AdvanceStage',
  submitClaims: 'SubmitClaims',
  analyzeAndSubmitOA: 'AnalyzeAndSubmitOA',
  authorizeFile: 'AuthorizeFile',
  fileResponse: 'FileResponse',
  confirmQuote: 'ConfirmQuote',
  assignAgency: 'AssignAgency',
  issueInvoice: 'IssueInvoice',
  payInvoice: 'PayInvoice',
  createCaseFromInsight: 'CreateCaseFromInsight',
  saveDraft: 'SaveDraft',
  submitHandoff: 'SubmitHandoff',
  startReview: 'StartReview',
  docketEscalate: 'DocketEscalate',
  docketComplete: 'DocketComplete',
}
