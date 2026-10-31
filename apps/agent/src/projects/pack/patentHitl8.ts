/**
 * Pack HITL×8 — patent-pack-design §1
 * Maps to shell HitlGateId without changing packages.
 */
import type { HitlGateId } from '@ip/domain'
import type { ProjectExpertId } from '../types'

export type PackHitlGate = {
  n: 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8
  label: string
  seatId: ProjectExpertId
  /** Shell gate Confirm wires to */
  gate: HitlGateId
  phase?: boolean
  note: string
}

/** Authoritative Pack order: ①布局 … ⑧交易 */
export const PACK_HITL8: PackHitlGate[] = [
  {
    n: 1,
    label: '布局拍板',
    seatId: 'expert-layout',
    gate: 'approve_strategy',
    note: '布局方案确认（样机）',
  },
  {
    n: 2,
    label: '立项',
    seatId: 'expert-intake',
    gate: 'go_nogo',
    note: '立项报价 + 立不立项（样机）',
  },
  {
    n: 3,
    label: '交底确认',
    seatId: 'expert-disclosure',
    gate: 'approve_strategy',
    note: '交底齐套确认（样机）',
  },
  {
    n: 4,
    label: '查新结论',
    seatId: 'expert-research',
    gate: 'approve_strategy',
    note: '查新结论确认（样机）',
  },
  {
    n: 5,
    label: '权项确认',
    seatId: 'expert-draft',
    gate: 'approve_strategy',
    note: '权项确认（样机）',
  },
  {
    n: 6,
    label: 'OA 策略',
    seatId: 'expert-oa',
    gate: 'approve_strategy',
    note: '审查答复策略 · 仅已递交后（样机）',
  },
  {
    n: 7,
    label: '年费/放弃',
    seatId: 'expert-annuity',
    gate: 'pay_unlock',
    phase: true,
    note: '年费/放弃后置可跑（样机）',
  },
  {
    n: 8,
    label: '交易签约',
    seatId: 'expert-monetize',
    gate: 'confirm_quote',
    phase: true,
    note: '交易签约后置可跑（样机）',
  },
]

export type PackHitlStatus = 'pending' | 'ready' | 'cleared' | 'phase_locked'

export function packHitlForSeat(
  seatId: ProjectExpertId,
): PackHitlGate | undefined {
  return PACK_HITL8.find((g) => g.seatId === seatId)
}
