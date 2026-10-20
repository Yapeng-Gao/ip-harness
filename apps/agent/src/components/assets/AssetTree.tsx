import { useMemo, useState } from 'react'
import { ChevronDown, ChevronRight, FolderOpen } from 'lucide-react'
import {
  ASSET_CATEGORIES,
  useAssetLibrary,
  type AssetCategory,
  type AssetDoc,
} from '../../assets/AssetLibraryContext'

/** 把一类文件分到该类的二级目录；分不进的落到最后一个目录 */
function folderBuckets(
  categoryId: AssetCategory,
  docs: AssetDoc[],
): Array<{ folder: string; files: AssetDoc[] }> {
  const cat = ASSET_CATEGORIES.find((c) => c.id === categoryId)
  const folders = cat?.folders ?? ['其他']
  const buckets = folders.map((folder) => ({ folder, files: [] as AssetDoc[] }))
  docs.forEach((d, i) => {
    const idx = folders.length > 1 ? i % folders.length : 0
    buckets[idx].files.push(d)
  })
  return buckets
}

type Props = {
  selectedId: string | null
  onSelect: (id: string) => void
  category: AssetCategory | 'all'
  onCategoryChange: (c: AssetCategory | 'all') => void
}

/**
 * 资产左栏 · 分类文件树
 * 结构参照 landscape/TreePage 的递归树：paddingLeft = 4 + depth*14，aria-expanded。
 */
export function AssetTree({ selectedId, onSelect, category, onCategoryChange }: Props) {
  const { docs, countByCategory } = useAssetLibrary()
  const [expanded, setExpanded] = useState<Set<string>>(() => new Set(['case', 'disclosure']))

  const total = docs.length

  const toggle = (id: string) => {
    setExpanded((prev) => {
      const next = new Set(prev)
      if (next.has(id)) next.delete(id)
      else next.add(id)
      return next
    })
  }

  const docsInCategory = useMemo(() => {
    const map = new Map<string, typeof docs>()
    for (const c of ASSET_CATEGORIES) map.set(c.id, [])
    for (const d of docs) {
      const arr = map.get(d.category)
      if (arr) arr.push(d)
      else map.get('other')?.push(d)
    }
    for (const arr of map.values()) {
      arr.sort((a, b) => b.uploadedAt.localeCompare(a.uploadedAt))
    }
    return map
  }, [docs])

  return (
    <aside
      className="flex w-[min(16rem,40vw)] min-w-[13rem] max-w-[18rem] shrink-0 flex-col border-r border-slate-200/90 bg-[#f5f5f7]"
      aria-label="资产分类"
      data-testid="asset-tree"
    >
      <div className="flex h-10 shrink-0 items-center gap-1.5 px-2.5">
        <FolderOpen className="h-3.5 w-3.5 text-slate-500" strokeWidth={1.75} aria-hidden />
        <span className="text-[12px] font-semibold text-slate-800">资料分类</span>
        <button
          type="button"
          onClick={() => onCategoryChange('all')}
          aria-pressed={category === 'all'}
          className={`focus-ring ml-auto rounded-[var(--radius-sm)] px-1.5 py-0.5 text-[11px] ${
            category === 'all' ? 'bg-white font-medium text-slate-900' : 'text-slate-600 hover:bg-white/70'
          }`}
        >
          全部 <span className="tabular">{total}</span>
        </button>
      </div>

      <div className="min-h-0 flex-1 overflow-y-auto px-1.5 pb-2">
        <ul role="tree" aria-label="分类树">
          {ASSET_CATEGORIES.map((cat) => {
            const open = expanded.has(cat.id)
            const count = countByCategory(cat.id)
            const docsHere = docsInCategory.get(cat.id) ?? []
            return (
              <li key={cat.id} role="treeitem" aria-expanded={open}>
                <div className="flex items-center">
                  <button
                    type="button"
                    onClick={() => toggle(cat.id)}
                    className="focus-ring flex h-7 w-6 shrink-0 items-center justify-center rounded text-slate-500 hover:bg-white/80 hover:text-slate-800"
                    aria-label={open ? `收起 ${cat.label}` : `展开 ${cat.label}`}
                  >
                    {open ? (
                      <ChevronDown className="h-3.5 w-3.5" strokeWidth={1.75} aria-hidden />
                    ) : (
                      <ChevronRight className="h-3.5 w-3.5" strokeWidth={1.75} aria-hidden />
                    )}
                  </button>
                  <button
                    type="button"
                    onClick={() => onCategoryChange(cat.id)}
                    aria-pressed={category === cat.id}
                    className={`focus-ring flex min-h-7 min-w-0 flex-1 items-center gap-1.5 rounded-[var(--radius-sm)] px-1.5 text-left text-[12px] ${
                      category === cat.id
                        ? 'bg-white font-medium text-slate-900'
                        : 'text-slate-700 hover:bg-white/70'
                    }`}
                    data-testid={`asset-cat-${cat.id}`}
                  >
                    <span className="min-w-0 flex-1 truncate">{cat.label}</span>
                    <span className="tabular shrink-0 text-[11px] text-slate-500">{count}</span>
                  </button>
                </div>

                {open && (
                  <ul role="group" className="mb-1">
                    {folderBuckets(cat.id, docsHere).map(({ folder, files }) => (
                      <li key={folder} role="treeitem" aria-selected={false}>
                        <span
                          className="flex min-h-6 items-center gap-1.5 rounded-[var(--radius-sm)] pr-1.5 text-[11px] text-slate-600"
                          style={{ paddingLeft: 4 + 14 * 2 }}
                        >
                          <span className="min-w-0 flex-1 truncate">{folder}</span>
                          <span className="tabular shrink-0 text-[10px] text-slate-500">
                            {files.length}
                          </span>
                        </span>
                      </li>
                    ))}
                    {docsHere.slice(0, 4).map((d) => (
                      <li key={d.id} role="treeitem" aria-selected={selectedId === d.id}>
                        <button
                          type="button"
                          onClick={() => onSelect(d.id)}
                          aria-current={selectedId === d.id ? 'true' : undefined}
                          className={`focus-ring flex min-h-7 w-full items-center rounded-[var(--radius-sm)] pr-1.5 text-left text-[11px] ${
                            selectedId === d.id
                              ? 'bg-sky-50 font-medium text-sky-900'
                              : 'text-slate-700 hover:bg-white/80'
                          }`}
                          style={{ paddingLeft: 4 + 14 * 3 }}
                          data-testid={`asset-tree-doc-${d.id}`}
                        >
                          <span className="min-w-0 flex-1 truncate">{d.name}</span>
                        </button>
                      </li>
                    ))}
                    {docsHere.length > 4 && (
                      <li role="treeitem" aria-selected={false}>
                        <span
                          className="flex min-h-6 items-center text-[11px] text-slate-500"
                          style={{ paddingLeft: 4 + 14 * 3 }}
                        >
                          … 另有 {docsHere.length - 4} 个
                        </span>
                      </li>
                    )}
                  </ul>
                )}
              </li>
            )
          })}
        </ul>
      </div>
    </aside>
  )
}
