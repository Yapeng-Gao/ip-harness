import { Link } from 'react-router-dom'
import { Heart, RefreshCw } from 'lucide-react'
import { Button, Card, Chip, EmptyState, PageHeader } from '../components/ui'
import { inspireActions, useInspireStore } from '../state/store'

export function SparksPage() {
  const { cards, phase, favorites, batchIndex, prompt } = useInspireStore()

  if (phase === 'expanding') {
    return (
      <div>
        <PageHeader
          eyebrow="② 扩召墙"
          title="扩召中…"
          desc="短 delay 模拟扩召耗时；卡片即将由词表模板拼装。"
        />
        <Card className="p-8 text-center text-sm text-slate-600">
          正在拼装灵感卡（种子组合 · 非 LLM）…
        </Card>
      </div>
    )
  }

  if (phase === 'empty' || (phase === 'ready' && cards.length === 0)) {
    return (
      <div>
        <PageHeader
          eyebrow="② 扩召墙"
          title="扩召结果"
          desc="当前无可用卡片。"
        />
        <EmptyState
          title="暂无灵感卡"
          body={
            prompt.trim()
              ? '扩召结果为空，可返回输入台调整技术点后再激发。'
              : '请先在输入台填写问题或技术点并点「激发」。'
          }
          action={
            <Link to="/">
              <Button>回输入台</Button>
            </Link>
          }
        />
      </div>
    )
  }

  if (phase === 'idle' && cards.length === 0) {
    return (
      <div>
        <PageHeader
          eyebrow="② 扩召墙"
          title="扩召结果墙"
          desc="尚未激发。请先在输入台提交技术点。"
        />
        <EmptyState
          title="还没有扩召结果"
          body="激发后这里会出现一组扩召卡片。请先去输入台填写技术点并点「激发」。"
          action={
            <Link to="/">
              <Button>去输入台</Button>
            </Link>
          }
        />
      </div>
    )
  }

  return (
    <div>
      <PageHeader
        eyebrow="② 扩召墙"
        title="语义扩召卡片"
        desc={`本批 ${cards.length} 张（batch ${batchIndex}）。可收藏；「再来一批」换新 id / 不同组合，禁止原地改字。`}
      />

      <div className="mb-4 flex flex-wrap items-center gap-2">
        <Button
          variant="secondary"
          className="inline-flex items-center gap-1.5"
          onClick={() => inspireActions.nextBatch()}
        >
          <RefreshCw className="h-3.5 w-3.5" aria-hidden />
          再来一批
        </Button>
        <Link to="/favorites">
          <Button variant="secondary">查看收藏（{favorites.length}）</Button>
        </Link>
        <Link to="/" className="ml-auto">
          <Button variant="secondary">← 输入台</Button>
        </Link>
      </div>

      <div className="grid gap-3 sm:grid-cols-2">
        {cards.map((c) => {
          const fav = favorites.includes(c.id)
          return (
            <Card key={c.id} className="flex flex-col p-4">
              <div className="flex items-start justify-between gap-2">
                <h2 className="text-sm font-semibold leading-snug text-slate-900">
                  {c.title}
                </h2>
                <Button
                  variant={fav ? 'success' : 'secondary'}
                  className="inline-flex shrink-0 items-center gap-1"
                  onClick={() => inspireActions.toggleFavorite(c.id)}
                  aria-pressed={fav}
                >
                  <Heart
                    className={`h-3.5 w-3.5 ${fav ? 'fill-current' : ''}`}
                    aria-hidden
                  />
                  {fav ? '已藏' : '收藏'}
                </Button>
              </div>
              <p className="mt-2 flex-1 text-sm leading-relaxed text-slate-600">
                {c.hook}
              </p>
              <div className="mt-3 flex flex-wrap items-center gap-1.5">
                {(c.tags ?? []).map((t) => (
                  <Chip key={t} tone="neutral">
                    {t}
                  </Chip>
                ))}
                {c.fakeHit ? (
                  <Chip tone="mock">假 Hit {c.fakeHit}</Chip>
                ) : null}
              </div>
              <p className="mt-2 text-[11px] text-slate-400">{c.id}</p>
            </Card>
          )
        })}
      </div>
    </div>
  )
}
