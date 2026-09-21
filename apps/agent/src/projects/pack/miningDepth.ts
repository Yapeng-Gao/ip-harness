/** 专利挖掘席深度 · 可申请提案 mining_pack · ≠立项 */
import type { ExpertStepDef } from '../types'

export const MINING_DEPTH_STEPS: ExpertStepDef[] = [
  {
    id: 'tech',
    label: '收技术点',
    script:
      '【挖掘】已收上游：边缘调度 · 动态频率 · 能耗约束 · 热插拔联动。≠立项 Go。',
    tool: { name: 'parse_tech_points', preview: 'points=4 · from=01–03' },
    structuredBody: [
      '| # | 技术点 | 来源 |',
      '|---|--------|------|',
      '| 1 | 时序负载预测 | 激发主方向 |',
      '| 2 | 能耗+SLA 同权 | 全景空白 |',
      '| 3 | 热插拔触发重调度 | 激发主推 |',
      '| 4 | 云边降级窗口 | 从权候选 |',
      '',
      '**KB 样例卡**：特征动词表「预测/约束/触发/降级」占位',
    ].join('\n'),
  },
  {
    id: 'directions',
    label: '可申报提案',
    script: '【挖掘】提案 3 条骨架：主案三联 · 子案接口 · 子案降级。',
    tool: { name: 'extract_invention_points', preview: 'candidates=3' },
    structuredBody: [
      '| 提案 | 标题（示意） | 核心手段 |',
      '|------|--------------|----------|',
      '| P1 | 边缘调度模组及方法 | 预测+同权+热插拔 |',
      '| P2 | 可热插拔调度接口装置 | 接口状态机 |',
      '| P3 | 云边降级窗口控制 | 窗口协议 |',
    ].join('\n'),
  },
  {
    id: 'features',
    label: '特征拆解',
    script: '【挖掘】P1 特征表已拆：独权压联动；从权拆单点。',
    tool: { name: 'extract_invention_points', preview: 'P1_features=6' },
    structuredBody: [
      '| 特征 | 独/从 | 对抗高威胁 |',
      '|------|------|------------|',
      '| 时序预测 | 从 | 云 A 已密 |',
      '| 同权约束 | 独权组合 | 相对能耗优先差异 |',
      '| 热插拔触发重算 | 独权组合 | 模组 B 仅互连 |',
      '| 降级窗口 | 从 | 运维 C 弱相关 |',
      '',
      '**Validator 示意**：每提案≥1 可核验技术特征 · **Pass**',
    ].join('\n'),
  },
  {
    id: 'score',
    label: '提案评分',
    script: '【挖掘】新颖性 0.78 · 可专利性 0.71 · P1 优先推进。',
    tool: { name: 'score_invention', preview: 'novelty=0.78 · patent=0.71' },
    structuredBody: [
      '| 提案 | 新颖性 | 可专利性 | 建议 |',
      '|------|--------|----------|------|',
      '| P1 | 0.78 | 0.71 | **优先** · 交布局 |',
      '| P2 | 0.70 | 0.68 | 从案 |',
      '| P3 | 0.64 | 0.62 | 从案/合案从权 |',
    ].join('\n'),
  },
  {
    id: 'pack',
    label: '提案确认 · 待交',
    script: '【挖掘】04_mining_pack 待确认。挖掘≠立项决策。',
    tool: { name: 'pack_mining', preview: 'file=04_mining_pack.md' },
    triggersHitl: true,
    hitlGate: 'approve_strategy',
    structuredBody: [
      '## 挖掘打包摘要（可扫读）',
      '',
      '**交付**：P1 主提案 + P2/P3 从案骨架 + 特征表。',
      '',
      '**交给布局**：mining_pack；写入须你确认。',
      '',
      '**声明**：本席不替代立项 Go/No-Go。',
    ].join('\n'),
  },
]

export const MINING_DEPTH_SHORTCUTS = [
  { id: 'tech', label: '收技术点', action: 'jump' as const, stepId: 'tech' },
  { id: 'pack', label: '打包提案', action: 'jump' as const, stepId: 'pack' },
  { id: 'report-orch', label: '回报总控', action: 'report' as const },
]

export const MINING_SAMPLE_ARTIFACT = `# 专利挖掘打包（样机）

> 样机成果 · ≠立项 · 提案键

## 摘要

拆出 P1 三联主提案与 P2/P3 从案；新颖性示意 0.78；交布局建保护网。

## 正文

随步骤追加技术点、提案骨架、特征表、评分与交卷摘要。
`

export const MINING_SAMPLE_WORKLOG_STEPS = `| 1 | 技术点 | 上游 | 4点 | — |
| 2 | 可申报提案 | 特征 | 3骨架 | — |
| 3 | 特征拆解 | P1 | 表 | — |
| 4 | 评分 | 公式 | 优先P1 | — |
| 5 | 提案确认 | 打包 | 待确认 | HITL |`

export const MINING_SAMPLE_WORKLOG_CHOICES = `| 单提案 | 主+从2～3 | 主从 | 可布局 |
| 当立项Go | 仅提案包 | 提案 | 纪律 |`
