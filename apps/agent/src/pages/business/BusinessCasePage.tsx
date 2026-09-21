import { Link, useNavigate, useParams, useSearchParams } from 'react-router-dom'
import { useEffect, useMemo, useState } from 'react'
import {
  BUSINESS_STAGES,
  businessSeatLabel,
  currentSeatForProgress,
  seatsForCase,
  type BusinessConfirmKind,
} from '../../business/businessSeats'
import { useBusinessCases } from '../../business/BusinessCaseContext'
import { BusinessSeatWorkbench } from '../../components/business/BusinessSeatWorkbench'
import type { ProjectExpertId } from '../../projects/types'

const PREPARE_KINDS: Record<string, BusinessConfirmKind> = {
  intake: 'go_nogo',
  drafting: 'claims_ready',
  filing: 'file_authorize',
  oa: 'oa_strategy',
  prepare: 'research_ready',
}

function nextKindForCase(
  stageId: string,
  doneSeatIds: string[],
): BusinessConfirmKind | null {
  if (stageId === 'prepare') return 'research_ready'
  if (stageId === 'intake') {
    if (!doneSeatIds.includes('expert-research')) return 'research_ready'
    return 'go_nogo'
  }
  if (stageId === 'drafting') {
    if (!doneSeatIds.includes('expert-disclosure')) return 'disclosure_ready'
    if (!doneSeatIds.includes('expert-draft')) return 'claims_ready'
    return 'claims_ready'
  }
  if (stageId === 'filing') return 'file_authorize'
  if (stageId === 'oa') return 'oa_strategy'
  return PREPARE_KINDS[stageId] ?? null
}

/**
 * 案子工作台 — 席列表（点席=独立 bot 会话）+ 会话/双文件/交卷 HITL + 群聊占位
 * 案 id = ProjectFolder projectId（一案子一 id）
 */
