import { useMemo } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import {
  ArrowRight,
  Briefcase,
  FolderOpen,
  Plus,
} from 'lucide-react'
import { HomeProjectRail } from '../components/home/HomeProjectRail'
import { HomeBriefing } from '../components/home/HomeBriefing'
import { HomeComposer } from '../components/home/HomeComposer'
import { HomeConversationRail } from '../components/home/HomeConversationRail'
import { useBusinessCases } from '../business/BusinessCaseContext'
import { currentSeatForProgress } from '../business/businessSeats'
import {
  MAIN_CHAIN_DEPTS,
  deptSlug,
  orgDeptByLeadSeat,
} from '../departments/orgDepts'
import { useOrgConfig } from '../departments/OrgConfigContext'

/**
 * 首页 · /agent
 * 左：案子轨（阶段 + 进公司首页）
 * 中：三入口主操作 + 补充 composer + 可折叠简报
 * 右：对话记录（默认折叠）
 * 待确认只在顶栏铃铛，不占主区。
 */
export function HomePage() {
  const [params] = useSearchParams()
  const attachId = params.get('attach')
  const { cases, getProgress, stageLabel } = useBusinessCases()
  const { deptLabel } = useOrgConfig()

  /** 在办焦点案 → 当前部门工作台（与 CaseCompanyHome「去当前部门」同逻辑） */
  const advance = useMemo(() => {
    const focus =
      cases.find((c) => {
        const p = getProgress(c.id)
        return p.completedStages.length < 5
      }) ?? null
    if (!focus) return null
    const prog = getProgress(focus.id)
    const seat = currentSeatForProgress({
      stageId: prog.stageId,
      doneSeatIds: prog.doneSeatIds,
      moreSeatIds: prog.moreSeatIds,
    })
    const dept = orgDeptByLeadSeat(seat) ?? MAIN_CHAIN_DEPTS[0]!
    return {
      id: focus.id,
      title: focus.title,
      stage: stageLabel(prog.stageId),
      deptName: deptLabel(dept),
      href: `/agent/cases/${focus.id}/depts/${deptSlug(dept.id)}`,
    }
  }, [cases, getProgress, stageLabel, deptLabel])

  return (
    <div
      className="flex min-h-0 flex-1 overflow-hidden"
      data-testid="agent-home-page"
      data-home="workbench"
    >
      <HomeProjectRail />

      <div className="flex min-w-0 flex-1 flex-col overflow-y-auto bg-white">
        <div className="mx-auto w-full max-w-3xl px-5 py-6 sm:px-6">
          <header className="mb-5">
            <p className="text-[11px] font-medium uppercase tracking-wider text-slate-500">
              知产工作台
            </p>
            <h1
              className="mt-1 text-[24px] font-semibold leading-tight tracking-tight text-slate-900 sm:text-[28px]"
              data-testid="home-title"
            >
              今天要办什么？
            </h1>
            <p className="mt-1.5 text-pretty text-[13px] leading-relaxed text-slate-600">
              开新案、从左侧继续已有案，或一键推进当前部门；下方可补充描述指令
            </p>
          </header>

          <div className="space-y-3">
            <section
              aria-label="主要入口"
              className="grid gap-2 sm:grid-cols-3"
              data-testid="home-primary-actions"
            >
              <Link
                to="/agent/cases/new"
                className="btn-press focus-ring flex flex-col gap-1 rounded-[var(--radius-md)] border border-slate-200 bg-white px-3 py-3 shadow-[var(--shadow-rest)] hover:border-slate-300"
                data-testid="home-action-new-case"
              >
                <span className="inline-flex items-center gap-1.5 text-[13px] font-semibold text-slate-900">
                  <Plus className="h-4 w-4 text-slate-700" strokeWidth={2.25} aria-hidden />
                  开新案子
                </span>
                <span className="text-[11px] leading-snug text-slate-500">
                  新建案 → 公司首页（交底部）
                </span>
              </Link>

              <Link
                to="/agent/cases"
                className="btn-press focus-ring flex flex-col gap-1 rounded-[var(--radius-md)] border border-slate-200 bg-white px-3 py-3 shadow-[var(--shadow-rest)] hover:border-slate-300"
                data-testid="home-action-continue"
              >
                <span className="inline-flex items-center gap-1.5 text-[13px] font-semibold text-slate-900">
                  <FolderOpen className="h-4 w-4 text-slate-700" strokeWidth={1.75} aria-hidden />
                  继续已有案子
                </span>
                <span className="text-[11px] leading-snug text-slate-500">
                  左侧案子轨，或进案子列表 → 公司首页
                </span>
              </Link>

              {advance ? (
                <Link
                  to={advance.href}
                  className="btn-press focus-ring flex flex-col gap-1 rounded-[var(--radius-md)] border border-slate-900 bg-slate-900 px-3 py-3 text-white shadow-[var(--shadow-rest)] hover:bg-slate-800"
                  data-testid="home-action-advance"
                >
                  <span className="inline-flex items-center gap-1.5 text-[13px] font-semibold">
                    <Briefcase className="h-4 w-4" strokeWidth={1.75} aria-hidden />
                    推进当前部门
                    <ArrowRight className="ml-auto h-3.5 w-3.5 opacity-80" aria-hidden />
                  </span>
                  <span className="truncate text-[11px] leading-snug text-white/75">
                    {advance.title} · {advance.deptName}
                  </span>
                </Link>
              ) : (
                <div
                  className="flex flex-col gap-1 rounded-[var(--radius-md)] border border-dashed border-slate-200 bg-slate-50/80 px-3 py-3"
                  data-testid="home-action-advance-empty"
                >
                  <span className="inline-flex items-center gap-1.5 text-[13px] font-semibold text-slate-500">
                    <Briefcase className="h-4 w-4" strokeWidth={1.75} aria-hidden />
                    推进当前部门
                  </span>
                  <span className="text-[11px] leading-snug text-slate-500">
                    暂无在办案 · 先开新案或从左侧选案
                  </span>
                </div>
              )}
            </section>

            <div>
              <p className="mb-1.5 text-[11px] font-medium uppercase tracking-wide text-slate-500">
                补充 · 描述指令
              </p>
              <HomeComposer initialAttachId={attachId} />
            </div>

            <HomeBriefing />
          </div>

          <footer className="mt-6 flex flex-wrap items-center gap-x-4 gap-y-1.5 border-t border-slate-100 pt-3 text-[11px] text-slate-500">
            <span>样机 · 无真 LLM · 关键库需确认后落盘</span>
          </footer>
        </div>
      </div>

      <HomeConversationRail />
    </div>
  )
}
