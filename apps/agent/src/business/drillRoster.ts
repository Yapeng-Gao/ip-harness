/**
 * 演练全队（二期旁路）· 总控 + 14 owner · 非冷启动默认
 * 侧栏按节点簇展示（主链/前研/其他）
 */
import type { ProjectExpertId } from '../projects/types'
import { BUSINESS_ASSISTANT_ID, businessSeatLabel } from './businessSeats'
import {
  BUSINESS_DEFAULT_DEPT_IDS,
  LAYOUT_DEPT,
  PREP_DEPTS,
  type DeptDef,
} from './deptRoster'

export const DRILL_ORCH_ID: ProjectExpertId = BUSINESS_ASSISTANT_ID

export type DrillCluster = {
  id: string
  title: string
  seatIds: ProjectExpertId[]
}

/** 14 owner 分三簇 · 不含总控（权威扁平表，分派仍用） */
export const DRILL_CLUSTERS: DrillCluster[] = [
  {
    id: 'main',
    title: '主链',
    seatIds: [
      'expert-intake',
      'expert-disclosure',
      'expert-research',
      'expert-draft',
      'expert-figure',
      'expert-filing',
      'expert-oa',
    ],
  },
  {
    id: 'prep',
    title: '前研',
    seatIds: [
      'expert-landscape',
      'expert-inspire',
      'expert-competitor',
      'expert-mining',
    ],
  },
  {
    id: 'aux',
    title: '其他',
    seatIds: ['expert-layout', 'expert-fto', 'expert-enforcement'],
  },
]

export type DrillDeptSection = {
  id: string
  title: string
  depts: DeptDef[]
  /** 无部门壳的辅席（FTO / 维权） */
  extraSeatIds: ProjectExpertId[]
}

/** 演练侧栏部门树数据 */
export function drillDeptSections(): DrillDeptSection[] {
  return [
    {
      id: 'main',
      title: '主链',
      depts: BUSINESS_DEFAULT_DEPT_IDS,
      extraSeatIds: [],
    },
    {
      id: 'prep',
      title: '前研',
      depts: PREP_DEPTS,
      extraSeatIds: [],
    },
    {
      id: 'aux',
      title: '其他',
      depts: [LAYOUT_DEPT],
      extraSeatIds: ['expert-fto', 'expert-enforcement'],
    },
  ]
}

/** 扁平 14 席 */
export const DRILL_OWNER_IDS: ProjectExpertId[] = DRILL_CLUSTERS.flatMap(
  (c) => c.seatIds,
)

export function isDrillOwner(id: ProjectExpertId): boolean {
  return DRILL_OWNER_IDS.includes(id)
}

export function drillSeatLabel(id: ProjectExpertId): string {
  if (id === DRILL_ORCH_ID) return '总控'
  return businessSeatLabel(id)
}

/** 演练侧栏：总控置顶 + 分簇 */
export function drillSidebarSections(): {
  orchId: ProjectExpertId
  clusters: DrillCluster[]
} {
  return { orchId: DRILL_ORCH_ID, clusters: DRILL_CLUSTERS }
}

/** 样机分派默认话术 */
export function drillDispatchBrief(toSeat: ProjectExpertId): string {
  const name = drillSeatLabel(toSeat)
  return `请「${name}」按本案目标开干；交卷须成果+办理过程双文件，回报总控。`
}

export function assertDrillRosterSize(): {
  owners: number
  withOrch: number
} {
  return {
    owners: DRILL_OWNER_IDS.length,
    withOrch: DRILL_OWNER_IDS.length + 1,
  }
}
