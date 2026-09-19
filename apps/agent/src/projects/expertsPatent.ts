import type { ProjectExpertDef, ProjectExpertId } from './types'

/**
 * Patent DomainPack experts — full L3 chain (agent-l3-patent.md afe94aa).
 * Order: orch → search → mining → disclosure → draft → figure → fto → filing → oa
 * Do NOT import into general / L1 / L2.
 */
export type PatentExpertId =
  | 'orchestrator'
  | 'expert-search'
  | 'expert-mining'
  | 'expert-disclosure'
  | 'expert-draft'
  | 'expert-figure'
  | 'expert-fto'
  | 'expert-filing'
  | 'expert-oa'

export const PATENT_EXPERTS: Record<PatentExpertId, ProjectExpertDef> = {
  orchestrator: {
    id: 'orchestrator',
    name: '总控席',
    role: 'orchestrator',
    specialty: '编排 · 分派 · 汇总',
    description:
      '只拆派任务与汇总专家回执；禁止直接改 handoff / 写案。可点「演示全链路」沿专利链路自发派各席。',
    tools: ['dispatch_task', 'summarize_timeline', 'open_expert_dm'],
    shortcuts: [
      {
        id: 'dispatch-search',
        label: '分派给检索',
        action: 'dispatch_hint',
        hint: 'expert-search',
      },
      {
        id: 'dispatch-mining',
        label: '分派给挖掘',
        action: 'dispatch_hint',
        hint: 'expert-mining',
      },
      {
        id: 'dispatch-disclosure',
        label: '分派给交底',
        action: 'dispatch_hint',
        hint: 'expert-disclosure',
      },
      {
        id: 'dispatch-draft',
        label: '分派给撰稿',
        action: 'dispatch_hint',
        hint: 'expert-draft',
      },
      {
        id: 'dispatch-figure',
        label: '分派给附图',
        action: 'dispatch_hint',
        hint: 'expert-figure',
      },
      {
        id: 'dispatch-fto',
        label: '分派给自由实施',
        action: 'dispatch_hint',
        hint: 'expert-fto',
      },
      {
        id: 'dispatch-filing',
        label: '分派给递交',
        action: 'dispatch_hint',
        hint: 'expert-filing',
      },
      {
        id: 'dispatch-oa',
        label: '分派给OA',
        action: 'dispatch_hint',
        hint: 'expert-oa',
      },
    ],
    steps: [
      {
        id: 'brief',
        label: '收目标',
        script:
          '【总控】已记下项目目标。请用「分派给…」交给各专利专家；或点「演示全链路」依次走检索→挖掘→交底→撰稿→附图→FTO→递交→OA。我不会替专家跑领域剧本。',
      },
      {
        id: 'dispatch',
        label: '拆派',
        script:
          '【总控】拆派卡片已就绪。点快捷动作即可写入专家私聊与项目时间线。',
      },
      {
        id: 'await',
        label: '等回执',
        script:
          '【总控】等待专家「回报总控/项目」。汇总只读时间线，不绕过专家闸写库。',
      },
      {
        id: 'summarize',
        label: '汇总',
        script:
          '【总控】已汇总各专家回执到项目时间线。写库仍须对应专家确认后再写入。',
      },
    ],
    hitlGates: [],
    domainCommandCandidates: [
      {
        command: null,
        label: '无写库权',
        note: '总控禁止直接 dispatchCommand；仅可提议「请专家 X 执行」',
      },
    ],
    guardrails: [
      '禁止直接改 handoff',
      '禁止一键写库',
      '分派≠替专家执行领域逻辑',
    ],
    catalogAgentId: null,
    accent: 'slate',
  },

  'expert-search': {
    id: 'expert-search',
    name: '检索专家',
    role: 'expert',
    specialty: '现有技术检索 · 工作篮',
    description:
      '先写好检索词并查看结果，再把有用文献放进工作篮；需要时请你确认检索策略（默认只读，不直接改案件）。',
    tools: [
      'commercial_patent_search',
      'cluster_hits',
      'draft_research_report',
      'bind_novelty',
    ],
    shortcuts: [
      { id: 'run-query', label: '跑检索式', action: 'jump', stepId: 'query' },
      { id: 'open-hits', label: '看命中', action: 'jump', stepId: 'hits' },
      { id: 'basket', label: '入工作篮', action: 'jump', stepId: 'basket' },
      { id: 'report-orch', label: '回报总控/项目', action: 'report' },
    ],
    steps: [
      {
        id: 'query',
        label: '检索式',
        script:
          '【检索】已扩展关键词：边缘调度 / 负载预测 / 能耗约束。下一步进行商业专利检索。',
        tool: {
          name: 'commercial_patent_search',
          preview: 'query=(边缘计算 OR edge) AND (调度) AND (负载预测) · limit=20',
        },
      },
      {
        id: 'hits',
        label: '命中',
        script:
          '【检索】命中 12 件。Top3：CN114882901A（0.86）· US20230123456A1（0.81）· CN115001234A（0.77）。可核验公开号与链接。',
        tool: {
          name: 'cluster_hits',
          preview: 'clusters=3 · labels=[调度,能耗,负载预测]',
        },
      },
      {
        id: 'basket',
        label: '工作篮',
        script:
          '【检索】已将 Top5 放入工作篮（只读样机）。可选送自由实施/挖掘占位，不写案。',
        tool: {
          name: 'bind_novelty',
          preview: 'basket=5 · novelty_gap=能耗约束动态频率',
        },
      },
      {
        id: 'strategy',
        label: '策略确认',
        script:
          '【检索】请确认是否批准检索策略。本专家默认只读；未绑案时不写入案件。',
        triggersHitl: true,
        hitlGate: 'approve_strategy',
      },
    ],
    hitlGates: ['approve_strategy'],
    domainCommandCandidates: [
      {
        command: null,
        label: '通常只读',
        note: '样机无强制写库；若绑案且 Confirm，可走 submitResearch（经真闸）',
      },
      {
        command: 'submitResearch',
        label: '可选·提交调研',
        note: '仅确认后 · 以 Agent 身份',
      },
    ],
    guardrails: [
      '禁止空命中过闸',
      '命中须可核验 pubNo+url',
      '输出非法律意见',
    ],
    catalogAgentId: 'agent-research',
    accent: 'sky',
  },

  'expert-mining': {
    id: 'expert-mining',
    name: '挖掘专家',
    role: 'expert',
    specialty: '发明点挖掘 · 立项前',
    description:
      '技术点→2～3 可申报方向→评分→送立项占位。可链 intake_quote；建案须 HITL（createCaseFromInsight）。',
    tools: [
      'parse_tech_points',
      'extract_invention_points',
      'score_invention',
      'propose_intake',
    ],
    shortcuts: [
      { id: 'points-in', label: '收技术点', action: 'jump', stepId: 'tech' },
      { id: 'directions', label: '可申报方向', action: 'jump', stepId: 'directions' },
      { id: 'score', label: '评分', action: 'jump', stepId: 'score' },
      { id: 'report-orch', label: '回报总控/项目', action: 'report' },
    ],
    steps: [
      {
        id: 'tech',
        label: '技术点',
        script:
          '【挖掘】已收技术点：边缘调度模组 · 动态频率 · 能耗约束。下一步整理可申报方向。',
        tool: {
          name: 'parse_tech_points',
          preview: 'points=3 · theme=边缘调度',
        },
      },
      {
        id: 'directions',
        label: '可申报方向',
        script:
          '【挖掘】可申报方向 3 条：①负载预测调度 ②能耗约束频率 ③边缘节点热迁移。',
        tool: {
          name: 'extract_invention_points',
          preview: 'candidates=3 · theme=边缘调度',
        },
      },
      {
        id: 'score',
        label: '评分',
        script:
          '【挖掘】评分：新颖性 0.78 · 可专利性 0.71 · 商业价值 0.84。建议送立项占位。',
        tool: {
          name: 'score_invention',
          preview: 'novelty=0.78 · patentability=0.71 · business=0.84',
        },
      },
      {
        id: 'intake',
        label: '送立项确认',
        script:
          '【挖掘】请确认是否以洞察建案（createCaseFromInsight）。确认前仅事件占位，不写真 case-core。',
        triggersHitl: true,
        hitlGate: 'approve_strategy',
        tool: {
          name: 'propose_intake',
          preview: 'handoffKey=intake_quote · command=createCaseFromInsight',
        },
      },
    ],
    hitlGates: ['approve_strategy'],
    domainCommandCandidates: [
      {
        command: 'createCaseFromInsight',
        label: '洞察建案',
        note: 'HITL 后 · actor:agent · 样机内存',
      },
    ],
    guardrails: [
      '送立项≠已建案',
      '建案须 HITL',
      '输出非法律意见',
    ],
    catalogAgentId: 'agent-research',
    accent: 'emerald',
  },

  'expert-disclosure': {
    id: 'expert-disclosure',
    name: '交底整理专家',
    role: 'expert',
    specialty: '交底书结构 · disclosure_pack',
    description:
      '技术点→假交底结构（背景/方案/效果/实施例提纲）→Confirm。偏交底书整理，≠撰稿权利要求。',
    tools: [
      'gather_tech_points',
      'structure_disclosure',
      'outline_embodiments',
      'pack_disclosure',
    ],
    shortcuts: [
      { id: 'tech', label: '收技术点', action: 'jump', stepId: 'tech' },
      { id: 'structure', label: '交底结构', action: 'jump', stepId: 'structure' },
      { id: 'pack', label: '打包交底', action: 'jump', stepId: 'pack' },
      { id: 'report-orch', label: '回报总控/项目', action: 'report' },
    ],
    steps: [
      {
        id: 'tech',
        label: '技术点',
        script:
          '【交底】已汇集技术点：边缘节点调度 · 负载预测 · 能耗约束频率。下一步整理交底书结构。',
        tool: {
          name: 'gather_tech_points',
          preview: 'points=3 · source=mining|inventor',
        },
      },
      {
        id: 'structure',
        label: '交底结构',
        script:
          '【交底】假交底结构已出：背景（现有调度不足）→ 方案（预测+约束频率）→ 效果（能耗↓15%）→ 实施例提纲 2 条。',
        tool: {
          name: 'structure_disclosure',
          preview: 'sections=背景/方案/效果/实施例 · handoff=disclosure_pack',
        },
      },
      {
        id: 'embodiments',
        label: '实施例提纲',
        script:
          '【交底】实施例提纲：例1 单边缘节点；例2 多节点热迁移。待打包进 disclosure_pack。',
        tool: {
          name: 'outline_embodiments',
          preview: 'embodiments=2 · detail=outline-only',
        },
      },
      {
        id: 'pack',
        label: '交底确认',
        script:
          '【交底】disclosure_pack 草稿待你确认。批准后可 saveDraft / submitHandoff（交底）；非权利要求撰稿。',
        triggersHitl: true,
        hitlGate: 'approve_strategy',
        tool: {
          name: 'pack_disclosure',
          preview: 'handoffKey=disclosure_pack · command=saveDraft|submitHandoff',
        },
      },
    ],
    hitlGates: ['approve_strategy'],
    domainCommandCandidates: [
      {
        command: 'saveDraft',
        label: '保存交底草稿',
        note: 'HITL 后 · disclosure_pack',
      },
      {
        command: 'submitHandoff',
        label: '提交交底交接',
        note: '批准策略后 · handoff=disclosure_pack',
      },
    ],
    guardrails: [
      '交底整理≠权利要求撰稿',
      '未 Confirm 不写库',
      '输出非法律意见',
    ],
    catalogAgentId: 'agent-disclosure',
    accent: 'indigo',
  },

  'expert-draft': {
    id: 'expert-draft',
    name: '撰稿专家',
    role: 'expert',
    specialty: '权利要求/摘要 · draft_claims',
    description:
      '交底/要点→假权利要求/摘要→Confirm→写库示意。偏权利要求与说明书章；≠交底书结构整理。',
    tools: [
      'draft_claims',
      'expand_dependent',
      'check_support',
      'draft_abstract',
    ],
    shortcuts: [
      { id: 'draft-ch', label: '生成权项', action: 'jump', stepId: 'claims' },
      { id: 'revise', label: '修订建议', action: 'jump', stepId: 'revise' },
      { id: 'confirm-sub', label: '提请确认', action: 'jump', stepId: 'confirm' },
      { id: 'report-orch', label: '回报总控/项目', action: 'report' },
    ],
    steps: [
      {
        id: 'claims',
        label: '权利要求',
        script:
          '【撰稿】已起草独权 1 条 + 从权 3 条骨架（依据交底要点）；说明书支持点已标注。≠交底结构整理。',
        tool: {
          name: 'draft_claims',
          preview: 'independent=1 · dependent=3 · handoff=draft_claims',
        },
      },
      {
        id: 'abstract',
        label: '摘要',
        script:
          '【撰稿】假摘要已出：一种边缘调度方法，基于负载预测与能耗约束动态调整频率……',
        tool: {
          name: 'draft_abstract',
          preview: 'words≈120 · linked=draft_claims',
        },
      },
      {
        id: 'revise',
        label: '修订建议',
        script:
          '【撰稿】建议缩限「动态频率」特征表述，并补实施例对照表。已生成修订建议卡。',
        tool: {
          name: 'check_support',
          preview: 'support_gaps=2 · country=CN/US',
        },
      },
      {
        id: 'confirm',
        label: '策略批准',
        script:
          '【撰稿】权利要求策略待你批准。批准后可 saveDraft / submitClaims；授权递交请走递交席。',
        triggersHitl: true,
        hitlGate: 'approve_strategy',
      },
    ],
    hitlGates: ['approve_strategy'],
    domainCommandCandidates: [
      {
        command: 'saveDraft',
        label: '保存草稿',
        note: '确认后 · draft_claims',
      },
      {
        command: 'submitClaims',
        label: '提交权利要求',
        note: '批准策略后候选',
      },
      {
        command: 'submitHandoff',
        label: '提交交接',
        note: '批准策略后候选',
      },
    ],
    guardrails: [
      '撰稿≠交底整理',
      '未 Confirm 不写库',
      '输出非律师意见',
    ],
    catalogAgentId: 'agent-claims',
    accent: 'violet',
  },

  'expert-figure': {
    id: 'expert-figure',
    name: '附图专家',
    role: 'expert',
    specialty: '附图清单 · 挂章事件',
    description:
      '上下文→应补示意图清单（框图/流程）→版本→挂章事件。默认不写 handoff；真挂 doc 另刀。',
    tools: [
      'gather_figure_context',
      'list_needed_figures',
      'mock_sketch',
      'attach_chapter_event',
    ],
    shortcuts: [
      { id: 'context', label: '收上下文', action: 'jump', stepId: 'context' },
      { id: 'list', label: '示意图清单', action: 'jump', stepId: 'list' },
      { id: 'attach', label: '挂章事件', action: 'jump', stepId: 'attach' },
      { id: 'report-orch', label: '回报总控/项目', action: 'report' },
    ],
    steps: [
      {
        id: 'context',
        label: '上下文',
        script:
          '【附图】已收集说明书图号需求：系统架构 · 调度时序 · 能耗曲线。',
        tool: {
          name: 'gather_figure_context',
          preview: 'linked=disclosure_pack|draft_claims',
        },
      },
      {
        id: 'list',
        label: '示意图清单',
        script:
          '【附图】应补示意图：图1 系统框图 · 图2 调度流程图 · 图3 能耗曲线示意。',
        tool: {
          name: 'list_needed_figures',
          preview: 'figures=3 · types=[框图,流程,曲线]',
        },
      },
      {
        id: 'sketch',
        label: '草图占位',
        script:
          '【附图】已生成 mock 草图资产 fig-mock-01（SVG 占位）。版本 v1 待挂章。',
        tool: {
          name: 'mock_sketch',
          preview: 'assetId=fig-mock-01 · format=svg-placeholder',
        },
      },
      {
        id: 'attach',
        label: '挂章确认',
        script:
          '【附图】请确认将附图挂到交底/权利要求章节（事件示意，非真 doc revision）。',
        triggersHitl: true,
        hitlGate: 'approve_strategy',
        tool: {
          name: 'attach_chapter_event',
          preview: 'event=attach_figure · target=disclosure_pack|draft_claims',
        },
      },
    ],
    hitlGates: ['approve_strategy'],
    domainCommandCandidates: [
      {
        command: null,
        label: '默认事件挂章',
        note: 'Confirm 只记挂章事件；真写文档 revision 对齐 doc-harness 另刀',
      },
    ],
    guardrails: [
      '挂章≠真写入文档库',
      '草图为 mock 资产',
      '输出非制图终稿',
    ],
    catalogAgentId: 'agent-claims',
    accent: 'rose',
  },

  'expert-fto': {
    id: 'expert-fto',
    name: '自由实施专家',
    role: 'expert',
    specialty: '自由实施风险 · 五步分析',
    description:
      '特征→命中→矩阵→风险分级→报告 Confirm。强调自由实施风险；默认不写案、禁假装法律入库。',
    tools: [
      'extract_fto_features',
      'fto_hit_scan',
      'build_risk_matrix',
      'draft_fto_risk_card',
      'draft_fto_report',
    ],
    shortcuts: [
      { id: 'features', label: '抽特征', action: 'jump', stepId: 'features' },
      { id: 'matrix', label: '风险矩阵', action: 'jump', stepId: 'matrix' },
      { id: 'risk', label: '风险卡片', action: 'jump', stepId: 'risk' },
      { id: 'report-orch', label: '回报总控/项目', action: 'report' },
    ],
    steps: [
      {
        id: 'features',
        label: '特征',
        script:
          '【自由实施】已抽取产品特征 6 项（边缘节点 · 调度策略 · 能耗频率…）。聚焦自由实施风险，非新颖性结论。',
        tool: {
          name: 'extract_fto_features',
          preview: 'features=6 · product_scope=边缘调度模组',
        },
      },
      {
        id: 'hits',
        label: '命中',
        script:
          '【自由实施】障碍专利候选 4 件。高相关：CN114882901A（权利要求 1 覆盖调度步骤）。',
        tool: {
          name: 'fto_hit_scan',
          preview: 'obstacle_candidates=4 · jurisdictions=CN,US',
        },
      },
      {
        id: 'matrix',
        label: '矩阵',
        script:
          '【自由实施】特征×专利矩阵已填：2 红 / 1 黄 / 3 绿。红格=可能落入独立权利要求。',
        tool: {
          name: 'build_risk_matrix',
          preview: 'red=2 · amber=1 · green=3',
        },
      },
      {
        id: 'risk',
        label: '风险分级',
        script:
          '【自由实施】风险卡片：高——调度步骤可能落入 CN114… 权1；建议设计规避或许可路径（示意，非法律意见）。',
        tool: {
          name: 'draft_fto_risk_card',
          preview: 'severity=high · theme=自由实施风险',
        },
      },
      {
        id: 'report',
        label: '报告确认',
        script:
          '【自由实施】自由实施报告草稿在内存。请确认报告口径（批准策略）；默认不写案、不假装法律入库。',
        triggersHitl: true,
        hitlGate: 'approve_strategy',
        tool: {
          name: 'draft_fto_report',
          preview: 'in_memory_only=true · legal_opinion=false',
        },
      },
    ],
    hitlGates: ['approve_strategy'],
    domainCommandCandidates: [
      {
        command: null,
        label: '默认不写案',
        note: '报告草稿仅内存；Confirm 只确认口径，不 dispatch 写库',
      },
    ],
    guardrails: [
      '输出非法律意见',
      '禁假装自由实施结论入库',
      '强调自由实施风险而非可专利性',
    ],
    catalogAgentId: 'agent-research',
    accent: 'amber',
  },

  'expert-filing': {
    id: 'expert-filing',
    name: '递交形式专家',
    role: 'expert',
    specialty: '齐套/形式 · 授权递交闸',
    description:
      '国别/文件齐套/形式审查点→假递交清单→Confirm。对齐 authorize/file 闸示意；禁真递交。',
    tools: [
      'check_jurisdiction',
      'filing_checklist',
      'formality_scan',
      'propose_authorize_file',
    ],
    shortcuts: [
      { id: 'country', label: '国别齐套', action: 'jump', stepId: 'jurisdiction' },
      { id: 'checklist', label: '递交清单', action: 'jump', stepId: 'checklist' },
      { id: 'formality', label: '形式审查点', action: 'jump', stepId: 'formality' },
      { id: 'report-orch', label: '回报总控/项目', action: 'report' },
    ],
    steps: [
      {
        id: 'jurisdiction',
        label: '国别',
        script:
          '【递交】目标国别：CN 发明先递 · US provisional 占位。已核对官费档位（样机）。',
        tool: {
          name: 'check_jurisdiction',
          preview: 'CN=first-file · US=provisional-placeholder',
        },
      },
      {
        id: 'checklist',
        label: '齐套清单',
        script:
          '【递交】假递交清单：请求书 · 说明书 · 权利要求 · 摘要 · 附图。齐套 4/5（附图待挂）。',
        tool: {
          name: 'filing_checklist',
          preview: 'ready=4/5 · missing=附图定稿',
        },
      },
      {
        id: 'formality',
        label: '形式审查点',
        script:
          '【递交】形式审查点：页眉案号缺失 · 权项编号连续。样机仅提示，不真递交。',
        tool: {
          name: 'formality_scan',
          preview: 'issues=2 · severity=warn',
        },
      },
      {
        id: 'authorize',
        label: '授权递交确认',
        script:
          '【递交】请确认授权递交意图（authorize_file）。样机只记闸示意，禁真递交/真官费。',
        triggersHitl: true,
        hitlGate: 'authorize_file',
        tool: {
          name: 'propose_authorize_file',
          preview: 'gate=authorize_file · real_file=false',
        },
      },
    ],
    hitlGates: ['authorize_file'],
    domainCommandCandidates: [
      {
        command: 'authorizeFile',
        label: '授权递交提案',
        note: 'HITL 后示意 · 禁真递交',
      },
      {
        command: 'fileResponse',
        label: '递交归档示意',
        note: '仅闸过且 Confirm · 样机内存',
      },
    ],
    guardrails: [
      '禁真递交',
      'authorize≠已提交官方',
      '齐套未满禁用授权',
    ],
    catalogAgentId: 'agent-claims',
    accent: 'orange',
  },

  'expert-oa': {
    id: 'expert-oa',
    name: 'OA答复专家',
    role: 'expert',
    specialty: '审查意见答复 · prosecution',
    description:
      '假审查意见→争辩/修改/证据策略→Confirm。产出 prosecution_response；无真 OA。',
    tools: [
      'parse_oa_notice',
      'oa_strategy',
      'draft_amendments',
      'draft_oa_response',
    ],
    shortcuts: [
      { id: 'notice', label: '读审查意见', action: 'jump', stepId: 'notice' },
      { id: 'strategy', label: '答复策略', action: 'jump', stepId: 'strategy' },
      { id: 'draft', label: '起草答复', action: 'jump', stepId: 'draft' },
      { id: 'report-orch', label: '回报总控/项目', action: 'report' },
    ],
    steps: [
      {
        id: 'notice',
        label: '审查意见',
        script:
          '【OA】假一通：权1 相对 CN114… 缺乏创造性；权3 不清楚。已标争点。',
        tool: {
          name: 'parse_oa_notice',
          preview: 'office=CNIPA · type=一通 · articles=22.3,26.4',
        },
      },
      {
        id: 'strategy',
        label: '答复策略',
        script:
          '【OA】策略：争辩区别特征「能耗约束频率」+ 修改权1 缩限 + 补对比实验证据提纲。',
        tool: {
          name: 'oa_strategy',
          preview: 'argue=1 · amend=1 · evidence=outline',
        },
      },
      {
        id: 'draft',
        label: '答复草稿',
        script:
          '【OA】假答复草稿已出（争辩段 + 修改对照表）。handoff=prosecution_response。',
        tool: {
          name: 'draft_oa_response',
          preview: 'handoffKey=prosecution_response · pages≈6',
        },
      },
      {
        id: 'confirm',
        label: '答复确认',
        script:
          '【OA】请确认答复口径。批准后可 saveDraft / submitHandoff（答复）；无真提交官方。',
        triggersHitl: true,
        hitlGate: 'approve_strategy',
        tool: {
          name: 'draft_amendments',
          preview: 'claim1_amended=true · real_file=false',
        },
      },
    ],
    hitlGates: ['approve_strategy'],
    domainCommandCandidates: [
      {
        command: 'saveDraft',
        label: '保存答复草稿',
        note: 'HITL 后 · prosecution_response',
      },
      {
        command: 'submitHandoff',
        label: '提交答复交接',
        note: '批准策略后 · 禁真递交官方',
      },
    ],
    guardrails: [
      '无真 OA / 真提交',
      '输出非法律意见',
      '未 Confirm 不写库',
    ],
    catalogAgentId: 'agent-oa',
    accent: 'cyan',
  },
}

/** Weld order · agent-l3-patent §2 (afe94aa) */
export const PATENT_PROJECT_EXPERT_IDS: ProjectExpertId[] = [
  'orchestrator',
  'expert-search',
  'expert-mining',
  'expert-disclosure',
  'expert-draft',
  'expert-figure',
  'expert-fto',
  'expert-filing',
  'expert-oa',
]
