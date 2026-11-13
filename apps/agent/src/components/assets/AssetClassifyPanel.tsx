import { useMemo } from 'react'
import { Sparkles } from 'lucide-react'
import {
  ASSET_CATEGORIES,
  suggestCategory,
  useAssetLibrary,
  type AssetDoc,
} from '../../assets/AssetLibraryContext'

type Props = {
  docs: AssetDoc[]
  onPick: (id: string) => void
}

/**
 * 资产 · 自动分类建议（mock）
 * 按文件名的关键字规则给建议；人一键采纳。不是 NLP。
 */
export function AssetClassifyPanel({ docs, onPick }: Props) {
  const { assignCategory } = useAssetLibrary()

  const rows = useMemo(
    () =>
      docs.slice(0, 6).map((d) => {
        const suggested = suggestCategory(d.name)
        const label =
          ASSET_CATEGORIES.find((c) => c.id === suggested)?.label ?? '其他'
        return { doc: d, suggested, label }
      }),
    [docs],
  )

  return (
    <section
      className="shrink-0 border-t border-slate-200/80 bg-amber-50/40 px-4 py-2"
      aria-labelledby="asset-classify-title"
      data-testid="asset-classify-panel"
    >
      <div className="flex items-center gap-1.5">
        <Sparkles className="h-3.5 w-3.5 text-amber-700" strokeWidth={1.75} aria-hidden />
        <h2 id="asset-classify-title" className="text-[12px] font-semibold text-amber-950">
          待归类 · {docs.length}
        </h2>
        <span className="text-[11px] text-amber-800/80">
          按文件名给建议，采纳后移到对应分类
        </span>
      </div>
      <ul className="mt-1 flex flex-wrap gap-1.5">
        {rows.map(({ doc, suggested, label }) => (
          <li
            key={doc.id}
            className="flex items-center gap-1 rounded-full border border-amber-200 bg-white px-2 py-0.5 text-[11px]"
          >
            <button
              type="button"
              onClick={() => onPick(doc.id)}
              className="focus-ring max-w-[12rem] truncate font-medium text-slate-800 hover:underline"
            >
              {doc.name}
            </button>
            <span className="text-slate-500" aria-hidden>
              →
            </span>
            <button
              type="button"
              onClick={() => assignCategory(doc.id, suggested)}
              className="focus-ring rounded px-1 py-px font-medium text-sky-800 hover:bg-sky-50"
              aria-label={`把 ${doc.name} 归到 ${label}`}
            >
              {label}
            </button>
          </li>
        ))}
      </ul>
    </section>
  )
}
