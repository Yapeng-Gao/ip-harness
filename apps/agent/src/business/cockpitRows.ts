/**
 * 驾驶舱行加厚 · 01c §3
 * 方案一句 / 依据摘要 / 专家建议 / 等多久
 */
import type { BusinessConfirmItem } from './BusinessCaseContext'
import { buildAskEvidence } from './askEvidence'
import { buildHitlAssistReview } from './hitlAssist'

export function clipOneLine(text: string, max = 40): string {
  const t = text.replace(/\s+/g, ' ').trim()
  if (!t) return ''
  return t.length <= max ? t : `${t.slice(0, max - 1)}…`
}

/** 从成果预览抽方案一句 */
export function planLineFromConfirm(item: BusinessConfirmItem): string {
  const raw = (item.resultPreview || item.summary || item.title || '').trim()
  const m = raw.match(/【成果】([^【]*)/)
  const body = (m?.[1] ?? raw).trim()
  return clipOneLine(body, 40) || '（方案待补）'
}

export function evidenceSummaryFromConfirm(item: BusinessConfirmItem): string {
  const bundle = buildAskEvidence({
    kind: item.kind,
    resultPreview: item.resultPreview,
    processPreview: item.processPreview,
    summary: item.summary,
  })
  const bits = bundle.pieces
    .filter((p) => p.present)
    .slice(0, 2)
    .map((p) => `${p.label}：${clipOneLine(p.body, 28)}`)
  if (bits.length) return bits.join(' · ')
  if (bundle.gapLabels.length) return `待补：${bundle.gapLabels.slice(0, 2).join('、')}`
  return '依据待补'
}

export function assistLineFromConfirm(item: BusinessConfirmItem): string {
  const r = buildHitlAssistReview(item.kind, { pass: 'first' })
  const reason = r.reasons[0] ? clipOneLine(r.reasons[0], 36) : ''
  return reason ? `${r.verdictLabel} · ${reason}` : r.verdictLabel
}

/** 相对等待时长（样机） */
export function waitLabelFromIso(iso: string, now = new Date()): string {
  const t = Date.parse(iso)
  if (!Number.isFinite(t)) return ''
  const mins = Math.max(0, Math.floor((now.getTime() - t) / 60000))
  if (mins < 1) return '刚到'
  if (mins < 60) return `已等 ${mins} 分钟`
  const hours = Math.floor(mins / 60)
  if (hours < 48) return `已等 ${hours} 小时`
  const days = Math.floor(hours / 24)
  return `已等 ${days} 天`
}

export function enrichConfirmForCockpit(item: BusinessConfirmItem) {
  return {
    planLine: planLineFromConfirm(item),
    evidenceLine: evidenceSummaryFromConfirm(item),
    assistLine: assistLineFromConfirm(item),
    waitLabel: waitLabelFromIso(item.createdAt),
  }
}
