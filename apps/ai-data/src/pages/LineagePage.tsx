import { Card, PageHeader } from '../components/ui'
import { useAiDataStore } from '../state/store'

export function LineagePage() {
  const { lineageNodes, lineageEdges } = useAiDataStore()

  return (
    <div>
      <PageHeader
        eyebrow="血缘"
        title="简单 DAG（append-only）"
        desc="Pipeline / 发布后自动追加边（source → dataset version）。不替代 case audit，无真血缘仓。"
      />

      <Card className="mb-4 border-amber-200 bg-amber-50/80">
        <p className="text-xs leading-relaxed text-amber-950/90">
          边表仅内存追加。跑通流水线发布或从导出生成候选集后，可在此看到新边。
        </p>
      </Card>

      <Card className="mb-4">
        <p className="mb-3 text-xs font-medium uppercase tracking-wide text-slate-500">节点</p>
        <div className="flex flex-wrap gap-2">
          {lineageNodes.map((n) => (
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
        <p className="mb-3 text-xs font-medium uppercase tracking-wide text-slate-500">
          边（新→旧）
        </p>
        {lineageEdges.length === 0 ? (
          <p className="text-xs text-slate-500">暂无边</p>
        ) : (
          <ol className="space-y-2">
            {lineageEdges.map((e) => {
              const from = lineageNodes.find((n) => n.id === e.from)
              const to = lineageNodes.find((n) => n.id === e.to)
              return (
                <li
                  key={e.id}
                  className="flex flex-wrap items-center gap-2 rounded-md border border-slate-100 bg-slate-50/80 px-3 py-2 text-sm"
                >
                  <span className="font-medium text-slate-800">{from?.label ?? e.from}</span>
                  <span className="text-xs text-slate-400">—{e.label}→</span>
                  <span className="font-medium text-slate-800">{to?.label ?? e.to}</span>
                  <span className="ml-auto text-[10px] tabular-nums text-slate-400">{e.at}</span>
                </li>
              )
            })}
          </ol>
        )}
      </Card>
    </div>
  )
}
