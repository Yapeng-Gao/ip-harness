import { useEffect, useMemo, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { ThumbsUp, ThumbsDown, ArrowRight } from 'lucide-react'
import { useApp } from '@shared/context/AppContext'
import { usePersistedFlowStep } from '@shared/hooks/usePersistedFlowStep'
import { stepsForFlow } from '@shared/data/flowSteps'
import {
  evaluateGuardrails,
  firstGuardrailMessage,
  DISCLOSURE_PACK_CHECK_ITEMS,
  COMMITTEE_VOTE_HARD_GATE_MSG,
} from '@ip/domain'
import { getAgent } from '@shared/data/agents'
import { Link } from 'react-router-dom'
import { AppLink } from '@shared/components/AppLink'
import { HANDOFF_LABELS, HANDOFF_ARTIFACT_LABELS } from '@ip/contracts'
import { intakeSeed, intakeDefaultsFromCase } from '@shared/data/workbenchSeeds'
import {
  CasePicker,
  Field,
  FlowHeader,
  HandoffActionBar,
  SplitDraft,
  Stepper,
  ToastBanner,
  nextActionsForStage,
  btnSuccess,
  inputCls,
  panelCls,
  textareaCls,
} from '../../components/FlowChrome'
import { VersionPanel } from '../../components/VersionPanel'
import { personaCanGo, personaCanVote, PERSONA_LABELS } from '@shared/data/persona'
import { WbSection, WbField } from '../../components/FormBlocks'

const STEPS = stepsForFlow('intake')
const REVIEWERS = [
  { id: 'v1', name: '张总（技术）' },
  { id: 'v2', name: '刘经理（商业）' },
  { id: 'v3', name: '陈顾问（法务/IP）' },
]
type Vote = '同意' | '有条件同意' | '驳回' | ''

export function IntakeFlow() {
  const { caseId: paramId } = useParams()
  const navigate = useNavigate()
  const {
    getCase, role, persona, addActivity, addArtifact, markChecklistDone,
    advanceFromWorkbench, getHandoff, updateEngagement,
    appendDraftInvoice, getDisclosurePackCheck, getHandoffState,
    recordIntakeNoGo, appendCaseDriveItem,
    recordCommitteeVote, committeeVoteHardBlockGo, hasAuditedCommitteeVote,
  } = useApp()

  const [caseId, setCaseId] = useState(paramId ?? 'c5')
  const { step, setStep, syncProgressFloor, storedStepIndex } = usePersistedFlowStep(caseId, 'intake')
  const [toast, setToast] = useState<string | null>(null)
  const [toastErr, setToastErr] = useState(false)
  const [toastNext, setToastNext] = useState<{ label: string; to: string }[] | undefined>()

  const c = getCase(caseId)
  const seed = intakeSeed[caseId] ?? (c ? intakeDefaultsFromCase(c) : intakeSeed.c5)

  const [inventors, setInventors] = useState(seed.inventors)
  const [techSolution, setTechSolution] = useState(seed.techSolution)
  const [scenario, setScenario] = useState(seed.scenario)
  const [disclosureRiskDate, setDisclosureRiskDate] = useState(seed.disclosureRiskDate)
  const [techScore, setTechScore] = useState(seed.techScore)
  const [bizScore, setBizScore] = useState(seed.bizScore)
  const [budget, setBudget] = useState(seed.budget)
  const [quote, setQuote] = useState(seed.quote)
  const [votes, setVotes] = useState<Record<string, { vote: Vote; comment: string }>>({
    v1: { vote: '同意', comment: '技术方案完整' },
    v2: { vote: '', comment: '' },
    v3: { vote: '有条件同意', comment: '需明确公开风险窗口' },
  })
  const [decision, setDecision] = useState<'Go' | 'No-Go' | ''>('')
  const [reason, setReason] = useState('')
  const [draft, setDraft] = useState('')
  const [quoteSent, setQuoteSent] = useState(false)

  const handoff = getHandoff(caseId, 'intake_quote')
  const disclosureStatus = getHandoff(caseId, 'disclosure_pack')
  const disclosureState = getHandoffState(caseId, 'disclosure_pack')
  const disclosureCheck = getDisclosurePackCheck(caseId)
  const disclosureApproved =
    disclosureStatus === 'approved' ||
    disclosureStatus === 'authorized_to_file' ||
    disclosureStatus === 'filed'
  const gapHints = DISCLOSURE_PACK_CHECK_ITEMS.filter(
    (i) => !disclosureCheck[i.id],
  ).length
  const hasPriorArt = !!disclosureCheck.prior_art_1_1
  const patentTypeHint = c?.type ?? '发明'

  useEffect(() => {
    const caseData = getCase(caseId)
    const s = intakeSeed[caseId] ?? (caseData ? intakeDefaultsFromCase(caseData) : null)
    if (!s) return
    setInventors(s.inventors)
    setTechSolution(s.techSolution)
    setScenario(s.scenario)
    setDisclosureRiskDate(s.disclosureRiskDate)
    setTechScore(s.techScore)
    setBizScore(s.bizScore)
    setBudget(s.budget)
    setQuote(s.quote)
    setDecision('')
    setReason('')
    setQuoteSent(false)
    // step 由 usePersistedFlowStep 按案水合，勿强制清零
  }, [caseId]) // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    if (paramId && paramId !== caseId) setCaseId(paramId)
  }, [paramId])

  const assembled = useMemo(() => {
    const voteLines = REVIEWERS.map((r) => {
      const v = votes[r.id]
      return `- ${r.name}：${v.vote || '未投'} ${v.comment ? `（${v.comment}）` : ''}`
    }).join('\n')
    return `【立项决策纪要】
案件：${c?.title ?? caseId}
发明人：${inventors}
技术方案摘要：${techSolution}
应用场景：${scenario}
公开风险日期：${disclosureRiskDate}

技术评分：${techScore}/5
商业价值：${bizScore}/5
预算预估：${budget}
接案报价：${quote}${quoteSent ? '（已发送企业）' : ''}

评审投票：
${voteLines}

决议：${decision || '待定'}
理由：${reason || '（请填写）'}
交接状态：${handoff}
`
  }, [c, caseId, inventors, techSolution, scenario, disclosureRiskDate, techScore, bizScore, budget, quote, quoteSent, votes, decision, reason, handoff])

  useEffect(() => setDraft(assembled), [assembled])

  const showToast = (msg: string, err = false, next?: { label: string; to: string }[]) => {
    setToast(msg)
    setToastErr(err)
    setToastNext(err ? undefined : next)
    setTimeout(() => { setToast(null); setToastNext(undefined) }, err ? 2800 : 8000)
  }
  const successNext = () => nextActionsForStage('decision', caseId)
  const votesReady = REVIEWERS.some((r) => !!votes[r.id]?.vote)

  // 商业评审完成：委员投票齐套时诚实勾 c3（非 Go 前宽写）
  useEffect(() => {
    if (!c || !votesReady) return
    const c3 = c.checklist.find((i) => i.id === 'c3')
    if (c3 && !c3.done) markChecklistDone(c.id, ['c3'])
  }, [votesReady, c?.id, c?.checklist, markChecklistDone])

  const onCaseChange = (id: string) => {
    setCaseId(id)
    navigate(id ? `/workbench/intake/${id}` : '/workbench/intake', { replace: true })
  }

  const submitGo = () => {
    if (!c) return showToast('请先选择案件', true)
    if (!decision) return showToast('请选择 Go / No-Go', true)
    if (!reason.trim()) return showToast('必须填写决策理由', true)
    if (!personaCanGo(persona)) {
      return showToast(
        persona === 'committee'
          ? '委员 Persona：不可 Go/No-Go（须企业 IP）'
          : persona === 'inventor'
            ? '发明人 Persona：不可 Go（须企业 IP）'
            : 'Go/No-Go 需由企业 IP Persona 确认',
        true,
      )
    }
    if (role !== 'enterprise') return showToast('Go/No-Go 需由企业身份确认', true)
    if (decision === 'Go' && committeeVoteHardBlockGo && !hasAuditedCommitteeVote(c.id)) {
      return showToast(COMMITTEE_VOTE_HARD_GATE_MSG, true)
    }
    if (decision === 'No-Go') {
      const res = recordIntakeNoGo(c.id, reason.trim())
      addArtifact(c.id, '立项No-Go决议.md', '纪要')
      appendCaseDriveItem(c.id, {
        kind: 'other',
        title: '立项 No-Go',
        summary: reason.trim().slice(0, 120),
        source: 'intake-nogo',
      })
      showToast(res.ok ? res.message : res.message, !res.ok, [
        { label: '回案件', to: `/cases/${c.id}` },
        { label: '去期限', to: `/docket?case=${c.id}` },
        { label: '打开工作台', to: '/workbench' },
      ])
      return
    }
    // Enterprise Go gate: self_serve with budget OR delegated quote confirmed / handoff approved
    const mode = c.fulfillmentMode ?? 'delegated'
    const quoteOk = ['approved', 'authorized_to_file', 'filed'].includes(handoff)
    const payOk = ['已确认待付款', '部分付款', '已结清'].includes(c.engagement.paymentStatus)
    if (mode === 'self_serve') {
      if (!budget.trim()) return showToast('自助立项须填写预算后方可 Go', true)
    } else {
      if (!quoteOk && !payOk) {
        return showToast('委托模式：须报价已确认 / intake_quote 交接批准后方可 Go', true)
      }
    }
    {
      const gr = evaluateGuardrails({
        agent: getAgent('agent-intake'),
        case: c,
        action: 'go_nogo',
        persona,
        role,
        isEnterprise: role === 'enterprise',
        handoffKey: 'intake_quote',
        disclosureStatus,
      })
      const gmsg = firstGuardrailMessage(gr)
      if (decision === 'Go' && gmsg) {
        return showToast(gmsg, true)
      }
    }
    // 禁止 Go 前宽写 markChecklistDone(c3/c4)。c3 须已由投票 useEffect 诚实勾选；
    // c4「Go 决议已签署」由本动作经 resolveDoneIds 原子完成（非伪造批准）。
    const resolveDoneIds = ['c4']
    if (votesReady) {
      const c3 = c.checklist.find((i) => i.id === 'c3')
      if (c3 && !c3.done) resolveDoneIds.push('c3')
    }
    const blocking = c.checklist.filter(
      (i) => i.required && !i.done && !resolveDoneIds.includes(i.id),
    )
    if (blocking.length > 0) {
      return showToast(
        `清单未齐：${blocking.map((i) => i.label).join('、')}（晋级只认真实清单/交接）`,
        true,
      )
    }
    const voteNote =
      votesReady || committeeVoteHardBlockGo ? '' : '（委员投票未齐·软提示）'
    const res = advanceFromWorkbench(c.id, {
      note: `立项 Go：${reason}${voteNote}`,
      resolveDoneIds,
    })
    if (res.ok) {
      addArtifact(c.id, '立项Go决议.md', '纪要')
      appendCaseDriveItem(c.id, {
        kind: 'approval',
        title: '立项 Go',
        summary: reason.trim().slice(0, 120),
        source: 'intake-go',
      })
      showToast(res.message, false, successNext())
    } else showToast(res.message, true)
  }

  const progressStep = useMemo(() => {
    if (decision) return 3
    if (votesReady) return 2
    if (techScore > 0 || bizScore > 0) return 1
    return 0
  }, [decision, votesReady, techScore, bizScore])
  const stepperCurrent = Math.max(step, progressStep, storedStepIndex)

  useEffect(() => {
    syncProgressFloor(progressStep)
  }, [progressStep, syncProgressFloor])


  return (
    <div className="p-6 lg:p-8">
      <ToastBanner message={toast} error={toastErr} nextActions={toastNext} />
      <FlowHeader
        title="立项决策"
        subtitle={role === 'enterprise' ? '发明披露、评审、预算与 Go·No-Go' : '接案评估、报价并提交企业确认'}
        caseData={c}
      />
      <div className="mb-4">
        <CasePicker stage="decision" selectedId={caseId} onChange={onCaseChange} />
      </div>
      <Stepper steps={STEPS} current={stepperCurrent} />

      <SplitDraft
        rightTitle="立项决策纪要"
        right={
          <textarea className={`${textareaCls} min-h-[420px] font-mono text-xs leading-relaxed`} value={draft} onChange={(e) => setDraft(e.target.value)} />
        }
        left={
          <>
            <WbSection title="发明披露表">
                <div
                  className={`mb-3 rounded-lg border px-3 py-2 text-xs ${
                    !disclosureStatus
                      ? 'border-amber-200 bg-amber-50 text-amber-950'
                      : disclosureApproved
                        ? 'border-emerald-200 bg-emerald-50 text-emerald-900'
                        : 'border-amber-200 bg-amber-50 text-amber-950'
                  }`}
                >
                  <div className="font-medium">
                    {HANDOFF_ARTIFACT_LABELS.disclosure_pack} 摘要
                  </div>
                  <ul className="mt-1 space-y-0.5 text-[11px]">
                    <li>专利类型：{patentTypeHint}</li>
                    <li>
                      交接态：
                      {disclosureStatus
                        ? HANDOFF_LABELS[disclosureStatus]
                        : '无 pack'}
                      {disclosureState?.note ? ` · ${disclosureState.note}` : ''}
                    </li>
                    <li>1.1 现有技术勾选：{hasPriorArt ? '有' : '无/未勾'}</li>
                    <li>缺口/未齐项数：{gapHints}</li>
                  </ul>
                  {!disclosureApproved && (
                    <p className="mt-1.5 text-[11px] font-medium text-rose-800">
                      红灯：交底包未批准，不可 Go ·{' '}
                      <Link
                        className="underline"
                        to={`/inventor?case=${caseId}`}
                      >
                        门户
                      </Link>
                      {' · '}
                      <AppLink
                        className="underline"
                        to={`/agent/agents?agent=agent-disclosure&case=${caseId}`}
                      >
                        交底 Agent
                      </AppLink>
                    </p>
                  )}
                </div>
                <WbField label="发明人" required>
                  <input className={inputCls} value={inventors} onChange={(e) => { setInventors(e.target.value); setStep(0) }} />
                </WbField>
                <WbField label="技术方案" required>
                  <textarea className={textareaCls} value={techSolution} onChange={(e) => setTechSolution(e.target.value)} />
                </WbField>
                <WbField label="应用场景">
                  <input className={inputCls} value={scenario} onChange={(e) => setScenario(e.target.value)} />
                </WbField>
                <WbField label="公开风险日期" hint="论文/展会/产品发布等可能破坏新颖性的日期">
                  <input type="date" className={inputCls} value={disclosureRiskDate} onChange={(e) => setDisclosureRiskDate(e.target.value)} />
                </WbField>
            </WbSection>

            <div className={panelCls}>
              <h3 className="mb-4 text-sm font-medium text-slate-800">技术评分 + 商业价值</h3>
              <Field label={`技术评分：${techScore}`}>
                <input type="range" min={1} max={5} step={1} value={techScore} onChange={(e) => { setTechScore(Number(e.target.value)); setStep(1) }} className="w-full accent-slate-700" />
              </Field>
              <div className="mt-3">
                <Field label={`商业价值：${bizScore}`}>
                  <input type="range" min={1} max={5} step={1} value={bizScore} onChange={(e) => setBizScore(Number(e.target.value))} className="w-full accent-slate-700" />
                </Field>
              </div>
            </div>

            <div className={panelCls}>
              <h3 className="mb-1 text-sm font-medium text-slate-800">报价单</h3>
              <p className="mb-4 text-xs text-slate-500">
                报价以工作台「立项/报价」交接为准（下方交接条提交 / 批准为唯一确认路径）；费用中台台账仅记录开票与付款，二者勿混用。
              </p>
              <div className="grid gap-3 sm:grid-cols-2">
                <Field label="企业预算预估">
                  <input className={inputCls} value={budget} onChange={(e) => setBudget(e.target.value)} placeholder="如 ¥35,000" />
                </Field>
                <Field label="接案报价（含税口径）" required>
                  <input className={inputCls} value={quote} onChange={(e) => setQuote(e.target.value)} placeholder="如 ¥28,000（CN 发明撰写）" />
                </Field>
              </div>
              <div className="mt-3 rounded-lg border border-slate-200 bg-slate-50 p-3 text-xs text-slate-700">
                <div className="mb-2 font-medium text-slate-800">费用明细（mock）</div>
                <ul className="space-y-1">
                  <li className="flex justify-between"><span>代理服务费</span><span>{quote || '—'}</span></li>
                  <li className="flex justify-between"><span>官费估算（发明申请）</span><span>≈ ¥3,450</span></li>
                  <li className="flex justify-between border-t border-slate-200 pt-1 font-medium text-slate-800">
                    <span>企业可见合计口径</span>
                    <span>{quote || '待报价'} + 官费</span>
                  </li>
                </ul>
                {c?.engagement && (
                  <div className="mt-2 flex flex-wrap gap-2 text-xs text-slate-500">
                    <span>当前付款状态：{c.engagement.paymentStatus}</span>
                    <span>·</span>
                    <span>委托阶段：{c.engagement.phase}</span>
                  </div>
                )}
              </div>
            </div>

            <div className={panelCls}>
              <h3 className="mb-4 text-sm font-medium text-slate-800">评审委员投票</h3>
              <p className="mb-3 text-xs text-slate-500">
                当前 Persona={PERSONA_LABELS[persona]}
                {persona === 'committee'
                  ? ' · 投票写入可审计'
                  : persona === 'enterprise_ip'
                    ? ' · 可代看/代填（非委员审计票）'
                    : ' · 不可投票'}
                {committeeVoteHardBlockGo ? ' · 已开「投票硬挡 Go」' : ''}
              </p>
              <div className="space-y-4">
                {REVIEWERS.map((r) => (
                  <div key={r.id} className="rounded-lg border border-slate-200 p-3">
                    <div className="mb-2 text-sm text-slate-700">{r.name}</div>
                    <div className="mb-2 flex flex-wrap gap-2">
                      {(['同意', '有条件同意', '驳回'] as Vote[]).map((v) => (
                        <button key={v} type="button"
                          disabled={!personaCanVote(persona)}
                          title={
                            !personaCanVote(persona)
                              ? '当前 Persona 不可投票（请切委员或企业 IP）'
                              : undefined
                          }
                          onClick={() => {
                            setVotes((prev) => ({ ...prev, [r.id]: { ...prev[r.id], vote: v } }))
                            setStep(2)
                            const res = recordCommitteeVote({
                              caseId,
                              reviewerId: r.id,
                              reviewerName: r.name,
                              vote: v,
                              comment: votes[r.id]?.comment,
                            })
                            if (res.ok) showToast(res.message, false)
                            else showToast(res.message, true)
                          }}
                          className={`rounded-full px-3 py-1 text-xs disabled:cursor-not-allowed disabled:opacity-40 ${
                            votes[r.id]?.vote === v
                              ? v === '驳回' ? 'bg-rose-50 text-rose-700' : v === '同意' ? 'bg-emerald-50 text-emerald-700' : 'bg-amber-50 text-amber-700'
                              : 'bg-slate-100 text-slate-500'
                          }`}>{v}</button>
                      ))}
                    </div>
                    <input className={inputCls} placeholder="意见" value={votes[r.id]?.comment ?? ''}
                      onChange={(e) => setVotes((prev) => ({ ...prev, [r.id]: { ...prev[r.id], comment: e.target.value } }))} />
                  </div>
                ))}
              </div>
            </div>

            <div className={panelCls}>
              <h3 className="mb-4 text-sm font-medium text-slate-800">Go / No-Go 决策</h3>
              <div className="mb-3 flex gap-2">
                <button type="button"
                  disabled={!personaCanGo(persona)}
                  title={!personaCanGo(persona) ? '须企业 IP Persona' : undefined}
                  onClick={() => { setDecision('Go'); setStep(3) }}
                  className={`flex flex-1 items-center justify-center gap-2 rounded-lg py-3 text-sm font-medium disabled:cursor-not-allowed disabled:opacity-40 ${decision === 'Go' ? 'bg-emerald-600 text-white' : 'bg-slate-100 text-slate-500'}`}>
                  <ThumbsUp className="h-4 w-4" /> Go
                </button>
                <button type="button"
                  disabled={!personaCanGo(persona)}
                  title={!personaCanGo(persona) ? '须企业 IP Persona' : undefined}
                  onClick={() => { setDecision('No-Go'); setStep(3) }}
                  className={`flex flex-1 items-center justify-center gap-2 rounded-lg py-3 text-sm font-medium disabled:cursor-not-allowed disabled:opacity-40 ${decision === 'No-Go' ? 'bg-rose-600 text-white' : 'bg-slate-100 text-slate-500'}`}>
                  <ThumbsDown className="h-4 w-4" /> No-Go
                </button>
              </div>
              <Field label="决策理由（必填）" required>
                <textarea className={textareaCls} value={reason} onChange={(e) => setReason(e.target.value)}
                  placeholder="例如：技术评分达标，预算已批复，同意立项撰写…" />
              </Field>
            </div>

            <VersionPanel caseId={caseId} handoffKey="intake_quote" />
            <div className={panelCls}>
              <HandoffActionBar
                caseId={caseId}
                handoffKey="intake_quote"
                checkedRequired={[
                  ...(quote.trim() ? ['quote'] : []),
                  ...(techSolution.trim() ? ['scope'] : []),
                  // flag OFF：UI 票即可亮 REQUIRED（软）；flag ON：批准仍由 canPerform/validate 硬认审计票
                  ...(votesReady ? ['votes'] : []),
                ]}
                validateBefore={(action) => {
                  if (action === 'submit' && !quote.trim()) return '请填写报价后再提交'
                  if (action === 'submit' && !techSolution.trim()) return '请填写技术方案'
                  if (
                    (action === 'approve' || action === 'authorize') &&
                    committeeVoteHardBlockGo &&
                    !hasAuditedCommitteeVote(caseId)
                  ) {
                    return COMMITTEE_VOTE_HARD_GATE_MSG
                  }
                  return null
                }}
                onResult={(msg, err) => {
                  if (!err && msg.includes('提交')) {
                    setQuoteSent(true)
                    updateEngagement(caseId, {
                      quoteBudget: quote,
                      paymentStatus: '报价待确认',
                      phase: '接案评估',
                    })
                    addArtifact(caseId, '接案报价_提交.md', '报价')
                    addActivity(`「${c?.title}」接案报价已提交企业审核`)
                  }
                  if (!err && (msg.includes('批准') || msg.includes('确认'))) {
                    updateEngagement(caseId, {
                      quoteBudget: quote || c?.engagement.quoteBudget || '',
                      paymentStatus: '已确认待付款',
                      phase: '正式委托',
                      feeNotes: '企业已确认报价',
                      budgetApproved: quote || c?.engagement.quoteBudget || '',
                    })
                    appendDraftInvoice(caseId, {
                      title: `接案报价确认 · ${quote || c?.engagement.quoteBudget || '服务费'}`,
                      amount: quote || c?.engagement.quoteBudget || '待核定',
                      relatedStage: '立项决策',
                    })
                    addActivity(`「${c?.title}」企业已确认报价，付款状态更新`)
                  }
                  showToast(msg, err, err ? undefined : successNext())
                }}
                extra={
                  <span className="text-xs text-slate-500">
                    {role === 'agency' ? '主路径：交接条「提交企业审核」= 发送报价' : '主路径：交接条「确认报价 / 批准」= 报价生效'}
                  </span>
                }
              />
              {role === 'enterprise' && (
                <>
                  <p className="mt-2 rounded-xl bg-slate-50 px-3 py-2 text-xs text-slate-600">
                    Go 闸门条件：须企业 IP Persona；交底包须已批准；自助须有预算；委托须报价确认 / intake_quote 已批准。
                    {committeeVoteHardBlockGo
                      ? '「投票硬挡 Go」已开：立项 Go / 确认报价前必须有效投票。'
                      : '委员投票为报价提交 REQUIRED（默认可软提示）。'}
                  </p>
                  {!personaCanGo(persona) ? (
                    <p className="mt-3 rounded-lg border border-amber-200 bg-amber-50 px-3 py-2 text-xs text-amber-900" role="status">
                      当前 Persona={PERSONA_LABELS[persona]}：不可 Go/No-Go（须切企业 IP）
                    </p>
                  ) : (
                    <button
                      type="button"
                      className={`${btnSuccess} mt-3`}
                      onClick={submitGo}
                      disabled={
                        (decision === 'Go' && !disclosureApproved) ||
                        (decision === 'Go' &&
                          committeeVoteHardBlockGo &&
                          !hasAuditedCommitteeVote(caseId))
                      }
                      title={
                        decision === 'Go' && !disclosureApproved
                          ? '交底包未批准，不可 Go'
                          : decision === 'Go' &&
                              committeeVoteHardBlockGo &&
                              !hasAuditedCommitteeVote(caseId)
                            ? COMMITTEE_VOTE_HARD_GATE_MSG
                            : undefined
                      }
                    >
                      <ArrowRight className="h-4 w-4" />
                      {decision === 'No-Go' ? '记录 No-Go' : '确认决议并转入撰写'}
                    </button>
                  )}
                  {decision === 'Go' &&
                    committeeVoteHardBlockGo &&
                    !hasAuditedCommitteeVote(caseId) && (
                      <p className="mt-2 text-xs font-medium text-rose-700" role="alert">
                        {COMMITTEE_VOTE_HARD_GATE_MSG}
                      </p>
                    )}
                </>
              )}
            </div>
          </>
        }
      />
    </div>
  )
}
