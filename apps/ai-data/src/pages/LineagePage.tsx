import { Card, PageHeader } from '../components/ui'
import { LINEAGE_EDGES, LINEAGE_NODES, LINEAGE_NOTE } from '../data/mockLineage'

export function LineagePage() {
  return (
    <div>
      <PageHeader
        eyebrow="血缘"
        title="简单 DAG mock"
        desc="上下游节点与边为内存表。不替代 case audit，无真血缘仓 / 无 ProcessRecord 持久化。"
      />

      <Card className="mb-4 border-amber-200 bg-amber-50/80">
        <p className="text-xs leading-relaxed text-amber-950/90">{LINEAGE_NOTE}</p>
      </Card>

      <Card className="mb-4">
        <p className="mb-3 text-xs font-medium uppercase tracking-wide text-slate-500">节点</p>
        <div className="flex flex-wrap gap-2">
          {LINEAGE_NODES.map((n) => (
            <span
              key={n.id}
              className="rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-sm text-slate-800"
            >
              <span className="font-medium">{n.label}</span>
              <span className="ml-2 text-xs text-slate-500">{n.kind}</span>
            </span>
          ))}
        </div>
      </Card>

      <Card>
        <p className="mb-3 text-xs font-medium uppercase tracking-wide text-slate-500">边（DAG）</p>
        <ol className="space-y-2">
          {LINEAGE_EDGES.map((e) => {
            const from = LINEAGE_NODES.find((n) => n.id === e.from)
            const to = LINEAGE_NODES.find((n) => n.id === e.to)
            return (
              <li
                key={`${e.from}-${e.to}`}
                className="flex flex-wrap items-center gap-2 rounded-md border border-slate-100 bg-slate-50/80 px-3 py-2 text-sm"
              >
                <span className="font-medium text-slate-800">{from?.label ?? e.from}</span>
                <span className="text-xs text-slate-400">—{e.label}→</span>
                <span className="font-medium text-slate-800">{to?.label ?? e.to}</span>
              </li>
            )
          })}
        </ol>
      </Card>
    </div>
  )
}
