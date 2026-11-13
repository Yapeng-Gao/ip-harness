import { Button, Card, PageHeader, StatusPill } from '../components/ui'
import type { DatasetVersion } from '../state/types'
import { pinVersion, tryPublishDataset, updateDraftNote, useAiDataStore } from '../state/store'

const SEED_PUBLISHED_AT = '2026-09-12T10:00:00.000Z'

/** Seed historical immutable versions (note or fixed publishedAt). */
function isSeedHistoricalVersion(v: DatasetVersion): boolean {
  return v.note.includes('种子发布') || v.publishedAt === SEED_PUBLISHED_AT
}

export function DatasetsPage() {
  const { datasets, qualityReports } = useAiDataStore()

  return (
    <div>
      <PageHeader
        eyebrow="数据集"
        title="不可变 version"
        desc="草稿备注可改；已发布 version 内容不可改（immutable），只能 bump 新 tag。发布产生新 version（vN + 假 checksum）。可 pin。质量门未 pass 时发布按钮已禁用。"
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

              <div className="mt-3 rounded-md border border-slate-200 bg-white p-3">
                <label
                  htmlFor={`draft-note-${ds.id}`}
                  className="block text-xs font-medium text-slate-800"
                >
                  草稿备注（可改）
                </label>
                <p className="mt-0.5 text-[10px] text-slate-500">
                  对比：草稿可随时改；下方已发布 version 标签旁内容仍不可改（immutable）。
                </p>
                <textarea
                  id={`draft-note-${ds.id}`}
                  className="ui-input ui-input-sm mt-2 min-h-[2.5rem] resize-y bg-slate-50 text-xs"
                  rows={2}
                  value={ds.draftNote}
                  onChange={(e) => updateDraftNote(ds.id, e.target.value)}
                />
              </div>

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
                    质量门未 pass（当前 {q?.status ?? 'idle'}）· 按钮已禁用
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
                    <span className="inline-flex flex-wrap items-center gap-1.5">
                      <span className="font-mono text-xs font-medium text-slate-800">{v.tag}</span>
                      <StatusPill tone={v.tone}>
                        {v.immutable ? 'immutable' : 'draft'}
                      </StatusPill>
                      {v.pinned ? <StatusPill tone="warn">pinned</StatusPill> : null}
                      {isSeedHistoricalVersion(v) ? (
                        <StatusPill tone="info">种子历史发布</StatusPill>
                      ) : null}
                    </span>
                    <span className="font-mono text-[10px] text-slate-500">{v.checksum}</span>
                    <span className="text-[10px] text-slate-500">
                      rows {v.rows} · {v.publishedAt}
                      {v.immutable ? ' · 内容不可改' : ''}
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
