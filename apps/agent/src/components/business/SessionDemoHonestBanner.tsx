/**
 * 会话史 / 讨论组诚实示意条 · 样机会话与互喊，非真 IM / 非真多端同步
 * 语感对齐 Official/Auth/Billing/Deadline DemoHonestBanner
 */
type Props = {
  className?: string
  /** sessions | room */
  surface?: 'sessions' | 'room'
  ctaGuard?: boolean
}

export function SessionDemoHonestBanner({
  className = '',
  surface = 'sessions',
  ctaGuard = true,
}: Props) {
  const badge = surface === 'room' ? '讨论示意' : '会话示意'
  const label =
    surface === 'room'
      ? '本地互喊示意 · 非即时通讯'
      : '本地样机史 · 非多端同步'
  const guard =
    surface === 'room'
      ? '互喊 / 组队仅样机 · 勿当成全员已对齐、无真实邀请通道'
      : '邀请同事 / 多端同步仅后置壳 · 无即时通讯通道、无外部钩子'
  const footer =
    surface === 'room'
      ? '组队讨论复用本案示意气泡；交卷与硬请示仍在部工作台。即时通讯与真实拉人仍后置。'
      : '列表为本地样机会话与项目线程聚合。账号多端同步与外部讨论组仍后置。'

  return (
    <aside
      className={`rounded-lg border border-amber-200/80 bg-amber-50/80 px-2.5 py-1.5 ${className}`}
      data-testid="session-demo-honest-banner"
      data-session-demo="1"
      data-surface={surface}
      data-compact="1"
      role="note"
      aria-label="会话示意说明"
    >
      <div className="flex flex-wrap items-center gap-1.5">
        <span
          className="rounded-full bg-amber-200/80 px-2 py-px text-[10px] font-semibold text-amber-950"
          data-testid="session-demo-honest-badge"
        >
          {badge}
        </span>
        <span
          className="text-[10px] font-medium text-amber-900/80"
          data-testid="session-demo-honest-label"
        >
          {label}
        </span>
      </div>
      {ctaGuard ? (
        <p
          className="mt-1 text-[10px] font-medium text-rose-800/85"
          data-testid="session-demo-cta-guard"
        >
          {guard}
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
          {footer}
        </p>
      </details>
    </aside>
  )
}
