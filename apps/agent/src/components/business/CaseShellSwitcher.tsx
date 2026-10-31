/**
 * 案级顶栏真切换器 · 最近 / 全部 / 开新
 * 仅案级壳挂载；seed 排序，无假官报、无假鉴权。
 */
import { ChevronDown, FolderKanban, Plus } from 'lucide-react'
import { useEffect, useMemo, useRef, useState } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import {
  rankCasesForSwitcher,
  rewriteCasePath,
} from '../../business/caseShellSwitcher'
import { useBusinessCases } from '../../business/BusinessCaseContext'

type Props = {
  activeCaseId: string
}

export function CaseShellSwitcher({ activeCaseId }: Props) {
  const { cases, getProgress, getProcessLogs } = useBusinessCases()
  const loc = useLocation()
  const navigate = useNavigate()
  const [open, setOpen] = useState(false)
  const rootRef = useRef<HTMLDivElement>(null)

  const ranked = useMemo(
    () =>
      rankCasesForSwitcher(
        cases,
        (id) => getProgress(id)?.updatedAt,
        (id) => {
          const logs = getProcessLogs(id)
          if (logs.length === 0) return undefined
          return logs.reduce((max, l) => (l.at > max ? l.at : max), logs[0]!.at)
        },
        6,
      ),
    [cases, getProgress, getProcessLogs],
  )

  useEffect(() => {
    if (!open) return
    const onDoc = (e: MouseEvent) => {
      if (rootRef.current && !rootRef.current.contains(e.target as Node)) {
        setOpen(false)
      }
    }
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setOpen(false)
    }
    document.addEventListener('mousedown', onDoc)
    window.addEventListener('keydown', onKey)
    return () => {
      document.removeEventListener('mousedown', onDoc)
      window.removeEventListener('keydown', onKey)
    }
  }, [open])

  const goCase = (nextId: string) => {
    setOpen(false)
    if (nextId === activeCaseId) return
    navigate(rewriteCasePath(loc.pathname, nextId))
  }

  return (
    <div
      ref={rootRef}
      className="relative ml-1 flex items-center gap-0.5 rounded-lg border border-slate-200/90 bg-slate-50/80 p-0.5"
      data-testid="case-shell-switcher"
      role="group"
      aria-label="案子切换：最近、全部、开新"
    >
      <button
        type="button"
        data-testid="case-switch-recent"
        aria-expanded={open}
        aria-haspopup="listbox"
        onClick={() => setOpen((v) => !v)}
        className={`btn-press focus-ring inline-flex items-center gap-0.5 rounded-md px-2 py-1 text-[12px] font-medium ${
          open
            ? 'bg-white text-slate-900 shadow-sm'
            : 'text-slate-600 hover:text-slate-900'
        }`}
      >
        最近
        <ChevronDown className="h-3 w-3 opacity-70" aria-hidden />
      </button>
      <Link
        to="/agent/cases"
        data-testid="case-switch-all"
        className="btn-press focus-ring rounded-md px-2 py-1 text-[12px] font-medium text-slate-600 hover:text-slate-900"
      >
        全部
      </Link>
      <Link
        to="/agent/cases/new"
        data-testid="case-switch-new"
        className="btn-press focus-ring inline-flex items-center gap-0.5 rounded-md px-2 py-1 text-[12px] font-medium text-slate-600 hover:text-slate-900"
      >
        <Plus className="h-3 w-3" aria-hidden />
        开新
      </Link>

      {open ? (
        <ul
          role="listbox"
          aria-label="最近案子"
          data-testid="case-switch-recent-menu"
          className="absolute left-0 top-full z-40 mt-1 min-w-[220px] overflow-hidden rounded-lg border border-slate-200 bg-white py-1 shadow-lg"
        >
          {ranked.length === 0 ? (
            <li className="px-3 py-2 text-xs text-slate-500">还没有案子</li>
          ) : (
            ranked.map((c) => {
              const selected = c.id === activeCaseId
              return (
                <li key={c.id} role="option" aria-selected={selected}>
                  <button
                    type="button"
                    data-testid={`case-switch-item-${c.id}`}
                    data-selected={selected ? '1' : '0'}
                    onClick={() => goCase(c.id)}
                    className={`flex w-full items-center gap-2 px-3 py-1.5 text-left text-[12px] ${
                      selected
                        ? 'bg-slate-50 font-medium text-slate-900'
                        : 'text-slate-700 hover:bg-slate-50'
                    }`}
                  >
                    <FolderKanban
                      className="h-3.5 w-3.5 shrink-0 text-slate-400"
                      aria-hidden
                    />
                    <span className="min-w-0 flex-1 truncate">{c.title}</span>
                    {selected ? (
                      <span className="shrink-0 text-[10px] text-slate-400">
                        本案
                      </span>
                    ) : null}
                  </button>
                </li>
              )
            })
          )}
        </ul>
      ) : null}
    </div>
  )
}
