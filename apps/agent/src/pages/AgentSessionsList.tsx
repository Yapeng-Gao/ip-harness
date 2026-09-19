import { useMemo, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Plus, Briefcase, Search, Pencil, Archive } from 'lucide-react'
import { useAgents } from '@shared/context/AgentContext'
import { matchSessionSearch } from '@shared/utils/sessionSearch'
import { useApp } from '@shared/context/AppContext'
import { RUN_STATUS_LABEL, getAgent } from '@shared/data/agents'
import { PageHeader, EmptyState } from '@shared/components/PageHeader'
import {
  sessionBizBadges,
  BIZ_BADGE_CLASS,
} from '../components/session/sessionGates'
import { agentSessionPath, midHref, midInboxHref, workbenchHref } from '../lib/deepLinks'

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
  const { getCase, hasBlockingInvoiceForCase, role } = useApp()
  const navigate = useNavigate()
  const [renamingId, setRenamingId] = useState<string | null>(null)
  const [renameDraft, setRenameDraft] = useState('')
  const [archiveToast, setArchiveToast] = useState<{ id: string; title: string } | null>(null)
  const archiveToastTimer = useRef<number | null>(null)
  const [createToast, setCreateToast] = useState<string | null>(null)
  const createToastTimer = useRef<number | null>(null)

  const showCreateFailedToast = () => {
    setCreateToast('当前 Persona 不能新建会话，请切换为企业 IP / 代理所')
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

  const sorted = useMemo(() => {
    return [...visibleSessions]
      .filter((s) => {
        const caseTitle = s.caseId ? (getCase(s.caseId)?.title ?? '') : ''
        return matchSessionSearch(s, sessionSearch, caseTitle)
      })
      .sort((a, b) => b.updatedAt.localeCompare(a.updatedAt))
  }, [visibleSessions, sessionSearch, getCase])

  const newSession = () => {
    const s = createSession({ goal: '', agentId: 'auto', title: '新 IP 任务会话' })
    if (!s) {
      showCreateFailedToast()
      return
    }
    navigate(agentSessionPath(s.id), { state: { focusComposer: true } })
  }

  const commitRename = (id: string) => {
    const title = renameDraft.trim()
    if (title) patchSession(id, { title })
    setRenamingId(null)
    setRenameDraft('')
  }

  return (
    <div className="flex-1 overflow-y-auto px-6 py-8 lg:px-8">
      <PageHeader
        title="全部会话"
        context="与左侧共用搜索；状态 / Agent 筛选请用左侧「筛选」"
        primary={{
          label: '新建任务会话',
          onClick: newSession,
          icon: <Plus className="h-4 w-4" aria-hidden />,
        }}
        secondary={{
          label: '回中台案件库',
          onClick: () => {
            window.location.href = midHref('/cases')
          },
          icon: <Briefcase className="h-4 w-4" aria-hidden />,
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
              placeholder="搜索标题 / 目标 / 案件（与左侧同步）"
              aria-label="搜索会话"
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
      </PageHeader>

      <div className="overflow-hidden border border-slate-200 bg-white">
        {sorted.length === 0 ? (
          <EmptyState
            title="暂无任务会话"
            description="新建会话启动，或返回中台案件库继续人工流程。"
            primary={{
              label: '新建任务会话',
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
          <table className="w-full text-left text-sm">
            <thead className="border-b border-slate-100 bg-slate-50/80 text-[11px] font-medium text-slate-400">
              <tr>
                <th className="px-4 py-2" scope="col">
                  标题
                </th>
                <th className="px-4 py-2" scope="col">
                  Agent
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
              {sorted.map((s) => {
                const ag = s.agentId === 'auto' ? null : getAgent(s.agentId)
                const c = s.caseId ? getCase(s.caseId) : undefined
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
                  <tr
                    key={s.id}
                    role="link"
                    tabIndex={0}
                    className="focus-row cursor-pointer hover:bg-slate-50/80"
                    onClick={() =>
                      navigate(
                        s.status === 'needs_human' || s.hitlPending
                          ? agentSessionPath(s.id, { focus: 'hitl' })
                          : agentSessionPath(s.id),
                      )
                    }
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' || e.key === ' ') {
                        e.preventDefault()
                        navigate(
                          s.status === 'needs_human' || s.hitlPending
                            ? agentSessionPath(s.id, { focus: 'hitl' })
                            : agentSessionPath(s.id),
                        )
                      }
                    }}
                  >
                    <td className="px-4" style={{ height: 44, minHeight: 44 }}>
                      {renamingId === s.id ? (
                        <input
                          autoFocus
                          value={renameDraft}
                          onClick={(e) => e.stopPropagation()}
                          onChange={(e) => setRenameDraft(e.target.value)}
                          onKeyDown={(e) => {
                            e.stopPropagation()
                            if (e.key === 'Enter') commitRename(s.id)
                            if (e.key === 'Escape') {
                              setRenamingId(null)
                              setRenameDraft('')
                            }
                          }}
                          onBlur={() => commitRename(s.id)}
                          className="focus-ring w-full max-w-xs rounded border border-slate-200 px-2 py-1 text-sm"
                          aria-label="重命名会话"
                        />
                      ) : (
                        <span
                          className="flex min-h-[44px] items-center font-medium text-slate-900"
                          title="打开会话"
                        >
                          <span>
                            {s.title}
                            {s.archived ? (
                              <span className="ml-1 text-xs font-normal text-slate-400">
                                · 已归档
                              </span>
                            ) : null}
                            <span className="mt-0.5 block max-w-xs truncate text-xs font-normal text-slate-400">
                              {s.goal}
                            </span>
                          </span>
                        </span>
                      )}
                    </td>
                    <td className="px-4 py-3 text-xs text-slate-600">
                      {ag?.name ?? '自动匹配'}
                    </td>
                    <td className="px-4 py-3 text-xs text-slate-600">
                      {c ? (
                        <span className="inline-flex max-w-full items-center gap-1.5">
                          <span className="min-w-0 truncate text-slate-600">
                            {c.caseNo ? `${c.caseNo} · ` : ''}
                            {c.title}
                          </span>
                          <button
                            type="button"
                            className="btn-press focus-ring shrink-0 rounded border border-slate-200 bg-white px-1.5 py-0.5 text-[10px] font-medium text-slate-600 hover:bg-slate-50 hover:text-slate-900"
                            title="打开中台案详"
                            onClick={(e) => {
                              e.stopPropagation()
                              e.preventDefault()
                              window.location.href = midHref(`/cases/${c.id}`)
                            }}
                          >
                            案详
                          </button>
                        </span>
                      ) : (
                        '—'
                      )}
                    </td>
                    <td className="px-4 py-3 text-xs text-slate-600">
                      <div>{RUN_STATUS_LABEL[s.status]}</div>
                      {badges.length > 0 && (
                        <div className="mt-1 flex flex-wrap items-center gap-1">
                          {badges.map((b) => (
                            <span
                              key={b}
                              className={`inline-flex rounded-full border px-1.5 py-0.5 text-[10px] font-medium ${BIZ_BADGE_CLASS[b]}`}
                            >
                              {b}
                            </span>
                          ))}
                          {(badges.includes('待我确认') ||
                            badges.includes('待企业确认') ||
                            badges.includes('待代理')) && (
                            <a
                              href={midInboxHref({ sessionId: s.id })}
                              onClick={(e) => {
                                e.stopPropagation()
                                e.preventDefault()
                                window.location.href = midInboxHref({
                                  sessionId: s.id,
                                })
                              }}
                              className="text-[10px] text-slate-400 underline-offset-2 hover:text-slate-700 hover:underline"
                              title="在运营 Inbox 中查看"
                            >
                              运营 Inbox
                            </a>
                          )}
                        </div>
                      )}
                    </td>
                    <td className="px-4 py-3 text-xs text-slate-400">{s.updatedAt}</td>
                    <td className="px-4 py-3">
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
                            onClick={() => patchSession(s.id, { archived: false })}
                          >
                            <Archive className="h-3.5 w-3.5" />
                          </button>
                        )}
                      </div>
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
          <div
            role="status"
            className="pointer-events-auto border border-amber-200 bg-amber-50 px-3 py-2 text-xs text-amber-950 shadow-lg"
          >
            {createToast}
          </div>
        </div>
      )}
    </div>
  )
}
