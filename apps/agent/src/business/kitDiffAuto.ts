/**
 * 齐套 checklist ↔ 正文 diff / 材料树自动勾（样机；非官报）
 * Office：改了章节 / 看了差分 / 点了本稿零件 → 勾上对应齐套项；
 * 空稿如实收束；hold/demoGap 默认不自动满勾，除非正文或零件明确对应。
 */
import { parsePartMaterialId } from './auxPartBodyLink'
import { kitHoldLabelsForDeptSlug } from './kitStepSync'
import { seedTrueDiff } from './trueDiffDemo'

export const KIT_DIFF_AUTO_HONEST =
  '齐套随正文·差分·材料树联动 · 样机示意 · 非真官报'

/** 零件 id → 齐套标签关键词（子串匹配） */
const PART_KIT_HINTS: Record<string, string[]> = {
  'six-sec': ['技术交底正文', '交底'],
  ownership: ['权属声明', '权属'],
  embod: ['附图说明', '实施例', '技术交底正文'],
  'dir-brief': ['评分卡汇总'],
  'quote-outline': ['报价'],
  claims: ['权项树', '权项'],
  spec: ['说明书骨架', '说明书', '实施例'],
  abs: ['摘要'],
  'fig-pack': ['图1', '图2', '简要说明', '图号核对'],
  'file-pack': ['格式检查', '授权人确认'],
  'oa-strategy': ['争点策略', '会议纪要'],
  'oa-amend': ['改稿范围', '权项树'],
  'spark-list': ['技术交底正文', '评分卡汇总'],
  'blank-map': ['检索式', '对比文件'],
  'prior-skim': ['命中列表', '对比文件'],
}

/** 零件明确对应 hold 末项时，内容可勾 hold（如权属零件→权属声明） */
const PART_WARRANTS_HOLD = new Set(['ownership'])

