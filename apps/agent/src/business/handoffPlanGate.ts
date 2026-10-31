/**
 * 办完 ↔ 交卷硬闸对齐（样机；非官报）
 * 「本章办完」须本稿已交卷并拍板通过；待拍/未交不可翻下一节。
 * Office 语感：本稿、交卷、拍板、办完本章。
 */
import type { BusinessConfirmKind } from './businessSeats'
import { confirmKindForSeat } from './businessSeats'
import {
  deptIdFromSlug,
  orgDeptById,
} from '../departments/orgDepts'

export type HandoffConfirmLike = {
  kind: BusinessConfirmKind
  status: 'pending' | 'confirmed' | 'returned'
}

export type PlanAdvanceGate =
  | {
      allow: true
      code: 'confirmed' | 'no_hitl_kind'
      /** 按钮旁短注 */
      hint: string
    }
  | {
      allow: false
      code: 'no_submit' | 'awaiting_confirm'
      hint: string
      /** 主 CTA：去交卷 / 去拍板 */
      cta: 'go_chapter' | 'go_confirm'
    }

/** 排期章 slug → 该部交卷 kind（无闸席 null） */
export function confirmKindForPlanSlug(
  deptSlug: string,
): BusinessConfirmKind | null {
  const id = deptIdFromSlug(deptSlug)
  if (!id) return null
  const dept = orgDeptById(id)
  if (!dept) return null
  return confirmKindForSeat(dept.leadSeatId)
}

/**
 * 本章办完是否放行：
 * - 无交卷闸的章 → 放行（样机）
 * - 已有 confirmed → 放行
 * - 仅 pending → 挡：待拍板
 * - 否则 → 挡：未交卷
 */
export function planAdvanceHandoffGate(input: {
  activeDeptSlug: string
  confirms: readonly HandoffConfirmLike[]
}): PlanAdvanceGate {
  const kind = confirmKindForPlanSlug(input.activeDeptSlug)
  if (!kind) {
    return {
      allow: true,
      code: 'no_hitl_kind',
      hint: '本章无交卷闸 · 可办完（样机示意）',
    }
  }
  const forKind = input.confirms.filter((c) => c.kind === kind)
  if (forKind.some((c) => c.status === 'confirmed')) {
    return {
      allow: true,
      code: 'confirmed',
      hint: '本稿已通过 · 可办完本章',
    }
  }
  if (forKind.some((c) => c.status === 'pending')) {
    return {
      allow: false,
      code: 'awaiting_confirm',
      hint: '本稿已交 · 待你拍板 · 通过后自动办完本章',
      cta: 'go_confirm',
    }
  }
  return {
    allow: false,
    code: 'no_submit',
    hint: '本稿未交卷 · 先去本章交卷，拍板后才算办完',
    cta: 'go_chapter',
  }
}

export const HANDOFF_PLAN_GATE_HONEST =
  '办完对齐交卷闸 · 样机示意 · 非真官报 / 非真递交'
