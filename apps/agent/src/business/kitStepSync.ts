/**
 * 齐套 checklist ↔ 席内步进 / 排期章 更深对齐（样机；非官报）
 * Office：办几步勾几项；末项（决议/权属等）留给交卷前手勾或样机勾齐。
 */
import { DEPT_HANDOFF } from '../departments/deptPageNarrative'
import {
  deptIdFromSlug,
  type OrgDeptId,
} from '../departments/orgDepts'
import {
  evaluateKitChecklist,
  kitLabelsForDeptSlug,
  resolveKitChecklist,
  type KitDoneByDept,
} from './kitChecklistGate'
import type { ChecklistItem } from './confirmGate'

export const KIT_STEP_SYNC_HONEST =
  '齐套随席步进联动 · 样机示意 · 非真官报 / 非一键交卷'

/** 部默认「末项暂留」——交卷前手勾 */
export function kitHoldLabelsForDeptSlug(deptSlug: string): string[] {
  const id = deptIdFromSlug(deptSlug)
  if (!id) {
    const labels = kitLabelsForDeptSlug(deptSlug)
    return labels.length ? [labels[labels.length - 1]!] : []
  }
  const handoff = DEPT_HANDOFF[id as OrgDeptId]
  if (handoff?.demoGap) return [handoff.demoGap]
  const labels = kitLabelsForDeptSlug(deptSlug)
  return labels.length ? [labels[labels.length - 1]!] : []
}

/**
 * 按席步进建议已勾标签（不含 hold；不撤销已有勾选）。
 * stepIndex = 当前所在步（0-based）；stepCount = 总步数。
 * 完成度 ≈ stepIndex / max(stepCount-1,1)；未到最后一步时不上满可勾项。
 */
export function suggestKitDoneFromStep(input: {
  labels: readonly string[]
  stepIndex: number
  stepCount: number
  holdLabels?: readonly string[]
}): string[] {
  const labels = [...input.labels]
  if (labels.length === 0) return []
  const hold = new Set(input.holdLabels ?? [])
  const fillable = labels.filter((l) => !hold.has(l))
  const steps = Math.max(input.stepCount, 1)
  const idx = Math.max(0, Math.min(input.stepIndex, steps - 1))
  // 起点 0 → 0；走到最后一步 → 可勾项全满（hold 仍留）
  const denom = Math.max(steps - 1, 1)
  const ratio = steps === 1 ? (idx >= 0 ? 1 : 0) : idx / denom
  const n = Math.min(fillable.length, Math.floor(ratio * fillable.length + 1e-9))
  // 至少：stepIndex>0 时勾 1 项（若有 fillable）
  const count =
    idx <= 0 ? 0 : Math.max(n, fillable.length ? 1 : 0)
  const capped =
    idx >= steps - 1 ? fillable.length : Math.min(count, fillable.length)
  return fillable.slice(0, capped)
}

/** 合并：步进建议 ∪ 已有勾选（单调增；不自动勾 hold） */
export function mergeKitDoneWithStep(input: {
  labels: readonly string[]
  prevDone: readonly string[] | undefined
  stepIndex: number
  stepCount: number
  holdLabels?: readonly string[]
}): string[] {
  const hold = new Set(input.holdLabels ?? [])
  const suggested = suggestKitDoneFromStep({
    labels: input.labels,
    stepIndex: input.stepIndex,
    stepCount: input.stepCount,
    holdLabels: input.holdLabels,
  })
  const set = new Set<string>()
  for (const l of input.prevDone ?? []) {
    if (input.labels.includes(l)) set.add(l)
  }
  for (const l of suggested) {
    if (!hold.has(l)) set.add(l)
  }
  // 稳定顺序按 labels
  return input.labels.filter((l) => set.has(l))
}

export type KitProgressMeta = {
  done: number
  total: number
  phase: 'empty' | 'partial' | 'complete'
  /** 短标：0/5 · 齐套中 2/5 · 齐套已齐 */
  short: string
  missing: string[]
}

export function kitProgressMeta(
  items: readonly ChecklistItem[],
): KitProgressMeta {
  const total = items.length
  const done = items.filter((x) => x.done).length
  const ev = evaluateKitChecklist(items)
  const missing = ev.ok ? [] : ev.missing
  if (total === 0 || (done === 0 && missing.length === total)) {
    return {
      done,
      total,
      phase: done === total && total > 0 ? 'complete' : 'empty',
      short: total === 0 ? '—' : done === total ? '齐套已齐' : `0/${total}`,
      missing,
    }
  }
  if (ev.ok) {
    return {
      done,
      total,
      phase: 'complete',
      short: '齐套已齐',
      missing: [],
    }
  }
  return {
    done,
    total,
    phase: 'partial',
    short: `齐套中 ${done}/${total}`,
    missing,
  }
}

/** 排期某章的齐套进度（读 progress.kitDoneByDept） */
export function kitProgressForPlanStep(input: {
  deptSlug: string
  kitDoneByDept: KitDoneByDept | undefined
}): KitProgressMeta {
  const labels = kitLabelsForDeptSlug(input.deptSlug)
  const doneLabels = input.kitDoneByDept?.[input.deptSlug]
  const items = resolveKitChecklist({
    labels,
    doneLabels,
    kitTouched: doneLabels !== undefined,
  })
  return kitProgressMeta(items)
}

/** 回退步进时：收束到建议集 ∪ 仍合法的 hold 手勾 */
export function shrinkKitDoneToStep(input: {
  labels: readonly string[]
  prevDone: readonly string[] | undefined
  stepIndex: number
  stepCount: number
  holdLabels?: readonly string[]
}): string[] {
  const suggested = new Set(
    suggestKitDoneFromStep({
      labels: input.labels,
      stepIndex: input.stepIndex,
      stepCount: input.stepCount,
      holdLabels: input.holdLabels,
    }),
  )
  const hold = new Set(input.holdLabels ?? [])
  const next: string[] = []
  for (const l of input.labels) {
    const prev = (input.prevDone ?? []).includes(l)
    if (suggested.has(l)) next.push(l)
    else if (prev && hold.has(l)) next.push(l) // 手勾末项保留
  }
  return next
}
