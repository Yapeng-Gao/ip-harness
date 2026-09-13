import { Link } from 'react-router-dom'
import { ExternalLink, Send, Trash2 } from 'lucide-react'
import { Button, Card, EmptyState, PageHeader } from '../components/ui'
import { DetailDrawer } from '../components/DetailDrawer'
import { getCorpus, searchActions, useSearchStore } from '../state/store'
import { DOWNSTREAM_PLACEHOLDERS } from '../state/types'

export function SavedPage() {
  const { basketIds, savedIds, events } = useSearchStore()
  const corpus = getCorpus()
  const basket = basketIds
    .map((id) => corpus.find((h) => h.id === id))
    .filter((h): h is NonNullable<typeof h> => !!h)
  const saved = savedIds
    .map((id) => corpus.find((h) => h.id === id))
    .filter((h): h is NonNullable<typeof h> => !!h)
  const empty = basket.length === 0

  return (
    <div>
      <PageHeader
        eyebrow="仅内存 · 不写案"
        title="收藏 / 工作篮"
        desc="收藏夹与工作篮均为样机内存列表；「送 Agent / 下游」只追加事件日志，不 dispatch DomainCommand / PatentCase。"
      />
      <p className="mb-4 text-sm">
        <Link to="/" className="underline decoration-slate-300">
          ← 检索工作台
        </Link>
      </p>

      <Card className="mb-4">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <h2 className="text-sm font-semibold text-slate-900">
            工作篮（{basket.length}）
          </h2>
          <div className="flex flex-wrap gap-2">
            <Button
              className="gap-1"
              disabled={empty}
              onClick={() => searchActions.sendToAgent()}
            >
              <Send className="h-4 w-4" aria-hidden />
              送 Agent
            </Button>
            {DOWNSTREAM_PLACEHOLDERS.map((d) => (
              <Button
                key={d.target}
                variant="secondary"
                disabled={empty}
                onClick={() => searchActions.sendDownstream(d.target)}
              >
                {d.label}
              </Button>
            ))}
          </div>
        </div>
        <p className="mt-2 text-[11px] text-slate-500">
          下游按钮仅写事件 + 占位深链（:5183 FTO / :5184 挖掘 / :5186 全景 / :5178 文档）；不真派发、不建下游壳。
        </p>
        {empty ? (
          <p className="mt-3 text-xs text-slate-500">工作篮为空。从结果或详情加入。</p>
        ) : (
          <ul className="mt-3 space-y-2">
            {basket.map((h) => (
              <li
                key={h.id}
                className="flex items-start justify-between gap-2 rounded-lg border border-slate-100 px-3 py-2"
              >
                <button
                  type="button"
                  className="focus-ring min-w-0 flex-1 text-left"
                  onClick={() => searchActions.openHit(h.id)}
                >
                  <p className="text-xs text-slate-500">{h.publicationNumber}</p>
                  <p className="text-sm font-medium text-slate-900">{h.title}</p>
                </button>
                <button
                  type="button"
                  className="focus-ring rounded p-1 text-slate-400 hover:text-rose-600"
                  aria-label="移出"
                  onClick={() => searchActions.removeFromBasket(h.id)}
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </li>
            ))}
          </ul>
        )}
      </Card>

      <Card className="mb-4">
        <h2 className="text-sm font-semibold text-slate-900">收藏夹（{saved.length}）</h2>
        {saved.length === 0 ? (
          <EmptyState
            title="尚无收藏"
            body="在详情抽屉点「收藏」。仅内存，刷新即失，不写 case。"
          />
        ) : (
          <ul className="mt-3 space-y-2">
            {saved.map((h) => (
              <li key={h.id}>
                <button
                  type="button"
                  className="focus-ring w-full rounded-lg border border-slate-100 px-3 py-2 text-left hover:bg-slate-50"
                  onClick={() => searchActions.openHit(h.id)}
                >
                  <p className="text-xs text-slate-500">{h.publicationNumber}</p>
                  <p className="text-sm font-medium text-slate-900">{h.title}</p>
                </button>
              </li>
            ))}
          </ul>
        )}
      </Card>

      <Card>
        <h2 className="text-sm font-semibold text-slate-900">事件日志（送 Agent / 下游等）</h2>
        <ul className="mt-3 space-y-1.5">
          {events.length === 0 ? (
            <li className="text-xs text-slate-400">暂无</li>
          ) : (
            events.slice(0, 20).map((e) => {
              const href =
                e.action === 'sendDownstream' &&
                typeof e.payload?.href === 'string'
                  ? e.payload.href
                  : null
              return (
                <li
                  key={e.id}
                  className="rounded-md bg-slate-50 px-2 py-1.5 text-[11px] text-slate-700"
                >
                  <span className="font-medium">{e.tool ?? e.action}</span>
                  {e.note ? ` · ${e.note}` : ''}
                  <span className="ml-2 text-slate-400">
                    {new Date(e.at).toLocaleString('zh-CN', { hour12: false })}
                  </span>
                  {href ? (
                    <div className="mt-1">
                      <a
                        href={href}
                        target="_blank"
                        rel="noreferrer"
                        className="inline-flex items-center gap-1 text-slate-600 underline decoration-slate-300 hover:decoration-slate-600"
                      >
                        <ExternalLink className="h-3 w-3" aria-hidden />
                        {href} · 下游未建 / 占位
                      </a>
                    </div>
                  ) : null}
                </li>
              )
            })
          )}
        </ul>
      </Card>

      <DetailDrawer />
    </div>
  )
}
