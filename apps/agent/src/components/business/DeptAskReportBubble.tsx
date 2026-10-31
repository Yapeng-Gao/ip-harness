import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import type { BusinessConfirmItem } from '../../business/BusinessCaseContext'
import {
  canRejectConfirm,
  confirmDecisionMeta,
  passConfirmEnabled,
  resolveConfirmActorKind,
} from '../../business/confirmGate'
import { useEntryRole } from '../../business/useEntryRole'
import { ExpertAvatar } from '../departments/ExpertAvatar'
import { pendingAuditPath } from '../../business/pendingDeptQuery'

type Props = {
  item: BusinessConfirmItem
  leadName: string
  leadSeed?: string
  /** 部门 slug · 审计深链 */
  deptSlug?: string
  busy?: boolean
  onConfirm: (confirmId: string) => void | Promise<void>
  onReturn: (confirmId: string, note: string) => void | Promise<void>
}

/**
 * 右栏硬请示 · 汇报气泡（从 main-path-sample agentReportBubble / askBubbleBodyHtml 并入）
 * 一句结论 + 主钮；依据/理由默认折进「展开」；拍板就地，不另开确认墙。
 */
export function DeptAskReportBubble({
  item,
  leadName,
  leadSeed,
  deptSlug,
  busy = false,
  onConfirm,
  onReturn,
}: Props) {
  const { entryRole } = useEntryRole()
  const decision = confirmDecisionMeta(item.kind)
  const actor = resolveConfirmActorKind(entryRole)
  const [returnNote, setReturnNote] = useState('')
  const [msg, setMsg] = useState<string | null>(null)

  useEffect(() => {
    setReturnNote('')
    setMsg(null)
  }, [item.id])

  const passOk = passConfirmEnabled({
    status: item.status,
    actor,
    resultPreview: item.resultPreview,
  })
  const rejectOk = canRejectConfirm(returnNote)
  const done = item.status !== 'pending'
  const shortSummary =
    item.summary.length > 72 ? `${item.summary.slice(0, 72)}…` : item.summary

  const handleConfirm = () => {
    if (!passOk || busy || done) return
    void (async () => {
      setMsg(null)
      await onConfirm(item.id)
      setMsg(`已通过 · ${decision.decisionShort}`)
    })()
  }

  const handleReturn = () => {
    if (!rejectOk || busy || done) return
    void (async () => {
      setMsg(null)
      await onReturn(item.id, returnNote.trim())
      setMsg('已驳回 · 退回当前部门改稿')
    })()
  }

  return (
    <div
      className={`max-w-[95%] rounded-2xl rounded-tl-md border px-3 py-2.5 text-[12px] leading-relaxed shadow-sm ${
        done
          ? item.status === 'confirmed'
            ? 'border-emerald-200 bg-emerald-50/90 text-emerald-950'
            : 'border-rose-200 bg-rose-50/90 text-rose-950'
          : 'border-violet-200/80 bg-violet-50 text-slate-900'
      }`}
      role="status"
      data-testid="dept-ask-bubble-confirm"
      data-ask-kind="confirm"
      data-confirm-id={item.id}
      data-confirm-status={item.status}
      data-awaiting-banner={done ? '0' : '1'}
    >
      <span className="sr-only" data-testid="dept-awaiting-confirm-banner">
        {done ? confirmStatusText(item.status) : '待你确认'}
      </span>

      <div className="flex items-start gap-2" data-testid="dept-ask-bubble-head">
        <ExpertAvatar name={leadName} seed={leadSeed} size="sm" />
        <div className="min-w-0 flex-1">
          <p className="flex flex-wrap items-center gap-1.5 text-[11px] font-semibold text-violet-800">
            <span className="truncate">{leadName}</span>
            <span
              className={`rounded-full px-1.5 py-0.5 text-[9px] font-bold tracking-wide ${
                done
                  ? item.status === 'confirmed'
                    ? 'bg-emerald-600/15 text-emerald-800'
                    : 'bg-rose-600/15 text-rose-800'
                  : 'bg-violet-600/15 text-violet-800'
              }`}
              data-testid="dept-ask-rpt-tag"
            >
              {done
                ? item.status === 'confirmed'
                  ? '已确认'
                  : '已驳回'
                : '要你拍'}
            </span>
          </p>
          <p
            className="mt-1 text-[12px] font-semibold leading-snug text-slate-900"
            data-testid="dept-ask-rpt-q"
          >
            {item.title || decision.decisionShort}
          </p>
          {!done ? (
            <p className="mt-0.5 text-[11px] text-slate-600" title={item.summary}>
              {shortSummary}
            </p>
          ) : null}
        </div>
      </div>

      {!done ? (
        <details className="mt-2 rounded-md border border-violet-100 bg-white/70 px-2 py-1.5" data-testid="ask-more">
          <summary className="cursor-pointer select-none text-[10px] font-medium text-slate-500">
            展开依据与理由
          </summary>
          <div className="mt-1.5 space-y-1.5 text-[11px] text-slate-600" data-testid="ask-more-body">
            <p>
              <span className="font-medium text-slate-700">决策含义：</span>
              {decision.decisionMeaning}
            </p>
            <p>
              <span className="font-medium text-slate-700">确认人：</span>
              {decision.confirmerLabel}
              <span className="text-slate-400"> · 建议者 {decision.suggesterLabel}</span>
            </p>
            {item.resultPreview?.trim() ? (
              <pre
                className="max-h-28 overflow-auto whitespace-pre-wrap rounded bg-slate-50 p-2 text-[10px] leading-relaxed text-slate-700"
                data-testid="ask-result-preview"
              >
                {item.resultPreview.trim().slice(0, 600)}
              </pre>
            ) : null}
            {item.processPreview?.trim() ? (
              <p className="text-[10px] text-slate-500" data-testid="ask-process-preview">
                过程：{item.processPreview.trim().slice(0, 160)}
              </p>
            ) : null}
          </div>
        </details>
      ) : null}

      {!done ? (
        <div className="mt-2.5 space-y-2" data-testid="dept-ask-report-acts">
          <button
            type="button"
            onClick={handleConfirm}
            disabled={!passOk || busy}
            className="btn-press focus-ring inline-flex w-full items-center justify-center rounded-full bg-slate-900 px-3 py-1.5 text-[11px] font-semibold text-white disabled:cursor-not-allowed disabled:opacity-50"
            data-testid="dept-right-confirm-link"
            data-ask-confirm="1"
            title={!passOk ? '材料未齐或当前身份不可自批' : decision.decisionShort}
          >
            {busy ? '提交中…' : `确认 · ${decision.decisionShort}`}
          </button>
          <div className="space-y-1">
            <label className="sr-only" htmlFor={`ask-return-${item.id}`}>
              驳回意见
            </label>
            <textarea
              id={`ask-return-${item.id}`}
              rows={2}
              value={returnNote}
              onChange={(e) => setReturnNote(e.target.value)}
              placeholder="驳回须填意见…"
              className="focus-ring w-full resize-none rounded-md border border-slate-200 bg-white px-2 py-1.5 text-[11px] text-slate-800 placeholder:text-slate-400"
              data-testid="dept-ask-return-note"
            />
            <button
              type="button"
              onClick={handleReturn}
              disabled={!rejectOk || busy}
              className="btn-press focus-ring inline-flex w-full items-center justify-center rounded-full border border-slate-300 bg-white px-3 py-1.5 text-[11px] font-medium text-slate-700 disabled:cursor-not-allowed disabled:opacity-50"
              data-testid="dept-ask-return-btn"
            >
              驳回并退回改稿
            </button>
          </div>
          <p className="text-center text-[9px] text-slate-400">
            拍板在对话里完成 ·{' '}
            <Link
              to={pendingAuditPath(item.id, deptSlug)}
              className="underline-offset-2 hover:underline"
              data-testid="dept-ask-audit-link"
            >
              审计页
            </Link>
          </p>
        </div>
      ) : null}

      {msg ? (
        <p className="mt-2 text-[10px] font-medium text-slate-600" data-testid="dept-ask-done-msg">
          {msg}
        </p>
      ) : null}
    </div>
  )
}

function confirmStatusText(status: BusinessConfirmItem['status']): string {
  if (status === 'confirmed') return '已通过'
  if (status === 'returned') return '已驳回'
  return '待你确认'
}
