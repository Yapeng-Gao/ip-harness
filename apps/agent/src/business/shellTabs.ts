/**
 * 顶栏三档着陆 · 对齐 product-pages / vision §3.1d
 * 助手=/agent；项目=三态；专业=须带案（同三态先落到有案再进编制面）
 */

export type ShellTabId = 'assistant' | 'project' | 'professional'

export function projectLandingHref(opts: {
  activeCaseId?: string
  latestCaseId?: string
  hasCases: boolean
}): string {
  if (opts.activeCaseId) return `/agent/cases/${opts.activeCaseId}`
  if (opts.latestCaseId) return `/agent/cases/${opts.latestCaseId}`
  if (opts.hasCases) return '/agent/cases'
  return '/agent/cases/new'
}

export function professionalLandingHref(opts: {
  activeCaseId?: string
  latestCaseId?: string
  hasCases: boolean
}): string {
  const caseId = opts.activeCaseId || opts.latestCaseId
  if (caseId) return `/agent/cases/${caseId}/professional`
  if (opts.hasCases) return '/agent/cases'
  return '/agent/cases/new'
}

export function resolveShellTab(pathname: string): ShellTabId | null {
  if (pathname === '/agent' || pathname === '/agent/') return 'assistant'
  if (/\/agent\/cases\/[^/]+\/professional/.test(pathname)) return 'professional'
  if (
    pathname.startsWith('/agent/cases') ||
    pathname.startsWith('/agent/pending')
  ) {
    return 'project'
  }
  return null
}
