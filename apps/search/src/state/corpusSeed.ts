import type {
  CorpusSource,
  FieldCoverageRow,
  IndexVersion,
} from './types'

/** Honest样机估算 — some fields <100% so index is not fake-perfect. */
export const SEED_FIELD_COVERAGE: FieldCoverageRow[] = [
  {
    field: 'publicationNumber',
    label: 'publicationNumber',
    coveragePct: 100,
    note: '主键必有',
  },
  {
    field: 'title',
    label: 'title',
    coveragePct: 98,
    note: '极少数缺题名',
  },
  {
    field: 'applicant',
    label: 'applicant',
    coveragePct: 94,
    note: '部分早期公开缺申请人',
  },
  {
    field: 'date',
    label: 'date',
    coveragePct: 97,
    note: '日期归一化后仍有缺口',
  },
  {
    field: 'ipc',
    label: 'ipc',
    coveragePct: 89,
    note: '未分类 / 旧体系',
  },
  {
    field: 'abstract',
    label: 'abstract',
    coveragePct: 82,
    note: '摘要抽取不全',
  },
  {
    field: 'claims',
    label: 'claims',
    coveragePct: 71,
    note: '权利要求 OCR / 缺页最多',
  },
  {
    field: 'familyId',
    label: 'familyId',
    coveragePct: 64,
    note: '非真 INPADOC；样机估算',
  },
]

export const SEED_CORPUS_SOURCES: CorpusSource[] = [
  {
    id: 'src-cnipa',
    name: 'CNIPA 批量',
    kind: '官方批量 XML/PDF',
    note: '示意入库 · 无真下载',
    lastIngestAt: '2026-09-01T08:00:00.000Z',
    docsIngested: 4200,
  },
  {
    id: 'src-uspto',
    name: 'USPTO weekly',
    kind: '周更包',
    note: '示意入库 · 无真 FTP',
    lastIngestAt: '2026-09-08T12:30:00.000Z',
    docsIngested: 1850,
  },
  {
    id: 'src-epo',
    name: 'EPO XML',
    kind: 'EPO DOCDB 子集',
    note: '示意入库 · 无真对象存储',
    lastIngestAt: '2026-08-20T09:15:00.000Z',
    docsIngested: 960,
  },
  {
    id: 'src-memo',
    name: '内部备忘',
    kind: '人工标注 / 备忘',
    note: '内部笔记源 · 不进训练湖',
    lastIngestAt: null,
    docsIngested: 42,
  },
]

export const SEED_INDEX_VERSIONS: IndexVersion[] = [
  {
    tag: 'idx-v0.1',
    docs: 5200,
    publishedAt: '2026-07-15T10:00:00.000Z',
    checksum: 'sha256:mock-idx-v0.1-aaaaaaaa',
    fieldCoverage: SEED_FIELD_COVERAGE.map((r) => ({
      ...r,
      coveragePct: Math.max(40, r.coveragePct - 12),
    })),
    immutable: true,
    note: '历史发布 · 不可改',
  },
  {
    tag: 'idx-v0.2',
    docs: 6400,
    publishedAt: '2026-08-12T14:20:00.000Z',
    checksum: 'sha256:mock-idx-v0.2-bbbbbbbb',
    fieldCoverage: SEED_FIELD_COVERAGE.map((r) => ({
      ...r,
      coveragePct: Math.max(45, r.coveragePct - 6),
    })),
    immutable: true,
    note: '历史发布 · 不可改',
  },
  {
    tag: 'idx-v0.3',
    docs: 7052,
    publishedAt: '2026-09-05T06:40:00.000Z',
    checksum: 'sha256:mock-idx-v0.3-cccccccc',
    fieldCoverage: SEED_FIELD_COVERAGE.map((r) => ({ ...r })),
    immutable: true,
    note: '当前索引 · 不可改',
  },
]

export const CURRENT_INDEX_TAG = 'idx-v0.3'
