import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react'
import { useProjectFolder } from '../projects/ProjectFolderContext'
import type { AgentProject, ProjectExpertId } from '../projects/types'
import {
  BUSINESS_DEFAULT_TEAM_IDS,
  BUSINESS_STAGES,
  CONFIRM_KIND_LABEL,
  CONFIRM_META,
  type BusinessConfirmKind,
  type BusinessStageId,
  businessSeatLabel,
} from './businessSeats'
import {
  SELF_HEAL_MAX,
  disclosureAskLines,
  figureFeedbackLog,
  hitlReturnLog,
  oaBlockerEscalateLog,
  oaRoundArriveLog,
  oaStrategyPrepScript,
  oaSubmitLog,
  processLogId,
  processLogStamp,
  researchPessimisticLog,
  selfHealScript,
  type OaReasonClass,
  type ProcessLogEntry,
} from './packLoops'

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
  | 'oa_inventive'
  | 'oa_clarity'
  | 'oa_round2'
  | 'oa_blocker'
  | 'oa_strategy_reject'

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
}

/** 同源进度 · 时间线 / 待确认 / 侧栏当前步 */
export type CaseProgress = {
  caseId: string
  stageId: BusinessStageId
  completedStages: BusinessStageId[]
  filed: boolean
  /** OA 第 N 通（未进入审查答复为 0） */
  oaRound: number
  doneSeatIds: ProjectExpertId[]
  moreSeatIds: ProjectExpertId[]
  updatedAt: string
}

export const BUSINESS_SEED_IDS = {
  A: 'case-biz-edge-scheduler',
  B: 'case-biz-sensor-pack',
  /** Knife2 · 已递交 · 审查答复样机 */
  C: 'case-biz-oa-filed',
} as const

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
  return [
    ...disclosureAskLines(BUSINESS_SEED_IDS.B, 2),
    ...selfHealScript(BUSINESS_SEED_IDS.B, 'expert-research', 2),
    oaRoundArriveLog(BUSINESS_SEED_IDS.C, 1),
    ...oaStrategyPrepScript(BUSINESS_SEED_IDS.C, 'inventive', 1),
  ]
}

function buildInitialBusinessState(): {
  caseIds: string[]
  progressById: Record<string, CaseProgress>
  confirms: BusinessConfirmItem[]
  caseMeta: BusinessCaseMeta[]
  processLogs: ProcessLogEntry[]
} {
  const seedIds: string[] = [
    BUSINESS_SEED_IDS.A,
    BUSINESS_SEED_IDS.B,
    BUSINESS_SEED_IDS.C,
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

  return { caseIds, progressById, confirms, caseMeta, processLogs }
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
  }) => AgentProject
  advanceStage: (caseId: string) => void
  prepareConfirm: (
    caseId: string,
    kind: BusinessConfirmKind,
  ) => BusinessConfirmItem
  confirmItem: (confirmId: string) => void
  /** 退回：人话提示 + 该项回到待确认；写环边过程 */
  returnItem: (confirmId: string, note?: string) => void
  /** Knife1/2 演示：内循环 / 环边 / OA N 通 / blocker */
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
  }
  lastReturnHint: string | null
  clearReturnHint: () => void
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
    doneSeatIds: [],
    moreSeatIds: [],
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
        '【成果】立项建议：做 · 范围：边缘调度模组控制方法 · 风险：中低 · 预算档：标准。',
      processPreview:
        '【办理过程】比对公开文献；新颖性可成立；创造性需限缩从属。',
      preparedBy: '立项',
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
        '【成果】权利要求 1–8：独立权项 1 覆盖传感采样与校准；从属 2–8 细化。',
      processPreview: '【办理过程】交底要点已吸入；与附图对齐。',
      preparedBy: '撰写',
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
        '【成果】三策略并列：限缩权项 / 纯陈述争辩 / 补充实验数据（样机）。',
      processPreview:
        '【办理过程】理由分类：创造性 · 子任务汇入：补充检索 · 待确认答复策略。',
      preparedBy: '审查答复',
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
      doneSeatIds: ['expert-research'],
      moreSeatIds: [],
      updatedAt: nowIso(),
    },
    [BUSINESS_SEED_IDS.B]: {
      caseId: BUSINESS_SEED_IDS.B,
      stageId: 'drafting',
      completedStages: ['prepare', 'intake'],
      filed: false,
      oaRound: 0,
      doneSeatIds: [
        'expert-research',
        'expert-intake',
        'expert-disclosure',
      ],
      moreSeatIds: [],
      updatedAt: nowIso(),
    },
    [BUSINESS_SEED_IDS.C]: {
      caseId: BUSINESS_SEED_IDS.C,
      stageId: 'oa',
      completedStages: ['prepare', 'intake', 'drafting', 'filing'],
      filed: true,
      oaRound: 1,
      doneSeatIds: [
        'expert-research',
        'expert-intake',
        'expert-disclosure',
        'expert-draft',
        'expert-figure',
        'expert-filing',
      ],
      moreSeatIds: [],
      updatedAt: nowIso(),
    },
  }
}

