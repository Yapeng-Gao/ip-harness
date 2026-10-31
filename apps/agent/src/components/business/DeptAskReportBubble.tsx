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
import { buildAskEvidence } from '../../business/askEvidence'

type Props = {
  item: BusinessConfirmItem
  leadName: string
  leadSeed?: string
  /** 部门 slug · 审计深链 */
  deptSlug?: string
  busy?: boolean
  onConfirm: (
    confirmId: string,
    opts?: { reason?: string; riskAccepted?: boolean },
  ) => void | Promise<void>
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
  const [confirmReason, setConfirmReason] = useState('接受结论')
  const [riskAccepted, setRiskAccepted] = useState(false)
  const [msg, setMsg] = useState<string | null>(null)

  useEffect(() => {
    setReturnNote('')
    setConfirmReason('接受结论')
    setRiskAccepted(false)
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
      await onConfirm(item.id, {
        reason: confirmReason.trim() || '接受结论',
        riskAccepted,
      })
      setMsg(`已通过 · ${decision.decisionShort} · 已写入判断档案`)
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
      className={`max-w-[95%] rounded-[14px] border-[1.5px] px-3 py-3 text-[12px] leading-relaxed ${
        done
          ? item.status === 'confirmed'
            ? 'border-emerald-300 bg-emerald-50/90 text-emerald-950 shadow-sm'
            : 'border-rose-300 bg-rose-50/90 text-rose-950 shadow-sm'
          : 'border-amber-300 bg-gradient-to-b from-amber-50 to-white text-slate-900 shadow-[0_0_0_3px_rgba(251,191,36,0.22)]'
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
          <p className="flex flex-wrap items-center gap-1.5 text-[11px] font-semibold text-amber-900">
            <span className="truncate">{leadName}</span>
            <span
              className={`rounded-full px-1.5 py-0.5 text-[9px] font-bold tracking-wide ${
                done
                  ? item.status === 'confirmed'
                    ? 'bg-emerald-600/15 text-emerald-800'
                    : 'bg-rose-600/15 text-rose-800'
                  : 'bg-amber-500/15 text-amber-900'
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
            className="mt-1 text-[14px] font-bold leading-snug text-slate-900 text-balance"
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
        <AskEvidencePanel
          kind={item.kind}
          summary={item.summary}
          resultPreview={item.resultPreview}
          processPreview={item.processPreview}
          decisionMeaning={decision.decisionMeaning}
          confirmerLabel={decision.confirmerLabel}
          suggesterLabel={decision.suggesterLabel}
        />
      ) : null}

      {!done ? (
        <div className="mt-2.5 space-y-2" data-testid="dept-ask-report-acts">
          <label className="block space-y-1">
            <span className="text-[10px] font-medium text-slate-500">
              确认理由（写入判断档案）
            </span>
            <textarea
              rows={2}
              value={confirmReason}
              onChange={(e) => setConfirmReason(e.target.value)}
              placeholder="为何接受 / 修改点…"
              className="focus-ring w-full resize-none rounded-md border border-slate-200 bg-white px-2 py-1.5 text-[11px] text-slate-800"
              data-testid="dept-ask-confirm-reason"
            />
          </label>
          <label className="flex items-start gap-2 text-[11px] text-slate-600">
            <input
              type="checkbox"
              checked={riskAccepted}
              onChange={(e) => setRiskAccepted(e.target.checked)}
              className="mt-0.5"
              data-testid="dept-ask-risk-accept"
            />
            <span>我了解风险仍继续（认风险 · 写入档案）</span>
          </label>
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

function AskEvidencePanel(props: {
  kind: BusinessConfirmItem['kind']
  summary: string
  resultPreview?: string
  processPreview?: string
  decisionMeaning: string
  confirmerLabel: string
  suggesterLabel: string
}) {
  const bundle = buildAskEvidence({
    kind: props.kind,
    summary: props.summary,
    resultPreview: props.resultPreview,
    processPreview: props.processPreview,
  })
  return (
    <details
      className="mt-2 rounded-md border border-amber-100 bg-white/80 px-2 py-1.5"
      data-testid="ask-more"
      data-t4-sign-ready={bundle.signReady ? '1' : '0'}
    >
      <summary className="cursor-pointer select-none text-[10px] font-medium text-slate-500">
        展开依据链（结论·来源·推演·对比）
        {!bundle.signReady ? (
          <span className="ml-1 text-amber-700" data-testid="ask-t4-gap-tag">
            · 缺 {bundle.gapLabels.join('/')}
          </span>
        ) : (
          <span className="ml-1 text-emerald-700" data-testid="ask-t4-ready-tag">
            · 四件齐（演示）
          </span>
        )}
      </summary>
      <div className="mt-1.5 space-y-1.5 text-[11px] text-slate-600" data-testid="ask-more-body">
        <p className="text-[10px] text-slate-500">
          决策含义：{props.decisionMeaning}
        </p>
        <p className="text-[10px] text-slate-500">
          确认人：{props.confirmerLabel}
          <span className="text-slate-400"> · 建议者 {props.suggesterLabel}</span>
        </p>
        <ul className="space-y-1.5" data-testid="ask-t4-pieces">
          {bundle.pieces.map((piece) => (
            <li
              key={piece.id}
              className={
                piece.present
                  ? 'rounded-md border border-slate-200 bg-slate-50 px-2 py-1.5'
                  : 'rounded-md border border-amber-200 bg-amber-50/80 px-2 py-1.5'
              }
              data-testid={`ask-t4-${piece.id}`}
              data-present={piece.present ? '1' : '0'}
            >
              <p className="text-[10px] font-semibold text-slate-700">{piece.label}</p>
              <p className="mt-0.5 whitespace-pre-wrap text-[10px] leading-relaxed text-slate-600">
                {piece.body}
              </p>
            </li>
          ))}
        </ul>
        <p className="text-[9px] leading-relaxed text-slate-400" data-testid="ask-t4-honesty">
          理念 T4：无来源/推演/对比不得装「可签字」。本气泡不提供一键全绿；缺段须补材料或驳回改稿。
        </p>
        {props.resultPreview?.trim() ? (
          <pre
            className="max-h-20 overflow-auto whitespace-pre-wrap rounded bg-white p-2 text-[10px] leading-relaxed text-slate-500"
            data-testid="ask-result-preview"
          >
            {props.resultPreview.trim().slice(0, 400)}
          </pre>
        ) : null}
      </div>
    </details>
  )
}

function confirmStatusText(status: BusinessConfirmItem['status']): string {
  if (status === 'confirmed') return '已通过'
  if (status === 'returned') return '已驳回'
  return '待你确认'
}
