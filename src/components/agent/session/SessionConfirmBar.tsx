import { useEffect, useMemo, useState } from 'react'
import {
  Check,
  RotateCcw,
  Circle,
  CircleCheck,
  ChevronDown,
} from 'lucide-react'
import type { HitlSessionAction } from '../../../context/AgentContext'
import type { AgentDef, HitlGateId, HandoffStatus } from '../../../types'
import { HITL_GATE_LABELS } from '../../../data/agents'
import {
  DRAFT_FILING_CHECK_ITEMS,
  DISCLOSURE_PACK_CHECK_ITEMS,
  REQUIRED_BEFORE_SUBMIT,
  disclosurePackComplete,
  disclosurePackMissing,
  HANDOFF_LABELS,
} from '../../../data/handoff'
import { previewHitlCommandChain } from './sessionGates'
import { HandoffChip } from '../../HandoffChip'
import { AppLink } from '../../AppLink'
import { opsInboxDeepLink } from '../../../utils/opsInbox'
import {
  getHitlStepwisePref,
  setHitlStepwisePref,
} from '../../../utils/lastVisited'
import { useApp } from '../../../context/AppContext'
import { useAgents } from '../../../context/AgentContext'
import type { OaIssueType } from '../../../types'
import {
  evaluateFullCheck,
  fullCheckScopeFor,
  FULL_CHECK_LITE_ITEMS,
  OA_ISSUE_TYPE_LABELS,
  OA_ISSUE_TYPES,
} from '../../../utils/fullFilingCheck'
import {
  evaluateGuardrails,
  firstGuardrailMessage,
} from '../../../domain/guardrails'

type BlockInfo = { blocked: boolean; reason?: string }

export type HitlBarOpts = { stepwise?: boolean; note?: string }

type WatchDisposition = 'confirm' | 'escalate' | 'close'

const WATCH_DISPOSITION_NOTE: Record<WatchDisposition, string> = {
  confirm: '处置：确认告警（对齐监控台「已确认」）',
  escalate: '处置：升级维权（对齐监控台「已升级」）',
  close: '处置：关闭（对齐监控台「已关闭」）',
}

type Props = {
  agent?: AgentDef
  gates: HitlGateId[]
  clearedGates: HitlGateId[]
  handoffStatus?: HandoffStatus
  handoffKey?: string
  caseId?: string
  isEnterprise: boolean
  role: string
  block: BlockInfo
  gateDisabledReason: (g: HitlGateId) => string | null
  onGate: (g: HitlGateId, opts?: HitlBarOpts) => void
  onHitl: (action: HitlSessionAction, opts?: HitlBarOpts) => void
  onFileResponse?: (receiptNo: string, filedAt: string) => void
  /** formal → stepwise default on; dry-run/preview → default off (localStorage 覆盖) */
  runMode?: 'dry-run' | 'formal' | null
  /** 年费闸：是否还有待付发票（无则预告跳过「付款解锁」） */
  invoicePayable?: boolean
  /** OA 陈述确认等 session 级 flag */
  sessionId?: string
  /** Wave2 InboxDeepLink · 从 Inbox 深链进入时高亮 ConfirmBar */
  focusHitl?: boolean
  /** 深链指定闸（gate=）时轻量强调对应 chip */
  focusGate?: HitlGateId | null
  /** R-P1-3 · 主因回传 composer（仅展示） */
  onPrimaryBlockerChange?: (reason: string | null) => void
}

