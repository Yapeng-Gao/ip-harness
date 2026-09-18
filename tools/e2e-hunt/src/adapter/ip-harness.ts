/** AppAdapter · ip-harness */

import {
  CP_BASKET_STRATEGY_A,
  decideBasketStrategyA,
} from '../casepacks/cp-basket-strategy-a.js'
import { CP_FTO_FIVE, decideFtoFive } from '../casepacks/cp-fto-five.js'
import { CP_SEARCH_SMOKE, decideSearchSmoke } from '../casepacks/cp-search-smoke.js'
import {
  CP_SEARCH_API_FLAG,
  decideSearchApiFlag,
} from '../casepacks/cp-search-api-flag.js'
import type { CasePack, DecideResult, Observation } from '../types.js'

export const ADAPTER_ID = 'ip-harness'

export const ENTRY_URLS = {
  search: 'http://localhost:5182/',
  fto: 'http://localhost:5183/',
  mid: 'http://localhost:5173/',
  agent: 'http://localhost:5175/',
} as const

/** CasePack id → 建议的本地 dev 脚本（ensureBaseUp 提示用） */
export const DEV_SCRIPT_BY_PACK: Record<string, string> = {
  [CP_SEARCH_SMOKE.id]: 'npm run dev:search',
  [CP_FTO_FIVE.id]: 'npm run dev:fto',
  [CP_BASKET_STRATEGY_A.id]: 'npm run dev:search 与 npm run dev:fto',
  [CP_SEARCH_API_FLAG.id]:
    'npm run dev:search-api 与 npm run dev:search:api（勿用裸 npm run dev:search）',
}

/** 除 pack.baseURL 外还需探活的 base（跨壳 Case） */
export const EXTRA_BASES_BY_PACK: Record<string, string[]> = {
  [CP_BASKET_STRATEGY_A.id]: [ENTRY_URLS.fto],
  [CP_SEARCH_API_FLAG.id]: ['http://localhost:5190/health'],
}

export const CASE_PACKS: Record<string, CasePack> = {
  [CP_SEARCH_SMOKE.id]: CP_SEARCH_SMOKE,
  [CP_FTO_FIVE.id]: CP_FTO_FIVE,
  [CP_BASKET_STRATEGY_A.id]: CP_BASKET_STRATEGY_A,
  [CP_SEARCH_API_FLAG.id]: CP_SEARCH_API_FLAG,
}

export function getCasePack(id: string): CasePack {
  const pack = CASE_PACKS[id]
  if (!pack) throw new Error(`Unknown CasePack: ${id}. Known: ${Object.keys(CASE_PACKS).join(', ')}`)
  return pack
}

/** decide 接口形状：MVP 规则短路；日后可换 LLM */
export function decide(obs: Observation, pack: CasePack): DecideResult {
  if (pack.id === CP_SEARCH_SMOKE.id) return decideSearchSmoke(obs, pack)
  if (pack.id === CP_FTO_FIVE.id) return decideFtoFive(obs, pack)
  if (pack.id === CP_BASKET_STRATEGY_A.id) return decideBasketStrategyA(obs, pack)
  if (pack.id === CP_SEARCH_API_FLAG.id) return decideSearchApiFlag(obs, pack)
  return { kind: 'stop', reason: `no decide strategy for ${pack.id}` }
}
