/**
 * 部门 · 专家花名册（业务壳）· agent-dept-expert-team
 * 默认 7 部门；撰写部含真副席说明书；前研/布局挂更多。
 */
import type { ProjectExpertId } from '../projects/types'
import type { BusinessStageId } from './businessSeats'
import { BUSINESS_DEFAULT_SEAT_IDS, businessSeatLabel } from './businessSeats'

export type DeptId =
  | 'dept-research'
  | 'dept-intake'
  | 'dept-disclosure'
  | 'dept-draft'
  | 'dept-figure'
  | 'dept-filing'
  | 'dept-oa'
  | 'dept-layout'
  | 'dept-landscape'
  | 'dept-competitor'
  | 'dept-inspire'
  | 'dept-mining'

export type DeptPeer = {
  id: string
  label: string
  kind: 'placeholder' | 'session'
  leadSeatId: ProjectExpertId
  /** kind=session 时可进独立会话的席 id */
  sessionSeatId?: ProjectExpertId
}

export type DeptDef = {
  id: DeptId
  label: string
  leadSeatId: ProjectExpertId
  peers: DeptPeer[]
  /** 不在默认 7；出现在「更多部门」 */
  optional?: boolean
}

export const DEFAULT_DEPT_COUNT = 7

/** 撰写部真副席 · 壳扩展（非 Pack 16） */
export const DRAFT_SPEC_SEAT_ID: ProjectExpertId = 'expert-draft-spec'

const PEER = (
  leadSeatId: ProjectExpertId,
  slug: string,
  label: string,
): DeptPeer => ({
  id: `peer:${leadSeatId}:${slug}`,
  label,
  kind: 'placeholder',
  leadSeatId,
})

const SESSION_PEER = (
  leadSeatId: ProjectExpertId,
  slug: string,
  label: string,
  sessionSeatId: ProjectExpertId,
): DeptPeer => ({
  id: `peer:${leadSeatId}:${slug}`,
  label,
  kind: 'session',
  leadSeatId,
  sessionSeatId,
})

export const BUSINESS_DEFAULT_DEPT_IDS: DeptDef[] = [
  {
    id: 'dept-research',
    label: '查新部',
    leadSeatId: 'expert-research',
    peers: [
      PEER('expert-research', 'query', '检索式'),
      PEER('expert-research', 'coverage', '覆盖度复核'),
      PEER('expert-research', 'novelty', '三性意见'),
    ],
  },
  {
    id: 'dept-intake',
    label: '立项部',
    leadSeatId: 'expert-intake',
    peers: [
      PEER('expert-intake', 'diff', '区别特征'),
      PEER('expert-intake', 'score', '三轴评分'),
      PEER('expert-intake', 'quote', '范围报价'),
    ],
  },
  {
    id: 'dept-disclosure',
    label: '交底部',
    leadSeatId: 'expert-disclosure',
    peers: [
      PEER('expert-disclosure', 'six', '六段采集'),
      PEER('expert-disclosure', 'ask', '缺项追问'),
      PEER('expert-disclosure', 'emb', '实施例'),
    ],
  },
  {
    id: 'dept-draft',
    label: '撰写部',
    leadSeatId: 'expert-draft',
    peers: [
      PEER('expert-draft', 'features', '特征表'),
      SESSION_PEER(
        'expert-draft',
        'spec',
        '说明书',
        DRAFT_SPEC_SEAT_ID,
      ),
      PEER('expert-draft', 'qa', '四类质检'),
    ],
  },
  {
    id: 'dept-figure',
    label: '附图部',
    leadSeatId: 'expert-figure',
    peers: [
      PEER('expert-figure', 'list', '图号清单'),
      PEER('expert-figure', 'sketch', '草图'),
      PEER('expert-figure', 'caption', '图注校对'),
    ],
  },
  {
    id: 'dept-filing',
    label: '递交部',
    leadSeatId: 'expert-filing',
    peers: [
      PEER('expert-filing', 'pack', '齐套检查'),
      PEER('expert-filing', 'form', '形式审查'),
      PEER('expert-filing', 'deadline', '期限台账'),
    ],
  },
  {
    id: 'dept-oa',
    label: '审查答复部',
    leadSeatId: 'expert-oa',
    peers: [
      PEER('expert-oa', 'classify', '理由分类'),
      PEER('expert-oa', 'inventive', '创造性子席'),
      PEER('expert-oa', 'reply', '答复起草'),
    ],
  },
]

