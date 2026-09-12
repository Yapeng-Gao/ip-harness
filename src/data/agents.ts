import type {
  AgentDef,
  AgentStep,
  AgentArtifactDoc,
  AgentRun,
  AgentTier,
  HandoffArtifactKey,
  HandoffStatus,
  StageId,
} from '../types'
import type { WorkspaceKind } from './workspaces'

/** HITL / tier short labels — single source @ip/domain (Phase 1) */
import { HITL_GATE_LABELS, AGENT_TIER_SHORT } from '../../packages/domain/src/agentLabels'
export { HITL_GATE_LABELS, AGENT_TIER_SHORT }

/** Catalog Core / Assist / Beta — platform maturity (Wave3) */
export const AGENT_TIER_LABEL: Record<AgentTier, string> = {
  core: 'Core',
  assist: 'Assist',
  beta: 'Beta',
}

export const AGENT_TIER_ORDER: AgentTier[] = ['core', 'assist', 'beta']

/** Fixed honest copy for Beta cards/details */
export const BETA_HONEST_COPY = 'Beta·非采购闭环'

export function agentTierNote(a: Pick<AgentDef, 'tier' | 'tierNote'>): string {
  if (a.tierNote?.trim()) return a.tierNote.trim()
  return AGENT_TIER_SHORT[a.tier]
}

/** UI：Beta/Assist 启动前确认；Core 直接 true */
export function confirmNonCoreTier(
  agent: Pick<AgentDef, 'name' | 'tier' | 'tierNote'>,
): boolean {
  if (agent.tier === 'core') return true
  const tierBit =
    agent.tier === 'beta'
      ? BETA_HONEST_COPY
      : `${AGENT_TIER_LABEL.assist}·${AGENT_TIER_SHORT.assist}`
  const extra = agent.tierNote?.trim() ? `（${agent.tierNote.trim()}）` : ''
  return window.confirm(
    `${agent.name} 为 ${tierBit}${extra}。勿当作主办理采购闭环。仍要继续？`,
  )
}


