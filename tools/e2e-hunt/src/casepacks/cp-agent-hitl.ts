/** CP-agent-hitl：进入办理 → HITL ConfirmBar 可见（agent:5175） */

import type { CasePack, DecideResult, Observation } from '../types.js'

export const AGENT_HITL_SESSION_URL =
  'http://localhost:5175/agent/sessions/sess-oa-1?focus=hitl'

export const CP_AGENT_HITL: CasePack = {
  id: 'CP-agent-hitl',
  title: '进入办理 → HITL ConfirmBar 可见',
  baseURL: 'http://localhost:5175/',
  maxSteps: 12,
  abortOnHard: true,
  allowedActionsNote:
    '深链优先进种子 sess-oa-1（needs_human+hitlPending）；勿把 HITL 等待态 / Beta·非采购闭环 / 样机横幅当缺陷',
  checkpoints: [
    {
      id: 'cp-home',
      label: 'Agent 办理入口',
      assert: { kind: 'custom', id: 'agent-home' },
    },
    {
      id: 'cp-session',
      label: '进入种子会话 sess-oa-1',
      assert: { kind: 'custom', id: 'agent-session-oa1' },
    },
    {
      id: 'cp-hitl',
      label: 'HITL ConfirmBar 可见',
      assert: { kind: 'custom', id: 'hitl-confirm-bar' },
    },
  ],
}

/**
 * Rule-short decide：goto home → goto 深链（或 click「N 个会话待确认」再点会话）→ wait → stop。
 */
export function decideAgentHitl(obs: Observation, pack: CasePack): DecideResult {
  const reached = new Set(obs.reachedCheckpoints)
  const next = obs.nextCheckpointId

  if (
    (reached.has('cp-home') &&
      reached.has('cp-session') &&
      reached.has('cp-hitl')) ||
    next == null
  ) {
    return { kind: 'stop', reason: 'success' }
  }

  switch (next) {
    case 'cp-home':
      return { kind: 'action', action: { type: 'goto', url: pack.baseURL } }

    case 'cp-session': {
      // 深链优先
      if (!obs.url.includes('sess-oa-1')) {
        return {
          kind: 'action',
          action: { type: 'goto', url: AGENT_HITL_SESSION_URL },
        }
      }
      return { kind: 'action', action: { type: 'wait', ms: 600 } }
    }

    case 'cp-hitl': {
      // 已在会话页但 ConfirmBar 尚未观测到：短 wait（focus=hitl 滚到高亮）
      if (obs.url.includes('sess-oa-1')) {
        return { kind: 'action', action: { type: 'wait', ms: 800 } }
      }
      // 兜底：从首页点「N 个会话待确认」
      if (
        obs.pageTextSnippet.includes('会话待确认') ||
        obs.a11yText.includes('会话待确认')
      ) {
        return {
          kind: 'action',
          action: { type: 'click', role: 'button', name: /会话待确认/ },
        }
      }
      return {
        kind: 'action',
        action: { type: 'goto', url: AGENT_HITL_SESSION_URL },
      }
    }

    default:
      return { kind: 'stop', reason: `stalled: unknown checkpoint ${next}` }
  }
}
