/**
 * 运维面只读引用 @ip/contracts 事件名。
 * 无总线实现：仅示意「若接总线将订阅」；今日未订阅。
 */
import { DOMAIN_EVENTS } from '@ip/contracts'

/** 试发下拉：模拟触发事件（写入本地通知日志，不发总线） */
export type NotifyTriggerChoice = 'command.failed' | 'docket.escalated' | 'manual'

export type NotifyTriggerEventName =
  | typeof DOMAIN_EVENTS.commandFailed
  | typeof DOMAIN_EVENTS.docketEscalated
  | 'manual'

export const NOTIFY_TRIGGER_OPTIONS: {
  choice: NotifyTriggerChoice
  eventName: NotifyTriggerEventName
  label: string
}[] = [
  {
    choice: 'command.failed',
    eventName: DOMAIN_EVENTS.commandFailed,
    label: 'command.failed',
  },
  {
    choice: 'docket.escalated',
    eventName: DOMAIN_EVENTS.docketEscalated,
    label: 'docket.escalated',
  },
  { choice: 'manual', eventName: 'manual', label: '手动试发' },
]

export function triggerEventName(choice: NotifyTriggerChoice): NotifyTriggerEventName {
  const hit = NOTIFY_TRIGGER_OPTIONS.find((o) => o.choice === choice)
  return hit?.eventName ?? 'manual'
}

export function triggerEventLabel(name: NotifyTriggerEventName | string | undefined): string {
  if (name === DOMAIN_EVENTS.commandFailed) return DOMAIN_EVENTS.commandFailed
  if (name === DOMAIN_EVENTS.docketEscalated) return DOMAIN_EVENTS.docketEscalated
  if (name === 'manual' || !name) return '手动试发'
  return name
}

/** 若接总线，ops 监控/通知将订阅的事件（今日未订阅 · 非 live） */
export const OPS_SUBSCRIBE_HINTS = [
  {
    name: DOMAIN_EVENTS.commandFailed,
    hint: '命令失败 → 告警 / 通知示意',
  },
  {
    name: DOMAIN_EVENTS.docketEscalated,
    hint: '期限升级 → Inbox / 逾期 Docket',
  },
  {
    name: DOMAIN_EVENTS.billingHoldChanged,
    hint: '停权变更 → billing hold 示意',
  },
] as const
