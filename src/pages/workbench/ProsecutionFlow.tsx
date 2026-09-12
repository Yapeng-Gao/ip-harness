import { useEffect, useMemo, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { AppLink } from '../../components/AppLink'
import { AlertTriangle, CheckCircle2, CalendarDays } from 'lucide-react'
import { useApp } from '../../context/AppContext'
import { usePersistedFlowStep } from '../../hooks/usePersistedFlowStep'
import { stepsForFlow } from '../../data/flowSteps'
import { useAgents } from '../../context/AgentContext'
import { prosecutionSeed } from '../../data/workbenchSeeds'
import {
  CasePicker, Field, FlowHeader, HandoffActionBar, SplitDraft, Stepper,
  ToastBanner, DeadlineChip, nextActionsForStage, inputCls, panelCls, textareaCls,
} from '../../components/workbench/FlowChrome'
import { ClaimDiffView } from '../../components/workbench/ClaimDiffView'
import { VersionPanel } from '../../components/workbench/VersionPanel'
import { WbSection, WbField, WbStickyTip } from '../../components/workbench/FormBlocks'
import { daysUntil, urgencyBannerClass, urgencyLabel, urgencyLevel } from '../../utils/deadline'
import {
  evaluateFullCheck,
  FULL_CHECK_LITE_ITEMS,
  type FullCheckInput,
} from '../../utils/fullFilingCheck'
import {
  evaluateGuardrails,
  firstGuardrailMessage,
} from '../../domain/guardrails'
import { getAgent } from '../../data/agents'
import type { OaIssueType } from '../../types'

const STEPS = stepsForFlow('prosecution')
const ISSUE_TYPES = ['新颖性', '创造性', '清楚性', '支持', '实用性', '形式缺陷']
const STRATEGIES = ['争辩', '缩限+论证', '澄清修改', '删除权利要求', '补充实验数据']

export function ProsecutionFlow() {
  const { caseId: paramId } = useParams()
  const navigate = useNavigate()
  const {
    getCase, role, persona, addActivity, addArtifact, markChecklistDone, getHandoff, docketEvents,
    getFullCheckLite, toggleFullCheckLite, setOaStatementConfirmed, appendCaseDriveItem,
  } = useApp()
  const { visibleSessions, patchSession } = useAgents()

  const [caseId, setCaseId] = useState(paramId ?? 'c1')
  const { step, setStep, syncProgressFloor, storedStepIndex } = usePersistedFlowStep(caseId, 'prosecution')
  const [toast, setToast] = useState<string | null>(null)
  const [toastErr, setToastErr] = useState(false)
  const [toastNext, setToastNext] = useState<{ label: string; to: string }[] | undefined>()
  const [docketBanner, setDocketBanner] = useState<{ caseId: string; receiptNo?: string } | null>(null)

  const seed = prosecutionSeed[caseId] ?? prosecutionSeed.c1
  const [oaDate, setOaDate] = useState(seed.oaDate)
  const [deadline, setDeadline] = useState(seed.deadline)
  const [oaType, setOaType] = useState(seed.oaType)
  const [issues, setIssues] = useState(seed.issues.map((i) => ({ ...i })))
  const [activeIssue, setActiveIssue] = useState(seed.issues[0]?.id ?? '')
  const [claimOriginal, setClaimOriginal] = useState(seed.claimOriginal)
  const [claimAmended, setClaimAmended] = useState(seed.claimAmended)
  const [feeReminder, setFeeReminder] = useState(seed.feeReminder)
  const [draft, setDraft] = useState('')
  const c = getCase(caseId)
  const handoff = getHandoff(caseId, 'prosecution_response')
  const oaStatementConfirmed = !!c?.oaStatementConfirmed
  const fullLite = getFullCheckLite(caseId)

  const mapIssueType = (t: string): OaIssueType | undefined => {
    if (t === '新颖性') return 'novelty'
    if (t === '创造性') return 'inventiveness'
    if (t === '清楚性') return 'clarity'
    if (t === '支持') return 'support_disclosure'
    if (t) return 'other'
    return undefined
  }
  const activeIss = issues.find((i) => i.id === activeIssue) ?? issues[0]
  const fullCheckResult = evaluateFullCheck({
    scope: 'oa',
    lite: fullLite,
    oaStatementConfirmed,
    oaIssueType: activeIss ? mapIssueType(activeIss.type) : undefined,
    oaStrategyNotes:
      activeIss && activeIss.strategy.trim() && activeIss.response.trim()
        ? `${activeIss.strategy}：${activeIss.response}`
        : activeIss?.response,
  } satisfies FullCheckInput)

  useEffect(() => {
    const s = prosecutionSeed[caseId] ?? prosecutionSeed.c1
    setOaDate(s.oaDate); setDeadline(s.deadline); setOaType(s.oaType)
    setIssues(s.issues.map((i) => ({ ...i }))); setActiveIssue(s.issues[0]?.id ?? '')
    setClaimOriginal(s.claimOriginal); setClaimAmended(s.claimAmended); setFeeReminder(s.feeReminder)
    setDocketBanner(null)
    // step 由 usePersistedFlowStep 按案水合
  }, [caseId])

  useEffect(() => { if (paramId && paramId !== caseId) setCaseId(paramId) }, [paramId])

  useEffect(() => {
    if (!docketBanner) return
    const latest = docketEvents.find(
      (e) => e.caseId === docketBanner.caseId && e.fromHandoffWriteback && e.receiptNo,
    )
    if (latest?.receiptNo && latest.receiptNo !== docketBanner.receiptNo) {
      setDocketBanner((prev) => prev ? { ...prev, receiptNo: latest.receiptNo } : prev)
    }
  }, [docketEvents, docketBanner])

  const daysLeft = useMemo(() => daysUntil(deadline), [deadline])
  const level = urgencyLevel(daysLeft)

  const assembled = useMemo(() => {
    const issueBlock = issues.map((iss, idx) =>
      `争点 ${idx + 1}【${iss.type}】涉及 ${iss.claimRefs}\n审查员观点：${iss.examinerView}\n答复策略：${iss.strategy}\n答复要点：${iss.response}`
    ).join('\n\n')
    return `【意见陈述书草稿】
案件：${c?.title ?? caseId}（${c?.caseNo ?? ''}）
针对：${oaType}　发文日：${oaDate}　期限：${deadline}

${issueBlock}

—— 修改前 ——
${claimOriginal}

—— 修改后 ——
${claimAmended}

费用提醒：${feeReminder}
交接状态：${handoff}
`
  }, [c, caseId, oaType, oaDate, deadline, issues, claimOriginal, claimAmended, feeReminder, handoff])

  useEffect(() => setDraft(assembled), [assembled])
  const showToast = (msg: string, err = false, next?: { label: string; to: string }[]) => {
    setToast(msg)
    setToastErr(err)
    setToastNext(err ? undefined : next)
    setTimeout(() => { setToast(null); setToastNext(undefined) }, err ? 2800 : 8000)
  }
  const updateIssue = (id: string, patch: Partial<(typeof issues)[0]>) => setIssues((prev) => prev.map((i) => i.id === id ? { ...i, ...patch } : i))

  const oaEvents = docketEvents.filter(
    (e) => e.caseId === caseId && (e.linkedHandoffKey === 'prosecution_response' || e.ruleId.startsWith('oa')),
  )

  const progressStep = useMemo(() => {
    if (oaStatementConfirmed || ['approved', 'authorized_to_file', 'filed'].includes(handoff)) return 3
    if (claimAmended.trim()) return 2
    if (issues.some((i) => i.strategy.trim() && i.response.trim())) return 1
    if (oaDate || deadline) return 0
    return 0
  }, [oaStatementConfirmed, handoff, claimAmended, issues, oaDate, deadline])
  const stepperCurrent = Math.max(step, progressStep, storedStepIndex)

  useEffect(() => {
    syncProgressFloor(progressStep)
  }, [progressStep, syncProgressFloor])


  return (
    <div className="p-6 lg:p-8">
      <ToastBanner message={toast} error={toastErr} nextActions={toastNext} />
      <FlowHeader title="审查答复" subtitle={role === 'enterprise' ? '审核代理稿 / 确认策略 / 授权递交' : '撰写答复 / 修改权利要求 / 提交审核'} caseData={c} />

      {docketBanner && (
        <div
          className="mb-4 flex flex-wrap items-center gap-3 rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-900 shadow-[0_1px_2px_rgba(15,23,42,0.04)]"
          role="status"
        >
          <CheckCircle2 className="h-5 w-5 shrink-0 text-emerald-600" aria-hidden />
          <div className="min-w-0 flex-1">
            <div className="font-medium">已写入官方期限 · 查看 Docket</div>
            <div className="mt-0.5 text-xs text-emerald-800/80">
              递交归档已回写 Docket 事件
              {docketBanner.receiptNo ? ` · 回执 ${docketBanner.receiptNo}` : ''}
            </div>
          </div>
          <AppLink
            to={`/docket?case=${docketBanner.caseId}`}
            className="btn-press inline-flex items-center gap-1.5 rounded-xl bg-emerald-600 px-3 py-1.5 text-xs font-medium text-white hover:bg-emerald-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-emerald-500"
          >
            <CalendarDays className="h-3.5 w-3.5" aria-hidden /> 查看 Docket
          </AppLink>
        </div>
      )}

      <div className={`mb-4 flex flex-wrap items-center gap-3 rounded-xl border px-3 py-2 text-xs font-medium ${urgencyBannerClass(level)}`}>
        <DeadlineChip deadline={deadline} />
        <span>{urgencyLabel(daysLeft)} · 答复期限</span>
        {level === 'critical' && <span className="ml-auto">紧急：请尽快完成争点策略与权利要求修改</span>}
      </div>
      <div className="mb-4 flex flex-wrap items-center gap-4">
        <CasePicker stage="prosecution" selectedId={caseId} onChange={(id) => { setCaseId(id); navigate(id ? `/workbench/prosecution/${id}` : '/workbench/prosecution', { replace: true }) }} />
      </div>
      <Stepper steps={STEPS} current={stepperCurrent} />

      {/* P1 · 唯一 sticky tip：陈述/Full-check 主因（HABIT-04） */}
      {!oaStatementConfirmed ? (
        <WbStickyTip tone="error" className="mb-4">
          未确认陈述前不可授权/递交 · 请先勾选「陈述已确认」
        </WbStickyTip>
      ) : !fullCheckResult.ok ? (
        <WbStickyTip tone="error" className="mb-4">
          Full-check 缺口：{fullCheckResult.missing.join('；')}
        </WbStickyTip>
      ) : null}

      <SplitDraft
        rightTitle="答复书草稿"
        right={<textarea className={`${textareaCls} min-h-[480px] font-mono text-xs leading-relaxed`} name="prosecutionDraft" autoComplete="off" spellCheck={false} value={draft} onChange={(e) => setDraft(e.target.value)} />}
        left={<>
          <WbSection title="OA 登记与期限">
            <div className="grid gap-3 sm:grid-cols-3">
              <WbField label="发文日"><input type="date" name="oaDate" autoComplete="off" className={inputCls} value={oaDate} onChange={(e) => { setOaDate(e.target.value); setStep(0) }} /></WbField>
              <WbField label="答复期限"><input type="date" name="deadline" autoComplete="off" className={inputCls} value={deadline} onChange={(e) => setDeadline(e.target.value)} /></WbField>
              <WbField label="审查意见类型">
                <select name="oaType" autoComplete="off" className={inputCls} value={oaType} onChange={(e) => setOaType(e.target.value)}>
                  <option>第一次审查意见通知书</option><option>第二次审查意见通知书</option><option>补正通知书</option><option>驳回决定</option>
                </select>
              </WbField>
            </div>
            <div className="mt-3 flex items-start gap-2 rounded-xl bg-amber-50 px-3 py-2 text-xs text-amber-800">
              <AlertTriangle className="mt-0.5 h-3.5 w-3.5 shrink-0" aria-hidden />{feeReminder}
            </div>
            <div className="mt-4 rounded-2xl border border-slate-200 bg-slate-50/80 p-3">
              <h4 className="mb-2 text-xs font-medium text-slate-800">多轮 OA 时间线（示意）</h4>
              <ul className="space-y-2">
                {oaEvents
                  .sort((a, b) => a.triggerDate.localeCompare(b.triggerDate))
                  .map((e) => (
                    <li key={e.id} className="flex flex-wrap items-center gap-2 rounded-xl bg-white px-2.5 py-2 text-xs ring-1 ring-slate-100">
                      <span className={`rounded-full px-1.5 py-0.5 text-xs ${e.status === 'done' ? 'bg-emerald-50 text-emerald-700' : e.status === 'due_soon' ? 'bg-amber-50 text-amber-800' : 'bg-slate-100 text-slate-600'}`}>
                        {e.status}
                      </span>
                      {e.fromHandoffWriteback && (
                        <span className="rounded-full border border-slate-200 bg-slate-50 px-1.5 py-0.5 text-xs font-medium text-slate-600">
                          业务回写
                        </span>
                      )}
                      <span className="font-medium text-slate-800">{e.title}</span>
                      <span className="tabular-nums text-slate-500">触发 {e.triggerDate} → 到期 {e.dueDate}</span>
                      {e.receiptNo && <span className="font-mono text-slate-800">回执 {e.receiptNo}</span>}
                    </li>
                  ))}
                {oaEvents.length === 0 && (
                  <li className="text-xs text-slate-500">暂无 OA 期限事件；递交归档后将自动追加</li>
                )}
              </ul>
              <AppLink to={`/docket?case=${caseId}`} className="btn-press mt-2 inline-block rounded-lg text-xs text-slate-700 hover:bg-slate-100 hover:text-slate-900 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-slate-400">
                查看全部官方期限
              </AppLink>
            </div>
          </WbSection>
          <div className={panelCls}>
            <h3 className="mb-3 text-sm font-medium text-balance text-slate-800">逐条争点</h3>
            <div className="mb-3 flex flex-wrap gap-2">
              {issues.map((iss, idx) => (
                <button key={iss.id} type="button" onClick={() => { setActiveIssue(iss.id); setStep(1) }}
                  className={`btn-press rounded-xl px-3 py-1.5 text-xs focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-slate-400 ${activeIssue === iss.id ? 'bg-slate-100 text-slate-800 ring-1 ring-slate-200' : 'bg-slate-100 text-slate-500 hover:bg-slate-200 hover:text-slate-800'}`}>
                  争点{idx + 1} · {iss.type}
                </button>
              ))}
            </div>
            {issues.filter((i) => i.id === activeIssue).map((iss) => (
              <div key={iss.id} className="space-y-3">
                <div className="grid gap-3 sm:grid-cols-2">
                  <Field label="争点类型"><select name="issueType" autoComplete="off" className={inputCls} value={iss.type} onChange={(e) => updateIssue(iss.id, { type: e.target.value })}>{ISSUE_TYPES.map((t) => <option key={t}>{t}</option>)}</select></Field>
                  <Field label="涉及权利要求"><input name="claimRefs" autoComplete="off" spellCheck={false} className={inputCls} value={iss.claimRefs} onChange={(e) => updateIssue(iss.id, { claimRefs: e.target.value })} /></Field>
                </div>
                <Field label="审查员观点"><textarea name="examinerView" autoComplete="off" className={textareaCls} value={iss.examinerView} onChange={(e) => updateIssue(iss.id, { examinerView: e.target.value })} /></Field>
                <Field label="答复策略" required>
                  <div className="flex flex-wrap gap-2">
                    {STRATEGIES.map((s) => (
                      <button key={s} type="button" onClick={() => updateIssue(iss.id, { strategy: s })}
                        className={`btn-press rounded-full px-3 py-1 text-xs focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-slate-400 ${iss.strategy === s ? 'bg-slate-100 text-slate-800 ring-1 ring-slate-200' : 'bg-slate-100 text-slate-500 hover:bg-slate-200'}`}>{s}</button>
                    ))}
                  </div>
                </Field>
                <Field label="答复要点" required><textarea name="response" autoComplete="off" className={textareaCls} value={iss.response} onChange={(e) => updateIssue(iss.id, { response: e.target.value })} /></Field>
              </div>
            ))}
          </div>
          <div className={panelCls}>
            <h3 className="mb-3 text-sm font-medium text-balance text-slate-800">权利要求修改对比</h3>
            <div className="grid gap-3 lg:grid-cols-2">
              <Field label="原文"><textarea name="claimOriginal" autoComplete="off" spellCheck={false} className={textareaCls + ' min-h-[140px] font-mono text-xs'} value={claimOriginal} onChange={(e) => { setClaimOriginal(e.target.value); setStep(2) }} /></Field>
              <Field label="修改后"><textarea name="claimAmended" autoComplete="off" spellCheck={false} className={textareaCls + ' min-h-[140px] font-mono text-xs'} value={claimAmended} onChange={(e) => setClaimAmended(e.target.value)} /></Field>
            </div>
            <div className="mt-3">
              <ClaimDiffView original={claimOriginal} amended={claimAmended} />
            </div>
          </div>
          <div className={panelCls}>
            <h3 className="mb-2 text-sm font-medium text-slate-800">答复书 · 陈述确认</h3>
            <label className="flex cursor-pointer items-start gap-2 rounded-xl border border-slate-200 px-3 py-2 text-sm text-slate-700 hover:bg-slate-50">
              <input
                type="checkbox"
                className="mt-0.5 accent-slate-700"
                checked={oaStatementConfirmed}
                onChange={(e) => {
                  const confirmed = e.target.checked
                  setOaStatementConfirmed(caseId, confirmed)
                  // 工作台 → Agent session 镜像（OA 办理会话）
                  visibleSessions
                    .filter(
                      (s) =>
                        s.caseId === caseId &&
                        s.agentId === 'agent-oa' &&
                        !!s.oaStatementConfirmed !== confirmed,
                    )
                    .forEach((s) =>
                      patchSession(s.id, { oaStatementConfirmed: confirmed }),
                    )
                  // 与 Agent ConfirmBar oa_confirm 摘要口径对齐
                  if (confirmed) {
                    const active = issues.find((i) => i.id === activeIssue)
                    appendCaseDriveItem(caseId, {
                      kind: 'oa_confirm',
                      title: '已确认陈述',
                      summary: active?.type
                        ? `争点 ${active.type}`
                        : 'OA 陈述确认',
                      source: 'prosecution-oa-confirm',
                    })
                  }
                }}
              />
              <span>
                陈述已确认
                <span className="mt-0.5 block text-xs text-slate-500">
                  对齐 Agent oaStatementConfirmed · 授权/递交前必勾
                </span>
              </span>
            </label>
            {!oaStatementConfirmed && (
              <p className="mt-2 text-xs text-slate-500" role="note">陈述未确认 · 详见上方提示</p>
            )}
            <h3 className="mb-2 mt-4 text-sm font-medium text-slate-800">Full-check（授权/递交前）</h3>
            <ul className="space-y-2">
              {FULL_CHECK_LITE_ITEMS.map(({ id, label }) => (
                <li key={id}>
                  <label className="flex cursor-pointer items-start gap-2 rounded-xl border border-slate-200 px-3 py-2 text-sm text-slate-700 hover:bg-slate-50">
                    <input
                      type="checkbox"
                      className="mt-0.5 accent-slate-700"
                      checked={!!fullLite[id]}
                      onChange={() => toggleFullCheckLite(caseId, id)}
                    />
                    <span>{label}</span>
                  </label>
                </li>
              ))}
            </ul>
            {!fullCheckResult.ok && (
              <p className="mt-2 text-xs text-slate-500" role="note">Full-check 有缺口 · 详见上方提示</p>
            )}
          </div>
          <VersionPanel caseId={caseId} handoffKey="prosecution_response" />
          <div className={panelCls}>
            <HandoffActionBar
              caseId={caseId}
              handoffKey="prosecution_response"
              showFile
              blockAuthorize={
                !evaluateGuardrails({
                  agent: getAgent('agent-oa'),
                  case: c ?? null,
                  session: {
                    oaStatementConfirmed,
                    oaIssueType: activeIss
                      ? mapIssueType(activeIss.type)
                      : undefined,
                    oaStrategyNotes:
                      activeIss &&
                      activeIss.strategy.trim() &&
                      activeIss.response.trim()
                        ? `${activeIss.strategy}：${activeIss.response}`
                        : activeIss?.response,
                  },
                  action: 'authorize',
                  persona,
                  role,
                  isEnterprise: role === 'enterprise',
                  handoffKey: 'prosecution_response',
                  fullCheckLite: fullLite,
                }).ok
              }
              inlineError={firstGuardrailMessage(
                evaluateGuardrails({
                  agent: getAgent('agent-oa'),
                  case: c ?? null,
                  session: {
                    oaStatementConfirmed,
                    oaIssueType: activeIss
                      ? mapIssueType(activeIss.type)
                      : undefined,
                    oaStrategyNotes:
                      activeIss &&
                      activeIss.strategy.trim() &&
                      activeIss.response.trim()
                        ? `${activeIss.strategy}：${activeIss.response}`
                        : activeIss?.response,
                  },
                  action: 'authorize',
                  persona,
                  role,
                  isEnterprise: role === 'enterprise',
                  handoffKey: 'prosecution_response',
                  fullCheckLite: fullLite,
                }),
              )}
              checkedRequired={[
                ...(issues.some((i) => i.strategy.trim() && i.response.trim()) ? ['strategy'] : []),
                ...(claimAmended.trim() ? ['claims_amended'] : []),
              ]}
              validateBefore={(a) => {
                if (a === 'submit') {
                  const hasStrategy = issues.some((i) => i.strategy.trim() && i.response.trim())
                  if (!hasStrategy) return '请至少完成一条争点的策略与答复要点'
                }
                if (a === 'authorize' || a === 'file') {
                  // OA 陈述 / Full-check · 与 ConfirmBar 同源【唯一入口】
                  const gr = evaluateGuardrails({
                    agent: getAgent('agent-oa'),
                    case: c ?? null,
                    session: {
                      oaStatementConfirmed,
                      oaIssueType: activeIss
                        ? mapIssueType(activeIss.type)
                        : undefined,
                      oaStrategyNotes:
                        activeIss &&
                        activeIss.strategy.trim() &&
                        activeIss.response.trim()
                          ? `${activeIss.strategy}：${activeIss.response}`
                          : activeIss?.response,
                    },
                    action: a,
                    persona,
                    role,
                    isEnterprise: role === 'enterprise',
                    handoffKey: 'prosecution_response',
                    fullCheckLite: fullLite,
                  })
                  return firstGuardrailMessage(gr)
                }
                return null
              }}
              onResult={(msg, err) => {
                if (!err) {
                  markChecklistDone(caseId, ['c1', 'c2'])
                  if (msg.includes('提交')) {
                    addArtifact(caseId, '意见陈述书_代理稿.docx', '答复')
                    setStep(3)
                    const active = issues.find((i) => i.id === activeIssue)
                    appendCaseDriveItem(caseId, {
                      kind: 'approval',
                      title: '答复策略已提交',
                      summary: active?.type
                        ? `争点 ${active.type}${active.strategy ? ` · ${active.strategy}` : ''}`
                        : msg.slice(0, 80),
                      source: 'prosecution-submit',
                    })
                  }
                  if (msg.includes('授权') || msg.includes('递交') || msg.includes('归档')) {
                    markChecklistDone(caseId, ['c1', 'c2', 'c3', 'c4'])
                    addArtifact(caseId, '意见陈述书_已确认.docx', '答复')
                    if (msg.includes('归档') || msg.includes('递交')) {
                      setDocketBanner({ caseId })
                      showToast('已追加 Docket 事件（OA 答复已递交）')
                    }
                  }
                  addActivity(`「${c?.title}」${msg}`)
                }
                const next =
                    !err && (msg.includes('提交') || msg.includes('批准') || msg.includes('授权') || msg.includes('递交') || msg.includes('归档'))
                      ? nextActionsForStage('prosecution', caseId)
                      : undefined
                  showToast(msg, err, next)
              }}
            />
          </div>
        </>}
      />
    </div>
  )
}
