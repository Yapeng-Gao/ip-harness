import { useEffect, useMemo } from 'react'
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
import { packHitlSeatProgress } from '../../projects/pack/patentHitlWalk'
import { useProjectFolder } from '../../projects/ProjectFolderContext'
import type { ProjectExpertId } from '../../projects/types'
import { PATENT_EXPERTS } from '../../projects/expertsPatent'

const SHELL_DM_PROJECT = 'proj-demo-patent'

/**
 * Mode A · 单聊 /agent/seats/:seatId
 * F7–F9 keep Phase badge but run full seat chrome (not empty-state dead-end).
 */
export function PatentSeatPage() {
  const { seatId: raw } = useParams<{ seatId: string }>()
  const { getProject, getThread, appendMessage, patchProject } =
    useProjectFolder()

  const seatId = raw ? (resolveExpertId(raw) as ProjectExpertId) : null
  const validSeat =
    !!seatId &&
    (seatId in PATENT_EXPERTS || seatId === 'expert-search') &&
    !COLD_START_BLOCKED.includes(seatId)

  const def = useMemo(
    () => (validSeat && seatId ? getProjectExpert(seatId) : null),
    [validSeat, seatId],
  )
  const project = getProject(SHELL_DM_PROJECT)

  useEffect(() => {
    if (!validSeat || !seatId || !def || !project) return
    if (!getThread(SHELL_DM_PROJECT, seatId)) {
      appendMessage(SHELL_DM_PROJECT, seatId, {
        role: 'system',
        content: `【单聊就绪】${def.name} · 步骤条/剧本/双文件/validator 可跑（样机内存${def.phase ? ' · 后置业务' : ''}）`,
        meta: { backend: 'mock' },
      })
    }
    if (
      def.phase &&
      (def.hitlGates.includes('pay_unlock') ||
        def.hitlGates.includes('confirm_quote')) &&
      !project.caseId
    ) {
      patchProject(SHELL_DM_PROJECT, {
        caseId: 'case-mock-pack-hf',
        caseBindState: 'bound',
      })
    }
  }, [
    validSeat,
    seatId,
    def,
    project,
    getThread,
    appendMessage,
    patchProject,
  ])

  if (!raw || !seatId) return <Navigate to="/agent" replace />
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
  if (!def) return <Navigate to="/agent" replace />

  if (!project) {
    return (
      <div className="flex flex-1 items-center justify-center text-sm text-slate-500">
        演示项目未就绪 · <Link to="/agent">回 Catalog</Link>
      </div>
    )
  }

  const hitlProgress = packHitlSeatProgress(getThread, SHELL_DM_PROJECT)

  return (
    <div className="flex min-h-0 flex-1 flex-col" data-testid="patent-seat-dm">
      <div className="flex shrink-0 flex-wrap items-center gap-2 border-b border-slate-200 bg-white px-3 py-2 text-[11px] text-slate-500">
        <Link to="/agent" className="underline">
          Catalog
        </Link>
        <span>·</span>
        <span>单聊 · {def.name}</span>
        {def.phase && (
          <span
            className="rounded bg-slate-200 px-1.5 py-px font-semibold text-slate-600"
            data-testid="seat-phase-badge"
          >
            后置业务
          </span>
        )}
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
          readySeatIds={hitlProgress.readySeatIds}
          clearedSeatIds={hitlProgress.clearedSeatIds}
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
