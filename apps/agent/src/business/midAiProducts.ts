/**
 * §133：右栏 AI 产物 ↔ 中栏稿纸同源。
 * 真源：主栏持交付物全文；产物不活在气泡里。
 */
import { buildProgressiveArtifact } from './seatStepBodies'
import type { PatentDeliverable } from '../projects/patentDeliverables'
import type { ExpertStepDef } from '../projects/types'

export const MID_AI_SYNC_HONEST = '本席 AI 产物（与右栏同步）'

export type MidChatMessage = {
  role: string
  content: string
  meta?: { stepId?: string; toolName?: string } | null
}

/** 从渐进成果里抽出「推进记录」段，避免与样机骨架标题叠两遍 */
export function seatAiProgressExcerpt(progressive: string): string {
  const marker = '## 本席推进记录'
  const i = progressive.indexOf(marker)
  if (i >= 0) return progressive.slice(i).trim()
  return progressive.trim()
}

/** 右栏会话里已出现的 AI 产物（助理长文 / 工具气泡） */
export function aiProductsFromMessages(
  messages: MidChatMessage[] | null | undefined,
): Array<{ title: string; body: string }> {
  if (!messages?.length) return []
  const out: Array<{ title: string; body: string }> = []
  for (const m of messages) {
    if (m.role !== 'assistant' && m.role !== 'tool') continue
    const body = (m.content || '').trim()
    if (body.length < 24) continue
    const title =
      m.meta?.toolName ||
      (m.meta?.stepId ? `本步 · ${m.meta.stepId}` : m.role === 'tool' ? '本步产出' : '本席产出')
    out.push({ title, body })
  }
  return out.slice(-6)
}

function appendMessageProducts(
  base: string,
  products: Array<{ title: string; body: string }>,
): string {
  if (!products.length) return base
  const last = products[products.length - 1]!
  const tip = last.body.slice(0, Math.min(48, last.body.length))
  if (tip && base.includes(tip)) return base
  const parts = products.map((p) => `### ${p.title}\n\n${p.body}`)
  const block = `## ${MID_AI_SYNC_HONEST}\n\n${parts.join('\n\n——\n\n')}`
  if (base.includes(MID_AI_SYNC_HONEST)) {
    return `${base.trimEnd()}\n\n——\n\n### 会话产物\n\n${last.body}`
  }
  if (!base.trim()) return block
  return `${base.trimEnd()}\n\n——\n\n${block}`
}

export function composeMidDeliverableBody(input: {
  artifactMarkdown?: string | null
  officeMainBody?: string | null
  dual?: PatentDeliverable | null
  expertSteps?: ExpertStepDef[] | null
  seatStepIndex?: number
  handoffDeliverable?: string | null
  messages?: MidChatMessage[] | null
}): string {
  const products = aiProductsFromMessages(input.messages)
  const override = input.artifactMarkdown?.trim()
  if (override) return appendMessageProducts(override, products)

  const office = input.officeMainBody?.trim() || ''
  const dual = input.dual
  const steps = input.expertSteps ?? []
  const idx = Math.max(0, input.seatStepIndex ?? 0)
  const progressive =
    dual && steps.length > 0
      ? buildProgressiveArtifact(dual, steps, idx)
      : dual?.sampleArtifact?.trim() || ''

  let body = ''
  if (office) {
    if (idx > 0 && progressive.trim()) {
      const excerpt = seatAiProgressExcerpt(progressive)
      body = excerpt
        ? `${office}\n\n——\n\n## ${MID_AI_SYNC_HONEST}\n\n${excerpt}`
        : office
    } else {
      body = office
    }
  } else if (progressive.trim()) {
    body = progressive.trim()
  } else {
    body =
      input.handoffDeliverable?.trim() ||
      '暂无产出正文。点右侧专家岗起草后，正文会出现在此。'
  }

  return appendMessageProducts(body, products)
}

export function focusMidAiProductBody(input: {
  existing?: string | null
  title: string
  body: string
  officeMainBody?: string | null
}): string {
  const title = input.title.trim() || '本步产出'
  const body = input.body.trim()
  const block = `## ${title}\n\n${body}`
  const existing = input.existing?.trim()
  if (existing) {
    if (existing.includes(`## ${title}`)) {
      return `${existing}\n\n——\n\n## ${title}（更新）\n\n${body}`
    }
    return `${existing}\n\n——\n\n${block}`
  }
  const office = input.officeMainBody?.trim()
  if (office) return `${office}\n\n——\n\n## ${MID_AI_SYNC_HONEST}\n\n${block}`
  return block
}

export function applyAssistantFillToMid(input: {
  existing?: string | null
  officeMainBody?: string | null
  fieldKey: string
  fieldLabel: string
  fieldValue: string
}): string {
  const label = input.fieldLabel.trim()
  const value = input.fieldValue.trim()
  const line = `${label}：${value}`
  const existing = input.existing?.trim()
  const base =
    existing ||
    input.officeMainBody?.trim() ||
    '【交底成稿 · 本步】\n'

  const escaped = label.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
  const re = new RegExp('^' + escaped + '[：:].*$', 'm')
  if (re.test(base)) return base.replace(re, line)
  if (/技术领域|技术问题|技术方案/.test(base)) {
    return `${base.trimEnd()}\n${line}\n`
  }
  return `${base.trimEnd()}\n\n## 助手填空写入\n\n${line}\n`
}
