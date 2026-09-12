import { AUDIT_SCHEMA_VERSION } from '@ip/contracts'

export type LogLevel = 'info' | 'warn' | 'error'

export type LogChannel = 'app' | 'audit' | 'auth' | 'agent'

export type LogRow = {
  id: string
  channel: LogChannel
  at: string
  level: LogLevel
  service: string
  message: string
  caseId?: string
  extra?: string
}

/** Fixed "now" so range filters stay deterministic in the prototype. */
export const MOCK_NOW_MS = Date.parse('2026-09-12T09:09:00+08:00')

export const LOG_ROWS: LogRow[] = [
  {
    id: 'app-1',
    channel: 'app',
    at: '2026-09-12T08:55:12+08:00',
    level: 'info',
    service: 'mid',
    message: 'GET /docket 200 · 样机路由',
  },
  {
    id: 'app-2',
    channel: 'app',
    at: '2026-09-12T08:12:40+08:00',
    level: 'warn',
    service: 'ops-mock',
    message: '队列消费滞后 42s · 示意，未接 broker',
  },
  {
    id: 'app-3',
    channel: 'app',
    at: '2026-09-11T22:04:01+08:00',
    level: 'error',
    service: 'agent',
    message: '模型路由超时（mock）· 已回落人工接管示意',
    caseId: 'c1',
  },
  {
    id: 'app-4',
    channel: 'app',
    at: '2026-09-10T14:20:00+08:00',
    level: 'info',
    service: 'workbench',
    message: 'handoff save_draft · 本地内存',
    caseId: 'c2',
  },
  {
    id: 'aud-1',
    channel: 'audit',
    at: '2026-09-12T08:40:00+08:00',
    level: 'info',
    service: 'auditLog',
    message: `approveHandoff · schemaVersion ${AUDIT_SCHEMA_VERSION}`,
    caseId: 'c1',
    extra: AUDIT_SCHEMA_VERSION,
  },
  {
    id: 'aud-2',
    channel: 'audit',
    at: '2026-09-11T19:15:33+08:00',
    level: 'info',
    service: 'auditLog',
    message: 'docketEscalate · at_risk（示意落盘）',
    caseId: 'c1',
    extra: AUDIT_SCHEMA_VERSION,
  },
  {
    id: 'aud-3',
    channel: 'audit',
    at: '2026-09-05T11:02:00+08:00',
    level: 'warn',
    service: 'auditLog',
    message: 'legacy 条目 · 无 schemaVersion（持久化示意）',
    caseId: 'c3',
    extra: 'legacy',
  },
  {
    id: 'auth-1',
    channel: 'auth',
    at: '2026-09-12T07:48:22+08:00',
    level: 'warn',
    service: 'iam-shell',
    message: '登录失败 ×2 · 非真 SSO（演示计数）',
  },
  {
    id: 'auth-2',
    channel: 'auth',
    at: '2026-09-11T16:33:10+08:00',
    level: 'error',
    service: 'mid',
    message: '越权访问案详被拒 · canAccessCase=false（示意）',
    caseId: 'c5',
  },
  {
    id: 'agt-1',
    channel: 'agent',
    at: '2026-09-12T08:02:18+08:00',
    level: 'info',
    service: 'agent-tools',
    message: 'tool analyzeAndSubmitOA · HITL 待确认 authorize_file',
    caseId: 'c1',
    extra: 'HITL',
  },
  {
    id: 'agt-2',
    channel: 'agent',
    at: '2026-09-12T07:21:05+08:00',
    level: 'warn',
    service: 'guardrails',
    message: '闸门拦截 pay_unlock · persona=inventor',
    caseId: 'c4',
    extra: 'blocked',
  },
  {
    id: 'agt-3',
    channel: 'agent',
    at: '2026-09-11T20:10:44+08:00',
    level: 'info',
    service: 'agent-tools',
    message: 'HITL 轨迹 · go_nogo 已放行（演示）',
    caseId: 'c2',
    extra: 'HITL',
  },
]

export const CHANNEL_META: Record<
  LogChannel,
  { title: string; hint: string }
> = {
  app: {
    title: '应用日志',
    hint: '前端 mock 行。无 ELK / 无采集管道。',
  },
  audit: {
    title: '审计持久化示意',
    hint: `示意落盘，非真实 audit store。新写入 schemaVersion = ${AUDIT_SCHEMA_VERSION}。`,
  },
  auth: {
    title: '登录 / 越权',
    hint: 'IAM 为薄壳非真 SSO。以下为演示计数。',
  },
  agent: {
    title: 'Agent 工具与 HITL 轨迹',
    hint: '工具调用与闸门轨迹 mock。不削弱业务闸门。',
  },
}

export type TimeRange = '1h' | '24h' | '7d'

export function filterLogs(
  rows: LogRow[],
  opts: { channel: LogChannel; q: string; level: LogLevel | 'all'; range: TimeRange },
): LogRow[] {
  const windowMs =
    opts.range === '1h' ? 3600_000 : opts.range === '24h' ? 86_400_000 : 7 * 86_400_000
  const q = opts.q.trim().toLowerCase()
  return rows.filter((r) => {
    if (r.channel !== opts.channel) return false
    if (opts.level !== 'all' && r.level !== opts.level) return false
    const t = Date.parse(r.at)
    if (!Number.isNaN(t) && MOCK_NOW_MS - t > windowMs) return false
    if (!q) return true
    const hay = `${r.service} ${r.message} ${r.caseId ?? ''} ${r.extra ?? ''}`.toLowerCase()
    return hay.includes(q)
  })
}
