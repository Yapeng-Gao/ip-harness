import { useCallback, useMemo, useRef, useState } from 'react'
import type { Editor } from '@tiptap/react'
import { AgentPanel } from './components/AgentPanel'
import { AnnotationPanel } from './components/AnnotationPanel'
import { ChapterEditor } from './components/ChapterEditor'
import { DocTree } from './components/DocTree'
import { RightRail, type RightRailTab } from './components/RightRail'
import { TopBar } from './components/TopBar'
import { mockDispatch, mockRewriteChapter, nextId } from './mockDispatch'
import {
  buildSeed,
  DEFAULT_CHAPTER_ID,
  DEMO_CASE,
  SEED_ANNOTATIONS,
} from './seed'
import type {
  Annotation,
  CommandLogEntry,
  Document,
  DocumentChapter,
  DocumentRevision,
  DocProposal,
} from './types'

const MOCK_AUTHOR = '演示用户'
const seed = buildSeed()

export default function App() {
  const [document, setDocument] = useState<Document>(seed.document)
  const [chapters, setChapters] = useState<DocumentChapter[]>(seed.chapters)
  const [revisions, setRevisions] = useState<DocumentRevision[]>(seed.revisions)
  const [selectedChapterId, setSelectedChapterId] = useState(DEFAULT_CHAPTER_ID)
  const [proposal, setProposal] = useState<DocProposal | null>(null)
  const [commandLog, setCommandLog] = useState<CommandLogEntry[]>([])
  const [annotations, setAnnotations] = useState<Annotation[]>(SEED_ANNOTATIONS)
  const [activeAnnotationId, setActiveAnnotationId] = useState<string | null>(
    SEED_ANNOTATIONS[0]?.id ?? null,
  )
  const [focusToken, setFocusToken] = useState<{ id: string; n: number } | null>(
    null,
  )
  const [rightTab, setRightTab] = useState<RightRailTab>('annotations')
  const [savedBodies, setSavedBodies] = useState<Record<string, string>>(() =>
    Object.fromEntries(seed.chapters.map((c) => [c.id, c.body])),
  )

  const editorRef = useRef<Editor | null>(null)
  const selectedChapterIdRef = useRef(selectedChapterId)
  selectedChapterIdRef.current = selectedChapterId

  const selected = useMemo(
    () => chapters.find((c) => c.id === selectedChapterId) ?? chapters[0],
    [chapters, selectedChapterId],
  )

  const dirty = selected ? selected.body !== savedBodies[selected.id] : false

  const chapterAnnotations = useMemo(
    () => (selected ? annotations.filter((a) => a.chapterId === selected.id) : []),
    [annotations, selected],
  )

  const headRevisionForChapter = useCallback(
    (chapterId: string) => {
      const list = revisions
        .filter((r) => r.chapterId === chapterId)
        .sort((a, b) => b.seq - a.seq)
      return list[0]
    },
    [revisions],
  )

  const onChangeBody = useCallback((body: string) => {
    const chapterId = selectedChapterIdRef.current
    setChapters((prev) =>
      prev.map((c) => (c.id === chapterId ? { ...c, body } : c)),
    )
  }, [])

  const onSaveDraft = () => {
    if (!selected || !dirty) return
    const head = headRevisionForChapter(selected.id)
    const nextSeq = (head?.seq ?? 0) + 1
    const { revision, log } = mockDispatch({
      type: 'saveDraft',
      caseId: document.caseId,
      documentId: document.id,
      chapterId: selected.id,
      body: selected.body,
      seq: nextSeq,
      parentRevisionId: head?.id,
      actor: 'user',
      note: '用户保存草稿',
    })
    setRevisions((prev) => [...prev, revision])
    setDocument((d) => ({ ...d, headRevisionId: revision.id }))
    setCommandLog((prev) => [...prev, log])
    setSavedBodies((prev) => ({ ...prev, [selected.id]: selected.body }))
  }

  const makeProposal = (mode: 'dry-run' | 'formal') => {
    if (!selected) return
    const head = headRevisionForChapter(selected.id)
    const { proposedBody, summary } = mockRewriteChapter(
      selected.title,
      selected.body,
    )
    const p: DocProposal = {
      id: nextId('prop'),
      documentId: document.id,
      chapterId: selected.id,
      baseRevisionId: head?.id ?? document.headRevisionId,
      proposedBody,
      summary,
      hitlGateId: mode === 'formal' ? 'approve_strategy' : undefined,
      mode,
      status: mode === 'formal' ? 'pending' : 'preview',
      createdAt: new Date().toISOString(),
    }
    setProposal(p)
    setRightTab('agent')
  }

  const onConfirm = () => {
    if (!proposal || proposal.status !== 'pending' || proposal.mode !== 'formal')
      return
    const chapter = chapters.find((c) => c.id === proposal.chapterId)
    if (!chapter) return
    const head = headRevisionForChapter(proposal.chapterId)
    const nextSeq = (head?.seq ?? 0) + 1
    const { revision, log } = mockDispatch({
      type: 'submitClaims',
      caseId: document.caseId,
      documentId: document.id,
      chapterId: proposal.chapterId,
      body: proposal.proposedBody,
      seq: nextSeq,
      parentRevisionId: proposal.baseRevisionId,
      actor: 'agent',
      note: 'Agent 建议经 HITL 确认写入',
    })
    setRevisions((prev) => [...prev, revision])
    setChapters((prev) =>
      prev.map((c) =>
        c.id === proposal.chapterId ? { ...c, body: proposal.proposedBody } : c,
      ),
    )
    setDocument((d) => ({ ...d, headRevisionId: revision.id }))
    setCommandLog((prev) => [...prev, log])
    setSavedBodies((prev) => ({
      ...prev,
      [proposal.chapterId]: proposal.proposedBody,
    }))
    setProposal({ ...proposal, status: 'accepted' })
  }

  const onReject = () => {
    if (!proposal || proposal.status !== 'pending') return
    setProposal({ ...proposal, status: 'rejected' })
  }

  const handleAddAnnotation = useCallback(
    ({ quote, body }: { quote: string; body: string }): string | null => {
      if (!selected) return null
      const id = nextId('ann')
      const annotation: Annotation = {
        id,
        chapterId: selected.id,
        quote,
        body,
        author: MOCK_AUTHOR,
        createdAt: new Date().toISOString(),
        resolved: false,
        replies: [],
      }
      setAnnotations((prev) => [...prev, annotation])
      setActiveAnnotationId(id)
      setRightTab('annotations')
      return id
    },
    [selected],
  )

  const handleSelectAnnotation = useCallback((id: string) => {
    setActiveAnnotationId(id)
    setFocusToken((prev) => ({ id, n: (prev?.n ?? 0) + 1 }))
  }, [])

  const handleAnnotationMarkClick = useCallback((id: string) => {
    setActiveAnnotationId(id)
    setRightTab('annotations')
  }, [])

  const handleReply = useCallback((id: string, body: string) => {
    setAnnotations((prev) =>
      prev.map((a) =>
        a.id === id
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
    )
  }, [])

  const handleToggleResolved = useCallback((id: string) => {
    setAnnotations((prev) =>
      prev.map((a) => (a.id === id ? { ...a, resolved: !a.resolved } : a)),
    )
  }, [])

  const handleDeleteAnnotation = useCallback(
    (id: string) => {
      setAnnotations((prev) => prev.filter((a) => a.id !== id))
      setActiveAnnotationId((cur) => (cur === id ? null : cur))
      const ed = editorRef.current
      if (ed && !ed.isDestroyed) {
        ed.commands.unsetAnnotation(id)
        onChangeBody(ed.getHTML())
      }
    },
    [onChangeBody],
  )

  const formalBlocked =
    proposal?.status === 'pending' && proposal.mode === 'formal'

  if (!selected) {
    return <div className="p-6 text-sm text-slate-500">无章节</div>
  }

  return (
    <div className="app-shell-bg flex h-full min-h-screen flex-col">
      <TopBar demoCase={DEMO_CASE} document={document} />
      <div className="flex min-h-0 flex-1">
        <DocTree
          demoCase={DEMO_CASE}
          document={document}
          chapters={chapters}
          selectedChapterId={selected.id}
          pending={proposal}
          onSelectChapter={(id) => {
            setSelectedChapterId(id)
            setActiveAnnotationId(null)
            setFocusToken(null)
          }}
        />
        <ChapterEditor
          chapter={selected}
          revisions={revisions}
          dirty={dirty}
          activeAnnotationId={activeAnnotationId}
          focusAnnotationId={focusToken?.id ?? null}
          focusNonce={focusToken?.n ?? 0}
          onChangeBody={onChangeBody}
          onSaveDraft={onSaveDraft}
          onAddAnnotation={handleAddAnnotation}
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
              onSelect={handleSelectAnnotation}
              onReply={handleReply}
              onToggleResolved={handleToggleResolved}
              onDelete={handleDeleteAnnotation}
            />
          }
          agentPane={
            <AgentPanel
              proposal={
                proposal &&
                (proposal.status === 'pending' || proposal.status === 'preview')
                  ? proposal
                  : null
              }
              currentBody={selected.body}
              commandLog={commandLog}
              onDryRun={() => makeProposal('dry-run')}
              onFormal={() => makeProposal('formal')}
              onConfirm={onConfirm}
              onReject={onReject}
              actionsDisabled={Boolean(formalBlocked)}
            />
          }
        />
      </div>
    </div>
  )
}
