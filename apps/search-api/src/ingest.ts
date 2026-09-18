import fs from 'node:fs'
import path from 'node:path'
import { createHash } from 'node:crypto'
import type { Db } from './db.js'
import { clearHotIndex, clearQuarantine } from './db.js'
import { normalizePatent } from './normalize.js'
import { OBJECTS_DIR, SAMPLES_DIR } from './paths.js'
import { ALIAS_CURRENT, type IndexVersionRow, type PatentDoc } from './types.js'

export type IngestStats = {
  scanned: number
  indexed: number
  quarantined: number
  indexVersion: IndexVersionRow
}

function listSampleFiles(dir: string): string[] {
  if (!fs.existsSync(dir)) return []
  return fs
    .readdirSync(dir)
    .filter((f) => f.endsWith('.json') && !f.startsWith('_'))
    .map((f) => path.join(dir, f))
    .sort()
}

function writeObject(doc: PatentDoc): string {
  const rel = `${doc.id}.json`
  const abs = path.join(OBJECTS_DIR, rel)
  fs.mkdirSync(OBJECTS_DIR, { recursive: true })
  fs.writeFileSync(abs, JSON.stringify(doc, null, 2) + '\n', 'utf8')
  return rel
}

function insertDocument(
  db: Db,
  doc: Required<Pick<PatentDoc, 'id' | 'publicationNumber' | 'title'>> & PatentDoc,
  contentHash: string,
  objectPath: string,
): void {
  const now = new Date().toISOString()
  db.prepare(
    `INSERT OR REPLACE INTO documents (
      id, publication_number, title, applicant, inventor, date, ipc_json,
      family_id, country, legal_status, abstract, claims, snippet,
      object_path, content_hash, indexed_at
    ) VALUES (
      @id, @publication_number, @title, @applicant, @inventor, @date, @ipc_json,
      @family_id, @country, @legal_status, @abstract, @claims, @snippet,
      @object_path, @content_hash, @indexed_at
    )`,
  ).run({
    id: doc.id,
    publication_number: doc.publicationNumber,
    title: doc.title,
    applicant: doc.applicant ?? null,
    inventor: doc.inventor ?? null,
    date: doc.date ?? null,
    ipc_json: JSON.stringify(doc.ipc ?? []),
    family_id: doc.familyId ?? null,
    country: doc.country ?? null,
    legal_status: doc.legalStatus ?? null,
    abstract: doc.abstract ?? null,
    claims: doc.claims ?? null,
    snippet: doc.snippet ?? null,
    object_path: objectPath,
    content_hash: contentHash,
    indexed_at: now,
  })

  db.prepare('DELETE FROM documents_fts WHERE id = ?').run(doc.id)
  db.prepare(
    `INSERT INTO documents_fts (id, title, abstract, claims, applicant, publication_number, ipc)
     VALUES (?, ?, ?, ?, ?, ?, ?)`,
  ).run(
    doc.id,
    doc.title,
    doc.abstract ?? '',
    doc.claims ?? '',
    doc.applicant ?? '',
    doc.publicationNumber,
    (doc.ipc ?? []).join(' '),
  )
}

function insertQuarantine(db: Db, id: string, reason: string, raw: unknown): void {
  db.prepare(
    `INSERT OR REPLACE INTO quarantine (id, reason, raw_json, created_at)
     VALUES (?, ?, ?, ?)`,
  ).run(id, reason, JSON.stringify(raw), new Date().toISOString())
}

function publishIndexVersion(db: Db, docs: number, note: string): IndexVersionRow {
  const publishedAt = new Date().toISOString()
  const rows = db
    .prepare('SELECT id, content_hash FROM documents ORDER BY id')
    .all() as { id: string; content_hash: string }[]
  const checksum = createHash('sha256')
    .update(rows.map((r) => `${r.id}:${r.content_hash}`).join('|'))
    .digest('hex')
    .slice(0, 16)
  const tag = `idx-${publishedAt.slice(0, 19).replace(/[-:T]/g, '')}-${checksum.slice(0, 8)}`
  const version: IndexVersionRow = {
    tag,
    docs,
    publishedAt,
    checksum,
    note,
    analyzer: 'fts5-trigram+like-cjk',
    embedding: 'none',
  }
  db.prepare(
    `INSERT OR REPLACE INTO index_versions
      (tag, docs, published_at, checksum, note, analyzer, embedding)
     VALUES (@tag, @docs, @publishedAt, @checksum, @note, @analyzer, @embedding)`,
  ).run(version)
  db.prepare(
    `INSERT OR REPLACE INTO index_aliases (alias, tag) VALUES (?, ?)`,
  ).run(ALIAS_CURRENT, tag)
  return version
}