export const AGENT_CATALOG: AgentDef[] = [
  {
    id: 'agent-research',
    name: '调研检索 Agent',
    specialty: '立项前调研 · 现有技术检索',
    stage: 'pre_research',
    tools: ['commercial_patent_search', 'cluster_hits', 'draft_research_report', 'bind_novelty'],
    status: 'active',
    description: '围绕技术方案发起商业库检索，聚类对比文献并输出可专利性结论草稿。',
    capabilities: ['关键词扩展', '商业 API 检索', '命中聚类', '新颖性差距标注', '调研报告草稿'],
    handoffKey: 'research_report',
    workbenchPath: '/workbench/research',
    systemPromptBrief:
      '你是调研检索专家。根据技术方案扩展关键词、调用商业库检索、聚类对比文献，输出可专利性结论草稿；关键策略须经你批准后才能提交企业。',
    hitlGates: ['approve_strategy'],
    raciHint: 'R：代理检索员 · A：企业 IP 经理',
    whenToUse: '立项前或补强前需要现有技术检索、可专利性与 FTO 初评草稿时',
    inputsHint: '技术方案摘要、关键词、可选对比文献偏好、目标国别',
    guardrails: [
      '禁止空命中过闸',
      '命中须可核验 pubNo+url',
      '策略须 HITL 批准后提交企业',
      '输出非法律意见',
    ],
    outputsHint: '调研报告草稿 · 可专利性倾向 · FTO 初评要点 · 可选 claim_chart 草稿',
    tier: 'core',
  },
  {
    id: 'agent-disclosure',
    name: '交底整理 Agent',
    specialty: '发明交底 · 结构化技术披露',
    stage: 'decision',
    tools: ['structure_disclosure', 'extract_features', 'prior_art_lite', 'flag_gaps'],
    status: 'active',
    description:
      '将发明人原始交底整理为可撰写用的结构化技术披露：类型、问题/方案/效果、特征、实施例、1.1 现有技术与缺口，交接至撰写。',
    capabilities: [
      '专利类型确认',
      '交底结构化',
      '必要特征抽取',
      '轻量查新（示意）',
      '缺口标注（阻塞/非阻塞）',
      '撰写就绪清单',
    ],
    handoffKey: 'disclosure_pack',
    workbenchPath: '/inventor',
    systemPromptBrief:
      '你是交底整理专家。对齐 disclosure_pack 齐套字段：专利类型（默认发明）、问题/方案/效果、必要技术特征、实施例、1.1 现有技术（须可核验 pubNo+title+url，禁止编造凑条）、缺口（区分 blocking/non_blocking）。禁止空材料装完成；批准前须齐套。交底交接使用 disclosure_pack，不改立项报价 intake_quote。不把 8 步交底工序做成第二套办理 UI。',
    hitlGates: ['approve_strategy'],
    raciHint: 'R：发明人 / IP 协调 · A：企业 IP 经理',
    whenToUse: '发明人原始交底需整理为可撰写的结构化披露包时',
    inputsHint: '发明人叙述、技术主题、专利类型（默认发明）、联系人',
    guardrails: [
      '批准前须齐套六项',
      '1.1 禁编造凑条',
      '禁止空材料装完成',
      '交接用 disclosure_pack',
    ],
    outputsHint: '结构化技术披露（问题/方案/效果/特征/实施例/1.1/缺口）',
    tier: 'core',
  },
  {
    id: 'agent-intake',
    name: '立项评估 Agent',
    specialty: '立项决策 · 报价与范围',
    stage: 'decision',
    tools: ['score_patentability', 'estimate_quote', 'draft_intake_memo'],
    status: 'active',
    description: '综合检索结论与商业目标，生成立项建议与报价草案，供企业确认。',
    capabilities: ['可专利性评分', '预算估算', '委托范围草案', '确认清单对齐'],
    handoffKey: 'intake_quote',
    workbenchPath: '/workbench/intake',
    systemPromptBrief:
      '你是立项评估专家。综合检索与商业目标给出立项决定建议与报价草案；必须经过立项确认与报价确认后方可进入委托。',
    hitlGates: ['go_nogo', 'confirm_quote'],
    raciHint: 'R：企业 IP · A：业务负责人 / 预算审批人',
    whenToUse: '检索结论已备、需立项 Go/No-Go 与报价确认时',
    inputsHint: '调研结论、预算口径、委托模式（自助/派所）、交底包摘要',
    guardrails: [
      '须过立项 Go 与确认报价双闸',
      '不与交底包混用交接键',
      '报价变更须重新确认',
    ],
    outputsHint: '立项评估备忘 · 报价草案 · 委托范围',
    tier: 'core',
  },
  {
    id: 'agent-claims',
    name: '权利要求撰写 Agent',
    specialty: '撰写申请 · 权利要求',
    stage: 'drafting',
    tools: ['draft_claims', 'expand_dependent', 'check_support', 'country_strategy'],
    status: 'active',
    description: '基于交底与检索结果起草独权/从权树，并给出国别布局建议。',
    capabilities: ['独权起草', '从权扩展', '说明书支持检查', '国别策略'],
    handoffKey: 'draft_claims',
    workbenchPath: '/workbench/draft',
    systemPromptBrief:
      '你是权利要求撰写专家。基于已批准的 disclosure_pack 与检索结果起草独权/从权树并检查说明书支持；绑案时若交底包未批准/授权则禁用批准与授权递交。权利要求策略须经你批准，递交须再经授权确认（对齐撰写台）。',
    hitlGates: ['approve_strategy', 'authorize_file'],
    raciHint: 'R：代理人 · A：企业 IP / 发明人确认（授权递交）',
    whenToUse: '交底包已批准、需起草独权/从权并准备递交时',
    inputsHint: '已批准 disclosure_pack、检索结论、国别策略偏好',
    guardrails: [
      '交底未批准禁用批准/授权',
      '授权/file 前须 Full-check（五清单+轻量勾选+非法律意见戳）',
      '输出非律师意见',
    ],
    outputsHint: '权利要求草稿 · 国别策略要点 · 递交检查齐套态',
    tier: 'core',
  },
  {
    id: 'agent-oa',
    name: 'OA 答复 Agent',
    specialty: '审查答复 · 争点策略',
    stage: 'prosecution',
    tools: ['analyze_oa', 'propose_amendments', 'draft_opinion', 'write_docket_event'],
    status: 'active',
    description: '解析 OA 争点，提出缩限/争辩策略，生成意见陈述与修改对照草稿。',
    capabilities: ['OA 争点拆解', '修改建议', '意见陈述草稿', '期限回写'],
    handoffKey: 'prosecution_response',
    workbenchPath: '/workbench/prosecution',
    systemPromptBrief:
      '你是 OA 答复专家。拆解审查意见争点，提出缩限或争辩策略并生成意见陈述草稿；Timeline/ConfirmBar 区分「答复草稿」与「已确认陈述」——未确认前授权/递交须提示。策略批准后，递交须再经你授权确认（受发票阻塞约束）。',
    hitlGates: ['approve_strategy', 'authorize_file'],
    raciHint: 'R：代理人 · A：企业 IP（授权递交）',
    whenToUse: '收到审查意见、需拆争点并生成答复策略与意见陈述时',
    inputsHint: 'OA 文本/争点、现行权项、对比文件、期限',
    guardrails: [
      '须先选争点类型并写策略要点再 HITL',
      '未确认陈述禁用授权',
      '授权/file 前 Full-check',
      '输出非法律意见',
    ],
    outputsHint: '争点清单 · 修改对照 · 意见陈述（草稿→已确认）',
    tier: 'core',
  },
  {
    id: 'agent-annuity',
    name: '年费与维持 Agent',
    specialty: '授权维持 · 年费计划',
    stage: 'maintenance',
    tools: ['list_annuity_schedule', 'estimate_official_fees', 'write_docket_event'],
    status: 'active',
    description: '汇总年费窗口与官费预估，生成维持计划并写入期限台账。',
    capabilities: ['年费日历', '官费预估', '维持决策建议', '期限回写'],
    handoffKey: 'maintain_annuity',
    workbenchPath: '/workbench/maintain',
    systemPromptBrief:
      '你是年费维持专家。汇总年费窗口与官费预估，生成维持计划；涉及付款动作时须经你确认付款解锁。',
    hitlGates: ['pay_unlock'],
    raciHint: 'R：代理流程岗 · A：企业财务 / IP 预算',
    whenToUse: '授权后需汇总年费窗口、官费与维持/放弃价值分层时',
    inputsHint: '授权日、年费年度、未结发票、维持价值口径',
    guardrails: [
      '付款解锁仅企业',
      '禁静默假回执归档',
      '维持价值分层可选并写回 Drive/备注',
    ],
    outputsHint: '年费计划 · 官费预估 · Docket 回写预备',
    tier: 'core',
  },
  {
    id: 'agent-monetize',
    name: '转化条款 Agent',
    specialty: '运用转化 · 许可/转让',
    stage: 'commercialization',
    tools: ['draft_license_terms', 'benchmark_royalty', 'link_watch_alert'],
    status: 'beta',
    description: '起草许可/转让核心条款并对标费率（beta · 法务会签/合同状态在工作台审批交接，本 Agent 无法务会签闸）。',
    capabilities: ['条款骨架', '费率对标', '风险条款提示', '告警联动'],
    handoffKey: 'monetize_terms',
    workbenchPath: '/workbench/monetize',
    systemPromptBrief:
      '你是转化条款专家。按许可/转让场景起草核心条款并对标费率。本 Agent 为 beta：商务策略可经你批准，但法务会签与合同状态在工作台审批交接（/workbench/monetize），勿假装已完成合同 PDF 签署。',
    hitlGates: ['approve_strategy'],
    raciHint: 'R：商务 · A：企业决策人（法务会签在工作台，非本 Agent 闸）',
    whenToUse: '许可/转让商务条款起草（beta，非法务会签）时',
    inputsHint: '许可场景、地域、费率偏好、关联监控告警',
    guardrails: [
      'beta · 无法务会签闸',
      '批准≠合同 PDF/电子签',
      '法务审阅为薄状态',
    ],
    outputsHint: '许可/转让核心条款草稿 · 费率对标',
    tier: 'beta',
    tierNote: 'Beta·非采购闭环：无法务会签闸，批准≠合同 PDF/电子签',
  },
  {
    id: 'agent-watch',
    name: '监控预警 Agent',
    specialty: '案件监控 · 竞品预警',
    stage: 'monitoring',
    tools: ['scan_new_publications', 'score_threat', 'draft_watch_alert'],
    status: 'active',
    description: '扫描新公开与诉讼动态，输出威胁评级与处置建议（确认告警 / 升级维权 / 关闭，对齐监控台；非单一批准）。',
    capabilities: ['新公开扫描', '威胁评分', '告警草稿', '处置路径'],
    handoffKey: 'watch_alert',
    workbenchPath: '/workbench/watch',
    systemPromptBrief:
      '你是监控预警专家。扫描新公开与诉讼动态，输出威胁评级与处置建议。告警处置枚举对齐监控台：确认告警、升级维权、关闭（勿假装只有「批准」）。企业可升级+确认；代理可确认/提意见。完整规则与维权线索在工作台 /workbench/watch。',
    hitlGates: ['approve_strategy'],
    raciHint: 'R：监控分析岗 · A：企业 IP 经理（升级偏企业）',
    whenToUse: '需扫描新公开/竞品威胁并处置告警时',
    inputsHint: '监控关键词、竞品名单、规则阈值、关联案件',
    guardrails: [
      '处置枚举：确认/升级/关闭（非单一批准）',
      '告警台账仅企业批准完成后写库',
      '可写 claim_chart 草稿',
    ],
    outputsHint: '监控告警意见 · 威胁评级 · 处置路径 · 可选 claim_chart',
    tier: 'assist',
    tierNote: '辅助薄层：告警处置与 claim_chart 草稿；诉讼维权升级为长尾，非本 Agent 采购闭环',
  },
  {
    id: 'agent-layout',
    name: '布局洞察 Agent',
    specialty: '专利布局 · 空白点',
    stage: 'pre_research',
    tools: [
      'map_layout_matrix',
      'find_blank_spots',
      'suggest_filings',
      'create_case_from_insight',
      'assign_agency',
    ],
    status: 'beta',
    description: '基于赛道与产业链矩阵识别空白点，建议补强申请方向。',
    capabilities: ['布局矩阵', '空白点发现', '补强建议', '洞察回链'],
    handoffKey: 'layout_insight',
    workbenchPath: '/workbench/layout',
    systemPromptBrief:
      '你是布局洞察专家。交叉技术×场景矩阵识别空白点，建议补强申请方向；补强策略须经你批准后 CreateCaseFromInsight 建调研案并深链调研台（布局台 /workbench/layout 仍办源案 layout_insight）。交接使用 layout_insight，不占用 research_report。',
    hitlGates: ['approve_strategy'],
    raciHint: 'R：洞察分析 · A：企业 IP 战略',
    whenToUse: '赛道矩阵找空白、建议补强申请并洞察建案时',
    inputsHint: '赛道/产业链维度、已布局清单、竞品密度',
    guardrails: [
      '补强须批准后再 CreateCaseFromInsight',
      '交接用 layout_insight',
      '不占用 research_report',
    ],
    outputsHint: '布局洞察报告 · 空白点 · 补强建议',
    tier: 'beta',
    tierNote: 'Beta·非采购闭环：洞察矩阵/建案示意仍薄，勿当布局采购主路径',
  },
]

