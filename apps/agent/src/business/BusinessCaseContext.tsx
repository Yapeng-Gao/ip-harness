import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react'
import { useApp } from '@shared/context/AppContext'
import { useProjectFolder } from '../projects/ProjectFolderContext'
import type { AgentProject, ProjectExpertId } from '../projects/types'
import {
  BUSINESS_DEFAULT_TEAM_IDS,
  BUSINESS_DEFAULT_SEAT_IDS,
  BUSINESS_MORE_SEAT_IDS,
  BUSINESS_STAGES,
  CONFIRM_KIND_LABEL,
  CONFIRM_META,
  applyMainChainConfirm,
  confirmKindForSeat,
  normalizeResearchPass,
  type BusinessConfirmKind,
  type BusinessStageId,
  type ResearchPass,
  businessSeatLabel,
} from './businessSeats'
import { getProjectExpert } from '../projects/experts'
import {
  seatFeedbackLog,
  SELF_HEAL_MAX,
  disclosureAskLines,
  figureFeedbackLog,
  hitlReturnLog,
  intakeLowScoreLog,
  layoutFlywheelScript,
  oaBlockerEscalateLog,
  oaRoundArriveLog,
  oaStrategyPrepScript,
  oaSubmitLog,
  processLogId,
  processLogStamp,
  researchPessimisticLog,
  selfHealScript,
  drillDispatchLog,
  drillAcceptLog,
  type OaReasonClass,
  type ProcessLogEntry,
} from './packLoops'
import { resolveCasePlanStart } from './casePlanDrive'
import {
  buildJudgmentFromConfirm,
  preferenceCandidateFromJudgment,
  precipitateJudgmentAsPreference,
  savePreference,
  type JudgmentRecord,
  type PreferenceRecord,
} from './judgmentArchive'
import { upsertSavedPreferences } from './preferenceStore'
import {
  downstreamResumeScript,
  feedbackNeedsMoreSeat,
  feedbackToolName,
  upstreamAdjustScript,
} from './seatFeedback'
import {
  loopActionsForSeat,
  resolveLoopDemo,
  seatLoopChatScript,
  type SeatLoopActionId,
} from './seatLoops'
import { drillDispatchBrief, DRILL_ORCH_ID } from './drillRoster'
import { buildHitlReviseScript } from './hitlReturnRevise'
import {
  MID_ARTIFACT_LABEL,
  confirmCommands,
  handoffNoteForConfirm,
  midCaseDraftFromWizard,
  midSyncMeta,
  projectBusinessFlow,
  returnCommands,
  runConfirmCommands,
  runReturnCommands,
  seatIdForConfirm,
  type MidSyncOutcome,
} from './midSync'
import { BUSINESS_SEED_IDS } from './businessSeeds'

export { BUSINESS_SEED_IDS, isBusinessSeedCaseId } from './businessSeeds'

export type { ProcessLogEntry } from './packLoops'
export { SELF_HEAL_MAX, DISCLOSURE_ASK_MAX, OA_BLOCKER_SELF_HEAL_MAX } from './packLoops'
export type { OaReasonClass } from './packLoops'

export type LoopDemoKey =
  | 'disclosure_ask'
  | 'research_heal'
  | 'draft_heal'
  | 'draft_escalate'
  | 'figure_feedback'
  | 'research_pessimistic'
  | 'intake_low_score'
  | 'oa_inventive'
  | 'oa_clarity'
  | 'oa_round2'
  | 'oa_blocker'
  | 'oa_strategy_reject'
  | 'layout_flywheel'
  | 'layout_flywheel_biz'

function nowIso(): string {
  return new Date().toISOString()
}

function stamp(): string {
  return new Date().toLocaleString('zh-CN', { hour12: false })
}

function uid(prefix: string): string {
  return `${prefix}-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`
}

export type BusinessConfirmItem = {
  id: string
  caseId: string
  kind: BusinessConfirmKind
  title: string
  summary: string
  resultPreview: string
  processPreview: string
  preparedBy: string
  createdAt: string
  status: 'pending' | 'confirmed' | 'returned'
  /** 退回批注（人话） */
  returnNote?: string
  /**
   * 辅审轮次：首轮可建议退回；改稿后再交卷为 after_revise → 建议确认
   */
  assistPass?: 'first' | 'after_revise'
  /** 上一轮退回意见（改稿后再交时给辅审引用） */
  priorReturnNote?: string
}

/** 同源进度 · 时间线 / 待确认 / 侧栏当前步 */
export type CaseProgress = {
  caseId: string
  stageId: BusinessStageId
  completedStages: BusinessStageId[]
  filed: boolean
  /** OA 第 N 通（未进入审查答复为 0） */
  oaRound: number
  /** 查新轮次：0 未对照交底；1 交底后已确认；2 说明书后补检已确认 */
  researchPass?: ResearchPass
  doneSeatIds: ProjectExpertId[]
  moreSeatIds: ProjectExpertId[]
  /** 本案讨论团队（主责 expert id）；默认空 = 未组队 */
  teamMemberIds: ProjectExpertId[]
  /** 建案向导「本案计划」骨架（可空） */
  casePlan?: string
  updatedAt: string
}

/** 案子是否启用布局席（业务面才出「请确认布局调整」） */
export function caseHasLayoutEnabled(
  prog: Pick<CaseProgress, 'moreSeatIds'> | undefined,
  expertIds?: ProjectExpertId[],
): boolean {
  if (prog?.moreSeatIds?.includes('expert-layout')) return true
  if (expertIds?.includes('expert-layout')) return true
  return false
}

/** P0 · 业务案子 / 进度 / 待确认 localStorage，同标签刷新可恢复 */
const BUSINESS_LS_KEY = 'ip-harness-agent-business-v1'

export type BusinessCaseMeta = {
  id: string
  title: string
  summary: string
  expertIds: ProjectExpertId[]
}

type PersistedBusiness = {
  v: 1
  caseIds: string[]
  progressById: Record<string, CaseProgress>
  confirms: BusinessConfirmItem[]
  caseMeta: BusinessCaseMeta[]
  processLogs?: ProcessLogEntry[]
  /** T10 判断档案 · 可选字段，旧持久化缺省 [] */
  judgments?: JudgmentRecord[]
  preferences?: PreferenceRecord[]
}

function seedCaseMeta(): BusinessCaseMeta[] {
  return [
    {
      id: BUSINESS_SEED_IDS.A,
      title: '边缘调度模组',
      summary: '业务样机 · 待确认立项',
      expertIds: [...BUSINESS_DEFAULT_TEAM_IDS],
    },
    {
      id: BUSINESS_SEED_IDS.B,
      title: '传感校准套件',
      summary: '业务样机 · 待确认权利要求',
      expertIds: [...BUSINESS_DEFAULT_TEAM_IDS],
    },
    {
      id: BUSINESS_SEED_IDS.C,
      title: '边缘散热结构 · 审查中',
      summary: '业务样机 · 已递交 · 第 1 通审查答复',
      expertIds: [...BUSINESS_DEFAULT_TEAM_IDS],
    },
    {
      id: BUSINESS_SEED_IDS.D,
      title: '空白点补局 · 飞轮样机',
      summary: '业务样机 · 已启用布局 · 布局漏洞回流待拍板',
      expertIds: [...BUSINESS_DEFAULT_TEAM_IDS, 'expert-layout', 'expert-enforcement'],
    },
  ]
}

function loadPersistedBusiness(): PersistedBusiness | null {
  try {
    if (typeof localStorage === 'undefined') return null
    const raw = localStorage.getItem(BUSINESS_LS_KEY)
    if (!raw) return null
    const parsed = JSON.parse(raw) as PersistedBusiness
    if (!parsed || parsed.v !== 1) return null
    if (!Array.isArray(parsed.caseIds) || !Array.isArray(parsed.confirms))
      return null
    if (!parsed.progressById || typeof parsed.progressById !== 'object')
      return null
    if (!Array.isArray(parsed.caseMeta)) return null
    return parsed
  } catch {
    return null
  }
}

function persistBusiness(data: PersistedBusiness): void {
  try {
    if (typeof localStorage === 'undefined') return
    localStorage.setItem(BUSINESS_LS_KEY, JSON.stringify(data))
  } catch {
    /* quota / private mode */
  }
}

function seedProcessLogs(): ProcessLogEntry[] {
  // Knife1：传感校准套件交底追问 + 查新自修复
  // Knife2：已递交案子第 1 通到达 + 创造性分类 + 补充检索汇入
  // Knife3：F9→F3 飞轮故事线 + 查新不乐观/立项低分灰回流
  return [
    ...disclosureAskLines(BUSINESS_SEED_IDS.B, 2),
    ...selfHealScript(BUSINESS_SEED_IDS.B, 'expert-research', 2),
    oaRoundArriveLog(BUSINESS_SEED_IDS.C, 1),
    ...oaStrategyPrepScript(BUSINESS_SEED_IDS.C, 'inventive', 1),
    ...layoutFlywheelScript(BUSINESS_SEED_IDS.D),
  ]
}

