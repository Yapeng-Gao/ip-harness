/** AppAdapter · ip-harness */

import { CP_SEARCH_SMOKE, decideSearchSmoke } from '../casepacks/cp-search-smoke.js'
import type { CasePack, DecideResult, Observation } from '../types.js'

export const ADAPTER_ID = 'ip-harness'

export const ENTRY_URLS = {
  search: 'http://localhost:5182/',
  mid: 'http://localhost:5173/',
  agent: 'http://localhost:5175/',
} as const

export const CASE_PACKS: Record<string, CasePack> = {
  [CP_SEARCH_SMOKE.id]: CP_SEARCH_SMOKE,
}

export function getCasePack(id: string): CasePack {
  const pack = CASE_PACKS[id]
  if (!pack) throw new Error(`Unknown CasePack: ${id}. Known: ${Object.keys(CASE_PACKS).join(', ')}`)
  return pack
}

/** decide 接口形状：MVP 规则短路；日后可换 LLM */
export function decide(obs: Observation, pack: CasePack): DecideResult {
  if (pack.id === CP_SEARCH_SMOKE.id) return decideSearchSmoke(obs, pack)
  return { kind: 'stop', reason: `no decide strategy for ${pack.id}` }
}
