/**
 * 账单/报价诚实示意条 · 样机费用说明，非真报价/付款通道
 * 语感对齐 OfficialDemoHonestBanner / AuthDemoHonestBanner
 */
type Props = {
  className?: string
  /** 强调禁真结账 */
  ctaGuard?: boolean
}

export function BillingDemoHonestBanner({
  className = '',
  ctaGuard = true,
}: Props) {
  return (
    <aside
      className={`rounded-lg border border-amber-200/80 bg-amber-50/80 px-2.5 py-1.5 ${className}`}
      data-testid="billing-demo-honest-banner"
      data-billing-demo="1"
      data-compact="1"
      role="note"
      aria-label="账单示意说明"
    >
      <div className="flex flex-wrap items-center gap-1.5">
        <span
          className="rounded-full bg-amber-200/80 px-2 py-px text-[10px] font-semibold text-amber-950"
          data-testid="billing-demo-honest-badge"
        >
          费用示意
        </span>
        <span
          className="text-[10px] font-medium text-amber-900/80"
          data-testid="billing-demo-honest-label"
        >
          非真报价 · 非真付款
        </span>
      </div>
      {ctaGuard ? (
        <p
          className="mt-1 text-[10px] font-medium text-rose-800/85"
          data-testid="billing-demo-cta-guard"
        >
          确认报价 / 登记付款仅后置壳 · 不可结账、无支付跳转
        </p>
      ) : null}
      <details className="mt-1" data-testid="billing-demo-honest-more">
        <summary className="cursor-pointer select-none text-[10px] text-amber-900/60 hover:text-amber-950">
          为何是示意
        </summary>
        <p
          className="mt-1 text-[11px] leading-relaxed text-amber-950/80"
          data-testid="billing-demo-honest-footer"
        >
          官费与服务费分口袋列示，本页不编造应付金额，也不对接支付/发票通道。商务报价与付款后置接入。
        </p>
      </details>
    </aside>
  )
}
