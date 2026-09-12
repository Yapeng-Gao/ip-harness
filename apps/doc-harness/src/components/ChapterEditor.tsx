import { EditorContent, useEditor, type Editor } from '@tiptap/react'
import StarterKit from '@tiptap/starter-kit'
import Placeholder from '@tiptap/extension-placeholder'
import { useEffect, useRef } from 'react'
import {
  AnnotationMark,
  findAnnotationRange,
} from '../extensions/AnnotationMark'
import type { AnnotationDraft, Document, DocumentChapter, DocumentRevision } from '../types'
import { EditorToolbar } from './EditorToolbar'

type Props = {
  chapter: DocumentChapter
  document: Document
  revisions: DocumentRevision[]
  dirty: boolean
  activeAnnotationId: string | null
  focusAnnotationId: string | null
  focusNonce: number
  onChangeBody: (body: string) => void
  onSaveDraft: () => void
  onStartAnnotationDraft: (draft: AnnotationDraft) => void
  onAnnotationMarkClick: (annotationId: string) => void
  onEditorReady: (editor: Editor | null) => void
}

export function ChapterEditor({
  chapter,
  document,
  revisions,
  dirty,
  activeAnnotationId,
  focusAnnotationId,
  focusNonce,
  onChangeBody,
  onSaveDraft,
  onStartAnnotationDraft,
  onAnnotationMarkClick,
  onEditorReady,
}: Props) {
  const chapterRevs = revisions
    .filter((r) => r.chapterId === chapter.id)
    .slice()
    .sort((a, b) => b.seq - a.seq)
  const latest = chapterRevs[0]
  const revCount = chapterRevs.length

  const readOnly =
    !document.authorized || Boolean(chapter.locked)
  const gateReason = !document.authorized
    ? document.unauthorizedReason ??
      `未授权 SKU「${document.skuLabel}」（mock 闸）· 编辑器只读`
    : chapter.locked
      ? chapter.lockReason ?? '本章已锁定（mock）· 只读'
      : null

  const onChangeBodyRef = useRef(onChangeBody)
  onChangeBodyRef.current = onChangeBody
  const onAnnotationMarkClickRef = useRef(onAnnotationMarkClick)
  onAnnotationMarkClickRef.current = onAnnotationMarkClick
  const onEditorReadyRef = useRef(onEditorReady)
  onEditorReadyRef.current = onEditorReady
  const onStartDraftRef = useRef(onStartAnnotationDraft)
  onStartDraftRef.current = onStartAnnotationDraft

  const editor = useEditor({
    extensions: [
      StarterKit,
      Placeholder.configure({
        placeholder: '在此撰写本章正文…',
      }),
      AnnotationMark,
    ],
    content: chapter.body,
    editable: !readOnly,
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
    editor.setEditable(!readOnly)
  }, [editor, readOnly])

  // 仅在章切换或外部写入（非本编辑器 onUpdate）时 setContent，减少闪烁
  const lastChapterIdRef = useRef(chapter.id)
  const lastExternalBodyRef = useRef(chapter.body)
  useEffect(() => {
    if (!editor || editor.isDestroyed) return
    const chapterChanged = lastChapterIdRef.current !== chapter.id
    const current = editor.getHTML()
    if (chapterChanged || current !== chapter.body) {
      if (chapterChanged || lastExternalBodyRef.current !== chapter.body) {
        editor.commands.setContent(chapter.body, { emitUpdate: false })
        lastExternalBodyRef.current = chapter.body
      }
    }
    lastChapterIdRef.current = chapter.id
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
    if (!editor || editor.isDestroyed || readOnly) return
    const { from, to, empty } = editor.state.selection
    if (empty || to <= from) return
    const quote = editor.state.doc.textBetween(from, to, ' ').trim()
    if (!quote) return
    // 切到批注 Tab + 侧栏内联输入（无 window.prompt）
    onStartDraftRef.current({ quote, from, to })
  }

  return (
    <main className="doc-paper-workspace flex min-h-0 min-w-0 flex-1 flex-col overflow-hidden">
      <div className="sticky top-0 z-10 shrink-0 border-b border-slate-200/80 bg-white/95 backdrop-blur">
        <div className="flex items-start justify-between gap-3 px-4 py-2">
          <div className="min-w-0">
            <h1 className="text-sm font-semibold text-slate-900">{chapter.title}</h1>
            <p className="mt-0.5 text-[11px] text-slate-500">
              TipTap 纸面 · 批注样机 · Cmd/Ctrl+S 保存草稿 → mock{' '}
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
              disabled={!dirty || readOnly}
              onClick={onSaveDraft}
              className="btn-press focus-ring rounded-lg bg-slate-900 px-2.5 py-1 text-[11px] font-medium text-white hover:bg-slate-800 disabled:cursor-not-allowed disabled:bg-slate-200 disabled:text-slate-400"
            >
              保存草稿{dirty ? ' · dirty' : ''}
            </button>
          </div>
        </div>
        {gateReason ? (
          <div className="mx-4 mb-2 rounded-lg border border-slate-200 bg-slate-50 px-3 py-2.5">
            <div className="text-[12px] font-medium text-slate-800">未授权 / 只读</div>
            <p className="mt-0.5 text-[11px] leading-relaxed text-slate-600">{gateReason}</p>
            <button
              type="button"
              className="btn-press focus-ring mt-2 rounded-md bg-slate-900 px-2.5 py-1 text-[11px] font-medium text-white hover:bg-slate-800"
              onClick={() => {
                /* slate CTA · mock：无真开通 */
              }}
              title="样机无真 SKU 开通"
            >
              申请开通（示意）
            </button>
          </div>
        ) : null}
        <EditorToolbar
          editor={editor}
          readOnly={readOnly}
          onAddAnnotation={readOnly ? undefined : handleAddAnnotation}
        />
      </div>
      <div className="min-h-0 flex-1 overflow-y-auto">
        <div className="mx-auto my-8 w-full max-w-[816px] px-4 pb-12">
          <article
            className={`doc-paper min-h-[1056px] bg-white px-[72px] py-[80px] shadow-[0_1px_2px_rgba(0,0,0,0.04),0_8px_28px_rgba(0,0,0,0.08)] ring-1 ring-black/5 ${
              readOnly ? 'opacity-95' : ''
            }`}
          >
            <EditorContent editor={editor} />
          </article>
        </div>
      </div>
    </main>
  )
}
