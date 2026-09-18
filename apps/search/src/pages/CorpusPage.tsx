import { Database, Upload } from 'lucide-react'
import { Button, Card, Chip, EmptyState, PageHeader } from '../components/ui'
import { searchActions, useSearchStore } from '../state/store'
import { CORPUS_HONESTY } from '../state/types'
import type { CorpusJobStatus } from '../state/types'

function statusTone(
  status: CorpusJobStatus,
): 'neutral' | 'accent' | 'warn' | 'ok' | 'mock' {
  if (status === 'done') return 'ok'
  if (status === 'fail') return 'warn'
  if (status === 'running') return 'accent'
  return 'mock'
}

export function CorpusPage() {
  const {
    corpusSources,
    corpusJobs,
    corpusForceNextFail,
    indexVersions,
    currentIndexTag,
    pendingPublishDocs,
    events,
  } = useSearchStore()

  const current = indexVersions.find((v) => v.tag === currentIndexTag)
  const canPublish =
    pendingPublishDocs != null &&
    pendingPublishDocs > 0 &&
    corpusJobs.some((j) => j.status === 'done')

  const lastCorpusEvent = events.find(
    (e) =>
      e.action === 'corpus.ingest' || e.action === 'corpus.publishIndex',
  )

  return (
    <div>
      <PageHeader
        eyebrow="C1 · 语料 / 索引运维示意"
        title="语料 / 索引"
        desc="入库任务假进度、index version、字段覆盖。对象是检索索引，不是 ai-data 训练集。"
      />

      <div
        role="status"
        className="mb-4 rounded-lg border border-amber-200 bg-amber-50 px-3 py-2 text-xs leading-relaxed text-amber-950"
      >
        {CORPUS_HONESTY}
      </div>

      <Card className="mb-4">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <h2 className="text-sm font-semibold text-slate-900">Sources / 入库任务</h2>
            <p className="mt-0.5 text-xs text-slate-500">
              点「入库」→ queued → running → done|fail（假进度）。入库不写 PatentCase。
            </p>
          </div>
          <label className="flex items-center gap-2 text-xs text-slate-600">
            <input
              type="checkbox"
              className="focus-ring rounded border-slate-300"
              checked={corpusForceNextFail}
              onChange={(e) =>
                searchActions.setCorpusForceNextFail(e.target.checked)
              }
            />
            下次强制失败
          </label>
        </div>

        <div className="mt-3 grid gap-3 sm:grid-cols-2">
          {corpusSources.map((s) => {
            const busy = corpusJobs.some(
              (j) =>
                j.sourceId === s.id &&
                (j.status === 'queued' || j.status === 'running'),
            )
            return (
              <div
                key={s.id}
                className="rounded-lg border border-slate-100 px-3 py-3"
              >
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <p className="text-sm font-medium text-slate-900">{s.name}</p>
                    <p className="mt-0.5 text-xs text-slate-500">{s.kind}</p>
                  </div>
                  <Chip tone="mock">示意</Chip>
                </div>
                <p className="mt-2 text-xs text-slate-500">{s.note}</p>
                <p className="mt-1 text-xs tabular-nums text-slate-700">
                  已入库（假）<strong>{s.docsIngested}</strong>
                  {s.lastIngestAt
                    ? ` · ${new Date(s.lastIngestAt).toLocaleString('zh-CN', { hour12: false })}`
                    : ' · 尚未入库'}
                </p>
                <div className="mt-3">
                  <Button
                    className="gap-1"
                    disabled={busy}
                    onClick={() => searchActions.startCorpusIngest(s.id)}
                  >
                    <Upload className="h-3.5 w-3.5" aria-hidden />
                    {busy ? '入库中…' : '入库'}
                  </Button>
                </div>
              </div>
            )
          })}
        </div>

        <h3 className="mb-2 mt-5 text-xs font-semibold uppercase tracking-wide text-slate-500">
          IngestJob 列表
        </h3>
        {corpusJobs.length === 0 ? (
          <EmptyState
            title="尚无入库任务"
            body="在上方源卡片点「入库」创建假进度任务。"
            action={
              <Button
                className="gap-1"
                onClick={() => {
                  const first = corpusSources[0]
                  if (first) searchActions.startCorpusIngest(first.id)
                }}
                disabled={corpusSources.length === 0}
              >
                <Upload className="h-3.5 w-3.5" aria-hidden />
                入库第一个源
              </Button>
            }
          />
        ) : (
          <ul className="space-y-2">
            {corpusJobs.map((j) => (
              <li
                key={j.id}
                className="rounded-lg border border-slate-100 px-3 py-2"
              >
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <span className="text-sm font-medium text-slate-900">
                    {j.sourceName}
                  </span>
                  <Chip tone={statusTone(j.status)}>{j.status}</Chip>
                </div>
                <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-slate-100">
                  <div
                    className={`h-full rounded-full transition-[width] duration-300 ease-out ${
                      j.status === 'fail' ? 'bg-amber-500' : 'bg-slate-800'
                    }`}
                    style={{ width: `${j.progress}%` }}
                  />
                </div>
                <p className="mt-1.5 text-[11px] text-slate-500">
                  {j.progress}% · {j.note}
                  {j.docsWritten > 0 ? ` · +${j.docsWritten}` : ''}
                </p>
              </li>
            ))}
          </ul>
        )}
      </Card>

      <Card className="mb-4">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <h2 className="flex items-center gap-2 text-sm font-semibold text-slate-900">
              <Database className="h-4 w-4" aria-hidden />
              Index versions
            </h2>
            <p className="mt-0.5 text-xs text-slate-500">
              当前{' '}
              <code className="rounded bg-slate-100 px-1.5 py-0.5 text-[11px]">
                {currentIndexTag}
              </code>
              {pendingPublishDocs
                ? ` · 待发布增量 +${pendingPublishDocs}`
                : ' · 无待发布增量'}
            </p>
          </div>
          <Button
            disabled={!canPublish}
            onClick={() => searchActions.publishIndex()}
          >
            发布索引
          </Button>
        </div>
        <p className="mt-2 text-[11px] text-slate-500">
          成功入库后启用发布；已发布版本不可编辑（immutable）。
        </p>
        <ul className="mt-3 space-y-2">
          {indexVersions.map((v) => (
            <li
              key={v.tag}
              className={`rounded-lg border px-3 py-2 ${
                v.tag === currentIndexTag
                  ? 'border-slate-300 bg-slate-50'
                  : 'border-slate-100'
              }`}
            >
              <div className="flex flex-wrap items-center gap-2">
                <span className="text-sm font-semibold text-slate-900">{v.tag}</span>
                {v.tag === currentIndexTag ? <Chip tone="ok">current</Chip> : null}
                <Chip tone="mock">immutable</Chip>
              </div>
              <p className="mt-1 text-[11px] tabular-nums text-slate-600">
                docs {v.docs.toLocaleString()} · checksum{' '}
                <code className="text-slate-500">{v.checksum}</code>
              </p>
              <p className="text-[11px] text-slate-400">
                {new Date(v.publishedAt).toLocaleString('zh-CN', { hour12: false })} ·{' '}
                {v.note}
              </p>
            </li>
          ))}
        </ul>
      </Card>

      <Card className="mb-4">
        <h2 className="text-sm font-semibold text-slate-900">字段覆盖</h2>
        <p className="mt-0.5 text-xs text-slate-500">
          样机估算（相对当前索引）；部分字段 &lt;100%，非假完美索引。
        </p>
        <div className="mt-3 overflow-x-auto">
          <table className="w-full min-w-[28rem] text-left text-sm">
            <thead className="border-b border-slate-200 bg-slate-50 text-xs text-slate-500">
              <tr>
                <th className="px-3 py-2 font-medium">字段</th>
                <th className="px-3 py-2 font-medium">覆盖率</th>
                <th className="px-3 py-2 font-medium">说明</th>
              </tr>
            </thead>
            <tbody>
              {(current?.fieldCoverage ?? []).map((r) => (
                <tr key={r.field} className="border-b border-slate-100 last:border-0">
                  <td className="px-3 py-2 font-mono text-xs text-slate-800">
                    {r.label}
                  </td>
                  <td className="px-3 py-2">
                    <div className="flex items-center gap-2">
                      <div className="h-1.5 w-20 overflow-hidden rounded-full bg-slate-100">
                        <div
                          className={`h-full rounded-full ${
                            r.coveragePct < 100 ? 'bg-amber-500' : 'bg-emerald-600'
                          }`}
                          style={{ width: `${r.coveragePct}%` }}
                        />
                      </div>
                      <span
                        className={`tabular-nums text-xs font-medium ${
                          r.coveragePct < 100 ? 'text-amber-800' : 'text-emerald-800'
                        }`}
                      >
                        {r.coveragePct}%
                      </span>
                    </div>
                  </td>
                  <td className="px-3 py-2 text-xs text-slate-500">{r.note}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>

      <Card>
        <h2 className="text-sm font-semibold text-slate-900">Agent JSON · corpus ops</h2>
        <p className="mt-0.5 text-xs text-slate-500">
          tool: search.corpus.ingest | search.corpus.publishIndex · backend: mock
        </p>
        <pre className="mt-3 max-h-56 overflow-auto rounded-lg border border-slate-200 bg-slate-50 p-2 text-[11px] leading-relaxed text-slate-800">
          {JSON.stringify(
            lastCorpusEvent?.payload ?? {
              tool: 'search.corpus.ingest',
              backend: 'mock',
              hint: '点「入库」或「发布索引」后此处显示最近事件 payload',
            },
            null,
            2,
          )}
        </pre>
      </Card>
    </div>
  )
}
