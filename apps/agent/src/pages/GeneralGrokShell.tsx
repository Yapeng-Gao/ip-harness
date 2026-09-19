import { useState } from 'react'
import { Navigate, useParams } from 'react-router-dom'
import { Settings2 } from 'lucide-react'
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
 * Default /agent — Grok Bot replica: narrow bot rail + message stream + sticky composer.
 * Spec: docs/architecture/product-apps/agent-grok-replica.md (9ba1d42)
 * Case bind / honesty default-hidden (opt-in via chrome toggle). No project deepen.
 */
export function GeneralGrokShell() {
  const { botId } = useParams<{ botId?: string }>()
  const { getProject, patchProject } = useProjectFolder()
  const { activeBots, getBot } = useGeneralBots()
  const [chromeOpen, setChromeOpen] = useState(false)

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
      <div className="flex min-h-0 min-w-0 flex-1 flex-col bg-white">
        {/* Ultra-thin chrome: settings toggle only — no honesty wall / case strip by default */}
        <div className="flex shrink-0 items-center justify-end gap-2 px-2 py-0.5">
          <button
            type="button"
            onClick={() => setChromeOpen((v) => !v)}
            className="focus-ring inline-flex items-center gap-1 rounded px-1.5 py-0.5 text-[10px] text-slate-400 hover:bg-slate-50 hover:text-slate-600"
            aria-expanded={chromeOpen}
            aria-label="样机与绑案"
            data-testid="general-chrome-toggle"
          >
            <Settings2 className="h-3 w-3" aria-hidden />
            {chromeOpen ? '收起' : '…'}
          </button>
        </div>
        {chromeOpen && (
          <div
            className="shrink-0 space-y-1.5 border-b border-slate-100 bg-slate-50/50 px-3 py-2"
            data-testid="general-chrome-panel"
          >
            <p
              className="text-[10px] leading-snug text-slate-400"
              data-testid="general-honesty-weak"
            >
              样机 · 无真 LLM · 自由 bot · 写库须 HITL
            </p>
            <div data-testid="general-case-bind-slot">
              <CaseBindControls
                caseId={project.caseId}
                prominence="soft"
                writebackRequiresBind={false}
                onCreateStart={() =>
                  patchProject(GENERAL_SHELL_ID, {
                    caseBindState: 'pending_create',
                  })
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
          </div>
        )}
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
