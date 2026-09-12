import { Link } from 'react-router-dom'
import {
  Activity,
  AlertTriangle,
  Bell,
  Cpu,
  CreditCard,
  Inbox,
  ScrollText,
  Server,
  Settings2,
} from 'lucide-react'
import { Card, PageHeader, StatusPill } from '../components/ui'
import { OVERVIEW } from '../data/mockOverview'
import { SERVICE_HEALTH, SLA_DATA_SOURCE } from '../data/mockMonitor'
import { MID_LINKS } from '../lib/links'

const SHORTCUTS = [
  { to: '/logs', label: '日志平台', desc: '应用 / 审计 / 登录越权 / HITL', icon: ScrollText },
  { to: '/monitor', label: '监控', desc: '服务健康 + 业务 SLA', icon: Activity },
  { to: '/models', label: '模型监控', desc: '路由 · 护栏 · schema', icon: Cpu },
  { to: '/infra', label: '基础设施', desc: '主机 / 存储 / 证书', icon: Server },
  { to: '/config', label: '配置', desc: '开关 · 密钥 · runbook', icon: Settings2 },
  {
    to: '/config#alerts',
    label: '通知渠道',
    desc: '邮件 / 短信 / Webhook 样机试发',
    icon: Bell,
  },
] as const

export function OverviewPage() {
  return (
    <div>
      <PageHeader
        eyebrow="总览"
        title="运维面总览"
        desc="健康摘要与快捷入口。数字全部为本地 mock 聚合示意 · 非 live。"
      />

      <Card className="mb-4 border-amber-200 bg-amber-50/80">
        <p className="text-sm font-medium text-amber-950">可观测边界（诚实）</p>
        <ul className="mt-2 list-disc space-y-1 pl-5 text-xs leading-relaxed text-amber-950/90">
          <li>程序 error / warn <strong>未接</strong> Sentry / ELK — 日志页仅为本地 mock 行。</li>
          <li>
            业务 SLA 告警（Inbox / Docket / Watch）为<strong>本地 mock 聚合示意 · 非 live</strong>，
            <strong>≠</strong> 运行时异常监控；二者未打通、未接真告警通道。
          </li>
          <li>
            开发者通知见{' '}
            <Link className="underline decoration-amber-400 underline-offset-2" to="/config#alerts">
              配置 · 通知渠道
            </Link>
            ：试发不发真邮件 / 短信 / Webhook。
          </li>
        </ul>
      </Card>

      <div className="mb-2 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Card>
          <p className="text-xs text-slate-500">服务健康</p>
          <p className="mt-2 text-2xl font-semibold tabular-nums text-slate-900">
            {OVERVIEW.healthOk}/{OVERVIEW.healthTotal}
          </p>
          <div className="mt-2">
            <StatusPill tone={OVERVIEW.healthLabel === '正常' ? 'ok' : 'degraded'}>
              {OVERVIEW.healthLabel}
            </StatusPill>
          </div>
          <p className="mt-2 text-xs text-slate-500">
            {SERVICE_HEALTH.map((s) => `${s.name} ${s.label}`).join(' · ')}
          </p>
        </Card>
        <Card>
          <p className="text-xs text-slate-500">关键告警数</p>
          <p className="mt-2 flex items-center gap-2 text-2xl font-semibold tabular-nums text-slate-900">
            <AlertTriangle className="h-5 w-5 text-amber-600" aria-hidden />
            {OVERVIEW.alerts}
          </p>
          <p className="mt-2 text-xs text-slate-500">
            队列降级 + 逾期 Docket / Watch SLA · {SLA_DATA_SOURCE.label} · 非 live
          </p>
        </Card>
        <Card>
          <p className="text-xs text-slate-500">环境</p>
          <p className="mt-2 font-mono text-lg font-semibold text-slate-900">{OVERVIEW.env}</p>
          <p className="mt-2 text-xs text-slate-500">{OVERVIEW.envNote}</p>
        </Card>
        <Card>
          <p className="text-xs text-slate-500">License 席位</p>
          <p className="mt-2 text-2xl font-semibold tabular-nums text-slate-900">
            {OVERVIEW.license.used}/{OVERVIEW.license.seats}
          </p>
          <p className="mt-2 text-xs text-slate-500">{OVERVIEW.license.note}</p>
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

      <h2 className="mt-8 mb-3 text-sm font-semibold text-slate-800">业务期限提醒 · 深链中台</h2>
      <Card>
        <p className="text-xs leading-relaxed text-slate-500">
          运行时告警（本面）≠ 业务期限提醒。以下标签按钮进入中台办理面；不改 Inbox / Docket /
          Billing 业务逻辑，也不暗示本面已覆盖 Docket「记录提醒」。
        </p>
        <ul className="mt-3 flex flex-wrap gap-3 text-sm">
          <li>
            <a
              className="inline-flex items-center gap-1.5 rounded-lg border border-amber-200 bg-amber-50 px-3 py-1.5 font-medium text-amber-950 hover:bg-amber-100/80"
              href={MID_LINKS.docket}
            >
              <Activity className="h-3.5 w-3.5" aria-hidden />
              期限 Docket
            </a>
          </li>
          <li>
            <a
              className="inline-flex items-center gap-1.5 rounded-lg border border-amber-200 bg-amber-50 px-3 py-1.5 font-medium text-amber-950 hover:bg-amber-100/80"
              href={`${MID_LINKS.inbox}#ops-inbox`}
            >
              <Inbox className="h-3.5 w-3.5" aria-hidden />
              中台 Inbox
            </a>
          </li>
          <li>
            <a
              className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-3 py-1.5 hover:bg-slate-50"
              href={MID_LINKS.billing}
            >
              <CreditCard className="h-3.5 w-3.5" aria-hidden />
              费用中心
            </a>
          </li>
        </ul>
      </Card>
    </div>
  )
}
