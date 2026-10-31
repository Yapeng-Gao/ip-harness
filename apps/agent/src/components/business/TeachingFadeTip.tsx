import { useState } from 'react'
import {
  dismissTeachTip,
  shouldShowTeachTip,
  teachCopyForDept,
  clearForceShow,
} from '../../business/teachingFade'

type Props = {
  deptId: string
}

/**
 * T7 带教淡出 · 短说明非全屏课
 */
export function TeachingFadeTip({ deptId }: Props) {
  const [visible, setVisible] = useState(() => shouldShowTeachTip(deptId))
  if (!visible) {
    return <div className="hidden" data-testid="teach-fade-tip" data-show="0" hidden />
  }
  const copy = teachCopyForDept(deptId)
  return (
    <aside
      className="mb-3 rounded-xl border border-sky-200 bg-sky-50/90 px-3 py-2.5 shadow-sm"
      data-testid="teach-fade-tip"
      data-show="1"
      data-dept={deptId}
      role="note"
    >
      <p className="text-[10px] font-semibold uppercase tracking-wide text-sky-800/80">
        首次说明 · 可淡出
      </p>
      <p className="mt-0.5 text-[12px] font-semibold text-slate-900">{copy.title}</p>
      <p className="mt-0.5 text-[11px] leading-snug text-slate-700">{copy.body}</p>
      <p className="mt-1 text-[11px] text-sky-900">{copy.askLine}</p>
      <button
        type="button"
        className="btn-press focus-ring mt-2 rounded-full bg-slate-900 px-3 py-1 text-[11px] font-semibold text-white"
        data-testid="teach-fade-dismiss"
        onClick={() => {
          dismissTeachTip(deptId)
          clearForceShow()
          setVisible(false)
        }}
      >
        知道了
      </button>
    </aside>
  )
}
