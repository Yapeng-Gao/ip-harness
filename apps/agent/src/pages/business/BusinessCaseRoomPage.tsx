import { useEffect, useMemo, useRef, useState } from 'react'
import { Link, Navigate, useParams } from 'react-router-dom'
import {
  BUSINESS_DEFAULT_SEAT_IDS,
  businessSeatLabel,
  seatsForCase,
} from '../../business/businessSeats'
import { useBusinessCases } from '../../business/BusinessCaseContext'
import { useProjectFolder } from '../../projects/ProjectFolderContext'
import type { ProjectExpertId, RoomMessage } from '../../projects/types'

/**
 * 本案群聊 · 最小可进 room（席=bot C）
 * 与单席会话并存；mock 多席互喊示意；复用 ProjectFolder roomMessages
 */
type ShoutStep = {
  from: ProjectExpertId
  to: ProjectExpertId | 'all'
  body: string
}

/** 默认 7 席互喊剧本（查新→…→OA） */
const SEVEN_SEAT_SHOUT: ShoutStep[] = [
  {
    from: 'expert-research',
    to: 'expert-intake',
    body: '【查新→立项】三性意见草稿齐了（06_research_report）。请吃结论做 go/nogo。',
  },
  {
    from: 'expert-intake',
    to: 'expert-disclosure',
    body: '【立项→交底】Go · 范围已钉。请按范围整理可实施交底。',
  },
  {
    from: 'expert-disclosure',
    to: 'expert-draft',
    body: '【交底→撰写】08_disclosure_pack 已交卷待确认。权要请按交底结构起稿。',
  },
  {
    from: 'expert-draft',
    to: 'expert-figure',
    body: '【撰写→附图】独权骨架出来了。请按权要补框图/流程示意清单。',
  },
  {
    from: 'expert-figure',
    to: 'expert-filing',
    body: '【附图→递交】图号清单冻了（10_figure_list）。请做齐套与形式点。',
  },
  {
    from: 'expert-filing',
    to: 'expert-oa',
    body: '【递交→审查答复】齐套示意完成（非真递交）。有意见再喊你。',
  },
  {
    from: 'expert-oa',
    to: 'all',
    body: '【审查答复→全体】收到。等递交确认解锁后出答复策略；单席会话里继续聊。',
  },
]

