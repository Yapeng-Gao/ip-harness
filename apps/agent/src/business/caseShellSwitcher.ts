/**
 * 案级顶栏真切换器 · 一期公司/部台案级壳（非 lifecycle 跨案三档）
 * 最近 / 全部 / 开新 —— 仅案级壳；跨案面禁「当前项目」假锁。
 */

/** 把当前案路径改写到另一案（保留 depts/professional/后勤后缀） */
export function rewriteCasePath(pathname: string, nextCaseId: string): string {
  const m = pathname.match(/^\/agent\/cases\/[^/]+(.*)$/)
  if (!m) return `/agent/cases/${nextCaseId}`
  const rest = m[1] ?? ''
  // 开新页等无后缀
  if (rest === '/new' || rest.startsWith('/new/')) {
    return `/agent/cases/${nextCaseId}`
  }
  return `/agent/cases/${nextCaseId}${rest}`
}

export type RankedCase = { id: string; title: string; score: string }

/** 按 progress/log 新近排序；active 可置顶标「本案」由 UI 处理 */
export function rankCasesForSwitcher(
  cases: readonly { id: string; title: string }[],
  getUpdatedAt: (id: string) => string | undefined,
  getLatestLogAt?: (id: string) => string | undefined,
  limit = 6,
): RankedCase[] {
  const ranked = cases
    .map((c) => {
      const u = getUpdatedAt(c.id) ?? ''
      const l = getLatestLogAt?.(c.id) ?? ''
      const score = u >= l ? u : l
      return { id: c.id, title: c.title, score }
    })
    .sort((a, b) => b.score.localeCompare(a.score))
  return ranked.slice(0, limit)
}

/** 案级壳：有 :caseId 且不是 new */
export function isCaseLevelShellPath(pathname: string): boolean {
  const m = pathname.match(/^\/agent\/cases\/([^/]+)/)
  if (!m) return false
  return m[1] !== 'new'
}
