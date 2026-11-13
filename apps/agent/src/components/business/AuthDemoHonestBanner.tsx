/**
 * 登录 / 宣传站诚实示意条 · 样机会话，非真鉴权/真账号体系
 * 语感对齐 OfficialDemoHonestBanner（紧凑琥珀条，不抢主 CTA）
 */
type Props = {
  className?: string
  /** login | welcome */
  surface?: 'login' | 'welcome'
}

export function AuthDemoHonestBanner({
  className = '',
  surface = 'login',
}: Props) {
  const detail =
    surface === 'welcome'
      ? '本站是登录前宣传与货架示意；点「进入」只写入本地样机会话，不对接真实账号、SSO 或支付。'
      : '选角色后写入本地样机会话（浏览器存储）。非真登录、非真鉴权、无 token 下发；真账号体系后置。'

  return (
    <aside
      className={`rounded-lg border border-amber-200/80 bg-amber-50/80 px-2.5 py-1.5 ${className}`}
      data-testid="auth-demo-honest-banner"
      data-auth-demo="1"
      data-surface={surface}
      data-compact="1"
      role="note"
      aria-label="样机会话说明"
    >
      <div className="flex flex-wrap items-center gap-1.5">
        <span
          className="rounded-full bg-amber-200/80 px-2 py-px text-[10px] font-semibold text-amber-950"
          data-testid="auth-demo-honest-badge"
        >
          样机会话
        </span>
        <span
          className="text-[10px] font-medium text-amber-900/80"
          data-testid="auth-demo-honest-label"
        >
          非真登录 · 非真鉴权
        </span>
      </div>
      <details className="mt-1" data-testid="auth-demo-honest-more">
        <summary className="cursor-pointer select-none text-[10px] text-amber-900/60 hover:text-amber-950">
          为何是示意
        </summary>
        <p
          className="mt-1 text-[11px] leading-relaxed text-amber-950/80"
          data-testid="auth-demo-honest-footer"
        >
          {detail}
        </p>
      </details>
    </aside>
  )
}
