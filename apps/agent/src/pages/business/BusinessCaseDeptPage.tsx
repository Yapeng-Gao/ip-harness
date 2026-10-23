import { Link, useNavigate, useParams, useSearchParams } from 'react-router-dom'
import { useEffect, useMemo, useState } from 'react'
import {
  businessSeatLabel,
  currentSeatForProgress,
  seatsForCase,
} from '../../business/businessSeats'
import { navigablePeerSeatIds } from '../../business/deptRoster'
import { useBusinessCases } from '../../business/BusinessCaseContext'
import { advanceButtonLabel } from '../../business/seatStepBodies'
import { BusinessSeatWorkbench } from '../../components/business/BusinessSeatWorkbench'
import { CaseAssistantPanel } from '../../components/business/CaseAssistantPanel'
import { getProjectExpert } from '../../projects/experts'
import { useProjectFolder } from '../../projects/ProjectFolderContext'
import {
  deptIdFromSlug,
  orgDeptById,
  deptSlug,
  MAIN_CHAIN_DEPTS,
} from '../../departments/orgDepts'
import { useOrgConfig } from '../../departments/OrgConfigContext'
import type { ProjectExpertId } from '../../projects/types'

/**
 * 部门工作台 · product-pages §4.4+
 * /agent/cases/:caseId/depts/:deptSlug
 */