/** Full rebuild ingest from data/samples → objects + metadata + FTS + indexVersion. */
export function ingestSamples(db: Db, samplesDir = SAMPLES_DIR): IngestStats {
  const files = listSampleFiles(samplesDir)
  if (files.length === 0) {
    throw new Error(`No sample JSON under ${samplesDir}; run npm run generate-samples first`)
  }

  const tx = db.transaction(() => {
    clearHotIndex(db)
    clearQuarantine(db)

    let indexed = 0
    let quarantined = 0

    for (const file of files) {
      const raw = JSON.parse(fs.readFileSync(file, 'utf8')) as unknown
      const result = normalizePatent(raw)
      if (!result.ok) {
        insertQuarantine(db, result.id, result.reason, result.raw)
        quarantined += 1
        // Still write quarantine raw to objects for audit (not in FTS)
        const qPath = path.join(OBJECTS_DIR, `quarantine-${result.id}.json`)
        fs.writeFileSync(
          qPath,
          JSON.stringify({ reason: result.reason, raw: result.raw }, null, 2) + '\n',
        )
        continue
      }
      const objectPath = writeObject(result.doc)
      insertDocument(db, result.doc, result.contentHash, objectPath)
      indexed += 1
    }

    const indexVersion = publishIndexVersion(
      db,
      indexed,
      'MVP rebuild from data/samples; quarantine excluded from hot FTS',
    )
    return {
      scanned: files.length,
      indexed,
      quarantined,
      indexVersion,
    } satisfies IngestStats
  })

  return tx()
}

export function listIndexVersions(db: Db): IndexVersionRow[] {
  return db
    .prepare(
      `SELECT tag, docs, published_at as publishedAt, checksum, note, analyzer, embedding
       FROM index_versions ORDER BY published_at DESC`,
    )
    .all() as IndexVersionRow[]
}

export function getCurrentAlias(db: Db): { alias: string; tag: string } {
  const row = db.prepare('SELECT alias, tag FROM index_aliases WHERE alias = ?').get(ALIAS_CURRENT) as
    | { alias: string; tag: string }
    | undefined
  return row ?? { alias: ALIAS_CURRENT, tag: '' }
}

/** Point search_current at an existing version tag (rollback drill). */
export function setAlias(db: Db, tag: string): { alias: string; tag: string } {
  const exists = db.prepare('SELECT tag FROM index_versions WHERE tag = ?').get(tag) as
    | { tag: string }
    | undefined
  if (!exists) throw new Error(`Unknown index version tag: ${tag}`)
  db.prepare('INSERT OR REPLACE INTO index_aliases (alias, tag) VALUES (?, ?)').run(
    ALIAS_CURRENT,
    tag,
  )
  return { alias: ALIAS_CURRENT, tag }
}

export function listQuarantine(db: Db): {
  id: string
  reason: string
  createdAt: string
  raw: unknown
}[] {
  const rows = db
    .prepare(
      `SELECT id, reason, raw_json as rawJson, created_at as createdAt FROM quarantine ORDER BY created_at`,
    )
    .all() as { id: string; reason: string; rawJson: string; createdAt: string }[]
  return rows.map((r) => ({
    id: r.id,
    reason: r.reason,
    createdAt: r.createdAt,
    raw: JSON.parse(r.rawJson) as unknown,
  }))
}

export function hotDocCount(db: Db): number {
  const row = db.prepare('SELECT COUNT(*) as c FROM documents').get() as { c: number }
  return row.c
}
