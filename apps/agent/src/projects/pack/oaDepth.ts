/** OA 席深度 · 拆意见→分类→策略分叉→答复草稿（须已 file） */
import type { ExpertStepDef } from '../types'

export const OA_DEPTH_STEPS: ExpertStepDef[] = [
  {
    id: 'notice',
    label: '读审查意见',
    script: '【OA】假一通已解析：权1 创造性；权3 不清楚。非结构化原文→结构化事件。',
    tool: { name: 'parse_oa_notice', preview: 'type=一通 · issues=2' },
    structuredBody: [
      '| 条款 | 指摘 | 涉及权项 |',
      '|------|------|----------|',
      '| 创造性 | 相对对比文件显而易见 | 权1 |',
      '| 清楚性 | 「联合代价」未充分定义 | 权3 |',
    ].join('\n'),
  },
  {
    id: 'classify',
    label: '理由分类',
    script: '【OA】理由分类器（样机）：创造性争辩可修；清楚性宜修改。红线未触发。',
    tool: { name: 'oa_reason_classifier', preview: 'inventive=argue+amend · clarity=amend' },
    structuredBody: [
      '| 理由类 | 路由 | 成功率示意 |',
      '|--------|------|------------|',
      '| 创造性 | 争辩+限缩 | 中 |',
      '| 清楚性 | 修改定义 | 高 |',
      '| 超范围 blocker | — | **未触发** |',
    ].join('\n'),
  },
  {
    id: 'strategy',
    label: '答复策略',
    script: '【OA】三案并列提纲：争辩点 / 修改点 / 证据点。',
    tool: { name: 'oa_strategy', preview: 'argue+amend+evidence' },
    structuredBody: [
      '**案 A 争辩**：三联组合非对比文件简单拼接；强调热插拔联动效果。',
      '**案 B 修改**：权1 写入「同权约束」限定；权3 补术语定义。',
      '**案 C 证据**：交底效果占位 + 查新簇差异表（示意）。',
    ].join('\n'),
  },
  {
    id: 'amend',
    label: '修改对照',
    script: '【OA】修改对照表已出；超范围检查示意 Pass。',
    tool: { name: 'draft_amendments', preview: 'amends=2 · beyond_scope=Pass' },
    structuredBody: [
      '| 权项 | 原文要点 | 修改要点 | 超范围 |',
      '|------|----------|----------|--------|',
      '| 权1 | 联合调度 | +同权约束明示 | Pass |',
      '| 权3 | 联合代价 | +说明书定义引用 | Pass |',
      '',
      '**Validator**：beyond_original_scope · **Pass**（样机）',
    ].join('\n'),
  },
  {
    id: 'draft',
    label: '答复草稿',
    script: '【OA】意见陈述骨架已生成；禁真递交官方。',
    tool: { name: 'draft_oa_response', preview: 'prosecution_response 骨架' },
    structuredBody: [
      '1. 对创造性：区别特征重申 + 效果',
      '2. 对清楚性：定义补强说明',
      '3. 修改说明与对照',
      '4. 请求：在修改基础上授予专利权（示意）',
    ].join('\n'),
  },
  {
    id: 'confirm',
    label: '答复确认 · 待交',
    script: '【OA】策略与草稿待你确认。未 Confirm 不写库；无真递交。',
    tool: { name: 'submit_oa_for_hitl', preview: 'gate=approve_strategy' },
    triggersHitl: true,
    hitlGate: 'approve_strategy',
    structuredBody: [
      '## OA 答复摘要',
      '',
      '一通两项 · 策略争辩+修改 · 超范围 Pass。',
      '',
      '**须已 file**：本席仅在递交回执后由总控派发（业务锁另见）。',
      '',
      '确认后保存/交接示意；禁真递交官方。',
    ].join('\n'),
  },
]

export const OA_DEPTH_SHORTCUTS = [
  { id: 'notice', label: '读审查意见', action: 'jump' as const, stepId: 'notice' },
  { id: 'strategy', label: '答复策略', action: 'jump' as const, stepId: 'strategy' },
  { id: 'report-orch', label: '回报总控', action: 'report' as const },
]

export const OA_SAMPLE_ARTIFACT = `# OA 答复策略与陈述（样机）

> 须已 file · 无真 OA · 禁真递交官方

## 摘要

假一通创造性+清楚性；策略争辩与修改；超范围 Pass；待确认。

## 正文

随步骤追加解析、分类、策略、修改对照、草稿与交卷摘要。
`

export const OA_SAMPLE_WORKLOG_STEPS = `| 1 | 读意见 | 一通 | 表 | — |
| 2 | 分类 | 路由 | 两类 | — |
| 3 | 策略 | 三案 | 提纲 | — |
| 4 | 修改 | 对照 | Pass | — |
| 5 | 草稿 | 陈述 | 骨架 | — |
| 6 | 确认 | HITL | 待确认 | HITL |`

export const OA_SAMPLE_WORKLOG_CHOICES = `| 整篇重写 | 分理由改 | 分理由 | 可确认 |
| 超范围自修复 | blocker 升级 | blocker | 纪律 |`
