/**
 * 业务壳确认 → 中台 DomainCommand / flowProgress 投影。
 * 命令名只用 @ip/contracts 已有 DomainCommand；附图无独立键，挂在 draft_claims（L3 辅席）。
 * 一次确认写到「已通过」：提交后接 startReview，再 confirmQuote / approveHandoff。
 * 递交收尾是 authorizeFile。不按工作区分叉。闸门由 CommandMeta.syncPass 在同步路径上绕过。
 */
import type {
  CommandMeta,
  DomainCommand,
  HandoffArtifactKey,
} from '@ip/contracts'
import type { FlowKey, StageId } from '@ip/domain/types'
import { stepsForFlow } from '../../../../src/data/flowSteps'
import {
  CONFIRM_KIND_LABEL,
  CONFIRM_META,
  type BusinessConfirmKind,
  type BusinessStageId,
  type ResearchPass,
} from './businessSeats'

export type { DomainCommand, CommandMeta }

export type BusinessMidSyncRow = {
  kind: BusinessConfirmKind
  /** 这一席通过后的收尾命令 */
  command: DomainCommand['type']
  /** 收尾前的提交命令；没有单独提交步则为 null */
  prelude: DomainCommand['type'] | null
  handoffKey: HandoffArtifactKey
  flowKey: FlowKey
  /** FLOW_CATALOG 里这一确认覆盖的子步骤 */
  flowStepLabel: string
}

export const BUSINESS_MID_SYNC: Record<BusinessConfirmKind, BusinessMidSyncRow> = {
  go_nogo: {
    kind: 'go_nogo',
    command: 'confirmQuote',
    prelude: 'submitHandoff',
    handoffKey: 'intake_quote',
    flowKey: 'intake',
    flowStepLabel: 'Go/No-Go',
  },
  disclosure_ready: {
    kind: 'disclosure_ready',
    command: 'approveHandoff',
    prelude: 'submitHandoff',
    handoffKey: 'disclosure_pack',
    flowKey: 'draft',
    flowStepLabel: '交底书',
  },
  research_ready: {
    kind: 'research_ready',
    command: 'approveHandoff',
    prelude: 'submitResearch',
    handoffKey: 'research_report',
    flowKey: 'research',
    flowStepLabel: '结论提交',
  },
  claims_ready: {
    kind: 'claims_ready',
    command: 'approveHandoff',
    prelude: 'submitClaims',
    handoffKey: 'draft_claims',
    flowKey: 'draft',
    flowStepLabel: '权利要求树',
  },
  figures_ready: {
    kind: 'figures_ready',
    command: 'saveDraft',
    prelude: null,
    handoffKey: 'draft_claims',
    flowKey: 'draft',
    flowStepLabel: '生成清单',
  },
  file_authorize: {
    kind: 'file_authorize',
    command: 'authorizeFile',
    prelude: null,
    handoffKey: 'draft_claims',
    flowKey: 'draft',
    flowStepLabel: '生成清单',
  },
  oa_strategy: {
    kind: 'oa_strategy',
    command: 'approveHandoff',
    prelude: 'analyzeAndSubmitOA',
    handoffKey: 'prosecution_response',
    flowKey: 'prosecution',
    flowStepLabel: '争点策略',
  },
  layout_adjust: {
    kind: 'layout_adjust',
    command: 'approveHandoff',
    prelude: 'submitHandoff',
    handoffKey: 'layout_insight',
    flowKey: 'layout',
    flowStepLabel: '交接',
  },
}

/** 中台案详「产物单源」只展示名称；正文走 handoff note / 时间线 */
export const MID_ARTIFACT_LABEL: Record<
  BusinessConfirmKind,
  { name: string; type: string }
> = {
  go_nogo: { name: '立项确认摘要.md', type: '摘要' },
  disclosure_ready: { name: '交底摘要.md', type: '摘要' },
  research_ready: { name: '查新结论摘要.md', type: '报告' },
  claims_ready: { name: '权利要求摘要.md', type: '摘要' },
  figures_ready: { name: '附图摘要.md', type: '摘要' },
  file_authorize: { name: '递交确认摘要.md', type: '摘要' },
  oa_strategy: { name: '答复策略摘要.md', type: '摘要' },
  layout_adjust: { name: '布局调整摘要.md', type: '摘要' },
}

const NOTE_MAX = 480

export function handoffNoteForConfirm(input: {
  kind: BusinessConfirmKind
  artifactMarkdown?: string | null
  fallback: string
}): string {
  const raw =
    input.artifactMarkdown?.trim() ||
    input.fallback.trim() ||
    CONFIRM_KIND_LABEL[input.kind]
  const body = raw.length > NOTE_MAX ? `${raw.slice(0, NOTE_MAX)}…` : raw
  return `${CONFIRM_KIND_LABEL[input.kind]} · ${body}`
}

