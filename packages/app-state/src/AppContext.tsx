import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from 'react'
import { INITIAL_CASES } from '@shared/data/cases'
import { getStageIndex, getStageMeta, STAGE_ORDER } from '@ip/domain'
import {
  ARTIFACT_FOR_STAGE,
  COMMITTEE_VOTE_HARD_BLOCK_STORAGE_KEY,
  COMMITTEE_VOTE_HARD_GATE_MSG,
  EMPTY_DRAFT_FILING_CHECK,
  EMPTY_DISCLOSURE_PACK_CHECK,
  FULL_DISCLOSURE_PACK_CHECK,
  HANDOFF_ARTIFACT_LABELS,
  HANDOFF_LABELS,
  canPerformHandoff,
  nextStatusForAction,
  nextVersionLabel,
  type HandoffAction,
} from '@shared/data/handoff'
import {
  WORKSPACES,
  getWorkspace,
  filterTodosForWorkspace,
  filterCasesForWorkspace,
  canAccessCase as canAccessCaseFn,
  agencyIdFromName,
  ENTERPRISE_XINGHE,
  type Workspace,
} from '@shared/data/workspaces'
import {
  defaultPersonaForRole,
  PERSONA_BY_ID,
} from '@shared/data/persona'
import {
  INITIAL_DOCKET_EVENTS,
  addMonths,
  type DocketEvent,
} from '@shared/data/docketRules'
import {
  type DataSourceMode,
} from '@shared/data/dataStrategy'
import { hasBlockingInvoice } from '@shared/utils/billing'
import {
  buildTodoFromHandoffTransition,
  completeOpenDynamicTodos,
  matchingSeedIdsForArtifact,
  mergeDynamicAndSeedTodos,
  upsertDynamicTodo,
} from '@shared/utils/dynamicTodos'
import {
  applyEscalateAction,
  buildDocketEscalateTodo,
  canEscalateStatus,
  completeDocketEscalateTodos,
  effectiveEscalationLevel,
  ladderNextActions,
  upsertDocketEscalateTodo,
  type DocketEscalateAction,
} from '@shared/utils/docketEscalate'
import { EMPTY_FULL_CHECK_LITE } from '@shared/utils/fullFilingCheck'
import {
  normalizeMaintainRow,
  type MaintainScheduleRow,
} from '@shared/utils/slaInbox'
import { watchSeed, maintainSeed } from '@shared/data/workbenchSeeds'
import type {
  AuditEntry,
  CommandMeta,
  CommandName,
  CommandResult,
  DomainCommand,
} from '@ip/domain'
import {
  evaluatePayUnlock,
  firstGuardrailMessage,
} from '@ip/domain'
import {
  AUDIT_SCHEMA_VERSION,
  COMMAND_LABELS,
  commandForHandoffAction,
  defaultHandoffKeyForCommand,
} from '@ip/domain'
import {
  progressFloorForCommand,
  resolveFlowKey,
} from '@shared/lib/agentFlowProgress'
import {
  apiMockWriteModeLabel,
  isApiMockWritePreferred,
  tryDispatchViaApiMock,
} from './apiMockWrite'
import {
  apiMockReadModeLabel,
  isApiMockReadPreferred,
  mergeCaseSummaryOntoPatentCase,
  tryGetInboxFromApiMock,
  tryListCasesFromApiMock,
} from './apiMockRead'
import type { InboxItem as ApiMockInboxItem } from '@ip/api'
import {
  pickNewerSnapshot,
  readLocalSnapshot,
  readPersonaCookie,
  readWorkspaceCookie,
  subscribeCrossPortSnapshot,
  writeLocalSnapshot,
  writePersonaCookie,
  writeWorkspaceCookie,
  type CrossPortSnapshotV1,
} from './crossPortStore'
import type {
  PatentCase,
  StageId,
  ChecklistItem,
  CaseFlowNodeProgress,
  FlowKey,
  UserRole,
  WorkbenchTodo,
  HandoffArtifactKey,
  HandoffStatus,
  ArtifactVersion,
  Engagement,
  FulfillmentMode,
  CaseInvoice,
  InvoiceStatus,
  InventionDisclosure,
  DisclosureStatus,
  AgencyIntent,
  QuoteDispatchStatus,
  WatchAlert,
  WatchAlertProcessStatus,
  DraftFilingCheck,
  DraftFilingCheckKey,
  DisclosurePackCheck,
  DisclosurePackCheckKey,
  LegalReviewStatus,
  PatentType,
  CaseDriveItem,
  FullCheckLite,
  FullCheckLiteKey,
  PersonaId,
} from '@ip/domain/types'

interface AppContextValue {
  cases: PatentCase[]
  visibleCases: PatentCase[]
  canAccessCase: (id: string) => boolean
  stageFilter: StageId | 'all'
  setStageFilter: (s: StageId | 'all') => void
  getCase: (id: string) => PatentCase | undefined
  visibleDocketEvents: DocketEvent[]
  toggleChecklist: (caseId: string, itemId: string) => void
  markChecklistDone: (caseId: string, itemIds?: string[]) => void
  passGate: (caseId: string) => { ok: boolean; message: string }
  rejectGate: (caseId: string) => void
  advanceFromWorkbench: (
    caseId: string,
    opts?: { note?: string; resolveDoneIds?: string[] },
  ) => { ok: boolean; message: string }
  /** 立项 No-Go：写入 handoff changes_requested + 时间线摘要（可审计） */
  recordIntakeNoGo: (caseId: string, reason: string) => { ok: boolean; message: string }
  /**
   * 补挂交接键（如 layout_insight）：仅写入 drafting 状态，不绕过 REQUIRED、不自动批准。
   * 已存在则原样返回（不降级/不覆盖已有状态）。可审计：时间线 + Drive。
   */
  attachHandoffArtifact: (
    caseId: string,
    key: HandoffArtifactKey,
    opts?: { note?: string; summary?: string },
  ) => { ok: boolean; message: string; created: boolean }
  /** 案级 Flow 节点进度（中台只读；工作台写回） */
  getFlowNodeProgress: (
    caseId: string,
    flowKey: FlowKey,
  ) => CaseFlowNodeProgress | undefined
  setFlowNodeProgress: (
    caseId: string,
    flowKey: FlowKey,
    stepIndex: number,
  ) => void
  getCaseFlowProgress: (
    caseId: string,
  ) => Partial<Record<FlowKey, CaseFlowNodeProgress>>
  recentActivity: { id: string; text: string; time: string }[]
  addActivity: (text: string) => void
  role: UserRole
  setRole: (r: UserRole) => void
  /** Wave1 Persona（演示可执法；非真 SSO） */
  persona: PersonaId
  setPersona: (p: PersonaId) => void
  /** 租户级：委员投票未齐时硬挡 Go（localStorage: ip-harness-committee-vote-hard-block-go） */
  committeeVoteHardBlockGo: boolean
  setCommitteeVoteHardBlockGo: (v: boolean) => void
  /** 委员投票审计条（Persona=committee 写入有效） */
  committeeVoteLog: {
    id: string
    caseId: string
    reviewerId: string
    reviewerName: string
    vote: string
    comment: string
    persona: PersonaId
    at: string
  }[]
  recordCommitteeVote: (input: {
    caseId: string
    reviewerId: string
    reviewerName: string
    vote: string
    comment?: string
  }) => { ok: boolean; message: string; audited: boolean }
  /** 某案是否已有有效委员投票（硬挡 Go 用） */
  hasAuditedCommitteeVote: (caseId: string) => boolean
  workspace: Workspace
  selectWorkspace: (id: string) => void
  dataSourceMode: DataSourceMode
  setDataSourceMode: (m: DataSourceMode) => void
  docketEvents: DocketEvent[]
  addDocketEvent: (ev: DocketEvent) => void
  /**
   * Wave2 Docket 升级阶梯：remind → escalate_enterprise → mark_at_risk；complete 清升级待办
   */
  escalateDocketEvent: (
    eventId: string,
    action: DocketEscalateAction,
  ) => { ok: boolean; message: string }
  todos: WorkbenchTodo[]
  workspaceTodos: WorkbenchTodo[]
  addArtifact: (caseId: string, name: string, type: string) => void
  getHandoff: (caseId: string, key: HandoffArtifactKey) => HandoffStatus
  getHandoffState: (
    caseId: string,
    key: HandoffArtifactKey,
  ) => { status: HandoffStatus; receiptNo?: string; filedAt?: string; note?: string } | undefined
  getVersions: (caseId: string, key: HandoffArtifactKey) => ArtifactVersion[]
  getCurrentVersionLabel: (caseId: string, key: HandoffArtifactKey) => string
  transitionHandoff: (
    caseId: string,
    key: HandoffArtifactKey,
    action: HandoffAction,
    note?: string,
    annotation?: string,
    extras?: { receiptNo?: string; filedAt?: string },
    auditMeta?: CommandMeta & { command?: CommandName; skipAudit?: boolean },
  ) => { ok: boolean; message: string }
  updateEngagement: (caseId: string, patch: Partial<Engagement>) => void
  primaryHandoffKey: (stage: StageId) => HandoffArtifactKey | undefined
  setFulfillmentMode: (caseId: string, mode: FulfillmentMode) => void
  dispatchAgency: (caseId: string, agencyName: string) => void
  addCase: (partial: Partial<PatentCase> & Pick<PatentCase, 'title' | 'stage'>) => PatentCase
  setLinkedAlert: (caseId: string, alertId: string) => void
  getWatchAlerts: (caseId: string) => WatchAlert[]
  /** Maintain 年费日程单源（Inbox / Flow 同读） */
  getMaintainSchedule: (caseId: string) => MaintainScheduleRow[]
  upsertMaintainSchedule: (caseId: string, rows: MaintainScheduleRow[]) => void
  processWatchAlert: (
    caseId: string,
    alertId: string,
    status: WatchAlertProcessStatus,
  ) => { ok: boolean; message: string }
  patchWatchAlert: (
    caseId: string,
    alertId: string,
    patch: Partial<Pick<WatchAlert, 'agencyOpinion' | 'enterpriseDecision' | 'note' | 'status' | 'title' | 'level'>>,
  ) => void
  getDraftFilingCheck: (caseId: string) => DraftFilingCheck
  setDraftFilingCheck: (
    caseId: string,
    patch: Partial<DraftFilingCheck> | DraftFilingCheck,
  ) => void
  toggleDraftFilingCheck: (caseId: string, key: DraftFilingCheckKey) => void
  getDisclosurePackCheck: (caseId: string) => DisclosurePackCheck
  setDisclosurePackCheck: (
    caseId: string,
    patch: Partial<DisclosurePackCheck> | DisclosurePackCheck,
  ) => void
  toggleDisclosurePackCheck: (caseId: string, key: DisclosurePackCheckKey) => void
  markDisclosurePackComplete: (caseId: string) => void
  setLegalReview: (caseId: string, status: LegalReviewStatus) => void
  setOaStatementConfirmed: (caseId: string, confirmed: boolean) => void
  getCaseDriveItems: (caseId: string) => CaseDriveItem[]
  appendCaseDriveItem: (
    caseId: string,
    item: Omit<CaseDriveItem, 'id' | 'at'> & { id?: string; at?: string },
  ) => CaseDriveItem | null
  getFullCheckLite: (caseId: string) => FullCheckLite
  toggleFullCheckLite: (caseId: string, key: FullCheckLiteKey) => void
  setFullCheckLite: (caseId: string, patch: Partial<FullCheckLite>) => void
  addInvoice: (caseId: string, inv: Omit<CaseInvoice, 'id'> & { id?: string }) => CaseInvoice | null
  updateInvoiceStatus: (caseId: string, invoiceId: string, status: InvoiceStatus) => void
  appendDraftInvoice: (
    caseId: string,
    opts: { title: string; amount: string; relatedStage: string },
  ) => CaseInvoice | null
  pendingPayInvoiceCount: number
  disclosures: InventionDisclosure[]
  submitDisclosure: (input: {
    title: string
    inventor: string
    dept: string
    tech: string
    techTheme?: string
    patentType?: PatentType
    contact?: string
    riskDate: string
    targetStage: 'pre_research' | 'decision'
  }) => InventionDisclosure
  advanceDisclosure: (
    id: string,
    next: DisclosureStatus,
    note?: string,
  ) => { ok: boolean; message: string; caseId?: string }
  pendingDisclosures: InventionDisclosure[]
  overdueStopEnabled: boolean
  setOverdueStopEnabled: (v: boolean) => void
  hasBlockingInvoiceForCase: (caseId: string) => {
    blocked: boolean
    reason?: string
  }
  agencyIntents: AgencyIntent[]
  visibleAgencyIntents: AgencyIntent[]
  submitAgencyIntent: (input: {
    caseId: string
    agencyId: string
    agencyName: string
    node: string
    quoteBudget?: string
    note?: string
  }) => AgencyIntent | null
  acceptAgencyIntent: (intentId: string) => { ok: boolean; message: string }
  ignoreAgencyIntent: (intentId: string) => { ok: boolean; message: string }
  insightDrivenCount: number
  bumpInsightDriven: () => void
  setQuoteDispatchStatus: (caseId: string, status: QuoteDispatchStatus) => void
  auditLog: AuditEntry[]
  lastDomainWrite: { command: CommandName; message: string; at: string } | null
  dispatchCommand: (cmd: DomainCommand, meta?: CommandMeta) => Promise<CommandResult>
  getAuditForCase: (caseId: string) => AuditEntry[]
  /** 读路径样机 Inbox（供查询侧/调试；不替代 sla/watch/maintain 纯函数 Inbox） */
  apiMockInbox: ApiMockInboxItem[]
  /** 读路径开关是否开（env/LS） */
  apiMockReadEnabled: boolean
  /** 重拉 listCases + inbox 并 merge；失败保持 seed */
  reloadFromApiMock: () => Promise<void>
}

