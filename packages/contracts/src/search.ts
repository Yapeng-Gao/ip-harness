/**
 * Search API shapes — shared by apps/search (mock) and apps/search-api (sqlite-fts).
 * Additive only; does not touch APP_PORTS / APP_DEV_URLS.
 */

export type SearchMode = 'semantic' | 'keyword' | 'advanced'

export type SearchFilters = {
  dateFrom?: string
  dateTo?: string
  ipcPrefix?: string[]
  applicants?: string[]
  docTypes?: string[]
  legalStatus?: string[]
  collapseFamily?: boolean
  /** ISO country codes when present on docs */
  country?: string[]
}

export type SearchQuery = {
  mode: SearchMode
  text?: string
  advanced?: Record<string, string>
  filters?: SearchFilters
  limit?: number
}

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
}

export type FamilyGroup = {
  familyId: string
  members: SearchHit[]
}

/** Engine id — mock shell keeps 'mock'; search-api uses 'sqlite-fts' (or other real backends). */
export type SearchBackend = 'mock' | 'sqlite-fts' | (string & {})

export type SearchResponse = {
  query: SearchQuery
  hits: SearchHit[]
  families?: FamilyGroup[]
  tookMs: number
  backend: SearchBackend
  indexVersion?: string
}
