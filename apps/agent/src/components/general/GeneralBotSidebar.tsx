import { Link, useParams, useLocation } from 'react-router-dom'
import { useEffect, useRef, useState } from 'react'
import { Bot, Plus, FolderKanban, History, LayoutGrid, MoreHorizontal, PenLine } from 'lucide-react'
import { useGeneralBots } from '../../projects/GeneralBotsContext'
import { expertAccentClass } from '../../projects/experts'
import { freeBotPath } from '../../projects/generalBots'

/**
 * Narrow Grok-like bot rail: avatar + name + 新建. Secondary under「更多」.
 * Spec: agent-grok-replica.md — no section-title walls / freedom badge walls.
 */
export function GeneralBotSidebar() {
  const { botId } = useParams<{ botId?: string }>()
  const loc = useLocation()
  const { activeBots } = useGeneralBots()
  const active = botId ?? activeBots[0]?.id
  const [moreOpen, setMoreOpen] = useState(false)
  const moreRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!moreOpen) return
    const onDoc = (e: MouseEvent) => {
      if (moreRef.current && !moreRef.current.contains(e.target as Node)) {
        setMoreOpen(false)
      }
    }
    document.addEventListener('mousedown', onDoc)
    return () => document.removeEventListener('mousedown', onDoc)
  }, [moreOpen])

  const moreActive =
    loc.pathname.startsWith('/agent/sessions') ||
    loc.pathname.startsWith('/agent/agents') ||
    loc.pathname.startsWith('/agent/compose') ||
    loc.pathname.startsWith('/agent/harness') ||
    loc.pathname.startsWith('/agent/projects')

  return (
    <aside
      className="flex w-[min(12.5rem,38vw)] min-w-[10rem] max-w-[13.5rem] shrink-0 flex-col border-r border-slate-200 bg-slate-50/80"
      data-testid="general-grok-sidebar"
    >
      <div className="shrink-0 px-2 pt-2.5 pb-1">
        <Link
          to="/agent/bots/new"
          data-testid="general-bot-new"
          className="focus-ring hit-40 flex w-full items-center justify-center gap-1 rounded-lg bg-slate-900 px-1.5 py-2 text-xs font-medium text-white hover:bg-slate-800"
        >
          <Plus className="h-3.5 w-3.5" aria-hidden />
          新建
        </Link>
      </div>

      <div className="min-h-0 flex-1 overflow-y-auto px-1.5 py-1.5">
        <ul className="space-y-0.5" aria-label="bots">
          {activeBots.map((b) => {
            const to = freeBotPath(b.id)
            const selected = active === b.id
            return (
              <li key={b.id}>
                <Link
                  to={to}
                  data-testid={`general-bot-${b.id}`}
                  className={`project-bot-link focus-ring hit-40 flex items-center gap-2 rounded-lg px-2 py-2 text-xs ${
                    selected
                      ? 'bg-white font-semibold text-slate-900 shadow-sm ring-1 ring-slate-200'
                      : 'text-slate-600 hover:bg-white/70'
                  }`}
                  aria-current={selected ? 'page' : undefined}
                >
                  <span
                    className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-full border text-[10px] ${expertAccentClass(b.accent)}`}
                    aria-hidden
                  >
                    <Bot className="h-3.5 w-3.5" />
                  </span>
                  <span className="truncate">{b.name}</span>
                </Link>
              </li>
            )
          })}
        </ul>
      </div>

      <div className="relative border-t border-slate-200/80 px-1.5 py-1.5" ref={moreRef}>
        <button
          type="button"
          onClick={() => setMoreOpen((v) => !v)}
          className={`focus-ring hit-40 flex w-full items-center gap-1.5 rounded-md px-2 text-[11px] ${
            moreActive
              ? 'bg-white font-medium text-slate-700'
              : 'text-slate-400 hover:bg-white/70 hover:text-slate-600'
          }`}
          aria-label="更多"
          aria-expanded={moreOpen}
          data-testid="general-side-more"
        >
          <MoreHorizontal className="h-3.5 w-3.5 shrink-0 opacity-70" aria-hidden />
          更多
        </button>
        {moreOpen && (
          <div
            className="menu-enter absolute bottom-full left-0 right-0 z-30 mb-0.5 overflow-hidden rounded-md border border-slate-200 bg-white shadow-sm"
            data-testid="general-side-more-menu"
          >
            <Link
              to="/agent/sessions"
              onClick={() => setMoreOpen(false)}
              className="focus-ring flex min-h-9 items-center gap-2 px-3 py-1.5 text-xs text-slate-600 hover:bg-slate-50"
              data-testid="general-more-sessions"
            >
              <History className="h-3.5 w-3.5 text-slate-400" aria-hidden />
              历史
            </Link>
            <Link
              to="/agent/projects"
              onClick={() => setMoreOpen(false)}
              className="focus-ring flex min-h-9 items-center gap-2 px-3 py-1.5 text-xs text-slate-600 hover:bg-slate-50"
              data-testid="general-nav-projects"
            >
              <FolderKanban className="h-3.5 w-3.5 text-slate-400" aria-hidden />
              项目
            </Link>
            <Link
              to="/agent/agents"
              onClick={() => setMoreOpen(false)}
              className="focus-ring flex min-h-9 items-center gap-2 px-3 py-1.5 text-xs text-slate-600 hover:bg-slate-50"
              data-testid="general-more-catalog"
            >
              <LayoutGrid className="h-3.5 w-3.5 text-slate-400" aria-hidden />
              Catalog
            </Link>
            <Link
              to="/agent/compose"
              onClick={() => setMoreOpen(false)}
              className="focus-ring flex min-h-9 items-center gap-2 px-3 py-1.5 text-xs text-slate-500 hover:bg-slate-50"
              data-testid="general-compose-compat"
            >
              <PenLine className="h-3.5 w-3.5 text-slate-400" aria-hidden />
              旧 Composer
            </Link>
          </div>
        )}
      </div>
    </aside>
  )
}
