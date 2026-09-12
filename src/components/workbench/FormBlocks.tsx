import type { ReactNode } from 'react'

/** Workbench section card — outer soft surface with concentric inner radius. */
export function WbSection({
  title,
  children,
  className = '',
  action,
}: {
  title?: string
  children: ReactNode
  className?: string
  action?: ReactNode
}) {
  return (
    <section className={`flat-card p-4 sm:p-5 ${className}`}>
      {(title || action) && (
        <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
          {title ? (
            <h3 className="text-sm font-medium text-slate-800">{title}</h3>
          ) : (
            <span />
          )}
          {action}
        </div>
      )}
      <div className="space-y-3">{children}</div>
    </section>
  )
}

/** Consistent field label ≥12px + control slot. */
export function WbField({
  label,
  children,
  hint,
  required,
  htmlFor,
}: {
  label: string
  children: ReactNode
  hint?: string
  required?: boolean
  htmlFor?: string
}) {
  return (
    <div className="block">
      <label htmlFor={htmlFor} className="mb-1.5 block text-xs font-medium text-slate-600">
        {label}
        {required && <span className="ml-0.5 text-rose-500" aria-hidden>*</span>}
        {required && <span className="sr-only">（必填）</span>}
      </label>
      {children}
      {hint && <p className="mt-1 text-xs text-slate-400">{hint}</p>}
    </div>
  )
}

/** Inline rose error for workbench forms. */
export function WbError({ children }: { children: ReactNode }) {
  if (!children) return null
  return (
    <p
      className="rounded-[var(--radius-md)] bg-rose-50 px-3 py-2 text-xs text-rose-700 ring-1 ring-rose-100"
      role="alert"
    >
      {children}
    </p>
  )
}
