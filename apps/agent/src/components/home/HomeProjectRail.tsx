import { useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { FolderKanban, Plus, History, ChevronDown, Briefcase } from 'lucide-react'
import { useProjectFolder } from '../../projects/ProjectFolderContext'
import { projectKindBadge } from '../../projects/experts'
import { useBusinessCases } from '../../business/BusinessCaseContext'

/**
 * 首页左栏 · 项目列表 + 新建 + 挂载历史
 * 项目 = 办案/课题容器；案子入口降到「我的案子」一行，不再抢主位。
 */
export function HomeProjectRail() {
  const { folderProjects } = useProjectFolder()
  const { cases } = useBusinessCases()
  const [mountOpen, setMountOpen] = useState(false)

  const caseIds = useMemo(() => new Set(cases.map((c) => c.id)), [cases])
  /** 已挂载 = 已转成案子的项目；未挂载 = 仍是空夹 */
  const mounted = useMemo(
    () => folderProjects.filter((p) => p.caseId || caseIds.has(p.id)),
    [folderProjects, caseIds],
  )
  const unmounted = useMemo(
    () => folderProjects.filter((p) => !p.caseId && !caseIds.has(p.id)),
    [folderProjects, caseIds],
  )
  const rows = mountOpen ? folderProjects : mounted.length > 0 ? mounted : folderProjects

  return (
    <aside
      className="flex w-[min(15rem,38vw)] min-w-[12rem] max-w-[17rem] shrink-0 flex-col border-r border-slate-200/90 bg-[#f5f5f7]"
      data-testid="home-project-rail"
      aria-label="项目"
    >
      <div className="shrink-0 space-y-1.5 px-2.5 pb-2 pt-3">
        <Link
          to="/agent/projects"
          className="btn-press focus-ring hit-40 flex w-full items-center justify-center gap-1.5 rounded-[var(--radius-md)] bg-slate-900 px-2.5 text-[13px] font-semibold text-white hover:bg-slate-800"
          data-testid="home-new-project"
        >
          <Plus className="h-4 w-4" strokeWidth={2.25} aria-hidden />
          新建项目
        </Link>
        <button
          type="button"
          onClick={() => setMountOpen((v) => !v)}
          aria-expanded={mountOpen}
          className="focus-ring hit-40 flex w-full items-center gap-1.5 rounded-[var(--radius-sm)] px-2.5 text-[12px] font-medium text-slate-600 hover:bg-white/80 hover:text-slate-800"
          data-testid="home-mount-history"
        >
          <History className="h-3.5 w-3.5 text-slate-500" strokeWidth={1.75} aria-hidden />
          挂载历史项目
          <span className="ml-auto tabular text-[11px] text-slate-500">
            {unmounted.length}
          </span>
          <ChevronDown
            className={`h-3.5 w-3.5 text-slate-500 transition-transform duration-150 ${mountOpen ? 'rotate-180' : ''}`}
            strokeWidth={1.75}
            aria-hidden
          />
        </button>
      </div>

      <div className="min-h-0 flex-1 overflow-y-auto px-2 pb-2">
        <p className="nav-section !mt-1 !mb-1 px-2 text-slate-500">
          {mountOpen ? '全部项目' : '已挂载'}
        </p>
        {rows.length === 0 ? (
          <p className="px-2 py-6 text-center text-[12px] leading-relaxed text-slate-500">
            还没有项目
            <br />
            从上面新建一个开始
          </p>
        ) : (
          <ul className="space-y-0.5" aria-label="项目列表">
            {rows.map((p) => {
              const badge = projectKindBadge(p)
              return (
                <li key={p.id}>
                  <Link
                    to={`/agent/projects/${p.id}`}
                    className="focus-ring group flex w-full items-start gap-2 rounded-[var(--radius-sm)] px-2.5 py-2 text-[13px] text-slate-700 transition-colors duration-150 hover:bg-white/90 hover:text-slate-900"
                    data-testid={`home-project-${p.id}`}
                  >
                    <FolderKanban
                      className="mt-0.5 h-4 w-4 shrink-0 text-slate-400"
                      strokeWidth={1.75}
                      aria-hidden
                    />
                    <span className="min-w-0 flex-1">
                      <span className="block truncate font-medium leading-snug">
                        {p.title}
                      </span>
                      <span className="mt-0.5 flex items-center gap-1.5">
                        <span
                          className={`rounded border px-1 py-px text-[10px] font-medium ${badge.className}`}
                        >
                          {badge.label}
                        </span>
                        {p.caseId ? (
                          <span className="truncate text-[11px] text-slate-500">
                            已绑案
                          </span>
                        ) : (
                          <span className="truncate text-[11px] text-slate-500">
                            未绑案
                          </span>
                        )}
                      </span>
                    </span>
                  </Link>
                </li>
              )
            })}
          </ul>
        )}
      </div>

      <div className="shrink-0 border-t border-slate-200/80 px-2 py-2">
        <Link
          to="/agent/cases"
          className="focus-ring hit-40 flex w-full items-center gap-1.5 rounded-[var(--radius-sm)] px-2.5 text-[12px] font-medium text-slate-600 hover:bg-white/80 hover:text-slate-800"
          data-testid="home-to-cases"
        >
          <Briefcase className="h-3.5 w-3.5 text-slate-500" strokeWidth={1.75} aria-hidden />
          我的案子
          <span className="ml-auto tabular text-[11px] text-slate-500">
            {cases.length}
          </span>
        </Link>
      </div>
    </aside>
  )
}
