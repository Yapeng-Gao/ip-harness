import type { AgentTier, HitlGateId } from './types'

/** Shared HITL gate labels (Chinese UI) — domain-owned to avoid agents catalog dep */
export const HITL_GATE_LABELS: Record<HitlGateId, string> = {
  go_nogo: '立项决定',
  approve_strategy: '批准策略',
  authorize_file: '授权递交',
  pay_unlock: '付款解锁',
  confirm_quote: '确认报价',
}

export const AGENT_TIER_SHORT: Record<AgentTier, string> = {
  core: '主办理闭环',
  assist: '辅助薄层',
  beta: 'Beta·非采购闭环',
}
