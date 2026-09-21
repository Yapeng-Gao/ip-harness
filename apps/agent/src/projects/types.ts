import type { CommandName, HitlGateId } from '@ip/domain'

/** Project kind — general folder vs domain pack (agent-entry-modes). */
export type ProjectKind = 'general' | 'domain'

/** First DomainPack; reserved packs may appear later. */
export type DomainPackId = 'patent'

/**
 * Patent Catalog ids · agent-patent-shell §4 (25475b4) + SEAT_ROSTER.
 * Legacy: expert-search → resolve to expert-research.
 */
export type ProjectExpertId =
  | 'orchestrator'
  | 'expert-landscape'
  | 'expert-inspire'
  | 'expert-competitor'
  | 'expert-mining'
  | 'expert-layout'
  | 'expert-research'
  | 'expert-search' // legacy alias (resolve → expert-research)
  | 'expert-intake'
  | 'expert-disclosure'
  | 'expert-draft'
  | 'expert-figure'
  | 'expert-fto'
  | 'expert-filing'
  | 'expert-oa'
  | 'expert-annuity'
  | 'expert-valuation'
  | 'expert-monetize'
  | 'expert-enforcement'
  | 'general-orchestrator'
  | 'general-research'
  | 'general-write'
  | 'general-review'

export type ProjectThreadKind = 'orchestrator' | 'expert'

export type TimelineEventKind =
  | 'project_created'
  | 'dispatch'
  | 'expert_report'
  | 'step'
  | 'hitl'
  | 'domain_command'
  | 'system'
  | 'room_loop'

export type ChatRole = 'user' | 'assistant' | 'system' | 'tool'

export type DomainCommandCandidate = {
  command: CommandName | null
  label: string
  note: string
}

export type ExpertStepDef = {
  id: string
  label: string
  script: string
  tool?: { name: string; preview: string }
  /** 可扫读结构化片段（表/列表）· 进 progressive 双文件；会话仍用 script */
  structuredBody?: string
  triggersHitl?: boolean
  hitlGate?: HitlGateId
}

export type ExpertShortcut = {
  id: string
  label: string
  action: 'advance' | 'jump' | 'report' | 'dispatch_hint'
  stepId?: string
  hint?: string
}

export type ProjectExpertDef = {
  id: ProjectExpertId
  name: string
  role: 'orchestrator' | 'expert'
  specialty: string
  description: string
  tools: string[]
  shortcuts: ExpertShortcut[]
  steps: ExpertStepDef[]
  hitlGates: HitlGateId[]
  domainCommandCandidates: DomainCommandCandidate[]
  guardrails: string[]
  catalogAgentId: string | null
  accent: string
  /** Catalog: pre = 立项前簇 · core = 主链 · assist = 辅 · orch · phase = F7–F9 */
  catalogGroup?: 'pre' | 'core' | 'assist' | 'orch' | 'phase'
  /** Default checked in Catalog teaming */
  defaultTeam?: boolean
  /** Owner label from OWNER matrix */
  ownerLabel?: string
  /** F7–F9 后置业务标签（可跑样机，非灰显死胡同） */
  phase?: boolean
  /** 后置说明文案 */
  emptyStateNote?: string
}

export type ProjectChatMessage = {
  id: string
  role: ChatRole
  content: string
  at: string
  meta?: {
    toolName?: string
    stepId?: string
    dispatchId?: string
    backend?: 'mock'
    spontaneous?: boolean
    fromExpertId?: ProjectExpertId
  }
}

export type ProjectThread = {
  id: string
  projectId: string
  expertId: ProjectExpertId
  kind: ProjectThreadKind
  title: string
  messages: ProjectChatMessage[]
  stepIndex: number
  boundSessionId?: string
  pendingHitl?: boolean
  pendingGate?: HitlGateId
  /** Confirm succeeded (memory) — overview shows 已确认 */
  hitlCleared?: boolean
  updatedAt: string
  artifactSubmitted?: boolean
}

export type ProjectTimelineEvent = {
  id: string
  projectId: string
  kind: TimelineEventKind
  title: string
  detail: string
  at: string
  expertId?: ProjectExpertId
  dispatchId?: string
}

export type ProjectDispatchExpertId = Exclude<
  ProjectExpertId,
  'orchestrator' | 'general-orchestrator'
>

export type ProjectDispatch = {
  id: string
  projectId: string
  toExpertId: ProjectDispatchExpertId
  summary: string
  at: string
  status: 'open' | 'reported'
}

export type CaseBindState = 'none' | 'bound' | 'pending_create'

export type AgentProject = {
  id: string
  title: string
  summary: string
  kind: ProjectKind
  domainPackId?: DomainPackId
  caseId?: string
  caseBindState?: CaseBindState
  expertIds: ProjectExpertId[]
  createdAt: string
  updatedAt: string
}

export type DomainCommandWriteLog = {
  id: string
  projectId: string
  expertId: ProjectExpertId
  command: CommandName
  payload: Record<string, unknown>
  at: string
  midCaseHref?: string
  note: string
}

export type RoomMessage = {
  id: string
  projectId: string
  fromExpertId: ProjectExpertId | 'user'
  toExpertId?: ProjectExpertId | 'all'
  body: string
  kind: 'request' | 'result' | 'note' | 'user'
  at: string
  spontaneous?: boolean
}
