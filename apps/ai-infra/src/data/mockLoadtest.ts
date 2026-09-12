import type { StatusTone } from '../components/ui'

export type LoadScenario = {
  id: string
  name: string
  target: string
  profile: string
  lastRun: string
  tone: StatusTone
}

export const SCENARIOS: LoadScenario[] = [
  {
    id: 'lt-online',
    name: '在线推理 50 QPS',
    target: 'claims-draft · v2.1（示意）',
    profile: '5 min · 斜坡 0→50',
    lastRun: '2026-09-11 14:20',
    tone: 'ok',
  },
  {
    id: 'lt-batch',
    name: '批推 10k 条',
    target: 'batch-eval 队列（示意）',
    profile: '固定并发 8',
    lastRun: '未跑',
    tone: 'empty',
  },
]

export const LOAD_REPORT = {
  scenario: '在线推理 50 QPS',
  p50: '210 ms（假）',
  p95: '490 ms（假）',
  errorRate: '0.4%（假）',
  note: '报告为静态 mock。未对真实端点打压、未写对象存储。',
} as const
