import type { AgentSession, PatentCase } from '../types'

/** Shared session list filter (Shell ↔ SessionsList). */
export function matchSessionSearch(
  session: AgentSession,
  query: string,
  caseTitle?: string,
): boolean {
  const q = query.trim().toLowerCase()
  if (!q) return true
  return `${session.title} ${session.goal} ${caseTitle ?? ''}`.toLowerCase().includes(q)
}

export type SessionSearchState = {
  sessionSearch: string
  setSessionSearch: (q: string) => void
  showArchivedSessions: boolean
  setShowArchivedSessions: (v: boolean) => void
}

/** Resolve case title for search matching. */
export function caseTitleForSession(
  session: AgentSession,
  getCase: (id: string) => PatentCase | undefined,
): string {
  return session.caseId ? (getCase(session.caseId)?.title ?? '') : ''
}
