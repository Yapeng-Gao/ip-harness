import { useMemo, useState, type KeyboardEvent } from 'react'
import { Send, Forward } from 'lucide-react'
import { useGeneralBots } from '../../projects/GeneralBotsContext'
import { expertAccentClass } from '../../projects/experts'

type Props = {
  botId: string
  /** L2 team intercom; hide on L1 single-assistant shell */
  showForward?: boolean
}

/**
 * 1:1 stream + sticky composer. Optical user/assistant bubbles; no tip walls.
 * Spec: agent-grok-replica.md (L2) / agent-layers L1 reuses without forward.
 */
export function GeneralBotChatPane({ botId, showForward = true }: Props) {
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
  const canSend = draft.trim().length > 0

  return (
    <div
      className="flex min-h-0 min-w-0 flex-1 flex-col"
      data-testid="general-bot-chat"
      data-bot-id={botId}
    >
      <header className="shrink-0 border-b border-slate-100/90 px-5 py-3">
        <div className="flex items-center gap-2.5">
          <span
            className={`flex h-8 w-8 items-center justify-center rounded-full border text-[11px] font-semibold ${expertAccentClass(bot.accent)}`}
            aria-hidden
          >
            {bot.name.slice(0, 1)}
          </span>
          <h1 className="truncate text-[15px] font-semibold tracking-tight text-slate-900 text-balance">
            {bot.name}
          </h1>
        </div>
      </header>

      <div className="general-grok-messages min-h-0 flex-1 space-y-3.5 overflow-y-auto px-5 py-5">
        {visible.length === 0 && (
          <p className="py-12 text-center text-[14px] leading-relaxed text-slate-400">
            开始和 {bot.name} 聊天
          </p>
        )}
        {visible.map((m) => {
          const isUser = m.role === 'user'
          return (
            <div
              key={m.id}
              className={`general-grok-bubble max-w-[min(36rem,85%)] px-4 py-2.5 text-[15px] leading-[1.55] text-pretty ${
                isUser
                  ? 'general-grok-bubble--user ml-auto'
                  : 'general-grok-bubble--assistant mr-auto'
              }`}
              data-role={m.role}
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
        {/* Concentric shell: outer 16 + pad 6 ≈ inner 10 */}
        <div className="general-grok-composer-shell flex items-end gap-2 rounded-2xl border border-slate-200 bg-[#f5f5f7] p-1.5 shadow-[inset_0_1px_0_rgba(255,255,255,0.7)]">
          {showForward && (
          <button
            type="button"
            onClick={() => setForwardOpen((v) => !v)}
            disabled={others.length === 0}
            className="btn-press focus-ring mb-0.5 inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-full text-slate-500 hover:bg-white hover:text-slate-700 disabled:opacity-30"
            aria-label="转发给 bot"
            data-testid="general-bot-forward-open"
            title="转发"
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
