import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react'
import type { ProjectExpertId } from '../projects/types'
import {
  ORG_DEPTS,
  defaultSkillsFor,
  type ExpertConfig,
  type ExpertSkill,
  type OrgDept,
  type OrgDeptConfig,
  type OrgDeptId,
} from './orgDepts'

/**
 * 组织配置 · 部门 / 专家 / skill 的可编辑覆盖层（样机）
 *
 * 纪律：
 * - 不改 deptRoster.ts / expertsPatent.ts（被测试钉死）
 * - 只在这一层叠加 label、skill、role 文案
 * - 不落库：localStorage 元数据，无真 IAM
 * - 部门闸仍只由主责交卷；本层不产生任何 pending
 */

const ORG_LS_KEY = 'ip-harness-agent-org-v1'

type PersistedOrg = {
  v: 1
  onboarded: boolean
  deptConfigs: Record<string, OrgDeptConfig>
  expertConfigs: Record<string, ExpertConfig>
}

function loadPersisted(): PersistedOrg | null {
  if (typeof localStorage === 'undefined') return null
  const raw = localStorage.getItem(ORG_LS_KEY)
  if (!raw) return null
  try {
    const parsed = JSON.parse(raw) as PersistedOrg
    if (parsed?.v !== 1) return null
    // 老数据迁移：xp / skill.prompt / skill.capability 缺省补齐
    return {
      ...parsed,
      deptConfigs: parsed.deptConfigs ?? {},
      expertConfigs: Object.values(parsed.expertConfigs ?? {}).reduce<
        Record<string, ExpertConfig>
      >((acc, e) => {
        acc[e.seatId] = normalizeExpert(e)
        return acc
      }, {}),
    }
  } catch {
    return null
  }
}

function persist(v: PersistedOrg) {
  if (typeof localStorage === 'undefined') return
  try {
    localStorage.setItem(ORG_LS_KEY, JSON.stringify(v))
  } catch {
    /* 样机可静默 */
  }
}

/** 老数据补齐：xp / skill.prompt / skill.capability / notes */
function normalizeExpert(raw: ExpertConfig): ExpertConfig {
  const base = defaultSkillsFor(raw.seatId)
  const skills = (raw.skills ?? []).map((s) => {
    const seed = base.find((b) => b.id === s.id)
    return {
      ...s,
      prompt: s.prompt ?? seed?.prompt ?? '',
      capability: s.capability ?? seed?.capability ?? 3,
    }
  })
  // 种子 skill 不在老数据里也补上，保证新能力档可见
  const have = new Set(skills.map((s) => s.id))
  const merged = [
    ...skills,
    ...base.filter((b) => !have.has(b.id)).map((b) => ({ ...b })),
  ]
  return {
    seatId: raw.seatId,
    role: raw.role ?? '',
    skills: merged,
    notes: raw.notes ?? '',
    xp: raw.xp ?? 0,
  }
}

export type OrgConfigContextValue = {
  onboarded: boolean
  completeOnboarding: () => void
  reopenOnboarding: () => void
  deptConfigs: Record<string, OrgDeptConfig>
  patchDeptConfig: (deptId: OrgDeptId, patch: Partial<OrgDeptConfig>) => void
  /** 部门显示名：配置覆盖 > canonical */
  deptLabel: (dept: OrgDept) => string
  expertConfigs: Record<string, ExpertConfig>
  getExpertConfig: (seatId: ProjectExpertId) => ExpertConfig
  patchExpertConfig: (seatId: ProjectExpertId, patch: Partial<ExpertConfig>) => void
  addSkill: (seatId: ProjectExpertId, name: string, level?: ExpertSkill['level']) => void
  toggleSkill: (seatId: ProjectExpertId, skillId: string) => void
  removeSkill: (seatId: ProjectExpertId, skillId: string) => void
  /** 改单个 skill 的提示词 */
  patchSkill: (
    seatId: ProjectExpertId,
    skillId: string,
    patch: Partial<Pick<ExpertSkill, 'prompt' | 'capability' | 'name'>>,
  ) => void
  /** 养成：追加经验（如一个案例 +8），返回新 xp */
  trainExpert: (seatId: ProjectExpertId, deltaXp: number) => number
  /** 已启用的部门（配置 enabled=false 则隐藏） */
  enabledDepts: OrgDept[]
}

const OrgConfigContext = createContext<OrgConfigContextValue | null>(null)

function blankExpert(seatId: ProjectExpertId): ExpertConfig {
  return { seatId, role: '', skills: defaultSkillsFor(seatId), notes: '', xp: 0 }
}

