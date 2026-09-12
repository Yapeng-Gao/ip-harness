import type { DocumentChapter, DocumentRevision } from '../types'

type Props = {
  chapter: DocumentChapter
  revisions: DocumentRevision[]
  dirty: boolean
  onChangeBody: (body: string) => void
  onSaveDraft: () => void
}

export function ChapterEditor({
  chapter,
  revisions,
  dirty,
  onChangeBody,
  onSaveDraft,
}: Props) {
  const chapterRevs = revisions
    .filter((r) => r.chapterId === chapter.id)
    .slice()
    .sort((a, b) => b.seq - a.seq)
  const latest = chapterRevs[0]
  const revCount = chapterRevs.length

  return (
    <main className="flex min-w-0 flex-1 flex-col bg-white">
      <div className="flex items-start justify-between gap-3 border-b border-slate-100 px-4 py-3">
        <div className="min-w-0">
          <h1 className="text-base font-semibold text-slate-900">{chapter.title}</h1>
          <p className="mt-0.5 text-[11px] text-slate-500">
            textarea MVP · 手改后「保存草稿」→ mock <code className="font-mono">saveDraft</code>
          </p>
        </div>
        <div className="flex shrink-0 flex-col items-end gap-1.5">
          <div className="rounded-lg border border-slate-200 bg-slate-50 px-2.5 py-1.5 text-right text-[11px] text-slate-600">
            <div>
              revision · <span className="font-mono font-medium">{revCount}</span>
              {latest ? (
                <span className="text-slate-400"> · seq {latest.seq}</span>
              ) : null}
            </div>
            {latest ? (
              <div
                className="mt-0.5 max-w-[240px] truncate text-slate-400"
                title={latest.note ?? latest.commandType}
              >
                最近
                {latest.commandType ? ` · ${latest.commandType}` : ''}
                {latest.actor === 'agent' ? ' · Agent' : ' · 用户'}
              </div>
            ) : null}
          </div>
          <button
            type="button"
            disabled={!dirty}
            onClick={onSaveDraft}
            className="btn-press focus-ring rounded-lg border border-slate-200 bg-slate-50 px-2.5 py-1 text-[11px] font-medium text-slate-700 hover:bg-white disabled:cursor-not-allowed disabled:opacity-40"
          >
            保存草稿{dirty ? ' · dirty' : ''}
          </button>
        </div>
      </div>
      <div className="flex flex-1 flex-col p-4">
        <textarea
          className="focus-ring min-h-[280px] w-full flex-1 resize-y rounded-xl border border-slate-200 bg-slate-50/50 px-3 py-2.5 font-mono text-[13px] leading-relaxed text-slate-800 outline-none placeholder:text-slate-400 focus:border-slate-300 focus:bg-white"
          value={chapter.body}
          onChange={(e) => onChangeBody(e.target.value)}
          spellCheck={false}
          aria-label={`${chapter.title} 正文`}
        />
      </div>
    </main>
  )
}