export function BusinessCaseRoomPage() {
  const { caseId = '' } = useParams()
  const { getCase, getProgress, isBusinessCase } = useBusinessCases()
  const {
    getProject,
    roomMessages,
    appendRoomMessage,
    clearRoomMessages,
  } = useProjectFolder()
  const [draft, setDraft] = useState('')
  const [busy, setBusy] = useState(false)
  const timersRef = useRef<number[]>([])
  const bottomRef = useRef<HTMLDivElement>(null)

  const c = getCase(caseId)
  const prog = getProgress(caseId)
  const project = getProject(caseId)
  const biz = isBusinessCase(caseId)

  const seatIds = useMemo(
    () =>
      seatsForCase({
        expertIds: c?.expertIds,
        moreSeatIds: prog.moreSeatIds,
      }),
    [c?.expertIds, prog.moreSeatIds],
  )

  const msgs = roomMessages.filter((m) => m.projectId === caseId)

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [msgs.length])

  useEffect(() => {
    return () => {
      for (const id of timersRef.current) window.clearTimeout(id)
      timersRef.current = []
    }
  }, [])

  if (!caseId) return <Navigate to="/agent" replace />
  if (!biz || !c) {
    return (
      <div
        className="flex flex-1 flex-col items-center justify-center gap-2 p-8 text-sm text-slate-500"
        data-testid="business-case-room-missing"
      >
        <p>本案群聊仅业务案子可用</p>
        <Link to="/agent" className="underline">
          返回我的案子
        </Link>
      </div>
    )
  }

  const sendUser = () => {
    const text = draft.trim()
    if (!text || busy) return
    appendRoomMessage({
      projectId: caseId,
      fromExpertId: 'user',
      toExpertId: 'all',
      body: text,
      kind: 'user',
    })
    setDraft('')
  }

  const runShoutDemo = () => {
    if (busy) return
    for (const id of timersRef.current) window.clearTimeout(id)
    timersRef.current = []
    setBusy(true)

    appendRoomMessage({
      projectId: caseId,
      fromExpertId: 'orchestrator',
      toExpertId: 'all',
      body: '【群聊示意】默认 7 席互喊（mock · 无真 LLM）。单席会话仍是主路径。',
      kind: 'note',
      spontaneous: true,
    })

    const team = new Set(seatIds)
    const chain = SEVEN_SEAT_SHOUT.filter(
      (s) => team.has(s.from) && (s.to === 'all' || team.has(s.to)),
    )
    const STEP = 420
    chain.forEach((step, i) => {
      const t = window.setTimeout(() => {
        appendRoomMessage({
          projectId: caseId,
          fromExpertId: step.from,
          toExpertId: step.to,
          body: step.body,
          kind: 'request',
          spontaneous: true,
        })
      }, STEP * (i + 1))
      timersRef.current.push(t)
    })
    const done = window.setTimeout(() => {
      appendRoomMessage({
        projectId: caseId,
        fromExpertId: 'orchestrator',
        toExpertId: 'all',
        body: '【示意结束】可回侧栏点任一席继续独立会话 · 交卷仍走本案 HITL。',
        kind: 'note',
        spontaneous: true,
      })
      setBusy(false)
    }, STEP * (chain.length + 1))
    timersRef.current.push(done)
  }

  return (
    <div
      className="flex min-h-0 flex-1 flex-col"
      data-testid="business-case-room-page"
      data-case-id={caseId}
      data-project-id={caseId}
    >
      <header className="flex shrink-0 flex-wrap items-center gap-2 border-b border-slate-200 bg-white px-3 py-2">
        <Link
          to={`/agent/cases/${caseId}`}
          className="text-xs text-slate-600 underline"
          data-testid="business-case-room-back"
        >
          回案子 · 单席
        </Link>
        <span className="text-sm font-semibold text-slate-900">
          群聊 · {c.title}
        </span>
        <span className="rounded border border-violet-200 bg-violet-50 px-1.5 py-px text-[10px] text-violet-800">
          最小 room · mock 气泡
        </span>
        {project ? (
          <span className="text-[10px] text-slate-400">
            projectId={caseId}
          </span>
        ) : null}
        <div className="ml-auto flex flex-wrap gap-1.5">
          <button
            type="button"
            data-testid="business-case-room-shout"
            disabled={busy}
            onClick={runShoutDemo}
            className="btn-press focus-ring rounded-full border border-violet-300 bg-violet-50 px-2.5 py-0.5 text-[11px] font-semibold text-violet-950 disabled:opacity-50"
          >
            {busy ? '互喊中…' : '多席互喊示意'}
          </button>
          <button
            type="button"
            data-testid="business-case-room-clear"
            onClick={() => clearRoomMessages(caseId)}
            className="btn-press focus-ring rounded-full border border-slate-200 px-2.5 py-0.5 text-[11px] text-slate-500"
          >
            清空
          </button>
        </div>
      </header>

      <div className="flex min-h-0 flex-1">
        <aside
          className="hidden w-36 shrink-0 flex-col border-r border-slate-200 bg-slate-50 lg:flex"
          data-testid="business-case-room-seats"
        >
          <div className="border-b border-slate-100 px-2 py-1.5 text-[10px] font-semibold text-slate-400">
            本案 7 席
          </div>
          <ul className="flex-1 overflow-y-auto p-1">
            {(seatIds.length ? seatIds : BUSINESS_DEFAULT_SEAT_IDS).map(
              (id) => (
                <li key={id}>
                  <Link
                    to={`/agent/cases/${caseId}?seat=${id}`}
                    className="mb-0.5 block truncate rounded px-2 py-1 text-[11px] text-slate-700 hover:bg-white"
                    data-testid={`business-case-room-seat-${id}`}
                  >
                    {businessSeatLabel(id)}
                    <span className="ml-1 text-[9px] text-slate-400">席 bot</span>
                  </Link>
                </li>
              ),
            )}
          </ul>
        </aside>

        <div className="flex min-h-0 min-w-0 flex-1 flex-col">
          <div
            className="min-h-0 flex-1 space-y-2 overflow-y-auto px-4 py-3"
            data-testid="business-case-room-feed"
          >
            {msgs.length === 0 ? (
              <p
                className="text-sm text-slate-400"
                data-testid="business-case-room-empty"
              >
                点「多席互喊示意」看查新→立项→交底→撰写→附图→递交→审查答复接力；或在下方插话。单席会话仍从侧栏进。
              </p>
            ) : (
              msgs.map((m) => <BizRoomBubble key={m.id} m={m} />)
            )}
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
                placeholder="插话（全体可见 · mock）"
                className="focus-ring flex-1 rounded-md border border-slate-200 px-3 py-2 text-sm"
                data-testid="business-case-room-input"
                disabled={busy}
              />
              <button
                type="button"
                onClick={sendUser}
                disabled={busy || !draft.trim()}
                className="btn-press focus-ring rounded-md bg-slate-900 px-3 py-2 text-xs font-medium text-white disabled:opacity-40"
                data-testid="business-case-room-send"
              >
                发送
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

function BizRoomBubble({ m }: { m: RoomMessage }) {
  const from =
    m.fromExpertId === 'user'
      ? '你'
      : m.fromExpertId === 'orchestrator'
        ? '案子助手'
        : businessSeatLabel(m.fromExpertId)
  const to =
    !m.toExpertId || m.toExpertId === 'all'
      ? '全体'
      : businessSeatLabel(m.toExpertId)
  const isUser = m.fromExpertId === 'user'
  const isOrch = m.fromExpertId === 'orchestrator'

  return (
    <div
      className={`max-w-[92%] rounded-lg border px-3 py-2 text-sm ${
        isUser
          ? 'ml-auto border-slate-900 bg-slate-900 text-white'
          : isOrch
            ? 'border-violet-200 bg-violet-50 text-violet-950'
            : 'border-slate-200 bg-white text-slate-800'
      }`}
      data-testid="business-case-room-bubble"
      data-from={m.fromExpertId}
      data-spontaneous={m.spontaneous ? '1' : '0'}
    >
      <div className="mb-0.5 flex flex-wrap items-center gap-1 text-[10px] opacity-70">
        <span className="font-semibold">
          {from} → {to}
        </span>
        {m.spontaneous ? (
          <span className="rounded bg-violet-100 px-1 text-violet-800">
            互喊
          </span>
        ) : null}
        <span className="ml-auto">{m.at}</span>
      </div>
      <div className="whitespace-pre-wrap leading-relaxed">{m.body}</div>
    </div>
  )
}
