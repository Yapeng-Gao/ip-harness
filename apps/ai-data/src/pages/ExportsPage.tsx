import { Card, EmptyState, PageHeader, StatusPill } from '../components/ui'
import { EXPORT_EMPTY, EXPORT_ORDERS } from '../data/mockExports'

export function ExportsPage() {
  return (
    <div>
      <PageHeader
        eyebrow="脱敏导出"
        title="导出单"
        desc="从办案侧申请的导出单列表形状。无案正文、无 PatentCase 主键业务态进湖。"
      />

      <div className="mb-4 space-y-3">
        {EXPORT_ORDERS.map((o) => (
          <Card key={o.id}>
            <div className="flex flex-wrap items-start justify-between gap-2">
              <div>
                <p className="text-sm font-medium text-slate-900">{o.title}</p>
                <p className="mt-1 text-xs text-slate-500">
                  {o.from} · 申请 {o.requested}
                </p>
              </div>
              <StatusPill tone={o.tone}>{o.status}</StatusPill>
            </div>
            <p className="mt-3 text-xs text-slate-500">{o.note}</p>
          </Card>
        ))}
      </div>

      <EmptyState title={EXPORT_EMPTY.title} body={EXPORT_EMPTY.body} />
    </div>
  )
}
