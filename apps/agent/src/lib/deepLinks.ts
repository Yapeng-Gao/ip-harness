/**
 * Wave2 InboxDeepLink helpers（agent 面）。
 * 多 app 下相对路径会停在错误端口：本面用 path，跨 mid/workbench/iam 用绝对 URL。
 */
import { APP_DEV_URLS, type HitlGateId } from '@ip/contracts'

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

/**
 * Join APP_DEV_URLS base with path/query/hash.
 * Already-absolute http(s) URLs are returned unchanged.
 */
function absDevUrl(base: string, path: string): string {
  if (/^https?:\/\//i.test(path)) return path
  const normalized = path.startsWith('/') ? path : `/${path}`
  return `${base}${normalized}`
}

/**
 * 跨面绝对 URL → mid:5173（案件库 / 案详 / 费用 / Inbox 等）。
 * 必须用 `<a href>` 或 window.location，不要用 react-router Link。
 */
export function midHref(path = '/'): string {
  return absDevUrl(APP_DEV_URLS.mid, path)
}

/**
 * 跨面绝对 URL → workbench:5174（作业台 / inventor 门户等）。
 * 必须用 `<a href>` 或 window.location，不要用 react-router Link。
 */
export function workbenchHref(path = '/workbench'): string {
  return absDevUrl(APP_DEV_URLS.workbench, path)
}

/**
 * 跨面绝对 URL → iam:5177（登录 / 工作区重选）。
 * 必须用 `<a href>` 或 window.location，不要用 react-router Link。
 */
export function iamHref(path = '/'): string {
  return absDevUrl(APP_DEV_URLS.iam, path)
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

export function isAbsoluteHttpUrl(url: string): boolean {
  return /^https?:\/\//i.test(url)
}

/**
 * Resolve a path: agent 本面保持相对；已知跨口前缀 → APP_DEV_URLS 绝对链。
 */
export function resolveActionHref(path: string): string {
  if (isAbsoluteHttpUrl(path)) return path
  if (path.startsWith('/agent')) return path
  if (path.startsWith('/workbench') || path.startsWith('/inventor')) {
    return workbenchHref(path)
  }
  if (path.startsWith('/login')) return iamHref(path)
  if (
    path.startsWith('/cases') ||
    path.startsWith('/docket') ||
    path.startsWith('/billing') ||
    path.startsWith('/pipeline') ||
    path.startsWith('/insight') ||
    path === '/' ||
    path.startsWith('/?')
  ) {
    return midHref(path)
  }
  return path
}
