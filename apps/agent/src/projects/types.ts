import type { CommandName, HitlGateId } from '@ip/domain'

/** Project kind — general folder vs domain pack (agent-entry-modes). */
export type ProjectKind = 'general' | 'domain'

/** First DomainPack; reserved packs may appear later. */
export type DomainPackId = 'patent'

/** Project-folder expert / bot seat (Grok-bot form; own business logic). */
export type ProjectExpertId =
  | 'orchestrator'
  | 'expert-search'
  | 'expert-draft'
  | 'expert-fto'
  | 'expert-mining'
  | 'expert-figure'
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

export type ChatRole = 'user' | 'assistant' | 'system' | 'tool'

export type DomainCommandCandidate = {
  /** DomainCommand.type — null = 只读专家，无写库候选 */
  command: CommandName | null
  label: string
  note: string
}

export type ExpertStepDef = {
  id: string
  label: string
  /** Mock reply when advancing to / completing this step */
  script: string
  /** Optional tool shown on this step */
  tool?: { name: string; preview: string }
  /** When true, advancing here opens HITL ConfirmBar */
  triggersHitl?: boolean
  hitlGate?: HitlGateId
}

export type ExpertShortcut = {
  id: string
  label: string
  /** Jump to step id or append script line */
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
  /** Tools shown on toolbar (must differ per expert) */
  tools: string[]
  shortcuts: ExpertShortcut[]
  steps: ExpertStepDef[]
  hitlGates: HitlGateId[]
  domainCommandCandidates: DomainCommandCandidate[]
  guardrails: string[]
  /** Bind underlying AgentSession to this catalog agent for real HITL→DomainCommand */
  catalogAgentId: string | null
  accent: string
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
  }
}

export type ProjectThread = {
  id: string
  projectId: string
  expertId: ProjectExpertId
  kind: ProjectThreadKind
  title: string
  messages: ProjectChatMessage[]
  /** Index into expert.steps — current position in domain state machine */
  stepIndex: number
  /** Bound AgentSession id for HITL Confirm → DomainCommand */
  boundSessionId?: string
  pendingHitl?: boolean
  pendingGate?: HitlGateId
  updatedAt: string
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

/** Spec: agent-case-binding.md */
export type CaseBindState = 'none' | 'bound' | 'pending_create'

export type AgentProject = {
  id: string
  title: string
  summary: string
  kind: ProjectKind
  /** Required when kind === 'domain'; patent is the first pack. */
  domainPackId?: DomainPackId
  caseId?: string
  /** none = 未绑；bound = 已绑；pending_create = 创建并绑定短瞬（UI loading） */
  caseBindState?: CaseBindState
  expertIds: ProjectExpertId[]
  createdAt: string
  updatedAt: string
}

/** L3 prototype: Confirm → DomainCommand write indication (in-memory only). */
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