export const LAYOUT_DEPT: DeptDef = {
  id: 'dept-layout',
  label: '布局部',
  leadSeatId: 'expert-layout',
  optional: true,
  peers: [
    PEER('expert-layout', 'cite', '引用链'),
    PEER('expert-layout', 'timing', '公开时点'),
    PEER('expert-layout', 'cover', '覆盖检查'),
  ],
}

/** 前研四部 · 挂「更多」 */
export const PREP_DEPTS: DeptDef[] = [
  {
    id: 'dept-landscape',
    label: '产业全景部',
    leadSeatId: 'expert-landscape',
    optional: true,
    peers: [
      PEER('expert-landscape', 'track', '定赛道'),
      PEER('expert-landscape', 'players', '玩家分层'),
      PEER('expert-landscape', 'blank', '空白点'),
    ],
  },
  {
    id: 'dept-competitor',
    label: '竞品情报部',
    leadSeatId: 'expert-competitor',
    optional: true,
    peers: [
      PEER('expert-competitor', 'radar', '竞对雷达'),
      PEER('expert-competitor', 'watch', '预警分级'),
    ],
  },
  {
    id: 'dept-inspire',
    label: '创新方向部',
    leadSeatId: 'expert-inspire',
    optional: true,
    peers: [
      PEER('expert-inspire', 'pool', '方向池'),
      PEER('expert-inspire', 'filter', '可专利过滤'),
    ],
  },
  {
    id: 'dept-mining',
    label: '挖掘部',
    leadSeatId: 'expert-mining',
    optional: true,
    peers: [
      PEER('expert-mining', 'seven', '挖掘七问'),
      PEER('expert-mining', 'points', '可专利点'),
    ],
  },
]

const ALL_DEPTS: DeptDef[] = [
  ...BUSINESS_DEFAULT_DEPT_IDS,
  ...PREP_DEPTS,
  LAYOUT_DEPT,
]

export function deptLabel(deptId: string): string {
  return ALL_DEPTS.find((d) => d.id === deptId)?.label ?? deptId
}

export function deptByLeadSeat(seatId: ProjectExpertId): DeptDef | undefined {
  return ALL_DEPTS.find((d) => d.leadSeatId === seatId)
}

export function peersForDept(deptId: DeptId): DeptPeer[] {
  return ALL_DEPTS.find((d) => d.id === deptId)?.peers ?? []
}

export function isPeerPlaceholder(id: string): boolean {
  const peer = ALL_DEPTS.flatMap((d) => d.peers).find((p) => p.id === id)
  if (peer) return peer.kind === 'placeholder'
  return id.startsWith('peer:')
}

export function navigablePeerSeatIds(): ProjectExpertId[] {
  return ALL_DEPTS.flatMap((d) =>
    d.peers
      .filter((p) => p.kind === 'session' && p.sessionSeatId)
      .map((p) => p.sessionSeatId!),
  )
}

export function resolveSidebarClick(id: string): {
  navigable: boolean
  leadSeatId: ProjectExpertId | null
  seatId: ProjectExpertId | null
} {
  const peer = ALL_DEPTS.flatMap((d) => d.peers).find((p) => p.id === id)
  if (peer) {
    if (peer.kind === 'session' && peer.sessionSeatId) {
      return {
        navigable: true,
        leadSeatId: peer.leadSeatId,
        seatId: peer.sessionSeatId,
      }
    }
    return {
      navigable: false,
      leadSeatId: peer.leadSeatId,
      seatId: null,
    }
  }
  const asSeat = id as ProjectExpertId
  if (
    ALL_DEPTS.some((d) => d.leadSeatId === asSeat) ||
    navigablePeerSeatIds().includes(asSeat) ||
    (BUSINESS_DEFAULT_SEAT_IDS as string[]).includes(id)
  ) {
    const lead =
      deptByLeadSeat(asSeat)?.leadSeatId ??
      ALL_DEPTS.find((d) =>
        d.peers.some((p) => p.sessionSeatId === asSeat),
      )?.leadSeatId ??
      asSeat
    return { navigable: true, leadSeatId: lead, seatId: asSeat }
  }
  return { navigable: false, leadSeatId: null, seatId: null }
}

