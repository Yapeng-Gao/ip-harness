import { useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { Briefcase, ChevronDown, FolderKanban, History, Plus } from 'lucide-react'
import { useProjectFolder } from '../../projects/ProjectFolderContext'
import { projectKindBadge } from '../../projects/experts'
import { useBusinessCases } from '../../business/BusinessCaseContext'
import { currentSeatForProgress } from '../../business/businessSeats'
import {
  MAIN_CHAIN_DEPTS,
  orgDeptByLeadSeat,
} from '../../departments/orgDepts'
import { useOrgConfig } from '../../departments/OrgConfigContext'

/**
 * 首页左栏 · 案子列表为主（阶段 + 进公司首页）
 * 顶钮「开新案子」；项目夹降级为挂载历史；底栏「我的案子」。
 */
export function HomeProjectRail() {
  const { folderProjects } = useProjectFolder()
  const { cases, getProgress, stageLabel } = useBusinessCases()
  const { deptLabel } = useOrgConfig()
  const [mountOpen, setMountOpen] = useState(false)

  const caseIds = useMemo(() => new Set(cases.map((c) => c.id)), [cases])
  const unmounted = useMemo(
    () => folderProjects.filter((p) => !p.caseId && !caseIds.has(p.id)),
    [folderProjects, caseIds],
  )

  const caseRows = useMemo(
    () =>
      cases.map((c) => {
        const prog = getProgress(c.id)
        const seat = currentSeatForProgress({
          stageId: prog.stageId,
          doneSeatIds: prog.doneSeatIds,
          moreSeatIds: prog.moreSeatIds,
        })
        const dept = orgDeptByLeadSeat(seat) ?? MAIN_CHAIN_DEPTS[0]!
        return {
          id: c.id,
          title: c.title,
          stage: stageLabel(prog.stageId),
          deptName: deptLabel(dept),
        }
      }),
    [cases, getProgress, stageLabel, deptLabel],
  )

  return (
    <aside
      className="flex w-[min(15rem,38vw)] min-w-[12rem] max-w-[17rem] shrink-0 flex-col border-r border-slate-200/90 bg-[#f5f5f7]"
      data-testid="home-project-rail"
      aria-label="案子"
    >
      <div className="shrink-0 space-y-1.5 px-2.5 pb-2 pt-3">
        <Link
          to="/agent/cases/new"
          className="btn-press focus-ring hit-40 flex w-full items-center justify-center gap-1.5 rounded-[var(--radius-md)] bg-slate-900 px-2.5 text-[13px] font-semibold text-white hover:bg-slate-800"
          data-testid="home-new-case"
        >
          <Plus className="h-4 w-4" strokeWidth={2.25} aria-hidden />
          开新案子
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
        <p className="nav-section !mt-1 !mb-1 px-2 text-slate-500">在办案子</p>
        {caseRows.length === 0 ? (
          <p className="px-2 py-6 text-center text-[12px] leading-relaxed text-slate-500">
            还没有案子
            <br />
            从上面开一个开始
          </p>
        ) : (
          <ul className="space-y-0.5" aria-label="案子列表">
            {caseRows.map((c) => (
              <li key={c.id}>
                <Link
                  to={`/agent/cases/${c.id}`}
                  className="focus-ring group flex w-full items-start gap-2 rounded-[var(--radius-sm)] px-2.5 py-2 text-[13px] text-slate-700 transition-colors duration-150 hover:bg-white/90 hover:text-slate-900"
                  data-testid={`home-case-${c.id}`}
                >
                  <Briefcase
                    className="mt-0.5 h-4 w-4 shrink-0 text-slate-400"
                    strokeWidth={1.75}
                    aria-hidden
                  />
                  <span className="min-w-0 flex-1">
                    <span className="block truncate font-medium leading-snug">
                      {c.title}
                    </span>
                    <span className="mt-0.5 flex items-center gap-1.5">
                      <span className="truncate text-[11px] text-slate-500">
                        {c.stage}
                      </span>
                      <span className="truncate text-[11px] text-slate-400">
                        · {c.deptName}
                      </span>
                    </span>
                  </span>
                </Link>
              </li>
            ))}
          </ul>
        )}

        {mountOpen && (
          <>
            <p className="nav-section !mt-3 !mb-1 px-2 text-slate-500">历史项目</p>
            {unmounted.length === 0 ? (
              <p className="px-2 py-3 text-center text-[12px] text-slate-500">
                没有未绑案的项目
              </p>
            ) : (
              <ul className="space-y-0.5" aria-label="历史项目">
                {unmounted.map((p) => {
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
                            <span className="truncate text-[11px] text-slate-500">
                              未绑案
                            </span>
                          </span>
                        </span>
                      </Link>
                    </li>
                  )
                })}
              </ul>
            )}
            <Link
              to="/agent/projects"
              className="focus-ring mt-1 flex w-full items-center gap-1.5 rounded-[var(--radius-sm)] px-2.5 py-1.5 text-[11px] font-medium text-slate-500 hover:bg-white/80 hover:text-slate-700"
              data-testid="home-new-project"
            >
              <Plus className="h-3 w-3" strokeWidth={2} aria-hidden />
              新建项目（旁路）
            </Link>
          </>
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
