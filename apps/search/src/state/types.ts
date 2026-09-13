export type SearchMode = 'semantic' | 'keyword' | 'advanced'

export type SearchFilters = {
  dateFrom?: string
  dateTo?: string
  ipcPrefix?: string[]
  applicants?: string[]
  docTypes?: string[]
  legalStatus?: string[]
  collapseFamily?: boolean
}

export type SearchQuery = {
  mode: SearchMode
  text?: string
  advanced?: Record<string, string>
  filters?: SearchFilters
  limit?: number
}

/** Spec SearchHit — Agent JSON must use these field names. */
export type SearchHit = {
  id: string
  publicationNumber: string
  title: string
  applicant?: string
  date?: string
  ipc?: string[]
  score: number
  familyId?: string
  snippet?: string
  /** Drawer extras (optional; not required on Agent contract) */
  inventor?: string
  country?: string
  legalStatus?: string
  claims?: string
  abstract?: string
}

export type FamilyGroup = {
  familyId: string
  members: SearchHit[]
}

export type SearchResponse = {
  query: SearchQuery
  hits: SearchHit[]
  families?: FamilyGroup[]
  tookMs: number
  backend: 'mock'
}

export type AdvancedRow = {
  id: string
  field: 'title' | 'abstract' | 'applicant' | 'ipc' | 'publicationNumber' | 'date'
  value: string
}

export type QueryStatus = 'idle' | 'running' | 'done' | 'empty' | 'error'

export type EventLogEntry = {
  id: string
  at: string
  action:
    | 'search'
    | 'openDetail'
    | 'basket.add'
    | 'basket.remove'
    | 'sendToAgent'
    | 'sendDownstream'
    | 'getFamily'
    | 'save'
    | 'corpus.ingest'
    | 'corpus.publishIndex'
  tool?: string
  note?: string
  hitIds?: string[]
  hits?: { id: string; publicationNumber: string; title: string }[]
  payload?: Record<string, unknown>
}

export type SearchState = {
  mode: SearchMode
  text: string
  advancedRows: AdvancedRow[]
  filters: SearchFilters
  status: QueryStatus
  error: string | null
  forceNextFail: boolean
  hits: SearchHit[]
  families: FamilyGroup[]
  lastQuery: SearchQuery | null
  lastResponse: SearchResponse | null
  selectedHitId: string | null
  basketIds: string[]
  savedIds: string[]
  events: EventLogEntry[]
  toast: string | null
  limit: number
  /** C1 corpus / index slice */
  corpusSources: CorpusSource[]
  corpusJobs: CorpusIngestJob[]
  corpusForceNextFail: boolean
  indexVersions: IndexVersion[]
  currentIndexTag: string
  pendingPublishDocs: number | null
}

export const HONESTY_BANNER =
  '样机 · 无真检索后台 · 非真专利库 / 非真 ES·向量 · 用法对标智慧芽/Innojoy'

export const ADVANCED_FIELD_LABELS: Record<AdvancedRow['field'], string> = {
  title: '标题',
  abstract: '摘要',
  applicant: '申请人',
  ipc: 'IPC',
  publicationNumber: '公开号',
  date: '日期',
}

export function emptyFilters(collapseFamily = true): SearchFilters {
  return {
    dateFrom: '',
    dateTo: '',
    ipcPrefix: [],
    applicants: [],
    docTypes: [],
    legalStatus: [],
    collapseFamily,
  }
}

/** C1 — corpus / index ops (≠ ai-data DatasetVersion) */
export type CorpusJobStatus = 'queued' | 'running' | 'done' | 'fail'

export type CorpusSource = {
  id: string
  name: string
  kind: string
  note: string
  lastIngestAt: string | null
  docsIngested: number
}

export type CorpusIngestJob = {
  id: string
  sourceId: string
  sourceName: string
  status: CorpusJobStatus
  progress: number
  docsWritten: number
  createdAt: string
  updatedAt: string
  note: string
}

export type FieldCoverageKey =
  | 'publicationNumber'
  | 'title'
  | 'applicant'
  | 'date'
  | 'ipc'
  | 'abstract'
  | 'claims'
  | 'familyId'

export type FieldCoverageRow = {
  field: FieldCoverageKey
  label: string
  coveragePct: number
  note: string
}

export type IndexVersion = {
  tag: string
  docs: number
  publishedAt: string
  checksum: string
  fieldCoverage: FieldCoverageRow[]
  immutable: true
  note: string
}

export type DownstreamTarget = 'fto' | 'mining' | 'landscape' | 'doc'

export type DownstreamPlaceholder = {
  target: DownstreamTarget
  label: string
  href: string
}

export const DOWNSTREAM_PLACEHOLDERS: DownstreamPlaceholder[] = [
  { target: 'fto', label: '送 FTO', href: 'http://localhost:5183' },
  { target: 'mining', label: '送 挖掘', href: 'http://localhost:5184' },
  { target: 'landscape', label: '送 全景', href: 'http://localhost:5186' },
  { target: 'doc', label: '送 文档', href: 'http://localhost:5178' },
]

export const CORPUS_HONESTY =
  '≠ ai-data（这不是训练语料湖）· 无真 ES / 倒排 / 对象存储 · 入库不写 PatentCase'

export const FIELD_COVERAGE_LABELS: Record<FieldCoverageKey, string> = {
  publicationNumber: 'publicationNumber',
  title: 'title',
  applicant: 'applicant',
  date: 'date',
  ipc: 'ipc',
  abstract: 'abstract',
  claims: 'claims',
  familyId: 'familyId',
}