/** 正文关键词 → 标签提示 */
const BODY_KEYWORD_HINTS: { re: RegExp; hints: string[] }[] = [
  { re: /技术要点|六段事实|技术领域|交底正文/, hints: ['技术交底正文'] },
  { re: /附图说明|图号对齐|图面一览/, hints: ['附图说明', '图1', '图2', '简要说明'] },
  { re: /发明人名单|发明人\s*\//, hints: ['发明人名单'] },
  { re: /权属声明/, hints: ['权属声明'] },
  { re: /评分卡|立题一页/, hints: ['评分卡汇总'] },
  { re: /报价提纲|费用口袋|范围报价/, hints: ['报价'] },
  { re: /国际路径|PCT/, hints: ['国际路径意向'] },
  { re: /会议纪要/, hints: ['会议纪要'] },
  { re: /决议签署/, hints: ['决议签署'] },
  { re: /检索式/, hints: ['检索式'] },
  { re: /命中列表|对比清单|对比文件/, hints: ['命中列表', '对比文件'] },
  { re: /结论稿|结论一页/, hints: ['结论稿'] },
  { re: /范围声明/, hints: ['范围声明'] },
  { re: /说明书骨架|说明书章节/, hints: ['说明书骨架'] },
  { re: /权项树|权利要求/, hints: ['权项树'] },
  { re: /术语表|术语一致/, hints: ['术语表'] },
  { re: /摘要/, hints: ['摘要'] },
  { re: /实施例/, hints: ['实施例', '附图说明'] },
  { re: /格式检查/, hints: ['格式检查'] },
  { re: /图号核对/, hints: ['图号核对'] },
]

export type DiffStatsLike = { added: number; removed: number }

/** 稿面过短或占位 → 视为空（可收束） */
export function isBodyEmptyForKit(body: string | undefined | null): boolean {
  const t = (body ?? '').trim()
  if (t.length < 20) return true
  if (
    /暂无产出正文|尚无另存版本|本站附件为样机占位|左侧点某一本稿零件|左侧点查新/.test(
      t,
    ) &&
    t.length < 120
  ) {
    return true
  }
  return false
}

export function isMeaningfulDiff(stats?: DiffStatsLike | null): boolean {
  if (!stats) return false
  return stats.added + stats.removed >= 2
}

function matchLabels(
  labels: readonly string[],
  hints: readonly string[],
): string[] {
  return labels.filter((l) =>
    hints.some((h) => l.includes(h) || h.includes(l)),
  )
}

/** demoGap 可能短于 checklist 全文（如「权属声明」↔「权属声明（含签字页）」） */
export function isHoldLabel(
  label: string,
  holdLabels: readonly string[] | undefined,
): boolean {
  if (!holdLabels?.length) return false
  return holdLabels.some((h) => label.includes(h) || h.includes(label))
}

/**
 * 按材料树选中 / 正文 / 差分统计建议已勾标签。
 * hold 默认不入建议，除非零件或正文明确 warrant。
 */
export function suggestKitDoneFromDiff(input: {
  labels: readonly string[]
  holdLabels?: readonly string[]
  materialId?: string | null
  partId?: string | null
  bodyText?: string | null
  diffStats?: DiffStatsLike | null
}): string[] {
  const labels = [...input.labels]
  if (labels.length === 0) return []
  const holdLabels = input.holdLabels ?? []
  const suggested = new Set<string>()
  const body = input.bodyText ?? ''
  const empty = isBodyEmptyForKit(body)

  const partId =
    input.partId ??
    (input.materialId ? parsePartMaterialId(input.materialId) : null)

  // 1) 差分示意：有实质增删 → 勾可匹配的改稿相关项（非 hold）
  if (
    input.materialId === 'seed-diff' &&
    isMeaningfulDiff(input.diffStats)
  ) {
    const fromDiff = matchLabels(labels, [
      '技术交底正文',
      '评分卡汇总',
      '对比文件',
      '命中列表',
      '说明书骨架',
      '检索式',
    ])
    for (const l of fromDiff) {
      if (!isHoldLabel(l, holdLabels)) suggested.add(l)
    }
    if (suggested.size === 0) {
      const fillable = labels.filter((l) => !isHoldLabel(l, holdLabels))
      if (fillable[0]) suggested.add(fillable[0]!)
    }
  }

  // 2) 本稿零件 → 标签
  if (partId && PART_KIT_HINTS[partId]) {
    const matched = matchLabels(labels, PART_KIT_HINTS[partId]!)
    for (const l of matched) {
      if (isHoldLabel(l, holdLabels)) {
        if (!empty && PART_WARRANTS_HOLD.has(partId)) suggested.add(l)
      } else if (!empty || input.materialId?.startsWith('part-')) {
        // 零件种子本身即有正文 → 允许勾
        suggested.add(l)
      }
    }
  }

  // 3) 正文关键词
  if (!empty) {
    for (const { re, hints } of BODY_KEYWORD_HINTS) {
      if (!re.test(body)) continue
      for (const l of matchLabels(labels, hints)) {
        if (isHoldLabel(l, holdLabels)) {
          // 正文明确写出 hold 标签词才 warrant
          if (hints.some((h) => l.includes(h) || h.includes(l))) {
            suggested.add(l)
          }
        } else {
          suggested.add(l)
        }
      }
    }
  }

  return labels.filter((l) => suggested.has(l))
}

/** 合并：建议 ∪ 已有（单调）；空稿+交卷物视图时可收束非 hold */
export function mergeKitDoneWithDiff(input: {
  labels: readonly string[]
  prevDone: readonly string[] | undefined
  holdLabels?: readonly string[]
  materialId?: string | null
  partId?: string | null
  bodyText?: string | null
  diffStats?: DiffStatsLike | null
  /** 强制按空稿收束（正文被清空） */
  forceEmpty?: boolean
}): string[] {
  const holdLabels = input.holdLabels ?? []
  const suggested = suggestKitDoneFromDiff(input)
  const empty =
    input.forceEmpty === true ||
    (isBodyEmptyForKit(input.bodyText) &&
      (input.materialId === 'deliverable' ||
        input.materialId === 'attachments' ||
        !input.materialId) &&
      !input.partId &&
      input.materialId !== 'seed-diff')

  if (empty) {
    // 空稿：只保留 hold 上手勾；清掉内容自动勾的非 hold
    const next: string[] = []
    for (const l of input.labels) {
      const prev = (input.prevDone ?? []).includes(l)
      if (prev && isHoldLabel(l, holdLabels)) next.push(l)
    }
    return next
  }

  const set = new Set<string>()
  for (const l of input.prevDone ?? []) {
    if (input.labels.includes(l)) set.add(l)
  }
  for (const l of suggested) set.add(l)
  return input.labels.filter((l) => set.has(l))
}

/** 从材料选中 + 正文拼同步入参（seed-diff 自动带 seed 统计） */
export function buildDiffAutoInput(input: {
  labels: readonly string[]
  prevDone: readonly string[] | undefined
  deptSlug: string
  materialId: string
  bodyText: string
  holdLabels?: readonly string[]
  forceEmpty?: boolean
}): Parameters<typeof mergeKitDoneWithDiff>[0] {
  const hold =
    input.holdLabels ?? kitHoldLabelsForDeptSlug(input.deptSlug)
  const partId = parsePartMaterialId(input.materialId)
  const diffStats =
    input.materialId === 'seed-diff' ? seedTrueDiff().stats : null
  return {
    labels: input.labels,
    prevDone: input.prevDone,
    holdLabels: hold,
    materialId: input.materialId,
    partId,
    bodyText: input.bodyText,
    diffStats,
    forceEmpty: input.forceEmpty,
  }
}
