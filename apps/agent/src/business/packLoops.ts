/**
 * Knife1 · F5 内循环 + 跨席环边（样机 mock · 无真沙箱）
 * 权威：patent-pack-design §5.5 · agent-pack-loops-roadmap Knife1
 */
import type { ProjectExpertId } from '../projects/types'
import type { BusinessConfirmKind } from './businessSeats'

/** 自修复上限（查新覆盖度 / 撰写四类校验） */
export const SELF_HEAL_MAX = 3

/** 交底缺项追问上限（内循环） */
export const DISCLOSURE_ASK_MAX = 5

export type ProcessLogKind =
  | 'disclosure_ask'
  | 'research_heal'
  | 'draft_heal'
  | 'hitl_return'
  | 'figure_feedback'
  | 'research_pessimistic'
  | 'escalate'
  | 'advance'

export type ProcessLogEntry = {
  id: string
  caseId: string
  at: string
  kind: ProcessLogKind
  /** 人话（业务面可上屏） */
  message: string
  /** 专家台补充一行（仍禁 validator 英文黑话） */
  detail?: string
  seatId?: ProjectExpertId
  attempt?: number
  maxAttempts?: number
  /** 灰显：HITL④ 不乐观回流示意 */
  muted?: boolean
}

export function processLogStamp(): string {
  return new Date().toLocaleString('zh-CN', { hour12: false })
}

export function processLogId(prefix = 'plog'): string {
  return `${prefix}-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`
}

/** 内循环脚本：交底缺项追问轮次 */
export function disclosureAskLines(
  caseId: string,
  rounds = 2,
): ProcessLogEntry[] {
  const n = Math.min(Math.max(rounds, 1), DISCLOSURE_ASK_MAX)
  const lines: ProcessLogEntry[] = []
  for (let i = 1; i <= n; i++) {
    lines.push({
      id: processLogId('ask'),
      caseId,
      at: processLogStamp(),
      kind: 'disclosure_ask',
      seatId: 'expert-disclosure',
      attempt: i,
      maxAttempts: DISCLOSURE_ASK_MAX,
      message: `交底缺项追问 · 第 ${i} 轮（还差实施例细节）`,
      detail: `六段采集未齐 · 追问 ${i}/${DISCLOSURE_ASK_MAX}`,
    })
  }
  lines.push({
    id: processLogId('ask'),
    caseId,
    at: processLogStamp(),
    kind: 'advance',
    seatId: 'expert-disclosure',
    message: '交底要点已齐 · 待确认交底',
  })
  return lines
}

/**
 * 查新覆盖度 / 撰写四类校验自修复脚本。
 * passAt：第几次通过（≤3）；若 >3 则 escalate。
 */
export function selfHealScript(
  caseId: string,
  seat: 'expert-research' | 'expert-draft',
  passAt = 2,
): ProcessLogEntry[] {
  const kind: ProcessLogKind =
    seat === 'expert-research' ? 'research_heal' : 'draft_heal'
  const label =
    seat === 'expert-research' ? '查新覆盖度' : '撰写四类校验'
  const lines: ProcessLogEntry[] = []
  const failUntil = Math.min(Math.max(passAt - 1, 0), SELF_HEAL_MAX)

  for (let i = 1; i <= failUntil; i++) {
    lines.push({
      id: processLogId('heal'),
      caseId,
      at: processLogStamp(),
      kind,
      seatId: seat,
      attempt: i,
      maxAttempts: SELF_HEAL_MAX,
      message: `检查未通过·已重试 ${i}/${SELF_HEAL_MAX}`,
      detail: `${label}未过 · 节点内自修复`,
    })
  }

  if (passAt > SELF_HEAL_MAX) {
    lines.push({
      id: processLogId('esc'),
      caseId,
      at: processLogStamp(),
      kind: 'escalate',
      seatId: seat,
      attempt: SELF_HEAL_MAX + 1,
      maxAttempts: SELF_HEAL_MAX,
      message: '需人工接手',
      detail: `${label}超 ${SELF_HEAL_MAX} 次 · 已升级兜底（禁静默死循环）`,
    })
    return lines
  }

  if (passAt >= 1) {
    const i = Math.min(passAt, SELF_HEAL_MAX)
    if (failUntil < i) {
      // 通过那一次也记一条（若 passAt=1 则直接过，无 fail）
    }
    lines.push({
      id: processLogId('heal'),
      caseId,
      at: processLogStamp(),
      kind,
      seatId: seat,
      attempt: i,
      maxAttempts: SELF_HEAL_MAX,
      message:
        failUntil === 0
          ? `${label}一次通过`
          : `检查已通过（重试 ${i}/${SELF_HEAL_MAX}）`,
      detail: `${label}自修复完成`,
    })
  }
  return lines
}

/** HITL③/⑤ 驳回带批注重跑 */
export function hitlReturnLog(
  caseId: string,
  kind: BusinessConfirmKind,
  note: string,
): ProcessLogEntry {
  const seat: ProjectExpertId =
    kind === 'disclosure_ready'
      ? 'expert-disclosure'
      : kind === 'claims_ready'
        ? 'expert-draft'
        : kind === 'research_ready'
          ? 'expert-research'
          : kind === 'go_nogo'
            ? 'expert-intake'
            : kind === 'file_authorize'
              ? 'expert-filing'
              : 'expert-oa'
  const human =
    kind === 'research_ready'
      ? '请再查一轮'
      : '请按意见修改'
  return {
    id: processLogId('hitl'),
    caseId,
    at: processLogStamp(),
    kind: 'hitl_return',
    seatId: seat,
    message: `${human} · ${note.trim() || '带批注重跑'}`,
    detail: '退回修改 · 该项回到待确认',
  }
}

/** 附图 → 撰写 feedback（术语不一致） */
export function figureFeedbackLog(caseId: string): ProcessLogEntry {
  return {
    id: processLogId('fig'),
    caseId,
    at: processLogStamp(),
    kind: 'figure_feedback',
    seatId: 'expert-figure',
    message: '附图退回撰写改术语',
    detail: '图注与权项术语不一致 · 跨席 feedback',
  }
}

/** HITL④ 不乐观 → 回流示意（可灰） */
export function researchPessimisticLog(caseId: string): ProcessLogEntry {
  return {
    id: processLogId('pes'),
    caseId,
    at: processLogStamp(),
    kind: 'research_pessimistic',
    seatId: 'expert-research',
    message: '查新不乐观 · 建议换方向或调布局（示意）',
    detail: '回流布局/产业全景 · 本刀仅灰示意',
    muted: true,
  }
}

export function escalateLog(
  caseId: string,
  seatId: ProjectExpertId,
  label: string,
): ProcessLogEntry {
  return {
    id: processLogId('esc'),
    caseId,
    at: processLogStamp(),
    kind: 'escalate',
    seatId,
    attempt: SELF_HEAL_MAX + 1,
    maxAttempts: SELF_HEAL_MAX,
    message: '需人工接手',
    detail: `${label}超限 · 禁静默死循环`,
  }
}
