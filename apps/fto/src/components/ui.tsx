import type { ButtonHTMLAttributes, ReactNode } from 'react'
import type { RiskLevel } from '../state/types'
import { RISK_LABELS } from '../state/types'

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
    <div className="rounded-xl border border-dashed border-slate-300 bg-slate-50 px-4 py-8 text-center">
      <p className="text-sm font-medium text-slate-700">{title}</p>
      <p className="mt-1 text-xs leading-relaxed text-slate-500">{body}</p>
      {action ? (
        <div className="mt-4 flex flex-wrap items-center justify-center gap-2">{action}</div>
      ) : null}
    </div>
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

type BtnProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: 'primary' | 'secondary' | 'danger' | 'success'
}

const BTN_VARIANT: Record<NonNullable<BtnProps['variant']>, string> = {
  primary: 'ui-btn-primary',
  secondary: 'ui-btn-secondary',
  success: 'ui-btn-success',
  danger: 'border border-rose-200 bg-rose-50 text-rose-800 hover:bg-rose-100',
}

export function Button({
  variant = 'primary',
  className = '',
  type = 'button',
  disabled,
  ...rest
}: BtnProps) {
  return (
    <button
      type={type}
      disabled={disabled}
      className={`ui-btn ui-btn-sm btn-press focus-ring ${BTN_VARIANT[variant]} ${className}`}
      {...rest}
    />
  )
}

export function Chip({
  children,
  tone = 'neutral',
}: {
  children: ReactNode
  tone?: 'neutral' | 'accent' | 'warn' | 'ok' | 'mock' | 'danger'
}) {
  const cls =
    tone === 'accent'
      ? 'border-[var(--color-accent)]/30 bg-[var(--color-accent-soft)] text-slate-800'
      : tone === 'warn'
        ? 'border-amber-200 bg-amber-50 text-amber-900'
        : tone === 'ok'
          ? 'border-emerald-200 bg-emerald-50 text-emerald-800'
          : tone === 'mock'
            ? 'border-amber-200/80 bg-[#fffbeb] text-[#78350f]'
            : tone === 'danger'
              ? 'border-rose-200 bg-rose-50 text-rose-800'
              : 'border-slate-200 bg-slate-50 text-slate-700'
  return (
    <span
      className={`inline-flex items-center rounded-md border px-2 py-0.5 text-xs font-medium ${cls}`}
    >
      {children}
    </span>
  )
}

export function RiskDot({ level }: { level: RiskLevel }) {
  const color =
    level === 'high'
      ? 'bg-rose-500'
      : level === 'medium'
        ? 'bg-amber-400'
        : level === 'low'
          ? 'bg-emerald-500'
          : 'bg-slate-400'
  return (
    <span className="inline-flex items-center gap-1.5 text-xs font-medium text-slate-700">
      <span className={`inline-block h-2.5 w-2.5 rounded-full ${color}`} aria-hidden />
      {RISK_LABELS[level]}
      <span className="text-slate-400">({level})</span>
    </span>
  )
}
