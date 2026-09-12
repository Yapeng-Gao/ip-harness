/**
 * 中台统一「待我办理」Inbox — 纯函数聚合（可测）。
 * Wave1：按 workspace 可见案件 + role + Persona 过滤。
 */
import type {
  AgentDef,
  AgentSession,
  DocketEvent,
  HitlGateId,
  PatentCase,
  PersonaId,
  UserRole,
  WatchAlert,
  WorkbenchTodo,
} from '../types'
import { filterWorkbenchQueue } from '../data/workspaces'
import {
  ENTERPRISE_GATES,
  sessionBizBadges,
} from '../components/agent/session/sessionGates'
import { HITL_GATE_LABELS } from '../data/agents'
import {
  personaBlocksHitlGate,
  personaInboxMode,
  PERSONA_LABELS,
} from '../data/persona'
import {
  docketInboxSubtitle,
  docketInboxWho,
  effectiveEscalationLevel,
} from './docketEscalate'
import {
  isWatchHighRisk,
  maintainDeepLink,
  maintainInboxSubtitle,
  maintainInboxWho,
  maintainNeedsInbox,
  maintainVisibleToActor,
  todayIsoDay,
  watchDeepLink,
  watchInboxSubtitle,
  watchInboxWho,
  watchVisibleToActor,
  type MaintainScheduleRow,
} from './slaInbox'
import { appHref } from '../lib/deepLinks'

export type OpsInboxSource = 'workbench' | 'agent' | 'docket' | 'sla'

export type OpsInboxSourceLabel = '工作台' | 'Agent' | '期限' | '监控·维持'

export interface OpsInboxItem {
  id: string
  source: OpsInboxSource
  sourceLabel: OpsInboxSourceLabel
  /** 案号或标题 */
  title: string
  subtitle?: string
  /** 谁该动 */
  whoShouldAct: string
  href: string
  caseId?: string
  due?: string
  /** Agent 行：待确认闸 id（深链 gate=） */
  gate?: HitlGateId
  /** Agent 行：闸中文名 */
  gateLabel?: string
  /** 排序权重：越小越靠前 */
  sortKey: string
  /** 同案多源口播：非重复待办 */
  sameCaseHint?: string
}

export interface OpsInboxCounts {
  total: number
  workbench: number
  agent: number
  docket: number
  /** Watch 告警 SLA + Maintain 日程洞（与期限分口径） */
  sla: number
}


/**
 * Inbox 紧迫序（仅 sortKey · 不改闸门/enforcement）
 * 0 = overdue / 超 SLA / at_risk（压过普通 Agent 待办）
 * 1 = due_soon / reminded（待升级）/ escalated
 * 2 = 普通 Agent 确认 / 工作台待办
 */
export function inboxUrgencyBand(opts: {
  overdue?: boolean
  overSla?: boolean
  atRisk?: boolean
  dueSoon?: boolean
  reminded?: boolean
  escalated?: boolean
}): string {
  if (opts.overdue || opts.overSla || opts.atRisk) return '0'
  if (opts.dueSoon || opts.reminded || opts.escalated) return '1'
  return '2'
}

export interface BuildOpsInboxInput {
  role: UserRole
  /** Wave1 Persona；缺省按 role 全量 */
  persona?: PersonaId
  /** 已按 filterCasesForWorkspace 过滤的可见案件 */
  cases: PatentCase[]
  /** 已按 workspace + visibleCaseIds 过滤的 todos（再经 filterWorkbenchQueue） */
  todos: WorkbenchTodo[]
  /** 已按 canAccessCase 过滤的会话（visibleSessions） */
  sessions: AgentSession[]
  agents: AgentDef[]
  /** 已按可见案件过滤的期限事件 */
  docketEvents: DocketEvent[]
  isInvoiceBlocked?: (caseId: string) => boolean
  /**
   * Wave2 SlaInbox · 可见案件的 Watch 告警（扁平，带 caseId）
   * 未关闭且超 SLA/高风险/待处置 → 入 Inbox
   */
  watchAlerts?: { caseId: string; alert: WatchAlert }[]
  /**
   * Wave2 SlaInbox · Maintain 年费日程（扁平）
   * 即将到期/逾期且 Docket 未覆盖同 due → 补洞
   */
  maintainSchedules?: { caseId: string; row: MaintainScheduleRow }[]
  /** 排序/SLA 比较用「今天」；缺省 UTC 日 */
  today?: string
}

