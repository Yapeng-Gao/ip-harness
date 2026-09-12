import type { CaseInvoice, PatentCase } from '../types'

/**
 * Blocking invoice gate for agency submit/file.
 * Blocks when any invoice is 逾期, or (when overdueStopEnabled) any 已开票 past due date.
 */
export function hasBlockingInvoice(
  caseData: PatentCase | undefined | null,
  opts?: { overdueStopEnabled?: boolean; today?: string },
): { blocked: boolean; reason?: string; invoices: CaseInvoice[] } {
  if (!caseData) return { blocked: false, invoices: [] }
  const overdueStop = opts?.overdueStopEnabled !== false
  const today = opts?.today ?? new Date().toISOString().slice(0, 10)
  const invoices = caseData.engagement?.invoices ?? []
  const blocking = invoices.filter((inv) => {
    if (inv.status === '逾期') return true
    if (
      overdueStop &&
      inv.status === '已开票' &&
      inv.due &&
      inv.due < today
    ) {
      return true
    }
    return false
  })
  if (blocking.length === 0) return { blocked: false, invoices: [] }
  return {
    blocked: true,
    reason: '存在逾期发票，请先结清',
    invoices: blocking,
  }
}