function buildInitialBusinessState(): {
  caseIds: string[]
  progressById: Record<string, CaseProgress>
  confirms: BusinessConfirmItem[]
  caseMeta: BusinessCaseMeta[]
  processLogs: ProcessLogEntry[]
  judgments: JudgmentRecord[]
  preferences: PreferenceRecord[]
} {
  const seedIds: string[] = [
    BUSINESS_SEED_IDS.A,
    BUSINESS_SEED_IDS.B,
    BUSINESS_SEED_IDS.C,
    BUSINESS_SEED_IDS.D,
  ]
  const seedProg = seedProgressMap()
  const seedConf = seedConfirms()
  const seedMeta = seedCaseMeta()
  const seedLogs = seedProcessLogs()
  const persisted = loadPersistedBusiness()
  if (!persisted) {
    return {
      caseIds: seedIds,
      progressById: seedProg,
      confirms: seedConf,
      caseMeta: seedMeta,
      processLogs: seedLogs,
      judgments: [],
      preferences: [],
    }
  }

  const seedIdSet = new Set<string>(seedIds)
  // 种子 id：以持久化为准（Confirm / 进度不回滚）；用户新建案子前置
  const extras = persisted.caseIds.filter((id) => !seedIdSet.has(id))
  const caseIds = [...extras, ...seedIds]

  const progressById: Record<string, CaseProgress> = { ...seedProg }
  for (const [id, prog] of Object.entries(persisted.progressById)) {
    if (prog && typeof prog === 'object' && prog.caseId) {
      progressById[id] = {
        ...prog,
        oaRound: typeof prog.oaRound === 'number' ? prog.oaRound : 0,
        researchPass: normalizeResearchPass(prog.researchPass),
        teamMemberIds: Array.isArray(prog.teamMemberIds)
          ? prog.teamMemberIds
          : [],
      }
    }
  }

  const confById = new Map(persisted.confirms.map((c) => [c.id, c]))
  const mergedSeedConfirms = seedConf.map((c) => confById.get(c.id) ?? c)
  const extraConfirms = persisted.confirms.filter(
    (c) => !seedConf.some((s) => s.id === c.id),
  )
  const confirms = [...extraConfirms, ...mergedSeedConfirms]

  const metaById = new Map(persisted.caseMeta.map((m) => [m.id, m]))
  const mergedSeedMeta = seedMeta.map((m) => metaById.get(m.id) ?? m)
  const extraMeta = persisted.caseMeta.filter((m) => !seedIdSet.has(m.id))
  // Keep meta aligned with caseIds order
  const metaMap = new Map<string, BusinessCaseMeta>([
    ...mergedSeedMeta.map((m) => [m.id, m] as const),
    ...extraMeta.map((m) => [m.id, m] as const),
  ])
  const caseMeta = caseIds.map((id) => {
    const m = metaMap.get(id)
    if (m) return m
    return {
      id,
      title: '未命名案子',
      summary: '业务向导新建',
      expertIds: [...BUSINESS_DEFAULT_TEAM_IDS],
    }
  })

  const processLogs =
    Array.isArray(persisted.processLogs) && persisted.processLogs.length > 0
      ? persisted.processLogs
      : seedLogs

  const judgments = Array.isArray(persisted.judgments) ? persisted.judgments : []
  const preferences = Array.isArray(persisted.preferences)
    ? persisted.preferences
    : []

  return {
    caseIds,
    progressById,
    confirms,
    caseMeta,
    processLogs,
    judgments,
    preferences,
  }
}

function projectFromMeta(meta: BusinessCaseMeta): AgentProject {
  return {
    id: meta.id,
    title: meta.title,
    summary: meta.summary,
    kind: 'domain',
    domainPackId: 'patent',
    caseBindState: 'none',
    expertIds: [...meta.expertIds],
    createdAt: nowIso(),
    updatedAt: nowIso(),
  }
}

type BusinessCaseContextValue = {
  cases: AgentProject[]
  getCase: (id: string) => AgentProject | undefined
  getProgress: (caseId: string) => CaseProgress
  getPendingConfirms: (caseId?: string) => BusinessConfirmItem[]
  getConfirm: (id: string) => BusinessConfirmItem | undefined
  getProcessLogs: (caseId?: string) => ProcessLogEntry[]
  createCaseFromWizard: (input: {
    title: string
    summary?: string
    moreSeatIds?: ProjectExpertId[]
    skipPrepare?: boolean
    casePlan?: string
  }) => AgentProject
  advanceStage: (caseId: string) => void
  prepareConfirm: (
    caseId: string,
    kind: BusinessConfirmKind,
  ) => BusinessConfirmItem
  confirmItem: (
    confirmId: string,
    opts?: { reason?: string; riskAccepted?: boolean },
  ) => Promise<MidSyncOutcome>
  /** 退回：解锁席 + 按意见改一版（样机）· 不立刻再挂 pending */
  returnItem: (confirmId: string, note?: string) => Promise<MidSyncOutcome>
  /**
   * 对某席再跑一遍「按最近退回意见改稿」（芯片可点）
   */
  runHitlReturnRevise: (
    caseId: string,
    seatId: ProjectExpertId,
  ) => { ok: boolean; reason?: string }
  /** 本案该席最近一次退回批注（无则 null） */
  lastReturnNoteForSeat: (
    caseId: string,
    seatId: ProjectExpertId,
  ) => string | null
  /** Knife1/2/3 演示：内循环 / 环边 / OA N 通 / F9→F3 飞轮 */
  runLoopDemo: (
    caseId: string,
    demo: LoopDemoKey,
  ) => void
  /** 提交后「第 N+1 通到达」→ 回答复入口 */
  arriveNextOaRound: (caseId: string, reason?: OaReasonClass) => void
  stageLabel: (id: BusinessStageId) => string
  primaryCta: (caseId: string) => {
    label: string
    action: 'advance' | 'confirm' | 'open'
    confirmId?: string
    /** 文案来自本案计划「下一步」 */
    fromPlan?: boolean
    seatId?: ProjectExpertId
  }
  lastReturnHint: string | null
  clearReturnHint: () => void
  /** 本案是否业务焊接案（id 即 projectId） */
  isBusinessCase: (id: string) => boolean
  /**
   * 推进一步：ProjectFolder 席步骤 + 交付过检后写入本案待确认（同一 store）
   */
  advanceSeatWork: (
    caseId: string,
    seatId: ProjectExpertId,
  ) => {
    stepLabel: string
    delivered: boolean
    confirm?: BusinessConfirmItem
    /** 本步写入的办理过程日志 id（供 UI 闪行） */
    processLogId?: string
  }
  /**
   * 回退到已走过的步：清本席 pending、撤回 done、成果收短、会话重放该步
   */
  rewindSeatWork: (
    caseId: string,
    seatId: ProjectExpertId,
    targetIndex: number,
  ) => {
    ok: boolean
    stepLabel?: string
    reason?: string
    processLogId?: string
  }
  /**
   * 跨席 feedback：请上游 bot 调整 → v2 回传 → 下游接着做（不倒下游进度）
   */
  requestUpstreamFeedback: (
    caseId: string,
    fromSeat: ProjectExpertId,
    toSeat: ProjectExpertId,
    reason: string,
  ) => {
    ok: boolean
    reason?: string
    processLogId?: string
    switchToSeat?: ProjectExpertId
  }
  /**
   * 席内 loop：自修复 / OA N 通 / HITL 驳回（可聊可点，写过程 + 会话）
   */
  runSeatLoop: (
    caseId: string,
    seatId: ProjectExpertId,
    actionId: SeatLoopActionId,
    note?: string,
  ) => { ok: boolean; reason?: string }
  /** 案子助手 · 转 Word 示意（过程一行，非真 Office） */
  recordWordExportHint: (caseId: string) => void
  /** 演练总控 · 分派到 owner 席 */
  dispatchDrillSeat: (
    caseId: string,
    toSeat: ProjectExpertId,
    brief?: string,
  ) => { ok: boolean; reason?: string; switchToSeat?: ProjectExpertId }
  /** 演练总控 · 双文件验收过/不过（不过走 feedback 退回） */
  acceptDrillDualFile: (
    caseId: string,
    seatId: ProjectExpertId,
    ok: boolean,
    note?: string,
  ) => { ok: boolean; reason?: string }
  /** 本案讨论团队（勾选主责）；空 = 未组队 */
  setCaseTeam: (caseId: string, memberIds: ProjectExpertId[]) => void
  /** 案子助手改写 / 补全本案计划 */
  updateCasePlan: (caseId: string, casePlan: string) => void
  /** 启用前研等「更多部门」（写入 moreSeatIds） */
  /** T10 · 本案判断档案（硬请示写回） */
  getJudgments: (caseId?: string) => JudgmentRecord[]
  getPreferences: () => PreferenceRecord[]
  recordJudgment: (j: JudgmentRecord) => void
  savePreferenceById: (prefId: string) => void
  precipitateJudgment: (judgmentId: string) => void
    enableMoreDepartments: (caseId: string) => void
}

const BusinessCaseContext = createContext<BusinessCaseContextValue | null>(null)

function emptyProgress(
  caseId: string,
  stageId: BusinessStageId = 'prepare',
): CaseProgress {
  return {
    caseId,
    stageId,
    completedStages: [],
    filed: false,
    oaRound: 0,
    researchPass: 0,
    doneSeatIds: [],
    moreSeatIds: [],
    teamMemberIds: [],
    updatedAt: nowIso(),
  }
}

