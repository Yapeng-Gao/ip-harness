/** Domain keys — single source @ip/contracts (P0-5) */
import type {
  StageId,
  HandoffStatus,
  HandoffArtifactKey,
  HandoffAction,
  HitlGateId,
  PersonaId,
  AuditActor,
  AgentTier,
} from '@ip/contracts'

export type {
  StageId,
  HandoffStatus,
  HandoffArtifactKey,
  HandoffAction,
  HitlGateId,
  PersonaId,
  AuditActor,
  AgentTier,
}

export type PatentType = '发明' | '实用新型' | '外观'
export type RiskLevel = '低' | '中' | '高'
export type UserRole = 'enterprise' | 'agency'
export type ProductSurface = 'mid' | 'workbench'

export type FulfillmentMode = 'self_serve' | 'delegated'

export type EngagementPhase =
  | '接案评估'
  | '正式委托'
  | '撰写中'
  | '审查答复'
  | '授权维持'
  | '转化运营'
  | '监控维权'

export type PaymentStatus = '未报价' | '报价待确认' | '已确认待付款' | '部分付款' | '已结清' | '逾期'

export type InvoiceStatus = '待开票' | '已开票' | '已付款' | '逾期'

export interface CaseInvoice {
  id: string
  title: string
  amount: string
  status: InvoiceStatus
  due: string
  relatedStage: string
}

export type RaciLetter = 'R' | 'A' | 'C' | 'I' | '-'

export interface Engagement {
  phase: EngagementPhase
  quoteBudget: string
  paymentStatus: PaymentStatus
  feeNotes?: string
  agencyName?: string
  /** 已批复预算口径（示意） */
  budgetApproved?: string
  /** 案件绑定发票台账 */
  invoices?: CaseInvoice[]
}

export interface ArtifactVersion {
  id: string
  version: string
  at: string
  byRole: UserRole
  note: string
  status: HandoffStatus
  annotation?: string
}

export interface HandoffState {
  status: HandoffStatus
  updatedAt: string
  updatedBy: UserRole
  note?: string
  versions?: ArtifactVersion[]
  /** P0.4 递交回执 */
  receiptNo?: string
  filedAt?: string
}

export interface ChecklistItem {
  id: string
  label: string
  done: boolean
  required: boolean
}

export interface Artifact {
  id: string
  name: string
  type: string
  updatedAt: string
}

export interface TimelineEvent {
  id: string
  time: string
  title: string
  desc: string
  type: 'info' | 'success' | 'warning' | 'action'
  /** 业务回写 / Docket 等来源角标 */
  badge?: string
}

/**
 * 阶段元数据 runners 的步骤条目（静态目录）。
 * `done` 仅种子占位；案级节点进度见 CaseFlowNodeProgress / flowProgressByCase。
 */
export interface RunnerStep {
  id: string
  label: string
  done: boolean
}

/**
 * @deprecated Live 切换已移除（MidPlatform NodeProgress 2026-09-12）。
 * 保留为 StageMeta 静态目录；勿当作案级进度。
 */
export interface Runner {
  id: string
  name: string
  description: string
  steps: RunnerStep[]
}

/** 工作台 Flow 键（与 data/flowSteps.ts 对齐） */
export type FlowKey =
  | 'research'
  | 'intake'
  | 'draft'
  | 'prosecution'
  | 'maintain'
  | 'monetize'
  | 'watch'
  | 'layout'

/** 案级 · Flow 节点进度（中台只读；工作台写回） */
export interface CaseFlowNodeProgress {
  /** 当前步下标（0-based；< index 视为已覆盖） */
  stepIndex: number
  /** 稳定 stepId，如 s0 / s3 */
  stepId: string
  /** ISO 更新时间 */
  updatedAt: string
}

/** Quote / dispatch state machine */
export type QuoteDispatchStatus =
  | 'none'
  | 'intent'
  | 'quoted'
  | 'confirmed'
  | 'assigned'

export type AgencyIntentStatus = 'intent' | 'ignored' | 'accepted'

export interface AgencyIntent {
  id: string
  caseId: string
  agencyId: string
  agencyName: string
  node: string
  status: AgencyIntentStatus
  createdAt: string
  quoteBudget?: string
  ownerEnterpriseId: string
  note?: string
}

export type LegalReviewStatus = 'pending' | 'reviewed' | 'changes_requested'

