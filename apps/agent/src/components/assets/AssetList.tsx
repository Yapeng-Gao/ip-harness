import { useMemo, useRef } from 'react'
import { FileText, Image as ImageIcon, Search, Upload } from 'lucide-react'
import {
  ASSET_KIND_LABEL,
  formatAssetSize,
  formatAssetTime,
  useAssetLibrary,
  type AssetCategory,
} from '../../assets/AssetLibraryContext'

type Props = {
  category: AssetCategory | 'all'
  query: string
  onQueryChange: (q: string) => void
  selectedId: string | null
  onSelect: (id: string) => void
}

/**
 * 资产中栏 · 文件列表
 * 真实 <input type="file"> 隐藏 + label 触发，键盘可达。
 */
export function AssetList({
  category,
  query,
  onQueryChange,
  selectedId,
  onSelect,
}: Props) {
  const { docsByCategory, upload } = useAssetLibrary()
  const fileRef = useRef<HTMLInputElement>(null)

  const rows = useMemo(() => {
    const base = docsByCategory(category)
    const q = query.trim().toLowerCase()
    const filtered = q
      ? base.filter((d) => d.name.toLowerCase().includes(q))
      : base
    return filtered
      .slice()
      .sort((a, b) => b.uploadedAt.localeCompare(a.uploadedAt))
  }, [docsByCategory, category, query])

  return (
    <div className="flex min-w-0 flex-1 flex-col bg-white" data-testid="asset-list">
      <div className="flex shrink-0 flex-wrap items-center gap-2 border-b border-slate-200/80 px-4 py-2.5">
        <div className="relative min-w-[10rem] max-w-xs flex-1">
          <Search
            className="pointer-events-none absolute left-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-slate-500"
            strokeWidth={1.75}
            aria-hidden
          />
          <input
            type="search"
            value={query}
            onChange={(e) => onQueryChange(e.target.value)}
            placeholder="搜索文件名"
            aria-label="搜索资料"
            className="ui-input ui-input-sm focus-ring w-full pl-9"
          />
        </div>
        <span className="tabular text-[11px] text-slate-500">{rows.length} 份</span>

        <input
          ref={fileRef}
          type="file"
          multiple
          id="asset-upload-input"
          className="sr-only"
          onChange={(e) => {
            const files = e.target.files
            if (files) {
              for (const f of Array.from(files)) upload({ name: f.name, size: f.size })
            }
            if (fileRef.current) fileRef.current.value = ''
          }}
        />
        <label
          htmlFor="asset-upload-input"
          className="btn-press focus-ring hit-40 ml-auto inline-flex cursor-pointer items-center gap-1.5 rounded-[var(--radius-sm)] bg-slate-900 px-3 text-[12px] font-medium text-white hover:bg-slate-800"
          data-testid="asset-upload-label"
        >
          <Upload className="h-3.5 w-3.5" strokeWidth={1.75} aria-hidden />
          上传资料
        </label>
      </div>

      {rows.length === 0 ? (
        <div className="ui-empty m-auto max-w-sm" data-testid="asset-list-empty">
          <p className="ui-empty-title">这一类还没有资料</p>
          <p className="ui-empty-desc">
            {query ? '换个关键词，或清空搜索。' : '上传一份，或从其他分类移过来。'}
          </p>
        </div>
      ) : (
        <div className="min-h-0 flex-1 overflow-y-auto">
          <ul role="list" aria-label="资料列表" className="divide-y divide-slate-100">
            {rows.map((d) => {
              const selected = selectedId === d.id
              return (
                <li key={d.id}>
                  <button
                    type="button"
                    onClick={() => onSelect(d.id)}
                    aria-current={selected ? 'true' : undefined}
                    className={`focus-ring flex w-full items-center gap-2.5 px-4 py-2 text-left transition-colors duration-150 ${
                      selected ? 'bg-sky-50/80' : 'hover:bg-slate-50'
                    }`}
                    data-testid={`asset-row-${d.id}`}
                  >
                    <span className="shrink-0 text-slate-500" aria-hidden>
                      {d.kind === 'img' ? (
                        <ImageIcon className="h-4 w-4" strokeWidth={1.75} />
                      ) : (
                        <FileText className="h-4 w-4" strokeWidth={1.75} />
                      )}
                    </span>
                    <span className="min-w-0 flex-1">
                      <span className="block truncate text-[12px] font-medium text-slate-900">
                        {d.name}
                      </span>
                      <span className="mt-0.5 flex items-center gap-1.5 text-[11px] text-slate-600">
                        <span className="rounded border border-slate-200 px-1 py-px text-[10px]">
                          {ASSET_KIND_LABEL[d.kind]}
                        </span>
                        <span className="tabular">{formatAssetSize(d.size)}</span>
                        <span className="text-slate-400" aria-hidden>
                          ·
                        </span>
                        <span className="tabular">{formatAssetTime(d.uploadedAt)}</span>
                        {d.source === 'agent' && (
                          <span className="rounded bg-violet-50 px-1 py-px text-[10px] text-violet-800">
                            Agent 产出
                          </span>
                        )}
                      </span>
                    </span>
                  </button>
                </li>
              )
            })}
          </ul>
        </div>
      )}
    </div>
  )
}
