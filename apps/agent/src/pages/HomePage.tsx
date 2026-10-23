import { useMemo } from 'react'
import { Link } from 'react-router-dom'
import { ArrowRight, Briefcase, FolderOpen, Plus } from 'lucide-react'
import { HomeTodoStrip } from '../components/home/HomeTodoStrip'
import { useBusinessCases } from '../business/BusinessCaseContext'
import {
  ENTRY_ROLE_LABEL,
  resolveRolePrimaryPath,
} from '../business/entryRole'
import { useEntryRole } from '../business/useEntryRole'

/**
 * 产品首页 · /agent（§4.0a 薄总览）
 * 定位句 + 当前角色 + 待确认 + 按角色主 CTA + 次要链
 * 不替代公司首页 / 多案流水；无部门地图作业区
 */
export function HomePage() {
  const { entryRole } = useEntryRole()
  const { cases, getProgress, getProcessLogs } = useBusinessCases()

  const getLogAt = useMemo(
    () => (id: string) => {
      const logs = getProcessLogs(id)
      if (logs.length === 0) return undefined
      return logs.reduce((max, l) => (l.at > max ? l.at : max), logs[0]!.at)
    },
    [getProcessLogs],
  )

  const primaryHref = useMemo(
    () =>
      resolveRolePrimaryPath(
        entryRole,
        cases,
        (id) => getProgress(id).updatedAt,
        getLogAt,
      ),
    [entryRole, cases, getProgress, getLogAt],
  )

  const isAgency = entryRole === 'agency'
  const enterpriseHasCase = !isAgency && cases.length > 0

  const primaryLabel = isAgency
    ? '进多案流水'
    : enterpriseHasCase
      ? '进公司首页'
      : '开案子'
  const primaryHint = isAgency
    ? '案盘 · 看卡住哪、谁在等确认'
    : enterpriseHasCase
      ? '最近案子 · 先看懂部门与专家，再干活'
      : '还没有案子 · 先立一条业务线'

  return (
    <div
      className="flex-1 overflow-y-auto px-4 py-6 lg:px-8"
      data-testid="agent-home-page"
      data-home="overview"
      data-entry-role={entryRole}
    >
      <div className="mx-auto w-full max-w-3xl">
        <header className="mb-5">
          <div className="flex flex-wrap items-center gap-x-2 gap-y-1">
            <p
              className="text-[11px] font-medium uppercase tracking-wider text-slate-500"
              data-testid="home-eyebrow"
            >
              外挂 IP 部
            </p>
            <span
              className="rounded-full border border-slate-200 bg-slate-50 px-2 py-0.5 text-[11px] font-medium text-slate-600"
              data-testid="home-role-badge"
            >
              当前入口 · {ENTRY_ROLE_LABEL[entryRole]}
            </span>
          </div>
          <h1
            className="mt-1 text-[24px] font-semibold leading-tight tracking-tight text-slate-900 sm:text-[28px]"
            data-testid="home-title"
          >
            产品首页
          </h1>
          <p
            className="mt-1.5 text-pretty text-[13px] leading-relaxed text-slate-600"
            data-testid="home-tagline"
          >
            把知产工作当成外挂 IP 部来跑。本页只做总览与分流；部门地图与「去当前部门」在案级公司首页，不在此页抢戏。
          </p>
        </header>

        <div className="mb-4" data-testid="home-pending-entry">
          <HomeTodoStrip />
        </div>

        <section aria-label="主要入口" className="space-y-3" data-testid="home-primary-actions">
          <Link
            to={primaryHref}
            className="btn-press focus-ring flex flex-col gap-1 rounded-[var(--radius-md)] border border-slate-900 bg-slate-900 px-4 py-3.5 text-white shadow-[var(--shadow-rest)] hover:bg-slate-800"
            data-testid="home-action-primary"
            data-primary-role={entryRole}
          >
            <span className="inline-flex items-center gap-1.5 text-[14px] font-semibold">
              <Briefcase className="h-4 w-4" strokeWidth={1.75} aria-hidden />
              {primaryLabel}
              <ArrowRight className="ml-auto h-3.5 w-3.5 opacity-80" aria-hidden />
            </span>
            <span className="text-[11px] leading-snug text-white/75">{primaryHint}</span>
          </Link>

          <div
            className="grid gap-2 sm:grid-cols-2"
            data-testid="home-secondary-actions"
          >
            <Link
              to="/agent/cases"
              className="btn-press focus-ring flex flex-col gap-1 rounded-[var(--radius-md)] border border-slate-200 bg-white px-3 py-3 shadow-[var(--shadow-rest)] hover:border-slate-300"
              data-testid="home-action-cases"
            >
              <span className="inline-flex items-center gap-1.5 text-[13px] font-semibold text-slate-900">
                <FolderOpen className="h-4 w-4 text-slate-700" strokeWidth={1.75} aria-hidden />
                多案流水
              </span>
              <span className="text-[11px] leading-snug text-slate-500">
                {isAgency ? '案盘主列表' : '全部案子（次入口）'}
              </span>
            </Link>

            <Link
              to="/agent/cases/new"
              className="btn-press focus-ring flex flex-col gap-1 rounded-[var(--radius-md)] border border-slate-200 bg-white px-3 py-3 shadow-[var(--shadow-rest)] hover:border-slate-300"
              data-testid="home-action-new-case"
            >
              <span className="inline-flex items-center gap-1.5 text-[13px] font-semibold text-slate-900">
                <Plus className="h-4 w-4 text-slate-700" strokeWidth={2.25} aria-hidden />
                开案子
              </span>
              <span className="text-[11px] leading-snug text-slate-500">
                新建案 → 公司首页
              </span>
            </Link>
          </div>
        </section>

        <footer className="mt-6 flex flex-wrap items-center gap-x-4 gap-y-1.5 border-t border-slate-100 pt-3 text-[11px] text-slate-500">
          <span>样机 · 本地会话 · 确认后落盘</span>
          <Link
            to="/agent/login"
            className="hover:text-slate-700 hover:underline"
            data-testid="home-role-reselect"
          >
            切换角色（回登录）
          </Link>
        </footer>
      </div>
    </div>
  )
}
