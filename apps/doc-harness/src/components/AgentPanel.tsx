import { FlaskConical, Sparkles } from 'lucide-react'
import { paragraphDiff, stripHtml } from '../htmlText'
import type { CommandLogEntry, DocProposal } from '../types'
import { ConfirmBar } from './ConfirmBar'

type Props = {
  proposal: DocProposal | null
  currentBody: string
  commandLog: CommandLogEntry[]
  caseId: string
  onDryRun: () => void
  onFormal: () => void
  onConfirm: () => void
  onReject: () => void
  actionsDisabled: boolean
}

export function AgentPanel({
  proposal,
  currentBody,
  commandLog,
  caseId,
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
  const caseLog = commandLog.filter((e) => e.command.caseId === caseId)
  const diff = showBody
    ? paragraphDiff(currentBody, showBody.proposedBody)
    : null

  return (
    <div className="flex h-full min-h-0 flex-col">
      <div className="border-b border-slate-100 px-3 py-2.5">
        <div className="text-[11px] font-medium uppercase tracking-wide text-slate-400">
          Agent · mock
        </div>
        <p className="mt-0.5 text-[11px] text-slate-500">
          建议稿为本地模板改写 · 非真 LLM / 非 DSH·Codex runtime
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
            className="btn-press focus-ring inline-flex flex-1 items-center justify-center gap-1 rounded-lg bg-slate-900 px-2 py-2 text-[11px] font-medium text-white hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-50"
            title="生成正式建议，进入 HITL Confirm"
          >
            <Sparkles className="h-3.5 w-3.5" aria-hidden />
            正式建议
          </button>
        </div>
        <p className="text-[10px] leading-relaxed text-slate-400">
          「请 Agent 改写当前章」= 正式建议。试运行仅预览；确认写入时按 quote 重挂未解决批注。
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
            <p className="mb-2 text-[10px] leading-relaxed text-slate-500">{showBody.summary}</p>
            <div className="max-h-40 overflow-auto rounded-lg border border-slate-100 bg-white p-2.5">
              <div
                className="doc-proposal-preview"
                dangerouslySetInnerHTML={{ __html: showBody.proposedBody }}
              />
            </div>

            <div className="mt-2.5">
              <div className="mb-1 text-[10px] font-medium text-slate-500">
                前后对照（去标签 · 逐段）
              </div>
              <div className="grid grid-cols-1 gap-1.5 sm:grid-cols-2">
                <div className="rounded-md border border-slate-100 bg-white px-2 py-1.5">
                  <div className="mb-0.5 text-[10px] font-medium text-slate-400">当前章</div>
                  <ul className="max-h-28 space-y-1 overflow-auto">
                    {(diff?.before ?? []).map((line, i) => (
                      <li
                        key={`b-${i}`}
                        className="text-[10px] leading-relaxed text-slate-600"
                      >
                        {line}
                      </li>
                    ))}
                    {(diff?.before.length ?? 0) === 0 ? (
                      <li className="text-[10px] text-slate-400">（空）</li>
                    ) : null}
                  </ul>
                </div>
                <div className="rounded-md border border-slate-100 bg-white px-2 py-1.5">
                  <div className="mb-0.5 text-[10px] font-medium text-slate-400">建议稿</div>
                  <ul className="max-h-28 space-y-1 overflow-auto">
                    {(diff?.after ?? []).map((line, i) => (
                      <li
                        key={`a-${i}`}
                        className="text-[10px] leading-relaxed text-slate-600"
                      >
                        {line}
                      </li>
                    ))}
                    {(diff?.after.length ?? 0) === 0 ? (
                      <li className="text-[10px] text-slate-400">（空）</li>
                    ) : null}
                  </ul>
                </div>
              </div>
              <details className="mt-1.5">
                <summary className="cursor-pointer text-[10px] text-slate-400 hover:text-slate-600">
                  纯文本全文（去标签）
                </summary>
                <pre className="mt-1 max-h-20 overflow-auto whitespace-pre-wrap rounded-md border border-slate-100 bg-white px-2 py-1 font-sans text-[10px] text-slate-600">
                  {stripHtml(showBody.proposedBody) || '（空）'}
                </pre>
              </details>
            </div>
          </div>
        ) : (
          <div className="rounded-xl border border-dashed border-slate-200 bg-[var(--color-surface-50,#f5f5f7)] px-3 py-6 text-center">
            <div className="text-[12px] font-medium text-slate-700">尚无建议</div>
            <p className="mt-1 text-[11px] text-slate-500">
              试运行或正式建议后在此预览与对照。
            </p>
          </div>
        )}

        <ConfirmBar
          pending={formalPending}
          onConfirm={onConfirm}
          onReject={onReject}
        />

        <div className="mt-auto">
          <div className="mb-1.5 text-[11px] font-medium text-slate-500">
            命令日志 · 本案审计（caseId 过滤）
          </div>
          {caseLog.length === 0 ? (
            <p className="text-[10px] text-slate-400">
              确认写入 → submitClaims；保存草稿 → saveDraft · 按案隔离
            </p>
          ) : (
            <ul className="max-h-36 space-y-1.5 overflow-y-auto">
              {caseLog
                .slice()
                .reverse()
                .map((entry) => (
                  <li
                    key={entry.id}
                    className="rounded-md border border-slate-100 bg-slate-50 px-2 py-1.5 font-mono text-[10px] text-slate-600"
                  >
                    <div className="font-medium text-slate-800">{entry.command.type}</div>
                    <div className="truncate text-slate-400">{entry.meta.detail}</div>
                    <div className="text-slate-400">case · {entry.command.caseId}</div>
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
    </div>
  )
}
