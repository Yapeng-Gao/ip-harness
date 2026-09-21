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
  processLogId,
  processLogStamp,
  researchPessimisticLog,
  selfHealScript,
  type ProcessLogEntry,
} from './packLoops'

export type { ProcessLogEntry } from './packLoops'
export { SELF_HEAL_MAX, DISCLOSURE_ASK_MAX } from './packLoops'

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
  doneSeatIds: ProjectExpertId[]
  moreSeatIds: ProjectExpertId[]
  updatedAt: string
}

export const BUSINESS_SEED_IDS = {
  A: 'case-biz-edge-scheduler',
  B: 'case-biz-sensor-pack',
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
  // Knife1 演示种子：传感校准套件已走过交底追问 + 查新自修复 1 次
  return [
    ...disclosureAskLines(BUSINESS_SEED_IDS.B, 2),
    ...selfHealScript(BUSINESS_SEED_IDS.B, 'expert-research', 2),
  ]
}

function buildInitialBusinessState(): {
  caseIds: string[]
  progressById: Record<string, CaseProgress>
  confirms: BusinessConfirmItem[]
  caseMeta: BusinessCaseMeta[]
  processLogs: ProcessLogEntry[]
} {
  const seedIds: string[] = [BUSINESS_SEED_IDS.A, BUSINESS_SEED_IDS.B]
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
      progressById[id] = prog
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
  /** Knife1 演示：内循环 / 附图 feedback / 超限 escalate / 查新不乐观灰示意 */
  runLoopDemo: (
    caseId: string,
    demo:
      | 'disclosure_ask'
      | 'research_heal'
      | 'draft_heal'
      | 'draft_escalate'
      | 'figure_feedback'
      | 'research_pessimistic',
  ) => void
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
  ]
}

function seedProgressMap(): Record<string, CaseProgress> {
  return {
    [BUSINESS_SEED_IDS.A]: {
      caseId: BUSINESS_SEED_IDS.A,
      stageId: 'intake',
      completedStages: ['prepare'],
      filed: false,
      doneSeatIds: ['expert-research'],
      moreSeatIds: [],
      updatedAt: nowIso(),
    },
    [BUSINESS_SEED_IDS.B]: {
      caseId: BUSINESS_SEED_IDS.B,
      stageId: 'drafting',
      completedStages: ['prepare', 'intake'],
      filed: false,
      doneSeatIds: [
        'expert-research',
        'expert-intake',
        'expert-disclosure',
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
      if (kind === 'disclosure_ready') {
        appendLogs(disclosureAskLines(caseId, 2))
      } else if (kind === 'research_ready') {
        appendLogs(selfHealScript(caseId, 'expert-research', 2))
      } else if (kind === 'claims_ready') {
        appendLogs(selfHealScript(caseId, 'expert-draft', 2))
      }
      const healHint =
        kind === 'research_ready'
          ? '查新覆盖度自修复已过 · '
          : kind === 'claims_ready'
            ? '撰写四类校验自修复已过 · '
            : kind === 'disclosure_ready'
              ? '交底缺项追问已齐 · '
              : ''
      const item: BusinessConfirmItem = {
        id: uid('bcf'),
        caseId,
        kind,
        title: CONFIRM_KIND_LABEL[kind],
        summary: `${businessSeatLabel(meta.seatId)}已准备好，请确认。`,
        resultPreview: `【成果】${CONFIRM_KIND_LABEL[kind]}草稿已生成（样机）。`,
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
    [appendLogs],
  )

  const confirmItem = useCallback((confirmId: string) => {
    setConfirms((prev) => {
      const target = prev.find((c) => c.id === confirmId)
      if (!target || target.status !== 'pending') return prev
      const meta = CONFIRM_META[target.kind]
      setProgressById((pprev) => {
        const cur =
          pprev[target.caseId] ?? emptyProgress(target.caseId, meta.stageId)
        const doneSeatIds = cur.doneSeatIds.includes(meta.seatId)
          ? cur.doneSeatIds
          : [...cur.doneSeatIds, meta.seatId]
        let completedStages = [...cur.completedStages]
        let stageId = cur.stageId
        let filed = cur.filed

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
        } else if (target.kind === 'oa_strategy') {
          if (!completedStages.includes('oa')) completedStages.push('oa')
        }

        return {
          ...pprev,
          [target.caseId]: {
            ...cur,
            doneSeatIds,
            completedStages,
            stageId,
            filed,
            updatedAt: nowIso(),
          },
        }
      })
      return prev.map((c) =>
        c.id === confirmId ? { ...c, status: 'confirmed' as const } : c,
      )
    })
  }, [])

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
          summary: `已退回 · ${noteText}`,
          processPreview: `【办理过程】退回带批注重跑 · ${noteText}`,
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
    (
      caseId: string,
      demo:
        | 'disclosure_ask'
        | 'research_heal'
        | 'draft_heal'
        | 'draft_escalate'
        | 'figure_feedback'
        | 'research_pessimistic',
    ) => {
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
      }
    },
    [appendLogs],
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
