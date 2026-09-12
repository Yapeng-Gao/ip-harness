import { matchSessionSearch } from '@shared/utils/sessionSearch'
import { NavLink, useNavigate, useLocation, Link } from 'react-router-dom'
import {
  Plus,
  MessageSquare,
  MoreHorizontal,
  Network,
  Search,
  Pencil,
  Archive,
  ChevronDown,
  Home,
  Users,
} from 'lucide-react'
import { useEffect, useMemo, useRef, useState } from 'react'
import { useApp } from '@shared/context/AppContext'
import { useAgents } from '@shared/context/AgentContext'
import { RUN_STATUS_LABEL, getAgent, AGENT_CATALOG, AGENT_TIER_LABEL } from '@shared/data/agents'
import {
  sessionBizBadges,
  BIZ_BADGE_CLASS,
} from './session/sessionGates'
import { agentSessionPath, midInboxHref } from '../lib/deepLinks'

const STATUS_DOT: Record<string, string> = {
  running: 'bg-sky-500',
  needs_human: 'bg-amber-500',
  done: 'bg-emerald-500',
  queued: 'bg-slate-400',
  failed: 'bg-rose-500',
}

/** Mail-like session list sidebar for AgentShell. */
export function AgentSessionSidebar() {
  const { workspace, getCase, hasBlockingInvoiceForCase, role } = useApp()
  const {
    visibleSessions,
    createSession,
    patchSession,
    archiveSession,
    sessionSearch,
    setSessionSearch,
    showArchivedSessions,
    setShowArchivedSessions,
  } = useAgents()
  const navigate = useNavigate()
  const loc = useLocation()
  const [overflowOpen, setOverflowOpen] = useState(false)
  const overflowRef = useRef<HTMLDivElement>(null)
  const [renamingId, setRenamingId] = useState<string | null>(null)
  const [renameDraft, setRenameDraft] = useState('')
  const [rowMenuId, setRowMenuId] = useState<string | null>(null)
  const rowMenuRef = useRef<HTMLDivElement>(null)
  const [agentFilterOpen, setAgentFilterOpen] = useState(false)
  const [filterMenuOpen, setFilterMenuOpen] = useState(false)
  const filterMenuRef = useRef<HTMLDivElement>(null)
  const [archiveToast, setArchiveToast] = useState<{ id: string; title: string } | null>(null)
  const archiveToastTimer = useRef<number | null>(null)

  const archiveWithUndo = (sessionId: string, title: string) => {
    archiveSession(sessionId)
    setArchiveToast({ id: sessionId, title })
    if (archiveToastTimer.current) window.clearTimeout(archiveToastTimer.current)
    archiveToastTimer.current = window.setTimeout(() => setArchiveToast(null), 5000)
  }

  const undoArchive = () => {
    if (!archiveToast) return
    patchSession(archiveToast.id, { archived: false })
    setArchiveToast(null)
    if (archiveToastTimer.current) window.clearTimeout(archiveToastTimer.current)
  }

  useEffect(() => {
    if (!overflowOpen) return
    const onDoc = (e: MouseEvent) => {
      if (overflowRef.current && !overflowRef.current.contains(e.target as Node)) {
        setOverflowOpen(false)
      }
    }
    document.addEventListener('mousedown', onDoc)
    return () => document.removeEventListener('mousedown', onDoc)
  }, [overflowOpen])

  useEffect(() => {
    if (!rowMenuId) return
    const onDoc = (e: MouseEvent) => {
      if (rowMenuRef.current && !rowMenuRef.current.contains(e.target as Node)) {
        setRowMenuId(null)
      }
    }
    document.addEventListener('mousedown', onDoc)
    return () => document.removeEventListener('mousedown', onDoc)
  }, [rowMenuId])

  useEffect(() => {
    if (!filterMenuOpen) return
    const onDoc = (e: MouseEvent) => {
      if (filterMenuRef.current && !filterMenuRef.current.contains(e.target as Node)) {
        setFilterMenuOpen(false)
      }
    }
    document.addEventListener('mousedown', onDoc)
    return () => document.removeEventListener('mousedown', onDoc)
  }, [filterMenuOpen])

  const [statusFilter, setStatusFilter] = useState<
    'all' | 'needs_human' | 'running' | 'done' | 'archived'
  >('all')
  const [agentFilter, setAgentFilter] = useState<string>('all')

  const sorted = useMemo(
    () =>
      [...visibleSessions].sort((a, b) => b.updatedAt.localeCompare(a.updatedAt)),
    [visibleSessions],
  )

  const statusCounts = useMemo(() => {
    const c = { all: sorted.length, needs_human: 0, running: 0, done: 0, archived: 0 }
    for (const s of sorted) {
      if (s.archived) c.archived++
      if (s.status === 'needs_human') c.needs_human++
      else if (s.status === 'running' || s.status === 'queued') c.running++
      else if (s.status === 'done') c.done++
    }
    return c
  }, [sorted])

  const agentCounts = useMemo(() => {
    const m = new Map<string, number>()
    for (const s of sorted) {
      const k = s.agentId === 'auto' ? 'auto' : s.agentId
      m.set(k, (m.get(k) ?? 0) + 1)
    }
    return m
  }, [sorted])

  const filtered = useMemo(() => {
    return sorted.filter((s) => {
      if (statusFilter === 'archived') {
        if (!s.archived) return false
      } else {
        if (statusFilter === 'needs_human' && s.status !== 'needs_human') return false
        if (
          statusFilter === 'running' &&
          s.status !== 'running' &&
          s.status !== 'queued'
        )
          return false
        if (statusFilter === 'done' && s.status !== 'done') return false
      }
      if (agentFilter !== 'all') {
        if (agentFilter === 'auto') {
          if (s.agentId !== 'auto') return false
        } else if (s.agentId !== agentFilter) return false
      }
      const caseTitle = s.caseId ? (getCase(s.caseId)?.title ?? '') : ''
      if (!matchSessionSearch(s, sessionSearch, caseTitle)) return false
      return true
    })
  }, [sorted, statusFilter, agentFilter, sessionSearch, getCase])

  const newSession = () => {
    const s = createSession({
      goal: '',
      agentId: 'auto',
      title: '新 IP 任务会话',
    })
    if (!s) return
    navigate(agentSessionPath(s.id), { state: { focusComposer: true } })
  }

  const commitRename = (id: string) => {
    const title = renameDraft.trim()
    if (title) patchSession(id, { title })
    setRenamingId(null)
    setRenameDraft('')
  }

  const extraActive =
    statusFilter === 'running' ||
    statusFilter === 'done' ||
    agentFilter !== 'all'

  const clearExtras = () => {
    setStatusFilter('all')
    setAgentFilter('all')
    setAgentFilterOpen(false)
    setShowArchivedSessions(false)
  }

  const navCls = ({ isActive }: { isActive: boolean }) =>
    `btn-press focus-ring relative flex flex-1 flex-col items-center justify-center gap-0.5 px-1 py-1.5 text-[11px] sm:flex-row sm:gap-1 sm:text-xs ${
      isActive
        ? 'font-semibold text-slate-900 after:absolute after:inset-x-1 after:bottom-0 after:h-0.5 after:rounded-full after:bg-slate-900'
        : 'font-normal text-slate-500 hover:text-slate-800'
    }`

  return (
    <>
      <aside className="shell-aside flex w-[min(13rem,40vw)] min-w-[10rem] max-w-[14.5rem] shrink-0 flex-col sm:w-52 lg:w-56">
        <div className="border-b border-slate-100 px-2.5 py-2">
          <button
            type="button"
            onClick={newSession}
            className="btn-press focus-ring hit-40 flex w-full items-center justify-center gap-1.5 rounded-[var(--radius-sm)] bg-slate-900 px-3 py-1.5 text-xs font-medium text-white hover:bg-slate-800"
          >
            <Plus className="h-3.5 w-3.5" aria-hidden /> 新建会话
          </button>
        </div>

        <nav
          className="flex gap-0 border-b border-slate-100 px-0.5 py-1"
          aria-label="办理导航"
        >
          <NavLink to="/agent" end className={navCls}>
            <Home className="h-3 w-3 shrink-0" aria-hidden />
            开始
          </NavLink>
          <NavLink to="/agent/agents" className={navCls}>
            <Users className="h-3 w-3 shrink-0" aria-hidden />
            Agent
          </NavLink>
          <NavLink to="/agent/sessions" end className={navCls}>
            <MessageSquare className="h-3 w-3 shrink-0" aria-hidden />
            会话
          </NavLink>
          <div ref={overflowRef} className="relative shrink-0">
            <button
              type="button"
              onClick={() => setOverflowOpen((v) => !v)}
              className={`btn-press focus-ring relative flex h-full flex-col items-center justify-center gap-0.5 px-1.5 py-1.5 text-[11px] sm:flex-row sm:gap-1 sm:text-xs ${
                loc.pathname.startsWith('/agent/harness')
                  ? 'font-semibold text-slate-900 after:absolute after:inset-x-1 after:bottom-0 after:h-0.5 after:rounded-full after:bg-slate-900'
                  : 'font-normal text-slate-500 hover:text-slate-800'
              }`}
              aria-label="更多"
              aria-expanded={overflowOpen}
            >
              <MoreHorizontal className="h-3 w-3" aria-hidden />
              <span className="hidden sm:inline">更多</span>
            </button>
            {overflowOpen && (
              <div className="menu-enter absolute right-0 top-full z-30 mt-0.5 w-36 overflow-hidden rounded-md border border-slate-200 bg-white shadow-sm">
                <Link
                  to="/agent/harness"
                  onClick={() => setOverflowOpen(false)}
                  className="focus-ring flex items-center gap-2 px-3 py-2 text-xs text-slate-700 hover:bg-slate-50"
                >
                  <Network className="h-3.5 w-3.5 text-slate-400" /> 运行说明
                </Link>
              </div>
            )}
          </div>
        </nav>

        <div className="flex items-center justify-between px-3 pt-2.5 pb-1">
          <span className="nav-section !m-0 !px-0">
            会话
          </span>
          <div className="relative" ref={filterMenuRef}>
            <button
              type="button"
              onClick={() => setFilterMenuOpen((v) => !v)}
              className={`btn-press focus-ring rounded px-1 py-0.5 text-[11px] ${
                extraActive || statusFilter === 'archived'
                  ? 'font-medium text-slate-800'
                  : 'text-slate-400 hover:text-slate-600'
              }`}
              aria-label="筛选"
              aria-expanded={filterMenuOpen}
            >
              筛选
              {(extraActive || statusFilter === 'archived') && (
                <span className="ml-0.5 text-slate-500">·</span>
              )}
            </button>
            {filterMenuOpen && (
              <div className="menu-enter absolute right-0 top-full z-30 mt-1 w-40 overflow-hidden rounded-md border border-slate-200 bg-white shadow-sm">
                <button
                  type="button"
                  className="focus-ring flex w-full items-center gap-2 px-3 py-2 text-left text-xs text-slate-700 hover:bg-slate-50"
                  onClick={() => {
                    setStatusFilter('running')
                    setShowArchivedSessions(false)
                    setFilterMenuOpen(false)
                  }}
                >
                  进行中 · {statusCounts.running}
                </button>
                <button
                  type="button"
                  className="focus-ring flex w-full items-center gap-2 px-3 py-2 text-left text-xs text-slate-700 hover:bg-slate-50"
                  onClick={() => {
                    setStatusFilter('done')
                    setShowArchivedSessions(false)
                    setFilterMenuOpen(false)
                  }}
                >
                  已完成 · {statusCounts.done}
                </button>
                <button
                  type="button"
                  className="focus-ring flex w-full items-center gap-2 px-3 py-2 text-left text-xs text-slate-700 hover:bg-slate-50"
                  onClick={() => {
                    setAgentFilterOpen(true)
                    setFilterMenuOpen(false)
                  }}
                >
                  按 Agent…
                </button>
                <div className="border-t border-slate-100" />
                <button
                  type="button"
                  className="focus-ring flex w-full items-center gap-2 px-3 py-2 text-left text-xs text-slate-700 hover:bg-slate-50"
                  onClick={() => {
                    const next = !(showArchivedSessions && statusFilter === 'archived')
                    setShowArchivedSessions(next)
                    setStatusFilter(next ? 'archived' : 'all')
                    setFilterMenuOpen(false)
                  }}
                >
                  <Archive className="h-3 w-3" /> 已归档
                  {statusCounts.archived > 0 ? ` · ${statusCounts.archived}` : ''}
                </button>
                {(extraActive || statusFilter === 'archived') && (
                  <button
                    type="button"
                    className="focus-ring flex w-full items-center gap-2 border-t border-slate-100 px-3 py-2 text-left text-xs text-slate-500 hover:bg-slate-50"
                    onClick={() => {
                      clearExtras()
                      setFilterMenuOpen(false)
                    }}
                  >
                    清除筛选
                  </button>
                )}
              </div>
            )}
          </div>
        </div>

        <div className="px-2 pb-1.5">
          <label className="sr-only" htmlFor="agent-session-search">
            搜索会话
          </label>
          <div className="relative">
            <Search
              className="pointer-events-none absolute left-2 top-1/2 h-3 w-3 -translate-y-1/2 text-slate-400"
              aria-hidden
            />
            <input
              id="agent-session-search"
              type="search"
              value={sessionSearch}
              onChange={(e) => setSessionSearch(e.target.value)}
              placeholder="搜索"
              className="focus-ring w-full rounded-[var(--radius-sm)] border border-slate-200/90 bg-white py-1.5 pl-6 pr-2 text-xs text-slate-700 placeholder:text-slate-400 shadow-[var(--shadow-rest)]"
            />
          </div>
        </div>

        <div
          className="segmented mx-2 mb-1.5 w-[calc(100%-1rem)]"
          role="group"
          aria-label="会话状态筛选"
        >
          {(
            [
              ['all', '全部', statusCounts.all],
              ['needs_human', '待确认', statusCounts.needs_human],
            ] as const
          ).map(([key, label, count]) => (
            <button
              key={key}
              type="button"
              onClick={() => {
                setStatusFilter(key)
                if (showArchivedSessions) setShowArchivedSessions(false)
              }}
              className="segmented-item btn-press focus-ring flex-1 tabular"
              aria-pressed={statusFilter === key}
            >
              {label}
              <span className="ml-0.5 font-normal opacity-60">{count}</span>
            </button>
          ))}
        </div>

        {(extraActive || agentFilterOpen) && (
          <div className="mx-2 mb-1.5 space-y-1 border-b border-slate-100 pb-1.5">
            {statusFilter === 'running' && (
              <div className="flex items-center justify-between text-[11px] text-slate-600">
                <span>进行中</span>
                <button
                  type="button"
                  className="text-slate-400 hover:text-slate-700"
                  onClick={() => setStatusFilter('all')}
                >
                  清除
                </button>
              </div>
            )}
            {statusFilter === 'done' && (
              <div className="flex items-center justify-between text-[11px] text-slate-600">
                <span>已完成</span>
                <button
                  type="button"
                  className="text-slate-400 hover:text-slate-700"
                  onClick={() => setStatusFilter('all')}
                >
                  清除
                </button>
              </div>
            )}
            {(agentFilterOpen || agentFilter !== 'all') && (
              <div>
                <button
                  type="button"
                  onClick={() => setAgentFilterOpen((v) => !v)}
                  className="btn-press focus-ring flex w-full items-center justify-between text-[11px] text-slate-600"
                  aria-expanded={agentFilterOpen}
                >
                  <span>Agent</span>
                  <ChevronDown className={`h-3 w-3 ${agentFilterOpen ? 'rotate-180' : ''}`} />
                </button>
                {agentFilterOpen && (
                  <select
                    id="agent-filter-select"
                    value={agentFilter}
                    onChange={(e) => setAgentFilter(e.target.value)}
                    className="focus-ring mt-1 w-full truncate rounded border border-slate-200 bg-white px-1.5 py-1 text-xs text-slate-700"
                    aria-label="按 Agent 筛选"
                  >
                    <option value="all">全部（{sorted.length}）</option>
                    <option value="auto">自动匹配（{agentCounts.get('auto') ?? 0}）</option>
                    {AGENT_CATALOG.map((a) => (
                      <option key={a.id} value={a.id}>
                        {AGENT_TIER_LABEL[a.tier]} · {a.name.replace(' Agent', '')}（{agentCounts.get(a.id) ?? 0}）
                      </option>
                    ))}
                  </select>
                )}
              </div>
            )}
          </div>
        )}

        {statusFilter === 'archived' && (
          <div className="mx-2 mb-1.5 text-[11px] text-slate-500">
            已归档 · {statusCounts.archived}
          </div>
        )}

        <div className="flex-1 overflow-y-auto pb-2">
          {filtered.length === 0 ? (
            <div className="px-3 py-6 text-center">
              <p className="text-xs text-slate-400">
                {sorted.length === 0 ? '暂无会话' : '无匹配结果'}
              </p>
              <button
                type="button"
                onClick={newSession}
                className="btn-press focus-ring mt-2 text-xs font-medium text-slate-700 hover:underline"
              >
                新建会话
              </button>
            </div>
          ) : (
            <ul>
              {filtered.map((s) => {
                const ag = s.agentId === 'auto' ? undefined : getAgent(s.agentId)
                const active = loc.pathname === `/agent/sessions/${s.id}`
                const badges = sessionBizBadges({
                  caseId: s.caseId,
                  status: s.status,
                  hitlPending: s.hitlPending,
                  cleared: s.clearedHitlGates ?? [],
                  gates: ag?.hitlGates ?? [],
                  invoiceBlocked: s.caseId
                    ? hasBlockingInvoiceForCase(s.caseId).blocked
                    : false,
                  viewerRole: role,
                })
                return (
                  <li key={s.id} className="group relative">
                    {renamingId === s.id ? (
                      <div className="px-2 py-1">
                        <input
                          autoFocus
                          value={renameDraft}
                          onChange={(e) => setRenameDraft(e.target.value)}
                          onKeyDown={(e) => {
                            if (e.key === 'Enter') commitRename(s.id)
                            if (e.key === 'Escape') {
                              setRenamingId(null)
                              setRenameDraft('')
                            }
                          }}
                          onBlur={() => commitRename(s.id)}
                          className="focus-ring w-full rounded border border-slate-200 px-1.5 py-1 text-xs"
                          aria-label="重命名会话"
                        />
                      </div>
                    ) : (
                      <div
                        className={`list-row flex items-stretch ${
                          active ? 'list-row-active' : 'hover:bg-slate-50'
                        }`}
                      >
                        <Link
                          to={agentSessionPath(s.id)}
                          className="min-w-0 flex-1 px-2.5 py-1.5"
                        >
                          <div className="flex items-start gap-2">
                            <span
                              className={`mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full ${STATUS_DOT[s.status] ?? 'bg-slate-300'}`}
                              aria-hidden
                            />
                            <div className="min-w-0 flex-1">
                              <div
                                className={`truncate text-[13px] leading-snug ${
                                  active
                                    ? 'font-semibold text-slate-900'
                                    : 'font-medium text-slate-800'
                                }`}
                              >
                                {s.title}
                                {s.archived ? (
                                  <span className="ml-1 text-[11px] font-normal text-slate-400">
                                    · 已归档
                                  </span>
                                ) : null}
                              </div>
                              <div className="mt-0.5 truncate text-[11px] text-slate-400">
                                {ag?.name ?? '自动匹配'} · {RUN_STATUS_LABEL[s.status]}
                              </div>
                              {badges.length > 0 && (
                                <div className="mt-0.5 flex flex-wrap gap-0.5">
                                  {badges.map((b) => (
                                    <span
                                      key={b}
                                      className={`inline-flex rounded-full border px-1 py-px text-[9px] font-medium ${BIZ_BADGE_CLASS[b]}`}
                                    >
                                      {b}
                                    </span>
                                  ))}
                                  {(badges.includes('待我确认') ||
                                    badges.includes('待企业确认') ||
                                    badges.includes('待代理')) && (
                                    <a
                                      href={midInboxHref({ sessionId: s.id })}
                                      onClick={(e) => e.stopPropagation()}
                                      className="text-[9px] text-slate-400 hover:text-slate-700 hover:underline"
                                      title="在运营 Inbox 中查看"
                                    >
                                      Inbox
                                    </a>
                                  )}
                                </div>
                              )}
                            </div>
                          </div>
                        </Link>
                        <div
                          className="relative shrink-0 self-center pr-1"
                          ref={rowMenuId === s.id ? rowMenuRef : undefined}
                        >
                          <button
                            type="button"
                            aria-label="会话操作"
                            onClick={(e) => {
                              e.preventDefault()
                              e.stopPropagation()
                              setRowMenuId((id) => (id === s.id ? null : s.id))
                            }}
                            className="btn-press focus-ring rounded p-1 text-slate-400 opacity-0 hover:bg-slate-100 hover:text-slate-700 group-hover:opacity-100 focus:opacity-100"
                          >
                            <MoreHorizontal className="h-3.5 w-3.5" />
                          </button>
                          {rowMenuId === s.id && (
                            <div className="menu-enter absolute right-0 z-40 mt-1 w-28 overflow-hidden rounded-md border border-slate-200 bg-white shadow-sm">
                              <button
                                type="button"
                                className="focus-ring flex w-full items-center gap-2 px-3 py-2 text-left text-xs text-slate-700 hover:bg-slate-50"
                                onClick={() => {
                                  setRenamingId(s.id)
                                  setRenameDraft(s.title)
                                  setRowMenuId(null)
                                }}
                              >
                                <Pencil className="h-3 w-3" /> 重命名
                              </button>
                              {!s.archived ? (
                                <button
                                  type="button"
                                  className="focus-ring flex w-full items-center gap-2 px-3 py-2 text-left text-xs text-slate-700 hover:bg-slate-50"
                                  onClick={() => {
                                    archiveWithUndo(s.id, s.title)
                                    setRowMenuId(null)
                                  }}
                                >
                                  <Archive className="h-3 w-3" /> 归档
                                </button>
                              ) : (
                                <button
                                  type="button"
                                  className="focus-ring flex w-full items-center gap-2 px-3 py-2 text-left text-xs text-slate-700 hover:bg-slate-50"
                                  onClick={() => {
                                    patchSession(s.id, { archived: false })
                                    setRowMenuId(null)
                                  }}
                                >
                                  <Archive className="h-3 w-3" /> 取消归档
                                </button>
                              )}
                            </div>
                          )}
                        </div>
                      </div>
                    )}
                  </li>
                )
              })}
            </ul>
          )}
        </div>

        <div className="border-t border-slate-100 px-3 py-2">
          <div className="truncate text-[11px] text-slate-400">{workspace.chipLabel}</div>
          <Link to="/agent/sessions" className="text-[11px] text-slate-600 hover:underline">
            全部会话 →
          </Link>
        </div>
      </aside>

      {archiveToast && (
        <div className="toast-enter pointer-events-none fixed bottom-6 right-6 z-50 max-w-sm">
          <div className="pointer-events-auto flex items-center gap-3 border border-slate-200 bg-white px-3 py-2 text-xs text-slate-800 shadow-lg">
            <span className="min-w-0 flex-1">已归档 · {archiveToast.title}</span>
            <button
              type="button"
              className="btn-press focus-ring shrink-0 rounded-md border border-slate-200 bg-slate-50 px-2.5 py-1 text-xs font-medium text-slate-800 hover:bg-slate-100"
              onClick={undoArchive}
            >
              撤销
            </button>
          </div>
        </div>
      )}
    </>
  )
}
