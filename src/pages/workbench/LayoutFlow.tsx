import { useEffect, useMemo, useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { useApp } from '../../context/AppContext'
import { usePersistedFlowStep } from '../../hooks/usePersistedFlowStep'
import { stepsForFlow } from '../../data/flowSteps'
import {
  evaluateGuardrails,
  firstGuardrailMessage,
} from '../../domain/guardrails'
import { getAgent } from '../../data/agents'
import {
  CasePicker,
  FlowHeader,
  HandoffActionBar,
  SplitDraft,
  Stepper,
  ToastBanner,
  nextActionsForStage,
  inputCls,
  textareaCls,
} from '../../components/workbench/FlowChrome'
import { VersionPanel } from '../../components/workbench/VersionPanel'
import { WbSection, WbField } from '../../components/workbench/FormBlocks'
import { HANDOFF_ARTIFACT_LABELS } from '../../data/handoff'

const STEPS = stepsForFlow('layout')

const MATRIX_SEED = [
  { tech: '边缘侧调度', scene: '能耗窗口', density: '我方弱 / 竞品中', blank: true },
  { tech: '多租户隔离', scene: '云调度', density: '双方均弱', blank: true },
  { tech: '负载预测', scene: '车端', density: '我方中 / 竞品密', blank: false },
]

const COUNTRY_OPTS = ['CN', 'US', 'EP', 'JP', 'KR', 'PCT']

export function LayoutFlow() {
  const { caseId: paramId } = useParams()
  const navigate = useNavigate()
  const {
    getCase,
    role,
    persona,
    addActivity,
    addArtifact,
    getHandoff,
    appendCaseDriveItem,
    visibleCases,
    attachHandoffArtifact,
  } = useApp()

  const [caseId, setCaseId] = useState(paramId ?? 'c2')
  const { step, setStep, syncProgressFloor, storedStepIndex } = usePersistedFlowStep(caseId, 'layout')
  const [toast, setToast] = useState<string | null>(null)
  const [toastErr, setToastErr] = useState(false)
  const [toastNext, setToastNext] = useState<{ label: string; to: string }[] | undefined>()

  const c = getCase(caseId)
  const handoff = getHandoff(caseId, 'layout_insight')

  const [insightSummary, setInsightSummary] = useState(
    '交叉技术×场景矩阵：边缘侧能耗与多租户隔离存在空白，建议补强 1 件发明。',
  )
  const [blanks, setBlanks] = useState(
    '1. 边缘侧 · 能耗约束调度\n2. 多租户隔离调度',
  )
  const [suggest, setSuggest] = useState(
    '发起发明：多租户隔离 + 能耗窗口；批准后 CreateCaseFromInsight 建调研案。',
  )
  const [countries, setCountries] = useState<string[]>(['CN', 'PCT'])
  const [draft, setDraft] = useState('')

  /** 补挂向导：空态默认展开；批准后也可打开 */
  const layoutPoolCount = useMemo(
    () =>
      visibleCases.filter(
        (x) => x.stage === 'pre_research' && !!x.handoffs.layout_insight,
      ).length,
    [visibleCases],
  )
  const attachCandidates = useMemo(
    () =>
      visibleCases.filter(
        (x) => x.stage === 'pre_research' && !x.handoffs.layout_insight,
      ),
    [visibleCases],
  )
  const [attachOpen, setAttachOpen] = useState(false)
  const [attachTargetId, setAttachTargetId] = useState('')
  const [attachNote, setAttachNote] = useState('')
  const [syncOnApprove, setSyncOnApprove] = useState(true)
  const [pendingSyncTarget, setPendingSyncTarget] = useState<string | null>(null)

  useEffect(() => {
    if (paramId && paramId !== caseId) setCaseId(paramId)
  }, [paramId]) // eslint-disable-line react-hooks/exhaustive-deps

  // step 由 usePersistedFlowStep 按案水合（勿在切案时强制 setStep(0)）

  useEffect(() => {
    if (layoutPoolCount === 0 && attachCandidates.length > 0) {
      setAttachOpen(true)
    }
  }, [layoutPoolCount, attachCandidates.length])

  // 批准时自动提议：最新 fromInsight 且未挂 layout_insight 的调研案
  useEffect(() => {
    const proposed =
      attachCandidates.find((x) => x.fromInsight) ?? attachCandidates[0] ?? null
    setPendingSyncTarget(proposed?.id ?? null)
    if (proposed && !attachTargetId) setAttachTargetId(proposed.id)
  }, [attachCandidates]) // eslint-disable-line react-hooks/exhaustive-deps

  const assembled = useMemo(
    () => `【布局洞察】
案件：${c?.title ?? (caseId || '（未选案）')}
交接键：layout_insight（不占用 research_report）

## 洞察摘要
${insightSummary}

## 矩阵要点
${MATRIX_SEED.map((r) => `- ${r.tech} × ${r.scene}：${r.density}${r.blank ? ' · 空白' : ''}`).join('\n')}

## 空白点
${blanks}

## 补强建议
${suggest}

## 国别建议
${countries.join(' / ') || '（未选）'}

交接状态：${handoff}
`,
    [c, caseId, insightSummary, blanks, suggest, countries, handoff],
  )

  useEffect(() => setDraft(assembled), [assembled])

  const showToast = (msg: string, err = false, next?: { label: string; to: string }[]) => {
    setToast(msg)
    setToastErr(err)
    setToastNext(err ? undefined : next)
    setTimeout(() => {
      setToast(null)
      setToastNext(undefined)
    }, err ? 2800 : 8000)
  }

  const matrixReady = insightSummary.trim().length > 0
  const blanksReady = blanks.trim().length > 0
  const suggestReady = suggest.trim().length > 0
  const countriesReady = countries.length > 0

  const progressStep = useMemo(() => {
    if (['approved', 'filed', 'authorized_to_file', 'submitted_to_enterprise', 'enterprise_review'].includes(handoff)) {
      return 2
    }
    if (countriesReady && suggestReady) return 1
    if (matrixReady || blanksReady) return 0
    return 0
  }, [handoff, countriesReady, suggestReady, matrixReady, blanksReady])
  const stepperCurrent = Math.max(step, progressStep, storedStepIndex)

  useEffect(() => {
    syncProgressFloor(progressStep)
  }, [progressStep, syncProgressFloor])


  const onCaseChange = (id: string) => {
    setCaseId(id)
    navigate(id ? `/workbench/layout/${id}` : '/workbench/layout', { replace: true })
  }

  const toggleCountry = (code: string) => {
    setCountries((prev) =>
      prev.includes(code) ? prev.filter((x) => x !== code) : [...prev, code],
    )
    setStep(1)
  }

  const runAttach = (
    targetId: string,
    opts?: { selectAfter?: boolean; silent?: boolean },
  ): { ok: boolean; message: string } => {
    if (!targetId) {
      const message = '请选择要补挂的源案/调研案'
      if (!opts?.silent) showToast(message, true)
      return { ok: false, message }
    }
    const note =
      attachNote.trim() ||
      `补挂自布局台 · ${insightSummary.trim().slice(0, 80) || '当前洞察摘要'}`
    const summary = `空白 ${blanks.split('\n').filter(Boolean).length} · 国别 ${countries.join('/') || '—'} · 补挂 ≠ 批准`
    const r = attachHandoffArtifact(targetId, 'layout_insight', { note, summary })
    if (!opts?.silent) showToast(r.message, !r.ok)
    if (r.ok) {
      setAttachOpen(false)
      if (opts?.selectAfter !== false) {
        onCaseChange(targetId)
      }
    }
    return { ok: r.ok, message: r.message }
  }

  return (
    <div className="p-6 lg:p-8">
      <ToastBanner message={toast} error={toastErr} nextActions={toastNext} />
      <FlowHeader
        title="布局洞察"
        subtitle={
          role === 'enterprise'
            ? '审核空白点与补强方向，批准后可建调研案'
            : '矩阵洞察、国别建议与 layout_insight 交接'
        }
        caseData={c}
      />
      <div className="mb-3 rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-xs text-slate-700">
        本台办理 <span className="font-medium">{HANDOFF_ARTIFACT_LABELS.layout_insight}</span>
        （独立键，不占调研报告）。复杂推演可走{' '}
        <Link
          className="font-medium underline"
          to={caseId ? `/agent/agents?agent=agent-layout&case=${caseId}` : '/agent/agents?agent=agent-layout'}
        >
          布局 Agent
        </Link>
        。
      </div>
      <div className="mb-4 space-y-2">
        <CasePicker
          stage="pre_research"
          artifactFilter="layout_insight"
          selectedId={caseId}
          onChange={onCaseChange}
          emptyHint="暂无带 layout_insight 的布局案"
        />
        <p className="text-[11px] text-slate-500">
          本台只列已挂 <span className="font-medium">layout_insight</span> 的调研阶段案（非 STAGE_ORDER · 不降级调研全池）。
          矩阵空白与补强方向；批准后可建调研案（深链调研台），本台继续办源案洞察。
          池内 <span className="tabular-nums font-medium text-slate-700">{layoutPoolCount}</span> 件。
        </p>

        {/* 补挂向导：空态 / 手动 / 批准后同步 */}
        <div className="rounded-lg border border-dashed border-[color-mix(in_srgb,var(--color-accent)_28%,transparent)] bg-accent-soft/70 px-3 py-2">
          <div className="flex flex-wrap items-center gap-2">
            <button
              type="button"
              className="rounded-md bg-primary-600 px-2.5 py-1 text-xs font-medium text-white hover:bg-primary-500"
              onClick={() => setAttachOpen((o) => !o)}
            >
              {attachOpen ? '收起补挂' : '从已有案件补挂 layout_insight'}
            </button>
            <span className="text-[11px] text-slate-700">
              布局 Agent 建案常深链调研案、源案未挂键 → 布局台空池。补挂写入 drafting，
              <span className="font-medium">不等于批准</span>、不绕过 REQUIRED。
            </span>
          </div>
          {attachOpen && (
            <div className="mt-2 space-y-2 border-t border-slate-200 pt-2">
              {attachCandidates.length === 0 ? (
                <p className="text-xs text-slate-600">
                  暂无未挂键的调研阶段案可补挂（可见池内均已挂或无可办案）。
                </p>
              ) : (
                <>
                  <label className="block text-[11px] font-medium text-slate-700">
                    选源案 / 调研案（未挂 layout_insight）
                    <select
                      className={`${inputCls} mt-1`}
                      value={attachTargetId}
                      onChange={(e) => setAttachTargetId(e.target.value)}
                    >
                      <option value="">选择案件…</option>
                      {attachCandidates.map((x) => (
                        <option key={x.id} value={x.id}>
                          {x.title}（{x.caseNo}
                          {x.fromInsight ? ' · 洞察建案' : ''}）
                        </option>
                      ))}
                    </select>
                  </label>
                  <label className="block text-[11px] font-medium text-slate-700">
                    补挂说明（写入 handoff note / 时间线）
                    <textarea
                      className={`${textareaCls} mt-1 min-h-[56px]`}
                      placeholder="默认用当前洞察摘要前 80 字"
                      value={attachNote}
                      onChange={(e) => setAttachNote(e.target.value)}
                    />
                  </label>
                  <div className="flex flex-wrap items-center gap-2">
                    <button
                      type="button"
                      className="rounded-md bg-slate-900 px-3 py-1.5 text-xs font-medium text-white hover:bg-slate-800"
                      onClick={() => runAttach(attachTargetId)}
                    >
                      确认补挂（drafting）
                    </button>
                    <span className="text-[10px] text-slate-500">
                      可审计：时间线「补挂布局洞察」+ Drive · CasePicker 立刻可见
                    </span>
                  </div>
                </>
              )}
            </div>
          )}
        </div>
      </div>
      <Stepper steps={STEPS} current={stepperCurrent} />
      <SplitDraft
        rightTitle="布局洞察草稿"
        right={
          <textarea
            className={`${textareaCls} min-h-[400px] font-mono text-xs leading-relaxed`}
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
          />
        }
        left={
          <>
            <WbSection title="① 洞察摘要 / 矩阵">
              <WbField label="洞察摘要" required>
                <textarea
                  className={textareaCls}
                  value={insightSummary}
                  onChange={(e) => {
                    setInsightSummary(e.target.value)
                    setStep(0)
                  }}
                />
              </WbField>
              <ul className="mt-2 space-y-1 text-xs text-slate-600">
                {MATRIX_SEED.map((r) => (
                  <li
                    key={`${r.tech}-${r.scene}`}
                    className={`rounded-md border px-2 py-1.5 ${
                      r.blank
                        ? 'border-amber-200 bg-amber-50 text-amber-950'
                        : 'border-slate-200 bg-white'
                    }`}
                  >
                    <span className="font-medium">
                      {r.tech} × {r.scene}
                    </span>
                    <span className="ml-2 text-slate-500">{r.density}</span>
                    {r.blank && (
                      <span className="ml-2 rounded-full bg-amber-100 px-1.5 text-[10px] font-medium text-amber-900">
                        空白
                      </span>
                    )}
                  </li>
                ))}
              </ul>
              <WbField label="空白点" required>
                <textarea
                  className={textareaCls}
                  value={blanks}
                  onChange={(e) => {
                    setBlanks(e.target.value)
                    setStep(0)
                  }}
                />
              </WbField>
              <WbField label="补强建议" required>
                <textarea
                  className={textareaCls}
                  value={suggest}
                  onChange={(e) => {
                    setSuggest(e.target.value)
                    setStep(0)
                  }}
                />
              </WbField>
            </WbSection>

            <WbSection title="② 国别建议">
              <div className="flex flex-wrap gap-2">
                {COUNTRY_OPTS.map((co) => (
                  <button
                    key={co}
                    type="button"
                    onClick={() => toggleCountry(co)}
                    className={`rounded-lg px-3 py-1.5 text-xs ${
                      countries.includes(co)
                        ? 'bg-slate-900 text-white'
                        : 'bg-slate-100 text-slate-600'
                    }`}
                  >
                    {co}
                  </button>
                ))}
              </div>
              <p className="mt-2 text-[11px] text-slate-500">
                国别建议写入洞察摘要，供批准后建案/调研引用；正式国别策略仍在撰写台确认。
              </p>
            </WbSection>

            <VersionPanel caseId={caseId} handoffKey="layout_insight" />
            <div className="rounded-xl border border-slate-200 bg-white p-3">
              {pendingSyncTarget && (
                <label className="mb-2 flex items-start gap-2 rounded-md border border-slate-200 bg-accent-soft/50 px-2 py-1.5 text-[11px] text-slate-900">
                  <input
                    type="checkbox"
                    className="mt-0.5"
                    checked={syncOnApprove}
                    onChange={(e) => setSyncOnApprove(e.target.checked)}
                  />
                  <span>
                    批准成功时同步补挂到关联调研/源案
                    <span className="font-medium">
                      「{getCase(pendingSyncTarget)?.title ?? pendingSyncTarget}」
                    </span>
                    （drafting · 补挂 ≠ 批准；若无关联案可取消）
                  </span>
                </label>
              )}
              <HandoffActionBar
                caseId={caseId}
                handoffKey="layout_insight"
                checkedRequired={[
                  ...(matrixReady ? ['matrix'] : []),
                  ...(blanksReady ? ['blanks'] : []),
                  ...(suggestReady ? ['suggest'] : []),
                ]}
                validateBefore={(a) => {
                  if (a === 'submit') {
                    if (!matrixReady) return '请填写洞察摘要（矩阵）'
                    if (!blanksReady) return '请填写空白点'
                    if (!suggestReady) return '请填写补强建议'
                  }
                  if (a === 'approve' || a === 'authorize' || a === 'file') {
                    const gr = evaluateGuardrails({
                      agent: getAgent('agent-layout'),
                      case: c ?? null,
                      action: a,
                      persona,
                      role,
                      isEnterprise: role === 'enterprise',
                      handoffKey: 'layout_insight',
                    })
                    const msg = firstGuardrailMessage(gr)
                    if (msg) return msg
                  }
                  return null
                }}
                onResult={(msg, err) => {
                  if (!err) {
                    if (msg.includes('提交')) {
                      addArtifact(caseId, '布局洞察_提交评审.md', '洞察')
                      setStep(2)
                      appendCaseDriveItem(caseId, {
                        kind: 'other',
                        title: '布局洞察已提交',
                        summary: `空白 ${blanks.split('\n').filter(Boolean).length} · 国别 ${countries.join('/')}`,
                        source: 'layout-submit',
                      })
                      addActivity(`「${c?.title ?? caseId}」布局洞察已提交`)
                    }
                    if (msg.includes('批准') || msg.includes('确认')) {
                      appendCaseDriveItem(caseId, {
                        kind: 'approval',
                        title: '布局洞察批准',
                        summary: suggest.slice(0, 80),
                        source: 'layout-handoff',
                      })
                      let composed = msg
                      if (syncOnApprove && pendingSyncTarget && pendingSyncTarget !== caseId) {
                        const sync = runAttach(pendingSyncTarget, {
                          selectAfter: false,
                          silent: true,
                        })
                        composed = sync.ok
                          ? `${msg} · 已同步补挂「${getCase(pendingSyncTarget)?.title ?? pendingSyncTarget}」`
                          : `${msg} · 同步补挂未执行：${sync.message}`
                        if (sync.ok) {
                          setAttachTargetId(pendingSyncTarget)
                        } else {
                          setAttachOpen(true)
                        }
                      } else if (attachCandidates.length > 0) {
                        setAttachOpen(true)
                      }
                      const next = nextActionsForStage('pre_research', caseId)
                      showToast(composed, false, next)
                      return
                    }
                  }
                  const next =
                    !err &&
                    (msg.includes('提交') || msg.includes('批准') || msg.includes('授权'))
                      ? nextActionsForStage('pre_research', caseId)
                      : undefined
                  showToast(msg, err, next)
                }}
              />
            </div>
          </>
        }
      />
    </div>
  )
}
