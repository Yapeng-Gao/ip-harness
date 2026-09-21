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
    note: 'F3 · layout_plan Confirm',
  },
  {
    n: 2,
    label: '立项',
    seatId: 'expert-intake',
    gate: 'go_nogo',
    note: 'F4 · intake_quote + go_nogo',
  },
  {
    n: 3,
    label: '交底确认',
    seatId: 'expert-disclosure',
    gate: 'approve_strategy',
    note: 'F5 · disclosure_pack',
  },
  {
    n: 4,
    label: '查新结论',
    seatId: 'expert-research',
    gate: 'approve_strategy',
    note: 'F5 · research_report',
  },
  {
    n: 5,
    label: '权项确认',
    seatId: 'expert-draft',
    gate: 'approve_strategy',
    note: 'F5 · draft_claims',
  },
  {
    n: 6,
    label: 'OA 策略',
    seatId: 'expert-oa',
    gate: 'approve_strategy',
    note: 'F6 · prosecution_response · 仅已 file',
  },
  {
    n: 7,
    label: '年费/放弃',
    seatId: 'expert-annuity',
    gate: 'pay_unlock',
    phase: true,
    note: 'F7 后置可跑 · maintain_annuity 心智',
  },
  {
    n: 8,
    label: '交易签约',
    seatId: 'expert-monetize',
    gate: 'confirm_quote',
    phase: true,
    note: 'F8 后置可跑 · monetize_terms 心智',
  },
]

export type PackHitlStatus = 'pending' | 'ready' | 'cleared' | 'phase_locked'

export function packHitlForSeat(
  seatId: ProjectExpertId,
): PackHitlGate | undefined {
  return PACK_HITL8.find((g) => g.seatId === seatId)
}
