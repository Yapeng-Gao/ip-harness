/**
 * 案子助手 · 巡检建议（样机）· ≤3 条 · 可代发 feedback / 去确认
 */
import type { ProjectExpertId } from '../projects/types'
import type { BusinessConfirmKind, BusinessStageId } from './businessSeats'
import {
  businessSeatLabel,
  CONFIRM_KIND_LABEL,
  CONFIRM_META,
} from './businessSeats'
import { feedbackEdgesFrom } from './seatFeedback'
import { buildHitlAssistReview } from './hitlAssist'
import { extractCasePlanFactBlock } from './casePlanDrive'

export type CaseAssistantAction =
  | {
      type: 'go_confirm'
      confirmId: string
      label: string
    }
  | {
      type: 'proxy_feedback'
      fromSeat: ProjectExpertId
      toSeat: ProjectExpertId
      reason: string
      label: string
    }
  | {
      type: 'word_hint'
      label: string
    }

export type CaseAssistantSuggestion = {
  id: string
  title: string
  body: string
  action: CaseAssistantAction
}

type PendingLite = {
  id: string
  kind: BusinessConfirmKind
  title: string
}

type InspectInput = {
  stageId: BusinessStageId
  activeSeat: ProjectExpertId
  pending: PendingLite[]
}

/**
 * 按阶段 / 当前席 / 待确认生成 ≤3 条建议
 */
export function buildCaseAssistantSuggestions(
  input: InspectInput,
): CaseAssistantSuggestion[] {
  const out: CaseAssistantSuggestion[] = []

  for (const p of input.pending.slice(0, 2)) {
    const review = buildHitlAssistReview(p.kind)
    const owner = CONFIRM_META[p.kind].preparedBy
    out.push({
      id: `confirm-${p.id}`,
      title:
        review.verdict === 'return'
          ? `待确认「${CONFIRM_KIND_LABEL[p.kind]}」· 助手建议退回`
          : `待确认「${CONFIRM_KIND_LABEL[p.kind]}」· 助手建议确认`,
      body: `${review.reasons[0]} · 去确认页可看完整审校（${owner}交卷）`,
      action: {
        type: 'go_confirm',
        confirmId: p.id,
        label: '去看审校并确认',
      },
    })
  }

  if (out.length < 3) {
    const edges = feedbackEdgesFrom(input.activeSeat)
    const edge = edges[0]
    if (edge) {
      out.push({
        id: `fb-${edge.from}-${edge.to}`,
        title: `${edge.chip}（样机代办）`,
        body: `${edge.defaultReason} · 一点代发，不必自己找芯片`,
        action: {
          type: 'proxy_feedback',
          fromSeat: edge.from,
          toSeat: edge.to,
          reason: edge.defaultReason,
          label: edge.chip,
        },
      })
    }
  }

  if (out.length < 3) {
    const stageHint = stagePatrolLine(input.stageId, input.activeSeat)
    if (
      stageHint &&
      !out.some(
        (s) =>
          s.action.type === 'proxy_feedback' &&
          stageHint.action.type === 'proxy_feedback' &&
          s.action.toSeat === stageHint.action.toSeat &&
          s.action.fromSeat === stageHint.action.fromSeat,
      )
    ) {
      out.push(stageHint)
    }
  }

  if (out.length < 3) {
    out.push({
      id: 'word-hint',
      title: '转 Word（示意）',
      body: '样机：点后在过程里记一行「已导出 Word 草案」，非真 Office',
      action: { type: 'word_hint', label: '示意转 Word' },
    })
  }

  return out.slice(0, 3)
}

function stagePatrolLine(
  stageId: BusinessStageId,
  activeSeat: ProjectExpertId,
): CaseAssistantSuggestion | null {
  const seat = businessSeatLabel(activeSeat)
  if (stageId === 'drafting' && activeSeat === 'expert-draft') {
    return {
      id: 'stage-draft-disclosure',
      title: '交底效果数据偏少 · 建议请交底补强',
      body: `当前在「${seat}」· 可代发跨席优化，不回退本席进度`,
      action: {
        type: 'proxy_feedback',
        fromSeat: 'expert-draft',
        toSeat: 'expert-disclosure',
        reason: '撰写需要补效果数据与实施例笔墨',
        label: '请交底调整',
      },
    }
  }
  if (stageId === 'intake' && activeSeat === 'expert-intake') {
    return {
      id: 'stage-intake-research',
      title: '立项评分吃紧时 · 可请查新再扫一轮',
      body: `当前在「${seat}」· 助手可代发`,
      action: {
        type: 'proxy_feedback',
        fromSeat: 'expert-intake',
        toSeat: 'expert-research',
        reason: '立项评分吃紧，请再扫一轮覆盖度',
        label: '请查新再扫一轮',
      },
    }
  }
  return null
}

export type CasePlanPatchMode = 'complete_from_patrol' | 'rewrite'

export type CasePlanPatchInput = {
  mode: CasePlanPatchMode
  currentPlan?: string
  stageId: BusinessStageId
  activeSeat: ProjectExpertId
  stageTitle: string
  seatLabel: string
  caseTitle?: string
}

/**
 * 案子助手改「本案计划」· 样机脚本模板（非真 LLM）
 * - complete_from_patrol：保留原文，追加巡检补全段
 * - rewrite：改写骨架；若原文有客户事实段则 prepend 保留
 */
export function patchCasePlan(input: CasePlanPatchInput): string {
  const stamp = new Date().toISOString().slice(0, 16).replace('T', ' ')
  if (input.mode === 'complete_from_patrol') {
    const base = (input.currentPlan ?? '').trim() || '（尚无本案计划 · 由助手按巡检补全）'
    const add = [
      '',
      `—— 巡检补全（${stamp}）——`,
      `当前阶段：${input.stageTitle} · 当前节点：${input.seatLabel}`,
      `建议：先完成本节点交卷 →「待我确认」；跨节点对齐再组本案团队（讨论不产闸）。`,
      `助手备注：按巡检补强计划骨架，未改确认闸。`,
    ].join('\n')
    return `${base}${add}`
  }

  const facts = extractCasePlanFactBlock(input.currentPlan ?? '')
  const name = input.caseTitle?.trim() || '本案'
  const skeleton = [
    `【本案计划 · 助手改写 ${stamp}】`,
    `案子：${name}`,
    `目标：按当前阶段「${input.stageTitle}」推进至可交卷；人确认后解锁下游节点。`,
    `办理起点：当前在「${input.seatLabel}」；这一站干活 → 交卷 → 待我确认。`,
    `下一步：本节点交卷前核对成果；需要跨节点口径时再组队（团队不产闸）。`,
    `助手备注：脚本改写样机，非真 LLM；客户事实段已尽量保留。`,
  ].join('\n')
  if (!facts) return skeleton
  // 事实块已含「案子/目标」时，骨架里同名字段仍保留作办理意图；事实 prepend 在前
  return `${facts}\n\n${skeleton}`
}
