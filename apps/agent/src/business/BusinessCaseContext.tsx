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

function buildInitialBusinessState(): {
  caseIds: string[]
  progressById: Record<string, CaseProgress>
  confirms: BusinessConfirmItem[]
  caseMeta: BusinessCaseMeta[]
} {
  const seedIds: string[] = [BUSINESS_SEED_IDS.A, BUSINESS_SEED_IDS.B]
  const seedProg = seedProgressMap()
  const seedConf = seedConfirms()
  const seedMeta = seedCaseMeta()
  const persisted = loadPersistedBusiness()
  if (!persisted) {
    return {
      caseIds: seedIds,
      progressById: seedProg,
      confirms: seedConf,
      caseMeta: seedMeta,
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

  return { caseIds, progressById, confirms, caseMeta }
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
  returnItem: (confirmId: string) => void
  stageLabel: (id: BusinessStageId) => string
  primaryCta: (caseId: string) => {
    label: string
    action: 'advance' | 'confirm' | 'open'
    confirmId?: string
  }
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
    })
  }, [caseIds, progressById, confirms, caseMeta])

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
      const item: BusinessConfirmItem = {
        id: uid('bcf'),
        caseId,
        kind,
        title: CONFIRM_KIND_LABEL[kind],
        summary: `${businessSeatLabel(meta.seatId)}已准备好，请确认。`,
        resultPreview: `【成果】${CONFIRM_KIND_LABEL[kind]}草稿已生成（样机）。`,
        processPreview: `【办理过程】${meta.preparedBy}席完成检查，待你确认。`,
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
    [],
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

  const returnItem = useCallback((confirmId: string) => {
    setConfirms((prev) =>
      prev.map((c) =>
        c.id === confirmId ? { ...c, status: 'returned' as const } : c,
      ),
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
      createCaseFromWizard,
      advanceStage,
      prepareConfirm,
      confirmItem,
      returnItem,
      stageLabel,
      primaryCta,
    }),
    [
      cases,
      getCase,
      getProgress,
      getPendingConfirms,
      getConfirm,
      createCaseFromWizard,
      advanceStage,
      prepareConfirm,
      confirmItem,
      returnItem,
      stageLabel,
      primaryCta,
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
