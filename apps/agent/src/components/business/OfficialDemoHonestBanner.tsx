/**
 * 官报/查新/递交诚实示意徽章 · 中栏置顶（样机）
 * 精致度：默认一行徽章；脚注渐进展开，降使用成本。
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
      className={`rounded-lg border border-amber-200/80 bg-amber-50/80 px-2.5 py-1.5 ${className}`}
      data-testid="official-demo-honest-banner"
      data-kind={kind}
      data-compact="1"
      role="note"
      aria-label="示意说明"
    >
      <div className="flex flex-wrap items-center gap-1.5">
        <span
          className="rounded-full bg-amber-200/80 px-2 py-px text-[10px] font-semibold text-amber-950"
          data-testid="official-demo-honest-badge"
        >
          {OFFICIAL_DEMO_BADGE[kind]}
        </span>
        <span
          className="text-[10px] font-medium text-amber-900/75"
          data-testid="official-demo-honest-label"
        >
          {OFFICIAL_DEMO_HONEST}
        </span>
      </div>
      {(ctaGuard || kind === 'file') && (
        <p
          className="mt-1 text-[10px] font-medium text-rose-800/85"
          data-testid="official-demo-cta-guard"
          title={OFFICIAL_DEMO_SAFE_CTA.noLiveSubmit}
        >
          {OFFICIAL_DEMO_SAFE_CTA.noLiveSubmit}
        </p>
      )}
      <details className="mt-1" data-testid="official-demo-honest-more">
        <summary className="cursor-pointer select-none text-[10px] text-amber-900/60 hover:text-amber-950">
          为何是示意
        </summary>
        <p
          className="mt-1 text-[11px] leading-relaxed text-amber-950/80"
          data-testid="official-demo-honest-footer"
        >
          {OFFICIAL_DEMO_FOOTER[kind]}
        </p>
      </details>
    </aside>
  )
}
