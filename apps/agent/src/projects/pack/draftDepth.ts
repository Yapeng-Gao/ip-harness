/**
 * 撰写席深度（agent-depth-reliability P2）
 * 对齐 bot-expert-assets「撰写代理人」：权项层级 → 成文 → 四类校验示意 → HITL
 */
import type { ExpertStepDef } from '../types'

export const DRAFT_DEPTH_STEPS: ExpertStepDef[] = [
  {
    id: 'features',
    label: '特征表',
    script:
      '【撰写】已从交底/立项抽出必要技术特征表，并标独立/从属候选。',
    tool: { name: 'build_feature_table', preview: '特征 8 条 · 独权候选 3' },
    structuredBody: [
      '| # | 特征 | 来源 | 独权候选 | 备注 |',
      '|---|------|------|----------|------|',
      '| 1 | 采集边缘节点时序负载 | 交底 | ✓ | 必要 |',
      '| 2 | 预测下一窗口负载 | 交底 | ✓ | 必要 |',
      '| 3 | 能耗约束 | 交底 | ✓ | 与 SLA 同权 |',
      '| 4 | SLA 约束 | 交底 | ✓ | 与能耗同权 |',
      '| 5 | 多约束联合调度 | 立项 | ✓ | 区别特征核心 |',
      '| 6 | 模组热插拔事件 | 交底 | ✓ | 联动触发 |',
      '| 7 | 调度策略随插拔重算 | 立项 | ✓ | 区别特征核心 |',
      '| 8 | 云边降级窗口 | 查新从权 | — | 宜从权 |',
      '',
      '**KB 样例卡**：权项模板「装置+方法」双套（占位）',
    ].join('\n'),
  },
  {
    id: 'hierarchy',
    label: '权项层级规划',
    script:
      '【撰写】独权最小集 + 从权梯度已排好，先布局再成文（红线：不先堆字）。',
    tool: { name: 'plan_claim_tree', preview: '独权 1 · 从权 5 · 梯度 3 层' },
    structuredBody: [
      '**独权 1（最小集）**',
      '预测 → 多约束（能耗+SLA）联合调度 → 热插拔触发重算',
      '',
      '**从权梯度**',
      '| 从权 | 落入 | 作用 |',
      '|------|------|------|',
      '| 2 | 时序特征具体化 | 抗驳回备位 |',
      '| 3 | 能耗指标定义 | 清楚性 |',
      '| 4 | SLA 指标定义 | 清楚性 |',
      '| 5 | 热插拔接口形态 | 结构保护 |',
      '| 6 | 云边降级 | 外围 |',
      '',
      '术语首现将在说明书定义：负载窗口、联合代价、插拔事件。',
    ].join('\n'),
  },
  {
    id: 'claims',
    label: '权要草案',
    script:
      '【撰写】独权 1 + 从权 2–6 骨架已写入成果。说明书实施例对照待下一步。',
    tool: { name: 'draft_claims', preview: '权利要求 1+5 · 已挂交手稿' },
    structuredBody: [
      '**权利要求 1（示意骨架）**',
      '一种边缘节点调度方法，包括：根据时序特征预测负载；在能耗约束与 SLA 约束下联合求解调度方案；响应模组热插拔事件重新求解并下发。',
      '',
      '**从权 2–6**：略（见层级表）· 样机不展开全文。',
      '',
      '**独立权利要求数量**：1 · **从属**：5',
    ].join('\n'),
  },
  {
    id: 'spec',
    label: '说明书要点',
    script:
      '【撰写】背景/发明内容/实施例提纲已齐；摘要约 120 字。',
    tool: { name: 'draft_specification_outline', preview: '说明书 5 节 · 摘要约 120 字' },
    structuredBody: [
      '**说明书提纲**',
      '1. 技术领域 / 背景：边缘调度与能耗、SLA 冲突',
      '2. 发明内容：三联组合与有益效果（降违约 + 可控能耗）',
      '3. 附图说明：系统图、时序图、插拔流程图（待制图席）',
      '4. 实施例：实施例 1 软件方法 · 实施例 2 装置',
      '5. 摘要：边缘节点在预测负载下，于能耗与 SLA 同权约束中联合调度，并在模组热插拔时重算下发。',
      '',
      '**术语定义（首现）**：负载窗口；联合代价函数；插拔事件。',
    ].join('\n'),
  },
  {
    id: 'validate',
    label: '四类校验',
    script:
      '【撰写】引用链/支持性/单一性/清楚性已跑示意校验；超范围 blocker 未触发。',
    tool: {
      name: 'claim_validator',
      preview: '支持性告警×1 · 清楚/单一/超范围通过',
    },
    structuredBody: [
      '| 检查 | 结果 | 说明 |',
      '|------|------|------|',
      '| 引用链完整性 | Pass | 从权引用链无断 |',
      '| 支持性 | Warn×1 | 从权 6「降级」实施例笔墨偏少 · 建议补一段 |',
      '| 单一性 | Pass | 单总发明构思 |',
      '| 清楚性 | Pass | 术语已定义 |',
      '| **超范围 blocker** | **Pass** | 未超出交底记载（样机） |',
      '',
      '处理策略：Warn 逐条改，不整篇重写。',
    ].join('\n'),
  },
  {
    id: 'confirm',
    label: '策略批准 · 待交',
    script:
      '【撰写】权要+说明书要点待你批准。确认后可派制图/FTO；未确认不写库。',
    tool: { name: 'submit_draft_for_hitl', preview: '撰写稿已交卷 · 待你批准策略' },
    triggersHitl: true,
    hitlGate: 'approve_strategy',
    structuredBody: [
      '## 撰写交付摘要（可扫读）',
      '',
      '**独权最小集**：预测 + 多约束联合调度 + 热插拔重算',
      '',
      '**从权**：5 条梯度（特征具体化 / 指标 / 接口 / 降级）',
      '',
      '**校验**：超范围 Pass；支持性 1 条 Warn（降级实施例）建议交底或补写后清。',
      '',
      '**交给下家**：制图按图号清单；FTO 以独权特征表为准。',
      '',
      '正式保存/提交须你确认。',
    ].join('\n'),
  },
]