const AppContext = createContext<AppContextValue | null>(null)

function today() {
  return new Date().toISOString().slice(0, 10)
}


function mapWatchSeedAlert(a: {
  id: string
  title: string
  level: string
  status: string
  note: string
  agencyOpinion: string
  enterpriseDecision: string
  openedAt?: string
  slaDue?: string
}): WatchAlert {
  return {
    id: a.id,
    title: a.title,
    level: a.level,
    status: a.status as WatchAlert['status'],
    note: a.note,
    agencyOpinion: a.agencyOpinion ?? '',
    enterpriseDecision: a.enterpriseDecision ?? '',
    openedAt: a.openedAt,
    slaDue: a.slaDue,
  }
}


/** Deep-clone one seed PatentCase (same shape as AppProvider initial state). */
function clonePatentCaseFromSeed(c: PatentCase): PatentCase {
  return {
    ...c,
    checklist: c.checklist.map((i) => ({ ...i })),
    artifacts: [...c.artifacts],
    timeline: [...c.timeline],
    handoffs: Object.fromEntries(
      Object.entries(c.handoffs).map(([k, v]) => [
        k,
        { ...v!, versions: v?.versions ? [...v.versions] : [] },
      ]),
    ),
    engagement: {
      ...c.engagement,
      invoices: c.engagement.invoices
        ? c.engagement.invoices.map((i) => ({ ...i }))
        : [],
      budgetApproved: c.engagement.budgetApproved,
    },
    fulfillmentMode: c.fulfillmentMode ?? 'delegated',
    ownerEnterpriseId: c.ownerEnterpriseId ?? ENTERPRISE_XINGHE,
    assignedAgencyId: c.assignedAgencyId,
    linkedAlertId: c.linkedAlertId,
  }
}

/**
 * Hydrate merge: keep hydrated rows for existing ids (do not overwrite user edits);
 * append seed cases whose ids are missing (e.g. new c12/c13 after old localStorage snapshot).
 */
export function mergeCasesWithSeedById(
  hydrated: PatentCase[] | null | undefined,
  seed: PatentCase[] = INITIAL_CASES,
): PatentCase[] {
  if (!hydrated?.length) {
    return seed.map(clonePatentCaseFromSeed)
  }
  const have = new Set(hydrated.map((c) => c.id))
  const missing = seed
    .filter((c) => !have.has(c.id))
    .map(clonePatentCaseFromSeed)
  if (missing.length === 0) return hydrated
  return [...hydrated, ...missing]
}

