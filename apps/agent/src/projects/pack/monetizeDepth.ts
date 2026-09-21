/** 转化顾问席深度 · HITL⑧ confirm_quote · 禁真签约 */
import type { ExpertStepDef } from '../types'

export const MONETIZE_DEPTH_STEPS: ExpertStepDef[] = [
  {
    id: 'scope',
    label: '交易范围',
    script: '【转化】许可标的：边缘调度模组主案+可选从案；区域拟 CN。',
    tool: { name: 'estimate_deal', preview: 'asset=主案 · territory=CN' },
    structuredBody: [
      '| 项 | 内容 |',
      '|----|------|',
      '| 标的 | 主案权要族（示意） |',
      '| 形式 | 独占许可（草案） |',
      '| 区域 | CN |',
      '| 排除 | 真股权/真交割 |',
      '',
      '**KB 样例卡**：可比交易区间占位（非真万得）',
    ].join('\n'),
  },
  {
    id: 'value',
    label: '估值区间',
    script: '【转化】许可估值区间 ¥80–120 万（mock 公式 · 非真报价）。',
    tool: { name: 'estimate_deal', preview: 'low=80w · high=120w' },
    structuredBody: [
      '| 方法（示意） | 输出 |',
      '|--------------|------|',
      '| 成本+溢价 | ¥80 万起 |',
      '| 可比许可 | ¥120 万封顶示意 |',
      '| **区间** | **¥80–120 万** |',
      '',
      '正式数字以商务确认为准。',
    ].join('\n'),
  },
  {
    id: 'terms',
    label: '条款草案',
    script: '【转化】Term sheet：独占区域 / 里程碑款 / 审计权 · 必备条款骨架。',
    tool: {
      name: 'draft_term_sheet',
      preview: 'exclusive=CN · milestones=3',
    },
    structuredBody: [
      '| 条款 | 草案要点 |',
      '|------|----------|',
      '| 独占 | CN 区域独占许可 |',
      '| 对价 | 首付 + 里程碑×3 |',
      '| 审计 | 年审使用权 |',
      '| 改进 | 回授/交叉占位 |',
      '| 终止 | 违约/到期示意 |',
    ].join('\n'),
  },
  {
    id: 'check',
    label: '条款校验',
    script: '【转化】必备条款扫描：齐；缺项=0（样机 validator）。',
    tool: {
      name: 'validate_contract_clauses',
      preview: 'required=ok · missing=0',
    },
    structuredBody: [
      '| 必备项 | 状态 |',
      '|--------|------|',
      '| 标的/范围 | ✓ |',
      '| 对价/支付 | ✓ |',
      '| 地域/期限 | ✓ |',
      '| 审计/改进 | ✓ |',
      '| 争议解决占位 | ✓ |',
      '',
      '**Validator 示意**：必备条款齐 · **Pass**',
    ].join('\n'),
  },
  {
    id: 'validate',
    label: '签约闸 · 待确认',
    script:
      '【转化】16_monetize_terms 待 Confirm（HITL⑧ · confirm_quote · **禁真签约**）。',
    tool: {
      name: 'validate_contract_clauses',
      preview: 'clauses=ok · hitl=⑧',
    },
    triggersHitl: true,
    hitlGate: 'confirm_quote',
    structuredBody: [
      '## 转化条款摘要（可扫读）',
      '',
      '**区间** ¥80–120 万 · **独占 CN** · 必备条款齐。',
      '',
      '**确认后**：仅样机 term sheet；**绝不**真签约/真收款。',
      '',
      '**交给运营/法务**：monetize_terms 心智。',
    ].join('\n'),
  },
]

export const MONETIZE_DEPTH_SHORTCUTS = [
  { id: 'value', label: '估值区间', action: 'jump' as const, stepId: 'value' },
  { id: 'terms', label: '条款草案', action: 'jump' as const, stepId: 'terms' },
  { id: 'validate', label: '条款校验', action: 'jump' as const, stepId: 'validate' },
  { id: 'report-orch', label: '回报总控', action: 'report' as const },
]

export const MONETIZE_SAMPLE_ARTIFACT = `# 转化条款草案（样机）

> HITL⑧ · 禁真签约 · 非真报价

## 摘要

主案 CN 独占许可示意区间 ¥80–120 万；term sheet 必备齐；待 Confirm。

## 正文

随步骤追加范围、估值、条款、校验与交卷摘要。
`

export const MONETIZE_SAMPLE_WORKLOG_STEPS = `| 1 | 交易范围 | 组合 | CN独占 | — |
| 2 | 估值区间 | 公式 | 80–120万 | — |
| 3 | 条款草案 | term sheet | 骨架 | — |
| 4 | 条款校验 | validator | 齐 | — |
| 5 | 签约闸 | HITL⑧ | 待确认 | HITL |`

export const MONETIZE_SAMPLE_WORKLOG_CHOICES = `| 口头意向 | 必备条款齐 | 齐 | 禁真签约 |
| 跳过校验 | 校验过闸 | 校验 | 纪律 |`
