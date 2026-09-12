/**
 * Enterprise Wave2 · Watch / 年费 SLA → 统一 Inbox（纯函数）
 * 与 Docket 年费去重；Persona：企业看升级/高风险/超 SLA，代理看可处置。
 */
import type {
  DocketEvent,
  PersonaId,
  UserRole,
  WatchAlert,
  WatchAlertStatus,
} from '../types'
import { personaInboxMode } from '../data/persona'
import { appHref } from '../lib/deepLinks'

export interface MaintainScheduleRow {
  id: string
  year: number
  due: string
  amount: string
  paid: boolean
  officialFee?: number
  /** 可选说明（日程洞等） */
  label?: string
}

export interface WatchAlertWithCase extends WatchAlert {
  caseId: string
}

export interface MaintainRowWithCase extends MaintainScheduleRow {
  caseId: string
}

const OPEN_STATUSES: WatchAlertStatus[] = ['待处理', '处理中']

/** 维持「即将到期」窗口（天） */
export const MAINTAIN_SOON_DAYS = 30

export function todayIsoDay(now = new Date()): string {
  return now.toISOString().slice(0, 10)
}

export function daysBetween(a: string, b: string): number {
  const ms = Date.parse(b) - Date.parse(a)
  return Math.round(ms / 86400000)
}

export function isWatchOpen(a: Pick<WatchAlert, 'status'>): boolean {
  return OPEN_STATUSES.includes(a.status)
}

export function isWatchHighRisk(a: Pick<WatchAlert, 'level'>): boolean {
  const lv = (a.level ?? '').trim()
  return lv === '高' || lv.startsWith('高') || /high/i.test(lv)
}

export function isWatchOverSla(
  a: Pick<WatchAlert, 'slaDue'>,
  today = todayIsoDay(),
): boolean {
  if (!a.slaDue) return false
  return a.slaDue < today
}

/** 未关闭且（超 SLA / 高风险 / 待处置） */
export function watchNeedsInbox(
  a: WatchAlert,
  today = todayIsoDay(),
): boolean {
  if (!isWatchOpen(a)) return false
  return (
    isWatchOverSla(a, today) ||
    isWatchHighRisk(a) ||
    a.status === '待处理' ||
    a.status === '处理中'
  )
}

/**
 * Persona / role：企业看升级·高风险·超 SLA；代理看可处置项。
 */
export function watchVisibleToActor(
  a: WatchAlert,
  role: UserRole,
  persona?: PersonaId,
  today = todayIsoDay(),
): boolean {
  if (persona) {
    const mode = personaInboxMode(persona)
    if (mode === 'portal' || mode === 'committee') return false
  }
  if (!watchNeedsInbox(a, today)) return false
  const over = isWatchOverSla(a, today)
  const high = isWatchHighRisk(a)
  if (role === 'enterprise') {
    // 升级/高风险/超 SLA；处理中亦视为待企业决策
    return high || over || a.status === '处理中' || a.status === '待处理'
  }
  // agency：可处置（待处理/处理中）
  return isWatchOpen(a)
}

export function watchInboxWho(a: WatchAlert, role: UserRole): string {
  const over = isWatchOverSla(a)
  const high = isWatchHighRisk(a)
  if (role === 'enterprise') {
    if (over || high) return '我（企业）· 升级/决策'
    return '我（企业）· 确认告警'
  }
  if (a.status === '待处理' && !a.agencyOpinion) return '我（代理）· 出具意见'
  return '我（代理）· 可处置'
}

export function watchInboxSubtitle(a: WatchAlert, today = todayIsoDay()): string {
  const bits: string[] = ['Watch']
  if (isWatchOverSla(a, today)) bits.push('超 SLA')
  if (isWatchHighRisk(a)) bits.push(`风险${a.level}`)
  bits.push(a.status)
  if (a.slaDue) bits.push(`SLA ${a.slaDue}`)
  return bits.join(' · ')
}

export function watchDeepLink(caseId: string, alertId?: string): string {
  const base = `/workbench/watch/${caseId}`
  const path = alertId ? `${base}?alert=${alertId}` : base
  return appHref(path)
}

export type MaintainUrgency = 'overdue' | 'due_soon'

export function maintainUrgency(
  due: string,
  today = todayIsoDay(),
  soonDays = MAINTAIN_SOON_DAYS,
): MaintainUrgency | null {
  if (!due) return null
  if (due < today) return 'overdue'
  const d = daysBetween(today, due)
  if (d <= soonDays) return 'due_soon'
  return null
}

/** Docket 是否已覆盖同案同年费到期日（未 done） */
export function docketCoversAnnuity(
  docketEvents: DocketEvent[],
  caseId: string,
  due: string,
): boolean {
  return docketEvents.some(
    (e) =>
      e.caseId === caseId &&
      e.ruleId === 'annuity' &&
      e.status !== 'done' &&
      e.dueDate === due,
  )
}

/**
 * Maintain 日程洞：未缴 + 即将到期/逾期，且 Docket 未覆盖同 due。
 * 不与 handoff 工作台行硬去重（不同粒度；对照表诚实标注轻度并存）。
 */
export function maintainNeedsInbox(
  row: MaintainScheduleRow,
  caseId: string,
  docketEvents: DocketEvent[],
  today = todayIsoDay(),
): MaintainUrgency | null {
  if (row.paid) return null
  const urg = maintainUrgency(row.due, today)
  if (!urg) return null
  if (docketCoversAnnuity(docketEvents, caseId, row.due)) return null
  return urg
}

export function maintainVisibleToActor(
  role: UserRole,
  persona?: PersonaId,
): boolean {
  if (persona) {
    const mode = personaInboxMode(persona)
    if (mode === 'portal' || mode === 'committee') return false
  }
  return role === 'enterprise' || role === 'agency'
}

export function maintainInboxWho(role: UserRole, urg: MaintainUrgency): string {
  if (role === 'enterprise') {
    return urg === 'overdue' ? '我（企业）· 年费逾期确认' : '我（企业）· 年费预算'
  }
  return urg === 'overdue' ? '我（代理）· 催缴/办理' : '我（代理）· 维持日程'
}

export function maintainInboxSubtitle(
  row: MaintainScheduleRow,
  urg: MaintainUrgency,
): string {
  const bits = [
    '年费/维持',
    urg === 'overdue' ? '逾期' : '即将到期',
    `第${row.year}年`,
    row.amount,
  ]
  if (row.label) bits.push(row.label)
  bits.push('Docket 未覆盖')
  return bits.join(' · ')
}

export function maintainDeepLink(caseId: string): string {
  return appHref(`/workbench/maintain/${caseId}`)
}

/** 补齐日程行 id（生成表 / 种子均可） */
export function normalizeMaintainRow(
  row: Partial<MaintainScheduleRow> &
    Pick<MaintainScheduleRow, 'year' | 'due'>,
  index = 0,
): MaintainScheduleRow {
  return {
    id: row.id?.trim() || `ms-${row.year}-${row.due || index}`,
    year: row.year,
    due: row.due,
    amount: row.amount ?? '',
    paid: !!row.paid,
    officialFee: row.officialFee,
    label: row.label,
  }
}

/** Inbox / Dashboard 扁平化：同一 getRows 源 */
export function flattenMaintainSchedules(
  caseIds: string[],
  getRows: (caseId: string) => MaintainScheduleRow[],
): { caseId: string; row: MaintainScheduleRow }[] {
  const out: { caseId: string; row: MaintainScheduleRow }[] = []
  for (const id of caseIds) {
    for (const row of getRows(id)) {
      out.push({ caseId: id, row })
    }
  }
  return out
}
