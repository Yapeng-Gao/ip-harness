import { useMemo, useState, type KeyboardEvent } from 'react'
import { Send, Forward } from 'lucide-react'
import { useGeneralBots } from '../../projects/GeneralBotsContext'
import { expertAccentClass } from '../../projects/experts'
import { kindLabel } from '../../projects/generalBots'

type Props = { botId: string }

/**
 * Free-bot 1:1 chat + mock forward. Custom = 只读；不走 DomainCommand.
 * Project HITL (5226b33) stays on ProjectChatPane / ExpertHitlBridge.
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

  return (
    <div
      className="flex min-h-0 min-w-0 flex-1 flex-col"
      data-testid="general-bot-chat"
      data-bot-id={botId}
    >
      <header className="shrink-0 border-b border-slate-200 bg-white px-4 py-2">
        <div className="flex flex-wrap items-center gap-2">
          <span
            className={`rounded border px-2 py-0.5 text-xs font-semibold ${expertAccentClass(bot.accent)}`}
          >
            {bot.name}
          </span>
          <span className="rounded border border-emerald-200 bg-emerald-50 px-1.5 py-px text-[10px] text-emerald-800">
            自由 · {kindLabel(bot.kind)}
          </span>
          {!bot.catalogAgentId ? (
            <span className="rounded border border-slate-200 bg-slate-50 px-1.5 py-px text-[10px] text-slate-500">
              只读 · 无写库
            </span>
          ) : (
            <span className="rounded border border-amber-200 bg-amber-50 px-1.5 py-px text-[10px] text-amber-900">
              模板 · 写库须 HITL
            </span>
          )}
        </div>
        <p className="mt-1 text-[11px] text-slate-500">{bot.systemBrief}</p>
      </header>

      <div className="min-h-0 flex-1 space-y-2 overflow-y-auto px-4 py-2">
        {messages.map((m) => (
          <div
            key={m.id}
            className={`max-w-[90%] rounded-lg px-3 py-2 text-sm leading-relaxed ${
              m.role === 'user'
                ? 'ml-auto bg-slate-900 text-white'
                : m.role === 'system'
                  ? 'border border-slate-200 bg-slate-50 text-xs text-slate-600'
                  : 'border border-slate-200 bg-white text-slate-800'
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
            <div className="mt-1 text-[10px] opacity-60">{m.at}</div>
          </div>
        ))}
      </div>

      <div className="sticky bottom-0 z-10 shrink-0 border-t border-slate-200 bg-white px-3 py-2 shadow-[0_-6px_16px_rgba(15,23,42,0.04)]">
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
              确认转发
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
        <div className="mb-1.5 flex flex-wrap gap-1">
          <button
            type="button"
            onClick={() => setForwardOpen((v) => !v)}
            disabled={others.length === 0}
            className="btn-press focus-ring inline-flex items-center gap-1 rounded-full border border-slate-200 bg-slate-50 px-2.5 py-1 text-[11px] font-medium text-slate-700 hover:bg-white disabled:opacity-40"
            data-testid="general-bot-forward-open"
          >
            <Forward className="h-3 w-3" aria-hidden />
            转发给 bot…
          </button>
        </div>
        <div className="flex items-end gap-2">
          <textarea
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
            onKeyDown={onKey}
            rows={2}
            placeholder="一对一消息 · Enter 发送 · 可转发"
            className="focus-ring min-h-[2.5rem] flex-1 resize-none rounded-md border border-slate-200 bg-slate-50 px-3 py-2 text-sm"
            aria-label="消息"
            data-testid="general-bot-composer"
          />
          <button
            type="button"
            onClick={sendUser}
            className="btn-press focus-ring hit-40 inline-flex items-center gap-1 rounded-md bg-slate-900 px-3 py-2 text-xs font-medium text-white"
            data-testid="general-bot-send"
          >
            <Send className="h-3.5 w-3.5" aria-hidden />
            发送
          </button>
        </div>
        <p className="mt-1 text-[10px] text-slate-400">
          护栏：样机无真 LLM · 自定义默认无写库 · 项目 HITL 路径未改
        </p>
      </div>
    </div>
  )
}
