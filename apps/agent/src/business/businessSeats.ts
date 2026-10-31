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
  'expert-draft-spec': '说明书',
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
/** 历史辅链七席（非真源八部）：交底 → 查新 → 立项 → 申请撰写 → 附图 → 递交 → 审查答复。申请后可再开一轮查新再进附图。 */
export const BUSINESS_DEFAULT_SEAT_IDS: ProjectExpertId[] = [
  'expert-disclosure',
  'expert-research',
  'expert-intake',
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
    title: '交底',
    blurb: '把技术事实说清楚，缺项追问补齐',
    seatIds: ['expert-disclosure'],
    advanceCta: '继续交底',
    confirmCta: '确认交底',
  },
  {
    id: 'intake',
    title: '查新与立项',
    blurb: '查新结论 → 决定做不做、做到哪',
    seatIds: ['expert-research', 'expert-intake'],
    advanceCta: '继续查新/立项',
    confirmCta: '确认查新/立项',
    requires: ['prepare'],
  },
  {
    id: 'drafting',
    title: '撰写申请',
    blurb: '撰写 →（可再查新）→ 正式附图',
    seatIds: [
      'expert-draft',
      'expert-research',  // 撰写后再查一轮
      'expert-figure',
    ],
    advanceCta: '继续撰写',
    confirmCta: '确认权利要求/附图',
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
  | 'figures_ready'
  | 'file_authorize'
  | 'oa_strategy'
  | 'layout_adjust'

export const CONFIRM_KIND_LABEL: Record<BusinessConfirmKind, string> = {
  research_ready: '确认查新结论',
  go_nogo: '确认立项',
  disclosure_ready: '确认交底',
  claims_ready: '确认权利要求',
  figures_ready: '确认附图',
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
    stageId: 'prepare',
    seatId: 'expert-disclosure',
    preparedBy: '交底',
  },
  claims_ready: {
    stageId: 'drafting',
    seatId: 'expert-draft',
    preparedBy: '撰写',
  },
  figures_ready: {
    stageId: 'drafting',
    seatId: 'expert-figure',
    preparedBy: '附图',
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

export type NodeExpert = { id: ProjectExpertId; label: string }

/**
 * 同一节点里能单独聊天的专家。
 * 少于 2 人时侧栏不展开，直接点节点名。
 */
export function expertsInNode(seatId: string): NodeExpert[] {
  if (seatId === 'expert-draft') {
    return [
      { id: 'expert-draft', label: '权要' },
      { id: 'expert-draft-spec', label: '说明书' },
    ]
  }
  return []
}

export type TeamRosterRow = {
  id: ProjectExpertId
  label: string
  /** 仅多人节点出现，用来在组队列表里分组 */
  group?: string
}

/** 组队名单：单人节点一行用节点名；多人节点按专家勾选。 */
export function teamRosterRows(seatIds: ProjectExpertId[]): TeamRosterRow[] {
  const rows: TeamRosterRow[] = []
  const seen = new Set<string>()
  for (const sid of seatIds) {
    const experts = expertsInNode(sid)
    if (experts.length >= 2) {
      const group = businessSeatLabel(sid)
      for (const expert of experts) {
        if (seen.has(expert.id)) continue
        seen.add(expert.id)
        rows.push({ id: expert.id, label: expert.label, group })
      }
      continue
    }
    if (seen.has(sid)) continue
    seen.add(sid)
    rows.push({ id: sid, label: businessSeatLabel(sid) })
  }
  return rows
}

/** Seat → 业务待确认 kind（无闸席返回 null） */
export const SEAT_CONFIRM_KIND: Partial<
  Record<ProjectExpertId, BusinessConfirmKind>
> = {
  'expert-research': 'research_ready',
  'expert-intake': 'go_nogo',
  'expert-disclosure': 'disclosure_ready',
  'expert-draft': 'claims_ready',
  'expert-figure': 'figures_ready',
  'expert-filing': 'file_authorize',
  'expert-oa': 'oa_strategy',
  'expert-layout': 'layout_adjust',
}

export function confirmKindForSeat(
  seatId: ProjectExpertId,
): BusinessConfirmKind | null {
  return SEAT_CONFIRM_KIND[seatId] ?? null
}

/** 本案可见席：默认 7 + 已加更多（不含助手） */
export function seatsForCase(opts: {
  expertIds?: ProjectExpertId[]
  moreSeatIds?: ProjectExpertId[]
}): ProjectExpertId[] {
  const more = opts.moreSeatIds ?? []
  const fromExperts = (opts.expertIds ?? []).filter(
    (id) =>
      id !== BUSINESS_ASSISTANT_ID &&
      !BUSINESS_DEFAULT_SEAT_IDS.includes(id) &&
      !more.includes(id),
  )
  const seen = new Set<ProjectExpertId>()
  const out: ProjectExpertId[] = []
  for (const id of [
    ...BUSINESS_DEFAULT_SEAT_IDS,
    ...more,
    ...fromExperts,
  ]) {
    if (seen.has(id)) continue
    seen.add(id)
    out.push(id)
  }
  return out
}

/** 当前阶段高亮席（进度同源） */
export function currentSeatForProgress(opts: {
  stageId: BusinessStageId
  doneSeatIds: ProjectExpertId[]
  moreSeatIds?: ProjectExpertId[]
}): ProjectExpertId {
  const stage = BUSINESS_STAGES.find((s) => s.id === opts.stageId)
  if (stage) {
    for (const sid of stage.seatIds) {
      if (!opts.doneSeatIds.includes(sid)) return sid
    }
  }
  if (opts.moreSeatIds?.includes('expert-layout')) {
    if (!opts.doneSeatIds.includes('expert-layout')) return 'expert-layout'
  }
  return stage?.seatIds[0] ?? BUSINESS_DEFAULT_SEAT_IDS[0]!
}

/** 查新轮次：0 还没对照交底书；1 交底后已确认、说明书后再查；2 说明书后补检已确认 */
export type ResearchPass = 0 | 1 | 2

export function normalizeResearchPass(n: unknown): ResearchPass {
  return n === 1 || n === 2 ? n : 0
}

export type MainChainSnapshot = {
  stageId: BusinessStageId
  doneSeatIds: ProjectExpertId[]
  completedStages: BusinessStageId[]
  filed: boolean
  oaRound: number
  researchPass: ResearchPass
}

/**
 * 确认后落到哪一节点。researchPass 用确认前的值：
 * 交底 → 查新；查新第 1 轮 → 立项；立项 → 撰写；撰写 → 再查新；查新第 2 轮 → 附图。
 */
export function nextSeatAfterConfirm(
  kind: BusinessConfirmKind,
  researchPass: ResearchPass = 0,
): ProjectExpertId {
  if (kind === 'disclosure_ready') return 'expert-research'
  if (kind === 'research_ready') {
    return researchPass < 1 ? 'expert-intake' : 'expert-figure'
  }
  if (kind === 'go_nogo') return 'expert-draft'
  if (kind === 'claims_ready') return 'expert-research'
  if (kind === 'figures_ready') return 'expert-filing'
  if (kind === 'file_authorize') return 'expert-oa'
  return CONFIRM_META[kind].seatId
}

/** 主链确认推进。说明书交卷后清掉查新的完成标记，以便再开一轮。 */
export function applyMainChainConfirm(
  prog: MainChainSnapshot,
  kind: BusinessConfirmKind,
): MainChainSnapshot {
  const meta = CONFIRM_META[kind]
  let doneSeatIds = prog.doneSeatIds.includes(meta.seatId)
    ? [...prog.doneSeatIds]
    : [...prog.doneSeatIds, meta.seatId]
  const completedStages = [...prog.completedStages]
  let stageId = prog.stageId
  let filed = prog.filed
  let oaRound = prog.oaRound
  let researchPass = normalizeResearchPass(prog.researchPass)

  if (kind === 'disclosure_ready') {
    if (!completedStages.includes('prepare')) completedStages.push('prepare')
    stageId = 'intake'
    if (researchPass < 1) {
      doneSeatIds = doneSeatIds.filter((id) => id !== 'expert-research')
    }
  } else if (kind === 'research_ready') {
    researchPass = researchPass < 1 ? 1 : 2
    stageId = researchPass < 2 ? 'intake' : 'drafting'
  } else if (kind === 'go_nogo') {
    if (!completedStages.includes('prepare')) completedStages.push('prepare')
    if (!completedStages.includes('intake')) completedStages.push('intake')
    stageId = 'drafting'
  } else if (kind === 'claims_ready') {
    doneSeatIds = doneSeatIds.filter((id) => id !== 'expert-research')
    researchPass = 1
    stageId = 'drafting'
  } else if (kind === 'figures_ready') {
    const ready =
      doneSeatIds.includes('expert-disclosure') &&
      doneSeatIds.includes('expert-intake') &&
      doneSeatIds.includes('expert-draft') &&
      doneSeatIds.includes('expert-figure') &&
      researchPass >= 2
    if (ready) {
      if (!completedStages.includes('drafting')) completedStages.push('drafting')
      stageId = 'filing'
    } else {
      stageId = 'drafting'
    }
  } else if (kind === 'file_authorize') {
    filed = true
    if (!completedStages.includes('filing')) completedStages.push('filing')
    stageId = 'oa'
    oaRound = Math.max(prog.oaRound || 0, 1)
  } else if (kind === 'oa_strategy') {
    stageId = 'oa'
    oaRound = Math.max(prog.oaRound || 1, 1)
  } else if (kind === 'layout_adjust') {
    stageId = 'prepare'
    if (!completedStages.includes('prepare')) completedStages.push('prepare')
  }

  return {
    stageId,
    doneSeatIds,
    completedStages,
    filed,
    oaRound,
    researchPass,
  }
}
