import { getStageMeta, type StageId } from '@ip/domain'

export function StageBadge({ stage }: { stage: StageId }) {
  const meta = getStageMeta(stage)
  return (
    <span className="inline-flex items-center gap-1.5 rounded-full border border-slate-200 bg-white px-2 py-0.5 text-[11px] font-medium text-slate-700">
      <span className="h-1.5 w-1.5 rounded-full" style={{ background: meta.color }} />
      {meta.name}
    </span>
  )
}
