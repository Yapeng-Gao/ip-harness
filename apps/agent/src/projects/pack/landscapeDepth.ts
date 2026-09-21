/** 产业全景席深度 · agent-depth-reliability · 赛道全景支撑立项 */
import type { ExpertStepDef } from '../types'

export const LANDSCAPE_DEPTH_STEPS: ExpertStepDef[] = [
  {
    id: 'scope',
    label: '定赛道',
    script:
      '【全景】已定赛道边界：边缘计算调度模组（预测 · 多约束 · 热插拔）。',
    tool: { name: 'map_landscape', preview: 'theme=边缘调度 · bound=CN优先' },
    structuredBody: [
      '**赛道边界（样机）**',
      '- 主题：边缘调度模组',
      '- 纳入：负载预测、能耗+SLA 同权、模组热插拔联动',
      '- 排除：纯中心云调度、纯硬件互连无策略',
      '',
      '**KB 样例卡**：赛道标签「边缘↔edge / 雾计算」· 公开情报占位',
    ].join('\n'),
  },
  {
    id: 'players',
    label: '玩家分层',
    script: '【全景】玩家四层：云厂商 / 模组商 / 运营商 / 垂直方案。见成果表。',
    tool: { name: 'segment_market', preview: 'segments=4 · players≈12' },
    structuredBody: [
      '| 层 | 代表（示意） | 专利姿态 |',
      '|----|--------------|----------|',
      '| 云厂商 | 某云 A | 预测+调度族密 |',
      '| 模组商 | 模组商 B | 热插拔接口族 |',
      '| 运营商 | 运营商 C | 边缘站点运维 |',
      '| 垂直方案 | 工业边缘 D | 场景绑定、族薄 |',
    ].join('\n'),
  },
  {
    id: 'traj',
    label: '技术轨迹',
    script: '【全景】近 5 年轨迹：预测控制 → 能耗约束 → 模组化部署。',
    tool: { name: 'map_landscape', preview: 'traj=3 · years=5' },
    structuredBody: [
      '| 阶段 | 关键词 | 对本案含义 |',
      '|------|--------|------------|',
      '| T-1 | 负载预测 | 已成红海，独权勿单押 |',
      '| T-0 | 能耗调度 | 多约束同权仍稀 |',
      '| T+ | 热插拔联动 | 空白带 · 布局优先 |',
      '',
      '**Validator 示意**：轨迹标签覆盖赛道边界 3/3 · **Pass**',
    ].join('\n'),
  },
  {
    id: 'policy',
    label: '政策与标准',
    script: '【全景】政策/标准占位：算力枢纽 · 边缘节点能效指引（非法律意见）。',
    tool: { name: 'segment_market', preview: 'policy=2 · std=1' },
    structuredBody: [
      '**政策占位**',
      '- 国家级算力枢纽：边缘节点部署激励（示意）',
      '- 能效指引：调度策略可写「能耗可核验」从权',
      '',
      '**标准线索**：模组互连接口草案（KB 样例卡 · 非真标准全文）',
    ].join('\n'),
  },
  {
    id: 'map',
    label: '全景合成',
    script: '【全景】四象限已合成：机会在「多约束×热插拔」交叉格。',
    tool: { name: 'map_landscape', preview: 'quad=机会高 · risk=中' },
    structuredBody: [
      '| 象限 | 内容 | 评分 |',
      '|------|------|------|',
      '| 机会 | 三联组合空白 | 高 |',
      '| 威胁 | 云厂商预测族 | 中高 |',
      '| 空白 | 热插拔联动调度 | 高 |',
      '| 红海 | 单点负载预测 | 低（勿独权） |',
    ].join('\n'),
  },
  {
    id: 'report',
    label: '报告确认 · 待交',
    script:
      '【全景】01_landscape_report 摘要已齐，请你确认。过程见 worklog。',
    tool: {
      name: 'draft_landscape_report',
      preview: 'file=01_landscape_report.md',
    },
    triggersHitl: true,
    hitlGate: 'approve_strategy',
    structuredBody: [
      '## 产业全景摘要（可扫读）',
      '',
      '**结论**：边缘调度模组赛道可立项观察；保护重点应压「多约束+热插拔联动」。',
      '',
      '**交给激发/挖掘**：本摘要 + 玩家表 + 四象限；正式写入须你确认。',
      '',
      '**非法律意见** · 提案键勿假装 contracts。',
    ].join('\n'),
  },
]

export const LANDSCAPE_DEPTH_SHORTCUTS = [
  { id: 'map', label: '画全景', action: 'jump' as const, stepId: 'map' },
  { id: 'report', label: '出报告', action: 'jump' as const, stepId: 'report' },
  { id: 'report-orch', label: '回报总控', action: 'report' as const },
]

export const LANDSCAPE_SAMPLE_ARTIFACT = `# 产业全景报告（样机）

> 样机成果 · 非真案卷 · 非法律意见

## 摘要

边缘调度模组赛道：玩家四层、轨迹三阶段、机会在多约束×热插拔交叉格。建议保护重点压三联组合。

## 正文

随步骤追加赛道边界、玩家、轨迹、政策、四象限与交卷摘要。
`

export const LANDSCAPE_SAMPLE_WORKLOG_STEPS = `| 1 | 定赛道 | 主题 | 边界 | — |
| 2 | 玩家分层 | 公开情报 | 四层表 | — |
| 3 | 技术轨迹 | 近5年 | 三阶段 | — |
| 4 | 政策标准 | KB占位 | 线索 | — |
| 5 | 全景合成 | 四象限 | 机会格 | — |
| 6 | 报告确认 | 摘要 | 待确认 | HITL |`

export const LANDSCAPE_SAMPLE_WORKLOG_CHOICES = `| 宽赛道 | 窄赛道压三联 | 窄 | 可激发 |
| 只列玩家 | 表+四象限 | 可读表 | 可确认 |`