export function AppProvider({ children }: { children: ReactNode }) {
  const [cases, setCases] = useState<PatentCase[]>(() =>
    INITIAL_CASES.map(clonePatentCaseFromSeed),
  )
  const [watchAlertsByCase, setWatchAlertsByCase] = useState<
    Record<string, WatchAlert[]>
  >(() => {
    const init: Record<string, WatchAlert[]> = {}
    for (const [cid, seed] of Object.entries(watchSeed)) {
      init[cid] = seed.alerts.map(mapWatchSeedAlert)
    }
    return init
  })
  const [maintainSchedulesByCase, setMaintainSchedulesByCase] = useState<
    Record<string, MaintainScheduleRow[]>
  >(() => {
    const init: Record<string, MaintainScheduleRow[]> = {}
    for (const [cid, seed] of Object.entries(maintainSeed)) {
      if (seed.schedule?.length) {
        init[cid] = seed.schedule.map((r, i) => normalizeMaintainRow(r, i))
      }
    }
    return init
  })
  const [draftFilingCheckByCase, setDraftFilingCheckByCase] = useState<
    Record<string, DraftFilingCheck>
  >({})
  const [disclosurePackCheckByCase, setDisclosurePackCheckByCase] = useState<
    Record<string, DisclosurePackCheck>
  >(() => ({
    // 种子：已有交底包案件默认齐套可批
    c5: { ...FULL_DISCLOSURE_PACK_CHECK },
    c4: { ...FULL_DISCLOSURE_PACK_CHECK },
    c10: { ...FULL_DISCLOSURE_PACK_CHECK },
  }))
  const [caseDriveItemsByCase, setCaseDriveItemsByCase] = useState<
    Record<string, CaseDriveItem[]>
  >({})
  const [fullCheckLiteByCase, setFullCheckLiteByCase] = useState<
    Record<string, FullCheckLite>
  >({})
  const [stageFilter, setStageFilter] = useState<StageId | 'all'>('all')
  const [flowProgressByCase, setFlowProgressByCase] = useState<
    Record<string, Partial<Record<FlowKey, CaseFlowNodeProgress>>>
  >(() => readLocalSnapshot()?.flowProgressByCase ?? {})
  const [workspaceId, setWorkspaceId] = useState(() => {
    const fromCookie = readWorkspaceCookie()
    if (fromCookie && WORKSPACES.some((w) => w.id === fromCookie)) return fromCookie
    return 'ws-deheng'
  })
  const workspace = useMemo(() => getWorkspace(workspaceId), [workspaceId])
  const role = workspace.role
  const [persona, setPersonaState] = useState<PersonaId>(() => {
    const fromCookie = readPersonaCookie()
    if (fromCookie) return fromCookie
    return defaultPersonaForRole(getWorkspace(workspaceId).role)
  })
  const [committeeVoteHardBlockGo, setCommitteeVoteHardBlockGoState] = useState(() => {
    try {
      return localStorage.getItem(COMMITTEE_VOTE_HARD_BLOCK_STORAGE_KEY) === '1'
    } catch {
      return false
    }
  })
  const setCommitteeVoteHardBlockGo = useCallback((v: boolean) => {
    setCommitteeVoteHardBlockGoState(v)
    try {
      localStorage.setItem(COMMITTEE_VOTE_HARD_BLOCK_STORAGE_KEY, v ? '1' : '0')
    } catch {
      /* ignore quota / private mode */
    }
  }, [])
  const [committeeVoteLog, setCommitteeVoteLog] = useState<
    {
      id: string
      caseId: string
      reviewerId: string
      reviewerName: string
      vote: string
      comment: string
      persona: PersonaId
      at: string
    }[]
  >([])
  const setRole = useCallback((r: UserRole) => {
    const match = WORKSPACES.find((w) => w.role === r)
    if (match) {
      setWorkspaceId(match.id)
      setPersonaState(defaultPersonaForRole(r))
    }
  }, [])
  const selectWorkspace = useCallback((id: string) => {
    setWorkspaceId(id)
    const ws = getWorkspace(id)
    setPersonaState((prev) => {
      const def = PERSONA_BY_ID[prev]
      if (def.workspaceKind !== ws.kind) {
        return defaultPersonaForRole(ws.role)
      }
      return prev
    })
  }, [])
  const setPersona = useCallback((p: PersonaId) => {
    const def = PERSONA_BY_ID[p]
    setPersonaState(p)
    setWorkspaceId((cur) => {
      const ws = getWorkspace(cur)
      if (ws.kind === def.workspaceKind) return cur
      const match = WORKSPACES.find((w) => w.kind === def.workspaceKind)
      return match?.id ?? cur
    })
  }, [])

  useEffect(() => {
    try {
      console.info(`[ip-harness] ${apiMockWriteModeLabel()}`)
      console.info(`[ip-harness] ${apiMockReadModeLabel()}`)
    } catch {
      /* ignore */
    }
  }, [])

  /** P0-4 · persona/workspace → cookie（localhost 跨端口可读） */
  useEffect(() => {
    writePersonaCookie(persona)
  }, [persona])
  useEffect(() => {
    writeWorkspaceCookie(workspaceId)
  }, [workspaceId])

  const [dataSourceMode, setDataSourceMode] = useState<DataSourceMode>('commercial_api')
  const [docketEvents, setDocketEvents] = useState<DocketEvent[]>(() =>
    INITIAL_DOCKET_EVENTS.map((e) => ({ ...e })),
  )
  const addDocketEvent = useCallback((ev: DocketEvent) => {
    setDocketEvents((prev) => [ev, ...prev])
  }, [])

  const [dynamicTodos, setDynamicTodos] = useState<WorkbenchTodo[]>([])
  const [dismissedSeedIds, setDismissedSeedIds] = useState<string[]>([])
  const [recentActivity, setRecentActivity] = useState([
    { id: 'a1', text: '「边缘计算节点调度方法」收到 OA，进入答复准备', time: '2 小时前' },
    { id: 'a2', text: '「工业视觉缺陷检测系统」许可谈判进入终轮', time: '5 小时前' },
    { id: 'a3', text: '「无人机集群协同避障」监测发现竞品新公开', time: '昨天' },
    { id: 'a4', text: '「固态电池电解质配方」完成现有技术检索', time: '昨天' },
    { id: 'a5', text: '「自动驾驶场景仿真」技术评审通过', time: '2 天前' },
  ])

  const [disclosures, setDisclosures] = useState<InventionDisclosure[]>([
    {
      id: 'd1',
      title: '固态电解质界面钝化层工艺',
      inventor: '陈研',
      dept: '材料研究院',
      tech: '硫化物电解质表面钝化，降低界面阻抗。',
      riskDate: '2026-10-01',
      targetStage: 'pre_research',
      status: '部门审核',
      submittedAt: '2026-09-02',
      timeline: [
        { id: 'dt1', time: '2026-09-01', status: '草稿', note: '发明人保存草稿' },
        { id: 'dt2', time: '2026-09-02', status: '已提交', note: '提交部门审核' },
        { id: 'dt3', time: '2026-09-03', status: '部门审核', note: '部门初审中' },
      ],
    },
    {
      id: 'd2',
      title: '模组热失控预警算法改进',
      inventor: '林晓',
      dept: '动力电池事业部',
      tech: '多传感器融合热失控早期预警。',
      riskDate: '',
      targetStage: 'decision',
      status: 'IP受理',
      submittedAt: '2026-08-28',
      timeline: [
        { id: 'dt1', time: '2026-08-26', status: '草稿', note: '草稿' },
        { id: 'dt2', time: '2026-08-28', status: '已提交', note: '提交' },
        { id: 'dt3', time: '2026-08-29', status: '部门审核', note: '部门通过' },
        { id: 'dt4', time: '2026-08-30', status: 'IP受理', note: 'IP 组受理中' },
      ],
    },
  ])

  const addActivity = useCallback((text: string) => {
    setRecentActivity((prev) => [
      { id: `act-${Date.now()}`, text, time: '刚刚' },
      ...prev.slice(0, 19),
    ])
  }, [])

  const [overdueStopEnabled, setOverdueStopEnabled] = useState(true)
  const [agencyIntents, setAgencyIntents] = useState<AgencyIntent[]>([])
  const [insightDrivenCount, setInsightDrivenCount] = useState(0)
  const [auditLog, setAuditLog] = useState<AuditEntry[]>([
    // Wave3 demo: pre-version entry → UI shows「legacy」
    {
      id: 'aud-legacy-seed-c1',
      actor: 'user',
      command: 'submitResearch',
      caseId: 'c1',
      at: '2026-08-01T10:00:00.000Z',
      detail: '（种子）历史调研提交 · 无 schemaVersion',
      // schemaVersion intentionally omitted
    },
  ])
  const [lastDomainWrite, setLastDomainWrite] = useState<{
    command: CommandName
    message: string
    at: string
  } | null>(null)

  const bumpInsightDriven = useCallback(() => {
    setInsightDrivenCount((n) => n + 1)
  }, [])

  /** P0-2 · 大块态：同口 LS + BroadcastChannel；跨口 mid bridge */
  const applyingRemoteSnap = useRef(false)
  const snapBootDone = useRef(false)
  useEffect(() => {
    const snap = readLocalSnapshot()
    if (!snap || snapBootDone.current) return
    snapBootDone.current = true
    applyingRemoteSnap.current = true
    if (snap.cases?.length) setCases(mergeCasesWithSeedById(snap.cases))
    if (snap.auditLog) setAuditLog(snap.auditLog)
    if (snap.flowProgressByCase) setFlowProgressByCase(snap.flowProgressByCase)
    if (snap.docketEvents) setDocketEvents(snap.docketEvents)
    queueMicrotask(() => {
      applyingRemoteSnap.current = false
    })
  }, [])

  /** 读路径样机 Inbox（另存；不拆现有 sla/watch/maintain Inbox） */
  const [apiMockInbox, setApiMockInbox] = useState<ApiMockInboxItem[]>([])
  const apiMockReadEnabled = isApiMockReadPreferred()

  const reloadFromApiMock = useCallback(async () => {
    if (!isApiMockReadPreferred()) {
      try {
        console.info('[ip-harness] 读路径开关已关 · 跳过 api-mock 拉取')
      } catch {
        /* ignore */
      }
      return
    }
    const [summaries, inbox] = await Promise.all([
      tryListCasesFromApiMock(),
      tryGetInboxFromApiMock(persona),
    ])
    if (summaries == null) {
      try {
        console.info(
          '[ip-harness] 读路径 listCases 失败 · fallback 内存 seed（按 id 不整表替换）',
        )
      } catch {
        /* ignore */
      }
    } else {
      const byId = new Map(summaries.map((s) => [s.id, s]))
      setCases((prev) =>
        prev.map((c) => {
          const s = byId.get(c.id)
          return s ? mergeCaseSummaryOntoPatentCase(c, s) : c
        }),
      )
      // seed 没有、仅 API 有的 id：跳过（避免半残 PatentCase）
      try {
        console.info(
          `[ip-harness] 读路径已 merge CaseSummary × ${summaries.length}（仅覆盖已有 seed id）`,
        )
      } catch {
        /* ignore */
      }
    }
    if (inbox == null) {
      try {
        console.info(
          '[ip-harness] 读路径 getInbox 失败 · apiMockInbox 保持原值 / 空',
        )
      } catch {
        /* ignore */
      }
    } else {
      setApiMockInbox(inbox)
      try {
        console.info(
          `[ip-harness] 读路径 apiMockInbox ← ${inbox.length} 条（样机·调试用）`,
        )
      } catch {
        /* ignore */
      }
    }
  }, [persona])

  useEffect(() => {
    if (!isApiMockReadPreferred()) return
    void reloadFromApiMock()
  }, [reloadFromApiMock])

  useEffect(() => {
    if (applyingRemoteSnap.current) return
    const snap: CrossPortSnapshotV1 = {
      v: 1,
      revisedAt: new Date().toISOString(),
      cases,
      auditLog,
      flowProgressByCase,
      docketEvents,
    }
    writeLocalSnapshot(snap)
  }, [cases, auditLog, flowProgressByCase, docketEvents])

  useEffect(() => {
    return subscribeCrossPortSnapshot((incoming) => {
      const local = readLocalSnapshot()
      const snap = pickNewerSnapshot(local, incoming) ?? incoming
      if (!snap) return
      applyingRemoteSnap.current = true
      const mergedCases = snap.cases?.length
        ? mergeCasesWithSeedById(snap.cases)
        : undefined
      if (mergedCases) setCases(mergedCases)
      if (snap.auditLog) setAuditLog(snap.auditLog)
      if (snap.flowProgressByCase) setFlowProgressByCase(snap.flowProgressByCase)
      if (snap.docketEvents) setDocketEvents(snap.docketEvents)
      try {
        writeLocalSnapshot(
          mergedCases ? { ...snap, cases: mergedCases } : snap,
        )
      } catch {
        /* ignore */
      }
      queueMicrotask(() => {
        applyingRemoteSnap.current = false
      })
    })
  }, [])


  const pushAudit = useCallback(
    (
      entry: Omit<AuditEntry, 'id' | 'at' | 'schemaVersion'> & {
        at?: string
        schemaVersion?: string
      },
    ) => {
      const at = entry.at ?? new Date().toISOString()
      const full: AuditEntry = {
        id: `aud-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
        actor: entry.actor,
        agentId: entry.agentId,
        command: entry.command,
        caseId: entry.caseId,
        at,
        detail: entry.detail,
        schemaVersion: entry.schemaVersion ?? AUDIT_SCHEMA_VERSION,
      }
      setAuditLog((prev) => [full, ...prev].slice(0, 200))
      setLastDomainWrite({
        command: entry.command,
        message: `已写入领域：${COMMAND_LABELS[entry.command]}`,
        at,
      })
      return full
    },
    [],
  )

  const getAuditForCase = useCallback(
    (caseId: string) => auditLog.filter((a) => a.caseId === caseId),
    [auditLog],
  )

  const recordCommitteeVote = useCallback(
    (input: {
      caseId: string
      reviewerId: string
      reviewerName: string
      vote: string
      comment?: string
    }): { ok: boolean; message: string; audited: boolean } => {
      if (!input.vote.trim()) {
        return { ok: false, message: '请选择投票意见', audited: false }
      }
      const audited = persona === 'committee'
      if (persona !== 'committee' && persona !== 'enterprise_ip') {
        return {
          ok: false,
          message: '当前 Persona 不可投票（请切委员或企业 IP）',
          audited: false,
        }
      }
      if (audited) {
        const at = new Date().toISOString()
        const entry = {
          id: `cv-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
          caseId: input.caseId,
          reviewerId: input.reviewerId,
          reviewerName: input.reviewerName,
          vote: input.vote,
          comment: input.comment?.trim() ?? '',
          persona,
          at,
        }
        setCommitteeVoteLog((prev) => [entry, ...prev].slice(0, 100))
        pushAudit({
          actor: 'user',
          command: 'approveHandoff',
          caseId: input.caseId,
          detail: `委员投票（可审计）· ${input.reviewerName}：${input.vote}${input.comment ? ` · ${input.comment}` : ''}`,
        })
        addActivity(
          `委员投票「${input.reviewerName}」→ ${input.vote}（案件 ${input.caseId}）`,
        )
        return { ok: true, message: '投票已记录（可审计）', audited: true }
      }
      return {
        ok: true,
        message: '已更新本地投票（企业代看·非委员审计票）',
        audited: false,
      }
    },
    [persona, pushAudit, addActivity],
  )

  const hasAuditedCommitteeVote = useCallback(
    (caseId: string) => committeeVoteLog.some((v) => v.caseId === caseId),
    [committeeVoteLog],
  )

  const setQuoteDispatchStatus = useCallback(
    (caseId: string, status: QuoteDispatchStatus) => {
      setCases((prev) =>
        prev.map((c) => (c.id === caseId ? { ...c, quoteDispatchStatus: status } : c)),
      )
    },
    [],
  )

  const hasBlockingInvoiceForCase = useCallback(
    (caseId: string) => {
      const c = cases.find((x) => x.id === caseId)
      const r = hasBlockingInvoice(c, { overdueStopEnabled })
      return { blocked: r.blocked, reason: r.reason }
    },
    [cases, overdueStopEnabled],
  )

  const getCase = useCallback((id: string) => cases.find((c) => c.id === id), [cases])

  const getHandoff = useCallback(
    (caseId: string, key: HandoffArtifactKey): HandoffStatus => {
      const c = cases.find((x) => x.id === caseId)
      return c?.handoffs[key]?.status ?? 'drafting'
    },
    [cases],
  )

  const getVersions = useCallback(
    (caseId: string, key: HandoffArtifactKey): ArtifactVersion[] => {
      const c = cases.find((x) => x.id === caseId)
      return c?.handoffs[key]?.versions ?? []
    },
    [cases],
  )

  const getCurrentVersionLabel = useCallback(
    (caseId: string, key: HandoffArtifactKey): string => {
      const versions = cases.find((x) => x.id === caseId)?.handoffs[key]?.versions ?? []
      if (versions.length === 0) return 'v0'
      return versions[versions.length - 1].version
    },
    [cases],
  )

  const updateEngagement = useCallback((caseId: string, patch: Partial<Engagement>) => {
    setCases((prev) =>
      prev.map((c) =>
        c.id === caseId ? { ...c, engagement: { ...c.engagement, ...patch } } : c,
      ),
    )
  }, [])

  const primaryHandoffKey = useCallback((stage: StageId) => ARTIFACT_FOR_STAGE[stage], [])

  const pushTodo = useCallback((todo: WorkbenchTodo) => {
    setDynamicTodos((prev) => upsertDynamicTodo(prev, { ...todo, source: todo.source ?? 'handoff' }))
    // 动态覆盖同案+工件时 dismiss 对应 seed，避免 Inbox 双计
    if (todo.handoffKey) {
      const ids = matchingSeedIdsForArtifact(todo.caseId, todo.handoffKey)
      if (ids.length > 0) {
        setDismissedSeedIds((prev) => Array.from(new Set([...prev, ...ids])))
      }
    }
  }, [])

  const escalateDocketEvent = useCallback(
    (
      eventId: string,
      action: DocketEscalateAction,
    ): { ok: boolean; message: string } => {
      // Fix3：发明人/委员不可改期限阶梯（Docket 页仍可只读浏览）
      if (persona === 'inventor' || persona === 'committee') {
        return {
          ok: false,
          message:
            persona === 'inventor'
              ? '发明人 Persona：不可升级/办结官方期限'
              : '委员 Persona：不可升级/办结官方期限',
        }
      }
      const ev = docketEvents.find((e) => e.id === eventId)
      if (!ev) return { ok: false, message: '期限事件不存在' }
      if (ev.status === 'done' && action !== 'complete') {
        return { ok: false, message: '已办结，无法升级' }
      }
      const allowed = ladderNextActions(ev)
      if (!allowed.includes(action)) {
        const level = effectiveEscalationLevel(ev)
        return {
          ok: false,
          message: `当前阶梯为「${level}」，不可执行 ${action}`,
        }
      }
      if (action !== 'complete' && !canEscalateStatus(ev.status, true)) {
        return { ok: false, message: '仅 overdue / due_soon 可走升级阶梯' }
      }

      const c = cases.find((x) => x.id === ev.caseId)
      const applied = applyEscalateAction(ev, action, {
        actor: role === 'enterprise' ? 'enterprise_user' : 'agency_user',
      })
      const nextEv = applied.event

      setDocketEvents((prev) =>
        prev.map((e) => (e.id === eventId ? nextEv : e)),
      )

      if (c) {
        setCases((prev) =>
          prev.map((item) => {
            if (item.id !== c.id) return item
            const risk =
              applied.caseRiskBump && item.risk !== '高'
                ? applied.caseRiskBump
                : item.risk
            return {
              ...item,
              risk,
              timeline: [
                {
                  id: `tl-dk-${Date.now()}`,
                  time: new Date().toISOString().slice(0, 10),
                  title: applied.timelineTitle,
                  desc: applied.timelineDesc,
                  type:
                    action === 'mark_at_risk'
                      ? 'warning'
                      : action === 'complete'
                        ? 'success'
                        : 'action',
                  badge: '期限升级',
                },
                ...item.timeline,
              ],
            }
          }),
        )
      }

      if (action === 'complete') {
        setDynamicTodos((prev) => completeDocketEscalateTodos(prev, eventId))
        pushAudit({
          actor: 'user',
          command: 'docketComplete',
          caseId: ev.caseId,
          detail: applied.auditDetail,
        })
        addActivity(`「${c?.title ?? ev.caseId}」期限已办结 · 升级待办已清`)
        return { ok: true, message: '已办结期限并清升级待办' }
      }

      if (action === 'escalate_enterprise' || action === 'mark_at_risk') {
        const todo = buildDocketEscalateTodo({
          event: nextEv,
          caseTitle: c?.title ?? ev.title,
          stage: c?.stage ?? 'prosecution',
        })
        setDynamicTodos((prev) => upsertDocketEscalateTodo(prev, todo))
      }

      pushAudit({
        actor: 'user',
        command: 'docketEscalate',
        caseId: ev.caseId,
        detail: applied.auditDetail,
      })
      const msg =
        action === 'remind'
          ? '已记录提醒 · 无真推送（演示通道）'
          : action === 'escalate_enterprise'
            ? '已升级到企业 IP · Inbox/待办可见'
            : '已标记风险 · Inbox 可见'
      addActivity(`「${c?.title ?? ev.caseId}」${msg}`)
      return { ok: true, message: msg }
    },
    [docketEvents, cases, role, persona, pushAudit, addActivity],
  )


  const transitionHandoff = useCallback(
    (
      caseId: string,
      key: HandoffArtifactKey,
      action: HandoffAction,
      note?: string,
      annotation?: string,
      extras?: { receiptNo?: string; filedAt?: string },
      auditMeta?: CommandMeta & { command?: CommandName; skipAudit?: boolean },
    ): { ok: boolean; message: string } => {
      const c = cases.find((x) => x.id === caseId)
      if (!c) return { ok: false, message: '案件不存在' }
      const current = c.handoffs[key]?.status ?? 'drafting'
      const mode = c.fulfillmentMode ?? 'delegated'
      const auditedVote = committeeVoteLog.some((v) => v.caseId === caseId)
      const check = canPerformHandoff(current, action, role, mode, {
        handoffKey: key,
        legalReview: c.legalReview,
        persona,
        committeeVoteHardBlockGo,
        hasAuditedCommitteeVote: auditedVote,
      })
      if (!check.ok) return { ok: false, message: check.reason ?? '非法操作' }

      // 双保险：intake_quote 批准/授权路径（confirmQuote）认 VoteGate
      if (
        key === 'intake_quote' &&
        (action === 'approve' || action === 'authorize') &&
        committeeVoteHardBlockGo &&
        !auditedVote
      ) {
        return { ok: false, message: COMMITTEE_VOTE_HARD_GATE_MSG }
      }

      if (
        role === 'agency' &&
        (action === 'submit' || action === 'file') &&
        overdueStopEnabled
      ) {
        const block = hasBlockingInvoice(c, { overdueStopEnabled })
        if (block.blocked) {
          return {
            ok: false,
            message: block.reason ?? '存在逾期发票，请先结清',
          }
        }
      }

      if (action === 'file') {
        if (!extras?.receiptNo?.trim() || !extras?.filedAt?.trim()) {
          return {
            ok: false,
            message: '递交归档须填写回执号（如 国知局电子申请回执 CN2026…）与递交日期',
          }
        }
      }

      const next = nextStatusForAction(action)
      const label = HANDOFF_ARTIFACT_LABELS[key]
      const roleLabel = role === 'enterprise' ? '企业 IP' : '代理所'
      const VERSIONING_ACTIONS: HandoffAction[] = [
        'submit',
        'approve',
        'request_changes',
        'authorize',
        'file',
        'save_draft',
      ]

      setCases((prev) =>
        prev.map((item) => {
          if (item.id !== caseId) return item
          const prevH = item.handoffs[key]
          const prevVersions = prevH?.versions ?? []
          let versions = prevVersions
          if (VERSIONING_ACTIONS.includes(action)) {
            const ver: ArtifactVersion = {
              id: `ver-${Date.now()}`,
              version: nextVersionLabel(prevVersions.length),
              at: today(),
              byRole: role,
              note: note ?? HANDOFF_LABELS[next],
              status: next,
              annotation:
                action === 'request_changes'
                  ? annotation || note || '请按意见修改'
                  : annotation,
            }
            versions = [...prevVersions, ver]
          }
          let engagement = item.engagement
          if (key === 'intake_quote') {
            if (action === 'submit') {
              engagement = {
                ...engagement,
                quoteBudget: note?.includes('报价')
                  ? note.replace(/^.*?报价[：:]?/, '').trim() || engagement.quoteBudget
                  : engagement.quoteBudget,
                paymentStatus: '报价待确认',
                phase: '接案评估',
              }
            } else if (action === 'approve' || action === 'authorize') {
              const due = new Date(Date.now() + 30 * 86400000).toISOString().slice(0, 10)
              const invTitle = `接案报价确认 · ${engagement.quoteBudget || '服务费'}`
              const has = (engagement.invoices ?? []).some(
                (i) => i.title === invTitle && i.status === '待开票',
              )
              const invoices = has
                ? engagement.invoices ?? []
                : [
                    ...(engagement.invoices ?? []),
                    {
                      id: `inv-quote-${Date.now()}`,
                      title: invTitle,
                      amount: engagement.quoteBudget || '待核定',
                      status: '待开票' as const,
                      due,
                      relatedStage: '立项决策',
                    },
                  ]
              engagement = {
                ...engagement,
                paymentStatus: '已确认待付款',
                phase: '正式委托',
                budgetApproved: engagement.budgetApproved || engagement.quoteBudget,
                invoices,
              }
            } else if (action === 'request_changes') {
              engagement = { ...engagement, paymentStatus: '报价待确认' }
            }
          }
          const receiptNo = action === 'file' ? extras?.receiptNo : prevH?.receiptNo
          const filedAt = action === 'file' ? extras?.filedAt : prevH?.filedAt
          const timelineExtra =
            action === 'file' && extras?.receiptNo
              ? [
                  {
                    id: `t-rcpt-${Date.now()}`,
                    time: extras.filedAt ?? today(),
                    title: '递交回执已归档',
                    desc: `回执号 ${extras.receiptNo} · ${extras.filedAt ?? today()}`,
                    type: 'success' as const,
                  },
                ]
              : []
          return {
            ...item,
            engagement,
            handoffs: {
              ...item.handoffs,
              [key]: {
                status: next,
                updatedAt: today(),
                updatedBy: role,
                note: note ?? HANDOFF_LABELS[next],
                versions,
                receiptNo,
                filedAt,
              },
            },
            timeline: [
              ...timelineExtra,
              {
                id: `t-${Date.now()}`,
                time: today(),
                title: `${label}：${HANDOFF_LABELS[current]} → ${HANDOFF_LABELS[next]}`,
                desc: `${roleLabel}${note ? ` · ${note}` : ''}${
                  action === 'file' && extras?.receiptNo
                    ? ` · 回执 ${extras.receiptNo}`
                    : ''
                }`,
                type:
                  next === 'changes_requested'
                    ? ('warning' as const)
                    : next === 'approved' || next === 'filed' || next === 'authorized_to_file'
                      ? ('success' as const)
                      : ('action' as const),
                badge:
                  action === 'file' && extras?.receiptNo
                    ? '业务回写'
                    : undefined,
              },
              ...item.timeline,
            ],
          }
        }),
      )

      addActivity(`「${c.title}」${label} ${HANDOFF_LABELS[next]}（${roleLabel}）`)

      if (action === 'file' && extras?.receiptNo) {
        const filedAt = extras.filedAt ?? today()
        const ruleId =
          key === 'prosecution_response'
            ? 'oa1_response'
            : key === 'maintain_annuity'
              ? 'annuity'
              : key === 'draft_claims'
                ? 'application_fee'
                : 'oa1_response'
        const due =
          key === 'prosecution_response'
            ? addMonths(filedAt, 4)
            : key === 'maintain_annuity'
              ? addMonths(filedAt, 12)
              : addMonths(filedAt, 2)
        setDocketEvents((prev) => [
          {
            id: `de-file-${Date.now()}`,
            caseId,
            ruleId: ruleId as 'oa1_response' | 'annuity' | 'application_fee',
            title:
              key === 'prosecution_response'
                ? `OA 答复已递交 · ${c.title}`
                : key === 'maintain_annuity'
                  ? `年费缴纳已确认 · ${c.title}`
                  : `申请已递交 · ${c.title}`,
            triggerDate: filedAt,
            dueDate: due,
            status: 'done',
            officialFeeHint: '递交归档生成 · 示意',
            linkedHandoffKey: key,
            note: `回执 ${extras.receiptNo} · 下一关注日 ${due}`,
            receiptNo: extras.receiptNo,
            fromHandoffWriteback: true,
          },
          ...prev,
        ])
        // bump case nextDeadline note via activity
        addActivity(`「${c.title}」期限已更新：回执归档后下一关注日 ${due}`)
      }

      // Wave2：交接成功 → 动态待办（运营真相源）
      const todoEffect = buildTodoFromHandoffTransition({
        caseId,
        caseTitle: c.title,
        stage: c.stage,
        key,
        action,
        due: c.nextDeadline,
      })
      if (todoEffect.kind === 'upsert') {
        pushTodo(todoEffect.todo)
      } else if (todoEffect.kind === 'complete') {
        setDynamicTodos((prev) => completeOpenDynamicTodos(prev, caseId, key))
        const seedIds = matchingSeedIdsForArtifact(caseId, key)
        if (seedIds.length > 0) {
          setDismissedSeedIds((prev) => Array.from(new Set([...prev, ...seedIds])))
        }
      }

      // 终端态再兜底 dismiss 同案+工件 seed（approve/authorize 已由 upsert 覆盖）
      if (next === 'filed' || next === 'authorized_to_file' || next === 'approved') {
        const seedIds = matchingSeedIdsForArtifact(caseId, key)
        if (seedIds.length > 0) {
          setDismissedSeedIds((prev) => Array.from(new Set([...prev, ...seedIds])))
        }
      }

      const actionMsg: Record<typeof action, string> = {
        save_draft: '草稿已保存',
        submit: '已提交企业审核',
        start_review: '已进入企业审核',
        request_changes: '已退回修改',
        approve: '已确认策略/批准',
        authorize: '已授权递交',
        file: '已确认递交归档',
      }
      const message = `${actionMsg[action]}（${HANDOFF_LABELS[next]}）`
      if (!auditMeta?.skipAudit) {
        const cmdName =
          auditMeta?.command ?? commandForHandoffAction(action, key)
        pushAudit({
          actor: auditMeta?.actor ?? 'user',
          agentId: auditMeta?.agentId,
          command: cmdName,
          caseId,
          detail:
            auditMeta?.detail ??
            `${HANDOFF_ARTIFACT_LABELS[key]} · ${message}${extras?.receiptNo ? ` · 回执 ${extras.receiptNo}` : ''}`,
        })
      }
      return { ok: true, message }
    },
    [
      cases,
      role,
      persona,
      addActivity,
      pushTodo,
      overdueStopEnabled,
      pushAudit,
      committeeVoteHardBlockGo,
      committeeVoteLog,
    ],
  )

  const todos = useMemo(
    () => mergeDynamicAndSeedTodos(dynamicTodos, dismissedSeedIds),
    [dynamicTodos, dismissedSeedIds],
  )

  const visibleCases = useMemo(
    () => filterCasesForWorkspace(cases, workspace),
    [cases, workspace],
  )

  const visibleCaseIds = useMemo(
    () => new Set(visibleCases.map((c) => c.id)),
    [visibleCases],
  )

  const workspaceTodos = useMemo(
    () => filterTodosForWorkspace(todos, workspace, visibleCaseIds),
    [todos, workspace, visibleCaseIds],
  )

  const visibleDocketEvents = useMemo(
    () => docketEvents.filter((e) => visibleCaseIds.has(e.caseId)),
    [docketEvents, visibleCaseIds],
  )

  const canAccessCase = useCallback(
    (id: string) => canAccessCaseFn(cases.find((c) => c.id === id), workspace),
    [cases, workspace],
  )

  const getHandoffState = useCallback(
    (caseId: string, key: HandoffArtifactKey) => {
      const h = cases.find((x) => x.id === caseId)?.handoffs[key]
      if (!h) return undefined
      return {
        status: h.status,
        receiptNo: h.receiptNo,
        filedAt: h.filedAt,
        note: h.note,
      }
    },
    [cases],
  )

  const setFulfillmentMode = useCallback((caseId: string, mode: FulfillmentMode) => {
    setCases((prev) =>
      prev.map((c) => (c.id === caseId ? { ...c, fulfillmentMode: mode } : c)),
    )
  }, [])

  const dispatchAgency = useCallback(
    (caseId: string, agencyName: string) => {
      setCases((prev) =>
        prev.map((c) => {
          if (c.id !== caseId) return c
          return {
            ...c,
            fulfillmentMode: 'delegated' as const,
            agencyName,
            assignedAgencyId: agencyIdFromName(agencyName),
            quoteDispatchStatus: 'assigned' as const,
            engagement: {
              ...c.engagement,
              agencyName,
              phase: c.engagement.phase === '接案评估' ? c.engagement.phase : '正式委托',
              paymentStatus:
                c.engagement.paymentStatus === '未报价'
                  ? '报价待确认'
                  : c.engagement.paymentStatus,
            },
            timeline: [
              {
                id: `t-${Date.now()}`,
                time: today(),
                title: '派单委托代理',
                desc: `已委托「${agencyName}」办理`,
                type: 'action' as const,
              },
              ...c.timeline,
            ],
          }
        }),
      )
      const c = cases.find((x) => x.id === caseId)
      addActivity(`「${c?.title ?? caseId}」已派单给「${agencyName}」`)
    },
    [cases, addActivity],
  )

  const setLinkedAlert = useCallback((caseId: string, alertId: string) => {
    setCases((prev) =>
      prev.map((c) => (c.id === caseId ? { ...c, linkedAlertId: alertId } : c)),
    )
  }, [])

  const ensureWatchAlerts = useCallback((caseId: string): WatchAlert[] => {
    const existing = watchAlertsByCase[caseId]
    if (existing) return existing
    const seed = watchSeed[caseId] ?? watchSeed.c9
    return seed.alerts.map(mapWatchSeedAlert)
  }, [watchAlertsByCase])

  const getWatchAlerts = useCallback(
    (caseId: string): WatchAlert[] => ensureWatchAlerts(caseId),
    [ensureWatchAlerts],
  )

  const getMaintainSchedule = useCallback(
    (caseId: string): MaintainScheduleRow[] => {
      const existing = maintainSchedulesByCase[caseId]
      if (existing) return existing
      const seed = maintainSeed[caseId as keyof typeof maintainSeed]
      if (seed?.schedule?.length) {
        return seed.schedule.map((r, i) => normalizeMaintainRow(r, i))
      }
      return []
    },
    [maintainSchedulesByCase],
  )

  const upsertMaintainSchedule = useCallback(
    (caseId: string, rows: MaintainScheduleRow[]) => {
      setMaintainSchedulesByCase((prev) => ({
        ...prev,
        [caseId]: rows.map((r, i) => normalizeMaintainRow(r, i)),
      }))
    },
    [],
  )

  const processWatchAlert = useCallback(
    (caseId: string, alertId: string, status: WatchAlertProcessStatus) => {
      let title = alertId
      setWatchAlertsByCase((prev) => {
        const base =
          prev[caseId] ??
          (watchSeed[caseId] ?? watchSeed.c9).alerts.map(mapWatchSeedAlert)
        const next = base.map((a) => {
          if (a.id !== alertId) return a
          title = a.title
          return { ...a, status }
        })
        return { ...prev, [caseId]: next }
      })
      const c = cases.find((x) => x.id === caseId)
      addActivity(`「${c?.title ?? caseId}」告警「${title}」→ ${status}`)
      return { ok: true, message: `告警已标记为「${status}」` }
    },
    [cases, addActivity],
  )

  const patchWatchAlert = useCallback(
    (
      caseId: string,
      alertId: string,
      patch: Partial<
        Pick<
          WatchAlert,
          'agencyOpinion' | 'enterpriseDecision' | 'note' | 'status' | 'title' | 'level'
        >
      >,
    ) => {
      setWatchAlertsByCase((prev) => {
        const base =
          prev[caseId] ??
          (watchSeed[caseId] ?? watchSeed.c9).alerts.map(mapWatchSeedAlert)
        return {
          ...prev,
          [caseId]: base.map((a) => (a.id === alertId ? { ...a, ...patch } : a)),
        }
      })
    },
    [],
  )

  const getDraftFilingCheck = useCallback(
    (caseId: string): DraftFilingCheck =>
      draftFilingCheckByCase[caseId] ?? EMPTY_DRAFT_FILING_CHECK,
    [draftFilingCheckByCase],
  )

  const setDraftFilingCheck = useCallback(
    (caseId: string, patch: Partial<DraftFilingCheck> | DraftFilingCheck) => {
      setDraftFilingCheckByCase((prev) => ({
        ...prev,
        [caseId]: {
          ...(prev[caseId] ?? { ...EMPTY_DRAFT_FILING_CHECK }),
          ...patch,
        },
      }))
    },
    [],
  )

  const toggleDraftFilingCheck = useCallback(
    (caseId: string, key: DraftFilingCheckKey) => {
      setDraftFilingCheckByCase((prev) => {
        const cur = prev[caseId] ?? { ...EMPTY_DRAFT_FILING_CHECK }
        return { ...prev, [caseId]: { ...cur, [key]: !cur[key] } }
      })
    },
    [],
  )

  const getDisclosurePackCheck = useCallback(
    (caseId: string): DisclosurePackCheck =>
      disclosurePackCheckByCase[caseId] ?? EMPTY_DISCLOSURE_PACK_CHECK,
    [disclosurePackCheckByCase],
  )

  const setDisclosurePackCheck = useCallback(
    (
      caseId: string,
      patch: Partial<DisclosurePackCheck> | DisclosurePackCheck,
    ) => {
      setDisclosurePackCheckByCase((prev) => ({
        ...prev,
        [caseId]: {
          ...(prev[caseId] ?? { ...EMPTY_DISCLOSURE_PACK_CHECK }),
          ...patch,
        },
      }))
    },
    [],
  )

  const toggleDisclosurePackCheck = useCallback(
    (caseId: string, key: DisclosurePackCheckKey) => {
      setDisclosurePackCheckByCase((prev) => {
        const cur = prev[caseId] ?? { ...EMPTY_DISCLOSURE_PACK_CHECK }
        return { ...prev, [caseId]: { ...cur, [key]: !cur[key] } }
      })
    },
    [],
  )

  const markDisclosurePackComplete = useCallback((caseId: string) => {
    setDisclosurePackCheckByCase((prev) => ({
      ...prev,
      [caseId]: { ...FULL_DISCLOSURE_PACK_CHECK },
    }))
  }, [])

  const setOaStatementConfirmed = useCallback(
    (caseId: string, confirmed: boolean) => {
      setCases((prev) =>
        prev.map((c) =>
          c.id === caseId ? { ...c, oaStatementConfirmed: confirmed } : c,
        ),
      )
      if (confirmed) {
        const c = cases.find((x) => x.id === caseId)
        addActivity(`「${c?.title ?? caseId}」意见陈述已确认`)
      }
    },
    [cases, addActivity],
  )

  const setLegalReview = useCallback(
    (caseId: string, status: LegalReviewStatus) => {
      setCases((prev) =>
        prev.map((c) => (c.id === caseId ? { ...c, legalReview: status } : c)),
      )
      const c = cases.find((x) => x.id === caseId)
      const label =
        status === 'reviewed'
          ? '法务已阅'
          : status === 'changes_requested'
            ? '法务退回'
            : '法务待审'
      addActivity(
        `「${c?.title ?? caseId}」法务审阅状态 → ${label}（非合同签署）`,
      )
    },
    [cases, addActivity],
  )

  const getCaseDriveItems = useCallback(
    (caseId: string): CaseDriveItem[] => caseDriveItemsByCase[caseId] ?? [],
    [caseDriveItemsByCase],
  )

  const appendCaseDriveItem = useCallback(
    (
      caseId: string,
      item: Omit<CaseDriveItem, 'id' | 'at'> & { id?: string; at?: string },
    ): CaseDriveItem | null => {
      const row: CaseDriveItem = {
        id: item.id ?? `drive-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
        kind: item.kind,
        title: item.title,
        summary: item.summary,
        at: item.at ?? today(),
        source: item.source,
      }
      setCaseDriveItemsByCase((prev) => ({
        ...prev,
        [caseId]: [row, ...(prev[caseId] ?? [])].slice(0, 40),
      }))
      return row
    },
    [],
  )

  const getFullCheckLite = useCallback(
    (caseId: string): FullCheckLite =>
      fullCheckLiteByCase[caseId] ?? { ...EMPTY_FULL_CHECK_LITE },
    [fullCheckLiteByCase],
  )

  const setFullCheckLite = useCallback(
    (caseId: string, patch: Partial<FullCheckLite>) => {
      setFullCheckLiteByCase((prev) => ({
        ...prev,
        [caseId]: {
          ...(prev[caseId] ?? { ...EMPTY_FULL_CHECK_LITE }),
          ...patch,
        },
      }))
    },
    [],
  )

  const toggleFullCheckLite = useCallback(
    (caseId: string, key: FullCheckLiteKey) => {
      setFullCheckLiteByCase((prev) => {
        const cur = prev[caseId] ?? { ...EMPTY_FULL_CHECK_LITE }
        return {
          ...prev,
          [caseId]: { ...cur, [key]: !cur[key] },
        }
      })
    },
    [],
  )

  const addInvoice = useCallback(
    (caseId: string, inv: Omit<CaseInvoice, 'id'> & { id?: string }): CaseInvoice | null => {
      const invoice: CaseInvoice = {
        id: inv.id ?? `inv-${Date.now()}`,
        title: inv.title,
        amount: inv.amount,
        status: inv.status,
        due: inv.due,
        relatedStage: inv.relatedStage,
      }
      let ok = false
      setCases((prev) =>
        prev.map((c) => {
          if (c.id !== caseId) return c
          ok = true
          const invoices = [...(c.engagement.invoices ?? []), invoice]
          return { ...c, engagement: { ...c.engagement, invoices } }
        }),
      )
      if (ok) addActivity(`新增发票：${invoice.title}（${invoice.status}）`)
      return ok ? invoice : null
    },
    [addActivity],
  )

  const updateInvoiceStatus = useCallback(
    (caseId: string, invoiceId: string, status: InvoiceStatus) => {
      setCases((prev) =>
        prev.map((c) => {
          if (c.id !== caseId) return c
          const invoices = (c.engagement.invoices ?? []).map((i) =>
            i.id === invoiceId ? { ...i, status } : i,
          )
          let paymentStatus = c.engagement.paymentStatus
          if (status === '已付款') {
            const allPaid = invoices.every((i) => i.status === '已付款')
            paymentStatus = allPaid ? '已结清' : '部分付款'
          }
          return {
            ...c,
            engagement: { ...c.engagement, invoices, paymentStatus },
            timeline: [
              {
                id: `t-inv-${Date.now()}`,
                time: today(),
                title: `发票状态 → ${status}`,
                desc: invoices.find((i) => i.id === invoiceId)?.title ?? invoiceId,
                type: status === '已付款' ? ('success' as const) : ('info' as const),
              },
              ...c.timeline,
            ],
          }
        }),
      )
      addActivity(`发票 ${invoiceId} 标记为「${status}」`)
    },
    [addActivity],
  )

  const appendDraftInvoice = useCallback(
    (
      caseId: string,
      opts: { title: string; amount: string; relatedStage: string },
    ): CaseInvoice | null => {
      const c = cases.find((x) => x.id === caseId)
      if (!c) return null
      const exists = (c.engagement.invoices ?? []).some(
        (i) => i.title === opts.title && i.status === '待开票',
      )
      if (exists) return null
      const due = new Date(Date.now() + 30 * 86400000).toISOString().slice(0, 10)
      return addInvoice(caseId, {
        title: opts.title,
        amount: opts.amount,
        status: '待开票',
        due,
        relatedStage: opts.relatedStage,
      })
    },
    [cases, addInvoice],
  )

  const submitDisclosure = useCallback(
    (input: {
      title: string
      inventor: string
      dept: string
      tech: string
      techTheme?: string
      patentType?: PatentType
      contact?: string
      riskDate: string
      targetStage: 'pre_research' | 'decision'
    }): InventionDisclosure => {
      const now = today()
      const d: InventionDisclosure = {
        id: `d-${Date.now()}`,
        title: input.title,
        inventor: input.inventor,
        dept: input.dept,
        tech: input.tech,
        techTheme: input.techTheme?.trim() || undefined,
        patentType: input.patentType ?? '发明',
        contact: input.contact?.trim() || '待填写',
        riskDate: input.riskDate,
        targetStage: input.targetStage,
        status: '部门审核',
        submittedAt: now,
        timeline: [
          { id: `dt-${Date.now()}-0`, time: now, status: '草稿', note: '发明人填写' },
          { id: `dt-${Date.now()}-1`, time: now, status: '已提交', note: '提交交底' },
          { id: `dt-${Date.now()}-2`, time: now, status: '部门审核', note: '进入部门审核队列' },
        ],
      }
      setDisclosures((prev) => [d, ...prev])
      addActivity(`研发交底「${d.title}」已提交 · 部门审核`)
      return d
    },
    [addActivity],
  )


  const addCase = useCallback(
    (partial: Partial<PatentCase> & Pick<PatentCase, 'title' | 'stage'>): PatentCase => {
      const meta = getStageMeta(partial.stage)
      // Allow agent mock seed ids (mock-case-*); default keeps prior c-<ts>
      const id = partial.id?.trim() || `c-${Date.now()}`
      const checklist: ChecklistItem[] = meta.defaultChecklist.map((item) => ({
        ...item,
        done: false,
      }))
      const handoffKey = ARTIFACT_FOR_STAGE[partial.stage]
      const newCase: PatentCase = {
        id,
        title: partial.title,
        caseNo: partial.caseNo ?? `ID-${new Date().getFullYear()}-${String(Date.now()).slice(-4)}`,
        type: partial.type ?? '发明',
        ownerTeam: partial.ownerTeam ?? '创新孵化组',
        stage: partial.stage,
        risk: partial.risk ?? '中',
        nextDeadline:
          partial.nextDeadline ??
          new Date(Date.now() + 14 * 86400000).toISOString().slice(0, 10),
        progress: partial.progress ?? 8,
        inventor: partial.inventor ?? '待指定',
        summary: partial.summary ?? '',
        checklist,
        artifacts: partial.artifacts ?? [],
        timeline: [
          {
            id: `t-${Date.now()}`,
            time: today(),
            title: '案件创建',
            desc: partial.summary || '由赛道洞察生成立项前调研案件',
            type: 'action',
          },
        ],
        agencyName: partial.agencyName ?? '—',
        enterpriseContact: partial.enterpriseContact ?? '企业 IP / 创新孵化组',
        fulfillmentMode: partial.fulfillmentMode ?? 'self_serve',
        ownerEnterpriseId:
          partial.ownerEnterpriseId ??
          (workspace.kind === 'enterprise' ? workspace.tenantId : ENTERPRISE_XINGHE),
        assignedAgencyId:
          partial.assignedAgencyId ??
          (partial.agencyName ? agencyIdFromName(partial.agencyName) : undefined) ??
          (workspace.kind === 'agency' ? workspace.tenantId : undefined),
        linkedAlertId: partial.linkedAlertId,
        quoteDispatchStatus: partial.quoteDispatchStatus ?? (partial.assignedAgencyId || (partial.agencyName && partial.agencyName !== '—') ? 'assigned' : 'none'),
        fromInsight: partial.fromInsight,
        engagement: partial.engagement
          ? {
              ...partial.engagement,
              invoices: partial.engagement.invoices ?? [],
            }
          : {
              phase: '接案评估',
              quoteBudget: '待评估',
              paymentStatus: '未报价',
              invoices: [],
            },
        handoffs: {
          ...(handoffKey
            ? {
                [handoffKey]: {
                  status: 'drafting' as const,
                  updatedAt: today(),
                  updatedBy: 'enterprise' as const,
                  note: '新建案件，开始起草',
                },
              }
            : {}),
          ...(partial.handoffs ?? {}),
        },
      }
      setCases((prev) => [newCase, ...prev])
      addActivity(`新建案件「${newCase.title}」· ${meta.name}`)
      return newCase
    },
    [addActivity, workspace],
  )

  const visibleAgencyIntents = useMemo(() => {
    if (workspace.kind === 'enterprise') {
      return agencyIntents.filter(
        (i) =>
          i.ownerEnterpriseId === workspace.tenantId && i.status === 'intent',
      )
    }
    return agencyIntents.filter((i) => i.agencyId === workspace.tenantId)
  }, [agencyIntents, workspace])

  const submitAgencyIntent = useCallback(
    (input: {
      caseId: string
      agencyId: string
      agencyName: string
      node: string
      quoteBudget?: string
      note?: string
    }): AgencyIntent | null => {
      const c = cases.find((x) => x.id === input.caseId)
      if (!c) return null
      const intent: AgencyIntent = {
        id: `ai-${Date.now()}`,
        caseId: input.caseId,
        agencyId: input.agencyId,
        agencyName: input.agencyName,
        node: input.node,
        status: 'intent',
        createdAt: today(),
        quoteBudget: input.quoteBudget,
        ownerEnterpriseId: c.ownerEnterpriseId,
        note: input.note,
      }
      setAgencyIntents((prev) => [intent, ...prev])
      setCases((prev) =>
        prev.map((item) => {
          if (item.id !== input.caseId) return item
          const status = item.quoteDispatchStatus
          const nextStatus: QuoteDispatchStatus =
            !status || status === 'none' ? 'intent' : status
          return {
            ...item,
            quoteDispatchStatus: nextStatus,
            timeline: [
              {
                id: `t-intent-${Date.now()}`,
                time: today(),
                title: '询价/抢单意向',
                desc: `「${input.agencyName}」对节点「${input.node}」提交意向`,
                type: 'action' as const,
              },
              ...item.timeline,
            ],
          }
        }),
      )
      addActivity(
        `「${c.title}」收到「${input.agencyName}」询价意向 · ${input.node}`,
      )
      return intent
    },
    [cases, addActivity],
  )

  const acceptAgencyIntent = useCallback(
    (intentId: string): { ok: boolean; message: string } => {
      const intent = agencyIntents.find((i) => i.id === intentId)
      if (!intent || intent.status !== 'intent') {
        return { ok: false, message: '意向不存在或已处理' }
      }
      const c = cases.find((x) => x.id === intent.caseId)
      if (!c) return { ok: false, message: '案件不存在' }
      if (
        workspace.kind === 'enterprise' &&
        c.ownerEnterpriseId !== workspace.tenantId
      ) {
        return { ok: false, message: '无权处理该意向' }
      }

      const due = new Date(Date.now() + 30 * 86400000).toISOString().slice(0, 10)
      const quote = intent.quoteBudget || c.engagement.quoteBudget || '待核定'
      const invTitle = `意向确认报价 · ${intent.agencyName}`

      setAgencyIntents((prev) =>
        prev.map((i) =>
          i.id === intentId
            ? { ...i, status: 'accepted' as const }
            : i.caseId === intent.caseId && i.status === 'intent'
              ? { ...i, status: 'ignored' as const }
              : i,
        ),
      )
      setCases((prev) =>
        prev.map((item) => {
          if (item.id !== intent.caseId) return item
          const invoices = [...(item.engagement.invoices ?? [])]
          if (!invoices.some((x) => x.title === invTitle && x.status === '待开票')) {
            invoices.push({
              id: `inv-intent-${Date.now()}`,
              title: invTitle,
              amount: quote,
              status: '待开票',
              due,
              relatedStage: '接案评估',
            })
          }
          return {
            ...item,
            fulfillmentMode: 'delegated' as const,
            agencyName: intent.agencyName,
            assignedAgencyId: intent.agencyId,
            quoteDispatchStatus: 'assigned' as const,
            engagement: {
              ...item.engagement,
              agencyName: intent.agencyName,
              quoteBudget: quote,
              paymentStatus: '已确认待付款',
              phase: '正式委托',
              budgetApproved: quote,
              invoices,
            },
            timeline: [
              {
                id: `t-acc-${Date.now()}`,
                time: today(),
                title: '接受报价并派所',
                desc: `已接受「${intent.agencyName}」意向 · 节点 ${intent.node}`,
                type: 'success' as const,
              },
              ...item.timeline,
            ],
          }
        }),
      )
      addActivity(
        `「${c.title}」已接受「${intent.agencyName}」报价并派所`,
      )
      return { ok: true, message: `已接受「${intent.agencyName}」并派所` }
    },
    [agencyIntents, cases, workspace, addActivity],
  )

  const ignoreAgencyIntent = useCallback(
    (intentId: string): { ok: boolean; message: string } => {
      const intent = agencyIntents.find((i) => i.id === intentId)
      if (!intent || intent.status !== 'intent') {
        return { ok: false, message: '意向不存在或已处理' }
      }
      setAgencyIntents((prev) =>
        prev.map((i) =>
          i.id === intentId ? { ...i, status: 'ignored' as const } : i,
        ),
      )
      addActivity(`已忽略「${intent.agencyName}」对案件 ${intent.caseId} 的意向`)
      return { ok: true, message: '已忽略该意向' }
    },
    [agencyIntents, addActivity],
  )

  const pendingPayInvoiceCount = useMemo(() => {
    return visibleCases.reduce((n, c) => {
      const invs = c.engagement.invoices ?? []
      return n + invs.filter((i) => i.status === '已开票' || i.status === '逾期').length
    }, 0)
  }, [visibleCases])

  const pendingDisclosures = useMemo(
    () =>
      disclosures.filter((d) =>
        ['已提交', '部门审核', 'IP受理'].includes(d.status),
      ),
    [disclosures],
  )

  const advanceDisclosure = useCallback(
    (
      id: string,
      next: DisclosureStatus,
      note?: string,
    ): { ok: boolean; message: string; caseId?: string } => {
      const d = disclosures.find((x) => x.id === id)
      if (!d) return { ok: false, message: '交底不存在' }

      const allowed: Record<DisclosureStatus, DisclosureStatus[]> = {
        草稿: ['已提交', '退回'],
        已提交: ['部门审核', '退回'],
        部门审核: ['IP受理', '退回'],
        IP受理: ['已立案', '退回'],
        已立案: [],
        退回: ['已提交', '部门审核'],
      }
      if (!allowed[d.status]?.includes(next)) {
        return {
          ok: false,
          message: `不可从「${d.status}」直接跳到「${next}」；须按 部门审核 → IP受理 → 已立案 推进`,
        }
      }

      let createdCaseId: string | undefined
      if (next === '已立案') {
        const created = addCase({
          title: `${d.title}（研发交底）`,
          stage: d.targetStage,
          type: d.patentType ?? '发明',
          ownerTeam: d.dept,
          risk: d.riskDate ? '高' : '中',
          inventor: d.inventor,
          summary: `研发交底 IP 受理立案。技术主题：${d.techTheme || d.title}。技术方案：${d.tech || '（未填写）'}。公开风险日：${d.riskDate || '未标注'}。联系人：${d.contact || '待填写'}。待结构化交底包。`,
          nextDeadline:
            d.riskDate ||
            new Date(Date.now() + 14 * 86400000).toISOString().slice(0, 10),
          fulfillmentMode: 'self_serve',
          agencyName: '—',
          handoffs: {
            disclosure_pack: {
              status: 'drafting',
              updatedAt: today(),
              updatedBy: 'enterprise',
              note: '待结构化交底包 · 请用交底整理 Agent 或门户补齐',
            },
          },
        })
        createdCaseId = created.id
      }

      setDisclosures((prev) =>
        prev.map((item) => {
          if (item.id !== id) return item
          return {
            ...item,
            status: next,
            caseId: createdCaseId ?? item.caseId,
            timeline: [
              ...item.timeline,
              {
                id: `dt-${Date.now()}`,
                time: today(),
                status: next,
                note:
                  note ??
                  (next === '已立案'
                    ? `IP 受理立案，案件 ${createdCaseId}`
                    : `状态变更为「${next}」`),
              },
            ],
          }
        }),
      )
      addActivity(`交底「${d.title}」→ ${next}${createdCaseId ? ` · 案件 ${createdCaseId}` : ''}`)
      return {
        ok: true,
        message:
          next === '已立案'
            ? `已立案并创建案件`
            : `已更新为「${next}」`,
        caseId: createdCaseId,
      }
    },
    [disclosures, addActivity, addCase],
  )

  const toggleChecklist = useCallback((caseId: string, itemId: string) => {
    setCases((prev) =>
      prev.map((c) => {
        if (c.id !== caseId) return c
        const checklist = c.checklist.map((item) =>
          item.id === itemId ? { ...item, done: !item.done } : item,
        )
        const required = checklist.filter((i) => i.required)
        const doneReq = required.filter((i) => i.done).length
        const pct = Math.round((doneReq / Math.max(required.length, 1)) * 90)
        return {
          ...c,
          checklist,
          progress: Math.min(99, Math.max(c.progress, pct)),
        }
      }),
    )
  }, [])

  const markChecklistDone = useCallback((caseId: string, itemIds?: string[]) => {
    setCases((prev) =>
      prev.map((c) => {
        if (c.id !== caseId) return c
        const checklist = c.checklist.map((item) => {
          if (!itemIds || itemIds.includes(item.id)) {
            return { ...item, done: true }
          }
          return item
        })
        const required = checklist.filter((i) => i.required)
        const doneReq = required.filter((i) => i.done).length
        const pct = Math.round((doneReq / Math.max(required.length, 1)) * 90)
        return {
          ...c,
          checklist,
          progress: Math.min(99, Math.max(c.progress, pct)),
        }
      }),
    )
  }, [])

  const addArtifact = useCallback((caseId: string, name: string, type: string) => {
    setCases((prev) =>
      prev.map((c) => {
        if (c.id !== caseId) return c
        return {
          ...c,
          artifacts: [
            { id: `art-${Date.now()}`, name, type, updatedAt: today() },
            ...c.artifacts,
          ],
        }
      }),
    )
  }, [])

  const advanceFromWorkbench = useCallback(
    (
      caseId: string,
      opts?: { note?: string; resolveDoneIds?: string[] },
    ): { ok: boolean; message: string } => {
      const c = cases.find((x) => x.id === caseId)
      if (!c) return { ok: false, message: '案件不存在' }
      const idx = getStageIndex(c.stage)
      if (idx >= STAGE_ORDER.length - 1) {
        return { ok: false, message: '已处于最终阶段' }
      }

      // 清单须真实齐套；禁止伪造批准捷径。
      // resolveDoneIds：仅本动作诚实完成的项（如 Go 签署 c4），非宽写捷径。
      const resolve = new Set(opts?.resolveDoneIds ?? [])
      const incomplete = c.checklist.filter(
        (i) => i.required && !i.done && !resolve.has(i.id),
      )
      if (incomplete.length > 0) {
        return {
          ok: false,
          message: `清单未齐：尚有 ${incomplete.length} 项必做未完成（${incomplete.map((i) => i.label).slice(0, 3).join('、')}${incomplete.length > 3 ? '…' : ''}）`,
        }
      }

      // VoteGate：立项决策阶段晋级（Go）须有效委员票（flag ON）
      if (
        c.stage === 'decision' &&
        committeeVoteHardBlockGo &&
        !committeeVoteLog.some((v) => v.caseId === caseId)
      ) {
        return { ok: false, message: COMMITTEE_VOTE_HARD_GATE_MSG }
      }

      const curKey = ARTIFACT_FOR_STAGE[c.stage]
      if (curKey) {
        const st = c.handoffs[curKey]?.status
        const okStatus =
          st === 'approved' || st === 'filed' || st === 'authorized_to_file'
        if (!okStatus) {
          return {
            ok: false,
            message: `当前阶段交接未批准：${curKey} 为「${st ?? '无'}」，须先走真实批准/归档后再晋级`,
          }
        }
      }

      const nextStage = STAGE_ORDER[idx + 1]
      const meta = getStageMeta(nextStage)
      const newChecklist: ChecklistItem[] = meta.defaultChecklist.map((item) => ({
        ...item,
        done: false,
      }))
      const note = opts?.note ?? '业务工作台办理完成并转入下一阶段'
      const nextKey = ARTIFACT_FOR_STAGE[nextStage]

      setCases((prev) =>
        prev.map((item) => {
          if (item.id !== caseId) return item
          const handoffs = { ...item.handoffs }
          // 不伪造 curKey=approved：晋级前已要求真实 approved/filed
          if (nextKey && !handoffs[nextKey]) {
            handoffs[nextKey] = {
              status: 'drafting',
              updatedAt: today(),
              updatedBy: role,
              note: '新阶段起草',
            }
          }
          return {
            ...item,
            stage: nextStage,
            progress: 10,
            checklist: newChecklist,
            handoffs,
            timeline: [
              {
                id: `t-${Date.now()}`,
                time: today(),
                title: `业务办理完成 → ${meta.name}`,
                desc: note,
                type: 'success' as const,
              },
              ...item.timeline,
            ],
          }
        }),
      )
      addActivity(`「${c.title}」业务办理完成，进入「${meta.name}」`)
      return { ok: true, message: `已转入「${meta.name}」` }
    },
    [cases, addActivity, role, committeeVoteHardBlockGo, committeeVoteLog],
  )

  const recordIntakeNoGo = useCallback(
    (caseId: string, reason: string): { ok: boolean; message: string } => {
      const c = cases.find((x) => x.id === caseId)
      if (!c) return { ok: false, message: '案件不存在' }
      const key: HandoffArtifactKey = 'intake_quote'
      const note = `No-Go：${reason}`
      setCases((prev) =>
        prev.map((item) => {
          if (item.id !== caseId) return item
          const prevH = item.handoffs[key]
          const prevVersions = prevH?.versions ?? []
          const ver: ArtifactVersion = {
            id: `ver-${Date.now()}`,
            version: nextVersionLabel(prevVersions.length),
            at: today(),
            byRole: role,
            note,
            status: 'changes_requested',
            annotation: reason,
          }
          return {
            ...item,
            risk: item.risk === '低' ? '中' : item.risk,
            handoffs: {
              ...item.handoffs,
              [key]: {
                status: 'changes_requested',
                updatedAt: today(),
                updatedBy: role,
                note,
                versions: [...prevVersions, ver],
                receiptNo: prevH?.receiptNo,
                filedAt: prevH?.filedAt,
              },
            },
            timeline: [
              {
                id: `t-${Date.now()}`,
                time: today(),
                title: '立项 No-Go',
                desc: note,
                type: 'warning' as const,
              },
              ...item.timeline,
            ],
          }
        }),
      )
      addActivity(`「${c.title}」立项 No-Go：${reason}`)
      return { ok: true, message: '已记录 No-Go（intake_quote → 退回修改）' }
    },
    [cases, addActivity, role],
  )

  const attachHandoffArtifact = useCallback(
    (
      caseId: string,
      key: HandoffArtifactKey,
      opts?: { note?: string; summary?: string },
    ): { ok: boolean; message: string; created: boolean } => {
      const c = cases.find((x) => x.id === caseId)
      if (!c) return { ok: false, message: '案件不存在', created: false }
      const label = HANDOFF_ARTIFACT_LABELS[key] ?? key
      if (c.handoffs[key]) {
        return {
          ok: true,
          message: `「${c.title}」已挂有 ${label}（${c.handoffs[key]?.status ?? 'drafting'}）· 未改写`,
          created: false,
        }
      }
      const note =
        opts?.note?.trim() ||
        `补挂 ${label}（drafting · 不绕过 REQUIRED · 不等于批准）`
      const summary =
        opts?.summary?.trim() ||
        `补挂 ${key} 至 drafting，供布局台 CasePicker 可见`
      setCases((prev) =>
        prev.map((item) => {
          if (item.id !== caseId) return item
          return {
            ...item,
            handoffs: {
              ...item.handoffs,
              [key]: {
                status: 'drafting' as const,
                updatedAt: today(),
                updatedBy: role,
                note,
                versions: [
                  {
                    id: `ver-attach-${Date.now()}`,
                    version: 'v1',
                    at: today(),
                    byRole: role,
                    note,
                    status: 'drafting' as const,
                  },
                ],
              },
            },
            timeline: [
              {
                id: `t-attach-${Date.now()}`,
                time: today(),
                title: `补挂 ${label}`,
                desc: note,
                type: 'action' as const,
                badge: '补挂交接',
              },
              ...item.timeline,
            ],
          }
        }),
      )
      appendCaseDriveItem(caseId, {
        kind: 'other',
        title: `补挂 ${label}`,
        summary,
        source: 'layout-attach-insight',
      })
      addActivity(`「${c.title}」补挂 ${label}（drafting）`)
      return {
        ok: true,
        message: `已补挂 ${label} → drafting（CasePicker 可见 · 仍须齐套后提交/批准）`,
        created: true,
      }
    },
    [cases, role, addActivity, appendCaseDriveItem],
  )

  /** 案件详情闸门：与 advanceFromWorkbench 同口径（清单 + 交接批准），禁止绕过 */
  const passGate = useCallback(
    (caseId: string): { ok: boolean; message: string } =>
      advanceFromWorkbench(caseId, { note: '案件详情闸门通过' }),
    [advanceFromWorkbench],
  )

  const rejectGate = useCallback(
    (caseId: string) => {
      const c = cases.find((x) => x.id === caseId)
      if (!c) return
      const idx = getStageIndex(c.stage)
      if (idx <= 0) return
      const prevStage = STAGE_ORDER[idx - 1]
      const meta = getStageMeta(prevStage)
      const newChecklist: ChecklistItem[] = meta.defaultChecklist.map((item) => ({
        ...item,
        done: item.required ? true : false,
      }))
      setCases((prev) =>
        prev.map((item) => {
          if (item.id !== caseId) return item
          return {
            ...item,
            stage: prevStage,
            progress: 70,
            checklist: newChecklist,
            timeline: [
              {
                id: `t-${Date.now()}`,
                time: today(),
                title: `退回 → ${meta.name}`,
                desc: '闸门退回，需补充材料后重新推进',
                type: 'warning' as const,
              },
              ...item.timeline,
            ],
          }
        }),
      )
      addActivity(`「${c.title}」被退回至「${meta.name}」`)
    },
    [cases, addActivity],
  )

  const getFlowNodeProgress = useCallback(
    (caseId: string, flowKey: FlowKey): CaseFlowNodeProgress | undefined => {
      return flowProgressByCase[caseId]?.[flowKey]
    },
    [flowProgressByCase],
  )

  const getCaseFlowProgress = useCallback(
    (caseId: string): Partial<Record<FlowKey, CaseFlowNodeProgress>> => {
      return flowProgressByCase[caseId] ?? {}
    },
    [flowProgressByCase],
  )

  const setFlowNodeProgress = useCallback(
    (caseId: string, flowKey: FlowKey, stepIndex: number) => {
      const safe = Math.max(0, Math.floor(stepIndex))
      const stepId = `s${safe}`
      const updatedAt = new Date().toISOString()
      setFlowProgressByCase((prev) => {
        const cur = prev[caseId]?.[flowKey]
        // 单调抬高：推导进度 / UI 回退时不擦更高水位（换案水合除外由调用方设绝对值）
        if (cur && safe < cur.stepIndex) {
          return prev
        }
        if (cur && safe === cur.stepIndex) {
          return prev
        }
        return {
          ...prev,
          [caseId]: {
            ...(prev[caseId] ?? {}),
            [flowKey]: { stepIndex: safe, stepId, updatedAt },
          },
        }
      })
    },
    [],
  )


  const dispatchCommandLocal = useCallback(
    (cmd: DomainCommand, meta?: CommandMeta): CommandResult => {
      const actor = meta?.actor ?? 'user'
      const agentId = meta?.agentId
      const auditBase = { actor, agentId, detail: meta?.detail }

      /** P0-3 · Agent/HITL 写回成功后抬升 flowProgressByCase（中台可见） */
      const withFlowBump = (r: CommandResult): CommandResult => {
        if (!r.ok || !r.caseId) return r
        const caze = cases.find((c) => c.id === r.caseId)
        const handoffKey =
          'handoffKey' in cmd
            ? (cmd as { handoffKey?: import('@ip/domain/types').HandoffArtifactKey }).handoffKey
            : undefined
        const flowKey = resolveFlowKey({
          stage: caze?.stage,
          handoffKey,
        })
        if (!flowKey) return r
        const floor = progressFloorForCommand(r.command, flowKey)
        setFlowNodeProgress(r.caseId, flowKey, floor)
        return r
      }

      switch (cmd.type) {
        case 'submitResearch': {
          const r = transitionHandoff(
            cmd.caseId,
            'research_report',
            'submit',
            cmd.note ?? '调研结论提交企业审核',
            undefined,
            undefined,
            { ...auditBase, command: 'submitResearch' },
          )
          if (r.ok && cmd.artifactName) {
            addArtifact(cmd.caseId, cmd.artifactName, '报告')
          }
          return withFlowBump({ ...r, caseId: cmd.caseId, command: 'submitResearch' })
        }
        case 'submitClaims': {
          const r = transitionHandoff(
            cmd.caseId,
            'draft_claims',
            'submit',
            cmd.note ?? '权利要求草稿提交审核',
            undefined,
            undefined,
            { ...auditBase, command: 'submitClaims' },
          )
          return withFlowBump({ ...r, caseId: cmd.caseId, command: 'submitClaims' })
        }
        case 'analyzeAndSubmitOA': {
          const r = transitionHandoff(
            cmd.caseId,
            'prosecution_response',
            'submit',
            cmd.note ?? 'OA 答复策略提交审核',
            undefined,
            undefined,
            { ...auditBase, command: 'analyzeAndSubmitOA' },
          )
          return withFlowBump({ ...r, caseId: cmd.caseId, command: 'analyzeAndSubmitOA' })
        }
        case 'submitHandoff': {
          const r = transitionHandoff(
            cmd.caseId,
            cmd.handoffKey,
            'submit',
            cmd.note,
            undefined,
            undefined,
            { ...auditBase, command: 'submitHandoff' },
          )
          return withFlowBump({ ...r, caseId: cmd.caseId, command: 'submitHandoff' })
        }
        case 'saveDraft': {
          const r = transitionHandoff(
            cmd.caseId,
            cmd.handoffKey,
            'save_draft',
            cmd.note,
            undefined,
            undefined,
            { ...auditBase, command: 'saveDraft' },
          )
          return withFlowBump({ ...r, caseId: cmd.caseId, command: 'saveDraft' })
        }
        case 'startReview': {
          const r = transitionHandoff(
            cmd.caseId,
            cmd.handoffKey,
            'start_review',
            cmd.note,
            undefined,
            undefined,
            { ...auditBase, command: 'startReview' },
          )
          return withFlowBump({ ...r, caseId: cmd.caseId, command: 'startReview' })
        }
        case 'approveHandoff': {
          const r = transitionHandoff(
            cmd.caseId,
            cmd.handoffKey,
            'approve',
            cmd.note ?? '批准策略',
            undefined,
            undefined,
            { ...auditBase, command: 'approveHandoff' },
          )
          return withFlowBump({ ...r, caseId: cmd.caseId, command: 'approveHandoff' })
        }
        case 'confirmQuote': {
          const r = transitionHandoff(
            cmd.caseId,
            'intake_quote',
            'approve',
            cmd.note ?? '确认报价',
            undefined,
            undefined,
            { ...auditBase, command: 'confirmQuote' },
          )
          return withFlowBump({ ...r, caseId: cmd.caseId, command: 'confirmQuote' })
        }
        case 'requestChanges': {
          const r = transitionHandoff(
            cmd.caseId,
            cmd.handoffKey,
            'request_changes',
            cmd.note,
            cmd.annotation,
            undefined,
            { ...auditBase, command: 'requestChanges' },
          )
          return withFlowBump({ ...r, caseId: cmd.caseId, command: 'requestChanges' })
        }
        case 'authorizeFile': {
          const r = transitionHandoff(
            cmd.caseId,
            cmd.handoffKey,
            'authorize',
            cmd.note ?? '授权递交',
            undefined,
            undefined,
            { ...auditBase, command: 'authorizeFile' },
          )
          return withFlowBump({ ...r, caseId: cmd.caseId, command: 'authorizeFile' })
        }
        case 'fileResponse': {
          const key =
            cmd.handoffKey ??
            defaultHandoffKeyForCommand('fileResponse') ??
            'prosecution_response'
          const r = transitionHandoff(
            cmd.caseId,
            key,
            'file',
            cmd.note ?? '递交归档',
            undefined,
            { receiptNo: cmd.receiptNo, filedAt: cmd.filedAt },
            { ...auditBase, command: 'fileResponse' },
          )
          return withFlowBump({ ...r, caseId: cmd.caseId, command: 'fileResponse' })
        }
        case 'advanceStage': {
          const r = advanceFromWorkbench(cmd.caseId, {
            note: cmd.note,
          })
          if (r.ok) {
            pushAudit({
              actor,
              agentId,
              command: 'advanceStage',
              caseId: cmd.caseId,
              detail: meta?.detail ?? r.message,
            })
          }
          return withFlowBump({ ...r, caseId: cmd.caseId, command: 'advanceStage' })
        }
        case 'assignAgency': {
          dispatchAgency(cmd.caseId, cmd.agencyName)
          pushAudit({
            actor,
            agentId,
            command: 'assignAgency',
            caseId: cmd.caseId,
            detail: meta?.detail ?? `派单「${cmd.agencyName}」`,
          })
          return withFlowBump({
            ok: true,
            message: `已派单给「${cmd.agencyName}」`,
            caseId: cmd.caseId,
            command: 'assignAgency',
          })
        }
        case 'issueInvoice': {
          updateInvoiceStatus(cmd.caseId, cmd.invoiceId, '已开票')
          pushAudit({
            actor,
            agentId,
            command: 'issueInvoice',
            caseId: cmd.caseId,
            detail: meta?.detail ?? `开票 ${cmd.invoiceId}`,
          })
          return withFlowBump({
            ok: true,
            message: '已开票',
            caseId: cmd.caseId,
            command: 'issueInvoice',
          })
        }
        case 'payInvoice': {
          // Persona × 企业闸中央校验（发明人/委员硬禁；代理禁付）· 防直调
          const payCase = cases.find((x) => x.id === cmd.caseId)
          const gr = evaluatePayUnlock({
            case: payCase
              ? {
                  id: payCase.id,
                  legalReview: payCase.legalReview,
                  oaStatementConfirmed: payCase.oaStatementConfirmed,
                  engagement: payCase.engagement,
                }
              : null,
            persona,
            role,
            isEnterprise: role === 'enterprise',
          })
          if (!gr.ok) {
            const msg = firstGuardrailMessage(gr) ?? '无权限付款解锁'
            return withFlowBump({
              ok: false,
              message: msg,
              caseId: cmd.caseId,
              command: 'payInvoice',
            })
          }
          updateInvoiceStatus(cmd.caseId, cmd.invoiceId, '已付款')
          pushAudit({
            actor,
            agentId,
            command: 'payInvoice',
            caseId: cmd.caseId,
            detail: meta?.detail ?? `付款 ${cmd.invoiceId}`,
          })
          return withFlowBump({
            ok: true,
            message: '已付款',
            caseId: cmd.caseId,
            command: 'payInvoice',
          })
        }
        case 'createCaseFromInsight': {
          const created = addCase({
            title: cmd.title,
            stage: cmd.stage,
            summary: cmd.summary,
            inventor: cmd.inventor,
            ownerTeam: cmd.ownerTeam,
            agencyName: cmd.agencyName,
            fromInsight: cmd.fromInsight ?? true,
          })
          bumpInsightDriven()
          pushAudit({
            actor,
            agentId,
            command: 'createCaseFromInsight',
            caseId: created.id,
            detail: meta?.detail ?? `洞察立项「${created.title}」`,
          })
          return withFlowBump({
            ok: true,
            message: `已创建案件「${created.title}」`,
            caseId: created.id,
            command: 'createCaseFromInsight',
          })
        }
        case 'docketEscalate': {
          const r = escalateDocketEvent(cmd.eventId, cmd.action)
          return withFlowBump({
            ...r,
            caseId: cmd.caseId,
            command: 'docketEscalate',
          })
        }
        case 'docketComplete': {
          const r = escalateDocketEvent(cmd.eventId, 'complete')
          return withFlowBump({
            ...r,
            caseId: cmd.caseId,
            command: 'docketComplete',
          })
        }
        default: {
          const _exhaustive: never = cmd
          return { ok: false, message: `未知命令：${(_exhaustive as DomainCommand).type}` }
        }
      }
    },
    [
      transitionHandoff,
      addArtifact,
      advanceFromWorkbench,
      dispatchAgency,
      updateInvoiceStatus,
      addCase,
      bumpInsightDriven,
      pushAudit,
      cases,
      persona,
      role,
      setFlowNodeProgress,
      escalateDocketEvent,
    ],
  )

  const dispatchCommand = useCallback(
    async (cmd: DomainCommand, meta?: CommandMeta): Promise<CommandResult> => {
      if (isApiMockWritePreferred()) {
        try {
          const remote = await tryDispatchViaApiMock(cmd, meta)
          if (remote != null) {
            // 样机内存与 UI 内存不是同一进程：成功打到 API 后仍执行 local，保证界面更新
            const local = dispatchCommandLocal(cmd, meta)
            return {
              ...local,
              message: `${local.message} · via api-mock:5180（样机）`,
            }
          }
        } catch {
          /* fallthrough */
        }
      }
      const local = dispatchCommandLocal(cmd, meta)
      return {
        ...local,
        message: isApiMockWritePreferred()
          ? `${local.message} · api-mock 不可达，已 fallback 内存`
          : local.message,
      }
    },
    [dispatchCommandLocal],
  )

  const value = useMemo(
    () => ({
      cases,
      visibleCases,
      canAccessCase,
      stageFilter,
      setStageFilter,
      getCase,
      visibleDocketEvents,
      toggleChecklist,
      markChecklistDone,
      passGate,
      rejectGate,
      advanceFromWorkbench,
      recordIntakeNoGo,
      attachHandoffArtifact,
      getFlowNodeProgress,
      setFlowNodeProgress,
      getCaseFlowProgress,
      recentActivity,
      addActivity,
      role,
      setRole,
      persona,
      setPersona,
      committeeVoteHardBlockGo,
      setCommitteeVoteHardBlockGo,
      committeeVoteLog,
      recordCommitteeVote,
      hasAuditedCommitteeVote,
      workspace,
      selectWorkspace,
      dataSourceMode,
      setDataSourceMode,
      docketEvents,
      addDocketEvent,
      escalateDocketEvent,
      todos,
      workspaceTodos,
      addArtifact,
      getHandoff,
      getHandoffState,
      getVersions,
      getCurrentVersionLabel,
      transitionHandoff,
      updateEngagement,
      primaryHandoffKey,
      setFulfillmentMode,
      dispatchAgency,
      addCase,
      setLinkedAlert,
      getWatchAlerts,
      getMaintainSchedule,
      upsertMaintainSchedule,
      processWatchAlert,
      patchWatchAlert,
      getDraftFilingCheck,
      setDraftFilingCheck,
      toggleDraftFilingCheck,
      getDisclosurePackCheck,
      setDisclosurePackCheck,
      toggleDisclosurePackCheck,
      markDisclosurePackComplete,
      setLegalReview,
      setOaStatementConfirmed,
      getCaseDriveItems,
      appendCaseDriveItem,
      getFullCheckLite,
      toggleFullCheckLite,
      setFullCheckLite,
      addInvoice,
      updateInvoiceStatus,
      appendDraftInvoice,
      pendingPayInvoiceCount,
      disclosures,
      submitDisclosure,
      advanceDisclosure,
      pendingDisclosures,
      overdueStopEnabled,
      setOverdueStopEnabled,
      hasBlockingInvoiceForCase,
      agencyIntents,
      visibleAgencyIntents,
      submitAgencyIntent,
      acceptAgencyIntent,
      ignoreAgencyIntent,
      insightDrivenCount,
      bumpInsightDriven,
      setQuoteDispatchStatus,
      auditLog,
      lastDomainWrite,
      dispatchCommand,
      getAuditForCase,
      apiMockInbox,
      apiMockReadEnabled,
      reloadFromApiMock,
    }),
    [
      cases,
      visibleCases,
      canAccessCase,
      stageFilter,
      getCase,
      visibleDocketEvents,
      toggleChecklist,
      markChecklistDone,
      passGate,
      rejectGate,
      advanceFromWorkbench,
      recordIntakeNoGo,
      attachHandoffArtifact,
      getFlowNodeProgress,
      setFlowNodeProgress,
      getCaseFlowProgress,
      recentActivity,
      addActivity,
      role,
      setRole,
      persona,
      setPersona,
      committeeVoteHardBlockGo,
      committeeVoteLog,
      recordCommitteeVote,
      hasAuditedCommitteeVote,
      workspace,
      selectWorkspace,
      dataSourceMode,
      docketEvents,
      addDocketEvent,
      escalateDocketEvent,
      todos,
      workspaceTodos,
      addArtifact,
      getHandoff,
      getHandoffState,
      getVersions,
      getCurrentVersionLabel,
      transitionHandoff,
      updateEngagement,
      primaryHandoffKey,
      setFulfillmentMode,
      dispatchAgency,
      addCase,
      setLinkedAlert,
      getWatchAlerts,
      getMaintainSchedule,
      upsertMaintainSchedule,
      processWatchAlert,
      patchWatchAlert,
      getDraftFilingCheck,
      setDraftFilingCheck,
      toggleDraftFilingCheck,
      getDisclosurePackCheck,
      setDisclosurePackCheck,
      toggleDisclosurePackCheck,
      markDisclosurePackComplete,
      setLegalReview,
      setOaStatementConfirmed,
      getCaseDriveItems,
      appendCaseDriveItem,
      getFullCheckLite,
      toggleFullCheckLite,
      setFullCheckLite,
      addInvoice,
      updateInvoiceStatus,
      appendDraftInvoice,
      pendingPayInvoiceCount,
      disclosures,
      submitDisclosure,
      advanceDisclosure,
      pendingDisclosures,
      overdueStopEnabled,
      hasBlockingInvoiceForCase,
      agencyIntents,
      visibleAgencyIntents,
      submitAgencyIntent,
      acceptAgencyIntent,
      ignoreAgencyIntent,
      insightDrivenCount,
      bumpInsightDriven,
      setQuoteDispatchStatus,
      auditLog,
      lastDomainWrite,
      dispatchCommand,
      getAuditForCase,
      apiMockInbox,
      apiMockReadEnabled,
      reloadFromApiMock,
    ],
  )

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>
}

export function useApp() {
  const ctx = useContext(AppContext)
  if (!ctx) throw new Error('useApp must be used within AppProvider')
  return ctx
}