export function getAgent(id: string): AgentDef | undefined {
  return AGENT_CATALOG.find((a) => a.id === id)
}

/** Human default goal — no robotic 「请某某处理任务」 */
export function defaultSessionGoal(
  agent?: Pick<AgentDef, 'specialty' | 'name'> | null,
  opts?: { hasCase?: boolean },
): string {
  const prefix = opts?.hasCase ? '就当前案件启动' : '启动'
  if (agent?.specialty?.trim()) {
    return `${prefix}：${agent.specialty.trim()}`
  }
  return opts?.hasCase ? '就当前案件启动' : '启动当前 IP 任务'
}

/** Tool-scoped start goal for Skills page */
export function defaultToolSessionGoal(
  toolLabel: string,
  agent?: Pick<AgentDef, 'specialty' | 'name'> | null,
): string {
  if (agent?.specialty?.trim()) {
    return `启动：${agent.specialty.trim()}（${toolLabel}）`
  }
  return `启动：${toolLabel}`
}


export function handoffKeyForAgent(agentId: string): HandoffArtifactKey {
  return getAgent(agentId)?.handoffKey ?? 'research_report'
}

const STAGE_REASON_LABEL: Record<StageId, string> = {
  pre_research: '立项前调研',
  decision: '立项决策',
  drafting: '撰写申请',
  prosecution: '审查答复',
  maintenance: '授权维持',
  commercialization: '运用转化',
  monitoring: '监控维权',
}

const BY_STAGE: Partial<Record<StageId, string>> = {
  pre_research: 'agent-research',
  decision: 'agent-intake',
  drafting: 'agent-claims',
  prosecution: 'agent-oa',
  maintenance: 'agent-annuity',
  // commercialization：勿默认定 monetize(Beta) — 见 suggestAgent 诚实分支
  monitoring: 'agent-watch',
}

/** Agency prefers execution agents; enterprise prefers approve-heavy agents for same stage */
const RACI_STAGE_PREF: Record<
  WorkspaceKind,
  Partial<Record<StageId, string>>
> = {
  agency: {
    pre_research: 'agent-research',
    decision: 'agent-disclosure',
    drafting: 'agent-claims',
    prosecution: 'agent-oa',
    maintenance: 'agent-annuity',
    // commercialization：勿默认定 Beta monetize
    monitoring: 'agent-watch',
  },
  enterprise: {
    pre_research: 'agent-research', // Wave3: Core 主路径；勿默认 Beta layout
    decision: 'agent-intake',
    drafting: 'agent-claims',
    prosecution: 'agent-oa',
    maintenance: 'agent-annuity',
    // commercialization：勿默认定 Beta monetize
    monitoring: 'agent-watch',
  },
}

