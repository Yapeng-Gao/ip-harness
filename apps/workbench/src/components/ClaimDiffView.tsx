import { useMemo } from 'react'
import { diffTokens } from '@shared/utils/textDiff'

export function ClaimDiffView({
  original,
  amended,
}: {
  original: string
  amended: string
}) {
  const ops = useMemo(() => diffTokens(original, amended), [original, amended])

  return (
    <div className="rounded-lg border border-slate-200 bg-slate-50 p-3">
      <div className="mb-2 flex flex-wrap items-center gap-3 text-[10px] text-slate-500">
        <span className="font-medium text-slate-700">差异高亮</span>
        <span className="inline-flex items-center gap-1">
          <span className="rounded bg-rose-100 px-1 text-rose-700">删除</span>
          原文有、修改后无
        </span>
        <span className="inline-flex items-center gap-1">
          <span className="rounded bg-emerald-100 px-1 text-emerald-700">新增</span>
          修改后新增
        </span>
      </div>
      <pre className="whitespace-pre-wrap break-words font-mono text-xs leading-relaxed text-slate-800">
        {ops.map((op, i) => {
          if (op.type === 'equal') {
            return <span key={i}>{op.text}</span>
          }
          if (op.type === 'remove') {
            return (
              <span
                key={i}
                className="rounded bg-rose-100 text-rose-800 line-through decoration-rose-400"
              >
                {op.text}
              </span>
            )
          }
          return (
            <span key={i} className="rounded bg-emerald-100 text-emerald-800">
              {op.text}
            </span>
          )
        })}
      </pre>
    </div>
  )
}
