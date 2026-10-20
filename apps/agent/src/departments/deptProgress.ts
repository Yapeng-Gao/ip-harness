import type { AgentProject, ProjectExpertId } from '../projects/types'
import {
  CONFIRM_KIND_LABEL,
  type BusinessConfirmKind,
  type BusinessStageId,
} from '../business/businessSeats'
import type { CaseProgress } from '../business/BusinessCaseContext'
import { ORG_DEPTS, type OrgDept, type OrgDeptId } from './orgDepts'

/**
 * 部门进度投影 · 纯函数
 * 把 BusinessCaseContext 的 CaseProgress 投影成部门卡需要的状态。
 * 不新增真相：全部读既有证据（doneSeatIds / stageId / pending confirm）。
 */

export type DeptStatus =
  | '未到'
  | '进行中'
  | '待确认'
  | '已完成'
  | '退回'
  | '锁定'

export type PendingLike = {
  caseId: string
  kind: BusinessConfirmKind
  status: 'pending' | 'confirmed' | 'returned'
}

const STAGE_ORDER: BusinessStageId[] = [
  'prepare',
  'intake',
  'drafting',
  'filing',
  'oa',
]

const DEPT_STAGE: Partial<Record<OrgDeptId, BusinessStageId>> = {
  'dept-layout': 'prepare',
  'dept-intake': 'intake',
  'dept-research': 'intake',
  'dept-disclosure': 'drafting',
  'dept-draft': 'drafting',
  'dept-figure': 'drafting',
  'dept-filing': 'filing',
  'dept-oa': 'oa',
}

const DEPT_CONFIRM_KIND: Partial<Record<OrgDeptId, BusinessConfirmKind>> = {
  'dept-layout': 'layout_adjust',
  'dept-intake': 'go_nogo',
  'dept-disclosure': 'disclosure_ready',
  'dept-research': 'research_ready',
  'dept-draft': 'claims_ready',
  'dept-figure': 'figures_ready',
  'dept-filing': 'file_authorize',
  'dept-oa': 'oa_strategy',
}

export function stageForDept(deptId: OrgDeptId): BusinessStageId | null {
  return DEPT_STAGE[deptId] ?? null
}

export function confirmKindOf(dept: OrgDept): BusinessConfirmKind | null {
  return DEPT_CONFIRM_KIND[dept.id] ?? null
}

export function confirmLabelOf(dept: OrgDept): string {
  const kind = confirmKindOf(dept)
  return kind ? CONFIRM_KIND_LABEL[kind] : ''
}

/**
 * 单个部门在某案上的状态。
 * 优先级：待确认 > 退回 > 已完成 > 锁定 > 未到 > 进行中。
 */
export function deptStatus(args: {
  dept: OrgDept
  progress: CaseProgress
  pending: PendingLike[]
  confirmKind: BusinessConfirmKind | null
}): DeptStatus {
  const { dept, progress, pending, confirmKind } = args

  if (confirmKind) {
    const mine = pending.filter(
      (p) => p.caseId === progress.caseId && p.kind === confirmKind,
    )
    if (mine.some((p) => p.status === 'pending')) return '待确认'
    if (mine.some((p) => p.status === 'returned')) return '退回'
  }

  if (progress.doneSeatIds.includes(dept.leadSeatId)) return '已完成'

  // 授权后的年费 / 转化 / 维权在递交前锁定
  if (dept.group === 'post' && !progress.filed) return '锁定'

  const deptStage = stageForDept(dept.id)
  if (deptStage) {
    const curIdx = STAGE_ORDER.indexOf(progress.stageId)
    const deptIdx = STAGE_ORDER.indexOf(deptStage)
    if (deptIdx > curIdx) return '未到'
  } else {
    // 前研 / 授权后不占主链阶段：没有证据时只能是「未到」，
    // 不能因为主链在跑就显示「进行中」
    return '未到'
  }

  return '进行中'
}

export type DeptRollup = {
  deptId: OrgDeptId
  label: string
  /** 有该部门活动的案数 */
  caseCount: number
  pendingCount: number
  doneCount: number
  activeCount: number
}

/**
 * 全库汇总：每个部门被多少个案占用、多少待确认。
 * 用于部门卡的角标与「项目看板」。
 */
export function rollupByDept(args: {
  cases: AgentProject[]
  getProgress: (caseId: string) => CaseProgress
  pending: PendingLike[]
}): Record<string, DeptRollup> {
  const { cases, getProgress, pending } = args
  const out: Record<string, DeptRollup> = {}

  for (const dept of ORG_DEPTS) {
    const kind = confirmKindOf(dept)
    const row: DeptRollup = {
      deptId: dept.id,
      label: dept.label,
      caseCount: 0,
      pendingCount: 0,
      doneCount: 0,
      activeCount: 0,
    }
    for (const c of cases) {
      const progress = getProgress(c.id)
      const mine = kind
        ? pending.filter((p) => p.caseId === c.id && p.kind === kind)
        : []
      const status = deptStatus({ dept, progress, pending: mine, confirmKind: kind })
      if (status !== '未到' && status !== '锁定') row.caseCount += 1
      if (status === '已完成') row.doneCount += 1
      if (status === '进行中') row.activeCount += 1
      row.pendingCount += mine.filter((p) => p.status === 'pending').length
    }
    out[dept.id] = row
  }
  return out
}

/** 部门「当前最需要人看的一件事」，用于卡片副标题 */
export function deptHeadline(
  dept: OrgDept,
  rollup: DeptRollup | undefined,
): string {
  if (!rollup) return dept.blurb
  if (rollup.pendingCount > 0) return `${rollup.pendingCount} 项待确认`
  if (rollup.activeCount > 0) return `${rollup.activeCount} 个案子进行中`
  if (rollup.doneCount > 0) return `已完成 ${rollup.doneCount} 项`
  return dept.blurb
}

/** 部门内专家行：主责 + 副席 */
export type DeptExpertRow = {
  id: string
  seatId: ProjectExpertId | null
  label: string
  isLead: boolean
  navigable: boolean
  note: string
}

export function deptExpertRows(
  dept: OrgDept,
  leadName: string,
): DeptExpertRow[] {
  const rows: DeptExpertRow[] = [
    {
      id: dept.leadSeatId,
      seatId: dept.leadSeatId,
      label: leadName,
      isLead: true,
      navigable: true,
      note: '主责 · 交卷',
    },
  ]
  for (const p of dept.peers) {
    const navigable = p.kind === 'session' && !!p.sessionSeatId
    rows.push({
      id: p.id,
      seatId: navigable ? p.sessionSeatId! : null,
      label: p.label,
      isLead: false,
      navigable,
      note: navigable ? '可单独开会话' : '流程位 · 暂不可聊',
    })
  }
  return rows
}
