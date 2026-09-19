import type { ProjectExpertDef, ProjectExpertId } from './types'

/**
 * Patent DomainPack experts — search / draft / FTO + orchestrator.
 * Do NOT import into general projects.
 */
export type PatentExpertId =
  | 'orchestrator'
  | 'expert-search'
  | 'expert-draft'
  | 'expert-fto'
  | 'expert-mining'
  | 'expert-figure'

export const PATENT_EXPERTS: Record<PatentExpertId, ProjectExpertDef> = {
  orchestrator: {
    id: 'orchestrator',
    name: '总控席',
    role: 'orchestrator',
    specialty: '编排 · 分派 · 汇总',
    description:
      '只拆派任务与汇总专家回执；禁止直接改 handoff / 写案。深链可打开各专家私聊。',
    tools: ['dispatch_task', 'summarize_timeline', 'open_expert_dm'],
    shortcuts: [
      {
        id: 'dispatch-search',
        label: '分派给检索',
        action: 'dispatch_hint',
        hint: 'expert-search',
      },
      {
        id: 'dispatch-draft',
        label: '分派给撰稿',
        action: 'dispatch_hint',
        hint: 'expert-draft',
      },
      {
        id: 'dispatch-fto',
        label: '分派给自由实施',
        action: 'dispatch_hint',
        hint: 'expert-fto',
      },
      {
        id: 'dispatch-mining',
        label: '分派给挖掘',
        action: 'dispatch_hint',
        hint: 'expert-mining',
      },
      {
        id: 'dispatch-figure',
        label: '分派给附图',
        action: 'dispatch_hint',
        hint: 'expert-figure',
      },
    ],
    steps: [
      {
        id: 'brief',
        label: '收目标',
        script:
          '【总控】已记下项目目标。请用下方「分派给…」把任务交给检索 / 撰稿 / 自由实施 / 挖掘 / 附图；或点「演示 L3」走撰稿 Confirm→写库示意。我不会替专家跑领域剧本。',
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
          preview: 'basket=5 · novelty_gap=能耗约束动态阈值',
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

  'expert-draft': {
    id: 'expert-draft',
    name: '撰稿专家',
    role: 'expert',
    specialty: '交底/权利要求 · 递交闸',
    description:
      '按撰稿主路径：章节草稿 → 修订 → 确认（批准策略 + 授权递交）。',
    tools: [
      'draft_claims',
      'expand_dependent',
      'check_support',
      'country_strategy',
    ],
    shortcuts: [
      { id: 'draft-ch', label: '生成章节', action: 'jump', stepId: 'chapter' },
      { id: 'revise', label: '修订建议', action: 'jump', stepId: 'revise' },
      { id: 'confirm-sub', label: '提请确认', action: 'jump', stepId: 'confirm' },
      { id: 'report-orch', label: '回报总控/项目', action: 'report' },
    ],
    steps: [
      {
        id: 'chapter',
        label: '章节草稿',
        script:
          '【撰稿】已起草独权 1 条 + 从权 3 条骨架；说明书支持点已标注。',
        tool: {
          name: 'draft_claims',
          preview: 'independent=1 · dependent=3 · support_check=pending',
        },
      },
      {
        id: 'revise',
        label: '修订建议',
        script:
          '【撰稿】建议缩限「动态阈值」特征表述，并补实施例对照表。已生成修订建议卡。',
        tool: {
          name: 'check_support',
          preview: 'support_gaps=2 · country=CN/US',
        },
      },
      {
        id: 'confirm',
        label: '策略批准',
        script:
          '【撰稿】权利要求策略待你批准。批准后仍须「授权递交」才可递交意图。',
        triggersHitl: true,
        hitlGate: 'approve_strategy',
      },
      {
        id: 'authorize',
        label: '授权递交',
        script:
          '【撰稿】策略已过；现请求授权递交。递交前齐套检查清单须勾选。',
        triggersHitl: true,
        hitlGate: 'authorize_file',
        tool: {
          name: 'country_strategy',
          preview: 'CN first-file · US provisional placeholder',
        },
      },
    ],
    hitlGates: ['approve_strategy', 'authorize_file'],
    domainCommandCandidates: [
      {
        command: 'saveDraft',
        label: '保存草稿',
        note: '确认后 · 不跳闸',
      },
      {
        command: 'submitHandoff',
        label: '提交交接',
        note: '批准策略后候选',
      },
    ],
    guardrails: [
      '交底未批准禁用批准/授权',
      '授权前齐套检查',
      '输出非律师意见',
    ],
    catalogAgentId: 'agent-claims',
    accent: 'violet',
  },

  'expert-fto': {
    id: 'expert-fto',
    name: '自由实施专家',
    role: 'expert',
    specialty: '自由实施风险 · 五步分析',
    description:
      '特征→命中→矩阵→风险→报告 Confirm。强调自由实施风险；默认不写案、禁假装法律入库。',
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
          '【自由实施】已抽取产品特征 6 项（边缘节点 · 调度策略 · 能耗阈值…）。聚焦自由实施风险，非新颖性结论。',
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
        label: '风险',
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
  'expert-mining': {
    id: 'expert-mining',
    name: '挖掘专家',
    role: 'expert',
    specialty: '发明点挖掘 · 立项前',
    description:
      '交底→发明点→评分→送立项占位。可链 intake_quote；建案须 HITL（createCaseFromInsight）。',
    tools: [
      'parse_disclosure',
      'extract_invention_points',
      'score_invention',
      'propose_intake',
    ],
    shortcuts: [
      { id: 'disclosure', label: '读交底', action: 'jump', stepId: 'disclosure' },
      { id: 'points', label: '抽发明点', action: 'jump', stepId: 'points' },
      { id: 'score', label: '评分', action: 'jump', stepId: 'score' },
      { id: 'report-orch', label: '回报总控/项目', action: 'report' },
    ],
    steps: [
      {
        id: 'disclosure',
        label: '交底',
        script:
          '【挖掘】已解析交底要点：边缘调度模组 · 动态频率 · 能耗约束。下一步抽取发明点。',
        tool: {
          name: 'parse_disclosure',
          preview: 'sections=背景/方案/效果 · tokens≈1200',
        },
      },
      {
        id: 'points',
        label: '发明点',
        script:
          '【挖掘】候选发明点 3 条：①负载预测调度 ②能耗约束频率 ③边缘节点热迁移。',
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

  'expert-figure': {
    id: 'expert-figure',
    name: '附图专家',
    role: 'expert',
    specialty: '附图草图 · 挂章事件',
    description:
      '上下文→mock 草图→画布占位→版本→挂文档章事件。默认不写 handoff；真挂 doc 另刀。',
    tools: [
      'gather_figure_context',
      'mock_sketch',
      'canvas_placeholder',
      'version_figure',
      'attach_chapter_event',
    ],
    shortcuts: [
      { id: 'context', label: '收上下文', action: 'jump', stepId: 'context' },
      { id: 'sketch', label: '出草图', action: 'jump', stepId: 'sketch' },
      { id: 'attach', label: '挂章事件', action: 'jump', stepId: 'attach' },
      { id: 'report-orch', label: '回报总控/项目', action: 'report' },
    ],
    steps: [
      {
        id: 'context',
        label: '上下文',
        script:
          '【附图】已收集说明书图号需求：图1系统架构 · 图2调度时序 · 图3能耗曲线。',
        tool: {
          name: 'gather_figure_context',
          preview: 'figures=3 · linked=disclosure_pack',
        },
      },
      {
        id: 'sketch',
        label: '草图',
        script:
          '【附图】已生成 mock 草图资产 fig-mock-01（SVG 占位）。可进画布编辑占位。',
        tool: {
          name: 'mock_sketch',
          preview: 'assetId=fig-mock-01 · format=svg-placeholder',
        },
      },
      {
        id: 'canvas',
        label: '画布',
        script:
          '【附图】画布编辑占位已打开（样机无真编辑器）。版本 v1 待挂章。',
        tool: {
          name: 'canvas_placeholder',
          preview: 'editor=mock · version=v1',
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
}

export const PATENT_PROJECT_EXPERT_IDS: ProjectExpertId[] = [
  'orchestrator',
  'expert-search',
  'expert-draft',
  'expert-fto',
  'expert-mining',
  'expert-figure',
]
