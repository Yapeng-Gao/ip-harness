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
import { useAiInfra } from '../state/AiInfraStore'

const SHORTCUTS = [
  { to: '/gpus', label: 'GPU 资源', desc: '占用随作业 · drain 可点', icon: Cpu },
  { to: '/jobs', label: '作业', desc: '创建 / 取消 / 重试 / 日志', icon: SquareTerminal },
  { to: '/endpoints', label: '在线推理', desc: '部署 · 金丝雀 · 回滚', icon: Server },
  { to: '/models', label: '模型注册', desc: '版本晋级 Confirm', icon: Layers },
  { to: '/pipelines', label: '训推门禁', desc: '评测门禁 Pass/Fail', icon: GitBranch },
  { to: '/loadtest', label: '压测', desc: '参数驱动假报告', icon: Activity },
  { to: '/alerts', label: '训推告警', desc: '失败/高占用自动追加', icon: Bell },
] as const

const HONESTY = [
  '无真 GPU / 无真 K8s / 无真权重仓 — 状态机在浏览器内存。',
  '跨端口（5179↔5181）靠共享种子契约，不靠 localStorage 互通。',
  '禁止持有或写入 PatentCase / DomainCommand。',
  'ops 深链走 APP_DEV_URLS.ops，仅深链、不改运维六路由、不改 APP_PORTS。',
] as const

export function OverviewPage() {
  const { state, gpuUtil, openAlertCount, runningJobCount } = useAiInfra()
  const queued = state.jobs.filter((j) => j.status === 'queued').length
  const utilPct = gpuUtil.total ? Math.round((gpuUtil.used / gpuUtil.total) * 100) : 0

  return (
    <div>
      <PageHeader
        eyebrow="总览"
        title="训推基建总览"
        desc="数字来自内存状态机。刷新即失。本面不管办案 SLA，也不申请真集群。"
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
          <p className="text-xs text-slate-500">GPU 占用</p>
          <p className="mt-2 text-2xl font-semibold tabular-nums text-slate-900">
            {gpuUtil.used}/{gpuUtil.total}
          </p>
          <div className="mt-2">
            <StatusPill tone={utilPct >= 80 ? 'warn' : 'ok'}>{utilPct}% · 派生</StatusPill>
          </div>
        </Card>
        <Card>
          <p className="text-xs text-slate-500">运行中作业</p>
          <p className="mt-2 text-2xl font-semibold tabular-nums text-slate-900">
            {runningJobCount}
          </p>
          <p className="mt-2 text-xs text-slate-500">排队 {queued}</p>
        </Card>
        <Card>
          <p className="text-xs text-slate-500">端点</p>
          <p className="mt-2 text-2xl font-semibold tabular-nums text-slate-900">
            {state.endpoints.length}
          </p>
          <p className="mt-2 text-xs text-slate-500">
            金丝雀 {state.endpoints.filter((e) => e.status === 'canary').length}
          </p>
        </Card>
        <Card>
          <p className="text-xs text-slate-500">未确认告警</p>
          <p className="mt-2 text-2xl font-semibold tabular-nums text-slate-900">
            {openAlertCount}
          </p>
          <p className="mt-2 text-xs text-slate-500">出站仍标 notify</p>
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
