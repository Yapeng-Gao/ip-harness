import { workbenchAskPath } from '../../business/pendingDeptQuery'
import {
  HANDOFF_PLAN_GATE_HONEST,
  planAdvanceHandoffGate,
} from '../../business/handoffPlanGate'
import { deptSlug, orgDeptByLeadSeat } from '../../departments/orgDepts'
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
import { hitlReviseChipLabel } from '../../business/hitlReturnRevise'
import {
  appendArtifactVersion,
  formatArtifactSavedAt,
  restoreArtifactVersion,
} from '../../business/artifactVersions'
import { SeatMarkdownBody } from './SeatMarkdownBody'
import { humanizeToolBubble, parseRewindIntent } from '../../lib/stepChatFormat'
import { scrollBehavior } from '../../lib/motionPref'

/** 席内 mock 推进：短 defer，可被下一次交互覆盖 busy（不锁死 300ms+） */
function deferBusy(ms: number, fn: () => void): number {
  return window.setTimeout(fn, Math.min(ms, 80))
}

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
  /** §3.3 G1：齐套未齐时禁止交卷入 pending */
  deliverBlocked?: boolean
  deliverBlockedReason?: string
  /**
   * 部门台 Cursor 三栏：右栏禁「成果」阅读面（产出只在中栏）。
   * 默认全开，兼容案页 BusinessCasePage。
   */
  hideArtifactPanel?: boolean
  /**
   * 部门右栏对话化：藏席头/步骤条/面 tab，会话吃高 + composer 钉底。
   * 与 hideArtifactPanel 同用于部门台。
   */
  compactRail?: boolean
  /**
   * §130/§132：收口/以后做/本席硬请示态收掉次要块（席内回退·待确认回声·环边），
   * 让汇报占第一眼；勿把案级异部 pending 扶成上方拍板。
   */
  quietChrome?: boolean
  /**
   * §133：右栏 AI 产物 → 写入并聚焦中栏稿纸（部门台 hideArtifactPanel 时用）。
   */
  onOpenAiProductInMid?: (product: { title: string; body: string }) => void
  /**
   * §136：中栏划选「问 AI / 改这段」预填驾驭框（nonce 变则写入）。
   */
  composerPrefill?: string | null
  composerPrefillNonce?: number
}

/**
 * 席工作面（席=独立 bot · 7 席同构 · 案页三刀 + nits）：
 * 会话主 · 成果/过程次 tab（办理过程勿常驻会话下）· 交卷待确认
 * 本案 pending → 藏会话干活/交卷 chip，左栏「待确认」独占
 * 推进 → advanceSeatWork；顶栏唯一主 CTA 经 workNonce 触发
 */
