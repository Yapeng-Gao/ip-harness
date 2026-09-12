import type { DemoCase, Document, DocumentChapter, DocumentRevision } from './types'

export const DEMO_CASE: DemoCase = {
  id: 'c-doc-1',
  title: '演示案 · 智能传感装置',
}

const CHAPTER_DEFS: Omit<DocumentChapter, 'body'>[] = [
  {
    id: 'ch-abstract',
    documentId: 'doc-patent-draft-1',
    key: 'abstract',
    title: '发明摘要',
    sort: 1,
  },
  {
    id: 'ch-claims',
    documentId: 'doc-patent-draft-1',
    key: 'claims',
    title: '权利要求',
    sort: 2,
  },
  {
    id: 'ch-embodiment',
    documentId: 'doc-patent-draft-1',
    key: 'embodiment',
    title: '实施例',
    sort: 3,
  },
]

const SEED_BODIES: Record<string, string> = {
  'ch-abstract':
    '本发明涉及一种智能传感装置，包括传感模块、处理单元与通信接口。该装置可在工业现场采集多源信号，并经边缘侧预处理后上报云端，提升监测实时性与可靠性。',
  'ch-claims':
    '1. 一种智能传感装置，其特征在于，包括：\n' +
    '传感模块，用于采集现场物理量；\n' +
    '处理单元，与所述传感模块耦接，用于对采集信号进行滤波与特征提取；\n' +
    '通信接口，与所述处理单元耦接，用于将处理结果上报至上位系统。\n\n' +
    '2. 根据权利要求1所述的装置，其特征在于，所述处理单元还配置为在边缘侧执行异常检测。',
  'ch-embodiment':
    '在一个实施例中，传感模块采用多通道 ADC 采样，处理单元为低功耗 MCU，通信接口支持工业以太网。现场部署时可挂载于管道外侧，通过夹持结构固定。异常检测可采用滑动窗口统计阈值，超限时触发本地告警并缓存上报。',
}

const SEED_AT = '2026-09-12T10:00:00.000Z'

export function buildSeed(): {
  document: Document
  chapters: DocumentChapter[]
  revisions: DocumentRevision[]
} {
  const revisions: DocumentRevision[] = CHAPTER_DEFS.map((ch) => ({
    id: `rev-seed-${ch.id}`,
    documentId: ch.documentId,
    chapterId: ch.id,
    seq: 1,
    body: SEED_BODIES[ch.id] ?? '',
    actor: 'user' as const,
    createdAt: SEED_AT,
    note: '种子稿',
  }))

  const chapters: DocumentChapter[] = CHAPTER_DEFS.map((ch) => ({
    ...ch,
    body: SEED_BODIES[ch.id] ?? '',
  }))

  const claimsRev = revisions.find((r) => r.chapterId === 'ch-claims')!

  const document: Document = {
    id: 'doc-patent-draft-1',
    caseId: DEMO_CASE.id,
    stageId: 'drafting',
    handoffKey: 'draft_claims',
    title: '专利申请草稿',
    chapterIds: CHAPTER_DEFS.map((c) => c.id),
    headRevisionId: claimsRev.id,
    skuLabel: 'wb.stage.draft',
  }

  return { document, chapters, revisions }
}

export const DEFAULT_CHAPTER_ID = 'ch-claims'
