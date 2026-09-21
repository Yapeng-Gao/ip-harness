/**
 * Dual-file deliverables per patent seat (agent-patent-shell §3 · SEAT_ROSTER).
 * Shell-local paths — not packages/contracts keys (except known handoffs).
 */
import type { ProjectExpertId } from './types'

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
): PatentDeliverable => ({
  expertId,
  artifactKey,
  nn,
  artifactFile: `${nn}_${artifactKey}.md`,
  worklogFile: `${nn}_${artifactKey}_worklog.md`,
  sampleArtifact: `# ${title}\n\n> 样机成果 · 非真案卷\n\n## 摘要\n边缘调度模组相关产出占位。\n\n## 正文\n（假数据）关键结论与交付结构见本席剧本步骤。\n`,
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
    '| 1 | 定赛道 | 主题 | 边界清楚 | — |\n| 2 | 画全景 | 公开情报 | 支撑立项 | — |',
    '| 宽赛道 | 窄赛道 | 窄 | 可执行 |',
  ),
  'expert-inspire': base(
    'expert-inspire',
    '02',
    'inspire_brief',
    '创新激发',
    '| 1 | 吃全景 | 01 | 方向池 | — |\n| 2 | 收敛 | 可专利性 | 2～3 方向 | — |',
    '| 发散多点 | 收敛 3 | 收敛 | 可挖 |',
  ),
  'expert-competitor': base(
    'expert-competitor',
    '03',
    'competitor_watch',
    '竞品监控',
    '| 1 | 名单 | 全景 | Top 对手 | — |\n| 2 | 威胁分级 | 公开专利 | 高/中/低 | — |',
    '| 全覆盖 | 聚焦威胁 | 聚焦 | 可转挖 |',
  ),
  'expert-mining': base(
    'expert-mining',
    '04',
    'mining_pack',
    '专利挖掘',
    '| 1 | 收上游 | 01–03 | 技术点 | — |\n| 2 | 拆提案 | 特征 | mining_pack | — |',
    '| 单提案 | 多提案 | 2～3 | 可布局 |',
  ),
  'expert-layout': base(
    'expert-layout',
    '05',
    'layout_plan',
    '专利布局',
    '| 1 | 吃挖掘 | 04 | 主从案 | — |\n| 2 | 保护网 | 国别/族 | layout_plan | — |',
    '| 单案 | 主从网 | 主从 | 可查新 |',
  ),
  'expert-research': base(
    'expert-research',
    '06',
    'research_report',
    '检索员（查新暨三性）',
    '| 1 | 检索式 | 挖掘/布局 | 式子 | — |\n| 2 | 命中筛选 | DB | TopN | — |\n| 3 | 三性意见 | 对比 | research_report | — |',
    '| 宽式 | 缩限 | 缩限 | 可立项 |',
  ),
  'expert-intake': base(
    'expert-intake',
    '07',
    'intake_quote',
    '立项决策',
    '| 1 | 吃 01–06 | 上游 | Go 论据 | — |\n| 2 | go_nogo | HITL | 范围 | — |',
    '| No-Go | Go | Go（演示） | 可交底 |',
  ),
  'expert-disclosure': base(
    'expert-disclosure',
    '08',
    'disclosure_pack',
    '交底整理',
    '| 1 | 收技术点 | 立项+查新 | 要点 | — |\n| 2 | 结构 | 背景/方案 | disclosure_pack | — |',
    '| 发明人口述原样 | 结构化 | 结构化 | 可撰写 |',
  ),
  'expert-draft': base(
    'expert-draft',
    '09',
    'draft_claims',
    '撰写代理师',
    '| 1 | 特征表 | 交底 | 必要集 | — |\n| 2 | 权要+说明书 | 规划 | draft_claims | — |',
    '| 宽独权 | 缩限 | 缩限 | 可制图/FTO |',
  ),
  'expert-figure': base(
    'expert-figure',
    '10',
    'figure_list',
    '制图对接',
    '| 1 | 图号需求 | 撰写 | 清单 | — |\n| 2 | 冻图号 | 核对 | figure_list | — |',
    '| 先画后号 | 先号后冻 | 先号 | 可递交 |',
  ),
  'expert-fto': base(
    'expert-fto',
    '11',
    'fto_memo',
    'FTO律师',
    '| 1 | 特征 | 撰写 | claim chart | — |\n| 2 | blocker | 障碍专利 | fto_memo | — |',
    '| 放行 | blocker | 分级 | 递交闸 |',
  ),
  'expert-filing': base(
    'expert-filing',
    '12',
    'filing_checklist',
    '递交流程员',
    '| 1 | 齐套 | 撰写+图+FTO | checklist | — |\n| 2 | authorize→file | HITL | 示意 | — |',
    '| 缺件强推 | 齐套后闸 | 齐套 | 仅总控派 OA |',
  ),
  'expert-oa': base(
    'expert-oa',
    '13',
    'prosecution_response',
    'OA答复代理师',
    '| 1 | 拆通知书 | 已 file | 争点 | — |\n| 2 | 策略+陈述 | 备选 | prosecution_response | — |',
    '| 纯争辩 | 争辩+修改 | 组合 | 可迭代 |',
  ),
  'expert-annuity': base(
    'expert-annuity',
    '14',
    'maintain_annuity',
    '年费管家',
    '| 1 | 到期台账 | 授权后 | 清单 | Phase |\n| 2 | 缴费/放弃 | HITL⑦ | 示意 | Phase |',
    '| 强缴 | 价值联动 | 联动 | Phase |',
  ),
  'expert-valuation': base(
    'expert-valuation',
    '15',
    'valuation_card',
    '价值评估师',
    '| 1 | 抽证据 | 案卷 | 评分输入 | Phase |\n| 2 | 分级 | 公式 | 核心/外围/放弃 | Phase |',
    '| 拍脑袋 | 公式工具 | 公式 | Phase |',
  ),
  'expert-monetize': base(
    'expert-monetize',
    '16',
    'monetize_terms',
    '转化顾问',
    '| 1 | 估值 | 组合 | 区间 | Phase |\n| 2 | 条款 | validator | 草案 | Phase |',
    '| 口头意向 | 必备条款齐 | 齐 | Phase |',
  ),
  'expert-enforcement': base(
    'expert-enforcement',
    '17',
    'enforcement_brief',
    '无效维权顾问',
    '| 1 | 特征映射 | 权要 | 比对表 | Phase |\n| 2 | 回流 F3 | 漏洞 | 信封 | Phase |',
    '| 合并 FTO | 独立席 | 独立 | ≠fto |',
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
