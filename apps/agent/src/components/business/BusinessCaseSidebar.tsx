import { Link, useLocation, useNavigate } from 'react-router-dom'
import { useMemo, useState } from 'react'
import {
  Plus,
  Search,
  ChevronDown,
  LayoutGrid,
  FolderKanban,
} from 'lucide-react'
import { useBusinessCases } from '../../business/BusinessCaseContext'

/**
 * 业务壳左侧栏：案子/会话历史（点开进案子工作台）。
 * 「全部案子」可展开搜索；不占中间主区。
 */
export function BusinessCaseSidebar() {
  const { cases, getProgress, getPendingConfirms, stageLabel, primaryCta } =
    useBusinessCases()
  const loc = useLocation()
  const navigate = useNavigate()
  const [allOpen, setAllOpen] = useState(true)
  const [q, setQ] = useState('')

  const activeCaseId = useMemo(() => {
    const m = loc.pathname.match(/^\/agent\/cases\/([^/]+)/)
    return m?.[1] && m[1] !== 'new' ? m[1] : undefined
  }, [loc.pathname])

  const filtered = useMemo(() => {
    const needle = q.trim().toLowerCase()
    if (!needle) return cases
    return cases.filter((c) => {
      const prog = getProgress(c.id)
      const blob = `${c.title} ${c.summary ?? ''} ${stageLabel(prog.stageId)}`.toLowerCase()
      return blob.includes(needle)
    })
  }, [cases, q, getProgress, stageLabel])

  return (
    <aside
      className="business-case-sidebar flex w-[min(15rem,42vw)] min-w-[11.5rem] max-w-[16rem] shrink-0 flex-col border-r border-slate-200/90 bg-[#f5f5f7]"
      data-testid="business-case-sidebar"
    >
      <div className="shrink-0 px-2.5 pt-3 pb-1.5">
        <button
          type="button"
          onClick={() => navigate('/agent/cases/new')}
          className="btn-press focus-ring hit-40 flex w-full items-center justify-center gap-1.5 rounded-[var(--radius-md)] bg-slate-900 px-2.5 text-[13px] font-semibold text-white shadow-sm hover:bg-slate-800"
          data-testid="business-side-new-case"
          aria-label="开一个新案子"
        >
          <Plus className="h-4 w-4 shrink-0" strokeWidth={2.25} aria-hidden />
          开一个新案子
        </button>
      </div>

      <div className="min-h-0 flex-1 overflow-y-auto px-2 py-1">
        <button
          type="button"
          onClick={() => setAllOpen((v) => !v)}
          className="focus-ring mb-1 flex w-full items-center justify-between rounded-md px-2 py-1.5 text-[11px] font-semibold uppercase tracking-wide text-slate-500 hover:bg-white/70 hover:text-slate-700"
          aria-expanded={allOpen}
          data-testid="business-side-all-toggle"
        >
          <span>全部案子</span>
          <ChevronDown
            className={`h-3.5 w-3.5 transition ${allOpen ? 'rotate-0' : '-rotate-90'}`}
            aria-hidden
          />
        </button>

        {allOpen && (
          <>
            <label className="relative mb-2 block px-0.5">
              <Search
                className="pointer-events-none absolute left-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-slate-400"
                aria-hidden
              />
              <input
                value={q}
                onChange={(e) => setQ(e.target.value)}
                placeholder="搜索案子"
                className="focus-ring w-full rounded-md border border-slate-200 bg-white py-1.5 pl-8 pr-2 text-[12px] text-slate-800 placeholder:text-slate-400"
                data-testid="business-side-search"
                aria-label="搜索案子"
              />
            </label>

            <ul className="space-y-0.5" data-testid="business-side-case-list">
              {filtered.length === 0 && (
                <li
                  className="px-2 py-4 text-center text-[11px] text-slate-400"
                  data-testid="business-side-empty"
                >
                  {cases.length === 0 ? '还没有案子' : '无匹配案子'}
                </li>
              )}
              {filtered.map((c) => {
                const prog = getProgress(c.id)
                const pending = getPendingConfirms(c.id)
                const cta = primaryCta(c.id)
                const selected = activeCaseId === c.id
                return (
                  <li key={c.id}>
                    <Link
                      to={`/agent/cases/${c.id}`}
                      className={`focus-ring hit-40 flex w-full flex-col gap-0.5 rounded-[var(--radius-sm)] px-2.5 py-2 text-left transition ${
                        selected
                          ? 'bg-white font-semibold text-slate-900 shadow-sm ring-1 ring-slate-200/80'
                          : 'font-medium text-slate-600 hover:bg-white/80 hover:text-slate-800'
                      }`}
                      data-testid={`business-side-case-${c.id}`}
                      aria-current={selected ? 'page' : undefined}
                    >
                      <span className="flex items-center gap-1.5 truncate text-[13px] leading-snug">
                        <FolderKanban
                          className="h-3.5 w-3.5 shrink-0 opacity-50"
                          aria-hidden
                        />
                        <span className="truncate">{c.title}</span>
                      </span>
                      <span className="truncate pl-5 text-[10px] font-normal text-slate-400">
                        {stageLabel(prog.stageId)}
                        {pending.length > 0
                          ? ` · ${pending.length} 待确认`
                          : cta.action === 'confirm'
                            ? ` · ${cta.label}`
                            : ''}
                      </span>
                    </Link>
                  </li>
                )
              })}
            </ul>
          </>
        )}
      </div>

      <div className="shrink-0 border-t border-slate-200/80 px-2 py-2">
        <Link
          to="/agent/catalog"
          className="focus-ring hit-40 flex w-full items-center gap-1.5 rounded-[var(--radius-sm)] px-2.5 text-[12px] text-slate-500 hover:bg-white/70 hover:text-slate-700"
          data-testid="business-side-expert-bench"
          title="专家工作台（旁路，非冷启动）"
        >
          <LayoutGrid className="h-3.5 w-3.5 shrink-0 opacity-70" aria-hidden />
          专家工作台
        </Link>
      </div>
    </aside>
  )
}
