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

type Props = {
  caseId: string
  seatId: ProjectExpertId
  onAdvanced?: (confirmId?: string) => void
}

/**
 * 席工作面（席=独立 bot）：
 * 会话（主）人↔席 bot · 成果 NN_*.md · 办理过程 NN_*_worklog.md
 * 干活/交卷 → advanceSeatWork（复用 faa7bd2 双文件随步 + 本案 HITL）
 */
export function BusinessSeatWorkbench({ caseId, seatId, onAdvanced }: Props) {
  const { advanceSeatWork, getPendingConfirms, getProgress } = useBusinessCases()
  const { getThread, appendMessage } = useProjectFolder()
  const def = getProjectExpert(seatId)
  const thread = getThread(caseId, seatId)
  const stepIndex = thread?.stepIndex ?? 0
  const prog = getProgress(caseId)
  const dual = deliverableForExpert(seatId)
  const seatLabel = businessSeatLabel(seatId)
  const [panel, setPanel] = useState<'chat' | 'artifact' | 'worklog'>('chat')
  const [draft, setDraft] = useState('')
  const [flashBody, setFlashBody] = useState(false)
  const [flashLogId, setFlashLogId] = useState<string | null>(null)
  const [busy, setBusy] = useState(false)
  const bodyRef = useRef<HTMLPreElement>(null)
  const chatEndRef = useRef<HTMLDivElement>(null)

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
    // 短延迟：体感席 bot 在干活（样机）
    window.setTimeout(() => {
      // 交卷步已 pending：只回话，不再抬步（避免重复 HITL）
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
      // 交卷后切成果一眼可见；非交卷保持会话主
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

  const sendUser = () => {
    const text = draft.trim()
    if (!text || oaLocked || busy) return
    setDraft('')
    // 交卷意图 / 干活意图 → 同 advanceSeatWork；否则也推进一轮脚本（样机体感跟 bot 聊）
    const deliverIntent =
      /交卷|确认|打包|提交|完成/.test(text) || btnLabel === '交卷待确认'
    runAdvance(
      text ||
        (deliverIntent
          ? '请交卷，我来确认'
          : '继续，请按本席剧本干下一步'),
    )
  }

  const onKey = (e: KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey && !e.nativeEvent.isComposing) {
      e.preventDefault()
      sendUser()
    }
  }

  const displayContent = (role: string, content: string) => {
    if (role === 'system') {
      return `${seatLabel}已就绪。跟我聊，或点「让它干活」；交卷后会写入待我确认。`
    }
    return content
  }

  return (
    <div
      className="flex min-h-0 flex-1 flex-col"
      data-testid="business-seat-workbench"
      data-seat-as-bot="1"
    >
      <header className="mb-3 flex flex-wrap items-start justify-between gap-2">
        <div>
          <h2 className="text-sm font-semibold text-slate-900">
            {seatLabel}
            <span className="ml-2 text-[11px] font-normal text-slate-400">
              席 bot · {def.specialty}
            </span>
          </h2>
          <p className="mt-0.5 text-[11px] text-slate-500 line-clamp-2">
            独立会话 · 非主链 tab · {def.description}
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <Link
            to={`/agent/projects/${caseId}/bots/${seatId}`}
            className="rounded-full border border-violet-200 bg-violet-50 px-2.5 py-1 text-[10px] font-medium text-violet-900"
            data-testid="business-seat-open-expert"
            title="专家台打开本案过程（同 projectId）"
          >
            专家台 · 本案
          </Link>
          <button
            type="button"
            onClick={() =>
              runAdvance(
                btnLabel === '交卷待确认'
                  ? '请交卷，我来确认'
                  : '请按剧本干下一步',
              )
            }
            disabled={oaLocked || busy}
            className="btn-press focus-ring rounded-md bg-slate-900 px-3 py-1.5 text-xs font-semibold text-white disabled:cursor-not-allowed disabled:opacity-40"
            data-testid="business-seat-advance"
            data-advance-label={btnLabel}
            title={
              oaLocked
                ? '须先确认递交'
                : btnLabel === '交卷待确认'
                  ? '席 bot 交卷 · 写入待我确认'
                  : '席 bot 干活 · 成果与办理过程随步更新'
            }
          >
            {btnLabel === '交卷待确认' ? '交卷待确认' : '让它干活'}
          </button>
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

      <ol
        className="mb-3 flex flex-wrap gap-1.5"
        data-testid="business-seat-steps"
        aria-label="本席步骤进度（只读）"
        title="只读进度 · 不可点切"
      >
        {def.steps.map((s, i) => {
          const done = i < stepIndex
          const current = i === stepIndex
          return (
            <li
              key={s.id}
              className={`pointer-events-none cursor-default select-none rounded-full border px-2.5 py-1 text-[10px] font-medium ${
                done
                  ? 'border-emerald-200 bg-emerald-50 text-emerald-800'
                  : current
                    ? 'border-slate-800 bg-slate-900 text-white'
                    : 'border-slate-200 bg-white text-slate-500'
              }`}
              data-testid={`business-seat-step-${s.id}`}
              data-current={current ? '1' : '0'}
              aria-current={current ? 'step' : undefined}
            >
              {i + 1}. {s.label}
              {s.triggersHitl ? ' · 待交' : ''}
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
            待我确认（闸口 · 非唯一内容）
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

      {/* 三面切换：会话主 · 成果 · 办理过程 */}
      <div
        className="mb-2 flex flex-wrap gap-1 rounded-lg border border-slate-200 bg-slate-50 p-0.5"
        data-testid="business-seat-surface-tabs"
        role="tablist"
      >
        {(
          [
            ['chat', '会话'],
            ['artifact', dual ? `成果 · ${dual.artifactFile}` : '成果'],
            ['worklog', dual ? `办理过程 · ${dual.worklogFile}` : '办理过程'],
          ] as const
        ).map(([id, label]) => (
          <button
            key={id}
            type="button"
            role="tab"
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
      </div>

      {panel === 'chat' ? (
        <section
          className="mb-3 flex min-h-[16rem] flex-col rounded-xl border border-slate-200 bg-white shadow-sm"
          data-testid="business-seat-chat"
        >
          <div className="min-h-0 flex-1 space-y-2 overflow-y-auto px-3 py-3">
            {messages.length === 0 ? (
              <p className="text-[12px] text-slate-500">
                {seatLabel}已就绪。跟我聊，或点「让它干活」。
              </p>
            ) : (
              messages.map((m) => (
                <div
                  key={m.id}
                  className={`max-w-[92%] rounded-lg px-2.5 py-1.5 text-[12px] leading-relaxed ${
                    m.role === 'user'
                      ? 'ml-auto bg-slate-900 text-white'
                      : m.role === 'tool'
                        ? 'border border-slate-200 bg-slate-50 font-mono text-[10px] text-slate-600'
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
                  {m.role === 'tool' ? (
                    <div className="mb-0.5 text-[9px] font-semibold text-slate-400">
                      工具（样机）
                    </div>
                  ) : null}
                  <div className="whitespace-pre-wrap">
                    {displayContent(m.role, m.content)}
                  </div>
                </div>
              ))
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
            <div className="mb-1.5 flex flex-wrap gap-1">
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
            </div>
            <div className="flex gap-2">
              <textarea
                value={draft}
                onChange={(e) => setDraft(e.target.value)}
                onKeyDown={onKey}
                rows={1}
                placeholder={`跟「${seatLabel}」说…（Enter 发送 · 脚本回合 mock）`}
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
        <section
          className="mb-3 rounded-xl border border-slate-200 bg-white shadow-sm"
          data-testid="business-seat-dual-file"
        >
          <div className="border-b border-slate-100 px-3 py-2 text-[10px] font-semibold text-slate-400">
            {panel === 'artifact'
              ? dual?.artifactFile ?? '成果'
              : dual?.worklogFile ?? '办理过程'}
          </div>
          {dual ? (
            <pre
              ref={bodyRef}
              className={`max-h-72 overflow-y-auto whitespace-pre-wrap p-3 font-mono text-[10px] leading-relaxed text-slate-700 transition-colors duration-500 ${
                flashBody ? 'bg-amber-50 ring-2 ring-amber-200 ring-inset' : ''
              }`}
              data-testid={
                panel === 'artifact'
                  ? 'business-dual-artifact-body'
                  : 'business-dual-worklog-body'
              }
              data-step-index={stepIndex}
            >
              {panel === 'artifact' ? artifactBody : worklogBody}
            </pre>
          ) : (
            <p className="p-3 text-xs text-slate-400">本席暂无双文件约定</p>
          )}
        </section>
      )}

      {/* 兼容旧 testid：双文件 tab 快捷仍可点 */}
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
      </div>

      <div className="min-h-0">
        <CaseProcessPanel
          caseId={caseId}
          highlightLogId={flashLogId ?? undefined}
        />
      </div>
    </div>
  )
}
