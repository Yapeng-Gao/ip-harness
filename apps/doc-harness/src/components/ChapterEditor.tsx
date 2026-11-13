import { EditorContent, useEditor, type Editor } from '@tiptap/react'
import StarterKit from '@tiptap/starter-kit'
import Placeholder from '@tiptap/extension-placeholder'
import { useEffect, useRef, useState } from 'react'
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
  /** 只读预览某 revision 时：显示该版 body，不可编辑 */
  previewRevision: DocumentRevision | null
  activeAnnotationId: string | null
  focusAnnotationId: string | null
  focusNonce: number
  onChangeBody: (chapterId: string, body: string) => void
  onSaveDraft: () => void
  onStartAnnotationDraft: (draft: AnnotationDraft) => void
  onAnnotationMarkClick: (annotationId: string) => void
  onEditorReady: (editor: Editor | null) => void
  onExitRevisionPreview: () => void
}

export function ChapterEditor({
  chapter,
  document,
  revisions,
  dirty,
  previewRevision,
  activeAnnotationId,
  focusAnnotationId,
  focusNonce,
  onChangeBody,
  onSaveDraft,
  onStartAnnotationDraft,
  onAnnotationMarkClick,
  onEditorReady,
  onExitRevisionPreview,
}: Props) {
  const chapterRevs = revisions
    .filter((r) => r.chapterId === chapter.id)
    .slice()
    .sort((a, b) => b.seq - a.seq)
  const latest = chapterRevs[0]
  const revCount = chapterRevs.length

  const isPreview = Boolean(previewRevision)
  const displayBody = previewRevision?.body ?? chapter.body

  const gateReadOnly =
    !document.authorized || Boolean(chapter.locked)
  const readOnly = gateReadOnly || isPreview
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
  // key 含 chapter.id → remount；闭包锁定创建时 chapterId，防旧 update 写新章
  const boundChapterId = chapter.id
  const [skuToast, setSkuToast] = useState<string | null>(null)
  const skuToastTimer = useRef<ReturnType<typeof setTimeout> | null>(null)
  const previewModeRef = useRef(isPreview)
  previewModeRef.current = isPreview

  const editor = useEditor({
    extensions: [
      StarterKit,
      Placeholder.configure({
        placeholder: '在此撰写本章正文…',
      }),
      AnnotationMark,
    ],
    content: displayBody,
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
      // 预览模式不写回 head body
      if (previewModeRef.current) return
      onChangeBodyRef.current(boundChapterId, next.getHTML())
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

  // 章 id / 预览 revision / 外部 body 变化时同步 content
  const lastChapterIdRef = useRef(chapter.id)
  const lastExternalBodyRef = useRef(displayBody)
  const lastPreviewIdRef = useRef<string | null>(previewRevision?.id ?? null)
  useEffect(() => {
    if (!editor || editor.isDestroyed) return
    const chapterChanged = lastChapterIdRef.current !== chapter.id
    const previewChanged =
      lastPreviewIdRef.current !== (previewRevision?.id ?? null)
    if (chapterChanged || previewChanged) {
      editor.commands.setContent(displayBody, { emitUpdate: false })
      lastExternalBodyRef.current = displayBody
      lastChapterIdRef.current = chapter.id
      lastPreviewIdRef.current = previewRevision?.id ?? null
    } else if (lastExternalBodyRef.current !== displayBody) {
      if (editor.getHTML() !== displayBody) {
        editor.commands.setContent(displayBody, { emitUpdate: false })
      }
      lastExternalBodyRef.current = displayBody
    }
    editor.view.dom.setAttribute('aria-label', `${chapter.title} 正文`)
  }, [
    editor,
    chapter.id,
    chapter.title,
    displayBody,
    previewRevision?.id,
  ])

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
  }, [editor, activeAnnotationId, displayBody])

  useEffect(() => {
    if (!editor || editor.isDestroyed || !focusAnnotationId || isPreview) return
    const range = findAnnotationRange(editor, focusAnnotationId)
    if (!range) return
    editor.chain().focus().setTextSelection(range).run()
    const markEl = editor.view.dom.querySelector(
      `mark[data-annotation-id="${CSS.escape(focusAnnotationId)}"]`,
    )
    markEl?.scrollIntoView({ behavior: 'smooth', block: 'center' })
  }, [editor, focusAnnotationId, focusNonce, chapter.id, isPreview])

  const handleAddAnnotation = () => {
    if (!editor || editor.isDestroyed || readOnly) return
    const { from, to, empty } = editor.state.selection
    if (empty || to <= from) return
    const quote = editor.state.doc.textBetween(from, to, ' ').trim()
    if (!quote) return
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

        {isPreview && previewRevision ? (
          <div className="mx-4 mb-2 flex items-center justify-between gap-3 rounded-lg border border-sky-400 bg-sky-50 px-3 py-2.5">
            <div className="min-w-0">
              <div className="text-[12px] font-semibold text-sky-900">
                预览 revision #{previewRevision.seq}
              </div>
              <p className="mt-0.5 text-[11px] leading-relaxed text-slate-600">
                只读 · 未改正文 head
                {previewRevision.note ? ` · ${previewRevision.note}` : ''}
              </p>
            </div>
            <button
              type="button"
              onClick={onExitRevisionPreview}
              className="btn-press focus-ring shrink-0 rounded-md border border-sky-300 bg-white px-2.5 py-1.5 text-[11px] font-medium text-sky-900 hover:bg-sky-100"
            >
              返回编辑
            </button>
          </div>
        ) : null}

        {gateReason && !isPreview ? (
          <div className="mx-4 mb-2 rounded-lg border-2 border-slate-400 bg-slate-100 px-3 py-2.5">
            <div className="text-[12px] font-semibold text-slate-900">未授权 / 只读</div>
            <p className="mt-0.5 text-[11px] leading-relaxed text-slate-600">
              {gateReason}
            </p>
            <button
              type="button"
              className="btn-press focus-ring mt-2 rounded-md border border-slate-400 bg-white px-2.5 py-1 text-[11px] font-medium text-slate-700 hover:bg-slate-50"
              onClick={() => {
                setSkuToast('样机无真 SKU 开通')
                if (skuToastTimer.current) clearTimeout(skuToastTimer.current)
                skuToastTimer.current = setTimeout(() => setSkuToast(null), 2800)
              }}
              title="样机无真 SKU 开通"
            >
              申请开通（示意）
            </button>
            {skuToast ? (
              <p className="mt-1.5 text-[10px] text-slate-600" role="status">
                {skuToast}
              </p>
            ) : null}
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
