/** 开发者告警通知样机 — 仅 local / sessionStorage，不接真 SMTP / 短信 / Webhook */

import { DOMAIN_EVENTS } from '@ip/contracts'
import type { NotifyTriggerEventName } from '../lib/opsEvents'

export type AlertChannelKind = 'email' | 'sms' | 'webhook'

export type AlertChannelConfig = {
  email: { to: string; from: string }
  sms: { to: string; senderId: string }
  webhook: { endpoint: string; secretHint: string }
}

export type NotifyLogResult = 'skipped' | 'mock'

export type NotifyLogEntry = {
  id: string
  at: string
  channel: AlertChannelKind
  result: NotifyLogResult
  note: string
  /** 触发事件示意：合约事件名或手动试发；非总线投递 */
  triggerEvent: NotifyTriggerEventName
  seed?: boolean
}

export const CHANNEL_LABEL: Record<AlertChannelKind, string> = {
  email: '邮件',
  sms: '短信',
  webhook: 'Webhook',
}

export const EMPTY_CHANNELS: AlertChannelConfig = {
  email: { to: '', from: '' },
  sms: { to: '', senderId: '' },
  webhook: { endpoint: '', secretHint: '' },
}

const CHANNELS_KEY = 'ops.alertChannels.v1'
const LOGS_KEY = 'ops.alertNotifyLogs.v1'
const MAX_LOGS = 40

/** sessionStorage 空时写入，展示事件名对齐；标注 seed */
export const SEED_NOTIFY_LOGS: NotifyLogEntry[] = [
  {
    id: 'nl-seed-1',
    at: '2026-09-12 09:14:02',
    channel: 'email',
    result: 'skipped',
    note: '未接 SMTP',
    triggerEvent: DOMAIN_EVENTS.commandFailed,
    seed: true,
  },
  {
    id: 'nl-seed-2',
    at: '2026-09-12 09:18:41',
    channel: 'sms',
    result: 'mock',
    note: '未接短信网关',
    triggerEvent: DOMAIN_EVENTS.docketEscalated,
    seed: true,
  },
  {
    id: 'nl-seed-3',
    at: '2026-09-12 08:55:10',
    channel: 'webhook',
    result: 'skipped',
    note: '未调用真实 endpoint',
    triggerEvent: 'manual',
    seed: true,
  },
]

function safeParse<T>(raw: string | null, fallback: T): T {
  if (!raw) return fallback
  try {
    return JSON.parse(raw) as T
  } catch {
    return fallback
  }
}

function normalizeLog(row: Partial<NotifyLogEntry> & Pick<NotifyLogEntry, 'id' | 'at' | 'channel' | 'result' | 'note'>): NotifyLogEntry {
  const ev = row.triggerEvent
  const triggerEvent: NotifyTriggerEventName =
    ev === DOMAIN_EVENTS.commandFailed || ev === DOMAIN_EVENTS.docketEscalated || ev === 'manual'
      ? ev
      : 'manual'
  return {
    id: row.id,
    at: row.at,
    channel: row.channel,
    result: row.result,
    note: row.note,
    triggerEvent,
    seed: row.seed === true,
  }
}

export function loadChannelConfig(): AlertChannelConfig {
  if (typeof sessionStorage === 'undefined') return { ...EMPTY_CHANNELS, email: { ...EMPTY_CHANNELS.email }, sms: { ...EMPTY_CHANNELS.sms }, webhook: { ...EMPTY_CHANNELS.webhook } }
  const parsed = safeParse<Partial<AlertChannelConfig>>(sessionStorage.getItem(CHANNELS_KEY), {})
  return {
    email: { ...EMPTY_CHANNELS.email, ...parsed.email },
    sms: { ...EMPTY_CHANNELS.sms, ...parsed.sms },
    webhook: { ...EMPTY_CHANNELS.webhook, ...parsed.webhook },
  }
}

export function saveChannelConfig(cfg: AlertChannelConfig): void {
  if (typeof sessionStorage === 'undefined') return
  sessionStorage.setItem(CHANNELS_KEY, JSON.stringify(cfg))
}

export function loadNotifyLogs(): NotifyLogEntry[] {
  if (typeof sessionStorage === 'undefined') return SEED_NOTIFY_LOGS.map((r) => ({ ...r }))
  const raw = sessionStorage.getItem(LOGS_KEY)
  if (!raw) {
    sessionStorage.setItem(LOGS_KEY, JSON.stringify(SEED_NOTIFY_LOGS))
    return SEED_NOTIFY_LOGS.map((r) => ({ ...r }))
  }
  const parsed = safeParse<Partial<NotifyLogEntry>[]>(raw, [])
  if (!Array.isArray(parsed) || parsed.length === 0) {
    sessionStorage.setItem(LOGS_KEY, JSON.stringify(SEED_NOTIFY_LOGS))
    return SEED_NOTIFY_LOGS.map((r) => ({ ...r }))
  }
  return parsed
    .filter((r): r is Partial<NotifyLogEntry> & Pick<NotifyLogEntry, 'id' | 'at' | 'channel' | 'result' | 'note'> =>
      Boolean(r && r.id && r.at && r.channel && r.result && r.note != null),
    )
    .map(normalizeLog)
}

export function appendNotifyLog(entry: Omit<NotifyLogEntry, 'id' | 'seed'>): NotifyLogEntry[] {
  const next: NotifyLogEntry = {
    ...entry,
    id: `nl-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
  }
  const list = [next, ...loadNotifyLogs()].slice(0, MAX_LOGS)
  if (typeof sessionStorage !== 'undefined') {
    sessionStorage.setItem(LOGS_KEY, JSON.stringify(list))
  }
  return list
}

export function channelConfigured(kind: AlertChannelKind, cfg: AlertChannelConfig): boolean {
  if (kind === 'email') return Boolean(cfg.email.to.trim())
  if (kind === 'sms') return Boolean(cfg.sms.to.trim())
  return Boolean(cfg.webhook.endpoint.trim())
}

export function anyChannelConfigured(cfg: AlertChannelConfig): boolean {
  return (['email', 'sms', 'webhook'] as const).some((k) => channelConfigured(k, cfg))
}

export function toastForChannel(kind: AlertChannelKind): string {
  if (kind === 'webhook') return '样机不发真 Webhook'
  return '样机不发真邮件/短信'
}

export function noteForChannel(kind: AlertChannelKind): string {
  if (kind === 'webhook') return '未调用真实 endpoint'
  if (kind === 'sms') return '未接短信网关'
  return '未接 SMTP'
}
