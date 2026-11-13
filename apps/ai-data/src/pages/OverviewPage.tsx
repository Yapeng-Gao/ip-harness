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
import { useAiDataStore } from '../state/store'
import { SEED_PUBLISHED } from '../state/types'

const SHORTCUTS = [
  { to: '/sources', label: '数据源', desc: '拉取 → IngestJob', icon: Plug },
  { to: '/pipelines', label: '流水线', desc: 'DAG Run · 质量门阻断', icon: GitBranch },
  { to: '/datasets', label: '数据集', desc: '不可变 version / pin', icon: Database },
  { to: '/recipes', label: '配比 / 采样', desc: '保存 + 条数预览', icon: Filter },
  { to: '/quality', label: '质量与安全', desc: '打分 / 难例回流', icon: ShieldAlert },
  { to: '/lineage', label: '血缘', desc: '自动追加边', icon: Layers },
  { to: '/exports', label: '脱敏导出', desc: '申请→审批→候选集', icon: Download },
] as const

const HONESTY = [
  '无真 Spark / 无真湖仓 / 无真 PII 引擎 — 状态在浏览器内存。',
  '禁止持有或写入 PatentCase / DomainCommand。',
  '跨端口 localStorage 不互通；与 ai-infra 对齐靠共享种子 ID 契约。',
  'ai-infra:5179 / ops:5176 仅深链，不改邻居、不改 APP_PORTS。',
] as const

export function OverviewPage() {
  const { pipelines, datasets, qualityReports, tickets, ingestJobs } = useAiDataStore()

  const healthy = pipelines.filter((p) => !p.running && p.steps.every((s) => s.status === 'done' || s.status === 'idle')).length
  const running = pipelines.filter((p) => p.running).length
  const blocked = pipelines.filter((p) => p.steps.some((s) => s.status === 'blocked' || s.status === 'fail')).length
  const recentVersions = datasets
    .flatMap((d) => d.versions.map((v) => ({ ds: d.name, ...v, id: d.id })))
    .sort((a, b) => (a.publishedAt < b.publishedAt ? 1 : -1))
    .slice(0, 5)
  const pendingQuality = qualityReports.filter((q) => q.status === 'idle' || q.status === 'fail').length
  const openTickets = tickets.filter((t) => t.status === 'open').length
  const recentIngest = ingestJobs.slice(0, 3)

  return (
    <div>
      <PageHeader
        eyebrow="总览"
        title="数据 Pipeline 总览"
        desc="实时反映内存状态机。本面不管 GPU 调度，也不接案卷正文。"
      />

      <Card className="mb-4 border-amber-200 bg-amber-50/80">
        <p className="text-sm font-medium text-amber-950">样机边界（诚实）</p>
        <ul className="mt-2 list-disc space-y-1 pl-5 text-xs leading-relaxed text-amber-950/90">
          {HONESTY.map((line) => (
            <li key={line}>{line}</li>
          ))}
        </ul>
        <p className="mt-2 text-xs text-amber-950/80">
          共享种子：{SEED_PUBLISHED.map((s) => `${s.name}@${s.version}`).join(' · ')}
        </p>
      </Card>

      <div className="mb-2 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Card>
          <p className="text-xs text-slate-500">Pipeline 健康</p>
          <p className="mt-2 text-2xl font-semibold tabular-nums text-slate-900">{healthy}</p>
          <div className="mt-2 flex flex-wrap gap-1">
            <StatusPill tone="ok">空闲/完成</StatusPill>
            {running > 0 ? <StatusPill tone="info">运行 {running}</StatusPill> : null}
            {blocked > 0 ? <StatusPill tone="warn">阻断/失败 {blocked}</StatusPill> : null}
          </div>
        </Card>
        <Card>
          <p className="text-xs text-slate-500">最近发布 version</p>
          <p className="mt-2 text-2xl font-semibold tabular-nums text-slate-900">
            {recentVersions.length}
          </p>
          <p className="mt-2 text-xs text-slate-500">不可变 · 假 checksum</p>
        </Card>
        <Card>
          <p className="text-xs text-slate-500">质量待处理</p>
          <p className="mt-2 text-2xl font-semibold tabular-nums text-slate-900">{pendingQuality}</p>
          <p className="mt-2 text-xs text-slate-500">idle / fail · 非真 PII</p>
        </Card>
        <Card>
          <p className="text-xs text-slate-500">开放 ImprovementTicket</p>
          <p className="mt-2 text-2xl font-semibold tabular-nums text-slate-900">{openTickets}</p>
          <p className="mt-2 text-xs text-slate-500">评测回流 · 见质量页</p>
        </Card>
      </div>

      <h2 className="mt-8 mb-3 text-sm font-semibold text-slate-800">最近发布</h2>
      <Card className="mb-4 p-0">
        <ul className="divide-y divide-slate-100">
          {recentVersions.map((r) => (
            <li
              key={`${r.id}-${r.tag}`}
              className="flex flex-wrap items-center justify-between gap-2 px-4 py-3"
            >
              <div>
                <p className="text-sm font-medium text-slate-900">
                  {r.ds}{' '}
                  <span className="ml-1 inline-flex rounded-md border border-slate-200 bg-slate-50 px-1.5 py-0.5 font-mono text-xs text-slate-700">
                    {r.tag}
                  </span>
                  {r.pinned ? (
                    <span className="ml-1 text-xs text-amber-700">pinned</span>
                  ) : null}
                </p>
                <p className="mt-0.5 font-mono text-xs text-slate-500">{r.checksum}</p>
              </div>
              <p className="tabular-nums text-xs text-slate-500">{r.publishedAt}</p>
            </li>
          ))}
        </ul>
      </Card>

      {recentIngest.length > 0 ? (
        <>
          <h2 className="mt-8 mb-3 text-sm font-semibold text-slate-800">最近 Ingest</h2>
          <Card className="mb-4 p-0">
            <ul className="divide-y divide-slate-100">
              {recentIngest.map((j) => (
                <li key={j.id} className="flex flex-wrap items-center justify-between gap-2 px-4 py-3">
                  <p className="text-sm text-slate-800">
                    {j.sourceName} · raw +{j.rawWritten}
                  </p>
                  <StatusPill
                    tone={
                      j.status === 'done'
                        ? 'ok'
                        : j.status === 'fail'
                          ? 'down'
                          : 'info'
                    }
                  >
                    {j.status}
                  </StatusPill>
                </li>
              ))}
            </ul>
          </Card>
        </>
      ) : null}

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
