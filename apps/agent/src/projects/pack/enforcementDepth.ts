/** 无效维权席深度 · 全面覆盖比对 · 飞轮回流布局 · ≠FTO · ≠watch */
import type { ExpertStepDef } from '../types'

export const ENFORCEMENT_DEPTH_STEPS: ExpertStepDef[] = [
  {
    id: 'map',
    label: '特征映射',
    script:
      '【维权】权要特征 6 项已映射到被控产品（mock）。≠ FTO 自由实施分析。',
    tool: { name: 'claim_chart_compare', preview: 'features=6 · ≠fto' },
    structuredBody: [
      '| # | 权要特征 | 被控产品对应 |',
      '|---|----------|--------------|',
      '| 1 | 负载预测模块 | 有 |',
      '| 2 | 同权约束调度 | 部分 |',
      '| 3 | 热插拔检测 | 有 |',
      '| 4 | 热插拔后重调度 | **弱/无** |',
      '| 5 | 降级窗口 | 无 |',
      '| 6 | 运维接口 | 有（外围） |',
      '',
      '**KB 样例卡**：侵权比对清单模板占位',
    ].join('\n'),
  },
  {
    id: 'compare',
    label: '覆盖比对',
    script: '【维权】全面覆盖 4/6 · 缺口在热插拔联动与降级窗口。',
    tool: { name: 'stability_score', preview: 'cover=4/6 · gaps=2' },
    structuredBody: [
      '| 结论项 | 值 |',
      '|--------|-----|',
      '| 字面覆盖 | 4/6 |',
      '| 等同空间（示意） | 窄 |',
      '| 主要缺口 | 特征4·5 |',
      '',
      '**说明**：覆盖不足则维权路径弱，优先回流补强从权。',
    ].join('\n'),
  },
  {
    id: 'stability',
    label: '稳定性评分',
    script: '【维权】稳定性 0.64 · 建议补强从权后再评估主张强度。',
    tool: { name: 'stability_score', preview: 'stability=0.64' },
    structuredBody: [
      '| 维度 | 分 | 备注 |',
      '|------|----|------|',
      '| 权要清晰 | 0.70 | 同权术语可再定义 |',
      '| 证据链 | 0.60 | 产品取证占位 |',
      '| 抗无效 | 0.62 | 依赖查新三联 |',
      '| **综合** | **0.64** | 中等偏弱 |',
      '',
      '**Validator 示意**：比对表与稳定性字段齐 · **Pass**',
    ].join('\n'),
  },
  {
    id: 'gaps',
    label: '漏洞信封',
    script: '【维权】漏洞清单已封：回流 F3 布局补从权/子案。',
    tool: {
      name: 'draft_enforcement_brief',
      preview: 'gaps=2 · envelope→layout',
    },
    structuredBody: [
      '| 漏洞 | 建议回流动作 |',
      '|------|--------------|',
      '| 热插拔联动未覆盖 | 加从权/子案强化接口→调度 |',
      '| 降级窗口缺失 | C2 从案或合案从权 |',
      '',
      '**飞轮**：信封 → expert-layout（≠ watch_alert）。',
    ].join('\n'),
  },
  {
    id: 'flywheel',
    label: '回流布局 · 待确认',
    script:
      '【维权】17_enforcement_brief 待确认后回流布局。勿借 watch；≠ expert-fto。',
    tool: {
      name: 'draft_enforcement_brief',
      preview: 'flywheel→expert-layout · ≠watch',
    },
    triggersHitl: true,
    structuredBody: [
      '## 维权简报摘要（可扫读）',
      '',
      '**覆盖 4/6 · 稳定性 0.64**；缺口信封已备。',
      '',
      '**回流 F3**：补强热插拔联动与降级从权。',
      '',
      '**声明**：≠ FTO · ≠ STAGE watch · 提案键勿写 packages。',
    ].join('\n'),
  },
]

export const ENFORCEMENT_DEPTH_SHORTCUTS = [
  { id: 'map', label: '特征映射', action: 'jump' as const, stepId: 'map' },
  { id: 'compare', label: '覆盖比对', action: 'jump' as const, stepId: 'compare' },
  { id: 'flywheel', label: '回流 F3', action: 'jump' as const, stepId: 'flywheel' },
  { id: 'report-orch', label: '回报总控', action: 'report' as const },
]

export const ENFORCEMENT_SAMPLE_ARTIFACT = `# 维权/无效比对简报（样机）

> ≠FTO · ≠watch · 飞轮回流布局

## 摘要

权要六特征对照被控产品：覆盖 4/6、稳定性 0.64；漏洞信封回流布局补强。

## 正文

随步骤追加映射、覆盖、稳定性、漏洞与交卷摘要。
`

export const ENFORCEMENT_SAMPLE_WORKLOG_STEPS = `| 1 | 特征映射 | 权要 | 6项 | — |
| 2 | 覆盖比对 | 产品 | 4/6 | — |
| 3 | 稳定性 | 评分 | 0.64 | — |
| 4 | 漏洞信封 | 缺口 | 2条 | — |
| 5 | 回流布局 | 飞轮 | 待确认 | HITL |`

export const ENFORCEMENT_SAMPLE_WORKLOG_CHOICES = `| 合并FTO | 独立席 | 独立 | ≠fto |
| 借watch告警 | 只回流布局 | 飞轮 | 纪律 |`
