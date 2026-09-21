/** 交底席深度 · agent-depth-reliability · 六段采集+缺项追问示意 */
import type { ExpertStepDef } from '../types'

export const DISCLOSURE_DEPTH_STEPS: ExpertStepDef[] = [
  {
    id: 'brief',
    label: '收立项条件',
    script: '【交底】已读立项 Go 附条件：须补联动效果与实施例。',
    tool: { name: 'read_intake_conditions', preview: 'conditions=3' },
    structuredBody: [
      '**立项附条件（须落入交底）**',
      '1. 预测↔调度↔热插拔联动的效果数据',
      '2. 至少 2 个可实施实施例',
      '3. 独权勿宽于查新已论证区别特征',
    ].join('\n'),
  },
  {
    id: 'tech',
    label: '六段采集',
    script: '【交底】六段清单已开：背景/问题/方案/效果/实施例/替代。缺项将单项追问。',
    tool: { name: 'gather_tech_points', preview: 'sections=6 · filled=4 · ask=2' },
    structuredBody: [
      '| 段 | 状态 | 摘要 |',
      '|----|------|------|',
      '| 背景 | 齐 | 边缘节点调度冲突 |',
      '| 要解决的问题 | 齐 | 能耗与 SLA 难兼顾 |',
      '| 技术方案 | 齐 | 预测+联合调度+热插拔重算 |',
      '| 有益效果 | **缺** | 需量化或对比数据 |',
      '| 实施例 | **缺** | 需例1/例2 步骤 |',
      '| 替代实现 | 齐 | 软件方法 / 装置 |',
      '',
      '**追问规则（样机）**：一次一项 · ≤5 轮 · 工程师语言 · 禁止硬编',
    ].join('\n'),
  },
  {
    id: 'ask',
    label: '缺项追问',
    script: '【交底】本轮追问「有益效果」：请给能耗或违约率对比（可相对值）。样机已用占位答复推进。',
    tool: { name: 'ask_inventor', preview: 'ask=效果数据 · round=1/5' },
    structuredBody: [
      '**追问 #1（效果）**',
      '- 问：相对无联合约束基线，违约次数 / 能耗有无观测差值？',
      '- 样机占位答：违约 ↓约 18% · 能耗持平±5%（实验室示意）',
      '',
      '**追问 #2（实施例）** 将在下一步写入步骤表。',
    ].join('\n'),
  },
  {
    id: 'structure',
    label: '交底结构',
    script: '【交底】背景→方案→效果→实施例提纲已结构化（≠权要）。',
    tool: { name: 'structure_disclosure', preview: 'pack_outline=ok' },
    structuredBody: [
      '1. 背景与问题',
      '2. 技术方案（三联组合）',
      '3. 有益效果（占位数据）',
      '4. 实施例提纲',
      '5. 替代与扩展',
    ].join('\n'),
  },
  {
    id: 'embodiments',
    label: '实施例',
    script: '【交底】例1 软件方法；例2 装置。步骤与权要特征可映射。',
    tool: { name: 'outline_embodiments', preview: 'embodiments=2' },
    structuredBody: [
      '**实施例 1 · 方法**：采集 → 预测 → 联合求解 → 下发 → 插拔中断重算',
      '**实施例 2 · 装置**：预测模块 · 约束引擎 · 事件总线 · 执行器',
      '',
      '**Validator 示意**：六段必填 · Pass · 效果证据规则 · Pass（占位）',
    ].join('\n'),
  },
  {
    id: 'pack',
    label: '交底确认 · 待交',
    script: '【交底】可实施交底包待你确认。确认后可派撰写；交底≠权要。',
    tool: { name: 'pack_disclosure', preview: '交卷 · 待确认交底' },
    triggersHitl: true,
    hitlGate: 'approve_strategy',
    structuredBody: [
      '## 交底交付摘要',
      '',
      '六段齐 · 效果占位已答 · 实施例×2。立项附条件已覆盖。',
      '',
      '**交给撰写**：本包 + 特征候选；正式写库须你确认。',
    ].join('\n'),
  },
]

export const DISCLOSURE_DEPTH_SHORTCUTS = [
  { id: 'tech', label: '六段采集', action: 'jump' as const, stepId: 'tech' },
  { id: 'embodiments', label: '实施例', action: 'jump' as const, stepId: 'embodiments' },
  { id: 'report-orch', label: '回报总控', action: 'report' as const },
]

export const DISCLOSURE_SAMPLE_ARTIFACT = `# 技术交底书（样机）

> 样机 · 可实施交底 · ≠权利要求

## 摘要

按立项附条件补齐效果与实施例。六段结构可供撰写抽特征。

## 正文

随步骤追加上游条件、六段表、追问、结构、实施例与交卷摘要。
`

export const DISCLOSURE_SAMPLE_WORKLOG_STEPS = `| 1 | 收条件 | 立项 | 附条件 | — |
| 2 | 六段采集 | 发明人 | 表 | — |
| 3 | 缺项追问 | 交互 | ≤5轮 | — |
| 4 | 结构 | 提纲 | 五节 | — |
| 5 | 实施例 | ×2 | 映射 | — |
| 6 | 确认 | HITL | 待确认 | HITL |`

export const DISCLOSURE_SAMPLE_WORKLOG_CHOICES = `| 硬编效果 | 追问占位 | 追问 | 可撰写 |
| 交底写权要 | 只交底 | 只交底 | 可确认 |`
