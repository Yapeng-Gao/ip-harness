/** 问题 / 技术点输入 */
export type SeedPrompt = string

export type SparkCard = {
  id: string
  title: string
  hook: string
  tags?: string[]
  fakeHit?: string
}

export type Favorites = string[]

export type SendKind = '送交底' | '送挖掘'

export type SendIntent = {
  id: string
  kind: SendKind
  cardIds: string[]
  at: string
  note: string
}

export type ExpandPhase = 'idle' | 'expanding' | 'ready' | 'empty'

export type InspireState = {
  backend: 'mock'
  prompt: SeedPrompt
  phase: ExpandPhase
  cards: SparkCard[]
  /** 跨批次保留，便于收藏/送出仍能展示正文 */
  cardCatalog: Record<string, SparkCard>
  favorites: Favorites
  intents: SendIntent[]
  batchIndex: number
  toast: string | null
}

export const HONESTY_BANNER = '样机 · 无真 LLM · 扩召为种子拼装'

export const MINING_DEEPLINK = 'http://localhost:5184'
export const DOC_HARNESS_DEEPLINK = 'http://localhost:5178'
export const SEARCH_DEEPLINK = 'http://localhost:5182'

export const STEPS = [
  { path: '/', step: 1, label: '输入台', short: '输入' },
  { path: '/sparks', step: 2, label: '扩召墙', short: '扩召' },
  { path: '/favorites', step: 3, label: '收藏', short: '收藏' },
  { path: '/send', step: 4, label: '送交底/挖掘', short: '送出' },
] as const
