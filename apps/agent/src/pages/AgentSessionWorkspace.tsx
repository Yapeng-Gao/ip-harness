import { useEffect, useMemo, useRef, useState } from 'react'
import { Link, useOutletContext, useParams, useLocation, useSearchParams } from 'react-router-dom'
import { useAgents, type HitlSessionAction } from '@shared/context/AgentContext'
import { useApp } from '@shared/context/AppContext'
import {
  getAgent,
  HITL_GATE_LABELS,
  confirmNonCoreTier,
  suggestAgent,
} from '@shared/data/agents'
import type { HitlGateId } from '@shared/types'
import {
  evaluateGuardrails,
  firstGuardrailMessage,
  hasVerifiableResearchHitsFromSession,
} from '@shared/domain/guardrails'
import { COMMAND_LABELS } from '@shared/domain/commands'
import { setLastAgentSessionId } from '@shared/utils/lastVisited'
import { agentDisplayLabel } from '@shared/hooks/useAgentDisplayLabel'
import { SessionConfirmBar } from '../components/session/SessionConfirmBar'
import { SessionTimeline } from '../components/session/SessionTimeline'
import { SessionContextPanel } from '../components/session/SessionContextPanel'
import { SessionComposer } from '../components/session/SessionComposer'
import {
  SessionWorkspaceHeader,
  type BannerKind,
} from '../components/session/SessionWorkspaceHeader'
import {
  DEMO_AGENTS,
  gateToAction,
  sortGatesForRole,
  workbenchHref,
} from '../components/session/sessionGates'
import { workbenchHref as workbenchAbsHref } from '../lib/deepLinks'
import { CaseBindControls } from '../components/case/CaseBindControls'

type OutletCtx = { rightOpen: boolean }

