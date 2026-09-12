import type { ButtonHTMLAttributes, ReactNode } from 'react'

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
    <div className="rounded-xl border border-dashed border-slate-300 bg-slate-50 px-4 py-8 text-center">
      <p className="text-sm font-medium text-slate-700">{title}</p>
      <p className="mt-1 text-xs leading-relaxed text-slate-500">{body}</p>
      {action ? <div className="mt-4 flex flex-wrap items-center justify-center gap-2">{action}</div> : null}
    </div>
  )
}

export function ProgressBar({
  value,
  label,
}: {
  value: number
  label?: string
}) {
  const clamped = Math.max(0, Math.min(100, value))
  return (
    <div>
      {label ? (
        <div className="mb-1 flex justify-between text-xs text-slate-500">
          <span>{label}</span>
          <span className="tabular-nums">{clamped}%</span>
        </div>
      ) : null}
      <div
        className="h-2 overflow-hidden rounded-full bg-slate-100"
        role="progressbar"
        aria-valuenow={clamped}
        aria-valuemin={0}
        aria-valuemax={100}
      >
        <div
          className="h-full rounded-full bg-slate-800"
          style={{ width: `${clamped}%` }}
        />
      </div>
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
  variant?: 'primary' | 'secondary' | 'success' | 'danger'
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

export function ConfirmDialog({
  open,
  title,
  body,
  confirmLabel = '确认',
  cancelLabel = '取消',
  onConfirm,
  onCancel,
}: {
  open: boolean
  title: string
  body: string
  confirmLabel?: string
  cancelLabel?: string
  onConfirm: () => void
  onCancel: () => void
}) {
  if (!open) return null
  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 p-4"
      role="dialog"
      aria-modal="true"
      aria-labelledby="confirm-dialog-title"
    >
      <div className="w-full max-w-md rounded-xl border border-slate-200 bg-white p-5 shadow-elevated">
        <h2 id="confirm-dialog-title" className="text-sm font-semibold text-slate-900">
          {title}
        </h2>
        <p className="mt-2 text-xs leading-relaxed text-slate-600">{body}</p>
        <p className="mt-2 text-[11px] text-slate-400">
          此确认为样机门禁，不是办案 HITL / DomainCommand。
        </p>
        <div className="mt-4 flex justify-end gap-2">
          <Button variant="secondary" onClick={onCancel}>
            {cancelLabel}
          </Button>
          <Button variant="primary" onClick={onConfirm}>
            {confirmLabel}
          </Button>
        </div>
      </div>
    </div>
  )
}
