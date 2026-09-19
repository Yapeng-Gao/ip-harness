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
  PATENT_EXPERTS,
  PATENT_PROJECT_EXPERT_IDS,
} from './expertsPatent'

/** Unified registry — general + DomainPack sources (separate files). */
export const PROJECT_EXPERTS: Record<ProjectExpertId, ProjectExpertDef> = {
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
  return PROJECT_EXPERTS[id]
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
    default:
      return 'bg-slate-100 text-slate-700 border-slate-200'
  }
}

export {
  GENERAL_EXPERTS,
  GENERAL_PROJECT_EXPERT_IDS,
  PATENT_EXPERTS,
  PATENT_PROJECT_EXPERT_IDS,
}