const SOURCE_LABEL: Record<OpsInboxSource, OpsInboxSourceLabel> = {
  workbench: '工作台',
  agent: 'Agent',
  docket: '期限',
  sla: '监控·维持',
}

/** Wave2 InboxDeepLink · Agent 会话深链（锚定 ConfirmBar / 待确认闸） */
export function agentSessionDeepLink(
  sessionId: string,
  opts?: { focus?: 'hitl'; gate?: HitlGateId },
): string {
  const params = new URLSearchParams()
  params.set('focus', opts?.focus ?? 'hitl')
  if (opts?.gate) params.set('gate', opts.gate)
  return appHref(`/agent/sessions/${sessionId}?${params.toString()}`)
}

/** Wave2 · 从 Agent 反向链回运营 Inbox（可带 session 行锚） */
export function opsInboxDeepLink(opts?: { sessionId?: string; itemId?: string }): string {
  const params = new URLSearchParams()
  if (opts?.itemId) params.set('inbox', opts.itemId)
  else if (opts?.sessionId) params.set('inbox', `ag-${opts.sessionId}`)
  const q = params.toString()
  const path = q ? `/?${q}#ops-inbox` : '/#ops-inbox'
  return appHref(path)
}

function firstRemainingGate(
  gates: HitlGateId[],
  cleared: HitlGateId[],
): HitlGateId | undefined {
  return gates.find((g) => !cleared.includes(g))
}

/** 工作台行标题：始终带案号（缺 caseNo 时用案 id 兜底） */
function workbenchRowTitle(
  cases: PatentCase[],
  caseId: string,
  todoTitle: string,
): string {
  const c = cases.find((x) => x.id === caseId)
  if (!c) return todoTitle
  const no = (c.caseNo && c.caseNo.trim()) || c.id
  if (todoTitle.startsWith(no) || todoTitle.includes(`${no} ·`)) return todoTitle
  return `${no} · ${todoTitle}`
}

function caseTitle(cases: PatentCase[], caseId: string | undefined, fallback: string): string {
  if (!caseId) return fallback
  const c = cases.find((x) => x.id === caseId)
  if (!c) return fallback
  const no = (c.caseNo && c.caseNo.trim()) || c.id
  return `${no} · ${c.title}`
}

function assigneeWho(
  todo: Pick<WorkbenchTodo, 'assignee' | 'assigneePersona' | 'source'>,
  role: UserRole,
): string {
  if (todo.assigneePersona === 'enterprise_ip') {
    return role === 'enterprise' ? '我（企业 IP）' : '企业 IP'
  }
  if (todo.assigneePersona === 'agency') {
    return role === 'agency' ? '我（代理）' : '代理'
  }
  const assignee = todo.assignee
  if (assignee === 'enterprise') return role === 'enterprise' ? '我（企业）' : '企业'
  if (assignee === 'agency') return role === 'agency' ? '我（代理）' : '代理'
  if (assignee === 'both') return '双方'
  return role === 'enterprise' ? '我（企业）' : '我（代理）'
}

/**
 * 当前角色是否应对该 Agent 会话动。
 */
export function sessionNeedsMyConfirm(input: {
  session: AgentSession
  gates: HitlGateId[]
  role: UserRole
  invoiceBlocked: boolean
  persona?: PersonaId
}): boolean {
  const s = input.session
  if (s.archived) return false
  const waiting = s.status === 'needs_human' || !!s.hitlPending
  if (!waiting) return false
  const cleared = s.clearedHitlGates ?? []
  const remaining = input.gates.filter((g) => !cleared.includes(g))
  if (remaining.length === 0) return false

  if (input.persona) {
    const actionable = remaining.some(
      (g) => !personaBlocksHitlGate(input.persona!, g).blocked,
    )
    if (!actionable) return false
  }

  const badges = sessionBizBadges({
    caseId: s.caseId,
    status: s.status,
    hitlPending: s.hitlPending,
    cleared,
    gates: input.gates,
    invoiceBlocked: input.invoiceBlocked,
    viewerRole: input.role,
  })
  if (badges.includes('待我确认')) return true

  if (input.role === 'agency' && remaining.includes('approve_strategy')) {
    return true
  }
  return false
}

