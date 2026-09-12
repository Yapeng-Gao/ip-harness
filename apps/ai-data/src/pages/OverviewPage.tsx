import { Link } from 'react-router-dom'
import {
  Database,
  Download,
  Filter,
  GitBranch,
  Layers,
  Plug,
  ShieldAlert,
} from 'lucide-react'
import { Card, PageHeader, StatusPill } from '../components/ui'
import { HONESTY, OVERVIEW } from '../data/mockOverview'

const SHORTCUTS = [
  { to: '/sources', label: '数据源', desc: '接入卡片 / 空态', icon: Plug },
  { to: '/pipelines', label: '流水线', desc: '采集→清洗→发布假进度', icon: GitBranch },
  { to: '/datasets', label: '数据集', desc: '列表 + version 标签', icon: Database },
  { to: '/recipes', label: '配比 / 采样', desc: '预训练·SFT·偏好·评测', icon: Filter },
  { to: '/quality', label: '质量与安全', desc: '打分 / 敏感 / 污染（非真 PII）', icon: ShieldAlert },
  { to: '/lineage', label: '血缘', desc: '简单 DAG mock', icon: Layers },
  { to: '/exports', label: '脱敏导出', desc: '导出单 · 无案正文', icon: Download },
] as const

export function OverviewPage() {
  return (
    <div>
      <PageHeader
        eyebrow="总览"
        title="数据 Pipeline 总览"
        desc="Pipeline 健康与最近发布为内存 mock。本面不管 GPU 调度，也不接案卷正文。"
      />

      <Card className="mb-4 border-amber-200 bg-amber-50/80">
        <p className="text-sm font-medium text-amber-950">样机边界（诚实）</p>
        <ul className="mt-2 list-disc space-y-1 pl-5 text-xs leading-relaxed text-amber-950/90">
          {HONESTY.map((line) => (
            <li key={line}>{line}</li>
          ))}
        </ul>
      </Card>

      <div className="mb-2 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <Card>
          <p className="text-xs text-slate-500">Pipeline 健康（示意）</p>
          <p className="mt-2 text-2xl font-semibold tabular-nums text-slate-900">
            {OVERVIEW.pipelines.healthy}
          </p>
          <div className="mt-2">
            <StatusPill tone="ok">健康 · 假数字</StatusPill>
          </div>
          <p className="mt-2 text-xs text-slate-500">
            降级 {OVERVIEW.pipelines.degraded} · 失败 {OVERVIEW.pipelines.failed} · 非 live
          </p>
        </Card>
        <Card>
          <p className="text-xs text-slate-500">最近发布</p>
          <p className="mt-2 text-2xl font-semibold tabular-nums text-slate-900">
            {OVERVIEW.recentReleases.length}
          </p>
          <p className="mt-2 text-xs text-slate-500">dataset version 假标签 · 无对象存储</p>
        </Card>
        <Card>
          <p className="text-xs text-slate-500">质量门禁</p>
          <p className="mt-2 text-2xl font-semibold tabular-nums text-slate-900">
            {OVERVIEW.qualityGate.pending}
          </p>
          <p className="mt-2 text-xs text-slate-500">{OVERVIEW.qualityGate.note}</p>
        </Card>
      </div>

      <h2 className="mt-8 mb-3 text-sm font-semibold text-slate-800">最近发布（mock）</h2>
      <Card className="mb-4 p-0">
        <ul className="divide-y divide-slate-100">
          {OVERVIEW.recentReleases.map((r) => (
            <li key={r.id} className="flex flex-wrap items-center justify-between gap-2 px-4 py-3">
              <div>
                <p className="text-sm font-medium text-slate-900">
                  {r.dataset}{' '}
                  <span className="ml-1 inline-flex rounded-md border border-slate-200 bg-slate-50 px-1.5 py-0.5 font-mono text-xs text-slate-700">
                    {r.version}
                  </span>
                </p>
                <p className="mt-0.5 text-xs text-slate-500">{r.note}</p>
              </div>
              <p className="tabular-nums text-xs text-slate-500">{r.at}</p>
            </li>
          ))}
        </ul>
      </Card>

      <h2 className="mt-8 mb-3 text-sm font-semibold text-slate-800">快捷入口</h2>
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {SHORTCUTS.map((s) => {
          const Icon = s.icon
          return (
            <Link
              key={s.to}
              to={s.to}
              className="card-hover rounded-xl border border-slate-200 bg-white p-4 shadow-rest"
            >
              <div className="flex items-center gap-2 text-sm font-medium text-slate-900">
                <Icon className="h-4 w-4 text-slate-600" aria-hidden />
                {s.label}
              </div>
              <p className="mt-1 text-xs text-slate-500">{s.desc}</p>
            </Link>
          )
        })}
      </div>
    </div>
  )
}
