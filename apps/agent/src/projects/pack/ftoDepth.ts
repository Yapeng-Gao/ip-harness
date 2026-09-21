/** FTO 席深度 · 自由实施+claim chart · ≠三性查新 · ≠维权 */
import type { ExpertStepDef } from '../types'

export const FTO_DEPTH_STEPS: ExpertStepDef[] = [
  {
    id: 'features',
    label: '产品特征',
    script: '【FTO】产品特征 6 项。聚焦自由实施，非新颖性/三性。',
    tool: { name: 'extract_fto_features', preview: 'features=6 · ≠novelty' },
    structuredBody: [
      '| # | 产品特征（落地） | 备注 |',
      '|---|------------------|------|',
      '| 1 | 边缘节点负载预测服务 | 已商用示意 |',
      '| 2 | 能耗+SLA 联合调度器 | 本案核心 |',
      '| 3 | 模组热插拔检测 | 硬件+驱动 |',
      '| 4 | 热插拔后任务重算 | 策略联动 |',
      '| 5 | 云边降级窗口 | 可选开关 |',
      '| 6 | 运维看板 | 非核心 |',
      '',
      '**KB 样例卡**：产品 BOM/版本占位（非真清单）',
    ].join('\n'),
  },
  {
    id: 'hits',
    label: '障碍专利',
    script: '【FTO】障碍候选 4；高相关 CN114882901A。≠查新三性表。',
    tool: { name: 'fto_hit_scan', preview: 'obstacle=4 · top=CN114882901A' },
    structuredBody: [
      '| 公开号 | 相关特征 | 初判 |',
      '|--------|----------|------|',
      '| CN114882901A | 1·2 | **高** · 须 chart |',
      '| EP4123456A1 | 3 | 中 · 接口侧 |',
      '| CN115001234A | 2 | 中 |',
      '| US20230123456A1 | 1 | 低–中 |',
    ].join('\n'),
  },
  {
    id: 'chart',
    label: 'Claim chart',
    script: '【FTO】对高相关件已作 claim chart≥2（示意要素对照）。',
    tool: { name: 'build_risk_matrix', preview: 'charts=2 · elements=mapped' },
    structuredBody: [
      '**Chart A · CN114882901A ↔ 产品**',
      '| 权要要素 | 产品对应 | 覆盖？ |',
      '|----------|----------|--------|',
      '| 负载预测 | 特征1 | 是 |',
      '| 资源调度 | 特征2（部分） | 部分 |',
      '| 热插拔联动 | — | **否** |',
      '',
      '**Chart B · EP4123456A1**：接口要素部分命中特征3；无调度联动。',
      '',
      '**Validator 示意**：高相关均有 chart · **Pass**',
    ].join('\n'),
  },
  {
    id: 'matrix',
    label: '风险矩阵',
    script: '【FTO】2 红 / 1 黄 / 3 绿；红项建议设计规避或许可路径。',
    tool: { name: 'build_risk_matrix', preview: 'red=2 · yellow=1 · green=3' },
    structuredBody: [
      '| 特征 | 色 | 建议 |',
      '|------|----|------|',
      '| 2 联合调度 | 红 | 限缩实现 / 对照权要规避 |',
      '| 1 预测服务 | 红 | 换特征组合或许可观察 |',
      '| 3 热插拔检测 | 黄 | 接口差异化 |',
      '| 4–6 | 绿 | 可放行示意 |',
    ].join('\n'),
  },
  {
    id: 'report',
    label: '备忘确认 · 待交',
    script: '【FTO】11_fto_memo 待确认；默认不写案；≠维权席。',
    tool: { name: 'draft_fto_report', preview: 'file=11_fto_memo.md' },
    triggersHitl: true,
    hitlGate: 'approve_strategy',
    structuredBody: [
      '## FTO 备忘摘要（可扫读）',
      '',
      '**结论示意**：红 2 / 黄 1；递交前须业务确认规避或许可路径。',
      '',
      '**声明**：非法律意见 · ≠三性查新 · ≠ expert-enforcement。',
      '',
      '确认后仅样机备忘；默认不写真案卷。',
    ].join('\n'),
  },
]

export const FTO_DEPTH_SHORTCUTS = [
  { id: 'features', label: '抽特征', action: 'jump' as const, stepId: 'features' },
  { id: 'matrix', label: '风险矩阵', action: 'jump' as const, stepId: 'matrix' },
  { id: 'report-orch', label: '回报总控', action: 'report' as const },
]

export const FTO_SAMPLE_ARTIFACT = `# FTO 备忘录（样机）

> 非法律意见 · ≠三性 · ≠维权 · 默认不写案

## 摘要

产品六特征对照障碍专利；claim chart×2；风险 2 红 / 1 黄 / 3 绿；待确认。

## 正文

随步骤追加特征、障碍、chart、矩阵与交卷摘要。
`

export const FTO_SAMPLE_WORKLOG_STEPS = `| 1 | 产品特征 | 落地 | 6项 | — |
| 2 | 障碍专利 | 扫描 | 4候选 | — |
| 3 | Claim chart | 对照 | ≥2 | — |
| 4 | 风险矩阵 | 分级 | 红黄绿 | — |
| 5 | 备忘确认 | HITL | 待确认 | HITL |`

export const FTO_SAMPLE_WORKLOG_CHOICES = `| 放行不问 | 红项须路径 | 分级 | 递交闸 |
| 当三性查新 | 只做FTO | FTO | 纪律 |`
