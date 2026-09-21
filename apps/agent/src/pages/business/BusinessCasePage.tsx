import { Link, useNavigate, useParams, useSearchParams } from 'react-router-dom'
import { useEffect, useMemo, useState } from 'react'
import {
  businessSeatLabel,
  currentSeatForProgress,
  seatsForCase,
} from '../../business/businessSeats'
import { useBusinessCases } from '../../business/BusinessCaseContext'
import { advanceButtonLabel } from '../../business/seatStepBodies'
import { BusinessSeatWorkbench } from '../../components/business/BusinessSeatWorkbench'
import { getProjectExpert } from '../../projects/experts'
import { useProjectFolder } from '../../projects/ProjectFolderContext'
import type { ProjectExpertId } from '../../projects/types'

/**
 * 案子工作台（刀1–3）：右栏工作面；席列表在左栏；右上唯一主 CTA。
 * 案 id = ProjectFolder projectId（一案子一 id）
 */
export function BusinessCasePage() {
  const { caseId = '' } = useParams()
  const [params] = useSearchParams()
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

  useEffect(() => {
    if (!lastReturnHint) return
    const t = window.setTimeout(() => clearReturnHint(), 6000)
    return () => window.clearTimeout(t)
  }, [lastReturnHint, clearReturnHint])

  const c = getCase(caseId)
  const prog = getProgress(caseId)
  const cta = primaryCta(caseId)

  const seatIds = useMemo(
    () =>
      seatsForCase({
        expertIds: c?.expertIds,
        moreSeatIds: prog.moreSeatIds,
      }),
    [c?.expertIds, prog.moreSeatIds],
  )

  const defaultSeat = useMemo(
    () =>
      currentSeatForProgress({
        stageId: prog.stageId,
        doneSeatIds: prog.doneSeatIds,
        moreSeatIds: prog.moreSeatIds,
      }),
    [prog.stageId, prog.doneSeatIds, prog.moreSeatIds],
  )

  const seatFromUrl = params.get('seat') as ProjectExpertId | null
  const [pickedSeat, setPickedSeat] = useState<ProjectExpertId | null>(null)
  const activeSeat: ProjectExpertId =
    pickedSeat && seatIds.includes(pickedSeat)
      ? pickedSeat
      : seatFromUrl && seatIds.includes(seatFromUrl)
        ? seatFromUrl
        : defaultSeat

  // 与左栏 ?seat= 同步
  useEffect(() => {
    if (seatFromUrl && seatIds.includes(seatFromUrl) && seatFromUrl !== pickedSeat) {
      setPickedSeat(seatFromUrl)
    }
  }, [seatFromUrl, seatIds, pickedSeat])

  const thread = getThread(caseId, activeSeat)
  const stepIndex = thread?.stepIndex ?? 0
  const def = getProjectExpert(activeSeat)
  const btnRaw = advanceButtonLabel(def.steps, stepIndex)
  const workLabel = btnRaw === '交卷待确认' ? '交卷' : '让它干活'

  /** 刀2：右上唯一主 CTA — 待确认优先，否则本席干活/交卷 */
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
      <div
        className="flex flex-1 items-center justify-center p-8"
        data-testid="business-case-missing"
      >
        <div className="text-center">
          <p className="text-sm text-slate-600">找不到这个案子</p>
          <Link
            to="/agent"
            className="mt-2 inline-block text-xs text-slate-800 underline"
          >
            返回我的案子
          </Link>
        </div>
      </div>
    )
  }

  const primaryLabel =
    cta.action === 'confirm' ? `去确认 · ${cta.label}` : workLabel

  return (
    <div
      className="flex min-h-0 flex-1 flex-col overflow-hidden"
      data-testid="business-case-page"
      data-case-id={caseId}
      data-project-id={caseId}
      data-biz-case-ia="1"
    >
      {/* 顶栏极简：案名 + 单一主 CTA（阶段已并入左栏） */}
      <div className="shrink-0 border-b border-slate-200 bg-white px-4 py-3 lg:px-6">
        <div className="mb-1 text-[11px] text-slate-400">
          <Link to="/agent" className="hover:underline">
            我的案子
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
              {' · '}
              {businessSeatLabel(activeSeat)}
            </p>
          </div>
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
            title={
              cta.action === 'confirm'
                ? '去确认待办'
                : `${businessSeatLabel(activeSeat)} · ${workLabel}`
            }
          >
            {primaryLabel}
          </button>
        </header>
        {/* 刀3：不再渲染可点阶段 pill 墙（重复主链） */}
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

      {/* 右栏：席工作面（左栏在 AgentShell） */}
      <div className="min-h-0 flex-1 overflow-y-auto px-4 py-4 lg:px-6">
        <BusinessSeatWorkbench
          caseId={caseId}
          seatId={activeSeat}
          workNonce={workNonce}
          onAdvanced={(confirmId) => {
            if (confirmId) navigate(`/agent/pending/${confirmId}`)
          }}
        />
        <p className="mt-4 text-center text-[11px] text-slate-400">
          演示环境：进度与确认为样机闭环，非真递交局端。· 案=项目同一 id
        </p>
      </div>
    </div>
  )
}
