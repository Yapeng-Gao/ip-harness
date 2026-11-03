/**
 * 老板待办 A/B/C 聚合 · 交互大纲 §2.2
 * A = 硬请示未关；B = 有真实截止日的期限催办；C = 「现在做」工单（与 A 不双计「卡在待你确认」）
 * 壳角标只计 A+B；C 仅列表第三段（可灰点弱提示）
 */
import type {
  BusinessCaseMeta,
  BusinessConfirmItem,
  CaseProgress,
} from './BusinessCaseContext'
import { CONFIRM_META } from './businessSeats'
import { BUSINESS_SEED_IDS, isBusinessSeedCaseId } from './businessSeeds'
import { demoCaseFileTickets } from './caseFileDemo'
import { workbenchAskPath } from './pendingDeptQuery'
import {
  deptSlug,
  type OrgDeptId,
  orgDeptByLeadSeat,
} from '../departments/orgDepts'

export type BossTodoKind = 'A' | 'B' | 'C'

export type BossTodoItem = {
  id: string
  kind: BossTodoKind
  caseId: string
  caseTitle: string
  deptId: OrgDeptId
  deptSlug: string
  /** 一句话事由 */
  reason: string
  /** ISO date YYYY-MM-DD；仅 B 必有 */
  dueAt?: string
  overdue?: boolean
  /** 样机期限（有日但非官报） */
  demo?: boolean
  href: string
}

export type BossTodoCounts = {
  a: number
  b: number
  c: number
  /** 左栏主角标 = A+B */
  badge: number
  /** 无 A/B 但有 C → 灰点 */
  weakC: boolean
  /** 含 A 或 B 的案数（项目 Tab） */
  casesWithAb: number
}

type DeadlineSeed = {
  id: string
  caseId: string
  deptId: OrgDeptId
  title: string
  /** 相对今天的偏移天数；正=未来，负=已过 */
  offsetDays: number
  demo: true
}

/** 仅种子案挂带真实日历日的 B；无 due 日不造条 */
const DEADLINE_SEEDS: DeadlineSeed[] = [
  {
    id: 'seed-oa-reply',
    caseId: BUSINESS_SEED_IDS.C,
    deptId: 'dept-oa',
    title: '第 1 通答复期限',
    offsetDays: 12,
    demo: true,
  },
  {
    id: 'seed-oa-overdue',
    caseId: BUSINESS_SEED_IDS.C,
    deptId: 'dept-oa',
    title: '补正通知绝限',
    offsetDays: -3,
    demo: true,
  },
]

function isoDatePlus(days: number, from = new Date()): string {
  const d = new Date(from)
  d.setHours(12, 0, 0, 0)
  d.setDate(d.getDate() + days)
  return d.toISOString().slice(0, 10)
}

function todayIso(from = new Date()): string {
  const d = new Date(from)
  d.setHours(12, 0, 0, 0)
  return d.toISOString().slice(0, 10)
}

function parseDue(dueAt: string): Date | null {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(dueAt)) return null
  const d = new Date(`${dueAt}T12:00:00`)
  return Number.isNaN(d.getTime()) ? null : d
}

export function listBossTodosA(
  pending: BusinessConfirmItem[],
  cases: BusinessCaseMeta[],
): BossTodoItem[] {
  const titleOf = (id: string) =>
    cases.find((c) => c.id === id)?.title ?? id
  return pending
    .filter((p) => p.status === 'pending')
    .map((p) => {
      const dept = orgDeptByLeadSeat(CONFIRM_META[p.kind].seatId)
      const deptId = (dept?.id ?? 'dept-disclosure') as OrgDeptId
      const slug = deptSlug(deptId)
      return {
        id: `a-${p.id}`,
        kind: 'A' as const,
        caseId: p.caseId,
        caseTitle: titleOf(p.caseId),
        deptId,
        deptSlug: slug,
        reason: p.summary || p.title,
        href: workbenchAskPath(p.caseId, p.kind, { confirmId: p.id }),
      }
    })
}