export function BusinessCaseDeptPage() {
  const { caseId = '', deptSlug: slug = '' } = useParams()
  const [params] = useSearchParams()
  const navigate = useNavigate()
  const { getCase, getProgress, primaryCta, stageLabel, lastReturnHint, clearReturnHint } =
    useBusinessCases()
  const { getThread } = useProjectFolder()
  const { deptLabel } = useOrgConfig()

  useEffect(() => {
    if (!lastReturnHint) return
    const t = window.setTimeout(() => clearReturnHint(), 6000)
    return () => window.clearTimeout(t)
  }, [lastReturnHint, clearReturnHint])

  const deptId = deptIdFromSlug(slug)
  const dept = deptId ? orgDeptById(deptId) : undefined
  const c = getCase(caseId)
  const prog = getProgress(caseId)
  const cta = primaryCta(caseId)

  const seatIds = useMemo(() => {
    return [
      ...seatsForCase({
        expertIds: c?.expertIds,
        moreSeatIds: prog.moreSeatIds,
      }),
      ...navigablePeerSeatIds(),
    ]
  }, [c?.expertIds, prog.moreSeatIds])

  const defaultSeat = useMemo(() => {
    if (dept && seatIds.includes(dept.leadSeatId)) return dept.leadSeatId
    return currentSeatForProgress({
      stageId: prog.stageId,
      doneSeatIds: prog.doneSeatIds,
      moreSeatIds: prog.moreSeatIds,
    })
  }, [dept, seatIds, prog.stageId, prog.doneSeatIds, prog.moreSeatIds])

  const seatFromUrl = params.get('seat') as ProjectExpertId | null
  const [pickedSeat, setPickedSeat] = useState<ProjectExpertId | null>(null)

  const activeSeat: ProjectExpertId = (() => {
    if (pickedSeat && seatIds.includes(pickedSeat)) return pickedSeat
    if (seatFromUrl && seatIds.includes(seatFromUrl)) return seatFromUrl
    return defaultSeat
  })()

  useEffect(() => {
    if (!seatFromUrl) return
    if (seatIds.includes(seatFromUrl) && seatFromUrl !== pickedSeat) {
      setPickedSeat(seatFromUrl)
    }
  }, [seatFromUrl, seatIds, pickedSeat])

  const thread = getThread(caseId, activeSeat)
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
    setWorkNonce((n) => n + 1)
  }

  if (!c) {
    return (
      <div className="flex flex-1 items-center justify-center p-8" data-testid="business-case-missing">
        <div className="text-center">
          <p className="text-sm text-slate-600">找不到这个案子</p>
          <Link to="/agent" className="mt-2 inline-block text-xs text-slate-800 underline">
            返回我的案子
          </Link>
        </div>
      </div>
    )
  }

  if (!dept) {
    return (
      <div className="flex flex-1 items-center justify-center p-8" data-testid="dept-missing">
        <div className="text-center">
          <p className="text-sm text-slate-600">没有这个部门</p>
          <Link
            to={`/agent/cases/${caseId}`}
            className="mt-2 inline-block text-xs text-slate-800 underline"
          >
            回公司首页
          </Link>
        </div>
      </div>
    )
  }

  const primaryLabel =
    cta.action === 'confirm'
      ? `去确认 · ${cta.label}`
      : cta.fromPlan
        ? cta.label
        : workLabel

  const switchSeat = (next: ProjectExpertId) => {
    setPickedSeat(next)
    const nextParams = new URLSearchParams(params)
    nextParams.set('seat', next)
    navigate(
      `/agent/cases/${caseId}/depts/${slug}?${nextParams.toString()}`,
      { replace: true },
    )
  }

  return (
    <div
      className="flex min-h-0 flex-1 flex-col overflow-hidden"
      data-testid="business-case-dept-page"
      data-case-id={caseId}
      data-dept-id={dept.id}
    >
      <div className="shrink-0 border-b border-slate-200 bg-white px-4 py-3 lg:px-6">
        <div className="mb-1 flex flex-wrap items-center gap-2 text-[11px] text-slate-400">
          <Link to="/agent" className="hover:underline">
            我的案子
          </Link>
          <span>/</span>
          <Link to={`/agent/cases/${caseId}`} className="hover:underline">
            {c.title}
          </Link>
          <span>/</span>
          <span className="text-slate-600">{deptLabel(dept)}</span>
        </div>
        <header className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <h1 className="text-[18px] font-semibold text-slate-900">
              {deptLabel(dept)}工作台
            </h1>
            <p className="mt-0.5 text-xs text-slate-500">
              {dept.blurb}
              {' · '}
              {businessSeatLabel(activeSeat)}
              {' · '}
              {stageLabel(prog.stageId)}
            </p>
            <div className="mt-2 flex flex-wrap gap-1.5">
              {MAIN_CHAIN_DEPTS.map((d) => (
                <Link
                  key={d.id}
                  to={`/agent/cases/${caseId}/depts/${deptSlug(d.id)}`}
                  className={`rounded-full px-2 py-0.5 text-[10px] font-medium ${
                    d.id === dept.id
                      ? 'bg-slate-900 text-white'
                      : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                  }`}
                >
                  {deptLabel(d)}
                </Link>
              ))}
            </div>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <Link
              to={`/agent/cases/${caseId}`}
              className="btn-press focus-ring rounded-md border border-slate-200 bg-white px-2.5 py-1.5 text-[11px] font-medium text-slate-700"
            >
              公司首页
            </Link>
            <button
              type="button"
              onClick={onPrimary}
              className={`btn-press focus-ring rounded-md px-3 py-1.5 text-xs font-semibold ${
                cta.action === 'confirm'
                  ? 'bg-amber-600 text-white'
                  : 'bg-slate-900 text-white'
              }`}
              data-testid="dept-primary-cta"
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
        >
          {lastReturnHint}
        </div>
      )}

      <div className="min-h-0 flex-1 overflow-y-auto px-4 py-4 lg:px-6">
        <CaseAssistantPanel
          caseId={caseId}
          stageId={prog.stageId}
          activeSeat={activeSeat}
          onSwitchSeat={switchSeat}
        />
        <BusinessSeatWorkbench
          caseId={caseId}
          seatId={activeSeat}
          workNonce={workNonce}
          onAdvanced={(confirmId) => {
            if (confirmId) navigate(`/agent/pending/${confirmId}`)
          }}
          onSwitchSeat={switchSeat}
        />
        <p className="mt-4 text-center text-[11px] text-slate-400">
          演示环境：进度与确认为样机闭环，非真递交局端。
        </p>
      </div>
    </div>
  )
}
