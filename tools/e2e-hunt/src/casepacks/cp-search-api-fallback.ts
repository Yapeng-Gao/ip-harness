/** CP-search-api-fallback：旗标已开但 :5190 宕机 · 分支 B（回退 mock + 诚实 toast）*/

import type { CasePack, DecideResult, Observation } from '../types.js'

export const CP_SEARCH_API_FALLBACK: CasePack = {
  id: 'CP-search-api-fallback',
  title: '旗标 Search API 宕机回退：toast + backend mock（分支 B）',
  baseURL: 'http://localhost:5182/',
  query: '固态电解质',
  maxSteps: 14,
  abortOnHard: true,
  allowedActionsNote:
    '须 npm run dev:search:api（VITE_SEARCH_API_URL→:5190）且 :5190 已停；禁起 dev:search-api。与 CP-search-api-flag（分支 A）对偶。',
  checkpoints: [
    {
      id: 'cp-wb',
      label: '进入专利检索工作台',
      assert: { kind: 'heading', name: '专利检索工作台' },
    },
    {
      id: 'cp-fallback',
      label: '回退 toast：Search API 不可用，已回退样机 mock',
      assert: { kind: 'custom', id: 'api-fallback-toast' },
    },
    {
      id: 'cp-mock-chip',
      label: '检索后可见 backend: mock（无 sqlite-fts 成功态）',
      assert: { kind: 'custom', id: 'backend-mock-after-search' },
    },
    {
      id: 'cp-results-mock',
      label: '仍有 mock 命中（search-results）',
      assert: { kind: 'custom', id: 'search-results' },
    },
  ],
}

/**
 * Rule-short decide：goto → fill+检索 → wait（toast/mock 可能短暂）→
 * stop success 当 fallback + mock chip（+ results）都达。
 * 约定：next=X 的动作用于到达 X。
 */
export function decideSearchApiFallback(
  obs: Observation,
  pack: CasePack,
): DecideResult {
  const reached = new Set(obs.reachedCheckpoints)
  const q = pack.query ?? '固态电解质'
  const next = obs.nextCheckpointId

  if (
    (reached.has('cp-fallback') &&
      reached.has('cp-mock-chip') &&
      reached.has('cp-results-mock')) ||
    next == null
  ) {
    return { kind: 'stop', reason: 'success' }
  }

  switch (next) {
    case 'cp-wb':
      return { kind: 'action', action: { type: 'goto', url: pack.baseURL } }

    case 'cp-fallback':
    case 'cp-mock-chip':
    case 'cp-results-mock': {
      if (
        obs.pageTextSnippet.includes('检索中') ||
        obs.pageTextSnippet.includes('假延迟')
      ) {
        return { kind: 'action', action: { type: 'wait', ms: 500 } }
      }

      const queryVisible =
        obs.a11yText.includes(q) ||
        obs.pageTextSnippet.includes(q) ||
        /textbox.*"固态电解质"|固态电解质/.test(obs.a11yText)

      if (!queryVisible) {
        return {
          kind: 'action',
          action: { type: 'fill', label: '查询', value: q },
        }
      }

      const toastSeen =
        obs.pageTextSnippet.includes('Search API 不可用') ||
        obs.pageTextSnippet.includes('已回退样机 mock') ||
        reached.has('cp-fallback')

      const hasResults = /score\s+\d+/.test(obs.pageTextSnippet)
      const idle =
        obs.pageTextSnippet.includes('尚未检索') && !toastSeen && !hasResults

      if (idle || (!toastSeen && !hasResults)) {
        if (
          obs.pageTextSnippet.includes('检索中') ||
          obs.pageTextSnippet.includes('假延迟')
        ) {
          return { kind: 'action', action: { type: 'wait', ms: 500 } }
        }
        // Avoid re-clicking once search already kicked off
        if (obs.pageTextSnippet.includes('检索中')) {
          return { kind: 'action', action: { type: 'wait', ms: 500 } }
        }
        return {
          kind: 'action',
          action: { type: 'click', role: 'button', name: '检索' },
        }
      }

      // Toast may be brief (~2.8s); poll with short waits
      return { kind: 'action', action: { type: 'wait', ms: 450 } }
    }

    default:
      return { kind: 'stop', reason: `stalled: unknown checkpoint ${next}` }
  }
}
