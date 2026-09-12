import { FlaskConical, Sparkles } from 'lucide-react'
import type { CommandLogEntry, DocProposal } from '../types'
import { ConfirmBar } from './ConfirmBar'

type Props = {
  proposal: DocProposal | null
  commandLog: CommandLogEntry[]
  onDryRun: () => void
  onFormal: () => void
  onConfirm: () => void
  onReject: () => void
  actionsDisabled: boolean
}

export function AgentPanel({
  proposal,
  commandLog,
  onDryRun,
  onFormal,
  onConfirm,
  onReject,
  actionsDisabled,
}: Props) {
  const formalPending =
    proposal?.status === 'pending' && proposal.mode === 'formal' ? proposal : null
  const preview =
    proposal?.mode === 'dry-run' && proposal.status === 'preview' ? proposal : null
  const showBody = formalPending ?? preview

  return (
    <aside className="flex h-full w-80 shrink-0 flex-col border-l border-slate-200/80 bg-white">
      <div className="border-b border-slate-100 px-3 py-2.5">
        <div className="text-[11px] font-medium uppercase tracking-wide text-slate-400">
          Agent · mock
        </div>
        <p className="mt-0.5 text-[11px] text-slate-500">
          建议稿为本地脚本改写 · 非真 LLM / 非 DSH·Codex runtime
        </p>
      </div>

      <div className="flex flex-1 flex-col gap-3 overflow-y-auto p-3">
        <div className="flex gap-2">
          <button
            type="button"
            disabled={actionsDisabled}
            onClick={onDryRun}
            className="btn-press focus-ring inline-flex flex-1 items-center justify-center gap-1 rounded-lg border border-slate-200 bg-white px-2 py-2 text-[11px] font-medium text-slate-700 hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50"
            title="只追加 mock 建议预览，不落库、不进 Confirm 写入"
          >
            <FlaskConical className="h-3.5 w-3.5" aria-hidden />
            试运行
          </button>
          <button
            type="button"
            disabled={actionsDisabled}
            onClick={onFormal}
            className="btn-press focus-ring inline-flex flex-1 items-center justify-center gap-1 rounded-lg border border-slate-200 bg-slate-50 px-2 py-2 text-[11px] font-medium text-slate-800 hover:bg-white disabled:cursor-not-allowed disabled:opacity-50"
            title="生成正式建议，进入 HITL Confirm"
          >
            <Sparkles className="h-3.5 w-3.5 text-accent" aria-hidden />
            正式建议
          </button>
        </div>
        <p className="text-[10px] leading-relaxed text-slate-400">
          「请 Agent 改写当前章」= 正式建议。试运行仅预览，确认栏不启用写入。
        </p>

        {showBody ? (
          <div className="rounded-xl border border-slate-200 bg-slate-50/80 p-3">
            <div className="mb-1.5 flex items-center justify-between gap-2">
              <span className="text-[11px] font-medium text-slate-700">mock 建议稿</span>
              <span
                className={`rounded-full px-1.5 py-px text-[10px] ${
                  showBody.mode === 'formal'
                    ? 'bg-amber-100 text-amber-800'
                    : 'bg-slate-200 text-slate-600'
                }`}
              >
                {showBody.mode === 'formal' ? 'formal · pending' : 'dry-run · 不落库'}
              </span>
            </div>
            <pre className="max-h-48 overflow-auto whitespace-pre-wrap rounded-lg border border-slate-100 bg-white p-2 font-mono text-[11px] leading-relaxed text-slate-700">
              {showBody.proposedBody}
            </pre>
          </div>
        ) : (
          <div className="rounded-xl border border-dashed border-slate-200 px-3 py-6 text-center text-[11px] text-slate-400">
            尚无建议。试运行或正式建议后在此预览。
          </div>
        )}

        <ConfirmBar
          pending={formalPending}
          onConfirm={onConfirm}
          onReject={onReject}
        />

        <div className="mt-auto">
          <div className="mb-1.5 text-[11px] font-medium text-slate-500">
            命令日志（示意 · 内存）
          </div>
          {commandLog.length === 0 ? (
            <p className="text-[10px] text-slate-400">
              确认写入 → submitClaims；保存草稿 → saveDraft
            </p>
          ) : (
            <ul className="max-h-36 space-y-1.5 overflow-y-auto">
              {commandLog
                .slice()
                .reverse()
                .map((entry) => (
                  <li
                    key={entry.id}
                    className="rounded-md border border-slate-100 bg-slate-50 px-2 py-1.5 font-mono text-[10px] text-slate-600"
                  >
                    <div className="font-medium text-slate-800">{entry.command.type}</div>
                    <div className="truncate text-slate-400">{entry.meta.detail}</div>
                    {entry.meta.internalHint ? (
                      <div className="text-slate-400">hint · {entry.meta.internalHint}</div>
                    ) : null}
                    <div className="text-slate-400">
                      {new Date(entry.at).toLocaleString('zh-CN', { hour12: false })}
                    </div>
                  </li>
                ))}
            </ul>
          )}
        </div>
      </div>
    </aside>
  )
}