export function AgentSessionWorkspace() {
  const { id = '' } = useParams()
  const { rightOpen } = useOutletContext<OutletCtx>()
  const {
    getSession,
    playMockSession,
    stopSessionPlay,
    isSessionPlaying,
    updateSessionArtifact,
    sessionHitlAction,
    runEquivalenceDemo,
    lastAppliedCommandLabel,
    sessionRunMode,
    patchSession,
  } = useAgents()
  const {
    getCase,
    visibleDocketEvents,
    hasBlockingInvoiceForCase,
    getDraftFilingCheck,
    getFullCheckLite,
    getCaseDriveItems,
    getDisclosurePackCheck,
    role,
    persona,
    workspace,
    getHandoff,
    dispatchCommand,
    lastDomainWrite,
    getAuditForCase,
  } = useApp()

  const sess = getSession(id)
  const c = sess?.caseId ? getCase(sess.caseId) : undefined

  const suggested = useMemo(() => {
    if (!sess) return undefined
    const stageAgentId = c
      ? (
          {
            pre_research: 'agent-research',
            decision: 'agent-intake',
            drafting: 'agent-claims',
            prosecution: 'agent-oa',
            maintenance: 'agent-annuity',
            commercialization: 'agent-monetize',
            monitoring: 'agent-watch',
          } as Record<string, string>
        )[c.stage]
      : undefined
    const handoffStatus =
      sess.caseId && stageAgentId
        ? getHandoff(sess.caseId, getAgent(stageAgentId)?.handoffKey ?? 'research_report')
        : undefined
    return suggestAgent({
      stage: c?.stage,
      goal: sess.goal,
      workspaceKind: workspace.kind,
      handoffStatus,
    })
  }, [sess?.goal, sess?.id, c?.stage, sess?.caseId, workspace.kind, getHandoff])

  const resolvedAgentId = useMemo(() => {
    if (!sess) return undefined
    if (sess.agentId === 'auto') {
      // Auto 对 Beta/Assist：强制确认前改荐 Core，勿静默采用
      if (suggested?.requiresTierConfirm) return 'agent-research'
      return suggested?.agent.id ?? 'agent-research'
    }
    return sess.agentId
  }, [sess?.agentId, suggested?.agent.id, suggested?.requiresTierConfirm])

  const agent = resolvedAgentId ? getAgent(resolvedAgentId) : undefined
  const playing = sess ? isSessionPlaying(sess.id) : false

  const [goal, setGoal] = useState(sess?.goal ?? '')
  const [agentPick, setAgentPick] = useState<string>(sess?.agentId ?? 'auto')
  const [casePick, setCasePick] = useState(sess?.caseId ?? '')
  const [msg, setMsg] = useState('')
  const [moreOpen, setMoreOpen] = useState(false)
  const [activeArtId, setActiveArtId] = useState<string | null>(null)
  const [renamingTitle, setRenamingTitle] = useState(false)
  const [titleDraft, setTitleDraft] = useState('')
  const [caseToastLink, setCaseToastLink] = useState(false)
  const [switchReasonChip, setSwitchReasonChip] = useState<string | null>(null)
  const [pendingAgentSwitch, setPendingAgentSwitch] = useState<{ id: string; reason?: string } | null>(null)
  const [toastVisible, setToastVisible] = useState(false)
  /** Prefer deep-link after layout建案 etc. over Catalog workbenchPath */
  const [toastWbOverride, setToastWbOverride] = useState<string | null>(null)
  const [caseBindGuide, setCaseBindGuide] = useState(false)
  const bottomRef = useRef<HTMLDivElement>(null)
  const composerRef = useRef<HTMLTextAreaElement>(null)
  const caseBindTopRef = useRef<HTMLDivElement>(null)
  const switchChipTimer = useRef<number | null>(null)
  const toastTimer = useRef<number | null>(null)
  const location = useLocation()
  const [searchParams] = useSearchParams()
  const focusHitl =
    searchParams.get('focus') === 'hitl' || searchParams.has('gate')
  const focusGateParam = searchParams.get('gate')
  const focusGate: HitlGateId | null =
    focusGateParam &&
    (
      [
        'go_nogo',
        'approve_strategy',
        'authorize_file',
        'pay_unlock',
        'confirm_quote',
      ] as HitlGateId[]
    ).includes(focusGateParam as HitlGateId)
      ? (focusGateParam as HitlGateId)
      : null
  const confirmBarRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (sess) {
      setGoal(sess.goal)
      setAgentPick(sess.agentId)
      setCasePick(sess.caseId ?? '')
      setLastAgentSessionId(sess.id)
    }
  }, [sess?.id])

  const prevAgentRef = useRef<string | undefined>(undefined)
  useEffect(() => {
    if (!sess) return
    if (
      prevAgentRef.current !== undefined &&
      prevAgentRef.current !== sess.agentId
    ) {
      setAgentPick(sess.agentId)
      showToast('已换人办理，确认步骤需重来', false)
    }
    prevAgentRef.current = sess.agentId
  }, [sess?.agentId, sess?.id])

  useEffect(() => {
    const st = location.state as {
      focusComposer?: boolean
      focusCaseBind?: boolean
    } | null
    if (st?.focusCaseBind && !(sess?.caseId)) {
      setCaseBindGuide(true)
      const tid = window.setTimeout(() => {
        caseBindTopRef.current?.scrollIntoView({
          behavior: 'smooth',
          block: 'nearest',
        })
      }, 80)
      return () => window.clearTimeout(tid)
    }
    if (st?.focusComposer && composerRef.current) {
      const tid = window.setTimeout(() => composerRef.current?.focus(), 50)
      return () => window.clearTimeout(tid)
    }
  }, [sess?.id, sess?.caseId, location.state])

  /** Wave2 InboxDeepLink · ?focus=hitl / gate= → 滚到并高亮 ConfirmBar */
  useEffect(() => {
    if (!focusHitl || !sess) return
    const waiting = sess.status === 'needs_human' || !!sess.hitlPending
    if (!waiting) return
    const reduce =
      typeof window !== 'undefined' &&
      window.matchMedia('(prefers-reduced-motion: reduce)').matches
    const tid = window.setTimeout(() => {
      const el =
        confirmBarRef.current ??
        document.getElementById('session-confirm-bar')
      el?.scrollIntoView({ behavior: reduce ? 'auto' : 'smooth', block: 'center' })
    }, 80)
    return () => window.clearTimeout(tid)
  }, [sess?.id, sess?.status, sess?.hitlPending, focusHitl, focusGate])

  useEffect(() => {
    if (sess?.artifacts.length) {
      setActiveArtId(sess.artifacts[sess.artifacts.length - 1].id)
    }
  }, [sess?.artifacts.length])

  useEffect(() => {
    const reduce =
      typeof window !== 'undefined' &&
      window.matchMedia('(prefers-reduced-motion: reduce)').matches
    bottomRef.current?.scrollIntoView({ behavior: reduce ? 'auto' : 'smooth' })
  }, [sess?.steps.length])

  useEffect(() => {
    if (!moreOpen) return
    const onDoc = (e: MouseEvent) => {
      const el = e.target as HTMLElement
      if (!el.closest?.('[data-more-menu]')) setMoreOpen(false)
    }
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setMoreOpen(false)
    }
    document.addEventListener('mousedown', onDoc)
    window.addEventListener('keydown', onKey)
    return () => {
      document.removeEventListener('mousedown', onDoc)
      window.removeEventListener('keydown', onKey)
    }
  }, [moreOpen])

  useEffect(() => {
    return () => {
      if (switchChipTimer.current) window.clearTimeout(switchChipTimer.current)
      if (toastTimer.current) window.clearTimeout(toastTimer.current)
    }
  }, [])

  const activeArt = useMemo(
    () => sess?.artifacts.find((a) => a.id === activeArtId) ?? sess?.artifacts[0],
    [sess, activeArtId],
  )

  const caseDockets = useMemo(
    () =>
      sess?.caseId
        ? visibleDocketEvents.filter((e) => e.caseId === sess.caseId).slice(0, 5)
        : [],
    [visibleDocketEvents, sess?.caseId],
  )

  if (!sess) {
    return (
      <div className="flex flex-1 items-center justify-center p-8">
        <div className="text-center">
          <p className="text-sm text-slate-600">未找到会话</p>
          <Link to="/agent" className="mt-2 inline-block text-slate-700 underline hover:text-slate-900">
            返回开始
          </Link>
        </div>
      </div>
    )
  }

  const block = sess.caseId
    ? hasBlockingInvoiceForCase(sess.caseId)
    : { blocked: false }
  const handoffKey = agent?.handoffKey
  const handoffStatus =
    sess.caseId && handoffKey ? getHandoff(sess.caseId, handoffKey) : undefined

  const isEnterpriseEarly = role === 'enterprise' || workspace.kind === 'enterprise'
  const gates = sortGatesForRole(agent?.hitlGates ?? [], isEnterpriseEarly)
  const clearedGates = sess.clearedHitlGates ?? []
  const hitlActive = sess.status === 'needs_human' || !!sess.hitlPending
  const [primaryBlocker, setPrimaryBlocker] = useState<string | null>(null)
  const isEnterprise = isEnterpriseEarly

  const showToast = (message: string, linkCase: boolean) => {
    setMsg(message)
    setCaseToastLink(linkCase)
    setToastVisible(true)
    if (toastTimer.current) window.clearTimeout(toastTimer.current)
    toastTimer.current = window.setTimeout(() => {
      setToastVisible(false)
    }, 4000)
  }

  const flashSwitchReason = (reason?: string) => {
    if (!reason) {
      setSwitchReasonChip(null)
      return
    }
    setSwitchReasonChip(reason)
    if (switchChipTimer.current) window.clearTimeout(switchChipTimer.current)
    switchChipTimer.current = window.setTimeout(() => {
      setSwitchReasonChip(null)
    }, 4500)
  }

  const applyAgentSwitch = (nextAgentId: string, reason?: string) => {
    patchSession(sess.id, {
      agentId: nextAgentId as 'auto' | string,
      clearedHitlGates: [],
    })
    setAgentPick(nextAgentId)
    showToast('已换人办理，确认步骤需重来', false)
    flashSwitchReason(reason)
    setPendingAgentSwitch(null)
  }

  const requestAgentSwitch = (nextAgentId: string, reason?: string) => {
    if (nextAgentId === sess.agentId && nextAgentId === agentPick) return
    if (clearedGates.length > 0) {
      setPendingAgentSwitch({ id: nextAgentId, reason })
      return
    }
    applyAgentSwitch(nextAgentId, reason)
  }

  const confirmPendingAgentSwitch = () => {
    if (!pendingAgentSwitch) return
    applyAgentSwitch(pendingAgentSwitch.id, pendingAgentSwitch.reason)
  }

  /** Session 闸禁用原因 · 走 domain/guardrails【唯一入口】evaluateGuardrails */
  const gateDisabledReason = (g: HitlGateId): string | null => {
    if (clearedGates.includes(g)) return '已通过'
    const hitsVerifiable =
      agent?.id === 'agent-research' || handoffKey === 'research_report'
        ? hasVerifiableResearchHitsFromSession(sess)
        : undefined
    const result = evaluateGuardrails({
      agent,
      case: c ?? null,
      session: {
        oaStatementConfirmed: sess.oaStatementConfirmed,
        oaIssueType: sess.oaIssueType,
        oaStrategyNotes: sess.oaStrategyNotes,
        hitsVerifiable,
      },
      action: g,
      persona,
      role,
      isEnterprise,
      handoffKey,
      handoffStatus,
      disclosureStatus: sess.caseId
        ? getHandoff(sess.caseId, 'disclosure_pack')
        : undefined,
      disclosureCheck: sess.caseId
        ? getDisclosurePackCheck(sess.caseId)
        : undefined,
      filingCheck: sess.caseId ? getDraftFilingCheck(sess.caseId) : undefined,
      fullCheckLite: sess.caseId ? getFullCheckLite(sess.caseId) : undefined,
      invoiceBlocked: block,
      hitsVerifiable,
    })
    return firstGuardrailMessage(result)
  }

  const markDomainSync = (
    ok: boolean,
    message: string,
    navigateTo?: string,
  ) => {
    setToastWbOverride(navigateTo ?? null)
    showToast(
      message,
      (ok && message.includes('中台已更新') && !!sess.caseId) ||
        (!!navigateTo && ok),
    )
  }

  const doGate = async (gate: HitlGateId, opts?: { stepwise?: boolean; note?: string }) => {
    const reason = gateDisabledReason(gate)
    if (reason) {
      showToast(`${HITL_GATE_LABELS[gate]} · ${reason}`, false)
      return
    }
    const action = gateToAction(gate)
    const r = await sessionHitlAction(sess.id, action, opts?.note, opts)
    markDomainSync(
      r.ok,
      `${HITL_GATE_LABELS[gate]} · ${r.message}`,
      r.navigateTo,
    )
  }

  const doHitl = async (action: HitlSessionAction, opts?: { stepwise?: boolean; note?: string }) => {
    const r = await sessionHitlAction(sess.id, action, opts?.note, opts)
    markDomainSync(r.ok, r.message, r.navigateTo)
  }

  const switchToSuggested = () => {
    if (!suggested) return
    if (
      suggested.requiresTierConfirm ||
      suggested.agent.tier === 'beta' ||
      suggested.agent.tier === 'assist'
    ) {
      if (!confirmNonCoreTier(suggested.agent)) return
    }
    requestAgentSwitch(suggested.agent.id, suggested.reason)
  }

  const submitComposer = () => {
    if (!playing) {
      playMockSession(sess.id, {
        goal: goal.trim() || sess.goal,
        agentId: (agentPick as 'auto' | string) || sess.agentId,
        caseId: casePick || undefined,
        mode: 'formal',
      })
    }
  }

  const auditEntries = sess.caseId ? getAuditForCase(sess.caseId).slice(0, 6) : []
  const domainSynced =
    caseToastLink ||
    !!toastWbOverride ||
    (!!msg && msg.includes('中台已更新') && !!sess.caseId)
  const wbPath = sess.caseId ? workbenchHref(agent?.workbenchPath, sess.caseId) : null
  const toastWbPath = toastWbOverride ?? wbPath

  // P1-6: max one status banner — failed > no_case > route suggestion
  // Idle confirm chips stay in ConfirmBar only (not topbar when not hitlActive stacking)
  const activeBanner: BannerKind = (() => {
    if (sess.status === 'failed') return 'failed'
    // SW-S5-1: CaseBindControls is sole bind entry — no parallel no_case banner
    if (sess.agentId === 'auto' && suggested && !hitlActive) return 'route'
    return null
  })()

  const subtitleLabel = agentDisplayLabel(
    sess.agentId,
    sess.agentId === 'auto' ? agent?.name : undefined,
  )

  return (
    <div className="flex min-h-0 flex-1">
      <section className="flex min-h-0 min-w-0 flex-1 flex-col overflow-hidden bg-surface-50">
        <SessionWorkspaceHeader
          sess={sess}
          subtitleLabel={subtitleLabel}
          caseTitle={c?.title}
          caseId={sess.caseId}
          playing={playing}
          hitlActive={hitlActive}
          moreOpen={moreOpen}
          setMoreOpen={setMoreOpen}
          renamingTitle={renamingTitle}
          setRenamingTitle={setRenamingTitle}
          titleDraft={titleDraft}
          setTitleDraft={setTitleDraft}
          onRenameCommit={(title) => patchSession(sess.id, { title })}
          activeBanner={activeBanner}
          suggested={suggested}
          switchReasonChip={switchReasonChip}
          onRetry={() => {
            playMockSession(sess.id, {
              goal: goal.trim() || sess.goal,
              agentId: (agentPick as 'auto' | string) || sess.agentId,
              caseId: casePick || undefined,
              mode: 'formal',
            })
          }}
          onSwitchSuggested={switchToSuggested}
          onStop={() => stopSessionPlay(sess.id)}
          onDryRun={() => {
            playMockSession(sess.id, {
              goal: goal.trim() || sess.goal,
              agentId: (agentPick as 'auto' | string) || sess.agentId,
              caseId: casePick || undefined,
              mode: 'dry-run',
            })
          }}
          onEquivalenceDemo={() => {
            void (async () => {
              const r = await runEquivalenceDemo(sess.id)
              markDomainSync(r.ok, r.message, r.navigateTo)
            })()
          }}
          showEquivalenceDemo={!!(resolvedAgentId && DEMO_AGENTS.has(resolvedAgentId))}
        />

        {toastVisible && activeBanner !== 'failed' && (
          <div className="toast-enter pointer-events-none fixed bottom-6 right-6 z-50 max-w-sm">
            {domainSynced && (sess.caseId || toastWbOverride) ? (
              <div className="pointer-events-auto flex flex-wrap items-center gap-2 border border-emerald-200 bg-emerald-50 px-3 py-2 text-xs text-emerald-950 shadow-lg">
                <span className="min-w-0 flex-1 font-medium">案件已同步更新</span>
                {toastWbPath && (
                  <a
                    href={workbenchAbsHref(toastWbPath)}
                    className="btn-press focus-ring shrink-0 rounded-lg border border-emerald-300 bg-white px-2.5 py-1 text-xs font-medium text-emerald-900 hover:bg-emerald-100"
                  >
                    {toastWbOverride?.includes('/research/')
                      ? '打开新建调研台'
                      : toastWbOverride?.includes('/monetize/')
                        ? '打开转化工作台'
                        : toastWbOverride?.includes('/watch/')
                          ? '打开监控台'
                          : '打开对应工作台'}
                  </a>
                )}
              </div>
            ) : (
              (msg || lastAppliedCommandLabel || lastDomainWrite) && (
                <div className="pointer-events-auto flex flex-wrap items-center gap-2 border border-slate-200 bg-white px-3 py-2 text-xs text-slate-800 shadow-lg">
                  <span className="min-w-0 flex-1">
                    {msg ||
                      (lastAppliedCommandLabel
                        ? `已写入领域：${lastAppliedCommandLabel}`
                        : lastDomainWrite?.message)}
                    {sessionRunMode(sess.id) && (
                      <span className="ml-2 text-slate-500">
                        · {sessionRunMode(sess.id) === 'formal' ? '正式办理' : '预览'}
                      </span>
                    )}
                  </span>
                </div>
              )
            )}
          </div>
        )}

        {/* P1-AE-2: when HITL, case bind lives in top band — not beside ConfirmBar */}
        {!sess.caseId && (hitlActive || caseBindGuide) && (
          <div
            ref={caseBindTopRef}
            className="shrink-0 border-b border-slate-100 bg-white px-4 py-2"
            data-testid="session-case-bind-top"
          >
            {caseBindGuide && !sess.caseId ? (
              <p className="mb-1.5 text-[11px] text-sky-900" role="status">
                开始办理后可在此绑定案件 · 无案确认不会写入案件
              </p>
            ) : null}
            <CaseBindControls
              caseId={sess.caseId}
              prominence="soft"
              writebackRequiresBind={false}
              onBind={(id) => {
                setCasePick(id)
                patchSession(sess.id, { caseId: id })
                setCaseBindGuide(false)
              }}
              onUnbind={() => {
                setCasePick('')
                patchSession(sess.id, { caseId: undefined })
              }}
            />
          </div>
        )}

        <SessionTimeline
          steps={sess.steps}
          playing={playing}
          bottomRef={bottomRef}
          runMode={sessionRunMode(sess.id)}
        />

        {/* P0-AF-1: needs_human → Confirm alone sticky; Composer folded out of dock */}
        {hitlActive ? (
          <>
            <div
              className="agent-hitl-dock sticky bottom-0 z-20 shrink-0"
              data-testid="session-bottom-dock"
            >
            <div ref={confirmBarRef}>
              <SessionConfirmBar
                sessionId={sess.id}
                agent={agent}
                gates={gates}
                clearedGates={clearedGates}
                handoffStatus={handoffStatus}
                handoffKey={handoffKey}
                caseId={sess.caseId}
                isEnterprise={isEnterprise}
                role={role}
                block={block}
                gateDisabledReason={gateDisabledReason}
                onGate={doGate}
                onHitl={doHitl}
                focusHitl={focusHitl}
                focusGate={focusGate}
                onPrimaryBlockerChange={setPrimaryBlocker}
                runMode={sessionRunMode(sess.id)}
                invoicePayable={
                  !!(c?.engagement?.invoices ?? []).some(
                    (i) =>
                      i.status === '逾期' ||
                      i.status === '已开票' ||
                      i.status === '待开票',
                  )
                }
                onFileResponse={
                  sess.caseId &&
                  (handoffKey === 'prosecution_response' ||
                    handoffKey === 'draft_claims' ||
                    handoffKey === 'maintain_annuity')
                    ? (receiptNo, filedAt) => {
                        void (async () => {
                          const r = await dispatchCommand(
                            {
                              type: 'fileResponse',
                              caseId: sess.caseId!,
                              handoffKey: handoffKey,
                              receiptNo,
                              filedAt,
                              note: '知产 Agent 递交归档（回执已确认）',
                            },
                            {
                              actor: 'agent',
                              agentId: resolvedAgentId,
                              detail: 'file_oa_response → FileResponse',
                            },
                          )
                          showToast(
                            r.ok
                              ? `已写入领域：${COMMAND_LABELS.fileResponse} · ${r.message}`
                              : r.message,
                            r.ok && !!sess.caseId,
                          )
                        })()
                      }
                    : undefined
                }
              />
            </div>
            </div>
            <details
              className="agent-hitl-composer-fold shrink-0 border-t border-slate-200/90 bg-white"
              data-testid="session-composer-fold"
            >
              <summary className="btn-press focus-ring hit-expand flex min-h-10 cursor-pointer select-none items-center px-4 text-xs font-medium text-slate-600 hover:bg-slate-50 lg:px-5">
                输入 / 切换 Agent（默认收起 · 确认完成前可不展开）
              </summary>
          <SessionComposer
            goal={goal}
            onGoalChange={setGoal}
            agentPick={agentPick}
            onAgentPickRequest={(v) => requestAgentSwitch(v)}
            composerRef={composerRef}
            onSubmit={submitComposer}
            pendingAgentSwitch={pendingAgentSwitch}
            onConfirmAgentSwitch={confirmPendingAgentSwitch}
            onCancelAgentSwitch={() => setPendingAgentSwitch(null)}
            hitlActive={hitlActive}
            hitlDisableReason={primaryBlocker}
            hideDisableReason
            caseBindSlot={undefined}
          />
            </details>
          </>
        ) : (
          <div className="shrink-0" data-testid="session-bottom-dock">
            {(handoffStatus === 'authorized_to_file' ||
              (handoffKey === 'maintain_annuity' &&
                handoffStatus === 'approved')) && (
            <div ref={confirmBarRef}>
              <SessionConfirmBar
                sessionId={sess.id}
                agent={agent}
                gates={gates}
                clearedGates={clearedGates}
                handoffStatus={handoffStatus}
                handoffKey={handoffKey}
                caseId={sess.caseId}
                isEnterprise={isEnterprise}
                role={role}
                block={block}
                gateDisabledReason={gateDisabledReason}
                onGate={doGate}
                onHitl={doHitl}
                focusHitl={focusHitl}
                focusGate={focusGate}
                onPrimaryBlockerChange={setPrimaryBlocker}
                runMode={sessionRunMode(sess.id)}
                invoicePayable={
                  !!(c?.engagement?.invoices ?? []).some(
                    (i) =>
                      i.status === '逾期' ||
                      i.status === '已开票' ||
                      i.status === '待开票',
                  )
                }
                onFileResponse={
                  sess.caseId &&
                  (handoffKey === 'prosecution_response' ||
                    handoffKey === 'draft_claims' ||
                    handoffKey === 'maintain_annuity')
                    ? (receiptNo, filedAt) => {
                        void (async () => {
                          const r = await dispatchCommand(
                            {
                              type: 'fileResponse',
                              caseId: sess.caseId!,
                              handoffKey: handoffKey,
                              receiptNo,
                              filedAt,
                              note: '知产 Agent 递交归档（回执已确认）',
                            },
                            {
                              actor: 'agent',
                              agentId: resolvedAgentId,
                              detail: 'file_oa_response → FileResponse',
                            },
                          )
                          showToast(
                            r.ok
                              ? `已写入领域：${COMMAND_LABELS.fileResponse} · ${r.message}`
                              : r.message,
                            r.ok && !!sess.caseId,
                          )
                        })()
                      }
                    : undefined
                }
              />
            </div>
            )}
          <SessionComposer
            goal={goal}
            onGoalChange={setGoal}
            agentPick={agentPick}
            onAgentPickRequest={(v) => requestAgentSwitch(v)}
            composerRef={composerRef}
            onSubmit={submitComposer}
            pendingAgentSwitch={pendingAgentSwitch}
            onConfirmAgentSwitch={confirmPendingAgentSwitch}
            onCancelAgentSwitch={() => setPendingAgentSwitch(null)}
            hitlActive={hitlActive}
            hitlDisableReason={primaryBlocker}
            caseBindSlot={
              !sess.caseId && (hitlActive || caseBindGuide)
                ? undefined
                : (
            <CaseBindControls
              caseId={sess.caseId}
              prominence="soft"
              writebackRequiresBind={false}
              onBind={(id) => {
                setCasePick(id)
                patchSession(sess.id, { caseId: id })
                setCaseBindGuide(false)
              }}
              onUnbind={() => {
                setCasePick('')
                patchSession(sess.id, { caseId: undefined })
              }}
            />
                  )
            }
          />
          </div>
        )}

      </section>

      {rightOpen && (
        <SessionContextPanel
          agent={agent}
          caseData={c}
          handoffStatus={handoffStatus}
          caseDockets={caseDockets}
          artifacts={sess.artifacts}
          activeArt={activeArt}
          onSelectArtifact={setActiveArtId}
          onUpdateArtifact={(artifactId, content) =>
            updateSessionArtifact(sess.id, artifactId, content)
          }
          caseId={sess.caseId}
          caseDriveItems={sess.caseId ? getCaseDriveItems(sess.caseId) : []}
          auditEntries={auditEntries}
          sessionId={sess.id}
          persona={persona}
          clearedHitlGates={sess.clearedHitlGates}
        />
      )}
    </div>
  )
}
