import {
  CheckCircle2,
  ChevronDown,
  ChevronRight,
  MessageSquarePlus,
  RotateCcw,
  Trash2,
} from 'lucide-react'
import { useState } from 'react'
import type { Annotation, AnnotationDraft } from '../types'

type Props = {
  annotations: Annotation[]
  activeAnnotationId: string | null
  draft: AnnotationDraft | null
  draftBody: string
  onDraftBodyChange: (v: string) => void
  onSubmitDraft: () => void
  onCancelDraft: () => void
  onSelect: (id: string) => void
  onReply: (id: string, body: string) => void
  onToggleResolved: (id: string) => void
  onDelete: (id: string) => void
}

export function AnnotationPanel({
  annotations,
  activeAnnotationId,
  draft,
  draftBody,
  onDraftBodyChange,
  onSubmitDraft,
  onCancelDraft,
  onSelect,
  onReply,
  onToggleResolved,
  onDelete,
}: Props) {
  const [replyDrafts, setReplyDrafts] = useState<Record<string, string>>({})
  const [hideResolved, setHideResolved] = useState(false)
  const [resolvedCollapsed, setResolvedCollapsed] = useState(true)
  const open = annotations.filter((a) => !a.resolved)
  const resolved = annotations.filter((a) => a.resolved)
  const showResolved = !hideResolved && resolved.length > 0

  return (
    <div className="flex flex-1 flex-col gap-3 overflow-y-auto p-3">
      <p className="text-[10px] leading-relaxed text-slate-400">
        TipTap Mark 批注样机 · 选中正文后工具栏「加批注」→ 本栏提交 · 非 Word 修订/协同
      </p>

      {draft ? (
        <div className="rounded-xl border border-slate-200 bg-slate-50 p-3 shadow-[var(--shadow-rest)]">
          <div className="text-[11px] font-medium text-slate-800">新建批注</div>
          <blockquote className="mt-1.5 border-l-2 border-slate-300 pl-2 text-[11px] italic leading-relaxed text-slate-600">
            「{draft.quote}」
          </blockquote>
          <textarea
            value={draftBody}
            onChange={(e) => onDraftBodyChange(e.target.value)}
            placeholder="输入批注内容…"
            rows={3}
            className="ui-input mt-2 w-full resize-y rounded-md border border-slate-200 bg-white px-2 py-1.5 text-[12px] text-slate-800 placeholder:text-slate-400"
            aria-label="批注内容"
            autoFocus
          />
          <div className="mt-2 flex gap-2">
            <button
              type="button"
              disabled={!draftBody.trim()}
              onClick={onSubmitDraft}
              className="btn-press focus-ring flex-1 rounded-md bg-slate-900 px-2.5 py-1.5 text-[11px] font-medium text-white hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-40"
            >
              提交批注
            </button>
            <button
              type="button"
              onClick={onCancelDraft}
              className="btn-press focus-ring rounded-md border border-slate-200 bg-white px-2.5 py-1.5 text-[11px] font-medium text-slate-700 hover:bg-slate-50"
            >
              取消
            </button>
          </div>
        </div>
      ) : null}

      {annotations.length === 0 && !draft ? (
        <div className="ui-empty rounded-xl border border-dashed border-slate-200 bg-[var(--color-surface-50,#f5f5f7)] px-3 py-8 text-center">
          <div className="text-[12px] font-medium text-slate-700">本章尚无批注</div>
          <p className="mt-1 text-[11px] leading-relaxed text-slate-500">
            在纸面选中文字，点工具栏「加批注」，于本栏填写并提交。
          </p>
          <button
            type="button"
            className="btn-press focus-ring mt-3 rounded-md bg-slate-900 px-2.5 py-1.5 text-[11px] font-medium text-white hover:bg-slate-800"
            onClick={() => {
              /* 引导 · 无自动选区 */
            }}
            title="请先在纸面选中文字"
          >
            去选中正文
          </button>
        </div>
      ) : null}

      {annotations.length > 0 && open.length === 0 && !draft ? (
        <div className="rounded-xl border border-dashed border-slate-200 bg-[var(--color-surface-50,#f5f5f7)] px-3 py-5 text-center">
          <div className="text-[12px] font-medium text-slate-700">全部已解决</div>
          <p className="mt-1 text-[11px] text-slate-500">
            可取消解决以重新打开，或继续在正文加批注。
          </p>
        </div>
      ) : null}

      {resolved.length > 0 ? (
        <div className="flex items-center justify-between gap-2">
          <button
            type="button"
            onClick={() => setHideResolved((v) => !v)}
            className="btn-press focus-ring rounded-md px-2 py-1 text-[10px] text-slate-500 hover:bg-slate-100 hover:text-slate-700"
          >
            {hideResolved ? '显示已解决' : '隐藏已解决'} · {resolved.length}
          </button>
        </div>
      ) : null}

      {open.length > 0 ? (
        <section>
          <div className="mb-1.5 text-[11px] font-medium text-slate-500">
            未解决 · {open.length}
          </div>
          <ul className="space-y-2">
            {open.map((a) => (
              <AnnotationCard
                key={a.id}
                annotation={a}
                active={a.id === activeAnnotationId}
                replyDraft={replyDrafts[a.id] ?? ''}
                onReplyDraftChange={(v) =>
                  setReplyDrafts((prev) => ({ ...prev, [a.id]: v }))
                }
                onSelect={() => onSelect(a.id)}
                onReply={() => {
                  const body = (replyDrafts[a.id] ?? '').trim()
                  if (!body) return
                  onReply(a.id, body)
                  setReplyDrafts((prev) => ({ ...prev, [a.id]: '' }))
                }}
                onToggleResolved={() => onToggleResolved(a.id)}
                onDelete={() => onDelete(a.id)}
              />
            ))}
          </ul>
        </section>
      ) : null}

      {showResolved ? (
        <section>
          <button
            type="button"
            onClick={() => setResolvedCollapsed((v) => !v)}
            className="btn-press focus-ring mb-1.5 flex w-full items-center gap-1 text-[11px] font-medium text-slate-400 hover:text-slate-600"
          >
            {resolvedCollapsed ? (
              <ChevronRight className="h-3.5 w-3.5" aria-hidden />
            ) : (
              <ChevronDown className="h-3.5 w-3.5" aria-hidden />
            )}
            已解决 · {resolved.length}
          </button>
          {!resolvedCollapsed ? (
            <ul className="space-y-2 opacity-75">
              {resolved.map((a) => (
                <AnnotationCard
                  key={a.id}
                  annotation={a}
                  active={a.id === activeAnnotationId}
                  replyDraft={replyDrafts[a.id] ?? ''}
                  onReplyDraftChange={(v) =>
                    setReplyDrafts((prev) => ({ ...prev, [a.id]: v }))
                  }
                  onSelect={() => onSelect(a.id)}
                  onReply={() => {
                    const body = (replyDrafts[a.id] ?? '').trim()
                    if (!body) return
                    onReply(a.id, body)
                    setReplyDrafts((prev) => ({ ...prev, [a.id]: '' }))
                  }}
                  onToggleResolved={() => onToggleResolved(a.id)}
                  onDelete={() => onDelete(a.id)}
                />
              ))}
            </ul>
          ) : null}
        </section>
      ) : null}
    </div>
  )
}

