import type { ReactNode } from 'react'
import { AppLink } from './AppLink'

export type PageHeaderAction = {
  label: string
  to?: string
  onClick?: () => void
  /** visually primary (filled slate) */
  primary?: boolean
  icon?: ReactNode
  ariaLabel?: string
}

/**
 * Shared page chrome: Where am I? What next? How to switch context?
 * title + one-line context + one primary next action + optional secondary.
 * `to` 经 AppLink：multi-app 跨面 → APP_DEV_URLS 绝对链。
 */
export function PageHeader({
  title,
  context,
  primary,
  secondary,
  children,
  sticky,
}: {
  title: string
  /** one-line context: tenant / scope / count */
  context?: ReactNode
  primary?: PageHeaderAction
  secondary?: PageHeaderAction | PageHeaderAction[]
  /** extra chrome under title row (filters, tabs) */
  children?: ReactNode
  sticky?: boolean
}) {
  const secs = secondary
    ? Array.isArray(secondary)
      ? secondary
      : [secondary]
    : []

  const renderAction = (a: PageHeaderAction, filled: boolean) => {
    const cls = filled
      ? 'ui-btn ui-btn-primary btn-press cta-work focus-ring'
      : 'ui-btn ui-btn-secondary btn-press focus-ring'
    const label = (
      <>
        {a.icon}
        {a.label}
      </>
    )
    if (a.to) {
      return (
        <AppLink key={a.label + (a.to ?? '')} to={a.to} className={cls} aria-label={a.ariaLabel ?? a.label}>
          {label}
        </AppLink>
      )
    }
    return (
      <button
        key={a.label}
        type="button"
        onClick={a.onClick}
        className={cls}
        aria-label={a.ariaLabel ?? a.label}
      >
        {label}
      </button>
    )
  }

  return (
    <header
      className={`mb-6 ${sticky ? 'sticky-chrome -mx-2 rounded-[var(--radius-xl)] px-2 py-3' : ''}`}
    >
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div className="min-w-0">
          <h1 className="text-balance text-[22px] font-semibold tracking-tight text-slate-900">
            {title}
          </h1>
          {context != null && context !== '' && (
            <p className="mt-1 text-pretty text-sm text-slate-500">{context}</p>
          )}
        </div>
        {(primary || secs.length > 0) && (
          <div className="flex flex-wrap items-center gap-2">
            {secs.map((a) => renderAction(a, !!a.primary))}
            {primary && renderAction(primary, true)}
          </div>
        )}
      </div>
      {children}
    </header>
  )
}

/** Empty / zero-result panel with primary CTA */
export function EmptyState({
  title,
  description,
  primary,
  secondary,
}: {
  title: string
  description?: string
  primary?: PageHeaderAction
  secondary?: PageHeaderAction
}) {
  const btn = (
    a: PageHeaderAction,
    filled: boolean,
  ) => {
    const cls = filled
      ? 'ui-btn ui-btn-primary btn-press cta-work focus-ring'
      : 'ui-btn ui-btn-secondary btn-press focus-ring'
    if (a.to) {
      return (
        <AppLink to={a.to} className={cls} aria-label={a.ariaLabel ?? a.label}>
          {a.icon}
          {a.label}
        </AppLink>
      )
    }
    return (
      <button type="button" onClick={a.onClick} className={cls} aria-label={a.ariaLabel ?? a.label}>
        {a.icon}
        {a.label}
      </button>
    )
  }

  return (
    <div className="ui-empty border-0 shadow-none">
      <p className="ui-empty-title">{title}</p>
      {description && <p className="ui-empty-desc">{description}</p>}
      <div className="mt-1 flex flex-wrap justify-center gap-2">
        {primary && btn(primary, true)}
        {secondary && btn(secondary, false)}
      </div>
    </div>
  )
}
