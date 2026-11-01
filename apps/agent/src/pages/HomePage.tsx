import { useMemo, useState } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import { Building2, ChevronDown, ChevronRight } from 'lucide-react'
import { HomeBossTodoBoard } from '../components/home/HomeBossTodoBoard'
import { HomeComposer } from '../components/home/HomeComposer'
import { HomeRelayStrip } from '../components/home/HomeRelayStrip'
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
 * 大厅着陆 · /agent
 * 真源：一期节点 + 一期-产品逻辑 + 一期-产品理念 —— 公司门口第一眼。
 * 首屏：产品一句 + 案薄条 + 接待/交代 + 老板待办（摘要）+ 八部名牌；
 * 支路/辅助/演示旁白默认折，忌瀑布经营首页。
 */
export function HomePage() {
  const [params] = useSearchParams()
  const BRANCH_DEEP_LABEL: Record<string, string> = {
    b1: '直达交底部',
    b2: '自带交底进申请部',
    b3: '建议回交底',
    b4: '通知书进答复部',
    b5: '不申结案',
    b6: '答复超期',
    b7: '复盘只读',
    b8: '情报官（资产）',
  }
  const branchQ = params.get('branch')
  const attachQ = params.get('attach')
  const { entryRole } = useEntryRole()
  const { cases, getProgress, getProcessLogs } = useBusinessCases()
  const [moreOpen, setMoreOpen] = useState(false)
  const [relayRefresh, setRelayRefresh] = useState(0)

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
      className="flex-1 overflow-y-auto px-4 py-3 lg:px-8"
      data-hall-dense="1"
      data-hall-screen="one-pass-v90"
      data-testid="agent-home-page"
      data-home="assistant"
      data-entry-role={entryRole}
      data-hall-dedupe="boss-todo-v1"
      data-assistant-density="delegate-chain-v1"
    >
      <div className="mx-auto w-full max-w-4xl">
        {/* 1 · 顶：产品一句 + 当前案薄条 */}
        <header
          className="mb-2.5 flex flex-wrap items-end justify-between gap-x-3 gap-y-1"
          data-testid="home-hall-tagline"
        >
          <div className="min-w-0">
            <p className="text-[10px] font-medium uppercase tracking-wider text-slate-400">
              Novada Team · 大厅
            </p>
            <h1 className="mt-0.5 text-pretty text-[20px] font-bold tracking-tight text-slate-900 sm:text-[22px]">
              把事交代出去
            </h1>
          </div>
          <p
            className="max-w-full text-right text-[12px] text-slate-600"
            data-testid="home-current-role"
            data-entry-role={entryRole}
          >
            <span className="font-semibold text-slate-900">
              {ENTRY_ROLE_LABEL[entryRole]}
            </span>
            {latestCase ? (
              <>
                <span className="text-slate-400"> · </span>
                <Link
                  to={`/agent/cases/${latestCase.id}`}
                  className="font-semibold text-slate-900 underline-offset-2 hover:underline"
                  data-testid="home-case-strip"
                >
                  {latestCase.title}
                </Link>
                <Link
                  to={`/agent/cases/${latestCase.id}/depts/disclosure?docket=1`}
                  className="ml-1 text-[11px] font-medium text-slate-500 underline-offset-2 hover:text-slate-800 hover:underline"
                  data-testid="home-case-file-link"
                >
                  案卷
                </Link>
              </>
            ) : (
              <span className="text-slate-500"> · 尚无案卷</span>
            )}
          </p>
        </header>

        {/* 2 · 交代 / Composer（接待入口） */}
        <section
          className="mb-2.5"
          aria-labelledby="home-delegate-title"
          data-testid="home-delegate-zone"
          data-hall-block="composer"
        >
          <div className="mb-1 flex flex-wrap items-baseline gap-x-2 gap-y-0.5">
            <h2
              id="home-delegate-title"
              className="text-[12px] font-semibold text-slate-900"
            >
              说目标 · 交代出去
            </h2>
            <span className="text-[10px] text-slate-500">
              接待入口 · 计划可调再分发
            </span>
            {latestId ? (
              <Link
                to={`/agent/cases/${latestId}`}
                className="btn-press focus-ring ml-auto inline-flex items-center gap-1 rounded-md border border-slate-200 bg-white px-2 py-0.5 text-[10px] font-medium text-slate-700"
                data-testid="home-go-company"
              >
                <Building2 className="h-3 w-3" aria-hidden />
                公司案盯盘
              </Link>
            ) : (
              <Link
                to="/agent/cases/new"
                className="btn-press focus-ring ml-auto inline-flex items-center gap-1 rounded-md border border-slate-200 bg-white px-2 py-0.5 text-[10px] font-medium text-slate-700"
                data-testid="home-reception-start"
              >
                先开案子
              </Link>
            )}
          </div>
          <HomeComposer
            initialAttachId={attachQ}
            latestCaseId={latestId}
            onDispatched={() => setRelayRefresh((n) => n + 1)}
          />
          <HomeRelayStrip refreshKey={relayRefresh} compact />
        </section>

        {/* 3 · 老板待办 · 紧凑摘要 */}
        <div data-rail="light" data-testid="home-boss-rail" className="mb-2.5">
          <HomeBossTodoBoard latestId={latestId} compactDefault />
        </div>

        {/* 目标入口 · 薄 pills（与八部同屏） */}
        <section
          className="mb-2"
          aria-labelledby="home-goal-entries-title"
          data-testid="home-goal-entries"
          data-goal-density="pills"
        >
          <div className="mb-1 flex items-baseline gap-2">
            <h2
              id="home-goal-entries-title"
              className="text-[11px] font-semibold text-slate-700"
            >
              今天想办
            </h2>
            <span className="text-[10px] text-slate-400">直达对应部</span>
          </div>
          <ul className="flex flex-wrap gap-1.5">
            {goalPills.map((g) => (
              <li key={g.id}>
                <Link
                  to={g.href}
                  className="btn-press focus-ring inline-flex rounded-full border border-slate-200 bg-slate-50 px-2.5 py-0.5 text-[11px] font-medium text-slate-800 hover:border-slate-300 hover:bg-white"
                  data-testid={`home-goal-${g.id}`}
                >
                  {g.label}
                </Link>
              </li>
            ))}
          </ul>
        </section>

        {/* 4 · 八部门名牌 · dense · 常显 */}
        <section
          aria-labelledby="home-eight-depts-title"
          className="mb-2.5"
          data-testid="home-eight-depts-fold"
          data-folded="0"
          data-hall-block="eight-depts"
        >
          <div className="mb-1.5 flex flex-wrap items-baseline gap-x-2">
            <h2
              id="home-eight-depts-title"
              className="text-[12px] font-semibold text-slate-800"
            >
              八个部门
            </h2>
            <span className="text-[10px] font-normal text-slate-500">
              名牌可点 · 盯整案进公司案
            </span>
          </div>
          <ol
            className="grid grid-cols-4 gap-1.5 sm:grid-cols-8"
            data-testid="home-eight-depts"
            data-dept-density="nameplate"
          >
            {HALL_DEPT_DOORS.map((d) => (
              <li key={d.deptId}>
                <Link
                  to={hallDeptHref(latestId, d)}
                  className="btn-press focus-ring flex h-full flex-col items-start rounded-md border border-slate-200 bg-white px-1.5 py-1.5 shadow-sm hover:border-slate-300 hover:bg-slate-50"
                  data-testid={`home-dept-door-${d.slug}`}
                  data-thin={d.thin ? '1' : '0'}
                  title={d.desc}
                >
                  <span className="text-[9px] font-medium text-slate-400">
                    {d.num}
                    {d.thin ? '·薄' : ''}
                  </span>
                  <span className="mt-0.5 text-[11px] font-semibold leading-tight text-slate-900">
                    {d.label}
                  </span>
                </Link>
              </li>
            ))}
          </ol>
          {/* 兼容旧 smoke：保留可点的折叠控件但默认开、列表始终挂 DOM */}
          <button
            type="button"
            className="sr-only"
            aria-expanded={true}
            data-testid="home-eight-depts-toggle"
            tabIndex={-1}
          >
            八个部门
          </button>
        </section>

        {/* 支路门 · 整区默认折 · 不抢首屏 */}
        <BranchDoors caseId={latestId} isAgency={isAgency} />

        {/* 5 · 次级：代理 / 案盘 / 教 · 默认折 */}
        <div
          className="mb-1 mt-1"
          data-testid="home-secondary-fold"
          data-folded={moreOpen ? '0' : '1'}
        >
          <button
            type="button"
            className="focus-ring mb-1 flex w-full items-center gap-1.5 rounded-md px-0.5 py-1 text-left"
            onClick={() => setMoreOpen((o) => !o)}
            aria-expanded={moreOpen}
            data-testid="home-secondary-toggle"
          >
            {moreOpen ? (
              <ChevronDown className="h-3.5 w-3.5 text-slate-500" aria-hidden />
            ) : (
              <ChevronRight className="h-3.5 w-3.5 text-slate-500" aria-hidden />
            )}
            <span className="text-[11px] font-semibold text-slate-700">
              次要入口
            </span>
            <span className="text-[10px] text-slate-400">案盘 · 编制 · 演示旁白</span>
          </button>

          {moreOpen ? (
            <div className="space-y-2.5 pl-1" data-testid="home-secondary-body">
              {branchQ ? (
                <div
                  className="rounded-lg border border-amber-300 bg-amber-50 px-3 py-2"
                  data-testid="home-branch-deep"
                  data-branch={branchQ}
                >
                  <p className="text-[12px] font-semibold text-amber-950">
                    支路验收 · {BRANCH_DEEP_LABEL[branchQ] ?? '虚线入口'}
                  </p>
                  <p className="mt-0.5 text-[11px] text-amber-900/90">
                    大厅只开门；请进对应部门工作台看机制（样机示意）。
                  </p>
                </div>
              ) : null}

              {isAgency && latestId ? (
                <div
                  className="rounded-lg border border-violet-200 bg-violet-50/70 px-3 py-2"
                  data-testid="home-agency-escort"
                >
                  <p className="text-[12px] font-semibold text-violet-950">
                    代理陪同进申请部
                  </p>
                  <p className="mt-0.5 text-[11px] text-violet-900/90">
                    可陪同进申请部壳做诊断（示意）；不装交底已过线。
                  </p>
                  <Link
                    to={`/agent/cases/${latestId}/depts/draft?escort=1&branch=b2`}
                    className="btn-press focus-ring mt-1.5 inline-flex rounded-full bg-violet-900 px-3 py-1 text-[11px] font-semibold text-white"
                    data-testid="home-agency-escort-cta"
                  >
                    陪同进申请部
                  </Link>
                </div>
              ) : null}

              <nav
                className="flex flex-wrap items-center gap-x-3 gap-y-1 text-[11px] text-slate-500"
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
                  编制名册
                </Link>
                <span aria-hidden className="text-slate-300">
                  ·
                </span>
                <button
                  type="button"
                  className="btn-press focus-ring rounded-md border border-slate-200 bg-white px-2 py-0.5 text-[10px] font-medium text-slate-600"
                  data-testid="home-reopen-teach"
                  onClick={() => {
                    reopenAllTeachTips()
                    window.alert('已重开各部门首次说明（进部可见）')
                  }}
                >
                  重开部门说明
                </button>
              </nav>
            </div>
          ) : (
            <p
              className="pl-5 text-[10px] text-slate-400"
              data-testid="home-secondary-folded-hint"
            >
              案盘、编制名册与演示旁白在此；首屏只留交代 · 待办 · 八部。
            </p>
          )}
        </div>

        <footer className="mt-3 border-t border-slate-100 pt-2 text-[10px] text-slate-400">
          Novada Team 大厅 · 拍板在部门工作台右栏
        </footer>
      </div>
    </div>
  )
}
