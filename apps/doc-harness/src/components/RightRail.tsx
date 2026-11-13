import type { ReactNode } from 'react'

export type RightRailTab = 'annotations' | 'agent'

type Props = {
  tab: RightRailTab
  onTabChange: (tab: RightRailTab) => void
  annotationCount: number
  annotationsPane: ReactNode
  agentPane: ReactNode
}

export function RightRail({
  tab,
  onTabChange,
  annotationCount,
  annotationsPane,
  agentPane,
}: Props) {
  return (
    <aside className="flex h-full w-80 shrink-0 flex-col border-l border-slate-200/80 bg-white">
      <div
        className="flex shrink-0 border-b border-slate-100"
        role="tablist"
        aria-label="右侧栏"
      >
        <TabBtn
          active={tab === 'annotations'}
          onClick={() => onTabChange('annotations')}
          label="批注"
          badge={annotationCount > 0 ? String(annotationCount) : undefined}
        />
        <TabBtn
          active={tab === 'agent'}
          onClick={() => onTabChange('agent')}
          label="Agent"
        />
      </div>
      <div className="flex min-h-0 flex-1 flex-col" role="tabpanel">
        {tab === 'annotations' ? annotationsPane : agentPane}
      </div>
    </aside>
  )
}

function TabBtn({
  active,
  onClick,
  label,
  badge,
}: {
  active: boolean
  onClick: () => void
  label: string
  badge?: string
}) {
  return (
    <button
      type="button"
      role="tab"
      aria-selected={active}
      onClick={onClick}
      className={`btn-press focus-ring relative flex flex-1 items-center justify-center gap-1.5 px-3 py-2.5 text-[12px] font-medium transition-colors ${
        active
          ? 'border-b-2 border-slate-900 text-slate-900'
          : 'border-b-2 border-transparent text-slate-500 hover:text-slate-800'
      }`}
    >
      {label}
      {badge ? (
        <span className="rounded-full bg-amber-100 px-1.5 py-px text-[10px] font-medium text-amber-800">
          {badge}
        </span>
      ) : null}
    </button>
  )
}
