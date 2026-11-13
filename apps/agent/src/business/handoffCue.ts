/**
 * 部间交接台词与路线 · 样机短语池，不是模型生成。
 * 例：交底 disclosure_pack → 申请部。
 */

export type HandoffRoute = {
  fromSlug: string
  toSlug: string
  /** 人话产物名 */
  artifact: string
}

const BY_SEAT: Record<string, HandoffRoute> = {
  'expert-intake': { fromSlug: 'intake', toSlug: 'inspire', artifact: '立项意见' },
  'expert-inspire': { fromSlug: 'inspire', toSlug: 'mining', artifact: '激发简报' },
  'expert-mining': { fromSlug: 'mining', toSlug: 'disclosure', artifact: '挖掘包' },
  'expert-disclosure': { fromSlug: 'disclosure', toSlug: 'draft', artifact: '交底包' },
  'expert-draft': { fromSlug: 'draft', toSlug: 'oa', artifact: '申请文件' },
  'expert-oa': { fromSlug: 'oa', toSlug: 'annuity', artifact: '答复稿' },
  'expert-annuity': { fromSlug: 'annuity', toSlug: 'monetize', artifact: '维护台账' },
}

export function handoffRouteForSeat(seatId: string): HandoffRoute | null {
  return BY_SEAT[seatId] ?? null
}

export const HANDOFF_PHRASES = [
  '交底齐了，申请部接着写。',
  '这包我过完了，你们收一下。',
  '事实钉死了，权要可以开写。',
  '我放到你们桌上了。',
  '下一家，材料在包里。',
  '先看摘要，细则在附件。',
  '这版可以往下走。',
  '我先交卷，你们接手。',
] as const

export function pickHandoffPhrase(rand: () => number = Math.random): string {
  const raw = rand()
  const n = Number.isFinite(raw) ? raw : 0
  const idx = Math.min(
    HANDOFF_PHRASES.length - 1,
    Math.max(0, Math.floor(n * HANDOFF_PHRASES.length)),
  )
  return HANDOFF_PHRASES[idx]!
}