export function OrgConfigProvider({ children }: { children: ReactNode }) {
  const saved = useMemo(loadPersisted, [])
  const [onboarded, setOnboarded] = useState<boolean>(saved?.onboarded ?? false)
  const [deptConfigs, setDeptConfigs] = useState<Record<string, OrgDeptConfig>>(
    saved?.deptConfigs ?? {},
  )
  const [expertConfigs, setExpertConfigs] = useState<
    Record<string, ExpertConfig>
  >(saved?.expertConfigs ?? {})

  useEffect(() => {
    persist({ v: 1, onboarded, deptConfigs, expertConfigs })
  }, [onboarded, deptConfigs, expertConfigs])

  const completeOnboarding = useCallback(() => setOnboarded(true), [])
  const reopenOnboarding = useCallback(() => setOnboarded(false), [])

  const patchDeptConfig = useCallback(
    (deptId: OrgDeptId, patch: Partial<OrgDeptConfig>) => {
      setDeptConfigs((prev) => {
        const base: OrgDeptConfig = prev[deptId] ?? {
          deptId,
          label: '',
          enabled: true,
        }
        return { ...prev, [deptId]: { ...base, ...patch, deptId } }
      })
    },
    [],
  )

  const deptLabel = useCallback(
    (dept: OrgDept) => deptConfigs[dept.id]?.label?.trim() || dept.label,
    [deptConfigs],
  )

  const getExpertConfig = useCallback(
    (seatId: ProjectExpertId): ExpertConfig =>
      expertConfigs[seatId] ?? blankExpert(seatId),
    [expertConfigs],
  )

  const patchExpertConfig = useCallback(
    (seatId: ProjectExpertId, patch: Partial<ExpertConfig>) => {
      setExpertConfigs((prev) => ({
        ...prev,
        [seatId]: { ...(prev[seatId] ?? blankExpert(seatId)), ...patch, seatId },
      }))
    },
    [],
  )

  const addSkill = useCallback(
    (seatId: ProjectExpertId, name: string, level: ExpertSkill['level'] = 'optional') => {
      const clean = name.trim()
      if (!clean) return
      setExpertConfigs((prev) => {
        const cur = prev[seatId] ?? blankExpert(seatId)
        return {
          ...prev,
          [seatId]: {
            ...cur,
            skills: [
              ...cur.skills,
              {
                id: `sk-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
                name: clean,
                level,
                enabled: true,
                prompt: '',
                capability: 3,
              },
            ],
          },
        }
      })
    },
    [],
  )

  const toggleSkill = useCallback(
    (seatId: ProjectExpertId, skillId: string) => {
      setExpertConfigs((prev) => {
        const cur = prev[seatId]
        if (!cur) return prev
        return {
          ...prev,
          [seatId]: {
            ...cur,
            skills: cur.skills.map((s) =>
              s.id === skillId ? { ...s, enabled: !s.enabled } : s,
            ),
          },
        }
      })
    },
    [],
  )

  const removeSkill = useCallback(
    (seatId: ProjectExpertId, skillId: string) => {
      setExpertConfigs((prev) => {
        const cur = prev[seatId]
        if (!cur) return prev
        return {
          ...prev,
          [seatId]: {
            ...cur,
            skills: cur.skills.filter((s) => s.id !== skillId),
          },
        }
      })
    },
    [],
  )

  const patchSkill = useCallback(
    (
      seatId: ProjectExpertId,
      skillId: string,
      patch: Partial<Pick<ExpertSkill, 'prompt' | 'capability' | 'name'>>,
    ) => {
      setExpertConfigs((prev) => {
        const cur = prev[seatId] ?? blankExpert(seatId)
        return {
          ...prev,
          [seatId]: {
            ...cur,
            skills: cur.skills.map((s) => (s.id === skillId ? { ...s, ...patch } : s)),
          },
        }
      })
    },
    [],
  )

  const trainExpert = useCallback(
    (seatId: ProjectExpertId, deltaXp: number) => {
      let next = 0
      setExpertConfigs((prev) => {
        const cur = prev[seatId] ?? blankExpert(seatId)
        next = Math.max(0, cur.xp + deltaXp)
        return { ...prev, [seatId]: { ...cur, xp: next } }
      })
      return next
    },
    [],
  )

  const enabledDepts = useMemo(
    () => ORG_DEPTS.filter((d) => deptConfigs[d.id]?.enabled !== false),
    [deptConfigs],
  )

  const value = useMemo<OrgConfigContextValue>(
    () => ({
      onboarded,
      completeOnboarding,
      reopenOnboarding,
      deptConfigs,
      patchDeptConfig,
      deptLabel,
      expertConfigs,
      getExpertConfig,
      patchExpertConfig,
      addSkill,
      toggleSkill,
      removeSkill,
      patchSkill,
      trainExpert,
      enabledDepts,
    }),
    [
      onboarded,
      completeOnboarding,
      reopenOnboarding,
      deptConfigs,
      patchDeptConfig,
      deptLabel,
      expertConfigs,
      getExpertConfig,
      patchExpertConfig,
      addSkill,
      toggleSkill,
      removeSkill,
      patchSkill,
      trainExpert,
      enabledDepts,
    ],
  )

  return <OrgConfigContext.Provider value={value}>{children}</OrgConfigContext.Provider>
}

export function useOrgConfig(): OrgConfigContextValue {
  const ctx = useContext(OrgConfigContext)
  if (!ctx) throw new Error('useOrgConfig must be used within OrgConfigProvider')
  return ctx
}
