import { Link, Navigate, useParams } from 'react-router-dom'
import { useProjectFolder } from '../../projects/ProjectFolderContext'
import { ProjectFolderSidebar } from '../../components/projects/ProjectFolderSidebar'
import { ProjectChatPane } from '../../components/projects/ProjectChatPane'
import { ProjectTimelinePanel } from '../../components/projects/ProjectTimelinePanel'
import { SeatDualFilePanel } from '../../components/patent/SeatDualFilePanel'
import type { ProjectExpertId } from '../../projects/types'
import {
  PROJECT_EXPERTS,
  getProjectExpert,
  orchestratorIdForProject,
  projectKindBadge,
  resolveExpertId,
} from '../../projects/experts'
import { CaseBindControls } from '../../components/case/CaseBindControls'
import { PatentMidMapPanel } from '../../components/projects/PatentMidMapPanel'
import { PackHitlOverview } from '../../components/patent/PackHitlOverview'
import { PackHitlWalkBar } from '../../components/patent/PackHitlWalkBar'
import { packHitlSeatProgress } from '../../projects/pack/patentHitlWalk'
import { SeatValidatorPanel } from '../../components/patent/SeatValidatorPanel'
import { hasMockValidator } from '../../projects/pack/patentValidator'

export function ProjectWorkspacePage() {
  const { projectId, botId, expertId } = useParams<{
    projectId: string
    botId?: string
    expertId?: string
  }>()
  const { getProject, patchProject, getThread } = useProjectFolder()

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

  const seatParam = botId ?? expertId
  const orchId = orchestratorIdForProject(project)
  const resolvedRaw =
    seatParam && (seatParam in PROJECT_EXPERTS || seatParam === 'expert-search')
      ? resolveExpertId(seatParam)
      : orchId

  if (expertId && !botId && expertId in PROJECT_EXPERTS) {
    return (
      <Navigate
        to={`/agent/projects/${projectId}/bots/${resolveExpertId(expertId)}`}
        replace
      />
    )
  }

  if (seatParam && !(resolveExpertId(seatParam) in PROJECT_EXPERTS) && seatParam !== 'expert-search') {
    return <Navigate to={`/agent/projects/${projectId}`} replace />
  }

  const resolved = resolvedRaw as ProjectExpertId
  const badge = projectKindBadge(project)
  const isPatent =
    project.kind === 'domain' || project.domainPackId === 'patent'
  const def = getProjectExpert(resolved)

  return (
    <div className="flex min-h-0 flex-1" data-testid="patent-project-workspace">
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
            {isPatent && (
              <span
                className="rounded border border-violet-300 bg-violet-50 px-1.5 py-px font-semibold text-violet-800"
                data-testid="project-l3-badge"
              >
                专利壳 · 双文件
              </span>
            )}
            <span className={`rounded border px-1 py-px ${badge.className}`}>
              {badge.label}
            </span>
            {def.ownerLabel && (
              <span className="rounded border border-slate-200 bg-slate-50 px-1.5 py-px">
                Owner · {def.ownerLabel}
              </span>
            )}
            <span>{project.caseId ? '已绑案件' : '未绑案件'}</span>
            {isPatent && (
              <Link
                to={`/agent/projects/${projectId}/room`}
                className="ml-auto rounded-full border border-emerald-300 bg-emerald-50 px-2 py-0.5 font-semibold text-emerald-900"
                data-testid="open-patent-room"
              >
                开群聊 room
              </Link>
            )}
            <Link to="/agent" className="text-slate-400 underline">
              Catalog
            </Link>
          </div>
          <CaseBindControls
            caseId={project.caseId}
            prominence={isPatent ? 'strong' : 'soft'}
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
        {isPatent && (
          <div className="shrink-0 space-y-2 border-b border-slate-100 bg-slate-50/60 px-3 py-2">
            <PackHitlOverview
              compact
              projectId={projectId}
              {...packHitlSeatProgress(getThread, projectId)}
            />
            <PackHitlWalkBar compact />
            {hasMockValidator(resolved) && (
              <SeatValidatorPanel expertId={resolved} projectId={projectId} />
            )}
          </div>
        )}
        <div className="flex min-h-0 flex-1">
          <ProjectChatPane
            projectId={projectId}
            expertId={resolved}
            caseId={project.caseId}
          />
          {isPatent ? (
            <SeatDualFilePanel expertId={resolved} projectId={projectId} />
          ) : (
            <ProjectTimelinePanel projectId={projectId} currentExpertId={resolved} />
          )}
          {isPatent && (
            <div className="hidden xl:flex">
              <PatentMidMapPanel
                projectId={projectId}
                expertId={resolved}
                caseId={project.caseId}
              />
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
