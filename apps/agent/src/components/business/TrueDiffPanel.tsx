/**
 * 真 diff 示意面板 · 左右差分加厚
 * 诚实标签：样机示意，非真官报/真检索/专业引擎。
 */
import { useMemo, useState } from 'react'
import {
  TRUE_DIFF_HONEST_LABEL,
  buildTrueDiff,
  type SideBySideRow,
} from '../../business/trueDiffDemo'
import { OFFICIAL_DEMO_HONEST } from '../../business/officialDemoHonest'

type Props = {
  left: string
  right: string
  leftTitle?: string
  rightTitle?: string
  /** seed 示意不可写回 */
  seedMode?: boolean
  onApprove?: () => void
  onKeep?: () => void
  className?: string
}

export function TrueDiffPanel({
  left,
  right,
  leftTitle = '当前稿',
  rightTitle = '对照版',
  seedMode = false,
  onApprove,
  onKeep,
  className = '',
}: Props) {
  const [view, setView] = useState<'side' | 'unified'>('side')
  const { stats, rows, lines } = useMemo(
    () => buildTrueDiff(left, right),
    [left, right],
  )

  return (
    <section
      className={`mt-3 overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm ${className}`}
      data-testid="true-diff-panel"
      data-seed={seedMode ? '1' : '0'}
      data-view={view}
      aria-label="版本差分示意"
    >
      <header className="border-b border-slate-200 bg-slate-50/90 px-3 py-2.5">
        <div className="flex flex-wrap items-center gap-2">
          <p className="text-[12px] font-semibold text-slate-900">
            左右差分 · 行级对照
          </p>
          <span
            className="rounded-full bg-amber-100 px-1.5 py-px text-[10px] font-semibold text-amber-950"
            data-testid="true-diff-honest-label"
          >
            {TRUE_DIFF_HONEST_LABEL}
          </span>
          <span
            className="ml-auto tabular text-[11px] font-semibold text-slate-700"
            data-testid="true-diff-stats"
          >
            <span className="text-emerald-700">+{stats.added}</span>
            {' / '}
            <span className="text-rose-700">−{stats.removed}</span>
            <span className="ml-1 font-normal text-slate-400">
              · {rows.length} 行
            </span>
          </span>
        </div>
        <div className="mt-2 flex flex-wrap gap-1.5">
          <button
            type="button"
            className={`btn-press focus-ring rounded-full px-2.5 py-0.5 text-[11px] font-semibold ${
              view === 'side'
                ? 'bg-slate-900 text-white'
                : 'border border-slate-300 bg-white text-slate-700'
            }`}
            data-testid="true-diff-view-side"
            onClick={() => setView('side')}
          >
            左右对照
          </button>
          <button
            type="button"
            className={`btn-press focus-ring rounded-full px-2.5 py-0.5 text-[11px] font-semibold ${
              view === 'unified'
                ? 'bg-slate-900 text-white'
                : 'border border-slate-300 bg-white text-slate-700'
            }`}
            data-testid="true-diff-view-unified"
            onClick={() => setView('unified')}
          >
            统一差分
          </button>
        </div>
      </header>

      {view === 'side' ? (
        <div
          className="grid grid-cols-1 gap-0 md:grid-cols-2"
          data-testid="true-diff-side-by-side"
        >
          <DiffColumn
            title={leftTitle}
            side="left"
            rows={rows}
            testId="true-diff-left"
          />
          <DiffColumn
            title={rightTitle}
            side="right"
            rows={rows}
            testId="true-diff-right"
            borderLeft
          />
        </div>
      ) : (
        <pre
          className="max-h-[min(50vh,28rem)] overflow-auto bg-slate-50/50 p-2 font-mono text-[10px] leading-relaxed"
          data-testid="true-diff-unified"
        >
          {lines.slice(0, 120).map((l, i) => (
            <div
              key={i}
              className={
                l.type === 'add'
                  ? 'bg-emerald-50 text-emerald-900'
                  : l.type === 'del'
                    ? 'bg-rose-50 text-rose-900'
                    : 'text-slate-600'
              }
              data-diff-type={l.type}
            >
              <span className="inline-block w-4 select-none opacity-70">
                {l.type === 'add' ? '+' : l.type === 'del' ? '−' : ' '}
              </span>
              {l.text || ' '}
            </div>
          ))}
          {lines.length > 120 ? (
            <div className="text-slate-400">…共 {lines.length} 行</div>
          ) : null}
        </pre>
      )}

      <footer className="flex flex-wrap items-center gap-2 border-t border-slate-200 bg-white px-3 py-2">
        {seedMode ? (
          <p
            className="text-[11px] text-slate-500"
            data-testid="true-diff-seed-note"
          >
            Seed 对照不可写回 · {OFFICIAL_DEMO_HONEST} ·
            正式版本请在右栏「另存版本」后点左侧版本节点
          </p>
        ) : (
          <>
            <button
              type="button"
              className="btn-press focus-ring rounded-full bg-slate-900 px-3 py-1 text-[11px] font-semibold text-white disabled:opacity-40"
              data-testid="dept-version-approve"
              disabled={!right.trim() || !onApprove}
              onClick={() => onApprove?.()}
            >
              认可此版写回
            </button>
            <button
              type="button"
              className="btn-press focus-ring rounded-full border border-slate-300 bg-white px-3 py-1 text-[11px] font-medium text-slate-700"
              data-testid="dept-version-keep"
              onClick={() => onKeep?.()}
            >
              保持当前稿
            </button>
          </>
        )}
      </footer>
    </section>
  )
}

