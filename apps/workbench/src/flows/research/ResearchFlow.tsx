import { useEffect, useMemo, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { ArrowRight } from 'lucide-react'
import { useApp } from '@shared/context/AppContext'
import { usePersistedFlowStep } from '@shared/hooks/usePersistedFlowStep'
import { stepsForFlow } from '@shared/data/flowSteps'
import { researchSeed } from '@shared/data/workbenchSeeds'
import {
  CasePicker,
  Field,
  FlowHeader,
  HandoffActionBar,
  SplitDraft,
  Stepper,
  ToastBanner, nextActionsForStage,
  btnSuccess,
  inputCls,
  panelCls,
  textareaCls,
} from '../../components/FlowChrome'
import { VersionPanel } from '../../components/VersionPanel'
import { WbSection, WbField } from '../../components/FormBlocks'
import { WorkbenchInsightDataBanner } from '../../components/WorkbenchInsightDataBanner'
import {
  evaluateGuardrails,
  firstGuardrailMessage,
} from '@ip/domain'
import { getAgent } from '@shared/data/agents'

const DB_OPTIONS = ['CNIPA', 'USPTO', 'EPO', 'WIPO', 'JPO', 'arXiv']
const FTO_ITEMS = [
  { key: 'claimOverlap', label: '是否存在高度重叠的有效权利要求' },
  { key: 'activePatents', label: '目标市场存在有效专利布局' },
  { key: 'designAround', label: '具备可行规避设计路径' },
  { key: 'licenseNeeded', label: '可能需要许可谈判' },
  { key: 'litigationHistory', label: '权利人有诉讼维权历史' },
]

const STEPS = stepsForFlow('research')

function loadSeed(caseId: string) {
  return researchSeed[caseId] ?? researchSeed.c2
}

export function ResearchFlow() {
  const { caseId: paramId } = useParams()
  const navigate = useNavigate()
  const {
    getCase,
    role, persona,
    addActivity,
    addArtifact,
    markChecklistDone,
    dispatchCommand,
    getHandoff,
    appendCaseDriveItem,
  } = useApp()

  const [caseId, setCaseId] = useState(paramId ?? 'c2')
  const { step, setStep, syncProgressFloor, storedStepIndex } = usePersistedFlowStep(caseId, 'research')
  const [toast, setToast] = useState<string | null>(null)
  const [toastErr, setToastErr] = useState(false)
  const [toastNext, setToastNext] = useState<{ label: string; to: string }[] | undefined>()

  const seed = loadSeed(caseId)
  const [keywords, setKeywords] = useState(seed.keywords)
  const [ipc, setIpc] = useState(seed.ipc)
  const [dateFrom, setDateFrom] = useState(seed.dateFrom)
  const [dateTo, setDateTo] = useState(seed.dateTo)
  const [databases, setDatabases] = useState<string[]>(seed.databases)
  const [selectedResults, setSelectedResults] = useState<string[]>(['r1'])
  const [novelty, setNovelty] = useState(seed.novelty)
  const [inventiveness, setInventiveness] = useState(seed.inventiveness)
  const [noveltyNotes, setNoveltyNotes] = useState('')
  const [conclusionBullets, setConclusionBullets] = useState<string[]>([])
  const [ftoNotes, setFtoNotes] = useState('')
  const [conclusion, setConclusion] = useState(seed.conclusion)
  const [ftoChecks, setFtoChecks] = useState(seed.ftoChecks)
  const [ftoRisk, setFtoRisk] = useState<'低' | '中' | '高'>(seed.ftoRisk)
  const [claimChartRows, setClaimChartRows] = useState(() =>
    seed.searchResults.slice(0, 3).map((h, i) => ({
      id: `cc-${i}`,
      ourFeature: i === 0 ? '能耗约束动态阈值' : i === 1 ? '负载预测候选集' : '调度回写状态',
      prior: `${h.pubNo} · ${h.title}`,
      overlap: h.relevance === '高相关' ? '高' : h.relevance === '中相关' ? '中' : '低',
      note: '示意要素对照',
    })),
  )
  const [draft, setDraft] = useState('')
  const [results, setResults] = useState(seed.searchResults)
  const [sliderPulse, setSliderPulse] = useState(false)
  const [submitAttempted, setSubmitAttempted] = useState(false)
  const [hitInlineError, setHitInlineError] = useState<string | null>(null)

  const c = getCase(caseId)
  const handoff = getHandoff(caseId, 'research_report')

  const selectedHitRows = useMemo(
    () => results.filter((r) => selectedResults.includes(r.id)),
    [results, selectedResults],
  )
  const hitsVerifiable =
    selectedHitRows.length > 0 &&
    selectedHitRows.every(
      (r) =>
        !!(r as { pubNo?: string }).pubNo?.trim() &&
        !!(r as { url?: string }).url?.trim(),
    )
  const unverifiableHits = selectedHitRows.filter(
    (r) =>
      !(r as { pubNo?: string }).pubNo?.trim() ||
      !(r as { url?: string }).url?.trim(),
  )

  useEffect(() => {
    const s = loadSeed(caseId)
    setKeywords(s.keywords)
    setIpc(s.ipc)
    setDateFrom(s.dateFrom)
    setDateTo(s.dateTo)
    setDatabases(s.databases)
    setNovelty(s.novelty)
    setInventiveness(s.inventiveness)
    setConclusion(s.conclusion)
    setFtoChecks(s.ftoChecks)
    setFtoRisk(s.ftoRisk)
    setClaimChartRows(
      s.searchResults.slice(0, 3).map((h, i) => ({
        id: `cc-${i}`,
        ourFeature: i === 0 ? '能耗约束动态阈值' : i === 1 ? '负载预测候选集' : '调度回写状态',
        prior: `${h.pubNo} · ${h.title}`,
        overlap: h.relevance === '高相关' ? '高' : h.relevance === '中相关' ? '中' : '低',
        note: '示意要素对照',
      })),
    )
    setResults(s.searchResults)
    setSelectedResults(s.searchResults[0] ? [s.searchResults[0].id] : [])
    setNoveltyNotes('')
    // step 由 usePersistedFlowStep 按案水合
  }, [caseId])

  useEffect(() => {
    if (paramId && paramId !== caseId) setCaseId(paramId)
  }, [paramId])

  // Selecting/deselecting hits immediately rewrites conclusion + sliders
  useEffect(() => {
    const selected = results.filter((r) => selectedResults.includes(r.id))
    if (selected.length === 0) {
      setNoveltyNotes('尚未选择对比文献。')
      setFtoNotes('选择命中文献后自动生成 FTO 初评要点。')
      setConclusionBullets([])
      setHitInlineError('请至少勾选 1 篇检索命中后再提交（空命中不可过闸）')
      const base = loadSeed(caseId)
      setNovelty(base.novelty)
      setInventiveness(base.inventiveness)
      setSliderPulse(true)
      const t = window.setTimeout(() => setSliderPulse(false), 450)
      return () => window.clearTimeout(t)
    }
    setHitInlineError(null)
    const base = loadSeed(caseId)
    const delta = selected.reduce((s, r) => s + r.noveltyDelta, 0)
    const adjNovelty = Math.max(5, Math.min(95, base.novelty + delta))
    const adjInv = Math.max(5, Math.min(95, base.inventiveness + Math.round(delta * 0.8)))
    setNovelty(adjNovelty)
    setInventiveness(adjInv)
    setSliderPulse(true)
    const pulseTimer = window.setTimeout(() => setSliderPulse(false), 450)
    setNoveltyNotes(
      `已选择 ${selected.length} 篇对比文献：${selected.map((r) => r.pubNo).join('、')}。综合相关度导致新颖性调整为 ${adjNovelty}、创造性调整为 ${adjInv}。高相关文献越多，需更谨慎评估规避空间。`,
    )
    const bullets = selected.map((r) => {
      const assignee = (r as { assignee?: string }).assignee ?? '未知权利人'
      return `对比 ${r.pubNo}（${assignee}）：${r.title} · ${r.relevance} — 需在独权中拉开差异`
    })
    bullets.push(`综合结论倾向：新颖性 ${adjNovelty}/100 · 创造性 ${adjInv}/100`)
    setConclusionBullets(bullets)
    setFtoNotes(
      selected.some((r) => r.relevance === '高相关')
        ? `存在高相关文献（${selected.filter((r) => r.relevance === '高相关').map((r) => r.pubNo).join('、')}），FTO 初评建议关注有效权项重叠与规避设计。`
        : '所选文献相关度中等或偏低，FTO 初评暂无重大阻断信号（示意）。',
    )
    if (selected.some((r) => r.relevance === '高相关') && adjNovelty < 60) {
      setConclusion('有条件可申请')
    } else if (adjNovelty >= 70) {
      setConclusion('可申请')
    }
    return () => window.clearTimeout(pulseTimer)
  }, [selectedResults, caseId]) // eslint-disable-line react-hooks/exhaustive-deps

  const assembled = useMemo(() => {
    const selected = results.filter((r) => selectedResults.includes(r.id))
    const ftoLines = FTO_ITEMS.map(
      (i) => `- ${i.label}：${ftoChecks[i.key] ? '是' : '否'}`,
    ).join('\n')
    return `【立项前调研结论摘要】
案件：${c?.title ?? caseId}
检索关键词：${keywords}
IPC/CPC：${ipc}
检索期间：${dateFrom} ~ ${dateTo}
数据库：${databases.join('、')}

重点对比文献：
${selected.map((r) => `- ${r.pubNo} ${r.title}（${r.relevance}）${(r as { url?: string }).url ? ` · ${(r as { url?: string }).url}` : ' · 无链接'}`).join('\n') || '未选择'}

新颖性研判笔记：${noveltyNotes || '（选择对比文献后自动生成）'}
FTO 笔记：${ftoNotes || '—'}

命中→结论绑定：
${conclusionBullets.map((b) => `• ${b}`).join('\n') || '（未绑定）'}

可专利性评分：新颖性 ${novelty}/100 · 创造性 ${inventiveness}/100
结论：${conclusion}

FTO 初评风险：${ftoRisk}
${ftoLines}

交接状态：${handoff}
角色意见（${role === 'enterprise' ? '企业 IP' : '代理所'}）：
${
  role === 'enterprise'
    ? '建议内部评审确认后转入立项闸门，关注 FTO 风险与预算影响。'
    : '检索报告与初评已就绪，可提交企业确认。'
}
`
  }, [
    c, caseId, keywords, ipc, dateFrom, dateTo, databases, selectedResults, results,
    novelty, inventiveness, noveltyNotes, ftoNotes, conclusionBullets, conclusion, ftoChecks, ftoRisk, role, handoff,
  ])

  useEffect(() => setDraft(assembled), [assembled])

  const showToast = (msg: string, err = false, next?: { label: string; to: string }[]) => {
    setToast(msg)
    setToastErr(err)
    setToastNext(err ? undefined : next)
    setTimeout(() => { setToast(null); setToastNext(undefined) }, err ? 2800 : 8000)
  }

  const toggleDb = (db: string) => {
    setDatabases((prev) =>
      prev.includes(db) ? prev.filter((d) => d !== db) : [...prev, db],
    )
  }

  const toggleResult = (id: string) => {
    setSelectedResults((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id],
    )
    setStep(1)
  }

  const onCaseChange = (id: string) => {
    setCaseId(id)
    navigate(id ? `/workbench/research/${id}` : '/workbench/research', { replace: true })
  }

  const toIntake = async () => {
    if (!c) return showToast('请先选择案件', true)
    if (!draft.trim() || !conclusion) return showToast('请先完成结论摘要', true)
    if (!['approved', 'filed', 'authorized_to_file'].includes(handoff)) {
      return showToast('需企业批准调研结论后方可转入立项（请先走交接审核）', true)
    }
    // 不伪造清单/交接；晋级由 advanceFromWorkbench 校验真实 approved + 清单齐套
    const res = await dispatchCommand(
      {
        type: 'advanceStage',
        caseId: c.id,
        note: '调研结论通过，转入立项决策',
      },
      { actor: 'user', detail: '表单：调研转入立项' },
    )
    if (res.ok) {
      addArtifact(c.id, '调研结论摘要_终稿.md', '报告')
      // 流转诚实：Toast 可选「去立项」，不强制 navigate
      showToast(res.message, false, nextActionsForStage('pre_research', c.id))
    } else showToast(res.message, true)
  }

  // FTO 非空壳：至少勾一项初评要素（风险档位种子常有值，不能单独当闸）
  const ftoReady = Object.values(ftoChecks).some(Boolean)

  // Stepper 只读高亮：与清单/结论进度同步，避免装饰步撒谎
  const progressStep = useMemo(() => {
    if (['approved', 'filed', 'authorized_to_file', 'submitted_to_enterprise', 'enterprise_review'].includes(handoff)) {
      return 4
    }
    if (ftoReady || (ftoRisk && conclusion)) return 3
    if (conclusion || noveltyNotes.trim()) return 2
    if (selectedResults.length > 0) return 1
    if (keywords.trim() || databases.length > 0) return 0
    return 0
  }, [handoff, ftoRisk, ftoChecks, conclusion, noveltyNotes, selectedResults.length, keywords, databases.length])
  const stepperCurrent = Math.max(step, progressStep, storedStepIndex)

  useEffect(() => {
    syncProgressFloor(progressStep)
  }, [progressStep, syncProgressFloor])


  return (
    <div className="p-6 lg:p-8">
      <ToastBanner message={toast} error={toastErr} nextActions={toastNext} />
      <FlowHeader
        title="立项前调研"
        subtitle={
          role === 'enterprise'
            ? '审核检索范围、可专利性与 FTO 风险，决定是否进入立项'
            : '执行多库检索、标注相关性并输出调研结论供企业确认'
        }
        caseData={c}
      />

      <WorkbenchInsightDataBanner compact />
      <div className="mb-4">
        <CasePicker stage="pre_research" selectedId={caseId} onChange={onCaseChange} />
      </div>

      <Stepper steps={STEPS} current={stepperCurrent} />

      <SplitDraft
        rightTitle="调研结论摘要"
        right={
          <textarea
            className={`${textareaCls} min-h-[420px] font-mono text-xs leading-relaxed`}
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
          />
        }
        left={
          <>
            <WbSection title="现有技术检索">
              <div className="grid gap-4 sm:grid-cols-2">
                <WbField label="关键词" required>
                  <input
                    className={inputCls}
                    value={keywords}
                    onChange={(e) => setKeywords(e.target.value)}
                    onFocus={() => setStep(0)}
                  />
                </WbField>
                <WbField label="IPC / CPC" hint="第二轮分类号可选；提交结论时若命中无链接仍阻断">
                  <input className={inputCls} value={ipc} onChange={(e) => setIpc(e.target.value)} placeholder="如 H01M10/0562" />
                </WbField>
                <WbField label="起始日期">
                  <input type="date" className={inputCls} value={dateFrom} onChange={(e) => setDateFrom(e.target.value)} />
                </WbField>
                <WbField label="截止日期">
                  <input type="date" className={inputCls} value={dateTo} onChange={(e) => setDateTo(e.target.value)} />
                </WbField>
              </div>
              <div className="mt-4">
                <span className="mb-2 block text-xs font-medium text-slate-600">数据库</span>
                <div className="flex flex-wrap gap-2">
                  {DB_OPTIONS.map((db) => (
                    <button
                      key={db}
                      type="button"
                      onClick={() => toggleDb(db)}
                      className={`rounded-full px-3 py-1 text-xs ${
                        databases.includes(db)
                          ? 'bg-slate-100 text-slate-800 ring-1 ring-slate-200'
                          : 'bg-slate-100 text-slate-500'
                      }`}
                    >
                      {db}
                    </button>
                  ))}
                </div>
              </div>
            </WbSection>

            <div className={panelCls}>
              <h3 className="mb-3 text-sm font-medium text-slate-800">
                检索结果 · 勾选影响新颖性评分
              </h3>
              <ul className="space-y-2">
                {results.map((r) => (
                  <li key={r.id}>
                    <button
                      type="button"
                      onClick={() => toggleResult(r.id)}
                      className={`btn-press card-hover w-full rounded-xl border px-3 py-2.5 text-left focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-slate-400 ${
                        selectedResults.includes(r.id)
                          ? 'border-slate-300 bg-slate-100 shadow-sm'
                          : 'border-slate-200 bg-white hover:border-slate-200'
                      }`}
                    >
                      <div className="flex items-start justify-between gap-2">
                        <div className="min-w-0">
                          <div className="truncate text-sm text-slate-800">{r.title}</div>
                          <div className="mt-0.5 flex flex-wrap items-center gap-x-2 gap-y-0.5 text-xs text-slate-500">
                            <span className="font-mono text-slate-700">{r.pubNo}</span>
                            {(r as { url?: string }).url ? (
                              <a
                                href={(r as { url?: string }).url}
                                target="_blank"
                                rel="noreferrer"
                                className="text-sky-700 underline"
                                onClick={(e) => e.stopPropagation()}
                              >
                                打开公开页
                              </a>
                            ) : (
                              <span className="text-rose-600">无链接不可提交</span>
                            )}
                            <span>{(r as { assignee?: string }).assignee ?? '—'}</span>
                            <span>{r.date}</span>
                            <span className="rounded bg-slate-100 px-1 py-0.5 text-xs">
                              {(r as { ipc?: string }).ipc ?? 'H01M10/0562'}
                            </span>
                          </div>
                        </div>
                        <div className="flex shrink-0 flex-col items-end gap-1">
                          <span
                            className={`rounded px-1.5 py-0.5 text-xs ${
                              r.relevance === '高相关'
                                ? 'bg-rose-50 text-rose-700'
                                : r.relevance === '中相关'
                                  ? 'bg-amber-50 text-amber-700'
                                  : 'bg-slate-100 text-slate-500'
                            }`}
                          >
                            {r.relevance}
                          </span>
                          <span className="rounded-full border border-slate-200 bg-slate-100 px-1.5 py-0.5 text-xs text-slate-800">
                            {(r as { apiSource?: string }).apiSource ?? '商业API·IncoPat示意'}
                          </span>
                        </div>
                      </div>
                      <p className="mt-1 line-clamp-2 text-xs text-slate-500">{r.abstract}</p>
                    </button>
                  </li>
                ))}
              </ul>
              {noveltyNotes && (
                <p className="mt-3 rounded-xl bg-slate-50 px-3 py-2 text-xs text-slate-600 ring-1 ring-slate-100">
                  {noveltyNotes}
                </p>
              )}
            </div>

            <div className={panelCls}>
              <div className="mb-2 flex flex-wrap items-center gap-2">
                <h3 className="text-sm font-medium text-balance text-slate-800">命中→结论 绑定面板</h3>
                <span className="inline-flex items-center rounded-full border border-slate-200 bg-slate-50 px-2.5 py-0.5 text-xs text-slate-600">
                  {selectedResults.length >= 1 && conclusion ? '已绑定命中' : '提交前须绑定命中'}
                </span>
              </div>
              <p className="mb-3 text-xs text-slate-500">
                勾选/取消命中后立即重写结论要点并调整新颖性/创造性滑杆（示意绑定，非真实法律引擎）
              </p>
              {conclusionBullets.length === 0 ? (
                <p className="rounded-xl bg-rose-50 px-3 py-2 text-xs text-rose-700 ring-1 ring-rose-100" role="alert">
                  尚未绑定 — 请勾选 ≥1 篇命中；空命中将阻断提交
                </p>
              ) : (
                <ul className="space-y-1.5">
                  {conclusionBullets.map((b, i) => (
                    <li key={i} className="rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-xs text-slate-700">
                      {b}
                    </li>
                  ))}
                </ul>
              )}
              {(hitInlineError || (submitAttempted && selectedResults.length === 0)) && (
                <p className="mt-3 rounded-xl bg-rose-50 px-3 py-2 text-xs font-medium text-rose-700 ring-1 ring-rose-200" role="alert">
                  {hitInlineError ?? '请至少勾选 1 篇检索命中后再提交'}
                </p>
              )}
              {selectedResults.length > 0 && !hitsVerifiable && (
                <p className="mt-3 rounded-xl bg-rose-50 px-3 py-2 text-xs font-medium text-rose-700 ring-1 ring-rose-200" role="alert">
                  命中须含可核验 pubNo + 可点 url · 无链接不可提交
                  {unverifiableHits.length
                    ? `（${unverifiableHits.map((r) => r.pubNo || r.id).join('、')}）`
                    : ''}
                </p>
              )}
              {ftoNotes && (
                <p className="mt-3 rounded-xl bg-amber-50 px-3 py-2 text-xs text-amber-900 ring-1 ring-amber-100">
                  FTO 笔记：{ftoNotes}
                </p>
              )}
            </div>

            <div className={panelCls}>
              <h3 className="mb-4 text-sm font-medium text-slate-800">新颖性 / 可专利性评分</h3>
              <Field label={`新颖性：${novelty}`}>
                <input
                  type="range" min={0} max={100} value={novelty}
                  onChange={(e) => { setNovelty(Number(e.target.value)); setStep(2) }}
                  className={`w-full accent-slate-700 ${sliderPulse ? 'slider-pulse' : ''}`}
                  aria-valuetext={`新颖性 ${novelty}`}
                />
              </Field>
              <div className="mt-3">
                <Field label={`创造性：${inventiveness}`}>
                  <input
                    type="range" min={0} max={100} value={inventiveness}
                    onChange={(e) => setInventiveness(Number(e.target.value))}
                    className={`w-full accent-slate-700 ${sliderPulse ? 'slider-pulse' : ''}`}
                    aria-valuetext={`创造性 ${inventiveness}`}
                  />
                </Field>
              </div>
              <div className="mt-3">
                <Field label="结论" required>
                  <select className={inputCls} value={conclusion} onChange={(e) => setConclusion(e.target.value)}>
                    <option>可申请</option>
                    <option>有条件可申请</option>
                    <option>暂不建议申请</option>
                    <option>需补充实验数据</option>
                  </select>
                </Field>
              </div>
            </div>

            <div className={panelCls}>
              <div className="mb-4 flex items-center justify-between">
                <h3 className="text-sm font-medium text-slate-800">FTO 初评</h3>
                <div className="flex gap-1">
                  {(['低', '中', '高'] as const).map((r) => (
                    <button
                      key={r}
                      type="button"
                      onClick={() => { setFtoRisk(r); setStep(3) }}
                      className={`rounded px-2 py-0.5 text-xs ${
                        ftoRisk === r
                          ? r === '高'
                            ? 'bg-rose-50 text-rose-700'
                            : r === '中'
                              ? 'bg-amber-50 text-amber-700'
                              : 'bg-emerald-50 text-emerald-700'
                          : 'bg-slate-100 text-slate-500'
                      }`}
                    >
                      风险{r}
                    </button>
                  ))}
                </div>
              </div>
              <ul className="space-y-2">
                {FTO_ITEMS.map((item) => (
                  <li key={item.key}>
                    <label className="flex cursor-pointer items-start gap-2.5 rounded-lg border border-slate-200 px-3 py-2 hover:bg-slate-50">
                      <input
                        type="checkbox"
                        checked={!!ftoChecks[item.key]}
                        onChange={() =>
                          setFtoChecks((prev) => ({ ...prev, [item.key]: !prev[item.key] }))
                        }
                        className="mt-0.5 accent-slate-700"
                      />
                      <span className="text-sm text-slate-700">{item.label}</span>
                    </label>
                  </li>
                ))}
              </ul>
              <div className="mt-4">
                <div className="mb-2 flex flex-wrap items-center justify-between gap-2">
                  <h4 className="text-xs font-medium text-slate-700">简要素对照表（claim_chart 草稿）</h4>
                  <button
                    type="button"
                    className="rounded-md border border-slate-300 bg-white px-2 py-1 text-[11px] font-medium text-slate-800"
                    onClick={() => {
                      const summary = claimChartRows
                        .map((r) => `${r.ourFeature} ↔ ${r.prior} · 重叠${r.overlap}`)
                        .join('；')
                      appendCaseDriveItem(caseId, {
                        kind: 'claim_chart',
                        title: 'FTO 简要素对照表（草稿）',
                        summary: summary || '空表',
                        source: 'research-fto',
                      })
                      addArtifact(caseId, 'claim_chart_FTO草稿.md', '对照表')
                      addActivity(`「${c?.title}」已写入 claim_chart 草稿至案级 Drive`)
                      showToast('已写入 Drive：claim_chart 草稿')
                    }}
                  >
                    写入 Drive
                  </button>
                </div>
                <div className="overflow-x-auto rounded-lg border border-slate-200">
                  <table className="min-w-full text-left text-[11px] text-slate-700">
                    <thead className="bg-slate-50 text-slate-500">
                      <tr>
                        <th className="px-2 py-1.5 font-medium">我方案要素</th>
                        <th className="px-2 py-1.5 font-medium">对比文献</th>
                        <th className="px-2 py-1.5 font-medium">重叠</th>
                        <th className="px-2 py-1.5 font-medium">备注</th>
                      </tr>
                    </thead>
                    <tbody>
                      {claimChartRows.map((r) => (
                        <tr key={r.id} className="border-t border-slate-100">
                          <td className="px-2 py-1.5">{r.ourFeature}</td>
                          <td className="px-2 py-1.5">{r.prior}</td>
                          <td className="px-2 py-1.5">{r.overlap}</td>
                          <td className="px-2 py-1.5">
                            <input
                              className="w-full rounded border border-slate-200 px-1 py-0.5"
                              value={r.note}
                              onChange={(e) =>
                                setClaimChartRows((prev) =>
                                  prev.map((x) =>
                                    x.id === r.id ? { ...x, note: e.target.value } : x,
                                  ),
                                )
                              }
                            />
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>

            <VersionPanel caseId={caseId} handoffKey="research_report" />
            <div className={panelCls}>
              <HandoffActionBar
                caseId={caseId}
                handoffKey="research_report"
                checkedRequired={[
                  ...(keywords.trim() ? ['kw'] : []),
                  ...(databases.length > 0 ? ['db'] : []),
                  ...(selectedResults.length > 0 ? ['hits'] : []),
                  ...(hitsVerifiable ? ['hits_verifiable'] : []),
                  ...(conclusion ? ['conclusion'] : []),
                  ...(conclusionBullets.length > 0 ? ['binding'] : []),
                  ...(ftoReady ? ['fto'] : []),
                ]}
                blockPrimary={
                  selectedResults.length === 0 ||
                  conclusionBullets.length === 0 ||
                  !conclusion ||
                  !hitsVerifiable ||
                  !ftoReady
                }
                inlineError={
                  selectedResults.length === 0
                    ? '空命中不可提交：请勾选 ≥1 篇对比文献以绑定结论'
                    : conclusionBullets.length === 0
                      ? '命中→结论绑定未完成'
                      : !conclusion
                        ? '请选择可专利性结论'
                        : !ftoReady
                          ? '请完成 FTO 初评：至少勾选一项要素'
                          : !hitsVerifiable
                            ? '命中须可核验（pubNo+url）· hits_verifiable'
                            : null
                }
                validateBefore={(action) => {
                  if (action === 'submit') setSubmitAttempted(true)
                  if (action === 'submit' && (!keywords.trim() || databases.length === 0)) {
                    return '请填写关键词并选择至少一个数据库'
                  }
                  if (action === 'submit' && selectedResults.length < 1) {
                    setHitInlineError('请至少勾选 1 篇检索命中后再提交（空命中不可过闸）')
                    return '请至少勾选 1 篇检索命中后再提交'
                  }
                  if (action === 'submit' && !conclusion) return '请选择结论（结论不可为空）'
                  if (action === 'submit' && conclusionBullets.length === 0) {
                    return '命中→结论绑定为空，请选择对比文献'
                  }
                  if (action === 'submit' && !ftoReady) return '请完成 FTO 初评：至少勾选一项要素'
                  // hits_verifiable · 与 Agent Seal/ConfirmBar 同源【唯一入口】
                  if (action === 'submit' || action === 'approve') {
                    const gr = evaluateGuardrails({
                      agent: getAgent('agent-research'),
                      case: getCase(caseId) ?? null,
                      action,
                      persona,
                      role,
                      isEnterprise: role === 'enterprise',
                      handoffKey: 'research_report',
                      hitsVerifiable,
                    })
                    const msg = firstGuardrailMessage(gr)
                    if (msg) return msg
                  }
                  return null
                }}
                onResult={(msg, err) => {
                  if (!err && msg.includes('提交')) {
                    addArtifact(caseId, '调研结论摘要_提交评审.md', '报告')
                    markChecklistDone(caseId, ['c1', 'c2', 'c3', 'c4'])
                    setStep(4)
                    appendCaseDriveItem(caseId, {
                      kind: 'research_note',
                      title: '调研结论已提交',
                      summary: `FTO ${ftoRisk} · 对照行 ${claimChartRows.length}`,
                      source: 'research-submit',
                    })
                  }
                  if (!err && (msg.includes('批准') || msg.includes('授权'))) {
                    markChecklistDone(caseId, ['c1', 'c2', 'c3', 'c4', 'c5'])
                    appendCaseDriveItem(caseId, {
                      kind: 'approval',
                      title: '调研交接批准/授权',
                      // 与 Agent HITL「调研批准」及提交态 FTO 摘要同族
                      summary: `调研批准 · FTO ${ftoRisk} · 对照行 ${claimChartRows.length}`,
                      source: 'research-handoff',
                    })
                  }
                  if (!err && msg.includes('草稿')) {
                    addArtifact(caseId, '调研结论摘要_草稿.md', '报告')
                    addActivity(`「${c?.title}」调研结论草稿已保存`)
                  }
                  const next =
                    !err && (msg.includes('提交') || msg.includes('批准') || msg.includes('授权'))
                      ? nextActionsForStage('pre_research', caseId)
                      : undefined
                  showToast(msg, err, next)
                }}
              />
              {role === 'enterprise' && ['approved', 'authorized_to_file', 'filed'].includes(handoff) && (
                <button type="button" className={`${btnSuccess} mt-3`} onClick={toIntake}>
                  <ArrowRight className="h-4 w-4" /> 转入立项闸门
                </button>
              )}
            </div>
          </>
        }
      />
    </div>
  )
}