export function SessionConfirmBar({
  agent,
  gates,
  clearedGates,
  handoffStatus,
  handoffKey,
  caseId,
  isEnterprise,
  role,
  block,
  gateDisabledReason,
  onGate,
  onHitl,
  onFileResponse,
  runMode,
  invoicePayable,
  sessionId,
  focusHitl = false,
  focusGate = null,
  onPrimaryBlockerChange,
}: Props) {
  const firstActionable = gates.find((g) => !gateDisabledReason(g))
  const pendingGate = gates.find((g) => !clearedGates.includes(g))
  const legalNextGate = firstActionable ?? pendingGate
  const roleKind = role === 'agency' ? 'agency' : 'enterprise'
  const chainPreviewRaw =
    firstActionable
      ? previewHitlCommandChain(firstActionable, roleKind, agent?.id)
      : []
  const chainPreview =
    firstActionable === 'pay_unlock' && invoicePayable === false
      ? chainPreviewRaw.filter((s) => s !== '付款解锁')
      : chainPreviewRaw
  const [stepwise, setStepwise] = useState(() =>
    getHitlStepwisePref(runMode !== 'dry-run'),
  )
  const toggleStepwise = (on: boolean) => {
    setStepwise(on)
    setHitlStepwisePref(on)
  }
  const [receiptNo, setReceiptNo] = useState('CN2026-DEMO-001')
  const [filedAt, setFiledAt] = useState(() =>
    new Date().toISOString().slice(0, 10),
  )
  const [fileErr, setFileErr] = useState<string | null>(null)

  const {
    getDraftFilingCheck,
    toggleDraftFilingCheck,
    getDisclosurePackCheck,
    toggleDisclosurePackCheck,
    setLegalReview,
    getCase,
    getHandoff,
    getFullCheckLite,
    toggleFullCheckLite,
    appendCaseDriveItem,
    persona,
  } = useApp()
  const { getSession, patchSession } = useAgents()
  const isWatch = agent?.id === 'agent-watch'
  const isMonetize = agent?.id === 'agent-monetize'
  const isClaims = agent?.id === 'agent-claims'
  const isDisclosure =
    agent?.id === 'agent-disclosure' || handoffKey === 'disclosure_pack'
  const isOa = agent?.id === 'agent-oa' || handoffKey === 'prosecution_response'
  const isAnnuity =
    agent?.id === 'agent-annuity' || handoffKey === 'maintain_annuity'
  const isIntake = agent?.id === 'agent-intake'
  const isResearch = agent?.id === 'agent-research'
  const isLayout = agent?.id === 'agent-layout'

  const showFile =
    !!caseId &&
    !!onFileResponse &&
    persona !== 'inventor' &&
    persona !== 'committee' &&
    (handoffKey === 'prosecution_response' ||
      handoffKey === 'draft_claims' ||
      handoffKey === 'maintain_annuity') &&
    (handoffStatus === 'authorized_to_file' ||
      (handoffKey === 'maintain_annuity' && handoffStatus === 'approved'))

  const submitFile = () => {
    const no = receiptNo.trim()
    const at = filedAt.trim()
    if (!no || !at) {
      setFileErr('递交归档须确认回执号与递交日（可改演示预填值）')
      return
    }
    // 递交硬闸 · 与 Session/Draft authorize 同源 evaluateGuardrails【唯一入口】
    if (caseId) {
      const sessNow = sessionId ? getSession(sessionId) : undefined
      const caseNow = getCase(caseId)
      const gr = evaluateGuardrails({
        agent,
        case: caseNow ?? null,
        session: {
          oaStatementConfirmed: !!(
            caseNow?.oaStatementConfirmed || sessNow?.oaStatementConfirmed
          ),
          oaIssueType: sessNow?.oaIssueType,
          oaStrategyNotes: sessNow?.oaStrategyNotes,
        },
        action: 'file',
        persona,
        role: role === 'agency' ? 'agency' : 'enterprise',
        isEnterprise,
        handoffKey,
        disclosureStatus: getHandoff(caseId, 'disclosure_pack'),
        filingCheck: getDraftFilingCheck(caseId),
        fullCheckLite: getFullCheckLite(caseId),
      })
      const msg = firstGuardrailMessage(gr)
      if (msg) {
        setFileErr(msg)
        return
      }
      appendCaseDriveItem(caseId, {
        kind: 'other',
        title: '递交归档确认',
        summary: `回执 ${no} · ${at}`,
        source: 'confirm-bar-file',
      })
    }
    setFileErr(null)
    onFileResponse?.(no, at)
  }
  const watchStrategyPending =
    isWatch &&
    gates.includes('approve_strategy') &&
    !clearedGates.includes('approve_strategy') &&
    !gateDisabledReason('approve_strategy')
  const claimsAuthorizePending =
    isClaims &&
    !!caseId &&
    ((gates.includes('authorize_file') &&
      !clearedGates.includes('authorize_file')) ||
      handoffKey === 'draft_claims')
  const filingCheck = caseId ? getDraftFilingCheck(caseId) : null
  const filingComplete = filingCheck
    ? Object.values(filingCheck).every(Boolean)
    : false
  const filingCount = filingCheck
    ? Object.values(filingCheck).filter(Boolean).length
    : 0
  const disclosureCheck = caseId ? getDisclosurePackCheck(caseId) : null
  const disclosureOk = disclosureCheck
    ? disclosurePackComplete(disclosureCheck)
    : false
  const disclosureMissing = disclosureCheck
    ? disclosurePackMissing(disclosureCheck)
    : []
  const disclosureMissingLabels = DISCLOSURE_PACK_CHECK_ITEMS.filter((i) =>
    disclosureMissing.includes(i.id),
  ).map((i) => i.label)
  const disclosureHandoff = caseId
    ? getHandoff(caseId, 'disclosure_pack')
    : undefined
  const disclosureApproved =
    disclosureHandoff === 'approved' ||
    disclosureHandoff === 'authorized_to_file' ||
    disclosureHandoff === 'filed'
  const oaSess = sessionId ? getSession(sessionId) : undefined
  // 案级为源：工作台勾选 → Agent 已见确认；Agent 确认经 patchSession 镜像回案
  const oaConfirmed = !!(
    (caseId ? getCase(caseId)?.oaStatementConfirmed : false) ||
    oaSess?.oaStatementConfirmed
  )
  const legalReview = caseId ? getCase(caseId)?.legalReview ?? 'pending' : 'pending'
  const legalChip =
    legalReview === 'reviewed'
      ? '法务已阅'
      : legalReview === 'changes_requested'
        ? '法务退回'
        : '法务待审'

  const fullScope = fullCheckScopeFor(agent?.id, handoffKey)
  const lite = caseId ? getFullCheckLite(caseId) : null
  const fullResult =
    fullScope && lite
      ? evaluateFullCheck({
          scope: fullScope,
          disclosureStatus: disclosureHandoff,
          filingCheck: filingCheck ?? undefined,
          lite,
          oaStatementConfirmed: oaConfirmed,
          oaIssueType: oaSess?.oaIssueType,
          oaStrategyNotes: oaSess?.oaStrategyNotes,
        })
      : null
  const authorizeOrFilePending =
    !!fullScope &&
    ((gates.includes('authorize_file') &&
      !clearedGates.includes('authorize_file')) ||
      showFile)

  const fireWatch = (d: WatchDisposition) => {
    onGate('approve_strategy', {
      stepwise,
      note: WATCH_DISPOSITION_NOTE[d],
    })
  }

  const gateChipLabel = (g: HitlGateId) =>
    isWatch && g === 'approve_strategy' ? '告警处置' : HITL_GATE_LABELS[g]

  const confirmLabel = watchStrategyPending
    ? '告警处置'
    : firstActionable
      ? HITL_GATE_LABELS[firstActionable]
      : showFile
        ? '递交归档'
        : gates.find((g) => !clearedGates.includes(g))
          ? HITL_GATE_LABELS[
              gates.find((g) => !clearedGates.includes(g)) as HitlGateId
            ]
          : '继续'

  const oaMetaMissing =
    isOa && (!oaSess?.oaIssueType || !oaSess?.oaStrategyNotes?.trim())
  const needsFilingData = !!(claimsAuthorizePending && filingCheck && !filingComplete)
  const needsDisclosureData = !!(
    isDisclosure &&
    disclosureCheck &&
    caseId &&
    !disclosureOk
  )
  const needsOaData = !!(isOa && oaSess && (oaMetaMissing || !oaConfirmed))
  const needsFullCheck = !!(
    authorizeOrFilePending &&
    lite &&
    caseId &&
    fullScope &&
    fullResult &&
    !fullResult.ok
  )
  // Sheet available for optional extra UI only — never auto-open except receipt-as-current-action
  const annuityNoInvoice =
    isAnnuity &&
    gates.includes('pay_unlock') &&
    !clearedGates.includes('pay_unlock') &&
    invoicePayable === false
  const needsDataSheet =
    needsFilingData ||
    needsDisclosureData ||
    needsOaData ||
    needsFullCheck ||
    showFile ||
    !!(isMonetize && caseId) ||
    !!(isClaims && caseId && !disclosureApproved)

  // Receipt is the current action — never auto-open for approve_strategy / OA / full-check / lists
  const autoOpenSheet = !!(showFile && !firstActionable)

  const sheetHints: string[] = []
  if (claimsAuthorizePending && filingCheck)
    sheetHints.push(`递交清单 ${filingCount}/5`)
  if (isDisclosure && disclosureCheck)
    sheetHints.push(
      `交底包 ${Object.values(disclosureCheck).filter(Boolean).length}/${DISCLOSURE_PACK_CHECK_ITEMS.length}`,
    )
  if (isOa) sheetHints.push(oaConfirmed ? '陈述已确认' : '陈述/争点')
  if (authorizeOrFilePending && fullResult)
    sheetHints.push(fullResult.ok ? 'Full-check 过' : 'Full-check')
  if (isMonetize && caseId) sheetHints.push(legalChip)
  if (showFile) sheetHints.push('回执')

  const rejectLabel = isWatch && role === 'agency' ? '提意见' : '退回'

  const [reasonsOpen, setReasonsOpen] = useState(false)

  const confirmBlockers = useMemo(() => {
    const reasons: string[] = []
    const push = (s: string | null | undefined) => {
      const t = s?.trim()
      if (!t || reasons.includes(t)) return
      reasons.push(t)
    }

    const orderedGates = [
      ...(legalNextGate ? [legalNextGate] : []),
      ...gates.filter((g) => g !== legalNextGate),
    ]
    for (const g of orderedGates) {
      if (clearedGates.includes(g)) continue
      if (isIntake && g !== legalNextGate) continue
      if ((isResearch || isLayout) && g !== legalNextGate) continue
      const reason = gateDisabledReason(g)
      const oaMetaBlock = g === 'approve_strategy' && isOa && oaMetaMissing
      const fullBlock = g === 'authorize_file' && fullResult && !fullResult.ok
      const disableReason =
        reason ??
        (oaMetaBlock
          ? '请先选争点类型并填策略要点'
          : fullBlock
            ? `Full-check 未过：${fullResult!.missing[0] ?? '缺项'}`
            : null)
      push(disableReason)
    }

    if (showFile && !firstActionable) {
      if (fullResult && !fullResult.ok) {
        push(`Full-check 未过：${fullResult.missing[0] ?? '缺项'}`)
      } else if (isClaims && !filingComplete) {
        push(`递交清单未齐套（${filingCount}/5）`)
      } else if (block.blocked && role === 'agency') {
        push(block.reason ?? '暂不能递交')
      }
    }

    if (needsOaData) push('还差争点类型 / 陈述确认 · 点补充项')
    if (needsFilingData) push(`还差递交清单 ${filingCount}/5 · 点补充项`)
    if (needsDisclosureData) push('还差交底包 · 点补充项')
    if (needsFullCheck) push('Full-check 还差 · 点补充项')
    if (annuityNoInvoice) push('无待付发票 · 请先去费用中心')
    if (block.blocked && role === 'agency') {
      push(block.reason ? `无法递交：${block.reason}` : '无法递交')
    }

    return reasons
  }, [
    legalNextGate,
    gates,
    clearedGates,
    isIntake,
    isResearch,
    isLayout,
    gateDisabledReason,
    isOa,
    oaMetaMissing,
    fullResult,
    showFile,
    firstActionable,
    isClaims,
    filingComplete,
    filingCount,
    block.blocked,
    block.reason,
    role,
    needsOaData,
    needsFilingData,
    needsDisclosureData,
    needsFullCheck,
    annuityNoInvoice,
  ])

  const primaryBlocker = confirmBlockers[0] ?? null
  const moreBlockers = confirmBlockers.slice(1)

  useEffect(() => {
    onPrimaryBlockerChange?.(primaryBlocker)
  }, [primaryBlocker, onPrimaryBlockerChange])

  return (
    <div
      id="session-confirm-bar"
      data-confirm-bar
      data-focus-hitl={focusHitl ? '1' : undefined}
      data-focus-gate={focusGate ?? undefined}
      className={`confirm-hitl shrink-0 border-l-4 border-l-amber-500 px-4 py-3.5 sm:px-5 sm:py-4${
        focusHitl ? ' confirm-hitl-focus' : ''
      }`}
    >
      {/* Chat-native HITL bubble row */}
      <div className="confirm-hitl-inner">
        <p className="min-w-0 flex-1 text-[13px] leading-relaxed text-slate-800 sm:text-sm">
          <span className="text-amber-800/90">需要你确认：</span>
          <span className="font-semibold text-slate-900">{confirmLabel}</span>
          {agent && (
            <span className="font-normal text-slate-400"> · {agent.name}</span>
          )}
          {handoffStatus && (
            <span className="ml-1.5 inline-block align-middle">
              <HandoffChip status={handoffStatus} />
            </span>
          )}
          {gates.length > 1 && (
            <span className="ml-2 inline-flex flex-wrap items-center gap-1 align-middle">
              {gates.map((g) => {
                const done = clearedGates.includes(g)
                const focused = !done && focusGate === g
                return (
                  <span
                    key={g}
                    className={`inline-flex items-center gap-0.5 text-[10px] ${
                      done
                        ? 'text-emerald-600'
                        : focused
                          ? 'rounded bg-amber-200/80 px-1 font-semibold text-amber-950 ring-1 ring-amber-400'
                          : 'text-slate-400'
                    }`}
                    title={gateChipLabel(g)}
                  >
                    {done ? (
                      <CircleCheck className="h-2.5 w-2.5" aria-hidden />
                    ) : (
                      <Circle className="h-2.5 w-2.5" aria-hidden />
                    )}
                    {gateChipLabel(g)}
                  </span>
                )
              })}
            </span>
          )}
        </p>

        <div className="confirm-hitl-actions">
          {watchStrategyPending ? (
            <>
              <button
                type="button"
                onClick={() => fireWatch('confirm')}
                className={`ui-btn ui-btn-sm btn-press focus-ring ${
                  role !== 'enterprise' ? 'ui-btn-success' : 'ui-btn-ghost'
                }`}
              >
                确认告警
              </button>
              {isEnterprise && (
                <button
                  type="button"
                  onClick={() => fireWatch('escalate')}
                  className="ui-btn ui-btn-sm ui-btn-success btn-press focus-ring"
                >
                  升级维权
                </button>
              )}
              <button
                type="button"
                onClick={() => fireWatch('close')}
                className="ui-btn ui-btn-sm ui-btn-ghost btn-press focus-ring"
              >
                关闭
              </button>
            </>
          ) : (
            gates.map((g) => {
              const reason = gateDisabledReason(g)
              const isAuth = g === 'authorize_file'
              const oaMetaBlock =
                g === 'approve_strategy' && isOa && oaMetaMissing
              const fullBlock =
                g === 'authorize_file' && fullResult && !fullResult.ok
              const disabled = !!reason || !!fullBlock || !!oaMetaBlock
              const disableReason =
                reason ??
                (oaMetaBlock
                  ? '请先选争点类型并填策略要点'
                  : fullBlock
                    ? `Full-check 未过：${fullResult!.missing[0] ?? '缺项'}`
                    : null)
              const isLegalNext = g === legalNextGate
              const isPrimary = isLegalNext
              if (clearedGates.includes(g)) return null
              // intake: current legal next only; other gates stay as chips/dots
              if (isIntake && g !== legalNextGate) return null
              // research / layout: 批准策略 only (single gate already)
              if ((isResearch || isLayout) && g !== legalNextGate) return null
              const reasonId =
                disabled && primaryBlocker
                  ? 'agent-confirm-reason-primary'
                  : undefined
              return (
                <span key={g} className="agent-confirm-cta-wrap">
                  <button
                    type="button"
                    onClick={() => onGate(g, { stepwise })}
                    disabled={disabled}
                    title={disableReason ?? HITL_GATE_LABELS[g]}
                    aria-label={HITL_GATE_LABELS[g]}
                    aria-describedby={reasonId}
                    className={`ui-btn ui-btn-sm btn-press focus-ring ${
                      isLegalNext ? 'agent-confirm-cta' : ''
                    } ${
                      isPrimary
                        ? isAuth
                          ? 'ui-btn-primary'
                          : 'ui-btn-success'
                        : 'ui-btn-ghost'
                    }`}
                  >
                    {isPrimary && !disabled && (
                      <Check className="h-3 w-3" aria-hidden />
                    )}
                    {HITL_GATE_LABELS[g]}
                  </button>
                </span>
              )
            })
          )}

          {showFile && !firstActionable && (
            <span className="agent-confirm-cta-wrap">
              <button
                type="button"
                onClick={submitFile}
                disabled={
                  (!!block.blocked && role === 'agency') ||
                  (isClaims && !filingComplete) ||
                  (!!fullResult && !fullResult.ok)
                }
                title={
                  fullResult && !fullResult.ok
                    ? `Full-check 未过：${fullResult.missing[0] ?? '缺项'}`
                    : isClaims && !filingComplete
                      ? `递交清单未齐套（${filingCount}/5）`
                      : block.blocked && role === 'agency'
                        ? block.reason
                        : undefined
                }
                aria-label="递交归档"
                aria-describedby={
                  (fullResult && !fullResult.ok) ||
                  (isClaims && !filingComplete) ||
                  (block.blocked && role === 'agency')
                    ? 'agent-confirm-reason-primary'
                    : undefined
                }
                className="ui-btn ui-btn-sm ui-btn-success btn-press focus-ring agent-confirm-cta"
              >
                <Check className="h-3 w-3" aria-hidden />
                确认递交归档
              </button>
            </span>
          )}

          <button
            type="button"
            onClick={() => onHitl('request_changes', { stepwise })}
            className="ui-btn ui-btn-sm ui-btn-ghost btn-press focus-ring"
          >
            <RotateCcw className="h-3 w-3" aria-hidden />
            {rejectLabel}
          </button>

          {handoffKey === 'draft_claims' && caseId && (
            <AppLink
              to={`/workbench/draft/${caseId}`}
              className="btn-press focus-ring rounded px-1.5 py-1 text-[11px] text-slate-400 hover:text-slate-700"
            >
              撰写台
            </AppLink>
          )}
          {sessionId && (
            <AppLink
              to={opsInboxDeepLink({ sessionId })}
              className="btn-press focus-ring rounded px-1.5 py-1 text-[11px] text-slate-400 hover:text-slate-700"
              title="在运营 Dashboard Inbox 中查看本条待确认"
            >
              在运营 Inbox 中查看
            </AppLink>
          )}
          {isWatch && caseId && (
            <AppLink
              to={`/workbench/watch/${caseId}`}
              className="btn-press focus-ring rounded px-1.5 py-1 text-[11px] text-slate-400 hover:text-slate-700"
            >
              监控台
            </AppLink>
          )}
          {isMonetize && caseId && (
            <AppLink
              to={`/workbench/monetize/${caseId}`}
              className="btn-press focus-ring rounded px-1.5 py-1 text-[11px] text-slate-400 hover:text-slate-700"
            >
              转化台
            </AppLink>
          )}
          {isMonetize && caseId && (
            <span
              className="inline-flex items-center rounded-full bg-slate-100 px-1.5 py-0.5 text-[10px] font-medium text-slate-600 ring-1 ring-slate-200"
              title="法务审阅状态 · 非合同签署 · 点补充项可改"
            >
              {legalChip}
            </span>
          )}

          <label
            className="inline-flex items-center gap-1 text-[10px] text-slate-400"
            title={runMode === 'dry-run' ? '预览默认可关' : '正式默认开'}
          >
            <input
              type="checkbox"
              className="focus-ring h-3 w-3 rounded border-slate-300"
              checked={stepwise}
              onChange={(e) => toggleStepwise(e.target.checked)}
              aria-label="逐步写入"
            />
            逐步
          </label>
        </div>
      </div>

      {/* One-line chain preview */}
      {chainPreview.length > 0 && (
        <p className="mt-2 truncate text-[11px] leading-snug text-amber-900/70" role="status">
          {stepwise
            ? `下一步写入：${chainPreview[0]}${chainPreview.length > 1 ? ` · 其后 ${chainPreview.slice(1).join(' → ')}` : ''}`
            : `将连续写入：${chainPreview.join(' → ')}`}
          {stepwise ? ' · 逐步' : ''}
        </p>
      )}

      {primaryBlocker ? (
        <div className="agent-confirm-blockers mt-1.5" role="status">
          <p
            id="agent-confirm-reason-primary"
            className="agent-confirm-reason"
            data-tone="block"
          >
            {primaryBlocker}
          </p>
          {moreBlockers.length > 0 ? (
            <div className="mt-1">
              <button
                type="button"
                className="agent-confirm-more btn-press focus-ring"
                aria-expanded={reasonsOpen}
                onClick={() => setReasonsOpen((v) => !v)}
              >
                {reasonsOpen ? '收起' : `还有 ${moreBlockers.length} 条`}
              </button>
              {reasonsOpen ? (
                <ul className="agent-confirm-more-list">
                  {moreBlockers.map((r) => (
                    <li key={r} className="agent-confirm-reason" data-tone="block">
                      {r}
                    </li>
                  ))}
                </ul>
              ) : null}
            </div>
          ) : null}
          {annuityNoInvoice && caseId ? (
            <p className="mt-1 text-[11px] text-slate-500">
              <AppLink to="/billing/cases" className="underline hover:text-slate-700">
                打开费用中心
              </AppLink>
            </p>
          ) : null}
        </div>
      ) : null}

      {fileErr && !needsDataSheet && (
        <p className="mt-1 text-[11px] text-rose-700">{fileErr}</p>
      )}

      {!needsDataSheet && agent?.guardrails && agent.guardrails.length > 0 && (
        <p
          className="mt-1 truncate text-[11px] text-slate-400"
          title={agent.guardrails.join(' · ')}
        >
          护栏 · {agent.guardrails.join(' · ')}
        </p>
      )}

      {/* Collapsed data sheet — checklists / OA / receipt / prefs */}
      {needsDataSheet && (
        <details
          className="confirm-hitl-sheet mt-2.5 rounded-[var(--radius-md)] border border-slate-200/90 bg-white/90 shadow-[var(--shadow-rest)]"
          open={autoOpenSheet || undefined}
        >
          <summary className="flex cursor-pointer list-none items-center gap-1.5 px-2.5 py-1.5 text-[11px] text-slate-500 hover:text-slate-700 [&::-webkit-details-marker]:hidden">
            <ChevronDown className="h-3 w-3 shrink-0 opacity-60 open:rotate-180" aria-hidden />
            <span>
              {autoOpenSheet ? '需补齐后确认' : '补充项'}
              {sheetHints.length > 0 ? ` · ${sheetHints.join(' · ')}` : ''}
            </span>
          </summary>

          <div className="space-y-2 border-t border-slate-100 px-2.5 py-2">
            {agent?.guardrails && agent.guardrails.length > 0 && (
              <p
                className="truncate text-[11px] text-slate-400"
                title={agent.guardrails.join(' · ')}
              >
                护栏 · {agent.guardrails.join(' · ')}
              </p>
            )}

            {/* watch: 3 inline bubble CTAs only — no sheet prose */}

            {isMonetize && caseId && (
              <div className="flex flex-wrap items-center gap-2 text-[11px] text-slate-500">
                <span className="text-slate-400">法务审阅 · 非合同签署</span>
                <span className="inline-flex rounded-full bg-slate-100 px-2 py-0.5 text-[10px] font-medium text-slate-700 ring-1 ring-slate-200">
                  {legalChip}
                </span>
                {isEnterprise && (
                  <>
                    <button
                      type="button"
                      onClick={() => setLegalReview(caseId, 'reviewed')}
                      className="btn-press focus-ring rounded px-1.5 py-0.5 text-[11px] text-slate-600 hover:bg-slate-100"
                      title="法务审阅状态 · 非合同签署"
                    >
                      标记已阅
                    </button>
                    <button
                      type="button"
                      onClick={() => setLegalReview(caseId, 'changes_requested')}
                      className="btn-press focus-ring rounded px-1.5 py-0.5 text-[11px] text-slate-500 hover:bg-slate-100"
                      title="法务审阅状态 · 非合同签署"
                    >
                      标记退回
                    </button>
                  </>
                )}
              </div>
            )}

            {claimsAuthorizePending && filingCheck && (
              <div>
                <div className="mb-1 flex flex-wrap items-center gap-2 text-[11px] font-medium text-slate-600">
                  递交检查清单
                  <span className="tabular-nums font-normal text-slate-400">
                    {filingCount}/5
                  </span>
                  <span className="font-normal text-slate-400">
                    ·{' '}
                    {REQUIRED_BEFORE_SUBMIT.draft_claims.find(
                      (x) => x.id === 'filing',
                    )?.label ?? '齐套'}
                  </span>
                </div>
                <ul className="grid gap-0.5 sm:grid-cols-2">
                  {DRAFT_FILING_CHECK_ITEMS.map((item) => (
                    <li key={item.id}>
                      <label className="flex cursor-pointer items-start gap-1.5 text-[11px] text-slate-700">
                        <input
                          type="checkbox"
                          className="mt-0.5 h-3.5 w-3.5 rounded border-slate-300"
                          checked={!!filingCheck[item.id]}
                          onChange={() =>
                            toggleDraftFilingCheck(caseId!, item.id)
                          }
                        />
                        <span>{item.label}</span>
                      </label>
                    </li>
                  ))}
                </ul>
                {!filingComplete && (
                  <p className="mt-1 text-[11px] text-rose-600">
                    未全勾：禁用授权递交 · 请勾选齐套或回撰写台
                  </p>
                )}
              </div>
            )}

            {isDisclosure && disclosureCheck && caseId && (
              <div>
                <div className="mb-1 flex flex-wrap items-center gap-2 text-[11px] font-medium text-slate-600">
                  交底包齐套
                  <span className="tabular-nums font-normal text-slate-400">
                    {Object.values(disclosureCheck).filter(Boolean).length}/
                    {DISCLOSURE_PACK_CHECK_ITEMS.length}
                  </span>
                </div>
                <ul className="grid gap-0.5 sm:grid-cols-2">
                  {DISCLOSURE_PACK_CHECK_ITEMS.map((item) => (
                    <li key={item.id}>
                      <label className="flex cursor-pointer items-start gap-1.5 text-[11px] text-slate-700">
                        <input
                          type="checkbox"
                          className="mt-0.5 h-3.5 w-3.5 rounded border-slate-300"
                          checked={!!disclosureCheck[item.id]}
                          onChange={() =>
                            toggleDisclosurePackCheck(caseId, item.id)
                          }
                        />
                        <span>{item.label}</span>
                      </label>
                    </li>
                  ))}
                </ul>
                {!disclosureOk && (
                  <p className="mt-1 text-[11px] text-rose-600">
                    未齐：禁用批准策略 · 缺{' '}
                    {disclosureMissingLabels.slice(0, 3).join('、')}
                    {disclosureMissingLabels.length > 3 ? '…' : ''}
                  </p>
                )}
              </div>
            )}

            {isClaims && caseId && !disclosureApproved && (
              <p className="rounded border border-rose-200 bg-rose-50/80 px-2 py-1 text-[11px] text-rose-800">
                交底包未批准/授权 · 当前：
                {disclosureHandoff
                  ? HANDOFF_LABELS[disclosureHandoff]
                  : '无 disclosure_pack'}
                <AppLink
                  to={caseId ? `/inventor?case=${caseId}` : '/inventor'}
                  className="ml-1 underline"
                >
                  去门户
                </AppLink>
                <AppLink
                  to={`/agent/agents?agent=agent-disclosure&case=${caseId}`}
                  className="ml-1 underline"
                >
                  交底 Agent
                </AppLink>
              </p>
            )}

            {isOa && (
              <div className="flex flex-wrap items-center gap-2 text-[11px] text-slate-600">
                <span
                  className={`rounded-full px-2 py-0.5 font-medium ring-1 ${
                    oaConfirmed
                      ? 'bg-emerald-50 text-emerald-800 ring-emerald-200'
                      : 'bg-amber-50 text-amber-900 ring-amber-200'
                  }`}
                >
                  {oaConfirmed ? '已确认陈述' : '答复草稿'}
                </span>
                {!oaConfirmed && (
                  <button
                    type="button"
                    className="btn-press focus-ring rounded border border-slate-300 bg-white px-2 py-0.5 text-[11px] font-medium text-slate-800"
                    onClick={() => {
                      if (oaSess) {
                        patchSession(oaSess.id, { oaStatementConfirmed: true })
                        if (caseId) {
                          appendCaseDriveItem(caseId, {
                            kind: 'oa_confirm',
                            title: '已确认陈述',
                            summary: oaSess.oaIssueType
                              ? `争点 ${OA_ISSUE_TYPE_LABELS[oaSess.oaIssueType]}`
                              : 'OA 陈述确认',
                            source: 'confirm-bar-oa',
                          })
                        }
                      }
                    }}
                    disabled={!oaSess}
                  >
                    确认陈述
                  </button>
                )}
                {!oaConfirmed && (
                  <span className="text-amber-800/90">
                    未确认前授权/递交请先确认陈述
                  </span>
                )}
              </div>
            )}

            {isOa && oaSess && (
              <div>
                <div className="mb-1 text-[11px] font-medium text-slate-600">
                  OA 争点类型 + 策略要点
                  <span className="ml-1 font-normal text-slate-400">
                    · 须填写后再 HITL 批准
                  </span>
                </div>
                <div className="mb-1.5 flex flex-wrap gap-1">
                  {OA_ISSUE_TYPES.map((t) => (
                    <button
                      key={t}
                      type="button"
                      className={`rounded-full px-2 py-0.5 text-[11px] ring-1 ${
                        oaSess.oaIssueType === t
                          ? 'bg-slate-900 text-white ring-slate-900'
                          : 'bg-white text-slate-700 ring-slate-200'
                      }`}
                      onClick={() =>
                        patchSession(oaSess.id, {
                          oaIssueType: t as OaIssueType,
                        })
                      }
                    >
                      {OA_ISSUE_TYPE_LABELS[t]}
                    </button>
                  ))}
                </div>
                <textarea
                  className="focus-ring w-full rounded-md border border-slate-200 bg-white px-2 py-1.5 text-[11px] text-slate-800"
                  rows={2}
                  placeholder="策略要点：缩限 / 争辩 / 补实验…"
                  value={oaSess.oaStrategyNotes ?? ''}
                  onChange={(e) =>
                    patchSession(oaSess.id, {
                      oaStrategyNotes: e.target.value,
                    })
                  }
                />
                {oaMetaMissing && (
                  <p className="mt-1 text-[11px] text-rose-600">
                    未选类型或未填要点：禁用批准策略
                  </p>
                )}
              </div>
            )}


            {authorizeOrFilePending && lite && caseId && fullScope && (
              <div>
                <div className="mb-1 flex flex-wrap items-center gap-2 text-[11px] font-medium text-slate-600">
                  递交前 Full-check
                  <span className="font-normal text-slate-400">
                    · {fullScope === 'oa' ? 'OA' : 'Claims/Draft'} · 案级共享勾选 ·
                    演示
                  </span>
                </div>
                <ul className="grid gap-0.5 sm:grid-cols-2">
                  {FULL_CHECK_LITE_ITEMS.map((item) => (
                    <li key={item.id}>
                      <label className="flex cursor-pointer items-start gap-1.5 text-[11px] text-slate-700">
                        <input
                          type="checkbox"
                          className="mt-0.5 h-3.5 w-3.5 rounded border-slate-300"
                          checked={!!lite[item.id]}
                          onChange={() => toggleFullCheckLite(caseId, item.id)}
                        />
                        <span>{item.label}</span>
                      </label>
                    </li>
                  ))}
                </ul>
                {fullResult && !fullResult.ok && (
                  <p className="mt-1 text-[11px] text-rose-600">
                    未过：{fullResult.missing.slice(0, 4).join('；')}
                    {fullResult.missing.length > 4 ? '…' : ''}
                  </p>
                )}
              </div>
            )}

            {showFile && (
              <div className="flex flex-wrap items-end gap-2">
                <label className="block min-w-[140px] flex-1 text-[11px]">
                  <span className="mb-0.5 block font-medium text-slate-500">
                    回执号 <span className="text-rose-500">*</span>
                  </span>
                  <input
                    className="focus-ring w-full rounded border border-slate-200 bg-white px-2 py-1 text-xs text-slate-800"
                    name="receiptNo"
                    autoComplete="off"
                    spellCheck={false}
                    placeholder="CN2026…"
                    value={receiptNo}
                    onChange={(e) => setReceiptNo(e.target.value)}
                  />
                </label>
                <label className="block w-[140px] text-[11px]">
                  <span className="mb-0.5 block font-medium text-slate-500">
                    递交日 <span className="text-rose-500">*</span>
                  </span>
                  <input
                    type="date"
                    className="focus-ring w-full rounded border border-slate-200 bg-white px-2 py-1 text-xs text-slate-800"
                    value={filedAt}
                    onChange={(e) => setFiledAt(e.target.value)}
                  />
                </label>
                {firstActionable && (
                  <button
                    type="button"
                    onClick={submitFile}
                    disabled={
                      (!!block.blocked && role === 'agency') ||
                      (isClaims && !filingComplete) ||
                      (!!fullResult && !fullResult.ok)
                    }
                    title={
                      fullResult && !fullResult.ok
                        ? `Full-check 未过：${fullResult.missing[0] ?? '缺项'}`
                        : isClaims && !filingComplete
                          ? `递交清单未齐套（${filingCount}/5）`
                          : block.blocked && role === 'agency'
                            ? block.reason
                            : undefined
                    }
                    aria-label="递交归档"
                    className="btn-press focus-ring inline-flex items-center gap-1 rounded border border-slate-300 bg-white px-2.5 py-1 text-xs font-medium text-slate-800 disabled:opacity-50"
                  >
                    确认递交归档
                  </button>
                )}
                <span className="w-full text-[10px] text-slate-400">
                  预填演示值 · 确认后写入 Docket
                </span>
                {fileErr && (
                  <p className="w-full text-[11px] text-rose-700">{fileErr}</p>
                )}
              </div>
            )}
          </div>
        </details>
      )}

    </div>
  )
}
