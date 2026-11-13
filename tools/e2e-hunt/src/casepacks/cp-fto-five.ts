/** CP-fto-five：五步走到报告页（fto:5183 · 不要求真引擎） */

import type { CasePack, DecideResult, Observation } from '../types.js'

export const CP_FTO_FIVE: CasePack = {
  id: 'CP-fto-five',
  title: '五步走到报告页（不要求真引擎）',
  baseURL: 'http://localhost:5183/',
  maxSteps: 16,
  abortOnHard: true,
  allowedActionsNote:
    '规则短路：UI 下一步优先；种子态已有 features/hits，可直接步进；矩阵可先假比对',
  checkpoints: [
    {
      id: 'cp-home',
      label: '入口 · FTO 样机项目',
      assert: { kind: 'heading', name: 'FTO 样机项目' },
    },
    {
      id: 'cp-features',
      label: '① 产品特征表',
      assert: { kind: 'heading', name: '产品特征表' },
    },
    {
      id: 'cp-hits',
      label: '② 检索命中 / 工作篮',
      assert: { kind: 'heading', name: '检索命中 / 工作篮' },
    },
    {
      id: 'cp-matrix',
      label: '③ 特征 × 文献矩阵',
      assert: { kind: 'heading', name: '特征 × 文献矩阵' },
    },
    {
      id: 'cp-risk',
      label: '④ 风险汇总与覆盖',
      assert: { kind: 'heading', name: '风险汇总与覆盖' },
    },
    {
      id: 'cp-report',
      label: '⑤ 报告预览与 Confirm',
      assert: { kind: 'heading', name: '报告预览与 Confirm' },
    },
  ],
}

/**
 * Rule-short decide：按检查点序列点 UI 下一步（贴近探索；非真引擎）。
 * 约定：next=X 的动作用于到达 X（与 CP-search-smoke 同形）。
 */
export function decideFtoFive(obs: Observation, pack: CasePack): DecideResult {
  const reached = new Set(obs.reachedCheckpoints)
  const next = obs.nextCheckpointId

  if (reached.has('cp-report') || next == null) {
    return { kind: 'stop', reason: 'success' }
  }

  switch (next) {
    case 'cp-home':
      return { kind: 'action', action: { type: 'goto', url: pack.baseURL } }

    case 'cp-features':
      return {
        kind: 'action',
        action: { type: 'click', role: 'button', name: /进入特征表/ },
      }

    case 'cp-hits':
      return {
        kind: 'action',
        action: { type: 'click', role: 'button', name: /下一步：命中/ },
      }

    case 'cp-matrix':
      return {
        kind: 'action',
        action: { type: 'click', role: 'button', name: /下一步：矩阵/ },
      }

    case 'cp-risk': {
      // 可选：先自动填假比对（白名单 toast），再下一步到风险
      if (
        obs.pageTextSnippet.includes('矩阵空') ||
        (!obs.pageTextSnippet.includes('可能覆盖') &&
          !obs.pageTextSnippet.includes('未涉及') &&
          !obs.pageTextSnippet.includes('需人工') &&
          obs.url.includes('/matrix'))
      ) {
        if (
          obs.pageTextSnippet.includes('自动填假比对') ||
          obs.a11yText.includes('自动填假比对')
        ) {
          return {
            kind: 'action',
            action: { type: 'click', role: 'button', name: /自动填假比对/ },
          }
        }
      }
      return {
        kind: 'action',
        action: { type: 'click', role: 'button', name: /下一步：风险/ },
      }
    }

    case 'cp-report':
      return {
        kind: 'action',
        action: { type: 'click', role: 'button', name: /下一步：报告/ },
      }

    default:
      return { kind: 'stop', reason: `stalled: unknown checkpoint ${next}` }
  }
}
