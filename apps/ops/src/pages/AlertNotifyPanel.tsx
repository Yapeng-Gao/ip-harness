import { useEffect, useState } from 'react'
import { Bell, Mail, MessageSquare, Webhook } from 'lucide-react'
import { Card, EmptyState, StatusPill, Toast } from '../components/ui'
import {
  type AlertChannelConfig,
  type AlertChannelKind,
  type NotifyLogEntry,
  CHANNEL_LABEL,
  anyChannelConfigured,
  appendNotifyLog,
  channelConfigured,
  loadChannelConfig,
  loadNotifyLogs,
  noteForChannel,
  saveChannelConfig,
  toastForChannel,
} from '../data/mockAlerts'
import { MID_LINKS } from '../lib/links'
import {
  type NotifyTriggerChoice,
  NOTIFY_TRIGGER_OPTIONS,
  triggerEventLabel,
  triggerEventName,
} from '../lib/opsEvents'

const CHANNELS: {
  kind: AlertChannelKind
  icon: typeof Mail
  fields: { key: string; label: string; placeholder: string }[]
}[] = [
  {
    kind: 'email',
    icon: Mail,
    fields: [
      { key: 'to', label: '收件人 to', placeholder: 'ops@example.com' },
      { key: 'from', label: '发件人 from（示意）', placeholder: 'alerts@harness.local' },
    ],
  },
  {
    kind: 'sms',
    icon: MessageSquare,
    fields: [
      { key: 'to', label: '手机号 to', placeholder: '+86 138****0000' },
      { key: 'senderId', label: 'Sender ID（示意）', placeholder: 'IP-OPS' },
    ],
  },
  {
    kind: 'webhook',
    icon: Webhook,
    fields: [
      { key: 'endpoint', label: 'Endpoint URL', placeholder: 'https://hooks.example.com/ops' },
      { key: 'secretHint', label: 'Secret 提示（不落真密钥）', placeholder: '••••••••' },
    ],
  },
]

function fieldValue(cfg: AlertChannelConfig, kind: AlertChannelKind, key: string): string {
  const block = cfg[kind] as Record<string, string>
  return block[key] ?? ''
}

function setField(
  cfg: AlertChannelConfig,
  kind: AlertChannelKind,
  key: string,
  value: string,
): AlertChannelConfig {
  return {
    ...cfg,
    [kind]: { ...cfg[kind], [key]: value },
  }
}

