import type {
  DraftFilingCheck,
  FullCheckLite,
  HandoffStatus,
  OaIssueType,
} from './types'

export const FULL_CHECK_LITE_ITEMS: Array<{
  id: keyof FullCheckLite
  label: string
}> = [
  { id: 'terminology', label: '术语与交底/对比文献口径一致（轻量）' },
  { id: 'support', label: '说明书/附图对权项有支持（轻量勾选）' },
  { id: 'non_legal_stamp', label: '非法律意见戳 · 本输出不构成律师意见' },
]

export const EMPTY_FULL_CHECK_LITE: FullCheckLite = {
  terminology: false,
  support: false,
  non_legal_stamp: false,
}

export const OA_ISSUE_TYPE_LABELS: Record<OaIssueType, string> = {
  novelty: '新颖性',
  inventiveness: '创造性',
  clarity: '清楚',
  support_disclosure: '支持 / 充分公开',
  other: '其他',
}

export const OA_ISSUE_TYPES = Object.keys(OA_ISSUE_TYPE_LABELS) as OaIssueType[]

export type FullCheckScope = 'claims' | 'oa' | 'draft'

export type FullCheckInput = {
  scope: FullCheckScope
  disclosureStatus?: HandoffStatus
  filingCheck?: DraftFilingCheck
  lite: FullCheckLite
  /** OA：须已确认陈述 */
  oaStatementConfirmed?: boolean
  /** OA：争点类型已选 */
  oaIssueType?: OaIssueType
  /** OA：策略要点非空 */
  oaStrategyNotes?: string
}

export type FullCheckResult = {
  ok: boolean
  missing: string[]
}

function disclosureApproved(status?: HandoffStatus): boolean {
  return (
    status === 'approved' ||
    status === 'authorized_to_file' ||
    status === 'filed'
  )
}

function filingComplete(fc?: DraftFilingCheck): boolean {
  if (!fc) return false
  return Object.values(fc).every(Boolean)
}

/** 递交前 Full-check：Claims/OA/Draft 授权或 file 前统一门禁 */
export function evaluateFullCheck(input: FullCheckInput): FullCheckResult {
  const missing: string[] = []
  const { scope, lite } = input

  if (scope === 'claims' || scope === 'draft') {
    if (!disclosureApproved(input.disclosureStatus)) {
      missing.push('交底包未批准/授权')
    }
    if (!filingComplete(input.filingCheck)) {
      const n = input.filingCheck
        ? Object.values(input.filingCheck).filter(Boolean).length
        : 0
      missing.push(`filing 五清单未齐（${n}/5）`)
    }
  }

  if (scope === 'oa') {
    if (!input.oaStatementConfirmed) missing.push('意见陈述未确认')
    if (!input.oaIssueType) missing.push('未选 OA 争点类型')
    if (!input.oaStrategyNotes?.trim()) missing.push('未填策略要点')
  }

  if (!lite.terminology) missing.push('术语一致性未勾')
  if (!lite.support) missing.push('说明书支持未勾')
  if (!lite.non_legal_stamp) missing.push('非法律意见戳未勾')

  return { ok: missing.length === 0, missing }
}

export function fullCheckScopeFor(
  agentId?: string,
  handoffKey?: string,
): FullCheckScope | null {
  if (agentId === 'agent-claims' || handoffKey === 'draft_claims') return 'claims'
  if (agentId === 'agent-oa' || handoffKey === 'prosecution_response') return 'oa'
  if (handoffKey === 'draft_claims') return 'draft'
  // 年费/监控/转化/布局/调研/立项：非申请递交，Full-check 不适用（Maintain showFile = 年费手续）
  if (
    agentId === 'agent-annuity' ||
    handoffKey === 'maintain_annuity' ||
    agentId === 'agent-watch' ||
    handoffKey === 'watch_alert' ||
    agentId === 'agent-monetize' ||
    handoffKey === 'monetize_terms' ||
    agentId === 'agent-layout' ||
    handoffKey === 'layout_insight'
  ) {
    return null
  }
  return null
}
