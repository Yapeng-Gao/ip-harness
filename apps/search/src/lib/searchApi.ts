/**
 * Flag-wire to apps/search-api (:5190).
 * Empty VITE_SEARCH_API_URL → callers stay on in-memory mock.
 */
import type {
  FamilyGroup,
  SearchHit,
  SearchQuery,
  SearchResponse,
} from '../state/types'

export const SEARCH_API_FALLBACK_TOAST =
  'Search API 不可用，已回退样机 mock'

export function getSearchApiUrl(): string {
  const raw = import.meta.env.VITE_SEARCH_API_URL
  return typeof raw === 'string' ? raw.trim().replace(/\/$/, '') : ''
}

export function isSearchApiEnabled(): boolean {
  return getSearchApiUrl().length > 0
}

export function getSearchApiTimeoutMs(): number {
  const raw = import.meta.env.VITE_SEARCH_API_TIMEOUT_MS
  const n = typeof raw === 'string' ? Number(raw) : NaN
  return Number.isFinite(n) && n > 0 ? n : 3000
}

export type SearchApiHealth = {
  ok: boolean
  backend?: string
  docs?: number
  indexAlias?: { alias?: string; tag?: string }
}

export type SearchApiResult =
  | { ok: true; response: SearchResponse }
  | { ok: false; reason: 'network' | 'http' | 'timeout' | 'invalid'; status?: number }

function normalizeHit(raw: Record<string, unknown>): SearchHit | null {
  const id = String(raw.id ?? '')
  const publicationNumber = String(
    raw.publicationNumber ?? raw.publication_number ?? '',
  )
  const title = String(raw.title ?? '')
  if (!id || !publicationNumber || !title) return null
  const score =
    typeof raw.score === 'number'
      ? raw.score
      : Number(raw.score) || 0
  const ipc = Array.isArray(raw.ipc)
    ? raw.ipc.map(String)
    : undefined
  return {
    id,
    publicationNumber,
    title,
    applicant: raw.applicant != null ? String(raw.applicant) : undefined,
    date: raw.date != null ? String(raw.date) : undefined,
    ipc,
    score,
    familyId: raw.familyId != null ? String(raw.familyId) : undefined,
    snippet: raw.snippet != null ? String(raw.snippet) : undefined,
    inventor: raw.inventor != null ? String(raw.inventor) : undefined,
    country: raw.country != null ? String(raw.country) : undefined,
    legalStatus: raw.legalStatus != null ? String(raw.legalStatus) : undefined,
    claims: raw.claims != null ? String(raw.claims) : undefined,
    abstract: raw.abstract != null ? String(raw.abstract) : undefined,
  }
}

function normalizeFamilies(
  raw: unknown,
  hits: SearchHit[],
): FamilyGroup[] | undefined {
  if (!Array.isArray(raw)) {
    // Build from hits if API omitted families
    const map = new Map<string, SearchHit[]>()
    for (const h of hits) {
      if (!h.familyId) continue
      const list = map.get(h.familyId) ?? []
      list.push(h)
      map.set(h.familyId, list)
    }
    if (map.size === 0) return undefined
    return [...map.entries()].map(([familyId, members]) => ({
      familyId,
      members,
    }))
  }
  const out: FamilyGroup[] = []
  for (const g of raw) {
    if (!g || typeof g !== 'object') continue
    const rec = g as Record<string, unknown>
    const familyId = String(rec.familyId ?? '')
    if (!familyId) continue
    const membersRaw = Array.isArray(rec.members) ? rec.members : []
    const members = membersRaw
      .map((m) =>
        m && typeof m === 'object'
          ? normalizeHit(m as Record<string, unknown>)
          : null,
      )
      .filter((m): m is SearchHit => !!m)
    out.push({ familyId, members })
  }
  return out
}

function normalizeResponse(
  raw: unknown,
  fallbackQuery: SearchQuery,
): SearchResponse | null {
  if (!raw || typeof raw !== 'object') return null
  const rec = raw as Record<string, unknown>
  const hitsRaw = Array.isArray(rec.hits) ? rec.hits : null
  if (!hitsRaw) return null
  const hits = hitsRaw
    .map((h) =>
      h && typeof h === 'object'
        ? normalizeHit(h as Record<string, unknown>)
        : null,
    )
    .filter((h): h is SearchHit => !!h)
  const tookMs =
    typeof rec.tookMs === 'number' ? rec.tookMs : Number(rec.tookMs) || 0
  const backend =
    typeof rec.backend === 'string' && rec.backend.length > 0
      ? rec.backend
      : 'sqlite-fts'
  const query =
    rec.query && typeof rec.query === 'object'
      ? ({ ...fallbackQuery, ...(rec.query as SearchQuery) } as SearchQuery)
      : fallbackQuery
  const warnings = Array.isArray(rec.warnings)
    ? rec.warnings.map(String)
    : undefined
  const indexVersion =
    typeof rec.indexVersion === 'string' ? rec.indexVersion : undefined
  return {
    query,
    hits,
    families: normalizeFamilies(rec.families, hits),
    tookMs,
    backend,
    indexVersion,
    warnings,
  }
}

async function fetchWithTimeout(
  url: string,
  init: RequestInit,
  timeoutMs: number,
): Promise<Response> {
  const controller = new AbortController()
  const timer = setTimeout(() => controller.abort(), timeoutMs)
  try {
    return await fetch(url, { ...init, signal: controller.signal })
  } finally {
    clearTimeout(timer)
  }
}

export async function checkSearchApiHealth(): Promise<SearchApiHealth | null> {
  const base = getSearchApiUrl()
  if (!base) return null
  try {
    const res = await fetchWithTimeout(
      `${base}/health`,
      { method: 'GET' },
      getSearchApiTimeoutMs(),
    )
    if (!res.ok) return { ok: false }
    const body = (await res.json()) as SearchApiHealth
    return { ...body, ok: body.ok !== false }
  } catch {
    return { ok: false }
  }
}

export async function searchViaApi(
  query: SearchQuery,
): Promise<SearchApiResult> {
  const base = getSearchApiUrl()
  if (!base) {
    return { ok: false, reason: 'invalid' }
  }
  const timeoutMs = getSearchApiTimeoutMs()
  const body = {
    mode: query.mode,
    text: query.text,
    advanced: query.advanced,
    filters: query.filters,
    limit: query.limit,
  }
  try {
    const res = await fetchWithTimeout(
      `${base}/search`,
      {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify(body),
      },
      timeoutMs,
    )
    if (!res.ok) {
      return { ok: false, reason: 'http', status: res.status }
    }
    const json: unknown = await res.json()
    const response = normalizeResponse(json, query)
    if (!response) {
      return { ok: false, reason: 'invalid' }
    }
    return { ok: true, response }
  } catch (e) {
    const aborted =
      e instanceof DOMException
        ? e.name === 'AbortError'
        : e instanceof Error && e.name === 'AbortError'
    return { ok: false, reason: aborted ? 'timeout' : 'network' }
  }
}
