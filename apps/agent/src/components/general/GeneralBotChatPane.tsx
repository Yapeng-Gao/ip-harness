import { useMemo, useState, type KeyboardEvent } from 'react'
import { Send, Forward } from 'lucide-react'
import { useGeneralBots } from '../../projects/GeneralBotsContext'
import { expertAccentClass } from '../../projects/experts'

type Props = { botId: string }

/**
 * Grok-like 1:1 stream + sticky composer. No badge/honesty walls.
 * Spec: agent-grok-replica.md — forward stays secondary.
 */
export function GeneralBotChatPane({ botId }: Props) {
  const {
    getBot,
    getMessages,
    appendMessage,
    mockReply,
    forwardToBot,
    activeBots,
  } = useGeneralBots()
  const bot = getBot(botId)
  const messages = getMessages(botId)
  const [draft, setDraft] = useState('')
  const [forwardOpen, setForwardOpen] = useState(false)
  const [forwardTarget, setForwardTarget] = useState('')

  const others = useMemo(
    () => activeBots.filter((b) => b.id !== botId),
    [activeBots, botId],
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

  const visible = messages.filter((m) => m.role !== 'system')

  return (
    <div
      className="flex min-h-0 min-w-0 flex-1 flex-col"
      data-testid="general-bot-chat"
      data-bot-id={botId}
    >
      <header className="shrink-0 border-b border-slate-100 px-4 py-2.5">
        <div className="flex items-center gap-2">
          <span
            className={`flex h-7 w-7 items-center justify-center rounded-full border text-[10px] ${expertAccentClass(bot.accent)}`}
            aria-hidden
          >
            {bot.name.slice(0, 1)}
          </span>
          <h1 className="truncate text-sm font-semibold text-slate-900">
            {bot.name}
          </h1>
        </div>
      </header>

      <div className="min-h-0 flex-1 space-y-3 overflow-y-auto px-4 py-4">
        {visible.length === 0 && (
          <p className="py-8 text-center text-sm text-slate-400">
            开始和 {bot.name} 聊天
          </p>
        )}
        {visible.map((m) => (
          <div
            key={m.id}
            className={`max-w-[85%] rounded-2xl px-3.5 py-2.5 text-sm leading-relaxed ${
              m.role === 'user'
                ? 'ml-auto bg-slate-900 text-white'
                : 'border border-slate-100 bg-slate-50 text-slate-800'
            }`}
            data-testid={
              m.meta?.forwardFrom
                ? 'general-bot-forward-recv'
                : m.meta?.forwardTo
                  ? 'general-bot-forward-sent'
                  : undefined
            }
          >
            <div className="whitespace-pre-wrap">{m.content}</div>
          </div>
        ))}
      </div>

      <div className="sticky bottom-0 z-10 shrink-0 border-t border-slate-200 bg-white px-3 py-2.5 shadow-[0_-6px_16px_rgba(15,23,42,0.04)]">
        {forwardOpen && (
          <div
            className="mb-2 flex flex-wrap items-center gap-2 rounded-md border border-sky-200 bg-sky-50/80 px-2 py-1.5"
            data-testid="general-bot-forward-panel"
          >
            <span className="text-[11px] font-medium text-sky-900">转发给</span>
            <select
              className="focus-ring rounded border border-sky-200 bg-white px-2 py-1 text-xs"
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
              className="btn-press focus-ring hit-40 rounded-md bg-sky-700 px-2.5 py-1 text-xs font-medium text-white disabled:opacity-40"
              data-testid="general-bot-forward-confirm"
            >
              确认
            </button>
            <button
              type="button"
              onClick={() => setForwardOpen(false)}
              className="text-[11px] text-slate-500 hover:underline"
            >
              取消
            </button>
          </div>
        )}
        <div className="flex items-end gap-2">
          <button
            type="button"
            onClick={() => setForwardOpen((v) => !v)}
            disabled={others.length === 0}
            className="btn-press focus-ring mb-0.5 inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-full border border-slate-200 text-slate-500 hover:bg-slate-50 disabled:opacity-30"
            aria-label="转发给 bot"
            data-testid="general-bot-forward-open"
            title="转发"
          >
            <Forward className="h-3.5 w-3.5" aria-hidden />
          </button>
          <textarea
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
            onKeyDown={onKey}
            rows={1}
            placeholder="发消息…"
            className="focus-ring max-h-32 min-h-[2.5rem] flex-1 resize-none rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5 text-sm"
            aria-label="消息"
            data-testid="general-bot-composer"
          />
          <button
            type="button"
            onClick={sendUser}
            className="btn-press focus-ring hit-40 inline-flex h-9 items-center gap-1 rounded-full bg-slate-900 px-3.5 text-xs font-medium text-white"
            data-testid="general-bot-send"
          >
            <Send className="h-3.5 w-3.5" aria-hidden />
            发送
          </button>
        </div>
      </div>
    </div>
  )
}
