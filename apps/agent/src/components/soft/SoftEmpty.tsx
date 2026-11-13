import type { ReactNode } from 'react'
import {
  officeEmpty,
  type OfficeEmptyKind,
} from '../../business/officeEmpty'

type Props = {
  kind: OfficeEmptyKind
  /** 覆盖 title/body（少用；优先改 officeEmpty） */
  title?: string
  body?: string
  next?: string
  className?: string
  testId?: string
  /** 底部动作（如开新案子） */
  action?: ReactNode
  /** compact：条带；block：卡片 */
  density?: 'compact' | 'block'
}

/**
 * 全站软空态 · Office 稿件语感（非 eng empty）
 */
export function SoftEmpty({
  kind,
  title,
  body,
  next,
  className = '',
  testId = 'soft-empty',
  action,
  density = 'block',
}: Props) {
  const copy = officeEmpty(kind)
  const t = title ?? copy.title
  const b = body ?? copy.body
  const n = next ?? copy.next
  const block = density === 'block'

  return (
    <div
      className={
        block
          ? `rounded-xl border border-dashed border-slate-200/90 bg-slate-50/60 px-4 py-6 text-center ${className}`
          : `rounded-lg border border-dashed border-slate-200/80 bg-slate-50/50 px-3 py-2 ${className}`
      }
      data-testid={testId}
      data-empty-kind={kind}
      data-empty-tone="office"
      role="status"
    >
      <p
        className={
          block
            ? 'text-[13px] font-medium text-slate-700'
            : 'text-[12px] font-medium text-slate-600'
        }
      >
        {t}
      </p>
      <p
        className={
          block
            ? 'mt-1 text-[12px] leading-relaxed text-slate-500'
            : 'mt-0.5 text-[11px] leading-snug text-slate-500'
        }
      >
        {b}
      </p>
      {n ? (
        <p
          className="mt-1 text-[10px] text-slate-400"
          data-testid={`${testId}-next`}
        >
          {n}
        </p>
      ) : null}
      {action ? <div className="mt-3 flex justify-center">{action}</div> : null}
    </div>
  )
}
