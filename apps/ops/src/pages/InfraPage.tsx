import { Card, EmptyState, PageHeader, StatusDot, StatusPill } from '../components/ui'
import { BACKUP_DRILL, CERTS, CONTAINERS, DATA_PLANE, GPU_EMPTY, HOSTS } from '../data/mockInfra'

export function InfraPage() {
  return (
    <div>
      <PageHeader
        eyebrow="基础设施"
        title="基础设施"
        desc="主机 / 容器为开发机示意。GPU 与对象存储保持诚实空态。无集群探针。"
      />

      <h2 className="mb-3 text-sm font-semibold text-slate-800">主机</h2>
      <div className="grid gap-3 sm:grid-cols-2">
        {HOSTS.map((h) => (
          <Card key={h.id}>
            <div className="flex items-center justify-between">
              <p className="font-medium text-slate-900">{h.name}</p>
              <StatusDot tone={h.tone} label={h.tone === 'ok' ? '在线示意' : '未编入'} />
            </div>
            <p className="mt-1 text-xs text-slate-500">{h.role}</p>
            <p className="mt-2 text-xs text-slate-600">
              CPU {h.cpu} · MEM {h.mem}
            </p>
          </Card>
        ))}
      </div>

      <h2 className="mt-8 mb-3 text-sm font-semibold text-slate-800">GPU</h2>
      <EmptyState title={GPU_EMPTY.title} body={GPU_EMPTY.body} />

      <h2 className="mt-8 mb-3 text-sm font-semibold text-slate-800">容器</h2>
      <div className="overflow-x-auto rounded-xl border border-slate-200 bg-white shadow-rest">
        <table className="w-full text-left text-sm">
          <thead className="border-b border-slate-200 bg-slate-50 text-xs text-slate-500">
            <tr>
              <th className="px-3 py-2 font-medium">名称</th>
              <th className="px-3 py-2 font-medium">镜像 / 端口</th>
              <th className="px-3 py-2 font-medium">状态</th>
            </tr>
          </thead>
          <tbody>
            {CONTAINERS.map((c) => (
              <tr key={c.id} className="border-b border-slate-100 last:border-0">
                <td className="px-3 py-2 font-medium">{c.name}</td>
                <td className="px-3 py-2 font-mono text-xs text-slate-600">{c.image}</td>
                <td className="px-3 py-2">
                  <StatusPill tone={c.tone}>{c.status}</StatusPill>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <h2 className="mt-8 mb-3 text-sm font-semibold text-slate-800">DB / 对象存储 / 队列</h2>
      <div className="grid gap-3 sm:grid-cols-3">
        {DATA_PLANE.map((d) => (
          <Card key={d.id}>
            <div className="flex items-center justify-between">
              <p className="text-sm font-medium">{d.name}</p>
              <StatusDot tone={d.tone} />
            </div>
            <p className="mt-2 text-xs text-slate-500">{d.detail}</p>
          </Card>
        ))}
      </div>

      <div className="mt-8 grid gap-3 lg:grid-cols-2">
        <Card>
          <p className="text-sm font-medium text-slate-900">备份演练</p>
          <p className="mt-2 text-sm text-slate-700">
            上次：{BACKUP_DRILL.lastAt} · {BACKUP_DRILL.result}
          </p>
          <p className="mt-2 text-xs text-slate-500">{BACKUP_DRILL.note}</p>
        </Card>
        <Card>
          <p className="text-sm font-medium text-slate-900">证书到期</p>
          <ul className="mt-2 space-y-2">
            {CERTS.map((c) => (
              <li key={c.id} className="flex items-center justify-between gap-2 text-sm">
                <span>
                  {c.name}
                  <span className="ml-2 font-mono text-xs text-slate-500">{c.expires}</span>
                </span>
                <StatusPill tone={c.tone}>
                  {c.days == null ? '未签发' : `${c.days} 天`}
                </StatusPill>
              </li>
            ))}
          </ul>
        </Card>
      </div>
    </div>
  )
}
