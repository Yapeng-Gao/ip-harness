import type { ReactNode } from 'react'

export function SplitDraft({
  left,
  right,
  rightTitle = '实时文书草稿',
}: {
  left: ReactNode
  right: ReactNode
  rightTitle?: string
}) {
  return (
    <div className="grid gap-5 xl:grid-cols-5">
      <div className="space-y-5 xl:col-span-3">{left}</div>
      <div className="xl:col-span-2">
        <div className="surface-card sticky top-4">
          <div className="border-b border-slate-100/90 px-4 py-3">
            <h3 className="text-sm font-medium tracking-tight text-slate-900">{rightTitle}</h3>
            <p className="mt-0.5 text-xs text-slate-500">根据左侧表单自动组装，可继续编辑</p>
          </div>
          <div className="p-4">{right}</div>
        </div>
      </div>
    </div>
  )
}

export function Field({
  label,
  children,
  hint,
  required,
}: {
  label: string
  children: ReactNode
  hint?: string
  required?: boolean
}) {
  return (
    <label className="block">
      <span className="mb-1.5 block text-xs font-medium text-slate-600">
        {label}
        {required && <span className="ml-0.5 text-rose-500" aria-hidden>*</span>}
        {required && <span className="sr-only">（必填）</span>}
      </span>
      {children}
      {hint && <span className="mt-1 block text-xs text-slate-400">{hint}</span>}
    </label>
  )
}
