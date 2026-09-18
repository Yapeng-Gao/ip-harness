/** CP-basket-strategy-a：search→fto 工作篮策略 A（链路可点 + 诚实 toast；非真跨口 LS） */

import type { CasePack, DecideResult, Observation } from '../types.js'

export const CP_BASKET_STRATEGY_A: CasePack = {
  id: 'CP-basket-strategy-a',
  title: '工作篮策略 A：加篮→送 FTO→导入共享种子 + 诚实 toast',
  baseURL: 'http://localhost:5182/',
  query: '固态电解质',
  maxSteps: 16,
  abortOnHard: true,
  allowedActionsNote:
    '验链路可点 + 策略 A / DOWNSTREAM 诚实文案；不读跨口 localStorage、不开 L5',
  checkpoints: [
    {
      id: 'cp-search-wb',
      label: '进入专利检索工作台',
      assert: { kind: 'heading', name: '专利检索工作台' },
    },
    {
      id: 'cp-has-results',
      label: '列表有结果',
      assert: { kind: 'custom', id: 'search-results' },
    },
    {
      id: 'cp-in-basket',
      label: '已加入工作篮',
      assert: { kind: 'custom', id: 'basket-nonempty' },
    },
    {
      id: 'cp-send-fto',
      label: '送 FTO · 策略 A / DOWNSTREAM 诚实提示',
      assert: { kind: 'custom', id: 'strategy-a-toast' },
    },
    {
      id: 'cp-fto-hits',
      label: 'FTO 检索命中 / 工作篮',
      assert: { kind: 'heading', name: '检索命中 / 工作篮' },
    },
    {
      id: 'cp-import-seed',
      label: '从 Search 工作篮导入 · 共享种子',
      assert: { kind: 'custom', id: 'fto-import-done' },
    },
  ],
}

const FTO_HITS_URL = 'http://localhost:5183/hits'

/**
 * Rule-short decide：search 加篮→送 FTO→深链/goto fto hits→导入共享种子。
 * 约定：next=X 的动作用于到达 X（与 CP-search-smoke / CP-fto-five 同形）。
 */
export function decideBasketStrategyA(obs: Observation, pack: CasePack): DecideResult {
  const reached = new Set(obs.reachedCheckpoints)
  const q = pack.query ?? '固态电解质'
  const next = obs.nextCheckpointId

  if (reached.has('cp-import-seed') || next == null) {
    return { kind: 'stop', reason: 'success' }
  }

  switch (next) {
    case 'cp-search-wb':
      return { kind: 'action', action: { type: 'goto', url: pack.baseURL } }

    case 'cp-has-results': {
      if (
        obs.pageTextSnippet.includes('检索中') ||
        obs.pageTextSnippet.includes('假延迟')
      ) {
        return { kind: 'action', action: { type: 'wait', ms: 800 } }
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
      if (
        obs.pageTextSnippet.includes('尚未检索') ||
        !/score\s+\d+/.test(obs.pageTextSnippet)
      ) {
        return {
          kind: 'action',
          action: { type: 'click', role: 'button', name: '检索' },
        }
      }
      return { kind: 'action', action: { type: 'wait', ms: 800 } }
    }

    case 'cp-in-basket':
      return {
        kind: 'action',
        action: { type: 'click', role: 'button', name: '加入工作篮' },
      }

    case 'cp-send-fto':
      return {
        kind: 'action',
        action: { type: 'click', role: 'button', name: '送 FTO' },
      }

    case 'cp-fto-hits':
      // Prefer deep-link href if present; else goto hits
      if (
        obs.pageTextSnippet.includes('localhost:5183') ||
        obs.a11yText.includes('localhost:5183')
      ) {
        return { kind: 'action', action: { type: 'goto', url: FTO_HITS_URL } }
      }
      return { kind: 'action', action: { type: 'goto', url: FTO_HITS_URL } }

    case 'cp-import-seed':
      return {
        kind: 'action',
        action: {
          type: 'click',
          role: 'button',
          name: /从 Search 工作篮导入/,
        },
      }

    default:
      return { kind: 'stop', reason: `stalled: unknown checkpoint ${next}` }
  }
}
