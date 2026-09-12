import { ChevronDown, ChevronRight, FlaskConical, Sparkles } from 'lucide-react'
import { useState } from 'react'
import { paragraphDiff, stripHtml } from '../htmlText'
import type { CommandLogEntry, DocProposal, MockCommandType } from '../types'
import { ConfirmBar } from './ConfirmBar'

type Props = {
  proposal: DocProposal | null
  proposalHistory: DocProposal[]
  currentBody: string
  commandLog: CommandLogEntry[]
  caseId: string
  /** 当前章正式采纳将落入的 commandType */
  confirmCommandType: MockCommandType
  onDryRun: () => void
  onFormal: () => void
  onConfirm: () => void
  onReject: () => void
  actionsDisabled: boolean
  disabledReason?: string | null
}

const STATUS_BADGE: Record<DocProposal['status'], string> = {
  pending: 'bg-amber-100 text-amber-800',
  accepted: 'bg-emerald-100 text-emerald-800',
  rejected: 'bg-slate-200 text-slate-600',
  preview: 'bg-sky-100 text-sky-800',
}

const STATUS_LABEL: Record<DocProposal['status'], string> = {
  pending: 'pending',
  accepted: '已采纳',
  rejected: '已拒绝',
  preview: '试运行',
}

export function AgentPanel({
  proposal,
  proposalHistory,
  currentBody,
  commandLog,
  caseId,
  confirmCommandType,
  onDryRun,
  onFormal,
  onConfirm,
  onReject,
  actionsDisabled,
  disabledReason = null,
}: Props) {
  const [diffExpanded, setDiffExpanded] = useState(false)
  const [historyBodyId, setHistoryBodyId] = useState<string | null>(null)

  const formalPending =
    proposal?.status === 'pending' && proposal.mode === 'formal' ? proposal : null
  const preview =
    proposal?.mode === 'dry-run' && proposal.status === 'preview' ? proposal : null
  const showBody = formalPending ?? preview
  const caseLog = commandLog.filter((e) => e.command.caseId === caseId)
  const diff = showBody
    ? paragraphDiff(currentBody, showBody.proposedBody)
    : null

  const historyView = historyBodyId
    ? proposalHistory.find((p) => p.id === historyBodyId) ?? null
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
        {actionsDisabled && disabledReason ? (
          <p
            className="rounded-md border border-slate-200 bg-slate-50 px-2 py-1.5 text-[11px] leading-relaxed text-slate-600"
            role="status"
          >
            {disabledReason}
          </p>
        ) : null}
        <p className="text-[10px] leading-relaxed text-slate-400">
          「请 Agent 改写当前章」= 正式建议。试运行仅预览；确认写入时按 quote 重挂未解决批注。
        </p>

        {/* Confirm 置顶可见 */}
        <ConfirmBar
          pending={formalPending}
          commandType={confirmCommandType}
          onConfirm={onConfirm}
          onReject={onReject}
        />

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

            <button
              type="button"
              onClick={() => setDiffExpanded((v) => !v)}
              className="btn-press focus-ring mb-2 flex w-full items-center justify-between gap-2 rounded-lg border border-slate-200 bg-white px-2.5 py-2 text-left text-[11px] font-medium text-slate-700 hover:bg-slate-50"
              aria-expanded={diffExpanded}
            >
              <span className="flex items-center gap-1">
                {diffExpanded ? (
                  <ChevronDown className="h-3.5 w-3.5 text-slate-500" aria-hidden />
                ) : (
                  <ChevronRight className="h-3.5 w-3.5 text-slate-500" aria-hidden />
                )}
                建议预览 / Diff
              </span>
              <span className="text-[10px] font-normal text-slate-400">
                {diffExpanded ? '收起' : '展开（默认折叠）'}
              </span>
            </button>

            {diffExpanded ? (
              <div className="space-y-3">
                <div className="rounded-lg border border-slate-200 bg-white p-3">
                  <div className="mb-1.5 text-[10px] font-medium uppercase tracking-wide text-slate-500">
                    建议稿全文
                  </div>
                  <div className="max-h-44 overflow-auto rounded-md border border-slate-100 bg-slate-50/50 p-3">
                    <div
                      className="doc-proposal-preview"
                      dangerouslySetInnerHTML={{ __html: showBody.proposedBody }}
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <div className="text-[10px] font-medium text-slate-500">
                    前后对照 · 当前 → 建议（去标签 · 逐段 · 单列）
                  </div>
                  <div className="rounded-lg border border-slate-200 bg-white p-3">
                    <div className="mb-1 text-[10px] font-semibold text-slate-500">当前章</div>
                    <ul className="max-h-32 space-y-1.5 overflow-auto">
                      {(diff?.before ?? []).map((line, i) => (
                        <li
                          key={`b-${i}`}
                          className="text-[11px] leading-relaxed text-slate-600"
                        >
                          {line}
                        </li>
                      ))}
                      {(diff?.before.length ?? 0) === 0 ? (
                        <li className="text-[11px] text-slate-400">（空）</li>
                      ) : null}
                    </ul>
                  </div>
                  <div className="flex justify-center text-[10px] font-medium text-slate-400">
                    ↓ 建议
                  </div>
                  <div className="rounded-lg border border-slate-300 bg-white p-3 shadow-sm">
                    <div className="mb-1 text-[10px] font-semibold text-slate-700">建议稿</div>
                    <ul className="max-h-32 space-y-1.5 overflow-auto">
                      {(diff?.after ?? []).map((line, i) => (
                        <li
                          key={`a-${i}`}
                          className="text-[11px] leading-relaxed text-slate-700"
                        >
                          {line}
                        </li>
                      ))}
                      {(diff?.after.length ?? 0) === 0 ? (
                        <li className="text-[11px] text-slate-400">（空）</li>
                      ) : null}
                    </ul>
                  </div>
                </div>

                <details className="rounded-md border border-slate-100 bg-white px-2.5 py-2">
                  <summary className="cursor-pointer text-[10px] text-slate-400 hover:text-slate-600">
                    纯文本全文（去标签）
                  </summary>
                  <pre className="mt-1.5 max-h-24 overflow-auto whitespace-pre-wrap font-sans text-[10px] leading-relaxed text-slate-600">
                    {stripHtml(showBody.proposedBody) || '（空）'}
                  </pre>
                </details>
              </div>
            ) : null}
          </div>
        ) : (
          <div className="rounded-xl border border-dashed border-slate-200 bg-[var(--color-surface-50,#f5f5f7)] px-3 py-6 text-center">
            <div className="text-[12px] font-medium text-slate-700">尚无建议</div>
            <p className="mt-1 text-[11px] text-slate-500">
              试运行或正式建议后在此预览与对照。
            </p>
          </div>
        )}

        {/* 提案历史 */}
        <div>
          <div className="mb-1.5 text-[11px] font-medium text-slate-500">
            提案历史 · {proposalHistory.length}
          </div>
          {proposalHistory.length === 0 ? (
            <p className="text-[10px] text-slate-400">
              采纳 / 拒绝 / 试运行结束时归档到此 · 只读，不改正文
            </p>
          ) : (
            <ul className="max-h-40 space-y-1.5 overflow-y-auto">
              {proposalHistory
                .slice()
                .reverse()
                .map((p) => (
                  <li key={p.id}>
                    <button
                      type="button"
                      onClick={() =>
                        setHistoryBodyId((cur) => (cur === p.id ? null : p.id))
                      }
                      className={`btn-press focus-ring w-full rounded-md border px-2 py-1.5 text-left ${
                        historyBodyId === p.id
                          ? 'border-slate-300 bg-slate-100'
                          : 'border-slate-100 bg-slate-50 hover:border-slate-200'
                      }`}
                    >
                      <div className="flex items-center justify-between gap-2">
                        <span className="truncate text-[11px] text-slate-700">
                          {p.summary}
                        </span>
                        <span
                          className={`shrink-0 rounded-full px-1.5 py-px text-[10px] ${STATUS_BADGE[p.status]}`}
                        >
                          {STATUS_LABEL[p.status]}
                        </span>
                      </div>
                      <div className="mt-0.5 text-[10px] text-slate-400">
                        {p.mode} ·{' '}
                        {new Date(p.createdAt).toLocaleString('zh-CN', {
                          hour12: false,
                        })}
                      </div>
                    </button>
                    {historyBodyId === p.id ? (
                      <div className="mt-1 max-h-28 overflow-auto rounded-md border border-slate-200 bg-white p-2.5">
                        <div className="mb-1 text-[10px] text-slate-400">
                          只读 · 当时 proposedBody
                        </div>
                        <div
                          className="doc-proposal-preview text-[11px]"
                          dangerouslySetInnerHTML={{ __html: p.proposedBody }}
                        />
                      </div>
                    ) : null}
                  </li>
                ))}
            </ul>
          )}
          {historyView ? null : null}
        </div>

        <div className="mt-auto">
          <div className="mb-1.5 text-[11px] font-medium text-slate-500">
            命令日志 · 本案审计（caseId 过滤）
          </div>
          {caseLog.length === 0 ? (
            <p className="text-[10px] text-slate-400">
              确认写入 → 按章映射 commandType；手改保存 → saveDraft · 按案隔离
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
