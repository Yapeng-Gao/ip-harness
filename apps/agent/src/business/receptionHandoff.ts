/**
 * 前台领进 → 部台收件（01c §2 · J2）
 * 有案写入 CaseProgress.receptionHandoff；无案先 sessionStorage pending。
 */
export const RECEPTION_PENDING_LS_KEY = 'ip-agent-reception-pending-v1'

export type ReceptionHandoff = {
  at: string
  goalText: string
  selectedSlug: string
  primarySlug: string
  altSlugs: string[]
  fileNames: string[]
  roughGaps: string[]
  intents: string[]
  reason: string
  overriddenPrimary: boolean
}

export function buildReceptionHandoff(input: {
  goalText?: string
  selectedSlug: string
  primarySlug: string
  altSlugs?: string[]
  fileNames?: string[]
  roughGaps?: string[]
  intents?: string[]
  reason?: string
}): ReceptionHandoff {
  const selectedSlug = input.selectedSlug.trim()
  const primarySlug = input.primarySlug.trim() || selectedSlug
  return {
    at: new Date().toISOString(),
    goalText: (input.goalText ?? '').trim(),
    selectedSlug,
    primarySlug,
    altSlugs: (input.altSlugs ?? []).filter(Boolean),
    fileNames: (input.fileNames ?? []).filter(Boolean),
    roughGaps: (input.roughGaps ?? []).filter(Boolean),
    intents: (input.intents ?? []).filter(Boolean),
    reason: (input.reason ?? '').trim(),
    overriddenPrimary: Boolean(selectedSlug && primarySlug && selectedSlug !== primarySlug),
  }
}

export function writeReceptionPending(handoff: ReceptionHandoff): void {
  try {
    sessionStorage.setItem(RECEPTION_PENDING_LS_KEY, JSON.stringify(handoff))
  } catch {
    /* ignore */
  }
}

export function readReceptionPending(): ReceptionHandoff | null {
  try {
    const raw = sessionStorage.getItem(RECEPTION_PENDING_LS_KEY)
    if (!raw) return null
    return parseReceptionHandoff(JSON.parse(raw))
  } catch {
    return null
  }
}

export function clearReceptionPending(): void {
  try {
    sessionStorage.removeItem(RECEPTION_PENDING_LS_KEY)
  } catch {
    /* ignore */
  }
}

export function parseReceptionHandoff(raw: unknown): ReceptionHandoff | null {
  if (!raw || typeof raw !== 'object') return null
  const o = raw as Partial<ReceptionHandoff>
  if (typeof o.selectedSlug !== 'string' || !o.selectedSlug.trim()) return null
  if (typeof o.primarySlug !== 'string' || !o.primarySlug.trim()) return null
  return {
    at: typeof o.at === 'string' ? o.at : new Date().toISOString(),
    goalText: typeof o.goalText === 'string' ? o.goalText : '',
    selectedSlug: o.selectedSlug.trim(),
    primarySlug: o.primarySlug.trim(),
    altSlugs: Array.isArray(o.altSlugs)
      ? o.altSlugs.filter((s): s is string => typeof s === 'string')
      : [],
    fileNames: Array.isArray(o.fileNames)
      ? o.fileNames.filter((s): s is string => typeof s === 'string')
      : [],
    roughGaps: Array.isArray(o.roughGaps)
      ? o.roughGaps.filter((s): s is string => typeof s === 'string')
      : [],
    intents: Array.isArray(o.intents)
      ? o.intents.filter((s): s is string => typeof s === 'string')
      : [],
    reason: typeof o.reason === 'string' ? o.reason : '',
    overriddenPrimary: Boolean(o.overriddenPrimary),
  }
}

/** 当前部是否应展示此前台收件 */
export function receptionHandoffForDept(
  handoff: ReceptionHandoff | null | undefined,
  deptSlug: string,
): ReceptionHandoff | null {
  if (!handoff) return null
  if (handoff.selectedSlug !== deptSlug) return null
  return handoff
}
