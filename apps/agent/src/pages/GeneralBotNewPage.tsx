import { useState, type FormEvent } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { GeneralBotSidebar } from '../components/general/GeneralBotSidebar'
import { useGeneralBots } from '../projects/GeneralBotsContext'
import {
  BOT_TEMPLATE_OPTIONS,
  freeBotPath,
  type FreeBotKind,
} from '../projects/generalBots'

/**
 * Mock create bot — name + kind + systemBrief → in-memory.
 */
export function GeneralBotNewPage() {
  const { createBot } = useGeneralBots()
  const navigate = useNavigate()
  const [name, setName] = useState('')
  const [kind, setKind] = useState<FreeBotKind>('custom')
  const [systemBrief, setSystemBrief] = useState(
    BOT_TEMPLATE_OPTIONS[0]!.defaultBrief,
  )

  const onKindChange = (k: FreeBotKind) => {
    setKind(k)
    const meta = BOT_TEMPLATE_OPTIONS.find((t) => t.kind === k)
    if (meta) setSystemBrief(meta.defaultBrief)
  }

  const onSubmit = (e: FormEvent) => {
    e.preventDefault()
    const bot = createBot({ name, kind, systemBrief })
    navigate(freeBotPath(bot.id), { replace: true })
  }

  return (
    <div className="flex min-h-0 flex-1" data-testid="general-bot-new-page">
      <GeneralBotSidebar />
      <div className="flex min-h-0 min-w-0 flex-1 flex-col overflow-y-auto">
        <div className="mx-auto w-full max-w-md px-4 py-8">
          <p className="text-[11px] font-medium uppercase tracking-wider text-emerald-700">
            通用 · 自由 bot
          </p>
          <h1 className="mt-1 text-lg font-semibold text-slate-900">新建 bot</h1>
          <p className="mt-1 text-sm text-slate-500">
            样机内存 · 不进项目花名册 · 自定义默认只读（无 DomainCommand）
          </p>

          <form
            onSubmit={onSubmit}
            className="mt-6 space-y-4 rounded-xl border border-slate-200 bg-white p-4 shadow-sm"
            data-testid="general-bot-new-form"
          >
            <label className="block">
              <span className="text-xs font-medium text-slate-700">名称</span>
              <input
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
                placeholder="例如：专利速记助手"
                className="focus-ring mt-1 w-full rounded-md border border-slate-200 px-3 py-2 text-sm"
                data-testid="general-bot-new-name"
              />
            </label>

            <label className="block">
              <span className="text-xs font-medium text-slate-700">类型 kind</span>
              <select
                value={kind}
                onChange={(e) => onKindChange(e.target.value as FreeBotKind)}
                className="focus-ring mt-1 w-full rounded-md border border-slate-200 px-3 py-2 text-sm"
                data-testid="general-bot-new-kind"
              >
                {BOT_TEMPLATE_OPTIONS.map((t) => (
                  <option key={t.kind} value={t.kind}>
                    {t.label}
                  </option>
                ))}
              </select>
            </label>

            <label className="block">
              <span className="text-xs font-medium text-slate-700">
                短设定 systemBrief
              </span>
              <textarea
                value={systemBrief}
                onChange={(e) => setSystemBrief(e.target.value)}
                rows={4}
                className="focus-ring mt-1 w-full resize-y rounded-md border border-slate-200 px-3 py-2 text-sm"
                data-testid="general-bot-new-brief"
              />
            </label>

            <div className="flex items-center gap-2 pt-1">
              <button
                type="submit"
                className="btn-press focus-ring hit-40 rounded-md bg-emerald-700 px-4 py-2 text-sm font-medium text-white"
                data-testid="general-bot-new-submit"
              >
                创建并开聊
              </button>
              <Link to="/agent" className="text-xs text-slate-500 hover:underline">
                取消
              </Link>
            </div>
          </form>
        </div>
      </div>
    </div>
  )
}
