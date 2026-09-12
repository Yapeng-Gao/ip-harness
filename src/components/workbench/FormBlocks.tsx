import type { ReactNode, InputHTMLAttributes, ButtonHTMLAttributes } from 'react'

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
    <section className={`surface-card p-4 sm:p-5 ${className}`}>
      {(title || action) && (
        <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
          {title ? (
            <h3 className="text-balance text-sm font-medium tracking-tight text-slate-800">{title}</h3>
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
      className="wb-tip wb-tip-error"
      role="alert"
    >
      {children}
    </p>
  )
}

type TipTone = 'neutral' | 'info' | 'warn' | 'error' | 'success'

/** Gate / status tip bar — visual chrome only; keep caller copy & logic. */
export function WbTip({
  children,
  tone = 'neutral',
  className = '',
  role,
}: {
  children: ReactNode
  tone?: TipTone
  className?: string
  role?: 'alert' | 'status' | undefined
}) {
  if (!children) return null
  return (
    <div className={`wb-tip wb-tip-${tone} ${className}`} role={role}>
      {children}
    </div>
  )
}

/**
 * P1-D · 同视口唯一 sticky tip 槽。
 * tone: error=blocker > warn > info/neutral；调用方保证每页只渲染一个。
 */
export function WbStickyTip({
  children,
  tone = 'info',
  className = '',
}: {
  children: ReactNode
  tone?: TipTone
  className?: string
}) {
  if (!children) return null
  const role = tone === 'error' ? 'alert' : 'status'
  return (
    <div className={`wb-tip-sticky-slot ${className}`}>
      <div className={`wb-tip wb-tip-sticky wb-tip-${tone}`} role={role} data-sticky-tip="1">
        {children}
      </div>
    </div>
  )
}

/** Checkbox row with intentional checked / hover states. */
export function WbCheckRow({
  checked,
  children,
  className = '',
  ...rest
}: {
  checked?: boolean
  children: ReactNode
  className?: string
} & Omit<InputHTMLAttributes<HTMLInputElement>, 'type' | 'className' | 'children'>) {
  return (
    <label className={`wb-check-row ${className}`} data-checked={checked ? 'true' : 'false'}>
      <input type="checkbox" checked={checked} className="mt-0.5 shrink-0" {...rest} />
      <span className="min-w-0 flex-1 text-sm text-slate-700">{children}</span>
    </label>
  )
}

/** Selectable result / node card (hit lists, alert cards). */
export function WbNodeCard({
  selected,
  children,
  className = '',
  ...rest
}: {
  selected?: boolean
  children: ReactNode
  className?: string
} & Omit<ButtonHTMLAttributes<HTMLButtonElement>, 'className' | 'children'>) {
  return (
    <button
      type="button"
      className={`btn-press wb-node-card ${className}`}
      data-selected={selected ? 'true' : 'false'}
      {...rest}
    >
      {children}
    </button>
  )
}

/** Empty / idle interior — uses Wave3 ui-empty tokens. */
export function WbEmpty({
  title,
  description,
  children,
  className = '',
}: {
  title: string
  description?: string
  children?: ReactNode
  className?: string
}) {
  return (
    <div className={`ui-empty ${className}`}>
      <p className="ui-empty-title">{title}</p>
      {description ? <p className="ui-empty-desc">{description}</p> : null}
      {children}
    </div>
  )
}

/** Pill chip toggle — DB / country / risk chips. */
export function WbChip({
  active,
  children,
  className = '',
  ...rest
}: {
  active?: boolean
  children: ReactNode
  className?: string
} & ButtonHTMLAttributes<HTMLButtonElement>) {
  return (
    <button
      type="button"
      className={`btn-press focus-ring wb-chip ${className}`}
      aria-pressed={!!active}
      data-active={active ? 'true' : 'false'}
      {...rest}
    >
      {children}
    </button>
  )
}

/** Nested inset block inside a surface-card (concentric). */
export function WbInset({
  children,
  className = '',
}: {
  children: ReactNode
  className?: string
}) {
  return <div className={`wb-inset ${className}`}>{children}</div>
}

/** Shared control class — prefer on workbench <input>/<select>/<textarea>. */
export const WB_INPUT_CLASS = 'ui-input focus-ring'
export const WB_INPUT_SM_CLASS = 'ui-input ui-input-sm focus-ring'
