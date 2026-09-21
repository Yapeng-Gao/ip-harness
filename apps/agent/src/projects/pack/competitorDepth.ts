/** 竞品监控席深度 · 对手威胁分级 competitor_watch */
import type { ExpertStepDef } from '../types'

export const COMPETITOR_DEPTH_STEPS: ExpertStepDef[] = [
  {
    id: 'list',
    label: '对手名单',
    script: '【竞品】Top 对手 5 家已圈定（示意），对齐全景玩家层。',
    tool: { name: 'list_competitors', preview: 'n=5 · from=landscape' },
    structuredBody: [
      '| # | 对手（示意） | 层 | 关注点 |',
      '|---|--------------|----|--------|',
      '| 1 | 云厂商 A | 云 | 预测调度族 |',
      '| 2 | 模组商 B | 模组 | 热插拔接口 |',
      '| 3 | 运营商 C | 运维 | 站点编排 |',
      '| 4 | 工业边缘 D | 垂直 | 场景绑定 |',
      '| 5 | 初创 E | 算法 | 能耗优化 |',
      '',
      '**KB 样例卡**：对手别名表占位（非真 CRM）',
    ].join('\n'),
  },
  {
    id: 'scan',
    label: '公开专利扫描',
    script: '【竞品】各对手近 24 月公开示意命中已表列；聚焦调度/模组。',
    tool: { name: 'grade_threat', preview: 'pubs_scanned=mock · focus=调度' },
    structuredBody: [
      '| 对手 | 示意公开号 | 主题摘要 |',
      '|------|------------|----------|',
      '| 云 A | CN114882901A | 边缘资源调度 |',
      '| 模组 B | EP4123456A1 | 模组热插拔互连 |',
      '| 初创 E | CN115001234A | 能耗约束迁移 |',
      '| 运维 C | CN113998877A | 云边降级 |',
    ].join('\n'),
  },
  {
    id: 'grade',
    label: '威胁分级',
    script: '【竞品】威胁：2 高 / 2 中 / 1 低。高威胁进挖掘对照。',
    tool: { name: 'grade_threat', preview: 'high=2 · mid=2 · low=1' },
    structuredBody: [
      '| 对手 | 级 | 理由 |',
      '|------|----|------|',
      '| 云 A | **高** | 权要贴近预测→调度 |',
      '| 模组 B | **高** | 接口族可堵热插拔从权 |',
      '| 初创 E | 中 | 能耗侧可对比 |',
      '| 运维 C | 中 | 降级窗口弱相关 |',
      '| 工业 D | 低 | 场景远 |',
      '',
      '**Validator 示意**：高威胁均挂公开号 · **Pass**',
    ].join('\n'),
  },
  {
    id: 'rhythm',
    label: '监控节奏',
    script: '【竞品】建议周扫高威胁、月扫中威胁；样机仅示意节奏表。',
    tool: { name: 'list_competitors', preview: 'cadence=W高/M中' },
    structuredBody: [
      '| 级 | 节奏 | 动作 |',
      '|----|------|------|',
      '| 高 | 每周 | 新公开 + 权要摘要 |',
      '| 中 | 每月 | 族扩展检查 |',
      '| 低 | 季度 | 名单复审 |',
    ].join('\n'),
  },
  {
    id: 'pack',
    label: '报告确认 · 待交',
    script: '【竞品】03_competitor_watch 待确认。可转挖掘对照高威胁。',
    tool: {
      name: 'draft_competitor_watch',
      preview: 'file=03_competitor_watch.md',
    },
    triggersHitl: true,
    hitlGate: 'approve_strategy',
    structuredBody: [
      '## 竞品监控摘要（可扫读）',
      '',
      '**高威胁**：云 A（CN114882901A）· 模组 B（EP4123456A1）。',
      '',
      '**交给挖掘/布局**：威胁表 + 公开号；写入须你确认。',
      '',
      '≠ watch 业务 STAGE；本席为案前竞品监控样机。',
    ].join('\n'),
  },
]

export const COMPETITOR_DEPTH_SHORTCUTS = [
  { id: 'list', label: '对手名单', action: 'jump' as const, stepId: 'list' },
  { id: 'grade', label: '威胁分级', action: 'jump' as const, stepId: 'grade' },
  { id: 'report-orch', label: '回报总控', action: 'report' as const },
]

export const COMPETITOR_SAMPLE_ARTIFACT = `# 竞品监控报告（样机）

> 样机成果 · 提案键 · 非法律意见

## 摘要

Top5 对手威胁分级：2 高 / 2 中 / 1 低；高威胁锚定 CN114882901A 与 EP4123456A1。

## 正文

随步骤追加名单、公开扫描、分级、节奏与交卷摘要。
`

export const COMPETITOR_SAMPLE_WORKLOG_STEPS = `| 1 | 名单 | 全景 | Top5 | — |
| 2 | 公开扫描 | 示意库 | 表 | — |
| 3 | 威胁分级 | 规则 | 高/中/低 | — |
| 4 | 监控节奏 | 建议 | W/M | — |
| 5 | 报告确认 | 摘要 | 待确认 | HITL |`

export const COMPETITOR_SAMPLE_WORKLOG_CHOICES = `| 全覆盖 | 聚焦威胁 | 聚焦 | 可转挖 |
| 只列名 | 挂公开号 | 可核验 | 可确认 |`
