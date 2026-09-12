import { useEffect, useMemo, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { Plus, Trash2, FileOutput } from 'lucide-react'
import { useApp } from '@shared/context/AppContext'
import { usePersistedFlowStep } from '@shared/hooks/usePersistedFlowStep'
import { stepsForFlow } from '@shared/data/flowSteps'
import { HANDOFF_LABELS, HANDOFF_ARTIFACT_LABELS } from '@ip/contracts'
import {
  DRAFT_FILING_CHECK_ITEMS,
  DISCLOSURE_PACK_CHECK_ITEMS,
  evaluateGuardrails,
  firstGuardrailMessage,
} from '@ip/domain'
import { draftSeed, draftDefaultsFromCase } from '@shared/data/workbenchSeeds'
import {
  CasePicker, Field, FlowHeader, HandoffActionBar, SplitDraft, Stepper,
  ToastBanner, nextActionsForStage, btnGhost, btnPrimary, inputCls, textareaCls, draftAreaCls,
} from '../../components/FlowChrome'
import { VersionPanel } from '../../components/VersionPanel'
import { WbSection, WbField, WbError, WbTip, WbCheckRow, WbChip, WbInset } from '../../components/FormBlocks'
import {
  evaluateFullCheck,
  FULL_CHECK_LITE_ITEMS,
} from '@shared/utils/fullFilingCheck'
import { getAgent } from '@shared/data/agents'

const STEPS = stepsForFlow('draft')
const COUNTRIES = [
  { code: 'CN', name: '中国', fee: 3450, hint: '申请费¥900+公布印刷¥50+实审费¥2500（示意）' },
  { code: 'US', name: '美国', fee: 12000, hint: '示意官费+代理' },
  { code: 'EP', name: '欧洲', fee: 18000, hint: '示意官费+代理' },
  { code: 'JP', name: '日本', fee: 10000, hint: '示意官费+代理' },
  { code: 'KR', name: '韩国', fee: 8000, hint: '示意官费+代理' },
]
type Claim = { id: string; type: '独立' | '从属'; text: string; dependsOn?: string }

export function DraftFlow() {
  const { caseId: paramId } = useParams()
  const navigate = useNavigate()
  const {
    getCase, role, persona, addActivity, addArtifact, markChecklistDone, getHandoff, getHandoffState,
    appendDraftInvoice, getDraftFilingCheck, toggleDraftFilingCheck, getDisclosurePackCheck,
    getFullCheckLite, toggleFullCheckLite, appendCaseDriveItem,
  } = useApp()

  const [caseId, setCaseId] = useState(paramId ?? 'c4')
  const { step, setStep, syncProgressFloor, storedStepIndex } = usePersistedFlowStep(caseId, 'draft')
  const [toast, setToast] = useState<string | null>(null)
  const [toastErr, setToastErr] = useState(false)
  const [toastNext, setToastNext] = useState<{ label: string; to: string }[] | undefined>()

  const c = getCase(caseId)
  const seed = draftSeed[caseId] ?? (c ? draftDefaultsFromCase(c) : draftSeed.c4)

  const [field, setField] = useState(seed.field)
  const [background, setBackground] = useState(seed.background)
  const [invention, setInvention] = useState(seed.invention)
  const [embodiment, setEmbodiment] = useState(seed.embodiment)
  const [claims, setClaims] = useState<Claim[]>(seed.claims.map((x) => ({ ...x })))
  const [countries, setCountries] = useState<string[]>(seed.countries)
  const [pct, setPct] = useState(seed.pct)
  const [priority, setPriority] = useState(seed.priority)
  const [panel, setPanel] = useState<'claims' | 'checklist'>('claims')
  const [draft, setDraft] = useState('')
  const filingCheck = getDraftFilingCheck(caseId)
  const [filingInvoicePushed, setFilingInvoicePushed] = useState(false)
  const handoff = getHandoff(caseId, 'draft_claims')
  const disclosureStatus = getHandoff(caseId, 'disclosure_pack')
  const disclosureState = getHandoffState(caseId, 'disclosure_pack')
  const disclosureCheck = getDisclosurePackCheck(caseId)
  const disclosureApproved =
    disclosureStatus === 'approved' ||
    disclosureStatus === 'authorized_to_file' ||
    disclosureStatus === 'filed'
  const fullLite = getFullCheckLite(caseId)
  const fullCheckResult = evaluateFullCheck({
    scope: 'draft',
    disclosureStatus,
    filingCheck,
    lite: fullLite,
  })
  const applyApprovedPack = () => {
    if (!disclosureApproved) return
    const theme = c?.title ?? ''
    setField((prev) => prev || `技术领域（自交底包）· ${c?.type ?? '发明'}`)
    setBackground((prev) =>
      prev ||
      `背景/1.1 摘要：交底包已批准（${disclosureStatus ? HANDOFF_LABELS[disclosureStatus] : ''}）。${disclosureState?.note ?? ''}`,
    )
    setInvention((prev) =>
      prev ||
      `发明内容（自交底包结构化披露）：${c?.summary || theme}`,
    )
    setEmbodiment((prev) =>
      prev ||
      (disclosureCheck.embodiments
        ? '实施例已自交底包引入（示意）：请对照交底 Agent 产物中的实施例段落细化。'
        : prev),
    )
    setToast('已引入已批准交底包摘要到交底书字段')
    setToastErr(false)
    window.setTimeout(() => setToast(null), 2800)
  }

  useEffect(() => {
    setFilingInvoicePushed(false)
  }, [caseId])

  useEffect(() => {
    if (!filingInvoicePushed && Object.values(filingCheck).every(Boolean)) {
      const inv = appendDraftInvoice(caseId, {
        title: '撰写申请 · 递交齐套费用',
        amount: c?.engagement.quoteBudget || '¥28,000',
        relatedStage: '撰写申请',
      })
      if (inv) {
        setFilingInvoicePushed(true)
        setToast('递交清单齐套 · 已生成待开票行')
        setToastErr(false)
        window.setTimeout(() => setToast(null), 2800)
      }
    }
  }, [filingCheck, filingInvoicePushed, caseId, appendDraftInvoice, c])

  const claimErrors = useMemo(() => {
    const errs: Record<string, string> = {}
    const independents = claims.filter((c) => c.type === '独立')
    if (independents.length < 1) {
      errs._global = '独立权利要求：至少需要 1 项独立权（当前为 0）'
    }
    claims.forEach((cl, idx) => {
      const num = idx + 1
      if (cl.type === '从属') {
        const ref = Number(cl.dependsOn)
        if (!cl.dependsOn?.trim() || Number.isNaN(ref) || ref < 1 || ref >= num) {
          errs[cl.id] = `从属权利要求 #${num}：须引用有效在先权项号（1–${Math.max(num - 1, 1)}），当前「${cl.dependsOn || '空'}」无效`
        }
      }
      if (!cl.text.trim()) {
        const prefix = cl.type === '独立' ? `独立权利要求 #${num}` : `从属权利要求 #${num}`
        errs[cl.id] = (errs[cl.id] ? errs[cl.id] + '；' : '') + `${prefix}：权项内容不能为空`
      }
    })
    return errs
  }, [claims])

  const claimErrorList = useMemo(() => {
    const list: string[] = []
    if (claimErrors._global) list.push(claimErrors._global)
    for (const [id, msg] of Object.entries(claimErrors)) {
      if (id === '_global') continue
      list.push(msg)
    }
    return list
  }, [claimErrors])

  const claimsValid = claimErrorList.length === 0


  useEffect(() => {
    const caseData = getCase(caseId)
    const s = draftSeed[caseId] ?? (caseData ? draftDefaultsFromCase(caseData) : null)
    if (!s) return
    setField(s.field); setBackground(s.background); setInvention(s.invention)
    setEmbodiment(s.embodiment); setClaims(s.claims.map((x) => ({ ...x })))
    setCountries(s.countries); setPct(s.pct); setPriority(s.priority)
    // step 由 usePersistedFlowStep 按案水合；清单为 case 级状态
  }, [caseId]) // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => { if (paramId && paramId !== caseId) setCaseId(paramId) }, [paramId])

  const feeTotal = useMemo(() => {
    const base = countries.reduce((s, code) => s + (COUNTRIES.find((x) => x.code === code)?.fee ?? 0), 0)
    const pctFee = pct ? 15000 : 0
    const agency = role === 'agency' ? 28000 : 0
    return { base, pctFee, agency, total: base + pctFee + agency }
  }, [countries, pct, role])

  const assembled = useMemo(() => {
    if (panel === 'checklist') {
      return `【申请清单】
案件：${c?.title ?? caseId}
国别/途径：${countries.join('、')}${pct ? ' + PCT' : ''}
优先权：${priority || '无'}
权利要求：${claims.filter((x) => x.type === '独立').length} 独立 / ${claims.filter((x) => x.type === '从属').length} 从属
费用合计约：¥${feeTotal.total.toLocaleString()}
交接状态：${handoff}
`
    }
    return `【权利要求草稿】
${claims.map((cl, i) => {
  const head = cl.type === '独立' ? `${i + 1}.（独立）` : `${i + 1}.（从属，引用${cl.dependsOn ?? '?'}）`
  return `${head}\n${cl.text}`
}).join('\n\n')}

—— 说明书要点 ——
技术领域：${field}
背景技术：${background}
发明内容：${invention}
实施例：${embodiment}
`
  }, [panel, c, caseId, countries, pct, priority, claims, feeTotal, field, background, invention, embodiment, handoff])

  useEffect(() => setDraft(assembled), [assembled])
  const showToast = (msg: string, err = false, next?: { label: string; to: string }[]) => {
    setToast(msg)
    setToastErr(err)
    setToastNext(err ? undefined : next)
    setTimeout(() => { setToast(null); setToastNext(undefined) }, err ? 2800 : 8000)
  }

  const progressStep = useMemo(() => {
    const filingOk = Object.values(filingCheck).every(Boolean)
    if (filingOk && claimsValid && disclosureApproved) return 3
    if (countries.length > 0) return 2
    if (claims.some((cl) => cl.text.trim())) return 1
    if (field.trim() || invention.trim()) return 0
    return 0
  }, [filingCheck, claimsValid, disclosureApproved, countries.length, claims, field, invention])
  const stepperCurrent = Math.max(step, progressStep, storedStepIndex)

  useEffect(() => {
    syncProgressFloor(progressStep)
  }, [progressStep, syncProgressFloor])


  return (
    <div className="px-5 py-5 lg:px-8 lg:py-6">
      <ToastBanner message={toast} error={toastErr} nextActions={toastNext} />
      <FlowHeader title="撰写申请" subtitle={role === 'enterprise' ? '确认交底、国别策略与费用' : '交底、权利要求布局与申请文件'} caseData={c} />
      <div className="mb-4"><CasePicker stage="drafting" selectedId={caseId} onChange={(id) => { setCaseId(id); navigate(id ? `/workbench/draft/${id}` : '/workbench/draft', { replace: true }) }} /></div>
      <Stepper steps={STEPS} current={stepperCurrent} />
      <SplitDraft
        rightTitle={panel === 'claims' ? '权利要求草稿' : '申请清单'}
        right={<>
          <div className="segmented mb-3 w-full" role="tablist" aria-label="草稿面板">
            <button type="button" role="tab" className="segmented-item btn-press focus-ring flex-1" aria-selected={panel === 'claims'} onClick={() => setPanel('claims')}>权利要求</button>
            <button type="button" role="tab" className="segmented-item btn-press focus-ring flex-1" aria-selected={panel === 'checklist'} onClick={() => setPanel('checklist')}>申请清单</button>
          </div>
          <textarea className={draftAreaCls} value={draft} onChange={(e) => setDraft(e.target.value)} />
        </>}
        left={<>
          <WbSection title="交底书结构化编辑">
              <div
                className={`wb-tip mb-1 text-xs ${
                  disclosureApproved ? 'wb-tip-success' : 'wb-tip-error'
                }`}
              >
                <div className="flex flex-wrap items-center gap-2 font-medium">
                  {disclosureApproved ? '交底已批准' : '交底未批准（红灯）'}
                  <span className="font-normal text-[11px]">
                    {HANDOFF_ARTIFACT_LABELS.disclosure_pack} ·{' '}
                    {disclosureStatus
                      ? HANDOFF_LABELS[disclosureStatus]
                      : '无 pack'}
                  </span>
                </div>
                <ul className="mt-1 space-y-0.5 text-[11px]">
                  <li>类型：{c?.type ?? '发明'}</li>
                  <li>
                    齐套勾选：
                    {Object.values(disclosureCheck).filter(Boolean).length}/
                    {DISCLOSURE_PACK_CHECK_ITEMS.length}
                  </li>
                  <li>note：{disclosureState?.note ?? '—'}</li>
                </ul>
                <div className="mt-2 flex flex-wrap gap-2">
                  <button
                    type="button"
                    className={`${btnGhost} !px-2 !py-1 text-xs`}
                    disabled={!disclosureApproved}
                    onClick={applyApprovedPack}
                  >
                    一键填入已批准 pack 摘要
                  </button>
                  {!disclosureApproved && (
                    <span className="text-[11px] text-rose-700">
                      只读引入需先批准交底包
                    </span>
                  )}
                </div>
              </div>
              <WbField label="技术领域" required><input className={inputCls} value={field} onChange={(e) => { setField(e.target.value); setStep(0) }} /></WbField>
              <WbField label="背景技术"><textarea className={textareaCls} value={background} onChange={(e) => setBackground(e.target.value)} /></WbField>
              <WbField label="发明内容" required><textarea className={textareaCls} value={invention} onChange={(e) => setInvention(e.target.value)} /></WbField>
              <WbField label="实施例"><textarea className={textareaCls} value={embodiment} onChange={(e) => setEmbodiment(e.target.value)} /></WbField>
          </WbSection>
          <WbSection
            title="权利要求树"
            action={
              <div className="flex gap-2">
                <button type="button" className="ui-btn ui-btn-secondary ui-btn-sm focus-ring" onClick={() => { setClaims((p) => [...p, { id: `cl-${Date.now()}`, type: '独立', text: '一种…，其特征在于，…' }]); setStep(1) }}><Plus className="h-3 w-3" aria-hidden /> 独立</button>
                <button type="button" className="ui-btn ui-btn-secondary ui-btn-sm focus-ring" onClick={() => { setClaims((p) => [...p, { id: `cl-${Date.now()}`, type: '从属', text: '根据上述权利要求所述的…', dependsOn: '1' }]); setStep(1) }}><Plus className="h-3 w-3" aria-hidden /> 从属</button>
              </div>
            }
          >
            {claimErrorList.length > 0 && (
              <WbError>
                权利要求实时校验 · {claimErrorList.length} 项问题
                {claimErrorList.map((msg, i) => (
                  <span key={i} className="mt-1 block">· {msg}</span>
                ))}
              </WbError>
            )}
            {claimsValid && claims.length > 0 && (
              <WbTip tone="success">权利要求校验通过：独立/从属结构有效</WbTip>
            )}
            <ul className="space-y-3">
              {claims.map((cl, idx) => (
                <li key={cl.id} className={`wb-inset p-3 ${claimErrors[cl.id] ? '!border-rose-200 !bg-rose-50/40' : '!bg-white'}`}>
                  <div className="mb-2 flex items-center justify-between gap-2">
                    <div className="flex items-center gap-2">
                      <span className="text-xs text-slate-500">#{idx + 1}</span>
                      <span className={`rounded px-1.5 py-0.5 text-xs ${cl.type === '独立' ? 'bg-slate-100 text-slate-800' : 'bg-slate-100 text-slate-600'}`}>{cl.type}</span>
                      {cl.type === '从属' && (
                        <label className="inline-flex items-center gap-1 text-xs text-slate-500">
                          引用
                          <input
                            name={`dependsOn-${cl.id}`}
                            autoComplete="off"
                            spellCheck={false}
                            className="ui-input ui-input-sm focus-ring w-16"
                            value={cl.dependsOn ?? ''}
                            onChange={(e) => setClaims((prev) => prev.map((x) => x.id === cl.id ? { ...x, dependsOn: e.target.value } : x))}
                            aria-label={`权利要求 ${idx + 1} 引用号`}
                          />
                        </label>
                      )}
                    </div>
                    <button
                      type="button"
                      onClick={() => setClaims((p) => p.filter((x) => x.id !== cl.id))}
                      className="icon-btn rounded-lg p-1 text-slate-400 hover:bg-rose-50 hover:text-rose-600 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-rose-400"
                      aria-label={`删除权利要求 ${idx + 1}`}
                    >
                      <Trash2 className="h-3.5 w-3.5" aria-hidden />
                    </button>
                  </div>
                  <textarea
                    name={`claim-${cl.id}`}
                    autoComplete="off"
                    spellCheck={false}
                    className={textareaCls + ' min-h-[72px]'}
                    value={cl.text}
                    onChange={(e) => { setClaims((prev) => prev.map((x) => x.id === cl.id ? { ...x, text: e.target.value } : x)); setStep(1) }}
                  />
                  {claimErrors[cl.id] && (
                    <p className="mt-1 text-xs text-rose-600">{claimErrors[cl.id]}</p>
                  )}
                </li>
              ))}
            </ul>
          </WbSection>
          <WbSection title="申请策略向导">
            <Field label="国别选择">
              <div className="mt-1 flex flex-wrap gap-2">
                {COUNTRIES.map((co) => (
                  <WbChip
                    key={co.code}
                    active={countries.includes(co.code)}
                    onClick={() => { setCountries((prev) => prev.includes(co.code) ? prev.filter((x) => x !== co.code) : [...prev, co.code]); setStep(2) }}
                  >
                    {co.name} · ≈¥{co.fee.toLocaleString()}
                  </WbChip>
                ))}
              </div>
            </Field>
            <WbCheckRow checked={pct} onChange={(e) => setPct((e.target as HTMLInputElement).checked)}>
              同时走 PCT 途径
            </WbCheckRow>
            <Field label="优先权说明"><input className={inputCls} value={priority} onChange={(e) => setPriority(e.target.value)} /></Field>
            <WbInset className="text-xs text-slate-600">
              <div className="flex justify-between border-b border-slate-200/70 pb-2 tabular">
                <span>官费估算（mock）</span>
                <span>¥{feeTotal.base.toLocaleString()}{pct ? ` + PCT ¥${feeTotal.pctFee.toLocaleString()}` : ''}</span>
              </div>
              {feeTotal.agency > 0 && (
                <div className="flex justify-between border-b border-slate-200/70 py-2 tabular">
                  <span>代理撰写费（示意）</span>
                  <span>¥{feeTotal.agency.toLocaleString()}</span>
                </div>
              )}
              <div className="flex justify-between pt-2 tabular">
                <span>合计约</span>
                <span className="font-medium text-slate-800">¥{feeTotal.total.toLocaleString()}</span>
              </div>
            </WbInset>
          </WbSection>
          <WbSection
            title="递交检查清单"
            action={
              <span className={`rounded-full px-2.5 py-0.5 text-xs font-medium tabular ${
                Object.values(filingCheck).every(Boolean)
                  ? 'bg-emerald-50 text-emerald-700 ring-1 ring-emerald-200'
                  : 'bg-slate-100 text-slate-600 ring-1 ring-slate-200'
              }`}>
                {Object.values(filingCheck).filter(Boolean).length}/5
              </span>
            }
          >
            <p className="text-xs text-slate-500">提交 / 授权递交前须勾选齐套；未完成将禁用主操作</p>
            <div className="h-1.5 overflow-hidden rounded-full bg-slate-100">
              <div
                className="motion-progress h-full rounded-full bg-slate-700"
                style={{ width: `${(Object.values(filingCheck).filter(Boolean).length / 5) * 100}%` }}
              />
            </div>
            <ul className="space-y-2">
              {DRAFT_FILING_CHECK_ITEMS.map(({ id: k, label }) => (
                <li key={k}>
                  <WbCheckRow
                    name={`filing-${k}`}
                    checked={filingCheck[k]}
                    onChange={() => toggleDraftFilingCheck(caseId, k)}
                  >
                    {label}
                  </WbCheckRow>
                </li>
              ))}
            </ul>
          </WbSection>
          <WbSection title="Full-check（授权/递交前）">
            <p className="text-xs text-slate-500">对齐 Agent ConfirmBar · evaluateFullCheck</p>
            <ul className="space-y-2">
              {FULL_CHECK_LITE_ITEMS.map(({ id, label }) => (
                <li key={id}>
                  <WbCheckRow
                    checked={!!fullLite[id]}
                    onChange={() => toggleFullCheckLite(caseId, id)}
                  >
                    {label}
                  </WbCheckRow>
                </li>
              ))}
            </ul>
            {!fullCheckResult.ok && (
              <WbTip tone="error" role="alert">缺口：{fullCheckResult.missing.join('；')}</WbTip>
            )}
          </WbSection>
          <VersionPanel caseId={caseId} handoffKey="draft_claims" />
          <WbSection title="交接确认">
            <HandoffActionBar
              caseId={caseId}
              handoffKey="draft_claims"
              showFile
              blockPrimary={
                !claimsValid ||
                !Object.values(filingCheck).every(Boolean) ||
                !disclosureApproved
              }
              inlineError={
                !claimsValid
                  ? `权利要求校验未通过（${claimErrorList.length} 项）：请先修复下方错误`
                  : firstGuardrailMessage(
                      evaluateGuardrails({
                        agent: getAgent('agent-claims'),
                        case: c ?? null,
                        action: 'authorize',
                        persona,
                        role,
                        isEnterprise: role === 'enterprise',
                        handoffKey: 'draft_claims',
                        disclosureStatus,
                        filingCheck,
                        fullCheckLite: fullLite,
                      }),
                    )
              }
              checkedRequired={[
                ...(claims.some((c) => c.type === '独立' && c.text.trim()) ? ['claims'] : []),
                ...(countries.length > 0 ? ['countries'] : []),
                ...(Object.values(filingCheck).every(Boolean) ? ['filing'] : []),
              ]}
              validateBefore={(a) => {
                if (a !== 'submit' && a !== 'authorize' && a !== 'file') return null
                // 表单本地校验（非 Agent 护栏）
                if (!claimsValid) return '请先修复权利要求校验错误'
                if (!claims.some((cl) => cl.type === '独立' && cl.text.trim())) return '至少 1 项独立权利要求'
                if (!invention.trim()) return '请填写发明内容'
                // disclosure / filing / Full-check · 与 ConfirmBar 同源【唯一入口】
                const gr = evaluateGuardrails({
                  agent: getAgent('agent-claims'),
                  case: c ?? null,
                  action: a,
                  persona,
                  role,
                  isEnterprise: role === 'enterprise',
                  handoffKey: 'draft_claims',
                  disclosureStatus,
                  filingCheck,
                  fullCheckLite: fullLite,
                })
                const msg = firstGuardrailMessage(gr)
                if (msg) return msg
                return null
              }}
              onResult={(msg, err) => {
                if (!err) {
                  markChecklistDone(caseId, ['c1', 'c2'])
                  if (msg.includes('提交')) {
                    addArtifact(caseId, '权利要求_提交企业确认.docx', '申请文件')
                    setStep(3)
                    const indep = claims.filter((cl) => cl.type === '独立' && cl.text.trim()).length
                    // 与 Agent HITL approval 摘要口径对齐：独权 N · 国别 …
                    appendCaseDriveItem(caseId, {
                      kind: 'approval',
                      title: '权利要求已提交',
                      summary: `独权 ${indep} · 国别 ${countries.join('/') || '—'}`,
                      source: 'draft-submit',
                    })
                  }
                  if (msg.includes('草稿')) addArtifact(caseId, '权利要求草稿.docx', '申请文件')
                  if (msg.includes('批准') || msg.includes('确认')) {
                    addActivity(`「${c?.title}」企业已确认撰写策略`)
                    const indep = claims.filter((cl) => cl.type === '独立' && cl.text.trim()).length
                    appendCaseDriveItem(caseId, {
                      kind: 'approval',
                      title: '权利要求策略批准',
                      summary: `独权 ${indep} · 国别 ${countries.join('/') || '—'}`,
                      source: 'draft-handoff',
                    })
                  }
                  if (msg.includes('提交') || msg.includes('递交') || msg.includes('归档')) {
                    if (Object.values(filingCheck).every(Boolean)) {
                      appendDraftInvoice(caseId, {
                        title: '撰写申请 · 递交齐套费用',
                        amount: c?.engagement.quoteBudget || '¥28,000',
                        relatedStage: '撰写申请',
                      })
                    }
                  }
                }
                const next =
                    !err && (msg.includes('提交') || msg.includes('批准') || msg.includes('授权') || msg.includes('递交'))
                      ? nextActionsForStage('drafting', caseId)
                      : undefined
                  showToast(msg, err, next)
              }}
              extra={
                <button type="button" className={btnPrimary} onClick={() => { setPanel((p) => p === 'claims' ? 'checklist' : 'claims'); setStep(3); showToast('已切换草稿面板') }}>
                  <FileOutput className="h-4 w-4" /> 生成/切换清单
                </button>
              }
            />
          </WbSection>
        </>}
      />
    </div>
  )
}