export function listBossTodosB(
  cases: BusinessCaseMeta[],
  progressById: Record<string, CaseProgress>,
  now = new Date(),
): BossTodoItem[] {
  const today = todayIso(now)
  const titleOf = (id: string) =>
    cases.find((c) => c.id === id)?.title ?? id
  const out: BossTodoItem[] = []
  for (const seed of DEADLINE_SEEDS) {
    const prog = progressById[seed.caseId]
    if (!prog) continue
    // 诚实：答复类期限需已进答复/已递交语境
    if (seed.deptId === 'dept-oa') {
      if (!(prog.filed || prog.oaRound > 0 || prog.stageId === 'oa')) continue
    }
    const dueAt = isoDatePlus(seed.offsetDays, now)
    if (!parseDue(dueAt)) continue
    const slug = deptSlug(seed.deptId)
    out.push({
      id: `b-${seed.id}-${seed.caseId}`,
      kind: 'B',
      caseId: seed.caseId,
      caseTitle: titleOf(seed.caseId),
      deptId: seed.deptId,
      deptSlug: slug,
      reason: seed.title,
      dueAt,
      overdue: dueAt < today,
      demo: true,
      href: `/agent/cases/${seed.caseId}/depts/${slug}`,
    })
  }
  out.sort((a, b) => {
    if (a.overdue !== b.overdue) return a.overdue ? -1 : 1
    return (a.dueAt ?? '').localeCompare(b.dueAt ?? '')
  })
  return out
}

/**
 * C：部间「现在做」工单未结。
 * 不把「有未关硬请示」本身再记一条 C（A/C 不双计）。
 */
export function listBossTodosC(
  cases: BusinessCaseMeta[],
  progressById: Record<string, CaseProgress>,
): BossTodoItem[] {
  const titleOf = (id: string) =>
    cases.find((c) => c.id === id)?.title ?? id
  const out: BossTodoItem[] = []
  for (const c of cases) {
    const prog = progressById[c.id]
    if (!prog) continue
    const disclosureDone =
      prog.doneSeatIds.includes('expert-disclosure') ||
      prog.completedStages.includes('prepare')
    const tickets = demoCaseFileTickets(c.id, { disclosureDone })
    for (const t of tickets) {
      if (t.intent !== '现在做') continue
      out.push({
        id: `c-${t.id}`,
        kind: 'C',
        caseId: c.id,
        caseTitle: titleOf(c.id),
        deptId: t.toDeptId,
        deptSlug: t.toSlug,
        reason: `${t.intentLabel} · 工单未结`,
        href: `/agent/cases/${c.id}/depts/${t.toSlug}`,
      })
    }
  }
  return out
}

export function collectBossTodos(input: {
  scope?: 'workspace' | 'demo'
  deptSlug?: string | null
  pending: BusinessConfirmItem[]
  cases: BusinessCaseMeta[]
  progressById: Record<string, CaseProgress>
  now?: Date
}): {
  a: BossTodoItem[]
  b: BossTodoItem[]
  c: BossTodoItem[]
  allSorted: BossTodoItem[]
  counts: BossTodoCounts
  countByDept: Record<string, number>
  caseIdsWithAb: Set<string>
} {
  const cases = input.cases.filter((c) => isBusinessSeedCaseId(c.id) === (input.scope === 'demo'))
  const ids = new Set(cases.map((c) => c.id))
  const progress = Object.fromEntries(Object.entries(input.progressById).filter(([id]) => ids.has(id)))
  const inDept = (item: BossTodoItem) => !input.deptSlug || item.deptSlug === input.deptSlug
  const a = listBossTodosA(input.pending.filter((p) => ids.has(p.caseId)), cases).filter(inDept)
  const b = listBossTodosB(
    cases,
    progress,
    input.now ?? new Date(),
  ).filter(inDept)
  const c = listBossTodosC(cases, progress).filter(inDept)

  const allSorted = [...b.filter((x) => x.overdue), ...b.filter((x) => !x.overdue), ...a, ...c]

  const caseIdsWithAb = new Set<string>()
  for (const item of [...a, ...b]) caseIdsWithAb.add(item.caseId)

  const countByDept: Record<string, number> = {}
  for (const item of [...a, ...b]) {
    countByDept[item.deptId] = (countByDept[item.deptId] ?? 0) + 1
  }

  const counts: BossTodoCounts = {
    a: a.length,
    b: b.length,
    c: c.length,
    badge: a.length + b.length,
    weakC: a.length + b.length === 0 && c.length > 0,
    casesWithAb: caseIdsWithAb.size,
  }

  return { a, b, c, allSorted, counts, countByDept, caseIdsWithAb }
}

/** 案是否有诚实 B（带 dueAt） */
export function caseHasBossDeadlineB(
  caseId: string,
  progressById: Record<string, CaseProgress>,
  cases: BusinessCaseMeta[],
  now = new Date(),
): boolean {
  return listBossTodosB(cases, progressById, now).some((x) => x.caseId === caseId)
}
