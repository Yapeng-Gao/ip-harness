import { Lock, Building2 } from 'lucide-react'

/**
 * OIDC / 企业 IdP 空态示意 — 明确未接入，勿假装已接通。
 */
export function OidcEmptyState() {
  return (
    <section
      aria-label="OIDC 接入空态"
      className="rounded-xl border border-dashed border-amber-300/80 bg-amber-50/60 p-4"
    >
      <div className="flex items-start gap-3">
        <div
          className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-amber-100 text-amber-800"
          aria-hidden
        >
          <Building2 className="h-4 w-4" />
        </div>
        <div className="min-w-0 flex-1">
          <h2 className="text-sm font-semibold text-amber-950">企业 IdP / OIDC</h2>
          <p className="mt-1 text-xs leading-relaxed text-amber-900/80">
            可接企业身份提供商（OIDC / SAML），当前原型<strong>未接入</strong>。下方为示意控件，点击无效。P2
            真 IAM（IdP、令牌、会话）仅占位，未排期。
          </p>
          <div className="mt-3 flex flex-wrap gap-2">
            <button
              type="button"
              disabled
              aria-disabled="true"
              title="当前未接入 OIDC"
              className="inline-flex cursor-not-allowed items-center gap-1.5 rounded-lg border border-amber-200 bg-white/70 px-3 py-1.5 text-xs font-medium text-amber-900/50"
            >
              <Lock className="h-3.5 w-3.5" aria-hidden />
              用企业账号登录（未接入）
            </button>
            <span className="inline-flex items-center rounded-md bg-amber-100/80 px-2 py-1 text-xs font-medium uppercase tracking-wide text-amber-800">
              空态 · 非 OIDC
            </span>
          </div>
        </div>
      </div>
    </section>
  )
}
