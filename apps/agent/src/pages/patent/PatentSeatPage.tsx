import { Link, Navigate, useParams } from 'react-router-dom'
import {
  COLD_START_BLOCKED,
  getProjectExpert,
  resolveExpertId,
} from '../../projects/experts'
import { ProjectChatPane } from '../../components/projects/ProjectChatPane'
import { SeatDualFilePanel } from '../../components/patent/SeatDualFilePanel'
import { SeatValidatorPanel } from '../../components/patent/SeatValidatorPanel'
import { PackHitlOverview } from '../../components/patent/PackHitlOverview'
import { useProjectFolder } from '../../projects/ProjectFolderContext'
import type { ProjectExpertId } from '../../projects/types'
import { PATENT_EXPERTS } from '../../projects/expertsPatent'

const SHELL_DM_PROJECT = 'proj-demo-patent'

/**
 * Mode A · 单聊 /agent/seats/:seatId
 * Phase seats → empty-state; others → chat + dual-file + mock validator.
 */
export function PatentSeatPage() {
  const { seatId: raw } = useParams<{ seatId: string }>()
  const { getProject, getThread } = useProjectFolder()
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

  const def = getProjectExpert(seatId)

  if (def.phase) {
    return (
      <div
        className="flex min-h-0 flex-1 flex-col"
        data-testid="patent-seat-phase-empty"
      >
        <div className="flex shrink-0 flex-wrap items-center gap-2 border-b border-slate-200 bg-slate-50 px-3 py-2 text-[11px] text-slate-500">
          <Link to="/agent" className="underline">
            Catalog
          </Link>
          <span>·</span>
          <span>Phase 空态 · {def.name}</span>
          <span className="rounded bg-slate-200 px-1.5 py-px font-semibold text-slate-600">
            Phase
          </span>
        </div>
        <div className="mx-auto max-w-xl flex-1 space-y-4 p-6">
          <h1 className="text-lg font-semibold text-slate-900">{def.name}</h1>
          <p className="text-sm leading-relaxed text-slate-600">
            {def.emptyStateNote ??
              '本席为 Pack Phase 席：名单已对齐，运行时未接线。'}
          </p>
          <ul className="list-disc space-y-1 pl-5 text-xs text-slate-500">
            <li>id：{seatId}（mining≠intake · FTO≠enforcement）</li>
            <li>无真沙箱 / OpenSandbox / harness</li>
            <li>HITL×8 总览可见；本席对应闸灰显</li>
          </ul>
          <PackHitlOverview compact />
          <Link
            to="/agent"
            className="inline-block rounded-md bg-slate-900 px-3 py-2 text-xs font-semibold text-white"
          >
            回 Catalog
          </Link>
        </div>
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

  const thread = getThread(SHELL_DM_PROJECT, seatId)
  const ready = thread?.pendingHitl ? [seatId] : []

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
      <div className="shrink-0 border-b border-slate-100 bg-slate-50/80 px-3 py-2">
        <PackHitlOverview
          compact
          projectId={SHELL_DM_PROJECT}
          readySeatIds={ready}
        />
        <div className="mt-2">
          <SeatValidatorPanel
            expertId={seatId}
            projectId={SHELL_DM_PROJECT}
          />
        </div>
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
