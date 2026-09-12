import { Card, EmptyState, PageHeader, StatusPill } from '../components/ui'
import { ENDPOINT_EMPTY, ENDPOINTS } from '../data/mockEndpoints'

export function EndpointsPage() {
  return (
    <div>
      <PageHeader
        eyebrow="在线推理"
        title="已发布端点"
        desc="卡片展示「已发布」形状，供网关消费示意。无真推理进程、不暴露节点 SSH。"
      />

      <div className="grid gap-3 lg:grid-cols-2">
        {ENDPOINTS.map((ep) => (
          <Card key={ep.id}>
            <div className="flex items-start justify-between gap-2">
              <div>
                <p className="font-medium text-slate-900">{ep.name}</p>
                <p className="mt-0.5 font-mono text-xs text-slate-500">
                  {ep.model} · {ep.revision}
                </p>
              </div>
              <StatusPill tone={ep.tone}>{ep.status}</StatusPill>
            </div>
            <dl className="mt-3 grid grid-cols-3 gap-2 text-xs">
              <div>
                <dt className="text-slate-500">流量</dt>
                <dd className="mt-0.5 font-medium text-slate-800">{ep.traffic}</dd>
              </div>
              <div>
                <dt className="text-slate-500">QPS</dt>
                <dd className="mt-0.5 font-medium tabular-nums text-slate-800">{ep.qps}</dd>
              </div>
              <div>
                <dt className="text-slate-500">p95</dt>
                <dd className="mt-0.5 font-medium tabular-nums text-slate-800">{ep.p95}</dd>
              </div>
            </dl>
            <p className="mt-3 text-xs text-slate-500">{ep.note}</p>
          </Card>
        ))}
      </div>

      <div className="mt-6">
        <EmptyState title={ENDPOINT_EMPTY.title} body={ENDPOINT_EMPTY.body} />
      </div>
    </div>
  )
}
