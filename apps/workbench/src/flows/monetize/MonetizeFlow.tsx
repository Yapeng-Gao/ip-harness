import { useEffect, useMemo, useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { AppLink } from '@shared/components/AppLink'
import { Plus, Trash2 } from 'lucide-react'
import { useApp } from '@shared/context/AppContext'
import { usePersistedFlowStep } from '@shared/hooks/usePersistedFlowStep'
import { stepsForFlow } from '@shared/data/flowSteps'
import {
  evaluateGuardrails,
  firstGuardrailMessage,
} from '@ip/domain'
import { getAgent } from '@shared/data/agents'
import type { MilestoneStatus } from '@ip/domain/types'
import { monetizeSeed } from '@shared/data/workbenchSeeds'
import {
  CasePicker, FlowHeader, HandoffActionBar, SplitDraft, Stepper,
  ToastBanner, nextActionsForStage, btnGhost, inputCls, draftAreaCls,
} from '../../components/FlowChrome'
import { VersionPanel } from '../../components/VersionPanel'
import { WbSection, WbField, WbChip } from '../../components/FormBlocks'

const PATHS = ['自行实施', '许可', '转让', '作价入股', '维权诉讼'] as const
const STEPS = stepsForFlow('monetize')

const MILESTONE_LABELS: Record<MilestoneStatus, string> = {
  pending: '待办',
  in_progress: '进行中',
  done: '完成',
  overdue: '逾期',
}

export function MonetizeFlow() {
  const { caseId: paramId } = useParams()
  const navigate = useNavigate()
  const { getCase, role, persona, addActivity, addArtifact, markChecklistDone, getHandoff, setLinkedAlert, setLegalReview } = useApp()
  const [caseId, setCaseId] = useState(paramId ?? 'c3')
  const { step, setStep, syncProgressFloor, storedStepIndex } = usePersistedFlowStep(caseId, 'monetize')
  const [toast, setToast] = useState<string | null>(null)
  const [toastErr, setToastErr] = useState(false)
  const [toastNext, setToastNext] = useState<{ label: string; to: string }[] | undefined>()

  const seed = monetizeSeed[caseId] ?? monetizeSeed.c3
  const [path, setPath] = useState<(typeof PATHS)[number]>(seed.path)
  const [counterpart, setCounterpart] = useState(seed.counterpart)
  const [territory, setTerritory] = useState(seed.territory)
  const [exclusivity, setExclusivity] = useState(seed.exclusivity)
  const [royalty, setRoyalty] = useState(seed.royalty)
  const [termYears, setTermYears] = useState(seed.termYears)
  const [paymentSchedule, setPaymentSchedule] = useState(seed.paymentSchedule)
  const [fieldLimit, setFieldLimit] = useState(seed.fieldLimit)
  const [milestones, setMilestones] = useState(
    seed.milestones.map((m) => ({
      ...m,
      status: (m.done ? 'done' : 'pending') as MilestoneStatus,
    })),
  )
  const [alertPick, setAlertPick] = useState('')
  const [draft, setDraft] = useState('')
  const c = getCase(caseId)
  const handoff = getHandoff(caseId, 'monetize_terms')
  const isLitigation = path === '维权诉讼'

  useEffect(() => {
    const s = monetizeSeed[caseId] ?? monetizeSeed.c3
    setPath(s.path); setCounterpart(s.counterpart); setTerritory(s.territory)
    setExclusivity(s.exclusivity); setRoyalty(s.royalty); setTermYears(s.termYears)
    setPaymentSchedule(s.paymentSchedule); setFieldLimit(s.fieldLimit)
    setMilestones(s.milestones.map((m) => ({ ...m, status: (m.done ? 'done' : 'pending') as MilestoneStatus }))); setAlertPick('')
    // step 由 usePersistedFlowStep 按案水合
  }, [caseId])

  useEffect(() => { if (paramId && paramId !== caseId) setCaseId(paramId) }, [paramId])

  const assembled = useMemo(() => `【成果转化摘要】
案件：${c?.title ?? caseId}（${c?.caseNo ?? ''}）
转化路径：${path}
交易对手：${counterpart}
地域范围：${territory}
领域限制：${fieldLimit}
排他性：${exclusivity}
对价/分成：${royalty}
期限：${termYears}
付款安排：${paymentSchedule}

里程碑：
${isLitigation ? '（诉讼路径不走商务里程碑）' : milestones.map((m) => `- [${MILESTONE_LABELS[m.status] ?? m.status}] ${m.label}（截止 ${m.due}）`).join('\n')}

交接状态：${handoff}
${isLitigation
  ? '路径标记：维权诉讼 · 商务 Term Sheet/里程碑已停用 · 法务审阅与交接仍可用。'
  : role === 'enterprise'
    ? '企业焦点：条款审批、里程碑验收与收益确认。'
    : '代理所焦点：协议要点起草与提交企业审批。'}
`, [c, caseId, path, counterpart, territory, fieldLimit, exclusivity, royalty, termYears, paymentSchedule, milestones, role, handoff, isLitigation])

  useEffect(() => setDraft(assembled), [assembled])
  const showToast = (msg: string, err = false, next?: { label: string; to: string }[]) => {
    setToast(msg)
    setToastErr(err)
    setToastNext(err ? undefined : next)
    setTimeout(() => { setToast(null); setToastNext(undefined) }, err ? 2800 : 8000)
  }
  const successNext = () => nextActionsForStage('commercialization', caseId)

  const addMilestone = () => {
    setMilestones((prev) => [...prev, { id: `m-${Date.now()}`, label: '新里程碑', due: '2026-12-31', done: false, status: 'pending' as MilestoneStatus }])
    setStep(2)
  }

  const partyReady = counterpart.trim().length > 0
  const termsReady = royalty.trim().length > 0
  const legalReviewed = (c?.legalReview ?? 'pending') === 'reviewed'
  const legalBlockedHint =
    (c?.legalReview ?? 'pending') === 'changes_requested'
      ? '法务已退回 · 批准前须法务已阅'
      : '批准/确认条款前须法务已阅（非合同签署）' 

  const progressStep = useMemo(() => {
    if (['approved', 'authorized_to_file', 'filed', 'submitted_to_enterprise', 'enterprise_review'].includes(handoff)) return 3
    if (isLitigation) {
      // 诉讼路径不走商务里程碑：路径 → 备注 → 审批
      if (partyReady || termsReady) return 1
      if (path) return 0
      return 0
    }
    if (milestones.some((m) => m.status === 'done' || m.status === 'in_progress')) return 2
    if (termsReady || partyReady) return 1
    if (path) return 0
    return 0
  }, [handoff, milestones, termsReady, partyReady, path, isLitigation])
  const stepperCurrent = Math.max(step, progressStep, storedStepIndex)

  useEffect(() => {
    syncProgressFloor(progressStep)
  }, [progressStep, syncProgressFloor])


  return (
    <div className="px-5 py-5 lg:px-8 lg:py-6">
      <ToastBanner message={toast} error={toastErr} nextActions={toastNext} />
      <FlowHeader title="运用转化" subtitle="转化路径向导、Term Sheet、里程碑与企业审批" caseData={c} />
      <div className="mb-4">
        <CasePicker stage="commercialization" selectedId={caseId} onChange={(id) => { setCaseId(id); navigate(id ? `/workbench/monetize/${id}` : '/workbench/monetize', { replace: true }) }} />
      </div>
      <Stepper steps={STEPS} current={stepperCurrent} />
      <SplitDraft
        rightTitle="转化摘要（自动生成）"
        right={<textarea className={draftAreaCls} value={draft} onChange={(e) => setDraft(e.target.value)} />}
        left={<>
          <WbSection title="① 转化路径向导">
            <div className="flex flex-wrap gap-2">
              {PATHS.map((p) => (
                <WbChip key={p} active={path === p} onClick={() => { setPath(p); setStep(0) }}>{p}</WbChip>
              ))}
            </div>
            {path === '维权诉讼' && (
              <div className="mt-3 rounded-lg border border-amber-200 bg-amber-50 px-3 py-2.5 text-xs text-amber-950" role="status">
                <p className="font-medium">无独立「诉讼维权 Flow」（原型诚实空态）</p>
                <p className="mt-1 text-amber-900/90">
                  阶段元数据 litigation runners 为静态目录（非案级 Live）；本台仅作路径标记。
                  证据保全 / 发函 / 立案请走监控升级维权线索，勿把 Term Sheet 当作诉状。
                </p>
                <div className="mt-2 flex flex-wrap gap-2">
                  <Link to="/workbench/watch" className="font-medium underline">
                    去监控台升级维权
                  </Link>
                  <AppLink to="/cases" className="underline decoration-amber-300">
                    案件列表
                  </AppLink>
                </div>
              </div>
            )}
          </WbSection>
          <WbSection title={isLitigation ? '② 备注要点（非诉讼文书）' : '② Term Sheet 条款要点'}>
            {isLitigation && (
              <p className="mb-2 rounded-md border border-amber-200 bg-amber-50 px-2.5 py-1.5 text-[11px] text-amber-950" role="status">
                诉讼路径不走商务 Term Sheet · 字段已灰化；切回许可/转让等路径后恢复可编辑。法务审阅与交接闸仍可用。
              </p>
            )}
            <div className={`grid gap-3 sm:grid-cols-2 ${isLitigation ? 'opacity-60' : ''}`}>
              <WbField label="交易对手" required>
                <input className={inputCls} disabled={isLitigation} value={counterpart} onChange={(e) => { setCounterpart(e.target.value); setStep(1) }} />
              </WbField>
              <WbField label="地域范围">
                <input className={inputCls} disabled={isLitigation} value={territory} onChange={(e) => setTerritory(e.target.value)} />
              </WbField>
              <WbField label="领域限制">
                <input className={inputCls} disabled={isLitigation} value={fieldLimit} onChange={(e) => setFieldLimit(e.target.value)} />
              </WbField>
              <WbField label="排他性">
                <input className={inputCls} disabled={isLitigation} value={exclusivity} onChange={(e) => setExclusivity(e.target.value)} />
              </WbField>
              <WbField label="对价 / 分成" required>
                <input className={inputCls} disabled={isLitigation} value={royalty} onChange={(e) => setRoyalty(e.target.value)} />
              </WbField>
              <WbField label="期限">
                <input className={inputCls} disabled={isLitigation} value={termYears} onChange={(e) => setTermYears(e.target.value)} />
              </WbField>
              <WbField label="付款安排">
                <input className={inputCls} disabled={isLitigation} value={paymentSchedule} onChange={(e) => setPaymentSchedule(e.target.value)} />
              </WbField>
            </div>
          </WbSection>
          <WbSection
            title="③ 里程碑状态机"
            action={
              <button
                type="button"
                className={btnGhost + ' !px-2 !py-1 text-xs'}
                disabled={isLitigation}
                onClick={addMilestone}
              >
                <Plus className="h-3 w-3" /> 添加
              </button>
            }
          >
            {isLitigation ? (
              <p className="mb-2 rounded-md border border-amber-200 bg-amber-50 px-2.5 py-1.5 text-[11px] text-amber-950" role="status">
                诉讼路径不走商务里程碑 · 已灰化；证据/发函/立案请走监控升级维权。切回许可等路径后恢复可编辑。
              </p>
            ) : (
              <p className="mb-2 text-[11px] text-slate-500">待办 → 进行中 → 完成 / 逾期</p>
            )}
            <ul className={`space-y-2 ${isLitigation ? 'pointer-events-none opacity-50' : ''}`}>
              {milestones.map((m) => (
                <li key={m.id} className="flex flex-wrap items-center gap-2 rounded-xl border border-slate-200 px-3 py-2">
                  <select
                    className="rounded-lg border border-slate-200 px-2 py-1 text-[11px]"
                    value={m.status}
                    disabled={isLitigation}
                    onChange={(e) => {
                      const status = e.target.value as MilestoneStatus
                      setMilestones((prev) =>
                        prev.map((x) =>
                          x.id === m.id
                            ? { ...x, status, done: status === 'done' }
                            : x,
                        ),
                      )
                      setStep(2)
                    }}
                  >
                    <option value="pending">待办</option>
                    <option value="in_progress">进行中</option>
                    <option value="done">完成</option>
                    <option value="overdue">逾期</option>
                  </select>
                  <input
                    className="min-w-0 flex-1 rounded border border-slate-200 px-2 py-1 text-sm"
                    value={m.label}
                    disabled={isLitigation}
                    onChange={(e) => setMilestones((prev) => prev.map((x) => x.id === m.id ? { ...x, label: e.target.value } : x))}
                  />
                  <input
                    type="date"
                    className="rounded border border-slate-200 px-2 py-1 text-xs tabular-nums"
                    value={m.due}
                    disabled={isLitigation}
                    onChange={(e) => setMilestones((prev) => prev.map((x) => x.id === m.id ? { ...x, due: e.target.value } : x))}
                  />
                  <button
                    type="button"
                    className="text-slate-400 hover:text-rose-600 disabled:opacity-40"
                    aria-label="删除里程碑"
                    disabled={isLitigation}
                    onClick={() => setMilestones((p) => p.filter((x) => x.id !== m.id))}
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </button>
                </li>
              ))}
            </ul>
          </WbSection>
          <WbSection title="关联监控告警">
            <div className="flex flex-wrap gap-2">
              <select
                className={inputCls + ' max-w-xs'}
                value={alertPick}
                onChange={(e) => setAlertPick(e.target.value)}
              >
                <option value="">选择或创建示意告警…</option>
                <option value="al1">竞品新公开近似权利要求</option>
                <option value="al-stub">新建示意告警 stub</option>
              </select>
              <button
                type="button"
                className={btnGhost}
                onClick={() => {
                  const id = alertPick === 'al-stub' || !alertPick ? `al-${Date.now()}` : alertPick
                  setLinkedAlert(caseId, id)
                  setAlertPick(id)
                  addActivity(`「${c?.title}」已关联监控告警 ${id}`)
                  showToast(`已关联告警 ${id}`)
                }}
              >
                关联监控告警
              </button>
              {c?.linkedAlertId && (
                <span className="rounded-full bg-amber-50 px-2 py-1 text-[11px] text-amber-800 ring-1 ring-amber-200">
                  已关联 {c.linkedAlertId}
                </span>
              )}
            </div>
          </WbSection>
          <VersionPanel caseId={caseId} handoffKey="monetize_terms" />
          <WbSection title="④ 审批交接">
            <div className="mb-3 flex flex-wrap items-center gap-2 rounded-lg border border-slate-200 bg-slate-50 px-3 py-2">
              <span className="text-[11px] text-slate-500">法务审阅状态 · 非合同签署</span>
              <span
                className={`rounded-full px-2 py-0.5 text-[11px] font-medium ring-1 ${
                  (c?.legalReview ?? 'pending') === 'reviewed'
                    ? 'bg-emerald-50 text-emerald-700 ring-emerald-200'
                    : (c?.legalReview ?? 'pending') === 'changes_requested'
                      ? 'bg-amber-50 text-amber-800 ring-amber-200'
                      : 'bg-slate-100 text-slate-600 ring-slate-200'
                }`}
              >
                {(c?.legalReview ?? 'pending') === 'reviewed'
                  ? '法务已阅'
                  : (c?.legalReview ?? 'pending') === 'changes_requested'
                    ? '法务退回'
                    : '法务待审'}
              </span>
              {role === 'enterprise' && (
                <>
                  <button
                    type="button"
                    className={btnGhost + ' !px-2 !py-1 text-[11px]'}
                    onClick={() => {
                      setLegalReview(caseId, 'reviewed')
                      showToast('已标记法务已阅（非合同签署）')
                    }}
                  >
                    法务已阅
                  </button>
                  <button
                    type="button"
                    className={btnGhost + ' !px-2 !py-1 text-[11px]'}
                    onClick={() => {
                      setLegalReview(caseId, 'changes_requested')
                      showToast('已标记法务退回（非合同签署）')
                    }}
                  >
                    法务退回
                  </button>
                </>
              )}
              <span className="text-[10px] text-slate-400">
                与商务批准分步，但批准闸须法务已阅
              </span>
            </div>
            <HandoffActionBar
              caseId={caseId}
              handoffKey="monetize_terms"
              inlineError={!legalReviewed ? legalBlockedHint : null}
              omitRequiredIds={isLitigation ? ['terms', 'party'] : undefined}
              checkedRequired={
                isLitigation
                  ? []
                  : [
                      ...(termsReady ? ['terms'] : []),
                      ...(partyReady ? ['party'] : []),
                    ]
              }
              validateBefore={(a) => {
                if (a === 'submit' && !isLitigation && (!counterpart.trim() || !royalty.trim())) {
                  return '请填写交易对手与对价'
                }
                if (a === 'approve' || a === 'authorize') {
                  // legalReview · 与 ConfirmBar / canPerform 同源【唯一入口】
                  const gr = evaluateGuardrails({
                    agent: getAgent('agent-monetize'),
                    case: c ?? null,
                    action: a,
                    persona,
                    role,
                    isEnterprise: role === 'enterprise',
                    handoffKey: 'monetize_terms',
                  })
                  const msg = firstGuardrailMessage(gr)
                  if (msg) return msg
                }
                return null
              }}
              onResult={(msg, err) => {
                if (!err) {
                  markChecklistDone(caseId, ['c1', 'c2'])
                  addArtifact(caseId, '成果转化摘要.md', '协议')
                  addActivity(`「${c?.title}」转化「${path}」${msg}`)
                  setStep(3)
                }
                showToast(msg, err, err ? undefined : successNext())
              }}
            />
          </WbSection>
        </>}
      />
    </div>
  )
}
