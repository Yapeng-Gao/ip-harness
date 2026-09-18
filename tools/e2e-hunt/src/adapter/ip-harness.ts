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
import {
  CP_SEARCH_API_FALLBACK,
  decideSearchApiFallback,
} from '../casepacks/cp-search-api-fallback.js'
import { CP_AGENT_HITL, decideAgentHitl } from '../casepacks/cp-agent-hitl.js'
import { CP_FIGURE_DUAL, decideFigureDual } from '../casepacks/cp-figure-dual.js'
import type { CasePack, DecideResult, Observation } from '../types.js'

export const ADAPTER_ID = 'ip-harness'

export const ENTRY_URLS = {
  search: 'http://localhost:5182/',
  fto: 'http://localhost:5183/',
  mid: 'http://localhost:5173/',
  agent: 'http://localhost:5175/',
  figure: 'http://localhost:5187/',
} as const

/** CasePack id → 建议的本地 dev 脚本（ensureBaseUp 提示用） */
export const DEV_SCRIPT_BY_PACK: Record<string, string> = {
  [CP_SEARCH_SMOKE.id]: 'npm run dev:search',
  [CP_FTO_FIVE.id]: 'npm run dev:fto',
  [CP_BASKET_STRATEGY_A.id]: 'npm run dev:search 与 npm run dev:fto',
  [CP_SEARCH_API_FLAG.id]:
    'npm run dev:search-api 与 npm run dev:search:api（勿用裸 npm run dev:search）',
  [CP_SEARCH_API_FALLBACK.id]:
    'npm run dev:search:api（旗标）+ 确保 :5190 已停（勿起 dev:search-api）',
  [CP_AGENT_HITL.id]: 'npm run dev:agent',
  [CP_FIGURE_DUAL.id]: 'npm run dev:figure',
}

/** 除 pack.baseURL 外还需探活的 base（跨壳 Case） */
export const EXTRA_BASES_BY_PACK: Record<string, string[]> = {
  [CP_BASKET_STRATEGY_A.id]: [ENTRY_URLS.fto],
  [CP_SEARCH_API_FLAG.id]: ['http://localhost:5190/health'],
  // 分支 B：只要 :5182；不要探活 :5190/health（应 down）
}

/** CasePack id → 这些 URL 必须不可达（宕机回退场景 fail-fast） */
export const REQUIRE_DOWN_BY_PACK: Record<string, string[]> = {
  [CP_SEARCH_API_FALLBACK.id]: ['http://localhost:5190/health'],
}

export const CASE_PACKS: Record<string, CasePack> = {
  [CP_SEARCH_SMOKE.id]: CP_SEARCH_SMOKE,
  [CP_FTO_FIVE.id]: CP_FTO_FIVE,
  [CP_BASKET_STRATEGY_A.id]: CP_BASKET_STRATEGY_A,
  [CP_SEARCH_API_FLAG.id]: CP_SEARCH_API_FLAG,
  [CP_SEARCH_API_FALLBACK.id]: CP_SEARCH_API_FALLBACK,
  [CP_AGENT_HITL.id]: CP_AGENT_HITL,
  [CP_FIGURE_DUAL.id]: CP_FIGURE_DUAL,
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
  if (pack.id === CP_SEARCH_API_FALLBACK.id) return decideSearchApiFallback(obs, pack)
  if (pack.id === CP_AGENT_HITL.id) return decideAgentHitl(obs, pack)
  if (pack.id === CP_FIGURE_DUAL.id) return decideFigureDual(obs, pack)
  return { kind: 'stop', reason: `no decide strategy for ${pack.id}` }
}
