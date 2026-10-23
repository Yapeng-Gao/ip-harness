import { useMemo, useState } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { useBusinessCases } from '../../business/BusinessCaseContext'
import {
  buildCasePlanFromIntake,
  type CaseIntakeAnswers,
} from '../../business/casePlanDrive'
import {
  BUSINESS_DEFAULT_SEAT_IDS,
  BUSINESS_MORE_SEAT_IDS,
  BUSINESS_PHASE_SEAT_IDS,
  BUSINESS_STAGES,
  businessSeatLabel,
  expertsInNode,
  type BusinessStageId,
} from '../../business/businessSeats'
import type { ProjectExpertId } from '../../projects/types'
import type { BusinessHomeStartState } from './BusinessCasesPage'

const DEFAULT_INTAKE: CaseIntakeAnswers = {
  protectWhat: '',
  materialsReady: '不清',
  urgency: '一般',
}

/**
 * 新建案子向导 — 摸底 → 本案计划 → 节点；主 CTA ≠ 选专家组队
 * 底栏 sticky：上一步/下一步始终可见，不被长列表顶出视口。
 */
export function BusinessCaseNewPage() {
  const { createCaseFromWizard } = useBusinessCases()
  const navigate = useNavigate()
  const loc = useLocation()
  const start = (loc.state ?? null) as BusinessHomeStartState | null
  const [step, setStep] = useState(0)
  const [title, setTitle] = useState(() => start?.title?.trim() ?? '')
  const [summary, setSummary] = useState(() => start?.summary?.trim() ?? '')
  const [moreOpen, setMoreOpen] = useState(false)
  const [moreSeats, setMoreSeats] = useState<Set<ProjectExpertId>>(new Set())
  const [skipPrepare, setSkipPrepare] = useState(() => start?.chip !== 'disclosure')
  /** 办理路线选中态（展示用；点卡可直接进下一步） */
  const [routeId, setRouteId] = useState<BusinessStageId | null>(() =>
    start?.chip === 'disclosure' ? 'prepare' : 'intake',
  )
  const [intake, setIntake] = useState<CaseIntakeAnswers>(() => ({
    ...DEFAULT_INTAKE,
    protectWhat: start?.summary?.trim() ?? '',
  }))
  const [casePlan, setCasePlan] = useState('')
  const [planSeeded, setPlanSeeded] = useState(false)
  const [deptListOpen, setDeptListOpen] = useState(false)

  const steps = useMemo(
    () => [
      { id: 'basic', title: '案子信息' },
      { id: 'timeline', title: '办理路线' },
      { id: 'plan', title: '本案计划' },
      { id: 'roster', title: '节点' },
    ],
    [],
  )

  const toggleMore = (id: ProjectExpertId) => {
    setMoreSeats((prev) => {
      const next = new Set(prev)
      if (next.has(id)) next.delete(id)
      else next.add(id)
      return next
    })
  }

  const regeneratePlan = () => {
    const seeded = buildCasePlanFromIntake({
      title,
      summary,
      answers: {
        ...intake,
        protectWhat: intake.protectWhat.trim() || summary.trim(),
      },
      skipPrepare,
      routeId,
    })
    setCasePlan(seeded)
    setPlanSeeded(true)
  }

  const ensurePlanSeed = () => {
    if (planSeeded && casePlan.trim()) return
    regeneratePlan()
  }

  const goNext = () => {
    const next = Math.min(steps.length - 1, step + 1)
    if (steps[next]?.id === 'plan') ensurePlanSeed()
    setStep(next)
  }
  const goPrev = () => setStep((s) => Math.max(0, s - 1))

  const pickRoute = (id: BusinessStageId, advance = false) => {
    const nextSkip = id !== 'prepare'
    setRouteId(id)
    setSkipPrepare(nextSkip)
    setPlanSeeded(false)
    if (advance) {
      setStep(2)
      // 进入计划步时按新路线生成
      const seeded = buildCasePlanFromIntake({
        title,
        summary,
        answers: {
          ...intake,
          protectWhat: intake.protectWhat.trim() || summary.trim(),
        },
        skipPrepare: nextSkip,
        routeId: id,
      })
      setCasePlan(seeded)
      setPlanSeeded(true)
    }
  }

  const onSubmit = () => {
    const plan =
      casePlan.trim() ||
      buildCasePlanFromIntake({
        title,
        summary,
        answers: {
          ...intake,
          protectWhat: intake.protectWhat.trim() || summary.trim(),
        },
        skipPrepare,
        routeId,
      })
    const p = createCaseFromWizard({
      title: title.trim() || '未命名案子',
      summary: summary.trim() || intake.protectWhat.trim(),
      moreSeatIds: [...moreSeats],
      skipPrepare,
      casePlan: plan,
    })
    navigate(`/agent/cases/${p.id}`)
  }

  return (
    <div
      className="flex min-h-0 flex-1 flex-col"
      data-testid="business-case-new-page"
    >
      <div className="min-h-0 flex-1 overflow-y-auto px-4 py-6 lg:px-8">
        <div className="mx-auto max-w-xl">
          <div className="mb-4 text-[11px] text-slate-400">
            <Link to="/agent" className="hover:underline">
              我的案子
            </Link>
            <span className="mx-1">/</span>
            新建案子
          </div>
          <h1 className="text-[20px] font-semibold text-slate-900">新建案子</h1>
          <p className="mt-1 text-sm text-slate-500">
            外挂知识产权部 · 先轻量摸底，建完进公司首页再进部门干活
          </p>

          <ol className="mt-4 flex flex-wrap gap-2">
            {steps.map((s, i) => (
              <li
                key={s.id}
                className={`rounded-full px-2.5 py-1 text-[11px] font-medium ${
                  i === step
                    ? 'bg-slate-900 text-white'
                    : i < step
                      ? 'bg-emerald-50 text-emerald-800'
                      : 'bg-slate-100 text-slate-500'
                }`}
              >
                {i + 1}. {s.title}
              </li>
            ))}
          </ol>

          <div className="mt-5 rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
            {step === 0 && (
              <div className="space-y-3" data-testid="business-wizard-step-basic">
                <label className="block text-xs text-slate-600">
                  案子名称
                  <input
                    value={title}
                    onChange={(e) => {
                      setTitle(e.target.value)
                      setPlanSeeded(false)
                    }}
                    placeholder="例如：边缘调度模组"
                    className="focus-ring mt-1 w-full rounded-md border border-slate-200 px-3 py-2 text-sm"
                    data-testid="business-new-title"
                  />
                </label>
                <label className="block text-xs text-slate-600">
                  一句话目标（可选）
                  <textarea
                    value={summary}
                    onChange={(e) => {
                      setSummary(e.target.value)
                      setPlanSeeded(false)
                      if (!intake.protectWhat.trim()) {
                        setIntake((prev) => ({
                          ...prev,
                          protectWhat: e.target.value,
                        }))
                      }
                    }}
                    rows={2}
                    className="focus-ring mt-1 w-full rounded-md border border-slate-200 px-3 py-2 text-sm"
                    data-testid="business-new-summary"
                  />
                </label>
                <p className="text-[11px] text-slate-400">
                  名称可稍后再改；下一步选办理路线，再摸底生成本案计划。
                </p>
              </div>
            )}

            {step === 1 && (
              <div data-testid="business-wizard-step-route">
                <p className="mb-3 text-xs text-slate-600">
                  办理路线（点卡片可选起点；也可直接点底栏「下一步」）
                </p>
                <ul className="space-y-2" data-testid="business-stages-list">
                  {BUSINESS_STAGES.map((s, i) => {
                    const selected = routeId === s.id
                    return (
                      <li key={s.id}>
                        <button
                          type="button"
                          onClick={() => pickRoute(s.id, true)}
                          className={`focus-ring flex w-full gap-3 rounded-lg border px-3 py-2.5 text-left transition ${
                            selected
                              ? 'border-slate-800 bg-slate-900 text-white shadow-sm'
                              : 'border-slate-100 bg-slate-50/80 hover:border-slate-300 hover:bg-white'
                          }`}
                          data-testid={`business-stage-card-${s.id}`}
                          aria-pressed={selected}
                        >
                          <span
                            className={`flex h-6 w-6 shrink-0 items-center justify-center rounded-full text-[11px] font-semibold ${
                              selected
                                ? 'bg-white text-slate-900'
                                : 'bg-white text-slate-700 shadow-sm'
                            }`}
                          >
                            {i + 1}
                          </span>
                          <div className="min-h-0">
                            <div
                              className={`text-xs font-semibold ${
                                selected ? 'text-white' : 'text-slate-800'
                              }`}
                            >
                              {s.title}
                            </div>
                            <div
                              className={`text-[11px] ${
                                selected ? 'text-slate-300' : 'text-slate-500'
                              }`}
                            >
                              {s.blurb}
                            </div>
                          </div>
                        </button>
                      </li>
                    )
                  })}
                </ul>
                <label className="mt-3 flex items-center gap-2 text-xs text-slate-700">
                  <input
                    type="checkbox"
                    checked={skipPrepare}
                    onChange={(e) => {
                      const on = e.target.checked
                      setSkipPrepare(on)
                      setRouteId(on ? 'intake' : 'prepare')
                      setPlanSeeded(false)
                    }}
                    data-testid="business-skip-prepare"
                  />
                  跳过准备，直接进入立项（仍会整理本案计划）
                </label>
              </div>
            )}

            {step === 2 && (
              <div className="space-y-3" data-testid="business-wizard-step-plan">
                <p className="text-xs text-slate-600">
                  先答 3 个摸底问，再生成可改的计划骨架（不是专家超市）。
                </p>
                <div
                  className="space-y-2 rounded-lg border border-slate-100 bg-slate-50/60 p-3"
                  data-testid="business-intake-questions"
                >
                  <label className="block text-xs text-slate-600">
                    要保护什么？
                    <input
                      value={intake.protectWhat}
                      onChange={(e) => {
                        setIntake((p) => ({ ...p, protectWhat: e.target.value }))
                        setPlanSeeded(false)
                      }}
                      placeholder="技术方案 / 产品点 / 流程…"
                      className="focus-ring mt-1 w-full rounded-md border border-slate-200 bg-white px-3 py-2 text-sm"
                      data-testid="business-intake-protect"
                    />
                  </label>
                  <fieldset className="text-xs text-slate-600">
                    <legend className="mb-1">材料齐不齐？</legend>
                    <div className="flex flex-wrap gap-1.5">
                      {(['齐', '缺', '不清'] as const).map((v) => (
                        <button
                          key={v}
                          type="button"
                          onClick={() => {
                            setIntake((p) => ({ ...p, materialsReady: v }))
                            setPlanSeeded(false)
                          }}
                          className={`rounded-md border px-2.5 py-1 text-[11px] font-medium ${
                            intake.materialsReady === v
                              ? 'border-slate-800 bg-slate-900 text-white'
                              : 'border-slate-200 bg-white text-slate-700'
                          }`}
                          data-testid={`business-intake-materials-${v}`}
                          aria-pressed={intake.materialsReady === v}
                        >
                          {v}
                        </button>
                      ))}
                    </div>
                  </fieldset>
                  <fieldset className="text-xs text-slate-600">
                    <legend className="mb-1">急不急？</legend>
                    <div className="flex flex-wrap gap-1.5">
                      {(['急', '一般', '不急'] as const).map((v) => (
                        <button
                          key={v}
                          type="button"
                          onClick={() => {
                            setIntake((p) => ({ ...p, urgency: v }))
                            setPlanSeeded(false)
                          }}
                          className={`rounded-md border px-2.5 py-1 text-[11px] font-medium ${
                            intake.urgency === v
                              ? 'border-slate-800 bg-slate-900 text-white'
                              : 'border-slate-200 bg-white text-slate-700'
                          }`}
                          data-testid={`business-intake-urgency-${v}`}
                          aria-pressed={intake.urgency === v}
                        >
                          {v}
                        </button>
                      ))}
                    </div>
                  </fieldset>
                  <button
                    type="button"
                    className="btn-press focus-ring rounded-md bg-slate-800 px-3 py-1.5 text-[11px] font-semibold text-white"
                    data-testid="business-intake-generate-plan"
                    onClick={regeneratePlan}
                  >
                    {casePlan.trim() ? '按摸底刷新计划' : '生成本案计划'}
                  </button>
                </div>
                <label className="block text-xs text-slate-600">
                  本案计划（可改）
                  <textarea
                    value={casePlan}
                    onChange={(e) => setCasePlan(e.target.value)}
                    onFocus={ensurePlanSeed}
                    rows={8}
                    className="focus-ring mt-1 w-full rounded-md border border-slate-200 px-3 py-2 font-mono text-[12px] leading-relaxed text-slate-800"
                    data-testid="business-new-case-plan"
                    placeholder="答完摸底后点「生成本案计划」…"
                  />
                </label>
              </div>
            )}

            {step === 3 && (
              <div data-testid="business-wizard-step-roster">
                <p className="mb-2 text-xs font-medium text-slate-700">
                  节点（默认 7）
                </p>
                <p className="mb-2 text-[11px] text-slate-500">
                  与侧栏「本案节点」一致：一站一个节点，点进去干活、交卷。撰写里还有权要和说明书，可以分开聊。
                </p>
                <button
                  type="button"
                  onClick={() => setDeptListOpen((v) => !v)}
                  className="btn-press focus-ring text-xs font-medium text-slate-600 underline-offset-2 hover:underline"
                  data-testid="business-default-depts-toggle"
                >
                  {deptListOpen
                    ? '收起默认 7 个节点'
                    : '展开默认 7 个节点（可选）'}
                </button>
                {deptListOpen && (
                  <ul
                    className="mt-2 space-y-1 rounded-lg border border-slate-100 bg-slate-50/50 p-3"
                    data-testid="business-default-depts"
                  >
                    {BUSINESS_DEFAULT_SEAT_IDS.map((id) => {
                      const experts = expertsInNode(id)
                      return (
                        <li
                          key={id}
                          className="text-[11px] text-slate-700"
                          data-testid={`business-default-node-${id}`}
                        >
                          <span className="font-medium">{businessSeatLabel(id)}</span>
                          {experts.length >= 2 ? (
                            <span className="text-slate-400">
                              {' '}
                              · {experts.map((e) => e.label).join('、')}
                            </span>
                          ) : null}
                        </li>
                      )
                    })}
                  </ul>
                )}
                <p className="mt-2 text-[11px] text-slate-400">
                  案子助手在后台静默编排，不算节点。
                </p>

                <button
                  type="button"
                  onClick={() => setMoreOpen((v) => !v)}
                  className="btn-press focus-ring mt-4 text-xs font-medium text-slate-600 underline-offset-2 hover:underline"
                  data-testid="business-more-experts-toggle"
                >
                  {moreOpen ? '收起更多节点' : '更多节点（可选）'}
                </button>
                {moreOpen && (
                  <div className="mt-2 space-y-2 rounded-lg border border-dashed border-slate-200 bg-slate-50/50 p-3">
                    <div className="flex flex-wrap gap-1.5">
                      {BUSINESS_MORE_SEAT_IDS.map((id) => {
                        const on = moreSeats.has(id)
                        return (
                          <button
                            key={id}
                            type="button"
                            onClick={() => toggleMore(id)}
                            className={`rounded-full border px-2.5 py-1 text-[11px] ${
                              on
                                ? 'border-slate-800 bg-slate-900 text-white'
                                : 'border-slate-200 bg-white text-slate-700'
                            }`}
                            data-testid={`business-more-seat-${id}`}
                          >
                            {businessSeatLabel(id)}
                          </button>
                        )
                      })}
                    </div>
                    <p className="text-[11px] text-slate-400">
                      即将推出 · 布局/维权灰显（≠ FTO）
                    </p>
                    <div
                      className="flex flex-wrap gap-1.5"
                      data-testid="business-phase-seats"
                    >
                      {BUSINESS_PHASE_SEAT_IDS.map((id) => (
                        <span
                          key={id}
                          className="cursor-not-allowed rounded-full border border-slate-200 bg-slate-100 px-2.5 py-1 text-[11px] text-slate-400"
                          title="即将推出"
                          data-testid={`business-phase-seat-${id}`}
                        >
                          {businessSeatLabel(id)}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* 底栏始终可见：不随长列表滚出视口 */}
      <div
        className="sticky bottom-0 z-20 shrink-0 border-t border-slate-200 bg-white/95 px-4 py-3 backdrop-blur supports-[backdrop-filter]:bg-white/90"
        data-testid="business-wizard-footer"
      >
        <div className="mx-auto flex max-w-xl items-center justify-between gap-2">
          <button
            type="button"
            disabled={step === 0}
            onClick={goPrev}
            className="btn-press focus-ring rounded-md border border-slate-200 bg-white px-3 py-2 text-xs font-medium text-slate-700 disabled:opacity-40"
            data-testid="business-new-prev"
          >
            上一步
          </button>
          {step < steps.length - 1 ? (
            <button
              type="button"
              onClick={goNext}
              className="btn-press focus-ring rounded-md bg-slate-900 px-4 py-2 text-xs font-semibold text-white"
              data-testid="business-new-next"
            >
              下一步
            </button>
          ) : (
            <button
              type="button"
              onClick={onSubmit}
              className="btn-press focus-ring rounded-md bg-slate-900 px-4 py-2 text-xs font-semibold text-white"
              data-testid="business-new-submit"
            >
              创建并进入公司首页
            </button>
          )}
        </div>
      </div>
    </div>
  )
}
