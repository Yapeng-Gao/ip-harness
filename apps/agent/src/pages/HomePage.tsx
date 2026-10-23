import { useMemo } from 'react'
import { Link } from 'react-router-dom'
import { ArrowRight, Briefcase } from 'lucide-react'
import { HomeTodoStrip } from '../components/home/HomeTodoStrip'
import { useBusinessCases } from '../business/BusinessCaseContext'
import {
  ENTRY_ROLE_LABEL,
  resolveRolePrimaryPath,
} from '../business/entryRole'
import { useEntryRole } from '../business/useEntryRole'

/**
 * 产品入口 · /agent（vision §3.3 B / product-pages §4.0a 薄入口）
 * 短定位 + 当前角色 + 角色主 CTA + 待确认；弱链可选。
 * 禁：七部/专家货架、宣传橱窗（属登录前 §4.0p / `/agent/welcome`）。
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
    ? '进入案盘'
    : enterpriseHasCase
      ? '进入本案公司'
      : '开案子'
  const primaryHint = isAgency
    ? '看各案卡在哪、谁待确认'
    : enterpriseHasCase
      ? '先看懂本案 IP 部，再去当前部门'
      : '立一条业务线，再进公司'

  return (
    <div
      className="flex-1 overflow-y-auto px-4 py-6 lg:px-8"
      data-testid="agent-home-page"
      data-home="thin-entry"
      data-entry-role={entryRole}
    >
      <div className="mx-auto w-full max-w-xl">
        <header className="mb-5" data-testid="home-thin-tagline">
          <p className="text-[11px] font-medium uppercase tracking-wider text-slate-400">
            产品首页
          </p>
          <h1 className="mt-1 text-pretty text-[22px] font-bold tracking-tight text-slate-900 sm:text-[24px]">
            外挂知识产权部
          </h1>
          <p
            className="mt-1.5 text-[13px] text-slate-600"
            data-testid="home-current-role"
            data-entry-role={entryRole}
          >
            当前角色：
            <span className="font-semibold text-slate-900">
              {ENTRY_ROLE_LABEL[entryRole]}
            </span>
          </p>
        </header>

        <section
          aria-label="主要入口"
          className="space-y-3"
          data-testid="home-primary-actions"
        >
          <Link
            to={primaryHref}
            className="btn-press focus-ring flex flex-col gap-1.5 rounded-[var(--radius-md)] border-2 border-slate-900 bg-slate-900 px-5 py-5 text-white shadow-[var(--shadow-rest)] hover:bg-slate-800"
            data-testid="home-action-primary"
            data-primary-role={entryRole}
          >
            <span className="inline-flex items-center gap-2 text-[17px] font-bold tracking-tight">
              <Briefcase className="h-5 w-5" strokeWidth={1.75} aria-hidden />
              {primaryLabel}
              <ArrowRight className="ml-auto h-4 w-4 opacity-80" aria-hidden />
            </span>
            <span className="text-[13px] leading-snug text-white/80">
              {primaryHint}
            </span>
          </Link>
        </section>

        <div className="mt-4" data-testid="home-pending-entry">
          <HomeTodoStrip />
        </div>

        <nav
          className="mt-5 flex flex-wrap items-center gap-x-3 gap-y-1 text-[12px] text-slate-500"
          aria-label="次要入口"
          data-testid="home-secondary-actions"
        >
          <Link
            to="/agent/cases"
            className="focus-ring rounded-[var(--radius-sm)] font-medium text-slate-600 underline-offset-2 hover:text-slate-900 hover:underline"
            data-testid="home-action-cases"
          >
            多案流水
          </Link>
          <span aria-hidden className="text-slate-300">
            ·
          </span>
          <Link
            to="/agent/cases/new"
            className="focus-ring rounded-[var(--radius-sm)] font-medium text-slate-600 underline-offset-2 hover:text-slate-900 hover:underline"
            data-testid="home-action-new-case"
          >
            开案子
          </Link>
          <span aria-hidden className="text-slate-300">
            ·
          </span>
          <Link
            to="/agent/pending"
            className="focus-ring rounded-[var(--radius-sm)] font-medium text-slate-600 underline-offset-2 hover:text-slate-900 hover:underline"
            data-testid="home-action-pending"
          >
            全部待确认
          </Link>
        </nav>

        <footer className="mt-6 border-t border-slate-100 pt-3 text-[11px] text-slate-500">
          样机 · 本地会话 · 顶栏可切换入口角色 / 退出
        </footer>
      </div>
    </div>
  )
}