export function midSyncMeta(input: {
  kind: BusinessConfirmKind
  seatId: string
  action: 'confirm' | 'return'
}): CommandMeta {
  const row = BUSINESS_MID_SYNC[input.kind]
  return {
    actor: 'agent',
    agentId: input.seatId,
    syncPass: true,
    detail:
      input.action === 'confirm'
        ? `业务确认 ${input.kind} → ${row.command}`
        : `业务退回 ${input.kind} → requestChanges`,
  }
}

function passTail(
  kind: BusinessConfirmKind,
  caseId: string,
  note: string,
): DomainCommand[] {
  const key = BUSINESS_MID_SYNC[kind].handoffKey
  const review: DomainCommand = {
    type: 'startReview',
    caseId,
    handoffKey: key,
    note,
  }
  if (kind === 'go_nogo') {
    return [review, { type: 'confirmQuote', caseId, note }]
  }
  return [review, { type: 'approveHandoff', caseId, handoffKey: key, note }]
}

/** 一次确认写到已通过：提交（如有）→ 开始确认 → 批准 / 确认报价。不看工作区。 */
export function confirmCommands(input: {
  kind: BusinessConfirmKind
  caseId: string
  note: string
}): DomainCommand[] {
  const { kind, caseId, note } = input
  switch (kind) {
    case 'go_nogo':
      return [
        { type: 'submitHandoff', caseId, handoffKey: 'intake_quote', note },
        ...passTail(kind, caseId, note),
      ]
    case 'disclosure_ready':
      return [
        { type: 'submitHandoff', caseId, handoffKey: 'disclosure_pack', note },
        ...passTail(kind, caseId, note),
      ]
    case 'research_ready':
      return [
        {
          type: 'submitResearch',
          caseId,
          note,
          artifactName: MID_ARTIFACT_LABEL.research_ready.name,
        },
        ...passTail(kind, caseId, note),
      ]
    case 'claims_ready':
      return [
        { type: 'submitClaims', caseId, note },
        ...passTail(kind, caseId, note),
      ]
    case 'figures_ready':
      return [{ type: 'saveDraft', caseId, handoffKey: 'draft_claims', note }]
    case 'file_authorize':
      return [{ type: 'authorizeFile', caseId, handoffKey: 'draft_claims', note }]
    case 'oa_strategy':
      return [
        { type: 'analyzeAndSubmitOA', caseId, note },
        ...passTail(kind, caseId, note),
      ]
    case 'layout_adjust':
      return [
        { type: 'submitHandoff', caseId, handoffKey: 'layout_insight', note },
        ...passTail(kind, caseId, note),
      ]
  }
}

function returnPrelude(
  kind: BusinessConfirmKind,
  caseId: string,
  note: string,
): DomainCommand {
  switch (kind) {
    case 'research_ready':
      return {
        type: 'submitResearch',
        caseId,
        note,
        artifactName: MID_ARTIFACT_LABEL.research_ready.name,
      }
    case 'claims_ready':
      return { type: 'submitClaims', caseId, note }
    case 'oa_strategy':
      return { type: 'analyzeAndSubmitOA', caseId, note }
    default:
      return {
        type: 'submitHandoff',
        caseId,
        handoffKey: BUSINESS_MID_SYNC[kind].handoffKey,
        note,
      }
  }
}

/** 先尽力提交，再 requestChanges。交接已越过起草时提交会失败，退回命令仍要发出。 */
export function returnCommands(input: {
  kind: BusinessConfirmKind
  caseId: string
  note: string
}): DomainCommand[] {
  const key = BUSINESS_MID_SYNC[input.kind].handoffKey
  return [
    returnPrelude(input.kind, input.caseId, input.note),
    {
      type: 'requestChanges',
      caseId: input.caseId,
      handoffKey: key,
      note: input.note,
      annotation: input.note,
    },
  ]
}

export type CommandDispatch = (
  cmd: DomainCommand,
  meta: CommandMeta,
) => Promise<{ ok: boolean; message: string }>

export type CommandRunResult = {
  ok: boolean
  message: string
  applied: DomainCommand['type'][]
}

export async function runConfirmCommands(
  commands: DomainCommand[],
  dispatch: CommandDispatch,
  meta: CommandMeta,
): Promise<CommandRunResult> {
  const applied: DomainCommand['type'][] = []
  for (const cmd of commands) {
    let result: { ok: boolean; message: string }
    try {
      result = await dispatch(cmd, meta)
    } catch (err) {
      return {
        ok: false,
        message: err instanceof Error ? err.message : '中台写入失败',
        applied,
      }
    }
    if (!result.ok) return { ok: false, message: result.message, applied }
    applied.push(cmd.type)
  }
  return {
    ok: applied.length > 0,
    message: applied.length > 0 ? '已通过' : '无命令',
    applied,
  }
}

