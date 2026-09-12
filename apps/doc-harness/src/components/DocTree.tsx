import type { DemoCase, Document, DocumentChapter, DocProposal } from '../types'

type Props = {
  demoCase: DemoCase
  document: Document
  chapters: DocumentChapter[]
  selectedChapterId: string
  pending: DocProposal | null
  onSelectChapter: (id: string) => void
}

export function DocTree({
  demoCase,
  document,
  chapters,
  selectedChapterId,
  pending,
  onSelectChapter,
}: Props) {
  const formalPending =
    pending?.status === 'pending' && pending.mode === 'formal' ? pending : null

  return (
    <aside className="flex h-full w-56 shrink-0 flex-col border-r border-slate-200/80 bg-slate-50/80">
      <div className="border-b border-slate-200/80 px-3 py-2.5">
        <div className="text-[11px] font-medium uppercase tracking-wide text-slate-400">
          文档树
        </div>
      </div>
      <nav className="flex-1 overflow-y-auto p-2 text-sm">
        <div className="mb-1 px-2 py-1 text-xs font-medium text-slate-700">
          {demoCase.title}
        </div>
        <div className="mb-1 ml-2 border-l border-slate-200 pl-2">
          <div className="px-2 py-1 text-xs text-slate-600">{document.title}</div>
          <ul className="mt-0.5 space-y-0.5">
            {chapters
              .slice()
              .sort((a, b) => a.sort - b.sort)
              .map((ch) => {
                const active = ch.id === selectedChapterId
                const hasPending = formalPending?.chapterId === ch.id
                return (
                  <li key={ch.id}>
                    <button
                      type="button"
                      onClick={() => onSelectChapter(ch.id)}
                      className={`btn-press focus-ring flex w-full items-center justify-between gap-1 rounded-md px-2 py-1.5 text-left text-xs ${
                        active
                          ? 'bg-white text-slate-900 shadow-[var(--shadow-rest)] ring-1 ring-slate-200'
                          : 'text-slate-600 hover:bg-white/70 hover:text-slate-800'
                      }`}
                    >
                      <span className="truncate">{ch.title}</span>
                      {hasPending ? (
                        <span
                          className="h-1.5 w-1.5 shrink-0 rounded-full bg-amber-500"
                          title="有未确认建议"
                        />
                      ) : null}
                    </button>
                  </li>
                )
              })}
          </ul>
        </div>
      </nav>
      <div className="border-t border-slate-200/80 px-3 py-2 text-[10px] leading-relaxed text-slate-400">
        caseId · {document.caseId}
        <br />
        stage · {document.stageId} · {document.handoffKey}
      </div>
    </aside>
  )
}
