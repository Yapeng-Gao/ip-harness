import type { CaseInvoice, PatentCase, PersonaId, UserRole } from '../types'
import { hasBlockingInvoice } from './billing'

/** 运营横幅变体：与 HandoffActionBar 口径对称 */
export type BillingHoldBannerVariant =
  | 'agency_hard'
  | 'enterprise_soft'
  | 'minimal'
  | 'hidden'

export interface BillingHoldCaseEntry {
  caseId: string
  title: string
  caseNo: string
  invoices: CaseInvoice[]
  reason?: string
}

export interface BillingHoldBannerSummary {
  variant: BillingHoldBannerVariant
  cases: BillingHoldCaseEntry[]
  invoiceCount: number
  /** 是否应渲染横幅 */
  visible: boolean
}

/**
 * 按 visibleCases + role/persona 汇总停权/欠票案。
 * 无欠票或停权开关关闭 → visible=false。
 * inventor/committee → hidden（不渲染）；极简可由调用方改用 minimal。
 */
export function summarizeBillingHold(opts: {
  cases: PatentCase[]
  role: UserRole
  persona: PersonaId
  overdueStopEnabled: boolean
  today?: string
}): BillingHoldBannerSummary {
  const { cases, role, persona, overdueStopEnabled, today } = opts

  if (!overdueStopEnabled) {
    return { variant: 'hidden', cases: [], invoiceCount: 0, visible: false }
  }

  const holdCases: BillingHoldCaseEntry[] = []
  for (const c of cases) {
    const block = hasBlockingInvoice(c, { overdueStopEnabled, today })
    if (!block.blocked) continue
    holdCases.push({
      caseId: c.id,
      title: c.title,
      caseNo: c.caseNo,
      invoices: block.invoices,
      reason: block.reason,
    })
  }

  const invoiceCount = holdCases.reduce((n, e) => n + e.invoices.length, 0)
  if (holdCases.length === 0) {
    return { variant: 'hidden', cases: [], invoiceCount: 0, visible: false }
  }

  if (persona === 'inventor' || persona === 'committee') {
    return {
      variant: 'hidden',
      cases: holdCases,
      invoiceCount,
      visible: false,
    }
  }

  if (role === 'agency' || persona === 'agency') {
    return {
      variant: 'agency_hard',
      cases: holdCases,
      invoiceCount,
      visible: true,
    }
  }

  // enterprise_ip（及企业侧其它可审 Persona）
  return {
    variant: 'enterprise_soft',
    cases: holdCases,
    invoiceCount,
    visible: true,
  }
}

/**
 * 与 HandoffActionBar 对称口径（单源）：
 * - 代理硬闸：停权 / 提交·递交禁用；企业侧仅提示不停审
 * - 企业软提示：不停审，代理已停权
 */
export const BILLING_HOLD_COPY = {
  agency: {
    /** 运营横幅 headline */
    headline: '递交已停权',
    /** ActionBar 案级 headline */
    caseHeadline: '代理已停权',
    body: '存在逾期发票，请先结清（企业侧仅提示、不停审）',
  },
  enterprise: {
    headline: '仅提示·不停审',
    /** 兼容旧 ActionBar「仅提示（企业不停审）」 */
    caseHeadline: '仅提示·不停审',
    body: '存在逾期/超期未付发票；代理侧提交/递交已停权，企业仍可审核、退回与批准策略。',
    caseBody:
      '本案存在逾期/超期未付发票；代理侧提交/递交已停权，企业仍可审核、退回与批准策略。',
  },
  billingHref: '/billing/cases?tab=ledger&status=逾期',
  billingLabelAgency: '前往费用中心',
  billingLabelEnterprise: '查看台账',
} as const
