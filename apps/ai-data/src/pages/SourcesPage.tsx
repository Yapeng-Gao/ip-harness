import { Button, Card, EmptyState, PageHeader, StatusPill } from '../components/ui'
import { jobStatusTone, pullSource, useAiDataStore } from '../state/store'

export function SourcesPage() {
  const { sources, ingestJobs } = useAiDataStore()

  return (
    <div>
      <PageHeader
        eyebrow="数据源"
        title="接入卡片"
        desc="点「拉取」创建 IngestJob（queued→running→done/fail），写入 raw 计数。样机不接真爬虫。"
      />

      <div id="ai-data-sources" className="mb-4 grid gap-3 sm:grid-cols-2">
        {sources.map((s) => {
          const busy = ingestJobs.some(
            (j) => j.sourceId === s.id && (j.status === 'queued' || j.status === 'running'),
          )
          return (
            <Card key={s.id}>
              <div className="flex items-start justify-between gap-2">
                <div>
                  <p className="text-sm font-medium text-slate-900">{s.name}</p>
                  <p className="mt-1 text-xs text-slate-500">{s.kind}</p>
                </div>
                <StatusPill tone={s.tone}>{s.status}</StatusPill>
              </div>
              <p className="mt-3 text-xs text-slate-500">{s.note}</p>
              <p className="mt-2 text-xs tabular-nums text-slate-700">
                raw 计数：<strong>{s.rawCount}</strong>
                {s.lastIngestAt ? ` · 最近 ${s.lastIngestAt}` : ''}
              </p>
              <div className="mt-3">
                <Button disabled={busy} onClick={() => pullSource(s.id)}>
                  {busy ? '拉取中…' : '拉取'}
                </Button>
              </div>
            </Card>
          )
        })}
      </div>

      <h2 className="mb-3 text-sm font-semibold text-slate-800">IngestJob</h2>
      {ingestJobs.length === 0 ? (
        <EmptyState
          title="尚无 IngestJob"
          body="在上方源卡片点「拉取」创建任务并推进状态。"
          action={
            <Button
              variant="secondary"
              onClick={() =>
                document.getElementById('ai-data-sources')?.scrollIntoView({ behavior: 'smooth', block: 'start' })
              }
            >
              去数据源拉取
            </Button>
          }
        />
      ) : (
        <div className="overflow-x-auto rounded-xl border border-slate-200 bg-white shadow-rest">
          <table className="w-full min-w-[36rem] text-left text-sm">
            <thead className="border-b border-slate-200 bg-slate-50 text-xs text-slate-500">
              <tr>
                <th className="px-3 py-2 font-medium">源</th>
                <th className="px-3 py-2 font-medium">状态</th>
                <th className="px-3 py-2 font-medium">raw 写入</th>
                <th className="px-3 py-2 font-medium">说明</th>
              </tr>
            </thead>
            <tbody>
              {ingestJobs.map((j) => (
                <tr key={j.id} className="border-b border-slate-100 last:border-0">
                  <td className="px-3 py-2 font-medium text-slate-900">{j.sourceName}</td>
                  <td className="px-3 py-2">
                    <StatusPill tone={jobStatusTone(j.status)}>{j.status}</StatusPill>
                  </td>
                  <td className="px-3 py-2 tabular-nums">+{j.rawWritten}</td>
                  <td className="px-3 py-2 text-xs text-slate-500">{j.note}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}
