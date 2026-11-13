import type { SearchFilters, SearchHit, SearchQuery, SearchResponse } from '@ip/contracts'
import type { Db } from './db.js'
import { getCurrentAlias } from './ingest.js'
import { BACKEND_ID } from './types.js'

type DocRow = {
  id: string
  publication_number: string
  title: string
  applicant: string | null
  date: string | null
  ipc_json: string
  family_id: string | null
  country: string | null
  snippet: string | null
  abstract: string | null
  claims: string | null
  score: number
}

const CJK_RE = /[\u3400-\u9fff]/u


/** Groups of AND-tokens, OR between groups. */
function tokenGroups(text: string): string[][] {
  const orParts = text.split(/\s+OR\s+/i)
  const groups: string[][] = []
  for (const part of orParts) {
    const tokens = part
      .replace(/[()]/g, ' ')
      .split(/\s+AND\s+/i)
      .flatMap((p) => {
        const trimmed = p.trim()
        if (!trimmed) return []
        // Keep CJK phrase intact; also split latin by spaces already done
        if (CJK_RE.test(trimmed) && !/\s/.test(trimmed)) return [trimmed]
        return trimmed.split(/[\s,;|/+\-_]+/u)
      })
      .map((t) => t.trim())
      .filter((t) => t.length > 0 && !/^(and|or)$/i.test(t))
    if (tokens.length) groups.push(tokens)
  }
  return groups
}

function escapeLike(s: string): string {
  return s.replace(/([\\%_])/g, '\\$1')
}

function parseIpc(json: string): string[] {
  try {
    const v = JSON.parse(json) as unknown
    return Array.isArray(v) ? v.map(String) : []
  } catch {
    return []
  }
}

function applySqlFilters(
  filters: SearchFilters | undefined,
): { clause: string; params: Record<string, string | number> } {
  const parts: string[] = []
  const params: Record<string, string | number> = {}
  if (!filters) return { clause: '', params }

  if (filters.dateFrom) {
    parts.push('d.date >= @dateFrom')
    params.dateFrom = filters.dateFrom
  }
  if (filters.dateTo) {
    parts.push('d.date <= @dateTo')
    params.dateTo = filters.dateTo
  }
  if (filters.country && filters.country.length > 0) {
    const countries = filters.country.map((c) => c.trim().toUpperCase()).filter(Boolean)
    if (countries.length >= 1) {
      const placeholders = countries.map((_, i) => `@country${i}`)
      countries.forEach((c, i) => {
        params[`country${i}`] = c
      })
      parts.push(
        `UPPER(COALESCE(d.country, substr(d.publication_number, 1, 2))) IN (${placeholders.join(',')})`,
      )
    }
  }
  if (filters.applicants && filters.applicants.length > 0) {
    const apps = filters.applicants.map((a) => a.trim()).filter(Boolean)
    if (apps.length > 0) {
      const ors = apps.map((_, i) => `LOWER(COALESCE(d.applicant,'')) LIKE @app${i} ESCAPE '\\'`)
      apps.forEach((a, i) => {
        params[`app${i}`] = `%${escapeLike(a.toLowerCase())}%`
      })
      parts.push(`(${ors.join(' OR ')})`)
    }
  }
  if (filters.ipcPrefix && filters.ipcPrefix.length > 0) {
    const prefs = filters.ipcPrefix.map((p) => p.trim()).filter(Boolean)
    if (prefs.length > 0) {
      const ors = prefs.map((_, i) => `UPPER(d.ipc_json) LIKE @ipc${i} ESCAPE '\\'`)
      prefs.forEach((p, i) => {
        params[`ipc${i}`] = `%${escapeLike(p.toUpperCase())}%`
      })
      parts.push(`(${ors.join(' OR ')})`)
    }
  }

  return {
    clause: parts.length ? ` AND ${parts.join(' AND ')}` : '',
    params,
  }
}

function rowToHit(row: DocRow): SearchHit {
  const ipc = parseIpc(row.ipc_json)
  return {
    id: row.id,
    publicationNumber: row.publication_number,
    title: row.title,
    applicant: row.applicant ?? undefined,
    date: row.date ?? undefined,
    ipc: ipc.length ? ipc : undefined,
    score: row.score,
    familyId: row.family_id ?? undefined,
    snippet: row.snippet ?? row.abstract?.slice(0, 120) ?? undefined,
  }
}

function filterIpcPrefix(hits: SearchHit[], prefixes?: string[]): SearchHit[] {
  if (!prefixes || prefixes.length === 0) return hits
  return hits.filter((h) =>
    prefixes.some((p) => (h.ipc ?? []).some((i) => i.toUpperCase().startsWith(p.toUpperCase()))),
  )
}

