import { Button, Card, PageHeader, StatusPill } from '../components/ui'
import { OPS_ALERTS_URL } from '../lib/opsLinks'
import { useAiInfra } from '../state/AiInfraStore'

const KIND_LABEL = {
  job_failed: '作业失败',
  gpu_high: 'GPU 高占用',
  info: '信息',
} as const

export function AlertsPage() {
  const { state, ackAlert, silenceAlert } = useAiInfra()

  return (
    <div>
      <PageHeader
        eyebrow="训推告警"
        title="自动事件"
        desc="作业失败与 GPU≥80% 自动追加。可确认 / 静默。出站仍标 notify，本壳不发 SMTP。"
      />

      <Card className="mb-4 border-amber-200 bg-amber-50/80">
        <p className="text-sm font-medium text-amber-950">出站仍走 notify</p>
        <p className="mt-2 text-xs leading-relaxed text-amber-950/90">
          通道配置在运维面，
          <strong>只深链、不改 ops</strong>：{' '}
          <a
            href={OPS_ALERTS_URL}
            className="focus-ring rounded underline decoration-amber-400 underline-offset-2"
            title={OPS_ALERTS_URL}
          >
            运维面 · 告警通道
          </a>
        </p>
      </Card>

      <div className="overflow-x-auto rounded-xl border border-slate-200 bg-white shadow-rest">
        <table className="w-full min-w-[40rem] text-left text-sm">
          <thead className="border-b border-slate-200 bg-slate-50 text-xs text-slate-500">
            <tr>
              <th className="px-3 py-2 font-medium">类型</th>
              <th className="px-3 py-2 font-medium">消息</th>
              <th className="px-3 py-2 font-medium">状态</th>
              <th className="px-3 py-2 font-medium">动作</th>
            </tr>
          </thead>
          <tbody>
            {state.alerts.length === 0 ? (
              <tr>
                <td colSpan={4} className="px-3 py-6 text-center text-xs text-slate-500">
                  暂无告警。制造失败作业或打满 GPU 可触发。
                </td>
              </tr>
            ) : null}
            {state.alerts.map((a) => (
              <tr key={a.id} className="border-b border-slate-100 last:border-0">
                <td className="px-3 py-2 font-medium text-slate-900">{KIND_LABEL[a.kind]}</td>
                <td className="px-3 py-2 text-xs text-slate-600">
                  {a.message}
                  <p className="mt-0.5 text-[11px] text-slate-400">
                    {new Date(a.createdAt).toLocaleString('zh-CN')}
                  </p>
                </td>
                <td className="px-3 py-2">
                  <StatusPill
                    tone={
                      a.status === 'open' ? 'warn' : a.status === 'acked' ? 'ok' : 'empty'
                    }
                  >
                    {a.status === 'open' ? '未确认' : a.status === 'acked' ? '已确认' : '已静默'}
                  </StatusPill>
                </td>
                <td className="px-3 py-2">
                  <div className="flex flex-wrap gap-1">
                    {a.status === 'open' ? (
                      <>
                        <Button variant="secondary" onClick={() => ackAlert(a.id)}>
                          确认
                        </Button>
                        <Button variant="secondary" onClick={() => silenceAlert(a.id)}>
                          静默
                        </Button>
                      </>
                    ) : (
                      <span className="text-xs text-slate-400">—</span>
                    )}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
