/**
 * Free bots for general Grok shell (mock in-memory).
 * Spec: agent-entry-modes.md · agent-layers.md · agent-l2-team.md
 * L2: spontaneous bot→bot BotMessage + collab Task (mock).
 */
export type FreeBotKind =
  | 'custom'
  | 'template:expert-search'
  | 'template:expert-draft'
  | 'template:expert-fto'
  | 'template:orchestrator'

/** Spec agent-l2-team.md BotMessage.kind */
export type BotMessageKind = 'request' | 'result' | 'note'

/** UI / legacy labels mapped from BotMessage.kind + forward */
export type CollabKind =
  | 'forward'
  | 'dispatch'
  | 'receipt'
  | 'complete'
  | 'message'
  | BotMessageKind

export type FreeBot = {
  id: string
  name: string
  kind: FreeBotKind
  systemBrief: string
  accent: string
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
    collabKind?: CollabKind
    fromBotId?: string
    toBotId?: string
    fromBotName?: string
    toBotName?: string
    collabRunId?: string
    /** Spec: BotMessage.taskId */
    taskId?: string
    /** Spec: BotMessage.kind */
    botMessageKind?: BotMessageKind
    /** Spec: spontaneous bot-originated (not user forward) */
    spontaneous?: boolean
  }
}

/** Spec agent-l2-team.md §2 */
export type BotMessage = {
  id: string
  fromBotId: string
  toBotId: string
  body: string
  taskId?: string
  kind: BotMessageKind
  at: string
  spontaneous: true
}

export type IntercomEvent = {
  id: string
  fromBotId: string
  toBotId: string
  body: string
  refThreadId?: string
  at: string
  kind?: CollabKind
  collabRunId?: string
  taskId?: string
  spontaneous?: boolean
  botMessageKind?: BotMessageKind
}

/** Spec §3 collab Task */
export type CollabTaskStatus = 'running' | 'done'
export type CollabTask = {
  id: string
  goal: string
  status: CollabTaskStatus
  steps: Array<{ id: string; label: string; done: boolean }>
  createdAt: string
  updatedAt: string
}

export type BotTemplateOption = {
  kind: FreeBotKind
  label: string
  defaultBrief: string
  accent: string
  catalogAgentId: string | null
}

export const BOT_SEED_ASSISTANT = 'bot-seed-assistant'
export const BOT_SEED_ORCHESTRATOR = 'bot-seed-orchestrator'
export const BOT_SEED_SEARCH = 'bot-seed-search'
export const BOT_SEED_DRAFT = 'bot-seed-draft'
/** @deprecated use BOT_SEED_SEARCH — kept for any stale refs */
export const BOT_SEED_SCRIBE = BOT_SEED_SEARCH

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
    defaultBrief: '总控：拆派与汇总；样机可自发消息给其他 bot。',
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
      id: BOT_SEED_ASSISTANT,
      name: '示例 · 工作助理',
      kind: 'custom',
      systemBrief:
        '帮你拆任务、记要点；L2 团队里可把消息转发给其他 bot。样机无真 LLM。',
      accent: 'emerald',
      catalogAgentId: null,
      createdAt: nowIso,
    },
    {
      id: BOT_SEED_ORCHESTRATOR,
      name: '示例 · 总控',
      kind: 'template:orchestrator',
      systemBrief:
        '总控：拆派任务给专家 bot、收齐回执后汇总。样机可点「演示协作任务」。',
      accent: 'indigo',
      catalogAgentId: null,
      createdAt: nowIso,
    },
    {
      id: BOT_SEED_SEARCH,
      name: '示例 · 检索',
      kind: 'template:expert-search',
      systemBrief: '检索向：收总控 request，短延迟回假 Hit 摘要（result）。',
      accent: 'sky',
      catalogAgentId: 'agent-research',
      createdAt: nowIso,
    },
    {
      id: BOT_SEED_DRAFT,
      name: '示例 · 撰稿',
      kind: 'template:expert-draft',
      systemBrief: '撰稿向：依据检索摘要写假段落；自发回 result 给总控。',
      accent: 'violet',
      catalogAgentId: 'agent-disclosure',
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

export function collabKindLabel(kind: CollabKind | undefined): string {
  switch (kind) {
    case 'dispatch':
    case 'request':
      return '分派'
    case 'receipt':
    case 'result':
      return '回执'
    case 'complete':
      return '完成'
    case 'note':
      return '备注'
    case 'forward':
      return '转发'
    case 'message':
      return '互通'
    default:
      return 'bot→bot'
  }
}

export function isCollabMessage(m: FreeBotMessage): boolean {
  return Boolean(
    m.meta?.collabKind ||
      m.meta?.forwardFrom ||
      m.meta?.forwardTo ||
      m.meta?.intercomId ||
      m.meta?.spontaneous ||
      m.meta?.taskId,
  )
}

/** Map BotMessage.kind → bubble collabKind */
export function collabKindFromBotMessage(
  kind: BotMessageKind,
  spontaneous: boolean,
): CollabKind {
  if (!spontaneous) return 'forward'
  if (kind === 'request') return 'request'
  if (kind === 'result') return 'result'
  return 'note'
}
