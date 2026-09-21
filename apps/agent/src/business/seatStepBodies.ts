/**
 * 席双文件正文随 stepIndex 递增：每步追加「做了什么 / 产出片段」
 * 业务面工作台用；禁静态 sample 假推进感。
 */
import type { PatentDeliverable } from '../projects/patentDeliverables'
import type { ExpertStepDef } from '../projects/types'

function stepsThrough(steps: ExpertStepDef[], stepIndex: number): ExpertStepDef[] {
  if (steps.length === 0) return []
  const end = Math.max(0, Math.min(stepIndex, steps.length - 1))
  return steps.slice(0, end + 1)
}

/** 成果正文：样机骨架 + 已达步骤的可见段落 */
export function buildProgressiveArtifact(
  dual: PatentDeliverable,
  steps: ExpertStepDef[],
  stepIndex: number,
): string {
  const reached = stepsThrough(steps, stepIndex)
  const lines: string[] = [
    dual.sampleArtifact.trimEnd(),
    '',
    '## 本席推进记录（随步更新）',
    `> 当前进度：第 ${Math.min(stepIndex + 1, Math.max(steps.length, 1))} / ${steps.length} 步`,
  ]
  for (let i = 0; i < reached.length; i++) {
    const s = reached[i]!
    lines.push('')
    lines.push(
      `### ${i + 1}. ${s.label}${s.triggersHitl ? ' · 待确认交卷' : ''}`,
    )
    lines.push(`本步做了什么：${s.script}`)
    if (s.tool) {
      lines.push(`产出片段：\`${s.tool.name}\` → ${s.tool.preview}`)
    }
  }
  return lines.join('\n')
}

/** 办理过程 worklog：样机骨架 + 步骤时间线追加行 */
export function buildProgressiveWorklog(
  dual: PatentDeliverable,
  steps: ExpertStepDef[],
  stepIndex: number,
): string {
  const reached = stepsThrough(steps, stepIndex)
  const timeline = reached
    .map((s, i) => {
      const out = s.tool ? s.tool.preview : '—'
      const hitl = s.triggersHitl ? '待确认' : '完成'
      return `| ${i + 1} | ${s.label} | ${s.script.slice(0, 48)} | ${out} | ${hitl} |`
    })
    .join('\n')
  const extras: string[] = [
    dual.sampleWorklog.trimEnd(),
    '',
    '## 推进追加（随步可见）',
    '| # | 步骤 | 本步做了什么 | 产出片段 | 状态 |',
    '|---|------|--------------|----------|------|',
    timeline || '| — | （尚未推进） | — | — | — |',
  ]
  for (let i = 0; i < reached.length; i++) {
    const s = reached[i]!
    extras.push('')
    extras.push(`### 日志 · ${i + 1}. ${s.label}`)
    extras.push(`- 做了什么：${s.script}`)
    if (s.tool) {
      extras.push(`- 产出：${s.tool.name} · ${s.tool.preview}`)
    }
    if (s.triggersHitl) {
      extras.push('- 闸口：已交卷 · 待我确认')
    }
  }
  return extras.join('\n')
}

/**
 * 按钮文案：未到交付步「完成本步」；HITL 步「交卷待确认」
 * （点一下会落到的步若 triggersHitl → 交卷）
 */
export function advanceButtonLabel(
  steps: ExpertStepDef[],
  stepIndex: number,
): string {
  if (steps.length === 0) return '完成本步'
  const targetIdx = Math.min(stepIndex + 1, steps.length - 1)
  const target = steps[targetIdx]
  if (target?.triggersHitl) return '交卷待确认'
  if (steps[stepIndex]?.triggersHitl) return '交卷待确认'
  return '完成本步'
}
