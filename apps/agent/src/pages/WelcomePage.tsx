import { Link, Navigate } from 'react-router-dom'
import { ArrowRight } from 'lucide-react'
import { HomeContentPreview } from '../components/home/HomeContentPreview'
import { useAuthSession } from '../business/AuthSessionContext'
import {
  HOME_CATEGORY_TITLE,
  HOME_CTA_PRIMARY,
  HOME_CTA_SECONDARY,
  HOME_FOOTER,
  HOME_POSITIONING,
} from '../welcome/welcomeShelfNarrative'

/**
 * 登录前宣传站 · product-pages §4.0p + spec 2026-10-23-welcome-thin-home-dual-role
 * Hero + 双 CTA + #shelf 货架。文案权威 welcomeShelfNarrative（公司叙事）。
 * 未登录可达；已登录访客直送薄入口。
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

        <header
          className="text-center sm:text-left"
          data-testid="welcome-hero"
        >
          <h1
            className="text-pretty text-[28px] font-bold leading-tight tracking-tight text-slate-900 sm:text-[36px]"
            data-testid="home-category-title"
          >
            {HOME_CATEGORY_TITLE}
          </h1>
          <p className="mt-3 max-w-xl text-[15px] leading-relaxed text-slate-600 sm:text-[17px]">
            {HOME_POSITIONING}
          </p>
        </header>

        <div className="mt-7 flex flex-col items-stretch gap-3 sm:flex-row sm:items-center">
          <Link
            to="/agent/login"
            className="btn-press focus-ring inline-flex flex-1 items-center justify-center gap-2 rounded-[var(--radius-md)] border-2 border-slate-900 bg-slate-900 px-5 py-4 text-[16px] font-bold text-white shadow-[var(--shadow-rest)] hover:bg-slate-800"
            data-testid="welcome-cta-login"
          >
            {HOME_CTA_PRIMARY}
            <ArrowRight className="h-4 w-4" aria-hidden />
          </Link>
          <a
            href="#shelf"
            className="btn-press focus-ring inline-flex items-center justify-center gap-2 rounded-[var(--radius-md)] border border-slate-300 bg-white px-5 py-4 text-[15px] font-semibold text-slate-700 shadow-[var(--shadow-rest)] hover:border-slate-400 hover:bg-slate-50"
            data-testid="welcome-cta-shelf"
          >
            {HOME_CTA_SECONDARY}
          </a>
        </div>

        <div className="mt-10">
          <HomeContentPreview showHero={false} />
        </div>

        <p className="mt-8 text-center text-[11px] text-slate-400 sm:text-left">
          {HOME_FOOTER}
        </p>
      </div>
    </div>
  )
}
