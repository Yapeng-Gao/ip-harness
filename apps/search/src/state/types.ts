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
  action: 'search' | 'openDetail' | 'basket.add' | 'basket.remove' | 'sendToAgent' | 'getFamily' | 'save'
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
