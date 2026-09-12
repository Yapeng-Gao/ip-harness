import { Card, EmptyState, PageHeader, StatusPill } from '../components/ui'
import { SOURCES, SOURCES_EMPTY } from '../data/mockSources'

export function SourcesPage() {
  return (
    <div>
      <PageHeader
        eyebrow="数据源"
        title="接入卡片"
        desc="源登记为内存行。样机不接真爬虫、不拉真网络、不写办案 DomainCommand。"
      />

      <div className="mb-4 grid gap-3 sm:grid-cols-2">
        {SOURCES.map((s) => (
          <Card key={s.id}>
            <div className="flex items-start justify-between gap-2">
              <div>
                <p className="text-sm font-medium text-slate-900">{s.name}</p>
                <p className="mt-1 text-xs text-slate-500">{s.kind}</p>
              </div>
              <StatusPill tone={s.tone}>{s.status}</StatusPill>
            </div>
            <p className="mt-3 text-xs text-slate-500">{s.note}</p>
          </Card>
        ))}
      </div>

      <EmptyState title={SOURCES_EMPTY.title} body={SOURCES_EMPTY.body} />
    </div>
  )
}
