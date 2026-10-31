import { useMemo, useState } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import { ArrowRight, Building2, ChevronDown, ChevronRight, MessageCircle } from 'lucide-react'
import { HomeBossTodoBoard } from '../components/home/HomeBossTodoBoard'
import { HomeComposer } from '../components/home/HomeComposer'
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
 * 助手档着陆 · /agent
 * 真源：vision §3.1d —— 委托 + 进行中/待接力为主；进公司/开案仅弱链；八部大门次级可折（不抢项目盯案叙事）。
 * BossTodo = 轻量轨；禁医院分诊；禁待办拆成多张卡片墙；禁把顶栏助手叫「首页」。
 */
export function HomePage() {
  const [params] = useSearchParams()
  const branchQ = params.get('branch')
  const attachQ = params.get('attach')
  const { entryRole } = useEntryRole()
  const { cases, getProgress, getProcessLogs } = useBusinessCases()
  const [eightOpen, setEightOpen] = useState(false)

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
      data-home="assistant"
      data-entry-role={entryRole}
      data-hall-dedupe="boss-todo-v1"
      data-assistant-density="delegate-v1"
    >
      <div className="mx-auto w-full max-w-4xl">
        <header className="mb-4" data-testid="home-hall-tagline">
          <p className="text-[11px] font-medium uppercase tracking-wider text-slate-400">
            Novada Team · 助手
          </p>
          <h1 className="mt-1 text-pretty text-[22px] font-bold tracking-tight text-slate-900 sm:text-[24px]">
            把事交代出去
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
                弱链案卷{' '}
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

        {/* P0 · 委托主区 */}
        <section
          className="mb-5"
          aria-labelledby="home-delegate-title"
          data-testid="home-delegate-zone"
        >
          <div className="mb-2 flex flex-wrap items-baseline gap-x-2 gap-y-0.5">
            <h2
              id="home-delegate-title"
              className="text-[13px] font-semibold text-slate-900"
            >
              持续委托
            </h2>
            <span className="text-[11px] text-slate-500">
              说目标 → 开办 · 不只聊天框
            </span>
          </div>
          <HomeComposer initialAttachId={attachQ} />
          <p className="mt-2 text-[11px] text-slate-500" data-testid="home-delegate-hint">
            盯整案进度请切顶栏「项目」；选部开工请切「专业」。本档专管交代与接力。
          </p>
        </section>

        {/* 轻量轨 · 待你拍 / 催办 / 进行中 */}
        <div data-rail="light" data-testid="home-boss-rail">
          <HomeBossTodoBoard latestId={latestId} />
        </div>

        {/* 接待 · 弱引导 · 非主叙事 */}
        <section
          className="mb-5 rounded-xl border border-dashed border-slate-200 bg-slate-50/60 p-3"
          data-testid="home-reception"
          aria-labelledby="home-reception-title"
        >
          <div className="flex flex-wrap items-start gap-3">
            <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-white text-slate-500">
              <MessageCircle className="h-3.5 w-3.5" aria-hidden />
            </div>
            <div className="min-w-0 flex-1">
              <h2
                id="home-reception-title"
                className="text-[13px] font-semibold text-slate-800"
              >
                需要帮忙从这儿开始
              </h2>
              <p className="mt-0.5 text-[11px] leading-relaxed text-slate-600">
                接待帮你弄清去向、收材料；已清楚的用上方委托，或弱链进项目盯案。不叫分诊。
              </p>
              <div className="mt-2 flex flex-wrap gap-2">
                <Link
                  to={
                    latestId
                      ? `/agent/cases/${latestId}/depts/disclosure`
                      : '/agent/cases/new'
                  }
                  className="btn-press focus-ring inline-flex items-center gap-1 rounded-md border border-slate-200 bg-white px-2.5 py-1.5 text-[11px] font-medium text-slate-700"
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

        {/* 目标入口 · 薄 pills */}
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

        {/* 八部大门 · 次级可折 · 不抢项目盯案 */}
        <section
          aria-labelledby="home-eight-depts-title"
          className="mb-5"
          data-testid="home-eight-depts-fold"
          data-folded={eightOpen ? '0' : '1'}
        >
          <button
            type="button"
            className="focus-ring mb-2 flex w-full items-center gap-1.5 rounded-md px-0.5 py-1 text-left"
            onClick={() => setEightOpen((o) => !o)}
            aria-expanded={eightOpen}
            data-testid="home-eight-depts-toggle"
          >
            {eightOpen ? (
              <ChevronDown className="h-3.5 w-3.5 text-slate-500" aria-hidden />
            ) : (
              <ChevronRight className="h-3.5 w-3.5 text-slate-500" aria-hidden />
            )}
            <h2
              id="home-eight-depts-title"
              className="text-[13px] font-semibold text-slate-800"
            >
              八个部门
            </h2>
            <span className="text-[11px] font-normal text-slate-500">
              次级 · 盯整案请用顶栏「项目」
            </span>
          </button>
          <ol
            className={`grid grid-cols-2 gap-2 sm:grid-cols-4 ${eightOpen ? '' : 'hidden'}`}
            data-testid="home-eight-depts"
            hidden={!eightOpen}
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
          {!eightOpen ? (
            <p className="pl-5 text-[11px] text-slate-500" data-testid="home-eight-depts-hint">
              已折起 · 点上方展开；日常盯案走「项目」公司地图。
            </p>
          ) : null}
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
              助手只开门；机制验收请进对应部门工作台。
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
          <span>Novada Team 助手 · 拍板在部门工作台右栏</span>
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
