import type {
  AgentTier,
  HandoffArtifactKey,
  HandoffStatus,
  HitlGateId,
  PersonaId,
  StageId,
} from './keys.js'

/** Bump when CaseContextSnapshot shape or semantics change */
export const CASE_CONTEXT_SCHEMA_VERSION = '2026.09.1' as const
export type CaseContextSchemaVersion = typeof CASE_CONTEXT_SCHEMA_VERSION

export type CaseContextArtifactSnap = {
  key: HandoffArtifactKey
  label: string
  status: HandoffStatus | null
  statusLabel: string | null
}

export type CaseContextChecklistSummary = {
  requiredDone: number
  requiredTotal: number
  done: number
  total: number
  complete: boolean
}

export type CaseContextGateState =
  | 'declared'
  | 'cleared'
  | 'blocked_by_persona'
  | 'open'

export type CaseContextGateSnap = {
  id: HitlGateId
  label: string
  state: CaseContextGateState
}

export type CaseContextPersonaVisibility = {
  persona: PersonaId
  personaLabel: string
  canAccessWorkbench: boolean
  canGo: boolean
  canVote: boolean
  inboxMode: 'full' | 'portal' | 'committee'
  blockedHitlGates: HitlGateId[]
}

/** Richer than early draft: tier + HITL gates for mid/agent/workbench parity */
export type CaseContextAgentHint = {
  agentId: string
  name: string
  tier: AgentTier
  tierLabel: string
  tierNote?: string
  hitlGates: HitlGateId[]
  handoffKey: HandoffArtifactKey
}

export type CaseContextSessionBind = {
  sessionId?: string
  boundCaseId?: string | null
  aligned: boolean
  note?: string
}

export type CaseContextSnapshot = {
  schemaVersion: CaseContextSchemaVersion
  caseId: string
  caseNo: string
  title: string
  stage: StageId
  stageName: string
  stageHandoffKey: HandoffArtifactKey | null
  artifacts: CaseContextArtifactSnap[]
  checklist: CaseContextChecklistSummary
  gates: {
    keys: HitlGateId[]
    items: CaseContextGateSnap[]
    cleared: HitlGateId[]
  }
  personaVisibility: CaseContextPersonaVisibility
  agentHints: CaseContextAgentHint[]
  sessionBind?: CaseContextSessionBind
  builtAt: string
}

export function caseContextVersionLabel(v?: string | null): string {
  if (v == null || v === '') return '上下文契约 vlegacy'
  return `上下文契约 v${v}`
}

export function caseContextVersionLabelMd(v?: string | null): string {
  if (v == null || v === '') return 'legacy（无 schemaVersion）'
  return v
}
