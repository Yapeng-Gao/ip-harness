import { Navigate, useParams, useSearchParams } from 'react-router-dom'
import { GeneralBotSidebar } from '../components/general/GeneralBotSidebar'
import { ProjectChatPane } from '../components/projects/ProjectChatPane'
import { ProjectTimelinePanel } from '../components/projects/ProjectTimelinePanel'
import { CaseBindControls } from '../components/case/CaseBindControls'
import { useProjectFolder } from '../projects/ProjectFolderContext'
import {
  GENERAL_SHELL_DEFAULT_BOT,
  GENERAL_SHELL_EXPERT_IDS,
  GENERAL_SHELL_ID,
  isGeneralShellId,
} from '../projects/generalShell'
import type { ProjectExpertId } from '../projects/types'
import { PATENT_PROJECT_EXPERT_IDS } from '../projects/expertsPatent'

/**
 * Default /agent landing — Grok multi-bot shell with shell-level patent experts.
 * Reuses ProjectChatPane / HITL via implicit GENERAL_SHELL_ID workspace.
 */
export function GeneralGrokShell() {
  const { botId } = useParams<{ botId?: string }>()
  const [params] = useSearchParams()
  const queryBot = params.get('bot')
  const { getProject, patchProject } = useProjectFolder()

  const project = getProject(GENERAL_SHELL_ID)
  if (!project || !isGeneralShellId(project.id)) {
    return (
      <div className="flex flex-1 items-center justify-center text-sm text-slate-500">
        通用壳未就绪
      </div>
    )
  }

  const raw = botId ?? queryBot ?? undefined
  if (raw === 'expert-mining') {
    return <Navigate to="/agent" replace />
  }

  // Support ?bot=expert-search → canonical /agent/bots/:id
  if (!botId && queryBot && PATENT_PROJECT_EXPERT_IDS.includes(queryBot as ProjectExpertId)) {
    const q = queryBot as ProjectExpertId
    if (q === 'orchestrator') return <Navigate to="/agent" replace />
    return <Navigate to={`/agent/bots/${q}`} replace />
  }

  const resolved: ProjectExpertId =
    raw && GENERAL_SHELL_EXPERT_IDS.includes(raw as ProjectExpertId)
      ? (raw as ProjectExpertId)
      : GENERAL_SHELL_DEFAULT_BOT

  if (raw && !GENERAL_SHELL_EXPERT_IDS.includes(raw as ProjectExpertId)) {
    return <Navigate to="/agent" replace />
  }

  // Canonical: orchestrator lives at /agent (not /agent/bots/orchestrator)
  if (botId === 'orchestrator') {
    return <Navigate to="/agent" replace />
  }

  return (
    <div className="flex min-h-0 flex-1" data-testid="general-grok-shell">
      <GeneralBotSidebar />
      <div className="flex min-h-0 min-w-0 flex-1 flex-col">
        <div className="shrink-0 space-y-2 border-b border-slate-200 bg-white px-3 py-2">
          <div className="flex flex-wrap items-center gap-1.5 text-[11px] text-slate-500">
            <span className="rounded border border-amber-200 bg-amber-50 px-1.5 py-px text-amber-900">
              样机 · 无真 LLM · Grok 多专家壳
            </span>
            <span className="rounded border border-slate-200 bg-slate-50 px-1 py-px">
              专利领域 · 壳级
            </span>
            <span>{project.caseId ? '已绑案件' : '未绑案件 · 可后绑'}</span>
          </div>
          <CaseBindControls
            caseId={project.caseId}
            prominence="soft"
            writebackRequiresBind={false}
            onCreateStart={() =>
              patchProject(GENERAL_SHELL_ID, { caseBindState: 'pending_create' })
            }
            onBind={(id) =>
              patchProject(GENERAL_SHELL_ID, {
                caseId: id,
                caseBindState: 'bound',
              })
            }
            onUnbind={() =>
              patchProject(GENERAL_SHELL_ID, {
                caseId: undefined,
                caseBindState: 'none',
              })
            }
          />
        </div>
        <div className="flex min-h-0 flex-1">
          <ProjectChatPane
            projectId={GENERAL_SHELL_ID}
            expertId={resolved}
            caseId={project.caseId}
          />
          <ProjectTimelinePanel
            projectId={GENERAL_SHELL_ID}
            currentExpertId={resolved}
          />
        </div>
      </div>
    </div>
  )
}
