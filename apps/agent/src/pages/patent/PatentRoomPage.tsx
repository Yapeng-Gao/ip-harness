import { useEffect, useRef, useState } from 'react'
import { Link, Navigate, useParams } from 'react-router-dom'
import { Pause, Play } from 'lucide-react'
import { useProjectFolder } from '../../projects/ProjectFolderContext'
import {
  getProjectExpert,
  isOrchestratorExpert,
} from '../../projects/experts'
import type { ProjectExpertId, RoomMessage } from '../../projects/types'
import { SeatDualFilePanel } from '../../components/patent/SeatDualFilePanel'
import { caseFolderListing } from '../../projects/patentDeliverables'

/**
 * Mode C · Grok-style room with bot spontaneous loop.
 * Spec: agent-patent-shell §2
 */
export function PatentRoomPage() {
  const { projectId } = useParams<{ projectId: string }>()
  const {
    getProject,
    roomMessages,
    appendRoomMessage,
    clearRoomMessages,
    runPatentRoomLoop,
    roomLoopBusy,
    pauseRoomLoop,
  } = useProjectFolder()
  const [draft, setDraft] = useState('')
  const [focusSeat, setFocusSeat] = useState<ProjectExpertId>('orchestrator')
  const bottomRef = useRef<HTMLDivElement>(null)

  const project = projectId ? getProject(projectId) : undefined
  const msgs = roomMessages.filter((m) => m.projectId === projectId)

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [msgs.length])

  if (!projectId) return <Navigate to="/agent" replace />
  if (!project || project.domainPackId !== 'patent') {
    return (
      <div className="flex flex-1 items-center justify-center text-sm text-slate-500">
        仅专利项目可开群聊 · <Link to="/agent">Catalog</Link>
      </div>
    )
  }

  const sendUser = () => {
    const text = draft.trim()
    if (!text) return
    appendRoomMessage({
      projectId,
      fromExpertId: 'user',
      toExpertId: 'all',
      body: text,
      kind: 'user',
    })
    setDraft('')
  }

  return (
    <div className="flex min-h-0 flex-1 flex-col" data-testid="patent-room-page">
      <header className="flex shrink-0 flex-wrap items-center gap-2 border-b border-slate-200 bg-white px-3 py-2">
        <Link to={`/agent/projects/${projectId}`} className="text-xs underline">
          回项目
        </Link>
        <span className="text-sm font-semibold text-slate-900">
          群聊 · {project.title}
        </span>
        <span className="rounded border border-emerald-200 bg-emerald-50 px-1.5 py-px text-[10px] text-emerald-800">
          bot 自发 loop
        </span>
        <div className="ml-auto flex flex-wrap gap-1.5">
          <button
            type="button"
            data-testid="patent-room-loop-btn"
            disabled={roomLoopBusy}
            onClick={() => runPatentRoomLoop(projectId)}
            className="btn-press focus-ring inline-flex items-center gap-1 rounded-full border border-emerald-400 bg-emerald-50 px-2.5 py-0.5 text-[11px] font-semibold text-emerald-900 disabled:opacity-50"
          >
            <Play className="h-3 w-3" aria-hidden />
            {roomLoopBusy ? 'loop 进行中…' : '演示 loop'}
          </button>
          <button
            type="button"
            onClick={() => pauseRoomLoop()}
            className="btn-press focus-ring inline-flex items-center gap-1 rounded-full border border-slate-200 px-2.5 py-0.5 text-[11px] text-slate-600"
          >
            <Pause className="h-3 w-3" aria-hidden />
            暂停
          </button>
          <button
            type="button"
            onClick={() => clearRoomMessages(projectId)}
            className="btn-press focus-ring rounded-full border border-slate-200 px-2.5 py-0.5 text-[11px] text-slate-500"
          >
            清空
          </button>
        </div>
      </header>

      <div className="flex min-h-0 flex-1">
        <aside className="hidden w-40 shrink-0 flex-col border-r border-slate-200 bg-slate-50 lg:flex">
          <div className="border-b border-slate-100 px-2 py-1.5 text-[10px] font-semibold text-slate-400">
            席位
          </div>
          <ul className="flex-1 overflow-y-auto p-1">
            {project.expertIds.map((id) => (
              <li key={id}>
                <button
                  type="button"
                  onClick={() => setFocusSeat(id)}
                  className={`w-full truncate rounded px-2 py-1 text-left text-[11px] ${
                    focusSeat === id
                      ? 'bg-slate-900 text-white'
                      : 'text-slate-700 hover:bg-white'
                  }`}
                >
                  {getProjectExpert(id).name}
                </button>
              </li>
            ))}
          </ul>
          <details className="border-t border-slate-100 p-2 text-[9px] text-slate-400">
            <summary className="cursor-pointer">案目录双文件</summary>
            <pre className="mt-1 whitespace-pre-wrap font-mono">
              {caseFolderListing(project.expertIds).join('\n')}
            </pre>
          </details>
        </aside>

        <div className="flex min-h-0 min-w-0 flex-1 flex-col">
          <div className="min-h-0 flex-1 space-y-2 overflow-y-auto px-4 py-3">
            {msgs.length === 0 && (
              <p className="text-sm text-slate-400" data-testid="patent-room-empty">
                点「演示 loop」让总控自发分派各席；或在下方插话。
              </p>
            )}
            {msgs.map((m) => (
              <RoomBubble key={m.id} m={m} />
            ))}
            <div ref={bottomRef} />
          </div>
          <div className="shrink-0 border-t border-slate-200 bg-white p-2">
            <div className="flex gap-2">
              <input
                value={draft}
                onChange={(e) => setDraft(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') sendUser()
                }}
                placeholder="插话（全体可见）"
                className="focus-ring flex-1 rounded-md border border-slate-200 px-3 py-2 text-sm"
                data-testid="patent-room-input"
              />
              <button
                type="button"
                onClick={sendUser}
                className="btn-press focus-ring rounded-md bg-slate-900 px-3 py-2 text-xs font-medium text-white"
              >
                发送
              </button>
            </div>
          </div>
        </div>

        <SeatDualFilePanel expertId={focusSeat} projectId={projectId} />
      </div>
    </div>
  )
}

function RoomBubble({ m }: { m: RoomMessage }) {
  const from =
    m.fromExpertId === 'user'
      ? '你'
      : getProjectExpert(m.fromExpertId as ProjectExpertId).name
  const to =
    !m.toExpertId || m.toExpertId === 'all'
      ? '全体'
      : getProjectExpert(m.toExpertId).name
  const isUser = m.fromExpertId === 'user'
  const isOrch =
    m.fromExpertId !== 'user' &&
    isOrchestratorExpert(m.fromExpertId as ProjectExpertId)

  return (
    <div
      className={`max-w-[92%] rounded-lg border px-3 py-2 text-sm ${
        isUser
          ? 'ml-auto border-slate-900 bg-slate-900 text-white'
          : isOrch
            ? 'border-violet-200 bg-violet-50 text-violet-950'
            : 'border-slate-200 bg-white text-slate-800'
      }`}
      data-spontaneous={m.spontaneous ? '1' : '0'}
    >
      <div className="mb-0.5 flex flex-wrap items-center gap-1 text-[10px] opacity-70">
        <span className="font-semibold">
          {from} → {to}
        </span>
        {m.spontaneous && (
          <span className="rounded bg-emerald-100 px-1 text-emerald-800">
            自发
          </span>
        )}
        <span className="ml-auto">{m.at}</span>
      </div>
      <div className="whitespace-pre-wrap leading-relaxed">{m.body}</div>
    </div>
  )
}
