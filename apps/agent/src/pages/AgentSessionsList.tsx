import { useMemo, useRef, useState } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { Plus, Search, Pencil, Archive } from 'lucide-react'
import { useAgents } from '@shared/context/AgentContext'
import { useApp } from '@shared/context/AppContext'
import { getAgent } from '@shared/data/agents'
import { PageHeader, EmptyState } from '@shared/components/PageHeader'
import {
  sessionBizBadges,
  BIZ_BADGE_CLASS,
} from '../components/session/sessionGates'
import { workbenchHref } from '../lib/deepLinks'
import { agentRunStatusLabel } from '../lib/statusLabels'
import { useProjectFolder } from '../projects/ProjectFolderContext'
import {
  buildSessionListRows,
  parseSourceParam,
  rowMatchesSearch,
  rowMatchesSource,
  rowMatchesStatusFilter,
  type SessionListRow,
  type SessionSourceFilter,
} from '../lib/sessionListRows'

export function AgentSessionsList() {
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
  const { projects, threads } = useProjectFolder()
  const { getCase, hasBlockingInvoiceForCase, role } = useApp()
  const navigate = useNavigate()
  const [searchParams, setSearchParams] = useSearchParams()
  const urlFilter = searchParams.get('filter')
  const sourceFilter = parseSourceParam(searchParams.get('source'))
  const [renamingId, setRenamingId] = useState<string | null>(null)
  const [renameDraft, setRenameDraft] = useState('')
  const [archiveToast, setArchiveToast] = useState<{ id: string; title: string } | null>(null)
  const archiveToastTimer = useRef<number | null>(null)
  const [createToast, setCreateToast] = useState<string | null>(null)
  const createToastTimer = useRef<number | null>(null)

  const showCreateFailedToast = () => {
    setCreateToast('当前角色不能新建会话，请切换为企业 IP / 代理所')
    if (createToastTimer.current) window.clearTimeout(createToastTimer.current)
    createToastTimer.current = window.setTimeout(() => setCreateToast(null), 4500)
  }

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

  const allRows = useMemo(
    () =>
      buildSessionListRows({
        sessions: visibleSessions,
        threads,
        projects,
      }),
    [visibleSessions, threads, projects],
  )

  const sorted = useMemo(() => {
    return allRows.filter((row) => {
      if (!rowMatchesSource(row, sourceFilter)) return false
      if (!rowMatchesStatusFilter(row, urlFilter)) return false
      const caseTitle = row.caseId ? (getCase(row.caseId)?.title ?? '') : ''
      return rowMatchesSearch(row, sessionSearch, caseTitle)
    })
  }, [allRows, sourceFilter, urlFilter, sessionSearch, getCase])

  const sourceCounts = useMemo(() => {
    const c = { all: 0, general: 0, project: 0 }
    for (const row of allRows) {
      if (!rowMatchesStatusFilter(row, urlFilter)) continue
      const caseTitle = row.caseId ? (getCase(row.caseId)?.title ?? '') : ''
      if (!rowMatchesSearch(row, sessionSearch, caseTitle)) continue
      c.all++
      if (row.source === 'general') c.general++
      else c.project++
    }
    return c
  }, [allRows, urlFilter, sessionSearch, getCase])

  const setSource = (next: SessionSourceFilter) => {
    setSearchParams(
      (prev) => {
        const p = new URLSearchParams(prev)
        if (next === 'all') p.delete('source')
        else p.set('source', next)
        return p
      },
      { replace: true },
    )
  }

  const newSession = () => {
    const s = createSession({ goal: '', agentId: 'auto', title: '新 IP 任务会话' })
    if (!s) {
      showCreateFailedToast()
      return
    }
    navigate(`/agent/sessions/${s.id}`, { state: { focusComposer: true } })
  }

  const commitRename = (id: string) => {
    const title = renameDraft.trim()
    if (title) patchSession(id, { title })
    setRenamingId(null)
    setRenameDraft('')
  }

  const openRow = (row: SessionListRow) => {
    navigate(row.href)
  }

  const listTitle =
    urlFilter === 'needs_human'
      ? '待确认会话'
      : urlFilter === 'running'
        ? '进行中会话'
        : urlFilter === 'done'
          ? '已完成会话'
          : urlFilter === 'archived'
            ? '已归档会话'
            : '会话历史'

  const listContext =
    urlFilter === 'needs_human'
      ? '通用单聊 + 项目专家线程 · 筛选：待确认'
      : urlFilter
        ? `通用单聊 + 项目专家线程 · 筛选：${urlFilter}`
        : '通用单聊 + 项目专家线程 · 可用来源筛选；项目夹入口仍在「项目」'

  return (
    <div className="flex-1 overflow-y-auto px-6 py-8 lg:px-8">
      <PageHeader
        title={listTitle}
        context={listContext}
        primary={{
          label: '新建会话',
          onClick: newSession,
          icon: <Plus className="h-4 w-4" aria-hidden />,
        }}
      >
        <div className="mt-4 flex flex-wrap items-center gap-2">
          <div className="relative min-w-[200px] flex-1">
            <Search
              className="pointer-events-none absolute left-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-slate-400"
              aria-hidden
            />
            <input
              type="search"
              value={sessionSearch}
              onChange={(e) => setSessionSearch(e.target.value)}
              placeholder="搜索标题 / 目标 / 案件 / 项目"
              aria-label="搜索会话"
              data-testid="sessions-main-search"
              className="focus-ring w-full rounded border border-slate-200 bg-white py-1.5 pl-8 pr-3 text-sm text-slate-800 placeholder:text-slate-400"
            />
          </div>
          <button
            type="button"
            onClick={() => setShowArchivedSessions(!showArchivedSessions)}
            className={`btn-press focus-ring rounded-md border px-3 py-1.5 text-xs ${
              showArchivedSessions
                ? 'border-slate-300 bg-slate-100 text-slate-800'
                : 'border-slate-200 bg-white text-slate-600 hover:bg-slate-50'
            }`}
          >
            {showArchivedSessions ? '含已归档' : '已归档'}
          </button>
        </div>

        <div
          className="mt-3 flex flex-wrap items-center gap-1.5"
          role="group"
          aria-label="来源筛选"
          data-testid="sessions-source-chips"
        >
          {(
            [
              ['all', '全部', sourceCounts.all],
              ['general', '通用', sourceCounts.general],
              ['project', '项目线程', sourceCounts.project],
            ] as const
          ).map(([key, label, count]) => (
            <button
              key={key}
              type="button"
              onClick={() => setSource(key)}
              aria-pressed={sourceFilter === key}
              data-testid={`sessions-source-${key}`}
              className={`btn-press focus-ring rounded-full border px-2.5 py-1 text-[11px] font-medium tabular ${
                sourceFilter === key
                  ? 'border-slate-800 bg-slate-800 text-white'
                  : 'border-slate-200 bg-white text-slate-600 hover:bg-slate-50'
              }`}
            >
              {label}
              <span className="opacity-70"> · {count}</span>
            </button>
          ))}
        </div>
      </PageHeader>

      <div className="overflow-hidden border border-slate-200 bg-white">
        {sorted.length === 0 ? (
          <EmptyState
            title={urlFilter || sourceFilter !== 'all' ? '无匹配历史' : '暂无会话历史'}
            description={
              urlFilter || sourceFilter !== 'all'
                ? '当前筛选下没有条目。可切换来源 chip，或点左侧「全部」清除状态筛选。项目夹仍可从「项目」进入。'
                : '这里聚合通用单聊与项目专家线程。新建会话，或从「项目」打开专家线程。'
            }
            primary={{
              label: '新建会话',
              onClick: newSession,
              icon: <Plus className="h-4 w-4" aria-hidden />,
            }}
            secondary={{
              label: '打开工作台待办',
              onClick: () => {
                window.location.href = workbenchHref('/workbench')
              },
            }}
          />
        ) : (
          <table className="w-full text-left text-sm" data-testid="sessions-aggregated-table">
            <thead className="border-b border-slate-100 bg-slate-50/80 text-[11px] font-medium text-slate-400">
              <tr>
                <th className="px-4 py-2" scope="col">
                  标题
                </th>
                <th className="px-4 py-2" scope="col">
                  来源
                </th>
                <th className="px-4 py-2" scope="col">
                  案件
                </th>
                <th className="px-4 py-2" scope="col">
                  状态
                </th>
                <th className="px-4 py-2" scope="col">
                  更新
                </th>
                <th className="px-4 py-2" scope="col">
                  <span className="sr-only">操作</span>
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {sorted.map((row) => {
                const s = row.general
                const ag =
                  s && s.agentId !== 'auto' ? getAgent(s.agentId) : null
                const c = row.caseId ? getCase(row.caseId) : undefined
                const badges = s
                  ? sessionBizBadges({
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
                  : row.pendingHitl
                    ? (['待确认'] as string[])
                    : []
                const rowKey =
                  row.source === 'project'
                    ? `project:${row.projectId}:${row.expertId}:${row.id}`
                    : `general:${row.id}`
                return (
                  <tr
                    key={rowKey}
                    role="link"
                    tabIndex={0}
                    data-source={row.source}
                    data-testid={
                      row.source === 'project'
                        ? 'sessions-row-project'
                        : 'sessions-row-general'
                    }
                    className="focus-row cursor-pointer hover:bg-slate-50/80"
                    onClick={() => openRow(row)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' || e.key === ' ') {
                        e.preventDefault()
                        openRow(row)
                      }
                    }}
                  >
                    <td className="px-4" style={{ height: 44, minHeight: 44 }}>
                      {renamingId === row.id && row.source === 'general' ? (
                        <input
                          autoFocus
                          value={renameDraft}
                          onClick={(e) => e.stopPropagation()}
                          onChange={(e) => setRenameDraft(e.target.value)}
                          onKeyDown={(e) => {
                            e.stopPropagation()
                            if (e.key === 'Enter') commitRename(row.id)
                            if (e.key === 'Escape') {
                              setRenamingId(null)
                              setRenameDraft('')
                            }
                          }}
                          onBlur={() => commitRename(row.id)}
                          className="focus-ring w-full max-w-xs rounded border border-slate-200 px-2 py-1 text-sm"
                          aria-label="重命名会话"
                        />
                      ) : (
                        <span
                          className="flex min-h-[44px] items-center font-medium text-slate-900"
                          title={
                            row.source === 'project'
                              ? '打开项目专家线程'
                              : '打开会话'
                          }
                        >
                          <span>
                            {row.title}
                            {row.archived ? (
                              <span className="ml-1 text-xs font-normal text-slate-400">
                                · 已归档
                              </span>
                            ) : null}
                            {row.goal ? (
                              <span className="mt-0.5 block max-w-xs truncate text-xs font-normal text-slate-400">
                                {row.goal}
                              </span>
                            ) : null}
                          </span>
                        </span>
                      )}
                    </td>
                    <td className="px-4 py-3 text-xs text-slate-600">
                      <span
                        className={`inline-flex max-w-[14rem] truncate rounded-full border px-2 py-0.5 text-[11px] font-medium ${
                          row.source === 'project'
                            ? 'border-violet-200 bg-violet-50 text-violet-800'
                            : 'border-slate-200 bg-slate-50 text-slate-700'
                        }`}
                        data-testid="sessions-source-chip"
                        title={row.sourceLabel}
                      >
                        {row.sourceLabel}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-xs text-slate-600">
                      {c ? (
                        <span className="min-w-0 truncate text-slate-600">
                          {c.caseNo ? `${c.caseNo} · ` : ''}
                          {c.title}
                        </span>
                      ) : (
                        '—'
                      )}
                    </td>
                    <td className="px-4 py-3 text-xs text-slate-600">
                      <div>
                        {s
                          ? agentRunStatusLabel(s.status)
                          : row.pendingHitl
                            ? '待确认'
                            : '项目线程'}
                      </div>
                      {badges.length > 0 && (
                        <div className="mt-1 flex flex-wrap items-center gap-1.5">
                          {badges.map((b) => (
                            <span
                              key={b}
                              className={`agent-biz-badge inline-flex rounded-full border px-1.5 py-0.5 text-[11px] font-medium ${
                                BIZ_BADGE_CLASS[b as keyof typeof BIZ_BADGE_CLASS] ??
                                'border-amber-200 bg-amber-50 text-amber-800'
                              }`}
                            >
                              {b}
                            </span>
                          ))}
                        </div>
                      )}
                    </td>
                    <td className="px-4 py-3 text-xs text-slate-400">
                      {row.updatedAt}
                    </td>
                    <td className="px-4 py-3">
                      {row.source === 'general' && s ? (
                        <div
                          className="flex items-center gap-1"
                          onClick={(e) => e.stopPropagation()}
                        >
                          <button
                            type="button"
                            aria-label="重命名"
                            className="btn-press focus-ring rounded p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-700"
                            onClick={() => {
                              setRenamingId(s.id)
                              setRenameDraft(s.title)
                            }}
                          >
                            <Pencil className="h-3.5 w-3.5" />
                          </button>
                          {!s.archived ? (
                            <button
                              type="button"
                              aria-label="归档"
                              className="btn-press focus-ring rounded p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-700"
                              onClick={() => archiveWithUndo(s.id, s.title)}
                            >
                              <Archive className="h-3.5 w-3.5" />
                            </button>
                          ) : (
                            <button
                              type="button"
                              aria-label="取消归档"
                              className="btn-press focus-ring rounded p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-700"
                              onClick={() =>
                                patchSession(s.id, { archived: false })
                              }
                            >
                              <Archive className="h-3.5 w-3.5" />
                            </button>
                          )}
                        </div>
                      ) : (
                        <span className="text-[11px] text-slate-300">—</span>
                      )}
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        )}
      </div>

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

      {createToast && (
        <div className="toast-enter pointer-events-none fixed bottom-6 right-6 z-50 max-w-sm">
          <div role="status" className="ui-toast ui-toast-info">
            {createToast}
          </div>
        </div>
      )}
    </div>
  )
}