/** 本案默认可见部门：恰 7（布局不进默认） */
export function departmentsForCase(_opts?: {
  moreSeatIds?: ProjectExpertId[]
}): DeptDef[] {
  return [...BUSINESS_DEFAULT_DEPT_IDS]
}

/** 「更多部门」：前研 + 布局（仅 moreSeatIds 已启用者） */
export function moreDepartmentsForCase(opts: {
  moreSeatIds?: ProjectExpertId[]
}): DeptDef[] {
  const more = opts.moreSeatIds ?? []
  const candidates = [...PREP_DEPTS, LAYOUT_DEPT]
  return candidates.filter((d) => more.includes(d.leadSeatId))
}

/** 部门显示名（待确认 preparedBy） */
export function deptLabelForLead(seatId: ProjectExpertId): string {
  return deptByLeadSeat(seatId)?.label ?? seatId
}

const STAGE_LEAD_SEATS: Record<BusinessStageId, ProjectExpertId[]> = {
  prepare: [],
  intake: ['expert-intake'],
  drafting: [
    'expert-disclosure',
    'expert-research',
    'expert-draft',
    'expert-figure',
  ],
  filing: ['expert-filing'],
  oa: ['expert-oa'],
}

const STAGE_RECOMMEND_BLURB: Record<BusinessStageId, string> = {
  prepare: '准备阶段先拉查新对齐方向；组队讨论不产闸。',
  intake: '立项要对齐查新结论与立项；上下游各带一人便于口径一致。',
  drafting: '撰写申请需交底、权要、附图同场；上下游各带一人防术语漂移。',
  filing: '递交前对齐递交与相邻撰写、附图口径。',
  oa: '答复策略需审查答复主导，并带上下游对照权要和递交材料。',
}

/**
 * 按阶段推荐讨论班底：当前阶段席 + 相邻上下游各一（去重）
 */
export function recommendTeamForStage(
  stageId: BusinessStageId,
): ProjectExpertId[] {
  const chain = BUSINESS_DEFAULT_SEAT_IDS
  const leads = STAGE_LEAD_SEATS[stageId] ?? []
  if (leads.length === 0) {
    return [chain[0]!]
  }
  const indices = leads
    .map((id) => chain.indexOf(id))
    .filter((i) => i >= 0)
  const min = Math.min(...indices)
  const max = Math.max(...indices)
  const start = Math.max(0, min - 1)
  const end = Math.min(chain.length - 1, max + 1)
  return chain.slice(start, end + 1)
}

export type TeamRecommendPlan = {
  stageId: BusinessStageId
  ids: ProjectExpertId[]
  /** 整体为何组这班 */
  blurb: string
  /** 每人一句推荐理由 */
  reasons: { seatId: ProjectExpertId; reason: string }[]
  /** 相对当前勾选还缺谁 */
  missingIds: ProjectExpertId[]
}

/** 组队规划：推荐名单 + 理由 + 相对当前缺人 */
export function buildTeamRecommendPlan(
  stageId: BusinessStageId,
  currentIds: ProjectExpertId[] = [],
): TeamRecommendPlan {
  const ids = recommendTeamForStage(stageId)
  const current = new Set(currentIds)
  const core = new Set(STAGE_LEAD_SEATS[stageId] ?? [])
  const reasons = ids.map((seatId) => {
    const role = core.has(seatId)
      ? '本阶段要办'
      : '相邻节点（防口径冲突）'
    return {
      seatId,
      reason: `${businessSeatLabel(seatId)} · ${role}`,
    }
  })
  return {
    stageId,
    ids,
    blurb: STAGE_RECOMMEND_BLURB[stageId],
    reasons,
    missingIds: ids.filter((id) => !current.has(id)),
  }
}

/** 拖拽入托盘：接受节点席，以及节点内能聊的专家（如说明书）。占位流程位不收。 */
export function applyTeamDrop(
  current: ProjectExpertId[],
  payload: string,
): ProjectExpertId[] {
  if (payload.startsWith('peer:')) return [...current]
  const id = payload as ProjectExpertId
  const known =
    ALL_DEPTS.some((d) => d.leadSeatId === id) ||
    navigablePeerSeatIds().includes(id) ||
    (BUSINESS_DEFAULT_SEAT_IDS as string[]).includes(id)
  if (!known) return [...current]
  if (current.includes(id)) return [...current]
  return [...current, id]
}
