import { useMemo } from 'react'
import { Link } from 'react-router-dom'
import { ArrowRight, Building2, MessageCircle, Plus } from 'lucide-react'
import { HomeTodoStrip } from '../components/home/HomeTodoStrip'
import { useBusinessCases } from '../business/BusinessCaseContext'
import {
  ENTRY_ROLE_LABEL,
  pickLatestCaseId,
} from '../business/entryRole'
import { useEntryRole } from '../business/useEntryRole'
import { HALL_DEPT_DOORS, hallDeptHref } from '../business/hallDepts'

/**
 * 大厅 · /agent
 * 真源：01-接待与引导 + 交互大纲 —— Novada Team；待办 · 接待弱引导 · 八部可见 · 案卷条。
 * 禁医院分诊用语；禁把旧「项目专家」当首页。
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
  const latestId = pickLatestCaseId(
    cases,
    (id) => getProgress(id).updatedAt,
    getLogAt,
  )
  const latestCase = latestId
    ? cases.find((c) => c.id === latestId)
    : undefined

  return (
    <div
      className="flex-1 overflow-y-auto px-4 py-6 lg:px-8"
      data-testid="agent-home-page"
      data-home="hall"
      data-entry-role={entryRole}
    >
      <div className="mx-auto w-full max-w-4xl">
        <header className="mb-5" data-testid="home-hall-tagline">
          <p className="text-[11px] font-medium uppercase tracking-wider text-slate-400">
            Novada Team · 大厅
          </p>
          <h1 className="mt-1 text-pretty text-[22px] font-bold tracking-tight text-slate-900 sm:text-[24px]">
            专家向你汇报
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
            {latestCase ? (
              <>
                {' · '}
                当前案卷{' '}
                <Link
                  to={`/agent/cases/${latestCase.id}`}
                  className="font-semibold text-slate-900 underline-offset-2 hover:underline"
                  data-testid="home-case-strip"
                >
                  {latestCase.title}
                </Link>
              </>
            ) : (
              <span className="text-slate-500"> · 尚无案卷</span>
            )}
          </p>
        </header>

        <div className="mb-5" data-testid="home-pending-entry">
          <HomeTodoStrip />
        </div>

        {/* 接待 · 弱引导 */}
        <section
          className="mb-5 rounded-xl border border-slate-200 bg-white p-4 shadow-sm"
          data-testid="home-reception"
          aria-labelledby="home-reception-title"
        >
          <div className="flex flex-wrap items-start gap-3">
            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-slate-100 text-slate-600">
              <MessageCircle className="h-4 w-4" aria-hidden />
            </div>
            <div className="min-w-0 flex-1">
              <h2
                id="home-reception-title"
                className="text-[14px] font-semibold text-slate-900"
              >
                需要帮忙从这儿开始
              </h2>
              <p className="mt-0.5 text-[12px] leading-relaxed text-slate-600">
                接待帮你弄清去向、收材料；已清楚的可直达下面八部。不叫分诊。
              </p>
              <div className="mt-2.5 flex flex-wrap gap-2">
                <Link
                  to={
                    latestId
                      ? `/agent/cases/${latestId}/depts/disclosure`
                      : '/agent/cases/new'
                  }
                  className="btn-press focus-ring inline-flex items-center gap-1 rounded-md bg-slate-900 px-2.5 py-1.5 text-[11px] font-semibold text-white"
                  data-testid="home-reception-start"
                >
                  {latestId ? '去交底部开写' : '先开案子再接待'}
                  <ArrowRight className="h-3 w-3" aria-hidden />
                </Link>
                <Link
                  to={latestId ? `/agent/cases/${latestId}` : '/agent/cases/new'}
                  className="btn-press focus-ring inline-flex items-center gap-1 rounded-md border border-slate-200 bg-white px-2.5 py-1.5 text-[11px] font-medium text-slate-700"
                  data-testid="home-go-company"
                >
                  <Building2 className="h-3 w-3" aria-hidden />
                  {latestId ? '公司案首页' : '开案子'}
                </Link>
                {!latestId ? (
                  <Link
                    to="/agent/cases/new"
                    className="btn-press focus-ring inline-flex items-center gap-1 rounded-md border border-slate-200 bg-white px-2.5 py-1.5 text-[11px] font-medium text-slate-700"
                    data-testid="home-action-new-case"
                  >
                    <Plus className="h-3 w-3" aria-hidden />
                    开案子
                  </Link>
                ) : null}
              </div>
            </div>
          </div>
        </section>

        {/* 八部门 */}
        <section aria-labelledby="home-eight-depts-title" className="mb-5">
          <div className="mb-2 flex items-baseline gap-2">
            <h2
              id="home-eight-depts-title"
              className="text-[13px] font-semibold text-slate-900"
            >
              八个部门
            </h2>
            <span className="text-[11px] text-slate-500">
              看得见、点得开 · 薄部也进得去
            </span>
          </div>
          <ol
            className="grid grid-cols-2 gap-2 sm:grid-cols-4"
            data-testid="home-eight-depts"
          >
            {HALL_DEPT_DOORS.map((d) => (
              <li key={d.deptId}>
                <Link
                  to={hallDeptHref(latestId, d)}
                  className="btn-press focus-ring flex h-full flex-col rounded-xl border border-slate-200 bg-white p-3 shadow-sm hover:border-slate-300 hover:bg-slate-50"
                  data-testid={`home-dept-door-${d.slug}`}
                  data-thin={d.thin ? '1' : '0'}
                >
                  <span className="text-[11px] font-medium text-slate-400">
                    {d.num}
                    {d.thin ? ' · 薄' : ''}
                  </span>
                  <span className="mt-0.5 text-[13px] font-semibold text-slate-900">
                    {d.label}
                  </span>
                  <span className="mt-1 text-[11px] leading-snug text-slate-500">
                    {d.desc}
                  </span>
                </Link>
              </li>
            ))}
          </ol>
        </section>

        <nav
          className="flex flex-wrap items-center gap-x-3 gap-y-1 text-[12px] text-slate-500"
          aria-label="次要入口"
          data-testid="home-secondary-actions"
        >
          {isAgency ? (
            <Link
              to="/agent/cases"
              className="focus-ring rounded-sm font-medium text-slate-600 underline-offset-2 hover:text-slate-900 hover:underline"
              data-testid="home-action-primary"
            >
              案盘 / 多案流水
            </Link>
          ) : (
            <Link
              to="/agent/cases"
              className="focus-ring rounded-sm font-medium text-slate-600 underline-offset-2 hover:text-slate-900 hover:underline"
              data-testid="home-action-cases"
            >
              案盘
            </Link>
          )}
          <span aria-hidden className="text-slate-300">
            ·
          </span>
          <Link
            to="/agent/pending?audit=1"
            className="focus-ring rounded-sm font-medium text-slate-600 underline-offset-2 hover:text-slate-900 hover:underline"
            data-testid="home-action-pending"
          >
            待确认审计（薄）
          </Link>
          <span aria-hidden className="text-slate-300">
            ·
          </span>
          <Link
            to="/agent/departments"
            className="focus-ring rounded-sm font-medium text-slate-600 underline-offset-2 hover:text-slate-900 hover:underline"
            data-testid="home-action-departments"
          >
            专业 / 编制
          </Link>
        </nav>

        <footer className="mt-6 border-t border-slate-100 pt-3 text-[11px] text-slate-500">
          Novada Team 大厅 · 拍板在部门工作台右栏 · 样机本地会话
        </footer>
      </div>
    </div>
  )
}
