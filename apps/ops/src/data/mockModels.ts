import { AUDIT_SCHEMA_VERSION, CASE_CONTEXT_SCHEMA_VERSION } from '@ip/contracts'

export const MODEL_CARDS = [
  { id: 'p95', label: '延迟 p95', value: '1.8s', note: '示意 · 非 live' },
  { id: 'ok', label: '成功率', value: '96.2%', note: '演示窗口 24h' },
  { id: 'guard', label: '护栏拦截', value: '11', note: '与监控闸门计数同源 mock' },
  { id: 'hitl', label: '人工接管', value: '3', note: 'HITL 确认 / 回落' },
] as const

export type ModelRoute = {
  id: string
  name: string
  version: string
  latencyP50: string
  latencyP95: string
  tokensIn: number
  tokensOut: number
  successPct: number
  guardHits: number
  humanTakeover: number
  schemaAligned: boolean
}

export const MODEL_ROUTES: ModelRoute[] = [
  {
    id: 'r-oa',
    name: 'oa-strategy',
    version: '2026.09.1-oa',
    latencyP50: '0.9s',
    latencyP95: '2.1s',
    tokensIn: 18420,
    tokensOut: 6120,
    successPct: 97.1,
    guardHits: 4,
    humanTakeover: 1,
    schemaAligned: true,
  },
  {
    id: 'r-fto',
    name: 'research-fto',
    version: '2026.08.4-fto',
    latencyP50: '1.4s',
    latencyP95: '3.6s',
    tokensIn: 42100,
    tokensOut: 9800,
    successPct: 94.0,
    guardHits: 6,
    humanTakeover: 2,
    schemaAligned: false,
  },
  {
    id: 'r-watch',
    name: 'watch-classify',
    version: '2026.09.1-watch',
    latencyP50: '0.4s',
    latencyP95: '0.9s',
    tokensIn: 6300,
    tokensOut: 1100,
    successPct: 98.4,
    guardHits: 1,
    humanTakeover: 0,
    schemaAligned: true,
  },
]

export const SCHEMA_ALIGN = {
  audit: AUDIT_SCHEMA_VERSION,
  caseContext: CASE_CONTEXT_SCHEMA_VERSION,
  note: '对齐中台 / Agent 契约；legacy 条目见日志「审计」分区。',
} as const
