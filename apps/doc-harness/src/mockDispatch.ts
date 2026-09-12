import type { CommandLogEntry, DocumentRevision, MockCommandType } from './types'

let seqCounter = 0

export function nextId(prefix: string): string {
  seqCounter += 1
  return `${prefix}-${Date.now().toString(36)}-${seqCounter}`
}

/**
 * mock dispatch 形状对齐 harness-loop：
 * { command: { type: 'submitClaims'|'saveDraft', caseId, note? }, meta: {...} }
 * 不写入 DomainCommand union；不调用 packages 执法。
 */
export function mockDispatch(args: {
  type: MockCommandType
  caseId: string
  documentId: string
  chapterId: string
  body: string
  seq: number
  parentRevisionId?: string
  actor: 'user' | 'agent'
  note?: string
}): { revision: DocumentRevision; log: CommandLogEntry } {
  const revisionId = nextId('rev')
  const at = new Date().toISOString()
  const revision: DocumentRevision = {
    id: revisionId,
    documentId: args.documentId,
    chapterId: args.chapterId,
    seq: args.seq,
    body: args.body,
    actor: args.actor,
    commandType: args.type,
    parentRevisionId: args.parentRevisionId,
    createdAt: at,
    note: args.note,
  }
  const log: CommandLogEntry = {
    id: nextId('cmd'),
    command: {
      type: args.type,
      caseId: args.caseId,
      note: args.note,
    },
    meta: {
      actor: args.actor,
      agentId: args.actor === 'agent' ? 'doc-harness-mock' : undefined,
      detail:
        args.type === 'submitClaims'
          ? `claims chapter revision seq=${args.seq}`
          : `saveDraft chapter=${args.chapterId} seq=${args.seq}`,
      internalHint: args.type === 'submitClaims' ? 'doc.apply_revision' : undefined,
    },
    at,
    revisionId,
    chapterId: args.chapterId,
  }
  return { revision, log }
}

/** 基于当前正文的简单 mock 改写（标明 mock，无真 LLM） */
export function mockRewriteChapter(title: string, body: string): {
  proposedBody: string
  summary: string
} {
  const stamp = new Date().toLocaleString('zh-CN', { hour12: false })
  const proposedBody =
    `【mock 建议稿 · ${stamp}】\n` +
    `（本章：${title} · 非真 LLM，仅样机改写示意）\n\n` +
    body.trim() +
    '\n\n——\n（mock）已润色结构提示：请人工核对术语一致性与从属关系。'
  return {
    proposedBody,
    summary: `对「${title}」生成 mock 建议稿（前缀标注 + 润色提示尾注）`,
  }
}
