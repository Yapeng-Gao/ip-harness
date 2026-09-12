export const OVERVIEW = {
  env: '样机 · mock',
  envNote: '内存数据 · 刷新即失 · 无集群探针',
  gpuPool: { total: 8, training: 3, idle: 4, queuedSlots: 1 },
  queue: { train: 2, batch: 1, inferWarm: 0 },
  endpoints: { published: 2, canary: 1 },
  alerts: { warn: 1, note: '训推规则示意 · 出站仍标 notify' },
} as const

export const HONESTY = [
  '无真 GPU / 无真 K8s / 无真权重仓 — 数字为内存 mock。',
  '禁止持有或写入 PatentCase / DomainCommand。',
  '办案 Agent 只消费已发布端点（经网关）；本壳不申请 GPU job。',
  'ops:5176 仅深链，不改运维六路由、不改 APP_PORTS。',
] as const
