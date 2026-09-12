/**
 * Enterprise Wave3 · Skills guardrails 中央校验（原型）
 *
 * 【唯一入口】Agent ConfirmBar / Session 闸 / Draft·Prosecution（及易分叉 Flow）
 * authorize|file|approve 等硬闸 blockers 同源聚合；勿在 UI 各自复制一套。
 *
 * AgentDef.guardrails[] 为目录展示文案；可执行硬闸在本模块复用已有函数，不削弱。
 */
import type {
  AgentDef,
  AgentSession,
  DisclosurePackCheck,
  DraftFilingCheck,
  FullCheckLite,
  HandoffArtifactKey,
  HandoffStatus,
  HitlGateId,
  LegalReviewStatus,
  OaIssueType,
  PatentCase,
  PersonaId,
  UserRole,
} from './types'
import {
  disclosurePackComplete,
  DISCLOSURE_PACK_CHECK_ITEMS,
} from './handoff'
import type { HandoffAction } from '@ip/contracts'
import {
  personaBlocksHandoffAction,
  personaBlocksHitlGate,
  personaBlocksPay,
} from './persona'
import {
  evaluateFullCheck,
  fullCheckScopeFor,
  type FullCheckScope,
} from './fullFilingCheck'

/** 与 sessionGates.ENTERPRISE_GATES 对齐（本模块不依赖 UI，避免环） */
const ENTERPRISE_GATES: HitlGateId[] = [
  'approve_strategy',
  'go_nogo',
  'confirm_quote',
  'pay_unlock',
  'authorize_file',
]

/** HITL 闸 / 工作台交接 / 付款命令（中央校验入参） */
/** Contract types — single source @ip/contracts (no fork) */
export type {
  GuardrailAction,
  GuardrailBlocker,
  GuardrailEvalResult,
} from '@ip/contracts'
export { mergeBlockers, blockersToResult } from '@ip/contracts'
import type {
  GuardrailAction,
  GuardrailBlocker,
  GuardrailEvalResult,
} from '@ip/contracts'

/** 会话侧薄快照（不必传完整 AgentSession） */
export type GuardrailSessionSnap = {
  oaStatementConfirmed?: boolean
  oaIssueType?: OaIssueType
  oaStrategyNotes?: string
  /** 调研：命中可核验（pubNo+url）；未传则跳过该项 */
  hitsVerifiable?: boolean
  /** 当前 Agent 交接产物状态（pay_unlock 已归档等） */
  handoffStatus?: HandoffStatus
}

export type EvaluateGuardrailsInput = {
  agent?: Pick<AgentDef, 'id' | 'handoffKey' | 'guardrails'> | null
  case?: Pick<
    PatentCase,
    'id' | 'legalReview' | 'oaStatementConfirmed' | 'engagement'
  > | null
  session?: GuardrailSessionSnap | null
  action: GuardrailAction
  persona?: PersonaId
  role?: UserRole
  /** role===enterprise || workspace.kind===enterprise */
  isEnterprise?: boolean
  handoffKey?: HandoffArtifactKey | string
  disclosureStatus?: HandoffStatus
  disclosureCheck?: DisclosurePackCheck
  filingCheck?: DraftFilingCheck
  fullCheckLite?: FullCheckLite
  invoiceBlocked?: { blocked: boolean; reason?: string }
  /** 工作台调研可直接传；优先于 session.hitsVerifiable */
  hitsVerifiable?: boolean
  /** 当前 Agent 交接产物状态（pay_unlock 已归档等） */
  handoffStatus?: HandoffStatus
}

const HITL_GATES: HitlGateId[] = [
  'go_nogo',
  'approve_strategy',
  'authorize_file',
  'pay_unlock',
  'confirm_quote',
]

function isHitlGate(a: GuardrailAction): a is HitlGateId {
  return (HITL_GATES as string[]).includes(a)
}

function isHandoffAction(a: GuardrailAction): a is HandoffAction {
  if (a === 'pay') return false
  return !isHitlGate(a)
}

