import { useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import {
  buildCaseAssistantSuggestions,
  patchCasePlan,
  type CaseAssistantSuggestion,
} from '../../business/caseAssistant'
import { useBusinessCases } from '../../business/BusinessCaseContext'
import { BUSINESS_STAGES, businessSeatLabel, type BusinessStageId } from '../../business/businessSeats'
import type { ProjectExpertId } from '../../projects/types'

type Props = {
  caseId: string
  stageId: BusinessStageId
  activeSeat: ProjectExpertId
  onSwitchSeat?: (seatId: ProjectExpertId) => void
}

/**
 * 案子助手面 · 巡检建议 ≤3 · 代发 feedback / 去确认 / 转 Word 示意 · 改本案计划
 */
export function CaseAssistantPanel({
  caseId,
  stageId,
  activeSeat,
  onSwitchSeat,
}: Props) {
  const {
    getPendingConfirms,
    getProgress,
    getCase,
    requestUpstreamFeedback,
    recordWordExportHint,
    updateCasePlan,
  } = useBusinessCases()
  const pending = getPendingConfirms(caseId)
  const prog = getProgress(caseId)
  const caseMeta = getCase(caseId)
  const [flash, setFlash] = useState<string | null>(null)
  const [open, setOpen] = useState(true)

  const stageTitle =
    BUSINESS_STAGES.find((s) => s.id === stageId)?.title ?? stageId
  const seatLabel = businessSeatLabel(activeSeat)

  const suggestions = useMemo(
    () =>
      buildCaseAssistantSuggestions({
        stageId,
        activeSeat,
        pending: pending.map((p) => ({
          id: p.id,
          kind: p.kind,
          title: p.title,
        })),
      }),
    [stageId, activeSeat, pending],
  )

  const runSuggestion = (s: CaseAssistantSuggestion) => {
    const a = s.action
    if (a.type === 'proxy_feedback') {
      const r = requestUpstreamFeedback(
        caseId,
        a.fromSeat,
        a.toSeat,
        a.reason,
      )
      if (r.ok) {
        setFlash(`已代发 · ${a.label}`)
        onSwitchSeat?.(a.toSeat)
      } else {
        setFlash(r.reason ?? '代发失败')
      }
      return
    }
    if (a.type === 'word_hint') {
      recordWordExportHint(caseId)
      setFlash('已记一行：转 Word 草案（示意）')
    }
  }

  const applyPlanPatch = (mode: 'complete_from_patrol' | 'rewrite') => {
    const next = patchCasePlan({
      mode,
      currentPlan: prog.casePlan,
      stageId,
      activeSeat,
      stageTitle,
      seatLabel,
      caseTitle: caseMeta?.title,
    })
    updateCasePlan(caseId, next)
    setFlash(
      mode === 'complete_from_patrol'
        ? '已按巡检补全本案计划'
        : '已改写本案计划',
    )
  }

  return (
    <section
      className="mb-4 rounded-xl border border-slate-200 bg-white shadow-sm"
      data-testid="case-assistant-panel"
    >
      <button
        type="button"
        className="flex w-full items-center justify-between px-3 py-2 text-left"
        onClick={() => setOpen((v) => !v)}
        data-testid="case-assistant-toggle"
      >
        <span className="text-xs font-semibold text-slate-800">
          案子助手 · 巡检建议
        </span>
        <span className="text-[10px] text-slate-400">
          {open ? '收起' : '展开'} · 样机
        </span>
      </button>
      {open && (
        <div className="space-y-2 border-t border-slate-100 px-3 py-2.5">
          <div
            className="rounded-lg border border-indigo-100 bg-indigo-50/50 px-2.5 py-2"
            data-testid="case-assistant-plan-block"
          >
            <div className="text-[11px] font-semibold text-slate-800">
              本案计划
            </div>
            <pre
              className="mt-1 max-h-28 overflow-y-auto whitespace-pre-wrap text-[11px] leading-relaxed text-slate-700"
              data-testid="case-assistant-plan-text"
            >
              {prog.casePlan?.trim() || '（尚未写入本案计划 · 可点下方补全/改写）'}
            </pre>
            <div className="mt-1.5 flex flex-wrap gap-1.5">
              <button
                type="button"
                onClick={() => applyPlanPatch('complete_from_patrol')}
                className="btn-press focus-ring rounded-md border border-indigo-200 bg-white px-2.5 py-1 text-[11px] font-medium text-indigo-900 hover:bg-indigo-50"
                data-testid="case-assistant-plan-complete"
              >
                按巡检补全计划
              </button>
              <button
                type="button"
                onClick={() => applyPlanPatch('rewrite')}
                className="btn-press focus-ring rounded-md border border-slate-200 bg-white px-2.5 py-1 text-[11px] font-medium text-slate-800 hover:bg-slate-50"
                data-testid="case-assistant-plan-rewrite"
              >
                改写本案计划
              </button>
            </div>
          </div>
          {suggestions.map((s) => (
            <div
              key={s.id}
              className="rounded-lg border border-slate-100 bg-slate-50/80 px-2.5 py-2"
              data-testid={`case-assistant-card-${s.id}`}
            >
              <div className="text-[12px] font-medium text-slate-900">
                {s.title}
              </div>
              <p className="mt-0.5 text-[11px] leading-relaxed text-slate-600">
                {s.body}
              </p>
              <div className="mt-1.5">
                {s.action.type === 'go_confirm' ? (
                  <Link
                    to={`/agent/pending/${s.action.confirmId}`}
                    className="btn-press focus-ring inline-flex rounded-md bg-amber-600 px-2.5 py-1 text-[11px] font-semibold text-white"
                    data-testid={`case-assistant-go-${s.id}`}
                  >
                    {s.action.label}
                  </Link>
                ) : (
                  <button
                    type="button"
                    onClick={() => runSuggestion(s)}
                    className="btn-press focus-ring rounded-md border border-slate-200 bg-white px-2.5 py-1 text-[11px] font-medium text-slate-800 hover:bg-slate-50"
                    data-testid={`case-assistant-act-${s.id}`}
                  >
                    {s.action.label}
                  </button>
                )}
              </div>
            </div>
          ))}
          {flash && (
            <p
              className="text-[11px] font-medium text-emerald-700"
              role="status"
              data-testid="case-assistant-flash"
            >
              {flash}
            </p>
          )}
        </div>
      )}
    </section>
  )
}
