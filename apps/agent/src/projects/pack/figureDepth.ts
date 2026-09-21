/** 附图席深度 · 图号清单 + 图注⊆权项术语校验示意 */
import type { ExpertStepDef } from '../types'

export const FIGURE_DEPTH_STEPS: ExpertStepDef[] = [
  {
    id: 'context',
    label: '收权要上下文',
    script: '【附图】已链撰写独权/从权特征，确定需图类型。',
    tool: { name: 'gather_figure_context', preview: 'linked=draft_claims · figs_needed=4' },
    structuredBody: [
      '**需图类型**',
      '- 系统框图（装置）',
      '- 方法流程图（与独权步骤一一对应）',
      '- 热插拔时序图',
      '- 可选：能耗/SLA 示意曲线',
    ].join('\n'),
  },
  {
    id: 'list',
    label: '图号清单',
    script: '【附图】图1–图4 清单已排；图注术语将校验 ⊆ 权项术语。',
    tool: { name: 'list_needed_figures', preview: 'figures=4' },
    structuredBody: [
      '| 图号 | 类型 | 对应权要 | 状态 |',
      '|------|------|----------|------|',
      '| 图1 | 框图 | 独权装置镜像 | 待草图 |',
      '| 图2 | 流程 | 独权方法步骤 | 待草图 |',
      '| 图3 | 时序 | 从权热插拔 | 待草图 |',
      '| 图4 | 曲线 | 效果示意 | 可选 |',
    ].join('\n'),
  },
  {
    id: 'sketch',
    label: '草图占位',
    script: '【附图】样机 SVG/占位图已挂；非真文生图。',
    tool: { name: 'mock_sketch', preview: 'assets=fig-mock-01..03' },
    structuredBody: [
      '- fig-mock-01 系统框图占位',
      '- fig-mock-02 流程图占位（步骤①–⑤）',
      '- fig-mock-03 插拔时序占位',
    ].join('\n'),
  },
  {
    id: 'terms',
    label: '图注术语校验',
    script: '【附图】图注术语与权项差集检查：差集为空则 Pass。',
    tool: { name: 'ocr_term_check', preview: 'diff=0 · Pass' },
    structuredBody: [
      '| 图注术语 | 是否在权项/说明书 |',
      '|----------|-------------------|',
      '| 负载窗口 | ✓ |',
      '| 联合代价 | ✓ |',
      '| 插拔事件 | ✓ |',
      '',
      '**Validator 示意**：图注 ⊆ 权项术语 · **Pass**（差集空）',
    ].join('\n'),
  },
  {
    id: 'attach',
    label: '冻图号 · 待确认',
    script: '【附图】图号冻结清单待你确认后挂章；无独立案卷 key。',
    tool: { name: 'attach_chapter_event', preview: 'freeze · 待确认' },
    triggersHitl: true,
    hitlGate: 'approve_strategy',
    structuredBody: [
      '## 附图交付摘要',
      '',
      '图1–3 必选已占位 · 图4 可选 · 术语校验 Pass。',
      '',
      '**交给递交**：齐套挂图；确认后事件挂章。',
    ].join('\n'),
  },
]

export const FIGURE_DEPTH_SHORTCUTS = [
  { id: 'list', label: '图号清单', action: 'jump' as const, stepId: 'list' },
  { id: 'terms', label: '术语校验', action: 'jump' as const, stepId: 'terms' },
  { id: 'report-orch', label: '回报总控', action: 'report' as const },
]

export const FIGURE_SAMPLE_ARTIFACT = `# 附图任务与冻图号（样机）

> 样机草图 · 无真文生图

## 摘要

按权要生成图1–4 清单，术语校验 Pass，待冻图号确认。

## 正文

随步骤追加上下文、清单、草图、校验与交卷摘要。
`

export const FIGURE_SAMPLE_WORKLOG_STEPS = `| 1 | 上下文 | 撰写 | 类型 | — |
| 2 | 清单 | 图号 | 表 | — |
| 3 | 草图 | mock | 占位 | — |
| 4 | 术语校验 | 差集 | Pass | — |
| 5 | 冻图号 | HITL | 待确认 | HITL |`

export const FIGURE_SAMPLE_WORKLOG_CHOICES = `| 先画后号 | 先号后冻 | 先号 | 可递交 |
| 图注自由 | ⊆权项 | ⊆权项 | 可确认 |`
