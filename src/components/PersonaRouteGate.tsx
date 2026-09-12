import { Link, useLocation } from 'react-router-dom'
import { useApp } from '../context/AppContext'
import { personaRouteAccess } from '../data/persona'
import { resolvePersonaRedirectTo } from '../lib/personaRedirect'

/**
 * Persona URL 硬隔离：拦截页（非静默 404）。演示可执法 · 非真 IAM。
 * Multi-app：redirectTo 解析为 APP_DEV_URLS 绝对地址（P0-4）。
 */
export function PersonaRouteGate({ children }: { children: React.ReactNode }) {
  const { persona } = useApp()
  const loc = useLocation()
  const decision = personaRouteAccess(persona, loc.pathname)
  if (!decision.blocked) return <>{children}</>
  const target = resolvePersonaRedirectTo(decision.redirectTo)
  return (
    <div className="flex min-h-[60vh] flex-col items-center justify-center p-8">
      <div
        className="max-w-md rounded-xl border border-amber-200 bg-amber-50 px-5 py-6 text-amber-950"
        role="alert"
      >
        <h1 className="text-sm font-semibold">当前 Persona 不可进入此页</h1>
        <p className="mt-2 text-sm leading-relaxed">{decision.reason}</p>
        <p className="mt-2 text-xs text-amber-800/80">演示可执法 · 非真 IAM</p>
        {target.external ? (
          <a
            href={target.href}
            className="cta-work mt-4 inline-flex rounded-md px-3 py-1.5 text-xs font-medium"
          >
            {decision.redirectLabel ?? '返回'}
          </a>
        ) : (
          <Link
            to={target.href}
            className="cta-work mt-4 inline-flex rounded-md px-3 py-1.5 text-xs font-medium"
          >
            {decision.redirectLabel ?? '返回'}
          </Link>
        )}
      </div>
    </div>
  )
}
