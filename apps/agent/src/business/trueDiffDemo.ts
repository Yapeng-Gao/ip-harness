/**
 * 真 diff 示意 · seed 左右对照（非真官报 / 非真检索 / 非专业 diff 引擎）
 */
import { lineDiff, diffStats, type DiffLine } from './lineDiff'

export const TRUE_DIFF_HONEST_LABEL =
  '样机示意 · 非真官报 · 非真检索 · 非专业 diff 引擎'

/** 交底部权要/技术要点 seed：当前稿 vs 对照版 */
export const SEED_DIFF_LEFT = [
  '## 技术要点（当前稿）',
  '1. 边缘散热采用微通道冷板',
  '2. 工质为水醇混合液',
  '3. 目标温升 ≤ 12K',
  '4. 接口沿用既有快插',
].join('\n')

export const SEED_DIFF_RIGHT = [
  '## 技术要点（对照版 · 示意）',
  '1. 边缘散热采用微通道冷板与均热层',
  '2. 工质为介电冷却液（非水醇）',
  '3. 目标温升 ≤ 8K（苛刻工况）',
  '4. 接口改密封法兰',
  '5. 新增：泄漏自检回路',
].join('\n')

export type SideBySideRow = {
  kind: 'same' | 'del' | 'add'
  left: string | null
  right: string | null
  oldNo?: number
  newNo?: number
}

/** 将 unified DiffLine 展成左右栏行（删在左、增在右、同在两侧） */
export function sideBySideRows(lines: DiffLine[]): SideBySideRow[] {
  return lines.map((l) => {
    if (l.type === 'same') {
      return {
        kind: 'same',
        left: l.text,
        right: l.text,
        oldNo: l.oldNo,
        newNo: l.newNo,
      }
    }
    if (l.type === 'del') {
      return {
        kind: 'del',
        left: l.text,
        right: null,
        oldNo: l.oldNo,
      }
    }
    return {
      kind: 'add',
      left: null,
      right: l.text,
      newNo: l.newNo,
    }
  })
}

export function buildTrueDiff(left: string, right: string) {
  const lines = lineDiff(left, right)
  const stats = diffStats(lines)
  const rows = sideBySideRows(lines)
  return { lines, stats, rows }
}

export function seedTrueDiff() {
  return buildTrueDiff(SEED_DIFF_LEFT, SEED_DIFF_RIGHT)
}
