/**
 * Knife1 · F5 内循环 + 跨席环边；Knife2 · F6 OA N 通；Knife3 · F9→F3 飞轮（样机 mock）
 * 权威：patent-pack-design §5.3 / §5.5 · agent-pack-loops-roadmap Knife1–3
 * ≠ FTO：维权席 = expert-enforcement，勿用 expert-fto
 */
import type { ProjectExpertId } from '../projects/types'
import { businessSeatLabel, type BusinessConfirmKind } from './businessSeats'

/** 自修复上限（查新覆盖度 / 撰写四类校验） */
export const SELF_HEAL_MAX = 3

/** 交底缺项追问上限（内循环） */
export const DISCLOSURE_ASK_MAX = 5


/** 超范围 blocker：0 次自修复（一次失败→需人工接手） */
export const OA_BLOCKER_SELF_HEAL_MAX = 0

/** 理由分类 mock 分支 */
export type OaReasonClass = 'inventive' | 'clarity' | 'sufficiency' | 'novelty'

export const OA_REASON_LABEL: Record<OaReasonClass, string> = {
  inventive: '创造性',
  clarity: '清楚性',
  sufficiency: '公开不充分',
  novelty: '新颖性',
}

export type ProcessLogKind =
  | 'disclosure_ask'
  | 'research_heal'
  | 'draft_heal'
  | 'hitl_return'
  | 'figure_feedback'
  | 'seat_feedback'
  | 'research_pessimistic'
  | 'intake_low_score'
  | 'escalate'
  | 'advance'
  | 'oa_classify'
  | 'oa_subtask'
  | 'oa_round'
  | 'oa_submit'
  | 'oa_blocker'
  | 'monitor_event'
  | 'layout_gap'
  | 'layout_flywheel'
  | 'layout_pending'

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
  /** OA 第 N 通 */
  oaRound?: number
  /** 理由分类（创造性 / 清楚性 …） */
  oaReason?: OaReasonClass
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
              : kind === 'layout_adjust'
                ? 'expert-layout'
                : 'expert-oa'
  const human =
    kind === 'research_ready'
      ? '请再查一轮'
      : kind === 'layout_adjust'
        ? '请按意见调整布局'
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

/** 任意下游 → 上游 feedback 信封（业务面人话） */
export function seatFeedbackLog(
  caseId: string,
  fromSeat: ProjectExpertId,
  toSeat: ProjectExpertId,
  reason: string,
): ProcessLogEntry {
  return {
    id: processLogId('fb'),
    caseId,
    at: processLogStamp(),
    kind: 'seat_feedback',
    seatId: fromSeat,
    message: `请「${businessSeatLabel(toSeat)}」调整 · 跨席 feedback`,
    detail: `来自「${businessSeatLabel(fromSeat)}」· ${reason.slice(0, 100)}`,
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
    detail: 'HITL④ 不乐观回流 F2/F3 · 灰入口（可与飞轮串联）',
    muted: true,
  }
}

/** 立项低分回流 F4→F2（灰示意 · 可与 Knife1 灰入口复用） */
export function intakeLowScoreLog(caseId: string): ProcessLogEntry {
  return {
    id: processLogId('low'),
    caseId,
    at: processLogStamp(),
    kind: 'intake_low_score',
    seatId: 'expert-intake',
    message: '立项评分偏低 · 建议放弃或换方向（示意）',
    detail: 'F4→F2 低分回流 · 灰入口（评分<50 mock）',
    muted: true,
  }
}

/** 维权/监测事件（mock · 无真爬虫） */
export function monitorEventLog(caseId: string): ProcessLogEntry {
  return {
    id: processLogId('mon'),
    caseId,
    at: processLogStamp(),
    kind: 'monitor_event',
    seatId: 'expert-enforcement',
    message: '监测事件 · 竞品进入空白点（mock）',
    detail: '无效维权顾问 · 无真爬虫 · ≠ FTO（expert-fto）',
  }
}

/** 布局漏洞报告（feedback 信封载荷） */
export function layoutGapReportLog(caseId: string): ProcessLogEntry {
  return {
    id: processLogId('gap'),
    caseId,
    at: processLogStamp(),
    kind: 'layout_gap',
    seatId: 'expert-enforcement',
    message: '布局漏洞报告已生成',
    detail: '全面覆盖比对 · 稳定性初筛 · feedback 信封载荷（mock）',
  }
}

/** F9→F3 回流信封到达布局策略师 */
export function layoutFlywheelLog(caseId: string): ProcessLogEntry {
  return {
    id: processLogId('fly'),
    caseId,
    at: processLogStamp(),
    kind: 'layout_flywheel',
    seatId: 'expert-layout',
    message: '布局漏洞回流 · 信封已达布局策略师',
    detail: 'F9→F3 飞轮 · expert-enforcement → expert-layout（≠ expert-fto）',
  }
}

