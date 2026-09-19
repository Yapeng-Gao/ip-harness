/**
 * View-layer row model for /agent/sessions aggregation.
 * Merges AgentContext sessions + ProjectFolderContext threads — does NOT merge stores.
 * Spec: docs/architecture/product-apps/agent-sessions-project-threads.md
 */
import type { AgentSession } from '@ip/domain/types'
import { getAgent } from '@shared/data/agents'
import { getProjectExpert } from '../projects/experts'
import type { AgentProject, ProjectThread } from '../projects/types'
import { agentSessionPath } from './deepLinks'

export type SessionListSource = 'general' | 'project'

export type SessionListRow = {
  id: string
  source: SessionListSource
  title: string
  updatedAt: string
  projectId?: string
  projectTitle?: string
  expertId?: string
  expertName?: string
  caseId?: string
  /** Chip / Agent column label */
  sourceLabel: string
  /** Navigate target */
  href: string
  /** Search haystack (title + goal/summary + labels) */
  searchText: string
  /** General-only extras for status filter / actions */
  general?: AgentSession
  /** Project thread HITL */
  pendingHitl?: boolean
  goal?: string
  archived?: boolean
}

export type SessionSourceFilter = 'all' | 'general' | 'project'

export function parseSourceParam(raw: string | null): SessionSourceFilter {
  if (raw === 'general' || raw === 'project') return raw
  return 'all'
}

export function generalSessionToRow(s: AgentSession): SessionListRow {
  const ag = s.agentId === 'auto' ? null : getAgent(s.agentId)
  const sourceLabel = ag?.name ?? '通用'
  return {
    id: s.id,
    source: 'general',
    title: s.title,
    updatedAt: s.updatedAt,
    caseId: s.caseId,
    sourceLabel,
    href:
      s.status === 'needs_human' || s.hitlPending
        ? agentSessionPath(s.id, { focus: 'hitl' })
        : agentSessionPath(s.id),
    searchText: `${s.title} ${s.goal} ${sourceLabel}`,
    general: s,
    goal: s.goal,
    archived: s.archived,
    pendingHitl: s.hitlPending,
  }
}

export function projectThreadToRow(
  t: ProjectThread,
  project: AgentProject | undefined,
): SessionListRow {
  const expert = getProjectExpert(t.expertId)
  const projectTitle = project?.title ?? t.projectId
  const expertName = expert.name
  const sourceLabel = `${projectTitle} · ${expertName}`
  const href = `/agent/projects/${t.projectId}/bots/${t.expertId}${
    t.id ? `?thread=${encodeURIComponent(t.id)}` : ''
  }`
  return {
    id: t.id,
    source: 'project',
    title: t.title || expertName,
    updatedAt: t.updatedAt,
    projectId: t.projectId,
    projectTitle,
    expertId: t.expertId,
    expertName,
    caseId: project?.caseId,
    sourceLabel,
    href,
    searchText: `${t.title} ${projectTitle} ${expertName} ${project?.summary ?? ''}`,
    pendingHitl: t.pendingHitl,
    goal: project?.summary,
  }
}

export function buildSessionListRows(input: {
  sessions: AgentSession[]
  threads: ProjectThread[]
  projects: AgentProject[]
}): SessionListRow[] {
  const byId = new Map(input.projects.map((p) => [p.id, p]))
  const general = input.sessions.map(generalSessionToRow)
  const project = input.threads.map((t) =>
    projectThreadToRow(t, byId.get(t.projectId)),
  )
  return [...general, ...project].sort((a, b) =>
    b.updatedAt.localeCompare(a.updatedAt),
  )
}

/** Status/?filter= — project rows only match needs_human via pendingHitl; else excluded. */
export function rowMatchesStatusFilter(
  row: SessionListRow,
  filter: string | null,
): boolean {
  if (!filter || filter === 'all') return true
  if (row.source === 'project') {
    if (filter === 'needs_human') return !!row.pendingHitl
    // no running/done/archived model on project threads
    return false
  }
  const s = row.general!
  if (filter === 'needs_human') {
    return s.status === 'needs_human' || !!s.hitlPending
  }
  if (filter === 'running') {
    return s.status === 'running' || s.status === 'queued'
  }
  if (filter === 'done') return s.status === 'done'
  if (filter === 'archived') return !!s.archived
  return true
}

export function rowMatchesSearch(
  row: SessionListRow,
  query: string,
  caseTitle?: string,
): boolean {
  const q = query.trim().toLowerCase()
  if (!q) return true
  return `${row.searchText} ${caseTitle ?? ''}`.toLowerCase().includes(q)
}

export function rowMatchesSource(
  row: SessionListRow,
  source: SessionSourceFilter,
): boolean {
  if (source === 'all') return true
  return row.source === source
}
