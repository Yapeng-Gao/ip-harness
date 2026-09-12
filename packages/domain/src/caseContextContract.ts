/**
 * Enterprise Wave3 · 案级上下文契约（版本化快照）
 * Agent / 工作台 / 中台同读；回放不靠口头约定。纯函数 · 原型内存 · 非事件溯源库。
 */
import type {
  AgentDef,
  HandoffArtifactKey,
  HandoffState,
  HitlGateId,
  PatentCase,
  PersonaId,
  StageId,
} from './types'
import { AGENT_TIER_SHORT, HITL_GATE_LABELS } from './agentLabels'
import {
  ARTIFACT_FOR_STAGE,
  HANDOFF_ARTIFACT_LABELS,
  HANDOFF_LABELS,
} from './handoff'
import { getStageMeta } from './stages'
import {
  PERSONA_LABELS,
  personaBlocksHitlGate,
  personaCanAccessWorkbench,
  personaCanGo,
  personaCanVote,
  personaInboxMode,
} from './persona'

/** P0-5 · CaseContext snapshot types / schemaVersion 唯一源 @ip/contracts */
export {
  CASE_CONTEXT_SCHEMA_VERSION,
  caseContextVersionLabel,
  caseContextVersionLabelMd,
  type CaseContextSchemaVersion,
  type CaseContextArtifactSnap,
  type CaseContextChecklistSummary,
  type CaseContextGateState,
  type CaseContextGateSnap,
  type CaseContextPersonaVisibility,
  type CaseContextAgentHint,
  type CaseContextSessionBind,
  type CaseContextSnapshot,
} from '@ip/contracts'
import {
  CASE_CONTEXT_SCHEMA_VERSION,
  type CaseContextArtifactSnap,
  type CaseContextAgentHint,
  type CaseContextChecklistSummary,
  type CaseContextGateSnap,
  type CaseContextGateState,
  type CaseContextPersonaVisibility,
  type CaseContextSessionBind,
  type CaseContextSnapshot,
} from '@ip/contracts'

export type BuildCaseContextExtras = {
  persona?: PersonaId
  /** Session-cleared HITL gates (when reading from Agent session) */
  clearedHitlGates?: HitlGateId[]
  sessionId?: string
  /** Session.caseId — for thin bind alignment */
  sessionCaseId?: string | null
  /** Override catalog agents used for hints (default: AGENT_CATALOG) */
  agents?: AgentDef[]
  builtAt?: string
}

const ALL_HITL_GATES: HitlGateId[] = [
  'go_nogo',
  'approve_strategy',
  'authorize_file',
  'pay_unlock',
  'confirm_quote',
]

function isoNow(): string {
  return new Date().toISOString()
}

function artifactSnaps(
  handoffs: Partial<Record<HandoffArtifactKey, HandoffState>>,
): CaseContextArtifactSnap[] {
  const keys = Object.keys(HANDOFF_ARTIFACT_LABELS) as HandoffArtifactKey[]
  return keys
    .filter((k) => handoffs[k])
    .map((key) => {
      const h = handoffs[key]!
      return {
        key,
        label: HANDOFF_ARTIFACT_LABELS[key],
        status: h.status,
        statusLabel: HANDOFF_LABELS[h.status] ?? null,
      }
    })
}

function checklistSummary(c: PatentCase): CaseContextChecklistSummary {
  const total = c.checklist.length
  const done = c.checklist.filter((i) => i.done).length
  const requiredTotal = c.checklist.filter((i) => i.required).length
  const requiredDone = c.checklist.filter((i) => i.required && i.done).length
  return {
    requiredDone,
    requiredTotal,
    done,
    total,
    complete: requiredTotal > 0 && requiredDone === requiredTotal,
  }
}

function stageAgentHints(
  stage: StageId,
  agents: AgentDef[],
): CaseContextAgentHint[] {
  return agents
    .filter((a) => a.stage === stage)
    .map((a) => ({
      agentId: a.id,
      name: a.name,
      tier: a.tier,
      tierLabel: AGENT_TIER_SHORT[a.tier],
      tierNote: a.tierNote,
      hitlGates: [...a.hitlGates],
      handoffKey: a.handoffKey,
    }))
}

function collectDeclaredGates(hints: CaseContextAgentHint[]): HitlGateId[] {
  const seen = new Set<HitlGateId>()
  const out: HitlGateId[] = []
  for (const h of hints) {
    for (const g of h.hitlGates) {
      if (!seen.has(g)) {
        seen.add(g)
        out.push(g)
      }
    }
  }
  // Prefer stage primary handoff agent gates; if none, empty is honest
  return out
}

function gateItems(
  declared: HitlGateId[],
  cleared: HitlGateId[],
  persona: PersonaId,
): CaseContextGateSnap[] {
  const clearedSet = new Set(cleared)
  return declared.map((id) => {
    const block = personaBlocksHitlGate(persona, id)
    let state: CaseContextGateState = 'declared'
    if (clearedSet.has(id)) state = 'cleared'
    else if (block.blocked) state = 'blocked_by_persona'
    else state = 'open'
    return {
      id,
      label: HITL_GATE_LABELS[id],
      state,
    }
  })
}

