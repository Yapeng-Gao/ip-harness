import { useMemo } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import { ArrowRight, Building2, MessageCircle } from 'lucide-react'
import { HomeBossTodoBoard } from '../components/home/HomeBossTodoBoard'
import { useBusinessCases } from '../business/BusinessCaseContext'
import {
  ENTRY_ROLE_LABEL,
  pickLatestCaseId,
} from '../business/entryRole'
import { useEntryRole } from '../business/useEntryRole'
import { HALL_DEPT_DOORS, hallDeptHref } from '../business/hallDepts'
import { BranchDoors } from '../components/business/BranchDoors'
import { reopenAllTeachTips } from '../business/teachingFade'

/**
 * 大厅 · /agent
 * 真源：01-接待与引导 + 交互大纲 §2–3 —— 老板待办(A/B/C) · 接待 · 目标入口(薄) · 八部 · 案卷条。
 * 禁医院分诊；禁目标入口与八部两套主导航打架；禁待办拆成多张卡片墙。
 */
export function HomePage() {
  const [params] = useSearchParams()
  const branchQ = params.get('branch')
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

  const goalPills = [
    {
      id: 'disclosure',
      label: '写交底',
      href: latestId
        ? `/agent/cases/${latestId}/depts/disclosure`
        : '/agent/cases/new',
    },
    {
      id: 'draft',
      label: '递申请',
      href: latestId
        ? `/agent/cases/${latestId}/depts/draft`
        : '/agent/cases/new',
    },
    {
      id: 'oa',
      label: '答审查意见',
      href: latestId
        ? `/agent/cases/${latestId}/depts/oa`
        : '/agent/cases/new',
    },
  ]

  return (
    <div
      className="flex-1 overflow-y-auto px-4 py-6 lg:px-8"
      data-testid="agent-home-page"
      data-home="hall"
      data-entry-role={entryRole}
      data-hall-dedupe="boss-todo-v1"
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
                <Link
                  to={`/agent/cases/${latestCase.id}/depts/disclosure?docket=1`}
                  className="ml-1 text-[12px] font-medium text-slate-500 underline-offset-2 hover:text-slate-800 hover:underline"
                  data-testid="home-case-file-link"
                >
                  · 打开案卷
                </Link>
              </>
            ) : (
              <span className="text-slate-500"> · 尚无案卷</span>
            )}
          </p>
        </header>

        {/* 老板待办 A/B/C · 交互大纲 §2.2 单区 */}
        <HomeBossTodoBoard latestId={latestId} />

        {/* 接待 · 弱引导 · 非唯一闸门 */}
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
                {latestId ? (
                  <Link
                    to={`/agent/cases/${latestId}`}
                    className="btn-press focus-ring inline-flex items-center gap-1 rounded-md border border-slate-200 bg-white px-2.5 py-1.5 text-[11px] font-medium text-slate-700"
                    data-testid="home-go-company"
                  >
                    <Building2 className="h-3 w-3" aria-hidden />
                    公司案首页
                  </Link>
                ) : null}
              </div>
            </div>
          </div>
        </section>

        {/* 目标入口 · 薄 pills · 落到①～⑧ · 不与八部抢主导航 */}
        <section
          className="mb-4"
          aria-labelledby="home-goal-entries-title"
          data-testid="home-goal-entries"
          data-goal-density="pills"
        >
          <div className="mb-1.5 flex items-baseline gap-2">
            <h2
              id="home-goal-entries-title"
              className="text-[12px] font-semibold text-slate-700"
            >
              今天想办
            </h2>
            <span className="text-[11px] text-slate-400">
              薄入口 · 仍进对应部（非第二套导航）
            </span>
          </div>
          <ul className="flex flex-wrap gap-1.5">
            {goalPills.map((g) => (
              <li key={g.id}>
                <Link
                  to={g.href}
                  className="btn-press focus-ring inline-flex rounded-full border border-slate-200 bg-slate-50 px-3 py-1 text-[12px] font-medium text-slate-800 hover:border-slate-300 hover:bg-white"
                  data-testid={`home-goal-${g.id}`}
                >
                  {g.label}
                </Link>
              </li>
            ))}
          </ul>
        </section>

        {/* 八部门 · 主导航大门 */}
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

        <BranchDoors caseId={latestId} isAgency={isAgency} />

        {branchQ ? (
          <div
            className="mb-5 rounded-xl border border-amber-300 bg-amber-50 px-4 py-3"
            data-testid="home-branch-deep"
            data-branch={branchQ}
          >
            <p className="text-[13px] font-semibold text-amber-950">
              支路深链 · {branchQ.toUpperCase()}
            </p>
            <p className="mt-0.5 text-[12px] text-amber-900/90">
              大厅只开门；机制验收请进对应部门工作台。
            </p>
          </div>
        ) : null}

        {isAgency && latestId ? (
          <div
            className="mb-5 rounded-xl border border-violet-200 bg-violet-50/70 px-4 py-3"
            data-testid="home-agency-escort"
          >
            <p className="text-[13px] font-semibold text-violet-950">代理陪同⑤</p>
            <p className="mt-0.5 text-[12px] text-violet-900/90">
              可绕 B2 进申请部壳诊断/陪同；不装交底已过线。
            </p>
            <Link
              to={`/agent/cases/${latestId}/depts/draft?escort=1&branch=b2`}
              className="btn-press focus-ring mt-2 inline-flex rounded-full bg-violet-900 px-3 py-1.5 text-[11px] font-semibold text-white"
              data-testid="home-agency-escort-cta"
            >
              陪同进⑤
            </Link>
          </div>
        ) : null}

        <nav
          className="flex flex-wrap items-center gap-x-3 gap-y-1 text-[12px] text-slate-500"
          aria-label="次要入口"
          data-testid="home-secondary-actions"
        >
          <Link
            to="/agent/cases"
            className="focus-ring rounded-sm font-medium text-slate-600 underline-offset-2 hover:text-slate-900 hover:underline"
            data-testid={isAgency ? 'home-action-primary' : 'home-action-cases'}
          >
            {isAgency ? '案盘 / 多案流水' : '案盘'}
          </Link>
          <span aria-hidden className="text-slate-300">
            ·
          </span>
          <Link
            to={
              latestId
                ? `/agent/cases/${latestId}/professional`
                : '/agent/cases/new'
            }
            className="focus-ring rounded-sm font-medium text-slate-600 underline-offset-2 hover:text-slate-900 hover:underline"
            data-testid="home-action-departments"
          >
            专业 / 编制
          </Link>
        </nav>

        <footer className="mt-6 flex flex-wrap items-center justify-between gap-2 border-t border-slate-100 pt-3 text-[11px] text-slate-500">
          <span>Novada Team 大厅 · 拍板在部门工作台右栏</span>
          <button
            type="button"
            className="btn-press focus-ring rounded-md border border-slate-200 bg-white px-2 py-1 text-[10px] font-medium text-slate-600"
            data-testid="home-reopen-teach"
            onClick={() => {
              reopenAllTeachTips()
              window.alert('已重开各部门首次说明（进部可见）')
            }}
          >
            重开部门说明（T7）
          </button>
        </footer>
      </div>
    </div>
  )
}
