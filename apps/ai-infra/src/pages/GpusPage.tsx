import { Card, EmptyState, PageHeader, ProgressBar, StatusDot, StatusPill } from '../components/ui'
import { useAiInfra } from '../state/AiInfraStore'

export function GpusPage() {
  const { state, usedSlots, gpuUtil, toggleDrain } = useAiInfra()

  return (
    <div>
      <PageHeader
        eyebrow="GPU 资源"
        title="节点与配额"
        desc="占用由 running 作业派生。Drain 后该节点不再接受新调度；已在跑的作业不打断。无真 device plugin。"
      />

      <EmptyState
        title="无真实 GPU 集群"
        body="节点与配额为内存表。Drain 仅影响样机调度：新作业只落到非 drain 节点，否则继续排队。"
      />

      <Card className="mt-4">
        <p className="text-xs text-slate-500">整池占用（派生）</p>
        <p className="mt-1 text-2xl font-semibold tabular-nums text-slate-900">
          {gpuUtil.used}/{gpuUtil.total}
        </p>
        <div className="mt-2">
          <ProgressBar
            value={gpuUtil.total ? Math.round((gpuUtil.used / gpuUtil.total) * 100) : 0}
            label="利用率"
          />
        </div>
      </Card>

      <h2 className="mt-8 mb-3 text-sm font-semibold text-slate-800">节点</h2>
      <div className="grid gap-3 sm:grid-cols-2">
        {state.gpuNodes.map((n) => {
          const used = usedSlots(n.id)
          const tone = n.drained ? 'empty' : used >= n.totalSlots ? 'degraded' : used > 0 ? 'warn' : 'ok'
          return (
            <Card key={n.id}>
              <div className="flex items-center justify-between gap-2">
                <p className="font-medium text-slate-900">{n.name}</p>
                <StatusDot tone={tone} label={`${used}/${n.totalSlots} slot`} />
              </div>
              <p className="mt-1 text-xs text-slate-500">
                {n.sku} · 池 {n.pool}
              </p>
              <div className="mt-2">
                <ProgressBar value={n.totalSlots ? Math.round((used / n.totalSlots) * 100) : 0} />
              </div>
              <div className="mt-3 flex flex-wrap items-center gap-2">
                <StatusPill tone={n.drained ? 'warn' : 'ok'}>
                  {n.drained ? 'drain · 不可新调度' : '可调度'}
                </StatusPill>
                <button
                  type="button"
                  className="btn-press rounded-md border border-slate-200 px-2.5 py-1 text-xs text-slate-700 hover:bg-slate-50"
                  onClick={() => toggleDrain(n.id)}
                >
                  {n.drained ? '取消 drain' : '开启 drain'}
                </button>
              </div>
              <p className="mt-2 text-xs text-slate-500">
                drain 后新作业不会调度到此节点；若全部 drain，作业保持排队。
              </p>
            </Card>
          )
        })}
      </div>
    </div>
  )
}
