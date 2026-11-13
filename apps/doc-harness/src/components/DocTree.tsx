import type {
  Annotation,
  DemoCase,
  Document,
  DocumentChapter,
  DocumentRevision,
  DocProposal,
} from '../types'
import { Lock } from 'lucide-react'
import { RevisionTimeline } from './RevisionTimeline'

type Props = {
  activeCase: DemoCase
  document: Document
  chapters: DocumentChapter[]
  selectedChapterId: string
  pending: DocProposal | null
  annotations: Annotation[]
  chapterRevisions: DocumentRevision[]
  previewRevisionId: string | null
  timelineCollapsed: boolean
  onToggleTimeline: () => void
  onSelectChapter: (id: string) => void
  onPreviewRevision: (rev: DocumentRevision) => void
  onRequestRestore: (rev: DocumentRevision) => void
  onExitPreview: () => void
}

export function DocTree({
  activeCase,
  document,
  chapters,
  selectedChapterId,
  pending,
  annotations,
  chapterRevisions,
  previewRevisionId,
  timelineCollapsed,
  onToggleTimeline,
  onSelectChapter,
  onPreviewRevision,
  onRequestRestore,
  onExitPreview,
}: Props) {
  const formalPending =
    pending?.status === 'pending' && pending.mode === 'formal' ? pending : null
  const selectedChapter =
    chapters.find((c) => c.id === selectedChapterId) ?? chapters[0]

  const openCountByChapter = (chapterId: string) =>
    annotations.filter((a) => a.chapterId === chapterId && !a.resolved).length

  return (
    <aside className="flex h-full w-56 shrink-0 flex-col border-r border-slate-200/80 bg-slate-50/80">
      <div className="border-b border-slate-200/80 px-3 py-2.5">
        <div className="text-[11px] font-medium uppercase tracking-wide text-slate-400">
          文档树
        </div>
        <div className="mt-1 truncate text-xs font-semibold text-slate-800" title={activeCase.title}>
          {activeCase.title}
        </div>
        <div className="mt-0.5 truncate text-[10px] text-slate-500">{document.title}</div>
      </div>
      <nav className="flex-1 overflow-y-auto p-2 text-sm">
        {!document.authorized ? (
          <div className="mx-1 mb-2 rounded-md border border-slate-300 bg-white px-2 py-1.5 text-[10px] leading-relaxed text-slate-600">
            {document.unauthorizedReason ?? '整案未授权（SKU 闸 mock）'}
          </div>
        ) : null}
        <ul className="space-y-0.5">
          {chapters
            .slice()
            .sort((a, b) => a.sort - b.sort)
            .map((ch) => {
              const active = ch.id === selectedChapterId
              const hasPending = formalPending?.chapterId === ch.id
              const openN = openCountByChapter(ch.id)
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
                    <span className="flex min-w-0 items-center gap-1 truncate">
                      {ch.locked ? (
                        <Lock className="h-3 w-3 shrink-0 text-slate-400" aria-hidden />
                      ) : null}
                      <span className="truncate">{ch.title}</span>
                    </span>
                    <span className="flex shrink-0 items-center gap-1">
                      {openN > 0 ? (
                        <span
                          className="rounded-full bg-amber-100 px-1.5 py-px text-[10px] font-medium text-amber-800"
                          title={`${openN} 条未解决批注`}
                        >
                          {openN}
                        </span>
                      ) : null}
                      {hasPending ? (
                        <span
                          className="h-1.5 w-1.5 shrink-0 rounded-full bg-amber-500"
                          title="有未确认建议"
                        />
                      ) : null}
                    </span>
                  </button>
                </li>
              )
            })}
        </ul>
      </nav>
      {selectedChapter ? (
        <RevisionTimeline
          revisions={chapterRevisions}
          chapterTitle={selectedChapter.title}
          previewRevisionId={previewRevisionId}
          onPreview={onPreviewRevision}
          onRequestRestore={onRequestRestore}
          onExitPreview={onExitPreview}
          collapsed={timelineCollapsed}
          onToggleCollapsed={onToggleTimeline}
        />
      ) : null}
      <div className="border-t border-slate-200/80 px-3 py-2 text-[10px] leading-relaxed text-slate-400">
        caseId · {document.caseId}
        <br />
        stage · {document.stageId} · {document.handoffKey}
      </div>
    </aside>
  )
}
