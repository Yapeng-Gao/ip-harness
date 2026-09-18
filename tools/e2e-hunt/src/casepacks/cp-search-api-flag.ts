/** CP-search-api-flag：旗标接 Search API :5190 · 分支 A（API 存活 → sqlite-fts + 有命中）*/

import type { CasePack, DecideResult, Observation } from '../types.js'

export const CP_SEARCH_API_FLAG: CasePack = {
  id: 'CP-search-api-flag',
  title: '旗标接 Search API：backend sqlite-fts + 有命中（分支 A）',
  baseURL: 'http://localhost:5182/',
  query: '固态电解质',
  maxSteps: 12,
  abortOnHard: true,
  allowedActionsNote:
    '须 npm run dev:search-api (:5190) + npm run dev:search:api（VITE_SEARCH_API_URL）；禁裸 dev:search。分支 B（宕机回退）后置。',
  checkpoints: [
    {
      id: 'cp-wb',
      label: '进入专利检索工作台',
      assert: { kind: 'heading', name: '专利检索工作台' },
    },
    {
      id: 'cp-sqlite',
      label: 'UI 可见 backend: sqlite-fts / 已接 Search API',
      assert: { kind: 'custom', id: 'backend-sqlite-fts' },
    },
    {
      id: 'cp-results-fts',
      label: '有命中（非假成功空列表装成真库）',
      assert: { kind: 'custom', id: 'search-results' },
    },
  ],
}

/**
 * Rule-short decide：goto → fill+检索 → wait（仍 mock/加载中）→
 * stop success 当 sqlite + results 都达。
 * 约定：next=X 的动作用于到达 X。
 */
export function decideSearchApiFlag(obs: Observation, pack: CasePack): DecideResult {
  const reached = new Set(obs.reachedCheckpoints)
  const q = pack.query ?? '固态电解质'
  const next = obs.nextCheckpointId

  if (
    (reached.has('cp-sqlite') && reached.has('cp-results-fts')) ||
    next == null
  ) {
    return { kind: 'stop', reason: 'success' }
  }

  switch (next) {
    case 'cp-wb':
      return { kind: 'action', action: { type: 'goto', url: pack.baseURL } }

    case 'cp-sqlite':
    case 'cp-results-fts': {
      if (
        obs.pageTextSnippet.includes('检索中') ||
        obs.pageTextSnippet.includes('假延迟')
      ) {
        return { kind: 'action', action: { type: 'wait', ms: 800 } }
      }

      // Still showing default mock chip / honesty banner — need search (or wait for API)
      const stillMockOnly =
        /backend:\s*mock/i.test(obs.pageTextSnippet) &&
        !/sqlite-fts/i.test(obs.pageTextSnippet) &&
        !obs.pageTextSnippet.includes('已接 Search API')

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

      if (
        obs.pageTextSnippet.includes('尚未检索') ||
        stillMockOnly ||
        !/score\s+\d+/.test(obs.pageTextSnippet)
      ) {
        // Avoid hammering 检索 if we already clicked and are waiting for response
        if (
          obs.pageTextSnippet.includes('检索中') ||
          obs.pageTextSnippet.includes('假延迟')
        ) {
          return { kind: 'action', action: { type: 'wait', ms: 800 } }
        }
        return {
          kind: 'action',
          action: { type: 'click', role: 'button', name: '检索' },
        }
      }

      // Results or sqlite chip may be mid-paint
      return { kind: 'action', action: { type: 'wait', ms: 800 } }
    }

    default:
      return { kind: 'stop', reason: `stalled: unknown checkpoint ${next}` }
  }
}
