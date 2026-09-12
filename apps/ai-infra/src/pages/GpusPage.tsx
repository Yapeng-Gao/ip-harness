import { Card, EmptyState, PageHeader, StatusDot, StatusPill } from '../components/ui'
import { GPU_HONESTY, GPU_NODES, QUOTAS } from '../data/mockGpus'

export function GpusPage() {
  return (
    <div>
      <PageHeader
        eyebrow="GPU 资源"
        title="节点与配额"
        desc="池 / 分区 / 配额为 IA 表。无 device plugin，无真 MIG。"
      />

      <EmptyState title={GPU_HONESTY.title} body={GPU_HONESTY.body} />

      <h2 className="mt-8 mb-3 text-sm font-semibold text-slate-800">节点（示意）</h2>
      <div className="grid gap-3 sm:grid-cols-2">
        {GPU_NODES.map((n) => (
          <Card key={n.id}>
            <div className="flex items-center justify-between gap-2">
              <p className="font-medium text-slate-900">{n.name}</p>
              <StatusDot tone={n.tone} label={`${n.used}/${n.cards} 卡`} />
            </div>
            <p className="mt-1 text-xs text-slate-500">
              {n.sku} · 池 {n.pool}
            </p>
            <p className="mt-2 text-xs text-slate-600">{n.quota}</p>
            <p className="mt-2 text-xs text-slate-500">{n.note}</p>
          </Card>
        ))}
      </div>

      <h2 className="mt-8 mb-3 text-sm font-semibold text-slate-800">配额表</h2>
      <div className="overflow-x-auto rounded-xl border border-slate-200 bg-white shadow-rest">
        <table className="w-full text-left text-sm">
          <thead className="border-b border-slate-200 bg-slate-50 text-xs text-slate-500">
            <tr>
              <th className="px-3 py-2 font-medium">团队</th>
              <th className="px-3 py-2 font-medium">池</th>
              <th className="px-3 py-2 font-medium">预留</th>
              <th className="px-3 py-2 font-medium">已用</th>
              <th className="px-3 py-2 font-medium">状态</th>
            </tr>
          </thead>
          <tbody>
            {QUOTAS.map((q) => (
              <tr key={q.id} className="border-b border-slate-100 last:border-0">
                <td className="px-3 py-2 font-medium">{q.team}</td>
                <td className="px-3 py-2 font-mono text-xs text-slate-600">{q.pool}</td>
                <td className="px-3 py-2 tabular-nums">{q.reserved}</td>
                <td className="px-3 py-2 tabular-nums">{q.used}</td>
                <td className="px-3 py-2">
                  <StatusPill tone={q.tone}>{q.tone === 'empty' ? '未占用' : '示意'}</StatusPill>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
