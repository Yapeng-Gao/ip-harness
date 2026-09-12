import { AlertTriangle, ShieldAlert } from 'lucide-react'
import { useMemo } from 'react'
import { useApp } from '@shared/context/AppContext'
import {
  BILLING_HOLD_COPY,
  summarizeBillingHold,
} from '@shared/utils/billingHoldBanner'
import { midBillingHref, midCaseHref } from '../lib/deepLinks'

/**
 * Agent 本地 BillingHoldBanner：文案/层级与共用组件对齐，
 * 案链与费用中心一律 mid 绝对深链（勿用相对 /billing、/cases）。
 */
export function AgentBillingHoldBanner({
  className = '',
  compact,
}: {
  className?: string
  /** Agent Shell 顶栏下等窄空间 */
  compact?: boolean
}) {
  const {
    visibleCases,
    role,
    persona,
    overdueStopEnabled,
  } = useApp()

  const summary = useMemo(
    () =>
      summarizeBillingHold({
        cases: visibleCases,
        role,
        persona,
        overdueStopEnabled,
      }),
    [visibleCases, role, persona, overdueStopEnabled],
  )

  if (!summary.visible) return null

  const hard = summary.variant === 'agency_hard'
  const copy = hard ? BILLING_HOLD_COPY.agency : BILLING_HOLD_COPY.enterprise
  const billingLabel = hard
    ? BILLING_HOLD_COPY.billingLabelAgency
    : BILLING_HOLD_COPY.billingLabelEnterprise

  const shell = hard
    ? 'border-rose-200 bg-rose-50 text-rose-900'
    : 'border-amber-200 bg-amber-50 text-amber-950'
  const linkCls = hard
    ? 'font-medium text-rose-950 underline'
    : 'font-medium text-amber-950 underline'

  const caseLinks = summary.cases.slice(0, 6).map((c, i) => (
    <span key={c.caseId}>
      {i > 0 && <span className="text-current/40"> · </span>}
      <a
        href={midCaseHref(c.caseId)}
        className={linkCls}
        title={`${c.caseNo} · ${c.invoices.length} 张欠票`}
      >
        {c.title.length > 16 ? `${c.title.slice(0, 16)}…` : c.title}
      </a>
    </span>
  ))

  return (
    <div
      className={`rounded-xl border px-3 py-2.5 text-xs ${shell} ${className}`}
      role={hard ? 'alert' : 'status'}
      aria-label={copy.headline}
      data-billing-hold-banner={summary.variant}
    >
      <div className="flex flex-wrap items-start gap-2">
        {hard ? (
          <ShieldAlert className="mt-0.5 h-3.5 w-3.5 shrink-0 text-rose-700" aria-hidden />
        ) : (
          <AlertTriangle className="mt-0.5 h-3.5 w-3.5 shrink-0 text-amber-700" aria-hidden />
        )}
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-x-2 gap-y-0.5">
            <span className="font-semibold">{copy.headline}</span>
            <span className="tabular-nums opacity-80">
              {summary.cases.length} 案 · {summary.invoiceCount} 张欠票
            </span>
            {!compact && (
              <span className="opacity-90">{copy.body}</span>
            )}
          </div>
          {compact && (
            <p className="mt-0.5 opacity-90">{copy.body}</p>
          )}
          <div className="mt-1.5 flex flex-wrap items-center gap-x-2 gap-y-1">
            <span className="opacity-70">涉案：</span>
            {caseLinks}
            {summary.cases.length > 6 && (
              <span className="opacity-60">等 {summary.cases.length} 案</span>
            )}
            <a
              href={midBillingHref(BILLING_HOLD_COPY.billingHref)}
              className={`ml-auto shrink-0 ${linkCls}`}
            >
              {billingLabel} →
            </a>
          </div>
        </div>
      </div>
    </div>
  )
}
