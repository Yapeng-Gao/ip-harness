import { useEffect, useMemo, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { ExternalLink, Link2 } from 'lucide-react'
import { Button, Card, Chip, EmptyState, PageHeader, formatShanghai } from '../components/ui'
import { figureActions, useFigureStore } from '../state/store'
import { DOC_HARNESS_DEEPLINK, FAKE_DOCS } from '../state/types'

export function AttachPage() {
  const { assetId } = useParams()
  const { assets, attachEvents } = useFigureStore()
  const asset = assetId ? assets[assetId] : undefined
  const [docId, setDocId] = useState(FAKE_DOCS[0]!.docId)
  const doc = useMemo(() => FAKE_DOCS.find((d) => d.docId === docId) ?? FAKE_DOCS[0]!, [docId])
  const [chapterId, setChapterId] = useState(doc.chapters[0]!.id)
  const [openDoc, setOpenDoc] = useState(true)

  useEffect(() => {
    if (assetId) figureActions.setActiveAsset(assetId)
  }, [assetId])

  useEffect(() => {
    setChapterId(doc.chapters[0]!.id)
  }, [doc])

  if (!assetId || !asset) {
    return (
      <EmptyState
        title="资产不存在"
        body="请从资产列表进入。"
        action={
          <Link to="/">
            <Button>回列表</Button>
          </Link>
        }
      />
    )
  }

  const events = attachEvents.filter((e) => e.assetId === asset.id)

  function onAttach() {
    const chapter = doc.chapters.find((c) => c.id === chapterId) ?? doc.chapters[0]!
    figureActions.attachChapter(asset!.id, {
      docId: doc.docId,
      docTitle: doc.docTitle,
      chapterId: chapter.id,
      chapterTitle: chapter.title,
    })
    if (openDoc) {
      window.open(DOC_HARNESS_DEEPLINK, '_blank', 'noopener,noreferrer')
    }
  }

  return (
    <div>
      <PageHeader
        eyebrow="⑤ 挂文档章"
        title="挂到假文档 / 章节"
        desc="确认后 toast + 事件日志「已挂章（样机）」。可选打开 doc-harness :5178。不调用 DomainCommand、不写 PatentCase。"
      />
      <Card className="p-5">
        <p className="mb-3 text-sm text-slate-600">
          资产 <span className="font-medium text-slate-900">{asset.title}</span>{' '}
          <Chip tone="neutral">rev {asset.rev}</Chip>
        </p>
        <div className="grid gap-3 sm:grid-cols-2">
          <label className="block">
            <span className="text-xs font-medium text-slate-500">假 Document</span>
            <select
              className="mt-1 w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm focus-ring"
              value={docId}
              onChange={(e) => setDocId(e.target.value)}
            >
              {FAKE_DOCS.map((d) => (
                <option key={d.docId} value={d.docId}>
                  {d.docTitle}
                </option>
              ))}
            </select>
          </label>
          <label className="block">
            <span className="text-xs font-medium text-slate-500">假章节</span>
            <select
              className="mt-1 w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm focus-ring"
              value={chapterId}
              onChange={(e) => setChapterId(e.target.value)}
            >
              {doc.chapters.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.title}
                </option>
              ))}
            </select>
          </label>
        </div>
        <label className="mt-3 flex items-center gap-2 text-sm text-slate-600">
          <input
            type="checkbox"
            checked={openDoc}
            onChange={(e) => setOpenDoc(e.target.checked)}
          />
          确认后 window.open doc-harness（{DOC_HARNESS_DEEPLINK}）
        </label>
        <div className="mt-4 flex flex-wrap gap-2">
          <Button onClick={onAttach} className="inline-flex items-center gap-1.5">
            <Link2 className="h-3.5 w-3.5" aria-hidden />
            确认挂章（样机）
          </Button>
          <a href={DOC_HARNESS_DEEPLINK} target="_blank" rel="noreferrer">
            <Button variant="secondary" className="inline-flex items-center gap-1.5">
              <ExternalLink className="h-3.5 w-3.5" aria-hidden />
              仅打开文档壳
            </Button>
          </a>
          <Link to={`/edit/${asset.id}`}>
            <Button variant="secondary">回画布</Button>
          </Link>
        </div>
      </Card>

      <h2 className="mt-6 mb-2 text-sm font-semibold text-slate-900">事件日志</h2>
      {events.length === 0 ? (
        <p className="text-sm text-slate-500">尚无挂章事件。确认后会出现「已挂章（样机）」。</p>
      ) : (
        <ul className="space-y-2">
          {events.map((ev) => (
            <li
              key={ev.id}
              className="rounded-lg border border-emerald-200 bg-emerald-50 px-3 py-2 text-sm text-emerald-900"
            >
              <p className="font-medium">{ev.message}</p>
              <p className="mt-0.5 text-[11px] text-emerald-700/80">
                {formatShanghai(ev.at)}（上海） · {ev.docId} / {ev.chapterId}
              </p>
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}
