import { useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { ArrowRight, Briefcase, ChevronDown, FolderOpen, Plus } from 'lucide-react'
import { HomeContentPreview } from '../components/home/HomeContentPreview'
import { HomeTodoStrip } from '../components/home/HomeTodoStrip'
import { useBusinessCases } from '../business/BusinessCaseContext'
import { resolveRolePrimaryPath } from '../business/entryRole'
import { useEntryRole } from '../business/useEntryRole'
import {
  dismissHomeIntro,
  isHomeIntroDismissed,
} from '../business/homeIntroDismiss'

/**
 * 产品首页 · /agent（§4.0a 混合首屏 · 内容块 A–G）
 * 教育块 E→C→D→A+B（可「已了解」收起；回访默认收起）→ 常显 F 主 CTA → G 真待确认
 */
export function HomePage() {
  const { entryRole } = useEntryRole()
  const { cases, getProgress, getProcessLogs } = useBusinessCases()

  const [introExpanded, setIntroExpanded] = useState(() => !isHomeIntroDismissed())

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

  const handleDismissIntro = () => {
    dismissHomeIntro()
    setIntroExpanded(false)
  }

  const handleExpandIntro = () => {
    setIntroExpanded(true)
  }

  return (
    <div
      className="flex-1 overflow-y-auto px-4 py-6 lg:px-8"
      data-testid="agent-home-page"
      data-home="overview"
      data-entry-role={entryRole}
      data-intro-expanded={introExpanded ? '1' : '0'}
    >
      <div className="mx-auto w-full max-w-3xl">
        {introExpanded ? (
          <HomeContentPreview onDismiss={handleDismissIntro} />
        ) : (
          <div className="mb-3 flex justify-end" data-testid="home-intro-collapsed">
            <button
              type="button"
              className="btn-press focus-ring inline-flex items-center gap-1 rounded-[var(--radius-sm)] px-2 py-1 text-[11px] font-medium text-slate-500 hover:text-slate-800"
              onClick={handleExpandIntro}
              data-testid="home-intro-expand"
            >
              看主链与交卷示意
              <ChevronDown className="h-3 w-3" aria-hidden />
            </button>
          </div>
        )}

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

        <div className="mt-4" data-testid="home-pending-entry">
          <HomeTodoStrip />
        </div>

        <footer className="mt-6 border-t border-slate-100 pt-3 text-[11px] text-slate-500">
          样机 · 本地会话 · 顶栏可切换入口角色 / 退出
        </footer>
      </div>
    </div>
  )
}
