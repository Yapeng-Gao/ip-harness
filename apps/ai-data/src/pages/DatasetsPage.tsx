import { Card, PageHeader, StatusPill } from '../components/ui'
import { DATASETS } from '../data/mockDatasets'

export function DatasetsPage() {
  return (
    <div>
      <PageHeader
        eyebrow="数据集"
        title="列表 + version 标签"
        desc="不可变 version 为假标签。供 ai-infra 消费形状示意；无对象存储、无真 Manifest。"
      />

      <div className="space-y-4">
        {DATASETS.map((ds) => (
          <Card key={ds.id}>
            <div className="flex flex-wrap items-baseline justify-between gap-2">
              <div>
                <p className="text-sm font-medium text-slate-900">{ds.name}</p>
                <p className="mt-0.5 text-xs text-slate-500">
                  用途 {ds.purpose} · 行数 {ds.rows} · 更新 {ds.updated}
                </p>
              </div>
              <p className="text-xs text-slate-500">{ds.note}</p>
            </div>
            <div className="mt-3 flex flex-wrap gap-2">
              {ds.versions.map((v) => (
                <span
                  key={v.tag}
                  className="inline-flex items-center gap-1.5 rounded-md border border-slate-200 bg-slate-50 px-2 py-1"
                  title={v.note}
                >
                  <span className="font-mono text-xs font-medium text-slate-800">{v.tag}</span>
                  <StatusPill tone={v.tone}>{v.note}</StatusPill>
                </span>
              ))}
            </div>
          </Card>
        ))}
      </div>
    </div>
  )
}
