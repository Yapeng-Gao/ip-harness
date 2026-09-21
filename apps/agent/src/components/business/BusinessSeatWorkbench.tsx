import { Link } from 'react-router-dom'
import {
  useEffect,
  useMemo,
  useRef,
  useState,
  type KeyboardEvent,
} from 'react'
import {
  businessSeatLabel,
  confirmKindForSeat,
  CONFIRM_KIND_LABEL,
} from '../../business/businessSeats'
import { useBusinessCases } from '../../business/BusinessCaseContext'
import {
  advanceButtonLabel,
  buildProgressiveArtifact,
  buildProgressiveWorklog,
} from '../../business/seatStepBodies'
import { getProjectExpert } from '../../projects/experts'
import { useProjectFolder } from '../../projects/ProjectFolderContext'
import { deliverableForExpert } from '../../projects/patentDeliverables'
import type { ProjectExpertId } from '../../projects/types'
import { CaseProcessPanel } from './CaseProcessPanel'
import {
  feedbackEdgesFrom,
  parseUpstreamFeedbackIntent,
} from '../../business/seatFeedback'
import {
  loopActionsForSeat,
  parseSeatLoopIntent,
} from '../../business/seatLoops'
import { SeatMarkdownBody } from './SeatMarkdownBody'
import { humanizeToolBubble, parseRewindIntent } from '../../lib/stepChatFormat'

/** 业务面默认藏工程文件名 / disclosure_pack 等（详情可展） */
function sanitizeBizBlurb(raw: string): string {
  return raw
    .replace(/\b\d{2}_[a-z0-9_]+(?:\.md)?\b/gi, '')
    .replace(/\bdisclosure_pack\b/gi, '')
    .replace(/\bworklog\b/gi, '')
    .replace(/\s*[+·]\s*(?=[+·]|$)/g, '')
    .replace(/产出\s*/g, '')
    .replace(/\s{2,}/g, ' ')
    .replace(/[。．]\s*$/g, '。')
    .trim()
}

type Props = {
  caseId: string
  seatId: ProjectExpertId
  /** 案顶单一主 CTA 触发干活/交卷（刀2） */
  workNonce?: number
  onAdvanced?: (confirmId?: string) => void
  /** 跨席 feedback 后切到上游席 */
  onSwitchSeat?: (seatId: ProjectExpertId) => void
}

/**
 * 席工作面（席=独立 bot · 7 席同构 · 案页三刀 + nits）：
 * 会话主 · 成果/过程次 tab（办理过程勿常驻会话下）· 交卷 HITL
 * 本案 pending → 藏会话干活/交卷 chip，顶栏「去确认」独占
 * 推进 → advanceSeatWork；顶栏唯一主 CTA 经 workNonce 触发
 */
