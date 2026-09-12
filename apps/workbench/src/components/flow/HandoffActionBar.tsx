import { useState, type ReactNode } from 'react'
import type { HandoffArtifactKey, HandoffAction } from '@ip/domain/types'
import { useApp } from '@shared/context/AppContext'
import { HandoffChip } from '@shared/components/HandoffChip'
import {
  canPerformHandoff,
  actionLabel,
  REQUIRED_BEFORE_SUBMIT,
  commandForHandoffAction,
  type DomainCommand,
} from '@ip/domain'
import { FulfillmentModeBadge } from '@shared/components/FulfillmentModeBadge'
import {
  inputCls,
  textareaCls,
  btnPrimary,
  btnGhost,
  btnSuccess,
} from './styles'
import { BILLING_HOLD_COPY } from '@shared/utils/billingHoldBanner'
import { AppLink } from '@shared/components/AppLink'

export function HandoffActionBar({
  caseId,
  handoffKey,
  onResult,
  showFile,
  extra,
  validateBefore,
  checkedRequired,
  omitRequiredIds,
  blockPrimary,
  blockAuthorize,
  inlineError,
}: {
  caseId: string
  handoffKey: HandoffArtifactKey
  onResult: (msg: string, err?: boolean) => void
  showFile?: boolean
  extra?: ReactNode
  validateBefore?: (action: HandoffAction) => string | null
  /** ids from REQUIRED_BEFORE_SUBMIT that are satisfied */
  checkedRequired?: string[]
  /** 路径豁免：从 REQUIRED 清单中剔除（如诉讼不要求商务 terms/party） */
  omitRequiredIds?: string[]
  /** Force-disable submit / approve / authorize / file */
  blockPrimary?: boolean
  /** Force-disable authorize / file only（如 OA 陈述未确认，仍允许提交） */
  blockAuthorize?: boolean
  /** Persistent inline error under actions */
  inlineError?: string | null
}) {
  const {
    role,
    persona,
    getHandoff,
    dispatchCommand,
    getCurrentVersionLabel,
    getCase,
    hasBlockingInvoiceForCase,
    overdueStopEnabled,
    committeeVoteHardBlockGo,
    hasAuditedCommitteeVote,
  } = useApp()
  const caseData = getCase(caseId)
  const mode = caseData?.fulfillmentMode ?? 'delegated'
  const status = getHandoff(caseId, handoffKey)
  const auditedCommitteeVote = hasAuditedCommitteeVote(caseId)
  const handoffOpts = {
    handoffKey,
    legalReview: caseData?.legalReview,
    persona,
    committeeVoteHardBlockGo,
    hasAuditedCommitteeVote: auditedCommitteeVote,
  }
  const verLabel = getCurrentVersionLabel(caseId, handoffKey)
  const selfServe = mode === 'self_serve'
  const [receiptNo, setReceiptNo] = useState('')
  const [filedAt, setFiledAt] = useState(() => new Date().toISOString().slice(0, 10))
  const [rejectOpen, setRejectOpen] = useState(false)
  const [rejectNote, setRejectNote] = useState('')
  const reqItems = (REQUIRED_BEFORE_SUBMIT[handoffKey] ?? []).filter(
    (r) => !omitRequiredIds?.includes(r.id),
  )
  const invoiceBlock = hasBlockingInvoiceForCase(caseId)
  const agencyInvoiceBlocked =
    role === 'agency' && overdueStopEnabled && invoiceBlock.blocked

  const missingRequired = () => {
    if (!checkedRequired) return []
    return reqItems.filter((r) => !checkedRequired.includes(r.id)).map((r) => r.label)
  }

  const run = async (action: HandoffAction, note?: string, annotation?: string) => {
    const check = canPerformHandoff(status, action, role, mode, handoffOpts)
    if (!check.ok) {
      onResult(check.reason ?? '无法执行', true)
      return
    }
    if (blockPrimary && (action === 'submit' || action === 'approve' || action === 'authorize' || action === 'file')) {
      onResult(inlineError ?? '请先完成校验与清单后再操作', true)
      return
    }
    if (blockAuthorize && (action === 'authorize' || action === 'file')) {
      onResult(inlineError ?? '授权/递交前条件未满足', true)
      return
    }
    if (
      action === 'submit' ||
      action === 'approve' ||
      action === 'authorize' ||
      action === 'file'
    ) {
      const miss = missingRequired()
      if (miss.length > 0) {
        const verb =
          action === 'submit'
            ? '提交'
            : action === 'approve'
              ? '批准'
              : action === 'authorize'
                ? '授权'
                : '递交'
        onResult(`${verb}前缺少必填项：${miss.join('、')}`, true)
        return
      }
    }
    if (validateBefore) {
      const v = validateBefore(action)
      if (v) {
        onResult(v, true)
        return
      }
    }
    const ann = annotation?.trim() || undefined
    const cmdName = commandForHandoffAction(action, handoffKey)
    let cmd: DomainCommand
    if (action === 'file') {
      cmd = {
        type: 'fileResponse',
        caseId,
        handoffKey,
        receiptNo: receiptNo.trim(),
        filedAt: filedAt.trim(),
        note,
      }
    } else if (action === 'submit' && handoffKey === 'research_report') {
      cmd = { type: 'submitResearch', caseId, note }
    } else if (action === 'submit' && handoffKey === 'draft_claims') {
      cmd = { type: 'submitClaims', caseId, note }
    } else if (action === 'submit' && handoffKey === 'prosecution_response') {
      cmd = { type: 'analyzeAndSubmitOA', caseId, note }
    } else if (action === 'approve' && handoffKey === 'intake_quote') {
      cmd = { type: 'confirmQuote', caseId, note }
    } else if (action === 'approve') {
      cmd = { type: 'approveHandoff', caseId, handoffKey, note }
    } else if (action === 'request_changes') {
      cmd = { type: 'requestChanges', caseId, handoffKey, note, annotation: ann }
    } else if (action === 'authorize') {
      cmd = { type: 'authorizeFile', caseId, handoffKey, note }
    } else if (action === 'save_draft') {
      cmd = { type: 'saveDraft', caseId, handoffKey, note }
    } else if (action === 'start_review') {
      cmd = { type: 'startReview', caseId, handoffKey, note }
    } else {
      cmd = { type: 'submitHandoff', caseId, handoffKey, note }
    }
    void cmdName
    const res = await dispatchCommand(cmd, { actor: 'user' })
    onResult(res.message, !res.ok)
  }

  const tip = (action: HandoffAction) => {
    const c = canPerformHandoff(status, action, role, mode, handoffOpts)
    return c.ok ? undefined : c.reason
  }

  const label = (action: HandoffAction) => actionLabel(action, handoffKey, mode)

  const reqIncomplete = missingRequired().length > 0
  const saveDisabled = !canPerformHandoff(status, 'save_draft', role, mode, handoffOpts).ok
  const submitDisabled =
    !canPerformHandoff(status, 'submit', role, mode, handoffOpts).ok ||
    !!blockPrimary ||
    (!!checkedRequired && reqIncomplete) ||
    agencyInvoiceBlocked
  const entApproveDisabled =
    !canPerformHandoff(status, 'approve', role, mode, handoffOpts).ok ||
    !!blockPrimary ||
    (!!checkedRequired && reqIncomplete)
  const entChangesDisabled = !canPerformHandoff(status, 'request_changes', role, mode, handoffOpts).ok
  const entAuthDisabled =
    !canPerformHandoff(status, 'authorize', role, mode, handoffOpts).ok ||
    !!blockPrimary ||
    !!blockAuthorize ||
    (!!checkedRequired && reqIncomplete)
  const receiptIncomplete = !receiptNo.trim() || !filedAt.trim()
  const fileDisabled =
    !canPerformHandoff(status, 'file', role, mode, handoffOpts).ok ||
    !!blockPrimary ||
    !!blockAuthorize ||
    (!!checkedRequired && reqIncomplete) ||
    agencyInvoiceBlocked ||
    (showFile && receiptIncomplete)

  const personaLocked = persona === 'inventor' || persona === 'committee'
  const showExecutor =
    !personaLocked &&
    ((selfServe && role === 'enterprise') || (!selfServe && role === 'agency'))
  const showReviewer =
    !personaLocked &&
    ((!selfServe && role === 'enterprise') ||
      (selfServe &&
        role === 'enterprise' &&
        ['submitted_to_enterprise', 'enterprise_review', 'approved', 'authorized_to_file'].includes(
          status,
        )))

  const hs = caseData?.handoffs[handoffKey]

  return (
    <div className="space-y-2">
      <div className="flex flex-wrap items-center gap-2">
        <HandoffChip status={status} />
        <span className="rounded-full border border-slate-200 bg-slate-100 px-2 py-0.5 text-xs font-medium text-slate-800">
          {verLabel}
        </span>
        <FulfillmentModeBadge mode={mode} />
        {extra}
      </div>
      {reqItems.length > 0 && (
        <div className="rounded-lg border border-slate-100 bg-slate-50 px-3 py-2">
          <div className="mb-1 text-xs font-medium uppercase tracking-wider text-slate-400">
            提交前必填清单
          </div>
          <ul className="flex flex-wrap gap-1.5">
            {reqItems.map((r) => {
              const ok = checkedRequired?.includes(r.id)
              return (
                <li
                  key={r.id}
                  className={`rounded-full px-2 py-0.5 text-xs ${
                    ok
                      ? 'bg-emerald-50 text-emerald-700 ring-1 ring-emerald-200'
                      : 'bg-white text-slate-500 ring-1 ring-slate-200'
                  }`}
                >
                  {ok ? '✓ ' : '○ '}
                  {r.label}
                </li>
              )
            })}
          </ul>
        </div>
      )}
      {selfServe && role === 'enterprise' && (
        <p className="text-xs text-sky-700">
          自助办理：您可直接起草、提交并归档（企业作为执行方）
        </p>
      )}
      {!selfServe && role === 'enterprise' && !personaLocked && (
        <p className="text-xs text-slate-500">
          企业租户：仅可审核 / 退回 / 授权；代理专属操作请切换代理所工作区或改为自助模式
        </p>
      )}
      {persona === 'inventor' && (
        <p className="rounded-lg border border-violet-200 bg-violet-50 px-3 py-2 text-xs text-violet-900" role="status">
          当前 Persona=发明人：工作台批准/授权/递交已禁用 ·{' '}
          <AppLink to="/inventor" className="font-medium underline">前往交底门户</AppLink>
        </p>
      )}
      {persona === 'committee' && (
        <p className="rounded-lg border border-amber-200 bg-amber-50 px-3 py-2 text-xs text-amber-900" role="status">
          当前 Persona=委员：仅可 Intake 投票；不可 Go / 批准 / 授权 / 递交
        </p>
      )}
      {handoffKey === 'intake_quote' &&
        committeeVoteHardBlockGo &&
        !auditedCommitteeVote && (
          <p
            className="rounded-lg border border-rose-200 bg-rose-50 px-3 py-2 text-xs text-rose-900"
            role="alert"
          >
            委员投票未达硬闸 · 须 Persona=委员投下可审计票后方可确认报价 / 批准
          </p>
        )}
      {showFile && showExecutor && ['authorized_to_file', 'approved'].includes(status) && (
        <div className="grid gap-2 rounded-lg border border-slate-200 bg-slate-50 p-3 sm:grid-cols-2">
          {receiptIncomplete && (
            <p className="sm:col-span-2 text-[11px] text-amber-800">
              递交归档须同时填写回执号与递交日（演示回执 · 非真国知局）
            </p>
          )}
          <label className="block text-xs">
            <span className="mb-1 block font-medium text-slate-600">
              回执号 <span className="text-rose-500">*</span>
            </span>
            <input
              className={inputCls}
              name="receiptNo"
              autoComplete="off"
              spellCheck={false}
              placeholder="国知局电子申请回执 CN2026…"
              value={receiptNo}
              onChange={(e) => setReceiptNo(e.target.value)}
            />
          </label>
          <label className="block text-xs">
            <span className="mb-1 block font-medium text-slate-600">
              递交日 <span className="text-rose-500">*</span>
            </span>
            <input
              type="date"
              className={inputCls}
              value={filedAt}
              onChange={(e) => setFiledAt(e.target.value)}
            />
          </label>
        </div>
      )}
      {status === 'filed' && hs?.receiptNo && (
        <div className="rounded-lg border border-slate-200 bg-slate-100 px-3 py-2 text-xs text-slate-900">
          <span className="font-medium">已归档回执 · </span>
          <span className="font-mono">{hs.receiptNo}</span>
          <span className="ml-2 text-slate-600">递交日 {hs.filedAt}</span>
        </div>
      )}
      {agencyInvoiceBlocked && (
        <div
          className="rounded-lg border border-rose-200 bg-rose-50 px-3 py-2 text-xs text-rose-800"
          role="alert"
        >
          <span className="font-medium">{BILLING_HOLD_COPY.agency.caseHeadline} · </span>
          {invoiceBlock.reason ?? '存在逾期发票，请先结清'}
          （企业侧仅提示、不停审）
          <AppLink
            to={BILLING_HOLD_COPY.billingHref}
            className="ml-2 font-medium text-rose-900 underline"
          >
            {BILLING_HOLD_COPY.billingLabelAgency}
          </AppLink>
        </div>
      )}
      {role === 'enterprise' && invoiceBlock.blocked && overdueStopEnabled && (
        <div
          className="rounded-lg border border-amber-200 bg-amber-50 px-3 py-2 text-xs text-amber-900"
          role="status"
        >
          <span className="font-medium">{BILLING_HOLD_COPY.enterprise.caseHeadline} · </span>
          {BILLING_HOLD_COPY.enterprise.caseBody}
          <AppLink to={BILLING_HOLD_COPY.billingHref} className="ml-2 font-medium underline">
            {BILLING_HOLD_COPY.billingLabelEnterprise}
          </AppLink>
        </div>
      )}
      <div className="flex flex-wrap gap-2">
        {showExecutor && (
          <>
            <div className="flex flex-col gap-0.5">
              <button
                type="button"
                className={btnGhost}
                disabled={saveDisabled}
                title={tip('save_draft')}
                aria-label={label('save_draft')}
                onClick={() => run('save_draft', '保存草稿')}
              >
                {label('save_draft')}
              </button>
              {saveDisabled && tip('save_draft') && (
                <span className="max-w-[11rem] text-xs leading-tight text-rose-600">{tip('save_draft')}</span>
              )}
            </div>
            <div className="flex flex-col gap-0.5">
              <button
                type="button"
                className={btnPrimary}
                disabled={submitDisabled}
                title={
                  agencyInvoiceBlocked
                    ? invoiceBlock.reason
                    : tip('submit')
                }
                aria-label={label('submit')}
                onClick={() => run('submit', selfServe ? '提交内部审核' : '提交企业审核')}
              >
                {label('submit')}
              </button>
              {submitDisabled && (agencyInvoiceBlocked ? invoiceBlock.reason : tip('submit')) && (
                <span className="max-w-[12rem] text-xs leading-tight text-rose-600">
                  {agencyInvoiceBlocked ? invoiceBlock.reason : tip('submit')}
                </span>
              )}
            </div>
            {showFile && (
              <div className="flex flex-col gap-0.5">
                <button
                  type="button"
                  className={btnSuccess}
                  disabled={fileDisabled}
                  title={
                    agencyInvoiceBlocked
                      ? invoiceBlock.reason
                      : showFile && receiptIncomplete
                        ? '请填写回执号与递交日'
                        : tip('file')
                  }
                  aria-label={label('file')}
                  onClick={() => run('file', '已递交归档')}
                >
                  {label('file')}
                </button>
                {fileDisabled &&
                  (agencyInvoiceBlocked
                    ? invoiceBlock.reason
                    : showFile && receiptIncomplete
                      ? '请填写回执号与递交日'
                      : tip('file')) && (
                  <span className="max-w-[12rem] text-xs leading-tight text-rose-600">
                    {agencyInvoiceBlocked
                      ? invoiceBlock.reason
                      : showFile && receiptIncomplete
                        ? '请填写回执号与递交日'
                        : tip('file')}
                  </span>
                )}
              </div>
            )}
          </>
        )}
        {((!selfServe && role === 'enterprise') ||
          (selfServe && role === 'enterprise' && showReviewer)) && (
          <>
            <div className="flex flex-col gap-0.5">
              <button
                type="button"
                className={btnSuccess}
                disabled={entApproveDisabled}
                title={tip('approve')}
                aria-label={label('approve')}
                onClick={() => run('approve', '确认策略/批准')}
              >
                {label('approve')}
              </button>
              {entApproveDisabled && tip('approve') && (
                <span className="max-w-[11rem] text-xs leading-tight text-rose-600">{tip('approve')}</span>
              )}
            </div>
            <div className="flex flex-col gap-0.5">
              <button
                type="button"
                className={btnGhost}
                disabled={entChangesDisabled}
                title={tip('request_changes')}
                aria-label={label('request_changes')}
                aria-expanded={rejectOpen}
                onClick={() => setRejectOpen((v) => !v)}
              >
                {label('request_changes')}
              </button>
              {entChangesDisabled && tip('request_changes') && (
                <span className="max-w-[11rem] text-xs leading-tight text-rose-600">{tip('request_changes')}</span>
              )}
            </div>
            {showFile && (
              <div className="flex flex-col gap-0.5">
                <button
                  type="button"
                  className={btnPrimary}
                  disabled={entAuthDisabled}
                  title={tip('authorize')}
                  aria-label={label('authorize')}
                  onClick={() => run('authorize', label('authorize'))}
                >
                  {label('authorize')}
                </button>
                {entAuthDisabled && tip('authorize') && (
                  <span className="max-w-[11rem] text-xs leading-tight text-rose-600">{tip('authorize')}</span>
                )}
              </div>
            )}
          </>
        )}
        {/* Agency: clarify why enterprise-only actions are absent */}
        {!selfServe && role === 'agency' && (
          <p className="w-full text-xs text-slate-500" role="status">
            代理所身份：批准 / 授权由企业完成；当前仅可起草、提交与（授权后）递交。
          </p>
        )}
      </div>
      {rejectOpen && (
        <div className="nest-card space-y-2 border-amber-200 bg-amber-50/60 p-3" role="region" aria-label="退回批注">
          <label className="block text-xs font-medium text-amber-900" htmlFor="reject-annotation">
            退回批注（可留空）
          </label>
          <textarea
            id="reject-annotation"
            className={textareaCls}
            rows={3}
            value={rejectNote}
            onChange={(e) => setRejectNote(e.target.value)}
            placeholder="请说明需修改的要点…"
          />
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              className={btnGhost}
              onClick={() => {
                setRejectOpen(false)
                setRejectNote('')
              }}
            >
              取消
            </button>
            <button
              type="button"
              className={btnPrimary}
              onClick={() => {
                run('request_changes', '请按意见修改', rejectNote)
                setRejectOpen(false)
                setRejectNote('')
              }}
            >
              确认退回
            </button>
          </div>
        </div>
      )}
      {inlineError && (
        <p className="rounded-[var(--radius-md)] bg-rose-50 px-3 py-2 text-xs text-rose-700 ring-1 ring-rose-100" role="alert">
          {inlineError}
        </p>
      )}
      {(saveDisabled || submitDisabled || entApproveDisabled) && (
        <p className="text-xs text-slate-500">
          {agencyInvoiceBlocked
            ? invoiceBlock.reason
            : blockPrimary
            ? inlineError ?? '请先完成校验与清单后再递交'
            : showExecutor
              ? tip('submit') ?? tip('save_draft')
              : tip('approve') ?? tip('request_changes')}
        </p>
      )}
    </div>
  )
}
