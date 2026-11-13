import { useEffect, useMemo, useState } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import { useAssetLibrary } from '../assets/AssetLibraryContext'
import type { AssetCategory } from '../assets/AssetLibraryContext'
import { AssetTree } from '../components/assets/AssetTree'
import { AssetList } from '../components/assets/AssetList'
import { AssetDetail } from '../components/assets/AssetDetail'
import { AssetClassifyPanel } from '../components/assets/AssetClassifyPanel'
import { useBusinessCases } from '../business/BusinessCaseContext'
import { pickLatestCaseId } from '../business/entryRole'

/**
 * 资产 · /agent/assets
 * 全局资料库：分类树 + 文件列表 + 详情 / 自动分类建议
 * B8：情报官旁路（?branch=b8）→ 情报材料分类 + 本案挂接示意
 */
export function AssetsPage() {
  const { docs, unclassifiedCount } = useAssetLibrary()
  const { cases, getProgress, getProcessLogs } = useBusinessCases()
  const [params] = useSearchParams()
  const branch = (params.get('branch') || '').toLowerCase()
  const isB8 = branch === 'b8'
  const [category, setCategory] = useState<AssetCategory | 'all'>(
    isB8 ? 'intel' : 'all',
  )
  const [query, setQuery] = useState('')
  const [selectedId, setSelectedId] = useState<string | null>(null)

  const getLogAt = useMemo(
    () => (id: string) => {
      const logs = getProcessLogs(id)
      if (logs.length === 0) return undefined
      return logs.reduce((max, l) => (l.at > max ? l.at : max), logs[0]!.at)
    },
    [getProcessLogs],
  )
  const latestCaseId = useMemo(
    () => pickLatestCaseId(cases, (id) => getProgress(id).updatedAt, getLogAt),
    [cases, getProgress, getLogAt],
  )

  useEffect(() => {
    const cat = params.get('category')
    if (cat) setCategory(cat as AssetCategory)
    else if (isB8) setCategory('intel')
  }, [params, isB8])

  useEffect(() => {
    const doc = params.get('doc')
    if (doc && docs.some((d) => d.id === doc)) setSelectedId(doc)
  }, [params, docs])

  useEffect(() => {
    if (selectedId && docs.some((d) => d.id === selectedId)) return
    const pool =
      category === 'all' ? docs : docs.filter((d) => d.category === category)
    const first = pool[0] ?? docs[0]
    if (first) setSelectedId(first.id)
  }, [docs, selectedId, category])

  const pendingClassify = useMemo(
    () => docs.filter((d) => d.category === 'other'),
    [docs],
  )
  const intelCount = useMemo(
    () => docs.filter((d) => d.category === 'intel').length,
    [docs],
  )

  return (
    <div
      className="flex min-h-0 flex-1 flex-col overflow-hidden"
      data-testid="assets-page"
      data-b8={isB8 ? '1' : '0'}
    >
      {isB8 ? (
        <div
          className="mx-4 mt-3 shrink-0 rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-[12px] text-slate-700"
          data-testid="assets-b8"
          data-branch="b8"
        >
          <p>
            <strong>情报官入口（示意）</strong>
            ：竞对年报/专报走此资产/情报面，不在转化复盘或挖掘点包假装专报。
          </p>
          <ul
            className="mt-1.5 list-disc space-y-0.5 pl-4 text-[11px] text-slate-600"
            data-testid="assets-b8-must"
          >
            <li>
              须看见：左侧「情报材料」分类（现 {intelCount} 份示意）
            </li>
            <li>禁：用转化复盘或挖掘点包冒充竞对专报</li>
            <li>诚实：非真情报检索通道 · 上传不解析</li>
          </ul>
          <div className="mt-2 flex flex-wrap items-center gap-2" data-testid="assets-b8-case-link">
            {latestCaseId ? (
              <Link
                to={`/agent/cases/${latestCaseId}`}
                className="btn-press focus-ring rounded-md border border-slate-200 bg-white px-2 py-1 text-[11px] font-medium text-slate-800"
              >
                与本案挂接（演示）· 回公司
              </Link>
            ) : (
              <Link
                to="/agent/cases/new"
                className="btn-press focus-ring rounded-md border border-slate-200 bg-white px-2 py-1 text-[11px] font-medium text-slate-800"
              >
                先开案子再挂接
              </Link>
            )}
            <button
              type="button"
              onClick={() => setCategory('intel')}
              className="btn-press focus-ring rounded-md px-2 py-1 text-[11px] text-slate-600 underline"
              data-testid="assets-b8-focus-intel"
            >
              只看情报材料
            </button>
          </div>
        </div>
      ) : (
        <div
          className="mx-4 mt-3 shrink-0 rounded-lg border border-slate-200/80 bg-white px-3 py-2 text-[12px] text-slate-600"
          data-testid="assets-library-intro"
        >
          <p>
            <strong className="text-slate-800">资料库</strong>
            ：本案与全局稿件、附件、情报材料集中存放。日常办事仍走大厅 → 公司案 → 部台；此处不另开第二套办理首页。
          </p>
        </div>
      )}
      <div className="flex min-h-0 flex-1 overflow-hidden">
        <AssetTree
          selectedId={selectedId}
          onSelect={setSelectedId}
          category={category}
          onCategoryChange={setCategory}
        />

        <div className="flex min-h-0 min-w-0 flex-1 flex-col">
          <div className="flex shrink-0 items-center gap-2 border-b border-slate-200/80 bg-white px-4 py-2">
            <h1 className="text-[14px] font-semibold tracking-tight text-slate-900">
              资产
            </h1>
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
