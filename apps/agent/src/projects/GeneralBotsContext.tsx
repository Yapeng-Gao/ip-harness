import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
  type ReactNode,
} from 'react'
import {
  seedFreeBots,
  templateMeta,
  type FreeBot,
  type FreeBotKind,
  type FreeBotMessage,
  type IntercomEvent,
} from './generalBots'

function nowIso(): string {
  return new Date().toISOString()
}

function stamp(): string {
  return new Date().toLocaleString('zh-CN', { hour12: false })
}

function uid(prefix: string): string {
  return `${prefix}-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`
}

function introMessage(bot: FreeBot): FreeBotMessage {
  const readonly = !bot.catalogAgentId
    ? '\n（样机 · 只读/无 DomainCommand）'
    : '\n（模板能力 · 写库仍须 HITL→DomainCommand）'
  return {
    id: uid('msg'),
    botId: bot.id,
    role: 'system',
    content: `通用 Grok · 一对一\n${bot.name}\n${bot.systemBrief}${readonly}`,
    at: stamp(),
    meta: { backend: 'mock' },
  }
}

type CreateBotInput = {
  name: string
  kind: FreeBotKind
  systemBrief: string
}

type GeneralBotsContextValue = {
  bots: FreeBot[]
  activeBots: FreeBot[]
  intercom: IntercomEvent[]
  getBot: (id: string) => FreeBot | undefined
  getMessages: (botId: string) => FreeBotMessage[]
  createBot: (input: CreateBotInput) => FreeBot
  appendMessage: (
    botId: string,
    msg: Omit<FreeBotMessage, 'id' | 'at' | 'botId'> & { at?: string },
  ) => void
  forwardToBot: (input: {
    fromBotId: string
    toBotId: string
    body: string
  }) => IntercomEvent | null
  mockReply: (botId: string, userText: string) => void
}

const GeneralBotsContext = createContext<GeneralBotsContextValue | null>(null)

export function GeneralBotsProvider({ children }: { children: ReactNode }) {
  const seed = useMemo(() => seedFreeBots(nowIso()), [])
  const [bots, setBots] = useState<FreeBot[]>(seed)
  const [messages, setMessages] = useState<FreeBotMessage[]>(() =>
    seed.flatMap((b) => [introMessage(b)]),
  )
  const [intercom, setIntercom] = useState<IntercomEvent[]>([])

  const getBot = useCallback(
    (id: string) => bots.find((b) => b.id === id && !b.archived),
    [bots],
  )

  const getMessages = useCallback(
    (botId: string) => messages.filter((m) => m.botId === botId),
    [messages],
  )

  const createBot = useCallback((input: CreateBotInput) => {
    const meta = templateMeta(input.kind)
    const bot: FreeBot = {
      id: uid('bot'),
      name: input.name.trim() || '未命名 bot',
      kind: input.kind,
      systemBrief: input.systemBrief.trim() || meta.defaultBrief,
      accent: meta.accent,
      catalogAgentId: meta.catalogAgentId,
      createdAt: nowIso(),
    }
    setBots((prev) => [bot, ...prev])
    setMessages((prev) => [...prev, introMessage(bot)])
    return bot
  }, [])

  const appendMessage = useCallback(
    (
      botId: string,
      msg: Omit<FreeBotMessage, 'id' | 'at' | 'botId'> & { at?: string },
    ) => {
      setMessages((prev) => [
        ...prev,
        {
          id: uid('msg'),
          botId,
          at: msg.at ?? stamp(),
          role: msg.role,
          content: msg.content,
          meta: { backend: 'mock', ...msg.meta },
        },
      ])
    },
    [],
  )

  const mockReply = useCallback(
    (botId: string, userText: string) => {
      const bot = bots.find((b) => b.id === botId)
      if (!bot) return
      const hint =
        bot.kind === 'custom'
          ? '【自定义 bot】已收到。样机回声：'
          : `【${templateMeta(bot.kind).label}】已收到。样机回声：`
      appendMessage(botId, {
        role: 'assistant',
        content: `${hint}\n「${userText.slice(0, 120)}${userText.length > 120 ? '…' : ''}」\n设定：${bot.systemBrief.slice(0, 80)}`,
      })
    },
    [appendMessage, bots],
  )

  const forwardToBot = useCallback(
    (input: { fromBotId: string; toBotId: string; body: string }) => {
      const from = bots.find((b) => b.id === input.fromBotId)
      const to = bots.find((b) => b.id === input.toBotId)
      if (!from || !to || from.id === to.id) return null
      const body = input.body.trim() || '（空转发）'
      const ev: IntercomEvent = {
        id: uid('ic'),
        fromBotId: from.id,
        toBotId: to.id,
        body,
        at: stamp(),
      }
      setIntercom((prev) => [...prev, ev])
      appendMessage(from.id, {
        role: 'system',
        content: `↪️ 已转发给「${to.name}」：${body}`,
        meta: { forwardTo: to.id, intercomId: ev.id },
      })
      appendMessage(to.id, {
        role: 'system',
        content: `📩 来自「${from.name}」的转发：\n${body}`,
        meta: { forwardFrom: from.id, intercomId: ev.id },
      })
      return ev
    },
    [appendMessage, bots],
  )

  const activeBots = useMemo(() => bots.filter((b) => !b.archived), [bots])

  const value = useMemo<GeneralBotsContextValue>(
    () => ({
      bots,
      activeBots,
      intercom,
      getBot,
      getMessages,
      createBot,
      appendMessage,
      forwardToBot,
      mockReply,
    }),
    [
      bots,
      activeBots,
      intercom,
      getBot,
      getMessages,
      createBot,
      appendMessage,
      forwardToBot,
      mockReply,
    ],
  )

  return (
    <GeneralBotsContext.Provider value={value}>
      {children}
    </GeneralBotsContext.Provider>
  )
}

export function useGeneralBots() {
  const ctx = useContext(GeneralBotsContext)
  if (!ctx) {
    throw new Error('useGeneralBots must be used within GeneralBotsProvider')
  }
  return ctx
}
