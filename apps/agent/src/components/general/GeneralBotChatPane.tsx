import { useMemo, useState, type KeyboardEvent } from 'react'
import { Send, Forward, GitBranch } from 'lucide-react'
import { useGeneralBots } from '../../projects/GeneralBotsContext'
import { expertAccentClass } from '../../projects/experts'
import {
  BOT_SEED_DRAFT,
  BOT_SEED_ORCHESTRATOR,
  BOT_SEED_SEARCH,
  collabKindLabel,
  isCollabMessage,
  type CollabKind,
  type FreeBotMessage,
} from '../../projects/generalBots'

type Props = {
  botId: string
  /** L2 team intercom; hide on L1 single-assistant shell */
  showForward?: boolean
  /** L2 only: clickable collab task demo (agent-l2-team.md) */
  showCollabLoop?: boolean
}

function collabDirectionLabel(m: FreeBotMessage): string | null {
  const from = m.meta?.fromBotName
  const to = m.meta?.toBotName
  if (from && to) return `${from} → ${to}`
  if (m.meta?.forwardFrom && from) return `← ${from}`
  if (m.meta?.forwardTo && to) return `→ ${to}`
  return null
}

function collabTestId(m: FreeBotMessage): string | undefined {
  const kind = m.meta?.collabKind
  const isReq = kind === 'dispatch' || kind === 'request'
  const isRes = kind === 'receipt' || kind === 'result'
  if (isReq && m.meta?.forwardTo) return 'general-bot-collab-dispatch-sent'
  if (isReq && m.meta?.forwardFrom) return 'general-bot-collab-dispatch-recv'
  if (isRes && m.meta?.forwardTo) return 'general-bot-collab-receipt-sent'
  if (isRes && m.meta?.forwardFrom) return 'general-bot-collab-receipt-recv'
  if (kind === 'complete') return 'general-bot-collab-complete'
  if (m.meta?.forwardFrom) return 'general-bot-forward-recv'
  if (m.meta?.forwardTo) return 'general-bot-forward-sent'
  return undefined
}

/**
 * 1:1 stream + sticky composer.
 * L1: showForward=false, no collab CTA.
 * L2: bot→bot labels +「演示协作任务」(agent-l2-team.md).
 */
