/**
 * L2 画像种子 · 01b-进门登记与前台引导-spec
 * 登录后可跳过；前台确认去向后可弱回写。样机 localStorage · 非真画像服务。
 */
import type { EntryRole } from './entryRole'

export const PERSONA_SEED_LS_KEY = 'ip-agent-persona-v1'

export type PersonaFamiliarity = 'first' | 'used_similar'

export type PersonaJobTendency =
  | 'disclosure'
  | 'draft'
  | 'oa'
  | 'unsure'

export type UserPersonaSeed = {
  /** 与 entryRole 对齐的粗角色 */
  roleHint: EntryRole
  /** 常办倾向 · 至多 2 */
  jobTendencies: PersonaJobTendency[]
  familiarity: PersonaFamiliarity
  /** 用户点了跳过 */
  skipped: boolean
  updatedAt: string
}

const JOB_LABEL: Record<PersonaJobTendency, string> = {
  disclosure: '写交底',
  draft: '递申请',
  oa: '答审查',
  unsure: '还不确定',
}

export function jobTendencyLabel(id: PersonaJobTendency): string {
  return JOB_LABEL[id]
}

export function readPersonaSeed(): UserPersonaSeed | null {
  try {
    const raw = localStorage.getItem(PERSONA_SEED_LS_KEY)
    if (!raw) return null
    const parsed = JSON.parse(raw) as Partial<UserPersonaSeed>
    if (!parsed || typeof parsed !== 'object') return null
    if (parsed.roleHint !== 'agency' && parsed.roleHint !== 'enterprise') return null
    return {
      roleHint: parsed.roleHint,
      jobTendencies: Array.isArray(parsed.jobTendencies)
        ? parsed.jobTendencies.filter(isJobTendency).slice(0, 2)
        : [],
      familiarity: parsed.familiarity === 'used_similar' ? 'used_similar' : 'first',
      skipped: Boolean(parsed.skipped),
      updatedAt: typeof parsed.updatedAt === 'string' ? parsed.updatedAt : '',
    }
  } catch {
    return null
  }
}

function isJobTendency(v: unknown): v is PersonaJobTendency {
  return v === 'disclosure' || v === 'draft' || v === 'oa' || v === 'unsure'
}

/** 已填或已跳过 → 不再挡大厅 */
export function isPersonaSeedSettled(): boolean {
  const p = readPersonaSeed()
  return Boolean(p && (p.skipped || p.updatedAt))
}

export function writePersonaSeed(seed: UserPersonaSeed): void {
  try {
    localStorage.setItem(PERSONA_SEED_LS_KEY, JSON.stringify(seed))
  } catch {
    /* ignore */
  }
}

export function skipPersonaSeed(roleHint: EntryRole): void {
  writePersonaSeed({
    roleHint,
    jobTendencies: [],
    familiarity: 'first',
    skipped: true,
    updatedAt: new Date().toISOString(),
  })
}

export function savePersonaSeed(input: {
  roleHint: EntryRole
  jobTendencies: PersonaJobTendency[]
  familiarity: PersonaFamiliarity
}): void {
  writePersonaSeed({
    roleHint: input.roleHint,
    jobTendencies: input.jobTendencies.slice(0, 2),
    familiarity: input.familiarity,
    skipped: false,
    updatedAt: new Date().toISOString(),
  })
}

/** 确认领进后弱回写：把本次部门倾向并入 jobTendencies（去重截断 2） */
export function weakUpdatePersonaFromDeptSlug(slug: string): void {
  const cur = readPersonaSeed()
  if (!cur || cur.skipped) return
  const map: Record<string, PersonaJobTendency> = {
    disclosure: 'disclosure',
    draft: 'draft',
    oa: 'oa',
  }
  const job = map[slug]
  if (!job) return
  const next = [job, ...cur.jobTendencies.filter((j) => j !== job)].slice(0, 2)
  writePersonaSeed({
    ...cur,
    jobTendencies: next,
    updatedAt: new Date().toISOString(),
  })
}

export type ReceptionExample = {
  id: string
  text: string
  slugHint: string
}

const ALL_EXAMPLES: ReceptionExample[] = [
  {
    id: 'ex-disclosure',
    text: '有个结构改动，还没写成交底',
    slugHint: 'disclosure',
  },
  {
    id: 'ex-draft',
    text: '交底差不多了，想递申请',
    slugHint: 'draft',
  },
  {
    id: 'ex-oa',
    text: '手里有审查意见，不知道往哪走',
    slugHint: 'oa',
  },
]

/** 按画像倾向排序示例；无画像则默认交底→申请→答复 */
export function receptionExamplesForPersona(
  seed: UserPersonaSeed | null,
): ReceptionExample[] {
  const order = seed?.jobTendencies?.length
    ? seed.jobTendencies
    : (['disclosure', 'draft', 'oa'] as PersonaJobTendency[])
  const ranked = [...ALL_EXAMPLES].sort((a, b) => {
    const ia = order.indexOf(a.slugHint as PersonaJobTendency)
    const ib = order.indexOf(b.slugHint as PersonaJobTendency)
    const sa = ia === -1 ? 99 : ia
    const sb = ib === -1 ? 99 : ib
    return sa - sb
  })
  return ranked.slice(0, 3)
}
