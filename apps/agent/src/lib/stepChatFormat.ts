/**
 * 席会话 · 工具/步骤展示人话（禁裸 API id 上屏）
 */
import type { ExpertStepDef } from '../projects/types'

const TOOL_LABELS: Record<string, string> = {
  dispatch_task: '分派任务',
  summarize_timeline: '汇总时间线',
  open_expert_dm: '打开专家私信',
  accept_dual_file: '验收双文件',
  extract_tech_points: '抽取技术要点',
  build_search_query: '生成检索式',
  commercial_patent_search: '专利检索',
  cluster_hits: '命中聚类',
  draft_research_report: '起草查新报告',
  bind_novelty: '三性对照',
  ingest_upstream: '摄入上游结论',
  extract_evidence: '区别特征分析',
  scoring_formula: '三轴评分',
  draft_intake_quote: '范围与报价草案',
  propose_go_nogo: 'Go / No-Go 建议',
  read_intake_conditions: '读取立项条件',
  gather_tech_points: '采集技术点',
  ask_inventor: '向发明人追问',
  structure_disclosure: '整理交底结构',
  outline_embodiments: '实施例提纲',
  pack_disclosure: '打包交底',
  build_feature_table: '特征表',
  plan_claim_tree: '权项层级规划',
  draft_claims: '起草权利要求',
  draft_specification_outline: '说明书提纲',
  claim_validator: '权要校验',
  submit_draft_for_hitl: '提请批准撰写',
  gather_figure_context: '附图上下文',
  list_needed_figures: '图号清单',
  mock_sketch: '草图占位',
  ocr_term_check: '图注术语校验',
  attach_chapter_event: '冻图号挂章',
  check_jurisdiction: '国别策略',
  filing_checklist: '齐套清单',
  formality_scan: '形式审查点',
  deadline_hint: '期限提示',
  propose_authorize_file: '授权递交',
  parse_oa_notice: '解析审查意见',
  oa_reason_classifier: '理由分类',
  oa_strategy: '答复策略',
  draft_amendments: '修改对照',
  draft_oa_response: '起草答复',
  submit_oa_for_hitl: '提请批准答复',
  map_landscape: '产业全景',
  segment_market: '市场分层',
  draft_landscape_report: '全景报告',
  expand_dependent: '扩展从属权项',
  check_support: '检查支持',
  extract_fto_features: 'FTO 特征',
  fto_hit_scan: '障碍专利扫描',
  build_risk_matrix: '风险矩阵',
  draft_fto_report: 'FTO 备忘',
  list_competitors: '竞品名单',
  grade_threat: '威胁分级',
  draft_competitor_watch: '竞品监控卡',
  brainstorm_directions: '方向头脑风暴',
  score_patentability: '可专利性评分',
  draft_inspire_brief: '灵感简报',
  parse_tech_points: '解析技术点',
  extract_invention_points: '抽取发明点',
  score_invention: '发明点评分',
  pack_mining: '挖掘包',
  plan_family: '家族规划',
  map_protection_net: '保护网映射',
  draft_layout_plan: '布局方案',
  claim_chart_compare: '权要对照表',
  stability_score: '稳定性评分',
  draft_enforcement_brief: '维权简报',
  list_annuity_due: '年费到期',
  compute_surcharge: '滞纳金估算',
  propose_pay_or_abandon: '缴费/放弃建议',
  score_portfolio: '组合评分',
  draft_valuation_card: '估值卡片',
  grade_core_periphery: '核心/外围分级',
  estimate_deal: '交易估值',
  draft_term_sheet: '条款清单',
  validate_contract_clauses: '合同条款校验',
  outline_brief: '选题提纲',
  web_skim: '资料速览',
  note_cluster: '要点聚类',
  draft_outline: '起草大纲',
  expand_section: '扩写章节',
  polish_tone: '润色语气',
  lint_consistency: '一致性检查',
  risk_checklist: '风险清单',
  suggest_fix: '修改建议',
  country_strategy: '国别策略',
  draft_fto_risk_card: '风险卡片',
  draft_abstract: '起草摘要',
  canvas_placeholder: '画布占位',
  version_figure: '附图版本',
  approve_strategy: '批准策略',
  authorize_file: '授权递交',
  confirm_quote: '确认报价',
  request_changes: '退回修改',
  propose_intake: '提议立项',
}

