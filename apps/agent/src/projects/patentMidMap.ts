import type { CommandName } from '@ip/domain'
import type { HandoffArtifactKey, StageId } from '@ip/contracts'
import type { ProjectExpertId } from './types'

/**
 * L3 · patent bot → mid-platform node mapping (agent-l3-patent §3 / agent-layers §5).
 * Display-only; mid + contracts remain authoritative for case/handoff.
 */
export type PatentMidMapRow = {
  expertId: ProjectExpertId
  midStage: StageId | 'cross_stage' | 'pre_intake' | 'drafting_assist'
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
    expertId: 'expert-draft',
    midStage: 'drafting',
    midStageLabel: 'pre_research→drafting · 交底',
    handoffKeys: ['research_report', 'disclosure_pack', 'draft_claims'],
    readTools: ['draft_claims', 'check_support'],
    writeCommands: ['saveDraft', 'submitHandoff', 'submitClaims'],
    honesty: 'HITL 后 saveDraft / submitHandoff / submitClaims',
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
    expertId: 'expert-mining',
    midStage: 'pre_intake',
    midStageLabel: '立项前 / decision',
    handoffKeys: ['intake_quote'],
    readTools: ['extract_invention_points', 'score_invention'],
    writeCommands: ['createCaseFromInsight'],
    honesty: '送立项可事件占位；建案须 HITL',
  },
  {
    expertId: 'expert-figure',
    midStage: 'drafting_assist',
    midStageLabel: 'drafting 附图辅助',
    handoffKeys: ['disclosure_pack', 'draft_claims'],
    readTools: ['mock_sketch', 'attach_chapter_event'],
    writeCommands: null,
    honesty: '挂章=事件示意；真 doc revision 另刀',
  },
]

export function midMapForExpert(
  expertId: ProjectExpertId,
): PatentMidMapRow | undefined {
  return PATENT_MID_MAP.find((r) => r.expertId === expertId)
}
