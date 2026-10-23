import { Link, useNavigate, useParams, useSearchParams } from 'react-router-dom'
import { useEffect, useMemo, useState } from 'react'
import {
  businessSeatLabel,
  currentSeatForProgress,
  seatsForCase,
} from '../../business/businessSeats'
import { navigablePeerSeatIds } from '../../business/deptRoster'
import {
  DRILL_ORCH_ID,
  DRILL_OWNER_IDS,
  drillSeatLabel,
} from '../../business/drillRoster'
import { useBusinessCases } from '../../business/BusinessCaseContext'
import { advanceButtonLabel } from '../../business/seatStepBodies'
import { BusinessSeatWorkbench } from '../../components/business/BusinessSeatWorkbench'
import { CaseCompanyHome } from '../../components/business/CaseCompanyHome'
import { CaseAssistantPanel } from '../../components/business/CaseAssistantPanel'
import { OrchestratorDrillWorkbench } from '../../components/business/OrchestratorDrillWorkbench'
import { getProjectExpert } from '../../projects/experts'
import { useProjectFolder } from '../../projects/ProjectFolderContext'
import { midCaseHref } from '../../lib/deepLinks'
import type { ProjectExpertId } from '../../projects/types'

/**
 * 公司首页（product-pages §4.3）。?drill=1 仍为演练全队旁路。
 * 部门作业见 /cases/:id/depts/:slug
 */