export interface SuggestAgentInput {
  stage?: StageId
  goal?: string
  workspaceKind?: WorkspaceKind
  /** Current handoff status for the stage artifact (if known) */
  handoffStatus?: HandoffStatus
  handoffKey?: string
}

export interface SuggestAgentResult {
  agent: AgentDef
  reason: string
  /** Beta/Assist：Auto 须 UI 确认或改荐 Core */
  requiresTierConfirm?: boolean
}

/**
 * Smarter Auto router: stage → handoff/HITL needs → RACI workspace → keywords.
 * Returns agent + Chinese reason for the session Auto banner.
 */
export function suggestAgent(input: SuggestAgentInput): SuggestAgentResult {
  const g = (input.goal ?? '').toLowerCase()
  const raw = input.goal ?? ''
  const stageLabel = input.stage ? STAGE_REASON_LABEL[input.stage] : undefined
  const hs = input.handoffStatus
  const kind = input.workspaceKind

  const pick = (
    id: string,
    reason: string,
    opts?: { requiresTierConfirm?: boolean },
  ): SuggestAgentResult => {
    const agent = getAgent(id) ?? getAgent('agent-research')!
    const nonCore = agent.tier === 'beta' || agent.tier === 'assist'
    return {
      agent,
      reason,
      requiresTierConfirm:
        opts?.requiresTierConfirm ?? (nonCore ? true : undefined),
    }
  }

  // 1) Strong handoff / open HITL needs (perceivable)
  if (
    input.stage === 'prosecution' &&
    (hs === 'approved' ||
      hs === 'enterprise_review' ||
      hs === 'submitted_to_enterprise' ||
      hs === 'authorized_to_file')
  ) {
    const hitlBit =
      hs === 'authorized_to_file'
        ? '交接待递交归档'
        : hs === 'approved'
          ? '交接待授权'
          : '交接待企业批准'
    return pick(
      'agent-oa',
      `因为案件处于${stageLabel ?? '审查答复'}且${hitlBit}`,
    )
  }
  if (
    input.stage === 'monitoring' &&
    (hs === 'submitted_to_enterprise' || hs === 'enterprise_review')
  ) {
    return pick(
      'agent-watch',
      `因为案件处于${stageLabel ?? '监控维权'}且告警交接待批准`,
    )
  }
  if (input.stage === 'commercialization') {
    // 诚实：无 Core 默认定；提示 Beta 或改走 Assist/工作台
    return pick(
      'agent-monetize',
      `因为案件处于${stageLabel ?? '运用转化'} · ${BETA_HONEST_COPY}；请确认试用转化条款，或改走监控 Assist / 工作台办理`,
      { requiresTierConfirm: true },
    )
  }
  if (input.stage === 'maintenance' && (hs === 'drafting' || !hs)) {
    return pick(
      'agent-annuity',
      `因为案件处于${stageLabel ?? '授权维持'}且年费计划待付款解锁`,
    )
  }
  if (
    input.stage === 'decision' &&
    (hs === 'submitted_to_enterprise' || hs === 'enterprise_review')
  ) {
    return pick(
      'agent-intake',
      `因为案件处于${stageLabel ?? '立项决策'}且报价交接待确认`,
    )
  }

  // 2) Prefer stage mapping (RACI-aware)
  if (input.stage) {
    const raciId =
      kind && RACI_STAGE_PREF[kind]?.[input.stage]
        ? RACI_STAGE_PREF[kind]![input.stage]!
        : BY_STAGE[input.stage]
    if (raciId) {
      const raciHint =
        kind === 'agency'
          ? '代理所工作区优先执行类 Agent'
          : kind === 'enterprise'
            ? '企业工作区优先需你确认的 Agent'
            : '按案件阶段映射'
      return pick(
        raciId,
        `因为案件处于${STAGE_REASON_LABEL[input.stage]}（${raciHint}）`,
      )
    }
  }

  // 3) Goal keywords when stage unknown
  const rules: Array<{ keys: string[]; id: string; why: string }> = [
    { keys: ['交底', '披露', '发明人', 'disclosure'], id: 'agent-disclosure', why: '目标含交底/披露关键词' },
    { keys: ['oa', '一通', '审查意见', '答复', '争点'], id: 'agent-oa', why: '目标含 OA/答复关键词' },
    { keys: ['年费', '维持', '官费', 'annuity'], id: 'agent-annuity', why: '目标含年费/维持关键词' },
    { keys: ['许可', '转让', '转化', '费率', 'royalty'], id: 'agent-monetize', why: '目标含许可/转化关键词' },
    { keys: ['监控', '预警', '竞品', '侵权', '告警'], id: 'agent-watch', why: '目标含监控/预警关键词' },
    // 布局关键词勿无提示塞 Beta layout → 改荐 Core 调研并说明
    { keys: ['布局', '空白', '矩阵', '赛道'], id: 'agent-research', why: '目标含布局/空白点关键词 · 默认 Core 调研（布局 Agent 为 Beta，勿静默塞入；可显式选布局并确认）' },
    { keys: ['权利', '撰写', '独权', '从权', '说明书', 'claims'], id: 'agent-claims', why: '目标含权利要求撰写关键词' },
    { keys: ['立项', '报价', 'go', 'no-go', '委托'], id: 'agent-intake', why: '目标含立项/报价关键词' },
    { keys: ['检索', '调研', '现有技术', '新颖', 'prior'], id: 'agent-research', why: '目标含检索/调研关键词' },
  ]
  for (const r of rules) {
    if (r.keys.some((k) => raw.includes(k) || g.includes(k))) {
      return pick(r.id, `因为${r.why}`)
    }
  }

  // 4) Default
  if (kind === 'agency') {
    return pick('agent-research', '因为代理所工作区默认执行调研检索')
  }
  return pick('agent-research', '因为未匹配阶段/关键词，默认调研检索 Agent')
}

