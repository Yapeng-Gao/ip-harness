import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import type { Editor } from '@tiptap/react'
import { AgentPanel } from './components/AgentPanel'
import { AnnotationPanel } from './components/AnnotationPanel'
import { ChapterEditor } from './components/ChapterEditor'
import { DocTree } from './components/DocTree'
import { RightRail, type RightRailTab } from './components/RightRail'
import { TopBar } from './components/TopBar'
import { reattachOpenAnnotationsByQuote } from './lib/annotationFidelity'
import { mockDispatch, mockRewriteChapter, nextId } from './mockDispatch'
import { buildCaseBundle, CASES, DEFAULT_CASE_ID } from './seed'
import type {
  Annotation,
  AnnotationDraft,
  CaseBundle,
  CommandLogEntry,
  Document,
  DocumentChapter,
  DocumentRevision,
  DocProposal,
} from './types'

const MOCK_AUTHOR = '演示用户'

type CaseRuntime = {
  document: Document
  chapters: DocumentChapter[]
  revisions: DocumentRevision[]
  annotations: Annotation[]
  selectedChapterId: string
  savedBodies: Record<string, string>
  proposal: DocProposal | null
  proposalHistory: DocProposal[]
}

function bundleToRuntime(bundle: CaseBundle): CaseRuntime {
  return {
    document: bundle.document,
    chapters: bundle.chapters,
    revisions: bundle.revisions,
    annotations: bundle.annotations,
    selectedChapterId: bundle.defaultChapterId,
    savedBodies: Object.fromEntries(bundle.chapters.map((c) => [c.id, c.body])),
    proposal: null,
    proposalHistory: [],
  }
}

function initAllRuntimes(): Record<string, CaseRuntime> {
  const map: Record<string, CaseRuntime> = {}
  for (const c of CASES) {
    map[c.id] = bundleToRuntime(buildCaseBundle(c.id))
  }
  return map
}

function archiveProposal(
  history: DocProposal[],
  proposal: DocProposal | null,
  status: DocProposal['status'],
): DocProposal[] {
  if (!proposal) return history
  // 避免重复归档同一 id
  if (history.some((p) => p.id === proposal.id)) {
    return history.map((p) =>
      p.id === proposal.id ? { ...p, status } : p,
    )
  }
  return [...history, { ...proposal, status }]
}

