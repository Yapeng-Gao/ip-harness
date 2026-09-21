/** 专利布局席深度 · 主从案保护网 layout_plan · HITL① */
import type { ExpertStepDef } from '../types'

export const LAYOUT_DEPTH_STEPS: ExpertStepDef[] = [
  {
    id: 'family',
    label: '主从案',
    script: '【布局】主案 1 + 从案 2：对齐 mining P1/P2/P3。',
    tool: { name: 'plan_family', preview: 'main=1 · child=2' },
    structuredBody: [
      '| 案 | 对应挖掘 | 保护重点 |',
      '|----|----------|----------|',
      '| 主案 M | P1 | 预测+同权+热插拔联动 |',
      '| 从案 C1 | P2 | 热插拔接口状态机 |',
      '| 从案 C2 | P3 | 云边降级窗口 |',
      '',
      '**KB 样例卡**：族命名规范「EDGE-SCHED-YYYY」占位',
    ].join('\n'),
  },
  {
    id: 'geo',
    label: '国别与族',
    script: '【布局】CN 发明先申；PCT/US 观察位；同族预留。',
    tool: { name: 'map_protection_net', preview: 'CN=first · PCT=watch' },
    structuredBody: [
      '| 成员 | 国别路径 | 时序 |',
      '|------|----------|------|',
      '| M | CN 发明 | T0 |',
      '| C1 | CN 发明 / 合案从权备选 | T0+3m |',
      '| C2 | CN 或并入 M 从权 | T0+3m |',
      '| 观察 | PCT / US provisional | 视商机 |',
    ].join('\n'),
  },
  {
    id: 'net',
    label: '保护网矩阵',
    script: '【布局】特征×族成员矩阵已填；独权勿宽于查新可论证点。',
    tool: { name: 'map_protection_net', preview: 'cells=12' },
    structuredBody: [
      '| 特征 \\ 案 | M | C1 | C2 |',
      '|-----------|---|----|----|',
      '| 时序预测 | 从 | — | — |',
      '| 同权约束 | **独** | — | — |',
      '| 热插拔联动 | **独** | 接口细 | — |',
      '| 降级窗口 | 从 | — | **独** |',
      '',
      '**Validator 示意**：独权特征均落矩阵 · **Pass**',
    ].join('\n'),
  },
  {
    id: 'sequence',
    label: '申请时序',
    script: '【布局】建议：先 M 齐交底撰写；C1/C2 跟进或合案。',
    tool: { name: 'plan_family', preview: 'seq=M→C1/C2 · gap=3m' },
    structuredBody: [
      '1. T0：主案 M 查新→立项→交底→撰写',
      '2. T0+：从案材料并行收集',
      '3. T0+3m：C1/C2 或合案从权决策（依赖商机）',
      '',
      '**风险一句**：若效果数据不足，缩限 M 独权后再扩族。',
    ].join('\n'),
  },
  {
    id: 'plan',
    label: '布局确认 · 待交',
    script: '【布局】05_layout_plan 待确认。【HITL①】布局拍板。',
    tool: { name: 'draft_layout_plan', preview: 'file=05_layout_plan.md' },
    triggersHitl: true,
    hitlGate: 'approve_strategy',
    structuredBody: [
      '## 布局计划摘要（可扫读）',
      '',
      '**族结构**：主案 1 + 从案 2 · CN 先申。',
      '',
      '**保护网**：独权压同权+热插拔联动；预测/降级入从权或子案。',
      '',
      '**交给查新/立项**：layout_plan；写入须你确认。',
    ].join('\n'),
  },
]

export const LAYOUT_DEPTH_SHORTCUTS = [
  { id: 'family', label: '主从案', action: 'jump' as const, stepId: 'family' },
  { id: 'plan', label: '出布局', action: 'jump' as const, stepId: 'plan' },
  { id: 'report-orch', label: '回报总控', action: 'report' as const },
]

export const LAYOUT_SAMPLE_ARTIFACT = `# 专利布局计划（样机）

> 样机成果 · HITL① 布局拍板

## 摘要

主从 1+2 保护网：CN 先申；独权压多约束+热插拔联动；时序 M→C1/C2。

## 正文

随步骤追加主从、国别、矩阵、时序与交卷摘要。
`

export const LAYOUT_SAMPLE_WORKLOG_STEPS = `| 1 | 主从案 | 挖掘 | 1+2 | — |
| 2 | 国别族 | 路径 | CN先 | — |
| 3 | 保护网 | 矩阵 | 12格 | — |
| 4 | 申请时序 | 计划 | M先 | — |
| 5 | 布局确认 | HITL① | 待确认 | HITL |`

export const LAYOUT_SAMPLE_WORKLOG_CHOICES = `| 单案 | 主从网 | 主从 | 可查新 |
| 独权过宽 | 压可论证点 | 缩限 | 纪律 |`