function remainingGateWho(
  gates: HitlGateId[],
  cleared: HitlGateId[],
  role: UserRole,
): string {
  const remaining = gates.filter((g) => !cleared.includes(g))
  const entLeft = remaining.filter((g) => ENTERPRISE_GATES.includes(g))
  if (role === 'enterprise' && entLeft.length > 0) {
    const label = HITL_GATE_LABELS[entLeft[0]] ?? entLeft[0]
    return `我（企业）· ${label}`
  }
  if (role === 'agency') {
    if (remaining.includes('approve_strategy')) return '我（代理）· 提交/办理'
    return '我（代理）'
  }
  return role === 'enterprise' ? '我（企业）' : '我（代理）'
}

export function buildOpsInbox(input: BuildOpsInboxInput): OpsInboxItem[] {
  const {
    role,
    persona,
    cases,
    todos,
    sessions,
    agents,
    docketEvents,
    isInvoiceBlocked,
    watchAlerts = [],
    maintainSchedules = [],
    today: todayOpt,
  } = input
  const today = todayOpt ?? todayIsoDay()
  const mode = persona ? personaInboxMode(persona) : 'full'
  const items: OpsInboxItem[] = []

  // 发明人：门户深链为主，不塞工作台批准队列 / Agent 闸
  if (mode === 'portal') {
    items.push({
      id: 'portal-inventor',
      source: 'workbench',
      sourceLabel: SOURCE_LABEL.workbench,
      title: '交底门户 · 提报与交底包',
      subtitle: `Persona=${PERSONA_LABELS.inventor} · 工作台批准/授权已禁用`,
      whoShouldAct: '我（发明人）',
      href: appHref('/inventor'),
      sortKey: '0-portal',
    })
    // 仍提示与自己相关的期限（只读关注）
    for (const e of docketEvents) {
      if (e.status === 'done') continue
      if (e.status !== 'due_soon' && e.status !== 'overdue') continue
      if (!cases.some((c) => c.id === e.caseId)) continue
      const risk =
        e.atRisk || effectiveEscalationLevel(e) === 'at_risk' ? ' · 风险' : ''
      items.push({
        id: `dk-${e.id}`,
        source: 'docket',
        sourceLabel: SOURCE_LABEL.docket,
        title: caseTitle(cases, e.caseId, e.title),
        subtitle: `${docketInboxSubtitle(e)}（只读关注）${risk}`,
        whoShouldAct: '关注期限',
        href: appHref(`/docket?case=${e.caseId}`),
        caseId: e.caseId,
        due: e.dueDate,
        sortKey: `${inboxUrgencyBand({
          overdue: e.status === 'overdue',
          atRisk: !!(e.atRisk || effectiveEscalationLevel(e) === 'at_risk'),
          dueSoon: e.status === 'due_soon',
        })}-${e.status === 'overdue' ? '0' : '1'}-${e.dueDate}-${e.id}`,
      })
    }
    return items.sort((a, b) => a.sortKey.localeCompare(b.sortKey))
  }

  // 委员：立项投票相关 + 立项摘要；无批准/授权 Agent
  if (mode === 'committee') {
    items.push({
      id: 'committee-intake',
      source: 'workbench',
      sourceLabel: SOURCE_LABEL.workbench,
      title: '立项决策 · 委员投票',
      subtitle: `Persona=${PERSONA_LABELS.committee} · 可投票 · 不可 Go/批准`,
      whoShouldAct: '我（委员）',
      href: appHref('/workbench/intake'),
      sortKey: '0-committee',
    })
    const queue = filterWorkbenchQueue(todos, cases, role, persona).filter(
      (t) => t.stage === 'decision' || t.handoffKey === 'intake_quote',
    )
    for (const t of queue) {
      if (t.done) continue
      const title = workbenchRowTitle(cases, t.caseId, t.title)
      items.push({
        id: `wb-${t.id}`,
        source: 'workbench',
        sourceLabel: SOURCE_LABEL.workbench,
        title,
        subtitle: `立项摘要 · ${t.enterpriseLabel}`,
        whoShouldAct: '我（委员）· 投票',
        href: appHref(
          t.actionPath.includes('intake')
            ? t.actionPath
            : `/workbench/intake/${t.caseId}`,
        ),
        caseId: t.caseId,
        due: t.due,
        sortKey: `1-${t.due ?? '9999'}-${t.id}`,
      })
    }
    return items.sort((a, b) => a.sortKey.localeCompare(b.sortKey))
  }

  // full：enterprise_ip / agency ≈ 现网
  const queue = filterWorkbenchQueue(todos, cases, role, persona)
  for (const t of queue) {
    if (t.done) continue
    const title = workbenchRowTitle(cases, t.caseId, t.title)
    items.push({
      id: `wb-${t.id}`,
      source: 'workbench',
      sourceLabel: SOURCE_LABEL.workbench,
      title,
      subtitle:
        (t.source === 'handoff'
          ? '交接驱动 · '
          : t.source === 'docket'
            ? '期限升级 · '
            : '') +
        (role === 'enterprise' ? t.enterpriseLabel : t.agencyLabel),
      whoShouldAct: assigneeWho(t, role),
      href: appHref(t.actionPath),
      caseId: t.caseId,
      due: t.due,
      sortKey: `2-${t.due ?? '9999'}-${t.id}`,
    })
  }

  for (const s of sessions) {
    const ag =
      s.agentId === 'auto'
        ? undefined
        : agents.find((a) => a.id === s.agentId)
    const gates = ag?.hitlGates ?? []
    const blocked = s.caseId
      ? (isInvoiceBlocked?.(s.caseId) ?? false)
      : false
    if (
      !sessionNeedsMyConfirm({
        session: s,
        gates,
        role,
        invoiceBlocked: blocked,
        persona,
      })
    ) {
      continue
    }
    const cleared = s.clearedHitlGates ?? []
    const gate = firstRemainingGate(gates, cleared)
    const gateLabel = gate ? (HITL_GATE_LABELS[gate] ?? gate) : undefined
    items.push({
      id: `ag-${s.id}`,
      source: 'agent',
      sourceLabel: SOURCE_LABEL.agent,
      title: caseTitle(cases, s.caseId, s.title),
      subtitle: [
        ag?.name ?? 'Agent',
        gateLabel ? `闸 ${gateLabel}` : '待确认',
        s.title,
      ].join(' · '),
      whoShouldAct: remainingGateWho(gates, cleared, role),
      href: agentSessionDeepLink(s.id, { focus: 'hitl', gate }),
      caseId: s.caseId,
      gate,
      gateLabel,
      due: s.updatedAt,
      sortKey: `2-${s.updatedAt ?? '9999'}-${s.id}`,
    })
  }

  for (const e of docketEvents) {
    if (e.status === 'done') continue
    if (e.status !== 'due_soon' && e.status !== 'overdue') continue
    if (!cases.some((c) => c.id === e.caseId)) continue
    const level = effectiveEscalationLevel(e)
    const overdue = e.status === 'overdue'
    const atRisk = !!(e.atRisk || level === 'at_risk')
    const band = inboxUrgencyBand({
      overdue,
      atRisk,
      dueSoon: e.status === 'due_soon',
      reminded: level === 'reminded',
      escalated: level === 'escalated_enterprise',
    })
    // 同 band 内：逾期 > 即将到期；风险/升级态次之（reminded 不因「已提醒」沉到未逾期之后）
    const statusOrd = overdue ? '0' : '1'
    const escOrd =
      atRisk
        ? '0'
        : level === 'escalated_enterprise'
          ? '1'
          : level === 'reminded'
            ? '2'
            : '3'
    items.push({
      id: `dk-${e.id}`,
      source: 'docket',
      sourceLabel: SOURCE_LABEL.docket,
      title: caseTitle(cases, e.caseId, e.title),
      subtitle: docketInboxSubtitle(e),
      whoShouldAct: docketInboxWho(e, role),
      href: appHref(`/docket?case=${e.caseId}`),
      caseId: e.caseId,
      due: e.dueDate,
      sortKey: `${band}-${statusOrd}-${escOrd}-${e.dueDate}-${e.id}`,
    })
  }

  // Wave2 SlaInbox · Watch（未关闭 · 超 SLA/高风险/待处置）
  for (const { caseId, alert } of watchAlerts) {
    if (!cases.some((c) => c.id === caseId)) continue
    if (!watchVisibleToActor(alert, role, persona, today)) continue
    const overSla = !!(alert.slaDue && alert.slaDue < today)
    const atRisk = isWatchHighRisk(alert)
    const band = inboxUrgencyBand({
      overSla,
      atRisk,
      dueSoon: !overSla && !!alert.slaDue,
    })
    const overOrd = overSla ? '0' : atRisk ? '1' : '2'
    items.push({
      id: `wa-${caseId}-${alert.id}`,
      source: 'sla',
      sourceLabel: SOURCE_LABEL.sla,
      title: caseTitle(cases, caseId, alert.title),
      subtitle: watchInboxSubtitle(alert, today),
      whoShouldAct: watchInboxWho(alert, role),
      href: watchDeepLink(caseId, alert.id),
      caseId,
      due: alert.slaDue ?? alert.openedAt,
      sortKey: `${band}-${overOrd}-${alert.slaDue ?? '9999'}-${alert.id}`,
    })
  }

  // Wave2 SlaInbox · 年费/维持日程洞（Docket 未覆盖同 due）
  if (maintainVisibleToActor(role, persona)) {
    for (const { caseId, row } of maintainSchedules) {
      if (!cases.some((c) => c.id === caseId)) continue
      const urg = maintainNeedsInbox(row, caseId, docketEvents, today)
      if (!urg) continue
      const band = inboxUrgencyBand({
        overdue: urg === 'overdue',
        dueSoon: urg === 'due_soon',
      })
      const boost = urg === 'overdue' ? '0' : '1'
      items.push({
        id: `mn-${caseId}-${row.id}`,
        source: 'sla',
        sourceLabel: SOURCE_LABEL.sla,
        title: caseTitle(cases, caseId, row.label ?? `第${row.year}年年费`),
        subtitle: maintainInboxSubtitle(row, urg),
        whoShouldAct: maintainInboxWho(role, urg),
        href: maintainDeepLink(caseId),
        caseId,
        due: row.due,
        sortKey: `${band}-${boost}-${row.due}-${row.id}`,
      })
    }
  }

  return annotateSameCaseHints(items.sort((a, b) => a.sortKey.localeCompare(b.sortKey)))
}

/** 同案多源：口播「另有 N 条」· 不去重（粒度不同） */
export function annotateSameCaseHints(items: OpsInboxItem[]): OpsInboxItem[] {
  const byCase = new Map<string, OpsInboxItem[]>()
  for (const it of items) {
    if (!it.caseId) continue
    const arr = byCase.get(it.caseId) ?? []
    arr.push(it)
    byCase.set(it.caseId, arr)
  }
  return items.map((it) => {
    if (!it.caseId) return it
    const peers = byCase.get(it.caseId) ?? []
    if (peers.length < 2) return it
    const sources = [...new Set(peers.map((p) => p.sourceLabel))]
    return {
      ...it,
      sameCaseHint: `同案另有 ${peers.length - 1} 条（${sources.join('/')}）· 非重复待办`,
    }
  })
}


export function countOpsInbox(items: OpsInboxItem[]): OpsInboxCounts {
  const counts: OpsInboxCounts = {
    total: items.length,
    workbench: 0,
    agent: 0,
    docket: 0,
    sla: 0,
  }
  for (const it of items) {
    counts[it.source]++
  }
  return counts
}
