import { Link } from 'react-router-dom'
import { useEffect, useMemo, useRef, useState } from 'react'
import {
  businessSeatLabel,
  confirmKindForSeat,
  CONFIRM_KIND_LABEL,
} from '../../business/businessSeats'
import { useBusinessCases } from '../../business/BusinessCaseContext'
import {
  advanceButtonLabel,
  buildProgressiveArtifact,
  buildProgressiveWorklog,
} from '../../business/seatStepBodies'
import { getProjectExpert } from '../../projects/experts'
import { useProjectFolder } from '../../projects/ProjectFolderContext'
import { deliverableForExpert } from '../../projects/patentDeliverables'
import type { ProjectExpertId } from '../../projects/types'
import { CaseProcessPanel } from './CaseProcessPanel'

type Props = {
  caseId: string
  seatId: ProjectExpertId
  onAdvanced?: (confirmId?: string) => void
}

/**
 * 席工作面：只读步骤进度 + 成果/过程随步更新 + 完成本步/交卷 → 本案待确认
 */
export function BusinessSeatWorkbench({ caseId, seatId, onAdvanced }: Props) {
  const { advanceSeatWork, getPendingConfirms, getProgress } = useBusinessCases()
  const { getThread } = useProjectFolder()
  const def = getProjectExpert(seatId)
  const thread = getThread(caseId, seatId)
  const stepIndex = thread?.stepIndex ?? 0
  const prog = getProgress(caseId)
  const dual = deliverableForExpert(seatId)
  const [tab, setTab] = useState<'artifact' | 'worklog'>('artifact')
  const [flashBody, setFlashBody] = useState(false)
  const [flashLogId, setFlashLogId] = useState<string | null>(null)
  const bodyRef = useRef<HTMLPreElement>(null)
  const pendingForSeat = useMemo(() => {
    const kind = confirmKindForSeat(seatId)
    if (!kind) return []
    return getPendingConfirms(caseId).filter((c) => c.kind === kind)
  }, [caseId, seatId, getPendingConfirms])

  const oaLocked = seatId === 'expert-oa' && !prog.filed
  const submitted = !!thread?.artifactSubmitted
  const btnLabel = advanceButtonLabel(def.steps, stepIndex)

  const artifactBody = useMemo(() => {
    if (!dual) return ''
    return buildProgressiveArtifact(dual, def.steps, stepIndex)
  }, [dual, def.steps, stepIndex])

  const worklogBody = useMemo(() => {
    if (!dual) return ''
    return buildProgressiveWorklog(dual, def.steps, stepIndex)
  }, [dual, def.steps, stepIndex])

  useEffect(() => {
    if (!flashBody) return
    const t = window.setTimeout(() => setFlashBody(false), 1200)
    return () => window.clearTimeout(t)
  }, [flashBody])

  useEffect(() => {
    if (!flashLogId) return
    const t = window.setTimeout(() => setFlashLogId(null), 1800)
    return () => window.clearTimeout(t)
  }, [flashLogId])

  useEffect(() => {
    if (!flashBody) return
    bodyRef.current?.scrollTo({
      top: bodyRef.current.scrollHeight,
      behavior: 'smooth',
    })
  }, [flashBody, worklogBody, stepIndex])

  const onAdvance = () => {
    if (oaLocked) return
    const r = advanceSeatWork(caseId, seatId)
    // 推进后切办理过程 + 闪新正文 / 新日志
    setTab('worklog')
    setFlashBody(true)
    if (r.processLogId) setFlashLogId(r.processLogId)
    onAdvanced?.(r.confirm?.id)
  }

  return (
    <div className="flex min-h-0 flex-1 flex-col" data-testid="business-seat-workbench">
      <header className="mb-3 flex flex-wrap items-start justify-between gap-2">
        <div>
          <h2 className="text-sm font-semibold text-slate-900">
            {businessSeatLabel(seatId)}
            <span className="ml-2 text-[11px] font-normal text-slate-400">
              {def.specialty}
            </span>
          </h2>
          <p className="mt-0.5 text-[11px] text-slate-500 line-clamp-2">
            {def.description}
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <Link
            to={`/agent/projects/${caseId}/bots/${seatId}`}
            className="rounded-full border border-violet-200 bg-violet-50 px-2.5 py-1 text-[10px] font-medium text-violet-900"
            data-testid="business-seat-open-expert"
            title="专家台打开本案过程（同 projectId）"
          >
            专家台 · 本案
          </Link>
          <button
            type="button"
            onClick={onAdvance}
            disabled={oaLocked}
            className="btn-press focus-ring rounded-md bg-slate-900 px-3 py-1.5 text-xs font-semibold text-white disabled:cursor-not-allowed disabled:opacity-40"
            data-testid="business-seat-advance"
            data-advance-label={btnLabel}
            title={
              oaLocked
                ? '须先确认递交'
                : btnLabel === '交卷待确认'
                  ? '完成本席交付步 · 写入待我确认'
                  : '完成本步 · 成果与办理过程随步更新'
            }
          >
            {btnLabel}
          </button>
        </div>
      </header>

      {oaLocked && (
        <p
          className="mb-2 rounded-lg border border-amber-200 bg-amber-50 px-2.5 py-1.5 text-[11px] text-amber-950"
          data-testid="business-seat-oa-locked"
        >
          审查答复未解锁 · 须先确认递交
        </p>
      )}

      <ol
        className="mb-3 flex flex-wrap gap-1.5"
        data-testid="business-seat-steps"
        aria-label="本席步骤进度（只读）"
        title="只读进度 · 不可点切"
      >
        {def.steps.map((s, i) => {
          const done = i < stepIndex
          const current = i === stepIndex
          return (
            <li
              key={s.id}
              className={`pointer-events-none cursor-default select-none rounded-full border px-2.5 py-1 text-[10px] font-medium ${
                done
                  ? 'border-emerald-200 bg-emerald-50 text-emerald-800'
                  : current
                    ? 'border-slate-800 bg-slate-900 text-white'
                    : 'border-slate-200 bg-white text-slate-500'
              }`}
              data-testid={`business-seat-step-${s.id}`}
              data-current={current ? '1' : '0'}
              aria-current={current ? 'step' : undefined}
            >
              {i + 1}. {s.label}
              {s.triggersHitl ? ' · 待交' : ''}
            </li>
          )
        })}
      </ol>

      {pendingForSeat.length > 0 && (
        <div
          className="mb-3 rounded-lg border border-amber-200 bg-amber-50/80 px-3 py-2"
          data-testid="business-seat-pending-gate"
        >
          <div className="text-[10px] font-semibold uppercase tracking-wider text-amber-800">
            待我确认（闸口 · 非唯一内容）
          </div>
          <ul className="mt-1 space-y-1">
            {pendingForSeat.map((item) => (
              <li key={item.id}>
                <Link
                  to={`/agent/pending/${item.id}`}
                  className="text-xs font-medium text-amber-950 underline"
                  data-testid={`business-seat-pending-${item.id}`}
                >
                  {item.title || CONFIRM_KIND_LABEL[item.kind]}
                </Link>
              </li>
            ))}
          </ul>
        </div>
      )}

      <div className="mb-3 grid min-h-0 gap-3 lg:grid-cols-2">
        <section
          className="rounded-xl border border-slate-200 bg-white shadow-sm"
          data-testid="business-seat-dual-file"
        >
          <div className="flex border-b border-slate-100">
            <button
              type="button"
              onClick={() => setTab('artifact')}
              className={`flex-1 px-2 py-2 text-[11px] font-semibold ${
                tab === 'artifact'
                  ? 'border-b-2 border-slate-900 text-slate-900'
                  : 'text-slate-400'
              }`}
              data-testid="business-dual-tab-artifact"
            >
              成果
              {submitted ? (
                <span className="ml-1 rounded bg-emerald-100 px-1 text-[9px] text-emerald-800">
                  已交卷
                </span>
              ) : null}
            </button>
            <button
              type="button"
              onClick={() => setTab('worklog')}
              className={`flex-1 px-2 py-2 text-[11px] font-semibold ${
                tab === 'worklog'
                  ? 'border-b-2 border-slate-900 text-slate-900'
                  : 'text-slate-400'
              }`}
              data-testid="business-dual-tab-worklog"
            >
              办理过程
              {flashBody && tab === 'worklog' ? (
                <span
                  className="ml-1 animate-pulse rounded bg-amber-100 px-1 text-[9px] text-amber-900"
                  data-testid="business-dual-worklog-flash"
                >
                  新
                </span>
              ) : null}
            </button>
          </div>
          {dual ? (
            <pre
              ref={bodyRef}
              className={`max-h-56 overflow-y-auto whitespace-pre-wrap p-3 font-mono text-[10px] leading-relaxed text-slate-700 transition-colors duration-500 ${
                flashBody ? 'bg-amber-50 ring-2 ring-amber-200 ring-inset' : ''
              }`}
              data-testid={
                tab === 'artifact'
                  ? 'business-dual-artifact-body'
                  : 'business-dual-worklog-body'
              }
              data-step-index={stepIndex}
            >
              <div className="mb-1 text-[9px] font-semibold text-slate-400">
                {tab === 'artifact' ? dual.artifactFile : dual.worklogFile}
              </div>
              {tab === 'artifact' ? artifactBody : worklogBody}
            </pre>
          ) : (
            <p className="p-3 text-xs text-slate-400">本席暂无双文件约定</p>
          )}
        </section>
        <div className="min-h-0">
          <CaseProcessPanel
            caseId={caseId}
            highlightLogId={flashLogId ?? undefined}
          />
        </div>
      </div>
    </div>
  )
}
