/** Search Hit 子集（与 search / fto 对齐） */
export type SearchHit = {
  id: string
  publicationNumber: string
  title: string
  applicant?: string
  snippet?: string
}

export type Disclosure = {
  background: string
  techPoints: string
  effects: string
  relatedHitIds: string[]
}

export type InventionCandidate = {
  id: string
  title: string
  points: string
  relatedHitIds?: string[]
}

export type ScoreCard = {
  candidateId: string
  novelty: number
  value: number
  writability: number
  total: number
}

export type HandoffKind = '立项' | '撰写'

export type HandoffIntent = {
  id: string
  kind: HandoffKind
  candidateIds: string[]
  at: string
  note: string
}

export type MiningProject = {
  id: string
  name: string
}

export type MiningState = {
  project: MiningProject
  disclosure: Disclosure
  candidates: InventionCandidate[]
  scores: ScoreCard[]
  intents: HandoffIntent[]
  hits: SearchHit[]
  toast: string | null
  generating: boolean
  scoreSortDesc: boolean
}

export const HONESTY_BANNER = '样机 · 无真挖掘引擎 · 不写立案库'

export const WORKBENCH_DEEPLINK = 'http://localhost:5174'
export const DOC_HARNESS_DEEPLINK = 'http://localhost:5178'
export const SEARCH_DEEPLINK = 'http://localhost:5182'

export const STEPS = [
  { path: '/disclosure', step: 1, label: '交底/技术点', short: '交底' },
  { path: '/candidates', step: 2, label: '候选发明点', short: '候选' },
  { path: '/score', step: 3, label: '评分', short: '评分' },
  { path: '/send', step: 4, label: '送立项/撰写', short: '送出' },
] as const

export function scoreTotal(novelty: number, value: number, writability: number): number {
  return novelty + value + writability
}
