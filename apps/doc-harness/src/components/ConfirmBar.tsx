import { Check, X } from 'lucide-react'
import type { DocProposal, MockCommandType } from '../types'

type Props = {
  pending: DocProposal | null
  /** 正式采纳将落入的 mock commandType（按章映射） */
  commandType: MockCommandType
  onConfirm: () => void
  onReject: () => void
}

export function ConfirmBar({ pending, commandType, onConfirm, onReject }: Props) {
  if (!pending || pending.status !== 'pending' || pending.mode !== 'formal') {
    return (
      <div className="rounded-xl border border-dashed border-slate-200 bg-slate-50/60 px-3 py-3 text-[11px] text-slate-400">
        ConfirmBar · 暂无正式待确认建议。「正式建议」进入此处；试运行不落库、不进闸。
      </div>
    )
  }

  return (
    <div className="rounded-xl border border-amber-200/80 bg-amber-50/50 p-3 shadow-[var(--shadow-rest)]">
      <div className="text-xs font-medium text-amber-900">
        HITL Confirm · 待确认
        {pending.hitlGateId ? (
          <span className="ml-1 font-normal text-amber-700/80">
            · 闸示意 {pending.hitlGateId}
          </span>
        ) : null}
      </div>
      <p className="mt-1 text-[11px] leading-relaxed text-amber-800/90">{pending.summary}</p>
      <p className="mt-1 text-[10px] text-amber-700/70">
        批准 → mock dispatch{' '}
        <code className="rounded bg-white/80 px-1 font-mono">{commandType}</code>
        （按当前章映射）· 写入 revision；驳回无 command、无 revision
      </p>
      <div className="mt-2.5 flex gap-2">
        <button
          type="button"
          onClick={onConfirm}
          className="btn-press focus-ring inline-flex flex-1 items-center justify-center gap-1.5 rounded-lg bg-slate-900 px-3 py-2 text-xs font-medium text-white hover:bg-slate-800"
        >
          <Check className="h-3.5 w-3.5" aria-hidden />
          确认写入
        </button>
        <button
          type="button"
          onClick={onReject}
          className="btn-press focus-ring inline-flex flex-1 items-center justify-center gap-1.5 rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs font-medium text-slate-700 hover:bg-slate-50"
        >
          <X className="h-3.5 w-3.5" aria-hidden />
          拒绝丢弃
        </button>
      </div>
    </div>
  )
}
