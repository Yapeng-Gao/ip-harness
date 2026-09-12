import { Link } from 'react-router-dom'
import {
  Activity,
  Bell,
  Cpu,
  GitBranch,
  Layers,
  Server,
  SquareTerminal,
} from 'lucide-react'
import { Card, PageHeader, StatusPill } from '../components/ui'
import { HONESTY, OVERVIEW } from '../data/mockOverview'

const SHORTCUTS = [
  { to: '/gpus', label: 'GPU 资源', desc: '节点与配额表（示意）', icon: Cpu },
  { to: '/jobs', label: '作业', desc: '训练 / 批推假进度', icon: SquareTerminal },
  { to: '/endpoints', label: '在线推理', desc: '已发布端点卡片', icon: Server },
  { to: '/models', label: '模型注册', desc: '版本 / 晋级 / 回滚', icon: Layers },
  { to: '/pipelines', label: '训推门禁', desc: '训练→评测→发布模板', icon: GitBranch },
  { to: '/loadtest', label: '压测', desc: '场景与报告 mock', icon: Activity },
  { to: '/alerts', label: '训推告警', desc: '规则示意 · 出站 notify', icon: Bell },
] as const

export function OverviewPage() {
  return (
    <div>
      <PageHeader
        eyebrow="总览"
        title="训推基建总览"
        desc="GPU 池与队列深度为内存 mock。本面不管办案 SLA，也不申请真集群。"
      />

      <Card className="mb-4 border-amber-200 bg-amber-50/80">
        <p className="text-sm font-medium text-amber-950">样机边界（诚实）</p>
        <ul className="mt-2 list-disc space-y-1 pl-5 text-xs leading-relaxed text-amber-950/90">
          {HONESTY.map((line) => (
            <li key={line}>{line}</li>
          ))}
        </ul>
      </Card>

      <div className="mb-2 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Card>
          <p className="text-xs text-slate-500">GPU 池（示意）</p>
          <p className="mt-2 text-2xl font-semibold tabular-nums text-slate-900">
            {OVERVIEW.gpuPool.training}/{OVERVIEW.gpuPool.total}
          </p>
          <div className="mt-2">
            <StatusPill tone="degraded">训练占用 · 假数字</StatusPill>
          </div>
          <p className="mt-2 text-xs text-slate-500">
            空闲 {OVERVIEW.gpuPool.idle} · 排队槽 {OVERVIEW.gpuPool.queuedSlots} · 非 live
          </p>
        </Card>
        <Card>
          <p className="text-xs text-slate-500">队列深度</p>
          <p className="mt-2 text-2xl font-semibold tabular-nums text-slate-900">
            {OVERVIEW.queue.train + OVERVIEW.queue.batch}
          </p>
          <p className="mt-2 text-xs text-slate-500">
            训练 {OVERVIEW.queue.train} · 批推 {OVERVIEW.queue.batch} · 预热 {OVERVIEW.queue.inferWarm}
          </p>
        </Card>
        <Card>
          <p className="text-xs text-slate-500">已发布端点</p>
          <p className="mt-2 text-2xl font-semibold tabular-nums text-slate-900">
            {OVERVIEW.endpoints.published}
          </p>
          <p className="mt-2 text-xs text-slate-500">
            金丝雀 {OVERVIEW.endpoints.canary} · 网关可读形状，无真进程
          </p>
        </Card>
        <Card>
          <p className="text-xs text-slate-500">训推告警</p>
          <p className="mt-2 text-2xl font-semibold tabular-nums text-slate-900">
            {OVERVIEW.alerts.warn}
          </p>
          <p className="mt-2 text-xs text-slate-500">{OVERVIEW.alerts.note}</p>
        </Card>
      </div>

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
