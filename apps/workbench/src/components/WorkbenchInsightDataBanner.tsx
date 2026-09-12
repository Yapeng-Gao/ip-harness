/**
 * Workbench 本地替身：数据策略链经 AppLink（跨口由 resolveAppHref 解析）。
 */
import { Database, AlertTriangle, RefreshCw, Cloud } from 'lucide-react'
import { useApp } from '@shared/context/AppContext'
import {
  COMMERCIAL_PROVIDERS,
  DATA_SOURCE_MODE_LABELS,
} from '@shared/data/dataStrategy'
import { AppLink } from '@shared/components/AppLink'

export function WorkbenchInsightDataBanner({ compact }: { compact?: boolean }) {
  const { dataSourceMode, setDataSourceMode } = useApp()
  const active = COMMERCIAL_PROVIDERS.filter((p) => p.status === '已对接示意')

  if (compact) {
    return (
      <div className="mb-4 flex flex-wrap items-center gap-2 rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs">
        <Cloud className="h-3.5 w-3.5 text-slate-700" />
        <span className="font-medium text-slate-700">
          数据源 = {DATA_SOURCE_MODE_LABELS[dataSourceMode]}
        </span>
        <span className="rounded-full bg-amber-50 px-2 py-0.5 font-medium text-amber-800 ring-1 ring-amber-200">
          <AlertTriangle className="mr-0.5 inline h-3 w-3" />
          示意 · 未接真实库
        </span>
        <span className="text-slate-500">最近同步 {active[0]?.lastSync ?? '—'}</span>
        <AppLink to="/settings/data" className="ml-auto text-slate-700 hover:text-slate-900">
          数据策略
        </AppLink>
      </div>
    )
  }

  return (
    <div className="mb-5 flat-card p-3">
      <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
        <div className="flex flex-wrap items-center gap-2">
          <Database className="h-4 w-4 text-slate-700" />
          <h3 className="text-sm font-medium text-slate-800">数据源</h3>
          <div className="flex rounded-lg bg-slate-100 p-0.5">
            <button
              type="button"
              onClick={() => setDataSourceMode('commercial_api')}
              className={`rounded-md px-2 py-0.5 text-xs font-medium ${
                dataSourceMode === 'commercial_api'
                  ? 'bg-white text-slate-800 shadow-sm'
                  : 'text-slate-500'
              }`}
            >
              商业API（当前）
            </button>
            <button
              type="button"
              onClick={() => setDataSourceMode('own_lake')}
              className={`rounded-md px-2 py-0.5 text-xs font-medium ${
                dataSourceMode === 'own_lake'
                  ? 'bg-white text-accent-muted shadow-sm'
                  : 'text-slate-500'
              }`}
            >
              自建数据湖（规划）
            </button>
          </div>
          <span className="inline-flex items-center gap-1 rounded-full bg-amber-50 px-2 py-0.5 text-xs font-medium text-amber-800 ring-1 ring-amber-200">
            <AlertTriangle className="h-3 w-3" />
            未接真实专利库
          </span>
        </div>
        <AppLink to="/settings/data" className="text-xs text-slate-700 hover:text-slate-900">
          数据策略页 →
        </AppLink>
      </div>
      {dataSourceMode === 'commercial_api' ? (
        <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-4">
          {COMMERCIAL_PROVIDERS.map((s) => (
            <div
              key={s.id}
              className="rounded-lg border border-slate-100 bg-slate-50 px-3 py-2"
            >
              <div className="flex items-center justify-between gap-1">
                <div className="truncate text-xs font-medium text-slate-800">{s.name}</div>
                <span className="shrink-0 text-xs text-slate-400">{s.status}</span>
              </div>
              <div className="mt-1.5 flex flex-wrap gap-1">
                {s.coverage.map((c) => (
                  <span
                    key={c}
                    className="rounded bg-white px-1 py-0.5 text-xs text-slate-800 ring-1 ring-slate-200"
                  >
                    {c}
                  </span>
                ))}
              </div>
              <div className="mt-1 flex items-center justify-between text-xs text-slate-500">
                <span>{s.syncCadence.split('·')[0]}</span>
                <span className="inline-flex items-center gap-0.5">
                  <RefreshCw className="h-2.5 w-2.5" />
                  {s.lastSync}
                </span>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <p className="rounded-lg bg-slate-50 px-3 py-2 text-xs text-slate-700">
          自建数据湖尚在路线图阶段（采集→清洗→法律状态→向量检索）。洞察页仍回退使用商业
          API 示意缓存。详见{' '}
          <AppLink to="/settings/data" className="underline">
            数据策略
          </AppLink>
          。
        </p>
      )}
    </div>
  )
}
