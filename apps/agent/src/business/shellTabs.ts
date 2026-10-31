/**
 * 顶栏旧三档着陆（lifecycle vision §3.1d / product-pages）
 * **非一期真源**：一期进门＝大厅接待+八部 → 公司 → 部台
 * （一期节点 + 一期-产品逻辑 + 一期-产品理念）。Leslie 不认 lifecycle 七部三 tab。
 * 壳顶栏已卸挂；保留着陆函数供深链/单测。
 * 助手→大厅 /agent；项目→公司案三态；专业→编制（须带案）
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
