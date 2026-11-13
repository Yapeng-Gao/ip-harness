import { useEffect } from 'react'
import { createPortal } from 'react-dom'
import { ExternalLink, X } from 'lucide-react'
import { Link } from 'react-router-dom'
import { Button, Chip } from './ui'
import { getCorpus, searchActions, useSearchStore } from '../state/store'

export function DetailDrawer() {
  const store = useSearchStore()
  const { selectedHitId, basketIds, savedIds, hits } = store
  const corpus = getCorpus()
  const hit =
    selectedHitId == null
      ? null
      : hits.find((h) => h.id === selectedHitId) ??
        corpus.find((h) => h.id === selectedHitId) ??
        null

  useEffect(() => {
    if (!hit) return
    function onKey(e: KeyboardEvent) {
      if (e.key === 'Escape') searchActions.closeHit()
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [hit])

  if (!hit) return null

  const siblings = corpus.filter(
    (h) => h.familyId && h.familyId === hit.familyId && h.id !== hit.id,
  )
  const inBasket = basketIds.includes(hit.id)
  const saved = savedIds.includes(hit.id)
  const familyId = hit.familyId

  return createPortal(
    <div className="fixed inset-0 z-40 flex justify-end">
      <button
        type="button"
        className="absolute inset-0 bg-slate-900/30"
        aria-label="关闭详情"
        onClick={() => searchActions.closeHit()}
      />
      <aside
        role="dialog"
        aria-modal="true"
        aria-labelledby="hit-drawer-title"
        className="relative z-10 flex h-full w-full max-w-md flex-col border-l border-slate-200 bg-white shadow-elevated"
      >
        <div className="flex items-start justify-between gap-3 border-b border-slate-100 px-4 py-3">
          <div className="min-w-0">
            <p className="text-xs font-medium text-slate-500">{hit.publicationNumber}</p>
            <h2 id="hit-drawer-title" className="mt-1 text-base font-semibold text-slate-900">
              {hit.title}
            </h2>
          </div>
          <button
            type="button"
            className="focus-ring rounded-md p-1 text-slate-500 hover:bg-slate-100"
            aria-label="关闭"
            onClick={() => searchActions.closeHit()}
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="flex-1 space-y-4 overflow-auto px-4 py-4 text-sm">
          <div className="flex flex-wrap gap-2">
            {hit.legalStatus ? <Chip>{hit.legalStatus}</Chip> : null}
            {hit.country ? <Chip tone="neutral">{hit.country}</Chip> : null}
            {familyId ? <Chip tone="accent">同族 {familyId}</Chip> : null}
            <Chip tone="mock">示意·非真库</Chip>
          </div>

          <dl className="grid grid-cols-[5rem_1fr] gap-x-2 gap-y-2 text-sm">
            <dt className="text-slate-500">申请人</dt>
            <dd>{hit.applicant ?? '—'}</dd>
            <dt className="text-slate-500">发明人</dt>
            <dd>{hit.inventor ?? '—'}</dd>
            <dt className="text-slate-500">公开日</dt>
            <dd>{hit.date ?? '—'}</dd>
            <dt className="text-slate-500">IPC</dt>
            <dd>{(hit.ipc ?? []).join('; ') || '—'}</dd>
            <dt className="text-slate-500">相关度</dt>
            <dd className="tabular-nums">{hit.score}</dd>
          </dl>

          <section>
            <h3 className="text-xs font-semibold uppercase tracking-wide text-slate-500">摘要</h3>
            <p className="mt-1 leading-relaxed text-slate-700">
              {hit.abstract ?? hit.snippet ?? '（无摘要）'}
            </p>
          </section>

          <section>
            <h3 className="text-xs font-semibold uppercase tracking-wide text-slate-500">
              权利要求（摘录）
            </h3>
            <p className="mt-1 leading-relaxed text-slate-700">{hit.claims ?? '—'}</p>
          </section>

          <section>
            <div className="flex items-center justify-between">
              <h3 className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                同族成员
              </h3>
              {familyId ? (
                <Link
                  to={`/families/${familyId}`}
                  className="focus-ring text-xs font-medium text-slate-800 underline decoration-slate-300"
                  onClick={() => searchActions.getFamily(familyId)}
                >
                  同族页
                </Link>
              ) : null}
            </div>
            {siblings.length === 0 ? (
              <p className="mt-1 text-xs text-slate-500">无其他同族成员（样机种子）</p>
            ) : (
              <ul className="mt-2 space-y-1">
                {siblings.map((s) => (
                  <li key={s.id}>
                    <button
                      type="button"
                      className="focus-ring w-full rounded-md border border-slate-100 px-2 py-1.5 text-left text-xs hover:bg-slate-50"
                      onClick={() => searchActions.openHit(s.id)}
                    >
                      <span className="font-medium text-slate-800">{s.publicationNumber}</span>
                      <span className="mt-0.5 block truncate text-slate-500">{s.title}</span>
                    </button>
                  </li>
                ))}
              </ul>
            )}
            <p className="mt-2 inline-flex items-center gap-1 text-[11px] text-slate-400">
              <ExternalLink className="h-3 w-3" aria-hidden />
              外链真库：禁用占位（无真专利库）
            </p>
          </section>
        </div>

        <div className="flex flex-wrap gap-2 border-t border-slate-100 px-4 py-3">
          <Button
            variant={inBasket ? 'secondary' : 'primary'}
            onClick={() =>
              inBasket ? searchActions.removeFromBasket(hit.id) : searchActions.addToBasket(hit.id)
            }
          >
            {inBasket ? '移出工作篮' : '加入工作篮'}
          </Button>
          <Button variant="secondary" onClick={() => searchActions.toggleSaved(hit.id)}>
            {saved ? '取消收藏' : '收藏'}
          </Button>
          <Button variant="secondary" onClick={() => searchActions.closeHit()}>
            关闭
          </Button>
        </div>
      </aside>
    </div>,
    document.body,
  )
}
