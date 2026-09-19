import type { ProjectExpertDef, ProjectExpertId } from './types'

/**
 * General project bots — research / write / review + orchestrator.
 * Independent mock scripts; NO patent DomainPack (no query→hits→basket / FTO 五步 / claims HITL).
 */
export type GeneralExpertId =
  | 'general-orchestrator'
  | 'general-research'
  | 'general-write'
  | 'general-review'

export const GENERAL_EXPERTS: Record<GeneralExpertId, ProjectExpertDef> = {
  'general-orchestrator': {
    id: 'general-orchestrator',
    name: '总控',
    role: 'orchestrator',
    specialty: '编排 · 分派 · 汇总',
    description:
      '通用项目总控：拆派研究 / 写作 / 审查，汇总回执。无专利写库权。',
    tools: ['dispatch_task', 'summarize_timeline', 'open_expert_dm'],
    shortcuts: [
      {
        id: 'dispatch-research',
        label: '分派给研究',
        action: 'dispatch_hint',
        hint: 'general-research',
      },
      {
        id: 'dispatch-write',
        label: '分派给写作',
        action: 'dispatch_hint',
        hint: 'general-write',
      },
      {
        id: 'dispatch-review',
        label: '分派给审查',
        action: 'dispatch_hint',
        hint: 'general-review',
      },
    ],
    steps: [
      {
        id: 'brief',
        label: '收目标',
        script:
          '【总控】已记下课题目标。请用「分派给研究/写作/审查」下发；我不会替专家跑专利领域剧本。',
      },
      {
        id: 'dispatch',
        label: '拆派',
        script:
          '【总控】拆派卡片已就绪。点快捷动作写入专家私聊与时间线。',
      },
      {
        id: 'await',
        label: '等回执',
        script: '【总控】等待专家「回报总控」。汇总只读时间线。',
      },
      {
        id: 'summarize',
        label: '汇总',
        script:
          '【总控】已汇总各专家回执。通用项目不会写入专利案件库。',
      },
    ],
    hitlGates: [],
    domainCommandCandidates: [
      {
        command: null,
        label: '无写库权',
        note: '通用总控仅拆派/汇总',
      },
    ],
    guardrails: ['禁止一键写库', '分派≠替专家执行', '无专利领域包流程'],
    catalogAgentId: null,
    accent: 'slate',
  },

  'general-research': {
    id: 'general-research',
    name: '研究',
    role: 'expert',
    specialty: '资料收集 · 要点提炼',
    description:
      '通用研究 bot：选题 → 收集 → 要点卡。非专利检索（无 query→hits→basket）。',
    tools: ['web_skim', 'note_cluster', 'outline_brief'],
    shortcuts: [
      { id: 'topic', label: '定选题', action: 'jump', stepId: 'topic' },
      { id: 'collect', label: '收集资料', action: 'jump', stepId: 'collect' },
      { id: 'points', label: '提炼要点', action: 'jump', stepId: 'points' },
      { id: 'report-orch', label: '回报总控', action: 'report' },
    ],
    steps: [
      {
        id: 'topic',
        label: '选题',
        script:
          '【研究】已收窄选题范围，列出 3 个可推进方向。',
        tool: { name: 'outline_brief', preview: 'topics=3 · focus=用户课题' },
      },
      {
        id: 'collect',
        label: '收集',
        script:
          '【研究】已 skim 公开资料 8 条，标注可信度与引用占位。',
        tool: { name: 'web_skim', preview: 'sources=8 · skim_only=true' },
      },
      {
        id: 'points',
        label: '要点',
        script:
          '【研究】要点卡：背景 / 争议点 / 待核事实。可回报总控。',
        tool: {
          name: 'note_cluster',
          preview: 'clusters=背景,争议,待核',
        },
      },
    ],
    hitlGates: [],
    domainCommandCandidates: [
      {
        command: null,
        label: '只读样机',
        note: '通用研究不绑专利 catalog / DomainCommand',
      },
    ],
    guardrails: [
      '输出非法律/专利结论',
      '禁假装写案',
      '与 expert-search 剧本隔离',
    ],
    catalogAgentId: null,
    accent: 'emerald',
  },

  'general-write': {
    id: 'general-write',
    name: '写作',
    role: 'expert',
    specialty: '大纲 · 草稿 · 润色',
    description:
      '通用写作 bot：大纲 → 草稿 → 润色。无权利要求或交底专项流程。',
    tools: ['draft_outline', 'expand_section', 'polish_tone'],
    shortcuts: [
      { id: 'outline', label: '写大纲', action: 'jump', stepId: 'outline' },
      { id: 'draft', label: '扩草稿', action: 'jump', stepId: 'draft' },
      { id: 'polish', label: '润色', action: 'jump', stepId: 'polish' },
      { id: 'report-orch', label: '回报总控', action: 'report' },
    ],
    steps: [
      {
        id: 'outline',
        label: '大纲',
        script:
          '【写作】已生成三级大纲（引言 / 主体 / 收束）。',
        tool: { name: 'draft_outline', preview: 'sections=3 · depth=2' },
      },
      {
        id: 'draft',
        label: '草稿',
        script:
          '【写作】主体段落已扩写为可读草稿（示意字数 ~800）。',
        tool: {
          name: 'expand_section',
          preview: 'chars≈800 · tone=neutral',
        },
      },
      {
        id: 'polish',
        label: '润色',
        script:
          '【写作】已压短冗余句、统一术语。可回报总控。',
        tool: {
          name: 'polish_tone',
          preview: 'pass=clarity · no_domain_write',
        },
      },
    ],
    hitlGates: [],
    domainCommandCandidates: [
      {
        command: null,
        label: '无写库',
        note: '通用写作不绑 agent-claims / 权利要求闸',
      },
    ],
    guardrails: ['无专利交底闸', '禁假装递交', '与 expert-draft 剧本隔离'],
    catalogAgentId: null,
    accent: 'indigo',
  },

  'general-review': {
    id: 'general-review',
    name: '审查',
    role: 'expert',
    specialty: '一致性 · 风险提示 · 清单',
    description:
      '通用审查 bot：通读 → 问题清单 → 弱确认。无自由实施五步或专利风险矩阵。',
    tools: ['lint_consistency', 'risk_checklist', 'suggest_fix'],
    shortcuts: [
      { id: 'read', label: '通读', action: 'jump', stepId: 'read' },
      { id: 'issues', label: '问题清单', action: 'jump', stepId: 'issues' },
      { id: 'ack', label: '弱确认', action: 'jump', stepId: 'ack' },
      { id: 'report-orch', label: '回报总控', action: 'report' },
    ],
    steps: [
      {
        id: 'read',
        label: '通读',
        script:
          '【审查】已通读当前材料，标记模糊表述 4 处。',
        tool: { name: 'lint_consistency', preview: 'flags=4 · scope=draft' },
      },
      {
        id: 'issues',
        label: '清单',
        script:
          '【审查】问题清单：事实待核×2 · 口径不一×1 · 缺引用×1。非专利自由实施矩阵。',
        tool: {
          name: 'risk_checklist',
          preview: 'items=4 · 非自由实施包',
        },
      },
      {
        id: 'ack',
        label: '弱确认',
        script:
          '【审查】请本地确认「已阅问题清单」（不写入案件指令）。',
        triggersHitl: true,
        hitlGate: 'approve_strategy',
        tool: {
          name: 'suggest_fix',
          preview: 'local_ack_only=true',
        },
      },
    ],
    hitlGates: ['approve_strategy'],
    domainCommandCandidates: [
      {
        command: null,
        label: '本地弱确认',
        note: 'catalogAgentId=null；Confirm 仅 UI ack，不走专利写库',
      },
    ],
    guardrails: [
      '无自由实施专项流程',
      '弱确认不写库',
      '与 expert-fto 剧本隔离',
    ],
    catalogAgentId: null,
    accent: 'rose',
  },
}

export const GENERAL_PROJECT_EXPERT_IDS: ProjectExpertId[] = [
  'general-orchestrator',
  'general-research',
  'general-write',
  'general-review',
]
