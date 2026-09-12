/** 样机本地类型 · 对齐 docs/architecture/doc-harness/doc-model · 不写入 DomainCommand union */

/** 章 key：撰写三章 + OA/交底示意；本 app 放宽，勿改 @ip/contracts */
export type ChapterKey =
  | 'abstract'
  | 'claims'
  | 'embodiment'
  | 'oa_points'
  | 'response_strategy'
  | 'amended_claims'
  | 'disclosure'
  | 'prior_art'
  | 'figures'

/** 阶段示意：本 app string 联合，勿改 contracts StageId */
export type DocStageId = 'drafting' | 'prosecution' | 'inventor'

export type DocHandoffKey =
  | 'draft_claims'
  | 'oa_response'
  | 'inventor_disclosure'
  | string

export type DocSkuLabel =
  | 'wb.stage.draft'
  | 'wb.stage.prosecution'
  | 'wb.stage.inventor'
  | string

export type RevisionActor = 'user' | 'agent'

/** 对外 mock commandType：submitClaims / saveDraft；doc.apply_revision 仅作日志旁注 */
export type MockCommandType = 'submitClaims' | 'saveDraft'

export interface DemoCase {
  id: string
  title: string
  /** 切换器短名 */
  shortLabel: string
  stageId: DocStageId
  blurb: string
}

/** 规格 Document · stage/handoff/sku 在本 app 放宽为联合，非 contracts 钉死 */
export interface Document {
  id: string
  caseId: string
  stageId: DocStageId
  handoffKey: DocHandoffKey
  title: string
  chapterIds: string[]
  headRevisionId: string
  skuLabel: DocSkuLabel
  /**
   * SKU/阶段闸 mock：false → 整案只读 + 原因横幅（slate CTA）
   * 样机示意，非真 IAM/SKU 执法
   */
  authorized: boolean
  unauthorizedReason?: string
}

export interface DocumentChapter {
  id: string
  documentId: string
  key: ChapterKey
  title: string
  sort: number
  /** 当前正文 HTML（TipTap getHTML；由 head revision 投影；手改可 dirty） */
  body: string
  /** 章级闸 mock：locked → 只读 */
  locked?: boolean
  lockReason?: string
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

/** TipTap 批注样机 · 内存态 · 非 Word 修订/协同 */
export interface AnnotationReply {
  id: string
  body: string
  author: string
  createdAt: string
}

export interface Annotation {
  id: string
  chapterId: string
  quote: string
  body: string
  author: string
  createdAt: string
  resolved: boolean
  replies: AnnotationReply[]
  /**
   * 采纳建议后按 quote 重挂失败 → orphan：列表保留，Mark 缺失提示
   * （批注保真策略见 README）
   */
  orphan?: boolean
}

/** 整案种子包 · App 按 caseId 加载 */
export interface CaseBundle {
  caseMeta: DemoCase
  document: Document
  chapters: DocumentChapter[]
  revisions: DocumentRevision[]
  annotations: Annotation[]
  defaultChapterId: string
}

/** 工具栏「加批注」→ 侧栏内联起草（取代 window.prompt） */
export interface AnnotationDraft {
  quote: string
  from: number
  to: number
}
