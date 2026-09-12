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
  }
}

function initAllRuntimes(): Record<string, CaseRuntime> {
  const map: Record<string, CaseRuntime> = {}
  for (const c of CASES) {
    map[c.id] = bundleToRuntime(buildCaseBundle(c.id))
  }
  return map
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
      showAutoSaved('已自动保存')
      return true
    },
    [headRevisionForChapter, patchRuntime, showAutoSaved],
  )

  const onChangeBody = useCallback(
    (body: string) => {
      const id = caseIdRef.current
      const chapterId = runtimesRef.current[id]?.selectedChapterId
      if (!chapterId) return
      patchRuntime(id, (prev) => ({
        ...prev,
        chapters: prev.chapters.map((c) =>
          c.id === chapterId ? { ...c, body } : c,
        ),
      }))
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
      if (opts?.silent) showAutoSaved('已保存')
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

  const selectChapter = useCallback(
    (nextChapterId: string) => {
      const id = caseIdRef.current
      autoSaveIfDirty(id)
      patchRuntime(id, (prev) => ({
        ...prev,
        selectedChapterId: nextChapterId,
        proposal:
          prev.proposal && prev.proposal.chapterId !== nextChapterId
            ? null
            : prev.proposal,
      }))
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
      const next = runtimesRef.current[nextCaseId]
      setActiveAnnotationId(null)
      setFocusToken(null)
      setAnnotationDraft(null)
      setDraftBody('')
      setRightTab('annotations')
      // 换案清当前 proposal 已在各 runtime 独立；确保目标案 proposal 不串
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
    patchRuntime(id, { proposal: p })
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

    // 批注保真：按 quote 重挂仍 open 的 annotations
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
    patchRuntime(id, {
      revisions: [...state.revisions, revision],
      chapters: state.chapters.map((c) =>
        c.id === proposal.chapterId ? { ...c, body: bodyWithMarks } : c,
      ),
      document: { ...state.document, headRevisionId: revision.id },
      annotations: nextAnns,
      savedBodies: { ...state.savedBodies, [proposal.chapterId]: bodyWithMarks },
      proposal: { ...proposal, status: 'accepted', proposedBody: bodyWithMarks },
    })
    setCommandLog((prev) => [...prev, log])
  }

  const onReject = () => {
    const id = caseIdRef.current
    const proposal = runtimesRef.current[id]?.proposal
    if (!proposal || proposal.status !== 'pending') return
    patchRuntime(id, { proposal: { ...proposal, status: 'rejected' } })
  }

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
      onChangeBody(ed.getHTML())
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
        onChangeBody(ed.getHTML())
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
    formalBlocked || !rt.document.authorized || Boolean(selected.locked)

  return (
    <div className="app-shell-bg flex h-full min-h-screen flex-col">
      <TopBar
        cases={CASES}
        activeCase={activeCase}
        document={rt.document}
        autoSavedHint={autoSavedHint}
        onSwitchCase={switchCase}
      />
      <div className="flex min-h-0 flex-1">
        <DocTree
          cases={CASES}
          activeCase={activeCase}
          document={rt.document}
          chapters={rt.chapters}
          selectedChapterId={selected.id}
          pending={rt.proposal}
          onSelectChapter={selectChapter}
          onSwitchCase={switchCase}
        />
        <ChapterEditor
          key={caseId}
          chapter={selected}
          document={rt.document}
          revisions={rt.revisions}
          dirty={dirty}
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
              proposal={
                rt.proposal &&
                (rt.proposal.status === 'pending' || rt.proposal.status === 'preview')
                  ? rt.proposal
                  : null
              }
              currentBody={selected.body}
              commandLog={commandLog}
              caseId={rt.document.caseId}
              onDryRun={() => makeProposal('dry-run')}
              onFormal={() => makeProposal('formal')}
              onConfirm={onConfirm}
              onReject={onReject}
              actionsDisabled={Boolean(agentDisabled)}
            />
          }
        />
      </div>
    </div>
  )
}
