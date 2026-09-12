/**
 * Agent deep-link surface — re-export @shared，仅保留本面专用 helper。
 * 跨口绝对链与 mid/workbench/iam 同源：`resolveAppHref` / `midHref` / …
 * 本面会话 path 继续用 `agentSessionPath`（react-router）。
 */
import { type HitlGateId } from '@ip/contracts'
import {
  midHref,
  iamHref,
  appHref,
  isAbsoluteHttpUrl,
} from '@shared/lib/deepLinks'

export {
  isMultiApp,
  isAbsoluteHttpUrl,
  surfaceForPath,
  currentAppId,
  midHref,
  workbenchHref,
  agentHref,
  iamHref,
  resolveAppHref,
  appHref,
  navigateApp,
  type ResolvedAppHref,
} from '@shared/lib/deepLinks'

export type AgentSessionDeepLinkOpts = {
  focus?: 'hitl'
  gate?: HitlGateId
}

/** 本 app 内 path+query，给 react-router（Navigate / Link / navigate） */
export function agentSessionPath(
  sessionId: string,
  opts?: AgentSessionDeepLinkOpts,
): string {
  const params = new URLSearchParams()
  if (opts?.focus || opts?.gate) {
    params.set('focus', opts.focus ?? 'hitl')
  }
  if (opts?.gate) params.set('gate', opts.gate)
  const q = params.toString()
  return q
    ? `/agent/sessions/${sessionId}?${q}`
    : `/agent/sessions/${sessionId}`
}

export function iamLoginHref(): string {
  return iamHref('/login')
}

export function midCaseHref(caseId: string, qs?: string): string {
  const q = qs?.replace(/^\?/, '')
  return q ? midHref(`/cases/${caseId}?${q}`) : midHref(`/cases/${caseId}`)
}

export function midCasesHref(): string {
  return midHref('/cases')
}

export function midDocketHref(caseId?: string): string {
  return caseId ? midHref(`/docket?case=${caseId}`) : midHref('/docket')
}

/** @param query e.g. 'cases?tab=ledger' or 'cases'；也可传完整 '/billing/…' */
export function midBillingHref(query?: string): string {
  if (!query) return midHref('/billing')
  if (query.startsWith('/billing')) return midHref(query)
  const q = query.replace(/^\//, '')
  return midHref(`/billing/${q}`)
}

export type MidInboxHrefOpts = {
  sessionId?: string
  itemId?: string
}

/**
 * 回运营 Inbox 的绝对 URL（mid:5173）。
 * 必须用 `<a href>`，不要用 react-router Link。
 */
export function midInboxHref(opts?: MidInboxHrefOpts): string {
  const params = new URLSearchParams()
  if (opts?.itemId) params.set('inbox', opts.itemId)
  else if (opts?.sessionId) params.set('inbox', `ag-${opts.sessionId}`)
  const q = params.toString()
  const path = q ? `/?${q}#ops-inbox` : '/#ops-inbox'
  return midHref(path)
}

/**
 * Resolve a path: agent 本面保持相对；跨口走共享 `appHref`（multi-app → APP_DEV_URLS）。
 */
export function resolveActionHref(path: string): string {
  if (isAbsoluteHttpUrl(path)) return path
  if (path.startsWith('/agent')) return path
  return appHref(path)
}
