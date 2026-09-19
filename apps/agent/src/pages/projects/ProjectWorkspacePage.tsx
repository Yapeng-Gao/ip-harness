import { Navigate, useParams } from 'react-router-dom'
import { useProjectFolder } from '../../projects/ProjectFolderContext'
import { ProjectFolderSidebar } from '../../components/projects/ProjectFolderSidebar'
import { ProjectChatPane } from '../../components/projects/ProjectChatPane'
import { ProjectTimelinePanel } from '../../components/projects/ProjectTimelinePanel'
import type { ProjectExpertId } from '../../projects/types'
import {
  PROJECT_EXPERTS,
  orchestratorIdForProject,
  projectKindBadge,
} from '../../projects/experts'

export function ProjectWorkspacePage() {
  const { projectId, botId, expertId } = useParams<{
    projectId: string
    botId?: string
    expertId?: string
  }>()
  const { getProject } = useProjectFolder()

  if (!projectId) return <Navigate to="/agent/projects" replace />
  const project = getProject(projectId)
  if (!project) {
    return (
      <div className="flex flex-1 items-center justify-center text-sm text-slate-500">
        项目不存在 ·{' '}
        <a className="underline" href="/agent/projects">
          返回列表
        </a>
      </div>
    )
  }

  // Single source of truth: prefer /bots/:botId; legacy /experts/:expertId still works.
  const seatParam = botId ?? expertId
  const orchId = orchestratorIdForProject(project)

  // Legacy experts URL → canonical bots URL (one truth)
  if (expertId && !botId && expertId in PROJECT_EXPERTS && !isOrchParam(expertId, orchId)) {
    return (
      <Navigate
        to={`/agent/projects/${projectId}/bots/${expertId}`}
        replace
      />
    )
  }

  const resolved: ProjectExpertId =
    seatParam && seatParam in PROJECT_EXPERTS
      ? (seatParam as ProjectExpertId)
      : orchId

  if (seatParam && !(seatParam in PROJECT_EXPERTS)) {
    return <Navigate to={`/agent/projects/${projectId}`} replace />
  }

  const badge = projectKindBadge(project)

  return (
    <div className="flex min-h-0 flex-1">
      <ProjectFolderSidebar />
      <div className="flex min-h-0 min-w-0 flex-1 flex-col">
        <div className="shrink-0 border-b border-amber-200 bg-amber-50 px-3 py-1.5 text-[11px] text-amber-950">
          样机 · 无真 LLM · 专家分剧本 · 总控只编排 · 写库须 Confirm→DomainCommand
          {' · '}
          <span className={`rounded border px-1 py-px ${badge.className}`}>
            {badge.label}
          </span>
          {project.domainPackId ? ` · pack=${project.domainPackId}` : ''}
          {project.caseId ? ` · case=${project.caseId}` : ' · 未绑案件'}
        </div>
        <div className="flex min-h-0 flex-1">
          <ProjectChatPane
            projectId={projectId}
            expertId={resolved}
            caseId={project.caseId}
          />
          <ProjectTimelinePanel projectId={projectId} />
        </div>
      </div>
    </div>
  )
}

function isOrchParam(id: string, orchId: ProjectExpertId): boolean {
  return id === orchId
}
