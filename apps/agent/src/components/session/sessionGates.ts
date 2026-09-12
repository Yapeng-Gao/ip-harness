import type { HitlSessionAction } from '@shared/context/AgentContext'
import type { AgentRunStatus, HandoffStatus, HitlGateId } from '@shared/types'
import type { HandoffAction } from '@shared/data/handoff'
import { workbenchHref as workbenchAbsHref } from '../../lib/deepLinks'

/** Map confirm-step gate id → sessionHitlAction */
export function gateToAction(gate: HitlGateId): HitlSessionAction {
  switch (gate) {
    case 'authorize_file':
      return 'authorize_file'
    case 'confirm_quote':
      return 'confirm_quote'
    case 'go_nogo':
      return 'go_nogo'
    case 'pay_unlock':
      return 'pay_unlock'
    case 'approve_strategy':
    default:
      return 'approve_strategy'
  }
}

export const ENTERPRISE_GATES: HitlGateId[] = [
  'approve_strategy',
  'go_nogo',
  'confirm_quote',
  'pay_unlock',
  'authorize_file',
]

/** Enterprise primary order: approve before authorize */
export const GATE_ORDER: HitlGateId[] = [
  'approve_strategy',
  'go_nogo',
  'confirm_quote',
  'pay_unlock',
  'authorize_file',
]

export function sortGatesForRole(
  gatesRaw: HitlGateId[],
  isEnterprise: boolean,
): HitlGateId[] {
  if (!isEnterprise) return gatesRaw
  return [...gatesRaw].sort(
    (a, b) =>
      (GATE_ORDER.indexOf(a) === -1 ? 99 : GATE_ORDER.indexOf(a)) -
      (GATE_ORDER.indexOf(b) === -1 ? 99 : GATE_ORDER.indexOf(b)),
  )
}

export const DEMO_AGENTS = new Set([
  'agent-research',
  'agent-oa',
  'agent-disclosure',
  'agent-claims',
  'agent-intake',
  'agent-annuity',
  'agent-watch',
  'agent-monetize',
  'agent-layout',
])

/** Resolve agent.workbenchPath + caseId → absolute workbench deep link */
export function workbenchHref(
  workbenchPath: string | undefined,
  caseId: string,
): string | null {
  if (!workbenchPath) return null
  const relative = workbenchPath.startsWith('/inventor')
    ? caseId
      ? `${workbenchPath}?case=${caseId}`
      : workbenchPath
    : `${workbenchPath}/${caseId}`
  return workbenchAbsHref(relative)
}

/** Chinese preview of auto-chained domain writes for ConfirmBar transparency */
export function previewHitlCommandChain(
  gate: HitlGateId,
  role: 'enterprise' | 'agency',
  agentId?: string,
): string[] {
  const ent = role === 'enterprise'
  switch (gate) {
    case 'approve_strategy': {
      const base =
        ent
          ? agentId === 'agent-layout'
            ? ['提交', '开始审核', '批准', '建案', '派所']
            : ['提交', '开始审核', '批准']
          : ['提交']
      return base
    }
    case 'authorize_file':
      return ent ? ['提交', '开始审核', '授权递交'] : ['提交']
    case 'go_nogo':
      // Go 闸只到审核；确认报价是独立闸
      return ent ? ['提交', '开始审核'] : ['提交']
    case 'confirm_quote':
      return ent ? ['提交', '开始审核', '确认报价'] : ['确认报价']
    case 'pay_unlock':
      // Fix V · 串到批准；归档走 ConfirmBar 回执，不预告静默 file
      return ent
        ? ['付款解锁', '提交年费计划', '开始审核', '批准']
        : ['付款解锁', '提交年费计划']
    default:
      return []
  }
}

/**
 * Next single handoff action for stepwise HITL, based on current domain status.
 * Returns undefined when the listed attempts are already past.
 */
export function pickNextHandoffAction(
  attempts: HandoffAction[],
  status: HandoffStatus | undefined,
): HandoffAction | undefined {
  const st = status ?? 'drafting'
  for (const a of attempts) {
    if (a === 'submit' && (st === 'drafting' || st === 'changes_requested')) return a
    if (a === 'start_review' && st === 'submitted_to_enterprise') return a
    if (
      a === 'approve' &&
      (st === 'submitted_to_enterprise' || st === 'enterprise_review')
    ) {
      return a
    }
    if (
      a === 'authorize' &&
      (st === 'approved' ||
        st === 'enterprise_review' ||
        st === 'submitted_to_enterprise')
    ) {
      if (
        attempts.includes('approve') &&
        (st === 'submitted_to_enterprise' || st === 'enterprise_review')
      ) {
        continue
      }
      return a
    }
    if (a === 'file' && (st === 'authorized_to_file' || st === 'approved')) return a
    if (a === 'request_changes') return a
    if (a === 'save_draft' && (st === 'drafting' || st === 'changes_requested')) {
      return a
    }
  }
  return undefined
}

export type SessionBizBadge =
  | '未关联案件'
  | '发票阻塞'
  | '待我确认'
  | '待企业确认'
  | '待代理'

export function sessionBizBadges(input: {
  caseId?: string
  status: AgentRunStatus
  hitlPending?: boolean
  cleared: HitlGateId[]
  gates: HitlGateId[]
  invoiceBlocked: boolean
  viewerRole?: 'enterprise' | 'agency'
}): SessionBizBadge[] {
  const out: SessionBizBadge[] = []
  if (!input.caseId) out.push('未关联案件')
  if (input.caseId && input.invoiceBlocked) out.push('发票阻塞')
  const remaining = input.gates.filter((g) => !input.cleared.includes(g))
  const entLeft = remaining.filter((g) => ENTERPRISE_GATES.includes(g))
  const waiting = input.status === 'needs_human' || !!input.hitlPending
  const viewer = input.viewerRole
  if (waiting && entLeft.length > 0) {
    out.push(viewer === 'enterprise' ? '待我确认' : '待企业确认')
  } else if (waiting) {
    out.push(viewer === 'agency' ? '待我确认' : '待代理')
  }
  return out
}

export const BIZ_BADGE_CLASS: Record<SessionBizBadge, string> = {
  未关联案件: 'border-slate-200 bg-slate-50 text-slate-600',
  发票阻塞: 'border-rose-200 bg-rose-50 text-rose-800',
  待我确认: 'border-amber-300 bg-amber-100 text-amber-950',
  待企业确认: 'border-amber-200 bg-amber-50 text-amber-900',
  待代理: 'border-sky-200 bg-sky-50 text-sky-800',
}
