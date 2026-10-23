import { Link, Navigate } from 'react-router-dom'
import { ArrowRight } from 'lucide-react'
import { HomeContentPreview } from '../components/home/HomeContentPreview'
import { useAuthSession } from '../business/AuthSessionContext'

/**
 * 登录前宣传站 · product-pages §4.0p
 * 未登录可达；货架只认知；主 CTA → 登录。已登录访客直送薄入口。
 */
export function WelcomePage() {
  const { loggedIn } = useAuthSession()

  if (loggedIn) {
    return <Navigate to="/agent" replace />
  }

  return (
    <div
      className="app-shell-bg min-h-full overflow-y-auto px-4 py-8 lg:px-8"
      data-testid="agent-welcome-page"
      data-page="welcome"
    >
      <div className="mx-auto w-full max-w-4xl">
        <div className="mb-6 flex items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <div className="shell-brand-mark flex h-8 w-8 items-center justify-center text-[11px] font-semibold">
              IP
            </div>
            <span className="text-sm font-semibold text-slate-800">样机 · 宣传站</span>
          </div>
          <Link
            to="/agent/login"
            className="btn-press focus-ring text-[12px] font-medium text-slate-600 hover:text-slate-900"
            data-testid="welcome-link-login"
          >
            已有会话？去登录
          </Link>
        </div>

        <HomeContentPreview />

        <div className="mt-8 flex flex-col items-stretch gap-3 sm:flex-row sm:items-center">
          <Link
            to="/agent/login"
            className="btn-press focus-ring inline-flex flex-1 items-center justify-center gap-2 rounded-[var(--radius-md)] border-2 border-slate-900 bg-slate-900 px-5 py-4 text-[16px] font-bold text-white shadow-[var(--shadow-rest)] hover:bg-slate-800"
            data-testid="welcome-cta-login"
          >
            去登录 / 开始
            <ArrowRight className="h-4 w-4" aria-hidden />
          </Link>
        </div>

        <p className="mt-4 text-center text-[11px] text-slate-400 sm:text-left">
          本页只展示品类与货架；登录后进入薄入口再干活。无交卷、齐套、拍板。
        </p>
      </div>
    </div>
  )
}
