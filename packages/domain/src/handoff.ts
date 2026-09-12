import type {
  DraftFilingCheck,
  DraftFilingCheckKey,
  DisclosurePackCheck,
  DisclosurePackCheckKey,
  FulfillmentMode,
  HandoffArtifactKey,
  HandoffStatus,
  LegalReviewStatus,
  UserRole,
  PersonaId,
} from './types'

import { personaBlocksHandoffAction } from './persona'

/** P0-5 · handoff keys/labels 唯一源 @ip/contracts */
import {
  HANDOFF_LABELS,
  HANDOFF_ARTIFACT_LABELS,
  ARTIFACT_FOR_STAGE,
  HANDOFF_ACTION_LABELS,
} from '@ip/contracts'

export {
  HANDOFF_LABELS,
  HANDOFF_ARTIFACT_LABELS,
  ARTIFACT_FOR_STAGE,
  HANDOFF_ACTION_LABELS,
}

/** P0.3 required artifacts checklist before submit per node */
export const DRAFT_FILING_CHECK_ITEMS: { id: DraftFilingCheckKey; label: string }[] = [
  { id: 'spec', label: '说明书章节齐套（技术领域/背景/发明内容/实施例）' },
  { id: 'claims', label: '权利要求已校验（≥1 独权，从属引用有效）' },
  { id: 'country', label: '国别 / 途径已确认' },
  { id: 'fees', label: '费用估算已核对' },
  { id: 'disclosure', label: '交底书发明内容已确认' },
]

export const EMPTY_DRAFT_FILING_CHECK: DraftFilingCheck = {
  spec: false,
  claims: false,
  country: false,
  fees: false,
  disclosure: false,
}

/** P0 · disclosure_pack 齐套（借鉴 patent-disclosure-skill 字段同构，非 8 步 UI） */
export const DISCLOSURE_PACK_CHECK_ITEMS: {
  id: DisclosurePackCheckKey
  label: string
}[] = [
  { id: 'patent_type', label: '专利类型（默认发明）' },
  { id: 'structure', label: '结构化技术披露（问题/方案/效果）' },
  { id: 'features', label: '必要技术特征' },
  { id: 'embodiments', label: '实施例（至少有内容）' },
  { id: 'prior_art_1_1', label: '现有技术 1.1（可核验 pubNo+title+url）' },
  { id: 'gaps', label: '缺口清单（阻塞 / 非阻塞）' },
]

export const EMPTY_DISCLOSURE_PACK_CHECK: DisclosurePackCheck = {
  patent_type: false,
  structure: false,
  features: false,
  embodiments: false,
  prior_art_1_1: false,
  gaps: false,
}

export const FULL_DISCLOSURE_PACK_CHECK: DisclosurePackCheck = {
  patent_type: true,
  structure: true,
  features: true,
  embodiments: true,
  prior_art_1_1: true,
  gaps: true,
}

export function disclosurePackMissing(
  check: DisclosurePackCheck,
): DisclosurePackCheckKey[] {
  return DISCLOSURE_PACK_CHECK_ITEMS.filter((i) => !check[i.id]).map((i) => i.id)
}

export function disclosurePackComplete(check: DisclosurePackCheck): boolean {
  return disclosurePackMissing(check).length === 0
}

export const REQUIRED_BEFORE_SUBMIT: Record<
  HandoffArtifactKey,
  { id: string; label: string }[]
> = {
  research_report: [
    { id: 'kw', label: '检索关键词' },
    { id: 'db', label: '至少一个数据库 / 商业API来源' },
    { id: 'hits', label: '勾选对比文献' },
    { id: 'hits_verifiable', label: '命中可核验（pubNo + 可点 url）' },
    { id: 'conclusion', label: '可专利性结论' },
    { id: 'binding', label: '命中→结论绑定' },
    { id: 'fto', label: 'FTO 初评风险已选' },
  ],
  intake_quote: [
    { id: 'quote', label: '报价金额' },
    { id: 'scope', label: '委托范围说明' },
    { id: 'votes', label: '委员投票（至少一位）' },
  ],
  disclosure_pack: [
    { id: 'patent_type', label: '专利类型（默认发明）' },
    { id: 'structure', label: '结构化技术披露' },
    { id: 'features', label: '必要技术特征' },
    { id: 'embodiments', label: '实施例（至少有内容）' },
    { id: 'prior_art_1_1', label: '现有技术 1.1（可核验 pubNo+title+url）' },
    { id: 'gaps', label: '缺口清单（阻塞 / 非阻塞）' },
  ],
  layout_insight: [
    { id: 'matrix', label: '布局矩阵' },
    { id: 'blanks', label: '空白点' },
    { id: 'suggest', label: '补强建议' },
  ],
  draft_claims: [
    { id: 'claims', label: '至少一条独立权利要求' },
    { id: 'countries', label: '申请国别策略' },
    { id: 'filing', label: '递交检查清单齐套' },
  ],
  prosecution_response: [
    { id: 'strategy', label: '争点策略与答复要点' },
    { id: 'claims_amended', label: '修改后权利要求（如需）' },
  ],
  maintain_annuity: [
    { id: 'schedule', label: '年费计划' },
    { id: 'budget', label: '官费/服务费确认' },
  ],
  monetize_terms: [
    { id: 'terms', label: '许可/转让核心条款' },
    { id: 'party', label: '对方主体' },
  ],
  watch_alert: [
    { id: 'alert', label: '告警意见' },
    { id: 'risk', label: '风险评级' },
    { id: 'opinion', label: '代理所意见' },
  ],
}