const API_ID = /^[a-z][a-z0-9_]{2,}$/

export function projectToolLabel(toolName: string): string {
  if (TOOL_LABELS[toolName]) return TOOL_LABELS[toolName]
  // 未知 id：空格化，绝不原样蛇形上屏
  return toolName.replace(/_/g, ' ')
}

/** 助理气泡：剧本 + 可扫读结构化片段（进 Markdown） */
export function formatStepAssistantContent(step: ExpertStepDef): string {
  if (step.structuredBody?.trim()) {
    return `${step.script.trim()}\n\n${step.structuredBody.trim()}`
  }
  return step.script
}

/** 工具气泡正文：只要人话 preview，不要 API id */
export function formatStepToolContent(step: ExpertStepDef): string {
  if (!step.tool) return ''
  return step.tool.preview
}

/**
 * 兼容旧消息：剥掉行首 / 行内前缀的 snake_case API id。
 * 例：`build_search_query\n主式…`、`build_search_query 主式…`、`build_search_query → 主式…`
 */
export function humanizeToolBubble(
  content: string,
  toolName?: string,
): { title: string; body: string } {
  let body = content.trim()
  let inferredId = toolName?.trim() || ''

  const lines = body.split('\n')
  const first = (lines[0] ?? '').trim()

  if (API_ID.test(first)) {
    inferredId = inferredId || first
    body = lines.slice(1).join('\n').trim()
  } else {
    const prefix = first.match(/^([a-z][a-z0-9_]{2,})\s*(?:→|->|:)?\s*(.*)$/)
    if (prefix && API_ID.test(prefix[1]!)) {
      inferredId = inferredId || prefix[1]!
      const restFirst = (prefix[2] ?? '').trim()
      body = [restFirst, ...lines.slice(1)].filter(Boolean).join('\n').trim()
    }
  }

  // 正文若仍以已知 API id 开头（无换行残留），再剥一次
  if (inferredId && body.startsWith(inferredId)) {
    body = body.slice(inferredId.length).replace(/^\s*(→|->|:)?\s*/, '')
  }

  return {
    title: inferredId ? projectToolLabel(inferredId) : '本步产出',
    body: body || '已完成（样机）',
  }
}

/**
 * 解析「回到第2步 / 从检索式重做」类口令 → 0-based stepIndex。
 * 仅匹配有回退意图的话；普通闲聊返回 null。
 */
export function parseRewindIntent(
  text: string,
  steps: ReadonlyArray<{ id: string; label: string }>,
): { stepIndex: number } | null {
  const t = text.trim()
  if (!t || steps.length === 0) return null

  const hasIntent =
    /回到|回退|重做|重跑|再改|修改|从.+开始/.test(t) ||
    /第\s*\d+\s*步\s*(?:开始|重做|修改|重跑)/.test(t)
  if (!hasIntent) return null

  const num =
    t.match(/(?:回到|回退到?|重做|重跑|改)\s*第?\s*(\d+)\s*步/) ||
    t.match(/从\s*第?\s*(\d+)\s*步/) ||
    t.match(/第\s*(\d+)\s*步\s*(?:开始|重做|修改|重跑)/)
  if (num) {
    const n = Number(num[1])
    if (Number.isFinite(n) && n >= 1 && n <= steps.length) {
      return { stepIndex: n - 1 }
    }
  }

  const ranked = steps
    .map((s, i) => ({ i, label: s.label }))
    .filter((s) => s.label.length >= 2 && t.includes(s.label))
    .sort((a, b) => b.label.length - a.label.length)
  if (ranked[0]) return { stepIndex: ranked[0].i }

  return null
}
