import type { SearchFilters, SearchHit, SearchMode, SearchQuery, SearchResponse } from '@ip/contracts'

export type {
  SearchFilters,
  SearchHit,
  SearchMode,
  SearchQuery,
  SearchResponse,
}

/** Raw patent document as stored in sample JSON / object store. */
export type PatentDoc = {
  id: string
  publicationNumber?: string
  title?: string
  applicant?: string
  inventor?: string
  date?: string
  ipc?: string[]
  familyId?: string
  country?: string
  legalStatus?: string
  abstract?: string
  claims?: string
  snippet?: string
}

export type QuarantineRow = {
  id: string
  reason: string
  rawJson: string
  createdAt: string
}

export type IndexVersionRow = {
  tag: string
  docs: number
  publishedAt: string
  checksum: string
  note: string
  analyzer: string
  embedding: string
}

export const BACKEND_ID = 'sqlite-fts' as const
export const ALIAS_CURRENT = 'search_current'
