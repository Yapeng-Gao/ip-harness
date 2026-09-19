/**
 * Free bots for general Grok shell (mock in-memory).
 * Spec: docs/architecture/product-apps/agent-entry-modes.md (freedom freeze cec9d79)
 * Custom bots default read-only / no DomainCommand until template-backed HITL.
 */
export type FreeBotKind =
  | 'custom'
  | 'template:expert-search'
  | 'template:expert-draft'
  | 'template:expert-fto'
  | 'template:orchestrator'

export type FreeBot = {
  id: string
  name: string
  kind: FreeBotKind
  systemBrief: string
  accent: string
  /** Template-backed may hint catalog agent; custom = null (只读) */
  catalogAgentId: string | null
  createdAt: string
  archived?: boolean
}

export type FreeBotMessage = {
  id: string
  botId: string
  role: 'user' | 'assistant' | 'system'
  content: string
  at: string
  meta?: {
    forwardFrom?: string
    forwardTo?: string
    intercomId?: string
    backend?: 'mock'
  }
}

export type IntercomEvent = {
  id: string
  fromBotId: string
  toBotId: string
  body: string
  refThreadId?: string
  at: string
}

export type BotTemplateOption = {
  kind: FreeBotKind
  label: string
  defaultBrief: string
  accent: string
  catalogAgentId: string | null
}

export const BOT_TEMPLATE_OPTIONS: BotTemplateOption[] = [
  {
    kind: 'custom',
    label: '自定义（只读 · 无写库）',
    defaultBrief: '通用助手：回答问题、整理要点；不发起 DomainCommand。',
    accent: 'slate',
    catalogAgentId: null,
  },
  {
    kind: 'template:orchestrator',
    label: '从模板 · 总控编排',
    defaultBrief: '总控：拆派与汇总；样机可转发消息给其他 bot。',
    accent: 'indigo',
    catalogAgentId: null,
  },
  {
    kind: 'template:expert-search',
    label: '从模板 · 检索能力',
    defaultBrief:
      '检索向：归纳现有技术要点；写库仍须 HITL→DomainCommand（样机默认只读）。',
    accent: 'sky',
    catalogAgentId: 'agent-research',
  },
  {
    kind: 'template:expert-draft',
    label: '从模板 · 撰稿能力',
    defaultBrief: '撰稿向：交底/权利要求草稿建议；写库须 HITL。',
    accent: 'violet',
    catalogAgentId: 'agent-disclosure',
  },
  {
    kind: 'template:expert-fto',
    label: '从模板 · FTO 能力',
    defaultBrief: '自由实施向：特征与风险提示；写库须 HITL。',
    accent: 'amber',
    catalogAgentId: 'agent-research',
  },
]

export function seedFreeBots(nowIso: string): FreeBot[] {
  return [
    {
      id: 'bot-seed-assistant',
      name: '示例 · 工作助理',
      kind: 'custom',
      systemBrief:
        '帮你拆任务、记要点；可把消息转发给其他 bot。样机无真 LLM。',
      accent: 'emerald',
      catalogAgentId: null,
      createdAt: nowIso,
    },
    {
      id: 'bot-seed-scribe',
      name: '示例 · 会议纪要',
      kind: 'custom',
      systemBrief: '把对话整理成纪要条目；默认只读、无写库命令。',
      accent: 'rose',
      catalogAgentId: null,
      createdAt: nowIso,
    },
  ]
}

export function templateMeta(kind: FreeBotKind): BotTemplateOption {
  return (
    BOT_TEMPLATE_OPTIONS.find((t) => t.kind === kind) ?? BOT_TEMPLATE_OPTIONS[0]!
  )
}

export function freeBotPath(botId: string | undefined | null): string {
  if (!botId) return '/agent'
  return `/agent/bots/${botId}`
}

export function kindLabel(kind: FreeBotKind): string {
  if (kind === 'custom') return '自定义'
  if (kind.startsWith('template:')) return '模板'
  return kind
}