/** 归一：授权递交族 / 批准族 / 提交族 / 归档递交 */
function actionKind(
  action: GuardrailAction,
): 'authorize' | 'file' | 'approve' | 'submit' | 'pay' | 'go' | 'quote' | 'other' {
  if (action === 'authorize_file' || action === 'authorize') return 'authorize'
  if (action === 'file') return 'file'
  if (action === 'approve_strategy' || action === 'approve') return 'approve'
  if (action === 'submit' || action === 'save_draft') return 'submit'
  if (action === 'pay_unlock' || action === 'pay') return 'pay'
  if (action === 'go_nogo') return 'go'
  if (action === 'confirm_quote') return 'quote'
  return 'other'
}

function push(
  blockers: GuardrailBlocker[],
  code: string,
  message: string | undefined | null,
) {
  if (!message) return
  if (blockers.some((b) => b.code === code && b.message === message)) return
  blockers.push({ code, message })
}

function disclosureApproved(status?: HandoffStatus): boolean {
  return (
    status === 'approved' ||
    status === 'authorized_to_file' ||
    status === 'filed'
  )
}

function resolveAgentId(
  agent?: EvaluateGuardrailsInput['agent'],
): string | undefined {
  return agent?.id
}

function resolveHandoffKey(input: EvaluateGuardrailsInput): string | undefined {
  return input.handoffKey ?? input.agent?.handoffKey
}

function isClaimsPath(agentId?: string, handoffKey?: string): boolean {
  return agentId === 'agent-claims' || handoffKey === 'draft_claims'
}

function isOaPath(agentId?: string, handoffKey?: string): boolean {
  return agentId === 'agent-oa' || handoffKey === 'prosecution_response'
}

function isDisclosurePath(agentId?: string, handoffKey?: string): boolean {
  return agentId === 'agent-disclosure' || handoffKey === 'disclosure_pack'
}

function isResearchPath(agentId?: string, handoffKey?: string): boolean {
  return (
    agentId === 'agent-research' ||
    (handoffKey === 'research_report' && agentId !== 'agent-layout')
  )
}

function isMonetizePath(agentId?: string, handoffKey?: string): boolean {
  return agentId === 'agent-monetize' || handoffKey === 'monetize_terms'
}

function oaConfirmed(input: EvaluateGuardrailsInput): boolean {
  return !!(
    input.case?.oaStatementConfirmed || input.session?.oaStatementConfirmed
  )
}

/**
 * 调研命中可核验：会话步骤 toolResultPreview 或产物正文含 pubNo+url
 * （从 AgentContext 抽出，ConfirmBar/中央校验/Seal Gate 复用）
 */
export function hasVerifiableResearchHitsFromSession(
  sess: Pick<AgentSession, 'steps' | 'artifacts'>,
): boolean {
  const pubRe = /(?:CN|US|EP|WO|JP)[A-Z0-9]{5,}/i
  const urlRe = /https?:\/\/[^\s)\]"']+/i
  const looksHit = (obj: unknown): boolean => {
    if (!obj || typeof obj !== 'object') return false
    const o = obj as Record<string, unknown>
    const pub = typeof o.pubNo === 'string' ? o.pubNo : ''
    const url = typeof o.url === 'string' ? o.url : ''
    return !!pub && pubRe.test(pub) && !!url && urlRe.test(url)
  }
  for (const step of sess.steps) {
    const raw = step.toolResultPreview
    if (!raw) continue
    try {
      const parsed = JSON.parse(raw) as unknown
      if (Array.isArray(parsed) && parsed.some(looksHit)) return true
      if (looksHit(parsed)) return true
    } catch {
      if (pubRe.test(raw) && urlRe.test(raw)) return true
    }
  }
  for (const art of sess.artifacts) {
    for (const line of art.content.split('\n')) {
      if (pubRe.test(line) && urlRe.test(line)) return true
    }
  }
  return false
}

/**
 * 【唯一入口】聚合 Persona / disclosure / Full-check / OA / legal / hits / filing 等硬闸。
 * 返回全部 blockers（以更严为准）；调用方取 blockers[0] 即可对齐原 gateDisabledReason。
 */
