import { Link } from 'react-router-dom'
import { HeartOff } from 'lucide-react'
import { Button, Card, Chip, EmptyState, PageHeader } from '../components/ui'
import { inspireActions, useInspireStore } from '../state/store'

export function FavoritesPage() {
  const { favorites, cardCatalog } = useInspireStore()
  const rows = favorites.map((id) => {
    const c = cardCatalog[id]
    return (
      c ?? {
        id,
        title: `已收藏卡片`,
        hook: '正文暂不可用。',
        tags: ['收藏'],
      }
    )
  })

  return (
    <div>
      <PageHeader
        eyebrow="③ 收藏"
        title="收藏夹"
        desc="管理已收藏灵感卡；空态引导回扩召墙。送出前请到「送交底/挖掘」多选。"
      />

      <div className="mb-4 flex flex-wrap items-center gap-2">
        <Chip tone="accent">共 {favorites.length} 张</Chip>
        <Link to="/sparks">
          <Button variant="secondary">← 扩召墙</Button>
        </Link>
        <Link to="/send" className="ml-auto">
          <Button disabled={favorites.length === 0}>去送出 →</Button>
        </Link>
      </div>

      {rows.length === 0 ? (
        <EmptyState
          title="收藏为空"
          body="在扩召墙上点「收藏」后再回到这里。主路径：扩召 → 收藏 → 送出。"
          action={
            <Link to="/sparks">
              <Button>去扩召墙</Button>
            </Link>
          }
        />
      ) : (
        <ul className="space-y-3">
          {rows.map((c) => (
            <li key={c.id}>
              <Card className="flex flex-wrap items-start justify-between gap-3 p-4">
                <div className="min-w-0 flex-1">
                  <h2 className="text-sm font-semibold text-slate-900">{c.title}</h2>
                  <p className="mt-1 text-sm leading-relaxed text-slate-600">{c.hook}</p>
                  <div className="mt-2 flex flex-wrap gap-1.5">
                    {(c.tags ?? []).map((t) => (
                      <Chip key={t}>{t}</Chip>
                    ))}
                    {'fakeHit' in c && c.fakeHit ? (
                      <Chip tone="mock">假 Hit {c.fakeHit}</Chip>
                    ) : null}
                    <Chip tone="mock">{c.id}</Chip>
                  </div>
                </div>
                <Button
                  variant="secondary"
                  className="inline-flex items-center gap-1"
                  onClick={() => inspireActions.toggleFavorite(c.id)}
                >
                  <HeartOff className="h-3.5 w-3.5" aria-hidden />
                  取消收藏
                </Button>
              </Card>
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}