/** 布局待拍板（HITL①） */
export function layoutPendingLog(caseId: string): ProcessLogEntry {
  return {
    id: processLogId('lay'),
    caseId,
    at: processLogStamp(),
    kind: 'layout_pending',
    seatId: 'expert-layout',
    message: '布局待拍板 · 请确认布局调整',
    detail: 'HITL① 布局方案 v(n+1) · 补局建议已就绪',
  }
}

/**
 * F9→F3 飞轮故事线：监测 → 漏洞报告 → 回流信封 → 布局待拍板
 * 串联灰入口：查新不乐观 + 立项低分
 */
export function layoutFlywheelScript(caseId: string): ProcessLogEntry[] {
  return [
    monitorEventLog(caseId),
    layoutGapReportLog(caseId),
    layoutFlywheelLog(caseId),
    layoutPendingLog(caseId),
    researchPessimisticLog(caseId),
    intakeLowScoreLog(caseId),
  ]
}



export function oaClassifyLog(
  caseId: string,
  reason: OaReasonClass,
  round = 1,
): ProcessLogEntry {
  return {
    id: processLogId('oacls'),
    caseId,
    at: processLogStamp(),
    kind: 'oa_classify',
    seatId: 'expert-oa',
    oaRound: round,
    oaReason: reason,
    message: `第 ${round} 通 · 理由分类：${OA_REASON_LABEL[reason]}`,
    detail: '审查答复席 · 理由分类器（mock 分支）',
  }
}

/** 子任务汇入示意：创造性→补充检索；清楚性/公开不充分→修术语 */
export function oaSubtaskMergeLogs(
  caseId: string,
  reason: OaReasonClass,
  round = 1,
): ProcessLogEntry[] {
  if (reason === 'inventive' || reason === 'novelty') {
    return [
      {
        id: processLogId('oasub'),
        caseId,
        at: processLogStamp(),
        kind: 'oa_subtask',
        seatId: 'expert-research',
        oaRound: round,
        oaReason: reason,
        message: `第 ${round} 通 · 子任务汇入：补充检索`,
        detail: '查新子 Run → 汇入答复包（示意）',
      },
    ]
  }
  return [
    {
      id: processLogId('oasub'),
      caseId,
      at: processLogStamp(),
      kind: 'oa_subtask',
      seatId: 'expert-draft',
      oaRound: round,
      oaReason: reason,
      message: `第 ${round} 通 · 子任务汇入：修术语 / 补实施例`,
      detail: '撰写子 Run → 汇入答复包（示意）',
    },
  ]
}

/** 第 N 通通知书到达 → 回答复入口 */
export function oaRoundArriveLog(caseId: string, round: number): ProcessLogEntry {
  return {
    id: processLogId('oarnd'),
    caseId,
    at: processLogStamp(),
    kind: 'oa_round',
    seatId: 'expert-oa',
    oaRound: round,
    message:
      round <= 1
        ? `第 ${round} 通审查意见到达 · 可开始答复`
        : `第 ${round} 通通知书到达 · 回到答复入口`,
    detail: 'N 通外循环 · 计数可见（无真局端）',
  }
}

export function oaSubmitLog(caseId: string, round: number): ProcessLogEntry {
  return {
    id: processLogId('oasubmit'),
    caseId,
    at: processLogStamp(),
    kind: 'oa_submit',
    seatId: 'expert-oa',
    oaRound: round,
    message: `第 ${round} 通答复已提交（样机）`,
    detail: '策略已确认 · 等待下一通或结案',
  }
}

/**
 * 超范围 blocker：一次失败 → 需人工接手（0 次自修复）
 * 禁止出现「自动重试修改」假闭环
 */
export function oaBlockerEscalateLog(
  caseId: string,
  round = 1,
): ProcessLogEntry {
  return {
    id: processLogId('oablk'),
    caseId,
    at: processLogStamp(),
    kind: 'oa_blocker',
    seatId: 'expert-oa',
    oaRound: round,
    attempt: 1,
    maxAttempts: OA_BLOCKER_SELF_HEAL_MAX,
    message: '需人工接手',
    detail: `超范围红线 · 修改无原始依据 · 自修复 ${OA_BLOCKER_SELF_HEAL_MAX} 次（禁自动重试）`,
  }
}

/** 准备「确认答复策略」前的 OA 剧本：分类 → 子任务汇入 */
export function oaStrategyPrepScript(
  caseId: string,
  reason: OaReasonClass = 'inventive',
  round = 1,
): ProcessLogEntry[] {
  return [
    oaClassifyLog(caseId, reason, round),
    ...oaSubtaskMergeLogs(caseId, reason, round),
    {
      id: processLogId('oaadv'),
      caseId,
      at: processLogStamp(),
      kind: 'advance',
      seatId: 'expert-oa',
      oaRound: round,
      oaReason: reason,
      message: `第 ${round} 通 · 答复策略草案已就绪 · 待确认答复策略`,
      detail: 'HITL⑥ 策略确认闸',
    },
  ]
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
