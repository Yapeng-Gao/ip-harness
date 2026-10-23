import { useMemo } from 'react'
import { Link } from 'react-router-dom'
import { ArrowRight, Briefcase, Building2, Plus } from 'lucide-react'
import { HomeTodoStrip } from '../components/home/HomeTodoStrip'
import { useBusinessCases } from '../business/BusinessCaseContext'
import {
  ENTRY_ROLE_LABEL,
  pickLatestCaseId,
  resolveRolePrimaryPath,
} from '../business/entryRole'
import { useEntryRole } from '../business/useEntryRole'

/**
 * 产品入口 · /agent（product-pages §4.0a 薄入口）
 * 对齐原型 thin-home：三入口（代理案盘 / 企业公司 / 开案子）+ 待确认。
 * 禁：七部/专家货架、宣传橱窗（属 `/agent/welcome`）。
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
  const latestId = pickLatestCaseId(
    cases,
    (id) => getProgress(id).updatedAt,
    getLogAt,
  )
  const companyHref = latestId
    ? `/agent/cases/${latestId}`
    : '/agent/cases/new'

  const primaryKey = isAgency
    ? 'cases'
    : enterpriseHasCase
      ? 'company'
      : 'new'

  const entries: {
    key: 'cases' | 'company' | 'new'
    href: string
    k: string
    t: string
    d: string
    testid: string
  }[] = [
    {
      key: 'cases',
      href: '/agent/cases',
      k: isAgency ? '主入口 · 代理' : '次入口 · 案盘',
      t: '多案流水',
      d: '案盘 · 卡住哪、待确认、期限红点',
      testid: 'home-action-cases-card',
    },
    {
      key: 'company',
      href: companyHref,
      k: enterpriseHasCase ? '企业 · 有案' : '企业 · 当前',
      t: enterpriseHasCase ? '当前案子' : '公司首页',
      d: enterpriseHasCase ? '去本案公司首页' : '无案时请先开案子',
      testid: 'home-action-company-card',
    },
    {
      key: 'new',
      href: '/agent/cases/new',
      k: '企业 · 无案 / 新开',
      t: '开案子',
      d: '极少字段 → 公司首页',
      testid: 'home-action-new-card',
    },
  ]

  return (
    <div
      className="flex-1 overflow-y-auto px-4 py-6 lg:px-8"
      data-testid="agent-home-page"
      data-home="thin-entry"
      data-entry-role={entryRole}
    >
      <div className="mx-auto w-full max-w-3xl">
        <header className="mb-5" data-testid="home-thin-tagline">
          <p className="text-[11px] font-medium uppercase tracking-wider text-slate-400">
            已登录 · 按角色分流
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
            <span className="text-slate-400">
              {' '}
              · 代理进案盘；企业有案进公司、无案开案子
            </span>
          </p>
        </header>

        <section
          aria-label="主要入口"
          className="grid gap-3 sm:grid-cols-3"
          data-testid="home-primary-actions"
        >
          {entries.map((e) => {
            const primary = e.key === primaryKey
            const Icon =
              e.key === 'cases'
                ? Briefcase
                : e.key === 'company'
                  ? Building2
                  : Plus
            return (
              <Link
                key={e.key}
                to={e.href}
                className={`btn-press focus-ring flex flex-col gap-1.5 rounded-[var(--radius-md)] border px-4 py-4 shadow-[var(--shadow-rest)] ${
                  primary
                    ? 'border-slate-900 bg-slate-900 text-white hover:bg-slate-800'
                    : 'border-slate-200 bg-white text-slate-900 hover:border-slate-300'
                }`}
                data-testid={e.testid}
                data-primary={primary ? '1' : '0'}
              >
                <span
                  className={`text-[11px] font-medium ${
                    primary ? 'text-slate-300' : 'text-slate-500'
                  }`}
                >
                  {e.k}
                </span>
                <span className="inline-flex items-center gap-1.5 text-[16px] font-bold tracking-tight">
                  <Icon
                    className="h-4 w-4 shrink-0"
                    strokeWidth={1.75}
                    aria-hidden
                  />
                  {e.t}
                  {primary ? (
                    <ArrowRight
                      className="ml-auto h-3.5 w-3.5 opacity-80"
                      aria-hidden
                    />
                  ) : null}
                </span>
                <span
                  className={`text-[12px] leading-snug ${
                    primary ? 'text-white/75' : 'text-slate-500'
                  }`}
                >
                  {e.d}
                </span>
              </Link>
            )
          })}
        </section>

        {/* 兼容旧自测：主 CTA 选择器 */}
        <Link
          to={primaryHref}
          className="sr-only"
          data-testid="home-action-primary"
          data-primary-role={entryRole}
        >
          主入口
        </Link>

        <div className="mt-5" data-testid="home-pending-entry">
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
          本页无七部墙 / 专家橱窗。宣传见登录前欢迎页。样机 · 本地会话。
        </footer>
      </div>
    </div>
  )
}
