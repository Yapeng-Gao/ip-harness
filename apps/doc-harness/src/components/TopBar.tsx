import type { DemoCase, Document } from '../types'

type Props = {
  demoCase: DemoCase
  document: Document
}

export function TopBar({ demoCase, document }: Props) {
  return (
    <header className="sticky top-0 z-20 flex h-12 shrink-0 items-center gap-3 border-b border-slate-200/80 bg-white/95 px-4 backdrop-blur">
      <div className="flex min-w-0 flex-1 items-center gap-2">
        <span className="truncate text-sm font-semibold text-slate-900">
          文档 Harness 样机 · 与五壳并行 · :5178
        </span>
        <span className="hidden rounded-full border border-amber-200 bg-amber-50 px-2 py-0.5 text-[11px] text-amber-800 sm:inline">
          无真 LLM / 无真 SSO
        </span>
      </div>
      <div className="hidden items-center gap-2 text-[11px] text-slate-500 lg:flex">
        <span className="font-mono text-slate-600" title="案号">
          {demoCase.id}
        </span>
        <span className="max-w-[140px] truncate" title={demoCase.title}>
          {demoCase.title}
        </span>
        <span className="text-slate-300">·</span>
        <span>
          stage「撰写/
          <span className="font-mono text-slate-700">{document.stageId}</span>」
        </span>
        <span className="rounded-md border border-emerald-200 bg-emerald-50 px-1.5 py-0.5 font-mono text-[10px] text-emerald-800">
          {document.skuLabel}
        </span>
        <span className="rounded-md border border-slate-200 bg-slate-50 px-1.5 py-0.5 font-mono text-[10px] text-slate-700">
          {document.handoffKey}
        </span>
      </div>
    </header>
  )
}
