import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react'
import {
  MAIN_CHAIN_DEPT_IDS,
  ORG_DEPTS,
  defaultSkillsFor,
  type ExpertConfig,
  type ExpertSkill,
  type OrgCapability,
  type OrgDept,
  type OrgDeptConfig,
  type OrgDeptId,
  type OrgExtraExpert,
  type OrgSeatId,
} from './orgDepts'
import { DEPT_RICH } from './orgData'

/**
 * 组织配置 · 部门 / 专家 / 能力挂接（样机）
 * 本机 localStorage；可加专家、改挂接；不改花名册真源。
 */

const ORG_LS_KEY = 'ip-harness-agent-org-v1'

type PersistedOrg = {
  v: 1
  onboarded: boolean
  deptConfigs: Record<string, OrgDeptConfig>
  expertConfigs: Record<string, ExpertConfig>
  /** 公司能力库；缺省时用种子 */
  capabilities?: OrgCapability[]
}

/** 从各部门能力目录种子公司能力库 */
export function seedCapabilities(): OrgCapability[] {
  const out: OrgCapability[] = []
  const seen = new Set<string>()
  for (const deptId of MAIN_CHAIN_DEPT_IDS) {
    for (const t of DEPT_RICH[deptId]?.tools ?? []) {
      if (seen.has(t.name)) continue
      seen.add(t.name)
      out.push({
        id: `cap-${t.id}`,
        name: t.name,
        deptId,
        note: '种子 · 对齐部门能力目录',
      })
    }
  }
  return out
}

function normalizeDept(raw: Partial<OrgDeptConfig> & { deptId: string }): OrgDeptConfig {
  return {
    deptId: raw.deptId as OrgDeptId,
    label: raw.label ?? '',
    enabled: raw.enabled !== false,
    extraExperts: Array.isArray(raw.extraExperts) ? raw.extraExperts : [],
  }
}