export function BusinessCasePage() {
  const { caseId = '' } = useParams()
  const [params, setParams] = useSearchParams()
  const navigate = useNavigate()
  const {
    getCase,
    getProgress,
    getPendingConfirms,
    primaryCta,
    advanceStage,
    prepareConfirm,
    stageLabel,
    lastReturnHint,
    clearReturnHint,
  } = useBusinessCases()

  useEffect(() => {
    if (!lastReturnHint) return
    const t = window.setTimeout(() => clearReturnHint(), 6000)
    return () => window.clearTimeout(t)
  }, [lastReturnHint, clearReturnHint])

  const c = getCase(caseId)
  const prog = getProgress(caseId)
  const pending = getPendingConfirms(caseId)
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

  const selectSeat = (id: ProjectExpertId) => {
    setPickedSeat(id)
    const next = new URLSearchParams(params)
    next.set('seat', id)
    setParams(next, { replace: true })
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

  const oaLocked = !prog.filed

  const onPrimary = () => {
    if (cta.action === 'confirm' && cta.confirmId) {
      navigate(`/agent/pending/${cta.confirmId}`)
      return
    }
    if (prog.stageId === 'prepare') {
      advanceStage(caseId)
      return
    }
    const kind = nextKindForCase(prog.stageId, prog.doneSeatIds)
    if (kind) {
      if (kind === 'oa_strategy' && !prog.filed) return
      const item = prepareConfirm(caseId, kind)
      navigate(`/agent/pending/${item.id}`)
      return
    }
    advanceStage(caseId)
  }

  return (
    <div
      className="flex min-h-0 flex-1 flex-col overflow-hidden"
      data-testid="business-case-page"
      data-case-id={caseId}
      data-project-id={caseId}
    >
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
              {prog.filed && prog.stageId === 'oa' && (prog.oaRound ?? 0) > 0
                ? ` · 第 ${prog.oaRound} 通`
                : ''}
              {prog.moreSeatIds.includes('expert-layout')
                ? ' · 已启用布局'
                : ''}
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
          >
            {cta.action === 'confirm' ? `去确认 · ${cta.label}` : cta.label}
          </button>
        </header>

        {/* 紧凑进度 */}
        <ol
          className="mt-2 flex flex-wrap gap-1"
          data-testid="business-timeline"
        >
          {BUSINESS_STAGES.map((s) => {
            const done = prog.completedStages.includes(s.id)
            const current = prog.stageId === s.id
            const locked = s.requiresFiled && oaLocked && !done
            return (
              <li
                key={s.id}
                className={`rounded-full border px-2 py-0.5 text-[10px] font-medium ${
                  current
                    ? 'border-slate-800 bg-slate-900 text-white'
                    : done
                      ? 'border-emerald-200 bg-emerald-50 text-emerald-800'
                      : locked
                        ? 'border-slate-100 text-slate-300'
                        : 'border-slate-200 text-slate-500'
                }`}
                data-testid={`business-stage-${s.id}`}
                data-current={current ? '1' : '0'}
              >
                {s.title}
              </li>
            )
          })}
        </ol>
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

      <div className="flex min-h-0 flex-1 overflow-hidden">
        {/* 左：席列表 */}
        <aside
          className="flex w-[min(11rem,36vw)] shrink-0 flex-col border-r border-slate-200 bg-slate-50/80"
          data-testid="business-seat-rail"
        >
          <div className="border-b border-slate-100 px-2.5 py-2 text-[10px] font-semibold uppercase tracking-wider text-slate-400">
            本案席位
          </div>
          <ul className="min-h-0 flex-1 overflow-y-auto p-1.5" data-testid="business-seven-seats">
            {seatIds.map((sid) => {
              const selected = activeSeat === sid
              const done = prog.doneSeatIds.includes(sid)
              const seatPending = pending.some(
                (p) =>
                  p.preparedBy === businessSeatLabel(sid) ||
                  (sid === 'expert-disclosure' &&
                    p.kind === 'disclosure_ready') ||
                  (sid === 'expert-research' && p.kind === 'research_ready') ||
                  (sid === 'expert-intake' && p.kind === 'go_nogo') ||
                  (sid === 'expert-draft' && p.kind === 'claims_ready') ||
                  (sid === 'expert-filing' && p.kind === 'file_authorize') ||
                  (sid === 'expert-oa' && p.kind === 'oa_strategy') ||
                  (sid === 'expert-layout' && p.kind === 'layout_adjust'),
              )
              return (
                <li key={sid}>
                  <button
                    type="button"
                    onClick={() => selectSeat(sid)}
                    className={`focus-ring mb-0.5 flex w-full items-center gap-1.5 rounded-md px-2 py-1.5 text-left text-[12px] ${
                      selected
                        ? 'bg-slate-900 font-semibold text-white'
                        : 'text-slate-700 hover:bg-white'
                    }`}
                    data-testid={`business-seat-tab-${sid}`}
                    data-selected={selected ? '1' : '0'}
                    aria-current={selected ? 'page' : undefined}
                  >
                    <span
                      className={`h-1.5 w-1.5 shrink-0 rounded-full ${
                        done
                          ? 'bg-emerald-400'
                          : seatPending
                            ? 'bg-amber-400'
                            : selected
                              ? 'bg-white/70'
                              : 'bg-slate-300'
                      }`}
                    />
                    <span className="truncate">{businessSeatLabel(sid)}</span>
                  </button>
                </li>
              )
            })}
          </ul>

          <div className="shrink-0 border-t border-slate-200 p-2">
            <Link
              to={`/agent/projects/${caseId}/room`}
              className="mb-2 flex items-center justify-center gap-1 rounded-md border border-dashed border-violet-200 bg-violet-50/70 px-2 py-1.5 text-[10px] font-medium text-violet-900 hover:bg-violet-100"
              data-testid="business-case-group-chat"
              title="本案群聊（L2 感 · 与单席并存 · 占位）"
            >
              群聊 · 本案
              <span className="rounded bg-white/80 px-1 text-[8px] text-violet-600">
                占位
              </span>
            </Link>
          </div>

          {pending.length > 0 && (
            <div className="shrink-0 border-t border-slate-200 p-2">
              <div className="mb-1 text-[9px] font-semibold uppercase text-amber-700">
                待我确认 · {pending.length}
              </div>
              <ul className="space-y-1">
                {pending.slice(0, 3).map((item) => (
                  <li key={item.id}>
                    <Link
                      to={`/agent/pending/${item.id}`}
                      className="block truncate rounded border border-amber-100 bg-amber-50 px-1.5 py-1 text-[10px] font-medium text-amber-950"
                      data-testid={`business-case-pending-${item.id}`}
                    >
                      {item.title}
                    </Link>
                  </li>
                ))}
              </ul>
              <Link
                to="/agent/pending"
                className="mt-1 block text-center text-[10px] text-slate-400 hover:underline"
              >
                收件箱
              </Link>
            </div>
          )}
        </aside>

        {/* 中：席工作 */}
        <div className="min-h-0 min-w-0 flex-1 overflow-y-auto px-4 py-4 lg:px-6">
          <BusinessSeatWorkbench
            caseId={caseId}
            seatId={activeSeat}
            onAdvanced={(confirmId) => {
              if (confirmId) navigate(`/agent/pending/${confirmId}`)
            }}
          />
          <p className="mt-4 text-center text-[11px] text-slate-400">
            演示环境：进度与确认为样机闭环，非真递交局端。·
            案=项目同一 id
          </p>
        </div>
      </div>
    </div>
  )
}
