import { APP_DEV_URLS } from '@ip/contracts'
import type { CommandMeta, DomainCommand, CommandResult } from '@ip/contracts'
import type { CaseSummary, HealthResponse, InboxItem } from './types.js'

export interface ApiClient {
  baseUrl: string
  health(): Promise<HealthResponse>
  listCases(): Promise<CaseSummary[]>
  getCase(caseId: string): Promise<CaseSummary>
  getInbox(persona?: string): Promise<InboxItem[]>
  dispatchCommand(cmd: DomainCommand, meta?: CommandMeta): Promise<CommandResult>
}

async function parseJson<T>(res: Response): Promise<T> {
  if (!res.ok) {
    const text = await res.text().catch(() => '')
    throw new Error(`API ${res.status}: ${text || res.statusText}`)
  }
  return res.json() as Promise<T>
}

/**
 * Thin fetch client for the in-repo api-mock (not a real backend).
 * Default baseUrl = APP_DEV_URLS.api (localhost:5180).
 */
export function createApiClient(baseUrl?: string): ApiClient {
  const root = (baseUrl ?? APP_DEV_URLS.api).replace(/\/$/, '')

  return {
    baseUrl: root,

    async health() {
      const res = await fetch(`${root}/health`)
      return parseJson<HealthResponse>(res)
    },

    async listCases() {
      const res = await fetch(`${root}/v1/cases`)
      return parseJson<CaseSummary[]>(res)
    },

    async getCase(caseId: string) {
      const res = await fetch(`${root}/v1/cases/${encodeURIComponent(caseId)}`)
      return parseJson<CaseSummary>(res)
    },

    async getInbox(persona?: string) {
      const q = persona ? `?persona=${encodeURIComponent(persona)}` : ''
      const res = await fetch(`${root}/v1/inbox${q}`)
      return parseJson<InboxItem[]>(res)
    },

    async dispatchCommand(cmd: DomainCommand, meta?: CommandMeta) {
      const res = await fetch(`${root}/v1/commands/dispatch`, {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ command: cmd, meta }),
      })
      return parseJson<CommandResult>(res)
    },
  }
}