export type WatchAlertProcessStatus = '已确认' | '已升级' | '已关闭'

export type WatchAlertStatus = '待处理' | '处理中' | WatchAlertProcessStatus

export interface WatchAlert {
  id: string
  title: string
  level: string
  status: WatchAlertStatus
  note: string
  agencyOpinion: string
  enterpriseDecision: string
  /** 告警打开日（示意 · SLA） */
  openedAt?: string
  /** SLA 截止日；早于今日视为超 SLA */
  slaDue?: string
}

export type DraftFilingCheckKey = 'spec' | 'claims' | 'country' | 'fees' | 'disclosure'

export type DraftFilingCheck = Record<DraftFilingCheckKey, boolean>

/** disclosure_pack 齐套勾选（对齐 REQUIRED_BEFORE_SUBMIT.disclosure_pack） */
export type DisclosurePackCheckKey =
  | 'patent_type'
  | 'structure'
  | 'features'
  | 'embodiments'
  | 'prior_art_1_1'
  | 'gaps'

export type DisclosurePackCheck = Record<DisclosurePackCheckKey, boolean>

export interface PatentCase {

  id: string
  title: string
  caseNo: string
  type: PatentType
  ownerTeam: string
  stage: StageId
  risk: RiskLevel
  nextDeadline: string
  progress: number
  inventor: string
  summary: string
  checklist: ChecklistItem[]
  artifacts: Artifact[]
  timeline: TimelineEvent[]
  agencyName: string
  enterpriseContact: string
  handoffs: Partial<Record<HandoffArtifactKey, HandoffState>>
  engagement: Engagement
  /** v0.3: self_serve = enterprise acts as executor; delegated = agency↔enterprise handoff */
  fulfillmentMode: FulfillmentMode
  /** dual-tenant isolation */
  ownerEnterpriseId: string
  assignedAgencyId?: string
  /** monetize: linked monitor alert stub */
  linkedAlertId?: string
  /** monetize thin legal review (not contract e-sign) */
  legalReview?: LegalReviewStatus
  /** OA 答复：意见陈述已确认（对齐 Agent session.oaStatementConfirmed） */
  oaStatementConfirmed?: boolean
  /** Quote / dispatch state machine */
  quoteDispatchStatus?: QuoteDispatchStatus
  /** Insight-driven creation flag (mock) */
  fromInsight?: boolean
}

export type MilestoneStatus = 'pending' | 'in_progress' | 'done' | 'overdue'


export interface StageMeta {
  id: StageId
  name: string
  shortName: string
  description: string
  color: string
  /**
   * 静态概念 runners（非案级、非 Live）。
   * 办理子步骤进度以 Flow STEPS + CaseFlowNodeProgress 为准。
   */
  runners: Runner[]
  defaultChecklist: Omit<ChecklistItem, 'done'>[]
}

/** Wave2 待办来源：seed 冷启动 / handoff 交接驱动 */
export type WorkbenchTodoSource = 'seed' | 'handoff' | 'docket'

/** Wave2 待办动作种类（同案+工件+动作去重） */
export type WorkbenchTodoActionKind =
  | 'enterprise_review'
  | 'agency_revise'
  | 'agency_next'
  | 'docket_escalate'

export interface WorkbenchTodo {
  id: string
  caseId: string
  stage: StageId
  title: string
  due: string
  priority: '高' | '中' | '低'
  enterpriseLabel: string
  agencyLabel: string
  actionPath: string
  assignee?: UserRole | 'both'
  /** Wave2：细粒度办理方（enterprise_ip / agency）；Persona 过滤可认 */
  assigneePersona?: PersonaId
  handoffKey?: HandoffArtifactKey
  done?: boolean
  /** Wave2：默认 seed；交接写入为 handoff */
  source?: WorkbenchTodoSource
  /** Wave2：当前待办对应的下一动作种类 */
  actionKind?: WorkbenchTodoActionKind
  /** Wave2 Docket 升级阶梯：关联期限事件 */
  docketEventId?: string
}

export interface AgencyReview {
  id: string
  by: string
  rating: number
  comment: string
  at: string
  node?: string
}

export interface Agency {
  id: string
  name: string
  specialties: string[]
  domains: string[]
  priceRange: string
  rating: number
  activeCases: number
  blurb: string
  /** 能力标签深度 */
  capabilityTags: string[]
  /** 擅长节点 */
  nodeStrengths: string[]
  /** 履约评价（示意） */
  reviews: AgencyReview[]
}

