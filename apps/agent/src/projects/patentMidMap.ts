import type { CommandName } from '@ip/domain'
import type { HandoffArtifactKey, StageId } from '@ip/contracts'
import type { ProjectExpertId } from './types'

/**
 * L3 · patent bot → mid-platform node mapping (agent-l3-patent §3 / afe94aa).
 * Display-only; mid + contracts remain authoritative for case/handoff.
 * No clickable mid deep links.
 */
export type PatentMidMapRow = {
  expertId: ProjectExpertId
  midStage: StageId | 'cross_stage' | 'pre_intake' | 'drafting_assist' | 'authorize_file'
  midStageLabel: string
  handoffKeys: HandoffArtifactKey[] | null
  readTools: string[]
  writeCommands: CommandName[] | null
  honesty: string
}

export const PATENT_MID_MAP: PatentMidMapRow[] = [
  {
    expertId: 'orchestrator',
    midStage: 'cross_stage',
    midStageLabel: '跨阶段编排',
    handoffKeys: null,
    readTools: ['dispatch_task', 'summarize_timeline'],
    writeCommands: null,
    honesty: '无直接 handoff 写；只拆派/汇总',
  },
  {
    expertId: 'expert-search',
    midStage: 'pre_research',
    midStageLabel: 'pre_research 调研准备',
    handoffKeys: ['research_report'],
    readTools: ['commercial_patent_search', 'cluster_hits'],
    writeCommands: ['submitResearch'],
    honesty: '通常只读；绑案 Confirm 后才可 submitResearch',
  },
  {
    expertId: 'expert-mining',
    midStage: 'pre_intake',
    midStageLabel: '立项前 / decision',
    handoffKeys: ['intake_quote'],
    readTools: ['extract_invention_points', 'score_invention'],
    writeCommands: ['createCaseFromInsight'],
    honesty: '送立项可事件占位；建案须 HITL',
  },
  {
    expertId: 'expert-disclosure',
    midStage: 'drafting',
    midStageLabel: '交底 / 进 drafting 前',
    handoffKeys: ['disclosure_pack'],
    readTools: ['structure_disclosure', 'pack_disclosure'],
    writeCommands: ['saveDraft', 'submitHandoff'],
    honesty: '交底整理 ≠ 撰稿；HITL 后 saveDraft/submitHandoff',
  },
  {
    expertId: 'expert-draft',
    midStage: 'drafting',
    midStageLabel: 'drafting · 权利要求',
    handoffKeys: ['draft_claims', 'research_report'],
    readTools: ['draft_claims', 'check_support'],
    writeCommands: ['saveDraft', 'submitClaims', 'submitHandoff'],
    honesty: '撰稿 ≠ 交底；HITL 后 saveDraft / submitClaims',
  },
  {
    expertId: 'expert-figure',
    midStage: 'drafting_assist',
    midStageLabel: 'drafting 附图辅助',
    handoffKeys: ['disclosure_pack', 'draft_claims'],
    readTools: ['list_needed_figures', 'attach_chapter_event'],
    writeCommands: null,
    honesty: '挂章=事件示意；真 doc revision 另刀',
  },
  {
    expertId: 'expert-fto',
    midStage: 'drafting_assist',
    midStageLabel: '决策/布局辅助（非强制 Stage）',
    handoffKeys: ['layout_insight'],
    readTools: ['extract_fto_features', 'build_risk_matrix'],
    writeCommands: null,
    honesty: '默认不写案；禁假装法律意见已批',
  },
  {
    expertId: 'expert-filing',
    midStage: 'authorize_file',
    midStageLabel: '授权递交 / authorize→file',
    handoffKeys: null,
    readTools: ['filing_checklist', 'formality_scan'],
    writeCommands: ['authorizeFile', 'fileResponse'],
    honesty: '禁真递交；仅闸+HITL 示意',
  },
  {
    expertId: 'expert-oa',
    midStage: 'prosecution',
    midStageLabel: 'prosecution · OA 答复',
    handoffKeys: ['prosecution_response'],
    readTools: ['parse_oa_notice', 'oa_strategy', 'draft_oa_response'],
    writeCommands: ['saveDraft', 'submitHandoff'],
    honesty: '无真 OA；HITL 后草稿/交接示意',
  },
]

export function midMapForExpert(
  expertId: ProjectExpertId,
): PatentMidMapRow | undefined {
  return PATENT_MID_MAP.find((r) => r.expertId === expertId)
}

/** Primary HandoffArtifactKey for L3 write payloads — never hardcode draft_claims across seats. */
export function primaryHandoffKeyForExpert(
  expertId: ProjectExpertId,
): HandoffArtifactKey | null {
  const keys = midMapForExpert(expertId)?.handoffKeys
  return keys?.[0] ?? null
}
