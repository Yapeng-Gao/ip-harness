import { EditorContent, useEditor, type Editor } from '@tiptap/react'
import StarterKit from '@tiptap/starter-kit'
import Placeholder from '@tiptap/extension-placeholder'
import { useEffect, useRef } from 'react'
import {
  AnnotationMark,
  findAnnotationRange,
} from '../extensions/AnnotationMark'
import type { DocumentChapter, DocumentRevision } from '../types'
import { EditorToolbar } from './EditorToolbar'

type Props = {
  chapter: DocumentChapter
  revisions: DocumentRevision[]
  dirty: boolean
  activeAnnotationId: string | null
  focusAnnotationId: string | null
  focusNonce: number
  onChangeBody: (body: string) => void
  onSaveDraft: () => void
  onAddAnnotation: (payload: { quote: string; body: string }) => string | null
  onAnnotationMarkClick: (annotationId: string) => void
  onEditorReady: (editor: Editor | null) => void
}

export function ChapterEditor({
  chapter,
  revisions,
  dirty,
  activeAnnotationId,
  focusAnnotationId,
  focusNonce,
  onChangeBody,
  onSaveDraft,
  onAddAnnotation,
  onAnnotationMarkClick,
  onEditorReady,
}: Props) {
  const chapterRevs = revisions
    .filter((r) => r.chapterId === chapter.id)
    .slice()
    .sort((a, b) => b.seq - a.seq)
  const latest = chapterRevs[0]
  const revCount = chapterRevs.length

  const onChangeBodyRef = useRef(onChangeBody)
  onChangeBodyRef.current = onChangeBody
  const onAnnotationMarkClickRef = useRef(onAnnotationMarkClick)
  onAnnotationMarkClickRef.current = onAnnotationMarkClick
  const onEditorReadyRef = useRef(onEditorReady)
  onEditorReadyRef.current = onEditorReady
  const onAddAnnotationRef = useRef(onAddAnnotation)
  onAddAnnotationRef.current = onAddAnnotation

  const editor = useEditor({
    extensions: [
      StarterKit,
      Placeholder.configure({
        placeholder: '在此撰写本章正文…',
      }),
      AnnotationMark,
    ],
    content: chapter.body,
    immediatelyRender: true,
    shouldRerenderOnTransaction: false,
    editorProps: {
      attributes: {
        class: 'doc-paper-prose',
        'aria-label': `${chapter.title} 正文`,
      },
      handleClick: (_view, _pos, event) => {
        const target = event.target as HTMLElement | null
        const markEl = target?.closest?.('mark[data-annotation-id]') as
          | HTMLElement
          | null
        const id = markEl?.getAttribute('data-annotation-id')
        if (id) {
          onAnnotationMarkClickRef.current(id)
        }
        return false
      },
    },
    onUpdate: ({ editor: next }) => {
      onChangeBodyRef.current(next.getHTML())
    },
  })

  useEffect(() => {
    onEditorReadyRef.current(editor)
    return () => onEditorReadyRef.current(null)
  }, [editor])

  useEffect(() => {
    if (!editor || editor.isDestroyed) return
    const current = editor.getHTML()
    if (current !== chapter.body) {
      editor.commands.setContent(chapter.body, { emitUpdate: false })
    }
    editor.view.dom.setAttribute('aria-label', `${chapter.title} 正文`)
  }, [editor, chapter.id, chapter.body, chapter.title])

  useEffect(() => {
    if (!editor || editor.isDestroyed) return
    const dom = editor.view.dom
    if (activeAnnotationId) {
      dom.setAttribute('data-active-annotation', activeAnnotationId)
    } else {
      dom.removeAttribute('data-active-annotation')
    }
    dom.querySelectorAll('mark.annotation-mark, .annotation-mark').forEach((el) => {
      const id = el.getAttribute('data-annotation-id')
      el.classList.toggle(
        'is-active-annotation',
        Boolean(activeAnnotationId && id === activeAnnotationId),
      )
    })
  }, [editor, activeAnnotationId, chapter.body])

  useEffect(() => {
    if (!editor || editor.isDestroyed || !focusAnnotationId) return
    const range = findAnnotationRange(editor, focusAnnotationId)
    if (!range) return
    editor.chain().focus().setTextSelection(range).run()
    const markEl = editor.view.dom.querySelector(
      `mark[data-annotation-id="${CSS.escape(focusAnnotationId)}"]`,
    )
    markEl?.scrollIntoView({ behavior: 'smooth', block: 'center' })
  }, [editor, focusAnnotationId, focusNonce, chapter.id])

  const handleAddAnnotation = () => {
    if (!editor || editor.isDestroyed) return
    const { from, to, empty } = editor.state.selection
    if (empty || to <= from) return
    const quote = editor.state.doc.textBetween(from, to, ' ').trim()
    if (!quote) return
    const body = window.prompt('批注内容', '')
    if (body === null) return
    const trimmed = body.trim()
    if (!trimmed) return
    const id = onAddAnnotationRef.current({ quote, body: trimmed })
    if (!id) return
    editor.chain().focus().setTextSelection({ from, to }).setAnnotation(id).run()
  }

  return (
    <main className="doc-paper-workspace flex min-h-0 min-w-0 flex-1 flex-col overflow-hidden">
      <div className="sticky top-0 z-10 shrink-0 border-b border-slate-200/80 bg-white/95 backdrop-blur">
        <div className="flex items-start justify-between gap-3 px-4 py-2">
          <div className="min-w-0">
            <h1 className="text-sm font-semibold text-slate-900">{chapter.title}</h1>
            <p className="mt-0.5 text-[11px] text-slate-500">
              TipTap 纸面文档 · 批注样机 · 手改后「保存草稿」→ mock{' '}
              <code className="font-mono">saveDraft</code>
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
        <EditorToolbar editor={editor} onAddAnnotation={handleAddAnnotation} />
      </div>
      <div className="min-h-0 flex-1 overflow-y-auto">
        <div className="mx-auto my-8 w-full max-w-[816px] px-4 pb-12">
          <article className="doc-paper min-h-[1056px] bg-white px-[72px] py-[80px] shadow-[0_1px_2px_rgba(0,0,0,0.04),0_8px_28px_rgba(0,0,0,0.08)] ring-1 ring-black/5">
            <EditorContent editor={editor} />
          </article>
        </div>
      </div>
    </main>
  )
}
