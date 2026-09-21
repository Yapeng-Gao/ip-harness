/** 年费管家席深度 · HITL⑦ pay_unlock · 禁真缴费 */
import type { ExpertStepDef } from '../types'

export const ANNUITY_DEPTH_STEPS: ExpertStepDef[] = [
  {
    id: 'due',
    label: '到期台账',
    script:
      '【年费】到期清单：CN114882901B 第 3 年 · 截止 2026-11-30 · 官费 ¥2,000（假数据）。',
    tool: { name: 'list_annuity_due', preview: 'due=1 · window=90d' },
    structuredBody: [
      '| 案号（示意） | 年次 | 截止 | 官费 |',
      '|--------------|------|------|------|',
      '| CN114882901B | 第3年 | 2026-11-30 | ¥2,000 |',
      '| （观察）同族占位 | — | — | — |',
      '',
      '**窗口**：90 日内 · 样机台账',
    ].join('\n'),
  },
  {
    id: 'surcharge',
    label: '滞纳金表',
    script: '【年费】滞纳金阶梯 mock：宽限 6 月 · tier2 示意。',
    tool: { name: 'compute_surcharge', preview: 'grace=6m · surcharge=tier2' },
    structuredBody: [
      '| 阶段 | 时限 | 附加（示意） |',
      '|------|------|--------------|',
      '| 正常 | ≤截止日 | 0 |',
      '| 宽限 | +1～6 月 | tier1～2 |',
      '| 超宽限 | >6 月 | 放弃风险 |',
      '',
      '**KB 样例卡**：官费/滞纳表占位（非真局数据）',
    ].join('\n'),
  },
  {
    id: 'grade',
    label: '价值联动',
    script: '【年费】联动价值评估：核心案建议缴；外围可议放弃。',
    tool: { name: 'compute_surcharge', preview: 'link=valuation_card · core=pay' },
    structuredBody: [
      '| 案 | 价值分级（来自评估） | 年费建议 |',
      '|----|----------------------|----------|',
      '| 主案（边缘调度） | 核心 | **建议缴** |',
      '| 外围观察件 | 外围 | 可议 |',
      '| 低分件 | 放弃候选 | 倾向放弃 |',
      '',
      '**Validator 示意**：建议档均挂价值分级 · **Pass**',
    ].join('\n'),
  },
  {
    id: 'options',
    label: '缴/放方案',
    script: '【年费】两案并列：按期缴 vs 宽限内议；放弃须 HITL。',
    tool: { name: 'propose_pay_or_abandon', preview: 'opts=pay|grace|abandon' },
    structuredBody: [
      '| 方案 | 动作 | 成本示意 | 风险 |',
      '|------|------|----------|------|',
      '| A 按期缴 | 截止前缴 | ¥2,000 | 低 |',
      '| B 宽限议 | 进宽限再决 | +滞纳 | 中 |',
      '| C 放弃 | 停维 | 0 官费 | 权利灭失 |',
    ].join('\n'),
  },
  {
    id: 'decide',
    label: '缴费/放弃闸 · 待确认',
    script:
      '【年费】14_maintain_annuity 待 Confirm（HITL⑦ · pay_unlock · **禁真缴费**）。',
    tool: {
      name: 'propose_pay_or_abandon',
      preview: 'recommend=pay · hitl=⑦',
    },
    triggersHitl: true,
    hitlGate: 'pay_unlock',
    structuredBody: [
      '## 年费决议摘要（可扫读）',
      '',
      '**建议**：方案 A 按期缴（核心案）。',
      '',
      '**确认后**：仅样机台账勾选；**绝不**真缴费/真放弃官方。',
      '',
      '**交给转化/运营**：maintain_annuity 心智记录。',
    ].join('\n'),
  },
]

export const ANNUITY_DEPTH_SHORTCUTS = [
  { id: 'due', label: '到期清单', action: 'jump' as const, stepId: 'due' },
  { id: 'grade', label: '价值联动', action: 'jump' as const, stepId: 'grade' },
  { id: 'decide', label: '缴费/放弃', action: 'jump' as const, stepId: 'decide' },
  { id: 'report-orch', label: '回报总控', action: 'report' as const },
]

export const ANNUITY_SAMPLE_ARTIFACT = `# 年费维护建议（样机）

> HITL⑦ · 禁真缴费 · 假数据

## 摘要

CN114882901B 第3年到期；联动价值建议按期缴；待 Confirm。

## 正文

随步骤追加台账、滞纳表、价值联动、方案与交卷摘要。
`

export const ANNUITY_SAMPLE_WORKLOG_STEPS = `| 1 | 到期台账 | 授权后 | 清单 | — |
| 2 | 滞纳金表 | mock | 阶梯 | — |
| 3 | 价值联动 | 评分卡 | 核心缴 | — |
| 4 | 缴/放方案 | 三案 | A/B/C | — |
| 5 | 缴费/放弃闸 | HITL⑦ | 待确认 | HITL |`

export const ANNUITY_SAMPLE_WORKLOG_CHOICES = `| 强缴不问价值 | 价值联动 | 联动 | 禁真缴费 |
| 静默放弃 | 必须HITL | HITL | 纪律 |`