function AnnotationCard({
  annotation,
  active,
  replyDraft,
  onReplyDraftChange,
  onSelect,
  onReply,
  onToggleResolved,
  onDelete,
}: {
  annotation: Annotation
  active: boolean
  replyDraft: string
  onReplyDraftChange: (v: string) => void
  onSelect: () => void
  onReply: () => void
  onToggleResolved: () => void
  onDelete: () => void
}) {
  return (
    <li
      className={`rounded-xl border p-2.5 transition-colors ${
        active
          ? 'border-slate-400 bg-[var(--color-accent-soft,#e8f2ff)] shadow-sm ring-1 ring-[var(--color-accent,#007aff)]/30'
          : 'border-slate-200 bg-white hover:border-slate-300'
      }`}
    >
      <button type="button" onClick={onSelect} className="w-full text-left">
        <div className="flex items-center justify-between gap-2">
          <span className="text-[11px] font-medium text-slate-800">
            {annotation.author}
          </span>
          <time className="text-[10px] text-slate-400">
            {new Date(annotation.createdAt).toLocaleString('zh-CN', {
              hour12: false,
            })}
          </time>
        </div>
        {annotation.orphan ? (
          <div className="mt-1 rounded-md border border-amber-200 bg-amber-50 px-1.5 py-0.5 text-[10px] text-amber-800">
            Mark 缺失（orphan）· 列表保留，纸面未找到摘录
          </div>
        ) : null}
        <blockquote className="mt-1.5 border-l-2 border-slate-300 pl-2 text-[11px] italic leading-relaxed text-slate-600">
          「{annotation.quote}」
        </blockquote>
        <p className="mt-1.5 text-[12px] leading-relaxed text-slate-800">
          {annotation.body}
        </p>
      </button>

      {annotation.replies.length > 0 ? (
        <ul className="mt-2 space-y-1.5 border-t border-slate-100 pt-2">
          {annotation.replies.map((r) => (
            <li
              key={r.id}
              className="rounded-md bg-slate-50 px-2 py-1.5 text-[11px] text-slate-700"
            >
              <div className="flex justify-between gap-2 text-[10px] text-slate-400">
                <span>{r.author}</span>
                <time>
                  {new Date(r.createdAt).toLocaleString('zh-CN', {
                    hour12: false,
                  })}
                </time>
              </div>
              <p className="mt-0.5">{r.body}</p>
            </li>
          ))}
        </ul>
      ) : null}

      <div className="mt-2 flex items-center gap-1">
        <input
          type="text"
          value={replyDraft}
          onChange={(e) => onReplyDraftChange(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter') {
              e.preventDefault()
              onReply()
            }
          }}
          placeholder="回复…"
          className="focus-ring min-w-0 flex-1 rounded-md border border-slate-200 bg-white px-2 py-1 text-[11px] text-slate-800 placeholder:text-slate-400"
          aria-label="回复批注"
        />
        <button
          type="button"
          title="发送回复"
          aria-label="发送回复"
          disabled={!replyDraft.trim()}
          onClick={onReply}
          className="btn-press focus-ring inline-flex h-7 w-7 items-center justify-center rounded-md text-slate-600 hover:bg-slate-100 disabled:opacity-30"
        >
          <MessageSquarePlus className="h-3.5 w-3.5" aria-hidden />
        </button>
        <button
          type="button"
          title={annotation.resolved ? '取消解决' : '解决'}
          aria-label={annotation.resolved ? '取消解决' : '解决'}
          onClick={onToggleResolved}
          className="btn-press focus-ring inline-flex h-7 w-7 items-center justify-center rounded-md text-slate-600 hover:bg-slate-100"
        >
          {annotation.resolved ? (
            <RotateCcw className="h-3.5 w-3.5" aria-hidden />
          ) : (
            <CheckCircle2 className="h-3.5 w-3.5" aria-hidden />
          )}
        </button>
        <button
          type="button"
          title="删除批注"
          aria-label="删除批注"
          onClick={onDelete}
          className="btn-press focus-ring inline-flex h-7 w-7 items-center justify-center rounded-md text-slate-500 hover:bg-red-50 hover:text-red-600"
        >
          <Trash2 className="h-3.5 w-3.5" aria-hidden />
        </button>
      </div>
    </li>
  )
}