function DiffColumn({
  title,
  side,
  rows,
  testId,
  borderLeft,
}: {
  title: string
  side: 'left' | 'right'
  rows: SideBySideRow[]
  testId: string
  borderLeft?: boolean
}) {
  return (
    <div
      className={`min-w-0 ${borderLeft ? 'md:border-l md:border-slate-200' : ''}`}
      data-testid={testId}
    >
      <div className="sticky top-0 z-[1] border-b border-slate-100 bg-white/95 px-2.5 py-1.5 backdrop-blur">
        <p className="text-[11px] font-semibold text-slate-800">{title}</p>
        <p className="text-[10px] text-slate-400">
          {side === 'left' ? '删行标红' : '增行标绿'} · 同行灰底
        </p>
      </div>
      <div className="max-h-[min(50vh,28rem)] overflow-auto font-mono text-[10px] leading-relaxed">
        {rows.slice(0, 120).map((r, i) => {
          const text = side === 'left' ? r.left : r.right
          const empty = text == null
          const hl =
            side === 'left'
              ? r.kind === 'del'
                ? 'bg-rose-50 text-rose-950'
                : r.kind === 'same'
                  ? 'text-slate-700'
                  : 'bg-slate-50/40 text-slate-300'
              : r.kind === 'add'
                ? 'bg-emerald-50 text-emerald-950'
                : r.kind === 'same'
                  ? 'text-slate-700'
                  : 'bg-slate-50/40 text-slate-300'
          const no = side === 'left' ? r.oldNo : r.newNo
          return (
            <div
              key={i}
              className={`flex gap-1.5 border-b border-slate-50 px-2 py-0.5 ${hl}`}
              data-diff-kind={r.kind}
              data-testid={`true-diff-row-${side}-${i}`}
            >
              <span className="w-5 shrink-0 select-none text-right tabular text-slate-400">
                {no ?? ''}
              </span>
              <span className="min-w-0 flex-1 whitespace-pre-wrap break-all">
                {empty ? (
                  <span className="select-none text-slate-300">·</span>
                ) : (
                  text || ' '
                )}
              </span>
            </div>
          )
        })}
        {rows.length > 120 ? (
          <p className="px-2 py-1 text-slate-400">…共 {rows.length} 行</p>
        ) : null}
      </div>
    </div>
  )
}
