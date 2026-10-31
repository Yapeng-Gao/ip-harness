/**
 * 会话史诚实示意条 · 本地样机会话史，非真多端同步
 * 语感对齐 Official/Auth/Billing/Deadline DemoHonestBanner
 * §61：讨论组/组队面已卸；本条仅挂 sessions
 */
type Props = {
  className?: string
  ctaGuard?: boolean
}

export function SessionDemoHonestBanner({
  className = '',
  ctaGuard = true,
}: Props) {
  return (
    <aside
      className={`rounded-lg border border-amber-200/80 bg-amber-50/80 px-2.5 py-1.5 ${className}`}
      data-testid="session-demo-honest-banner"
      data-session-demo="1"
      data-surface="sessions"
      data-compact="1"
      role="note"
      aria-label="会话示意说明"
    >
      <div className="flex flex-wrap items-center gap-1.5">
        <span
          className="rounded-full bg-amber-200/80 px-2 py-px text-[10px] font-semibold text-amber-950"
          data-testid="session-demo-honest-badge"
        >
          会话示意
        </span>
        <span
          className="text-[10px] font-medium text-amber-900/80"
          data-testid="session-demo-honest-label"
        >
          本地样机史 · 非多端同步
        </span>
      </div>
      {ctaGuard ? (
        <p
          className="mt-1 text-[10px] font-medium text-rose-800/85"
          data-testid="session-demo-cta-guard"
        >
          多端同步仅后置壳 · 无即时通讯通道；硬请示请回部门工作台右栏
        </p>
      ) : null}
      <details className="mt-1" data-testid="session-demo-honest-more">
        <summary className="cursor-pointer select-none text-[10px] text-amber-900/60 hover:text-amber-950">
          为何是示意
        </summary>
        <p
          className="mt-1 text-[11px] leading-relaxed text-amber-950/80"
          data-testid="session-demo-honest-footer"
        >
          旁路函件史，非部台右栏硬请示。账号多端同步仍后置；组队/讨论组产品面已卸。
        </p>
      </details>
    </aside>
  )
}