export const DRAFT_DEPTH_SHORTCUTS = [
  { id: 'features', label: '特征表', action: 'jump' as const, stepId: 'features' },
  { id: 'draft-ch', label: '生成权项', action: 'jump' as const, stepId: 'claims' },
  { id: 'validate', label: '四类校验', action: 'jump' as const, stepId: 'validate' },
  { id: 'report-orch', label: '回报总控', action: 'report' as const },
]

export const DRAFT_SAMPLE_ARTIFACT = `# 权利要求与说明书要点（样机）

> 样机成果 · 非真案卷 · 未 Confirm 不写库

## 摘要

按「先层级后成文」产出独权最小集与五条从权梯度；说明书提纲与术语定义已备。四类校验示意：超范围 Pass，支持性 1 条 Warn。

## 正文

随步骤追加特征表、层级规划、权要骨架、说明书要点、校验结果与交卷摘要。
`

export const DRAFT_SAMPLE_WORKLOG_STEPS = `| 1 | 特征表 | 交底/立项 | 表 | — |
| 2 | 权项层级 | 规划 | 独+从 | — |
| 3 | 权要草案 | 成文 | 骨架 | — |
| 4 | 说明书要点 | 提纲 | 五节 | — |
| 5 | 四类校验 | validator | Warn×1 | — |
| 6 | 策略批准 | HITL | 待确认 | HITL |`

export const DRAFT_SAMPLE_WORKLOG_CHOICES = `| 先堆全文 | 先层级 | 先层级 | 可校验 |
| 整篇重写 | 逐条改 Warn | 逐条 | 可确认 |`
