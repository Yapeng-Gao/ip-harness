import { useEffect, useMemo, useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import { useAssetLibrary } from '../assets/AssetLibraryContext'
import type { AssetCategory } from '../assets/AssetLibraryContext'
import { AssetTree } from '../components/assets/AssetTree'
import { AssetList } from '../components/assets/AssetList'
import { AssetDetail } from '../components/assets/AssetDetail'
import { AssetClassifyPanel } from '../components/assets/AssetClassifyPanel'

/**
 * 资产 · /agent/assets
 * 全局资料库：分类树 + 文件列表 + 详情 / 自动分类建议
 */
export function AssetsPage() {
  const { docs, unclassifiedCount } = useAssetLibrary()
  const [params] = useSearchParams()
  const [category, setCategory] = useState<AssetCategory | 'all'>('all')
  const [query, setQuery] = useState('')
  const [selectedId, setSelectedId] = useState<string | null>(null)

  /** 树里选中的分类与列表筛选共用一份状态 */
  useEffect(() => {
    const cat = params.get('category')
    if (cat) setCategory(cat as AssetCategory)
  }, [params])

  /** 深链 ?doc= 选中 */
  useEffect(() => {
    const doc = params.get('doc')
    if (doc && docs.some((d) => d.id === doc)) setSelectedId(doc)
  }, [params, docs])

  /** 默认选中第一份，避免右侧空着 */
  useEffect(() => {
    if (selectedId && docs.some((d) => d.id === selectedId)) return
    const first = docs[0]
    if (first) setSelectedId(first.id)
  }, [docs, selectedId])

  const pendingClassify = useMemo(
    () => docs.filter((d) => d.category === 'other'),
    [docs],
  )

  return (
    <div
      className="flex min-h-0 flex-1 flex-col overflow-hidden"
      data-testid="assets-page"
    >
      <div
        className="mx-4 mt-3 shrink-0 rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-[12px] text-slate-700"
        data-testid="assets-b8"
        data-branch="b8"
      >
        <strong>B8 · 情报官入口（薄）</strong>
        ：竞对年报/专报走此资产/情报面，不在⑧复盘或③挖掘假装专报。演示壳 · 非真情报通道。
      </div>
      <div className="flex min-h-0 flex-1 overflow-hidden">
      <AssetTree
        selectedId={selectedId}
        onSelect={setSelectedId}
        category={category}
        onCategoryChange={setCategory}
      />

      <div className="flex min-h-0 min-w-0 flex-1 flex-col">
        <div className="flex shrink-0 items-center gap-2 border-b border-slate-200/80 bg-white px-4 py-2">
          <h1 className="text-[14px] font-semibold tracking-tight text-slate-900">资产</h1>
          <span className="text-[11px] text-slate-500">
            {docs.length} 份资料 · 全局库
          </span>
          <span className="ml-auto text-[11px] text-slate-500">
            样机 · 以用户上传为主 · 不解析文件
          </span>
        </div>

        <div className="flex min-h-0 flex-1">
          <AssetList
            category={category}
            query={query}
            onQueryChange={setQuery}
            selectedId={selectedId}
            onSelect={setSelectedId}
          />
          <AssetDetail selectedId={selectedId} />
        </div>

        {unclassifiedCount > 0 && pendingClassify.length > 0 && (
          <AssetClassifyPanel
            docs={pendingClassify}
            onPick={setSelectedId}
          />
        )}
      </div>
    </div>
      </div>
  )
}
