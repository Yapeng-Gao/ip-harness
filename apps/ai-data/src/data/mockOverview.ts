export const OVERVIEW = {
  env: '样机 · mock',
  envNote: '内存数据 · 刷新即失 · 无 Spark / 湖仓探针',
  pipelines: { healthy: 2, degraded: 1, failed: 0 },
  recentReleases: [
    { id: 'rel-1', dataset: 'claims-sft', version: 'v1.4', at: '2026-09-12 18:20', note: '假发布 · 无对象存储' },
    { id: 'rel-2', dataset: 'pretrain-mix', version: 'v0.9', at: '2026-09-11 09:05', note: '假发布 · 无真校验和' },
    { id: 'rel-3', dataset: 'eval-hard', version: 'v2.0', at: '2026-09-10 14:41', note: '假发布 · 未推 ai-infra' },
  ],
  qualityGate: { pending: 1, note: '质量门禁示意 · 非真 PII' },
} as const

export const HONESTY = [
  '无真 Spark / 无真湖仓 / 无真 PII 引擎 — 数字为内存 mock。',
  '禁止持有或写入 PatentCase / DomainCommand。',
  'ai-infra 只消费已发布 dataset version；本壳不申请 GPU job。',
  'ops:5176 / ai-infra:5179 仅深链，不改邻居路由、不改 APP_PORTS。',
] as const
