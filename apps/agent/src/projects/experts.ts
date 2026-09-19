import type { ProjectExpertDef, ProjectExpertId } from './types'

/**
 * Project-folder experts — each has distinct tools / steps / HITL / DomainCommand candidates.
 * Form like Grok Bot sidebar; logic is NOT a shared chat script.
 */
export const PROJECT_EXPERTS: Record<ProjectExpertId, ProjectExpertDef> = {
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
        label: '分派给 FTO',
        action: 'dispatch_hint',
        hint: 'expert-fto',
      },
    ],
    steps: [
      {
        id: 'brief',
        label: '收目标',
        script:
          '【总控·mock】已记下项目目标。请用下方「分派给…」把任务交给检索 / 撰稿 / FTO；我不会替专家跑领域剧本。',
      },
      {
        id: 'dispatch',
        label: '拆派',
        script:
          '【总控·mock】拆派卡片已就绪。点快捷动作即可写入专家私聊与项目时间线。backend=mock',
      },
      {
        id: 'await',
        label: '等回执',
        script:
          '【总控·mock】等待专家「回报总控/项目」。汇总只读时间线，不绕过专家闸写库。',
      },
      {
        id: 'summarize',
        label: '汇总',
        script:
          '【总控·mock】已汇总各专家回执到项目时间线。写库仍须对应专家 HITL Confirm → DomainCommand。',
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
      '对齐 agent-research：布尔检索 → 命中 → 工作篮；通常只读，策略确认可走 approve_strategy。',
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
          '【检索·mock】已扩展关键词：边缘调度 / 负载预测 / 能耗约束。下一步调用 commercial_patent_search。backend=mock',
        tool: {
          name: 'commercial_patent_search',
          preview: 'query=(边缘计算 OR edge) AND (调度) AND (负载预测) · limit=20',
        },
      },
      {
        id: 'hits',
        label: '命中',
        script:
          '【检索·mock】命中 12 件。Top3：CN114882901A（0.86）· US20230123456A1（0.81）· CN115001234A（0.77）。可核验 pubNo+url。',
        tool: {
          name: 'cluster_hits',
          preview: 'clusters=3 · labels=[调度,能耗,负载预测]',
        },
      },
      {
        id: 'basket',
        label: '工作篮',
        script:
          '【检索·mock】已将 Top5 放入工作篮（只读样机）。可选送 FTO/挖掘占位，不写案。',
        tool: {
          name: 'bind_novelty',
          preview: 'basket=5 · novelty_gap=能耗约束动态阈值',
        },
      },
      {
        id: 'strategy',
        label: '策略确认',
        script:
          '【检索·mock】请确认检索策略是否批准（HITL approve_strategy）。本专家默认只读；无 case 时不假装入库。',
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
        note: '仅 HITL Confirm 后 · actor=agent',
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
      '对齐 agent-claims：章节草稿 → 修订 → Confirm（approve_strategy + authorize_file）。',
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
          '【撰稿·mock】已起草独权 1 条 + 从权 3 条骨架；说明书支持点已标注。backend=mock',
        tool: {
          name: 'draft_claims',
          preview: 'independent=1 · dependent=3 · support_check=pending',
        },
      },
      {
        id: 'revise',
        label: '修订建议',
        script:
          '【撰稿·mock】建议缩限「动态阈值」特征表述，并补实施例对照表。已生成修订建议卡。',
        tool: {
          name: 'check_support',
          preview: 'support_gaps=2 · country=CN/US',
        },
      },
      {
        id: 'confirm',
        label: '策略批准',
        script:
          '【撰稿·mock】权利要求策略待你批准（approve_strategy）。批准后仍须 authorize_file 才可递交意图。',
        triggersHitl: true,
        hitlGate: 'approve_strategy',
      },
      {
        id: 'authorize',
        label: '授权递交',
        script:
          '【撰稿·mock】策略已过；现请求授权递交（authorize_file）。Full-check 样机清单须勾选。',
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
        note: 'HITL 后 · 不跳闸',
      },
      {
        command: 'submitHandoff',
        label: '提交交接',
        note: 'approve_strategy 后候选',
      },
    ],
    guardrails: [
      '交底未批准禁用批准/授权',
      '授权前 Full-check',
      '输出非律师意见',
    ],
    catalogAgentId: 'agent-claims',
    accent: 'violet',
  },

  'expert-fto': {
    id: 'expert-fto',
    name: 'FTO 专家',
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
          '【FTO·mock】已抽取产品特征 6 项（边缘节点 · 调度策略 · 能耗阈值…）。聚焦自由实施风险，非新颖性结论。backend=mock',
        tool: {
          name: 'extract_fto_features',
          preview: 'features=6 · product_scope=边缘调度模组',
        },
      },
      {
        id: 'hits',
        label: '命中',
        script:
          '【FTO·mock】障碍专利候选 4 件。高相关：CN114882901A（权利要求 1 覆盖调度步骤）。',
        tool: {
          name: 'fto_hit_scan',
          preview: 'obstacle_candidates=4 · jurisdictions=CN,US',
        },
      },
      {
        id: 'matrix',
        label: '矩阵',
        script:
          '【FTO·mock】特征×专利矩阵已填：2 红 / 1 黄 / 3 绿。红格=可能落入独立权利要求。',
        tool: {
          name: 'build_risk_matrix',
          preview: 'red=2 · amber=1 · green=3',
        },
      },
      {
        id: 'risk',
        label: '风险',
        script:
          '【FTO·mock】风险卡片：高——调度步骤可能落入 CN114… 权1；建议设计规避或许可路径（示意，非法律意见）。',
        tool: {
          name: 'draft_fto_risk_card',
          preview: 'severity=high · theme=自由实施风险',
        },
      },
      {
        id: 'report',
        label: '报告确认',
        script:
          '【FTO·mock】FTO 报告草稿在内存。请 Confirm approve_strategy 仅确认报告口径；默认不写案、禁假装法律入库。',
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
      '禁假装 FTO 结论入库',
      '强调自由实施风险而非可专利性',
    ],
    catalogAgentId: 'agent-research',
    accent: 'amber',
  },
}

export const DEFAULT_PROJECT_EXPERT_IDS: ProjectExpertId[] = [
  'orchestrator',
  'expert-search',
  'expert-draft',
  'expert-fto',
]

export function getProjectExpert(id: ProjectExpertId): ProjectExpertDef {
  return PROJECT_EXPERTS[id]
}

export function expertAccentClass(accent: string): string {
  switch (accent) {
    case 'sky':
      return 'bg-sky-100 text-sky-800 border-sky-200'
    case 'violet':
      return 'bg-violet-100 text-violet-800 border-violet-200'
    case 'amber':
      return 'bg-amber-100 text-amber-900 border-amber-200'
    default:
      return 'bg-slate-100 text-slate-700 border-slate-200'
  }
}
