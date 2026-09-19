/** CP-agent-stepwise：Agent :5175 逐步走查 S0–S9（样机 · SoftSkip 友好） */

import type { CasePack, DecideResult, Observation } from '../types.js'

export const AGENT_BASE = 'http://localhost:5175'
export const AGENT_HOME = `${AGENT_BASE}/agent`
export const AGENT_HITL_URL = `${AGENT_BASE}/agent/sessions/sess-oa-1?focus=hitl`
export const AGENT_SESSIONS_HITL = `${AGENT_BASE}/agent/sessions?filter=needs_human`
export const AGENT_CATALOG = `${AGENT_BASE}/agent/agents`
export const AGENT_PROJ_GENERAL = `${AGENT_BASE}/agent/projects/proj-demo-general`
export const AGENT_PROJ_PATENT_EXPERT = `${AGENT_BASE}/agent/projects/proj-demo-patent/bots/expert-search`

export const CP_AGENT_STEPWISE: CasePack = {
  id: 'CP-agent-stepwise',
  title: 'Agent 逐步走查 S0–S9（Home→HITL→绑案→Inbox→Catalog→Projects）',
  baseURL: `${AGENT_BASE}/`,
  maxSteps: 28,
  abortOnHard: true,
  enhancedTelemetry: 'network',
  allowedActionsNote:
    'S1 SoftSkip（创建绑案难自动化）；S9 以深链专家私聊为准；勿把 Beta·非采购闭环 / HITL 等待 / 样机横幅当缺陷；硬闸观察：无 mid 深链、无 BillingHold 全宽黄条、Home 案件入口=1',
  checkpoints: [
    {
      id: 's0-home',
      label: 'S0 Agent Home：竖导航·待确认·compose·单套 CaseBind',
      assert: { kind: 'custom', id: 'agent-s0-home' },
    },
    {
      id: 's1-case-bind',
      label: 'S1 SoftSkip：创建并绑定新案（样机可选）',
      assert: { kind: 'custom', id: 'agent-s1-softskip' },
    },
    {
      id: 's2-start-session',
      label: 'S2 无案点「开始办理」→ /agent/sessions/:id',
      assert: { kind: 'custom', id: 'agent-s2-session' },
    },
    {
      id: 's3-timeline',
      label: 'S3 会话轨迹/回复可见',
      assert: { kind: 'custom', id: 'agent-s3-timeline' },
    },
    {
      id: 's4-hitl',
      label: 'S4 HITL ConfirmBar 可见可点',
      assert: { kind: 'custom', id: 'hitl-confirm-bar' },
    },
    {
      id: 's5-session-casebind',
      label: 'S5 会话顶栏绑案可见',
      assert: { kind: 'custom', id: 'agent-s5-casebind' },
    },
    {
      id: 's6-sessions-filter',
      label: 'S6 会话列表 + 待确认筛选',
      assert: { kind: 'custom', id: 'agent-s6-sessions-filter' },
    },
    {
      id: 's7-catalog',
      label: 'S7 Catalog /agent/agents',
      assert: { kind: 'custom', id: 'agent-s7-catalog' },
    },
    {
      id: 's8-project-general',
      label: 'S8 项目 general（无专利步骤）',
      assert: { kind: 'custom', id: 'agent-s8-project-general' },
    },
    {
      id: 's9-project-patent',
      label: 'S9 domain/patent + 专家私聊',
      assert: { kind: 'custom', id: 'agent-s9-project-patent' },
    },
  ],
}

/**
 * Rule-short decide：S0→S9 短路；S1 SoftSkip（同观察即达）；S9 难则深链种子。
 */
