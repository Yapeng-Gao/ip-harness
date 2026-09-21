/** 价值评估席深度 · 服务 HITL⑦ · 提案键 valuation_card */
import type { ExpertStepDef } from '../types'

export const VALUATION_DEPTH_STEPS: ExpertStepDef[] = [
  {
    id: 'evidence',
    label: '抽证据',
    script:
      '【价值】已抽：引用 12 · 同族 3 · 许可线索 1 · 产品映射 2（mock）。',
    tool: { name: 'score_portfolio', preview: 'cite=12 · family=3' },
    structuredBody: [
      '| 证据类 | 数量 | 说明 |',
      '|--------|------|------|',
      '| 他引 | 12 | 调度/边缘相关示意 |',
      '| 同族 | 3 | CN+观察位 |',
      '| 许可线索 | 1 | 非真合同 |',
      '| 产品映射 | 2 | 边缘调度模组线 |',
      '',
      '**KB 样例卡**：引用库占位（非真商用库）',
    ].join('\n'),
  },
  {
    id: 'inputs',
    label: '公式输入',
    script: '【价值】评分输入已规范化：商业/可执行/防御三轴权重（公式工具示意）。',
    tool: { name: 'score_portfolio', preview: 'axes=3 · weights=norm' },
    structuredBody: [
      '| 轴 | 输入摘录 | 权重示意 |',
      '|----|----------|----------|',
      '| 商业 | 产品线映射×2 | 0.35 |',
      '| 可执行 | 权要覆盖清晰度 | 0.35 |',
      '| 防御 | 同族+引用 | 0.30 |',
    ].join('\n'),
  },
  {
    id: 'score',
    label: '评分卡',
    script:
      '【价值】综合分 78 · 商业 0.72 · 可执行 0.81。提案键 valuation_card。',
    tool: {
      name: 'draft_valuation_card',
      preview: 'score=78 · proposal=valuation_card',
    },
    structuredBody: [
      '| 轴 | 分 | 说明 |',
      '|----|----|------|',
      '| 商业 | 72 | 边缘产品线相关 |',
      '| 可执行 | 81 | 特征可落地 |',
      '| 防御 | 76 | 同族尚可 |',
      '| **综合** | **78** | 偏核心 |',
      '',
      '**Validator 示意**：评分卡 schema 齐 · **Pass**',
    ].join('\n'),
  },
  {
    id: 'grade',
    label: '分级建议',
    script: '【价值】核心保留 / 外围观察 / 1 件建议放弃 → 交年费管家。',
    tool: {
      name: 'grade_core_periphery',
      preview: 'core=1 · periphery=2 · abandon=1',
    },
    structuredBody: [
      '| 件 | 分级 | 动作建议 |',
      '|----|------|----------|',
      '| 主案边缘调度 | **核心** | 保留+年费优先缴 |',
      '| 接口从案 | 外围 | 观察 |',
      '| 降级子案 | 外围 | 观察 |',
      '| 低相关占位件 | 放弃候选 | 交年费议放弃 |',
    ].join('\n'),
  },
  {
    id: 'card',
    label: '评估卡确认 · 待交',
    script:
      '【价值】15_valuation_card + worklog 待确认后交年费席。无独立写库 HITL 号；交卷闸示意。',
    tool: {
      name: 'draft_valuation_card',
      preview: 'file=15_valuation_card.md · soft_hitl',
    },
    triggersHitl: true,
    structuredBody: [
      '## 价值评估卡摘要（可扫读）',
      '',
      '**综合 78 · 主案核心**；外围 2 · 放弃候选 1。',
      '',
      '**交给年费**：分级表驱动缴/放建议；提案键勿写 packages。',
      '',
      '确认后样机交卷；服务 HITL⑦（年费闸）而非本席独立写库。',
    ].join('\n'),
  },
]

export const VALUATION_DEPTH_SHORTCUTS = [
  { id: 'evidence', label: '抽证据', action: 'jump' as const, stepId: 'evidence' },
  { id: 'score', label: '评分卡', action: 'jump' as const, stepId: 'score' },
  { id: 'grade', label: '分级建议', action: 'jump' as const, stepId: 'grade' },
  { id: 'report-orch', label: '回报总控', action: 'report' as const },
]

export const VALUATION_SAMPLE_ARTIFACT = `# 价值评估卡（样机）

> 提案键 · 服务 HITL⑦ · 非真估值

## 摘要

证据齐后综合 78；主案核心、外围观察、1 件放弃候选；交年费联动。

## 正文

随步骤追加证据、公式输入、评分卡、分级与交卷摘要。
`

export const VALUATION_SAMPLE_WORKLOG_STEPS = `| 1 | 抽证据 | 案卷 | 引用等 | — |
| 2 | 公式输入 | 三轴 | 权重 | — |
| 3 | 评分卡 | 公式 | 78 | — |
| 4 | 分级建议 | 核心/外围 | 表 | — |
| 5 | 评估卡确认 | 交卷 | 待确认 | HITL |`

export const VALUATION_SAMPLE_WORKLOG_CHOICES = `| 拍脑袋 | 公式工具 | 公式 | 提案键 |
| 直接放弃 | 交年费议 | 联动 | 可确认 |`
