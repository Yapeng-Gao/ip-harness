/** 样机本地类型 · 对齐 docs/architecture/doc-harness/doc-model · 不写入 DomainCommand union */

export type ChapterKey = 'abstract' | 'claims' | 'embodiment'

export type RevisionActor = 'user' | 'agent'

/** 对外 mock commandType：submitClaims / saveDraft；doc.apply_revision 仅作日志旁注 */
export type MockCommandType = 'submitClaims' | 'saveDraft'

export interface DemoCase {
  id: string
  title: string
}

/** 规格 Document */
export interface Document {
  id: string
  caseId: string
  stageId: 'drafting'
  handoffKey: 'draft_claims'
  title: string
  chapterIds: string[]
  headRevisionId: string
  /** 顶栏展示用 SKU mock */
  skuLabel: 'wb.stage.draft'
}

export interface DocumentChapter {
  id: string
  documentId: string
  key: ChapterKey
  title: string
  sort: number
  /** 当前正文（由 head revision 投影；手改可 dirty） */
  body: string
}

export interface DocumentRevision {
  id: string
  documentId: string
  chapterId: string
  seq: number
  body: string
  actor: RevisionActor
  commandType?: MockCommandType
  parentRevisionId?: string
  createdAt: string
  note?: string
}

/** 对齐 harness-loop DocProposal */
export interface DocProposal {
  id: string
  documentId: string
  chapterId: string
  baseRevisionId: string
  proposedBody: string
  summary: string
  hitlGateId?: string
  /** dry-run 不进 pending 确认写入；formal → pending */
  mode: 'dry-run' | 'formal'
  status: 'pending' | 'accepted' | 'rejected' | 'preview'
  createdAt: string
}

export interface CommandLogEntry {
  id: string
  command: {
    type: MockCommandType
    caseId: string
    note?: string
  }
  meta: {
    actor: 'user' | 'agent'
    agentId?: 'doc-harness-mock'
    detail: string
    /** 旁注：内部示意名，非 DomainCommand */
    internalHint?: 'doc.apply_revision'
  }
  at: string
  revisionId?: string
  chapterId?: string
}
