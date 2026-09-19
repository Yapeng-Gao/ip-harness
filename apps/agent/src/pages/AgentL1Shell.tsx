import { useState } from 'react'
import { Link } from 'react-router-dom'
import { Settings2, Users, FolderKanban, Sparkles, Plus } from 'lucide-react'
import { GeneralBotChatPane } from '../components/general/GeneralBotChatPane'
import { CaseBindControls } from '../components/case/CaseBindControls'
import { useProjectFolder } from '../projects/ProjectFolderContext'
import { useGeneralBots } from '../projects/GeneralBotsContext'
import {
  GENERAL_SHELL_ID,
  GENERAL_SHELL_DEFAULT_BOT,
  isGeneralShellId,
} from '../projects/generalShell'

/**
 * L1 default `/agent` — ChatGPT/Kimi-style single assistant + sticky composer.
 * No multi-bot rail on entry. L2 team and L3 patent projects are equal topbar exits.
 * Spec: docs/architecture/product-apps/agent-layers.md (24a6d8f)
 */
export function AgentL1Shell() {
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

  const preferred =
    getBot(GENERAL_SHELL_DEFAULT_BOT) ?? activeBots[0] ?? undefined

  return (
    <div
      className="flex min-h-0 flex-1 flex-col bg-white"
      data-testid="agent-l1-shell"
      data-layer="l1"
    >
      {/* Thin chrome: layer cue + equal L2/L3 exits — not a bot wall */}
      <div className="flex shrink-0 items-center gap-2 border-b border-slate-100/90 px-3 py-1.5 sm:px-4">
        <span
          className="rounded-full bg-slate-100 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-slate-500"
          data-testid="agent-l1-badge"
        >
          L1 · 单助手
        </span>
        <div className="ml-auto flex items-center gap-1.5">
          <Link
            to="/agent/team"
            className="btn-press focus-ring inline-flex min-h-8 items-center gap-1.5 rounded-[var(--radius-sm)] border border-slate-200 bg-white px-2.5 py-1 text-[12px] font-semibold text-slate-800 shadow-sm hover:bg-slate-50"
            aria-label="进入团队"
            data-testid="agent-l1-to-team"
            title="L2 · Grok 多 bot 团队协作"
          >
            <Users className="h-3.5 w-3.5" aria-hidden />
            团队
          </Link>
          <Link
            to="/agent/projects"
            className="btn-press focus-ring inline-flex min-h-8 items-center gap-1.5 rounded-[var(--radius-sm)] border border-slate-200 bg-white px-2.5 py-1 text-[12px] font-semibold text-slate-800 shadow-sm hover:bg-slate-50"
            aria-label="进入专利项目"
            data-testid="agent-l1-to-projects"
            title="L3 · 专利项目固定专家"
          >
            <FolderKanban className="h-3.5 w-3.5" aria-hidden />
            专利项目
          </Link>
          <Link
            to="/agent/lab"
            className="btn-press focus-ring inline-flex min-h-8 items-center gap-1 rounded-[var(--radius-sm)] px-2 py-1 text-[11px] text-slate-400 hover:bg-slate-50 hover:text-slate-600"
            aria-label="原型展廊"
            data-testid="agent-lab-corner"
            title="原型展廊"
          >
            <Sparkles className="h-3.5 w-3.5" aria-hidden />
            展廊
          </Link>
          <button
            type="button"
            onClick={() => setChromeOpen((v) => !v)}
            className="btn-press focus-ring inline-flex min-h-8 items-center gap-1 rounded-[var(--radius-sm)] px-2 py-1 text-[11px] text-slate-400 hover:bg-slate-50 hover:text-slate-600"
            aria-expanded={chromeOpen}
            aria-label="样机与绑案"
            data-testid="general-chrome-toggle"
          >
            <Settings2 className="h-3.5 w-3.5" aria-hidden />
            {chromeOpen ? '收起' : '…'}
          </button>
        </div>
      </div>

      {chromeOpen && (
        <div
          className="shrink-0 space-y-1.5 border-b border-slate-100 bg-slate-50/50 px-4 py-2.5"
          data-testid="general-chrome-panel"
        >
          <p
            className="text-[11px] leading-snug text-slate-400"
            data-testid="general-honesty-weak"
          >
            样机 · 无真 LLM · L1 单助手 · 写库须 HITL · 「团队」「专利项目」为并列显式入口
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

      {preferred ? (
        <GeneralBotChatPane botId={preferred.id} showForward={false} />
      ) : (
        <div className="flex flex-1 flex-col items-center justify-center gap-3 text-sm text-slate-500">
          <p className="text-[15px] text-slate-600">还没有助手</p>
          <Link
            to="/agent/bots/new"
            className="btn-press focus-ring hit-40 inline-flex items-center gap-1.5 rounded-[var(--radius-md)] bg-slate-900 px-4 text-[13px] font-semibold text-white"
            data-testid="l1-empty-new"
          >
            <Plus className="h-4 w-4" aria-hidden />
            新建助手
          </Link>
        </div>
      )}
    </div>
  )
}
