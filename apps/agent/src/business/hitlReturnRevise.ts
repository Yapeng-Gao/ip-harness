/**
 * HITL 退回后 · 按意见改一版（样机）
 * 退回 ≠ 自动过闸；= 解锁席 + 会话改稿示意，再交卷才重新 pending
 */
import type { ProjectExpertId } from '../projects/types'
import type { BusinessConfirmKind } from './businessSeats'
import { businessSeatLabel } from './businessSeats'

export type HitlReviseScript = {
  seatId: ProjectExpertId
  lines: string[]
  /** 回退到该步再改（交卷步前一格；仅 1 步则 0） */
  rewindToIndex: (stepCount: number) => number
}

/** 按退回意见生成改稿会话（样机确定性） */
export function buildHitlReviseScript(
  _kind: BusinessConfirmKind,
  seatId: ProjectExpertId,
  note: string,
): HitlReviseScript {
  const seat = businessSeatLabel(seatId)
  const noteShort = note.trim().slice(0, 80) || '请按意见修改'
  return {
    seatId,
    rewindToIndex: (stepCount) =>
      stepCount <= 1 ? 0 : Math.max(0, stepCount - 2),
    lines: [
      `【审校退回】${noteShort}`,
      `【${seat}】已收到退回意见，开始按批注改一版（样机）。`,
      `【${seat}】改稿要点：对照「${noteShort}」补强缺口；成果/过程将随下一步更新。`,
      `【${seat}】本版改完。请再点「交卷请确认」提请确认（不会自动过闸）。`,
    ],
  }
}

export function hitlReviseChipLabel(kind: BusinessConfirmKind): string {
  if (kind === 'research_ready') return '按退回意见再查一轮'
  if (kind === 'oa_strategy') return '按退回意见重做策略'
  if (kind === 'layout_adjust') return '按退回意见调布局'
  return '按退回意见改一版'
}
