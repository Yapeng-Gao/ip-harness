/**
 * 办完闸 ↔ 齐套 checklist 逐项（G1 · 样机；非官报）
 * 缺项不可装已交卷/办完；Office：勾齐本稿要点再交卷。
 */
import {
  canSubmitDeliverable,
  missingChecklistLabels,
  type ChecklistItem,
} from './confirmGate'
import { DEPT_HANDOFF } from '../departments/deptPageNarrative'
import {
  deptIdFromSlug,
  orgDeptById,
  type OrgDeptId,
} from '../departments/orgDepts'

export const KIT_CHECKLIST_HONEST =
  '齐套逐项联办完闸 · 样机示意 · 非真官报 / 非一键全绿'

/** progress 上：deptSlug → 已勾标签 */
export type KitDoneByDept = Record<string, string[]>

/** 部默认齐套标签（与 DEPT_HANDOFF / 席占位对齐） */
export function kitLabelsForDeptSlug(deptSlug: string): string[] {
  const id = deptIdFromSlug(deptSlug)
  if (!id) return ['关键产出已起草', '缺项已清或已说明', '可送确认']
  const known = DEPT_HANDOFF[id as OrgDeptId]
  if (known?.checklist?.length) return [...known.checklist]
  return ['关键产出已起草', '缺项已清或已说明', '可送确认']
}

export function kitLabelsForDeptId(deptId: OrgDeptId): string[] {
  const known = DEPT_HANDOFF[deptId]
  if (known?.checklist?.length) return [...known.checklist]
  return ['关键产出已起草', '缺项已清或已说明', '可送确认']
}

/**
 * 合并持久勾选与启发式：
 * - 若该部已有 kit 记录（含空数组）→ 以记录为准
 * - 否则回落 heuristicDone（旧席步进）
 */
export function resolveKitChecklist(input: {
  labels: readonly string[]
  doneLabels: readonly string[] | undefined
  /** 无持久记录时的回落 */
  heuristicDone?: (label: string, index: number) => boolean
  /** 该部是否已写过 kit（区分「未写」与「全未勾」） */
  kitTouched?: boolean
}): ChecklistItem[] {
  const touched =
    input.kitTouched === true || input.doneLabels !== undefined
  return input.labels.map((label, i) => {
    if (touched) {
      return {
        label,
        done: (input.doneLabels ?? []).includes(label),
      }
    }
    const h = input.heuristicDone?.(label, i) ?? false
    return { label, done: h }
  })
}

export type KitGateResult =
  | { ok: true; items: ChecklistItem[] }
  | {
      ok: false
      items: ChecklistItem[]
      missing: string[]
      hint: string
    }

/** 齐套是否放行交卷/办完前置 */
export function evaluateKitChecklist(
  items: readonly ChecklistItem[],
): KitGateResult {
  const list = items.map((x) => ({ ...x }))
  if (canSubmitDeliverable(list)) {
    return { ok: true, items: list }
  }
  const missing = missingChecklistLabels(list)
  return {
    ok: false,
    items: list,
    missing,
    hint: missing.length
      ? `本稿齐套未齐 · 缺：${missing.join('、')}（勾齐后再交卷/办完）`
      : '本稿齐套未齐 · 请先勾齐要点',
  }
}

/** 切换某一标签；返回新的 doneLabels */
export function toggleKitDoneLabel(
  doneLabels: readonly string[] | undefined,
  label: string,
  force?: boolean,
): string[] {
  const set = new Set(doneLabels ?? [])
  const next = force ?? !set.has(label)
  if (next) set.add(label)
  else set.delete(label)
  return [...set]
}

/** 样机：全部勾上 */
export function seedAllKitDone(labels: readonly string[]): string[] {
  return [...labels]
}

export function kitDeptDisplayName(deptSlug: string): string {
  const id = deptIdFromSlug(deptSlug)
  if (!id) return '本章'
  return orgDeptById(id)?.label ?? '本章'
}