export function AlertNotifyPanel() {
  const [cfg, setCfg] = useState<AlertChannelConfig>(() => loadChannelConfig())
  const [logs, setLogs] = useState<NotifyLogEntry[]>(() => loadNotifyLogs())
  const [toast, setToast] = useState<string | null>(null)
  const [savedFlash, setSavedFlash] = useState(false)
  const [trigger, setTrigger] = useState<NotifyTriggerChoice>('manual')

  useEffect(() => {
    if (window.location.hash === '#alerts') {
      document.getElementById('alerts')?.scrollIntoView({ behavior: 'smooth', block: 'start' })
    }
  }, [])

  function showToast(msg: string) {
    setToast(msg)
    window.setTimeout(() => setToast(null), 2400)
  }

  function onSave() {
    saveChannelConfig(cfg)
    setSavedFlash(true)
    window.setTimeout(() => setSavedFlash(false), 2000)
    showToast('已保存到本页 sessionStorage · 不落真实通道')
  }

  function onTrial(kind: AlertChannelKind) {
    const at = new Date().toISOString().replace('T', ' ').slice(0, 19)
    const next = appendNotifyLog({
      at,
      channel: kind,
      result: 'skipped',
      note: noteForChannel(kind),
      triggerEvent: triggerEventName(trigger),
    })
    setLogs(next)
    showToast(toastForChannel(kind))
  }

  function onTrialAll() {
    const kinds: AlertChannelKind[] = ['email', 'sms', 'webhook']
    let next = logs
    const at = new Date().toISOString().replace('T', ' ').slice(0, 19)
    for (const kind of kinds) {
      next = appendNotifyLog({
        at,
        channel: kind,
        result: 'mock',
        note: noteForChannel(kind),
        triggerEvent: triggerEventName(trigger),
      })
    }
    setLogs(next)
    showToast('试发结果 · mock · 样机不发真邮件/短信')
  }

  const empty = !anyChannelConfigured(cfg)

  return (
    <div id="alerts" className="scroll-mt-6">
      <div className="mb-3 flex flex-wrap items-baseline justify-between gap-2">
        <h2 className="text-sm font-semibold text-slate-800">通知渠道</h2>
        <p className="text-xs text-slate-500">开发者告警样机 · 不接 SMTP / 短信 / Webhook 网关</p>
      </div>

      <Card className="mb-3">
        <div className="flex flex-wrap items-start gap-3">
          <Bell className="mt-0.5 h-4 w-4 shrink-0 text-slate-500" aria-hidden />
          <div className="min-w-0 flex-1">
            <p className="text-sm text-slate-800">
              配置仅写入浏览器 sessionStorage。保存与试发<strong>不会</strong>触达真实邮件、短信或 Webhook。
            </p>
            <p className="mt-1 text-xs text-slate-500">
              程序 error/warn 未接 Sentry/ELK；触发事件名为 <span className="font-mono">@ip/contracts</span>{' '}
              示意对齐，<strong>未订阅总线</strong>。
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={onSave}
              className="btn-press rounded-lg bg-slate-900 px-3 py-1.5 text-xs font-medium text-white"
            >
              保存（本地 mock）
            </button>
            <button
              type="button"
              onClick={onTrialAll}
              className="btn-press rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-xs font-medium text-slate-700 hover:bg-slate-50"
            >
              总控试发
            </button>
          </div>
        </div>
        <label className="mt-3 flex flex-wrap items-center gap-2 text-xs text-slate-600">
          <span>模拟触发事件</span>
          <select
            value={trigger}
            onChange={(e) => setTrigger(e.target.value as NotifyTriggerChoice)}
            className="rounded-lg border border-slate-200 bg-white px-2.5 py-1.5 font-mono text-xs text-slate-800 focus:border-slate-400 focus:outline-none"
          >
            {NOTIFY_TRIGGER_OPTIONS.map((o) => (
              <option key={o.choice} value={o.choice}>
                {o.label}
              </option>
            ))}
          </select>
          <span className="text-slate-400">写入本地日志 · 结果仍为 skipped/mock</span>
        </label>
        {savedFlash ? (
          <p className="mt-2 text-xs text-emerald-700">已写入 sessionStorage · 刷新本标签页仍在，关标签即清。</p>
        ) : null}
      </Card>


      <Card className="mb-3 border-amber-200/80 bg-amber-50/40">
        <p className="text-sm font-medium text-amber-950">业务期限提醒入口</p>
        <p className="mt-1 text-xs leading-relaxed text-amber-950/85">
          本页通知渠道为<strong>运行时告警样机</strong>，与中台 Docket / Inbox
          业务期限提醒<strong>未打通</strong>、不覆盖「记录提醒」。请用下方标签按钮进入办理面。
        </p>
        <div className="mt-3 flex flex-wrap gap-2">
          <a
            href={MID_LINKS.docket}
            className="inline-flex items-center rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-xs font-medium text-slate-800 shadow-rest hover:bg-slate-50"
          >
            期限 Docket
          </a>
          <a
            href={`${MID_LINKS.inbox}#ops-inbox`}
            className="inline-flex items-center rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-xs font-medium text-slate-800 shadow-rest hover:bg-slate-50"
          >
            中台 Inbox
          </a>
        </div>
      </Card>

      {empty ? (
        <div className="mb-3">
          <EmptyState
            title="尚未配置通知渠道"
            body="填写下方示意字段后点「保存」。诚实空态：未接真通道，试发只会追加本地通知日志。"
          />
        </div>
      ) : null}

      <div className="grid gap-3 lg:grid-cols-3">
        {CHANNELS.map((ch) => {
          const Icon = ch.icon
          const ready = channelConfigured(ch.kind, cfg)
          return (
            <Card key={ch.kind}>
              <div className="flex items-center justify-between gap-2">
                <div className="flex items-center gap-2 text-sm font-medium text-slate-900">
                  <Icon className="h-4 w-4 text-slate-600" aria-hidden />
                  {CHANNEL_LABEL[ch.kind]}
                </div>
                <StatusPill tone={ready ? 'ok' : 'empty'}>
                  {ready ? '已填示意' : '未配置'}
                </StatusPill>
              </div>
              <div className="mt-3 space-y-2">
                {ch.fields.map((f) => (
                  <label key={f.key} className="block">
                    <span className="text-xs text-slate-500">{f.label}</span>
                    <input
                      type="text"
                      value={fieldValue(cfg, ch.kind, f.key)}
                      onChange={(e) => setCfg(setField(cfg, ch.kind, f.key, e.target.value))}
                      placeholder={f.placeholder}
                      className="mt-1 w-full rounded-lg border border-slate-200 bg-white px-2.5 py-1.5 font-mono text-xs text-slate-800 placeholder:text-slate-400 focus:border-slate-400 focus:outline-none"
                      autoComplete="off"
                    />
                  </label>
                ))}
              </div>
              <button
                type="button"
                onClick={() => onTrial(ch.kind)}
                className="btn-press mt-3 w-full rounded-lg border border-slate-200 bg-slate-50 px-3 py-1.5 text-xs font-medium text-slate-700 hover:bg-slate-100"
              >
                试发 {CHANNEL_LABEL[ch.kind]}
              </button>
            </Card>
          )
        })}
      </div>

      <h3 className="mt-6 mb-2 text-sm font-semibold text-slate-800">通知日志（本地）</h3>
      <Card>
        {logs.length === 0 ? (
          <EmptyState
            title="暂无试发记录"
            body="点「试发」后在此追加时间 / 渠道 / 触发事件 / 结果=skipped|mock。不写远端。"
          />
        ) : (
          <ul className="divide-y divide-slate-100">
            {logs.map((row) => (
              <li
                key={row.id}
                className="flex flex-wrap items-center justify-between gap-2 py-2 text-sm first:pt-0 last:pb-0"
              >
                <div>
                  <p className="font-mono text-xs text-slate-500">{row.at}</p>
                  <p className="text-slate-800">
                    {CHANNEL_LABEL[row.channel]}
                    <span className="ml-2 font-mono text-xs text-slate-600">
                      {triggerEventLabel(row.triggerEvent)}
                    </span>
                    <span className="ml-2 text-xs text-slate-500">{row.note}</span>
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  {row.seed ? <StatusPill tone="info">seed</StatusPill> : null}
                  <StatusPill tone={row.result === 'mock' ? 'info' : 'empty'}>{row.result}</StatusPill>
                </div>
              </li>
            ))}
          </ul>
        )}
      </Card>

      {toast ? <Toast message={toast} /> : null}
    </div>
  )
}
