/** CP-figure-dual：首页 → 新建上下文 → mock 生成 → 打开画布编辑（figure:5187 · 样机级） */

import type { CasePack, DecideResult, Observation } from '../types.js'

export const CP_FIGURE_DUAL: CasePack = {
  id: 'CP-figure-dual',
  title: '生成+编辑双闭环：上下文 → mock 生成 → 画布编辑',
  baseURL: 'http://localhost:5187/',
  maxSteps: 20,
  abortOnHard: true,
  allowedActionsNote:
    '样机级双闭环；无真文生图 / 假延迟 1～2s / 样机横幅白名单；标题可走默认；勿被壳导航「② mock 生成」误判',
  checkpoints: [
    {
      id: 'cp-home',
      label: '附图资产入口',
      assert: { kind: 'heading', name: '附图资产' },
    },
    {
      id: 'cp-context',
      label: '填写生成上下文',
      assert: { kind: 'heading', name: '填写生成上下文' },
    },
    {
      id: 'cp-generate',
      label: 'mock 生成 / 套用模板草图',
      assert: { kind: 'heading', name: '套用模板草图' },
    },
    {
      id: 'cp-canvas',
      label: '画布编辑',
      assert: { kind: 'custom', id: 'figure-canvas' },
    },
  ],
}

/**
 * Rule-short decide：home → 新建附图 → 生成草图 → wait ready → 打开画布编辑。
 * 壳侧栏常驻「② mock 生成 / ③ 画布编辑」，decide 以 URL / heading 为准。
 */
export function decideFigureDual(obs: Observation, pack: CasePack): DecideResult {
  const reached = new Set(obs.reachedCheckpoints)
  const next = obs.nextCheckpointId

  if (
    (reached.has('cp-home') &&
      reached.has('cp-context') &&
      reached.has('cp-generate') &&
      reached.has('cp-canvas')) ||
    next == null
  ) {
    return { kind: 'stop', reason: 'success' }
  }

  switch (next) {
    case 'cp-home':
      return { kind: 'action', action: { type: 'goto', url: pack.baseURL } }

    case 'cp-context':
      return {
        kind: 'action',
        action: { type: 'click', role: 'button', name: /新建附图/ },
      }

    case 'cp-generate': {
      // 已在生成页：等 heading / 自动 startGenerate
      if (obs.url.includes('/generate')) {
        return { kind: 'action', action: { type: 'wait', ms: 800 } }
      }
      // 上下文页：点「生成草图」（标题可默认）
      if (obs.url.includes('/new') || reached.has('cp-context')) {
        return {
          kind: 'action',
          action: { type: 'click', role: 'button', name: /生成草图/ },
        }
      }
      return { kind: 'action', action: { type: 'wait', ms: 600 } }
    }

    case 'cp-canvas': {
      if (obs.url.includes('/edit/')) {
        return { kind: 'action', action: { type: 'wait', ms: 600 } }
      }
      // 说明文案常驻 "generating/ready"，勿用单词误判；仅认「正在套用…」为生成中
      if (obs.pageTextSnippet.includes('正在套用模板草图')) {
        return { kind: 'action', action: { type: 'wait', ms: 1200 } }
      }
      if (obs.url.includes('/generate')) {
        // ready / toast「请打开画布编辑」/ 主按钮 — 直接点
        return {
          kind: 'action',
          action: { type: 'click', role: 'button', name: /打开画布编辑/ },
        }
      }
      return { kind: 'action', action: { type: 'wait', ms: 800 } }
    }

    default:
      return { kind: 'stop', reason: `stalled: unknown checkpoint ${next}` }
  }
}
