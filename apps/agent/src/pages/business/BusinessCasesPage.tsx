import { Link, useNavigate } from 'react-router-dom'
import { Bell, ArrowUp, LayoutGrid } from 'lucide-react'
import { useMemo, useState, type FormEvent, type KeyboardEvent } from 'react'
import { useBusinessCases } from '../../business/BusinessCaseContext'

export type BusinessHomeStartState = {
  summary?: string
  title?: string
  chip?: 'disclosure' | 'research'
}

/**
 * /agent 开聊首页（ChatGPT/Kimi/Grok 空态）
 * 中间：大标题 + 主输入；历史在左侧栏；待确认仅一行预览 + 顶栏铃铛。
 * 仍非 Catalog 冷启动；专家工作台旁路。
 */
export function BusinessCasesPage() {
  const { getPendingConfirms, cases } = useBusinessCases()
  const navigate = useNavigate()
  const inbox = getPendingConfirms()
  const [draft, setDraft] = useState('')

  const pendingPreview = useMemo(() => {
    if (inbox.length === 0) return null
    const first = inbox[0]
    const c = cases.find((x) => x.id === first.caseId)
    return {
      count: inbox.length,
      label: `${c?.title ?? '案子'} · ${first.title}`,
      href: `/agent/pending/${first.id}`,
    }
  }, [inbox, cases])

  const goNew = (state?: BusinessHomeStartState) => {
    navigate('/agent/cases/new', { state })
  }

  const onSubmit = (e?: FormEvent) => {
    e?.preventDefault()
    const text = draft.trim()
    if (text) {
      goNew({ summary: text, title: text.slice(0, 40) })
    } else {
      goNew()
    }
  }

  const onKeyDown = (e: KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      onSubmit()
    }
  }

  return (
    <div
      className="relative flex min-h-0 flex-1 flex-col overflow-y-auto bg-white"
      data-testid="business-cases-page"
      data-home="chat"
    >
      {/* 一行待确认预览 · 不占满首屏 */}
      {pendingPreview && (
        <div
          className="shrink-0 border-b border-amber-100 bg-amber-50/70 px-4 py-2"
          data-testid="business-inbox-preview"
        >
          <div className="mx-auto flex max-w-2xl items-center gap-2 px-1 py-0.5 text-[12px] text-amber-950">
            <Link
              to={pendingPreview.href}
              className="focus-ring flex min-w-0 flex-1 items-center gap-2 rounded-md hover:bg-amber-100/60"
              data-testid="business-inbox-preview-row"
            >
              <Bell className="h-3.5 w-3.5 shrink-0 text-amber-700" aria-hidden />
              <span className="min-w-0 flex-1 truncate">
                <span className="font-semibold">待我确认</span>
                <span className="mx-1 text-amber-800/70">·</span>
                {pendingPreview.label}
              </span>
              <span className="shrink-0 rounded-full bg-amber-600 px-1.5 py-px text-[10px] font-semibold text-white">
                {pendingPreview.count}
              </span>
            </Link>
            <Link
              to="/agent/pending"
              className="focus-ring shrink-0 rounded-md px-1.5 py-0.5 text-[11px] font-medium text-amber-800 underline-offset-2 hover:underline"
              data-testid="business-inbox-link"
            >
              全部
            </Link>
          </div>
        </div>
      )}

      <div className="flex flex-1 flex-col items-center justify-center px-4 py-10 sm:px-6">
        <div className="w-full max-w-xl text-center">
          <p className="text-[11px] font-medium uppercase tracking-wider text-slate-400">
            知产 Agent
          </p>
          <h1
            className="mt-2 text-balance text-[28px] font-semibold tracking-tight text-slate-900 sm:text-[32px]"
            data-testid="business-home-title"
          >
            今天要办什么？
          </h1>
          <p className="mt-2 text-pretty text-sm text-slate-500">
            描述你要办的事，或直接开一个新案子 · 历史在左侧
          </p>

          <form
            onSubmit={onSubmit}
            className="mt-8 text-left"
            data-testid="business-home-composer"
          >
            <div className="rounded-2xl border border-slate-200 bg-slate-50/80 p-2 shadow-sm focus-within:border-slate-300 focus-within:bg-white focus-within:shadow-md">
              <textarea
                value={draft}
                onChange={(e) => setDraft(e.target.value)}
                onKeyDown={onKeyDown}
                rows={3}
                placeholder="描述你要办的事…"
                className="focus-ring w-full resize-none border-0 bg-transparent px-3 py-2 text-[15px] text-slate-900 placeholder:text-slate-400 outline-none"
                data-testid="business-home-input"
                aria-label="描述你要办的事"
              />
              <div className="flex flex-wrap items-center justify-between gap-2 px-1 pb-1 pt-0.5">
                <button
                  type="button"
                  onClick={() => goNew()}
                  className="btn-press focus-ring rounded-full border border-slate-200 bg-white px-3 py-1.5 text-[12px] font-medium text-slate-700 hover:bg-slate-50"
                  data-testid="business-new-case"
                >
                  开一个新案子
                </button>
                <button
                  type="submit"
                  className="btn-press focus-ring inline-flex h-9 w-9 items-center justify-center rounded-full bg-slate-900 text-white hover:bg-slate-800"
                  data-testid="business-home-send"
                  aria-label="开始"
                  title="开始"
                >
                  <ArrowUp className="h-4 w-4" strokeWidth={2.5} aria-hidden />
                </button>
              </div>
            </div>
          </form>

          <div
            className="mt-4 flex flex-wrap items-center justify-center gap-2"
            data-testid="business-home-chips"
          >
            <button
              type="button"
              onClick={() =>
                goNew({
                  chip: 'disclosure',
                  summary: '从交底开始：整理技术交底与发明点',
                  title: '交底整理',
                })
              }
              className="btn-press focus-ring rounded-full border border-slate-200 bg-white px-3 py-1.5 text-[12px] text-slate-600 hover:border-slate-300 hover:bg-slate-50"
              data-testid="business-home-chip-disclosure"
            >
              从交底开始
            </button>
            <button
              type="button"
              onClick={() =>
                goNew({
                  chip: 'research',
                  summary: '从查新开始：检索现有技术与可专利性',
                  title: '查新检索',
                })
              }
              className="btn-press focus-ring rounded-full border border-slate-200 bg-white px-3 py-1.5 text-[12px] text-slate-600 hover:border-slate-300 hover:bg-slate-50"
              data-testid="business-home-chip-research"
            >
              从查新开始
            </button>
          </div>

          <div className="mt-8 flex flex-wrap items-center justify-center gap-x-4 gap-y-1 text-[11px] text-slate-400">
            <Link
              to="/agent/catalog"
              className="inline-flex items-center gap-1 hover:text-slate-700 hover:underline"
              data-testid="business-expert-bench"
            >
              <LayoutGrid className="h-3 w-3" aria-hidden />
              专家工作台
            </Link>
            {!pendingPreview && (
              <Link
                to="/agent/pending"
                className="hover:text-slate-700 hover:underline"
                data-testid="business-inbox-link"
              >
                待我确认
              </Link>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
