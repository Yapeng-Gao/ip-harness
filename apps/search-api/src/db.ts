import fs from 'node:fs'
import Database from 'better-sqlite3'
import { DATA_DIR, DB_PATH, OBJECTS_DIR } from './paths.js'
import { ALIAS_CURRENT } from './types.js'

export type Db = Database.Database

export function ensureDataDirs(): void {
  fs.mkdirSync(DATA_DIR, { recursive: true })
  fs.mkdirSync(OBJECTS_DIR, { recursive: true })
}

export function openDb(dbPath = DB_PATH): Db {
  ensureDataDirs()
  const db = new Database(dbPath)
  db.pragma('journal_mode = WAL')
  db.pragma('foreign_keys = ON')
  migrate(db)
  return db
}

export function migrate(db: Db): void {
  db.exec(`
    CREATE TABLE IF NOT EXISTS documents (
      id TEXT PRIMARY KEY,
      publication_number TEXT NOT NULL,
      title TEXT NOT NULL,
      applicant TEXT,
      inventor TEXT,
      date TEXT,
      ipc_json TEXT,
      family_id TEXT,
      country TEXT,
      legal_status TEXT,
      abstract TEXT,
      claims TEXT,
      snippet TEXT,
      object_path TEXT NOT NULL,
      content_hash TEXT,
      indexed_at TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS quarantine (
      id TEXT PRIMARY KEY,
      reason TEXT NOT NULL,
      raw_json TEXT NOT NULL,
      created_at TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS index_versions (
      tag TEXT PRIMARY KEY,
      docs INTEGER NOT NULL,
      published_at TEXT NOT NULL,
      checksum TEXT NOT NULL,
      note TEXT NOT NULL,
      analyzer TEXT NOT NULL,
      embedding TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS index_aliases (
      alias TEXT PRIMARY KEY,
      tag TEXT NOT NULL
    );
  `)

  // Prefer trigram for CJK substring (≥3 chars) + Latin; recreate if old unicode61 table exists.
  const fts = db
    .prepare(`SELECT sql FROM sqlite_master WHERE type='table' AND name='documents_fts'`)
    .get() as { sql: string } | undefined
  if (!fts) {
    db.exec(`
      CREATE VIRTUAL TABLE documents_fts USING fts5(
        id UNINDEXED,
        title,
        abstract,
        claims,
        applicant,
        publication_number,
        ipc,
        tokenize = 'trigram'
      );
    `)
  } else if (!/tokenize\s*=\s*'trigram'/i.test(fts.sql)) {
    db.exec(`DROP TABLE documents_fts;`)
    db.exec(`
      CREATE VIRTUAL TABLE documents_fts USING fts5(
        id UNINDEXED,
        title,
        abstract,
        claims,
        applicant,
        publication_number,
        ipc,
        tokenize = 'trigram'
      );
    `)
  }

  const alias = db.prepare('SELECT tag FROM index_aliases WHERE alias = ?').get(ALIAS_CURRENT) as
    | { tag: string }
    | undefined
  if (!alias) {
    db.prepare('INSERT INTO index_aliases (alias, tag) VALUES (?, ?)').run(ALIAS_CURRENT, '')
  }
}

export function clearHotIndex(db: Db): void {
  db.exec(`
    DELETE FROM documents_fts;
    DELETE FROM documents;
  `)
}

export function clearQuarantine(db: Db): void {
  db.exec('DELETE FROM quarantine')
}
