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
import { BranchDoors } from '../components/business/BranchDoors'

/**
 * 大厅 · /agent
 * 真源：01-接待与引导 + 交互大纲 —— Novada Team；待办 · 接待弱引导 · 八部可见 · 案卷条。
 * 禁医院分诊用语；禁把旧「项目专家」当首页。
 */
export function HomePage() {
  const { entryRole } = useEntryRole()
  const { cases, getProgress, getProcessLogs, getPendingConfirms } = useBusinessCases()

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
                <Link
                  to={`/agent/cases/${latestCase.id}/depts/disclosure?docket=1`}
                  className="ml-1 text-[12px] font-medium text-slate-500 underline-offset-2 hover:text-slate-800 hover:underline"
                  data-testid="home-case-file-link"
                >
                  · 案卷
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

        {/* ⑥ 期限催办 · 大厅可见 */}
        <OaDeadlineNudge latestId={latestId} cases={cases} getPendingConfirms={getPendingConfirms} getProgress={getProgress} />

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

        {/* 目标入口 · 交互大纲 §3.1 可薄；仍落到①～⑧ */}
        <section
          className="mb-5"
          aria-labelledby="home-goal-entries-title"
          data-testid="home-goal-entries"
        >
          <div className="mb-2 flex items-baseline gap-2">
            <h2
              id="home-goal-entries-title"
              className="text-[13px] font-semibold text-slate-900"
            >
              今天想办哪件事
            </h2>
            <span className="text-[11px] text-slate-500">目标入口 · 落到部门</span>
          </div>
          <ul className="grid grid-cols-1 gap-2 sm:grid-cols-3">
            {[
              {
                id: 'disclosure',
                label: '写交底',
                desc: '交底部 · 技术事实成稿到全绿',
                href: latestId
                  ? `/agent/cases/${latestId}/depts/disclosure`
                  : '/agent/cases/new',
              },
              {
                id: 'draft',
                label: '递申请',
                desc: '申请部 · A理解 / B申不申 / C递交',
                href: latestId
                  ? `/agent/cases/${latestId}/depts/draft`
                  : '/agent/cases/new',
              },
              {
                id: 'oa',
                label: '答审查意见',
                desc: '答复部 · 争点 · 策略 · 本轮递交',
                href: latestId
                  ? `/agent/cases/${latestId}/depts/oa`
                  : '/agent/cases/new',
              },
            ].map((g) => (
              <li key={g.id}>
                <Link
                  to={g.href}
                  className="btn-press focus-ring flex h-full flex-col rounded-xl border border-slate-200 bg-slate-50/80 p-3 hover:border-slate-300 hover:bg-white"
                  data-testid={`home-goal-${g.id}`}
                >
                  <span className="text-[13px] font-semibold text-slate-900">
                    {g.label}
                  </span>
                  <span className="mt-1 text-[11px] leading-snug text-slate-500">
                    {g.desc}
                  </span>
                </Link>
              </li>
            ))}
          </ul>
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

        <BranchDoors caseId={latestId} isAgency={isAgency} />

        {isAgency && latestId ? (
          <div
            className="mb-5 rounded-xl border border-violet-200 bg-violet-50/70 px-4 py-3"
            data-testid="home-agency-escort"
          >
            <p className="text-[13px] font-semibold text-violet-950">代理陪同⑤</p>
            <p className="mt-0.5 text-[12px] text-violet-900/90">
              可绕 B2 进申请部壳诊断/陪同；不装交底已过线。企业无工单仍走门槛挡板。
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
          {latestId ? (
            <>
              <span aria-hidden className="text-slate-300">
                ·
              </span>
              <Link
                to={`/agent/cases/${latestId}/depts/disclosure?docket=1`}
                className="focus-ring rounded-sm font-medium text-slate-600 underline-offset-2 hover:text-slate-900 hover:underline"
                data-testid="home-action-case-file"
              >
                案卷抽屉
              </Link>
            </>
          ) : null}
        </nav>

        <footer className="mt-6 border-t border-slate-100 pt-3 text-[11px] text-slate-500">
          Novada Team 大厅 · 拍板在部门工作台右栏 · 样机本地会话
        </footer>
      </div>
    </div>
  )
}

function OaDeadlineNudge(props: {
  latestId: string | undefined
  cases: ReturnType<typeof useBusinessCases>['cases']
  getPendingConfirms: ReturnType<typeof useBusinessCases>['getPendingConfirms']
  getProgress: ReturnType<typeof useBusinessCases>['getProgress']
}) {
  const oaPending = props.cases.flatMap((c) =>
    props
      .getPendingConfirms(c.id)
      .filter((p) => p.kind === 'oa_strategy' && p.status === 'pending')
      .map((p) => ({ caseId: c.id, title: c.title, item: p })),
  )
  const filedNeedingWatch = props.cases.filter((c) => {
    const prog = props.getProgress(c.id)
    return Boolean(prog.filed) && (prog.stageId === 'oa' || (prog.oaRound ?? 0) > 0)
  })
  if (oaPending.length === 0 && filedNeedingWatch.length === 0) return null
  const top = oaPending[0]
  const href = top
    ? `/agent/cases/${top.caseId}/depts/oa?ask=oa_strategy&confirmId=${encodeURIComponent(top.item.id)}`
    : filedNeedingWatch[0]
      ? `/agent/cases/${filedNeedingWatch[0]!.id}/depts/oa`
      : props.latestId
        ? `/agent/cases/${props.latestId}/depts/oa`
        : '/agent/cases'
  return (
    <section
      className="mb-5 rounded-xl border border-rose-200 bg-rose-50/90 px-4 py-3 shadow-sm"
      data-testid="home-oa-nudge"
      aria-labelledby="home-oa-nudge-title"
    >
      <div className="flex flex-wrap items-start justify-between gap-2">
        <div className="min-w-0">
          <h2
            id="home-oa-nudge-title"
            className="text-[13px] font-semibold text-rose-950"
          >
            ⑥ 答复期限催办
          </h2>
          <p className="mt-0.5 text-[12px] leading-relaxed text-rose-900/90">
            {top
              ? `「${top.title}」有待拍答复策略 · 逾期风险演示（非真官方期限接口）`
              : `已递交案 ${filedNeedingWatch.length} 件处于答复阶段 · 请进答复部盯期限`}
          </p>
          <p className="mt-1 text-[10px] text-rose-800/70">
            催办示意 · 非官报通道 / 非短信邮件已通
          </p>
        </div>
        <Link
          to={href}
          className="btn-press focus-ring inline-flex shrink-0 items-center gap-1 rounded-md bg-rose-900 px-2.5 py-1.5 text-[11px] font-semibold text-white"
          data-testid="home-oa-nudge-cta"
        >
          去答复部
          <ArrowRight className="h-3 w-3" aria-hidden />
        </Link>
      </div>
    </section>
  )
}
