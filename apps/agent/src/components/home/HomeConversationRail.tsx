import { useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { ChevronLeft, ChevronRight, MessageSquare } from 'lucide-react'
import { useProjectFolder } from '../../projects/ProjectFolderContext'
import { getProjectExpert } from '../../projects/experts'

/**
 * 首页右栏 · 对话记录（可折叠）
 * 列最近有更新的项目线程；折叠后只留一条 40px 把手。
 */
export function HomeConversationRail() {
  const { threads, getProject } = useProjectFolder()
  const [open, setOpen] = useState(false)

  const rows = useMemo(
    () =>
      threads
        .slice()
        .sort((a, b) => b.updatedAt.localeCompare(a.updatedAt))
        .slice(0, 12)
        .map((t) => ({
          id: t.id,
          projectId: t.projectId,
          expertId: t.expertId,
          title:
            getProjectExpert(t.expertId)?.name ?? t.title ?? t.expertId,
          project: getProject(t.projectId)?.title ?? t.projectId,
          updatedAt: t.updatedAt,
          hasArtifact: !!t.artifactMarkdown,
        })),
    [threads, getProject],
  )

  if (!open) {
    return (
      <aside
        className="flex w-10 shrink-0 flex-col items-center border-l border-slate-200/90 bg-[#f5f5f7] py-2"
        aria-label="对话记录（已折叠）"
        data-testid="home-conversation-rail-collapsed"
      >
        <button
          type="button"
          onClick={() => setOpen(true)}
          className="focus-ring hit-40 flex w-full items-center justify-center rounded-[var(--radius-sm)] text-slate-600 hover:bg-white/80 hover:text-slate-900"
          aria-expanded={false}
          aria-label="展开对话记录"
          data-testid="home-conversation-toggle"
        >
          <ChevronLeft className="h-4 w-4" strokeWidth={1.75} aria-hidden />
        </button>
        <span
          className="mt-1 text-[10px] font-medium uppercase tracking-wide text-slate-500"
          style={{ writingMode: 'vertical-rl' }}
          aria-hidden
        >
          对话
        </span>
      </aside>
    )
  }

  return (
    <aside
      className="flex w-[min(17.5rem,40vw)] min-w-[13rem] max-w-[19rem] shrink-0 flex-col border-l border-slate-200/90 bg-[#f5f5f7]"
      aria-label="对话记录"
      data-testid="home-conversation-rail"
    >
      <div className="flex h-10 shrink-0 items-center gap-1 px-2">
        <MessageSquare
          className="h-3.5 w-3.5 text-slate-500"
          strokeWidth={1.75}
          aria-hidden
        />
        <span className="text-[12px] font-semibold text-slate-800">对话记录</span>
        <button
          type="button"
          onClick={() => setOpen(false)}
          className="focus-ring hit-40 ml-auto flex items-center justify-center rounded-[var(--radius-sm)] px-1.5 text-slate-600 hover:bg-white/80 hover:text-slate-900"
          aria-expanded
          aria-label="折叠对话记录"
          data-testid="home-conversation-toggle"
        >
          <ChevronRight className="h-4 w-4" strokeWidth={1.75} aria-hidden />
        </button>
      </div>

      <div className="min-h-0 flex-1 overflow-y-auto px-2 pb-2">
        {rows.length === 0 ? (
          <p className="px-2 py-6 text-center text-[12px] leading-relaxed text-slate-500">
            还没有对话
            <br />
            从中间开始办事
          </p>
        ) : (
          <ul className="space-y-0.5">
            {rows.map((r) => (
              <li key={r.id}>
                <Link
                  to={`/agent/projects/${r.projectId}/bots/${r.expertId}`}
                  className="focus-ring flex w-full items-start gap-2 rounded-[var(--radius-sm)] px-2 py-1.5 text-[12px] text-slate-700 transition-colors duration-150 hover:bg-white/90 hover:text-slate-900"
                  data-testid={`home-conversation-${r.id}`}
                >
                  <span className="min-w-0 flex-1">
                    <span className="block truncate font-medium leading-snug">
                      {r.title}
                    </span>
                    <span className="mt-0.5 block truncate text-[11px] text-slate-500">
                      {r.project}
                    </span>
                  </span>
                  {r.hasArtifact && (
                    <span
                      className="mt-0.5 shrink-0 rounded bg-emerald-50 px-1 py-px text-[10px] font-medium text-emerald-800"
                      title="有成果"
                    >
                      稿
                    </span>
                  )}
                </Link>
              </li>
            ))}
          </ul>
        )}
      </div>
    </aside>
  )
}
