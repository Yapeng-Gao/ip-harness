import type { CommandName } from '@ip/domain'
import type { HandoffArtifactKey, StageId } from '@ip/contracts'
import type { ProjectExpertId } from './types'
import { resolveExpertId } from './experts'

/**
 * L3 · patent bot → mid-platform node mapping (agent-patent-shell §4).
 * 01–05 提案：交接点为空（勿假装已入库）。
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
    midStageLabel: '跨阶段调度',
    handoffKeys: null,
    readTools: ['dispatch_task', 'summarize_timeline', 'accept_dual_file'],
    writeCommands: null,
    honesty: '无直接交接点写入；双文件验收（示意）',
  },
  {
    expertId: 'expert-landscape',
    midStage: 'proposal',
    midStageLabel: '立项前 · 全景（提案）',
    handoffKeys: null,
    readTools: ['map_landscape', 'draft_landscape_report'],
    writeCommands: null,
    honesty: '全景提案 · 未进正式契约库',
  },
  {
    expertId: 'expert-inspire',
    midStage: 'proposal',
    midStageLabel: '立项前 · 激发（提案）',
    handoffKeys: null,
    readTools: ['brainstorm_directions', 'draft_inspire_brief'],
    writeCommands: null,
    honesty: '激发提案 · 未进正式契约库',
  },
  {
    expertId: 'expert-competitor',
    midStage: 'proposal',
    midStageLabel: '立项前 · 竞品（提案）',
    handoffKeys: null,
    readTools: ['list_competitors', 'draft_competitor_watch'],
    writeCommands: null,
    honesty: '竞品提案 · 未进正式契约库',
  },
  {
    expertId: 'expert-mining',
    midStage: 'pre_intake',
    midStageLabel: '立项前 · 挖掘（提案）',
    handoffKeys: null,
    readTools: ['extract_invention_points', 'pack_mining'],
    writeCommands: null,
    honesty: '挖掘包 ≠ 立项；未进正式契约库',
  },
  {
    expertId: 'expert-layout',
    midStage: 'proposal',
    midStageLabel: '立项前 · 布局（提案）',
    handoffKeys: null,
    readTools: ['plan_family', 'draft_layout_plan'],
    writeCommands: null,
    honesty: '布局方案提案；可对齐布局洞察心智',
  },
  {
    expertId: 'expert-research',
    midStage: 'pre_research',
    midStageLabel: '查新（立项前）',
    handoffKeys: ['research_report'],
    readTools: ['commercial_patent_search', 'cluster_hits'],
    writeCommands: ['submitResearch'],
    honesty: '通常只读；绑案确认后才可提交查新',
  },
  {
    expertId: 'expert-intake',
    midStage: 'decision',
    midStageLabel: '立项决策',
    handoffKeys: ['intake_quote'],
    readTools: ['ingest_upstream', 'draft_intake_quote'],
    writeCommands: ['submitHandoff', 'createCaseFromInsight'],
    honesty: '须立不立项确认',
  },
  {
    expertId: 'expert-disclosure',
    midStage: 'drafting',
    midStageLabel: '交底 / 进撰稿前',
    handoffKeys: ['disclosure_pack'],
    readTools: ['structure_disclosure', 'pack_disclosure'],
    writeCommands: ['saveDraft', 'submitHandoff'],
    honesty: '交底整理 ≠ 撰稿；确认后才可存稿/交接',
  },
  {
    expertId: 'expert-draft',
    midStage: 'drafting',
    midStageLabel: '撰稿 · 权利要求',
    handoffKeys: ['draft_claims'],
    readTools: ['draft_claims', 'check_support'],
    writeCommands: ['saveDraft', 'submitClaims', 'submitHandoff'],
    honesty: '撰稿 ≠ 交底；确认后才可存稿/交权要',
  },
  {
    expertId: 'expert-figure',
    midStage: 'drafting_assist',
    midStageLabel: '撰稿 · 附图辅助',
    handoffKeys: null,
    readTools: ['list_needed_figures', 'attach_chapter_event'],
    writeCommands: null,
    honesty: '辅席 · 无独立交接点',
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
    midStageLabel: '授权递交（示意）',
    handoffKeys: null,
    readTools: ['filing_checklist', 'formality_scan'],
    writeCommands: ['authorizeFile', 'fileResponse'],
    honesty: '禁真递交；仅递交闸示意',
  },
  {
    expertId: 'expert-oa',
    midStage: 'prosecution',
    midStageLabel: '答复 · OA',
    handoffKeys: ['prosecution_response'],
    readTools: ['parse_oa_notice', 'oa_strategy', 'draft_oa_response'],
    writeCommands: ['saveDraft', 'submitHandoff'],
    honesty: '仅已递交态；无真审查意见',
  },
  {
    expertId: 'expert-annuity',
    midStage: 'maintenance',
    midStageLabel: '后置 · 年费',
    handoffKeys: ['maintain_annuity'],
    readTools: ['list_annuity_due'],
    writeCommands: null,
    honesty: '后置可跑 · 年费确认在内存 · 禁真缴费',
  },
  {
    expertId: 'expert-valuation',
    midStage: 'phase',
    midStageLabel: '后置 · 价值评估',
    handoffKeys: null,
    readTools: ['score_portfolio'],
    writeCommands: null,
    honesty: '后置可跑 · 评估卡提案 · 不假装已入库',
  },
  {
    expertId: 'expert-monetize',
    midStage: 'commercialization',
    midStageLabel: '后置 · 转化',
    handoffKeys: ['monetize_terms'],
    readTools: ['draft_term_sheet'],
    writeCommands: null,
    honesty: '后置可跑 · 转化确认在内存 · 禁真签约',
  },
  {
    expertId: 'expert-enforcement',
    midStage: 'phase',
    midStageLabel: '后置 · 维权（≠FTO≠监控）',
    handoffKeys: null,
    readTools: ['claim_chart_compare'],
    writeCommands: null,
    honesty: '维权简报提案 · ≠ FTO 席 · 勿借监控告警',
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