type ScriptItem = Omit<AgentStep, 'id' | 'at'> & {
  artifact?: Omit<AgentArtifactDoc, 'id'>
}

/** Mock playable scripts per agent */
export const AGENT_SCRIPTS: Record<string, ScriptItem[]> = {
  'agent-research': [
    {
      kind: 'thinking',
      title: '理解目标',
      content: '解析技术方案关键词：边缘调度 / 负载预测 / 能耗约束，准备商业库检索策略。',
    },
    {
      kind: 'tool_call',
      title: '调用 commercial_patent_search',
      content: '检索式：(边缘计算 OR edge) AND (调度 OR scheduling) AND (负载预测)',
      toolName: 'commercial_patent_search',
      toolArgs: { query: '边缘计算 节点调度 负载预测', db: 'commercial_api', limit: 20 },
    },
    {
      kind: 'tool_result',
      title: '检索命中 12 件',
      content: 'Top3：CN114xxx（华为）相关度 0.86；US2023/xxx（高通）0.81；CN115xxx（中兴）0.77',
      toolName: 'commercial_patent_search',
      toolResultPreview:
        '[{"pubNo":"CN114882901A","title":"一种边缘节点调度方法","url":"https://epub.cnipa.gov.cn/Detail?pub=CN114882901A","assignee":"华为","relevance":0.86},{"pubNo":"US20230123456A1","title":"Power-aware workload scheduling","url":"https://patents.google.com/patent/US20230123456A1","assignee":"Qualcomm","relevance":0.81},{"pubNo":"CN115001234A","title":"能耗约束下的任务分配","url":"https://epub.cnipa.gov.cn/Detail?pub=CN115001234A","assignee":"中兴","relevance":0.77}]',
    },
    {
      kind: 'thinking',
      title: '新颖性差距分析',
      content: '本案强调能耗约束下的动态阈值；对比文献多侧重吞吐优化，差距可主张。',
    },
    {
      kind: 'artifact',
      title: '生成调研报告草稿',
      content: '已写入右侧产物：可专利性倾向「中高」，建议进入立项评估。',
      artifact: {
        title: '调研报告草稿',
        kind: 'report',
        editable: true,
        content:
          '# 现有技术检索报告（草稿）\n\n## 检索范围\n边缘计算节点调度 · 负载预测 · 能耗约束\n\n## 主要对比文献\n1. CN114882901A（华为）— 相关度高，侧重吞吐 · https://epub.cnipa.gov.cn/Detail?pub=CN114882901A\n2. US20230123456A1（Qualcomm）— 调度策略相近 · https://patents.google.com/patent/US20230123456A1\n3. CN115001234A（中兴）— 能耗模型不同 · https://epub.cnipa.gov.cn/Detail?pub=CN115001234A\n\n## 可专利性结论（示意）\n倾向：**中高**。建议突出「能耗约束阈值自适应」特征，进入立项评估确认。\n\n## 风险提示\n需补充实验数据支撑创造性。',
      },
    },
    {
      kind: 'question_to_human',
      title: '需要你确认',
      content: '是否批准本调研策略并提交企业审核？可批准策略 / 退回补充关键词 / 授权进入立项。',
    },
  ],
  'agent-disclosure': [
    {
      kind: 'thinking',
      title: '确认专利类型与 intake',
      content: '未显式指定时默认发明；核对发明人叙述是否足以支撑问题/方案/效果骨架。',
    },
    {
      kind: 'tool_call',
      title: '调用 structure_disclosure',
      content: '按 问题/方案/效果/实施例 结构化交底',
      toolName: 'structure_disclosure',
      toolArgs: { sections: ['problem', 'solution', 'effect', 'embodiments'], patent_type: '发明' },
    },
    {
      kind: 'tool_result',
      title: '结构化骨架就绪',
      content: '已抽出问题/方案/效果与实施例线索；实施例段落仍偏薄。',
      toolName: 'structure_disclosure',
      toolResultPreview:
        '{"patent_type":"发明","problem":"边缘节点能耗过高","solution":"动态阈值调度","effect":"峰值功率下降18%","embodiments":["传感器融合实施例草稿"]}',
    },
    {
      kind: 'tool_call',
      title: '调用 extract_features',
      content: '抽取必要技术特征清单',
      toolName: 'extract_features',
    },
    {
      kind: 'tool_call',
      title: '调用 prior_art_lite',
      content: '轻量 1.1 现有技术（示意·可核验形态；TOOL 未写库）',
      toolName: 'prior_art_lite',
      toolArgs: { round: 1, mode: 'lite' },
    },
    {
      kind: 'tool_result',
      title: '1.1 现有技术条目',
      content: '3 条示意命中（含 pubNo+title+url）；禁止无链接凑条。',
      toolName: 'prior_art_lite',
      toolResultPreview:
        '[{"pubNo":"CN114882901A","title":"一种边缘节点调度方法","url":"https://epub.cnipa.gov.cn/Detail?pub=CN114882901A"},{"pubNo":"US20230123456A1","title":"Power-aware workload scheduling","url":"https://patents.google.com/patent/US20230123456A1"},{"pubNo":"CN115001234A","title":"能耗约束下的任务分配","url":"https://epub.cnipa.gov.cn/Detail?pub=CN115001234A"}]',
    },
    {
      kind: 'tool_call',
      title: '调用 flag_gaps',
      content: '标注阻塞 / 非阻塞缺口',
      toolName: 'flag_gaps',
      toolArgs: { classify: ['blocking', 'non_blocking'] },
    },
    {
      kind: 'artifact',
      title: '结构化技术披露',
      content: '已生成可交接撰写的交底包（对齐 disclosure_pack REQUIRED）。',
      artifact: {
        title: '结构化技术披露（草稿）',
        kind: 'report',
        editable: true,
        content:
          '# 结构化技术披露（草稿）\n\n## 专利类型\n发明（默认）\n\n## 技术问题\n边缘计算节点在高负载下峰值功率过高，导致散热与运维成本上升。\n\n## 技术方案\n根据负载预测确定候选节点；在能耗约束下计算动态阈值并执行调度。\n\n## 有益效果\n峰值功率下降约 18%；吞吐基本持平。\n\n## 必要技术特征\n1. 负载预测 → 候选集合\n2. 能耗约束下的动态阈值\n3. 调度回写状态\n\n## 实施例\n实施例一：仓库传感器网络 500 节点部署；实施例二：与 Friend/LPN 兼容的低功耗变体（细节待补）。\n\n## 1.1 现有技术（可核验示意）\n1. CN114882901A · 一种边缘节点调度方法 · https://epub.cnipa.gov.cn/Detail?pub=CN114882901A\n2. US20230123456A1 · Power-aware workload scheduling · https://patents.google.com/patent/US20230123456A1\n3. CN115001234A · 能耗约束下的任务分配 · https://epub.cnipa.gov.cn/Detail?pub=CN115001234A\n\n## 缺口清单\n### blocking（阻塞）\n- 传感器融合实施例关键参数未给出\n### non_blocking（非阻塞）\n- 对比基线实验条件可后补\n\n## 交接建议\n齐套勾选后批准 → 移交权利要求撰写 Agent。禁止空材料装完成；1.1 禁编造凑条。',
      },
    },
    {
      kind: 'question_to_human',
      title: '需要你确认',
      content: '交底包齐套后方可批准策略。未齐：禁用批准。可退回要求发明人补齐阻塞缺口。',
    },
  ],
  'agent-intake': [
    {
      kind: 'thinking',
      title: '汇总输入',
      content: '读取调研结论与企业预算口径，评估是否立项及委托范围。',
    },
    {
      kind: 'tool_call',
      title: '调用 score_patentability',
      content: '对新颖性、创造性、商业价值打分',
      toolName: 'score_patentability',
    },
    {
      kind: 'tool_result',
      title: '评分结果',
      content: '新颖性 78 · 创造性 72 · 商业契合 85 → 综合建议：立项',
      toolName: 'score_patentability',
      toolResultPreview: '{"novelty":78,"inventive":72,"business":85,"recommend":"go"}',
    },
    {
      kind: 'tool_call',
      title: '调用 estimate_quote',
      content: '估算检索深化 + 撰写包报价',
      toolName: 'estimate_quote',
    },
    {
      kind: 'artifact',
      title: '立项/报价备忘',
      content: '已生成立项建议与报价草案。',
      artifact: {
        title: '立项报价草案',
        kind: 'report',
        editable: true,
        content:
          '# 立项评估备忘（草稿）\n\n**建议**：立项推进\n**报价**：检索深化 ¥8,000 + 撰写包预估 ¥45,000\n**范围**：中国发明申请 · 可选 PCT\n**确认步骤**：企业确认预算与委托模式（自助 / 派所）',
      },
    },
    {
      kind: 'question_to_human',
      title: '需要你确认',
      content: '请确认立项策略与报价，或退回调整范围。',
    },
  ],
  'agent-claims': [
    {
      kind: 'thinking',
      title: '构建权利要求树',
      content: '从交底提取必要技术特征，起草独立权利要求并扩展从权。',
    },
    {
      kind: 'tool_call',
      title: '调用 draft_claims',
      content: '生成独权 1 + 从权 2–6',
      toolName: 'draft_claims',
    },
    {
      kind: 'tool_result',
      title: '权利要求草案',
      content: '独权 1 已生成；从权覆盖负载阈值、能耗窗口、回退策略。',
      toolName: 'draft_claims',
      toolResultPreview: '["1.一种边缘计算节点调度方法…","2.根据权利要求1…"]',
    },
    {
      kind: 'artifact',
      title: '权利要求列表',
      content: '右侧可轻量编辑权利要求文本。',
      artifact: {
        title: '权利要求草稿',
        kind: 'claims',
        editable: true,
        content:
          '1. 一种边缘计算节点调度方法，其特征在于，包括：根据负载预测确定候选节点集合；在能耗约束下计算动态阈值；按所述阈值执行调度并回写状态。\n\n2. 根据权利要求1所述的方法，其中负载预测采用时序模型。\n\n3. 根据权利要求1所述的方法，其中能耗约束包含峰值功率窗口。\n\n4. 一种边缘计算节点调度装置，包括存储器与处理器，所述处理器执行时实现权利要求1–3任一项所述方法。',
      },
    },
    {
      kind: 'question_to_human',
      title: '需要你确认',
      content: '请批准权利要求策略 / 退回扩权或缩限 / 授权递交（对齐撰写台；递交须回执）。',
    },
  ],
  'agent-oa': [
    {
      kind: 'thinking',
      title: '解析 OA',
      content: '识别创造性争点：权利要求 1、3 相对对比文件 1 的区别特征。',
    },
    {
      kind: 'tool_call',
      title: '调用 analyze_oa',
      content: '拆解审查意见争点与证据链',
      toolName: 'analyze_oa',
    },
    {
      kind: 'tool_result',
      title: '争点清单',
      content: '争点 A：独权缺少「能耗阈值自适应」；争点 B：从权 3 实验数据不足。',
      toolName: 'analyze_oa',
      toolResultPreview:
        '[{"issue":"A","claim":"1","type":"inventive"},{"issue":"B","claim":"3","type":"support"}]',
    },
    {
      kind: 'tool_call',
      title: '调用 propose_amendments',
      content: '建议缩限独权并补充实验段落引用',
      toolName: 'propose_amendments',
    },
    {
      kind: 'artifact',
      title: '答复草稿（待确认陈述）',
      content: '已生成意见陈述与修改对照 · 状态：答复草稿（未确认陈述）。',
      artifact: {
        title: 'OA 答复书草稿',
        kind: 'response',
        editable: true,
        content:
          '# 意见陈述书（草稿）\n\n## 策略\n缩限权利要求 1，将「能耗约束下的动态阈值」写入独权；对权利要求 3 补充说明书实验数据引用。\n\n## 争点答复要点\n1. 对比文件 1 未公开动态阈值与能耗窗口的联合约束；\n2. 修改后的方案取得吞吐与能耗的可验证平衡。\n\n## 修改对照\n- 权利要求 1：增加特征「根据峰值功率窗口自适应调整阈值」\n- 权利要求 3：删除过宽表述，改为具体传感器融合实施例',
      },
    },
    {
      kind: 'tool_call',
      title: '预备 write_docket_event',
      content: '批准递交后将回写官方期限台账',
      toolName: 'write_docket_event',
    },
    {
      kind: 'question_to_human',
      title: '需要你确认',
      content: '请先确认陈述（答复草稿→已确认陈述），再批准策略 / 退回修改 / 授权递交（未确认前授权/递交须提示；递交受发票阻塞规则约束）。',
    },
  ],
  'agent-annuity': [
    {
      kind: 'thinking',
      title: '核对手册期限',
      content: '读取授权日、年费窗口与未结发票，生成未来 3 年维持计划并评估付款解锁。',
    },
    {
      kind: 'tool_call',
      title: '调用 list_annuity_schedule',
      content: '拉取年费日历与官费窗口',
      toolName: 'list_annuity_schedule',
      toolArgs: { years: 3 },
    },
    {
      kind: 'tool_result',
      title: '年费窗口',
      content: '第 5 年截止 2026-11-30 · 官费 ¥2,000；发现未付代缴发票。',
      toolName: 'list_annuity_schedule',
      toolResultPreview:
        '{"year":5,"due":"2026-11-30","officialFee":2000,"invoicePending":true}',
    },
    {
      kind: 'tool_call',
      title: '调用 estimate_official_fees',
      content: '估算官费 + 代缴服务费',
      toolName: 'estimate_official_fees',
    },
    {
      kind: 'tool_call',
      title: '预备 write_docket_event',
      content: '付款解锁后将回写年费缴纳事件至 Docket',
      toolName: 'write_docket_event',
      toolArgs: { eventType: 'annuity_payment' },
    },
    {
      kind: 'artifact',
      title: '年费计划',
      content: '已生成维持计划草案 · 待你确认付款解锁。',
      artifact: {
        title: '年费与维持计划',
        kind: 'schedule',
        editable: true,
        content:
          '# 年费计划（草稿）\n\n| 年度 | 截止日 | 官费预估 | 建议 |\n|---|---|---|---|\n| 第 5 年 | 2026-11-30 | ¥2,000 | 按期缴纳 · 待付款解锁 |\n| 第 6 年 | 2027-11-30 | ¥2,000 | 评估维持价值 |\n| 第 7 年 | 2028-11-30 | ¥4,000 | 评估维持价值 |\n\n服务费：按所内标准另计。\n\n## 需你确认\n付款解锁后写回期限台账（FileResponse / write_docket_event）。',
      },
    },
    {
      kind: 'question_to_human',
      title: '需要你确认',
      content: '请执行「付款解锁」（PayInvoice）；通过后将回写年费 Docket 事件。可退回调整预算口径。',
    },
  ],
  'agent-monetize': [
    {
      kind: 'thinking',
      title: '条款骨架',
      content: '按许可场景生成核心条款：范围、期限、费率、改进归属；对照行业费率并关联监控告警。',
    },
    {
      kind: 'tool_call',
      title: '调用 draft_license_terms',
      content: '生成许可条款草案',
      toolName: 'draft_license_terms',
      toolArgs: { territory: 'CN', exclusive: false },
    },
    {
      kind: 'tool_call',
      title: '调用 benchmark_royalty',
      content: '对标行业费率区间 2–4%',
      toolName: 'benchmark_royalty',
    },
    {
      kind: 'tool_result',
      title: '费率对标',
      content: '建议净销售额 2.5% · 落入对标中位。',
      toolName: 'benchmark_royalty',
      toolResultPreview: '{"p25":0.02,"p50":0.025,"p75":0.04,"suggest":0.025}',
    },
    {
      kind: 'tool_call',
      title: '调用 link_watch_alert',
      content: '关联竞品告警（如有）',
      toolName: 'link_watch_alert',
    },
    {
      kind: 'artifact',
      title: '转化条款',
      content: '条款草稿就绪 · 待你确认批准 monetize_terms。',
      artifact: {
        title: '许可条款草稿',
        kind: 'terms',
        editable: true,
        content:
          '# 许可核心条款（草稿）\n\n1. 许可范围：中国大陆 · 非独占 · 不可分许可\n2. 期限：3 年，可续\n3. 费率：净销售额 2.5%（对标区间 2–4%）\n4. 改进归属：双方各自改进归各自；共同改进共有\n5. 监控联动：关联竞品告警 ID（如有）\n\n## 交接\nsubmit/approve monetize_terms（商务策略）。法务会签/合同状态在工作台审批交接（beta · 非合同 PDF）。',
      },
    },
    {
      kind: 'question_to_human',
      title: '需要你确认',
      content: '请批准商务策略，或到工作台继续法务会签/合同状态（beta · 本 Agent 无法务会签闸）。',
    },
  ],
  'agent-watch': [
    {
      kind: 'thinking',
      title: '设定监控窗口',
      content: '扫描近 30 日新公开与诉讼动态，准备威胁评分与处置路径。',
    },
    {
      kind: 'tool_call',
      title: '调用 scan_new_publications',
      content: '关键词：边缘调度 / 能耗阈值 / 无人机避障',
      toolName: 'scan_new_publications',
      toolArgs: { windowDays: 30 },
    },
    {
      kind: 'tool_result',
      title: '发现 3 条新公开',
      content: '其中 1 条威胁评分候选 ≥ 0.8。',
      toolName: 'scan_new_publications',
      toolResultPreview:
        '[{"pubNo":"CN116xxxxxxA","assignee":"竞品A","overlap":0.86}]',
    },
    {
      kind: 'tool_call',
      title: '调用 score_threat',
      content: '对 Top 命中做威胁评分',
      toolName: 'score_threat',
    },
    {
      kind: 'tool_result',
      title: '威胁评分',
      content: 'CN116xxxxxxA · 威胁 0.84 · 建议告警并提交企业。',
      toolName: 'score_threat',
      toolResultPreview: '{"pubNo":"CN116xxxxxxA","threat":0.84,"action":"alert"}',
    },
    {
      kind: 'tool_call',
      title: '调用 draft_watch_alert',
      content: '生成告警意见草稿',
      toolName: 'draft_watch_alert',
    },
    {
      kind: 'artifact',
      title: '监控告警草稿',
      content: '告警意见就绪 · 待你确认批准 watch_alert。',
      artifact: {
        title: '监控告警意见',
        kind: 'alert',
        editable: true,
        content:
          '# 监控告警（草稿）\n\n**威胁评级**：高\n**对象公开**：CN116xxxxxxA（竞品）\n**理由**：独立权利要求覆盖能耗阈值自适应调度，与我方案高度重叠。\n**建议**：启动侵权比对 / 考虑无效检索 / 商务谈判路径。\n\n## 交接\n处置枚举：确认告警 / 升级维权 / 关闭（对齐监控台；submit/approve watch_alert 带处置注记）。',
      },
    },
    {
      kind: 'question_to_human',
      title: '需要你确认',
      content: '请选择告警处置：确认告警 / 升级维权 / 关闭（对齐监控台，非单一批准），或退回补充比对。',
    },
  ],
  'agent-layout': [
    {
      kind: 'thinking',
      title: '构建布局矩阵',
      content: '交叉技术维度 × 应用场景，标注已布局 / 空白 / 竞品密集，准备补强立项。',
    },
    {
      kind: 'tool_call',
      title: '调用 map_layout_matrix',
      content: '生成布局热力矩阵',
      toolName: 'map_layout_matrix',
    },
    {
      kind: 'tool_call',
      title: '调用 find_blank_spots',
      content: '识别空白单元格',
      toolName: 'find_blank_spots',
    },
    {
      kind: 'tool_result',
      title: '空白点',
      content: '多租户隔离调度 · 机会高；边缘侧能耗约束 · 需补强。',
      toolName: 'find_blank_spots',
      toolResultPreview:
        '[{"cell":"multi-tenant","strength":"weak","opportunity":"high"}]',
    },
    {
      kind: 'tool_call',
      title: '调用 suggest_filings',
      content: '建议补强申请方向',
      toolName: 'suggest_filings',
    },
    {
      kind: 'tool_call',
      title: '调用 create_case_from_insight',
      content: '洞察立项：多租户隔离 + 能耗窗口（正式 play 仅预览 · 批准后再 CreateCaseFromInsight）',
      toolName: 'create_case_from_insight',
      toolArgs: {
        title: '多租户隔离调度 · 能耗窗口补强',
        stage: 'pre_research',
      },
    },
    {
      kind: 'tool_call',
      title: '调用 assign_agency',
      content: '可选：派单代理所承接补强调研（正式 play 仅预览 · 批准后 AssignAgency）',
      toolName: 'assign_agency',
      toolArgs: { agencyName: '北京德恒知识产权代理有限公司' },
    },
    {
      kind: 'artifact',
      title: '布局洞察',
      content: '建议补强 2 个空白方向 · 待你确认后再建案/派所。',
      artifact: {
        title: '布局洞察报告',
        kind: 'report',
        editable: true,
        content:
          '# 布局洞察（草稿）\n\n## 空白点\n1. 边缘侧 · 能耗约束调度 — 我方弱、竞品中\n2. 多租户隔离调度 — 双方均弱，机会高\n\n## 建议补强\n- 发起 1 件发明：多租户隔离 + 能耗窗口\n- CreateCaseFromInsight + 可选 AssignAgency\n- 交接键：layout_insight（不占用调研报告）',
      },
    },
    {
      kind: 'question_to_human',
      title: '需要你确认',
      content: '是否批准补强方向？批准后写入 CreateCaseFromInsight（可选派所）并打开新建案件的调研工作台。',
    },
  ],
}

