import { Link, useParams } from 'react-router-dom'
import { Bot, Plus, FolderKanban, History, LayoutGrid } from 'lucide-react'
import { useGeneralBots } from '../../projects/GeneralBotsContext'
import { expertAccentClass } from '../../projects/experts'
import { freeBotPath, kindLabel } from '../../projects/generalBots'

/**
 * Free bot rail — seed customs + user-created; optional template-backed.
 * No welded patent roster. Spec §3 / §5 (cec9d79).
 */
export function GeneralBotSidebar() {
  const { botId } = useParams<{ botId?: string }>()
  const { activeBots } = useGeneralBots()
  const active = botId ?? activeBots[0]?.id

  return (
    <aside
      className="flex w-[min(14rem,42vw)] min-w-[11rem] max-w-[15rem] shrink-0 flex-col border-r border-slate-200 bg-white"
      data-testid="general-grok-sidebar"
    >
      <div className="border-b border-slate-100 px-2.5 py-2">
        <div className="flex items-center gap-1.5">
          <div className="text-[10px] font-semibold uppercase tracking-wider text-slate-400">
            通用 Grok
          </div>
          <span
            className="rounded border border-emerald-200 bg-emerald-50 px-1 py-px text-[9px] font-medium text-emerald-800"
            data-testid="general-freedom-badge"
          >
            自由 bot
          </span>
        </div>
        <p className="mt-0.5 text-[11px] leading-snug text-slate-500">
          可新建 · 一对一 · bot 互通
        </p>
      </div>

      <div className="shrink-0 px-2 pt-2">
        <Link
          to="/agent/bots/new"
          data-testid="general-bot-new"
          className="focus-ring hit-40 flex w-full items-center justify-center gap-1 rounded-md border border-dashed border-emerald-300 bg-emerald-50/60 px-1.5 text-xs font-medium text-emerald-900 hover:bg-emerald-50"
        >
          <Plus className="h-3.5 w-3.5" aria-hidden />
          新建 bot
        </Link>
      </div>

      <div className="min-h-0 flex-1 overflow-y-auto px-2 py-2">
        <div className="mb-1.5 text-[10px] font-semibold uppercase tracking-wider text-slate-400">
          我的 bot
        </div>
        <ul className="space-y-0.5">
          {activeBots.map((b) => {
            const to = freeBotPath(b.id)
            const selected = active === b.id
            return (
              <li key={b.id}>
                <Link
                  to={to}
                  data-testid={`general-bot-${b.id}`}
                  className={`project-bot-link focus-ring hit-40 flex items-center gap-1.5 rounded-md px-1.5 text-xs ${
                    selected
                      ? 'bg-accent-soft font-semibold text-accent-muted'
                      : 'text-slate-600 hover:bg-slate-50'
                  }`}
                  aria-current={selected ? 'page' : undefined}
                >
                  <Bot className="h-3 w-3 shrink-0" aria-hidden />
                  <span
                    className={`truncate rounded border px-1 py-px text-[10px] ${expertAccentClass(b.accent)}`}
                  >
                    {b.name}
                  </span>
                  <span className="ml-auto shrink-0 text-[9px] text-slate-400">
                    {kindLabel(b.kind)}
                  </span>
                </Link>
              </li>
            )
          })}
        </ul>
        <p className="mt-2 text-[10px] leading-relaxed text-slate-400">
          可选「从模板添加」专利能力；不焊死专家花名册。
        </p>
      </div>

      <div className="space-y-0.5 border-t border-slate-100 px-2 py-2">
        <Link
          to="/agent/projects"
          className="focus-ring hit-40 flex items-center gap-1.5 rounded-md px-1.5 text-xs text-slate-600 hover:bg-slate-50"
          data-testid="general-nav-projects"
        >
          <FolderKanban className="h-3.5 w-3.5" aria-hidden />
          项目模式
          <span className="ml-auto text-[9px] text-amber-700">专家固定</span>
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
