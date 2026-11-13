/** CP-search-smoke：关键词检索 → 列表可见 → 开详情（search:5182） */

import type { CasePack, DecideResult, Observation } from '../types.js'

export const CP_SEARCH_SMOKE: CasePack = {
  id: 'CP-search-smoke',
  title: '关键词检索→列表可见→开详情',
  baseURL: 'http://localhost:5182/',
  query: '固态电解质',
  maxSteps: 12,
  abortOnHard: true,
  checkpoints: [
    {
      id: 'cp-workbench',
      label: '进入专利检索工作台',
      assert: { kind: 'heading', name: '专利检索工作台' },
    },
    {
      id: 'cp-query-filled',
      label: '已填查询',
      assert: { kind: 'custom', id: 'search-query-filled' },
    },
    {
      id: 'cp-results',
      label: '列表有结果',
      assert: { kind: 'custom', id: 'search-results' },
    },
    {
      id: 'cp-detail',
      label: '打开详情 DetailDrawer',
      assert: { kind: 'role', role: 'dialog' },
    },
  ],
}

/**
 * Rule-short decide：按 CasePack 检查点序列输出下一步允许动作。
 * 保留 decide 接口形状，便于以后换 LLM。
 */
export function decideSearchSmoke(obs: Observation, pack: CasePack): DecideResult {
  const reached = new Set(obs.reachedCheckpoints)
  const q = pack.query ?? '固态电解质'
  const next = obs.nextCheckpointId

  if (reached.has('cp-detail') || next == null) {
    return { kind: 'stop', reason: 'success' }
  }

  switch (next) {
    case 'cp-workbench':
      return { kind: 'action', action: { type: 'goto', url: pack.baseURL } }

    case 'cp-query-filled':
      return {
        kind: 'action',
        action: { type: 'fill', label: '查询', value: q },
      }

    case 'cp-results': {
      if (
        obs.pageTextSnippet.includes('检索中') ||
        obs.pageTextSnippet.includes('假延迟')
      ) {
        return { kind: 'action', action: { type: 'wait', ms: 800 } }
      }
      // Empty idle still showing — click 检索
      if (
        obs.pageTextSnippet.includes('尚未检索') ||
        reached.has('cp-query-filled')
      ) {
        return {
          kind: 'action',
          action: { type: 'click', role: 'button', name: '检索' },
        }
      }
      return { kind: 'action', action: { type: 'wait', ms: 800 } }
    }

    case 'cp-detail':
      // Prefer exact seed title; fallback: first result-ish button with score in name
      return {
        kind: 'action',
        action: {
          type: 'click',
          role: 'button',
          name: /一种固态电解质及其制备方法/,
        },
      }

    default:
      return { kind: 'stop', reason: `stalled: unknown checkpoint ${next}` }
  }
}
