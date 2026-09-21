import { useMemo, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useBusinessCases } from '../../business/BusinessCaseContext'
import {
  BUSINESS_DEFAULT_SEAT_IDS,
  BUSINESS_MORE_SEAT_IDS,
  BUSINESS_PHASE_SEAT_IDS,
  BUSINESS_STAGES,
  businessSeatLabel,
} from '../../business/businessSeats'
import type { ProjectExpertId } from '../../projects/types'

/**
 * 新建案子向导 — 时间线 5 段预览 + 默认 7 席；主 CTA ≠ 选专家组队
 */
export function BusinessCaseNewPage() {
  const { createCaseFromWizard } = useBusinessCases()
  const navigate = useNavigate()
  const [step, setStep] = useState(0)
  const [title, setTitle] = useState('')
  const [summary, setSummary] = useState('')
  const [moreOpen, setMoreOpen] = useState(false)
  const [moreSeats, setMoreSeats] = useState<Set<ProjectExpertId>>(new Set())
  const [skipPrepare, setSkipPrepare] = useState(true)

  const steps = useMemo(
    () => [
      { id: 'basic', title: '案子信息' },
      { id: 'timeline', title: '办理路线' },
      { id: 'experts', title: '专家席（默认 7）' },
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

  const onSubmit = () => {
    const p = createCaseFromWizard({
      title: title.trim() || '未命名案子',
      summary: summary.trim(),
      moreSeatIds: [...moreSeats],
      skipPrepare,
    })
    navigate(`/agent/cases/${p.id}`)
  }

  return (
    <div
      className="flex-1 overflow-y-auto px-4 py-6 lg:px-8"
      data-testid="business-case-new-page"
    >
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
          按办理路线推进；默认 {BUSINESS_DEFAULT_SEAT_IDS.length}{' '}
          个业务专家席（案子助手静默编排）
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
            <div className="space-y-3">
              <label className="block text-xs text-slate-600">
                案子名称
                <input
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="例如：边缘调度模组"
                  className="focus-ring mt-1 w-full rounded-md border border-slate-200 px-3 py-2 text-sm"
                  data-testid="business-new-title"
                />
              </label>
              <label className="block text-xs text-slate-600">
                一句话目标（可选）
                <textarea
                  value={summary}
                  onChange={(e) => setSummary(e.target.value)}
                  rows={2}
                  className="focus-ring mt-1 w-full rounded-md border border-slate-200 px-3 py-2 text-sm"
                  data-testid="business-new-summary"
                />
              </label>
            </div>
          )}

          {step === 1 && (
            <div>
              <p className="mb-3 text-xs text-slate-600">
                办理路线（可跳过准备，从查新/立项开始）
              </p>
              <ol className="space-y-2">
                {BUSINESS_STAGES.map((s, i) => (
                  <li
                    key={s.id}
                    className="flex gap-3 rounded-lg border border-slate-100 bg-slate-50/80 px-3 py-2"
                  >
                    <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-white text-[11px] font-semibold text-slate-700 shadow-sm">
                      {i + 1}
                    </span>
                    <div>
                      <div className="text-xs font-semibold text-slate-800">
                        {s.title}
                      </div>
                      <div className="text-[11px] text-slate-500">{s.blurb}</div>
                    </div>
                  </li>
                ))}
              </ol>
              <label className="mt-3 flex items-center gap-2 text-xs text-slate-700">
                <input
                  type="checkbox"
                  checked={skipPrepare}
                  onChange={(e) => setSkipPrepare(e.target.checked)}
                  data-testid="business-skip-prepare"
                />
                跳过准备，直接进入立项
              </label>
            </div>
          )}

          {step === 2 && (
            <div>
              <p className="mb-2 text-xs font-medium text-slate-700">
                默认业务专家席（7）
              </p>
              <div className="flex flex-wrap gap-1.5">
                {BUSINESS_DEFAULT_SEAT_IDS.map((id) => (
                  <span
                    key={id}
                    className="rounded-full border border-slate-200 bg-slate-50 px-2.5 py-1 text-[11px] font-medium text-slate-800"
                    data-testid={`business-default-seat-${id}`}
                  >
                    {businessSeatLabel(id)}
                  </span>
                ))}
              </div>
              <p className="mt-2 text-[11px] text-slate-400">
                案子助手在后台静默编排，不占专家席名额。
              </p>

              <button
                type="button"
                onClick={() => setMoreOpen((v) => !v)}
                className="btn-press focus-ring mt-4 text-xs font-medium text-slate-600 underline-offset-2 hover:underline"
                data-testid="business-more-experts-toggle"
              >
                {moreOpen ? '收起更多专家' : '更多专家（可选）'}
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

        <div className="mt-4 flex items-center justify-between gap-2">
          <button
            type="button"
            disabled={step === 0}
            onClick={() => setStep((s) => Math.max(0, s - 1))}
            className="btn-press focus-ring rounded-md border border-slate-200 bg-white px-3 py-2 text-xs font-medium text-slate-700 disabled:opacity-40"
          >
            上一步
          </button>
          {step < steps.length - 1 ? (
            <button
              type="button"
              onClick={() => setStep((s) => s + 1)}
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
              创建并进入案子
            </button>
          )}
        </div>
      </div>
    </div>
  )
}