export function decideAgentStepwise(obs: Observation, pack: CasePack): DecideResult {
  const reached = new Set(obs.reachedCheckpoints)
  const next = obs.nextCheckpointId

  if (
    (reached.has('s0-home') &&
      reached.has('s1-case-bind') &&
      reached.has('s2-start-session') &&
      reached.has('s3-timeline') &&
      reached.has('s4-hitl') &&
      reached.has('s5-session-casebind') &&
      reached.has('s6-sessions-filter') &&
      reached.has('s7-catalog') &&
      reached.has('s8-project-general') &&
      reached.has('s9-project-patent')) ||
    next == null
  ) {
    return { kind: 'stop', reason: 'success' }
  }

  switch (next) {
    case 's0-home':
      return { kind: 'action', action: { type: 'goto', url: AGENT_HOME } }

    case 's1-case-bind':
      // SoftSkip：已在 /agent 即视为过；短 wait 让 observer 记点
      return { kind: 'action', action: { type: 'wait', ms: 300 } }

    case 's2-start-session': {
      if (obs.url.includes('/agent/sessions/') && !obs.url.includes('sessions?')) {
        return { kind: 'action', action: { type: 'wait', ms: 400 } }
      }
      // 优先在 Home 点「开始办理」；否则回 Home
      if (
        obs.url.includes('/agent') &&
        !obs.url.includes('/sessions') &&
        !obs.url.includes('/projects') &&
        !obs.url.includes('/agents')
      ) {
        return {
          kind: 'action',
          action: { type: 'click', testId: 'home-send' },
        }
      }
      return { kind: 'action', action: { type: 'goto', url: AGENT_HOME } }
    }

    case 's3-timeline': {
      if (obs.url.includes('/agent/sessions/')) {
        return { kind: 'action', action: { type: 'wait', ms: 700 } }
      }
      // 兜底：种子会话必有轨迹
      return {
        kind: 'action',
        action: { type: 'goto', url: `${AGENT_BASE}/agent/sessions/sess-oa-1` },
      }
    }

    case 's4-hitl': {
      if (!obs.url.includes('sess-oa-1')) {
        return { kind: 'action', action: { type: 'goto', url: AGENT_HITL_URL } }
      }
      return { kind: 'action', action: { type: 'wait', ms: 800 } }
    }

    case 's5-session-casebind': {
      // 无案会话顶栏绑案：从 Home 再开一条；或当前会话已有 CaseBind
      if (
        obs.url.includes('/agent/sessions/') &&
        (obs.pageTextSnippet.includes('创建并绑定') ||
          obs.pageTextSnippet.includes('绑定已有') ||
          obs.pageTextSnippet.includes('已绑案件') ||
          obs.a11yText.includes('创建并绑定') ||
          obs.a11yText.includes('已绑案件'))
      ) {
        return { kind: 'action', action: { type: 'wait', ms: 400 } }
      }
      if (
        obs.url.includes('/agent') &&
        !obs.url.includes('/sessions') &&
        !obs.url.includes('/projects')
      ) {
        return {
          kind: 'action',
          action: { type: 'click', testId: 'home-send' },
        }
      }
      // 在 HITL 会话上也应有 CaseBind（已绑 c1）
      if (obs.url.includes('sess-oa-1')) {
        return { kind: 'action', action: { type: 'wait', ms: 500 } }
      }
      return { kind: 'action', action: { type: 'goto', url: AGENT_HOME } }
    }

    case 's6-sessions-filter': {
      // 须在列表页（勿把会话页 HITL「待确认」误判为已达）
      const onList =
        /\/agent\/sessions\/?(\?|$)/.test(obs.url) ||
        (obs.url.includes('/agent/sessions') &&
          !/\/agent\/sessions\/[^/?]+/.test(obs.url))
      if (onList && obs.url.includes('filter=needs_human')) {
        return { kind: 'action', action: { type: 'wait', ms: 500 } }
      }
      if (onList && obs.pageTextSnippet.includes('筛选：待确认')) {
        return { kind: 'action', action: { type: 'wait', ms: 500 } }
      }
      return {
        kind: 'action',
        action: { type: 'goto', url: AGENT_SESSIONS_HITL },
      }
    }

    case 's7-catalog': {
      if (obs.url.includes('/agent/agents')) {
        return { kind: 'action', action: { type: 'wait', ms: 500 } }
      }
      return { kind: 'action', action: { type: 'goto', url: AGENT_CATALOG } }
    }

    case 's8-project-general': {
      if (obs.url.includes('proj-demo-general')) {
        return { kind: 'action', action: { type: 'wait', ms: 600 } }
      }
      return {
        kind: 'action',
        action: { type: 'goto', url: AGENT_PROJ_GENERAL },
      }
    }

    case 's9-project-patent': {
      if (
        obs.url.includes('proj-demo-patent') &&
        (obs.url.includes('expert-search') ||
          obs.url.includes('/bots/') ||
          obs.pageTextSnippet.includes('pack=patent') ||
          obs.pageTextSnippet.includes('检索'))
      ) {
        return { kind: 'action', action: { type: 'wait', ms: 700 } }
      }
      return {
        kind: 'action',
        action: { type: 'goto', url: AGENT_PROJ_PATENT_EXPERT },
      }
    }

    default:
      return { kind: 'stop', reason: `stalled: unknown checkpoint ${next}` }
  }
}
