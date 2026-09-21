/**
 * 立项席深度（agent-depth-reliability P2）
 * 对齐 bot-expert-assets「立项评审」：区别特征分析 + 评分卡 mock + go_nogo HITL
 */
import type { ExpertStepDef } from '../types'

export const INTAKE_DEPTH_STEPS: ExpertStepDef[] = [
  {
    id: 'ingest',
    label: '吃上游结论',
    script:
      '【立项】已汇总查新意见书与主题要点。对比文件与风险档见「成果」。',
    tool: { name: 'ingest_upstream', preview: '已读查新摘要 + 主题 · 2 份材料' },
    structuredBody: [
      '**上游摄入（样机）**',
      '- 查新：三联组合未完整公开 · 新颖性风险中 · 创造性依赖效果数据',
      '- 主题：边缘调度模组（预测 + 多约束 + 热插拔）',
      '- 对比文件优先：CN114882901A · US20230123456A1',
      '',
      '**KB 样例卡**：市场公开情报占位（非真万得）',
    ].join('\n'),
  },
  {
    id: 'diff',
    label: '区别特征分析',
    script:
      '【立项】相对最接近文件的区别特征已表列。分析由本席起草，打分另走公式工具。',
    tool: { name: 'extract_evidence', preview: '区别特征 4 条 · 最接近 CN114882901A' },
    structuredBody: [
      '| # | 本案特征 | 最接近文件 | 是否公开 | 备注 |',
      '|---|----------|------------|----------|------|',
      '| 1 | 时序负载预测 | CN114882901A | 部分 | 有预测，无本案特征集 |',
      '| 2 | 能耗+SLA 同权约束 | CN115001234A | 否 | 对方偏能耗优先 |',
      '| 3 | 模组热插拔联动调度 | EP4123456A1 | 否 | 仅互连，无调度联动 |',
      '| 4 | 云边降级窗口 | CN113998877A | 弱相关 | 可作从权 |',
    ].join('\n'),
  },
  {
    id: 'score',
    label: '三轴评分卡',
    script:
      '【立项】技术可行性 / 可专利性 / 商业价值三轴已打分（公式工具示意，非 LLM 编造）。',
    tool: {
      name: 'scoring_formula',
      preview: '技术 78 · 可专利 72 · 商业 70 · 综合 73',
    },
    structuredBody: [
      '| 轴 | 分 | 区间规则 | 说明 |',
      '|----|----|----------|------|',
      '| 技术可行性 | 78 | ≥75 绿灯 | 实施例可补，工程路径清晰 |',
      '| 可专利性 | 72 | 50–75 黄灯 | 依赖交底补效果；对比文件需吃透 |',
      '| 商业价值 | 70 | 50–75 黄灯 | 边缘算力产品线相关（示意） |',
      '| **综合** | **73** | 中间转人工 | **建议 Go · 附条件** |',
      '',
      '**Validator 示意**：评分卡 schema 齐 · 区间规则命中「中间转人工」· Pass',
    ].join('\n'),
  },
  {
    id: 'scope',
    label: '范围与报价草案',
    script:
      '【立项】申请范围草案：CN 发明先申；报价档与周期为样机占位。',
    tool: { name: 'draft_intake_quote', preview: 'CN 发明 · 标准档 · 周期约 18 个月' },
    structuredBody: [
      '**范围草案**',
      '- 国别：中国发明（先）· PCT 观察',
      '- 保护重点：独权压「多约束调度+热插拔联动」；从权拆预测/能耗/接口',
      '',
      '**报价占位（非真价）**',
      '| 项 | 档 | 说明 |',
      '|----|----|------|',
      '| 代理撰写+递交 | 标准 | 含一轮补正预留 |',
      '| 查新复用 | 已含 | 本案查新结论可引用 |',
      '',
      '正式数字以商务确认为准。',
    ].join('\n'),
  },
  {
    id: 'go',
    label: 'Go / No-Go · 待确认',
    script:
      '【立项】建议 **Go（附条件）**：交底须补联动效果数据。请你确认后才派交底席。',
    tool: { name: 'propose_go_nogo', preview: '建议 Go·附条件 · 待你确认立项' },
    triggersHitl: true,
    hitlGate: 'go_nogo',
    structuredBody: [
      '## 立项决议摘要（可扫读）',
      '',
      '**决议建议**：Go · 附条件',
      '',
      '**条件**',
      '1. 交底补「预测↔调度↔热插拔」联动的效果与实施例；',
      '2. 撰写前再核 CN114882901A 权要映射；',
      '3. 独权勿宽于查新已论证的区别特征。',
      '',
      '**No-Go 触发（未命中）**：综合 <50 或无可辩护区别特征。',
      '',
      '**交给交底**：本决议 + 区别特征表 + 评分卡；写入中台须你确认立项。',
    ].join('\n'),
  },
]

export const INTAKE_DEPTH_SHORTCUTS = [
  { id: 'ingest', label: '吃上游', action: 'jump' as const, stepId: 'ingest' },
  { id: 'score', label: '评分卡', action: 'jump' as const, stepId: 'score' },
  { id: 'go', label: 'Go/No-Go', action: 'jump' as const, stepId: 'go' },
  { id: 'report-orch', label: '回报总控', action: 'report' as const },
]

export const INTAKE_SAMPLE_ARTIFACT = `# 立项决策书（样机）

> 样机成果 · 非真案卷 · 报价附属非主产出

## 摘要

吃查新结论后完成区别特征分析与三轴评分（综合 73）。建议 Go（附条件）：交底补联动效果后再撰写。范围拟 CN 发明先申。

## 正文

随步骤推进将追加上游摄入、区别特征表、评分卡、范围报价与 Go/No-Go 决议。确认前可在「成果」扫读。
`

export const INTAKE_SAMPLE_WORKLOG_STEPS = `| 1 | 吃上游 | 查新 | 要点 | — |
| 2 | 区别特征 | 对比文件 | 表 | — |
| 3 | 评分卡 | 公式 | 三轴 | — |
| 4 | 范围报价 | 草案 | CN | — |
| 5 | Go/No-Go | HITL | 决议 | HITL |`

export const INTAKE_SAMPLE_WORKLOG_CHOICES = `| No-Go | Go 附条件 | Go 附条件 | 可交底 |
| 只看分 | 分+区别表 | 分+表 | 可确认 |`
