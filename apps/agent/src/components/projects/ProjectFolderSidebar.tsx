import { NavLink, Link, useParams } from 'react-router-dom'
import { FolderKanban, Bot, Sparkles } from 'lucide-react'
import { useProjectFolder } from '../../projects/ProjectFolderContext'
import {
  expertAccentClass,
  getProjectExpert,
} from '../../projects/experts'
import type { ProjectExpertId } from '../../projects/types'

export function ProjectFolderSidebar() {
  const { projectId, expertId } = useParams<{
    projectId: string
    expertId?: string
  }>()
  const { projects, getProject } = useProjectFolder()
  const project = projectId ? getProject(projectId) : undefined
  const activeExpert = (expertId as ProjectExpertId | undefined) ?? 'orchestrator'

  return (
    <aside className="flex w-[min(14rem,42vw)] min-w-[11rem] max-w-[15rem] shrink-0 flex-col border-r border-slate-200 bg-white">
      <div className="border-b border-slate-100 px-2.5 py-2">
        <Link
          to="/agent/projects"
          className="focus-ring flex items-center gap-1.5 rounded-md px-1.5 py-1 text-xs font-medium text-slate-700 hover:bg-slate-50"
        >
          <FolderKanban className="h-3.5 w-3.5" aria-hidden />
          项目文件夹
        </Link>
      </div>

      <div className="min-h-0 flex-1 overflow-y-auto px-2 py-2">
        <div className="mb-1.5 text-[10px] font-semibold uppercase tracking-wider text-slate-400">
          项目
        </div>
        <ul className="space-y-0.5">
          {projects.map((p) => {
            const open = p.id === projectId
            return (
              <li key={p.id}>
                <NavLink
                  to={`/agent/projects/${p.id}`}
                  className={`focus-ring block truncate rounded-md px-2 py-1.5 text-xs ${
                    open
                      ? 'bg-slate-900 font-medium text-white'
                      : 'text-slate-700 hover:bg-slate-50'
                  }`}
                  title={p.title}
                >
                  {p.title}
                </NavLink>
                {open && project && (
                  <ul className="mt-1 space-y-0.5 border-l border-slate-200 pl-2 ml-1">
                    {project.expertIds.map((eid) => {
                      const def = getProjectExpert(eid)
                      const isOrch = eid === 'orchestrator'
                      const to = isOrch
                        ? `/agent/projects/${p.id}`
                        : `/agent/projects/${p.id}/experts/${eid}`
                      const active =
                        activeExpert === eid &&
                        (isOrch ? !expertId : expertId === eid)
                      return (
                        <li key={eid}>
                          <NavLink
                            to={to}
                            end={isOrch}
                            className={`focus-ring flex items-center gap-1.5 rounded-md px-1.5 py-1 text-[11px] ${
                              active
                                ? 'bg-accent-soft font-semibold text-accent-muted'
                                : 'text-slate-600 hover:bg-slate-50'
                            }`}
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
                          </NavLink>
                        </li>
                      )
                    })}
                  </ul>
                )}
              </li>
            )
          })}
        </ul>
      </div>

      <div className="border-t border-slate-100 px-2.5 py-2 text-[10px] leading-relaxed text-slate-400">
        样机 · 无真 LLM · 专家分剧本
      </div>
    </aside>
  )
}
