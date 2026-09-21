/**
 * Dual-file deliverables per patent seat (agent-patent-shell §3 · SEAT_ROSTER).
 * Shell-local paths — not packages/contracts keys (except known handoffs).
 */
import type { ProjectExpertId } from './types'
import {
  RESEARCH_SAMPLE_ARTIFACT,
  RESEARCH_SAMPLE_WORKLOG_CHOICES,
  RESEARCH_SAMPLE_WORKLOG_STEPS,
} from './pack/researchDepth'
import {
  INTAKE_SAMPLE_ARTIFACT,
  INTAKE_SAMPLE_WORKLOG_CHOICES,
  INTAKE_SAMPLE_WORKLOG_STEPS,
} from './pack/intakeDepth'
import {
  DRAFT_SAMPLE_ARTIFACT,
  DRAFT_SAMPLE_WORKLOG_CHOICES,
  DRAFT_SAMPLE_WORKLOG_STEPS,
} from './pack/draftDepth'
import {
  DISCLOSURE_SAMPLE_ARTIFACT,
  DISCLOSURE_SAMPLE_WORKLOG_CHOICES,
  DISCLOSURE_SAMPLE_WORKLOG_STEPS,
} from './pack/disclosureDepth'
import {
  FIGURE_SAMPLE_ARTIFACT,
  FIGURE_SAMPLE_WORKLOG_CHOICES,
  FIGURE_SAMPLE_WORKLOG_STEPS,
} from './pack/figureDepth'
import {
  FILING_SAMPLE_ARTIFACT,
  FILING_SAMPLE_WORKLOG_CHOICES,
  FILING_SAMPLE_WORKLOG_STEPS,
} from './pack/filingDepth'
import {
  OA_SAMPLE_ARTIFACT,
  OA_SAMPLE_WORKLOG_CHOICES,
  OA_SAMPLE_WORKLOG_STEPS,
} from './pack/oaDepth'
import {
  LANDSCAPE_SAMPLE_ARTIFACT,
  LANDSCAPE_SAMPLE_WORKLOG_CHOICES,
  LANDSCAPE_SAMPLE_WORKLOG_STEPS,
} from './pack/landscapeDepth'
import {
  INSPIRE_SAMPLE_ARTIFACT,
  INSPIRE_SAMPLE_WORKLOG_CHOICES,
  INSPIRE_SAMPLE_WORKLOG_STEPS,
} from './pack/inspireDepth'
import {
  COMPETITOR_SAMPLE_ARTIFACT,
  COMPETITOR_SAMPLE_WORKLOG_CHOICES,
  COMPETITOR_SAMPLE_WORKLOG_STEPS,
} from './pack/competitorDepth'
import {
  MINING_SAMPLE_ARTIFACT,
  MINING_SAMPLE_WORKLOG_CHOICES,
  MINING_SAMPLE_WORKLOG_STEPS,
} from './pack/miningDepth'
import {
  LAYOUT_SAMPLE_ARTIFACT,
  LAYOUT_SAMPLE_WORKLOG_CHOICES,
  LAYOUT_SAMPLE_WORKLOG_STEPS,
} from './pack/layoutDepth'
import {
  FTO_SAMPLE_ARTIFACT,
  FTO_SAMPLE_WORKLOG_CHOICES,
  FTO_SAMPLE_WORKLOG_STEPS,
} from './pack/ftoDepth'
import {
  ANNUITY_SAMPLE_ARTIFACT,
  ANNUITY_SAMPLE_WORKLOG_CHOICES,
  ANNUITY_SAMPLE_WORKLOG_STEPS,
} from './pack/annuityDepth'
import {
  VALUATION_SAMPLE_ARTIFACT,
  VALUATION_SAMPLE_WORKLOG_CHOICES,
  VALUATION_SAMPLE_WORKLOG_STEPS,
} from './pack/valuationDepth'
import {
  MONETIZE_SAMPLE_ARTIFACT,
  MONETIZE_SAMPLE_WORKLOG_CHOICES,
  MONETIZE_SAMPLE_WORKLOG_STEPS,
} from './pack/monetizeDepth'
import {
  ENFORCEMENT_SAMPLE_ARTIFACT,
  ENFORCEMENT_SAMPLE_WORKLOG_CHOICES,
  ENFORCEMENT_SAMPLE_WORKLOG_STEPS,
} from './pack/enforcementDepth'

