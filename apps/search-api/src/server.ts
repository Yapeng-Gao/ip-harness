/**
 * @ip/search-api — Search API MVP (sqlite + FTS5), port 5190
 * backend: sqlite-fts (≠ mock)
 */
import { serve } from '@hono/node-server'
import { Hono } from 'hono'
import { cors } from 'hono/cors'
import { openDb } from './db.js'
import {
  getCurrentAlias,
  hotDocCount,
  ingestSamples,
  listIndexVersions,
  listQuarantine,
  setAlias,
} from './ingest.js'
import { PORT } from './paths.js'
import { search } from './search.js'
import { ALIAS_CURRENT, BACKEND_ID, type SearchQuery } from './types.js'
import fs from 'node:fs'
import { SAMPLES_DIR } from './paths.js'

const db = openDb()

function ensureIngested(): void {
  const count = hotDocCount(db)
  if (count > 0) {
    console.log(`[search-api] hot index docs=${count}, skip auto-ingest`)
    return
  }
  const hasSamples =
    fs.existsSync(SAMPLES_DIR) &&
    fs.readdirSync(SAMPLES_DIR).some((f) => f.endsWith('.json') && !f.startsWith('_'))
  if (!hasSamples) {
    console.warn(`[search-api] no samples; run: npm run generate-samples && npm run ingest`)
    return
  }
  console.log('[search-api] empty DB — running ingest…')
  const stats = ingestSamples(db)
  console.log(
    `[search-api] ingest done: indexed=${stats.indexed} quarantined=${stats.quarantined} version=${stats.indexVersion.tag}`,
  )
}

ensureIngested()

const app = new Hono()
app.use('*', cors())

app.get('/health', (c) => {
  const alias = getCurrentAlias(db)
  return c.json({
    ok: true,
    service: '@ip/search-api',
    backend: BACKEND_ID,
    port: PORT,
    docs: hotDocCount(db),
    quarantine: listQuarantine(db).length,
    indexAlias: alias,
  })
})

app.get('/index/versions', (c) => {
  return c.json({
    alias: getCurrentAlias(db),
    versions: listIndexVersions(db),
  })
})

app.post('/index/alias', async (c) => {
  const body = (await c.req.json().catch(() => ({}))) as { tag?: string }
  if (!body.tag) return c.json({ ok: false, message: 'body.tag required' }, 400)
  try {
    const alias = setAlias(db, body.tag)
    return c.json({ ok: true, alias })
  } catch (e) {
    return c.json({ ok: false, message: e instanceof Error ? e.message : String(e) }, 400)
  }
})

app.post('/index/rollback', async (c) => {
  const body = (await c.req.json().catch(() => ({}))) as { tag?: string }
  const versions = listIndexVersions(db)
  const tag = body.tag ?? versions[1]?.tag
  if (!tag) {
    return c.json(
      { ok: false, message: 'Need body.tag or at least 2 published versions to rollback' },
      400,
    )
  }
  try {
    const alias = setAlias(db, tag)
    return c.json({
      ok: true,
      message: `Alias ${ALIAS_CURRENT} → ${tag}`,
      alias,
      versions,
    })
  } catch (e) {
    return c.json({ ok: false, message: e instanceof Error ? e.message : String(e) }, 400)
  }
})

app.get('/quarantine', (c) => {
  const items = listQuarantine(db)
  return c.json({ count: items.length, items })
})

app.post('/ingest', (c) => {
  try {
    const stats = ingestSamples(db)
    return c.json({ ok: true, ...stats })
  } catch (e) {
    return c.json({ ok: false, message: e instanceof Error ? e.message : String(e) }, 500)
  }
})

function parseSearchQuery(input: Record<string, unknown>): SearchQuery {
  const mode = (input.mode as SearchQuery['mode']) || 'keyword'
  const filters = (input.filters as SearchQuery['filters']) || undefined
  const limit = typeof input.limit === 'number' ? input.limit : Number(input.limit) || 20
  return {
    mode,
    text: typeof input.text === 'string' ? input.text : typeof input.q === 'string' ? input.q : undefined,
    advanced: input.advanced as SearchQuery['advanced'],
    filters,
    limit,
  }
}

app.post('/search', async (c) => {
  const body = (await c.req.json().catch(() => ({}))) as Record<string, unknown>
  const query = parseSearchQuery(body)
  return c.json(search(db, query))
})

app.get('/search', (c) => {
  const q = c.req.query('q') ?? c.req.query('text') ?? ''
  const mode = (c.req.query('mode') as SearchQuery['mode']) || 'keyword'
  const limit = Number(c.req.query('limit') || 20)
  const dateFrom = c.req.query('dateFrom') || undefined
  const dateTo = c.req.query('dateTo') || undefined
  const ipcPrefix = c.req.query('ipcPrefix')
    ? c.req.query('ipcPrefix')!.split(',').map((s) => s.trim()).filter(Boolean)
    : undefined
  const applicants = c.req.query('applicants')
    ? c.req.query('applicants')!.split(',').map((s) => s.trim()).filter(Boolean)
    : undefined
  const country = c.req.query('country')
    ? c.req.query('country')!.split(',').map((s) => s.trim()).filter(Boolean)
    : undefined
  const query: SearchQuery = {
    mode,
    text: q,
    limit,
    filters: { dateFrom, dateTo, ipcPrefix, applicants, country },
  }
  return c.json(search(db, query))
})

serve({ fetch: app.fetch, port: PORT }, (info) => {
  console.log(`[search-api] backend=${BACKEND_ID} http://localhost:${info.port}`)
  console.log(`[search-api] GET /health  POST /search  GET /search?q=  GET /quarantine  GET /index/versions`)
})
