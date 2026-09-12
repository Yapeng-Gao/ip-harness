/**
 * Enterprise Wave2 · Docket 升级阶梯
 * 提醒 → 升级企业 IP → 标记风险；原型 · 内存 · 不接真通知
 */
import type {
  DocketEscalationLevel,
  DocketEvent,
  PatentCase,
  StageId,
  WorkbenchTodo,
} from '../types'

export type DocketEscalateAction =
  | 'remind'
  | 'escalate_enterprise'
  | 'mark_at_risk'
  | 'complete'

export const ESCALATION_LABELS: Record<DocketEscalationLevel, string> = {
  none: '未升级',
  reminded: '已提醒',
  escalated_enterprise: '已升级企业 IP',
  at_risk: '已标风险',
}

export function effectiveEscalationLevel(
  e: Pick<DocketEvent, 'escalationLevel'>,
): DocketEscalationLevel {
  return e.escalationLevel ?? 'none'
}

/** 逾期（及可选即将到期）可走阶梯 */
export function canEscalateStatus(
  status: DocketEvent['status'],
  includeDueSoon = true,
): boolean {
  if (status === 'done') return false
  if (status === 'overdue') return true
  if (includeDueSoon && status === 'due_soon') return true
  return false
}

/** 严格阶梯：每步只暴露下一步 + 办结 */
export function ladderNextActions(e: DocketEvent): DocketEscalateAction[] {
  if (e.status === 'done') return []
  if (!canEscalateStatus(e.status, true)) {
    return ['complete']
  }
  const level = effectiveEscalationLevel(e)
  const out: DocketEscalateAction[] = []
  if (level === 'none') out.push('remind')
  else if (level === 'reminded') out.push('escalate_enterprise')
  else if (level === 'escalated_enterprise') out.push('mark_at_risk')
  // at_risk: no further escalate
  out.push('complete')
  return out
}

export function applyEscalateAction(
  e: DocketEvent,
  action: DocketEscalateAction,
  opts: { at?: string; actor?: string },
): {
  event: DocketEvent
  caseRiskBump?: '高'
  timelineTitle: string
  timelineDesc: string
  auditDetail: string
} {
  const at = opts.at ?? new Date().toISOString()
  const actor = opts.actor ?? 'user'
  const isoDay = at.slice(0, 10)

  if (action === 'complete') {
    return {
      event: {
        ...e,
        status: 'done',
        note: [e.note, `办结期限 · ${isoDay}`].filter(Boolean).join(' · '),
        escalationAt: at,
        escalationActor: actor,
      },
      timelineTitle: '期限办结',
      timelineDesc: `${e.title} · 已办结并清升级待办`,
      auditDetail: `DocketComplete · ${e.id} · ${e.title}`,
    }
  }

  if (action === 'remind') {
    return {
      event: {
        ...e,
        escalationLevel: 'reminded',
        escalationAt: at,
        escalationActor: actor,
        note: [e.note, `已记录提醒 · ${isoDay} · 无真推送`].filter(Boolean).join(' · '),
      },
      timelineTitle: '期限提醒',
      timelineDesc: `${e.title} · 已记录提醒 · 无真推送（演示通道）`,
      auditDetail: `DocketEscalate · remind · ${e.id} · ${e.title}`,
    }
  }

  if (action === 'escalate_enterprise') {
    return {
      event: {
        ...e,
        escalationLevel: 'escalated_enterprise',
        escalationAt: at,
        escalationActor: actor,
        note: [e.note, `已升级企业 IP · ${isoDay}`].filter(Boolean).join(' · '),
      },
      timelineTitle: '期限升级 · 企业 IP',
      timelineDesc: `${e.title} · 谁该动=enterprise_ip`,
      auditDetail: `DocketEscalate · escalate_enterprise · ${e.id} · ${e.title}`,
    }
  }

  // mark_at_risk
  return {
    event: {
      ...e,
      escalationLevel: 'at_risk',
      atRisk: true,
      escalationAt: at,
      escalationActor: actor,
      note: [e.note, `已标风险 · ${isoDay}`].filter(Boolean).join(' · '),
    },
    caseRiskBump: '高',
    timelineTitle: '期限风险旗标',
    timelineDesc: `${e.title} · 事件与案件已标风险`,
    auditDetail: `DocketEscalate · mark_at_risk · ${e.id} · ${e.title}`,
  }
}

export function buildDocketEscalateTodo(input: {
  event: DocketEvent
  caseTitle: string
  stage: StageId
  now?: number
}): WorkbenchTodo {
  const { event, caseTitle, stage } = input
  const level = effectiveEscalationLevel(event)
  const riskTag = event.atRisk || level === 'at_risk' ? ' · 风险' : ''
  return {
    id: `dyn-docket-${event.id}-${input.now ?? Date.now()}`,
    caseId: event.caseId,
    stage,
    title: `期限升级 · ${caseTitle} · ${event.title}${riskTag}`,
    due: event.dueDate,
    priority: '高',
    enterpriseLabel: '处理逾期/即将到期期限 · 查看 Docket',
    agencyLabel: '企业 IP 已接管期限升级（示意）',
    actionPath: `/docket?case=${event.caseId}`,
    assignee: 'enterprise',
    assigneePersona: 'enterprise_ip',
    source: 'docket',
    actionKind: 'docket_escalate',
    docketEventId: event.id,
  }
}

/** 消账：同期限事件的开放 docket 升级待办 */
export function completeDocketEscalateTodos(
  todos: WorkbenchTodo[],
  docketEventId: string,
): WorkbenchTodo[] {
  return todos.map((t) =>
    t.docketEventId === docketEventId &&
    t.source === 'docket' &&
    !t.done
      ? { ...t, done: true }
      : t,
  )
}

/** 升级/标风险时接替同事件开放项 */
export function upsertDocketEscalateTodo(
  todos: WorkbenchTodo[],
  todo: WorkbenchTodo,
): WorkbenchTodo[] {
  const completed = todos.map((t) =>
    t.docketEventId === todo.docketEventId &&
    t.source === 'docket' &&
    !t.done
      ? { ...t, done: true }
      : t,
  )
  return [{ ...todo, done: false }, ...completed]
}

export function docketInboxWho(
  e: DocketEvent,
  role: 'enterprise' | 'agency',
): string {
  const level = effectiveEscalationLevel(e)
  if (level === 'escalated_enterprise' || level === 'at_risk') {
    return role === 'enterprise' ? '我（企业 IP）' : '企业 IP'
  }
  if (level === 'reminded') return '已提醒 · 待升级'
  return '关注期限'
}

export function docketInboxSubtitle(e: DocketEvent): string {
  const statusLabel =
    e.status === 'overdue' ? '已逾期' : e.status === 'due_soon' ? '即将到期' : e.status
  const level = effectiveEscalationLevel(e)
  const parts = [e.title, statusLabel]
  if (level === 'escalated_enterprise' || level === 'at_risk') {
    parts.push('期限升级')
  } else if (level === 'reminded') {
    parts.push(ESCALATION_LABELS.reminded)
  }
  if (e.atRisk || level === 'at_risk') parts.push('风险旗标')
  return parts.join(' · ')
}

export function bumpCaseRisk(c: PatentCase, to: '高'): PatentCase {
  if (c.risk === '高') return c
  return { ...c, risk: to }
}