export type PatentDeliverable = {
  expertId: ProjectExpertId
  /** Shell artifact key (may match HandoffArtifactKey when exists) */
  artifactKey: string
  nn: string
  artifactFile: string
  worklogFile: string
  /** Mock 成果 markdown */
  sampleArtifact: string
  /** Mock worklog markdown — process visible by default */
  sampleWorklog: string
}

const base = (
  expertId: ProjectExpertId,
  nn: string,
  artifactKey: string,
  title: string,
  steps: string,
  choices: string,
  sampleArtifact?: string,
): PatentDeliverable => ({
  expertId,
  artifactKey,
  nn,
  artifactFile: `${nn}_${artifactKey}.md`,
  worklogFile: `${nn}_${artifactKey}_worklog.md`,
  sampleArtifact:
    sampleArtifact ??
    `# ${title}\n\n> 样机成果 · 非真案卷\n\n## 摘要\n边缘调度模组相关产出占位。\n\n## 正文\n（假数据）关键结论与交付结构见本席剧本步骤。\n`,
  sampleWorklog: `# 工作过程 · ${title} · ${artifactKey}\n\n| 案号 | 版本 | HITL |\n|------|------|------|\n| mock-demo | v0 | 样机 |\n\n## 1. 收到什么\n- 上游：主题/分派摘要（mock）\n\n## 2. 目标与成功标准\n- 交齐成果 + 本 worklog\n\n## 3. 步骤时间线\n${steps}\n\n## 4. 关键取舍\n${choices}\n\n## 5. 证据与材料\n- 样机摘录 · 可核验占位\n\n## 6. 卡点与求助\n- 无（演示）\n\n## 7. 交给下家什么\n- 过程见 \`${nn}_${artifactKey}_worklog.md\`\n`,
})

