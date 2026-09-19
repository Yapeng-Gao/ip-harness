import { Link, useParams, useLocation } from 'react-router-dom'
import { useEffect, useRef, useState } from 'react'
import { Bot, Plus, FolderKanban, History, LayoutGrid, MoreHorizontal, PenLine, Sparkles, MessageSquare } from 'lucide-react'
import { useGeneralBots } from '../../projects/GeneralBotsContext'
import { expertAccentClass } from '../../projects/experts'
import { BOT_SEED_ORCHESTRATOR, freeBotPath } from '../../projects/generalBots'

/**
 * Narrow Grok-like bot rail: avatar + name + 新建对话. Secondary under「更多」.
 * Spec: agent-grok-replica.md — soft selected fill + accent rail; hit ≥40.
 */
export function GeneralBotSidebar() {
  const { botId } = useParams<{ botId?: string }>()
  const loc = useLocation()
  const { activeBots, getBot } = useGeneralBots()
  // Match GeneralGrokShell: /agent/team without :botId defaults to 总控
  const active =
    botId ??
    getBot(BOT_SEED_ORCHESTRATOR)?.id ??
    activeBots[0]?.id
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
    loc.pathname.startsWith('/agent/projects') ||
    loc.pathname.startsWith('/agent/lab') ||
    loc.pathname.startsWith('/agent/gallery')

  return (
    <aside
      className="general-grok-sidebar flex w-[min(12.5rem,38vw)] min-w-[10rem] max-w-[13.5rem] shrink-0 flex-col border-r border-slate-200/90 bg-[#f5f5f7]"
      data-testid="general-grok-sidebar"
    >
      <div className="shrink-0 px-2.5 pt-3 pb-1.5">
        <Link
          to="/agent/bots/new"
          data-testid="general-bot-new"
          className="btn-press focus-ring hit-40 general-grok-new flex w-full items-center justify-center gap-1.5 rounded-[var(--radius-md)] bg-slate-900 px-2.5 text-[13px] font-semibold text-white shadow-sm hover:bg-slate-800"
          title="新建对话"
          aria-label="新建对话"
        >
          <Plus className="h-4 w-4 shrink-0" strokeWidth={2.25} aria-hidden />
          新建对话
        </Link>
      </div>

      <div className="min-h-0 flex-1 overflow-y-auto px-2 py-1.5">
        <ul className="space-y-1" aria-label="bots">
          {activeBots.map((b) => {
            const to = freeBotPath(b.id)
            const selected = active === b.id
            return (
              <li key={b.id}>
                <Link
                  to={to}
                  data-testid={`general-bot-${b.id}`}
                  className={`general-bot-row project-bot-link focus-ring hit-40 flex w-full items-center gap-2 rounded-[var(--radius-sm)] px-2.5 py-2 text-[13px] transition-[background-color,color,box-shadow] duration-150 ease-out ${
                    selected
                      ? 'general-bot-row--selected font-semibold text-slate-900'
                      : 'font-medium text-slate-600 hover:bg-white/80 hover:text-slate-800'
                  }`}
                  aria-current={selected ? 'page' : undefined}
                >
                  <span
                    className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-full border text-[10px] ${expertAccentClass(b.accent)}`}
                    aria-hidden
                  >
                    <Bot className="h-3.5 w-3.5" strokeWidth={1.75} />
                  </span>
                  <span className="min-w-0 flex-1 truncate leading-snug">{b.name}</span>
                </Link>
              </li>
            )
          })}
        </ul>
      </div>

      <div className="relative border-t border-slate-200/80 px-2 py-2" ref={moreRef}>
        <button
          type="button"
          onClick={() => setMoreOpen((v) => !v)}
          className={`btn-press focus-ring hit-40 flex w-full items-center gap-1.5 rounded-[var(--radius-sm)] px-2.5 text-[12px] ${
            moreActive
              ? 'bg-white font-medium text-slate-700 shadow-sm'
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
            className="menu-enter absolute bottom-full left-0 right-0 z-30 mb-1 overflow-hidden rounded-[var(--radius-md)] border border-slate-200 bg-white shadow-md"
            data-testid="general-side-more-menu"
          >
            <Link
              to="/agent"
              onClick={() => setMoreOpen(false)}
              className="focus-ring flex min-h-10 items-center gap-2 px-3 py-2 text-[13px] font-medium text-slate-700 hover:bg-slate-50"
              data-testid="general-more-l1"
            >
              <MessageSquare className="h-3.5 w-3.5 text-slate-400" aria-hidden />
              单助手（L1）
            </Link>
            <Link
              to="/agent/lab"
              onClick={() => setMoreOpen(false)}
              className="focus-ring flex min-h-10 items-center gap-2 px-3 py-2 text-[13px] text-slate-600 hover:bg-slate-50"
              data-testid="general-more-lab"
            >
              <Sparkles className="h-3.5 w-3.5 text-slate-400" aria-hidden />
              原型展廊
            </Link>
            <Link
              to="/agent/sessions"
              onClick={() => setMoreOpen(false)}
              className="focus-ring flex min-h-10 items-center gap-2 px-3 py-2 text-[13px] text-slate-600 hover:bg-slate-50"
              data-testid="general-more-sessions"
            >
              <History className="h-3.5 w-3.5 text-slate-400" aria-hidden />
              历史
            </Link>
            <Link
              to="/agent/projects"
              onClick={() => setMoreOpen(false)}
              className="focus-ring flex min-h-10 items-center gap-2 px-3 py-2 text-[13px] text-slate-600 hover:bg-slate-50"
              data-testid="general-nav-projects"
            >
              <FolderKanban className="h-3.5 w-3.5 text-slate-400" aria-hidden />
              项目
            </Link>
            <Link
              to="/agent/agents"
              onClick={() => setMoreOpen(false)}
              className="focus-ring flex min-h-10 items-center gap-2 px-3 py-2 text-[13px] text-slate-600 hover:bg-slate-50"
              data-testid="general-more-catalog"
            >
              <LayoutGrid className="h-3.5 w-3.5 text-slate-400" aria-hidden />
              Catalog
            </Link>
            <Link
              to="/agent/compose"
              onClick={() => setMoreOpen(false)}
              className="focus-ring flex min-h-10 items-center gap-2 px-3 py-2 text-[13px] text-slate-500 hover:bg-slate-50"
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
