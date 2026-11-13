import { useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { ExternalLink, FileText, Pickaxe } from 'lucide-react'
import { Button, Card, Chip, EmptyState, PageHeader } from '../components/ui'
import { inspireActions, useInspireStore } from '../state/store'
import {
  DOC_HARNESS_DEEPLINK,
  MINING_DEEPLINK,
  type SendKind,
} from '../state/types'

export function SendPage() {
  const { favorites, cardCatalog, intents } = useInspireStore()
  const [selected, setSelected] = useState<string[]>([])
  const [note, setNote] = useState('')

  const rows = useMemo(
    () =>
      favorites.map((id) => {
        const c = cardCatalog[id]
        return {
          id,
          title: c?.title ?? `收藏卡 ${id}`,
          hook: c?.hook ?? '（正文暂不可用）',
        }
      }),
    [favorites, cardCatalog],
  )

  function toggle(id: string) {
    setSelected((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id],
    )
  }

  function selectAll() {
    setSelected([...favorites])
  }

  function clearSel() {
    setSelected([])
  }

  function send(kind: SendKind) {
    const ok = inspireActions.sendIntent(kind, selected, note)
    if (ok) {
      const url = kind === '送挖掘' ? MINING_DEEPLINK : DOC_HARNESS_DEEPLINK
      window.open(url, '_blank', 'noopener,noreferrer')
    }
  }

  return (
    <div>
      <PageHeader
        eyebrow="④ 送交底 / 送挖掘"
        title="送出占位"
        desc="多选收藏卡后记录 SendIntent 事件（内存）。深链仅只读打开 doc-harness / mining。禁止「已创建交底案」文案；不写 PatentCase / 不打分建案。"
      />

      <div className="mb-4 flex flex-wrap items-center gap-2">
        <Button variant="secondary" disabled={favorites.length === 0} onClick={selectAll}>
          全选
        </Button>
        <Button variant="secondary" disabled={selected.length === 0} onClick={clearSel}>
          清空勾选
        </Button>
        {favorites.length === 0 ? (
          <Chip tone="danger">无收藏 · 送出已禁用</Chip>
        ) : selected.length === 0 ? (
          <Chip tone="warn">请勾选收藏卡</Chip>
        ) : (
          <Chip tone="ok">已选 {selected.length}</Chip>
        )}
        <Link to="/favorites" className="ml-auto">
          <Button variant="secondary">← 收藏</Button>
        </Link>
      </div>

      {favorites.length === 0 ? (
        <EmptyState
          title="没有可送出的收藏"
          body="请先在扩召墙收藏至少一张卡片。"
          action={
            <Link to="/sparks">
              <Button>去扩召墙</Button>
            </Link>
          }
        />
      ) : (
        <div className="grid gap-4 lg:grid-cols-2">
          <Card className="p-4">
            <h2 className="text-sm font-semibold text-slate-900">选择收藏卡</h2>
            <ul className="mt-3 space-y-2">
              {rows.map((c) => {
                const checked = selected.includes(c.id)
                return (
                  <li key={c.id}>
                    <label
                      className={`flex cursor-pointer gap-3 rounded-lg border px-3 py-2 text-sm ${
                        checked
                          ? 'border-[var(--color-accent)]/30 bg-[var(--color-accent-soft)]'
                          : 'border-slate-200 hover:bg-slate-50'
                      }`}
                    >
                      <input
                        type="checkbox"
                        className="mt-1"
                        checked={checked}
                        onChange={() => toggle(c.id)}
                      />
                      <span className="min-w-0">
                        <span className="font-medium text-slate-800">{c.title}</span>
                        <span className="mt-0.5 block text-xs text-slate-500 line-clamp-2">
                          {c.hook}
                        </span>
                      </span>
                    </label>
                  </li>
                )
              })}
            </ul>
            <label className="mt-4 block">
              <span className="text-xs font-medium text-slate-600">备注（可选）</span>
              <textarea
                className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2 text-sm"
                rows={2}
                value={note}
                onChange={(e) => setNote(e.target.value)}
                placeholder="占位说明 · 不会创建交底案"
              />
            </label>
            <div className="mt-4 flex flex-wrap gap-2">
              <Button
                className="inline-flex items-center gap-1.5"
                disabled={selected.length === 0}
                onClick={() => send('送交底')}
              >
                <FileText className="h-3.5 w-3.5" aria-hidden />
                送交底
              </Button>
              <Button
                variant="secondary"
                className="inline-flex items-center gap-1.5"
                disabled={selected.length === 0}
                onClick={() => send('送挖掘')}
              >
                <Pickaxe className="h-3.5 w-3.5" aria-hidden />
                送挖掘
              </Button>
            </div>
            <p className="mt-3 text-xs leading-relaxed text-slate-500">
              点击后写入 intents 并 toast；同时深链打开占位页。文案仅「占位事件」，绝不声称已创建交底案。
            </p>
          </Card>

          <Card className="p-4">
            <h2 className="text-sm font-semibold text-slate-900">深链邻居</h2>
            <ul className="mt-3 space-y-2 text-sm">
              <li>
                <a
                  href={DOC_HARNESS_DEEPLINK}
                  target="_blank"
                  rel="noopener noreferrer"
                  title={DOC_HARNESS_DEEPLINK}
                  className="inline-flex items-center gap-1.5 font-medium text-slate-800 underline decoration-slate-300 underline-offset-2"
                >
                  文档
                  <ExternalLink className="h-3.5 w-3.5" aria-hidden />
                </a>
                <p className="mt-0.5 text-xs text-slate-500">送交底占位 · 不写 PatentCase</p>
              </li>
              <li>
                <a
                  href={MINING_DEEPLINK}
                  target="_blank"
                  rel="noopener noreferrer"
                  title={MINING_DEEPLINK}
                  className="inline-flex items-center gap-1.5 font-medium text-slate-800 underline decoration-slate-300 underline-offset-2"
                >
                  挖掘
                  <ExternalLink className="h-3.5 w-3.5" aria-hidden />
                </a>
                <p className="mt-0.5 text-xs text-slate-500">送挖掘占位 · 不打分建案</p>
              </li>
            </ul>

            <h3 className="mt-6 text-sm font-semibold text-slate-900">
              近期 intents（{intents.length}）
            </h3>
            {intents.length === 0 ? (
              <p className="mt-2 text-xs text-slate-500">尚无送出事件。</p>
            ) : (
              <ul className="mt-2 max-h-64 space-y-2 overflow-auto">
                {intents.map((it) => (
                  <li
                    key={it.id}
                    className="rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-xs text-slate-700"
                  >
                    <div className="flex flex-wrap items-center gap-1.5">
                      <Chip tone="mock">{it.kind}</Chip>
                      <span className="tabular-nums text-slate-400">{it.at}</span>
                    </div>
                    <p className="mt-1">{it.note}</p>
                    <p className="mt-0.5 text-slate-500">
                      cards: {it.cardIds.join(', ')}
                    </p>
                  </li>
                ))}
              </ul>
            )}
          </Card>
        </div>
      )}
    </div>
  )
}