function personaVisibility(persona: PersonaId): CaseContextPersonaVisibility {
  const blockedHitlGates = ALL_HITL_GATES.filter(
    (g) => personaBlocksHitlGate(persona, g).blocked,
  )
  return {
    persona,
    personaLabel: PERSONA_LABELS[persona],
    canAccessWorkbench: personaCanAccessWorkbench(persona),
    canGo: personaCanGo(persona),
    canVote: personaCanVote(persona),
    inboxMode: personaInboxMode(persona),
    blockedHitlGates,
  }
}

function sessionBindSnap(
  caseId: string,
  extras?: BuildCaseContextExtras,
): CaseContextSessionBind | undefined {
  if (
    extras?.sessionId == null &&
    extras?.sessionCaseId === undefined
  ) {
    return undefined
  }
  const bound = extras.sessionCaseId ?? null
  const aligned = bound != null && bound === caseId
  let note: string | undefined
  if (bound == null) note = '会话未绑定案件'
  else if (!aligned) note = `会话绑定 ${bound} ≠ 本案 ${caseId}`
  else note = '会话 caseId 与本案对齐'
  return {
    sessionId: extras.sessionId,
    boundCaseId: bound,
    aligned,
    note,
  }
}

/**
 * 构建案级上下文契约快照（纯函数）。
 * @param caseData 案件
 * @param handoffs 可选覆盖；默认读 case.handoffs
 * @param extras persona / session 清闸 / 绑定对齐 / agent hints
 */
export function buildCaseContext(
  caseData: PatentCase,
  handoffs?: Partial<Record<HandoffArtifactKey, HandoffState>>,
  extras?: BuildCaseContextExtras,
): CaseContextSnapshot {
  const persona: PersonaId = extras?.persona ?? 'enterprise_ip'
  const hof = handoffs ?? caseData.handoffs
  const stageMeta = getStageMeta(caseData.stage)
  const stageHandoffKey =
    (ARTIFACT_FOR_STAGE[caseData.stage] as HandoffArtifactKey | undefined) ??
    null
  const agents = extras?.agents ?? []
  const agentHints = stageAgentHints(caseData.stage, agents)
  const declared = collectDeclaredGates(agentHints)
  const cleared = extras?.clearedHitlGates ?? []
  const builtAt = extras?.builtAt ?? isoNow()

  return {
    schemaVersion: CASE_CONTEXT_SCHEMA_VERSION,
    caseId: caseData.id,
    caseNo: caseData.caseNo,
    title: caseData.title,
    stage: caseData.stage,
    stageName: stageMeta.name,
    stageHandoffKey,
    artifacts: artifactSnaps(hof),
    checklist: checklistSummary(caseData),
    gates: {
      keys: declared,
      items: gateItems(declared, cleared, persona),
      cleared: [...cleared],
    },
    personaVisibility: personaVisibility(persona),
    agentHints,
    sessionBind: sessionBindSnap(caseData.id, extras),
    builtAt,
  }
}

/** 薄对齐：从会话侧读取案级契约（session.caseId → case） */
export function buildCaseContextFromSession(input: {
  caseData: PatentCase | undefined
  sessionId: string
  sessionCaseId?: string | null
  persona: PersonaId
  clearedHitlGates?: HitlGateId[]
  builtAt?: string
  /** Stage agent hints; pass AGENT_CATALOG from app data layer */
  agents?: AgentDef[]
}): CaseContextSnapshot | null {
  const {
    caseData,
    sessionId,
    sessionCaseId,
    persona,
    clearedHitlGates,
    builtAt,
    agents,
  } = input
  if (!caseData) return null
  return buildCaseContext(caseData, caseData.handoffs, {
    persona,
    clearedHitlGates,
    sessionId,
    sessionCaseId: sessionCaseId ?? caseData.id,
    builtAt,
    agents,
  })
}

/** 只读摘要行（折叠面板用） */
export function summarizeCaseContext(snap: CaseContextSnapshot): string[] {
  const lines: string[] = [
    `schemaVersion: ${snap.schemaVersion}`,
    `案件：${snap.caseNo}（${snap.caseId}）`,
    `阶段：${snap.stageName}（${snap.stage}）`,
    snap.stageHandoffKey
      ? `阶段交接键：${snap.stageHandoffKey}`
      : '阶段交接键：—',
    `清单：必做 ${snap.checklist.requiredDone}/${snap.checklist.requiredTotal} · 全部 ${snap.checklist.done}/${snap.checklist.total}${
      snap.checklist.complete ? ' · 齐套' : ''
    }`,
    `交接产物：${
      snap.artifacts.length === 0
        ? '无'
        : snap.artifacts
            .map((a) => `${a.key}=${a.status ?? '—'}`)
            .join(' · ')
    }`,
    `闸门：${
      snap.gates.items.length === 0
        ? '本阶段无目录声明闸'
        : snap.gates.items
            .map((g) => `${g.id}:${g.state}`)
            .join(' · ')
    }`,
    `Persona：${snap.personaVisibility.personaLabel}（${snap.personaVisibility.persona}）· inbox=${snap.personaVisibility.inboxMode}`,
  ]
  if (snap.agentHints.length > 0) {
    lines.push(
      `Agent hints：${snap.agentHints
        .map((a) => `${a.name}[${a.tier}]`)
        .join(' · ')}`,
    )
  }
  if (snap.sessionBind) {
    lines.push(
      `会话绑定：${snap.sessionBind.aligned ? '对齐' : '未对齐'}${
        snap.sessionBind.note ? ` · ${snap.sessionBind.note}` : ''
      }`,
    )
  }
  return lines
}
