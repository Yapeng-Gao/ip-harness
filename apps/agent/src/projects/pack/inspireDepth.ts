/** 创新激发席深度 · 收敛可专利方向 inspire_brief */
import type { ExpertStepDef } from '../types'

export const INSPIRE_DEPTH_STEPS: ExpertStepDef[] = [
  {
    id: 'ingest',
    label: '吃全景',
    script: '【激发】已读全景：机会在多约束×热插拔；预测单点为红海。',
    tool: { name: 'brainstorm_directions', preview: 'upstream=landscape · focus=三联' },
    structuredBody: [
      '**上游约束**',
      '- 勿独权单押负载预测',
      '- 空白带：热插拔联动调度',
      '- 玩家威胁：云厂商预测族密',
      '',
      '**KB 样例卡**：TRIZ/功能抽象提示「分离·组合·接口」占位',
    ].join('\n'),
  },
  {
    id: 'pool',
    label: '方向池',
    script: '【激发】方向池 8 条已开；将收敛至 2～3 条可专利方向。',
    tool: { name: 'brainstorm_directions', preview: 'pool=8 → target=3' },
    structuredBody: [
      '| # | 方向草稿 | 来源启发 |',
      '|---|----------|----------|',
      '| 1 | 预测→同权调度闭环 | 轨迹 T-0 |',
      '| 2 | 热插拔触发重调度 | 空白带 |',
      '| 3 | 云边降级窗口协议 | 全景运营商层 |',
      '| 4 | 能耗可核验从权写法 | 政策能效 |',
      '| 5–8 | （发散占位） | 池内待滤 |',
    ].join('\n'),
  },
  {
    id: 'filter',
    label: '可专利过滤',
    script: '【激发】过滤纯商业模式与纯已知组合；保留 3 条技术向。',
    tool: { name: 'score_patentability', preview: 'kept=3 · drop=5' },
    structuredBody: [
      '| # | 方向 | 过滤结果 | 理由 |',
      '|---|------|----------|------|',
      '| 1 | 同权调度闭环 | **留** | 技术特征可写 |',
      '| 2 | 热插拔重调度 | **留** | 空白带 |',
      '| 3 | 降级窗口协议 | **留** | 可从权 |',
      '| 4 | 纯报价模型 | 弃 | 商业方法风险 |',
      '',
      '**Validator 示意**：抽象问题/纯商业 · **未触发 blocker**',
    ].join('\n'),
  },
  {
    id: 'score',
    label: '可专利性评分',
    script: '【激发】Top3 评分：热插拔联动最高；降级作从权。',
    tool: { name: 'score_patentability', preview: 'top=热插拔联动 · score=0.81' },
    structuredBody: [
      '| 方向 | 新颖性示意 | 可实施 | 建议角色 |',
      '|------|------------|--------|----------|',
      '| 热插拔触发重调度 | 0.81 | 高 | 主方向 |',
      '| 同权调度闭环 | 0.74 | 高 | 主/并案 |',
      '| 降级窗口协议 | 0.66 | 中 | 从权/子案 |',
    ].join('\n'),
  },
  {
    id: 'brief',
    label: 'brief确认 · 待交',
    script: '【激发】02_inspire_brief 待确认。过程见 worklog。',
    tool: {
      name: 'draft_inspire_brief',
      preview: 'file=02_inspire_brief.md',
    },
    triggersHitl: true,
    hitlGate: 'approve_strategy',
    structuredBody: [
      '## 创新激发 brief（可扫读）',
      '',
      '**推荐主方向**：热插拔触发重调度 + 同权约束闭环。',
      '',
      '**从权/子案**：云边降级窗口。',
      '',
      '**交给挖掘**：方向表 + 评分；写入须你确认。',
    ].join('\n'),
  },
]

export const INSPIRE_DEPTH_SHORTCUTS = [
  { id: 'pool', label: '方向池', action: 'jump' as const, stepId: 'pool' },
  { id: 'brief', label: '出 brief', action: 'jump' as const, stepId: 'brief' },
  { id: 'report-orch', label: '回报总控', action: 'report' as const },
]

export const INSPIRE_SAMPLE_ARTIFACT = `# 创新激发 brief（样机）

> 样机成果 · 提案键 · 非法律意见

## 摘要

自全景收敛 3 条可专利方向；主推热插拔联动重调度与同权调度闭环。

## 正文

随步骤追加上游约束、方向池、过滤、评分与交卷 brief。
`

export const INSPIRE_SAMPLE_WORKLOG_STEPS = `| 1 | 吃全景 | 01 | 约束 | — |
| 2 | 方向池 | 启发 | 8条 | — |
| 3 | 可专利过滤 | 规则 | 留3 | — |
| 4 | 评分 | 公式示意 | Top表 | — |
| 5 | brief确认 | 摘要 | 待确认 | HITL |`

export const INSPIRE_SAMPLE_WORKLOG_CHOICES = `| 发散多点 | 收敛3 | 收敛 | 可挖 |
| 商业模式入池 | 技术向过滤 | 过滤 | 纪律 |`
