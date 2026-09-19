import { Link, useNavigate, useParams, useLocation } from 'react-router-dom'
import { FolderKanban, Bot, Sparkles } from 'lucide-react'
import { useProjectFolder } from '../../projects/ProjectFolderContext'
import {
  expertAccentClass,
  getProjectExpert,
  isOrchestratorExpert,
  orchestratorIdForProject,
  projectKindBadge,
} from '../../projects/experts'
import type { ProjectExpertId } from '../../projects/types'

/**
 * Project folder rail — project row and bot links are siblings (never nested <a>).
 * Project title → /agent/projects/:id (总控); bots → /agent/projects/:id/bots/:botId.
 * Legacy /experts/:id redirects at the router.
 */
export function ProjectFolderSidebar() {
  const { projectId, botId, expertId } = useParams<{
    projectId: string
    botId?: string
    expertId?: string
  }>()
  const seatId = (botId ?? expertId) as ProjectExpertId | undefined
  const navigate = useNavigate()
  const { pathname } = useLocation()
  const { projects, getProject } = useProjectFolder()
  const project = projectId ? getProject(projectId) : undefined
  const defaultOrch = project
    ? orchestratorIdForProject(project)
    : 'orchestrator'
  const activeExpert = seatId ?? defaultOrch

  return (
    <aside className="flex w-[min(14rem,42vw)] min-w-[11rem] max-w-[15rem] shrink-0 flex-col border-r border-slate-200 bg-white">
      <div className="border-b border-slate-100 px-2.5 py-2">
        <Link
          to="/agent/projects"
          className="focus-ring flex items-center gap-1.5 rounded-md px-1.5 py-1 text-xs font-medium text-slate-700 hover:bg-slate-50"
        >
          <FolderKanban className="h-3.5 w-3.5" aria-hidden />
          项目模式
        </Link>
      </div>

      <div className="min-h-0 flex-1 overflow-y-auto px-2 py-2">
        <div className="mb-1.5 text-[10px] font-semibold uppercase tracking-wider text-slate-400">
          项目
        </div>
        <ul className="space-y-0.5">
          {projects.map((p) => {
            const open = p.id === projectId
            const projectPath = `/agent/projects/${p.id}`
            const projectActive =
              pathname === projectPath || pathname.startsWith(`${projectPath}/`)
            const badge = projectKindBadge(p)
            return (
              <li key={p.id} className="space-y-0.5">
                <button
                  type="button"
                  onClick={() => navigate(projectPath)}
                  className={`focus-ring flex w-full items-center gap-1 truncate rounded-md px-2 py-1.5 text-left text-xs ${
                    projectActive && !seatId
                      ? 'bg-slate-900 font-medium text-white'
                      : open
                        ? 'bg-slate-100 font-medium text-slate-900'
                        : 'text-slate-700 hover:bg-slate-50'
                  }`}
                  title={p.title}
                  aria-current={projectActive && !seatId ? 'page' : undefined}
                >
                  <span className="truncate">{p.title}</span>
                  <span
                    className={`ml-auto shrink-0 rounded border px-1 py-px text-[9px] ${
                      projectActive && !seatId
                        ? 'border-white/40 text-white'
                        : badge.className
                    }`}
                  >
                    {badge.label}
                  </span>
                </button>

                {open && project && (
                  <ul className="ml-1 mt-0.5 space-y-0.5 border-l border-slate-200 pl-2">
                    {project.expertIds.map((eid) => {
                      const def = getProjectExpert(eid)
                      const isOrch = isOrchestratorExpert(eid)
                      const to = isOrch
                        ? projectPath
                        : `/agent/projects/${p.id}/bots/${eid}`
                      const active =
                        activeExpert === eid &&
                        (isOrch ? !seatId : seatId === eid)
                      return (
                        <li key={eid}>
                          <Link
                            to={to}
                            className={`focus-ring flex items-center gap-1.5 rounded-md px-1.5 py-1 text-[11px] ${
                              active
                                ? 'bg-accent-soft font-semibold text-accent-muted'
                                : 'text-slate-600 hover:bg-slate-50'
                            }`}
                            aria-current={active ? 'page' : undefined}
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