export function buildInitialRuns(): AgentRun[] {
  const now = '2026-09-10'
  return [
    {
      id: 'run-seed-1',
      agentId: 'agent-oa',
      caseId: 'c1',
      goal: '针对一通创造性争点生成答复策略与修改对照',
      status: 'needs_human',
      scriptIndex: 99,
      hitlPending: true,
      createdAt: now,
      updatedAt: now,
      steps: [
        {
          id: 'rs1',
          kind: 'thinking',
          title: '解析 OA',
          content: '识别权利要求 1、3 创造性争点。',
          at: now,
        },
        {
          id: 'rs2',
          kind: 'tool_call',
          title: '调用 analyze_oa',
          content: '拆解审查意见',
          toolName: 'analyze_oa',
          at: now,
        },
        {
          id: 'rs3',
          kind: 'artifact',
          title: '答复书草稿就绪',
          content: '等待你确认策略。',
          artifactId: 'art-seed-1',
          at: now,
        },
        {
          id: 'rs4',
          kind: 'question_to_human',
          title: '需要你确认',
          content: '请批准答复策略 / 退回 / 授权递交。',
          at: now,
        },
      ],
      artifacts: [
        {
          id: 'art-seed-1',
          title: 'OA 答复书草稿',
          kind: 'response',
          editable: true,
          content:
            '# 意见陈述书（预置草稿）\n\n缩限独权并补充实验引用。等待你确认。',
        },
      ],
    },
    {
      id: 'run-seed-2',
      agentId: 'agent-research',
      caseId: 'c2',
      goal: '对固态电解质配方完成现有技术检索并输出结论',
      status: 'running',
      scriptIndex: 2,
      createdAt: now,
      updatedAt: now,
      steps: [
        {
          id: 'rs5',
          kind: 'thinking',
          title: '理解目标',
          content: '硫化物固态电解质 · 界面稳定性',
          at: now,
        },
        {
          id: 'rs6',
          kind: 'tool_call',
          title: '调用 commercial_patent_search',
          content: '检索进行中…',
          toolName: 'commercial_patent_search',
          at: now,
        },
      ],
      artifacts: [],
    },
  ]
}

export const RUN_STATUS_LABEL: Record<string, string> = {
  queued: '排队',
  running: '运行中',
  needs_human: '待你确认',
  done: '已完成',
  failed: '失败',
}
