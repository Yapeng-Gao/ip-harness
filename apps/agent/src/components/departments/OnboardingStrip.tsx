import { useMemo, useState } from 'react'
import { Check, ChevronDown, ChevronRight, Settings2, Sparkles } from 'lucide-react'
import { useOrgConfig } from '../../departments/OrgConfigContext'
import { MAIN_CHAIN_DEPTS, type OrgDept } from '../../departments/orgDepts'
import { getProjectExpert } from '../../projects/experts'
import { ExpertAvatar } from './ExpertAvatar'
import type { ProjectExpertId } from '../../projects/types'

/** 向导只盯八部主链 */
const orderedDepts: OrgDept[] = [...MAIN_CHAIN_DEPTS]

type Props = {
  onConfigure: (seatId: ProjectExpertId, dept: OrgDept) => void
}

const STEPS = ['八部开关', '负责人', '能力挂接'] as const

/**
 * 部门管理内嵌 · 首次编制向导（可收）
 * 只围绕八部：开关 → 负责人 → 能力挂接。
 */
export function OnboardingStrip({ onConfigure }: Props) {
  const {
    onboarded,
    completeOnboarding,
    reopenOnboarding,
    deptConfigs,
    patchDeptConfig,
    deptLabel,
  } = useOrgConfig()
  const [step, setStep] = useState(0)

  const enabledMain = useMemo(
    () =>
      MAIN_CHAIN_DEPTS.filter((d) => deptConfigs[d.id]?.enabled !== false)
        .length,
    [deptConfigs],
  )

  if (onboarded) {
    return (
      <div
        className="flex flex-wrap items-center gap-2 rounded-lg border border-slate-200 bg-white px-3 py-2"
        data-testid="onboarding-done"
      >
        <Check
          className="h-3.5 w-3.5 text-slate-500"
          strokeWidth={2}
          aria-hidden
        />
        <span className="text-[12px] font-medium text-slate-700">
          八部岗已就绪 · {enabledMain}/{MAIN_CHAIN_DEPTS.length}
        </span>
        <button
          type="button"
          onClick={reopenOnboarding}
          className="focus-ring ml-auto rounded px-1.5 py-0.5 text-[11px] font-medium text-slate-600 underline-offset-2 hover:underline"
          data-testid="onboarding-reopen"
        >
          改配置
        </button>
      </div>
    )
  }

  return (
    <details
      className="rounded-lg border border-slate-200 bg-white open:border-sky-200 open:bg-sky-50/30"
      open
      data-testid="onboarding-strip"
    >
      <summary
        className="cursor-pointer list-none px-3 py-2.5"
        id="onboarding-title"
      >
        <span className="flex items-start gap-2">
          <Sparkles
            className="mt-0.5 h-4 w-4 shrink-0 text-sky-700"
            strokeWidth={1.75}
            aria-hidden
          />
          <span className="min-w-0 flex-1">
            <span className="block text-[13px] font-semibold text-slate-900">
              首次编制（可跳过，点下方部门卡也能配）
            </span>
            <span className="mt-0.5 block text-[11px] text-slate-600">
              八部开关 → 确认负责人 → 能力挂接。办活请回大厅或本案。
            </span>
          </span>
        </span>
      </summary>

      <div className="border-t border-slate-100 px-3 pb-3 pt-2">
        <ol className="flex flex-wrap items-center gap-1.5" role="list">
          {STEPS.map((s, i) => {
            const active = i === step
            const done = i < step
            return (
              <li key={s} className="flex items-center gap-1.5">
                <button
                  type="button"
                  onClick={() => setStep(i)}
                  aria-current={active ? 'step' : undefined}
                  className={`focus-ring inline-flex min-h-8 items-center gap-1 rounded-full px-2.5 text-[11px] font-medium transition-colors duration-150 ${
                    active
                      ? 'bg-sky-700 text-white'
                      : done
                        ? 'bg-emerald-100 text-emerald-900'
                        : 'bg-white text-slate-700 hover:bg-slate-50'
                  }`}
                  data-testid={`onboarding-step-${i}`}
                >
                  <span className="tabular">{i + 1}</span>
                  {s}
                  {done ? (
                    <Check className="h-3 w-3" strokeWidth={2} aria-hidden />
                  ) : null}
                </button>
                {i < STEPS.length - 1 ? (
                  <ChevronRight
                    className="h-3 w-3 text-slate-400"
                    strokeWidth={1.75}
                    aria-hidden
                  />
                ) : null}
              </li>
            )
          })}
        </ol>

        <div className="mt-2.5 rounded-md border border-slate-100 bg-white p-2.5">
          {step === 0 ? (
            <div>
              <p className="mb-1.5 text-[11px] text-slate-600">
                仅八部主链；查新/附图等辅链不在此开关。
              </p>
              <ul className="grid gap-1 sm:grid-cols-2 lg:grid-cols-4">
                {orderedDepts.map((d) => {
                  const enabled = deptConfigs[d.id]?.enabled !== false
                  return (
                    <li key={d.id}>
                      <label className="flex cursor-pointer items-center gap-1.5 rounded px-1.5 py-1 hover:bg-slate-50">
                        <input
                          type="checkbox"
                          checked={enabled}
                          onChange={(e) =>
                            patchDeptConfig(d.id, { enabled: e.target.checked })
                          }
                          className="h-3.5 w-3.5 accent-sky-600"
                        />
                        <span className="min-w-0 flex-1 truncate text-[12px] text-slate-800">
                          {deptLabel(d)}
                        </span>
                      </label>
                    </li>
                  )
                })}
              </ul>
            </div>
          ) : null}

          {step === 1 ? (
            <ul className="space-y-1">
              {MAIN_CHAIN_DEPTS.map((d) => {
                const lead = getProjectExpert(d.leadSeatId)
                return (
                  <li
                    key={d.id}
                    className="flex items-center gap-2 rounded px-1.5 py-1"
                  >
                    <span className="w-20 shrink-0 truncate text-[12px] font-medium text-slate-800">
                      {deptLabel(d)}
                    </span>
                    <ExpertAvatar
                      name={lead?.name ?? d.leadSeatId}
                      size="sm"
                      seed={d.leadSeatId}
                    />
                    <span className="min-w-0 flex-1 truncate text-[12px] text-slate-700">
                      {lead?.name ?? d.leadSeatId}
                    </span>
                    <span className="shrink-0 text-[10px] text-slate-500">
                      负责人
                    </span>
                  </li>
                )
              })}
              <li className="px-1.5 pt-1 text-[11px] text-slate-500">
                样机 · 负责人来自花名册，这里只确认
              </li>
            </ul>
          ) : null}

          {step === 2 ? (
            <div className="space-y-1.5">
              <p className="text-[11px] text-slate-600">
                点负责人确认本岗挂哪些领域能力；也可稍后在下方部门卡里改。
              </p>
              <ul className="grid gap-1 sm:grid-cols-2">
                {MAIN_CHAIN_DEPTS.map((d) => {
                  const lead = getProjectExpert(d.leadSeatId)
                  return (
                    <li key={d.id}>
                      <button
                        type="button"
                        onClick={() => onConfigure(d.leadSeatId, d)}
                        className="focus-ring flex min-h-9 w-full items-center gap-1.5 rounded px-1.5 text-left text-[12px] text-slate-800 hover:bg-slate-50"
                      >
                        <Settings2
                          className="h-3.5 w-3.5 shrink-0 text-slate-500"
                          strokeWidth={1.75}
                          aria-hidden
                        />
                        <span className="min-w-0 flex-1 truncate">
                          {lead?.name ?? d.leadSeatId}
                        </span>
                        <ChevronDown
                          className="h-3 w-3 -rotate-90 text-slate-400"
                          strokeWidth={1.75}
                          aria-hidden
                        />
                      </button>
                    </li>
                  )
                })}
              </ul>
            </div>
          ) : null}
        </div>

        <div className="mt-2.5 flex items-center gap-2">
          <span className="text-[11px] text-slate-500">
            第 {step + 1} / {STEPS.length} 步
          </span>
          <div className="ml-auto flex gap-1.5">
            {step > 0 ? (
              <button
                type="button"
                onClick={() => setStep((s) => s - 1)}
                className="focus-ring inline-flex min-h-9 items-center rounded border border-slate-200 bg-white px-2.5 text-[12px] text-slate-700 hover:bg-slate-50"
              >
                上一步
              </button>
            ) : null}
            {step < STEPS.length - 1 ? (
              <button
                type="button"
                onClick={() => setStep((s) => s + 1)}
                className="btn-press focus-ring inline-flex min-h-9 items-center rounded bg-sky-700 px-3 text-[12px] font-medium text-white hover:bg-sky-800"
                data-testid="onboarding-next"
              >
                下一步
              </button>
            ) : (
              <button
                type="button"
                onClick={completeOnboarding}
                className="btn-press focus-ring inline-flex min-h-9 items-center gap-1 rounded bg-slate-900 px-3 text-[12px] font-medium text-white hover:bg-slate-800"
                data-testid="onboarding-complete"
              >
                <Check className="h-3.5 w-3.5" strokeWidth={2} aria-hidden />
                完成配置
              </button>
            )}
          </div>
        </div>
      </div>
    </details>
  )
}
