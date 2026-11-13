/**
 * 期限台诚实示意条 · 样机期限/催办，非真日历同步、非官报绝限
 * 语感对齐 Official/Auth/Billing DemoHonestBanner
 */
type Props = {
  className?: string
  ctaGuard?: boolean
}

export function DeadlineDemoHonestBanner({
  className = '',
  ctaGuard = true,
}: Props) {
  return (
    <aside
      className={`rounded-lg border border-amber-200/80 bg-amber-50/80 px-2.5 py-1.5 ${className}`}
      data-testid="deadline-demo-honest-banner"
      data-docket-demo="1"
      data-compact="1"
      role="note"
      aria-label="期限示意说明"
    >
      <div className="flex flex-wrap items-center gap-1.5">
        <span
          className="rounded-full bg-amber-200/80 px-2 py-px text-[10px] font-semibold text-amber-950"
          data-testid="deadline-demo-honest-badge"
        >
          期限示意
        </span>
        <span
          className="text-[10px] font-medium text-amber-900/80"
          data-testid="deadline-demo-honest-label"
        >
          非官报绝限 · 非真日历同步
        </span>
      </div>
      {ctaGuard ? (
        <p
          className="mt-1 text-[10px] font-medium text-rose-800/85"
          data-testid="deadline-demo-cta-guard"
        >
          无 Google / Outlook 同步 · 不可当官方法定绝限日操作
        </p>
      ) : null}
      <details className="mt-1" data-testid="deadline-demo-honest-more">
        <summary className="cursor-pointer select-none text-[10px] text-amber-900/60 hover:text-amber-950">
          为何是示意
        </summary>
        <p
          className="mt-1 text-[11px] leading-relaxed text-amber-950/80"
          data-testid="deadline-demo-honest-footer"
        >
          列表由本案进度派生的示意行，用于「逾期须可见」。真局端期限与日历通道后置；点行进关联部工作台办主链。
        </p>
      </details>
    </aside>
  )
}