/** Full roster deliverables · SEAT_ROSTER_FOR_PROTOTYPE */
export const PATENT_DELIVERABLES: Record<string, PatentDeliverable> = {
  orchestrator: base(
    'orchestrator',
    '00',
    'case_state',
    '专利全链路总控',
    '| 1 | 收目标 | 用户 | 已记 | — |\n| 2 | 拆派 | 席位 | 卡片就绪 | — |',
    '| 直派 OA | 经递交 file 后 | 经 file | 禁截入 |',
  ),
  'expert-landscape': base(
    'expert-landscape',
    '01',
    'landscape_report',
    '产业全景',
    LANDSCAPE_SAMPLE_WORKLOG_STEPS,
    LANDSCAPE_SAMPLE_WORKLOG_CHOICES,
    LANDSCAPE_SAMPLE_ARTIFACT,
  ),
  'expert-inspire': base(
    'expert-inspire',
    '02',
    'inspire_brief',
    '创新激发',
    INSPIRE_SAMPLE_WORKLOG_STEPS,
    INSPIRE_SAMPLE_WORKLOG_CHOICES,
    INSPIRE_SAMPLE_ARTIFACT,
  ),
  'expert-competitor': base(
    'expert-competitor',
    '03',
    'competitor_watch',
    '竞品监控',
    COMPETITOR_SAMPLE_WORKLOG_STEPS,
    COMPETITOR_SAMPLE_WORKLOG_CHOICES,
    COMPETITOR_SAMPLE_ARTIFACT,
  ),
  'expert-mining': base(
    'expert-mining',
    '04',
    'mining_pack',
    '专利挖掘',
    MINING_SAMPLE_WORKLOG_STEPS,
    MINING_SAMPLE_WORKLOG_CHOICES,
    MINING_SAMPLE_ARTIFACT,
  ),
  'expert-layout': base(
    'expert-layout',
    '05',
    'layout_plan',
    '专利布局',
    LAYOUT_SAMPLE_WORKLOG_STEPS,
    LAYOUT_SAMPLE_WORKLOG_CHOICES,
    LAYOUT_SAMPLE_ARTIFACT,
  ),
  'expert-research': base(
    'expert-research',
    '06',
    'research_report',
    '检索员（查新暨三性）',
    RESEARCH_SAMPLE_WORKLOG_STEPS,
    RESEARCH_SAMPLE_WORKLOG_CHOICES,
    RESEARCH_SAMPLE_ARTIFACT,
  ),
  'expert-intake': base(
    'expert-intake',
    '07',
    'intake_quote',
    '立项决策',
    INTAKE_SAMPLE_WORKLOG_STEPS,
    INTAKE_SAMPLE_WORKLOG_CHOICES,
    INTAKE_SAMPLE_ARTIFACT,
  ),
  'expert-disclosure': base(
    'expert-disclosure',
    '08',
    'disclosure_pack',
    '交底整理',
    DISCLOSURE_SAMPLE_WORKLOG_STEPS,
    DISCLOSURE_SAMPLE_WORKLOG_CHOICES,
    DISCLOSURE_SAMPLE_ARTIFACT,
  ),
  'expert-draft': base(
    'expert-draft',
    '09',
    'draft_claims',
    '撰写代理师',
    DRAFT_SAMPLE_WORKLOG_STEPS,
    DRAFT_SAMPLE_WORKLOG_CHOICES,
    DRAFT_SAMPLE_ARTIFACT,
  ),
  'expert-figure': base(
    'expert-figure',
    '10',
    'figure_list',
    '制图对接',
    FIGURE_SAMPLE_WORKLOG_STEPS,
    FIGURE_SAMPLE_WORKLOG_CHOICES,
    FIGURE_SAMPLE_ARTIFACT,
  ),
  'expert-fto': base(
    'expert-fto',
    '11',
    'fto_memo',
    'FTO律师',
    FTO_SAMPLE_WORKLOG_STEPS,
    FTO_SAMPLE_WORKLOG_CHOICES,
    FTO_SAMPLE_ARTIFACT,
  ),
  'expert-filing': base(
    'expert-filing',
    '12',
    'filing_checklist',
    '递交流程员',
    FILING_SAMPLE_WORKLOG_STEPS,
    FILING_SAMPLE_WORKLOG_CHOICES,
    FILING_SAMPLE_ARTIFACT,
  ),
  'expert-oa': base(
    'expert-oa',
    '13',
    'prosecution_response',
    'OA答复代理师',
    OA_SAMPLE_WORKLOG_STEPS,
    OA_SAMPLE_WORKLOG_CHOICES,
    OA_SAMPLE_ARTIFACT,
  ),
  'expert-annuity': base(
    'expert-annuity',
    '14',
    'maintain_annuity',
    '年费管家',
    ANNUITY_SAMPLE_WORKLOG_STEPS,
    ANNUITY_SAMPLE_WORKLOG_CHOICES,
    ANNUITY_SAMPLE_ARTIFACT,
  ),
  'expert-valuation': base(
    'expert-valuation',
    '15',
    'valuation_card',
    '价值评估师',
    VALUATION_SAMPLE_WORKLOG_STEPS,
    VALUATION_SAMPLE_WORKLOG_CHOICES,
    VALUATION_SAMPLE_ARTIFACT,
  ),
  'expert-monetize': base(
    'expert-monetize',
    '16',
    'monetize_terms',
    '转化顾问',
    MONETIZE_SAMPLE_WORKLOG_STEPS,
    MONETIZE_SAMPLE_WORKLOG_CHOICES,
    MONETIZE_SAMPLE_ARTIFACT,
  ),
  'expert-enforcement': base(
    'expert-enforcement',
    '17',
    'enforcement_brief',
    '无效维权顾问',
    ENFORCEMENT_SAMPLE_WORKLOG_STEPS,
    ENFORCEMENT_SAMPLE_WORKLOG_CHOICES,
    ENFORCEMENT_SAMPLE_ARTIFACT,
  ),
}

export function deliverableForExpert(
  expertId: ProjectExpertId,
): PatentDeliverable | undefined {
  return PATENT_DELIVERABLES[expertId]
}

/** Case folder tree (mock) for a project */
export function caseFolderListing(expertIds: ProjectExpertId[]): string[] {
  const lines: string[] = ['cases/<project>/']
  for (const id of expertIds) {
    const d = PATENT_DELIVERABLES[id]
    if (!d) continue
    lines.push(`  ${d.artifactFile}`)
    lines.push(`  ${d.worklogFile}`)
  }
  return lines
}
