/** localStorage keys for "continue last" habit affordances */
import type { StageId } from '../types'

const CASE_KEY = 'ip-harness-last-case-id'
const SESSION_KEY = 'ip-harness-last-agent-session-id'
const CASE_FILTER_KEY = 'ip-harness-case-library-filters'
const CASE_BY_STAGE_KEY = 'ip-harness-last-case-id-by-stage'
const HITL_STEPWISE_KEY = 'ip-harness-hitl-stepwise'

export function getLastCaseId(): string | null {
  try {
    return localStorage.getItem(CASE_KEY)
  } catch {
    return null
  }
}

export function getLastCaseIdByStage(): Partial<Record<StageId, string>> {
  try {
    const raw = localStorage.getItem(CASE_BY_STAGE_KEY)
    if (!raw) return {}
    return JSON.parse(raw) as Partial<Record<StageId, string>>
  } catch {
    return {}
  }
}

export function getLastCaseIdForStage(stage: StageId): string | null {
  const id = getLastCaseIdByStage()[stage]
  return id || null
}

export function setLastCaseId(caseId: string, stage?: StageId) {
  try {
    localStorage.setItem(CASE_KEY, caseId)
    if (stage) {
      const map = getLastCaseIdByStage()
      map[stage] = caseId
      localStorage.setItem(CASE_BY_STAGE_KEY, JSON.stringify(map))
    }
  } catch {
    /* ignore */
  }
}

export function getLastAgentSessionId(): string | null {
  try {
    return localStorage.getItem(SESSION_KEY)
  } catch {
    return null
  }
}

export function setLastAgentSessionId(sessionId: string) {
  try {
    localStorage.setItem(SESSION_KEY, sessionId)
  } catch {
    /* ignore */
  }
}

export type CaseLibraryFilters = {
  q: string
  stage: string
  risk: string
  status: string
}

export function getCaseLibraryFilters(): Partial<CaseLibraryFilters> | null {
  try {
    const raw = localStorage.getItem(CASE_FILTER_KEY)
    if (!raw) return null
    return JSON.parse(raw) as CaseLibraryFilters
  } catch {
    return null
  }
}

export function setCaseLibraryFilters(f: CaseLibraryFilters) {
  try {
    localStorage.setItem(CASE_FILTER_KEY, JSON.stringify(f))
  } catch {
    /* ignore */
  }
}

/** HITL stepwise pref. Missing key → use `formalDefault` (正式默认开，预览默认关). */
export function getHitlStepwisePref(formalDefault: boolean): boolean {
  try {
    const raw = localStorage.getItem(HITL_STEPWISE_KEY)
    if (raw === '1') return true
    if (raw === '0') return false
  } catch {
    /* ignore */
  }
  return formalDefault
}

export function setHitlStepwisePref(on: boolean) {
  try {
    localStorage.setItem(HITL_STEPWISE_KEY, on ? '1' : '0')
  } catch {
    /* ignore */
  }
}

export type PreferredCaseOpts = {
  stage?: StageId
  /** Visible cases with stage, used to pick same-stage fallback */
  visible?: { id: string; stage: StageId }[]
}

/**
 * URL ?case= > same-stage most recent > lastVisited > empty (稍后关联).
 */
export function resolvePreferredCaseId(
  visibleIds: string[],
  urlCase?: string | null,
  opts?: PreferredCaseOpts,
): string {
  if (urlCase && visibleIds.includes(urlCase)) return urlCase
  if (opts?.stage) {
    const byStage = getLastCaseIdForStage(opts.stage)
    if (byStage && visibleIds.includes(byStage)) return byStage
    const same = opts.visible?.find(
      (c) => c.stage === opts.stage && visibleIds.includes(c.id),
    )
    if (same) return same.id
  }
  const last = getLastCaseId()
  if (last && visibleIds.includes(last)) return last
  return ''
}