import type { HandoffAction } from '@ip/contracts'
export type { HandoffAction }

const TRANSITIONS: Record<
  HandoffAction,
  { from: HandoffStatus[]; to: HandoffStatus; role: UserRole }
> = {
  save_draft: {
    from: ['drafting', 'changes_requested'],
    to: 'drafting',
    role: 'agency',
  },
  submit: {
    from: ['drafting', 'changes_requested'],
    to: 'submitted_to_enterprise',
    role: 'agency',
  },
  start_review: {
    from: ['submitted_to_enterprise'],
    to: 'enterprise_review',
    role: 'enterprise',
  },
  request_changes: {
    from: ['submitted_to_enterprise', 'enterprise_review', 'approved'],
    to: 'changes_requested',
    role: 'enterprise',
  },
  approve: {
    from: ['submitted_to_enterprise', 'enterprise_review'],
    to: 'approved',
    role: 'enterprise',
  },
  authorize: {
    from: ['approved', 'enterprise_review', 'submitted_to_enterprise'],
    to: 'authorized_to_file',
    role: 'enterprise',
  },
  file: {
    from: ['authorized_to_file', 'approved'],
    to: 'filed',
    role: 'agency',
  },
}

const AGENCY_ACTIONS: HandoffAction[] = ['save_draft', 'submit', 'file']

/** OrgSettings「投票硬挡 Go」未齐时的统一错误文案 */
export const COMMITTEE_VOTE_HARD_GATE_MSG = '委员投票未达硬闸'

/** localStorage key · AppContext 读写 committeeVoteHardBlockGo（contracts 唯一源） */
import { COMMITTEE_VOTE_HARD_BLOCK_LS_KEY as COMMITTEE_VOTE_HARD_BLOCK_STORAGE_KEY } from '@ip/contracts'
export { COMMITTEE_VOTE_HARD_BLOCK_STORAGE_KEY }

export function canPerformHandoff(
  status: HandoffStatus | undefined,
  action: HandoffAction,
  role: UserRole,
  mode: FulfillmentMode = 'delegated',
  opts?: {
    handoffKey?: HandoffArtifactKey
    legalReview?: LegalReviewStatus
    /** Wave1 Persona 硬闸（演示）；未传则仅按 UserRole */
    persona?: PersonaId
    /** OrgSettings local flag：立项投票硬挡 Go / confirmQuote */
    committeeVoteHardBlockGo?: boolean
    /** 本案是否已有 Persona=committee 可审计票 */
    hasAuditedCommitteeVote?: boolean
  },
): { ok: boolean; reason?: string } {
  // Persona 硬禁优先于 role/mode（发明人/委员不可假装企业 IP 批准）
  if (opts?.persona) {
    const pb = personaBlocksHandoffAction(opts.persona, action)
    if (pb.blocked) {
      return { ok: false, reason: pb.reason }
    }
  }
  const rule = TRANSITIONS[action]
  let effectiveRole = role
  if (mode === 'self_serve' && role === 'enterprise' && AGENCY_ACTIONS.includes(action)) {
    effectiveRole = 'agency'
  }
  if (effectiveRole !== rule.role) {
    if (mode === 'delegated' && role === 'enterprise' && AGENCY_ACTIONS.includes(action)) {
      return {
        ok: false,
        reason: '企业租户不可执行代理专属操作（请切换办理模式为自助，或切换至代理所工作区）',
      }
    }
    if (mode === 'self_serve' && rule.role === 'agency') {
      return {
        ok: false,
        reason: '自助办理模式下请以企业身份执行起草/递交',
      }
    }
    return {
      ok: false,
      reason:
        rule.role === 'agency'
          ? '当前工作区为企业租户，此操作需代理所工作区（或自助模式）'
          : '当前工作区为代理所租户，此操作需企业租户工作区',
    }
  }
  const current = status ?? 'drafting'
  if (!rule.from.includes(current)) {
    return {
      ok: false,
      reason: `当前交接状态为「${HANDOFF_LABELS[current]}」，无法执行此操作`,
    }
  }
  // Monetize：批准（及确认条款）前须法务已阅 — 与商务批准分步，但不脱节
  if (
    opts?.handoffKey === 'monetize_terms' &&
    (action === 'approve' || action === 'authorize') &&
    (opts.legalReview ?? 'pending') !== 'reviewed'
  ) {
    return {
      ok: false,
      reason:
        (opts.legalReview ?? 'pending') === 'changes_requested'
          ? '法务已退回 · 请修订后再批准/确认条款'
          : '批准/确认条款前须法务已阅（非合同签署）',
    }
  }
  // Wave1 VoteGate：flag ON 时 intake_quote 批准/授权须有效委员票（与 Go 同闸）
  if (
    opts?.handoffKey === 'intake_quote' &&
    (action === 'approve' || action === 'authorize') &&
    opts.committeeVoteHardBlockGo &&
    !opts.hasAuditedCommitteeVote
  ) {
    return { ok: false, reason: COMMITTEE_VOTE_HARD_GATE_MSG }
  }
  return { ok: true }
}

