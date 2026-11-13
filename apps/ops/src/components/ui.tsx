import type { ReactNode } from 'react'

export function Card({
  children,
  className = '',
}: {
  children: ReactNode
  className?: string
}) {
  return (
    <section
      className={`rounded-xl border border-slate-200 bg-white shadow-rest ${
        /\bp-\d/.test(className) ? '' : 'p-4'
      } ${className}`}
    >
      {children}
    </section>
  )
}

export function PageHeader({
  eyebrow,
  title,
  desc,
}: {
  eyebrow?: string
  title: string
  desc?: string
}) {
  return (
    <header className="mb-6">
      {eyebrow ? (
        <p className="text-xs font-medium uppercase tracking-wide text-slate-500">{eyebrow}</p>
      ) : null}
      <h1 className="mt-1 text-xl font-semibold text-slate-900">{title}</h1>
      {desc ? <p className="mt-2 max-w-3xl text-sm leading-relaxed text-slate-600">{desc}</p> : null}
    </header>
  )
}

export type StatusTone = 'ok' | 'degraded' | 'down' | 'empty' | 'warn' | 'info'

const DOT: Record<StatusTone, string> = {
  ok: 'bg-emerald-500',
  degraded: 'bg-amber-500',
  down: 'bg-rose-500',
  empty: 'bg-slate-300',
  warn: 'bg-amber-500',
  info: 'bg-[var(--color-status-info)]',
}

const PILL: Record<StatusTone, string> = {
  ok: 'border-emerald-200 bg-emerald-50 text-emerald-800',
  degraded: 'border-amber-200 bg-amber-50 text-amber-900',
  down: 'border-rose-200 bg-rose-50 text-rose-800',
  empty: 'border-slate-200 bg-slate-50 text-slate-500',
  warn: 'border-amber-200 bg-amber-50 text-amber-900',
  info: 'token-info-chip',
}

export function StatusDot({ tone, label }: { tone: StatusTone; label?: string }) {
  return (
    <span className="inline-flex items-center gap-1.5 text-sm text-slate-700">
      <span className={`h-2 w-2 shrink-0 rounded-full ${DOT[tone]}`} aria-hidden />
      {label}
    </span>
  )
}

export function StatusPill({ tone, children }: { tone: StatusTone; children: ReactNode }) {
  return (
    <span
      className={`inline-flex items-center rounded-md border px-2 py-0.5 text-xs font-medium ${PILL[tone]}`}
    >
      {children}
    </span>
  )
}

export function EmptyState({
  title,
  body,
  action,
}: {
  title: string
  body: string
  action?: ReactNode
}) {
  return (
    <div className="ui-empty">
      <p className="ui-empty-title">{title}</p>
      <p className="ui-empty-desc">{body}</p>
      {action ? (
        <div className="mt-4 flex flex-wrap items-center justify-center gap-2">{action}</div>
      ) : null}
    </div>
  )
}

export function ExtLink({
  href,
  children,
  className = '',
  title,
}: {
  href: string
  children: ReactNode
  className?: string
  title?: string
}) {
  return (
    <a
      href={href}
      title={title ?? href}
      className={`focus-ring rounded text-slate-800 underline decoration-slate-300 underline-offset-2 hover:decoration-slate-600 ${className}`}
    >
      {children}
    </a>
  )
}

export function Toast({ message }: { message: string }) {
  return (
    <div
      role="status"
      className="fixed bottom-6 right-6 z-50 max-w-sm rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-800 shadow-elevated"
    >
      {message}
    </div>
  )
}
