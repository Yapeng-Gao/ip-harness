/**
 * T4 依据链 · 签字级四件套（结论 / 来源 / 推演 / 对比）
 * 从 resultPreview + processPreview + summary 解析；缺段明示「待补」，禁一键全绿。
 */
import type { BusinessConfirmKind } from './businessSeats'

export type AskEvidencePiece = {
  id: 'conclusion' | 'source' | 'reasoning' | 'contrast'
  label: string
  body: string
  /** 缺段不可装已齐 */
  present: boolean
}

export type AskEvidenceBundle = {
  pieces: AskEvidencePiece[]
  /** 四件皆有实质内容才算可签字密度（演示仍可拍，但 UI 标明缺口） */
  signReady: boolean
  gapLabels: string[]
}

const LABELS: Record<AskEvidencePiece['id'], string> = {
  conclusion: '结论',
  source: '来源',
  reasoning: '推演',
  contrast: '对比',
}

function stripTag(s: string, tag: string): string {
  const re = new RegExp(`^【${tag}】\\s*`)
  return s.replace(re, '').trim()
}

function pickSection(text: string, keys: string[]): string | null {
  const raw = text.trim()
  if (!raw) return null
  for (const k of keys) {
    const m = raw.match(new RegExp(`【${k}】([^【]*)`))
    if (m?.[1]?.trim()) return m[1].trim()
  }
  return null
}

/** 按 kind 补默认对比/来源示意（仍标演示；无则 present=false） */
function kindFallback(
  kind: BusinessConfirmKind,
  piece: AskEvidencePiece['id'],
): string | null {
  if (piece === 'contrast') {
    if (kind === 'oa_strategy') {
      return '对照审查意见争点：D1 水道已公开 vs 本案双密封+错位组合（演示对比）。'
    }
    if (kind === 'claims_ready' || kind === 'go_nogo') {
      return '对照最接近公开：未披露端盖鳍片与双密封组合（演示对比）。'
    }
    if (kind === 'disclosure_ready') {
      return '对照交底六段：效果数据仍待测法标注（演示对比）。'
    }
  }
  if (piece === 'source') {
    if (kind === 'oa_strategy') return '来源：审查意见书（示意）· 补充检索笔记（示意）。'
    if (kind === 'research_ready' || kind === 'go_nogo') {
      return '来源：公开文献检索式可复现稿（示意）· 非官报全文。'
    }
    if (kind === 'disclosure_ready') return '来源：发明人交底稿 v3（示意）· 测温记录摘要。'
    if (kind === 'claims_ready') return '来源：交底全绿包 + 查新结论稿（示意）。'
    if (kind === 'file_authorize') return '来源：申请包齐套清单（示意）· 非已向局端递交回执。'
  }
  return null
}

export function buildAskEvidence(input: {
  kind: BusinessConfirmKind
  summary: string
  resultPreview?: string
  processPreview?: string
}): AskEvidenceBundle {
  const result = (input.resultPreview ?? '').trim()
  const process = (input.processPreview ?? '').trim()
  const summary = input.summary.trim()

  const conclusion =
    pickSection(result, ['成果', '结论']) ||
    stripTag(result, '成果') ||
    summary ||
    ''

  const source =
    pickSection(result, ['来源', '依据']) ||
    pickSection(process, ['来源', '依据']) ||
    kindFallback(input.kind, 'source') ||
    ''

  const reasoning =
    pickSection(process, ['办理过程', '推演', '理由']) ||
    stripTag(process, '办理过程') ||
    pickSection(result, ['推演', '理由']) ||
    ''

  const contrast =
    pickSection(result, ['对比', '对照']) ||
    pickSection(process, ['对比', '对照']) ||
    kindFallback(input.kind, 'contrast') ||
    ''

  const pieces: AskEvidencePiece[] = (
    [
      ['conclusion', conclusion],
      ['source', source],
      ['reasoning', reasoning],
      ['contrast', contrast],
    ] as const
  ).map(([id, body]) => {
    const present = body.trim().length >= 8
    return {
      id,
      label: LABELS[id],
      body: present ? body.trim() : `（待补 · ${LABELS[id]}未齐，不可宣称签字级依据链）`,
      present,
    }
  })

  const gapLabels = pieces.filter((p) => !p.present).map((p) => p.label)
  return {
    pieces,
    signReady: gapLabels.length === 0,
    gapLabels,
  }
}