export default function App() {
  const [caseId, setCaseId] = useState(DEFAULT_CASE_ID)
  const [runtimes, setRuntimes] = useState<Record<string, CaseRuntime>>(initAllRuntimes)
  const [commandLog, setCommandLog] = useState<CommandLogEntry[]>([])
  const [activeAnnotationId, setActiveAnnotationId] = useState<string | null>(null)
  const [focusToken, setFocusToken] = useState<{ id: string; n: number } | null>(null)
  const [rightTab, setRightTab] = useState<RightRailTab>('annotations')
  const [annotationDraft, setAnnotationDraft] = useState<AnnotationDraft | null>(null)
  const [draftBody, setDraftBody] = useState('')
  const [autoSavedHint, setAutoSavedHint] = useState<string | null>(null)
  const autoSavedTimer = useRef<ReturnType<typeof setTimeout> | null>(null)
  /** 只读预览某 revision（不改正文 head） */
  const [previewRevisionId, setPreviewRevisionId] = useState<string | null>(null)
  const [timelineCollapsed, setTimelineCollapsed] = useState(false)
  /** 恢复 revision 待确认 */
  const [restoreTarget, setRestoreTarget] = useState<DocumentRevision | null>(null)

  const editorRef = useRef<Editor | null>(null)
  const caseIdRef = useRef(caseId)
  caseIdRef.current = caseId
  const runtimesRef = useRef(runtimes)
  runtimesRef.current = runtimes

  const rt = runtimes[caseId]
  const activeCase = CASES.find((c) => c.id === caseId) ?? CASES[0]
  const selected = useMemo(
    () =>
      rt?.chapters.find((c) => c.id === rt.selectedChapterId) ?? rt?.chapters[0],
    [rt],
  )
  const dirty = selected
    ? selected.body !== rt.savedBodies[selected.id]
    : false
  const chapterAnnotations = useMemo(
    () =>
      selected
        ? (rt?.annotations.filter((a) => a.chapterId === selected.id) ?? [])
        : [],
    [rt?.annotations, selected],
  )
  const chapterRevisions = useMemo(
    () =>
      selected
        ? (rt?.revisions.filter((r) => r.chapterId === selected.id) ?? [])
        : [],
    [rt?.revisions, selected],
  )
  const previewRevision = useMemo(() => {
    if (!previewRevisionId || !rt) return null
    return rt.revisions.find((r) => r.id === previewRevisionId) ?? null
  }, [previewRevisionId, rt])

  const patchRuntime = useCallback(
    (id: string, patch: Partial<CaseRuntime> | ((prev: CaseRuntime) => CaseRuntime)) => {
      setRuntimes((prev) => {
        const cur = prev[id]
        if (!cur) return prev
        const next = typeof patch === 'function' ? patch(cur) : { ...cur, ...patch }
        return { ...prev, [id]: next }
      })
    },
    [],
  )

  const headRevisionForChapter = useCallback(
    (chapterId: string, revisions: DocumentRevision[]) => {
      const list = revisions
        .filter((r) => r.chapterId === chapterId)
        .sort((a, b) => b.seq - a.seq)
      return list[0]
    },
    [],
  )

  const showAutoSaved = useCallback((msg: string) => {
    setAutoSavedHint(msg)
    if (autoSavedTimer.current) clearTimeout(autoSavedTimer.current)
    autoSavedTimer.current = setTimeout(() => setAutoSavedHint(null), 3200)
  }, [])

  /** 未保存离开：自动 saveDraft（策略见 README） */
  const autoSaveIfDirty = useCallback(
    (forCaseId: string) => {
      const state = runtimesRef.current[forCaseId]
      if (!state) return false
      const ch =
        state.chapters.find((c) => c.id === state.selectedChapterId) ??
        state.chapters[0]
      if (!ch) return false
      if (ch.body === state.savedBodies[ch.id]) return false
      if (!state.document.authorized || ch.locked) return false

      const head = headRevisionForChapter(ch.id, state.revisions)
      const nextSeq = (head?.seq ?? 0) + 1
      const { revision, log } = mockDispatch({
        type: 'saveDraft',
        caseId: state.document.caseId,
        documentId: state.document.id,
        chapterId: ch.id,
        body: ch.body,
        seq: nextSeq,
        parentRevisionId: head?.id,
        actor: 'user',
        note: '离开章/案 · 自动保存草稿',
      })
      patchRuntime(forCaseId, {
        revisions: [...state.revisions, revision],
        document: { ...state.document, headRevisionId: revision.id },
        savedBodies: { ...state.savedBodies, [ch.id]: ch.body },
      })
      setCommandLog((prev) => [...prev, log])
      showAutoSaved(`已自动保存 · ${ch.title}`)
      return true
    },
    [headRevisionForChapter, patchRuntime, showAutoSaved],
  )

  const onChangeBody = useCallback(
    (chapterId: string, body: string) => {
      const id = caseIdRef.current
      const selectedId = runtimesRef.current[id]?.selectedChapterId
      // 只写入当前选中章，避免切章后旧编辑器 update 污染新章 body
      if (!selectedId || chapterId !== selectedId) return
      patchRuntime(id, (prev) => ({
        ...prev,
        chapters: prev.chapters.map((c) =>
          c.id === chapterId ? { ...c, body } : c,
        ),
      }))
      // dirty 时清掉绿色「已自动保存」，避免与 dirty CTA 同屏矛盾
      setAutoSavedHint(null)
      if (autoSavedTimer.current) {
        clearTimeout(autoSavedTimer.current)
        autoSavedTimer.current = null
      }
    },
    [patchRuntime],
  )

  const onSaveDraft = useCallback(
    (opts?: { silent?: boolean }) => {
      const id = caseIdRef.current
      const state = runtimesRef.current[id]
      if (!state) return
      const ch =
        state.chapters.find((c) => c.id === state.selectedChapterId) ??
        state.chapters[0]
      if (!ch) return
      if (ch.body === state.savedBodies[ch.id]) return
      if (!state.document.authorized || ch.locked) return

      const head = headRevisionForChapter(ch.id, state.revisions)
      const nextSeq = (head?.seq ?? 0) + 1
      const { revision, log } = mockDispatch({
        type: 'saveDraft',
        caseId: state.document.caseId,
        documentId: state.document.id,
        chapterId: ch.id,
        body: ch.body,
        seq: nextSeq,
        parentRevisionId: head?.id,
        actor: 'user',
        note: opts?.silent ? '快捷键保存草稿' : '用户保存草稿',
      })
      patchRuntime(id, {
        revisions: [...state.revisions, revision],
        document: { ...state.document, headRevisionId: revision.id },
        savedBodies: { ...state.savedBodies, [ch.id]: ch.body },
      })
      setCommandLog((prev) => [...prev, log])
      if (opts?.silent) showAutoSaved(`已保存 · ${ch.title}`)
    },
    [headRevisionForChapter, patchRuntime, showAutoSaved],
  )

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 's') {
        e.preventDefault()
        onSaveDraft({ silent: true })
      }
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [onSaveDraft])

  const exitRevisionPreview = useCallback(() => {
    setPreviewRevisionId(null)
  }, [])

  const selectChapter = useCallback(
    (nextChapterId: string) => {
      const id = caseIdRef.current
      autoSaveIfDirty(id)
      setPreviewRevisionId(null)
      setRestoreTarget(null)
      patchRuntime(id, (prev) => {
        let history = prev.proposalHistory
        let proposal = prev.proposal
        if (proposal && proposal.chapterId !== nextChapterId) {
          if (proposal.status === 'preview') {
            history = archiveProposal(history, proposal, 'preview')
          }
          proposal = null
        }
        return {
          ...prev,
          selectedChapterId: nextChapterId,
          proposal,
          proposalHistory: history,
        }
      })
      setActiveAnnotationId(null)
      setFocusToken(null)
      setAnnotationDraft(null)
      setDraftBody('')
    },
    [autoSaveIfDirty, patchRuntime],
  )

  const switchCase = useCallback(
    (nextCaseId: string) => {
      if (nextCaseId === caseIdRef.current) return
      autoSaveIfDirty(caseIdRef.current)
      setCaseId(nextCaseId)
      setPreviewRevisionId(null)
      setRestoreTarget(null)
      const next = runtimesRef.current[nextCaseId]
      setActiveAnnotationId(null)
      setFocusToken(null)
      setAnnotationDraft(null)
      setDraftBody('')
      setRightTab('annotations')
      if (next?.proposal) {
        patchRuntime(nextCaseId, { proposal: null })
      }
    },
    [autoSaveIfDirty, patchRuntime],
  )

  const makeProposal = (mode: 'dry-run' | 'formal') => {
    const id = caseIdRef.current
    const state = runtimesRef.current[id]
    if (!state) return
    const ch =
      state.chapters.find((c) => c.id === state.selectedChapterId) ??
      state.chapters[0]
    if (!ch) return
    if (!state.document.authorized || ch.locked) return
    const head = headRevisionForChapter(ch.id, state.revisions)
    const { proposedBody, summary } = mockRewriteChapter(ch.key, ch.title, ch.body)
    const p: DocProposal = {
      id: nextId('prop'),
      documentId: state.document.id,
      chapterId: ch.id,
      baseRevisionId: head?.id ?? state.document.headRevisionId,
      proposedBody,
      summary,
      hitlGateId: mode === 'formal' ? 'approve_strategy' : undefined,
      mode,
      status: mode === 'formal' ? 'pending' : 'preview',
      createdAt: new Date().toISOString(),
    }
    // 替换当前提案时：若旧的是 preview，归档为 preview 结束
    let history = state.proposalHistory
    if (state.proposal) {
      if (state.proposal.status === 'preview') {
        history = archiveProposal(history, state.proposal, 'preview')
      } else if (state.proposal.status === 'pending') {
        // 被新提案替换的 pending 视为拒绝归档
        history = archiveProposal(history, state.proposal, 'rejected')
      }
    }
    patchRuntime(id, { proposal: p, proposalHistory: history })
    setRightTab('agent')
  }

  const onConfirm = () => {
    const id = caseIdRef.current
    const state = runtimesRef.current[id]
    const proposal = state?.proposal
    if (!state || !proposal || proposal.status !== 'pending' || proposal.mode !== 'formal')
      return
    const chapter = state.chapters.find((c) => c.id === proposal.chapterId)
    if (!chapter) return

    const { html: bodyWithMarks, annotations: nextAnns } =
      reattachOpenAnnotationsByQuote(
        proposal.proposedBody,
        state.annotations,
        proposal.chapterId,
      )

    const head = headRevisionForChapter(proposal.chapterId, state.revisions)
    const nextSeq = (head?.seq ?? 0) + 1
    const { revision, log } = mockDispatch({
      type: 'submitClaims',
      caseId: state.document.caseId,
      documentId: state.document.id,
      chapterId: proposal.chapterId,
      body: bodyWithMarks,
      seq: nextSeq,
      parentRevisionId: proposal.baseRevisionId,
      actor: 'agent',
      note: 'Agent 建议经 HITL 确认写入（含批注按 quote 重挂）',
    })
    const accepted = { ...proposal, status: 'accepted' as const, proposedBody: bodyWithMarks }
    patchRuntime(id, {
      revisions: [...state.revisions, revision],
      chapters: state.chapters.map((c) =>
        c.id === proposal.chapterId ? { ...c, body: bodyWithMarks } : c,
      ),
      document: { ...state.document, headRevisionId: revision.id },
      annotations: nextAnns,
      savedBodies: { ...state.savedBodies, [proposal.chapterId]: bodyWithMarks },
      proposal: null,
      proposalHistory: archiveProposal(state.proposalHistory, accepted, 'accepted'),
    })
    setCommandLog((prev) => [...prev, log])
    setPreviewRevisionId(null)
  }

  const onReject = () => {
    const id = caseIdRef.current
    const state = runtimesRef.current[id]
    const proposal = state?.proposal
    if (!state || !proposal || proposal.status !== 'pending') return
    patchRuntime(id, {
      proposal: null,
      proposalHistory: archiveProposal(state.proposalHistory, proposal, 'rejected'),
    })
  }

  const handlePreviewRevision = useCallback((rev: DocumentRevision) => {
    setPreviewRevisionId(rev.id)
    setRestoreTarget(null)
  }, [])

  const handleRequestRestore = useCallback((rev: DocumentRevision) => {
    setRestoreTarget(rev)
  }, [])

  const confirmRestore = useCallback(() => {
    const id = caseIdRef.current
    const state = runtimesRef.current[id]
    const rev = restoreTarget
    if (!state || !rev) return
    if (!state.document.authorized) return
    const ch = state.chapters.find((c) => c.id === rev.chapterId)
    if (!ch || ch.locked) return

    const head = headRevisionForChapter(rev.chapterId, state.revisions)
    const nextSeq = (head?.seq ?? 0) + 1
    const { revision, log } = mockDispatch({
      type: 'saveDraft',
      caseId: state.document.caseId,
      documentId: state.document.id,
      chapterId: rev.chapterId,
      body: rev.body,
      seq: nextSeq,
      parentRevisionId: head?.id,
      actor: 'user',
      note: `恢复自 seq ${rev.seq}`,
    })
    patchRuntime(id, {
      revisions: [...state.revisions, revision],
      chapters: state.chapters.map((c) =>
        c.id === rev.chapterId ? { ...c, body: rev.body } : c,
      ),
      document: { ...state.document, headRevisionId: revision.id },
      savedBodies: { ...state.savedBodies, [rev.chapterId]: rev.body },
    })
    setCommandLog((prev) => [...prev, log])
    setRestoreTarget(null)
    setPreviewRevisionId(null)
  }, [headRevisionForChapter, patchRuntime, restoreTarget])

  const handleStartAnnotationDraft = useCallback(
    (draft: AnnotationDraft) => {
      setAnnotationDraft(draft)
      setDraftBody('')
      setRightTab('annotations')
    },
    [],
  )

  const handleSubmitAnnotationDraft = useCallback(() => {
    const id = caseIdRef.current
    const state = runtimesRef.current[id]
    const draft = annotationDraft
    const body = draftBody.trim()
    if (!state || !draft || !body) return
    const chapterId = state.selectedChapterId
    const annId = nextId('ann')
    const annotation: Annotation = {
      id: annId,
      chapterId,
      quote: draft.quote,
      body,
      author: MOCK_AUTHOR,
      createdAt: new Date().toISOString(),
      resolved: false,
      replies: [],
    }
    patchRuntime(id, {
      annotations: [...state.annotations, annotation],
    })
    setActiveAnnotationId(annId)
    setAnnotationDraft(null)
    setDraftBody('')

    const ed = editorRef.current
    if (ed && !ed.isDestroyed) {
      ed.chain()
        .focus()
        .setTextSelection({ from: draft.from, to: draft.to })
        .setAnnotation(annId)
        .run()
      onChangeBody(chapterId, ed.getHTML())
    }
  }, [annotationDraft, draftBody, onChangeBody, patchRuntime])

  const handleSelectAnnotation = useCallback((id: string) => {
    setActiveAnnotationId(id)
    setFocusToken((prev) => ({ id, n: (prev?.n ?? 0) + 1 }))
  }, [])

  const handleAnnotationMarkClick = useCallback((id: string) => {
    setActiveAnnotationId(id)
    setRightTab('annotations')
  }, [])

  const handleReply = useCallback(
    (annId: string, body: string) => {
      const id = caseIdRef.current
      patchRuntime(id, (prev) => ({
        ...prev,
        annotations: prev.annotations.map((a) =>
          a.id === annId
            ? {
                ...a,
                replies: [
                  ...a.replies,
                  {
                    id: nextId('reply'),
                    body,
                    author: MOCK_AUTHOR,
                    createdAt: new Date().toISOString(),
                  },
                ],
              }
            : a,
        ),
      }))
    },
    [patchRuntime],
  )

  const handleToggleResolved = useCallback(
    (annId: string) => {
      const id = caseIdRef.current
      patchRuntime(id, (prev) => ({
        ...prev,
        annotations: prev.annotations.map((a) =>
          a.id === annId ? { ...a, resolved: !a.resolved } : a,
        ),
      }))
    },
    [patchRuntime],
  )

  const handleDeleteAnnotation = useCallback(
    (annId: string) => {
      const id = caseIdRef.current
      patchRuntime(id, (prev) => ({
        ...prev,
        annotations: prev.annotations.filter((a) => a.id !== annId),
      }))
      setActiveAnnotationId((cur) => (cur === annId ? null : cur))
      const ed = editorRef.current
      if (ed && !ed.isDestroyed) {
        ed.commands.unsetAnnotation(annId)
        const chapterId = runtimesRef.current[id]?.selectedChapterId
        if (chapterId) onChangeBody(chapterId, ed.getHTML())
      }
    },
    [onChangeBody, patchRuntime],
  )

  if (!rt || !selected) {
    return (
      <div className="app-shell-bg flex min-h-screen items-center justify-center p-6">
        <div className="rounded-xl border border-dashed border-slate-200 bg-white px-6 py-8 text-center shadow-[var(--shadow-rest)]">
          <div className="text-sm font-medium text-slate-800">无可用章节</div>
          <p className="mt-1 text-[12px] text-slate-500">请切换其他演示案。</p>
        </div>
      </div>
    )
  }

  const formalBlocked =
    rt.proposal?.status === 'pending' && rt.proposal.mode === 'formal'
  const agentDisabled =
    formalBlocked ||
    !rt.document.authorized ||
    Boolean(selected.locked) ||
    Boolean(previewRevision)
  const agentDisabledReason = formalBlocked
    ? '正式建议待确认'
    : previewRevision
      ? '正在预览历史 revision · 返回编辑后再操作 Agent'
      : !rt.document.authorized
        ? `本章未授权 SKU · 只读`
        : selected.locked
          ? selected.lockReason ?? '本章已锁定 · 只读'
          : null

  // 当前活动提案：pending / preview；已结束的已进 history
  const activeProposal =
    rt.proposal &&
    (rt.proposal.status === 'pending' || rt.proposal.status === 'preview')
      ? rt.proposal
      : null

  return (
    <div className="app-shell-bg flex h-full min-h-screen flex-col">
      <TopBar
        cases={CASES}
        activeCase={activeCase}
        document={rt.document}
        dirty={dirty}
        autoSavedHint={autoSavedHint}
        onSwitchCase={switchCase}
      />
      <div className="flex min-h-0 flex-1">
        <DocTree
          activeCase={activeCase}
          document={rt.document}
          chapters={rt.chapters}
          selectedChapterId={selected.id}
          pending={rt.proposal}
          annotations={rt.annotations}
          chapterRevisions={chapterRevisions}
          previewRevisionId={previewRevisionId}
          timelineCollapsed={timelineCollapsed}
          onToggleTimeline={() => setTimelineCollapsed((v) => !v)}
          onSelectChapter={selectChapter}
          onPreviewRevision={handlePreviewRevision}
          onRequestRestore={handleRequestRestore}
          onExitPreview={exitRevisionPreview}
        />
        <ChapterEditor
          key={`${caseId}-${selected.id}`}
          chapter={selected}
          document={rt.document}
          revisions={rt.revisions}
          dirty={dirty}
          previewRevision={previewRevision}
          activeAnnotationId={activeAnnotationId}
          focusAnnotationId={focusToken?.id ?? null}
          focusNonce={focusToken?.n ?? 0}
          onChangeBody={onChangeBody}
          onSaveDraft={() => onSaveDraft()}
          onStartAnnotationDraft={handleStartAnnotationDraft}
          onAnnotationMarkClick={handleAnnotationMarkClick}
          onEditorReady={(ed) => {
            editorRef.current = ed
          }}
          onExitRevisionPreview={exitRevisionPreview}
        />
        <RightRail
          tab={rightTab}
          onTabChange={setRightTab}
          annotationCount={chapterAnnotations.filter((a) => !a.resolved).length}
          annotationsPane={
            <AnnotationPanel
              annotations={chapterAnnotations}
              activeAnnotationId={activeAnnotationId}
              draft={annotationDraft}
              draftBody={draftBody}
              onDraftBodyChange={setDraftBody}
              onSubmitDraft={handleSubmitAnnotationDraft}
              onCancelDraft={() => {
                setAnnotationDraft(null)
                setDraftBody('')
              }}
              onSelect={handleSelectAnnotation}
              onReply={handleReply}
              onToggleResolved={handleToggleResolved}
              onDelete={handleDeleteAnnotation}
            />
          }
          agentPane={
            <AgentPanel
              proposal={activeProposal}
              proposalHistory={rt.proposalHistory}
              currentBody={selected.body}
              commandLog={commandLog}
              caseId={rt.document.caseId}
              onDryRun={() => makeProposal('dry-run')}
              onFormal={() => makeProposal('formal')}
              onConfirm={onConfirm}
              onReject={onReject}
              actionsDisabled={Boolean(agentDisabled)}
              disabledReason={agentDisabledReason}
            />
          }
        />
      </div>

      {/* 恢复 revision Confirm 对话框 */}
      {restoreTarget ? (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 p-4"
          role="dialog"
          aria-modal="true"
          aria-labelledby="restore-rev-title"
        >
          <div className="w-full max-w-sm rounded-xl border border-slate-200 bg-white p-4 shadow-lg">
            <h2 id="restore-rev-title" className="text-sm font-semibold text-slate-900">
              确认恢复 revision
            </h2>
            <p className="mt-2 text-[12px] leading-relaxed text-slate-600">
              将 seq {restoreTarget.seq} 的正文写入<strong>新</strong> revision（actor
              user · note「恢复自 seq {restoreTarget.seq}」），并更新本章 body。不删除历史版本。
            </p>
            {restoreTarget.note ? (
              <p className="mt-1 truncate text-[11px] text-slate-500" title={restoreTarget.note}>
                源 note · {restoreTarget.note}
              </p>
            ) : null}
            <div className="mt-4 flex gap-2">
              <button
                type="button"
                onClick={confirmRestore}
                className="btn-press focus-ring flex-1 rounded-lg bg-slate-900 px-3 py-2 text-xs font-medium text-white hover:bg-slate-800"
              >
                确认恢复
              </button>
              <button
                type="button"
                onClick={() => setRestoreTarget(null)}
                className="btn-press focus-ring flex-1 rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs font-medium text-slate-700 hover:bg-slate-50"
              >
                取消
              </button>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  )
}
