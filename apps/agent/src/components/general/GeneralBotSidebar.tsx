import { Link, useParams } from 'react-router-dom'
import { Bot, Sparkles, FolderKanban, History, LayoutGrid } from 'lucide-react'
import {
  expertAccentClass,
  getProjectExpert,
  isOrchestratorExpert,
} from '../../projects/experts'
import {
  GENERAL_SHELL_DEFAULT_BOT,
  GENERAL_SHELL_SIDEBAR,
  generalBotPath,
} from '../../projects/generalShell'
import type { ProjectExpertId } from '../../projects/types'

/**
 * Shell-level patent bot rail (Grok form) — no project folder navigation.
 */
export function GeneralBotSidebar() {
  const { botId } = useParams<{ botId?: string }>()
  const active: ProjectExpertId =
    botId && !isMining(botId)
      ? (botId as ProjectExpertId)
      : GENERAL_SHELL_DEFAULT_BOT

  return (
    <aside
      className="flex w-[min(14rem,42vw)] min-w-[11rem] max-w-[15rem] shrink-0 flex-col border-r border-slate-200 bg-white"
      data-testid="general-grok-sidebar"
    >
      <div className="border-b border-slate-100 px-2.5 py-2">
        <div className="text-[10px] font-semibold uppercase tracking-wider text-slate-400">
          通用 Agent
        </div>
        <p className="mt-0.5 text-[11px] leading-snug text-slate-500">
          Grok 多专家壳 · 点 bot 一对一
        </p>
      </div>

      <div className="min-h-0 flex-1 overflow-y-auto px-2 py-2">
        <div className="mb-1.5 text-[10px] font-semibold uppercase tracking-wider text-slate-400">
          专利专家
        </div>
        <ul className="space-y-0.5">
          {GENERAL_SHELL_SIDEBAR.map((seat) => {
            if (seat.disabled) {
              return (
                <li key={seat.id}>
                  <div
                    className="flex cursor-not-allowed items-center gap-1.5 rounded-md px-1.5 py-1.5 text-xs text-slate-400 opacity-60"
                    title={seat.note}
                    data-testid={`general-bot-${seat.id}-disabled`}
                    aria-disabled="true"
                  >
                    <Bot className="h-3 w-3 shrink-0" aria-hidden />
                    <span className="truncate rounded border border-dashed border-slate-200 bg-slate-50 px-1 py-px text-[10px]">
                      {seat.label}
                    </span>
                    <span className="ml-auto shrink-0 text-[9px]">灰显</span>
                  </div>
                </li>
              )
            }
            const eid = seat.id as ProjectExpertId
            const def = getProjectExpert(eid)
            const isOrch = isOrchestratorExpert(eid)
            const to = generalBotPath(eid)
            const selected = active === eid
            return (
              <li key={seat.id}>
                <Link
                  to={to}
                  data-testid={`general-bot-${eid}`}
                  className={`project-bot-link focus-ring hit-40 flex items-center gap-1.5 rounded-md px-1.5 text-xs ${
                    selected
                      ? 'bg-accent-soft font-semibold text-accent-muted'
                      : 'text-slate-600 hover:bg-slate-50'
                  }`}
                  aria-current={selected ? 'page' : undefined}
                >
                  {isOrch ? (
                    <Sparkles className="h-3 w-3 shrink-0" aria-hidden />
                  ) : (
                    <Bot className="h-3 w-3 shrink-0" aria-hidden />
                  )}
                  <span
                    className={`truncate rounded border px-1 py-px text-[10px] ${expertAccentClass(def.accent)}`}
                  >
                    {def.name}
                  </span>
                </Link>
              </li>
            )
          })}
        </ul>
      </div>

      <div className="space-y-0.5 border-t border-slate-100 px-2 py-2">
        <Link
          to="/agent/projects"
          className="focus-ring hit-40 flex items-center gap-1.5 rounded-md px-1.5 text-xs text-slate-600 hover:bg-slate-50"
        >
          <FolderKanban className="h-3.5 w-3.5" aria-hidden />
          项目模式
        </Link>
        <Link
          to="/agent/sessions"
          className="focus-ring hit-40 flex items-center gap-1.5 rounded-md px-1.5 text-xs text-slate-600 hover:bg-slate-50"
        >
          <History className="h-3.5 w-3.5" aria-hidden />
          历史聚合
        </Link>
        <Link
          to="/agent/agents"
          className="focus-ring hit-40 flex items-center gap-1.5 rounded-md px-1.5 text-xs text-slate-500 hover:bg-slate-50"
        >
          <LayoutGrid className="h-3.5 w-3.5" aria-hidden />
          Catalog · 管理
        </Link>
        <Link
          to="/agent/compose"
          className="focus-ring hit-40 flex items-center gap-1.5 rounded-md px-1.5 text-[11px] text-slate-400 hover:bg-slate-50 hover:text-slate-600"
          data-testid="general-compose-compat"
        >
          旧 Composer · 次级
        </Link>
      </div>
    </aside>
  )
}

function isMining(id: string): boolean {
  return id === 'expert-mining'
}
