/**
 * 官报/查新/递交诚实示意徽章 · 中栏置顶（样机）
 */
import {
  OFFICIAL_DEMO_BADGE,
  OFFICIAL_DEMO_FOOTER,
  OFFICIAL_DEMO_HONEST,
  OFFICIAL_DEMO_SAFE_CTA,
  type OfficialDemoKind,
} from '../../business/officialDemoHonest'

type Props = {
  kind: OfficialDemoKind
  className?: string
  /** 额外一行（如禁真递交 CTA 提示） */
  ctaGuard?: boolean
}

export function OfficialDemoHonestBanner({
  kind,
  className = '',
  ctaGuard = false,
}: Props) {
  return (
    <aside
      className={`rounded-xl border border-amber-200/90 bg-amber-50/90 px-3 py-2 shadow-sm ${className}`}
      data-testid="official-demo-honest-banner"
      data-kind={kind}
      role="note"
      aria-label="示意说明"
    >
      <div className="flex flex-wrap items-center gap-2">
        <span
          className="rounded-full bg-amber-200/80 px-2 py-0.5 text-[10px] font-semibold text-amber-950"
          data-testid="official-demo-honest-badge"
        >
          {OFFICIAL_DEMO_BADGE[kind]}
        </span>
        <span
          className="text-[10px] font-medium text-amber-900/80"
          data-testid="official-demo-honest-label"
        >
          {OFFICIAL_DEMO_HONEST}
        </span>
      </div>
      <p
        className="mt-1.5 text-[11px] leading-relaxed text-amber-950/85"
        data-testid="official-demo-honest-footer"
      >
        {OFFICIAL_DEMO_FOOTER[kind]}
      </p>
      {ctaGuard || kind === 'file' ? (
        <p
          className="mt-1 text-[10px] font-medium text-rose-800/90"
          data-testid="official-demo-cta-guard"
          title={OFFICIAL_DEMO_SAFE_CTA.noLiveSubmit}
        >
          {OFFICIAL_DEMO_SAFE_CTA.noLiveSubmit}
        </p>
      ) : null}
    </aside>
  )
}