export function BusinessSeatWorkbench({
  caseId,
  seatId,
  workNonce = 0,
  onAdvanced,
  onSwitchSeat,
}: Props) {
  const {
    advanceSeatWork,
    rewindSeatWork,
    requestUpstreamFeedback,
    runSeatLoop,
    getPendingConfirms,
    getProgress,
  } = useBusinessCases()
  const { getThread, appendMessage } = useProjectFolder()
  const def = getProjectExpert(seatId)
  const thread = getThread(caseId, seatId)
  const stepIndex = thread?.stepIndex ?? 0
  const prog = getProgress(caseId)
  const dual = deliverableForExpert(seatId)
  const seatLabel = businessSeatLabel(seatId)
  /** 本案任一 pending：会话 chip 藏/降灰，顶栏「去确认」独占主视线 */
  const pendingList = useMemo(
    () => getPendingConfirms(caseId),
    [caseId, getPendingConfirms],
  )
  const caseHasPending = pendingList.length > 0
  const pendingHint = useMemo(() => {
    if (!caseHasPending) return ''
    const titles = pendingList
      .map((p) => p.title || CONFIRM_KIND_LABEL[p.kind] || '待确认项')
      .slice(0, 2)
      .join('、')
    const more = pendingList.length > 2 ? ` 等 ${pendingList.length} 项` : ''
    return `${seatLabel}已就绪。本案有待确认「${titles}${more}」· 确认后本席才能继续推进。请先点顶栏「去确认」。`
  }, [caseHasPending, pendingList, seatLabel])
  const [panel, setPanel] = useState<'chat' | 'artifact' | 'worklog'>('chat')
  const [draft, setDraft] = useState('')
  const [flashBody, setFlashBody] = useState(false)
  const [flashLogId, setFlashLogId] = useState<string | null>(null)
  const [busy, setBusy] = useState(false)
  const [showFileNames, setShowFileNames] = useState(false)
  const [moreOpen, setMoreOpen] = useState(false)
  const bodyRef = useRef<HTMLDivElement>(null)
  const chatEndRef = useRef<HTMLDivElement>(null)
  const lastWorkNonce = useRef(0)
  const runAdvanceRef = useRef<(userLine?: string) => void>(() => {})

  // 切席：复位会话主（7 席同构壳）
  useEffect(() => {
    setPanel('chat')
    setDraft('')
    setBusy(false)
    setFlashBody(false)
    setFlashLogId(null)
    setShowFileNames(false)
    setMoreOpen(false)
  }, [seatId, caseId])

  const pendingForSeat = useMemo(() => {
    const kind = confirmKindForSeat(seatId)
    if (!kind) return []
    return getPendingConfirms(caseId).filter((c) => c.kind === kind)
  }, [caseId, seatId, getPendingConfirms])

  const oaLocked = seatId === 'expert-oa' && !prog.filed
  const submitted = !!thread?.artifactSubmitted
  const btnLabel = advanceButtonLabel(def.steps, stepIndex)
  const atHitl =
    !!def.steps[stepIndex]?.triggersHitl || pendingForSeat.length > 0

  const artifactBody = useMemo(() => {
    if (!dual) return ''
    return buildProgressiveArtifact(dual, def.steps, stepIndex)
  }, [dual, def.steps, stepIndex])

  const worklogBody = useMemo(() => {
    if (!dual) return ''
    return buildProgressiveWorklog(dual, def.steps, stepIndex)
  }, [dual, def.steps, stepIndex])

  const messages = thread?.messages ?? []

  useEffect(() => {
    if (!flashBody) return
    const t = window.setTimeout(() => setFlashBody(false), 1200)
    return () => window.clearTimeout(t)
  }, [flashBody])

  useEffect(() => {
    if (!flashLogId) return
    const t = window.setTimeout(() => setFlashLogId(null), 1800)
    return () => window.clearTimeout(t)
  }, [flashLogId])

  useEffect(() => {
    if (!flashBody) return
    bodyRef.current?.scrollTo({
      top: bodyRef.current.scrollHeight,
      behavior: 'smooth',
    })
  }, [flashBody, worklogBody, stepIndex])

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages.length, busy])

  const runAdvance = (userLine?: string) => {
    if (oaLocked || busy) return
    setBusy(true)
    if (userLine?.trim()) {
      appendMessage(caseId, seatId, {
        role: 'user',
        content: userLine.trim(),
        meta: { backend: 'mock' },
      })
    }
    window.setTimeout(() => {
      if (pendingForSeat.length > 0 || (submitted && atHitl)) {
        appendMessage(caseId, seatId, {
          role: 'assistant',
          content: `【${seatLabel}】本席已交卷，成果在「成果」面板。请你在「待我确认」里确认后，本案进度才会前进。`,
          meta: { backend: 'mock' },
        })
        setBusy(false)
        setPanel('chat')
        return
      }
      const r = advanceSeatWork(caseId, seatId)
      setFlashBody(true)
      if (r.processLogId) setFlashLogId(r.processLogId)
      if (r.delivered && r.confirm) {
        setPanel('artifact')
        appendMessage(caseId, seatId, {
          role: 'assistant',
          content: `【${seatLabel}】已交卷「${r.stepLabel}」。请你确认后主链才前进。`,
          meta: { backend: 'mock', stepId: 'deliver' },
        })
      } else {
        setPanel('chat')
      }
      onAdvanced?.(r.confirm?.id)
      setBusy(false)
    }, 320)
  }

  runAdvanceRef.current = runAdvance

  // 案顶单一主 CTA → 同路径干活/交卷
  useEffect(() => {
    if (!workNonce || workNonce === lastWorkNonce.current) return
    lastWorkNonce.current = workNonce
    const label = advanceButtonLabel(
      getProjectExpert(seatId).steps,
      getThread(caseId, seatId)?.stepIndex ?? 0,
    )
    runAdvanceRef.current(
      label === '交卷待确认' ? '请交卷，我来确认' : '请按剧本干下一步',
    )
  }, [workNonce, caseId, seatId, getThread])

  const feedbackEdges = useMemo(() => feedbackEdgesFrom(seatId), [seatId])
  const loopActions = useMemo(
    () =>
      loopActionsForSeat(seatId, {
        hasPending: pendingForSeat.length > 0,
        filed: prog.filed,
      }),
    [seatId, pendingForSeat.length, prog.filed],
  )

  const runUpstreamFeedback = (toSeat: ProjectExpertId, reason: string) => {
    if (oaLocked || busy) return
    setBusy(true)
    window.setTimeout(() => {
      const r = requestUpstreamFeedback(caseId, seatId, toSeat, reason)
      setBusy(false)
      setPanel('chat')
      if (r.ok && r.switchToSeat && onSwitchSeat) {
        window.setTimeout(() => onSwitchSeat(r.switchToSeat!), 450)
      }
    }, 200)
  }

  const runLoopAction = (
    actionId: Parameters<typeof runSeatLoop>[2],
    note?: string,
  ) => {
    if (busy) return
    if (oaLocked && seatId === 'expert-oa') {
      /* OA 锁在未递交；filed 动作已在 loopActions 过滤 */
    }
    if (oaLocked && !prog.filed) return
    setBusy(true)
    window.setTimeout(() => {
      runSeatLoop(caseId, seatId, actionId, note)
      setFlashLogId(null)
      setPanel('chat')
      setBusy(false)
    }, 180)
  }

  const sendUser = () => {
    const text = draft.trim()
    if (!text || oaLocked || busy) return
    setDraft('')
    const rewind = parseRewindIntent(text, def.steps)
    if (rewind) {
      setBusy(true)
      appendMessage(caseId, seatId, {
        role: 'user',
        content: text,
        meta: { backend: 'mock' },
      })
      window.setTimeout(() => {
        const r = rewindSeatWork(caseId, seatId, rewind.stepIndex)
        if (!r.ok) {
          appendMessage(caseId, seatId, {
            role: 'assistant',
            content:
              r.reason === 'forward'
                ? `【${seatLabel}】还没走到第 ${rewind.stepIndex + 1} 步，只能回到已经做过的步骤。`
                : `【${seatLabel}】没法回到那一步，请点上方步骤条里已完成的步骤。`,
            meta: { backend: 'mock' },
          })
        } else {
          setFlashBody(true)
          if (r.processLogId) setFlashLogId(r.processLogId)
          setPanel('chat')
        }
        setBusy(false)
      }, 220)
      return
    }
    const fb = parseUpstreamFeedbackIntent(text, seatId)
    if (fb) {
      appendMessage(caseId, seatId, {
        role: 'user',
        content: text,
        meta: { backend: 'mock' },
      })
      runUpstreamFeedback(fb.toSeat, fb.reason)
      return
    }
    const loop = parseSeatLoopIntent(text, seatId, {
      hasPending: pendingForSeat.length > 0,
      filed: prog.filed,
    })
    if (loop) {
      appendMessage(caseId, seatId, {
        role: 'user',
        content: text,
        meta: { backend: 'mock' },
      })
      runLoopAction(loop.id, text)
      return
    }
    const deliverIntent =
      /交卷|确认|打包|提交|完成/.test(text) || btnLabel === '交卷待确认'
    runAdvance(
      text ||
        (deliverIntent
          ? '请交卷，我来确认'
          : '继续，请按本席剧本干下一步'),
    )
  }

  const onRewindStep = (targetIndex: number) => {
    if (oaLocked || busy || targetIndex > stepIndex) return
    setBusy(true)
    window.setTimeout(() => {
      const r = rewindSeatWork(caseId, seatId, targetIndex)
      if (r.ok) {
        setFlashBody(true)
        if (r.processLogId) setFlashLogId(r.processLogId)
        setPanel('chat')
      }
      setBusy(false)
    }, 180)
  }

  const onKey = (e: KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey && !e.nativeEvent.isComposing) {
      e.preventDefault()
      sendUser()
    }
  }

  /** 席启动 system 气泡可换成锁/就绪提示；feedback / rewind 等须保留原文（D4） */
  const displayContent = (role: string, content: string, stepId?: string) => {
    if (role === 'system') {
      const keepReal =
        stepId === 'feedback_in' ||
        content.includes('跨席 feedback') ||
        content.includes('已回到第') ||
        content.startsWith('📩')
      if (keepReal) return content
      return caseHasPending
        ? pendingHint
        : `${seatLabel}已就绪。跟我聊，或点右上「让它干活」；交卷后会写入待我确认。`
    }
    return content
  }

  return (
    <div
      className="flex min-h-0 flex-1 flex-col"
      data-testid="business-seat-workbench"
      data-seat-as-bot="1"
      data-seat-id={seatId}
      data-biz-case-ia="1"
    >
      <header className="mb-3 flex flex-wrap items-start justify-between gap-2">
        <div>
          <h2 className="text-sm font-semibold text-slate-900">{seatLabel}</h2>
          <p className="mt-0.5 text-[11px] text-slate-500 line-clamp-2">
            {sanitizeBizBlurb(def.description)}
          </p>
        </div>
        {/* 刀2：专家台降次级；无并列主 CTA（主 CTA 在案顶） */}
        <div className="relative">
          <button
            type="button"
            onClick={() => setMoreOpen((v) => !v)}
            className="rounded-md border border-slate-200 bg-white px-2 py-1 text-[10px] font-medium text-slate-500 hover:bg-slate-50"
            data-testid="business-seat-more"
            aria-expanded={moreOpen}
          >
            更多
          </button>
          {moreOpen && (
            <div
              className="absolute right-0 z-10 mt-1 min-w-[9rem] rounded-md border border-slate-200 bg-white py-1 shadow-md"
              data-testid="business-seat-more-menu"
            >
              <Link
                to={`/agent/projects/${caseId}/bots/${seatId}`}
                className="block px-3 py-1.5 text-[11px] text-slate-600 hover:bg-slate-50"
                data-testid="business-seat-open-expert"
                title="专家台打开本案过程（同 projectId）"
                onClick={() => setMoreOpen(false)}
              >
                专家台 · 本案
              </Link>
            </div>
          )}
        </div>
      </header>

      {oaLocked && (
        <p
          className="mb-2 rounded-lg border border-amber-200 bg-amber-50 px-2.5 py-1.5 text-[11px] text-amber-950"
          data-testid="business-seat-oa-locked"
        >
          审查答复未解锁 · 须先确认递交
        </p>
      )}

      {/* 已完成 / 当前步可点回退；未到达不可点 */}
      <ol
        className="mb-3 flex flex-wrap gap-1.5"
        data-testid="business-seat-steps"
        aria-label="本席步骤进度（可回退已走步骤）"
        title="点已完成的步骤可回到该步修改"
      >
        {def.steps.map((s, i) => {
          const done = i < stepIndex
          const current = i === stepIndex
          const canRewind = (done || current) && !oaLocked && !busy
          return (
            <li key={s.id}>
              <button
                type="button"
                disabled={!canRewind}
                onClick={() => onRewindStep(i)}
                className={`rounded-full border px-2.5 py-1 text-[10px] font-medium transition-colors ${
                  done
                    ? 'border-emerald-200 bg-emerald-50 text-emerald-800 hover:border-emerald-400 hover:bg-emerald-100'
                    : current
                      ? 'border-slate-800 bg-slate-900 text-white hover:bg-slate-800'
                      : 'cursor-default border-slate-200 bg-white text-slate-500 opacity-70'
                } ${canRewind ? 'cursor-pointer' : ''}`}
                data-testid={`business-seat-step-${s.id}`}
                data-current={current ? '1' : '0'}
                aria-current={current ? 'step' : undefined}
                title={
                  canRewind
                    ? current
                      ? `重跑第 ${i + 1} 步「${s.label}」`
                      : `回到第 ${i + 1} 步「${s.label}」修改`
                    : '尚未到达'
                }
              >
                {i + 1}. {s.label}
                {s.triggersHitl ? ' · 待交' : ''}
              </button>
            </li>
          )
        })}
      </ol>

      {pendingForSeat.length > 0 && (
        <div
          className="mb-3 rounded-lg border border-amber-200 bg-amber-50/80 px-3 py-2"
          data-testid="business-seat-pending-gate"
        >
          <div className="text-[10px] font-semibold uppercase tracking-wider text-amber-800">
            待我确认
          </div>
          <ul className="mt-1 space-y-1">
            {pendingForSeat.map((item) => (
              <li key={item.id}>
                <Link
                  to={`/agent/pending/${item.id}`}
                  className="text-xs font-medium text-amber-950 underline"
                  data-testid={`business-seat-pending-${item.id}`}
                >
                  {item.title || CONFIRM_KIND_LABEL[item.kind]}
                </Link>
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* 会话主 · 成果/过程次 tab（默认藏工程文件名） */}
      <div
        className="mb-2 flex flex-wrap items-center gap-1 rounded-lg border border-slate-200 bg-slate-50 p-0.5"
        data-testid="business-seat-surface-tabs"
        role="tablist"
      >
        {(
          [
            ['chat', '会话', '跟人 ↔ 本席 bot 对话；点「让它干活」推进剧本'],
            ['artifact', '成果', '本席交付件（意见书/权要等），随步骤变长，可扫读'],
            ['worklog', '办理过程', '本席怎么做的：步骤日志 + 本案过程事件'],
          ] as const
        ).map(([id, label, tip]) => (
          <button
            key={id}
            type="button"
            role="tab"
            title={tip}
            aria-label={`${label}：${tip}`}
            aria-selected={panel === id}
            onClick={() => setPanel(id)}
            className={`rounded-md px-2.5 py-1.5 text-[11px] font-semibold ${
              panel === id
                ? 'bg-white text-slate-900 shadow-sm'
                : 'text-slate-500 hover:text-slate-800'
            }`}
            data-testid={`business-seat-tab-${id}`}
          >
            {label}
            {id === 'worklog' && flashBody ? (
              <span className="ml-1 animate-pulse rounded bg-amber-100 px-1 text-[9px] text-amber-900">
                新
              </span>
            ) : null}
            {id === 'artifact' && submitted ? (
              <span className="ml-1 rounded bg-emerald-100 px-1 text-[9px] text-emerald-800">
                已交卷
              </span>
            ) : null}
          </button>
        ))}
        {dual && (panel === 'artifact' || panel === 'worklog') ? (
          <button
            type="button"
            className="ml-auto rounded px-2 py-1 text-[9px] text-slate-400 hover:text-slate-600"
            data-testid="business-seat-toggle-filename"
            onClick={() => setShowFileNames((v) => !v)}
            title="详情可展工程文件名"
          >
            {showFileNames ? '收起文件名' : '详情 · 文件名'}
          </button>
        ) : null}
      </div>

      {panel === 'chat' ? (
        <section
          className="mb-3 flex min-h-[16rem] flex-col rounded-xl border border-slate-200 bg-white shadow-sm"
          data-testid="business-seat-chat"
        >
          <div className="min-h-0 flex-1 space-y-2 overflow-y-auto px-3 py-3">
            {messages.length === 0 ? (
              <p className="text-[12px] text-slate-500">
                {caseHasPending
                  ? pendingHint
                  : `${seatLabel}已就绪。跟我聊，或点右上「让它干活」。`}
              </p>
            ) : (
              messages.map((m) => {
                const toolUi =
                  m.role === 'tool'
                    ? humanizeToolBubble(m.content, m.meta?.toolName)
                    : null
                return (
                <div
                  key={m.id}
                  className={`max-w-[92%] rounded-lg px-2.5 py-1.5 text-[12px] leading-relaxed ${
                    m.role === 'user'
                      ? 'ml-auto bg-slate-900 text-white'
                      : m.role === 'tool'
                        ? 'border border-slate-200 bg-slate-50 text-slate-700'
                        : m.role === 'system'
                          ? 'bg-slate-50 text-slate-500'
                          : 'bg-violet-50 text-slate-900'
                  }`}
                  data-testid={`business-seat-msg-${m.role}`}
                  data-msg-id={m.id}
                >
                  {m.role === 'assistant' || m.role === 'system' ? (
                    <div className="mb-0.5 text-[9px] font-semibold uppercase tracking-wide text-violet-700/80">
                      {seatLabel}
                    </div>
                  ) : null}
                  {toolUi ? (
                    <div className="mb-0.5 text-[9px] font-semibold text-slate-500">
                      本步产出 · {toolUi.title}
                    </div>
                  ) : null}
                  {m.role === 'assistant' ? (
                    <SeatMarkdownBody
                      className="max-h-64 p-0"
                      data-testid="business-seat-msg-md"
                    >
                      {displayContent(m.role, m.content, m.meta?.stepId)}
                    </SeatMarkdownBody>
                  ) : toolUi ? (
                    <p className="text-[12px] leading-relaxed text-slate-700">
                      {toolUi.body}
                    </p>
                  ) : (
                    <div className="whitespace-pre-wrap">
                      {displayContent(m.role, m.content, m.meta?.stepId)}
                    </div>
                  )}
                </div>
                )
              })
            )}
            {busy ? (
              <p
                className="text-[11px] text-slate-400"
                data-testid="business-seat-chat-busy"
              >
                {seatLabel} 正在干活…
              </p>
            ) : null}
            <div ref={chatEndRef} />
          </div>
          <div className="shrink-0 border-t border-slate-100 px-2 py-2">
            {/* 本案 pending：藏 chip，顶栏「去确认」独占；无 pending 才露干活/交卷 */}
            {!caseHasPending ? (
              <div className="mb-1.5 flex flex-wrap gap-1" data-testid="business-seat-chips">
                <button
                  type="button"
                  className="rounded-full border border-slate-200 bg-white px-2 py-0.5 text-[10px] text-slate-700 hover:bg-slate-50"
                  data-testid="business-seat-chip-work"
                  disabled={oaLocked || busy}
                  onClick={() => runAdvance('请按剧本干下一步')}
                >
                  让它干活
                </button>
                <button
                  type="button"
                  className="rounded-full border border-amber-200 bg-amber-50 px-2 py-0.5 text-[10px] font-medium text-amber-950 hover:bg-amber-100"
                  data-testid="business-seat-chip-deliver"
                  disabled={oaLocked || busy}
                  onClick={() => runAdvance('请交卷，我来确认')}
                >
                  交卷请确认
                </button>
                {feedbackEdges.map((edge) => (
                  <button
                    key={`${edge.from}-${edge.to}`}
                    type="button"
                    className="rounded-full border border-violet-200 bg-violet-50 px-2 py-0.5 text-[10px] font-medium text-violet-950 hover:bg-violet-100"
                    data-testid={`business-seat-chip-feedback-${edge.to}`}
                    disabled={oaLocked || busy}
                    title={`请「上游」调整一版，再基于新产物继续（不回退本席进度）`}
                    onClick={() =>
                      runUpstreamFeedback(edge.to, edge.defaultReason)
                    }
                  >
                    {edge.chip}
                  </button>
                ))}
                {loopActions.map((a) => (
                  <button
                    key={a.id}
                    type="button"
                    className={`rounded-full border px-2 py-0.5 text-[10px] font-medium ${
                      a.id === 'hitl_reject' || a.id === 'heal_escalate' || a.id === 'oa_blocker'
                        ? 'border-rose-200 bg-rose-50 text-rose-950 hover:bg-rose-100'
                        : 'border-teal-200 bg-teal-50 text-teal-950 hover:bg-teal-100'
                    }`}
                    data-testid={`business-seat-chip-loop-${a.id}`}
                    disabled={busy || (oaLocked && a.needsFiled)}
                    title="席内环边 · 写过程 + 会话（样机）"
                    onClick={() => runLoopAction(a.id)}
                  >
                    {a.chip}
                  </button>
                ))}
              </div>
            ) : (
              <div className="mb-1.5 space-y-1">
                <p
                  className="text-[10px] text-amber-800/80"
                  data-testid="business-seat-chips-deferred"
                >
                  待确认中 · {pendingList[0]?.title || CONFIRM_KIND_LABEL[pendingList[0]?.kind!] || '请用顶栏「去确认」'} · 确认后继续
                </p>
                <div className="flex flex-wrap gap-1">
                  {feedbackEdges.map((edge) => (
                    <button
                      key={`${edge.from}-${edge.to}`}
                      type="button"
                      className="rounded-full border border-violet-200 bg-violet-50 px-2 py-0.5 text-[10px] font-medium text-violet-950 hover:bg-violet-100"
                      data-testid={`business-seat-chip-feedback-${edge.to}`}
                      disabled={oaLocked || busy}
                      onClick={() =>
                        runUpstreamFeedback(edge.to, edge.defaultReason)
                      }
                    >
                      {edge.chip}
                    </button>
                  ))}
                  {loopActions.map((a) => (
                    <button
                      key={a.id}
                      type="button"
                      className={`rounded-full border px-2 py-0.5 text-[10px] font-medium ${
                        a.id === 'hitl_reject' ||
                        a.id === 'heal_escalate' ||
                        a.id === 'oa_blocker'
                          ? 'border-rose-200 bg-rose-50 text-rose-950 hover:bg-rose-100'
                          : 'border-teal-200 bg-teal-50 text-teal-950 hover:bg-teal-100'
                      }`}
                      data-testid={`business-seat-chip-loop-${a.id}`}
                      disabled={busy}
                      onClick={() => runLoopAction(a.id)}
                    >
                      {a.chip}
                    </button>
                  ))}
                </div>
              </div>
            )}
            <div className="flex gap-2">
              <textarea
                value={draft}
                onChange={(e) => setDraft(e.target.value)}
                onKeyDown={onKey}
                rows={1}
                placeholder={`跟「${seatLabel}」说…（环边/回退/feedback 均可）`}
                className="focus-ring min-h-[2.25rem] flex-1 resize-none rounded-lg border border-slate-200 px-2.5 py-1.5 text-[12px] text-slate-800 placeholder:text-slate-400"
                data-testid="business-seat-composer"
                disabled={oaLocked || busy}
              />
              <button
                type="button"
                onClick={sendUser}
                disabled={oaLocked || busy || !draft.trim()}
                className="btn-press focus-ring rounded-lg bg-slate-900 px-3 text-xs font-semibold text-white disabled:opacity-40"
                data-testid="business-seat-send"
              >
                发送
              </button>
            </div>
          </div>
        </section>
      ) : (
        <div className="mb-3 space-y-3" data-testid="business-seat-side-panel">
          <section
            className="rounded-xl border border-slate-200 bg-white shadow-sm"
            data-testid="business-seat-dual-file"
          >
            <div className="border-b border-slate-100 px-3 py-2 text-[10px] font-semibold text-slate-400">
              {panel === 'artifact' ? '成果' : '办理过程'}
              {showFileNames && dual ? (
                <span
                  className="ml-2 font-mono font-normal text-slate-300"
                  data-testid="business-seat-eng-filename"
                >
                  {panel === 'artifact' ? dual.artifactFile : dual.worklogFile}
                </span>
              ) : null}
            </div>
            {dual ? (
              <SeatMarkdownBody
                bodyRef={bodyRef}
                flash={flashBody}
                data-testid={
                  panel === 'artifact'
                    ? 'business-dual-artifact-body'
                    : 'business-dual-worklog-body'
                }
                data-step-index={stepIndex}
              >
                {panel === 'artifact' ? artifactBody : worklogBody}
              </SeatMarkdownBody>
            ) : (
              <p className="p-3 text-xs text-slate-400">本席暂无双文件约定</p>
            )}
          </section>
          {/* 办理过程：只在次 tab，勿常驻会话下方 */}
          {panel === 'worklog' ? (
            <CaseProcessPanel
              caseId={caseId}
              highlightLogId={flashLogId ?? undefined}
            />
          ) : null}
        </div>
      )}

      <div className="mb-3 hidden" aria-hidden>
        <button
          type="button"
          data-testid="business-dual-tab-artifact"
          onClick={() => setPanel('artifact')}
        />
        <button
          type="button"
          data-testid="business-dual-tab-worklog"
          onClick={() => setPanel('worklog')}
        />
        {/* 兼容旧 advance testid：映射到会话 chip 路径 */}
        <button
          type="button"
          data-testid="business-seat-advance"
          data-advance-label={btnLabel}
          onClick={() =>
            runAdvance(
              btnLabel === '交卷待确认'
                ? '请交卷，我来确认'
                : '请按剧本干下一步',
            )
          }
        />
      </div>
    </div>
  )
}
