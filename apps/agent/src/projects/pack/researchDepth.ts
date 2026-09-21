/**
 * 查新席深度样板（agent-depth-reliability P1）
 * 单写：expertsPatent expert-research / expert-search 共用。
 */
import type { ExpertStepDef } from '../types'

/** 6 步 · 每步带可扫读 structuredBody（进成果/过程 progressive） */
export const RESEARCH_DEPTH_STEPS: ExpertStepDef[] = [
  {
    id: 'scope',
    label: '划定检索范围',
    script:
      '【查新】已从交底/主题抽出技术要点，并拟定拟检索字段。请在「成果」查看要点清单。',
    tool: {
      name: 'extract_tech_points',
      preview: '技术要点 5 条 · 字段含名称 / 功效 / 结构',
    },
    structuredBody: [
      '**技术要点（样机）**',
      '1. 边缘节点负载预测（时序特征）',
      '2. 多约束调度（能耗 + SLA）',
      '3. 模组化部署与热插拔',
      '4. 与中心云协同的降级策略',
      '5. 故障自愈与迁移窗口',
      '',
      '**拟检索字段**：发明名称 · 摘要 · 权利要求 · IPC/CPC（G06F 优先）',
      '',
      '**KB 样例卡（占位）**：同义词「边缘↔edge / 雾计算」· 检索式模板「调度+能耗」族',
    ].join('\n'),
  },
  {
    id: 'query',
    label: '检索式',
    script:
      '【查新】主检索式与 2 条备用式已就绪。布尔逻辑：核心手段 AND 应用场景，排除纯云端调度。',
    tool: {
      name: 'build_search_query',
      preview: '主检索式 1 条 + 备用 2 条 · 拟扫约 50 篇',
    },
    structuredBody: [
      '**主检索式**',
      '`(边缘 OR edge OR 雾) AND (调度 OR scheduling) AND (负载 OR workload) AND (能耗 OR energy)`',
      '',
      '**备用式 A（结构向）**',
      '`(模组 OR module) AND (热插拔 OR hot-swap) AND 节点`',
      '',
      '**备用式 B（协同向）**',
      '`(云边 OR cloud-edge) AND (降级 OR fallback) AND 调度`',
      '',
      '**说明**：先主式扫库；命中过稀再启备用。样机未接真库。',
    ].join('\n'),
  },
  {
    id: 'hits',
    label: '命中清单',
    script:
      '【查新】商业库示意命中 12 篇，下列 Top 清单已写入成果。相关度与初判供立项参考。',
    tool: {
      name: 'commercial_patent_search',
      preview: '命中 12 篇 · 清单列出 Top 6',
    },
    structuredBody: [
      '| 公开号 | 标题（示意） | 相关度 | 初判 |',
      '|--------|--------------|--------|------|',
      '| CN114882901A | 边缘计算节点资源调度方法 | 高 | 最接近 · 读权要 |',
      '| US20230123456A1 | Workload prediction for edge clusters | 高 | 对比文件候选 |',
      '| CN115001234A | 能耗约束下的任务迁移 | 中 | 入篮 |',
      '| EP4123456A1 | Modular node hot-swap fabric | 中 | 结构线索 |',
      '| CN113998877A | 云边协同降级控制 | 中 | 入篮 |',
      '| JP2022-123456A | 分散ノード負荷予測 | 低 | 观察 |',
      '',
      '> 其余 6 篇为低相关示意，过程日志可查。',
    ].join('\n'),
  },
  {
    id: 'cluster',
    label: '聚类对比',
    script:
      '【查新】命中聚为 3 簇：预测控制 / 能耗调度 / 模组互连。每簇选取代表文献。',
    tool: {
      name: 'cluster_hits',
      preview: '聚为 3 簇 · 每簇 1 篇代表文献',
    },
    structuredBody: [
      '**簇 A · 预测控制** — 代表：CN114882901A',
      '- 共同点：时序特征 → 调度决策',
      '- 差异点（本案）：多约束联合 + 模组热插拔未覆盖',
      '',
      '**簇 B · 能耗调度** — 代表：CN115001234A',
      '- 共同点：能耗作硬约束',
      '- 差异点：本案强调 SLA 同权，非能耗优先',
      '',
      '**簇 C · 模组互连** — 代表：EP4123456A1',
      '- 共同点：节点可替换',
      '- 差异点：本案调度策略与热插拔联动',
    ].join('\n'),
  },
  {
    id: 'novelty',
    label: '三性意见草稿',
    script:
      '【查新】三性对照表已起草。新颖性风险中等；创造性依赖「多约束+热插拔联动」组合。',
    tool: {
      name: 'bind_novelty',
      preview: 'X/Y/A 对照表 · 风险中等',
    },
    structuredBody: [
      '| 维度 | 对照文件 | 意见（样机） |',
      '|------|----------|--------------|',
      '| 新颖性 X | CN114882901A | 特征组合未完整公开 · 风险**中** |',
      '| 创造性 Y | US20230123456A1 + CN115001234A | 拼接可论证但需交底补效果数据 · 风险**中高** |',
      '| 实用性 A | — | 产业可实施 · 风险**低** |',
      '',
      '**风险一句**：若交底无法支撑「联动」效果，建议缩限独权或补实验数据后再立项。',
      '',
      '**覆盖度检查（validator 示意）**：要点 5/5 已映射命中簇 · **Pass**',
    ].join('\n'),
  },
  {
    id: 'report',
    label: '报告确认 · 待交',
    script:
      '【查新】查新暨三性意见书摘要已齐，请你确认后本案才进入立项。过程与取舍见「办理过程」。',
    tool: {
      name: 'draft_research_report',
      preview: '查新报告已交卷 · 待你确认',
    },
    triggersHitl: true,
    hitlGate: 'approve_strategy',
    structuredBody: [
      '## 意见书摘要（可扫读）',
      '',
      '**发明主题（示意）**：边缘调度模组 — 负载预测 + 多约束调度 + 模组热插拔。',
      '',
      '**检索结论**：库内可见最接近方案侧重「预测→调度」或「能耗约束」，未见与本案相同的三联组合公开。',
      '',
      '**建议**',
      '1. 立项可继续，但交底须补「联动」效果与实施例。',
      '2. 权要布局预留从权：纯预测 / 纯能耗 / 热插拔接口。',
      '3. 对比文件优先吃透 CN114882901A 与 US20230123456A1。',
      '',
      '**交给立项**：本摘要 + 命中表 + 三性表；正式写入中台须你确认。',
    ].join('\n'),
  },
]

