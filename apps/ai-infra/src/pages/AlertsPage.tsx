import { Card, PageHeader, StatusPill } from '../components/ui'
import { ALERT_RULES, ALERT_SCOPE_LABEL, OPS_ALERTS_URL } from '../data/mockAlerts'

export function AlertsPage() {
  return (
    <div>
      <PageHeader
        eyebrow="训推告警"
        title="训练 / 推理规则"
        desc="规则为示意。出站仍标 notify，本壳不发 SMTP / 短信 / Webhook。"
      />

      <Card className="mb-4 border-amber-200 bg-amber-50/80">
        <p className="text-sm font-medium text-amber-950">出站仍走 notify</p>
        <p className="mt-2 text-xs leading-relaxed text-amber-950/90">
          训推 SLO 事件可进 notify outbox（目标形态）。样机不自己发通道。通道配置在运维面，
          <strong>只深链、不改 ops</strong>：{' '}
          <a
            href={OPS_ALERTS_URL}
            className="underline decoration-amber-400 underline-offset-2"
          >
            运维面 ops → http://localhost:5176/config#alerts
          </a>
        </p>
      </Card>

      <div className="overflow-x-auto rounded-xl border border-slate-200 bg-white shadow-rest">
        <table className="w-full min-w-[48rem] text-left text-sm">
          <thead className="border-b border-slate-200 bg-slate-50 text-xs text-slate-500">
            <tr>
              <th className="px-3 py-2 font-medium">规则</th>
              <th className="px-3 py-2 font-medium">范围</th>
              <th className="px-3 py-2 font-medium">条件</th>
              <th className="px-3 py-2 font-medium">级别</th>
              <th className="px-3 py-2 font-medium">出站</th>
            </tr>
          </thead>
          <tbody>
            {ALERT_RULES.map((r) => (
              <tr key={r.id} className="border-b border-slate-100 last:border-0">
                <td className="px-3 py-2 font-medium text-slate-900">{r.name}</td>
                <td className="px-3 py-2">{ALERT_SCOPE_LABEL[r.scope]}</td>
                <td className="px-3 py-2 text-xs text-slate-600">{r.condition}</td>
                <td className="px-3 py-2">
                  <StatusPill tone={r.tone}>{r.severity}</StatusPill>
                </td>
                <td className="px-3 py-2 text-xs text-slate-600">{r.outbound}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