function seedConfirms(): BusinessConfirmItem[] {
  return [
    {
      id: 'bcf-seed-go-nogo',
      caseId: BUSINESS_SEED_IDS.A,
      kind: 'go_nogo',
      title: CONFIRM_KIND_LABEL.go_nogo,
      summary: '查新结论：现有技术可规避；建议立项撰写实用新型。',
      resultPreview:
        '【成果】立项建议：做 · 范围：边缘调度模组控制方法 · 风险：中低 · 预算档：标准。\n【对比】对照最接近公开未覆盖校准采样组合（演示）。\n【来源】检索笔记 RN-1042（示意）· 非官报全文。',
      processPreview:
        '【办理过程】比对公开文献；新颖性可成立；创造性需限缩从属。',
      preparedBy: CONFIRM_META.go_nogo.preparedBy,
      createdAt: stamp(),
      status: 'pending',
    },
    {
      id: 'bcf-seed-claims',
      caseId: BUSINESS_SEED_IDS.B,
      kind: 'claims_ready',
      title: CONFIRM_KIND_LABEL.claims_ready,
      summary: '权利要求书草案已就绪，请确认主权利要求范围。',
      resultPreview:
        '【成果】权利要求 1–8：独立权项 1 覆盖传感采样与校准；从属 2–8 细化。\n【对比】对照交底主张：未超交底公开范围（演示）。\n【来源】交底全绿包 + 查新结论稿（示意）。',
      processPreview: '【办理过程】交底要点已吸入；与附图对齐；术语三处归一。',
      preparedBy: CONFIRM_META.claims_ready.preparedBy,
      createdAt: stamp(),
      status: 'pending',
    },
    {
      id: 'bcf-seed-oa-strategy',
      caseId: BUSINESS_SEED_IDS.C,
      kind: 'oa_strategy',
      title: CONFIRM_KIND_LABEL.oa_strategy,
      summary: '第 1 通 · 理由：创造性 · 已汇入补充检索 · 请确认答复策略。',
      resultPreview:
        '【成果】三策略并列：限缩权项 / 纯陈述争辩 / 补充实验数据（样机）。\n【对比】对照审查意见争点：D1 水道已公开 vs 本案双密封+错位。\n【来源】审查意见书（示意）· 补充检索笔记（示意）。',
      processPreview:
        '【办理过程】理由分类：创造性 · 子任务汇入：补充检索 · 待确认答复策略。',
      preparedBy: CONFIRM_META.oa_strategy.preparedBy,
      createdAt: stamp(),
      status: 'pending',
    },
    {
      id: 'bcf-seed-layout-adjust',
      caseId: BUSINESS_SEED_IDS.D,
      kind: 'layout_adjust',
      title: CONFIRM_KIND_LABEL.layout_adjust,
      summary:
        '维权监测发现布局漏洞 · 布局策略师已出补局建议 · 请确认布局调整。',
      resultPreview:
        '【成果】补局建议：加从属覆盖空白点 IPC；调整引用链；布局方案 v2（样机）。',
      processPreview:
        '【办理过程】监测事件 → 布局漏洞报告 → F9→F3 回流信封 → 布局待拍板（≠ FTO）。',
      preparedBy: CONFIRM_META.layout_adjust.preparedBy,
      createdAt: stamp(),
      status: 'pending',
    },
  ]
}

function seedProgressMap(): Record<string, CaseProgress> {
  return {
    [BUSINESS_SEED_IDS.A]: {
      caseId: BUSINESS_SEED_IDS.A,
      stageId: 'intake',
      completedStages: ['prepare'],
      filed: false,
      oaRound: 0,
      researchPass: 1,
      doneSeatIds: ['expert-disclosure', 'expert-research'],
      moreSeatIds: [],
      teamMemberIds: [],
      updatedAt: nowIso(),
    },
    [BUSINESS_SEED_IDS.B]: {
      caseId: BUSINESS_SEED_IDS.B,
      stageId: 'drafting',
      completedStages: ['prepare', 'intake'],
      filed: false,
      oaRound: 0,
      researchPass: 1,
      doneSeatIds: [
        'expert-research',
        'expert-intake',
        'expert-disclosure',
      ],
      moreSeatIds: [],
      teamMemberIds: [],
      updatedAt: nowIso(),
    },
    [BUSINESS_SEED_IDS.C]: {
      caseId: BUSINESS_SEED_IDS.C,
      stageId: 'oa',
      completedStages: ['prepare', 'intake', 'drafting', 'filing'],
      filed: true,
      oaRound: 1,
      researchPass: 2,
      doneSeatIds: [
        'expert-research',
        'expert-intake',
        'expert-disclosure',
        'expert-draft',
        'expert-figure',
        'expert-filing',
      ],
      moreSeatIds: [],
      teamMemberIds: [],
      updatedAt: nowIso(),
    },
    [BUSINESS_SEED_IDS.D]: {
      caseId: BUSINESS_SEED_IDS.D,
      stageId: 'prepare',
      completedStages: [],
      filed: false,
      oaRound: 0,
      doneSeatIds: [],
      moreSeatIds: ['expert-layout', 'expert-enforcement'],
      teamMemberIds: [],
      updatedAt: nowIso(),
    },
  }
}

