import type { ProjectExpertId } from '../projects/types'

/**
 * Business-mode seats · agent-business-mode (c3fffe4).
 * 默认 7 业务专家席；orchestrator = 静默案子助手（不计 7）。
 */

export type BusinessSeatId = ProjectExpertId

/** Display names — 禁 Catalog/HITL/总控 等上屏词 */
export const BUSINESS_SEAT_LABEL: Record<string, string> = {
  orchestrator: '案子助手',
  'expert-research': '查新',
  'expert-intake': '立项',
  'expert-disclosure': '交底',
  'expert-draft': '撰写',
  'expert-figure': '附图',
  'expert-filing': '递交',
  'expert-oa': '审查答复',
  'expert-landscape': '产业全景',
  'expert-inspire': '创新方向',
  'expert-competitor': '竞品',
  'expert-mining': '挖掘',
  'expert-layout': '布局',
  'expert-fto': '自由实施（FTO）',
  'expert-annuity': '年费',
  'expert-valuation': '价值',
  'expert-monetize': '转化',
  'expert-enforcement': '维权',
}

/** 默认 7 业务专家席（不含案子助手） */
export const BUSINESS_DEFAULT_SEAT_IDS: ProjectExpertId[] = [
  'expert-research',
  'expert-intake',
  'expert-disclosure',
  'expert-draft',
  'expert-figure',
  'expert-filing',
  'expert-oa',
]

/** 静默编排 · 不计 7 · 不上主列表名 */
export const BUSINESS_ASSISTANT_ID: ProjectExpertId = 'orchestrator'

/** 新建案子默认 expertIds = 助手 + 7 */
export const BUSINESS_DEFAULT_TEAM_IDS: ProjectExpertId[] = [
  BUSINESS_ASSISTANT_ID,
  ...BUSINESS_DEFAULT_SEAT_IDS,
]

/** 「更多专家」折叠（立项前簇 + FTO 辅席；布局/维权灰显见 PHASE） */
export const BUSINESS_MORE_SEAT_IDS: ProjectExpertId[] = [
  'expert-landscape',
  'expert-inspire',
  'expert-competitor',
  'expert-mining',
  'expert-fto',
]

/**
 * Phase 灰显「即将推出」
 * Knife3：布局 + 维权灰显（≠ 把 expert-fto 当成维权席）
 */
export const BUSINESS_PHASE_SEAT_IDS: ProjectExpertId[] = [
  'expert-layout',
  'expert-annuity',
  'expert-valuation',
  'expert-monetize',
  'expert-enforcement',
]

export type BusinessStageId =
  | 'prepare'
  | 'intake'
  | 'drafting'
  | 'filing'
  | 'oa'

export type BusinessStageDef = {
  id: BusinessStageId
  title: string
  blurb: string
  /** seats active in this stage (subset of 7) */
  seatIds: ProjectExpertId[]
  /** primary CTA when stage is current and no pending confirm */
  advanceCta: string
  /** confirm CTA when a confirm is ready for this stage */
  confirmCta: string
  /** gate keys that unlock this stage */
  requires?: BusinessStageId[]
  /** OA only after filing done */
  requiresFiled?: boolean
}

/** 向导时间线 5 段 · 默认 7 席映射 */
export const BUSINESS_STAGES: BusinessStageDef[] = [
  {
    id: 'prepare',
    title: '准备',
    blurb: '弄清要不要做、方向对不对',
    seatIds: [],
    advanceCta: '跳过准备，开始查新',
    confirmCta: '继续',
  },
  {
    id: 'intake',
    title: '立项',
    blurb: '决定做不做、做到哪',
    seatIds: ['expert-research', 'expert-intake'],
    advanceCta: '继续查新',
    confirmCta: '确认立项',
  },
  {
    id: 'drafting',
    title: '撰写申请',
    blurb: '交底 → 写申请 → 附图',
    seatIds: ['expert-disclosure', 'expert-draft', 'expert-figure'],
    advanceCta: '继续撰写',
    confirmCta: '确认交底/权利要求',
    requires: ['intake'],
  },
  {
    id: 'filing',
    title: '递交',
    blurb: '材料齐了交出去',
    seatIds: ['expert-filing'],
    advanceCta: '准备递交',
    confirmCta: '确认递交',
    requires: ['drafting'],
  },
  {
    id: 'oa',
    title: '审查答复',
    blurb: '有审查意见再处理',
    seatIds: ['expert-oa'],
    advanceCta: '开始审查答复',
    confirmCta: '确认答复策略',
    requiresFiled: true,
  },
]

export type BusinessConfirmKind =
  | 'research_ready'
  | 'go_nogo'
  | 'disclosure_ready'
  | 'claims_ready'
  | 'file_authorize'
  | 'oa_strategy'
  | 'layout_adjust'

export const CONFIRM_KIND_LABEL: Record<BusinessConfirmKind, string> = {
  research_ready: '确认查新结论',
  go_nogo: '确认立项',
  disclosure_ready: '确认交底',
  claims_ready: '确认权利要求',
  file_authorize: '确认递交',
  oa_strategy: '确认答复策略',
  layout_adjust: '请确认布局调整',
}

/** Map confirm → stage + seat for progress同源 */
export const CONFIRM_META: Record<
  BusinessConfirmKind,
  { stageId: BusinessStageId; seatId: ProjectExpertId; preparedBy: string }
> = {
  research_ready: {
    stageId: 'intake',
    seatId: 'expert-research',
    preparedBy: '查新',
  },
  go_nogo: {
    stageId: 'intake',
    seatId: 'expert-intake',
    preparedBy: '立项',
  },
  disclosure_ready: {
    stageId: 'drafting',
    seatId: 'expert-disclosure',
    preparedBy: '交底',
  },
  claims_ready: {
    stageId: 'drafting',
    seatId: 'expert-draft',
    preparedBy: '撰写',
  },
  file_authorize: {
    stageId: 'filing',
    seatId: 'expert-filing',
    preparedBy: '递交',
  },
  oa_strategy: {
    stageId: 'oa',
    seatId: 'expert-oa',
    preparedBy: '审查答复',
  },
  layout_adjust: {
    stageId: 'prepare',
    seatId: 'expert-layout',
    preparedBy: '布局',
  },
}

export function businessSeatLabel(id: string): string {
  return BUSINESS_SEAT_LABEL[id] ?? id
}
