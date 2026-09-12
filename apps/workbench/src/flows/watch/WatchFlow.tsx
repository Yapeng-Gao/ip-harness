import { useEffect, useMemo, useState } from 'react'
import { useNavigate, useParams, useSearchParams } from 'react-router-dom'
import { Bell, ChevronDown, Plus } from 'lucide-react'
import { useApp } from '@shared/context/AppContext'
import { usePersistedFlowStep } from '@shared/hooks/usePersistedFlowStep'
import { stepsForFlow } from '@shared/data/flowSteps'
import {
  evaluateGuardrails,
  firstGuardrailMessage,
} from '@ip/domain'
import { getAgent } from '@shared/data/agents'
import { watchSeed } from '@shared/data/workbenchSeeds'
import {
  CasePicker, FlowHeader, HandoffActionBar, SplitDraft, Stepper,
  ToastBanner, nextActionsForStage, btnGhost, btnPrimary, inputCls, textareaCls,
} from '../../components/FlowChrome'
import { VersionPanel } from '../../components/VersionPanel'
import { WbSection, WbField } from '../../components/FormBlocks'
import { AppLink } from '@shared/components/AppLink'

const STEPS = stepsForFlow('watch')

export function WatchFlow() {
  const { caseId: paramId } = useParams()
  const [searchParams] = useSearchParams()
  const alertParam = searchParams.get('alert')
  const navigate = useNavigate()
  const {
    getCase, role, persona, addActivity, addArtifact, markChecklistDone, getHandoff, addCase,
    getWatchAlerts, processWatchAlert, patchWatchAlert, appendCaseDriveItem,
  } = useApp()
  const [caseId, setCaseId] = useState(paramId ?? 'c9')
  const { step, setStep, syncProgressFloor, storedStepIndex } = usePersistedFlowStep(caseId, 'watch')
  const [toast, setToast] = useState<string | null>(null)
  const [toastErr, setToastErr] = useState(false)
  const [toastNext, setToastNext] = useState<{ label: string; to: string }[] | undefined>()
  const [moreOpen, setMoreOpen] = useState(false)
  const seed = watchSeed[caseId] ?? watchSeed.c9

  const [keywords, setKeywords] = useState(seed.keywords)
  const [competitors, setCompetitors] = useState(seed.competitors)
  const [rules, setRules] = useState(seed.rules.map((r) => ({ ...r })))
  const alerts = getWatchAlerts(caseId)
  const [activeAlert, setActiveAlert] = useState(
    alertParam && seed.alerts.some((a) => a.id === alertParam)
      ? alertParam
      : (seed.alerts[0]?.id ?? ''),
  )
  const [draft, setDraft] = useState('')
  const c = getCase(caseId)
  const handoff = getHandoff(caseId, 'watch_alert')

  useEffect(() => {
    const s = watchSeed[caseId] ?? watchSeed.c9
    setKeywords(s.keywords); setCompetitors(s.competitors)
    setRules(s.rules.map((r) => ({ ...r })))
    const list = getWatchAlerts(caseId)
    const prefer =
      alertParam && list.some((a) => a.id === alertParam)
        ? alertParam
        : (list[0]?.id ?? s.alerts[0]?.id ?? '')
    setActiveAlert(prefer)
    setMoreOpen(false)
    // 深链告警抬到步骤 1；否则保留 store 水合值
    if (alertParam) setStep(1)
  }, [caseId, alertParam]) // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => { if (paramId && paramId !== caseId) setCaseId(paramId) }, [paramId])

  const assembled = useMemo(() => `【监控预警工作记录】
案件：${c?.title ?? caseId}
订阅关键词：${keywords}
竞品名单：${competitors}

监控规则：
${rules.map((r) => `- [${r.enabled ? '启用' : '关闭'}] ${r.name}：${r.threshold}`).join('\n')}

告警处理：
${alerts.map((a) => `- [${a.status}] (${a.level}) ${a.title}
  代理意见：${a.agencyOpinion || a.note}
  企业决策：${a.enterpriseDecision || '（待决）'}`).join('\n')}

交接状态：${handoff}
`, [c, caseId, keywords, competitors, rules, alerts, handoff])

  useEffect(() => setDraft(assembled), [assembled])
  const showToast = (msg: string, err = false, next?: { label: string; to: string }[]) => {
    setToast(msg)
    setToastErr(err)
    setToastNext(err ? undefined : next)
    setTimeout(() => { setToast(null); setToastNext(undefined) }, err ? 2800 : 8000)
  }
  const successNext = () => nextActionsForStage('monitoring', caseId)

  const updateAlert = (
    id: string,
    patch: Partial<{ agencyOpinion: string; enterpriseDecision: string; note: string }>,
  ) => patchWatchAlert(caseId, id, patch)

  const processAlert = (id: string, status: '已确认' | '已升级' | '已关闭') => {
    processWatchAlert(caseId, id, status)
    setStep(1)
    setMoreOpen(false)
    const a = alerts.find((x) => x.id === id)
    appendCaseDriveItem(caseId, {
      kind: status === '已确认' ? 'approval' : 'other',
      title: `监控处置 · ${status}`,
      summary: a?.title ?? id,
      source: 'watch-process',
    })
    showToast(`告警已标记为「${status}」`, false, successNext())
  }

  const active = alerts.find((x) => x.id === activeAlert)
  const alertReady =
    !!active &&
    (active.status !== '待处理' ||
      !!active.note?.trim() ||
      !!active.agencyOpinion.trim() ||
      !!active.enterpriseDecision.trim())
  const riskReady = !!active?.level
  const opinionReady = !!active?.agencyOpinion.trim()

  const createResearchCase = (a: (typeof alerts)[0]) => {
    const created = addCase({
      title: `调研：${a.title}`,
      stage: 'pre_research',
      summary: `由监控告警「${a.title}」生成。${a.agencyOpinion || a.note}`,
      inventor: c?.inventor ?? '待指定',
      ownerTeam: c?.ownerTeam ?? '创新孵化组',
      fulfillmentMode: 'self_serve',
      risk: a.level === '高' ? '高' : '中',
    })
    setMoreOpen(false)
    showToast(`已生成调研案 ${created.caseNo}`, false, [
      { label: '打开调研案', to: `/workbench/research/${created.id}` },
      { label: '回案件', to: `/cases/${caseId}` },
      { label: '去期限', to: `/docket?case=${caseId}` },
    ])
    navigate(`/workbench/research/${created.id}`)
  }

  const escalateEnforcement = (a: (typeof alerts)[0]) => {
    const created = addCase({
      title: `维权线索：${a.title}`,
      stage: 'commercialization',
      summary: `由监控告警升级维权线索。${a.agencyOpinion || a.note}`,
      inventor: c?.inventor ?? '待指定',
      ownerTeam: c?.ownerTeam ?? '法务/IP',
      fulfillmentMode: 'delegated',
      agencyName: c?.agencyName && c.agencyName !== '—' ? c.agencyName : '北京德恒知识产权代理有限公司',
      risk: '高',
    })
    processWatchAlert(caseId, a.id, '已升级')
    setStep(1)
    setMoreOpen(false)
    appendCaseDriveItem(caseId, {
      kind: 'other',
      title: '监控处置 · 已升级维权',
      summary: `${a.title} → ${created.caseNo}`,
      source: 'watch-escalate',
    })
    showToast(`已升级维权线索 ${created.caseNo}`, false, [
      { label: '打开转化案', to: `/workbench/monetize/${created.id}` },
      { label: '回案件', to: `/cases/${caseId}` },
      { label: '去期限', to: `/docket?case=${caseId}` },
    ])
    navigate(`/workbench/monetize/${created.id}`)
  }

  const progressStep = useMemo(() => {
    if (['approved', 'authorized_to_file', 'filed', 'submitted_to_enterprise', 'enterprise_review'].includes(handoff)) return 2
    if (active && (active.status === '已确认' || active.status === '已升级' || active.status === '已关闭')) return 1
    if (keywords.trim() || competitors.trim()) return 0
    return 0
  }, [handoff, active, keywords, competitors])
  const stepperCurrent = Math.max(step, progressStep, storedStepIndex)

  useEffect(() => {
    syncProgressFloor(progressStep)
  }, [progressStep, syncProgressFloor])


  return (
    <div className="p-6 lg:p-8">
      <ToastBanner message={toast} error={toastErr} nextActions={toastNext} />
      <FlowHeader title="案件监控（业务办理）" subtitle="监控办理 · 规则配置、告警收件箱与确认/升级/关闭 · 官方期限请走 Docket" caseData={c} />
      <div className="mb-4 flex flex-wrap items-center gap-3">
        <CasePicker stage="monitoring" selectedId={caseId} onChange={(id) => { setCaseId(id); navigate(id ? `/workbench/watch/${id}` : '/workbench/watch', { replace: true }) }} />
        {c && (
          <AppLink to={`/cases/${c.id}`} className="text-xs text-slate-700 hover:underline">回到案件详情 →</AppLink>
        )}
      </div>
      <Stepper steps={STEPS} current={stepperCurrent} />
      <SplitDraft
        rightTitle="监控工作记录"
        right={<textarea className={`${textareaCls} min-h-[400px] font-mono text-xs`} value={draft} onChange={(e) => setDraft(e.target.value)} />}
        left={<>
          <WbSection title="规则配置">
            <div className="mb-3 space-y-3">
              <WbField label="关键词"><input className={inputCls} value={keywords} onChange={(e) => { setKeywords(e.target.value); setStep(0) }} /></WbField>
              <WbField label="竞品 / 主体"><input className={inputCls} value={competitors} onChange={(e) => setCompetitors(e.target.value)} /></WbField>
            </div>
            <ul className="space-y-2">
              {rules.map((r) => (
                <li key={r.id} className="flex flex-wrap items-center justify-between gap-2 rounded-lg border border-slate-200 px-3 py-2">
                  <div>
                    <div className="text-sm text-slate-800">{r.name}</div>
                    <input className="mt-1 w-full rounded border border-slate-200 px-2 py-1 text-[11px]" value={r.threshold}
                      onChange={(e) => setRules((prev) => prev.map((x) => x.id === r.id ? { ...x, threshold: e.target.value } : x))} />
                  </div>
                  <button type="button"
                    onClick={() => setRules((prev) => prev.map((x) => x.id === r.id ? { ...x, enabled: !x.enabled } : x))}
                    className={`rounded-full px-2.5 py-1 text-[11px] ${r.enabled ? 'bg-emerald-50 text-emerald-700' : 'bg-slate-100 text-slate-500'}`}>
                    {r.enabled ? '已启用' : '已关闭'}
                  </button>
                </li>
              ))}
              <li>
                <button type="button" className={btnGhost + ' text-xs'} onClick={() => setRules((p) => [...p, { id: `wr-${Date.now()}`, name: '自定义规则', enabled: true, threshold: '命中条件…' }])}>
                  <Plus className="h-3 w-3" /> 添加规则
                </button>
              </li>
            </ul>
          </WbSection>

          <WbSection title="告警收件箱 · 处理工作流">
            <div className="mb-3 flex flex-wrap gap-2">
              {alerts.map((a) => (
                <button key={a.id} type="button" onClick={() => { setActiveAlert(a.id); setMoreOpen(false); setStep(1) }}
                  className={`rounded-lg px-3 py-1.5 text-xs ${activeAlert === a.id ? 'bg-slate-100 text-slate-800 ring-1 ring-slate-200' : 'bg-slate-100 text-slate-500'}`}>
                  <Bell className="mr-1 inline h-3 w-3" />{a.status} · {a.level}
                </button>
              ))}
            </div>
            {alerts.filter((a) => a.id === activeAlert).map((a) => (
              <div key={a.id} className="space-y-3 rounded-lg border border-slate-200 p-3">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="text-sm font-medium text-slate-800">{a.title}</span>
                  <span className={`rounded px-1.5 py-0.5 text-[10px] ${a.level === '高' ? 'bg-rose-50 text-rose-700' : 'bg-amber-50 text-amber-700'}`}>{a.level}</span>
                </div>
                <WbField label="代理所意见">
                  <textarea className={textareaCls} value={a.agencyOpinion}
                    onChange={(e) => updateAlert(a.id, { agencyOpinion: e.target.value })}
                    disabled={role === 'enterprise'} />
                </WbField>
                <WbField label="企业决策">
                  <textarea className={textareaCls} value={a.enterpriseDecision}
                    onChange={(e) => updateAlert(a.id, { enterpriseDecision: e.target.value })}
                    disabled={role === 'agency'}
                    placeholder={role === 'enterprise' ? '填写是否升级维权、忽略或继续观察…' : '等待企业填写'} />
                </WbField>
                <div className="rounded-lg border border-dashed border-slate-200 bg-slate-50 p-2.5">
                  <div className="mb-1.5 flex flex-wrap items-center justify-between gap-2">
                    <span className="text-[11px] font-medium text-slate-700">简要素对照（claim_chart 草稿）</span>
                    <button
                      type="button"
                      className="rounded border border-slate-300 bg-white px-2 py-0.5 text-[11px] text-slate-800"
                      onClick={() => {
                        appendCaseDriveItem(caseId, {
                          kind: 'claim_chart',
                          title: `监控对照 · ${a.title}`,
                          summary: `威胁 ${a.level} · ${a.agencyOpinion || a.note || '待补充要素'}`,
                          source: 'watch-alert',
                        })
                        addArtifact(caseId, `claim_chart_监控_${a.id}.md`, '对照表')
                        addActivity(`「${c?.title}」监控告警已写 claim_chart 草稿`)
                        showToast('已写入 Drive：claim_chart 草稿')
                      }}
                    >
                      写入 Drive
                    </button>
                  </div>
                  <table className="min-w-full text-left text-[11px] text-slate-700">
                    <thead className="text-slate-500">
                      <tr>
                        <th className="py-1 pr-2 font-medium">我方关注要素</th>
                        <th className="py-1 pr-2 font-medium">告警对象</th>
                        <th className="py-1 font-medium">重叠初判</th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr className="border-t border-slate-200">
                        <td className="py-1 pr-2">独权核心特征</td>
                        <td className="py-1 pr-2">{a.title}</td>
                        <td className="py-1">{a.level === '高' ? '高' : '中'}</td>
                      </tr>
                      <tr className="border-t border-slate-100">
                        <td className="py-1 pr-2">应用场景</td>
                        <td className="py-1 pr-2">{competitors.split(/[,，]/)[0] || '竞品'}</td>
                        <td className="py-1">待核</td>
                      </tr>
                    </tbody>
                  </table>
                </div>
                <div className="flex flex-wrap items-center gap-2">
                  {role === 'enterprise' ? (
                    <button type="button" className={btnPrimary} onClick={() => escalateEnforcement(a)}>
                      升级维权
                    </button>
                  ) : (
                    <button type="button" className={btnPrimary} onClick={() => processAlert(a.id, '已确认')}>
                      确认
                    </button>
                  )}
                  <button
                    type="button"
                    className={btnGhost}
                    onClick={() => processAlert(a.id, '已关闭')}
                  >
                    关闭
                  </button>
                  <div className="relative">
                    <button
                      type="button"
                      className={btnGhost}
                      aria-expanded={moreOpen}
                      aria-haspopup="menu"
                      onClick={() => setMoreOpen((v) => !v)}
                    >
                      更多 <ChevronDown className="h-3.5 w-3.5" aria-hidden />
                    </button>
                    {moreOpen && (
                      <div
                        role="menu"
                        className="absolute left-0 z-20 mt-1 min-w-[10rem] rounded-lg border border-slate-200 bg-white py-1 shadow-sm"
                      >
                        <button type="button" role="menuitem" className="block w-full px-3 py-1.5 text-left text-xs text-slate-700 hover:bg-slate-50" onClick={() => { createResearchCase(a); setMoreOpen(false) }}>
                          生成调研案
                        </button>
                        {role === 'enterprise' && (
                          <button type="button" role="menuitem" className="block w-full px-3 py-1.5 text-left text-xs text-slate-500 hover:bg-slate-50" onClick={() => { processAlert(a.id, '已升级'); setMoreOpen(false) }}>
                            仅标记已升级（不建案）
                          </button>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </WbSection>

          <VersionPanel caseId={caseId} handoffKey="watch_alert" />

          <WbSection title="交接确认">
            <HandoffActionBar
              caseId={caseId}
              handoffKey="watch_alert"
              checkedRequired={[
                ...(alertReady ? ['alert'] : []),
                ...(riskReady ? ['risk'] : []),
                ...(opinionReady ? ['opinion'] : []),
              ]}
              validateBefore={(a) => {
                if (a === 'submit') {
                  const cur = alerts.find((x) => x.id === activeAlert)
                  if (!cur?.agencyOpinion.trim()) {
                    return '提交交接前须填写代理所意见'
                  }
                  if (!cur.level) return '请确认风险评级'
                }
                if (a === 'approve' || a === 'authorize' || a === 'file') {
                  const gr = evaluateGuardrails({
                    agent: getAgent('agent-watch'),
                    case: getCase(caseId) ?? null,
                    action: a,
                    persona,
                    role,
                    isEnterprise: role === 'enterprise',
                    handoffKey: 'watch_alert',
                  })
                  const msg = firstGuardrailMessage(gr)
                  if (msg) return msg
                }
                return null
              }}
              onResult={(msg, err) => {
                if (!err) {
                  markChecklistDone(caseId, ['c1', 'c2', 'c3'])
                  addArtifact(caseId, '告警处理意见.md', '监控')
                  addActivity(`「${c?.title}」监控${msg}`)
                  setStep(2)
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