export async function runReturnCommands(
  commands: DomainCommand[],
  dispatch: CommandDispatch,
  meta: CommandMeta,
): Promise<CommandRunResult> {
  const applied: DomainCommand['type'][] = []
  let sawReturn = false
  for (const cmd of commands) {
    let result: { ok: boolean; message: string }
    try {
      result = await dispatch(cmd, meta)
    } catch (err) {
      if (cmd.type !== 'requestChanges') continue
      return {
        ok: false,
        message: err instanceof Error ? err.message : '中台写入失败',
        applied,
      }
    }
    if (result.ok) applied.push(cmd.type)
    if (cmd.type === 'requestChanges') {
      sawReturn = true
      return { ok: result.ok, message: result.message, applied }
    }
  }
  if (!sawReturn) {
    return { ok: false, message: '未发出退回命令', applied }
  }
  return { ok: false, message: '未写入退回', applied }
}

export type MidSyncOutcome = {
  businessOk: boolean
  midOk: boolean
  midMessage: string
  flowProjected: boolean
}

export function midStageForBusiness(stageId: BusinessStageId): StageId {
  switch (stageId) {
    case 'prepare':
      return 'pre_research'
    case 'intake':
      return 'decision'
    case 'drafting':
    case 'filing':
      return 'drafting'
    case 'oa':
      return 'prosecution'
  }
}

export function midCaseDraftFromWizard(input: {
  id: string
  title: string
  summary?: string
  stageId: BusinessStageId
}): {
  id: string
  title: string
  stage: StageId
  summary: string
  fulfillmentMode: 'self_serve'
} {
  return {
    id: input.id,
    title: input.title.trim() || '未命名案子',
    stage: midStageForBusiness(input.stageId),
    summary: input.summary?.trim() || '业务向导新建',
    fulfillmentMode: 'self_serve',
  }
}

export type FlowProjection = { flowKey: FlowKey; stepIndex: number }

function stepLabelIndex(flowKey: FlowKey, label: string): number {
  const i = stepsForFlow(flowKey).indexOf(label)
  return i < 0 ? 0 : i
}

/**
 * 只读投影：业务 stage / 已完成席 / 查新轮次 → 中台 flow 水位。
 * stepIndex 与案详节点树一致：小于它的子步骤算已覆盖。
 */
export function projectBusinessFlow(prog: {
  stageId: BusinessStageId
  doneSeatIds: readonly string[]
  researchPass: ResearchPass
  filed: boolean
}): FlowProjection[] {
  const done = new Set(prog.doneSeatIds)
  const out: FlowProjection[] = []
  const pastIntake =
    done.has('expert-intake') ||
    prog.stageId === 'drafting' ||
    prog.stageId === 'filing' ||
    prog.stageId === 'oa'
  if (pastIntake) {
    out.push({ flowKey: 'intake', stepIndex: stepsForFlow('intake').length })
  } else if (prog.stageId === 'intake') {
    out.push({ flowKey: 'intake', stepIndex: 0 })
  }

  if (prog.researchPass >= 1) {
    out.push({ flowKey: 'research', stepIndex: stepsForFlow('research').length })
  } else if (done.has('expert-disclosure')) {
    out.push({ flowKey: 'research', stepIndex: 0 })
  }

  let draftIndex: number | null = null
  if (
    prog.stageId === 'drafting' ||
    prog.stageId === 'filing' ||
    prog.stageId === 'oa' ||
    done.has('expert-disclosure')
  ) {
    draftIndex = 0
  }
  if (done.has('expert-disclosure')) {
    draftIndex = stepLabelIndex('draft', '权利要求树')
  }
  if (done.has('expert-draft')) {
    draftIndex = stepLabelIndex('draft', '申请策略')
  }
  if (done.has('expert-figure') && prog.researchPass >= 2) {
    draftIndex = stepsForFlow('draft').length
  }
  if (prog.filed || prog.stageId === 'filing' || prog.stageId === 'oa') {
    draftIndex = stepsForFlow('draft').length
  }
  if (draftIndex != null) out.push({ flowKey: 'draft', stepIndex: draftIndex })

  if (done.has('expert-oa')) {
    out.push({
      flowKey: 'prosecution',
      stepIndex: stepsForFlow('prosecution').length,
    })
  } else if (prog.filed || prog.stageId === 'oa') {
    out.push({ flowKey: 'prosecution', stepIndex: 0 })
  }

  if (done.has('expert-layout')) {
    out.push({ flowKey: 'layout', stepIndex: stepsForFlow('layout').length })
  }

  return out
}

/** 席 id，给审计 agentId。确认种类没有席时退回空串。 */
export function seatIdForConfirm(kind: BusinessConfirmKind): string {
  return CONFIRM_META[kind].seatId
}
