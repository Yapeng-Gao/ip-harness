import { useEffect, useMemo, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { AppLink } from '../../components/AppLink'
import { Plus, Trash2 } from 'lucide-react'
import { useApp } from '../../context/AppContext'
import { usePersistedFlowStep } from '../../hooks/usePersistedFlowStep'
import { stepsForFlow } from '../../data/flowSteps'
import {
  evaluateGuardrails,
  evaluatePayUnlock,
  firstGuardrailMessage,
} from '../../domain/guardrails'
import { getAgent } from '../../data/agents'
import { maintainSeed } from '../../data/workbenchSeeds'
import {
  CasePicker,
  FlowHeader,
  HandoffActionBar,
  SplitDraft,
  Stepper,
  ToastBanner,
  DeadlineChip,
  nextActionsForStage,
  btnGhost,
  inputCls,
  textareaCls,
} from '../../components/workbench/FlowChrome'
import { VersionPanel } from '../../components/workbench/VersionPanel'
import { WbSection, WbField } from '../../components/workbench/FormBlocks'
import { generateAnnuitySchedule } from '../../data/docketRules'
import {
  normalizeMaintainRow,
  type MaintainScheduleRow,
} from '../../utils/slaInbox'

const STEPS = stepsForFlow('maintain')

const defaultSeed = maintainSeed.c6

export function MaintainFlow() {
  const { caseId: paramId } = useParams()
  const navigate = useNavigate()
  const {
    getCase,
    role,
    persona,
    addActivity,
    addArtifact,
    markChecklistDone,
    updateEngagement,
    dispatchCommand,
    appendCaseDriveItem,
    getHandoff,
    getMaintainSchedule,
    upsertMaintainSchedule,
  } = useApp()
  const [caseId, setCaseId] = useState(paramId ?? 'c6')
  const { step, setStep, syncProgressFloor, storedStepIndex } = usePersistedFlowStep(caseId, 'maintain')
  const [toast, setToast] = useState<string | null>(null)
  const [toastErr, setToastErr] = useState(false)
  const [toastNext, setToastNext] = useState<{ label: string; to: string }[] | undefined>()
  const seed = maintainSeed[caseId as keyof typeof maintainSeed] ?? defaultSeed

  const [status, setStatus] = useState(seed.status)
  const [grantDate, setGrantDate] = useState(seed.grantDate)
  const [nextAnnuity, setNextAnnuity] = useState(seed.nextAnnuity)
  const [annuityYear, setAnnuityYear] = useState(seed.annuityYear)
  const [amount, setAmount] = useState(seed.amount)
  const fallbackSchedule = (): MaintainScheduleRow[] => {
    const stored = getMaintainSchedule(caseId)
    if (stored.length) return stored.map((r, i) => normalizeMaintainRow(r, i))
    const rows = seed.schedule
    if (rows?.length) return rows.map((r, i) => normalizeMaintainRow(r, i))
    return [
      normalizeMaintainRow({ year: 1, due: '2026-03-01', amount: '900 元', paid: true, officialFee: 900 }, 0),
      normalizeMaintainRow({ year: 2, due: '2027-03-01', amount: '900 元', paid: false, officialFee: 900 }, 1),
      normalizeMaintainRow({ year: 3, due: '2028-03-01', amount: '1200 元', paid: false, officialFee: 1200 }, 2),
    ]
  }
  const [schedule, setSchedule] = useState<MaintainScheduleRow[]>(fallbackSchedule)
  const [changes, setChanges] = useState(
    seed.changes?.length
      ? seed.changes.map((ch) => ({ ...ch }))
      : [{ id: 'ch1', type: '', date: '', detail: '' }],
  )
  const [agencyFee, setAgencyFee] = useState(800)
  const [budgetConfirmed, setBudgetConfirmed] = useState(false)
  const [valueTier, setValueTier] = useState<'' | 'high' | 'watch' | 'low'>('')
  const [draft, setDraft] = useState('')

  const c = getCase(caseId)
  const handoff = getHandoff(caseId, 'maintain_annuity')

  useEffect(() => {
    if (paramId && paramId !== caseId) setCaseId(paramId)
  }, [paramId])

  useEffect(() => {
    const s = maintainSeed[caseId as keyof typeof maintainSeed] ?? defaultSeed
    setStatus(s.status)
    setGrantDate(s.grantDate)
    setNextAnnuity(s.nextAnnuity)
    setAnnuityYear(s.annuityYear)
    setAmount(s.amount)
    setChanges(
      s.changes?.length
        ? s.changes.map((ch) => ({ ...ch }))
        : [{ id: 'ch1', type: '', date: '', detail: '' }],
    )
    const stored = getMaintainSchedule(caseId)
    if (stored.length) {
      setSchedule(stored.map((r, i) => normalizeMaintainRow(r, i)))
    } else if (s.schedule?.length) {
      const next = s.schedule.map((r, i) => normalizeMaintainRow(r, i))
      setSchedule(next)
      upsertMaintainSchedule(caseId, next)
    }
    setBudgetConfirmed(false)
    setValueTier('')
    // step 由 usePersistedFlowStep 按案水合
  }, [caseId])

  const feeEstimate = useMemo(() => {
    const next = schedule.find((s) => !s.paid)
    const official = next?.officialFee ?? 0
    return { official, agency: agencyFee, total: official + agencyFee, year: next?.year }
  }, [schedule, agencyFee])

  const scheduleReady =
    schedule.length > 0 && schedule.every((row) => !!row.due && !!row.amount)
  const budgetReady = budgetConfirmed && feeEstimate.official >= 0 && agencyFee >= 0 && !!nextAnnuity

  const payableInvoices = useMemo(() => {
    const invs = c?.engagement?.invoices ?? []
    return invs.filter((i) => i.status === '逾期' || i.status === '已开票' || i.status === '待开票')
  }, [c?.engagement?.invoices])

  const assembled = useMemo(
    () => `【授权维持案卷摘要】
案件：${c?.title ?? caseId}
权利状态：${status}
授权日：${grantDate}
下次年费：第 ${annuityYear} 年 · ${nextAnnuity} · ${amount}

年费日程：
${schedule.map((s) => `- 第${s.year}年 ${s.due} ${s.amount} ${s.paid ? '已缴' : '待缴'}`).join('\n')}

官费估算（下次）：¥${feeEstimate.official} + 代缴服务 ¥${feeEstimate.agency} ≈ ¥${feeEstimate.total}
费用确认：${budgetConfirmed ? '已确认' : '未确认'}
价值分层：${
  valueTier === 'high'
    ? '高价值（优先按期缴纳）'
    : valueTier === 'watch'
      ? '观察（评估放弃窗口）'
      : valueTier === 'low'
        ? '低价值（可拟放弃并记备注）'
        : '未分层'
}

变更事项：
${changes
  .filter((ch) => ch.type)
  .map((ch) => `- ${ch.date || '待定'} ${ch.type}：${ch.detail || '—'}`)
  .join('\n') || '（暂无）'}

${role === 'enterprise' ? '企业：确认年费预算与变更审批。' : '代理所：维护年费日程并办理变更手续。'}
`,
    [c, caseId, status, grantDate, annuityYear, nextAnnuity, amount, schedule, changes, role, feeEstimate, budgetConfirmed, valueTier],
  )

  useEffect(() => setDraft(assembled), [assembled])

  const showToast = (msg: string, err = false, next?: { label: string; to: string }[]) => {
    setToast(msg)
    setToastErr(err)
    setToastNext(err ? undefined : next)
    setTimeout(() => { setToast(null); setToastNext(undefined) }, err ? 2800 : 8000)
  }
  const successNext = () => nextActionsForStage('maintenance', caseId)

  const commitSchedule = (next: MaintainScheduleRow[]) => {
    const rows = next.map((r, i) => normalizeMaintainRow(r, i))
    setSchedule(rows)
    upsertMaintainSchedule(caseId, rows)
  }

  const progressStep = useMemo(() => {
    if (['approved', 'authorized_to_file', 'filed', 'submitted_to_enterprise', 'enterprise_review'].includes(handoff)) return 3
    if (changes.some((ch) => ch.type?.trim() || ch.detail?.trim())) return 2
    if (schedule.length > 0 || budgetConfirmed) return 1
    if (status) return 0
    return 0
  }, [handoff, changes, schedule.length, budgetConfirmed, status])
  const stepperCurrent = Math.max(step, progressStep, storedStepIndex)

  useEffect(() => {
    syncProgressFloor(progressStep)
  }, [progressStep, syncProgressFloor])


  return (
    <div className="p-6 lg:p-8">
      <ToastBanner message={toast} error={toastErr} nextActions={toastNext} />
      <FlowHeader
        title="授权维持"
        subtitle="权利状态、年费日程与变更事项"
        caseData={c}
      />
      <div className="mb-4 flex flex-wrap items-center gap-3">
        <CasePicker
          stage="maintenance"
          selectedId={caseId}
          onChange={(id) => {
            setCaseId(id)
            navigate(id ? `/workbench/maintain/${id}` : '/workbench/maintain', { replace: true })
          }}
        />
        <DeadlineChip deadline={nextAnnuity} />
      </div>
      <Stepper steps={STEPS} current={stepperCurrent} />
      <SplitDraft
        rightTitle="维持案卷摘要"
        right={
          <textarea
            className={`${textareaCls} min-h-[360px] font-mono text-xs`}
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
          />
        }
        left={
          <>
            <WbSection title="权利状态卡片">
              <div className="grid gap-3 sm:grid-cols-2">
                <WbField label="状态">
                  <select className={inputCls} value={status} onChange={(e) => { setStatus(e.target.value); setStep(0) }}>
                    <option>有效</option>
                    <option>年费待缴</option>
                    <option>权利恢复中</option>
                    <option>终止</option>
                  </select>
                </WbField>
                <WbField label="授权日">
                  <input type="date" className={inputCls} value={grantDate} onChange={(e) => setGrantDate(e.target.value)} />
                </WbField>
                <WbField label="下次年费日">
                  <input type="date" className={inputCls} value={nextAnnuity} onChange={(e) => setNextAnnuity(e.target.value)} />
                </WbField>
                <WbField label="年费年度 / 金额">
                  <div className="flex gap-2">
                    <input
                      type="number"
                      className={inputCls}
                      value={annuityYear}
                      onChange={(e) => setAnnuityYear(Number(e.target.value))}
                    />
                    <input className={inputCls} value={amount} onChange={(e) => setAmount(e.target.value)} />
                  </div>
                </WbField>
              </div>
            </WbSection>

            <WbSection title="年费日程表">
              <div className="overflow-x-auto rounded-[calc(var(--radius-lg)-0.5rem)] border border-[rgba(60,60,67,0.08)]">
              <table className="ui-table ui-table--compact">
                <thead>
                  <tr>
                    <th>年度</th>
                    <th>到期日</th>
                    <th>金额</th>
                    <th>状态</th>
                  </tr>
                </thead>
                <tbody>
                  {schedule.map((row, i) => (
                    <tr key={row.id || `${row.year}-${i}`}>
                      <td className="tabular whitespace-nowrap">第{row.year}年</td>
                      <td>
                        <input
                          type="date"
                          value={row.due}
                          onChange={(e) => {
                            commitSchedule(
                              schedule.map((r, idx) => (idx === i ? { ...r, due: e.target.value } : r)),
                            )
                            setStep(1)
                          }}
                          aria-label={`第${row.year}年到期日`}
                        />
                      </td>
                      <td>
                        <input
                          className="w-24"
                          value={row.amount}
                          onChange={(e) =>
                            commitSchedule(
                              schedule.map((r, idx) => (idx === i ? { ...r, amount: e.target.value } : r)),
                            )
                          }
                          aria-label={`第${row.year}年金额`}
                        />
                      </td>
                      <td>
                        <label className="flex items-center gap-1.5 text-[var(--font-size-caption)] text-slate-700">
                          <input
                            type="checkbox"
                            checked={row.paid}
                            onChange={() =>
                              commitSchedule(
                                schedule.map((r, idx) => (idx === i ? { ...r, paid: !r.paid } : r)),
                              )
                            }
                            className="accent-slate-700"
                          />
                          {row.paid ? '已缴' : '待缴'}
                        </label>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              </div>
              <div className="mb-3 flex flex-wrap gap-2">
                <button
                  type="button"
                  className={btnGhost + ' !px-3 !py-1.5 text-xs'}
                  onClick={() => {
                    const rows = generateAnnuitySchedule(grantDate || nextAnnuity || '2026-03-01', 5, annuityYear || 1).map(
                      (r, i) => normalizeMaintainRow(r, i),
                    )
                    commitSchedule(rows)
                    if (rows[0]) {
                      setNextAnnuity(rows[0].due)
                      setAmount(rows[0].amount)
                    }
                    setBudgetConfirmed(false)
                    setStep(1)
                    showToast('已按 mock 年费规则生成未来 5 年日程')
                    addActivity(`「${c?.title}」已生成未来 5 年年费日程`)
                  }}
                >
                  按规则生成未来5年年费
                </button>
                <button
                  type="button"
                  className={btnGhost + ' !px-3 !py-1.5 text-xs'}
                  disabled={payableInvoices.length === 0}
                  title={
                    payableInvoices.length === 0
                      ? '须走发票付款解锁，不可直接改付款状态为已结清'
                      : '请在下方「付款解锁」逐票结清'
                  }
                  onClick={() => {
                    showToast(
                      '确认缴纳须走发票「付款解锁 / payInvoice」，不可直接将付款状态改为已结清',
                      true,
                    )
                  }}
                >
                  确认缴纳（须走发票）
                </button>
              </div>
              <div className="mb-3 rounded-lg border border-amber-200 bg-amber-50/80 px-3 py-2 text-[11px] leading-snug text-amber-950">
                <div className="font-medium text-amber-900">维持价值分层</div>
                <p className="mt-1 text-amber-800/90">选择分层并写入 Drive / 委托备注（非法律意见 · 不自动放弃权利）</p>
                <div className="mt-2 flex flex-wrap gap-2">
                  {(
                    [
                      { id: 'high', label: '高价值 · 优先缴纳' },
                      { id: 'watch', label: '观察 · 评估窗口' },
                      { id: 'low', label: '低价值 · 拟放弃备注' },
                    ] as const
                  ).map((opt) => (
                    <button
                      key={opt.id}
                      type="button"
                      className={`rounded-full px-2.5 py-1 text-[11px] font-medium ring-1 ${
                        valueTier === opt.id
                          ? 'bg-amber-100 text-amber-950 ring-amber-300'
                          : 'bg-white text-amber-900/80 ring-amber-200 hover:bg-amber-50'
                      }`}
                      onClick={() => {
                        setValueTier(opt.id)
                        const label =
                          opt.id === 'high'
                            ? '高价值（优先按期缴纳）'
                            : opt.id === 'watch'
                              ? '观察（评估放弃窗口）'
                              : '低价值（拟放弃备注）'
                        const note = `价值分层：${label} · ${new Date().toISOString().slice(0, 10)}`
                        updateEngagement(caseId, {
                          feeNotes: note,
                        })
                        appendCaseDriveItem(caseId, {
                          kind: 'other',
                          title: '维持价值分层',
                          summary: note,
                          source: 'maintain-value-tier',
                        })
                        addActivity(`「${c?.title}」${note}`)
                        showToast(`已写入价值分层：${label}`)
                        setStep(1)
                      }}
                    >
                      {opt.label}
                    </button>
                  ))}
                </div>
                {valueTier && (
                  <p className="mt-1.5 text-[11px] font-medium text-amber-950">
                    当前：
                    {valueTier === 'high'
                      ? '高价值'
                      : valueTier === 'watch'
                        ? '观察'
                        : '低价值'}
                    （已写回 feeNotes + Drive）
                  </p>
                )}
              </div>
              <div className="rounded-lg border border-slate-200 bg-slate-50 p-3 text-xs text-slate-700">
                <div className="mb-2 font-medium text-slate-800">官费估算（mock）</div>
                <div className="flex flex-wrap gap-4">
                  <span>下次第 {feeEstimate.year ?? '—'} 年官费 ≈ ¥{feeEstimate.official}</span>
                  <label className="inline-flex items-center gap-1">
                    代缴服务费
                    <input
                      type="number"
                      className="w-20 rounded border border-slate-200 bg-white px-2 py-0.5"
                      value={agencyFee}
                      onChange={(e) => {
                        setAgencyFee(Number(e.target.value) || 0)
                        setBudgetConfirmed(false)
                      }}
                    />
                  </label>
                  <span className="font-medium text-slate-800">合计 ≈ ¥{feeEstimate.total}</span>
                </div>
                <label className="mt-3 flex items-center gap-2 text-xs text-slate-700">
                  <input
                    type="checkbox"
                    className="accent-slate-700"
                    checked={budgetConfirmed}
                    onChange={(e) => {
                      setBudgetConfirmed(e.target.checked)
                      setStep(1)
                    }}
                  />
                  已确认官费与代缴服务费
                </label>
              </div>
            </WbSection>

            <WbSection
              title="变更事项"
              action={
                <button
                  type="button"
                  className={btnGhost + ' !px-2 !py-1 text-xs'}
                  onClick={() => {
                    setChanges((prev) => [
                      ...prev,
                      { id: `ch-${Date.now()}`, type: '', date: '', detail: '' },
                    ])
                    setStep(2)
                  }}
                >
                  <Plus className="h-3 w-3" /> 添加
                </button>
              }
            >
              <div className="space-y-3">
                {changes.map((ch) => (
                  <div key={ch.id} className="grid gap-2 rounded-lg border border-slate-200 p-3 sm:grid-cols-3">
                    <input
                      className={inputCls}
                      placeholder="变更类型"
                      value={ch.type}
                      onChange={(e) =>
                        setChanges((prev) =>
                          prev.map((x) => (x.id === ch.id ? { ...x, type: e.target.value } : x)),
                        )
                      }
                    />
                    <input
                      type="date"
                      className={inputCls}
                      value={ch.date}
                      onChange={(e) =>
                        setChanges((prev) =>
                          prev.map((x) => (x.id === ch.id ? { ...x, date: e.target.value } : x)),
                        )
                      }
                    />
                    <div className="flex gap-2">
                      <input
                        className={inputCls}
                        placeholder="详情"
                        value={ch.detail}
                        onChange={(e) =>
                          setChanges((prev) =>
                            prev.map((x) => (x.id === ch.id ? { ...x, detail: e.target.value } : x)),
                          )
                        }
                      />
                      <button
                        type="button"
                        className="focus-ring rounded text-slate-500 hover:text-rose-600"
                        aria-label="删除变更事项"
                        onClick={() => setChanges((prev) => prev.filter((x) => x.id !== ch.id))}
                      >
                        <Trash2 className="h-4 w-4" aria-hidden />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </WbSection>

            <WbSection title="付款解锁">
              <p className="mb-2 text-xs text-slate-500">
                与 知产 Agent 年费 Agent 的「付款解锁 / payInvoice」同一命令；结清后方可正常递交归档。
              </p>
              {payableInvoices.length === 0 ? (
                <div
                  className="rounded-lg border border-dashed border-slate-200 bg-slate-50 px-3 py-3 text-xs text-slate-600"
                  role="status"
                >
                  本案暂无待付发票。
                  <AppLink
                    to="/billing/cases?tab=ledger"
                    className="ml-1 font-medium text-slate-800 underline"
                  >
                    前往费用中心开票/入账
                  </AppLink>
                  后再回来解锁，或继续下方交接（无票时无法演示付款闸）。
                </div>
              ) : (
                <ul className="space-y-2">
                  {payableInvoices.map((inv) => (
                    <li
                      key={inv.id}
                      className="flex flex-wrap items-center justify-between gap-2 rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs"
                    >
                      <span className="min-w-0">
                        <span className="font-medium text-slate-800">{inv.title}</span>
                        <span className="ml-2 text-slate-500">
                          {inv.amount} · {inv.status}
                          {inv.due ? ` · 到期 ${inv.due}` : ''}
                        </span>
                      </span>
                      {(() => {
                        const payGr = evaluatePayUnlock({
                          case: c ?? null,
                          persona,
                          role,
                          isEnterprise: role === 'enterprise',
                          handoffStatus: getHandoff(caseId, 'maintain_annuity'),
                        })
                        const payBlocked = !payGr.ok
                        const payReason = firstGuardrailMessage(payGr)
                        return (
                          <span className="inline-flex flex-col items-end gap-0.5">
                            <button
                              type="button"
                              disabled={payBlocked}
                              title={payBlocked ? (payReason ?? '不可付款解锁') : undefined}
                              className={btnGhost + ' !px-2.5 !py-1 text-xs disabled:cursor-not-allowed disabled:opacity-50'}
                              onClick={() => {
                                void (async () => {
                                  const r = await dispatchCommand(
                                    { type: 'payInvoice', caseId, invoiceId: inv.id },
                                    { actor: 'user' },
                                  )
                                  showToast(
                                    r.ok
                                      ? `付款解锁成功 · ${inv.title}（PayInvoice）`
                                      : r.message,
                                    !r.ok,
                                    r.ok ? successNext() : undefined,
                                  )
                                  if (r.ok) {
                                    addActivity(`「${c?.title}」付款解锁 → ${inv.title}`)
                                  }
                                })()
                              }}
                            >
                              付款解锁
                            </button>
                            {payBlocked && payReason ? (
                              <span className="max-w-[14rem] text-right text-[10px] leading-snug text-slate-500">
                                {payReason}
                              </span>
                            ) : null}
                          </span>
                        )
                      })()}
                    </li>
                  ))}
                </ul>
              )}
            </WbSection>

            <VersionPanel caseId={caseId} handoffKey="maintain_annuity" />

            <WbSection title="审批交接">
              <p className="mb-2 text-xs text-slate-500">
                年费递交不走撰写/OA Full-check（术语/支持/非法律戳仅申请递交）。须日程与预算齐套。
              </p>
              <HandoffActionBar
                caseId={caseId}
                handoffKey="maintain_annuity"
                showFile
                checkedRequired={[
                  ...(scheduleReady ? ['schedule'] : []),
                  ...(budgetReady ? ['budget'] : []),
                ]}
                validateBefore={(a) => {
                  if (a === 'submit' || a === 'authorize' || a === 'file') {
                    if (!nextAnnuity) return '请填写下次年费日'
                    if (!scheduleReady) return '请完善年费日程（到期日与金额）'
                    if (a === 'submit' && !budgetReady) return '请确认官费与代缴服务费'
                    if ((a === 'authorize' || a === 'file') && !budgetReady) {
                      return '年费递交须确认官费与代缴服务费'
                    }
                  }
                  if (a === 'approve' || a === 'authorize' || a === 'file') {
                    const gr = evaluateGuardrails({
                      agent: getAgent('agent-annuity'),
                      case: c ?? null,
                      action: a,
                      persona,
                      role,
                      isEnterprise: role === 'enterprise',
                      handoffKey: 'maintain_annuity',
                      handoffStatus: getHandoff(caseId, 'maintain_annuity'),
                    })
                    const msg = firstGuardrailMessage(gr)
                    if (msg) return msg
                  }
                  return null
                }}
                onResult={(msg, err) => {
                  if (!err) {
                    markChecklistDone(caseId)
                    if (msg.includes('草稿') || msg.includes('提交') || msg.includes('批准')) {
                      addArtifact(caseId, '授权维持摘要.md', '维持')
                      addActivity(`「${c?.title}」${msg}`)
                      setStep(3)
                      // P1 薄：年费日程写入 Drive，全局可读（非第二套台账）
                      const schedSummary = schedule
                        .map((r) => `Y${r.year} ${r.due} ${r.amount}${r.paid ? '·已缴' : ''}`)
                        .join('；')
                      upsertMaintainSchedule(caseId, schedule.map((r, i) => normalizeMaintainRow(r, i)))
                      appendCaseDriveItem(caseId, {
                        kind: 'other',
                        title: '年费日程摘要',
                        summary: schedSummary.slice(0, 160) || `下次 ${nextAnnuity || '—'}`,
                        source: 'maintain-schedule',
                      })
                    }
                  }
                  showToast(msg, err, err ? undefined : successNext())
                }}
              />
            </WbSection>
          </>
        }
      />
    </div>
  )
}