export function BusinessSeatWorkbench({
  caseId,
  seatId,
  workNonce = 0,
  onAdvanced,
  onSwitchSeat,
  deliverBlocked = false,
  deliverBlockedReason,
  hideArtifactPanel = false,
  compactRail = false,
  quietChrome = false,
  onOpenAiProductInMid,
  composerPrefill = null,
  composerPrefillNonce = 0,
}: Props) {
  const {
    advanceSeatWork,
    rewindSeatWork,
    requestUpstreamFeedback,
    runSeatLoop,
    runHitlReturnRevise,
    lastReturnNoteForSeat,
    getPendingConfirms,
    getCaseConfirms,
    getProgress,
    getKitChecklist,
  } = useBusinessCases()
  const { getThread, appendMessage, patchThread } = useProjectFolder()
  const def = getProjectExpert(seatId)
  const thread = getThread(caseId, seatId)
  const stepIndex = thread?.stepIndex ?? 0
  const prog = getProgress(caseId)
  const seatDept = orgDeptByLeadSeat(seatId)
  const seatPlanHandoffGate = useMemo(() => {
    const active = prog.delegate?.chain?.find((s) => s.status === 'active')
    if (!active || !seatDept) return null
    if (active.deptSlug !== deptSlug(seatDept.id)) return null
    return planAdvanceHandoffGate({
      activeDeptSlug: active.deptSlug,
      confirms: getCaseConfirms(caseId),
      checklist: getKitChecklist(caseId, active.deptSlug),
    })
  }, [prog.delegate, seatDept, caseId, getCaseConfirms, getKitChecklist, prog.kitDoneByDept])
  const dual = deliverableForExpert(seatId)
  const seatLabel = businessSeatLabel(seatId)
  /** 本案任一 pending：会话 chip 藏/降灰，左栏「待确认」独占主视线 */
  const pendingList = useMemo(
    () => getPendingConfirms(caseId),
    [caseId, getPendingConfirms],
  )
  const caseHasPending = pendingList.length > 0
  const seatReturnNote = lastReturnNoteForSeat(caseId, seatId)
  const seatConfirmKind = confirmKindForSeat(seatId)
  const pendingForSeatEarly = useMemo(() => {
    const kind = confirmKindForSeat(seatId)
    if (!kind) return [] as typeof pendingList
    return pendingList.filter((c) => c.kind === kind)
  }, [pendingList, seatId])
  const canReviseAfterReturn =
    !!seatReturnNote && !!seatConfirmKind && !caseHasPending
  const pendingHint = useMemo(() => {
    // §132 G01/G04：收口/硬请示安静态 — 不点名异部、不空指「上方」
    if (quietChrome) {
      return `${seatLabel}跟班中。`
    }
    if (!caseHasPending) return ''
    // 本席硬请示：才可说「上方汇报」（父页气泡在）
    if (pendingForSeatEarly.length > 0) {
      const titles = pendingForSeatEarly
        .map((p) => p.title || CONFIRM_KIND_LABEL[p.kind] || '待确认项')
        .slice(0, 2)
        .join('、')
      const more =
        pendingForSeatEarly.length > 2
          ? ` 等 ${pendingForSeatEarly.length} 项`
          : ''
      const where = compactRail
        ? '请在上方汇报确认或驳回'
        : '请先点左栏「待确认」'
      return `${seatLabel}跟班中。本席待确认「${titles}${more}」· ${where}。`
    }
    // §132 G02：仅异部 pending — 勿空指上方、勿「已就绪」抢戏
    return `${seatLabel}跟班中。另有其他请示 · 可在左栏「待确认」查看。`
  }, [
    quietChrome,
    caseHasPending,
    pendingForSeatEarly,
    seatLabel,
    compactRail,
  ])
  const [panel, setPanel] = useState<'chat' | 'artifact' | 'worklog'>('chat')
  const setSafePanel = (next: 'chat' | 'artifact' | 'worklog') => {
    if (hideArtifactPanel && next === 'artifact') {
      setPanel('chat')
      return
    }
    setPanel(next)
  }
  const [draft, setDraft] = useState('')
  const [editingArtifact, setEditingArtifact] = useState(false)
  const [artifactDraft, setArtifactDraft] = useState('')
  const [artifactSavedHint, setArtifactSavedHint] = useState<string | null>(
    null,
  )
  const [flashBody, setFlashBody] = useState(false)
  const [flashLogId, setFlashLogId] = useState<string | null>(null)
  const [busy, setBusy] = useState(false)
  const [showFileNames, setShowFileNames] = useState(false)
  const [moreOpen, setMoreOpen] = useState(false)
  /** 简模式：环边 feedback/loop 默认收进「高级」 */
  const [advancedChipsOpen, setAdvancedChipsOpen] = useState(false)
  const bodyRef = useRef<HTMLDivElement>(null)
  const chatEndRef = useRef<HTMLDivElement>(null)
  const lastWorkNonce = useRef(0)
  const runAdvanceRef = useRef<(userLine?: string) => void>(() => {})

  useEffect(() => {
    setPanel('chat')
    setDraft('')
    setBusy(false)
    setFlashBody(false)
    setFlashLogId(null)
    setShowFileNames(false)
    setMoreOpen(false)
    setAdvancedChipsOpen(false)
  }, [seatId, caseId])

  /** §136：中栏选区带进驾驭框 */
  useEffect(() => {
    if (!composerPrefillNonce || !composerPrefill?.trim()) return
    setPanel('chat')
    setDraft(composerPrefill)
  }, [composerPrefillNonce, composerPrefill])

  useEffect(() => {
    if (hideArtifactPanel && panel === 'artifact') setPanel('chat')
  }, [hideArtifactPanel, panel])

  const pendingForSeat = pendingForSeatEarly

  const oaLocked = seatId === 'expert-oa' && !prog.filed
  const submitted = !!thread?.artifactSubmitted
  const btnLabel = advanceButtonLabel(def.steps, stepIndex)
  const atHitl =
    !!def.steps[stepIndex]?.triggersHitl || pendingForSeat.length > 0

  const artifactBody = useMemo(() => {
    if (!dual) return ''
    if (thread?.artifactMarkdown?.trim()) return thread.artifactMarkdown
    return buildProgressiveArtifact(dual, def.steps, stepIndex)
  }, [dual, def.steps, stepIndex, thread?.artifactMarkdown])

  const worklogBody = useMemo(() => {
    if (!dual) return ''
    return buildProgressiveWorklog(dual, def.steps, stepIndex)
  }, [dual, def.steps, stepIndex])

  const beginEditArtifact = () => {
    setArtifactDraft(artifactBody)
    setEditingArtifact(true)
    setArtifactSavedHint(null)
  }

  const saveArtifactEdit = () => {
    patchThread(caseId, seatId, { artifactMarkdown: artifactDraft })
    setEditingArtifact(false)
    setArtifactSavedHint('已保存到本席成果（覆盖稿）')
  }

  const saveArtifactAsVersion = () => {
    const body = editingArtifact ? artifactDraft : artifactBody
    if (!body.trim()) {
      setArtifactSavedHint('无可另存的内容')
      return
    }
    const { versions, hint } = appendArtifactVersion({
      versions: thread?.artifactVersions ?? [],
      markdown: body,
    })
    patchThread(caseId, seatId, {
      artifactMarkdown: body,
      artifactVersions: versions,
    })
    if (editingArtifact) setEditingArtifact(false)
    setArtifactSavedHint(hint)
  }

  const cancelArtifactEdit = () => {
    setEditingArtifact(false)
    setArtifactDraft('')
  }

  const resetArtifactOverride = () => {
    patchThread(caseId, seatId, { artifactMarkdown: undefined })
    setEditingArtifact(false)
    setArtifactSavedHint('已恢复步骤拼装稿')
  }

  const restoreVersionAt = (index: number) => {
    const r = restoreArtifactVersion({
      versions: thread?.artifactVersions ?? [],
      index,
    })
    if (!r) {
      setArtifactSavedHint('版本不存在')
      return
    }
    patchThread(caseId, seatId, { artifactMarkdown: r.markdown })
    setEditingArtifact(false)
    setArtifactSavedHint(r.hint)
  }

  const messages = thread?.messages ?? []

  useEffect(() => {
    if (!flashBody) return
    const t = window.setTimeout(() => setFlashBody(false), 180)
    return () => window.clearTimeout(t)
  }, [flashBody])

  useEffect(() => {
    if (!flashLogId) return
    const t = window.setTimeout(() => setFlashLogId(null), 220)
    return () => window.clearTimeout(t)
  }, [flashLogId])

  useEffect(() => {
    if (!flashBody) return
    bodyRef.current?.scrollTo({
      top: bodyRef.current.scrollHeight,
      behavior: scrollBehavior(),
    })
  }, [flashBody, worklogBody, stepIndex])

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: scrollBehavior() })
  }, [messages.length, busy])

  const runAdvance = (userLine?: string) => {
    if (thread?.followUpMode === 'paused' || thread?.followUpMode === 'strategy') return
    if (oaLocked || busy) return
    const wantsDeliver =
      !!userLine &&
      (/交卷|确认/.test(userLine) || userLine.includes('请交卷'))
    if (deliverBlocked && wantsDeliver) {
      appendMessage(caseId, seatId, {
        role: 'assistant',
        content: `【${seatLabel}】${deliverBlockedReason ?? '齐套未齐，不能交卷入「待你确认」。请先补齐缺项。'}`,
        meta: { backend: 'mock', stepId: 'gate_g1_blocked' },
      })
      return
    }
    setBusy(true)
    if (userLine?.trim()) {
      appendMessage(caseId, seatId, {
        role: 'user',
        content: userLine.trim(),
        meta: { backend: 'mock' },
      })
    }
    deferBusy(48, () => {
      if (pendingForSeat.length > 0 || (submitted && atHitl)) {
        appendMessage(caseId, seatId, {
          role: 'assistant',
          content: hideArtifactPanel
            ? `【${seatLabel}】本席已交卷，产出正文在中栏。请你在「待我确认」里确认后，本案进度才会前进。`
            : `【${seatLabel}】本席已交卷，成果在「成果」面板。请你在「待我确认」里确认后，本案进度才会前进。`,
          meta: { backend: 'mock' },
        })
        setBusy(false)
        setSafePanel('chat')
        return
      }
      const r = advanceSeatWork(caseId, seatId)
      setFlashBody(true)
      if (r.processLogId) setFlashLogId(r.processLogId)
      // §133 mid sync after advance：hideArtifactPanel 时右栏无「成果」tab，把本席产物写入中栏稿纸
      if (hideArtifactPanel && onOpenAiProductInMid && dual) {
        const idx = getThread(caseId, seatId)?.stepIndex ?? 0
        const progressive = buildProgressiveArtifact(dual, def.steps, idx)
        const marker = '## 本席推进记录'
        const excerpt =
          progressive.indexOf(marker) >= 0
            ? progressive.slice(progressive.indexOf(marker)).trim()
            : progressive.trim()
        if (excerpt.length > 24) {
          onOpenAiProductInMid({
            title: r.stepLabel ? `本步 · ${r.stepLabel}` : '本席推进记录',
            body: excerpt.slice(0, 4000),
          })
        }
      }
      if (r.delivered && r.confirm) {
        setSafePanel('artifact')
        appendMessage(caseId, seatId, {
          role: 'assistant',
          content: hideArtifactPanel
            ? `【${seatLabel}】已交卷「${r.stepLabel}」。产出正文在中栏稿纸；请你确认后主链才前进。`
            : `【${seatLabel}】已交卷「${r.stepLabel}」。请你确认后主链才前进。`,
          meta: { backend: 'mock', stepId: 'deliver' },
        })
      } else {
        setSafePanel('chat')
      }
      onAdvanced?.(r.confirm?.id)
      setBusy(false)
    })
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
    deferBusy(48, () => {
      const r = requestUpstreamFeedback(caseId, seatId, toSeat, reason)
      setBusy(false)
      setSafePanel('chat')
      if (r.ok && r.switchToSeat && onSwitchSeat) {
        deferBusy(80, () => onSwitchSeat(r.switchToSeat!))
      }
    })
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
    deferBusy(48, () => {
      runSeatLoop(caseId, seatId, actionId, note)
      setFlashLogId(null)
      setSafePanel('chat')
      setBusy(false)
    })
  }

  const sendUser = () => {
    const text = draft.trim()
    if (!text || oaLocked || busy) return
    if (thread?.followUpMode === 'paused') return
    if (thread?.followUpMode === 'strategy') {
      appendMessage(caseId, seatId, { role: 'user', content: text, meta: { backend: 'mock' } })
      appendMessage(caseId, seatId, { role: 'assistant', content: `【${seatLabel}】先保留当前稿件。可以比较两条路径：补充原方案所需的事实与材料，或调整本轮方案范围。前者需要可用依据，后者需要重新确认取舍。以上为样机讨论提示，请补充你的选择，选定后点「继续修改」。`, meta: { backend: 'mock' } })
      setDraft('')
      return
    }
    setDraft('')
    const rewind = parseRewindIntent(text, def.steps)
    if (rewind) {
      setBusy(true)
      appendMessage(caseId, seatId, {
        role: 'user',
        content: text,
        meta: { backend: 'mock' },
      })
      deferBusy(48, () => {
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
          setSafePanel('chat')
        }
        setBusy(false)
      })
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
    deferBusy(48, () => {
      const r = rewindSeatWork(caseId, seatId, targetIndex)
      if (r.ok) {
        setFlashBody(true)
        if (r.processLogId) setFlashLogId(r.processLogId)
        setSafePanel('chat')
      }
      setBusy(false)
    })
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
      if (quietChrome) return pendingHint || `${seatLabel}跟班中。`
      return caseHasPending
        ? pendingHint
        : `${seatLabel}跟班中。跟我聊，或点右上「让它干活」；交卷后会写入待我确认。`
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
      data-hide-artifact={hideArtifactPanel ? '1' : '0'}
      data-compact-rail={compactRail ? '1' : '0'}
      data-quiet-chrome={quietChrome ? '1' : '0'}
    >
      {!compactRail ? (
      <header className="mb-3 flex flex-wrap items-start justify-between gap-2">
        <div>
          <h2 className="text-sm font-semibold text-slate-900">{seatLabel}</h2>
          <p className="mt-0.5 text-[11px] text-slate-500 line-clamp-2">
            {sanitizeBizBlurb(def.description)}
          </p>
          {seatId === 'expert-research' && (prog.researchPass ?? 0) >= 1 && !prog.doneSeatIds.includes('expert-research') ? (
            <p
              className="mt-1 text-[11px] text-amber-800"
              data-testid="business-research-pass-spec"
            >
              这一轮对照说明书和权要。交底后的查新已经确认过。
            </p>
          ) : null}
          {seatId === 'expert-research' && (prog.researchPass ?? 0) < 1 ? (
            <p
              className="mt-1 text-[11px] text-slate-500"
              data-testid="business-research-pass-disclosure"
            >
              这一轮对照交底书（含示意图）。说明书写完后还会再查一轮。
            </p>
          ) : null}
          {seatId === 'expert-disclosure' ? (
            <p className="mt-1 text-[11px] text-slate-500">
              交底书要带示意图。正式附图在说明书和再次查新之后。
            </p>
          ) : null}
        </div>
        {/* 遗留过程旁路收进「更多」；无并列主 CTA */}
        <div className="relative">
          <button
            type="button"
            onClick={() => setMoreOpen((v) => !v)}
            className="btn-press focus-ring min-h-10 rounded-md border border-slate-200 bg-white px-2.5 py-1.5 text-[10px] font-medium text-slate-500 hover:bg-slate-50"
            data-testid="business-seat-more"
            aria-expanded={moreOpen}
            aria-label="更多操作"
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
                title="遗留过程旁路（非一期主办理）"
                onClick={() => setMoreOpen(false)}
              >
                过程示意（旁路）
              </Link>
            </div>
          )}
        </div>
      </header>
      ) : null}

      {oaLocked && (
        <p
          className="mb-2 rounded-lg border border-amber-200 bg-amber-50 px-2.5 py-1.5 text-[11px] text-amber-950"
          data-testid="business-seat-oa-locked"
        >
          审查答复未解锁 · 须先确认递交
        </p>
      )}

      {/* 已完成 / 当前步可点回退；未到达不可点 · 右栏对话化时点开「本步」再看 */}
      {!compactRail ? (
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
                className={`btn-press focus-ring min-h-10 rounded-full border px-2.5 py-1.5 text-[10px] font-medium transition-colors ${
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
      ) : quietChrome ? (
        <div
          className="sr-only"
          data-testid="business-seat-steps-fold"
          data-progress-role="seat-rewind-only"
          data-dual-progress="0"
          data-quiet-chrome="1"
        >
          本阶段已提交，修改步骤暂时收起
        </div>
      ) : (
        <details
          className="mb-1.5 shrink-0 px-0"
          data-testid="business-seat-steps-fold"
          data-progress-role="seat-rewind-only"
          data-dual-progress="0"
        >
          <summary className="cursor-pointer select-none text-[10px] font-medium text-slate-400">
            回到上一步
            <span className="sr-only">
              席内 {stepIndex + 1}/{def.steps.length}
              {def.steps[stepIndex]?.label ? ` · ${def.steps[stepIndex].label}` : ''}
              （流程进度只在顶栏）
            </span>
          </summary>
          <ol
            className="mt-1.5 flex flex-wrap gap-1.5"
            data-testid="business-seat-steps"
            aria-label="本席步骤进度（可回退已走步骤）"
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
                  >
                    {i + 1}. {s.label}
                    {s.triggersHitl ? ' · 待交' : ''}
                  </button>
                </li>
              )
            })}
          </ol>
        </details>
      )}

      {seatPlanHandoffGate ? (
        <div
          className={`${compactRail ? 'mb-2 px-2 py-1.5' : 'mb-3 px-3 py-2'} rounded-lg border ${
            seatPlanHandoffGate.allow
              ? 'border-emerald-200 bg-emerald-50/80'
              : seatPlanHandoffGate.code === 'awaiting_confirm'
                ? 'border-amber-200 bg-amber-50/80'
                : 'border-slate-200 bg-slate-50'
          }`}
          data-testid="seat-handoff-plan-gate"
          data-handoff-gate={seatPlanHandoffGate.code}
        >
          <div className="text-[10px] font-semibold uppercase tracking-wider text-slate-600">
            本阶段安排与提交条件
          </div>
          <p className="mt-0.5 text-[11px] leading-relaxed text-slate-800">
            {seatPlanHandoffGate.hint}
          </p>
          {!compactRail ? (
            <p className="mt-0.5 text-[10px] text-slate-500">
              {HANDOFF_PLAN_GATE_HONEST}
            </p>
          ) : null}
        </div>
      ) : null}

      {!compactRail && pendingForSeat.length > 0 && (
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
                  to={workbenchAskPath(item.caseId, item.kind, {
                    confirmId: item.id,
                  })}
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

      {/* 会话主 · 成果/过程次 tab；右栏对话化默认只会话 */}
      {!compactRail ? (
      <div
        className="mb-2 flex flex-wrap items-center gap-1 rounded-lg border border-slate-200 bg-slate-50 p-0.5"
        data-testid="business-seat-surface-tabs"
        role="tablist"
      >
        {(
          (
            [
              ['chat', '会话', '跟人 ↔ 本席 bot 对话；点「让它干活」推进剧本'],
              ['artifact', '成果', '本席交付件（意见书/权要等），随步骤变长，可扫读'],
              ['worklog', '办理过程', '本席怎么做的：步骤日志 + 本案过程事件'],
            ] as const
          ).filter(([id]) => !(hideArtifactPanel && id === 'artifact'))
        ).map(([id, label, tip]) => (
          <button
            key={id}
            type="button"
            role="tab"
            title={tip}
            aria-label={`${label}：${tip}`}
            aria-selected={panel === id}
            onClick={() => setSafePanel(id)}
            className={`btn-press focus-ring min-h-10 rounded-md px-2.5 py-1.5 text-[11px] font-semibold ${
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
      ) : null}

      {panel === 'chat' || (hideArtifactPanel && panel === 'artifact') || compactRail ? (
        <section
          className={
            compactRail
              ? 'flex min-h-0 flex-1 flex-col border-0 bg-transparent shadow-none'
              : 'mb-3 flex min-h-[16rem] flex-col rounded-xl border border-slate-200 bg-white shadow-sm'
          }
          data-testid="business-seat-chat"
        >
          <div
            className={
              compactRail
                ? 'min-h-0 flex-1 space-y-2 overflow-y-auto px-3 py-2'
                : 'min-h-0 flex-1 space-y-2 overflow-y-auto px-3 py-3'
            }
          >
            {messages.length === 0 ? (
              <p className="text-[12px] text-slate-500">
                {quietChrome
                  ? pendingHint || `${seatLabel}跟班中。`
                  : caseHasPending
                    ? pendingHint
                    : `${seatLabel}跟班中。跟我聊，或点右上「让它干活」。`}
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
                    <div className="mb-0.5 text-[9px] font-semibold text-violet-700/80">
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
                  {hideArtifactPanel &&
                  onOpenAiProductInMid &&
                  (m.role === 'assistant' || m.role === 'tool') &&
                  (m.content?.trim().length ?? 0) > 24 ? (
                    <button
                      type="button"
                      className="btn-press focus-ring mt-1.5 rounded-full border border-violet-200 bg-white px-2 py-0.5 text-[10px] font-medium text-violet-800 hover:bg-violet-50"
                      data-testid="business-seat-open-in-mid"
                      title="产物放到中栏稿纸阅读"
                      onClick={() =>
                        onOpenAiProductInMid({
                          title: toolUi?.title || (m.meta?.stepId ? `本步 · ${m.meta.stepId}` : '本席产出'),
                          body: displayContent(m.role, m.content, m.meta?.stepId),
                        })
                      }
                    >
                      在中栏打开
                    </button>
                  ) : null}
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
          <div
            className={
              compactRail
                ? 'shrink-0 border-t border-slate-100 px-2 py-2'
                : 'shrink-0 border-t border-slate-100 px-2 py-2'
            }
          >
            {canReviseAfterReturn ? (
              <div className="mb-2 rounded-lg border border-amber-200 bg-amber-50 p-2 text-xs" data-testid="return-follow-up">
                <p className="font-medium">{seatLabel}继续跟进：{seatReturnNote}</p>
                <p className="mt-1 text-slate-600">{thread?.followUpMode === 'paused' ? '已暂停，材料和意见会保留。恢复后再继续。' : thread?.followUpMode === 'strategy' ? '先讨论修改方向，选定后点继续修改。' : '按意见修改后，再提交给你确认。'}</p>
                <div className="mt-2 flex flex-wrap gap-2">
                  <button type="button" className="focus-ring rounded border bg-white px-2 py-1" onClick={() => patchThread(caseId, seatId, { followUpMode: 'revise' })}>继续修改</button>
                  <button type="button" className="focus-ring rounded border bg-white px-2 py-1" onClick={() => { patchThread(caseId, seatId, { followUpMode: 'strategy' }); setDraft('请对照退回意见分析原因，提出不同修改策略、依据和取舍，等我选定后再继续。') }}>换策略请示</button>
                  <button type="button" className="focus-ring rounded border bg-white px-2 py-1" onClick={() => patchThread(caseId, seatId, { followUpMode: 'paused' })}>先暂停</button>
                </div>
              </div>
            ) : null}
            {/* 简模式：主路径只留干活/交卷；feedback/loop 收进「高级」 */}
            {!caseHasPending ? (
              <div className="mb-1.5 space-y-1" data-testid="business-seat-chips">
                <div className="flex flex-wrap gap-1">
                  <button
                    type="button"
                    className="rounded-full border border-slate-200 bg-white px-2 py-0.5 text-[10px] text-slate-700 hover:bg-slate-50"
                    data-testid="business-seat-chip-work"
                    disabled={oaLocked || busy || thread?.followUpMode === 'paused' || thread?.followUpMode === 'strategy'}
                    onClick={() => runAdvance('请按剧本干下一步')}
                  >
                    让它干活
                  </button>
                  <button
                    type="button"
                    className="rounded-full border border-amber-200 bg-amber-50 px-2 py-0.5 text-[10px] font-medium text-amber-950 hover:bg-amber-100 disabled:cursor-not-allowed disabled:opacity-50"
                    data-testid="business-seat-chip-deliver"
                    disabled={oaLocked || busy || deliverBlocked || thread?.followUpMode === 'paused' || thread?.followUpMode === 'strategy'}
                    title={
                      deliverBlocked
                        ? deliverBlockedReason ?? '齐套未齐，不能交卷'
                        : undefined
                    }
                    onClick={() => runAdvance('请交卷，我来确认')}
                  >
                    交卷请确认
                  </button>
                  {canReviseAfterReturn && seatConfirmKind && (
                    <button
                      type="button"
                      className="rounded-full border border-rose-200 bg-rose-50 px-2 py-0.5 text-[10px] font-medium text-rose-950 hover:bg-rose-100"
                      data-testid="business-seat-chip-revise"
                      disabled={busy || thread?.followUpMode === 'paused' || thread?.followUpMode === 'strategy'}
                      title={seatReturnNote ?? undefined}
                      onClick={() => {
                        setBusy(true)
                        deferBusy(48, () => {
                          patchThread(caseId, seatId, { followUpMode: 'revise' })
                          runHitlReturnRevise(caseId, seatId)
                          setSafePanel('chat')
                          setBusy(false)
                        })
                      }}
                    >
                      {hitlReviseChipLabel(seatConfirmKind)}
                    </button>
                  )}
                  {!quietChrome && (feedbackEdges.length > 0 || loopActions.length > 0) && (
                    <button
                      type="button"
                      className="rounded-full border border-dashed border-slate-300 bg-transparent px-2 py-0.5 text-[10px] text-slate-500 hover:bg-slate-50"
                      data-testid="business-seat-chips-advanced-toggle"
                      onClick={() => setAdvancedChipsOpen((v) => !v)}
                    >
                      {advancedChipsOpen ? '收起高级' : '高级 · 环边'}
                    </button>
                  )}
                </div>
                {!quietChrome && advancedChipsOpen && (
                  <div
                    className="flex flex-wrap gap-1"
                    data-testid="business-seat-chips-advanced"
                  >
                    {feedbackEdges.map((edge) => (
                      <button
                        key={`${edge.from}-${edge.to}`}
                        type="button"
                        className="rounded-full border border-violet-200 bg-violet-50 px-2 py-0.5 text-[10px] font-medium text-violet-950 hover:bg-violet-100"
                        data-testid={`business-seat-chip-feedback-${edge.to}`}
                        disabled={oaLocked || busy || thread?.followUpMode === 'paused' || thread?.followUpMode === 'strategy'}
                        title="请上游调整一版（不回退本席进度）· 优先用案子助手代办"
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
                        disabled={busy || (oaLocked && a.needsFiled)}
                        title="席内环边 · 写过程 + 会话（样机）"
                        onClick={() => runLoopAction(a.id)}
                      >
                        {a.chip}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            ) : quietChrome ? (
              <div
                className="sr-only"
                data-testid="business-seat-chips-deferred"
                data-quiet-chrome="1"
              >
                请查看本部门的确认汇报
              </div>
            ) : (
              <div className="mb-1.5 space-y-1">
                <p
                  className="text-[10px] text-amber-800/80"
                  data-testid="business-seat-chips-deferred"
                >
                  {pendingForSeat.length > 0
                    ? `本席待确认 · ${
                        pendingForSeat[0]?.title ||
                        CONFIRM_KIND_LABEL[pendingForSeat[0]?.kind!] ||
                        '请在上方汇报'
                      }`
                    : '另有待确认 · 左栏「待确认」可看'}
                </p>
                {(feedbackEdges.length > 0 || loopActions.length > 0) && (
                  <button
                    type="button"
                    className="rounded-full border border-dashed border-slate-300 bg-transparent px-2 py-0.5 text-[10px] text-slate-500 hover:bg-slate-50"
                    data-testid="business-seat-chips-advanced-toggle"
                    onClick={() => setAdvancedChipsOpen((v) => !v)}
                  >
                    {advancedChipsOpen ? '收起高级' : '高级 · 环边'}
                  </button>
                )}
                {advancedChipsOpen && (
                  <div
                    className="flex flex-wrap gap-1"
                    data-testid="business-seat-chips-advanced"
                  >
                    {feedbackEdges.map((edge) => (
                      <button
                        key={`${edge.from}-${edge.to}`}
                        type="button"
                        className="rounded-full border border-violet-200 bg-violet-50 px-2 py-0.5 text-[10px] font-medium text-violet-950 hover:bg-violet-100"
                        data-testid={`business-seat-chip-feedback-${edge.to}`}
                        disabled={oaLocked || busy || thread?.followUpMode === 'paused' || thread?.followUpMode === 'strategy'}
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
                )}
              </div>
            )}
            <div
              className={`space-y-1 ${compactRail ? 'border-t border-slate-100 bg-white pt-2' : ''}`}
              data-testid="business-seat-composer-wrap"
            >
              {compactRail ? (
                <p
                  className="px-0.5 text-[10px] font-medium text-violet-700"
                  data-testid="composer-to"
                >
                  对：{seatLabel} · 团队
                </p>
              ) : null}
              <div className="flex gap-2">
                <textarea
                  value={draft}
                  onChange={(e) => setDraft(e.target.value)}
                  onKeyDown={onKey}
                  rows={1}
                  placeholder={
                    compactRail
                      ? '说一句驾驭（演示）· 如收紧独权'
                      : `跟「${seatLabel}」说…（环边/回退/feedback 均可）`
                  }
                  className="focus-ring min-h-[2.25rem] flex-1 resize-none rounded-lg border border-slate-200 px-2.5 py-1.5 text-[12px] text-slate-800 placeholder:text-slate-400"
                  data-testid="business-seat-composer"
                  data-mid-selection-prefill={
                    composerPrefillNonce > 0 && draft.includes('>') ? '1' : '0'
                  }
                  disabled={oaLocked || busy || thread?.followUpMode === 'paused' || thread?.followUpMode === 'strategy'}
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
          </div>
        </section>
      ) : (
        <div className="mb-3 space-y-3" data-testid="business-seat-side-panel">
          <section
            className="rounded-xl border border-slate-200 bg-white shadow-sm"
            data-testid="business-seat-dual-file"
          >
            <div className="flex items-center justify-between gap-2 border-b border-slate-100 px-3 py-2">
              <div className="text-[10px] font-semibold text-slate-400">
                {panel === 'artifact' ? '成果' : '办理过程'}
                {showFileNames && dual ? (
                  <span
                    className="ml-2 font-mono font-normal text-slate-300"
                    data-testid="business-seat-eng-filename"
                  >
                    {panel === 'artifact' ? dual.title : dual.title + ' · 办理摘记'}
                  </span>
                ) : null}
                {panel === 'artifact' && thread?.artifactMarkdown ? (
                  <span
                    className="ml-2 font-normal text-emerald-700"
                    data-testid="business-artifact-edited-badge"
                  >
                    已手改
                  </span>
                ) : null}
              </div>
              {panel === 'artifact' && dual && !editingArtifact ? (
                <div className="flex flex-wrap gap-1">
                  <button
                    type="button"
                    className="rounded border border-slate-200 bg-white px-1.5 py-0.5 text-[10px] font-medium text-slate-700 hover:bg-slate-50"
                    data-testid="business-artifact-edit"
                    onClick={beginEditArtifact}
                  >
                    编辑
                  </button>
                  <button
                    type="button"
                    className="rounded border border-slate-200 bg-white px-1.5 py-0.5 text-[10px] font-medium text-slate-700 hover:bg-slate-50"
                    data-testid="business-artifact-save-version"
                    onClick={saveArtifactAsVersion}
                  >
                    另存版本
                    {thread?.artifactVersions?.length
                      ? ` · ${thread.artifactVersions.length}`
                      : ''}
                  </button>
                  {thread?.artifactMarkdown ? (
                    <button
                      type="button"
                      className="rounded border border-slate-200 bg-white px-1.5 py-0.5 text-[10px] text-slate-500 hover:bg-slate-50"
                      data-testid="business-artifact-reset"
                      onClick={resetArtifactOverride}
                    >
                      恢复拼装稿
                    </button>
                  ) : null}
                </div>
              ) : null}
            </div>
            {dual ? (
              editingArtifact && panel === 'artifact' ? (
                <div className="space-y-2 p-3" data-testid="business-artifact-editor">
                  <textarea
                    value={artifactDraft}
                    onChange={(e) => setArtifactDraft(e.target.value)}
                    rows={12}
                    className="focus-ring w-full rounded-md border border-slate-200 px-2.5 py-2 font-mono text-[11px] leading-relaxed text-slate-800"
                    data-testid="business-artifact-textarea"
                  />
                  <div className="flex flex-wrap gap-1.5">
                    <button
                      type="button"
                      className="btn-press focus-ring rounded-md bg-slate-900 px-2.5 py-1 text-[11px] font-semibold text-white"
                      data-testid="business-artifact-save"
                      onClick={saveArtifactEdit}
                    >
                      保存
                    </button>
                    <button
                      type="button"
                      className="btn-press focus-ring rounded-md border border-slate-300 bg-white px-2.5 py-1 text-[11px] font-medium text-slate-800"
                      data-testid="business-artifact-save-version-edit"
                      onClick={saveArtifactAsVersion}
                    >
                      另存版本
                    </button>
                    <button
                      type="button"
                      className="rounded-md border border-slate-200 bg-white px-2.5 py-1 text-[11px] text-slate-600"
                      data-testid="business-artifact-cancel"
                      onClick={cancelArtifactEdit}
                    >
                      取消
                    </button>
                  </div>
                </div>
              ) : (
                <>
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
                  {panel === 'artifact' &&
                  (thread?.artifactVersions?.length ?? 0) > 0 ? (
                    <ul
                      className="border-t border-slate-100 px-3 py-2"
                      data-testid="business-artifact-version-list"
                    >
                      <li className="mb-1 text-[10px] font-semibold text-slate-400">
                        已另存版本
                      </li>
                      {[...(thread?.artifactVersions ?? [])]
                        .map((v, i) => ({ v, i }))
                        .reverse()
                        .map(({ v, i }) => (
                          <li
                            key={`${v.savedAt}-${i}`}
                            className="flex items-center justify-between gap-2 py-0.5 text-[11px] text-slate-600"
                            data-testid={`business-artifact-version-${i}`}
                          >
                            <span className="truncate font-mono text-[10px] text-slate-400">
                              {formatArtifactSavedAt(new Date(v.savedAt))} ·{' '}
                              {v.markdown.slice(0, 24)}
                              {v.markdown.length > 24 ? '…' : ''}
                            </span>
                            <button
                              type="button"
                              className="shrink-0 rounded border border-slate-200 bg-white px-1.5 py-0.5 text-[10px] font-medium text-slate-700 hover:bg-slate-50"
                              data-testid={`business-artifact-restore-${i}`}
                              onClick={() => restoreVersionAt(i)}
                            >
                              恢复此版
                            </button>
                          </li>
                        ))}
                    </ul>
                  ) : null}
                </>
              )
            ) : (
              <p className="p-3 text-xs text-slate-400">本席暂无双文件约定</p>
            )}
            {artifactSavedHint && panel === 'artifact' ? (
              <p
                className="border-t border-slate-100 px-3 py-1.5 text-[10px] text-emerald-700"
                data-testid="business-artifact-save-hint"
              >
                {artifactSavedHint}
              </p>
            ) : null}
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
          onClick={() => setSafePanel('artifact')}
        />
        <button
          type="button"
          data-testid="business-dual-tab-worklog"
          onClick={() => setSafePanel('worklog')}
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
