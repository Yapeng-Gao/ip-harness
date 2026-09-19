import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from 'react'
import {
  BOT_SEED_DRAFT,
  BOT_SEED_ORCHESTRATOR,
  BOT_SEED_SEARCH,
  collabKindFromBotMessage,
  seedFreeBots,
  templateMeta,
  type BotMessage,
  type BotMessageKind,
  type CollabKind,
  type CollabTask,
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
  return {
    id: uid('msg'),
    botId: bot.id,
    role: 'system',
    content: bot.name,
    at: stamp(),
    meta: { backend: 'mock' },
  }
}

type CreateBotInput = {
  name: string
  kind: FreeBotKind
  systemBrief: string
}

type BotSendInput = {
  fromBotId: string
  toBotId: string
  body: string
  /** Spec BotMessage.kind; default note for generic, forward uses user path */
  kind?: BotMessageKind | 'forward'
  taskId?: string
  /** true = spontaneous bot script (default for botSendToBot) */
  spontaneous?: boolean
}

type GeneralBotsContextValue = {
  bots: FreeBot[]
  activeBots: FreeBot[]
  intercom: IntercomEvent[]
  botMessages: BotMessage[]
  collabTasks: CollabTask[]
  collabRunBusy: boolean
  getBot: (id: string) => FreeBot | undefined
  getMessages: (botId: string) => FreeBotMessage[]
  getLatestTask: () => CollabTask | undefined
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
  /** Spontaneous / scripted bot→bot (spec BotMessage). */
  botSendToBot: (input: BotSendInput) => BotMessage | IntercomEvent | null
  /**
   * Mock closed loop (agent-l2-team §3):
   * orch → search request → search result → draft request → draft result → done card
   */
  runCollabLoop: (opts?: {
    orchestratorId?: string
    searchId?: string
    draftId?: string
    goal?: string
  }) => string | null
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
  const [botMessages, setBotMessages] = useState<BotMessage[]>([])
  const [collabTasks, setCollabTasks] = useState<CollabTask[]>([])
  const [collabRunBusy, setCollabRunBusy] = useState(false)
  const botsRef = useRef(bots)
  botsRef.current = bots
  const timersRef = useRef<number[]>([])

  const getBot = useCallback(
    (id: string) => bots.find((b) => b.id === id && !b.archived),
    [bots],
  )

  const getMessages = useCallback(
    (botId: string) => messages.filter((m) => m.botId === botId),
    [messages],
  )

  const getLatestTask = useCallback(
    () => collabTasks[collabTasks.length - 1],
    [collabTasks],
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
      appendMessage(botId, {
        role: 'assistant',
        content: userText.length > 200 ? `${userText.slice(0, 200)}…` : userText,
      })
    },
    [appendMessage, bots],
  )

  const botSendToBot = useCallback(
    (input: BotSendInput) => {
      const list = botsRef.current
      const from = list.find((b) => b.id === input.fromBotId && !b.archived)
      const to = list.find((b) => b.id === input.toBotId && !b.archived)
      if (!from || !to || from.id === to.id) return null
      const body = input.body.trim() || '（空消息）'
      const spontaneous = input.spontaneous !== false && input.kind !== 'forward'
      const msgKind: BotMessageKind =
        input.kind === 'forward' || !input.kind
          ? 'note'
          : input.kind
      const collabKind: CollabKind =
        input.kind === 'forward'
          ? 'forward'
          : collabKindFromBotMessage(msgKind, spontaneous)

      const ev: IntercomEvent = {
        id: uid('ic'),
        fromBotId: from.id,
        toBotId: to.id,
        body,
        at: stamp(),
        kind: collabKind,
        collabRunId: input.taskId,
        taskId: input.taskId,
        spontaneous,
        botMessageKind: msgKind,
      }
      setIntercom((prev) => [...prev, ev])

      let bm: BotMessage | null = null
      if (spontaneous) {
        bm = {
          id: ev.id,
          fromBotId: from.id,
          toBotId: to.id,
          body,
          taskId: input.taskId,
          kind: msgKind,
          at: ev.at,
          spontaneous: true,
        }
        setBotMessages((prev) => [...prev, bm!])
      }

      const sharedMeta = {
        intercomId: ev.id,
        collabKind,
        fromBotId: from.id,
        toBotId: to.id,
        fromBotName: from.name,
        toBotName: to.name,
        collabRunId: input.taskId,
        taskId: input.taskId,
        botMessageKind: msgKind,
        spontaneous,
        backend: 'mock' as const,
      }

      appendMessage(from.id, {
        role: 'assistant',
        content: body,
        meta: { ...sharedMeta, forwardTo: to.id },
      })
      appendMessage(to.id, {
        role: 'assistant',
        content: body,
        meta: { ...sharedMeta, forwardFrom: from.id },
      })
      return bm ?? ev
    },
    [appendMessage],
  )

  const forwardToBot = useCallback(
    (input: { fromBotId: string; toBotId: string; body: string }) => {
      return botSendToBot({
        fromBotId: input.fromBotId,
        toBotId: input.toBotId,
        body: input.body,
        kind: 'forward',
        spontaneous: false,
      }) as IntercomEvent | null
    },
    [botSendToBot],
  )

  const patchTask = useCallback(
    (taskId: string, patch: Partial<CollabTask>) => {
      setCollabTasks((prev) =>
        prev.map((t) =>
          t.id === taskId
            ? { ...t, ...patch, updatedAt: nowIso() }
            : t,
        ),
      )
    },
    [],
  )

  const runCollabLoop = useCallback(
    (opts?: {
      orchestratorId?: string
      searchId?: string
      draftId?: string
      goal?: string
    }) => {
      if (collabRunBusy) return null
      const list = botsRef.current
      const orchId = opts?.orchestratorId ?? BOT_SEED_ORCHESTRATOR
      const searchId = opts?.searchId ?? BOT_SEED_SEARCH
      const draftId = opts?.draftId ?? BOT_SEED_DRAFT
      const orch = list.find((b) => b.id === orchId && !b.archived)
      const search = list.find((b) => b.id === searchId && !b.archived)
      const draft = list.find((b) => b.id === draftId && !b.archived)
      if (!orch || !search || !draft) return null

      const goal =
        opts?.goal?.trim() || '请检索相关现有技术并写一段摘要（样机）'
      const taskId = uid('task')
      const task: CollabTask = {
        id: taskId,
        goal,
        status: 'running',
        steps: [
          { id: 'search-req', label: `分派检索 → ${search.name}`, done: false },
          { id: 'search-res', label: `${search.name} 回执`, done: false },
          { id: 'draft-req', label: `分派撰稿 → ${draft.name}`, done: false },
          { id: 'draft-res', label: `${draft.name} 回执`, done: false },
          { id: 'done', label: '汇总完成', done: false },
        ],
        createdAt: nowIso(),
        updatedAt: nowIso(),
      }
      setCollabTasks((prev) => [...prev, task])

      for (const t of timersRef.current) window.clearTimeout(t)
      timersRef.current = []
      setCollabRunBusy(true)

      // Task card on orch (running)
      appendMessage(orch.id, {
        role: 'assistant',
        content: `【协作任务 · running】${goal}`,
        meta: {
          collabKind: 'note',
          taskId,
          spontaneous: true,
          fromBotId: orch.id,
          fromBotName: orch.name,
        },
      })

      // Step A: orch → search (request) — spontaneous, no user forward
      botSendToBot({
        fromBotId: orch.id,
        toBotId: search.id,
        body: `【request】请检索：${goal}`,
        kind: 'request',
        taskId,
        spontaneous: true,
      })
      patchTask(taskId, {
        steps: task.steps.map((s) =>
          s.id === 'search-req' ? { ...s, done: true } : s,
        ),
      })

      // search script: delay → result
      const t1 = window.setTimeout(() => {
        const hitSummary =
          '【假 Hit 摘要】命中 3 篇：A 公司方法专利 · B 系统公开 · C 对比文件；新颖性关注点：特征 F1/F2。'
        appendMessage(search.id, {
          role: 'assistant',
          content: hitSummary,
          meta: { taskId, backend: 'mock' },
        })
        botSendToBot({
          fromBotId: search.id,
          toBotId: orch.id,
          body: `【result】${hitSummary}`,
          kind: 'result',
          taskId,
          spontaneous: true,
        })
        setCollabTasks((prev) =>
          prev.map((t) =>
            t.id !== taskId
              ? t
              : {
                  ...t,
                  updatedAt: nowIso(),
                  steps: t.steps.map((s) =>
                    s.id === 'search-res' ? { ...s, done: true } : s,
                  ),
                },
          ),
        )

        // Step B: orch → draft with search summary
        botSendToBot({
          fromBotId: orch.id,
          toBotId: draft.id,
          body: `【request】请依据检索摘要撰稿：${hitSummary.slice(0, 80)}…`,
          kind: 'request',
          taskId,
          spontaneous: true,
        })
        setCollabTasks((prev) =>
          prev.map((t) =>
            t.id !== taskId
              ? t
              : {
                  ...t,
                  updatedAt: nowIso(),
                  steps: t.steps.map((s) =>
                    s.id === 'draft-req' ? { ...s, done: true } : s,
                  ),
                },
          ),
        )
      }, 400)
      timersRef.current.push(t1)

      // draft script → result + orch done
      const t2 = window.setTimeout(() => {
        const para =
          '【假段落】本申请针对现有技术 A/B 的不足，提出特征 F1/F2 组合方案，可形成权利要求 1 草案骨架。'
        appendMessage(draft.id, {
          role: 'assistant',
          content: para,
          meta: { taskId, backend: 'mock' },
        })
        botSendToBot({
          fromBotId: draft.id,
          toBotId: orch.id,
          body: `【result】${para}`,
          kind: 'result',
          taskId,
          spontaneous: true,
        })

        appendMessage(orch.id, {
          role: 'assistant',
          content: `【协作任务 · done】已收齐检索与撰稿回执，任务完成。样机无真 LLM / 无写库。`,
          meta: {
            collabKind: 'complete',
            taskId,
            spontaneous: true,
            fromBotId: orch.id,
            fromBotName: orch.name,
            toBotId: draft.id,
            toBotName: draft.name,
          },
        })
        setCollabTasks((prev) =>
          prev.map((t) =>
            t.id !== taskId
              ? t
              : {
                  ...t,
                  status: 'done',
                  updatedAt: nowIso(),
                  steps: t.steps.map((s) => ({ ...s, done: true })),
                },
          ),
        )
        setCollabRunBusy(false)
      }, 900)
      timersRef.current.push(t2)

      return taskId
    },
    [appendMessage, botSendToBot, collabRunBusy, patchTask],
  )

  const activeBots = useMemo(() => bots.filter((b) => !b.archived), [bots])

  const value = useMemo<GeneralBotsContextValue>(
    () => ({
      bots,
      activeBots,
      intercom,
      botMessages,
      collabTasks,
      collabRunBusy,
      getBot,
      getMessages,
      getLatestTask,
      createBot,
      appendMessage,
      forwardToBot,
      botSendToBot,
      runCollabLoop,
      mockReply,
    }),
    [
      bots,
      activeBots,
      intercom,
      botMessages,
      collabTasks,
      collabRunBusy,
      getBot,
      getMessages,
      getLatestTask,
      createBot,
      appendMessage,
      forwardToBot,
      botSendToBot,
      runCollabLoop,
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