export function GeneralBotChatPane({
  botId,
  showForward = true,
  showCollabLoop = false,
}: Props) {
  const {
    getBot,
    getMessages,
    appendMessage,
    mockReply,
    forwardToBot,
    runCollabLoop,
    collabRunBusy,
    getLatestTask,
    activeBots,
  } = useGeneralBots()
  const bot = getBot(botId)
  const messages = getMessages(botId)
  const latestTask = getLatestTask()
  const [draft, setDraft] = useState('')
  const [forwardOpen, setForwardOpen] = useState(false)
  const [forwardTarget, setForwardTarget] = useState('')

  const others = useMemo(
    () => activeBots.filter((b) => b.id !== botId),
    [activeBots, botId],
  )

  const canRunLoop =
    showCollabLoop &&
    botId === BOT_SEED_ORCHESTRATOR &&
    Boolean(
      getBot(BOT_SEED_ORCHESTRATOR) &&
        getBot(BOT_SEED_SEARCH) &&
        getBot(BOT_SEED_DRAFT),
    )

  if (!bot) {
    return (
      <div className="flex flex-1 items-center justify-center text-sm text-slate-500">
        bot 不存在
      </div>
    )
  }

  const sendUser = () => {
    const text = draft.trim()
    if (!text) return
    appendMessage(botId, { role: 'user', content: text })
    setDraft('')
    // Orchestrator: user asking for 检索+摘要 can also kick the mock task
    if (
      showCollabLoop &&
      botId === BOT_SEED_ORCHESTRATOR &&
      /检索|摘要|协作/.test(text)
    ) {
      runCollabLoop({ goal: text })
      return
    }
    mockReply(botId, text)
  }

  const onKey = (e: KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey && !e.nativeEvent.isComposing) {
      e.preventDefault()
      sendUser()
    }
  }

  const doForward = () => {
    const to = forwardTarget || others[0]?.id
    if (!to) return
    const body =
      draft.trim() ||
      messages.filter((m) => m.role === 'user').at(-1)?.content ||
      '请查收下一条转发'
    forwardToBot({ fromBotId: botId, toBotId: to, body })
    setDraft('')
    setForwardOpen(false)
  }

  const doCollabLoop = () => {
    runCollabLoop({
      orchestratorId: BOT_SEED_ORCHESTRATOR,
      searchId: BOT_SEED_SEARCH,
      draftId: BOT_SEED_DRAFT,
    })
  }

  const visible = messages.filter(
    (m) => m.role !== 'system' || isCollabMessage(m),
  )
  const canSend = draft.trim().length > 0
  const showTaskCard =
    showCollabLoop &&
    botId === BOT_SEED_ORCHESTRATOR &&
    latestTask &&
    (collabRunBusy || latestTask.status === 'done' || latestTask.status === 'running')

  return (
    <div
      className="flex min-h-0 min-w-0 flex-1 flex-col"
      data-testid="general-bot-chat"
      data-bot-id={botId}
    >
      <header className="shrink-0 border-b border-slate-100/90 px-5 py-3">
        <div className="flex flex-wrap items-center gap-2.5">
          <span
            className={`flex h-8 w-8 items-center justify-center rounded-full border text-[11px] font-semibold ${expertAccentClass(bot.accent)}`}
            aria-hidden
          >
            {bot.name.slice(0, 1)}
          </span>
          <h1 className="truncate text-[15px] font-semibold tracking-tight text-slate-900 text-balance">
            {bot.name}
          </h1>
          {canRunLoop && (
            <button
              type="button"
              onClick={doCollabLoop}
              disabled={collabRunBusy}
              className="btn-press focus-ring ml-auto inline-flex min-h-8 items-center gap-1.5 rounded-full border border-indigo-200 bg-indigo-50 px-3 py-1 text-[12px] font-semibold text-indigo-800 hover:bg-indigo-100 disabled:opacity-50"
              data-testid="general-bot-collab-loop"
              title="编排 → 检索 → 撰稿 → 汇总（样机自发，无用户转发）"
            >
              <GitBranch className="h-3.5 w-3.5" aria-hidden />
              {collabRunBusy ? '协作中…' : '演示协作任务'}
            </button>
          )}
        </div>
        {showTaskCard && latestTask && (
          <div
            className="mt-2.5 rounded-[var(--radius-md)] border border-indigo-200/80 bg-indigo-50/60 px-3 py-2"
            data-testid="general-bot-collab-task-card"
            data-task-status={latestTask.status}
          >
            <div className="flex items-center gap-2 text-[12px]">
              <span className="font-semibold text-indigo-900">协作任务</span>
              <span
                className={`rounded-full px-1.5 py-0.5 text-[10px] font-bold uppercase tracking-wide ${
                  latestTask.status === 'done'
                    ? 'bg-emerald-100 text-emerald-800'
                    : 'bg-amber-100 text-amber-900'
                }`}
                data-testid="general-bot-collab-task-status"
              >
                {latestTask.status}
              </span>
            </div>
            <p className="mt-0.5 text-[12px] text-indigo-800/90">{latestTask.goal}</p>
            <ul className="mt-1.5 space-y-0.5">
              {latestTask.steps.map((s) => (
                <li
                  key={s.id}
                  className={`text-[11px] ${s.done ? 'text-indigo-700' : 'text-slate-400'}`}
                  data-step-done={s.done ? '1' : '0'}
                >
                  {s.done ? '✓' : '·'} {s.label}
                </li>
              ))}
            </ul>
          </div>
        )}
      </header>

      <div className="general-grok-messages min-h-0 flex-1 space-y-3.5 overflow-y-auto px-5 py-5">
        {visible.length === 0 && (
          <p className="py-12 text-center text-[14px] leading-relaxed text-slate-400">
            开始和 {bot.name} 聊天
            {canRunLoop ? ' · 或点「演示协作任务」看 bot→bot 自发' : ''}
          </p>
        )}
        {visible.map((m) => {
          const isUser = m.role === 'user'
          const collab = isCollabMessage(m)
          const dir = collabDirectionLabel(m)
          const kind = m.meta?.collabKind as CollabKind | undefined
          return (
            <div
              key={m.id}
              className={`general-grok-bubble max-w-[min(36rem,85%)] px-4 py-2.5 text-[15px] leading-[1.55] text-pretty ${
                isUser
                  ? 'general-grok-bubble--user ml-auto'
                  : collab
                    ? 'general-grok-bubble--collab mr-auto'
                    : 'general-grok-bubble--assistant mr-auto'
              }`}
              data-role={m.role}
              data-collab-kind={kind}
              data-spontaneous={m.meta?.spontaneous ? '1' : undefined}
              data-testid={collabTestId(m)}
            >
              {collab && (
                <div
                  className="mb-1.5 flex flex-wrap items-center gap-1.5"
                  data-testid="general-bot-collab-label"
                >
                  <span className="rounded-full bg-indigo-100/90 px-1.5 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-indigo-800">
                    {collabKindLabel(kind)}
                    {m.meta?.spontaneous ? ' · 自发' : ''}
                  </span>
                  {dir && (
                    <span className="text-[11px] font-medium text-indigo-700/90">
                      {dir}
                    </span>
                  )}
                </div>
              )}
              <div className="whitespace-pre-wrap">{m.content}</div>
            </div>
          )
        })}
      </div>

      <div
        className="general-grok-composer sticky bottom-0 z-10 shrink-0 border-t border-slate-200/80 bg-white/95 px-4 pb-3.5 pt-3 backdrop-blur-sm"
        data-testid="general-bot-composer-bar"
      >
        {showForward && forwardOpen && (
          <div
            className="mb-2.5 flex flex-wrap items-center gap-2 rounded-[var(--radius-md)] border border-sky-200 bg-sky-50/80 px-2.5 py-2"
            data-testid="general-bot-forward-panel"
          >
            <span className="text-[12px] font-medium text-sky-900">转发给</span>
            <select
              className="focus-ring rounded-[var(--radius-sm)] border border-sky-200 bg-white px-2 py-1.5 text-[13px]"
              value={forwardTarget || others[0]?.id || ''}
              onChange={(e) => setForwardTarget(e.target.value)}
              aria-label="转发目标 bot"
              data-testid="general-bot-forward-select"
            >
              {others.map((b) => (
                <option key={b.id} value={b.id}>
                  {b.name}
                </option>
              ))}
            </select>
            <button
              type="button"
              onClick={doForward}
              disabled={others.length === 0}
              className="btn-press focus-ring hit-40 rounded-[var(--radius-sm)] bg-sky-700 px-3 py-1.5 text-[13px] font-medium text-white disabled:opacity-40"
              data-testid="general-bot-forward-confirm"
            >
              确认
            </button>
            <button
              type="button"
              onClick={() => setForwardOpen(false)}
              className="focus-ring rounded px-1.5 text-[12px] text-slate-500 hover:underline"
            >
              取消
            </button>
          </div>
        )}
        <div className="general-grok-composer-shell flex items-end gap-2 rounded-2xl border border-slate-200 bg-[#f5f5f7] p-1.5 shadow-[inset_0_1px_0_rgba(255,255,255,0.7)]">
          {showForward && (
            <button
              type="button"
              onClick={() => setForwardOpen((v) => !v)}
              disabled={others.length === 0}
              className="btn-press focus-ring mb-0.5 inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-full text-slate-500 hover:bg-white hover:text-slate-700 disabled:opacity-30"
              aria-label="转发给 bot"
              data-testid="general-bot-forward-open"
              title="转发（用户手动 · 次级）"
            >
              <Forward className="h-4 w-4" strokeWidth={1.75} aria-hidden />
            </button>
          )}
          <textarea
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
            onKeyDown={onKey}
            rows={1}
            placeholder="发消息…"
            className="focus-ring max-h-36 min-h-[2.5rem] flex-1 resize-none rounded-xl border-0 bg-transparent px-2.5 py-2.5 text-[15px] leading-[1.45] text-slate-900 placeholder:text-slate-400"
            aria-label="消息"
            data-testid="general-bot-composer"
          />
          <button
            type="button"
            onClick={sendUser}
            disabled={!canSend}
            className="btn-press focus-ring hit-40 inline-flex h-10 shrink-0 items-center gap-1 rounded-full bg-slate-900 px-3.5 text-[13px] font-semibold text-white disabled:opacity-35"
            data-testid="general-bot-send"
            aria-label="发送"
          >
            <Send className="h-3.5 w-3.5" strokeWidth={2} aria-hidden />
            发送
          </button>
        </div>
      </div>
    </div>
  )
}
