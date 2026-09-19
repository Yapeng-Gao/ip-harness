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
import { CaseBindControls } from '../../components/case/CaseBindControls'
import { PatentMidMapPanel } from '../../components/projects/PatentMidMapPanel'

export function ProjectWorkspacePage() {
  const { projectId, botId, expertId } = useParams<{
    projectId: string
    botId?: string
    expertId?: string
  }>()
  const { getProject, patchProject } = useProjectFolder()

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
        <div className="shrink-0 space-y-2 border-b border-slate-200 bg-white px-3 py-2">
          <div className="flex flex-wrap items-center gap-1.5 text-[11px] text-slate-500">
            <span
              className="rounded border border-amber-200 bg-amber-50 px-1.5 py-px text-amber-900"
              data-testid="project-experts-fixed-badge"
            >
              项目 · 专家固定
            </span>
            {(project.kind === 'domain' || project.domainPackId === 'patent') && (
              <span
                className="rounded border border-violet-300 bg-violet-50 px-1.5 py-px font-semibold text-violet-800"
                data-testid="project-l3-badge"
              >
                L3 · 专利中台
              </span>
            )}
            <span className={`rounded border px-1 py-px ${badge.className}`}>
              {badge.label}
            </span>
            {project.domainPackId ? (
              <span>
                {project.domainPackId === 'patent' ? '专利领域' : project.domainPackId}
              </span>
            ) : null}
            <span>{project.caseId ? '已绑案件' : '未绑案件'}</span>
          </div>
          <CaseBindControls
            caseId={project.caseId}
            prominence={
              project.kind === 'domain' || project.domainPackId === 'patent'
                ? 'strong'
                : 'soft'
            }
            onCreateStart={() =>
              patchProject(projectId, { caseBindState: 'pending_create' })
            }
            onBind={(id) =>
              patchProject(projectId, { caseId: id, caseBindState: 'bound' })
            }
            onUnbind={() =>
              patchProject(projectId, {
                caseId: undefined,
                caseBindState: 'none',
              })
            }
          />
        </div>
        <div className="flex min-h-0 flex-1">
          <ProjectChatPane
            projectId={projectId}
            expertId={resolved}
            caseId={project.caseId}
          />
          <ProjectTimelinePanel projectId={projectId} currentExpertId={resolved} />
          {(project.kind === 'domain' || project.domainPackId === 'patent') && (
            <PatentMidMapPanel
              projectId={projectId}
              expertId={resolved}
              caseId={project.caseId}
            />
          )}
        </div>
      </div>
    </div>
  )
}

function isOrchParam(id: string, orchId: ProjectExpertId): boolean {
  return id === orchId
}
