/**
 * 入口角色（演示落点）· 与租户 workspace 解耦：
 * - agency → /agent/cases 多案流水
 * - enterprise → 最近案子公司首页 / 无案开案子
 * localStorage 键：ip-agent-entry-role；缺省 agency（演示友好）
 */
export type EntryRole = 'agency' | 'enterprise'

export const ENTRY_ROLE_LS_KEY = 'ip-agent-entry-role'

export function isEntryRole(v: unknown): v is EntryRole {
  return v === 'agency' || v === 'enterprise'
}

export function readEntryRole(): EntryRole | null {
  try {
    const raw = localStorage.getItem(ENTRY_ROLE_LS_KEY)
    return isEntryRole(raw) ? raw : null
  } catch {
    return null
  }
}

export function writeEntryRole(role: EntryRole): void {
  try {
    localStorage.setItem(ENTRY_ROLE_LS_KEY, role)
  } catch {
    /* ignore quota / private mode */
  }
}

/**
 * 最近触达案子：优先 progress.updatedAt（ISO），其次过程日志 at，同值时保 cases 原序先出现者。
 */
export function pickLatestCaseId(
  cases: readonly { id: string }[],
  getUpdatedAt: (caseId: string) => string | undefined,
  getLatestLogAt?: (caseId: string) => string | undefined,
): string | undefined {
  if (cases.length === 0) return undefined
  let bestId = cases[0]!.id
  let bestScore = ''
  for (const c of cases) {
    const u = getUpdatedAt(c.id) ?? ''
    const l = getLatestLogAt?.(c.id) ?? ''
    const score = u >= l ? u : l
    if (score > bestScore) {
      bestScore = score
      bestId = c.id
    }
  }
  return bestId
}

export const ENTRY_ROLE_LABEL: Record<EntryRole, string> = {
  agency: '我是代理',
  enterprise: '我是企业',
}

/**
 * 双角色默认落点（product-pages §4.0 / AgentEntryRedirect）
 * - agency → /agent/cases
 * - enterprise + 有案 → 最近案子公司首页
 * - enterprise + 无案 → /agent/cases/new
 */
export function resolveEntryLandingPath(
  entryRole: EntryRole,
  cases: readonly { id: string }[],
  getUpdatedAt: (caseId: string) => string | undefined,
  getLatestLogAt?: (caseId: string) => string | undefined,
): string {
  if (entryRole === 'agency') return '/agent/cases'
  if (cases.length === 0) return '/agent/cases/new'
  const latestId = pickLatestCaseId(cases, getUpdatedAt, getLatestLogAt)
  return `/agent/cases/${latestId ?? cases[0]!.id}`
}

