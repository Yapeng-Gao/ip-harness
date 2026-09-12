import { Button, Card, PageHeader, StatusPill } from '../components/ui'
import { pinVersion, tryPublishDataset, useAiDataStore } from '../state/store'

export function DatasetsPage() {
  const { datasets, qualityReports } = useAiDataStore()

  return (
    <div>
      <PageHeader
        eyebrow="数据集"
        title="不可变 version"
        desc="发布产生新 version（vN + 假 checksum）。已发布内容不可改，只能出新 version。可 pin。质量门未 pass 时发布 disabled。"
      />

      <div className="space-y-4">
        {datasets.map((ds) => {
          const q = qualityReports.find((r) => r.datasetId === ds.id)
          const canPublish = q?.status === 'pass'
          return (
            <Card key={ds.id}>
              <div className="flex flex-wrap items-baseline justify-between gap-2">
                <div>
                  <p className="text-sm font-medium text-slate-900">{ds.name}</p>
                  <p className="mt-0.5 text-xs text-slate-500">
                    id <span className="font-mono">{ds.id}</span> · 用途 {ds.purpose} · 行数{' '}
                    {ds.rowEstimate} · 更新 {ds.updated}
                  </p>
                </div>
                <p className="text-xs text-slate-500">{ds.note}</p>
              </div>

              <p className="mt-2 text-xs text-slate-600">
                草稿备注（可改）：{ds.draftNote}
              </p>

              <div className="mt-3 flex flex-wrap items-center gap-2">
                <Button
                  disabled={!canPublish}
                  title={canPublish ? '发布新 version' : '质量门未 pass · 禁止发布'}
                  onClick={() => tryPublishDataset(ds.id)}
                >
                  发布新 version
                </Button>
                {!canPublish ? (
                  <span className="text-xs text-rose-700">
                    质量门未 pass（当前 {q?.status ?? 'idle'}）· 按钮 disabled
                  </span>
                ) : (
                  <StatusPill tone="ok">质量门 pass · 可发布</StatusPill>
                )}
              </div>

              <div className="mt-3 flex flex-wrap gap-2">
                {ds.versions.map((v) => (
                  <span
                    key={v.tag}
                    className="inline-flex flex-col gap-1 rounded-md border border-slate-200 bg-slate-50 px-2 py-1.5"
                  >
                    <span className="inline-flex items-center gap-1.5">
                      <span className="font-mono text-xs font-medium text-slate-800">{v.tag}</span>
                      <StatusPill tone={v.tone}>
                        {v.immutable ? 'immutable' : 'draft'}
                      </StatusPill>
                      {v.pinned ? <StatusPill tone="warn">pinned</StatusPill> : null}
                    </span>
                    <span className="font-mono text-[10px] text-slate-500">{v.checksum}</span>
                    <span className="text-[10px] text-slate-500">
                      rows {v.rows} · {v.publishedAt}
                    </span>
                    <Button
                      variant="secondary"
                      className="self-start"
                      disabled={v.pinned}
                      onClick={() => pinVersion(ds.id, v.tag)}
                    >
                      {v.pinned ? '已 pin' : 'Pin'}
                    </Button>
                  </span>
                ))}
              </div>
            </Card>
          )
        })}
      </div>
    </div>
  )
}
