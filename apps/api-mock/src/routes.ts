import type { IncomingMessage, ServerResponse } from 'node:http'
import type { CommandMeta, DomainCommand } from '@ip/contracts'
import {
  dispatchCommand,
  getCase,
  listCases,
  listInbox,
} from './store.js'

const CORS_ORIGIN_RE =
  /^https?:\/\/(localhost|127\.0\.0\.1):(5173|5174|5175|5176|5177|5180)$/

export function setCors(req: IncomingMessage, res: ServerResponse): void {
  const origin = req.headers.origin
  if (origin && CORS_ORIGIN_RE.test(origin)) {
    res.setHeader('Access-Control-Allow-Origin', origin)
    res.setHeader('Vary', 'Origin')
  } else {
    // Dev-friendly: allow any localhost origin for sibling Vite apps
    res.setHeader('Access-Control-Allow-Origin', '*')
  }
  res.setHeader('Access-Control-Allow-Methods', 'GET,POST,OPTIONS')
  res.setHeader(
    'Access-Control-Allow-Headers',
    'content-type, authorization, x-requested-with',
  )
}

export function sendJson(
  res: ServerResponse,
  status: number,
  body: unknown,
): void {
  const payload = JSON.stringify(body)
  res.statusCode = status
  res.setHeader('Content-Type', 'application/json; charset=utf-8')
  res.end(payload)
}

export async function readJsonBody(req: IncomingMessage): Promise<unknown> {
  const chunks: Buffer[] = []
  for await (const chunk of req) {
    chunks.push(typeof chunk === 'string' ? Buffer.from(chunk) : chunk)
  }
  const raw = Buffer.concat(chunks).toString('utf8').trim()
  if (!raw) return undefined
  return JSON.parse(raw) as unknown
}

function matchCasesId(pathname: string): string | undefined {
  const m = /^\/v1\/cases\/([^/]+)$/.exec(pathname)
  return m ? decodeURIComponent(m[1]) : undefined
}

/**
 * Route table for api-mock (同仓样机 · 非真后端).
 * Returns true if handled.
 */
export async function handleRequest(
  req: IncomingMessage,
  res: ServerResponse,
  url: URL,
): Promise<boolean> {
  const method = req.method ?? 'GET'
  const { pathname } = url

  if (method === 'OPTIONS') {
    res.statusCode = 204
    res.end()
    return true
  }

  if (method === 'GET' && pathname === '/health') {
    sendJson(res, 200, { ok: true, mock: true, service: 'api-mock' })
    return true
  }

  if (method === 'GET' && pathname === '/v1/cases') {
    sendJson(res, 200, listCases())
    return true
  }

  const caseId = matchCasesId(pathname)
  if (method === 'GET' && caseId) {
    const c = getCase(caseId)
    if (!c) {
      sendJson(res, 404, { ok: false, message: `案件不存在: ${caseId}` })
      return true
    }
    sendJson(res, 200, c)
    return true
  }

  if (method === 'GET' && pathname === '/v1/inbox') {
    const persona = url.searchParams.get('persona') ?? undefined
    const items = listInbox(persona).map((item) => ({
      id: item.id,
      caseId: item.caseId,
      title: item.title,
      kind: item.kind,
      due: item.due,
      risk: item.risk,
    }))
    sendJson(res, 200, items)
    return true
  }

  if (method === 'POST' && pathname === '/v1/commands/dispatch') {
    let body: unknown
    try {
      body = await readJsonBody(req)
    } catch {
      sendJson(res, 400, { ok: false, message: 'Invalid JSON body' })
      return true
    }
    const obj = (body ?? {}) as {
      command?: DomainCommand | { type: string; caseId?: string }
      meta?: CommandMeta
    }
    if (!obj.command || typeof obj.command !== 'object') {
      sendJson(res, 400, {
        ok: false,
        message: 'body.command required',
      })
      return true
    }
    const result = dispatchCommand(
      obj.command as DomainCommand & { type: string; caseId?: string },
      obj.meta,
    )
    sendJson(res, 200, result)
    return true
  }

  return false
}
