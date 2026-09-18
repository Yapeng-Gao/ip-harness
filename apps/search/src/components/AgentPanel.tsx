import { Copy, ExternalLink, Terminal } from 'lucide-react'
import { Button, Chip } from './ui'
import { useSearchStore, searchActions } from '../state/store'
import { DOWNSTREAM_HONESTY, DOWNSTREAM_PLACEHOLDERS, HONESTY_BANNER } from '../state/types'

export function AgentPanel({ compact = false }: { compact?: boolean }) {
  const {
    lastQuery,
    lastResponse,
    events,
    mode,
    text,
    advancedRows,
    filters,
    limit,
    currentIndexTag,
  } = useSearchStore()

  const liveQuery =
    lastQuery ??
    ({
      mode,
      text: mode === 'advanced' ? undefined : text,
      advanced:
        mode === 'advanced'
          ? Object.fromEntries(
              advancedRows.filter((r) => r.value.trim()).map((r) => [r.field, r.value.trim()]),
            )
          : undefined,
      filters,
      limit,
    } as const)

  const toolShape = {
    tool: 'commercial_patent_search',
    equiv: 'search(query)',
    query: liveQuery,
    honesty: HONESTY_BANNER,
  }

  const responseView = lastResponse
    ? {
        ...lastResponse,
        hits: lastResponse.hits.map((h) => ({
          id: h.id,
          publicationNumber: h.publicationNumber,
          title: h.title,
          applicant: h.applicant,
          date: h.date,
          ipc: h.ipc,
          score: h.score,
          familyId: h.familyId,
          snippet: h.snippet,
        })),
      }
    : null

  const lastCorpus = events.find(
    (e) => e.action === 'corpus.ingest' || e.action === 'corpus.publishIndex',
  )

  async function copyJson() {
    const payload = {
      operation: 'commercial_patent_search',
      also: ['cluster_hits', 'get_family', 'search.corpus.ingest', 'search.corpus.publishIndex'],
      query: liveQuery,
      lastResponse: responseView,
      corpus: lastCorpus?.payload ?? null,
      currentIndexTag,
    }
    try {
      await navigator.clipboard.writeText(JSON.stringify(payload, null, 2))
    } catch {
      /* ignore */
    }
  }

  return (
    <div className={`flex h-full flex-col ${compact ? 'pt-3' : ''}`}>
      {!compact ? (
        <div className="border-b border-slate-100 px-4 py-3">
          <p className="shell-page-kicker">Agent · 同引擎形状</p>
          <p className="mt-1 flex items-center gap-2 text-sm font-semibold text-slate-900">
            <Terminal className="h-4 w-4" aria-hidden />
            工具参数面板
          </p>
          <p className="mt-1 text-[11px] leading-relaxed text-slate-500">
            search(query) ≡ commercial_patent_search；getFamily ≡ cluster_hits / get_family；corpus
            ops / sendDownstream 同事件源。无 HTTP，内存态即源。
          </p>
        </div>
      ) : null}

      <div className="flex flex-wrap items-center gap-2 px-4 py-2">
        <Chip tone={lastResponse?.backend === 'sqlite-fts' ? 'ok' : 'mock'}>
          backend: {lastResponse?.backend ?? 'mock'}
        </Chip>
        <Chip tone="neutral">
          index:{' '}
          {lastResponse?.backend === 'sqlite-fts' && lastResponse.indexVersion
            ? lastResponse.indexVersion
            : currentIndexTag}
        </Chip>
        <Button variant="secondary" className="gap-1" onClick={() => void copyJson()}>
          <Copy className="h-3.5 w-3.5" aria-hidden />
          复制为工具参数
        </Button>
      </div>

      <div className="flex-1 space-y-3 overflow-auto px-4 pb-4">
        <section>
          <h3 className="mb-1 text-xs font-semibold uppercase tracking-wide text-slate-500">
            SearchQuery
          </h3>
          <pre className="max-h-48 overflow-auto rounded-lg border border-slate-200 bg-slate-50 p-2 text-[11px] leading-relaxed text-slate-800">
            {JSON.stringify(toolShape, null, 2)}
          </pre>
        </section>

        <section>
          <h3 className="mb-1 text-xs font-semibold uppercase tracking-wide text-slate-500">
            SearchResponse
          </h3>
          {responseView ? (
            <pre className="max-h-56 overflow-auto rounded-lg border border-slate-200 bg-slate-50 p-2 text-[11px] leading-relaxed text-slate-800">
              {JSON.stringify(
                {
                  backend: responseView.backend,
                  tookMs: responseView.tookMs,
                  hitCount: responseView.hits.length,
                  familyCount: responseView.families?.length ?? 0,
                  query: responseView.query,
                  hits: responseView.hits.slice(0, 5),
                  hitsTruncated: responseView.hits.length > 5,
                },
                null,
                2,
              )}
            </pre>
          ) : (
            <p className="text-xs text-slate-500">尚未检索。点「检索」后此处显示实际 backend（默认 mock；旗标接 API 时为 sqlite-fts）。</p>
          )}
        </section>

        <section>
          <h3 className="mb-1 text-xs font-semibold uppercase tracking-wide text-slate-500">
            Corpus ops（最近）
          </h3>
          {lastCorpus?.payload ? (
            <pre className="max-h-36 overflow-auto rounded-lg border border-slate-200 bg-slate-50 p-2 text-[11px] leading-relaxed text-slate-800">
              {JSON.stringify(lastCorpus.payload, null, 2)}
            </pre>
          ) : (
            <p className="text-xs text-slate-500">
              尚无 corpus 事件。到「语料 / 索引」入库或发布。
            </p>
          )}
        </section>

        <section>
          <h3 className="mb-1 text-xs font-semibold uppercase tracking-wide text-slate-500">
            下游深链（策略 A）
          </h3>
          <ul className="space-y-1">
            {DOWNSTREAM_PLACEHOLDERS.map((d) => (
              <li key={d.target} className="text-[11px] text-slate-600">
                <a
                  href={d.href}
                  target="_blank"
                  rel="noreferrer"
                  title={d.href}
                  className="inline-flex items-center gap-1 underline decoration-slate-300 hover:decoration-slate-600"
                >
                  <ExternalLink className="h-3 w-3" aria-hidden />
                  {d.label}
                </a>
                <span className="ml-1 text-slate-400">{DOWNSTREAM_HONESTY}</span>
              </li>
            ))}
          </ul>
        </section>

        <section>
          <h3 className="mb-1 text-xs font-semibold uppercase tracking-wide text-slate-500">
            事件日志
          </h3>
          <ul className="space-y-1.5">
            {events.length === 0 ? (
              <li className="text-xs text-slate-400">暂无事件</li>
            ) : (
              events.slice(0, 12).map((e) => {
                const href =
                  e.action === 'sendDownstream' && typeof e.payload?.href === 'string'
                    ? e.payload.href
                    : null
                return (
                  <li
                    key={e.id}
                    className="rounded-md border border-slate-100 bg-slate-50 px-2 py-1.5 text-[11px] text-slate-700"
                  >
                    <div className="flex items-center justify-between gap-2">
                      <span className="font-medium">{e.tool ?? e.action}</span>
                      <time className="tabular-nums text-slate-400">
                        {new Date(e.at).toLocaleTimeString('zh-CN', { hour12: false })}
                      </time>
                    </div>
                    {e.note ? <p className="mt-0.5 text-slate-500">{e.note}</p> : null}
                    {href ? (
                      <a
                        href={href}
                        target="_blank"
                        rel="noreferrer"
                        className="mt-0.5 inline-flex items-center gap-1 text-slate-600 underline decoration-slate-300"
                      >
                        <ExternalLink className="h-3 w-3" aria-hidden />
                        {href} · {DOWNSTREAM_HONESTY}
                      </a>
                    ) : null}
                  </li>
                )
              })
            )}
          </ul>
        </section>

        <section className="rounded-lg border border-dashed border-slate-200 p-2 text-[11px] text-slate-500">
          <button
            type="button"
            className="focus-ring text-left underline decoration-slate-300 hover:decoration-slate-600"
            onClick={() => {
              const fid = lastResponse?.hits[0]?.familyId
              if (fid) searchActions.getFamily(fid)
            }}
          >
            演示 getFamily / cluster_hits
          </button>
          （取当前首条命中的 familyId）
        </section>
      </div>
    </div>
  )
}