export function BusinessCasePage() {
  const { caseId = '' } = useParams()
  const [params, setSearchParams] = useSearchParams()
  const navigate = useNavigate()
  const {
    getCase,
    getProgress,
    primaryCta,
    stageLabel,
    lastReturnHint,
    clearReturnHint,
  } = useBusinessCases()
  const { getThread } = useProjectFolder()

  const drillMode = params.get('drill') === '1'

  useEffect(() => {
    if (!lastReturnHint) return
    const t = window.setTimeout(() => clearReturnHint(), 6000)
    return () => window.clearTimeout(t)
  }, [lastReturnHint, clearReturnHint])

  const c = getCase(caseId)
  const prog = getProgress(caseId)
  const cta = primaryCta(caseId)

  const seatIds = useMemo(() => {
    if (drillMode) return [...DRILL_OWNER_IDS, ...navigablePeerSeatIds()]
    return [
      ...seatsForCase({
        expertIds: c?.expertIds,
        moreSeatIds: prog.moreSeatIds,
      }),
      ...navigablePeerSeatIds(),
    ]
  }, [drillMode, c?.expertIds, prog.moreSeatIds])

  const defaultSeat = useMemo(() => {
    if (drillMode) return DRILL_ORCH_ID
    const fromProgress = currentSeatForProgress({
      stageId: prog.stageId,
      doneSeatIds: prog.doneSeatIds,
      moreSeatIds: prog.moreSeatIds,
    })
    // 有计划且 CTA 带 seat 时，优先落计划起点席（仍须在本案席表内）
    if (cta.fromPlan && cta.seatId && seatIds.includes(cta.seatId)) {
      if (!prog.doneSeatIds.includes(cta.seatId)) return cta.seatId
    }
    return fromProgress
  }, [
    drillMode,
    prog.stageId,
    prog.doneSeatIds,
    prog.moreSeatIds,
    cta.fromPlan,
    cta.seatId,
    seatIds,
  ])

  const seatFromUrl = params.get('seat') as ProjectExpertId | null
  const [pickedSeat, setPickedSeat] = useState<ProjectExpertId | null>(null)

  const activeSeat: ProjectExpertId = (() => {
    if (pickedSeat) {
      if (drillMode && (pickedSeat === DRILL_ORCH_ID || seatIds.includes(pickedSeat)))
        return pickedSeat
      if (!drillMode && seatIds.includes(pickedSeat)) return pickedSeat
    }
    if (seatFromUrl) {
      if (drillMode && (seatFromUrl === DRILL_ORCH_ID || seatIds.includes(seatFromUrl)))
        return seatFromUrl
      if (!drillMode && seatIds.includes(seatFromUrl)) return seatFromUrl
    }
    return defaultSeat
  })()

  useEffect(() => {
    if (!seatFromUrl) return
    const ok =
      drillMode
        ? seatFromUrl === DRILL_ORCH_ID || seatIds.includes(seatFromUrl)
        : seatIds.includes(seatFromUrl)
    if (ok && seatFromUrl !== pickedSeat) setPickedSeat(seatFromUrl)
  }, [seatFromUrl, seatIds, pickedSeat, drillMode])

  const thread = getThread(caseId, activeSeat === DRILL_ORCH_ID ? DRILL_ORCH_ID : activeSeat)
  const stepIndex = thread?.stepIndex ?? 0
  const def = getProjectExpert(activeSeat)
  const btnRaw = advanceButtonLabel(def.steps, stepIndex)
  const workLabel = btnRaw === '交卷待确认' ? '交卷' : '让它干活'

  const [workNonce, setWorkNonce] = useState(0)
  const onPrimary = () => {
    if (cta.action === 'confirm' && cta.confirmId) {
      navigate(`/agent/pending/${cta.confirmId}`)
      return
    }
    if (drillMode && activeSeat === DRILL_ORCH_ID) {
      navigate(`/agent/cases/${caseId}?drill=1&seat=${DRILL_ORCH_ID}`)
      return
    }
    setWorkNonce((n) => n + 1)
  }

  const setDrill = (on: boolean) => {
    const next = new URLSearchParams(params)
    if (on) {
      next.set('drill', '1')
      next.set('seat', DRILL_ORCH_ID)
      setPickedSeat(DRILL_ORCH_ID)
    } else {
      next.delete('drill')
      next.delete('seat')
      setPickedSeat(null)
    }
    setSearchParams(next, { replace: true })
  }

  if (!c) {
    return (
      <div
        className="flex flex-1 items-center justify-center p-8"
        data-testid="business-case-missing"
      >
        <div className="text-center">
          <p className="text-sm text-slate-600">找不到这个案子</p>
          <Link
            to="/agent/cases"
            className="mt-2 inline-block text-xs text-slate-800 underline"
          >
            返回我的案子
          </Link>
        </div>
      </div>
    )
  }

  // 默认：公司首页（认知壳）；演练模式保留旧席位工作台
  if (!drillMode) {
    return (
      <div
        className="flex min-h-0 flex-1 flex-col overflow-hidden"
        data-testid="business-case-page"
        data-case-id={caseId}
        data-project-id={caseId}
        data-biz-case-ia="1"
        data-company-home="1"
      >
        <div className="shrink-0 border-b border-slate-200 bg-white px-4 py-3 lg:px-6">
          <div className="mb-1 flex flex-wrap items-center gap-2 text-[11px] text-slate-400">
            <Link to="/agent/cases" className="hover:underline">
              多案流水
            </Link>
            <span className="mx-1">/</span>
            {c.title}
          </div>
          <header className="flex flex-wrap items-start justify-between gap-3">
            <div>
              <h1 className="text-[18px] font-semibold text-slate-900">
                {c.title}
              </h1>
              <p className="mt-0.5 text-xs text-slate-500">
                {c.summary || '当前：' + stageLabel(prog.stageId)}
              </p>
            </div>
            <div className="flex flex-wrap items-center gap-2">
              <button
                type="button"
                onClick={() => setDrill(true)}
                className="btn-press focus-ring rounded-md border border-dashed border-indigo-300 bg-indigo-50/50 px-2.5 py-1.5 text-[11px] font-medium text-indigo-900"
                data-testid="drill-enter"
                title="旁路：总控+14 · 非业务默认"
              >
                演练全队
              </button>
            </div>
          </header>
        </div>
        {lastReturnHint && (
          <div
            className="shrink-0 border-b border-amber-200 bg-amber-50 px-4 py-2 text-xs font-medium text-amber-950"
            role="status"
            data-testid="business-return-hint"
          >
            {lastReturnHint}
          </div>
        )}
        <div className="min-h-0 flex-1 overflow-y-auto px-4 py-4 lg:px-6">
          <CaseCompanyHome
            caseId={caseId}
            title={c.title}
            summary={c.summary}
          />
        </div>
      </div>
    )
  }

  const primaryLabel =
    cta.action === 'confirm'
      ? `去确认 · ${cta.label}`
      : drillMode && activeSeat === DRILL_ORCH_ID
        ? '总控台'
        : cta.fromPlan
          ? cta.label
          : workLabel

  const switchSeat = (next: ProjectExpertId) => {
    setPickedSeat(next)
    const nextParams = new URLSearchParams(params)
    nextParams.set('seat', next)
    if (drillMode) nextParams.set('drill', '1')
    else nextParams.delete('drill')
    navigate(`/agent/cases/${caseId}?${nextParams.toString()}`, { replace: true })
  }

  return (
    <div
      className="flex min-h-0 flex-1 flex-col overflow-hidden"
      data-testid="business-case-page"
      data-case-id={caseId}
      data-project-id={caseId}
      data-biz-case-ia="1"
      data-drill={drillMode ? '1' : '0'}
    >
      <div className="shrink-0 border-b border-slate-200 bg-white px-4 py-3 lg:px-6">
        <div className="mb-1 flex flex-wrap items-center gap-2 text-[11px] text-slate-400">
          <Link to="/agent/cases" className="hover:underline">
            我的案子
          </Link>
          <span className="mx-1">/</span>
          {c.title}
          {drillMode && (
            <span
              className="rounded bg-indigo-100 px-1.5 py-0.5 text-[10px] font-semibold text-indigo-900"
              data-testid="drill-mode-badge"
            >
              演练全队
            </span>
          )}
        </div>
        <header className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <h1 className="text-[18px] font-semibold text-slate-900">
              {c.title}
            </h1>
            <p className="mt-0.5 text-xs text-slate-500">
              {c.summary || '当前：' + stageLabel(prog.stageId)}
              {' · '}
              {drillMode
                ? drillSeatLabel(activeSeat)
                : businessSeatLabel(activeSeat)}
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <a
              href={midCaseHref(caseId)}
              target="_blank"
              rel="noopener noreferrer"
              className="btn-press focus-ring rounded-md border border-slate-200 bg-white px-2.5 py-1.5 text-[11px] font-medium text-slate-700"
              data-testid="business-case-mid-link"
            >
              在中台查看
            </a>
            {drillMode ? (
              <button
                type="button"
                onClick={() => setDrill(false)}
                className="btn-press focus-ring rounded-md border border-slate-200 bg-white px-2.5 py-1.5 text-[11px] font-medium text-slate-700"
                data-testid="drill-exit"
              >
                退出演练
              </button>
            ) : (
              <button
                type="button"
                onClick={() => setDrill(true)}
                className="btn-press focus-ring rounded-md border border-dashed border-indigo-300 bg-indigo-50/50 px-2.5 py-1.5 text-[11px] font-medium text-indigo-900"
                data-testid="drill-enter"
                title="旁路：总控+14 · 非业务默认"
              >
                演练全队
              </button>
            )}
            <button
              type="button"
              onClick={onPrimary}
              className={`btn-press focus-ring rounded-md px-3 py-1.5 text-xs font-semibold ${
                cta.action === 'confirm'
                  ? 'bg-amber-600 text-white'
                  : 'bg-slate-900 text-white'
              }`}
              data-testid="business-case-primary-cta"
              data-cta-kind={cta.action === 'confirm' ? 'confirm' : 'work'}
            >
              {primaryLabel}
            </button>
          </div>
        </header>
      </div>

      {lastReturnHint && (
        <div
          className="shrink-0 border-b border-amber-200 bg-amber-50 px-4 py-2 text-xs font-medium text-amber-950"
          role="status"
          data-testid="business-return-hint"
        >
          {lastReturnHint}
        </div>
      )}

      <div className="min-h-0 flex-1 overflow-y-auto px-4 py-4 lg:px-6">
        {!drillMode && (
          <CaseAssistantPanel
            caseId={caseId}
            stageId={prog.stageId}
            activeSeat={activeSeat}
            onSwitchSeat={switchSeat}
          />
        )}
        {drillMode && activeSeat === DRILL_ORCH_ID ? (
          <OrchestratorDrillWorkbench
            caseId={caseId}
            onSwitchSeat={switchSeat}
          />
        ) : (
          <BusinessSeatWorkbench
            caseId={caseId}
            seatId={activeSeat}
            workNonce={workNonce}
            onAdvanced={(confirmId) => {
              if (confirmId) navigate(`/agent/pending/${confirmId}`)
            }}
            onSwitchSeat={switchSeat}
          />
        )}
        <p className="mt-4 text-center text-[11px] text-slate-400">
          {drillMode
            ? '演练旁路：总控+14 · 样机调度，非业务冷启动默认'
            : '演示环境：进度与确认为样机闭环，非真递交局端。· 案=项目同一 id'}
        </p>
      </div>
    </div>
  )
}