export function nextStatusForAction(action: HandoffAction): HandoffStatus {
  return TRANSITIONS[action].to
}


export function nextVersionLabel(existingCount: number): string {
  return `v${existingCount + 1}`
}

/** P0.3 Per-node action labels */
export function actionLabel(
  action: HandoffAction,
  key?: HandoffArtifactKey,
  mode: FulfillmentMode = 'delegated',
): string {
  if (mode === 'self_serve') {
    const selfMap: Partial<Record<HandoffAction, string>> = {
      save_draft: '保存草稿',
      submit: '提交内部审核',
      approve: '确认通过',
      request_changes: '退回修改',
      authorize: key === 'monetize_terms' ? '确认条款' : '确认可递交',
      file:
        key === 'monetize_terms'
          ? '归档条款'
          : key === 'maintain_annuity'
            ? '确认缴费归档'
            : key === 'watch_alert'
              ? '确认处置归档'
              : '确认已递交/归档',
    }
    if (selfMap[action]) return selfMap[action]!
  }

  const byKey: Partial<
    Record<HandoffArtifactKey, Partial<Record<HandoffAction, string>>>
  > = {
    monetize_terms: {
      submit: '提交条款',
      approve: '确认条款',
      authorize: '确认条款生效',
      file: '归档转化协议',
      request_changes: '退回修改条款',
    },
    watch_alert: {
      submit: '提交告警意见',
      approve: '确认风险评级',
      authorize: '授权跟进维权',
      file: '确认处置归档',
      request_changes: '退回告警意见',
    },
    maintain_annuity: {
      submit: '提交年费计划',
      approve: '确认缴费',
      authorize: '授权代缴',
      file: '确认缴费归档',
      request_changes: '退回年费计划',
    },
    research_report: {
      submit: '提交调研结论',
      approve: '确认调研结论',
      authorize: '确认可立项',
      file: '归档调研报告',
    },
    draft_claims: {
      submit: '提交权利要求稿',
      approve: '确认申请策略',
      authorize: '授权递交申请',
      file: '确认已递交并填回执',
    },
    prosecution_response: {
      submit: '提交答复稿',
      approve: '确认答复策略',
      authorize: '授权递交答复',
      file: '确认已递交并填回执',
    },
    intake_quote: {
      submit: '提交报价',
      approve: '确认委托',
      authorize: '确认正式委托',
      file: '归档委托协议',
    },
    disclosure_pack: {
      submit: '提交交底包',
      approve: '批准交底整理',
      authorize: '确认可撰写',
      file: '归档交底包',
      request_changes: '退回补齐交底',
    },
    layout_insight: {
      submit: '提交布局洞察',
      approve: '批准补强方向',
      authorize: '确认可建案',
      file: '归档布局洞察',
      request_changes: '退回布局建议',
    },
  }

  if (key && byKey[key]?.[action]) return byKey[key]![action]!

  const defaults: Record<HandoffAction, string> = {
    save_draft: '保存草稿',
    submit: '提交企业审核',
    start_review: '开始审核',
    request_changes: '退回修改',
    approve: '确认策略',
    authorize: '授权递交',
    file: '确认已递交',
  }
  return defaults[action]
}

export const FULFILLMENT_MODE_LABELS: Record<FulfillmentMode, string> = {
  self_serve: '企业自助',
  delegated: '已委托代理',
}

/** CNIPA official fee categories (示意金额) */
export const CNIPA_FEE_HINTS = {
  application: { label: '申请费', amount: 900, note: '发明专利申请费（示意）' },
  publication: { label: '公布印刷费', amount: 50, note: '示意' },
  substantive: { label: '实审费', amount: 2500, note: '发明实质审查费（示意）' },
  annuity_y1_3: { label: '年费（1–3年）', amount: 900, note: '发明年费示意' },
  annuity_y4_6: { label: '年费（4–6年）', amount: 1200, note: '发明年费示意' },
  registration: { label: '登记费', amount: 200, note: '授权登记相关（示意）' },
}
