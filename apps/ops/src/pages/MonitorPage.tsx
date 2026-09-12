import { Link } from 'react-router-dom'
import { Card, ExtLink, PageHeader, StatusDot, StatusPill } from '../components/ui'
import {
  BILLING_HOLDS,
  ESCALATION_LABEL,
  GATE_REJECT,
  INBOX_BACKLOG,
  INBOX_SOURCE_LABEL,
  OVERDUE_DOCKETS,
  SERVICE_HEALTH,
  SLA_DATA_SOURCE,
  WATCH_OVER_SLA,
} from '../data/mockMonitor'
import { OPS_SUBSCRIBE_HINTS } from '../lib/opsEvents'
import { MID_LINKS, midCaseUrl } from '../lib/links'

const INBOX_KEYS = ['workbench', 'agent', 'docket', 'sla'] as const

export function MonitorPage() {
  const inboxTotal =
    INBOX_BACKLOG.workbench + INBOX_BACKLOG.agent + INBOX_BACKLOG.docket + INBOX_BACKLOG.sla

  return (
    <div>
      <PageHeader
        eyebrow="监控"
        title="服务健康与业务 SLA"
        desc="数据来源：本地 mock 聚合示意 · 非 live。不接 Prometheus / 总线；api-mock 无现成 SLA 计数接口，故不 fetch。"
      />

      <Card className="mb-6 border-amber-200 bg-amber-50/80">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <p className="text-sm font-medium text-amber-950">监控口径（诚实）</p>
          <StatusPill tone="info">{SLA_DATA_SOURCE.label} · 非 live</StatusPill>
        </div>
        <ul className="mt-2 list-disc space-y-1 pl-5 text-xs leading-relaxed text-amber-950/90">
          <li>
            程序 error / warn <strong>未接</strong> Sentry / ELK — 本页不展示运行时异常堆栈或错误率 live。
          </li>
          <li>
            下方「业务 SLA」是办案队列 / 逾期示意，<strong>不等于</strong>运行时异常监控，二者未打通。
          </li>
          <li>
            开发者通知试发见{' '}
            <Link className="underline decoration-amber-400 underline-offset-2" to="/config#alerts">
              配置 · 通知渠道
            </Link>
            （不发真邮件 / 短信 / Webhook）。
          </li>
        </ul>
      </Card>

      <h2 className="mb-3 text-sm font-semibold text-slate-800">服务健康</h2>
      <div className="grid gap-3 sm:grid-cols-3">
        {SERVICE_HEALTH.map((s) => (
          <Card key={s.id}>
            <div className="flex items-center justify-between">
              <p className="text-sm font-medium text-slate-900">{s.name}</p>
              <StatusDot tone={s.tone} label={s.label} />
            </div>
            <p className="mt-2 text-xs leading-relaxed text-slate-500">{s.detail}</p>
          </Card>
        ))}
      </div>

      <div className="mt-8 mb-3 flex flex-wrap items-baseline justify-between gap-2">
        <h2 className="text-sm font-semibold text-slate-800">业务 SLA</h2>
        <p className="text-xs text-slate-500">
          {SLA_DATA_SOURCE.label} · <strong>非 live</strong>
        </p>
      </div>

      <Card className="mb-3">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <div>
            <p className="text-xs text-slate-500">
              Inbox 积压（按 source · 口径 工作台 / Agent / 期限 / sla）
            </p>
            <p className="mt-1 text-2xl font-semibold tabular-nums">{inboxTotal}</p>
          </div>
          <ExtLink href={MID_LINKS.inbox}>中台 Inbox /</ExtLink>
        </div>
        <dl className="mt-3 grid gap-2 sm:grid-cols-4">
          {INBOX_KEYS.map((k) => (
            <div key={k} className="rounded-lg border border-slate-200 bg-slate-50 px-3 py-2">
              <dt className="text-xs text-slate-500">
                {INBOX_SOURCE_LABEL[k]}
                <span className="ml-1 font-mono text-slate-400">{k}</span>
              </dt>
              <dd className="mt-1 text-lg font-semibold tabular-nums">{INBOX_BACKLOG[k]}</dd>
            </div>
          ))}
        </dl>
        <p className="mt-2 text-xs text-slate-400">
          source 标签对齐中台 Inbox（workbench / agent / docket / sla）· {SLA_DATA_SOURCE.note}
        </p>
      </Card>

      <Card className="mb-3">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <p className="text-sm font-medium text-slate-900">逾期 Docket（escalationLevel 示意）</p>
          <ExtLink href={MID_LINKS.docket}>中台 /docket</ExtLink>
        </div>
        <ul className="mt-3 divide-y divide-slate-100">
          {OVERDUE_DOCKETS.map((d) => (
            <li key={d.id} className="flex flex-wrap items-center justify-between gap-2 py-2 text-sm">
              <div>
                <p className="font-medium text-slate-800">{d.title}</p>
                <p className="text-xs text-slate-500">
                  {d.caseTitle} · due {d.due}
                </p>
              </div>
              <div className="flex items-center gap-2">
                <StatusPill tone={d.escalationLevel === 'at_risk' ? 'down' : 'warn'}>
                  {ESCALATION_LABEL[d.escalationLevel]}
                </StatusPill>
                <ExtLink href={midCaseUrl(d.caseId)}>案详审计</ExtLink>
              </div>
            </li>
          ))}
        </ul>
      </Card>

      <div className="grid gap-3 lg:grid-cols-3">
        <Card>
          <div className="flex items-center justify-between">
            <p className="text-xs text-slate-500">停权案（billing hold）</p>
            <ExtLink href={MID_LINKS.billing}>/billing</ExtLink>
          </div>
          <p className="mt-1 text-2xl font-semibold tabular-nums">{BILLING_HOLDS.length}</p>
          <ul className="mt-2 space-y-2">
            {BILLING_HOLDS.map((h) => (
              <li key={h.caseId} className="text-xs text-slate-600">
                <ExtLink href={midCaseUrl(h.caseId)}>{h.caseId}</ExtLink>
                {' · '}
                {h.reason}
              </li>
            ))}
          </ul>
        </Card>
        <Card>
          <p className="text-xs text-slate-500">闸门拒绝率</p>
          <p className="mt-1 text-2xl font-semibold tabular-nums">{GATE_REJECT.ratePct}%</p>
          <p className="mt-1 text-xs text-slate-500">
            {GATE_REJECT.blocked}/{GATE_REJECT.evaluated} · {GATE_REJECT.note}
          </p>
        </Card>
        <Card>
          <p className="text-xs text-slate-500">Watch 超 SLA</p>
          <p className="mt-1 text-2xl font-semibold tabular-nums">{WATCH_OVER_SLA.length}</p>
          <ul className="mt-2 space-y-2">
            {WATCH_OVER_SLA.map((w) => (
              <li key={w.id} className="text-xs text-slate-600">
                <ExtLink href={midCaseUrl(w.caseId)}>案详审计 {w.caseId}</ExtLink>
                {' · '}
                {w.title} · 逾期 {w.overdueHours}h
              </li>
            ))}
          </ul>
        </Card>
      </div>

      <h2 className="mt-8 mb-3 text-sm font-semibold text-slate-800">若接总线将订阅的事件名</h2>
      <Card>
        <div className="flex flex-wrap items-center justify-between gap-2">
          <p className="text-xs text-slate-500">
            常量来自 <span className="font-mono">@ip/contracts</span> <span className="font-mono">DOMAIN_EVENTS</span>
            。今日<strong>未订阅</strong> · 非 live。
          </p>
          <StatusPill tone="empty">今日未订阅</StatusPill>
        </div>
        <ul className="mt-3 divide-y divide-slate-100">
          {OPS_SUBSCRIBE_HINTS.map((ev) => (
            <li key={ev.name} className="flex flex-wrap items-center justify-between gap-2 py-2 first:pt-0 last:pb-0">
              <div>
                <p className="font-mono text-sm text-slate-800">{ev.name}</p>
                <p className="text-xs text-slate-500">{ev.hint}</p>
              </div>
              <StatusPill tone="info">示意</StatusPill>
            </li>
          ))}
        </ul>
      </Card>
    </div>
  )
}