export function BusinessCaseProvider({ children }: { children: ReactNode }) {
  const { createProject, getProject, folderProjects } = useProjectFolder()
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
  const [lastReturnHint, setLastReturnHint] = useState<string | null>(null)

  const clearReturnHint = useCallback(() => setLastReturnHint(null), [])

  const appendLogs = useCallback((entries: ProcessLogEntry[]) => {
    if (entries.length === 0) return
    setProcessLogs((prev) => [...entries, ...prev].slice(0, 200))
  }, [])

  // 确保 ProjectFolder 有对应案子（刷新 / 热更后回填）
  useEffect(() => {
    for (const m of caseMeta) {
      if (!getProject(m.id)) {
        createProject({
          id: m.id,
          title: m.title,
          summary: m.summary,
          kind: 'domain',
          domainPackId: 'patent',
          expertIds:
            m.expertIds.length > 0 ? m.expertIds : BUSINESS_DEFAULT_TEAM_IDS,
        })
      }
    }
  }, [caseMeta, createProject, getProject])

  // 同标签刷新可恢复：案子列表 · 进度 · 待确认（含 confirmed / returned）
  useEffect(() => {
    persistBusiness({
      v: 1,
      caseIds,
      progressById,
      confirms,
      caseMeta,
      processLogs,
    })
  }, [caseIds, progressById, confirms, caseMeta, processLogs])

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
    (caseId: string): CaseProgress =>
      progressById[caseId] ?? emptyProgress(caseId, 'intake'),
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
          c.status === 'pending' && (caseId ? c.caseId === caseId : true),
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
    }) => {
      const more = input.moreSeatIds ?? []
      const expertIds = [
        ...BUSINESS_DEFAULT_TEAM_IDS,
        ...more.filter((id) => !BUSINESS_DEFAULT_TEAM_IDS.includes(id)),
      ]
      const p = createProject({
        title: input.title.trim() || '未命名案子',
        summary: input.summary?.trim() || '业务向导新建',
        kind: 'domain',
        domainPackId: 'patent',
        expertIds,
      })
      const stageId: BusinessStageId = input.skipPrepare ? 'intake' : 'prepare'
      setProgressById((prev) => ({
        ...prev,
        [p.id]: {
          caseId: p.id,
          stageId,
          completedStages: input.skipPrepare ? ['prepare'] : [],
          filed: false,
          oaRound: 0,
          doneSeatIds: [],
          moreSeatIds: more,
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
      return p
    },
    [createProject],
  )

  const advanceStage = useCallback((caseId: string) => {
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
  }, [])

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
            preparedBy: '审查答复',
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
                : ''
      const roundLabel =
        kind === 'oa_strategy'
          ? `第 ${Math.max(prog.oaRound || 1, 1)} 通 · `
          : ''
      const item: BusinessConfirmItem = {
        id: uid('bcf'),
        caseId,
        kind,
        title: CONFIRM_KIND_LABEL[kind],
        summary:
          kind === 'oa_strategy'
            ? `${roundLabel}${businessSeatLabel(meta.seatId)}已准备好，请确认答复策略。`
            : `${businessSeatLabel(meta.seatId)}已准备好，请确认。`,
        resultPreview:
          kind === 'oa_strategy'
            ? `【成果】第 ${Math.max(prog.oaRound || 1, 1)} 通三策略并列（限缩 / 陈述 / 补实验·样机）。`
            : `【成果】${CONFIRM_KIND_LABEL[kind]}草稿已生成（样机）。`,
        processPreview: `【办理过程】${healHint}${meta.preparedBy}席完成检查，待你确认。`,
        preparedBy: meta.preparedBy,
        createdAt: stamp(),
        status: 'pending',
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
    [appendLogs, progressById],
  )

  const confirmItem = useCallback(
    (confirmId: string) => {
      const target = confirms.find((c) => c.id === confirmId)
      if (!target || target.status !== 'pending') return
      const meta = CONFIRM_META[target.kind]
      const cur = progressById[target.caseId] ?? emptyProgress(target.caseId, meta.stageId)
      const doneSeatIds = cur.doneSeatIds.includes(meta.seatId)
        ? cur.doneSeatIds
        : [...cur.doneSeatIds, meta.seatId]
      let completedStages = [...cur.completedStages]
      let stageId = cur.stageId
      let filed = cur.filed
      let oaRound = cur.oaRound ?? 0

      if (target.kind === 'go_nogo') {
        if (!completedStages.includes('prepare')) completedStages.push('prepare')
        if (!completedStages.includes('intake')) completedStages.push('intake')
        stageId = 'drafting'
      } else if (target.kind === 'research_ready') {
        stageId = 'intake'
      } else if (
        target.kind === 'disclosure_ready' ||
        target.kind === 'claims_ready'
      ) {
        const disclosureDone =
          doneSeatIds.includes('expert-disclosure') ||
          target.kind === 'disclosure_ready'
        const draftDone =
          doneSeatIds.includes('expert-draft') ||
          target.kind === 'claims_ready'
        if (disclosureDone && draftDone) {
          if (!completedStages.includes('drafting'))
            completedStages.push('drafting')
          stageId = 'filing'
        } else {
          stageId = 'drafting'
        }
      } else if (target.kind === 'file_authorize') {
        filed = true
        if (!completedStages.includes('filing'))
          completedStages.push('filing')
        stageId = 'oa'
        oaRound = Math.max(cur.oaRound || 0, 1)
      } else if (target.kind === 'oa_strategy') {
        stageId = 'oa'
        oaRound = Math.max(cur.oaRound || 1, 1)
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
          updatedAt: nowIso(),
        },
      }))
      setConfirms((prev) =>
        prev.map((c) =>
          c.id === confirmId ? { ...c, status: 'confirmed' as const } : c,
        ),
      )

      if (target.kind === 'file_authorize') {
        appendLogs([oaRoundArriveLog(target.caseId, Math.max(oaRound, 1))])
      } else if (target.kind === 'oa_strategy') {
        appendLogs([oaSubmitLog(target.caseId, Math.max(oaRound, 1))])
      }
    },
    [confirms, progressById, appendLogs],
  )

  const returnItem = useCallback(
    (confirmId: string, note?: string) => {
      const noteText = (note?.trim() || '请按意见修改').trim()
      setConfirms((prev) => {
        const target = prev.find((c) => c.id === confirmId)
        if (!target || target.status !== 'pending') return prev
        const meta = CONFIRM_META[target.kind]
        const log = hitlReturnLog(target.caseId, target.kind, noteText)
        appendLogs([log])
        setLastReturnHint(
          target.kind === 'research_ready'
            ? `请再查一轮 · ${noteText}`
            : target.kind === 'oa_strategy'
              ? `答复策略已驳回 · 请重做 · ${noteText}`
              : `请按意见修改 · ${noteText}`,
        )
        // 进度：该席从 done 撤回，阶段回到确认所在
        setProgressById((pprev) => {
          const cur =
            pprev[target.caseId] ??
            emptyProgress(target.caseId, meta.stageId)
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
        const returned: BusinessConfirmItem = {
          ...target,
          status: 'returned',
          returnNote: noteText,
        }
        const requeued: BusinessConfirmItem = {
          ...target,
          id: uid('bcf'),
          status: 'pending',
          summary:
            target.kind === 'oa_strategy'
              ? `策略已驳回 · ${noteText}`
              : `已退回 · ${noteText}`,
          processPreview:
            target.kind === 'oa_strategy'
              ? `【办理过程】HITL⑥ 策略驳回重做 · ${noteText}`
              : `【办理过程】退回带批注重跑 · ${noteText}`,
          createdAt: stamp(),
          returnNote: noteText,
        }
        return [
          requeued,
          returned,
          ...prev.filter((c) => c.id !== confirmId),
        ]
      })
    },
    [appendLogs],
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
          preparedBy: '审查答复',
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
    [appendLogs, progressById, confirms],
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
      return {
        label: stage?.advanceCta ?? '推进',
        action: 'advance' as const,
      }
    },
    [confirms, ensureProgress],
  )

  const value = useMemo<BusinessCaseContextValue>(
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
      runLoopDemo,
      arriveNextOaRound,
      stageLabel,
      primaryCta,
      lastReturnHint,
      clearReturnHint,
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
      runLoopDemo,
      arriveNextOaRound,
      stageLabel,
      primaryCta,
      lastReturnHint,
      clearReturnHint,
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