export interface StageRaci {
  stage: StageId
  enterprise: { R: boolean; A: boolean; C: boolean; I: boolean }
  agency: { R: boolean; A: boolean; C: boolean; I: boolean }
  note?: string
}

export interface TrackCompetitor {
  name: string
  filings: number
  share: number
}

export interface TrackBlankSpot {
  id: string
  title: string
  reason: string
  opportunity: string
}

export interface InsightTrack {
  id: string
  name: string
  domain: string
  summary: string
  competitors: TrackCompetitor[]
  blankSpots: TrackBlankSpot[]
  labeledMock: true
}

export type InventionMaturity = '概念' | '实验室' | '原型' | '小试'
export type PatentabilityHint = '高' | '中高' | '中' | '待评估'

export interface InventionCandidate {
  id: string
  title: string
  inventor: string
  dept: string
  maturity: InventionMaturity
  patentability: PatentabilityHint
  hint: string
  focused?: boolean
}

export interface InnovateCampaign {
  id: string
  name: string
  period: string
  theme: string
  status: '进行中' | '已结束' | '筹备中'
  description: string
  candidates: InventionCandidate[]
  labeledMock: true
}

export type LayoutCellStatus = 'laid' | 'blank' | 'rival_dense'

export interface LayoutCell {
  id: string
  row: string
  col: string
  status: LayoutCellStatus
  label: string
  note: string
  ourCount: number
  rivalCount: number
}

export interface PatentLayoutDomain {
  id: string
  name: string
  domain: string
  summary: string
  rows: string[]
  cols: string[]
  cells: LayoutCell[]
  labeledMock: true
}

export interface ChainPlayer {
  name: string
  patents: number
  role: string
}

export interface ChainNode {
  id: string
  name: string
  patents: number
  players: ChainPlayer[]
  blurb: string
}

export interface IndustryChain {
  id: string
  name: string
  domain: string
  summary: string
  nodes: ChainNode[]
  labeledMock: true
}

/** —— v0.4 P0 extensions —— */

export interface FilingReceipt {
  receiptNo: string
  filedAt: string
}

export interface HandoffReceiptFields {
  receiptNo?: string
  filedAt?: string
}

export type DocketRuleId =
  | 'oa1_response'
  | 'oa_subsequent'
  | 'application_fee'
  | 'substantive_exam_request'
  | 'grant_registration'
  | 'annuity'
  | 'pct_national_entry'

export type DocketEventStatus = 'upcoming' | 'due_soon' | 'overdue' | 'done'

/** Wave2 Docket 升级阶梯 */
export type DocketEscalationLevel =
  | 'none'
  | 'reminded'
  | 'escalated_enterprise'
  | 'at_risk'

export interface DocketEvent {
  id: string
  caseId: string
  ruleId: DocketRuleId
  title: string
  triggerDate: string
  dueDate: string
  status: DocketEventStatus
  officialFeeHint: string
  linkedHandoffKey?: string
  note?: string
  receiptNo?: string
  /** 由业务办理递交归档回写生成 */
  fromHandoffWriteback?: boolean
  /** Wave2：升级阶梯（缺省 none） */
  escalationLevel?: DocketEscalationLevel
  escalationAt?: string
  escalationActor?: string
  /** 标记风险旗标（事件级；可与案 risk 同步） */
  atRisk?: boolean
}

export interface ResearchHit {
  id: string
  title: string
  pubNo: string
  /** 可点开的公开页/数据库链接；无链接则不可作为可核验命中提交 */
  url?: string
  assignee: string
  date: string
  ipc: string
  relevance: string
  abstract: string
  noveltyDelta: number
  apiSource: string
}

/** —— v0.5 P1 inventor portal —— */

export type DisclosureStatus =
  | '草稿'
  | '已提交'
  | '部门审核'
  | 'IP受理'
  | '已立案'
  | '退回'

export interface DisclosureTimelineEntry {
  id: string
  time: string
  status: DisclosureStatus
  note: string
}

