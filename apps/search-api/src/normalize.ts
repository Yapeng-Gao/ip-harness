import { createHash } from 'node:crypto'
import type { PatentDoc } from './types.js'

export type NormalizeResult =
  | { ok: true; doc: Required<Pick<PatentDoc, 'id' | 'publicationNumber' | 'title'>> & PatentDoc; contentHash: string }
  | { ok: false; id: string; reason: string; raw: PatentDoc }

function trimStr(v: unknown): string | undefined {
  if (typeof v !== 'string') return undefined
  const t = v.trim()
  return t.length ? t : undefined
}

/** Normalize raw sample → patent doc; quarantine if missing title AND publicationNumber. */
export function normalizePatent(raw: unknown): NormalizeResult {
  const obj = (raw && typeof raw === 'object' ? raw : {}) as Record<string, unknown>
  const id = trimStr(obj.id) ?? `unknown-${createHash('sha1').update(JSON.stringify(raw)).digest('hex').slice(0, 10)}`
  const title = trimStr(obj.title)
  const publicationNumber = trimStr(obj.publicationNumber)

  if (!title && !publicationNumber) {
    return {
      ok: false,
      id,
      reason: 'missing_required: no title AND no publicationNumber',
      raw: { ...(obj as PatentDoc), id },
    }
  }

  const ipcRaw = obj.ipc
  let ipc: string[] | undefined
  if (Array.isArray(ipcRaw)) {
    ipc = ipcRaw.map((x) => String(x).trim()).filter(Boolean)
  } else if (typeof ipcRaw === 'string' && ipcRaw.trim()) {
    ipc = ipcRaw.split(/[,;|]/).map((s) => s.trim()).filter(Boolean)
  }

  const doc: PatentDoc = {
    id,
    publicationNumber: publicationNumber ?? `UNKNOWN-${id}`,
    title: title ?? `(untitled) ${publicationNumber}`,
    applicant: trimStr(obj.applicant),
    inventor: trimStr(obj.inventor),
    date: trimStr(obj.date),
    ipc,
    familyId: trimStr(obj.familyId),
    country: trimStr(obj.country),
    legalStatus: trimStr(obj.legalStatus),
    abstract: trimStr(obj.abstract),
    claims: trimStr(obj.claims),
    snippet: trimStr(obj.snippet),
  }

  const contentHash = createHash('sha256')
    .update(JSON.stringify({
      id: doc.id,
      publicationNumber: doc.publicationNumber,
      title: doc.title,
      abstract: doc.abstract,
      claims: doc.claims,
    }))
    .digest('hex')

  return {
    ok: true,
    doc: doc as Required<Pick<PatentDoc, 'id' | 'publicationNumber' | 'title'>> & PatentDoc,
    contentHash,
  }
}