function haystack(row: DocRow): string {
  return [
    row.title,
    row.abstract ?? '',
    row.claims ?? '',
    row.applicant ?? '',
    row.publication_number,
    row.snippet ?? '',
  ]
    .join('\n')
    .toLowerCase()
}

function groupMatches(row: DocRow, groups: string[][]): number {
  const hay = haystack(row)
  let best = 0
  for (const tokens of groups) {
    let score = 0
    let all = true
    for (const t of tokens) {
      if (hay.includes(t.toLowerCase())) score += t.length >= 3 ? 2 : 1
      else {
        all = false
        break
      }
    }
    if (all) best = Math.max(best, score)
  }
  return best
}

/**
 * Hybrid retrieval:
 * - FTS5 trigram for tokens/phrases length ≥ 3
 * - LIKE substring for short CJK (trigram needs ≥3) and as recall assist
 * - Final AND/OR scoring on over-fetched candidates
 */
export function search(db: Db, query: SearchQuery): SearchResponse {
  const t0 = Date.now()
  const limit = Math.min(Math.max(query.limit ?? 20, 1), 100)
  const mode = query.mode ?? 'keyword'
  const alias = getCurrentAlias(db)

  let noteUnsupported: string | undefined
  if (mode === 'semantic') {
    noteUnsupported = 'semantic_unsupported_degraded_to_keyword'
  }

  const text =
    query.text?.trim() ||
    (query.advanced
      ? Object.values(query.advanced)
          .filter(Boolean)
          .join(' ')
      : '')

  const groups = text ? tokenGroups(text) : []
  const { clause, params } = applySqlFilters(query.filters)

  let hits: SearchHit[] = []

  if (groups.length === 0) {
    hits = []
  } else {
    const flatTokens = [...new Set(groups.flat())]
    const idSet = new Set<string>()

    // FTS trigram path (≥3 char tokens)
    for (const tok of flatTokens) {
      if (tok.length < 3) continue
      try {
        const rows = db
          .prepare(
            `SELECT id FROM documents_fts WHERE documents_fts MATCH ? LIMIT 500`,
          )
          .all(tok) as { id: string }[]
        for (const r of rows) idSet.add(r.id)
      } catch {
        // ignore bad fts token
      }
    }

    // LIKE path (short CJK + recall)
    for (const tok of flatTokens) {
      const like = `%${escapeLike(tok)}%`
      const rows = db
        .prepare(
          `SELECT id FROM documents
           WHERE title LIKE ? ESCAPE '\\'
              OR IFNULL(abstract,'') LIKE ? ESCAPE '\\'
              OR IFNULL(claims,'') LIKE ? ESCAPE '\\'
              OR IFNULL(applicant,'') LIKE ? ESCAPE '\\'
              OR publication_number LIKE ? ESCAPE '\\'
           LIMIT 500`,
        )
        .all(like, like, like, like, like) as { id: string }[]
      for (const r of rows) idSet.add(r.id)
    }

    const ids = [...idSet]
    if (ids.length > 0) {
      const placeholders = ids.map((_, i) => `@id${i}`).join(',')
      const idParams: Record<string, string> = {}
      ids.forEach((id, i) => {
        idParams[`id${i}`] = id
      })
      const sql = `
        SELECT d.id, d.publication_number, d.title, d.applicant, d.date, d.ipc_json,
               d.family_id, d.country, d.snippet, d.abstract, d.claims,
               0 AS score
        FROM documents d
        WHERE d.id IN (${placeholders})
        ${clause}
      `
      const rows = db.prepare(sql).all({ ...idParams, ...params }) as DocRow[]
      const scored = rows
        .map((row) => {
          const score = groupMatches(row, groups)
          return { ...row, score }
        })
        .filter((r) => r.score > 0)
        .sort((a, b) => b.score - a.score || (b.date ?? '').localeCompare(a.date ?? ''))
      hits = scored.map(rowToHit)
      hits = filterIpcPrefix(hits, query.filters?.ipcPrefix)
      hits = hits.slice(0, limit)
    }
  }

  if (query.filters?.collapseFamily) {
    const seen = new Set<string>()
    hits = hits.filter((h) => {
      const fid = h.familyId ?? h.id
      if (seen.has(fid)) return false
      seen.add(fid)
      return true
    })
  }

  const response: SearchResponse & { warnings?: string[] } = {
    query: {
      ...query,
      mode: query.mode,
      text: query.text,
    },
    hits,
    tookMs: Date.now() - t0,
    backend: BACKEND_ID,
    indexVersion: alias.tag || undefined,
  }
  if (noteUnsupported) response.warnings = [noteUnsupported]
  return response
}
