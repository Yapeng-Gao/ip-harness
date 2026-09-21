import type { CommandName } from '@ip/domain'
import type { HandoffArtifactKey, StageId } from '@ip/contracts'
import type { ProjectExpertId } from './types'
import { resolveExpertId } from './experts'

/**
 * L3 · patent bot → mid-platform node mapping (agent-patent-shell §4).
 * 01–05 proposal keys: handoffKeys null (勿写死 packages).
 * No clickable mid deep links.
 */
export type PatentMidMapRow = {
  expertId: ProjectExpertId
  midStage: StageId | 'cross_stage' | 'pre_intake' | 'drafting_assist' | 'authorize_file' | 'proposal' | 'phase'
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
    readTools: ['dispatch_task', 'summarize_timeline', 'accept_dual_file'],
    writeCommands: null,
    honesty: '无直接 handoff 写；双文件验收',
  },
  {
    expertId: 'expert-landscape',
    midStage: 'proposal',
    midStageLabel: '立项前 · 全景（提案）',
    handoffKeys: null,
    readTools: ['map_landscape', 'draft_landscape_report'],
    writeCommands: null,
    honesty: '01 提案键 · 未进 contracts',
  },
  {
    expertId: 'expert-inspire',
    midStage: 'proposal',
    midStageLabel: '立项前 · 激发（提案）',
    handoffKeys: null,
    readTools: ['brainstorm_directions', 'draft_inspire_brief'],
    writeCommands: null,
    honesty: '02 提案键 · 未进 contracts',
  },
  {
    expertId: 'expert-competitor',
    midStage: 'proposal',
    midStageLabel: '立项前 · 竞品（提案）',
    handoffKeys: null,
    readTools: ['list_competitors', 'draft_competitor_watch'],
    writeCommands: null,
    honesty: '03 提案键 · 未进 contracts',
  },
  {
    expertId: 'expert-mining',
    midStage: 'pre_intake',
    midStageLabel: '立项前 · 挖掘（提案）',
    handoffKeys: null,
    readTools: ['extract_invention_points', 'pack_mining'],
    writeCommands: null,
    honesty: '04 mining_pack ≠ 立项；未进 contracts',
  },
  {
    expertId: 'expert-layout',
    midStage: 'proposal',
    midStageLabel: '立项前 · 布局（提案）',
    handoffKeys: null,
    readTools: ['plan_family', 'draft_layout_plan'],
    writeCommands: null,
    honesty: '05 layout_plan 提案；可对齐 layout_insight 心智',
  },
  {
    expertId: 'expert-research',
    midStage: 'pre_research',
    midStageLabel: 'pre_research 查新',
    handoffKeys: ['research_report'],
    readTools: ['commercial_patent_search', 'cluster_hits'],
    writeCommands: ['submitResearch'],
    honesty: '通常只读；绑案 Confirm 后才可 submitResearch',
  },
  {
    expertId: 'expert-intake',
    midStage: 'decision',
    midStageLabel: 'decision · 立项',
    handoffKeys: ['intake_quote'],
    readTools: ['ingest_upstream', 'draft_intake_quote'],
    writeCommands: ['submitHandoff', 'createCaseFromInsight'],
    honesty: '须 go_nogo HITL',
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
    handoffKeys: ['draft_claims'],
    readTools: ['draft_claims', 'check_support'],
    writeCommands: ['saveDraft', 'submitClaims', 'submitHandoff'],
    honesty: '撰稿 ≠ 交底；HITL 后 saveDraft / submitClaims',
  },
  {
    expertId: 'expert-figure',
    midStage: 'drafting_assist',
    midStageLabel: 'drafting 附图辅助',
    handoffKeys: null,
    readTools: ['list_needed_figures', 'attach_chapter_event'],
    writeCommands: null,
    honesty: '辅席 · 无独立 handoff key',
  },
  {
    expertId: 'expert-fto',
    midStage: 'drafting_assist',
    midStageLabel: 'FTO 辅助（≠ layout 台）',
    handoffKeys: null,
    readTools: ['extract_fto_features', 'build_risk_matrix'],
    writeCommands: null,
    honesty: '辅席 · 默认不写案；≠三性',
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
    honesty: '仅已 file；无真 OA',
  },
  {
    expertId: 'expert-annuity',
    midStage: 'maintenance',
    midStageLabel: 'F7 后置 · 年费',
    handoffKeys: ['maintain_annuity'],
    readTools: ['list_annuity_due'],
    writeCommands: null,
    honesty: '后置可跑 · HITL⑦ Confirm 内存 · 禁真缴费',
  },
  {
    expertId: 'expert-valuation',
    midStage: 'phase',
    midStageLabel: 'F7 后置 · 价值',
    handoffKeys: null,
    readTools: ['score_portfolio'],
    writeCommands: null,
    honesty: '后置可跑 · 提案键 valuation_card · 不写 packages',
  },
  {
    expertId: 'expert-monetize',
    midStage: 'commercialization',
    midStageLabel: 'F8 后置 · 转化',
    handoffKeys: ['monetize_terms'],
    readTools: ['draft_term_sheet'],
    writeCommands: null,
    honesty: '后置可跑 · HITL⑧ Confirm 内存 · 禁真签约',
  },
  {
    expertId: 'expert-enforcement',
    midStage: 'phase',
    midStageLabel: 'F9 后置 · 维权（≠FTO≠watch）',
    handoffKeys: null,
    readTools: ['claim_chart_compare'],
    writeCommands: null,
    honesty: '提案 enforcement_brief · ≠ expert-fto · 勿借 watch_alert',
  },
]

export function midMapForExpert(
  expertId: ProjectExpertId,
): PatentMidMapRow | undefined {
  const id = resolveExpertId(expertId)
  return PATENT_MID_MAP.find((r) => r.expertId === id)
}

export function primaryHandoffKeyForExpert(
  expertId: ProjectExpertId,
): HandoffArtifactKey | null {
  const keys = midMapForExpert(expertId)?.handoffKeys
  return keys?.[0] ?? null
}
