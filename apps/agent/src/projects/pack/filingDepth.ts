/** 递交席深度 · 齐套清单 + 形式点 + authorize 闸（禁真递交） */
import type { ExpertStepDef } from '../types'

export const FILING_DEPTH_STEPS: ExpertStepDef[] = [
  {
    id: 'jurisdiction',
    label: '国别策略',
    script: '【递交】CN 发明先递；US provisional 观察。禁真递交。',
    tool: { name: 'check_jurisdiction', preview: 'CN=first-file · US=watch' },
    structuredBody: [
      '| 国别 | 路径 | 状态 |',
      '|------|------|------|',
      '| CN | 发明申请 | 本轮齐套目标 |',
      '| US | provisional 占位 | 观察 |',
      '| PCT | — | 未排 |',
    ].join('\n'),
  },
  {
    id: 'checklist',
    label: '齐套清单',
    script: '【递交】请求书/说明书/权要/摘要/附图 逐项勾选。',
    tool: { name: 'filing_checklist', preview: 'ready=5/5' },
    structuredBody: [
      '| 材料 | 状态 | 来源席 |',
      '|------|------|--------|',
      '| 请求书信息 | ✓ | 立项范围 |',
      '| 说明书 | ✓ | 撰写 |',
      '| 权利要求书 | ✓ | 撰写 |',
      '| 摘要 | ✓ | 撰写 |',
      '| 附图 | ✓ | 附图冻号 |',
      '',
      '齐套 **5/5**（样机）',
    ].join('\n'),
  },
  {
    id: 'formality',
    label: '形式审查点',
    script: '【递交】形式点扫描：2 warn（可带病过样机闸，真场须清）。',
    tool: { name: 'formality_scan', preview: 'warn=2 · blocker=0' },
    structuredBody: [
      '| # | 点 | 级 | 说明 |',
      '|---|-----|----|------|',
      '| 1 | 摘要字数 | warn | 略超建议区间（示意） |',
      '| 2 | 图号连续 | warn | 图4 可选未挂 |',
      '| — | 超范围/缺件 | blocker | **未触发** |',
    ].join('\n'),
  },
  {
    id: 'deadline',
    label: '期限提示',
    script: '【递交】优先权/法定期限为样机占位；以官方法定表为准。',
    tool: { name: 'deadline_hint', preview: 'priority_window=mock' },
    structuredBody: [
      '**KB 样例卡 · 期限表（占位）**',
      '- 本轮无优先权日冲突（示意）',
      '- 递交后官费/补正窗口见流程席（未启用则跳过）',
    ].join('\n'),
  },
  {
    id: 'authorize',
    label: '授权递交 · 待确认',
    script: '【递交】齐套已满，请授权递交示意。**禁真递交官方**；确认后仅样机回执。',
    tool: { name: 'propose_authorize_file', preview: 'gate=authorize_file · real=false' },
    triggersHitl: true,
    hitlGate: 'authorize_file',
    structuredBody: [
      '## 递交授权摘要',
      '',
      '齐套 5/5 · 形式 warn×2 · blocker=0。',
      '',
      '**确认后**：样机 `file` 回执 → 总控方可派审查答复。',
      '',
      '**绝不**：静默真递交、直传 OA。',
    ].join('\n'),
  },
]

export const FILING_DEPTH_SHORTCUTS = [
  { id: 'checklist', label: '齐套清单', action: 'jump' as const, stepId: 'checklist' },
  { id: 'authorize', label: '授权递交', action: 'jump' as const, stepId: 'authorize' },
  { id: 'report-orch', label: '回报总控', action: 'report' as const },
]

export const FILING_SAMPLE_ARTIFACT = `# 递交齐套与授权（样机）

> 禁真递交 · 仅授权闸示意

## 摘要

CN 先递齐套 5/5，形式 warn×2，待授权确认后出样机回执。

## 正文

随步骤追加国别、齐套、形式点、期限与授权摘要。
`

export const FILING_SAMPLE_WORKLOG_STEPS = `| 1 | 国别 | 策略 | CN先 | — |
| 2 | 齐套 | 清单 | 5/5 | — |
| 3 | 形式点 | 扫描 | warn×2 | — |
| 4 | 期限 | 占位 | — | — |
| 5 | 授权 | HITL | 待确认 | HITL |`

export const FILING_SAMPLE_WORKLOG_CHOICES = `| 未齐套强授 | 齐套满再授 | 齐套满 | 可确认 |
| 真递交 | 样机回执 | 样机 | 可派OA |`
