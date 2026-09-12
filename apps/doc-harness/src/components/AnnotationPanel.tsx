import { CheckCircle2, MessageSquarePlus, RotateCcw, Trash2 } from 'lucide-react'
import { useState } from 'react'
import type { Annotation } from '../types'

type Props = {
  annotations: Annotation[]
  activeAnnotationId: string | null
  onSelect: (id: string) => void
  onReply: (id: string, body: string) => void
  onToggleResolved: (id: string) => void
  onDelete: (id: string) => void
}

export function AnnotationPanel({
  annotations,
  activeAnnotationId,
  onSelect,
  onReply,
  onToggleResolved,
  onDelete,
}: Props) {
  const [replyDrafts, setReplyDrafts] = useState<Record<string, string>>({})
  const open = annotations.filter((a) => !a.resolved)
  const resolved = annotations.filter((a) => a.resolved)

  return (
    <div className="flex flex-1 flex-col gap-3 overflow-y-auto p-3">
      <p className="text-[10px] leading-relaxed text-slate-400">
        TipTap Mark 批注样机 · 选中正文后工具栏「加批注」· 非 Word 修订/协同
      </p>

      {annotations.length === 0 ? (
        <div className="rounded-xl border border-dashed border-slate-200 px-3 py-8 text-center text-[11px] text-slate-400">
          本章尚无批注。选中纸面文字后点「加批注」。
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

      {resolved.length > 0 ? (
        <section>
          <div className="mb-1.5 text-[11px] font-medium text-slate-400">
            已解决 · {resolved.length}
          </div>
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
          ? 'border-amber-300 bg-amber-50/80 shadow-sm'
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
        <blockquote className="mt-1.5 border-l-2 border-amber-300 pl-2 text-[11px] italic leading-relaxed text-slate-600">
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
