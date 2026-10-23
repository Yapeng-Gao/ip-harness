import { useMemo, useState } from 'react'
import { Check, ChevronDown, ChevronRight, Settings2, Sparkles } from 'lucide-react'
import { useOrgConfig } from '../../departments/OrgConfigContext'
import {
  MAIN_CHAIN_DEPTS,
  ORG_DEPTS,
  type OrgDept,
} from '../../departments/orgDepts'

/** 主链先、其余随后：让向导的阅读顺序与部门页一致 */
const orderedDepts: OrgDept[] = [
  ...MAIN_CHAIN_DEPTS,
  ...ORG_DEPTS.filter((d) => !MAIN_CHAIN_DEPTS.some((m) => m.id === d.id)),
]
import { getProjectExpert } from '../../projects/experts'
import { ExpertAvatar } from './ExpertAvatar'
import type { ProjectExpertId } from '../../projects/types'

type Props = {
  onConfigure: (seatId: ProjectExpertId, dept: OrgDept) => void
}

const STEPS = ['常设部门', '主责专家', '专家 skill'] as const

/**
 * 部门页内嵌 · 首次配置向导
 * 未完成时置顶三步；完成后收成一行完成态，可重新打开。
 */
export function OnboardingStrip({ onConfigure }: Props) {
  const { onboarded, completeOnboarding, reopenOnboarding, deptConfigs, patchDeptConfig, deptLabel } =
    useOrgConfig()
  const [step, setStep] = useState(0)

  const enabledCount = useMemo(
    () => ORG_DEPTS.filter((d) => deptConfigs[d.id]?.enabled !== false).length,
    [deptConfigs],
  )

  if (onboarded) {
    return (
      <div
        className="flex flex-wrap items-center gap-2 rounded-[var(--radius-lg)] border border-emerald-200/80 bg-emerald-50/50 px-3 py-2"
        data-testid="onboarding-done"
      >
        <Check className="h-3.5 w-3.5 text-emerald-700" strokeWidth={2} aria-hidden />
        <span className="text-[12px] font-medium text-emerald-950">
          组织已配置 · {enabledCount} 个常设部门
        </span>
        <button
          type="button"
          onClick={reopenOnboarding}
          className="focus-ring ml-auto rounded-[var(--radius-sm)] px-1.5 py-0.5 text-[11px] font-medium text-emerald-800 hover:underline"
          data-testid="onboarding-reopen"
        >
          重新配置
        </button>
      </div>
    )
  }

  return (
    <section
      className="rounded-[var(--radius-lg)] border border-sky-200 bg-sky-50/40 p-3"
      aria-labelledby="onboarding-title"
      data-testid="onboarding-strip"
    >
      <div className="flex items-start gap-2">
        <Sparkles className="mt-0.5 h-4 w-4 shrink-0 text-sky-700" strokeWidth={1.75} aria-hidden />
        <div className="min-w-0 flex-1">
          <h2 id="onboarding-title" className="text-[13px] font-semibold text-slate-900">
            先配一遍组织
          </h2>
          <p className="mt-0.5 text-[11px] leading-relaxed text-slate-600">
            选常设部门 → 定主责专家 → 配 skill。之后每次开案都按这套编制走。
          </p>
        </div>
      </div>

      <ol className="mt-2.5 flex flex-wrap items-center gap-1.5" role="list">
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
                {done && <Check className="h-3 w-3" strokeWidth={2} aria-hidden />}
              </button>
              {i < STEPS.length - 1 && (
                <ChevronRight className="h-3 w-3 text-slate-400" strokeWidth={1.75} aria-hidden />
              )}
            </li>
          )
        })}
      </ol>

      <div className="mt-2.5 rounded-[var(--radius-md)] border border-sky-100 bg-white p-2.5">
        {step === 0 && (
          <div>
            <p className="mb-1.5 text-[11px] text-slate-600">
              主作业链默认 8 部；前研与授权后可按需开关。
            </p>
            <ul className="grid gap-1 sm:grid-cols-2 lg:grid-cols-4">
              {orderedDepts.map((d) => {
                const enabled = deptConfigs[d.id]?.enabled !== false
                return (
                  <li key={d.id}>
                    <label className="flex cursor-pointer items-center gap-1.5 rounded-[var(--radius-sm)] px-1.5 py-1 hover:bg-slate-50">
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
        )}

        {step === 1 && (
          <ul className="space-y-1">
            {MAIN_CHAIN_DEPTS.map((d) => {
              const lead = getProjectExpert(d.leadSeatId)
              return (
                <li
                  key={d.id}
                  className="flex items-center gap-2 rounded-[var(--radius-sm)] px-1.5 py-1"
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
                  <span className="shrink-0 text-[10px] text-slate-500">主责</span>
                </li>
              )
            })}
            <li className="px-1.5 pt-1 text-[11px] text-slate-500">
              样机 · 主责来自既有花名册，这里只做确认，不新增人员
            </li>
          </ul>
        )}

        {step === 2 && (
          <div className="space-y-1.5">
            <p className="text-[11px] text-slate-600">
              逐个专家配置 role 与 skill；也可以稍后在部门卡里点齿轮。
            </p>
            <ul className="grid gap-1 sm:grid-cols-2">
              {MAIN_CHAIN_DEPTS.map((d) => {
                const lead = getProjectExpert(d.leadSeatId)
                return (
                  <li key={d.id}>
                    <button
                      type="button"
                      onClick={() => onConfigure(d.leadSeatId, d)}
                      className="focus-ring flex min-h-9 w-full items-center gap-1.5 rounded-[var(--radius-sm)] px-1.5 text-left text-[12px] text-slate-800 hover:bg-slate-50"
                    >
                      <Settings2 className="h-3.5 w-3.5 shrink-0 text-slate-500" strokeWidth={1.75} aria-hidden />
                      <span className="min-w-0 flex-1 truncate">
                        {lead?.name ?? d.leadSeatId}
                      </span>
                      <ChevronDown className="h-3 w-3 -rotate-90 text-slate-400" strokeWidth={1.75} aria-hidden />
                    </button>
                  </li>
                )
              })}
            </ul>
          </div>
        )}
      </div>

      <div className="mt-2.5 flex items-center gap-2">
        <span className="text-[11px] text-slate-500">
          第 {step + 1} / {STEPS.length} 步
        </span>
        <div className="ml-auto flex gap-1.5">
          {step > 0 && (
            <button
              type="button"
              onClick={() => setStep((s) => s - 1)}
              className="focus-ring inline-flex min-h-9 items-center rounded-[var(--radius-sm)] border border-slate-200 bg-white px-2.5 text-[12px] text-slate-700 hover:bg-slate-50"
            >
              上一步
            </button>
          )}
          {step < STEPS.length - 1 ? (
            <button
              type="button"
              onClick={() => setStep((s) => s + 1)}
              className="btn-press focus-ring inline-flex min-h-9 items-center rounded-[var(--radius-sm)] bg-sky-700 px-3 text-[12px] font-medium text-white hover:bg-sky-800"
              data-testid="onboarding-next"
            >
              下一步
            </button>
          ) : (
            <button
              type="button"
              onClick={completeOnboarding}
              className="btn-press focus-ring inline-flex min-h-9 items-center gap-1 rounded-[var(--radius-sm)] bg-slate-900 px-3 text-[12px] font-medium text-white hover:bg-slate-800"
              data-testid="onboarding-complete"
            >
              <Check className="h-3.5 w-3.5" strokeWidth={2} aria-hidden />
              完成配置
            </button>
          )}
        </div>
      </div>
    </section>
  )
}
