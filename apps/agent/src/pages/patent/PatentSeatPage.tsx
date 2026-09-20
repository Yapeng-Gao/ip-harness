import { Link, Navigate, useParams } from 'react-router-dom'
import {
  COLD_START_BLOCKED,
  getProjectExpert,
  resolveExpertId,
} from '../../projects/experts'
import { ProjectChatPane } from '../../components/projects/ProjectChatPane'
import { SeatDualFilePanel } from '../../components/patent/SeatDualFilePanel'
import { useProjectFolder } from '../../projects/ProjectFolderContext'
import type { ProjectExpertId } from '../../projects/types'
import { PATENT_EXPERTS } from '../../projects/expertsPatent'

const SHELL_DM_PROJECT = 'proj-demo-patent'

/**
 * Mode A · 单聊 /agent/seats/:seatId
 * Uses demo patent project thread; 禁截入 OA/递交.
 */
export function PatentSeatPage() {
  const { seatId: raw } = useParams<{ seatId: string }>()
  const { getProject } = useProjectFolder()
  if (!raw) return <Navigate to="/agent" replace />

  const seatId = resolveExpertId(raw) as ProjectExpertId
  if (!(seatId in PATENT_EXPERTS) && seatId !== 'expert-search') {
    return <Navigate to="/agent" replace />
  }
  if (COLD_START_BLOCKED.includes(seatId)) {
    return (
      <div className="flex flex-1 flex-col items-center justify-center gap-2 p-8 text-sm text-slate-600">
        <p>禁止专家截入：{getProjectExpert(seatId).name} 须从建项目起。</p>
        <Link to="/agent" className="underline">
          回 Catalog 组队
        </Link>
      </div>
    )
  }

  const project = getProject(SHELL_DM_PROJECT)
  if (!project) {
    return (
      <div className="flex flex-1 items-center justify-center text-sm text-slate-500">
        演示项目未就绪 · <Link to="/agent">回 Catalog</Link>
      </div>
    )
  }

  const def = getProjectExpert(seatId)

  return (
    <div className="flex min-h-0 flex-1 flex-col" data-testid="patent-seat-dm">
      <div className="flex shrink-0 flex-wrap items-center gap-2 border-b border-slate-200 bg-white px-3 py-2 text-[11px] text-slate-500">
        <Link to="/agent" className="underline">
          Catalog
        </Link>
        <span>·</span>
        <span>单聊 · {def.name}</span>
        {def.ownerLabel && (
          <span className="rounded border border-slate-200 bg-slate-50 px-1.5 py-px">
            Owner · {def.ownerLabel}
          </span>
        )}
        <Link
          to={`/agent/projects/${SHELL_DM_PROJECT}/bots/${seatId}`}
          className="ml-auto text-violet-700 underline"
        >
          在演示项目中打开
        </Link>
      </div>
      <div className="flex min-h-0 flex-1">
        <ProjectChatPane
          projectId={SHELL_DM_PROJECT}
          expertId={seatId}
          caseId={project.caseId}
        />
        <SeatDualFilePanel expertId={seatId} projectId={SHELL_DM_PROJECT} />
      </div>
    </div>
  )
}
