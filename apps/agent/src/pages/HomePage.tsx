import { useMemo } from 'react'
import { Link } from 'react-router-dom'
import { ArrowRight, Briefcase, Building2, Plus } from 'lucide-react'
import { HomeTodoStrip } from '../components/home/HomeTodoStrip'
import { useBusinessCases } from '../business/BusinessCaseContext'
import {
  ENTRY_ROLE_LABEL,
  pickLatestCaseId,
} from '../business/entryRole'
import { useEntryRole } from '../business/useEntryRole'

/**
 * 产品入口 · /agent（§4.0a 薄入口 · spec 2026-10-23-welcome-thin-home-dual-role）
 * 真双角色：一屏一个主 CTA + 待确认 + 另一角色弱文字链。
 * 禁止：三卡平铺、七部墙 / 货架 / 场景 / 橱窗（属 `/agent/welcome`）。
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

  const isAgency = entryRole === 'agency'
  const enterpriseHasCase = !isAgency && cases.length > 0
  const latestId = pickLatestCaseId(
    cases,
    (id) => getProgress(id).updatedAt,
    getLogAt,
  )
  const latestCase = latestId
    ? cases.find((c) => c.id === latestId)
    : undefined

  const primary = isAgency
    ? {
        href: '/agent/cases',
        label: '进入案盘',
        sub: '多案流水 · 卡住哪、待确认、期限',
        Icon: Briefcase,
      }
    : enterpriseHasCase
      ? {
          href: latestId
            ? `/agent/cases/${latestId}`
            : '/agent/cases/new',
          label: '进入本公司',
          sub: latestCase?.title
            ? `当前案 · ${latestCase.title}`
            : '去本案公司首页',
          Icon: Building2,
        }
      : {
          href: '/agent/cases/new',
          label: '开案子',
          sub: '极少字段 → 公司首页',
          Icon: Plus,
        }

  const PrimaryIcon = primary.Icon

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
          </p>
        </header>

        {/* 唯一主 CTA · 禁止 sm:grid-cols-3 三卡平铺 */}
        <section
          aria-label="主要入口"
          className="block"
          data-testid="home-primary-actions"
        >
          <Link
            to={primary.href}
            className="btn-press focus-ring flex w-full flex-col gap-1.5 rounded-[var(--radius-md)] border-2 border-slate-900 bg-slate-900 px-5 py-5 text-white shadow-[var(--shadow-rest)] hover:bg-slate-800"
            data-testid="home-action-primary"
            data-primary-role={entryRole}
            data-primary="1"
          >
            <span className="text-[11px] font-medium text-slate-300">
              {isAgency
                ? '主入口 · 代理'
                : enterpriseHasCase
                  ? '主入口 · 企业 · 有案'
                  : '主入口 · 企业 · 无案'}
            </span>
            <span className="inline-flex items-center gap-2 text-[20px] font-bold tracking-tight sm:text-[22px]">
              <PrimaryIcon
                className="h-5 w-5 shrink-0"
                strokeWidth={1.75}
                aria-hidden
              />
              {primary.label}
              <ArrowRight
                className="ml-auto h-4 w-4 opacity-80"
                aria-hidden
              />
            </span>
            <span className="text-[13px] leading-snug text-white/75">
              {primary.sub}
            </span>
          </Link>
        </section>

        <div className="mt-5" data-testid="home-pending-entry">
          <HomeTodoStrip />
        </div>

        <nav
          className="mt-5 flex flex-wrap items-center gap-x-3 gap-y-1 text-[12px] text-slate-500"
          aria-label="次要入口"
          data-testid="home-secondary-actions"
        >
          {isAgency ? (
            <>
              <Link
                to={
                  latestId
                    ? `/agent/cases/${latestId}`
                    : '/agent/cases/new'
                }
                className="focus-ring rounded-[var(--radius-sm)] font-medium text-slate-600 underline-offset-2 hover:text-slate-900 hover:underline"
                data-testid="home-action-company-card"
              >
                {latestId ? '最近公司首页' : '公司首页'}
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
            </>
          ) : (
            <>
              <Link
                to="/agent/cases"
                className="focus-ring rounded-[var(--radius-sm)] font-medium text-slate-600 underline-offset-2 hover:text-slate-900 hover:underline"
                data-testid="home-action-cases"
              >
                案盘 / 多案流水
              </Link>
              {enterpriseHasCase ? (
                <>
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
                </>
              ) : null}
            </>
          )}
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
