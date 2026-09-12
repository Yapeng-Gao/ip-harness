import type { StatusTone } from '../components/ui'

/** 业务 SLA 数字来源：本地 mock 聚合示意，非 live，未接总线 / Prometheus / api-mock 聚合。 */
export const SLA_DATA_SOURCE = {
  label: '本地 mock 聚合示意',
  live: false,
  note: '非 live。口径可引用架构事件名，但今日未订阅总线；api-mock 无现成 SLA 计数接口，故不 fetch。',
} as const

export type ServiceHealth = {
  id: string
  name: string
  tone: StatusTone
  label: string
  detail: string
}

export const SERVICE_HEALTH: ServiceHealth[] = [
  {
    id: 'api',
    name: 'API',
    tone: 'ok',
    label: '正常',
    detail: 'mid / workbench / agent 本地 Vite · 示意，非探针',
  },
  {
    id: 'queue',
    name: '队列',
    tone: 'degraded',
    label: '降级',
    detail: '出站任务积压示意 · 未接真实 broker',
  },
  {
    id: 'db',
    name: 'DB',
    tone: 'ok',
    label: '正常',
    detail: '样机内存 / localStorage · 无真实库连接',
  },
]

export const INBOX_BACKLOG = {
  workbench: 4,
  agent: 2,
  docket: 3,
  sla: 1,
} as const

export const INBOX_SOURCE_LABEL: Record<keyof typeof INBOX_BACKLOG, string> = {
  workbench: '工作台',
  agent: 'Agent',
  docket: '期限',
  sla: 'sla',
}

export type EscalationLevel = 'none' | 'reminded' | 'escalated_enterprise' | 'at_risk'

export type OverdueDocket = {
  id: string
  caseId: string
  title: string
  caseTitle: string
  due: string
  escalationLevel: EscalationLevel
}

export const OVERDUE_DOCKETS: OverdueDocket[] = [
  {
    id: 'dk-1',
    caseId: 'c1',
    title: '一通答复期限',
    caseTitle: '一种边缘计算节点调度方法',
    due: '2026-09-10',
    escalationLevel: 'at_risk',
  },
  {
    id: 'dk-2',
    caseId: 'c2',
    title: '预研补正窗口',
    caseTitle: '固态电池电解质配方',
    due: '2026-09-11',
    escalationLevel: 'escalated_enterprise',
  },
  {
    id: 'dk-3',
    caseId: 'c3',
    title: '许可谈判节点',
    caseTitle: '工业视觉缺陷检测系统',
    due: '2026-09-08',
    escalationLevel: 'reminded',
  },
]

export const ESCALATION_LABEL: Record<EscalationLevel, string> = {
  none: 'none',
  reminded: 'reminded',
  escalated_enterprise: 'escalated_enterprise',
  at_risk: 'at_risk',
}

export type BillingHold = {
  caseId: string
  title: string
  reason: string
}

export const BILLING_HOLDS: BillingHold[] = [
  {
    caseId: 'c1',
    title: '一种边缘计算节点调度方法',
    reason: '尾款未结 · billing hold（示意）',
  },
  {
    caseId: 'c4',
    title: '低功耗蓝牙 Mesh 路由协议',
    reason: '撰写代理费逾期 · 停权案（示意）',
  },
]

/** 无现成比率字段；数字来自 auditLog / guardrails 演示计数 */
export const GATE_REJECT = {
  ratePct: 8.4,
  blocked: 11,
  evaluated: 131,
  note: '本地 mock 聚合示意 · 非 live。无现成拒绝率字段，计数来自 auditLog / guardrails 演示。',
} as const

export type WatchOverSla = {
  id: string
  caseId: string
  title: string
  overdueHours: number
}

export const WATCH_OVER_SLA: WatchOverSla[] = [
  {
    id: 'w1',
    caseId: 'c2',
    title: '竞品公开告警超 SLA',
    overdueHours: 18,
  },
]

export const CRITICAL_ALERTS = 3