function loadPersisted(): PersistedOrg | null {
  if (typeof localStorage === 'undefined') return null
  const raw = localStorage.getItem(ORG_LS_KEY)
  if (!raw) return null
  try {
    const parsed = JSON.parse(raw) as PersistedOrg
    if (parsed?.v !== 1) return null
    const deptConfigs = Object.values(parsed.deptConfigs ?? {}).reduce<
      Record<string, OrgDeptConfig>
    >((acc, d) => {
      if (!d?.deptId) return acc
      acc[d.deptId] = normalizeDept(d)
      return acc
    }, {})
    const expertConfigs = Object.values(parsed.expertConfigs ?? {}).reduce<
      Record<string, ExpertConfig>
    >((acc, e) => {
      if (!e?.seatId) return acc
      acc[e.seatId] = normalizeExpert(e)
      return acc
    }, {})
    const capabilities = Array.isArray(parsed.capabilities)
      ? parsed.capabilities.filter((c) => c?.id && c?.name)
      : undefined
    return {
      ...parsed,
      deptConfigs,
      expertConfigs,
      capabilities,
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
    displayName: raw.displayName,
  }
}

export type OrgConfigContextValue = {
  onboarded: boolean
  completeOnboarding: () => void
  reopenOnboarding: () => void
  deptConfigs: Record<string, OrgDeptConfig>
  patchDeptConfig: (deptId: OrgDeptId, patch: Partial<OrgDeptConfig>) => void
  deptLabel: (dept: OrgDept) => string
  expertConfigs: Record<string, ExpertConfig>
  getExpertConfig: (seatId: OrgSeatId) => ExpertConfig
  patchExpertConfig: (seatId: OrgSeatId, patch: Partial<ExpertConfig>) => void
  addSkill: (seatId: OrgSeatId, name: string, level?: ExpertSkill['level']) => void
  toggleSkill: (seatId: OrgSeatId, skillId: string) => void
  removeSkill: (seatId: OrgSeatId, skillId: string) => void
  patchSkill: (
    seatId: OrgSeatId,
    skillId: string,
    patch: Partial<Pick<ExpertSkill, 'prompt' | 'capability' | 'name'>>,
  ) => void
  trainExpert: (seatId: OrgSeatId, deltaXp: number) => number
  enabledDepts: OrgDept[]
  /** 部门加人（自由名） */
  addDeptExpert: (deptId: OrgDeptId, name: string) => OrgExtraExpert | null
  /** 请来示意岗 → 可配席 */
  hirePeerExpert: (
    deptId: OrgDeptId,
    peerId: string,
    name: string,
  ) => OrgExtraExpert | null
  removeDeptExpert: (deptId: OrgDeptId, expertId: string) => void
  expertDisplayName: (seatId: OrgSeatId, fallback?: string) => string
  /** 公司能力库 */
  capabilities: OrgCapability[]
  addCapability: (input: {
    name: string
    deptId?: OrgDeptId
    note?: string
  }) => OrgCapability | null
  removeCapability: (id: string) => void
  patchCapability: (
    id: string,
    patch: Partial<Pick<OrgCapability, 'name' | 'deptId' | 'note'>>,
  ) => void
  /** 某部可挂的能力：本部 + 通用 */
  capabilitiesForDept: (deptId: OrgDeptId) => OrgCapability[]
}

const OrgConfigContext = createContext<OrgConfigContextValue | null>(null)

function skillsFromDeptCatalog(deptId: OrgDeptId): ExpertSkill[] {
  const tools = DEPT_RICH[deptId]?.tools ?? []
  if (!tools.length) return defaultSkillsFor(`org-${deptId}`)
  return tools.map((t, i) => ({
    id: `sk-cat-${t.id}`,
    name: t.name,
    level: i === 0 ? ('core' as const) : ('optional' as const),
    enabled: true,
    prompt: '',
    capability: 3 as const,
  }))
}

function blankExpert(
  seatId: OrgSeatId,
  displayName?: string,
  deptId?: OrgDeptId,
): ExpertConfig {
  const roster =
    typeof seatId === 'string' &&
    /^(expert-|orchestrator|general-)/.test(seatId)
  return {
    seatId,
    role: '',
    skills: roster
      ? defaultSkillsFor(seatId)
      : deptId
        ? skillsFromDeptCatalog(deptId)
        : defaultSkillsFor(seatId),
    notes: '',
    xp: 0,
    displayName,
  }
}

function blankDept(deptId: OrgDeptId): OrgDeptConfig {
  return { deptId, label: '', enabled: true, extraExperts: [] }
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
  const [capabilities, setCapabilities] = useState<OrgCapability[]>(
    () =>
      saved?.capabilities && saved.capabilities.length > 0
        ? saved.capabilities
        : seedCapabilities(),
  )

  useEffect(() => {
    persist({
      v: 1,
      onboarded,
      deptConfigs,
      expertConfigs,
      capabilities,
    })
  }, [onboarded, deptConfigs, expertConfigs, capabilities])

  const completeOnboarding = useCallback(() => setOnboarded(true), [])
  const reopenOnboarding = useCallback(() => setOnboarded(false), [])

  const patchDeptConfig = useCallback(
    (deptId: OrgDeptId, patch: Partial<OrgDeptConfig>) => {
      setDeptConfigs((prev) => {
        const base = prev[deptId] ? normalizeDept(prev[deptId]!) : blankDept(deptId)
        return {
          ...prev,
          [deptId]: normalizeDept({ ...base, ...patch, deptId }),
        }
      })
    },
    [],
  )

  const deptLabel = useCallback(
    (dept: OrgDept) => deptConfigs[dept.id]?.label?.trim() || dept.label,
    [deptConfigs],
  )

  const getExpertConfig = useCallback(
    (seatId: OrgSeatId): ExpertConfig =>
      expertConfigs[seatId] ?? blankExpert(seatId),
    [expertConfigs],
  )

  const patchExpertConfig = useCallback(
    (seatId: OrgSeatId, patch: Partial<ExpertConfig>) => {
      setExpertConfigs((prev) => ({
        ...prev,
        [seatId]: { ...(prev[seatId] ?? blankExpert(seatId)), ...patch, seatId },
      }))
    },
    [],
  )

  const expertDisplayName = useCallback(
    (seatId: OrgSeatId, fallback = '专家') => {
      const cfg = expertConfigs[seatId]
      if (cfg?.displayName?.trim()) return cfg.displayName.trim()
      return fallback
    },
    [expertConfigs],
  )

  const ensureExpertSeat = useCallback(
    (seatId: string, displayName: string, deptId?: OrgDeptId) => {
      setExpertConfigs((prev) => {
        if (prev[seatId]) {
          if (!prev[seatId]!.displayName) {
            return {
              ...prev,
              [seatId]: { ...prev[seatId]!, displayName },
            }
          }
          return prev
        }
        return { ...prev, [seatId]: blankExpert(seatId, displayName, deptId) }
      })
    },
    [],
  )

  const addDeptExpert = useCallback(
    (deptId: OrgDeptId, name: string) => {
      const clean = name.trim()
      if (!clean) return null
      const extra: OrgExtraExpert = {
        id: `org-seat-${deptId}-${Date.now().toString(36)}`,
        name: clean,
      }
      setDeptConfigs((prev) => {
        const base = prev[deptId] ? normalizeDept(prev[deptId]!) : blankDept(deptId)
        return {
          ...prev,
          [deptId]: {
            ...base,
            extraExperts: [...base.extraExperts, extra],
          },
        }
      })
      ensureExpertSeat(extra.id, clean, deptId)
      return extra
    },
    [ensureExpertSeat],
  )

  const hirePeerExpert = useCallback(
    (deptId: OrgDeptId, peerId: string, name: string) => {
      const clean = name.trim()
      if (!clean) return null
      const id = `hired:${peerId}`
      let created: OrgExtraExpert | null = null
      setDeptConfigs((prev) => {
        const base = prev[deptId] ? normalizeDept(prev[deptId]!) : blankDept(deptId)
        if (base.extraExperts.some((e) => e.id === id || e.fromPeerId === peerId)) {
          return prev
        }
        created = { id, name: clean, fromPeerId: peerId }
        return {
          ...prev,
          [deptId]: {
            ...base,
            extraExperts: [...base.extraExperts, created],
          },
        }
      })
      ensureExpertSeat(id, clean, deptId)
      return created ?? { id, name: clean, fromPeerId: peerId }
    },
    [ensureExpertSeat],
  )

  const removeDeptExpert = useCallback((deptId: OrgDeptId, expertId: string) => {
    setDeptConfigs((prev) => {
      const base = prev[deptId]
      if (!base) return prev
      const next = normalizeDept(base)
      return {
        ...prev,
        [deptId]: {
          ...next,
          extraExperts: next.extraExperts.filter((e) => e.id !== expertId),
        },
      }
    })
    setExpertConfigs((prev) => {
      if (!prev[expertId]) return prev
      const { [expertId]: _, ...rest } = prev
      return rest
    })
  }, [])

  const addSkill = useCallback(
    (seatId: OrgSeatId, name: string, level: ExpertSkill['level'] = 'optional') => {
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

  const toggleSkill = useCallback((seatId: OrgSeatId, skillId: string) => {
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
  }, [])

  const removeSkill = useCallback((seatId: OrgSeatId, skillId: string) => {
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
  }, [])

  const patchSkill = useCallback(
    (
      seatId: OrgSeatId,
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

  const trainExpert = useCallback((seatId: OrgSeatId, deltaXp: number) => {
    let next = 0
    setExpertConfigs((prev) => {
      const cur = prev[seatId] ?? blankExpert(seatId)
      next = Math.max(0, cur.xp + deltaXp)
      return { ...prev, [seatId]: { ...cur, xp: next } }
    })
    return next
  }, [])

  const addCapability = useCallback(
    (input: { name: string; deptId?: OrgDeptId; note?: string }) => {
      const name = input.name.trim()
      if (!name) return null
      if (capabilities.some((c) => c.name === name)) return null
      const cap: OrgCapability = {
        id: `cap-${Date.now().toString(36)}`,
        name,
        deptId: input.deptId,
        note: input.note?.trim() || undefined,
      }
      setCapabilities((prev) => [...prev, cap])
      return cap
    },
    [capabilities],
  )

  const removeCapability = useCallback((id: string) => {
    setCapabilities((prev) => prev.filter((c) => c.id !== id))
  }, [])

  const patchCapability = useCallback(
    (
      id: string,
      patch: Partial<Pick<OrgCapability, 'name' | 'deptId' | 'note'>>,
    ) => {
      setCapabilities((prev) =>
        prev.map((c) => {
          if (c.id !== id) return c
          const next = { ...c, ...patch }
          if (patch.name != null) next.name = patch.name.trim() || c.name
          if (patch.note != null) next.note = patch.note.trim() || undefined
          return next
        }),
      )
    },
    [],
  )

  const capabilitiesForDept = useCallback(
    (deptId: OrgDeptId) =>
      capabilities.filter((c) => !c.deptId || c.deptId === deptId),
    [capabilities],
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
      addDeptExpert,
      hirePeerExpert,
      removeDeptExpert,
      expertDisplayName,
      capabilities,
      addCapability,
      removeCapability,
      patchCapability,
      capabilitiesForDept,
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
      addDeptExpert,
      hirePeerExpert,
      removeDeptExpert,
      expertDisplayName,
      capabilities,
      addCapability,
      removeCapability,
      patchCapability,
      capabilitiesForDept,
    ],
  )

  return <OrgConfigContext.Provider value={value}>{children}</OrgConfigContext.Provider>
}

export function useOrgConfig(): OrgConfigContextValue {
  const ctx = useContext(OrgConfigContext)
  if (!ctx) throw new Error('useOrgConfig must be used within OrgConfigProvider')
  return ctx
}