export interface InventionDisclosure {
  id: string
  title: string
  inventor: string
  dept: string
  tech: string
  /** 技术主题（intake 对齐） */
  techTheme?: string
  /** 专利类型，默认发明 */
  patentType?: PatentType
  /** 联系人；可「待填写」 */
  contact?: string
  riskDate: string
  targetStage: 'pre_research' | 'decision'
  status: DisclosureStatus
  submittedAt: string
  caseId?: string
  timeline: DisclosureTimelineEntry[]
}
/** —— Agent Platform —— */

export type AgentStatus = 'active' | 'beta' | 'maintenance'

export type AgentRunStatus = 'queued' | 'running' | 'needs_human' | 'done' | 'failed'

export type AgentStepKind =
  | 'thinking'
  | 'tool_call'
  | 'tool_result'
  | 'artifact'
  | 'question_to_human'
  | 'system'

export interface AgentDef {
  id: string
  name: string
  specialty: string
  stage: StageId
  tools: string[]
  status: AgentStatus
  description: string
  capabilities: string[]
  handoffKey: HandoffArtifactKey
  workbenchPath: string
  /** Short Chinese system prompt shown in UI */
  systemPromptBrief: string
  /** Required human gates for THIS agent */
  hitlGates: HitlGateId[]
  /** Who typically R/A (one line) */
  raciHint: string
  /** Patlytics-style Skills Meta · when to pick this agent */
  whenToUse: string
  /** Expected inputs / case materials */
  inputsHint: string
  /** Hard rails shown in Catalog + ConfirmBar */
  guardrails: string[]
  /** Expected outputs / artifacts */
  outputsHint: string
  /** Platform tier: Core 主闭环 / Assist 辅办 / Beta 非采购闭环 */
  tier: AgentTier
  /** Optional honest one-liner for Assist/Beta gaps */
  tierNote?: string
}

export interface AgentStep {
  id: string
  kind: AgentStepKind
  title: string
  content: string
  toolName?: string
  toolArgs?: Record<string, unknown>
  toolResultPreview?: string
  artifactId?: string
  at: string
}

export interface AgentArtifactDoc {
  id: string
  title: string
  kind: 'report' | 'claims' | 'response' | 'alert' | 'terms' | 'schedule' | 'other'
  content: string
  editable: boolean
}

export interface AgentRun {
  id: string
  agentId: string
  caseId: string
  goal: string
  status: AgentRunStatus
  steps: AgentStep[]
  artifacts: AgentArtifactDoc[]
  createdAt: string
  updatedAt: string
  /** playable mock cursor */
  scriptIndex: number
  hitlPending?: boolean
}

/** —— Dual Product —— */
export type ActiveProduct = 'saas' | 'agent'

/** Session = conversation + agent runs on an IP case/goal (Cursor metaphor) */
export interface AgentSession {
  id: string
  title: string
  agentId: string | 'auto'
  caseId?: string
  goal: string
  status: AgentRunStatus
  steps: AgentStep[]
  artifacts: AgentArtifactDoc[]
  createdAt: string
  updatedAt: string
  scriptIndex: number
  hitlPending?: boolean
  /** HITL gates cleared this session (persists across SPA refresh within memory) */
  clearedHitlGates?: HitlGateId[]
  /** linked run id when migrated from legacy AgentRun */
  runId?: string
  /** Soft-hide from default session lists */
  archived?: boolean
  /** Present when status === 'failed' */
  failReason?: string
  /** OA：意见陈述是否已确认为「已确认陈述」（相对答复草稿） */
  oaStatementConfirmed?: boolean
  /** OA 争点类型（新颖性/创造性/清楚/支持充分公开/其他） */
  oaIssueType?: OaIssueType
  /** OA 策略要点（HITL 前填写） */
  oaStrategyNotes?: string
}

/** —— Patlytics-style Skills Meta —— */

export type OaIssueType =
  | 'novelty'
  | 'inventiveness'
  | 'clarity'
  | 'support_disclosure'
  | 'other'

export type CaseDriveItemKind =
  | 'claim_chart'
  | 'research_note'
  | 'oa_confirm'
  | 'approval'
  | 'other'

export interface CaseDriveItem {
  id: string
  kind: CaseDriveItemKind
  title: string
  summary: string
  at: string
  source?: string
}

/** 递交前轻量勾选：术语一致 / 说明书支持 / 非法律意见戳 */
export type FullCheckLiteKey = 'terminology' | 'support' | 'non_legal_stamp'

export type FullCheckLite = Record<FullCheckLiteKey, boolean>
