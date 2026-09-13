import { Link } from 'react-router-dom'
import { Send, Trash2 } from 'lucide-react'
import { Button, Card, EmptyState, PageHeader } from '../components/ui'
import { DetailDrawer } from '../components/DetailDrawer'
import { getCorpus, searchActions, useSearchStore } from '../state/store'

export function SavedPage() {
  const { basketIds, savedIds, events } = useSearchStore()
  const corpus = getCorpus()
  const basket = basketIds
    .map((id) => corpus.find((h) => h.id === id))
    .filter((h): h is NonNullable<typeof h> => !!h)
  const saved = savedIds
    .map((id) => corpus.find((h) => h.id === id))
    .filter((h): h is NonNullable<typeof h> => !!h)

  return (
    <div>
      <PageHeader
        eyebrow="仅内存 · 不写案"
        title="收藏 / 工作篮"
        desc="收藏夹与工作篮均为样机内存列表；「送 Agent」只追加事件日志，不 dispatch DomainCommand / PatentCase。"
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
          <Button
            className="gap-1"
            disabled={basket.length === 0}
            onClick={() => searchActions.sendToAgent()}
          >
            <Send className="h-4 w-4" aria-hidden />
            送 Agent
          </Button>
        </div>
        {basket.length === 0 ? (
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
        <h2 className="text-sm font-semibold text-slate-900">事件日志（送 Agent 等）</h2>
        <ul className="mt-3 space-y-1.5">
          {events.length === 0 ? (
            <li className="text-xs text-slate-400">暂无</li>
          ) : (
            events.slice(0, 20).map((e) => (
              <li key={e.id} className="rounded-md bg-slate-50 px-2 py-1.5 text-[11px] text-slate-700">
                <span className="font-medium">{e.tool ?? e.action}</span>
                {e.note ? ` · ${e.note}` : ''}
                <span className="ml-2 text-slate-400">
                  {new Date(e.at).toLocaleString('zh-CN', { hour12: false })}
                </span>
              </li>
            ))
          )}
        </ul>
      </Card>

      <DetailDrawer />
    </div>
  )
}
