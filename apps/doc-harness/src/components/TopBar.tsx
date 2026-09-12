import type { DemoCase, Document } from '../types'
import { CaseSwitcher } from './CaseSwitcher'

type Props = {
  cases: DemoCase[]
  activeCase: DemoCase
  document: Document
  autoSavedHint: string | null
  onSwitchCase: (caseId: string) => void
}

const STAGE_LABEL: Record<string, string> = {
  drafting: '撰写',
  prosecution: 'OA/审查',
  inventor: '发明人交底',
}

export function TopBar({
  cases,
  activeCase,
  document,
  autoSavedHint,
  onSwitchCase,
}: Props) {
  return (
    <header className="sticky top-0 z-20 flex min-h-12 shrink-0 flex-col gap-1.5 border-b border-slate-200/80 bg-white/95 px-4 py-2 backdrop-blur sm:flex-row sm:items-center sm:gap-3 sm:py-0">
      <div className="flex min-w-0 flex-1 flex-col gap-1">
        <div className="flex min-w-0 flex-wrap items-center gap-2">
          <span className="truncate text-sm font-semibold text-slate-900">
            {activeCase.title}
          </span>
          <span className="rounded-md border border-slate-200 bg-slate-50 px-1.5 py-0.5 text-[10px] text-slate-600">
            {STAGE_LABEL[document.stageId] ?? document.stageId}
            <span className="mx-1 text-slate-300">·</span>
            <span className="font-mono">{document.stageId}</span>
          </span>
          <span className="rounded-md border border-emerald-200 bg-emerald-50 px-1.5 py-0.5 font-mono text-[10px] text-emerald-800">
            {document.skuLabel}
          </span>
          <span className="rounded-md border border-slate-200 bg-slate-50 px-1.5 py-0.5 font-mono text-[10px] text-slate-700">
            {document.handoffKey}
          </span>
          {autoSavedHint ? (
            <span className="rounded-full border border-emerald-200 bg-emerald-50 px-2 py-0.5 text-[10px] text-emerald-800">
              {autoSavedHint}
            </span>
          ) : null}
        </div>
        <p className="text-[11px] leading-snug text-slate-500">
          TipTap 批注样机 · 非 Word 修订/协同 · :5178 · 无真 LLM / 无真 SSO
        </p>
      </div>
      <div className="shrink-0">
        <CaseSwitcher
          cases={cases}
          activeCaseId={activeCase.id}
          onSwitch={onSwitchCase}
          compact
        />
      </div>
    </header>
  )
}
