import { useCallback, useMemo, useState } from 'react'
import { AgentPanel } from './components/AgentPanel'
import { ChapterEditor } from './components/ChapterEditor'
import { DocTree } from './components/DocTree'
import { TopBar } from './components/TopBar'
import { mockDispatch, mockRewriteChapter, nextId } from './mockDispatch'
import { buildSeed, DEFAULT_CHAPTER_ID, DEMO_CASE } from './seed'
import type {
  CommandLogEntry,
  Document,
  DocumentChapter,
  DocumentRevision,
  DocProposal,
} from './types'

const seed = buildSeed()

export default function App() {
  const [document, setDocument] = useState<Document>(seed.document)
  const [chapters, setChapters] = useState<DocumentChapter[]>(seed.chapters)
  const [revisions, setRevisions] = useState<DocumentRevision[]>(seed.revisions)
  const [selectedChapterId, setSelectedChapterId] = useState(DEFAULT_CHAPTER_ID)
  const [proposal, setProposal] = useState<DocProposal | null>(null)
  const [commandLog, setCommandLog] = useState<CommandLogEntry[]>([])
  /** chapterId → last saved body fingerprint for dirty */
  const [savedBodies, setSavedBodies] = useState<Record<string, string>>(() =>
    Object.fromEntries(seed.chapters.map((c) => [c.id, c.body])),
  )

  const selected = useMemo(
    () => chapters.find((c) => c.id === selectedChapterId) ?? chapters[0],
    [chapters, selectedChapterId],
  )

  const dirty = selected ? selected.body !== savedBodies[selected.id] : false

  const headRevisionForChapter = useCallback(
    (chapterId: string) => {
      const list = revisions
        .filter((r) => r.chapterId === chapterId)
        .sort((a, b) => b.seq - a.seq)
      return list[0]
    },
    [revisions],
  )

  const onChangeBody = (body: string) => {
    setChapters((prev) =>
      prev.map((c) => (c.id === selectedChapterId ? { ...c, body } : c)),
    )
  }

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
    const { proposedBody, summary } = mockRewriteChapter(selected.title, selected.body)
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
  }

  const onConfirm = () => {
    if (!proposal || proposal.status !== 'pending' || proposal.mode !== 'formal') return
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
    // 驳回：无 command、无 revision
    setProposal({ ...proposal, status: 'rejected' })
  }

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
          onSelectChapter={setSelectedChapterId}
        />
        <ChapterEditor
          chapter={selected}
          revisions={revisions}
          dirty={dirty}
          onChangeBody={onChangeBody}
          onSaveDraft={onSaveDraft}
        />
        <AgentPanel
          proposal={
            proposal &&
            (proposal.status === 'pending' || proposal.status === 'preview')
              ? proposal
              : null
          }
          commandLog={commandLog}
          onDryRun={() => makeProposal('dry-run')}
          onFormal={() => makeProposal('formal')}
          onConfirm={onConfirm}
          onReject={onReject}
          actionsDisabled={Boolean(formalBlocked)}
        />
      </div>
    </div>
  )
}