export const RESEARCH_DEPTH_SHORTCUTS = [
  { id: 'run-scope', label: '看范围', action: 'jump' as const, stepId: 'scope' },
  { id: 'run-query', label: '跑检索式', action: 'jump' as const, stepId: 'query' },
  { id: 'open-hits', label: '看命中', action: 'jump' as const, stepId: 'hits' },
  { id: 'report-orch', label: '回报总控', action: 'report' as const },
]

export const RESEARCH_SAMPLE_ARTIFACT = `# 查新暨三性意见书（样机）

> 样机成果 · 非真案卷 · 非法律意见

## 摘要

针对「边缘调度模组」开展查新：覆盖负载预测、多约束调度与模组热插拔。检索示意命中 12 篇，聚为预测控制 / 能耗调度 / 模组互连三簇。三性意见：新颖性风险中等，创造性依赖三联组合与效果数据。

## 正文

随本席步骤推进，「本席推进记录」将追加范围、检索式、命中表、聚类、三性与交卷摘要。确认前可随时在「成果」扫读。
`

export const RESEARCH_SAMPLE_WORKLOG_STEPS = `| 1 | 划定检索范围 | 交底/主题 | 要点清单 | — |
| 2 | 检索式 | 要点 | 主式+备用 | — |
| 3 | 命中清单 | 示意库 | Top 表 | — |
| 4 | 聚类对比 | 命中 | 3 簇 | — |
| 5 | 三性意见 | 对比 | X/Y/A | — |
| 6 | 报告确认 | 摘要 | 待确认 | HITL |`

export const RESEARCH_SAMPLE_WORKLOG_CHOICES = `| 宽扫不缩 | 主式+备用递进 | 递进 | 可立项 |
| 只报命中数 | 交可读表+三性 | 可读表 | 可确认 |`
