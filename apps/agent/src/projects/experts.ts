import type {
  DomainPackId,
  ProjectExpertDef,
  ProjectExpertId,
  ProjectKind,
} from './types'
import {
  GENERAL_EXPERTS,
  GENERAL_PROJECT_EXPERT_IDS,
} from './expertsGeneral'
import {
  PATENT_CATALOG_IDS,
  PATENT_EXPERTS,
  PATENT_PROJECT_EXPERT_IDS,
} from './expertsPatent'

/** Resolve legacy aliases → canonical Catalog id */
export function resolveExpertId(id: string): ProjectExpertId {
  if (id === 'expert-search') return 'expert-research'
  return id as ProjectExpertId
}

/** Unified registry — general + DomainPack sources (separate files). */
export const PROJECT_EXPERTS: Record<string, ProjectExpertDef> = {
  ...PATENT_EXPERTS,
  ...GENERAL_EXPERTS,
}

/** @deprecated Prefer expertIdsForKind / PATENT_PROJECT_EXPERT_IDS */
export const DEFAULT_PROJECT_EXPERT_IDS = PATENT_PROJECT_EXPERT_IDS

export function expertIdsForKind(
  kind: ProjectKind,
  domainPackId?: DomainPackId,
): ProjectExpertId[] {
  if (kind === 'general') return [...GENERAL_PROJECT_EXPERT_IDS]
  if (domainPackId === 'patent' || !domainPackId) {
    return [...PATENT_PROJECT_EXPERT_IDS]
  }
  return [...PATENT_PROJECT_EXPERT_IDS]
}

export function expertIdsForProject(project: {
  kind: ProjectKind
  domainPackId?: DomainPackId
}): ProjectExpertId[] {
  return expertIdsForKind(project.kind, project.domainPackId)
}

export function getProjectExpert(id: ProjectExpertId): ProjectExpertDef {
  const resolved = resolveExpertId(id)
  return PROJECT_EXPERTS[resolved] ?? PROJECT_EXPERTS[id]!
}

export function isOrchestratorExpert(id: ProjectExpertId): boolean {
  return id === 'orchestrator' || id === 'general-orchestrator'
}

export function orchestratorIdForProject(project: {
  kind: ProjectKind
  expertIds?: ProjectExpertId[]
}): ProjectExpertId {
  const fromList = project.expertIds?.find(isOrchestratorExpert)
  if (fromList) return fromList
  return project.kind === 'general' ? 'general-orchestrator' : 'orchestrator'
}

export function projectKindBadge(project: {
  kind: ProjectKind
  domainPackId?: DomainPackId
}): { label: string; className: string } {
  if (project.kind === 'general') {
    return {
      label: '通用',
      className: 'bg-emerald-50 text-emerald-800 border-emerald-200',
    }
  }
  const pack = project.domainPackId === 'patent' ? '专利' : '领域'
  return {
    label: pack,
    className: 'bg-amber-50 text-amber-900 border-amber-200',
  }
}

export function expertAccentClass(accent: string): string {
  switch (accent) {
    case 'sky':
      return 'bg-sky-100 text-sky-800 border-sky-200'
    case 'violet':
      return 'bg-violet-100 text-violet-800 border-violet-200'
    case 'amber':
      return 'bg-amber-100 text-amber-900 border-amber-200'
    case 'emerald':
      return 'bg-emerald-100 text-emerald-800 border-emerald-200'
    case 'indigo':
      return 'bg-indigo-100 text-indigo-800 border-indigo-200'
    case 'rose':
      return 'bg-rose-100 text-rose-800 border-rose-200'
    case 'orange':
      return 'bg-orange-100 text-orange-900 border-orange-200'
    case 'cyan':
      return 'bg-cyan-100 text-cyan-900 border-cyan-200'
    case 'teal':
      return 'bg-teal-100 text-teal-900 border-teal-200'
    case 'fuchsia':
      return 'bg-fuchsia-100 text-fuchsia-900 border-fuchsia-200'
    case 'red':
      return 'bg-red-100 text-red-900 border-red-200'
    case 'lime':
      return 'bg-lime-100 text-lime-900 border-lime-200'
    case 'stone':
      return 'bg-stone-100 text-stone-800 border-stone-200'
    case 'yellow':
      return 'bg-yellow-100 text-yellow-900 border-yellow-200'
    case 'purple':
      return 'bg-purple-100 text-purple-900 border-purple-200'
    case 'zinc':
      return 'bg-zinc-100 text-zinc-800 border-zinc-200'
    default:
      return 'bg-slate-100 text-slate-700 border-slate-200'
  }
}

/** Cold-start blocked seats (禁专家截入) */
export const COLD_START_BLOCKED: ProjectExpertId[] = [
  'expert-oa',
  'expert-filing',
]

export {
  GENERAL_EXPERTS,
  GENERAL_PROJECT_EXPERT_IDS,
  PATENT_EXPERTS,
  PATENT_PROJECT_EXPERT_IDS,
  PATENT_CATALOG_IDS,
}
