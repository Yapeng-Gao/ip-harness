/**
 * Handoff envelope mock — from/to/type/acceptance (pack design §4).
 * Shell-local; does not invent packages keys.
 */
import type { ProjectExpertId } from '../types'
import { getProjectExpert } from '../experts'

export type HandoffEnvelopeType = 'deliver' | 'feedback'

export type HandoffEnvelope = {
  id: string
  flow: string
  step: string
  type: HandoffEnvelopeType
  from: ProjectExpertId
  to: ProjectExpertId
  acceptance: string
  feedback?: { reason: string; requested: string }
  audit?: {
    timestamp: string
    sandbox_id: string
    validator_results: 'pass' | 'fail' | 'skipped'
  }
}

const CHAIN: {
  from: ProjectExpertId
  to: ProjectExpertId
  flow: string
  step: string
  acceptance: string
}[] = [
  {
    from: 'expert-research',
    to: 'expert-intake',
    flow: 'F5 新申请',
    step: '查新 → 立项',
    acceptance: '查新结论可支撑 Go/No-Go',
  },
  {
    from: 'expert-intake',
    to: 'expert-disclosure',
    flow: 'F5 新申请',
    step: '立项 → 交底',
    acceptance: 'Go 后交底范围锁定',
  },
  {
    from: 'expert-disclosure',
    to: 'expert-draft',
    flow: 'F5 新申请',
    step: '交底 → 撰写',
    acceptance: '可实施交底书齐套',
  },
  {
    from: 'expert-draft',
    to: 'expert-filing',
    flow: 'F5 新申请',
    step: '撰写 → 递交',
    acceptance: '权项+说明书可齐套',
  },
  {
    from: 'expert-filing',
    to: 'expert-oa',
    flow: 'F6 OA',
    step: '递交 file → OA',
    acceptance: '仅总控在 file 后派 OA',
  },
  {
    from: 'expert-valuation',
    to: 'expert-annuity',
    flow: 'F7 授权后',
    step: '价值 → 年费',
    acceptance: '分级建议可支撑缴费/放弃',
  },
  {
    from: 'expert-annuity',
    to: 'expert-monetize',
    flow: 'F7→F8',
    step: '年费台账 → 转化',
    acceptance: '组合价值可见后方可谈许可',
  },
  {
    from: 'expert-monetize',
    to: 'expert-enforcement',
    flow: 'F8→F9',
    step: '转化 → 维权备选',
    acceptance: '交易边界清晰；维权独立席',
  },
  {
    from: 'expert-enforcement',
    to: 'expert-layout',
    flow: 'F9→F3 飞轮',
    step: '维权漏洞 → 布局',
    acceptance: '回流信封到达布局策略师',
  },
]

let seq = 0

export function sampleEnvelopeForSeat(
  seatId: ProjectExpertId,
): HandoffEnvelope | null {
  const row =
    CHAIN.find((c) => c.from === seatId) ??
    CHAIN.find((c) => c.to === seatId)
  if (!row) return null
  seq += 1
  return {
    id: `ho-mock-${seq}`,
    flow: row.flow,
    step: row.step,
    type: 'deliver',
    from: row.from,
    to: row.to,
    acceptance: row.acceptance,
    audit: {
      timestamp: new Date().toISOString(),
      sandbox_id: 'mock-no-sandbox',
      validator_results: 'skipped',
    },
  }
}

/** Format envelope as worklog appendix lines */
export function envelopeToWorklogLines(env: HandoffEnvelope): string {
  const fromName = getProjectExpert(env.from).name
  const toName = getProjectExpert(env.to).name
  return [
    '',
    '## Handoff 信封（mock）',
    `| 字段 | 值 |`,
    `|------|-----|`,
    `| id | ${env.id} |`,
    `| type | ${env.type} |`,
    `| flow | ${env.flow} |`,
    `| step | ${env.step} |`,
    `| from | ${fromName} (\`${env.from}\`) |`,
    `| to | ${toName} (\`${env.to}\`) |`,
    `| acceptance | ${env.acceptance} |`,
    env.audit
      ? `| audit | ${env.audit.timestamp} · ${env.audit.sandbox_id} · validator=${env.audit.validator_results} |`
      : '',
  ]
    .filter(Boolean)
    .join('\n')
}

export function defaultChainEnvelopes(): HandoffEnvelope[] {
  return CHAIN.map((row, i) => ({
    id: `ho-chain-${i + 1}`,
    flow: row.flow,
    step: row.step,
    type: 'deliver' as const,
    from: row.from,
    to: row.to,
    acceptance: row.acceptance,
    audit: {
      timestamp: new Date().toISOString(),
      sandbox_id: 'mock-no-sandbox',
      validator_results: 'skipped' as const,
    },
  }))
}
