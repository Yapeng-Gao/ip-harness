import { useMemo, useState } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import { HomeReceptionGuide } from '../components/home/HomeReceptionGuide'
import { PersonaSeedGate } from '../components/home/PersonaSeedGate'
import { useBusinessCases } from '../business/BusinessCaseContext'
import {
  ENTRY_ROLE_LABEL,
  pickLatestCaseId,
} from '../business/entryRole'
import { useEntryRole } from '../business/useEntryRole'
import { BranchDoors } from '../components/business/BranchDoors'
import { HallFloorPlan } from '../components/home/HallFloorPlan'
import { CompanyActivityFeed } from '../components/home/CompanyActivityFeed'
import { LobbyDraftPane, LobbyTaskBar } from '../components/home/LobbyTaskBar'
import { reopenAllTeachTips } from '../business/teachingFade'
import { isPersonaSeedSettled } from '../business/userPersona'
import { isBusinessSeedCaseId } from '../business/businessSeeds'

/**
 * 大厅着陆 · /agent
 * 真源：一期节点 + 一期-产品逻辑 + 一期-产品理念 —— 公司门口第一眼。
 * §103：门口两件套 = 前台 + 八部门牌；「要你拍板」并入左栏「待确认」唯一入口；支路仍 ?hallTools=1。
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

  const getLogAt = useMemo(
    () => (id: string) => {
      const logs = getProcessLogs(id)
      if (logs.length === 0) return undefined
      return logs.reduce((max, l) => (l.at > max ? l.at : max), logs[0]!.at)
    },
    [getProcessLogs],
  )

  const isAgency = entryRole === 'agency'
  /** Only explicit legacy demo tools may reference a recent case; hall entry starts a new matter. */
  const workspaceCases = cases.filter((c) => !isBusinessSeedCaseId(c.id))
  const latestId = pickLatestCaseId(
    workspaceCases,
    (id) => getProgress(id).updatedAt,
    getLogAt,
  )
  const [personaTick, setPersonaTick] = useState(0)
  const personaSettled = useMemo(
    () => isPersonaSeedSettled(),
    // eslint-disable-next-line react-hooks/exhaustive-deps -- tick forces re-read storage
    [personaTick],
  )
  return (
    <div
      className="flex min-h-0 flex-1 flex-col overflow-y-auto bg-[#f5f5f7] px-3 py-2 lg:overflow-hidden lg:px-4"
      data-hall-dense="1"
      data-hall-screen="floor-live-v1"
      data-testid="agent-home-page"
      data-home="assistant"
      data-entry-role={entryRole}
      data-hall-dedupe="pending-left-only-v103"
      data-assistant-density="delegate-chain-v1"
      data-hall-tools={hallTools ? '1' : '0'}
      data-persona-settled={personaSettled ? '1' : '0'}
    >
      <header
        className="mb-2 flex shrink-0 flex-wrap items-center justify-between gap-x-3 gap-y-1"
        data-testid="home-hall-tagline"
        data-hall-tagline="thin-v103"
      >
        <p
          className="text-pretty text-[12px] font-medium text-slate-500"
          data-testid="home-hall-tagline-sub"
        >
          专家向你汇报 · 弄清去向
        </p>
        <span
          className="sr-only"
          data-testid="home-current-role"
          data-entry-role={entryRole}
        >
          {ENTRY_ROLE_LABEL[entryRole]}
        </span>
      </header>

      {!personaSettled ? (
        <PersonaSeedGate onSettled={() => setPersonaTick((n) => n + 1)} />
      ) : (
        <div className="flex min-h-0 flex-1 flex-col gap-2">
          <LobbyTaskBar />
          <div className="grid min-h-0 flex-1 grid-cols-1 gap-2 lg:grid-cols-[minmax(13rem,16rem)_minmax(0,1.7fr)_minmax(14rem,17rem)] lg:overflow-hidden">
            <div className="min-h-0 space-y-2 lg:overflow-y-auto" data-hall-block="reception" data-testid="home-delegate-zone">
              <p className="px-0.5 text-[11px] font-semibold text-slate-500">分派</p>
              <div id="hall-reception">
                <HomeReceptionGuide initialAttachId={attachQ} />
              </div>
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
            </div>
            <div className="min-h-[22rem] lg:min-h-0" data-hall-block="eight-depts" data-testid="home-eight-depts-fold" data-folded="0">
              <HallFloorPlan />
            </div>
            <div className="flex min-h-[24rem] flex-col gap-2 lg:min-h-0 lg:overflow-hidden">
              <LobbyDraftPane />
              <div className="min-h-0 flex-1">
                <CompanyActivityFeed />
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