export function evaluateGuardrails(
  input: EvaluateGuardrailsInput,
): GuardrailEvalResult {
  const blockers: GuardrailBlocker[] = []
  const kind = actionKind(input.action)
  const agentId = resolveAgentId(input.agent)
  const handoffKey = resolveHandoffKey(input)
  const role = input.role
  const isEnterprise = !!input.isEnterprise

  // —— Persona（复用 personaBlocks*）——
  if (input.persona) {
    if (input.action === 'pay' || kind === 'pay') {
      const pb = personaBlocksPay(input.persona)
      if (pb.blocked) {
        push(blockers, 'persona', pb.reason ?? '当前 Persona 不可付款解锁')
      }
    } else if (isHitlGate(input.action)) {
      const pb = personaBlocksHitlGate(input.persona, input.action)
      if (pb.blocked) {
        push(
          blockers,
          'persona',
          pb.reason ?? '当前 Persona 不可确认此闸',
        )
      }
    } else if (isHandoffAction(input.action)) {
      const pb = personaBlocksHandoffAction(input.persona, input.action)
      if (pb.blocked) {
        push(blockers, 'persona', pb.reason)
      }
    }
  }

  // —— 企业闸 / 角色（与 Session 原逻辑对齐；agency 可走 approve_strategy）——
  if (input.action === 'pay' && !isEnterprise) {
    push(blockers, 'enterprise', '仅企业可付款解锁')
  } else if (isHitlGate(input.action) && ENTERPRISE_GATES.includes(input.action) && !isEnterprise) {
    if (input.action === 'approve_strategy' && role === 'agency') {
      // 代理可提交策略链
    } else if (input.action === 'authorize_file') {
      push(blockers, 'enterprise', '仅企业可授权')
    } else if (input.action === 'pay_unlock') {
      push(blockers, 'enterprise', '仅企业可付款解锁')
    } else {
      push(blockers, 'enterprise', '仅企业可批准')
    }
  }

  // —— 发票阻塞（authorize_file · agency）——
  if (
    (input.action === 'authorize_file' || kind === 'authorize') &&
    role === 'agency' &&
    input.invoiceBlocked?.blocked
  ) {
    push(
      blockers,
      'invoice',
      input.invoiceBlocked.reason ?? '发票阻塞',
    )
  }

  // —— 交底包齐套（disclosure Agent · 批准策略）——
  if (
    kind === 'approve' &&
    isDisclosurePath(agentId, handoffKey) &&
    input.disclosureCheck
  ) {
    if (!disclosurePackComplete(input.disclosureCheck)) {
      const n = Object.values(input.disclosureCheck).filter(Boolean).length
      const total = DISCLOSURE_PACK_CHECK_ITEMS.length
      push(
        blockers,
        'disclosure_pack',
        `交底包未齐套（${n}/${total}）· 缺项见 ConfirmBar`,
      )
    }
  }

  // —— Claims：交底未批准 → 批准/授权/提交/递交 ——
  if (
    isClaimsPath(agentId, handoffKey) &&
    (kind === 'approve' ||
      kind === 'authorize' ||
      kind === 'file' ||
      kind === 'submit')
  ) {
    if (!disclosureApproved(input.disclosureStatus)) {
      push(
        blockers,
        'disclosure_approved',
        kind === 'approve'
          ? '交底包未批准 · 请先交底整理/门户'
          : `交底包未批准，不可${
              kind === 'submit' ? '提交' : kind === 'authorize' ? '授权' : '递交'
            }（请先批准 disclosure_pack）`,
      )
    }
  }

  // —— Claims：递交清单（授权/递交；工作台 submit 亦要求 — 更严）——
  if (
    isClaimsPath(agentId, handoffKey) &&
    (kind === 'authorize' || kind === 'file' || kind === 'submit')
  ) {
    const fc = input.filingCheck
    const n = fc ? Object.values(fc).filter(Boolean).length : 0
    if (!fc || n < 5) {
      push(
        blockers,
        'filing_check',
        kind === 'submit'
          ? '请完成「递交检查清单」全部 5 项'
          : `递交清单未齐套（${n}/5）· 对齐撰写台`,
      )
    }
  }

  // —— OA：争点 + 策略（批准）——
  if (kind === 'approve' && isOaPath(agentId, handoffKey)) {
    if (!input.session?.oaIssueType || !input.session?.oaStrategyNotes?.trim()) {
      push(blockers, 'oa_meta', '请先选争点类型并填策略要点')
    }
  }

  // —— OA：陈述确认（授权/递交）——
  if (
    (kind === 'authorize' || kind === 'file') &&
    isOaPath(agentId, handoffKey) &&
    !oaConfirmed(input)
  ) {
    push(
      blockers,
      'oa_statement',
      '请先确认陈述（答复草稿→已确认陈述）',
    )
  }

  // —— Monetize：法务已阅（批准/授权）——
  if (
    (kind === 'approve' || kind === 'authorize') &&
    isMonetizePath(agentId, handoffKey)
  ) {
    const lr: LegalReviewStatus = input.case?.legalReview ?? 'pending'
    if (lr !== 'reviewed') {
      push(
        blockers,
        'legal_review',
        lr === 'changes_requested'
          ? '法务已退回 · 请修订后再批准'
          : '批准前须法务已阅（非合同签署）',
      )
    }
  }

  // —— Research：hits_verifiable（批准/提交）——
  if (
    (kind === 'approve' || kind === 'submit') &&
    isResearchPath(agentId, handoffKey)
  ) {
    const hits =
      input.hitsVerifiable ?? input.session?.hitsVerifiable
    if (hits === false) {
      push(
        blockers,
        'hits_verifiable',
        '调研命中未齐 · 须 ≥1 条含 pubNo+url 的可核验命中（对齐工作台 hits_verifiable）',
      )
    }
  }

  // —— Intake Go：交底须批准 ——
  if (kind === 'go' && !disclosureApproved(input.disclosureStatus)) {
    push(
      blockers,
      'disclosure_approved',
      '交底包未批准：须 disclosure_pack 为已批准/授权/归档后方可 Go（请先走门户或交底 Agent）',
    )
  }

  // —— 付款解锁 ——
  if (kind === 'pay') {
    if (!input.case?.id) {
      push(blockers, 'pay_unlock', '请先关联案件')
    } else {
      const invs = input.case.engagement?.invoices ?? []
      if (invs.length === 0) {
        push(blockers, 'pay_unlock', '无待付发票 · 请先去费用中心')
      }
      if (input.handoffStatus === 'filed') {
        push(blockers, 'pay_unlock', '已归档')
      }
    }
  }

  // —— Full-check（授权/递交 · 复用 evaluateFullCheck，勿复制）——
  if (kind === 'authorize' || kind === 'file') {
    const scope: FullCheckScope | null = fullCheckScopeFor(agentId, handoffKey)
    if (scope && input.fullCheckLite) {
      const r = evaluateFullCheck({
        scope,
        disclosureStatus: input.disclosureStatus,
        filingCheck: input.filingCheck,
        lite: input.fullCheckLite,
        oaStatementConfirmed: oaConfirmed(input),
        oaIssueType: input.session?.oaIssueType,
        oaStrategyNotes: input.session?.oaStrategyNotes,
      })
      if (!r.ok) {
        // 与前面更具体 disclosure/filing/oa 文案去重，剩余缺口统一 Full-check
        const hasDisclosure = blockers.some((b) =>
          b.code.startsWith('disclosure'),
        )
        const hasFiling = blockers.some((b) => b.code === 'filing_check')
        const hasOaStmt = blockers.some((b) => b.code === 'oa_statement')
        const hasOaMeta = blockers.some((b) => b.code === 'oa_meta')
        const rest = r.missing.filter((m) => {
          if (hasDisclosure && m.includes('交底')) return false
          if (hasFiling && m.includes('filing')) return false
          if (hasOaStmt && m.includes('意见陈述')) return false
          if (hasOaMeta && (m.includes('争点') || m.includes('策略'))) return false
          return true
        })
        if (rest.length > 0) {
          push(blockers, 'full_check', `Full-check 未过：${rest.join('；')}`)
        }
      }
    } else if (scope && !input.fullCheckLite) {
      push(blockers, 'full_check', 'Full-check 未过：缺少 Full-check 勾选状态')
    }
  }

  return { ok: blockers.length === 0, blockers }
}

/** 取首条 blocker 文案（对齐原 gateDisabledReason 单行） */
export function firstGuardrailMessage(
  result: GuardrailEvalResult,
): string | null {
  if (result.ok) return null
  return result.blockers[0]?.message ?? '未通过护栏'
}

/** 付款解锁 / payInvoice 中央校验（action:`pay` · 与 pay_unlock 同源 Persona/企业闸） */
export function evaluatePayUnlock(
  input: Omit<EvaluateGuardrailsInput, 'action'>,
): GuardrailEvalResult {
  return evaluateGuardrails({ ...input, action: 'pay' })
}
