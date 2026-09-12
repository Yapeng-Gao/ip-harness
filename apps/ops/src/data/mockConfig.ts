export const LICENSE = {
  used: 12,
  seats: 20,
  plan: 'harness-dev · 演示席位',
  note: '样机本地数字，不接计费网关',
} as const

export const ENVIRONMENTS = [
  { id: 'harness-dev', name: 'harness-dev', current: true, note: '本机 Vite 五面' },
  { id: 'staging', name: 'staging', current: false, note: '示意 · 未接' },
  { id: 'prod', name: 'prod', current: false, note: '未接 · 禁止当生产看' },
] as const

export const FEATURE_FLAGS = [
  { id: 'redact_pii', label: '日志 PII 脱敏', on: true },
  { id: 'hitl_strict', label: 'HITL 闸门严格模式', on: true },
  { id: 'export_audit', label: '案详审计导出', on: false },
  { id: 'gpu_metrics', label: 'GPU 利用率采集', on: false },
] as const

export const SECRETS = [
  { id: 's1', name: 'OPENAI_API_KEY', masked: 'sk-••••••••ab12', kind: '模型出站', rotated: '2026-08-20' },
  { id: 's2', name: 'CNIPA_CLIENT_SECRET', masked: 'sec-••••••••9f3c', kind: '官费/局端', rotated: '2026-07-02' },
  { id: 's3', name: 'TLS_CERT_OPS', masked: 'crt-••••••••e71a', kind: '证书', rotated: '2026-03-15' },
] as const

export const OUTBOUND_JOBS = [
  { id: 'job-1', name: '官费回执拉取', status: 'queued', env: 'harness-dev' },
  { id: 'job-2', name: '模型路由预热', status: 'running', env: 'harness-dev' },
  { id: 'job-3', name: '审计落盘演练', status: 'held', env: 'staging（示意）' },
] as const

export const READONLY_ACCOUNTS = [
  { id: 'ro-1', name: 'ops-readonly', role: '安全只读', lastSeen: '2026-09-11 21:04' },
  { id: 'ro-2', name: 'audit-viewer', role: '审计只读', lastSeen: '从未登录（示意）' },
] as const

export type Runbook = {
  id: string
  title: string
  owner: string
  body: string
}

export const RUNBOOKS: Runbook[] = [
  {
    id: 'rb-1',
    title: '队列降级 · 出站积压',
    owner: '运维样机',
    body: '1. 确认本页监控「队列」是否仅为 mock。\n2. 作业中台 Inbox / Docket 深链核对待办，不在本面改办案。\n3. 真实 broker / DLQ 未接入；禁止当生产排障。',
  },
  {
    id: 'rb-2',
    title: 'License 席位将满',
    owner: '运维样机',
    body: '席位数字为本地 mock。中台 Billing 页才是履约/发票演示入口。本面不签发、不扣减。',
  },
  {
    id: 'rb-3',
    title: '护栏拦截升高',
    owner: '运维样机',
    body: '拦截率为 auditLog / guardrails 演示计数。到案详「审计」Tab 看 schemaVersion，不在运维面放行闸门。',
  },
]
