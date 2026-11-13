import { Link } from 'react-router-dom'
import {
  AlertTriangle,
  RefreshCw,
  Cloud,
  Waves,
  CheckCircle2,
  Settings2,
  ArrowRight,
} from 'lucide-react'
import { useApp } from '../context/AppContext'
import { PageHeader } from '../components/PageHeader'
import {
  COMMERCIAL_PROVIDERS,
  LAKE_ROADMAP,
  DATA_SOURCE_MODE_LABELS,
  type DataSourceMode,
} from '../data/dataStrategy'

export function DataStrategy() {
  const { dataSourceMode, setDataSourceMode } = useApp()

  return (
    <div className="p-6 lg:p-8">
      <PageHeader
        title="数据策略"
        context="早期对接商业 API（示意）→ 后期自有数据湖 · 本页均为 mock"
        primary={{ label: '打开组织设置', to: '/settings/org', icon: <Settings2 className="h-4 w-4" aria-hidden /> }}
        secondary={{ label: '返回设置中心', to: '/settings' }}
      />

      {/* Mode toggle */}
      <div className="mb-6 flex flex-wrap items-center gap-3 rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
        <span className="text-xs font-medium text-slate-600">洞察数据源</span>
        <div className="flex rounded-lg bg-slate-100 p-1">
          {(Object.keys(DATA_SOURCE_MODE_LABELS) as DataSourceMode[]).map((m) => (
            <button
              key={m}
              type="button"
              onClick={() => setDataSourceMode(m)}
              className={`rounded-md px-3 py-1.5 text-xs font-medium transition ${
                dataSourceMode === m
                  ? 'bg-white text-slate-800 shadow-sm'
                  : 'text-slate-500 hover:text-slate-700'
              }`}
            >
              {DATA_SOURCE_MODE_LABELS[m]}
            </button>
          ))}
        </div>
        <span className="rounded-full bg-amber-50 px-2.5 py-0.5 text-[11px] font-medium text-amber-800 ring-1 ring-amber-200">
          <AlertTriangle className="mr-1 inline h-3 w-3" />
          当前：{DATA_SOURCE_MODE_LABELS[dataSourceMode]} · 未接真实库
        </span>
      </div>

      {/* Phase 1 */}
      <section className="mb-8">
        <div className="mb-3 flex items-center gap-2">
          <Cloud className="h-4 w-4 text-slate-700" />
          <h2 className="text-sm font-semibold text-slate-900">
            Phase 1 · 商业 API
          </h2>
          <span className="rounded bg-emerald-50 px-1.5 py-0.5 text-[10px] font-medium text-emerald-700">
            当前阶段
          </span>
        </div>
        <div className="grid gap-3 sm:grid-cols-2">
          {COMMERCIAL_PROVIDERS.map((p) => (
            <div
              key={p.id}
              className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm"
            >
              <div className="flex items-start justify-between gap-2">
                <div>
                  <div className="text-sm font-semibold text-slate-900">{p.name}</div>
                  <div className="text-[11px] text-slate-500">{p.vendor}</div>
                </div>
                <span
                  className={`shrink-0 rounded-full px-2 py-0.5 text-[10px] font-medium ${
                    p.status === '已对接示意'
                      ? 'bg-emerald-50 text-emerald-700 ring-1 ring-emerald-200'
                      : p.status === '可配置'
                        ? 'token-info-soft ring-1 ring-[color-mix(in_srgb,var(--color-status-info)_28%,transparent)]'
                        : 'bg-slate-100 text-slate-500'
                  }`}
                >
                  {p.status}
                </span>
              </div>
              <p className="mt-2 text-[11px] leading-relaxed text-slate-600">{p.blurb}</p>
              <div className="mt-3 grid grid-cols-2 gap-2 text-[11px]">
                <div className="rounded-lg bg-slate-50 px-2.5 py-2">
                  <div className="text-slate-400">同步节奏</div>
                  <div className="mt-0.5 font-medium text-slate-700">{p.syncCadence}</div>
                </div>
                <div className="rounded-lg bg-slate-50 px-2.5 py-2">
                  <div className="text-slate-400">最近同步</div>
                  <div className="mt-0.5 inline-flex items-center gap-1 font-medium text-slate-700">
                    <RefreshCw className="h-3 w-3" />
                    {p.lastSync}
                  </div>
                </div>
              </div>
              <div className="mt-2 flex flex-wrap items-center gap-1.5">
                <span className="text-[10px] text-slate-400">覆盖</span>
                {p.coverage.map((c) => (
                  <span
                    key={c}
                    className="rounded bg-slate-100 px-1.5 py-0.5 text-[10px] font-medium text-slate-800"
                  >
                    {c}
                  </span>
                ))}
                <span className="ml-auto text-[10px] text-slate-400">{p.hitCountHint}</span>
              </div>
              <div className="mt-3 flex items-center gap-2">
                <span className="rounded-full border border-slate-200 bg-white px-2 py-0.5 text-[10px] text-slate-600">
                  {p.badge}
                </span>
                {p.status === '可配置' && (
                  <button
                    type="button"
                    className="inline-flex items-center gap-1 text-[11px] text-slate-700 hover:text-slate-900"
                  >
                    <Settings2 className="h-3 w-3" /> 配置示意凭证
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Phase 2 */}
      <section className="mb-8">
        <div className="mb-3 flex items-center gap-2">
          <Waves className="h-4 w-4 text-accent-muted" />
          <h2 className="text-sm font-semibold text-slate-900">
            Phase 2 · 自建数据湖
          </h2>
          <span className="rounded bg-accent-soft px-1.5 py-0.5 text-[10px] font-medium text-accent-muted">
            路线图示意
          </span>
        </div>
        <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
          <div className="mb-6 flex flex-wrap items-center gap-2">
            {LAKE_ROADMAP.map((step, i) => (
              <div key={step.id} className="flex items-center gap-2">
                <div
                  className={`flex h-8 w-8 items-center justify-center rounded-full text-xs font-bold ${
                    step.status === '已完成示意'
                      ? 'bg-emerald-100 text-emerald-700'
                      : step.status === '进行中'
                        ? 'bg-slate-100 text-slate-800'
                        : 'bg-slate-100 text-slate-400'
                  }`}
                >
                  {i + 1}
                </div>
                <div className="text-xs font-medium text-slate-800">{step.name}</div>
                {i < LAKE_ROADMAP.length - 1 && (
                  <ArrowRight className="mx-1 h-3.5 w-3.5 text-slate-300" />
                )}
              </div>
            ))}
          </div>
          <div className="space-y-4">
            {LAKE_ROADMAP.map((step) => (
              <div key={step.id}>
                <div className="mb-1 flex items-center justify-between text-xs">
                  <div className="flex items-center gap-2">
                    <span className="font-medium text-slate-800">{step.name}</span>
                    <span className="text-slate-500">{step.description}</span>
                  </div>
                  <span
                    className={`rounded-full px-2 py-0.5 text-[10px] ${
                      step.status === '进行中'
                        ? 'bg-slate-100 text-slate-800'
                        : step.status === '已完成示意'
                          ? 'bg-emerald-50 text-emerald-700'
                          : 'bg-slate-100 text-slate-500'
                    }`}
                  >
                    {step.status} · {step.progress}%
                  </span>
                </div>
                <div className="h-2 overflow-hidden rounded-full bg-slate-100">
                  <div
                    className={`h-full rounded-full transition-[width] duration-300 ease-out ${
                      step.status === '进行中' ? 'bg-slate-700' : 'bg-slate-300'
                    }`}
                    style={{ width: `${step.progress}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
          <p className="mt-4 text-[11px] text-slate-400">
            路线图：采集 → 清洗 → 法律状态 → 自有向量检索。进度为示意 mock，不代表真实建设状态。
          </p>
        </div>
      </section>

      <div className="flex flex-wrap gap-2">
        {[
          { to: '/insight/tracks', label: '赛道洞察' },
          { to: '/insight/layout', label: '专利布局' },
          { to: '/workbench/research/c2', label: '调研命中（API 徽章）' },
          { to: '/settings', label: '设置中心' },
        ].map((l) => (
          <Link
            key={l.to}
            to={l.to}
            className="rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-xs text-slate-700 hover:border-slate-200 hover:text-slate-900"
          >
            {l.label}
          </Link>
        ))}
      </div>

      <div className="mt-6 flex items-start gap-2 rounded-lg border border-amber-200 bg-amber-50/70 px-3 py-2.5 text-[11px] text-amber-900">
        <CheckCircle2 className="mt-0.5 h-3.5 w-3.5 shrink-0" />
        声明：未对接真实 Questel / PatSnap / IncoPat 接口；覆盖率、同步时间与条数均为演示数据。
      </div>
    </div>
  )
}