export function BusinessCaseProvider({ children }: { children: ReactNode }) {
  const {
    createProject,
    getProject,
    folderProjects,
    patchProject,
    advanceStep,
    rewindToStep,
    getThread,
    appendMessage,
    markArtifactSubmitted,
  } = useProjectFolder()
  const {
    addCase: addMidCase,
    getCase: getMidCase,
    dispatchCommand,
    setFlowNodeProgress,
    addArtifact,
  } = useApp()
  const initial = useMemo(() => buildInitialBusinessState(), [])
  const [progressById, setProgressById] =
    useState<Record<string, CaseProgress>>(initial.progressById)
  const [confirms, setConfirms] =
    useState<BusinessConfirmItem[]>(initial.confirms)
  const [caseIds, setCaseIds] = useState<string[]>(initial.caseIds)
  const [caseMeta, setCaseMeta] = useState<BusinessCaseMeta[]>(initial.caseMeta)
  const [processLogs, setProcessLogs] = useState<ProcessLogEntry[]>(
    initial.processLogs,
  )
  const [judgments, setJudgments] = useState<JudgmentRecord[]>(
    initial.judgments,
  )
  const [preferences, setPreferences] = useState<PreferenceRecord[]>(
    initial.preferences,
  )
  const [lastReturnHint, setLastReturnHint] = useState<string | null>(null)

  const clearReturnHint = useCallback(() => setLastReturnHint(null), [])

  const appendLogs = useCallback((entries: ProcessLogEntry[]) => {
    if (entries.length === 0) return
    setProcessLogs((prev) => [...entries, ...prev].slice(0, 200))
  }, [])

  // 确保 ProjectFolder 有对应案子（刷新 / 热更后回填）· 一案子一 projectId
  useEffect(() => {
    for (const m of caseMeta) {
      const existing = getProject(m.id)
      if (!existing) {
        createProject({
          id: m.id,
          title: m.title,
          summary: m.summary,
          kind: 'domain',
          domainPackId: 'patent',
          caseId: m.id,
          expertIds:
            m.expertIds.length > 0 ? m.expertIds : BUSINESS_DEFAULT_TEAM_IDS,
        })
      } else if (existing.caseId !== m.id || existing.caseBindState !== 'bound') {
        // Catalog / 专家台进同一案：绑案 = projectId，禁平行宇宙
        patchProject(m.id, { caseId: m.id, caseBindState: 'bound' })
      }
    }
  }, [caseMeta, createProject, getProject, patchProject])

  // 同标签刷新可恢复：案子列表 · 进度 · 待确认（含 confirmed / returned）
  useEffect(() => {
    persistBusiness({
      v: 1,
      caseIds,
      progressById,
      confirms,
      caseMeta,
      processLogs,
      judgments,
      preferences,
    })
  }, [caseIds, progressById, confirms, caseMeta, processLogs, judgments, preferences])

  const cases = useMemo(() => {
    // Keep order of caseIds；folder 尚未回填时用 caseMeta 合成，避免「找不到这个案子」闪断
    return caseIds
      .map((id) => {
        const fromFolder = folderProjects.find((p) => p.id === id)
        if (fromFolder) return fromFolder
        const meta = caseMeta.find((m) => m.id === id)
        return meta ? projectFromMeta(meta) : undefined
      })
      .filter((p): p is AgentProject => !!p)
  }, [folderProjects, caseIds, caseMeta])

  const getCase = useCallback(
    (id: string) => {
      const hit = cases.find((c) => c.id === id) ?? getProject(id)
      if (hit) return hit
      const meta = caseMeta.find((m) => m.id === id)
      return meta ? projectFromMeta(meta) : undefined
    },
    [cases, getProject, caseMeta],
  )

  const ensureProgress = useCallback(
    (caseId: string): CaseProgress => {
      const raw = progressById[caseId] ?? emptyProgress(caseId, 'prepare')
      return {
        ...raw,
        teamMemberIds: Array.isArray(raw.teamMemberIds)
          ? raw.teamMemberIds
          : [],
        researchPass: normalizeResearchPass(raw.researchPass),
      }
    },
    [progressById],
  )

  const getProgress = useCallback(
    (caseId: string) => ensureProgress(caseId),
    [ensureProgress],
  )

  const getPendingConfirms = useCallback(
    (caseId?: string) =>
      confirms.filter(
        (c) =>
          c.status === 'pending' &&
          (caseId ? c.caseId === caseId : true),
      ),
    [confirms],
  )

  const getConfirm = useCallback(
    (id: string) => confirms.find((c) => c.id === id),
    [confirms],
  )

  const getProcessLogs = useCallback(
    (caseId?: string) =>
      processLogs.filter((l) => (caseId ? l.caseId === caseId : true)),
    [processLogs],
  )

  const createCaseFromWizard = useCallback(
    (input: {
      title: string
      summary?: string
      moreSeatIds?: ProjectExpertId[]
      skipPrepare?: boolean
      casePlan?: string
    }) => {
      const more = input.moreSeatIds ?? []
      const expertIds = [
        ...BUSINESS_DEFAULT_TEAM_IDS,
        ...more.filter((id) => !BUSINESS_DEFAULT_TEAM_IDS.includes(id)),
      ]
      const planText = input.casePlan?.trim()
      const planStart = resolveCasePlanStart({
        casePlan: planText,
        skipPrepare: input.skipPrepare,
      })
      // 一案子一 projectId：案 id = Catalog/ProjectFolder id；caseId 自绑
      const p = createProject({
        title: input.title.trim() || '未命名案子',
        summary: input.summary?.trim() || planText || '业务向导新建',
        kind: 'domain',
        domainPackId: 'patent',
        expertIds,
      })
      patchProject(p.id, { caseId: p.id, caseBindState: 'bound' })
      // 阶段与计划一致；无计划则回退 skipPrepare
      // 上手默认落交底（prepare）；计划可指定更后阶段
      const stageId: BusinessStageId = planText
        ? planStart.stageId
        : 'prepare'
      const skipPrep = stageId !== 'prepare'
      setProgressById((prev) => ({
        ...prev,
        [p.id]: {
          caseId: p.id,
          stageId,
          completedStages: skipPrep ? ['prepare'] : [],
          filed: false,
          oaRound: 0,
          doneSeatIds: [],
          moreSeatIds: more,
          teamMemberIds: [],
          casePlan: planText || undefined,
          updatedAt: nowIso(),
        },
      }))
      setCaseIds((prev) =>
        prev.includes(p.id) ? prev : [p.id, ...prev],
      )
      setCaseMeta((prev) => {
        if (prev.some((m) => m.id === p.id)) return prev
        return [
          {
            id: p.id,
            title: p.title,
            summary: p.summary,
            expertIds: [...expertIds],
          },
          ...prev,
        ]
      })
      const midDraft = midCaseDraftFromWizard({
        id: p.id,
        title: p.title,
        summary: p.summary,
        stageId,
      })
      if (!getMidCase(p.id)) addMidCase(midDraft)
      for (const row of projectBusinessFlow({
        stageId,
        doneSeatIds: [],
        researchPass: 0,
        filed: false,
      })) {
        setFlowNodeProgress(p.id, row.flowKey, row.stepIndex)
      }
      return p
    },
    [addMidCase, createProject, getMidCase, patchProject, setFlowNodeProgress],
  )

  const advanceStage = useCallback((caseId: string) => {
    // §3.1a：无人确认不得靠 advanceStage 溜进下一阶段
    const hasPending = confirms.some(
      (c) => c.caseId === caseId && c.status === 'pending',
    )
    if (hasPending) return
    setProgressById((prev) => {
      const cur = prev[caseId] ?? emptyProgress(caseId)
      const idx = BUSINESS_STAGES.findIndex((s) => s.id === cur.stageId)
      const stage = BUSINESS_STAGES[idx]
      if (!stage) return prev
      const next = BUSINESS_STAGES[idx + 1]
      if (!next) return prev
      if (next.requiresFiled && !cur.filed) return prev
      return {
        ...prev,
        [caseId]: {
          ...cur,
          completedStages: cur.completedStages.includes(stage.id)
            ? cur.completedStages
            : [...cur.completedStages, stage.id],
          stageId: next.id,
          updatedAt: nowIso(),
        },
      }
    })
  }, [confirms])

  const prepareConfirm = useCallback(
    (caseId: string, kind: BusinessConfirmKind) => {
      const meta = CONFIRM_META[kind]
      // Knife1：准备确认前写入内循环过程（剧本驱动）
      const prog = progressById[caseId] ?? emptyProgress(caseId)
      if (kind === 'disclosure_ready') {
        appendLogs(disclosureAskLines(caseId, 2))
      } else if (kind === 'research_ready') {
        appendLogs(selfHealScript(caseId, 'expert-research', 2))
      } else if (kind === 'claims_ready') {
        appendLogs(selfHealScript(caseId, 'expert-draft', 2))
      } else if (kind === 'layout_adjust') {
        const metaCase = caseMeta.find((m) => m.id === caseId)
        if (!caseHasLayoutEnabled(prog, metaCase?.expertIds)) {
          appendLogs(layoutFlywheelScript(caseId))
          const blocked: BusinessConfirmItem = {
            id: uid('bcf-blocked'),
            caseId,
            kind,
            title: CONFIRM_KIND_LABEL[kind],
            summary: '未启用布局 · 仅专家台可见飞轮故事线',
            resultPreview: '【成果】—',
            processPreview:
              '【办理过程】布局席未启用 · 过程已写入专家台，业务面不出待确认。',
            preparedBy: CONFIRM_META.layout_adjust.preparedBy,
            createdAt: stamp(),
            status: 'pending',
          }
          // 不入业务收件箱
          return blocked
        }
        appendLogs(layoutFlywheelScript(caseId))
      } else if (kind === 'oa_strategy') {
        if (!prog.filed) {
          const blocked: BusinessConfirmItem = {
            id: uid('bcf-blocked'),
            caseId,
            kind,
            title: CONFIRM_KIND_LABEL[kind],
            summary: '未递交 · 审查答复未解锁',
            resultPreview: '【成果】—',
            processPreview: '【办理过程】须先确认递交后才可准备答复策略。',
            preparedBy: CONFIRM_META.oa_strategy.preparedBy,
            createdAt: stamp(),
            status: 'pending',
          }
          return blocked
        }
        const round = Math.max(prog.oaRound || 1, 1)
        appendLogs(oaStrategyPrepScript(caseId, 'inventive', round))
      }
      const healHint =
        kind === 'research_ready'
          ? '查新覆盖度自修复已过 · '
          : kind === 'claims_ready'
            ? '撰写四类校验自修复已过 · '
            : kind === 'disclosure_ready'
              ? '交底缺项追问已齐 · '
              : kind === 'oa_strategy'
                ? `第 ${Math.max(prog.oaRound || 1, 1)} 通 · 理由分类与子任务已汇入 · `
                : kind === 'layout_adjust'
                  ? '布局漏洞回流信封已达 · '
                  : ''
      const roundLabel =
        kind === 'oa_strategy'
          ? `第 ${Math.max(prog.oaRound || 1, 1)} 通 · `
          : ''
      const priorReturned = confirms.find(
        (c) =>
          c.caseId === caseId &&
          c.kind === kind &&
          c.status === 'returned' &&
          !!c.returnNote,
      )
      const afterRevise = !!priorReturned
      const item: BusinessConfirmItem = {
        id: uid('bcf'),
        caseId,
        kind,
        title: CONFIRM_KIND_LABEL[kind],
        summary: afterRevise
          ? `已按退回意见改一版 · ${businessSeatLabel(meta.seatId)}再请确认。`
          : kind === 'oa_strategy'
            ? `${roundLabel}${businessSeatLabel(meta.seatId)}已准备好，请确认答复策略。`
            : kind === 'layout_adjust'
              ? '请确认布局调整 · 补局建议已就绪。'
              : `${businessSeatLabel(meta.seatId)}已准备好，请确认。`,
        resultPreview:
          kind === 'oa_strategy'
            ? `【成果】第 ${Math.max(prog.oaRound || 1, 1)} 通三策略并列（限缩 / 陈述 / 补实验·样机）。`
            : kind === 'layout_adjust'
              ? '【成果】布局方案 v(n+1) · 补空白点 · 引用链已校（样机）。'
              : afterRevise
                ? `【成果】${CONFIRM_KIND_LABEL[kind]}改稿版（已对照退回意见补强 · 样机）。`
                : `【成果】${CONFIRM_KIND_LABEL[kind]}草稿已生成（样机）。`,
        processPreview: afterRevise
          ? `【办理过程】${healHint}已按退回意见「${(priorReturned?.returnNote ?? '').slice(0, 40)}」改稿 · 再请确认。`
          : `【办理过程】${healHint}${meta.preparedBy}席完成检查，待你确认。`,
        preparedBy: meta.preparedBy,
        createdAt: stamp(),
        status: 'pending',
        assistPass: afterRevise ? 'after_revise' : 'first',
        priorReturnNote: priorReturned?.returnNote,
      }
      setConfirms((prev) => [
        item,
        ...prev.filter(
          (c) =>
            !(
              c.caseId === caseId &&
              c.kind === kind &&
              c.status === 'pending'
            ),
        ),
      ])
      setProgressById((prev) => {
        const cur = prev[caseId] ?? emptyProgress(caseId, meta.stageId)
        return {
          ...prev,
          [caseId]: { ...cur, stageId: meta.stageId, updatedAt: nowIso() },
        }
      })
      return item
    },
    [appendLogs, progressById, caseMeta, confirms],
  )

  const confirmItem = useCallback(
    async (
      confirmId: string,
      opts?: { reason?: string; riskAccepted?: boolean },
    ): Promise<MidSyncOutcome> => {
      const target = confirms.find((c) => c.id === confirmId)
      if (!target || target.status !== 'pending') {
        return {
          businessOk: false,
          midOk: false,
          midMessage: '没有待确认项',
          flowProjected: false,
        }
      }
      const meta = CONFIRM_META[target.kind]
      const cur = progressById[target.caseId] ?? emptyProgress(target.caseId, meta.stageId)
      const next = applyMainChainConfirm(
        {
          stageId: cur.stageId,
          doneSeatIds: cur.doneSeatIds,
          completedStages: cur.completedStages,
          filed: cur.filed,
          oaRound: cur.oaRound ?? 0,
          researchPass: normalizeResearchPass(cur.researchPass),
        },
        target.kind,
      )
      const { doneSeatIds, completedStages, stageId, filed, oaRound } = next

      if (target.kind === 'claims_ready') {
        rewindToStep(target.caseId, 'expert-research', 0)
      }

      setProgressById((pprev) => ({
        ...pprev,
        [target.caseId]: {
          ...cur,
          doneSeatIds,
          completedStages,
          stageId,
          filed,
          oaRound,
          researchPass: next.researchPass,
          updatedAt: nowIso(),
        },
      }))
      setConfirms((prev) =>
        prev.map((c) =>
          c.id === confirmId ? { ...c, status: 'confirmed' as const } : c,
        ),
      )

      // T10：确认 → 判断档案（非操作考勤）
      {
        const j = buildJudgmentFromConfirm({
          caseId: target.caseId,
          confirmId: target.id,
          kind: target.kind,
          summary: target.summary,
          resultPreview: target.resultPreview,
          processPreview: target.processPreview,
          decision: 'confirmed',
          reason: opts?.reason?.trim() || '接受结论',
          riskAccepted: opts?.riskAccepted,
        })
        setJudgments((prev) => [j, ...prev].slice(0, 200))
        setPreferences((prev) => {
          const cand = preferenceCandidateFromJudgment(j)
          if (prev.some((p) => p.text === cand.text && !p.saved)) return prev
          return [cand, ...prev].slice(0, 100)
        })
      }

      const filedHint =
        target.kind === 'file_authorize'
          ? `递交已确认 · 第 ${Math.max(oaRound, 1)} 通审查意见已到达 · 请开「审查答复」`
          : null
      if (target.kind === 'file_authorize') {
        appendLogs([oaRoundArriveLog(target.caseId, Math.max(oaRound, 1))])
        setLastReturnHint(filedHint)
      } else if (target.kind === 'oa_strategy') {
        appendLogs([oaSubmitLog(target.caseId, Math.max(oaRound, 1))])
      }

      const note = handoffNoteForConfirm({
        kind: target.kind,
        artifactMarkdown: getThread(target.caseId, meta.seatId)?.artifactMarkdown,
        fallback: target.resultPreview || target.summary,
      })
      const run = await runConfirmCommands(
        confirmCommands({
          kind: target.kind,
          caseId: target.caseId,
          note,
        }),
        dispatchCommand,
        midSyncMeta({
          kind: target.kind,
          seatId: seatIdForConfirm(target.kind),
          action: 'confirm',
        }),
      )
      if (run.applied.length > 0 && target.kind !== 'research_ready') {
        const art = MID_ARTIFACT_LABEL[target.kind]
        addArtifact(target.caseId, art.name, art.type)
      }
      for (const row of projectBusinessFlow({
        stageId,
        doneSeatIds,
        researchPass: next.researchPass,
        filed,
      })) {
        setFlowNodeProgress(target.caseId, row.flowKey, row.stepIndex)
      }
      if (!run.ok) {
        const fail = `中台交接未写入 · ${run.message}`
        setLastReturnHint(filedHint ? `${filedHint} · ${fail}` : fail)
      }
      return {
        businessOk: true,
        midOk: run.ok,
        midMessage: run.message,
        flowProjected: true,
      }
    },
    [
      addArtifact,
      appendLogs,
      confirms,
      dispatchCommand,
      getThread,
      progressById,
      rewindToStep,
      setFlowNodeProgress,
    ],
  )

  const returnItem = useCallback(
    async (confirmId: string, note?: string): Promise<MidSyncOutcome> => {
      const target = confirms.find((c) => c.id === confirmId)
      if (!target || target.status !== 'pending') {
        return {
          businessOk: false,
          midOk: false,
          midMessage: '没有待确认项',
          flowProjected: false,
        }
      }
      const noteText = (note?.trim() || '请按意见修改').trim()
      const meta = CONFIRM_META[target.kind]
      const log = hitlReturnLog(target.caseId, target.kind, noteText)
      appendLogs([log])
      const baseHint =
        target.kind === 'research_ready'
          ? `请再查一轮 · ${noteText}`
          : target.kind === 'oa_strategy'
            ? `答复策略已驳回 · 请重做 · ${noteText}`
            : target.kind === 'layout_adjust'
              ? `请按意见调整布局 · ${noteText}`
              : `请按意见修改 · ${noteText}`
      setLastReturnHint(baseHint)

      // T10：驳回理由 → 判断档案
      {
        const j = buildJudgmentFromConfirm({
          caseId: target.caseId,
          confirmId: target.id,
          kind: target.kind,
          summary: target.summary,
          resultPreview: target.resultPreview,
          processPreview: target.processPreview,
          decision: 'returned',
          reason: noteText,
        })
        setJudgments((prev) => [j, ...prev].slice(0, 200))
      }

      // 只标记 returned · 取消同 kind 其它 pending · 不立刻再挂闸（否则席被锁无法改稿）
      setConfirms((prev) =>
        prev
          .map((c) => {
            if (c.id === confirmId) {
              return {
                ...c,
                status: 'returned' as const,
                returnNote: noteText,
              }
            }
            if (
              c.caseId === target.caseId &&
              c.kind === target.kind &&
              c.status === 'pending'
            ) {
              return {
                ...c,
                status: 'returned' as const,
                returnNote: noteText,
              }
            }
            return c
          }),
      )

      setProgressById((pprev) => {
        const cur =
          pprev[target.caseId] ?? emptyProgress(target.caseId, meta.stageId)
        return {
          ...pprev,
          [target.caseId]: {
            ...cur,
            stageId: meta.stageId,
            doneSeatIds: cur.doneSeatIds.filter((id) => id !== meta.seatId),
            updatedAt: nowIso(),
          },
        }
      })

      // 回退到交卷前一步 + 会话按意见改稿
      const def = getProjectExpert(meta.seatId)
      const script = buildHitlReviseScript(target.kind, meta.seatId, noteText)
      const rewindIdx = script.rewindToIndex(def.steps.length)
      rewindToStep(target.caseId, meta.seatId, rewindIdx)
      script.lines.forEach((line, i) => {
        window.setTimeout(() => {
          appendMessage(target.caseId, meta.seatId, {
            role: i === 0 ? 'system' : 'assistant',
            content: line,
            meta: { backend: 'mock', stepId: 'hitl_return_revise' },
          })
        }, i * 280)
      })

      const cur =
        progressById[target.caseId] ?? emptyProgress(target.caseId, meta.stageId)
      const run = await runReturnCommands(
        returnCommands({
          kind: target.kind,
          caseId: target.caseId,
          note: noteText,
        }),
        dispatchCommand,
        midSyncMeta({
          kind: target.kind,
          seatId: seatIdForConfirm(target.kind),
          action: 'return',
        }),
      )
      for (const row of projectBusinessFlow({
        stageId: meta.stageId,
        doneSeatIds: cur.doneSeatIds.filter((id) => id !== meta.seatId),
        researchPass: normalizeResearchPass(cur.researchPass),
        filed: cur.filed,
      })) {
        setFlowNodeProgress(target.caseId, row.flowKey, row.stepIndex)
      }
      if (!run.ok) {
        setLastReturnHint(`${baseHint} · 中台交接未写入（${run.message}）`)
      }
      return {
        businessOk: true,
        midOk: run.ok,
        midMessage: run.message,
        flowProjected: true,
      }
    },
    [
      appendLogs,
      appendMessage,
      confirms,
      dispatchCommand,
      progressById,
      rewindToStep,
      setFlowNodeProgress,
    ],
  )

  const lastReturnNoteForSeat = useCallback(
    (caseId: string, seatId: ProjectExpertId) => {
      const kind = confirmKindForSeat(seatId)
      if (!kind) return null
      const hit = confirms.find(
        (c) =>
          c.caseId === caseId &&
          c.kind === kind &&
          c.status === 'returned' &&
          !!c.returnNote,
      )
      return hit?.returnNote ?? null
    },
    [confirms],
  )

  const runHitlReturnRevise = useCallback(
    (caseId: string, seatId: ProjectExpertId) => {
      const kind = confirmKindForSeat(seatId)
      if (!kind) return { ok: false as const, reason: 'no_kind' }
      const note =
        lastReturnNoteForSeat(caseId, seatId) || '请按意见修改'
      const pendingSame = confirms.some(
        (c) =>
          c.caseId === caseId && c.kind === kind && c.status === 'pending',
      )
      if (pendingSame) {
        return { ok: false as const, reason: 'still_pending' }
      }
      const def = getProjectExpert(seatId)
      const script = buildHitlReviseScript(kind, seatId, note)
      const rewindIdx = script.rewindToIndex(def.steps.length)
      rewindToStep(caseId, seatId, rewindIdx)
      appendLogs([
        {
          id: processLogId('rev'),
          caseId,
          at: processLogStamp(),
          kind: 'hitl_return',
          seatId,
          message: `${businessSeatLabel(seatId)} · 按退回意见改一版`,
          detail: note.slice(0, 120),
        },
      ])
      script.lines.forEach((line, i) => {
        window.setTimeout(() => {
          appendMessage(caseId, seatId, {
            role: i === 0 ? 'system' : 'assistant',
            content: line,
            meta: { backend: 'mock', stepId: 'hitl_return_revise' },
          })
        }, i * 280)
      })
      setLastReturnHint(`正在按意见改稿 · ${note}`)
      return { ok: true as const }
    },
    [
      appendLogs,
      appendMessage,
      confirms,
      lastReturnNoteForSeat,
      rewindToStep,
    ],
  )

  const runLoopDemo = useCallback(
    (caseId: string, demo: LoopDemoKey) => {
      if (demo === 'disclosure_ask') {
        appendLogs(disclosureAskLines(caseId, 2))
        return
      }
      if (demo === 'research_heal') {
        appendLogs(selfHealScript(caseId, 'expert-research', 2))
        return
      }
      if (demo === 'draft_heal') {
        appendLogs(selfHealScript(caseId, 'expert-draft', 2))
        return
      }
      if (demo === 'draft_escalate') {
        appendLogs(selfHealScript(caseId, 'expert-draft', SELF_HEAL_MAX + 1))
        return
      }
      if (demo === 'figure_feedback') {
        appendLogs([
          figureFeedbackLog(caseId),
          {
            id: processLogId('fig'),
            caseId,
            at: processLogStamp(),
            kind: 'figure_feedback',
            seatId: 'expert-draft',
            message: '撰写已按附图意见改术语 · 待附图再核',
          },
        ])
        return
      }
      if (demo === 'research_pessimistic') {
        appendLogs([researchPessimisticLog(caseId)])
        return
      }
      if (demo === 'intake_low_score') {
        appendLogs([intakeLowScoreLog(caseId)])
        return
      }
      if (demo === 'layout_flywheel' || demo === 'layout_flywheel_biz') {
        const forceBiz = demo === 'layout_flywheel_biz'
        appendLogs(layoutFlywheelScript(caseId))
        const prog = progressById[caseId] ?? emptyProgress(caseId)
        const metaCase = caseMeta.find((m) => m.id === caseId)
        const enableBiz =
          forceBiz || caseHasLayoutEnabled(prog, metaCase?.expertIds)
        if (forceBiz) {
          setProgressById((prev) => {
            const cur = prev[caseId] ?? emptyProgress(caseId)
            const more: ProjectExpertId[] = cur.moreSeatIds.includes(
              'expert-layout',
            )
              ? cur.moreSeatIds
              : [...cur.moreSeatIds, 'expert-layout']
            return {
              ...prev,
              [caseId]: { ...cur, moreSeatIds: more, updatedAt: nowIso() },
            }
          })
          setCaseMeta((prev) =>
            prev.map((m) =>
              m.id === caseId && !m.expertIds.includes('expert-layout')
                ? { ...m, expertIds: [...m.expertIds, 'expert-layout'] }
                : m,
            ),
          )
        }
        if (enableBiz) {
          const item: BusinessConfirmItem = {
            id: uid('bcf'),
            caseId,
            kind: 'layout_adjust',
            title: CONFIRM_KIND_LABEL.layout_adjust,
            summary:
              '维权监测发现布局漏洞 · 布局策略师已出补局建议 · 请确认布局调整。',
            resultPreview:
              '【成果】补局建议：加从属覆盖空白点 · 布局方案 v(n+1)（样机）。',
            processPreview:
              '【办理过程】监测 → 布局漏洞报告 → F9→F3 回流 → 布局待拍板。',
            preparedBy: CONFIRM_META.layout_adjust.preparedBy,
            createdAt: stamp(),
            status: 'pending',
          }
          setConfirms((prev) => [
            item,
            ...prev.filter(
              (c) =>
                !(
                  c.caseId === caseId &&
                  c.kind === 'layout_adjust' &&
                  c.status === 'pending'
                ),
            ),
          ])
        }
        return
      }
      if (demo === 'oa_inventive') {
        const round = Math.max(progressById[caseId]?.oaRound || 1, 1)
        appendLogs(oaStrategyPrepScript(caseId, 'inventive', round))
        return
      }
      if (demo === 'oa_clarity') {
        const round = Math.max(progressById[caseId]?.oaRound || 1, 1)
        appendLogs(oaStrategyPrepScript(caseId, 'clarity', round))
        return
      }
      if (demo === 'oa_blocker') {
        const round = Math.max(progressById[caseId]?.oaRound || 1, 1)
        appendLogs([oaBlockerEscalateLog(caseId, round)])
        return
      }
      if (demo === 'oa_strategy_reject') {
        const pending = confirms.find(
          (c) =>
            c.caseId === caseId &&
            c.kind === 'oa_strategy' &&
            c.status === 'pending',
        )
        if (pending) {
          // reuse returnItem path via inline
          const noteText = '策略方向不对 · 请重做'
          appendLogs([
            hitlReturnLog(caseId, 'oa_strategy', noteText),
          ])
          setLastReturnHint(`答复策略已驳回 · 请重做 · ${noteText}`)
          setConfirms((prev) => {
            const target = prev.find((c) => c.id === pending.id)
            if (!target) return prev
            const returned = {
              ...target,
              status: 'returned' as const,
              returnNote: noteText,
            }
            const requeued = {
              ...target,
              id: uid('bcf'),
              status: 'pending' as const,
              summary: `策略已驳回 · ${noteText}`,
              processPreview: `【办理过程】HITL⑥ 策略驳回重做 · ${noteText}`,
              createdAt: stamp(),
              returnNote: noteText,
            }
            return [requeued, returned, ...prev.filter((c) => c.id !== pending.id)]
          })
          return
        }
        appendLogs([hitlReturnLog(caseId, 'oa_strategy', '策略方向不对 · 请重做')])
        setLastReturnHint('答复策略已驳回 · 请重做')
        return
      }
      if (demo === 'oa_round2') {
        // handled below via arriveNextOaRound body inlined to avoid TDZ
        const cur = progressById[caseId] ?? emptyProgress(caseId, 'oa')
        if (!cur.filed) {
          appendLogs([
            {
              id: processLogId('oablk'),
              caseId,
              at: processLogStamp(),
              kind: 'advance',
              seatId: 'expert-oa',
              message: '未递交 · 审查答复未解锁（不可进入 N 通）',
            },
          ])
          return
        }
        const nextRound = Math.max(cur.oaRound || 1, 1) + 1
        setProgressById((prev) => ({
          ...prev,
          [caseId]: {
            ...(prev[caseId] ?? cur),
            stageId: 'oa',
            filed: true,
            oaRound: nextRound,
            doneSeatIds: (prev[caseId] ?? cur).doneSeatIds.filter(
              (id) => id !== 'expert-oa',
            ),
            updatedAt: nowIso(),
          },
        }))
        appendLogs([oaRoundArriveLog(caseId, nextRound)])
        const item: BusinessConfirmItem = {
          id: uid('bcf'),
          caseId,
          kind: 'oa_strategy',
          title: CONFIRM_KIND_LABEL.oa_strategy,
          summary: `第 ${nextRound} 通通知书到达 · 请确认答复策略。`,
          resultPreview: `【成果】第 ${nextRound} 通策略草案待生成（样机）。`,
          processPreview: `【办理过程】第 ${nextRound} 通到达 · 回答复入口。`,
          preparedBy: CONFIRM_META.oa_strategy.preparedBy,
          createdAt: stamp(),
          status: 'pending',
        }
        setConfirms((prev) => [
          item,
          ...prev.filter(
            (c) =>
              !(
                c.caseId === caseId &&
                c.kind === 'oa_strategy' &&
                c.status === 'pending'
              ),
          ),
        ])
        appendLogs(oaStrategyPrepScript(caseId, 'clarity', nextRound))
      }
    },
    [appendLogs, progressById, confirms, caseMeta],
  )

  const arriveNextOaRound = useCallback(
    (caseId: string, reason: OaReasonClass = 'clarity') => {
      runLoopDemo(caseId, 'oa_round2')
      if (reason !== 'clarity') {
        // oa_round2 默认 clarity；额外再记一次指定理由可在后续扩展
        void reason
      }
    },
    [runLoopDemo],
  )

  const isBusinessCase = useCallback(
    (id: string) => caseIds.includes(id) || caseMeta.some((m) => m.id === id),
    [caseIds, caseMeta],
  )

  const advanceSeatWork = useCallback(
    (caseId: string, seatId: ProjectExpertId) => {
      const def = getProjectExpert(seatId)
      const thread = getThread(caseId, seatId)
      const cur = thread?.stepIndex ?? 0
      const next = Math.min(cur + 1, Math.max(def.steps.length - 1, 0))
      advanceStep(caseId, seatId)
      const step = def.steps[next] ?? def.steps[cur]
      const stepLabel = step?.label ?? def.name
      const seatName = businessSeatLabel(seatId)
      const logId = processLogId('adv')
      const toolBit = step?.tool
        ? `${step.tool.preview}`
        : '本步产出片段已写入成果'
      appendLogs([
        {
          id: logId,
          caseId,
          at: processLogStamp(),
          kind: 'advance',
          seatId,
          message: `${seatName} · 完成本步「${stepLabel}」`,
          detail: step?.triggersHitl
            ? `交卷待确认 · ${toolBit}`
            : `做了什么：${step?.script ?? stepLabel} · ${toolBit}`,
        },
      ])
      if (!step?.triggersHitl) {
        return { stepLabel, delivered: false, processLogId: logId }
      }
      markArtifactSubmitted(caseId, seatId)
      const kind = confirmKindForSeat(seatId)
      if (!kind) {
        return { stepLabel, delivered: true, processLogId: logId }
      }
      const prog = progressById[caseId] ?? emptyProgress(caseId)
      if (kind === 'oa_strategy' && !prog.filed) {
        return { stepLabel, delivered: true, processLogId: logId }
      }
      const confirm = prepareConfirm(caseId, kind)
      if (confirm.id.startsWith('bcf-blocked')) {
        return { stepLabel, delivered: true, processLogId: logId }
      }
      return { stepLabel, delivered: true, confirm, processLogId: logId }
    },
    [
      advanceStep,
      getThread,
      markArtifactSubmitted,
      prepareConfirm,
      progressById,
      appendLogs,
    ],
  )

  const rewindSeatWork = useCallback(
    (caseId: string, seatId: ProjectExpertId, targetIndex: number) => {
      const r = rewindToStep(caseId, seatId, targetIndex)
      if (!r.ok) {
        return { ok: false as const, reason: r.reason }
      }
      const kind = confirmKindForSeat(seatId)
      const seatName = businessSeatLabel(seatId)
      const clearedPending = kind
        ? confirms.filter(
            (c) =>
              c.caseId === caseId &&
              c.kind === kind &&
              c.status === 'pending',
          ).length
        : 0
      if (kind && clearedPending > 0) {
        setConfirms((prev) =>
          prev.map((c) =>
            c.caseId === caseId &&
            c.kind === kind &&
            c.status === 'pending'
              ? {
                  ...c,
                  status: 'returned' as const,
                  returnNote: `席内回退到「${r.stepLabel}」· 待确认已取消`,
                }
              : c,
          ),
        )
      }
      setProgressById((prev) => {
        const cur = prev[caseId] ?? emptyProgress(caseId)
        if (!cur.doneSeatIds.includes(seatId)) return prev
        return {
          ...prev,
          [caseId]: {
            ...cur,
            doneSeatIds: cur.doneSeatIds.filter((id) => id !== seatId),
            updatedAt: nowIso(),
          },
        }
      })
      const logId = processLogId('rew')
      appendLogs([
        {
          id: logId,
          caseId,
          at: processLogStamp(),
          kind: 'advance',
          seatId,
          message: `${seatName} · 回退到第 ${r.stepIndex + 1} 步「${r.stepLabel}」`,
          detail:
            clearedPending > 0
              ? `其后产出视为草稿 · 已取消本席 ${clearedPending} 项待确认`
              : '其后产出视为草稿 · 可改完再推进',
        },
      ])
      return {
        ok: true as const,
        stepLabel: r.stepLabel,
        processLogId: logId,
      }
    },
    [appendLogs, confirms, rewindToStep],
  )

  const requestUpstreamFeedback = useCallback(
    (
      caseId: string,
      fromSeat: ProjectExpertId,
      toSeat: ProjectExpertId,
      reason: string,
    ) => {
      if (fromSeat === toSeat) {
        return { ok: false as const, reason: 'same_seat' }
      }
      const fromName = businessSeatLabel(fromSeat)
      const toName = businessSeatLabel(toSeat)
      const note = reason.trim() || '请按下游意见调整一版'
      const log = seatFeedbackLog(caseId, fromSeat, toSeat, note)
      appendLogs([log])

      // 飞轮 / 回流目标席：挂到更多专家，避免点了切不过去
      if (feedbackNeedsMoreSeat(toSeat)) {
        setProgressById((prev) => {
          const cur = prev[caseId] ?? emptyProgress(caseId)
          const more = cur.moreSeatIds.includes(toSeat)
            ? cur.moreSeatIds
            : [...cur.moreSeatIds, toSeat]
          return {
            ...prev,
            [caseId]: { ...cur, moreSeatIds: more, updatedAt: nowIso() },
          }
        })
        setCaseMeta((prev) =>
          prev.map((m) => {
            if (m.id !== caseId) return m
            if (m.expertIds.includes(toSeat)) return m
            return { ...m, expertIds: [...m.expertIds, toSeat] }
          }),
        )
      }

      // 上游：撤回 done + 取消其 pending（便于再改）
      const toKind = confirmKindForSeat(toSeat)
      if (toKind) {
        setConfirms((prev) =>
          prev.map((c) =>
            c.caseId === caseId &&
            c.kind === toKind &&
            c.status === 'pending'
              ? {
                  ...c,
                  status: 'returned' as const,
                  returnNote: `跨席 feedback · ${fromName} 请调整`,
                }
              : c,
          ),
        )
      }
      setProgressById((prev) => {
        const cur = prev[caseId] ?? emptyProgress(caseId)
        if (!cur.doneSeatIds.includes(toSeat)) return prev
        return {
          ...prev,
          [caseId]: {
            ...cur,
            doneSeatIds: cur.doneSeatIds.filter((id) => id !== toSeat),
            updatedAt: nowIso(),
          },
        }
      })

      appendMessage(caseId, fromSeat, {
        role: 'assistant',
        content: `【${fromName}】已向「${toName}」发出反馈信封（样机）· **请对方调整，不是把本案拨回上一步**。\n\n反馈：${note}`,
        meta: { backend: 'mock', stepId: 'feedback_out' },
      })
      appendMessage(caseId, toSeat, {
        role: 'system',
        content: `📩 【跨席 feedback】来自「${fromName}」\n${note}\n\n正在按反馈改一版…`,
        meta: { backend: 'mock', stepId: 'feedback_in' },
      })

      // 上游出 v2
      window.setTimeout(() => {
        appendMessage(caseId, toSeat, {
          role: 'assistant',
          content: upstreamAdjustScript(toSeat, fromSeat, note),
          meta: { backend: 'mock', stepId: 'feedback_v2' },
        })
        appendMessage(caseId, toSeat, {
          role: 'tool',
          content: `${toName} v2 · 已回传「${fromName}」`,
          meta: {
            backend: 'mock',
            toolName: feedbackToolName(toSeat),
            stepId: 'feedback_v2',
          },
        })
        // v2 回传后重新挂待确认（R1/R3：done 须经确认，不软写 doneSeatIds）
        if (toKind) {
          prepareConfirm(caseId, toKind)
        }
        appendLogs([
          {
            id: processLogId('fbv'),
            caseId,
            at: processLogStamp(),
            kind: 'seat_feedback',
            seatId: toSeat,
            message: `「${toName}」v2 已回传「${fromName}」`,
            detail: toKind
              ? '外循环 feedback · 下游不倒进度 · 上游 v2 待确认后计入 done'
              : '外循环 feedback · 下游不倒进度 · 基于新产物续写',
          },
        ])
      }, 700)

      // 下游接着做
      window.setTimeout(() => {
        appendMessage(caseId, fromSeat, {
          role: 'assistant',
          content: downstreamResumeScript(fromSeat, toSeat),
          meta: { backend: 'mock', stepId: 'feedback_resume' },
        })
      }, 1400)

      setLastReturnHint(
        `已请「${toName}」调整 · 改完会回传「${fromName}」接着做`,
      )
      return {
        ok: true as const,
        processLogId: log.id,
        switchToSeat: toSeat,
      }
    },
    [appendLogs, appendMessage, prepareConfirm],
  )

  const runSeatLoop = useCallback(
    (
      caseId: string,
      seatId: ProjectExpertId,
      actionId: SeatLoopActionId,
      note?: string,
    ) => {
      const prog = progressById[caseId] ?? emptyProgress(caseId)
      const kind = confirmKindForSeat(seatId)
      const hasPending = !!(
        kind &&
        confirms.some(
          (c) =>
            c.caseId === caseId && c.kind === kind && c.status === 'pending',
        )
      )
      const allowed = loopActionsForSeat(seatId, {
        hasPending,
        filed: prog.filed,
      })
      const action = allowed.find((a) => a.id === actionId)
      if (!action) {
        return { ok: false as const, reason: 'unavailable' }
      }

      const seatName = businessSeatLabel(seatId)

      if (actionId === 'hitl_reject') {
        const pending = confirms.find(
          (c) =>
            c.caseId === caseId &&
            kind &&
            c.kind === kind &&
            c.status === 'pending',
        )
        const noteText = (note?.trim() || '请按意见修改').trim()
        if (pending) {
          returnItem(pending.id, noteText)
        } else if (seatId === 'expert-oa') {
          runLoopDemo(caseId, 'oa_strategy_reject')
        } else {
          appendLogs([
            hitlReturnLog(
              caseId,
              kind ?? 'disclosure_ready',
              noteText,
            ),
          ])
          setLastReturnHint(`已驳回 · ${noteText}`)
        }
        const chat = seatLoopChatScript(seatId, 'hitl_reject', noteText)
        chat.lines.forEach((line, i) => {
          window.setTimeout(() => {
            appendMessage(caseId, seatId, {
              role: 'assistant',
              content: line.startsWith('【') ? line : `【${seatName}】${line}`,
              meta: { backend: 'mock', stepId: 'hitl_reject' },
            })
          }, chat.delayMs[i] ?? i * 400)
        })
        return { ok: true as const }
      }

      const demo = resolveLoopDemo(seatId, action)
      if (demo === 'research_escalate') {
        appendLogs(
          selfHealScript(caseId, 'expert-research', SELF_HEAL_MAX + 1),
        )
      } else if (demo) {
        runLoopDemo(caseId, demo)
      }

      const chat = seatLoopChatScript(seatId, actionId, note)
      chat.lines.forEach((line, i) => {
        window.setTimeout(() => {
          appendMessage(caseId, seatId, {
            role: 'assistant',
            content: line,
            meta: { backend: 'mock', stepId: `loop_${actionId}` },
          })
        }, chat.delayMs[i] ?? i * 400)
      })
      return { ok: true as const }
    },
    [
      appendLogs,
      appendMessage,
      confirms,
      progressById,
      returnItem,
      runLoopDemo,
    ],
  )

  const recordWordExportHint = useCallback((caseId: string) => {
    appendLogs([
      {
        id: processLogId('word'),
        caseId,
        at: processLogStamp(),
        kind: 'advance',
        message: '案子助手 · 已示意导出 Word 草案（非真 Office）',
        detail: '样机一行 · 无真附件',
      },
    ])
  }, [appendLogs])

  const ensureSeatOnCase = useCallback(
    (caseId: string, seatId: ProjectExpertId) => {
      if (seatId === DRILL_ORCH_ID) return
      setProgressById((prev) => {
        const cur = prev[caseId] ?? emptyProgress(caseId)
        if (
          cur.moreSeatIds.includes(seatId) ||
          BUSINESS_DEFAULT_SEAT_IDS.includes(seatId)
        ) {
          return prev
        }
        return {
          ...prev,
          [caseId]: {
            ...cur,
            moreSeatIds: [...cur.moreSeatIds, seatId],
            updatedAt: nowIso(),
          },
        }
      })
      setCaseMeta((prev) =>
        prev.map((m) => {
          if (m.id !== caseId) return m
          if (m.expertIds.includes(seatId)) return m
          return { ...m, expertIds: [...m.expertIds, seatId] }
        }),
      )
    },
    [],
  )

  const dispatchDrillSeat = useCallback(
    (caseId: string, toSeat: ProjectExpertId, brief?: string) => {
      if (toSeat === DRILL_ORCH_ID) {
        return { ok: false as const, reason: 'cannot_dispatch_orch' }
      }
      const note = (brief?.trim() || drillDispatchBrief(toSeat)).trim()
      ensureSeatOnCase(caseId, toSeat)
      appendLogs([drillDispatchLog(caseId, toSeat, note)])
      appendMessage(caseId, DRILL_ORCH_ID, {
        role: 'assistant',
        content: `【总控】已分派「${businessSeatLabel(toSeat)}」· ${note}`,
        meta: { backend: 'mock', stepId: 'drill_dispatch' },
      })
      appendMessage(caseId, toSeat, {
        role: 'assistant',
        content: `【总控来信】${note}`,
        meta: { backend: 'mock', stepId: 'drill_dispatch_in' },
      })
      return { ok: true as const, switchToSeat: toSeat }
    },
    [appendLogs, appendMessage, ensureSeatOnCase],
  )

  const acceptDrillDualFile = useCallback(
    (
      caseId: string,
      seatId: ProjectExpertId,
      ok: boolean,
      note?: string,
    ) => {
      if (seatId === DRILL_ORCH_ID) {
        return { ok: false as const, reason: 'no_self_accept' }
      }
      const noteText =
        note?.trim() ||
        (ok
          ? '成果+办理过程齐全 · 可派下家'
          : '过程或缺关键取舍 · 请补 worklog 后再交')
      appendLogs([drillAcceptLog(caseId, seatId, ok, noteText)])
      if (ok) {
        appendMessage(caseId, DRILL_ORCH_ID, {
          role: 'assistant',
          content: `【总控】验收通过「${businessSeatLabel(seatId)}」· ${noteText}`,
          meta: { backend: 'mock', stepId: 'drill_accept' },
        })
        appendMessage(caseId, seatId, {
          role: 'assistant',
          content: `【总控验收】通过 · ${noteText}`,
          meta: { backend: 'mock', stepId: 'drill_accept_in' },
        })
        return { ok: true as const }
      }
      // 不过：复用跨席 feedback（总控 → owner）
      return requestUpstreamFeedback(
        caseId,
        DRILL_ORCH_ID,
        seatId,
        noteText,
      )
    },
    [appendLogs, appendMessage, requestUpstreamFeedback],
  )

  const setCaseTeam = useCallback(
    (caseId: string, memberIds: ProjectExpertId[]) => {
      const unique = [...new Set(memberIds)]
      setProgressById((prev) => {
        const cur = prev[caseId] ?? emptyProgress(caseId)
        return {
          ...prev,
          [caseId]: {
            ...cur,
            teamMemberIds: unique,
            updatedAt: nowIso(),
          },
        }
      })
    },
    [],
  )

  const updateCasePlan = useCallback((caseId: string, casePlan: string) => {
    const text = casePlan.trim()
    setProgressById((prev) => {
      const cur = prev[caseId] ?? emptyProgress(caseId)
      return {
        ...prev,
        [caseId]: {
          ...cur,
          casePlan: text || undefined,
          updatedAt: nowIso(),
        },
      }
    })
  }, [])

  const enableMoreDepartments = useCallback((caseId: string) => {
    const add = [
      ...BUSINESS_MORE_SEAT_IDS,
      'expert-layout' as ProjectExpertId,
    ]
    setProgressById((prev) => {
      const cur = prev[caseId] ?? emptyProgress(caseId)
      const more = [...cur.moreSeatIds]
      for (const id of add) {
        if (!more.includes(id)) more.push(id)
      }
      return {
        ...prev,
        [caseId]: { ...cur, moreSeatIds: more, updatedAt: nowIso() },
      }
    })
    setCaseMeta((prev) =>
      prev.map((m) => {
        if (m.id !== caseId) return m
        const expertIds = [...m.expertIds]
        for (const id of add) {
          if (!expertIds.includes(id)) expertIds.push(id)
        }
        return { ...m, expertIds }
      }),
    )
  }, [])

  const stageLabel = useCallback(
    (id: BusinessStageId) =>
      BUSINESS_STAGES.find((s) => s.id === id)?.title ?? id,
    [],
  )

  const primaryCta = useCallback(
    (caseId: string) => {
      const pending = confirms.filter(
        (c) => c.caseId === caseId && c.status === 'pending',
      )
      if (pending[0]) {
        return {
          label: pending[0].title,
          action: 'confirm' as const,
          confirmId: pending[0].id,
        }
      }
      const prog = ensureProgress(caseId)
      const stage = BUSINESS_STAGES.find((s) => s.id === prog.stageId)
      if (prog.casePlan?.trim()) {
        const start = resolveCasePlanStart({
          casePlan: prog.casePlan,
          skipPrepare: prog.stageId !== 'prepare',
        })
        return {
          label: start.nextStepLabel,
          action: 'advance' as const,
          fromPlan: true,
          seatId: start.seatId,
        }
      }
      return {
        label: stage?.advanceCta ?? '推进',
        action: 'advance' as const,
      }
    },
    [confirms, ensureProgress],
  )


  const getJudgments = useCallback(
    (caseId?: string) =>
      caseId ? judgments.filter((j) => j.caseId === caseId) : judgments,
    [judgments],
  )
  const getPreferences = useCallback(() => preferences, [preferences])
  const recordJudgment = useCallback((j: JudgmentRecord) => {
    setJudgments((prev) => [j, ...prev].slice(0, 200))
    setPreferences((prev) => {
      const cand = preferenceCandidateFromJudgment(j)
      if (prev.some((p) => p.text === cand.text)) return prev
      return [cand, ...prev].slice(0, 100)
    })
  }, [])
  const savePreferenceById = useCallback((prefId: string) => {
    setPreferences((prev) => {
      const next = savePreference(prev, prefId)
      upsertSavedPreferences(next.filter((p) => p.saved))
      return next
    })
  }, [])
  const precipitateJudgment = useCallback(
    (judgmentId: string) => {
      const j = judgments.find((x) => x.id === judgmentId)
      if (!j) return
      setPreferences((prev) => {
        const next = precipitateJudgmentAsPreference(prev, j)
        upsertSavedPreferences(next.filter((p) => p.saved))
        return next
      })
    },
    [judgments],
  )

  const value = useMemo
<BusinessCaseContextValue>(
    () => ({
      cases,
      getCase,
      getProgress,
      getPendingConfirms,
      getConfirm,
      getProcessLogs,
      createCaseFromWizard,
      advanceStage,
      prepareConfirm,
      confirmItem,
      returnItem,
      runHitlReturnRevise,
      lastReturnNoteForSeat,
      runLoopDemo,
      arriveNextOaRound,
      stageLabel,
      primaryCta,
      lastReturnHint,
      clearReturnHint,
      isBusinessCase,
      advanceSeatWork,
      rewindSeatWork,
      requestUpstreamFeedback,
      runSeatLoop,
      recordWordExportHint,
      dispatchDrillSeat,
      acceptDrillDualFile,
      setCaseTeam,
      updateCasePlan,
      enableMoreDepartments,
      getJudgments,
      getPreferences,
      recordJudgment,
      savePreferenceById,
      precipitateJudgment,
    }),
    [
      cases,
      getCase,
      getProgress,
      getPendingConfirms,
      getConfirm,
      getProcessLogs,
      createCaseFromWizard,
      advanceStage,
      prepareConfirm,
      confirmItem,
      returnItem,
      runHitlReturnRevise,
      lastReturnNoteForSeat,
      runLoopDemo,
      arriveNextOaRound,
      stageLabel,
      primaryCta,
      lastReturnHint,
      clearReturnHint,
      isBusinessCase,
      advanceSeatWork,
      rewindSeatWork,
      requestUpstreamFeedback,
      runSeatLoop,
      recordWordExportHint,
      dispatchDrillSeat,
      acceptDrillDualFile,
      setCaseTeam,
      updateCasePlan,
      enableMoreDepartments,
      getJudgments,
      getPreferences,
      recordJudgment,
      savePreferenceById,
      precipitateJudgment,
    ],
  )

  return (
    <BusinessCaseContext.Provider value={value}>
      {children}
    </BusinessCaseContext.Provider>
  )
}

export function useBusinessCases(): BusinessCaseContextValue {
  const ctx = useContext(BusinessCaseContext)
  if (!ctx) {
    throw new Error('useBusinessCases must be used within BusinessCaseProvider')
  }
  return ctx
}
