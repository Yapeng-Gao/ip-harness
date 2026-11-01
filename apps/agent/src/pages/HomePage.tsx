import { useMemo, useState } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import { HomeBossTodoBoard } from '../components/home/HomeBossTodoBoard'
import { HomeReceptionGuide } from '../components/home/HomeReceptionGuide'
import { useBusinessCases } from '../business/BusinessCaseContext'
import {
  ENTRY_ROLE_LABEL,
  pickLatestCaseId,
} from '../business/entryRole'
import { useEntryRole } from '../business/useEntryRole'
import { BranchDoors } from '../components/business/BranchDoors'
import { HallEightDoors } from '../components/home/HallEightDoors'
import { reopenAllTeachTips } from '../business/teachingFade'

/**
 * 大厅着陆 · /agent
 * 真源：一期节点 + 一期-产品逻辑 + 一期-产品理念 —— 公司门口第一眼。
 * §97：门口三件套保留；顶栏路径段控；薄轨标题「待你确认」；支路仍 ?hallTools=1。
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
  const hallTools = params.get('hallTools') === '1'
  const { entryRole } = useEntryRole()
  const { cases, getProgress, getProcessLogs } = useBusinessCases()
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

  return (
    <div
      className="flex-1 overflow-y-auto px-4 py-3 lg:px-8"
      data-hall-dense="1"
      data-hall-screen="one-pass-v97"
      data-testid="agent-home-page"
      data-home="assistant"
      data-entry-role={entryRole}
      data-hall-dedupe="boss-todo-v97"
      data-assistant-density="delegate-chain-v1"
      data-hall-tools={hallTools ? '1' : '0'}
    >
      <div className="mx-auto w-full max-w-4xl">
        {/* 1 · 顶：门口身份 + 当前案薄条 */}
        <header
          className="mb-2.5 flex flex-wrap items-end justify-between gap-x-3 gap-y-1"
          data-testid="home-hall-tagline"
        >
          <div className="min-w-0">
            <p className="text-[10px] font-medium uppercase tracking-wider text-slate-400">
              Novada Team · 大厅
            </p>
            <h1 className="mt-0.5 text-pretty text-[20px] font-bold tracking-tight text-slate-900 sm:text-[22px]">
              专家向你汇报
            </h1>
            <p
              className="mt-0.5 text-[11px] text-slate-500"
              data-testid="home-hall-tagline-sub"
            >
              弄清去向 · 办事
            </p>
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

        {/* 2 · 前台主动引导 */}
        <div data-hall-block="reception" data-testid="home-delegate-zone">
          <HomeReceptionGuide
            initialAttachId={attachQ}
            latestCaseId={latestId}
            onDispatched={() => setRelayRefresh((n) => n + 1)}
          />
        </div>

        {/* 3 · 老板待办 · 唯一待办主轨（接力并入展开后） */}
        <div data-rail="light" data-testid="home-boss-rail" className="mb-1">
          <HomeBossTodoBoard
            latestId={latestId}
            compactDefault
            relayRefreshKey={relayRefresh}
          />
        </div>

        {/* 4 · 八部门名牌 · 一句话 + 薄专家预览 */}
        <HallEightDoors caseId={latestId} />

        {/* 支路 / 次要 · 仅 ?hallTools=1 出现（顶栏账户菜单入口），不占首屏 */}
        {hallTools ? (
          <div
            className="mt-3 space-y-3 border-t border-slate-100 pt-3"
            data-testid="home-hall-tools"
          >
            <div className="flex flex-wrap items-center gap-2">
              <p className="text-[12px] font-semibold text-slate-800">大厅工具</p>
              <Link
                to="/agent"
                className="text-[11px] font-medium text-slate-500 underline-offset-2 hover:underline"
                data-testid="home-hall-tools-close"
              >
                收起回门口
              </Link>
            </div>
            <BranchDoors caseId={latestId} isAgency={isAgency} />
            <div data-testid="home-secondary-fold" data-folded="0">
              {branchQ ? (
                <div
                  className="mb-2 rounded-lg border border-amber-300 bg-amber-50 px-3 py-2"
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
                  className="mb-2 rounded-lg border border-violet-200 bg-violet-50/70 px-3 py-2"
                  data-testid="home-agency-escort"
                >
                  <p className="text-[12px] font-semibold text-violet-950">
                    代理陪同进申请部
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
                  {isAgency ? '案盘 / 项目' : '案盘'}
                </Link>
                <span aria-hidden className="text-slate-300">
                  ·
                </span>
                <Link
                  to="/agent/departments"
                  className="focus-ring rounded-sm font-medium text-slate-600 underline-offset-2 hover:text-slate-900 hover:underline"
                  data-testid="home-action-departments"
                >
                  编制
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
          </div>
        ) : null}

        <footer className="mt-3 border-t border-slate-100 pt-2 text-[10px] text-slate-400">
          拍板在部门工作台 · 支路在账户菜单
        </footer>
      </div>
    </div>
  )
}
