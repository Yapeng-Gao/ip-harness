/**
 * 交卷态呈现 · vision §3.1a / pages §2·§4.3（ae0782a G1–G3）
 * 只把已有 DeptStatus / 确认态映成用户可读口径；不推进、不写 done / pending。
 * 须能读出：齐套中 / 待确认 / 已确认可往下；驳回可标回流；采纳≠确认。
 */
import type { OrgDeptId } from './orgDepts'
import type { DeptStatus } from './deptProgress'
import { DEPT_HANDOFF } from './deptPageNarrative'

export type HandoffPhase =
  | '齐套中'
  | '待确认'
  | '已确认可往下'
  | '未到'
  | '退回'
  | '锁定'

export function handoffPhaseFromStatus(status: DeptStatus): HandoffPhase {
  switch (status) {
    case '待确认':
      return '待确认'
    case '已完成':
      return '已确认可往下'
    case '退回':
      return '退回'
    case '锁定':
      return '锁定'
    case '未到':
      return '未到'
    case '进行中':
    default:
      return '齐套中'
  }
}

/** 短标签（卡角 / 点旁 / 齐套徽标） */
export function handoffPhaseLabel(phase: HandoffPhase): string {
  switch (phase) {
    case '齐套中':
      return '齐套中'
    case '待确认':
      return '待确认 · 未拍板'
    case '已确认可往下':
      return '已确认可往下'
    case '退回':
      // G3：驳回 → 回流当前部补齐（可标回流）
      return '已驳回 · 回流补齐'
    case '锁定':
      return '未解锁'
    case '未到':
      return '未到'
  }
}

/** 公司首页抽屉 / 钉栏：交卷物 + 交卷态一句 */
export function handoffStatusSentence(
  deptId: OrgDeptId,
  status: DeptStatus,
): string {
  const deliverable = DEPT_HANDOFF[deptId]?.deliverable ?? '本站交卷物待配置'
  const phase = handoffPhaseFromStatus(status)
  return `${deliverable} · ${handoffPhaseLabel(phase)}`
}

/**
 * G3 叙事：从壳侧 pending 取最近一条驳回意见（只读展示，不推进）。
 * kind 对齐 confirmKindOf(dept)。
 */
export function latestReturnNote(
  pending: readonly {
    kind: string
    status: string
    returnNote?: string
  }[],
  kind: string | null | undefined,
): string | null {
  if (!kind) return null
  const hit = pending.find(
    (p) => p.kind === kind && p.status === 'returned' && !!p.returnNote?.trim(),
  )
  return hit?.returnNote?.trim() || null
}

/** 钉栏脚注：建议稿可采纳 ≠ 确认（G2） */
export const ADOPT_NE_CONFIRM_NOTE =
  '建议稿可采纳 ≠ 确认；确认权在人（发明人 / 代理人 / 企业负责人等）'

export const ADOPT_CTA_LABEL = '采纳建议稿'
export const ADOPT_CTA_DONE_LABEL = '已采纳建议（≠确认）'
