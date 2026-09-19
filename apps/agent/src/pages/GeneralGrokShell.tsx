import { Navigate, useParams } from 'react-router-dom'
import { GeneralBotSidebar } from '../components/general/GeneralBotSidebar'
import { GeneralBotChatPane } from '../components/general/GeneralBotChatPane'
import { CaseBindControls } from '../components/case/CaseBindControls'
import { useProjectFolder } from '../projects/ProjectFolderContext'
import { useGeneralBots } from '../projects/GeneralBotsContext'
import {
  GENERAL_SHELL_ID,
  isGeneralShellId,
} from '../projects/generalShell'
import { freeBotPath } from '../projects/generalBots'

/**
 * Default /agent — free Grok bot list (not welded patent seats).
 * Case bind via implicit GENERAL_SHELL_ID; project HITL path unchanged.
 */
export function GeneralGrokShell() {
  const { botId } = useParams<{ botId?: string }>()
  const { getProject, patchProject } = useProjectFolder()
  const { activeBots, getBot } = useGeneralBots()

  const project = getProject(GENERAL_SHELL_ID)
  if (!project || !isGeneralShellId(project.id)) {
    return (
      <div className="flex flex-1 items-center justify-center text-sm text-slate-500">
        通用壳未就绪
      </div>
    )
  }

  const defaultId = activeBots[0]?.id
  if (!botId && defaultId) {
    return <Navigate to={freeBotPath(defaultId)} replace />
  }

  if (botId === 'new') {
    return <Navigate to="/agent/bots/new" replace />
  }

  if (botId && !getBot(botId)) {
    return (
      <Navigate
        to={defaultId ? freeBotPath(defaultId) : '/agent/bots/new'}
        replace
      />
    )
  }

  const resolved = botId ?? defaultId

  return (
    <div className="flex min-h-0 flex-1" data-testid="general-grok-shell">
      <GeneralBotSidebar />
      <div className="flex min-h-0 min-w-0 flex-1 flex-col">
        <div className="shrink-0 space-y-2 border-b border-slate-200 bg-white px-3 py-2">
          <div className="flex flex-wrap items-center gap-1.5 text-[11px] text-slate-500">
            <span className="rounded border border-emerald-200 bg-emerald-50 px-1.5 py-px text-emerald-900">
              样机 · 无真 LLM · 自由 bot
            </span>
            <span className="rounded border border-slate-200 bg-slate-50 px-1 py-px">
              通用 ≠ 项目固定专家
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
        {resolved ? (
          <GeneralBotChatPane botId={resolved} />
        ) : (
          <div className="flex flex-1 flex-col items-center justify-center gap-2 text-sm text-slate-500">
            <p>还没有 bot</p>
            <a
              href="/agent/bots/new"
              className="font-medium text-emerald-800 underline"
            >
              新建第一个 bot
            </a>
          </div>
        )}
      </div>
    </div>
  )
}
