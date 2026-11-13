import { useState } from 'react'

type TabId = 'summary' | 'artifact' | 'worklog'

const TABS: { id: TabId; label: string }[] = [
  { id: 'summary', label: '摘要' },
  { id: 'artifact', label: '成果' },
  { id: 'worklog', label: '办理摘记' },
]

type Props = {
  open: boolean
  title: string
  summary: string
  artifact: string
  worklog: string
  onClose: () => void
}

export function DeliverableDrawer({
  open,
  title,
  summary,
  artifact,
  worklog,
  onClose,
}: Props) {
  const [tab, setTab] = useState<TabId>('summary')
  const [copied, setCopied] = useState(false)
  const [seenTitle, setSeenTitle] = useState(title)
  if (open && title !== seenTitle) {
    setSeenTitle(title)
    setTab('summary')
    setCopied(false)
  }

  if (!open) return null

  const text = tab === 'summary' ? summary : tab === 'artifact' ? artifact : worklog

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(text)
      setCopied(true)
    } catch {
      setCopied(false)
    }
  }

  return (
    <div className="fixed inset-0 z-40 flex justify-end" data-testid="deliverable-drawer">
      <button
        type="button"
        className="absolute inset-0 bg-slate-900/25"
        aria-label="关闭交付物"
        onClick={onClose}
      />
      <aside
        role="dialog"
        aria-labelledby="deliverable-drawer-title"
        className="relative flex h-full w-full max-w-md flex-col border-l border-slate-200 bg-white shadow-[var(--shadow-elevated)]"
      >
        <header className="flex items-start justify-between gap-3 border-b border-slate-100 px-4 py-3">
          <div className="min-w-0">
            <p className="text-[10px] font-semibold text-slate-400">交付物</p>
            <h2 id="deliverable-drawer-title" className="truncate text-[15px] font-semibold text-slate-900">
              {title}
            </h2>
          </div>
          <button
            type="button"
            className="btn-press focus-ring rounded-md border border-slate-200 px-2 py-1 text-[11px] text-slate-600"
            onClick={onClose}
            data-testid="deliverable-drawer-close"
          >
            关闭
          </button>
        </header>
        <div className="flex items-center gap-1 px-3 pt-3" role="tablist" aria-label="交付物文件">
          {TABS.map((item) => {
            const on = tab === item.id
            return (
              <button
                key={item.id}
                type="button"
                role="tab"
                aria-selected={on}
                data-testid={`deliverable-tab-${item.id}`}
                className={`btn-press focus-ring rounded-full px-2.5 py-1 text-[11px] font-semibold ${
                  on ? 'bg-slate-900 text-white' : 'bg-slate-50 text-slate-600'
                }`}
                onClick={() => {
                  setTab(item.id)
                  setCopied(false)
                }}
              >
                {item.label}
              </button>
            )
          })}
          <button
            type="button"
            className="btn-press focus-ring ml-auto rounded-md border border-slate-200 px-2 py-1 text-[11px] font-medium text-slate-700"
            data-testid="deliverable-copy"
            onClick={() => void copy()}
          >
            {copied ? '已复制' : '复制'}
          </button>
        </div>
        <pre
          className="m-3 min-h-0 flex-1 overflow-auto whitespace-pre-wrap rounded-[var(--radius-md)] bg-slate-50 p-3 font-sans text-[12px] leading-relaxed text-slate-800"
          data-testid="deliverable-body"
        >
          {text || '这一栏还没有正文。'}
        </pre>
      </aside>
    </div>
  )
}
