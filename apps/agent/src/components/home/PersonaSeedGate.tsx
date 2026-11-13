import { useState } from 'react'
import { ENTRY_ROLE_LABEL } from '../../business/entryRole'
import { useEntryRole } from '../../business/useEntryRole'
import {
  jobTendencyLabel,
  savePersonaSeed,
  skipPersonaSeed,
  type PersonaFamiliarity,
  type PersonaJobTendency,
} from '../../business/userPersona'

type Props = {
  onSettled: () => void
}

const JOBS: PersonaJobTendency[] = ['disclosure', 'draft', 'oa', 'unsure']

/**
 * L2 画像种子 · 登录后可跳过 · 角色沿用登录，不重复问
 */
export function PersonaSeedGate({ onSettled }: Props) {
  const { entryRole } = useEntryRole()
  const [jobs, setJobs] = useState<PersonaJobTendency[]>([])
  const [familiarity, setFamiliarity] =
    useState<PersonaFamiliarity>('first')

  const toggleJob = (id: PersonaJobTendency) => {
    setJobs((prev) => {
      if (prev.includes(id)) return prev.filter((j) => j !== id)
      if (prev.length >= 2) return [...prev.slice(1), id]
      return [...prev, id]
    })
  }

  const finish = (skipped: boolean) => {
    if (skipped) {
      skipPersonaSeed(entryRole)
    } else {
      savePersonaSeed({
        roleHint: entryRole,
        jobTendencies: jobs,
        familiarity,
      })
    }
    onSettled()
  }

  return (
    <section
      className="mb-2.5"
      data-testid="persona-seed-gate"
      aria-labelledby="persona-seed-title"
    >
      <div className="mb-1 flex flex-wrap items-baseline gap-x-2 gap-y-0.5">
        <h2
          id="persona-seed-title"
          className="text-[12px] font-semibold text-slate-900"
        >
          先了解你
        </h2>
        <span className="text-[10px] text-slate-500">可跳过 · 不是选今天去哪部</span>
      </div>

      <div className="rounded-[var(--radius-xl)] border border-slate-200 bg-white p-2.5 shadow-[var(--shadow-rest)]">
        <p className="text-[12.5px] leading-snug text-slate-700">
          几句粗画像，方便前台开口。你已以
          <span className="font-medium text-slate-800">
            {ENTRY_ROLE_LABEL[entryRole]}
          </span>
          进门。
        </p>

        <fieldset className="mt-3">
          <legend className="text-[10px] font-semibold text-slate-600">
            常办（最多 2）
          </legend>
          <div className="mt-1 flex flex-wrap gap-1.5">
            {JOBS.map((j) => {
              const on = jobs.includes(j)
              return (
                <button
                  key={j}
                  type="button"
                  aria-pressed={on}
                  onClick={() => toggleJob(j)}
                  className={`btn-press focus-ring rounded-full border px-3 py-1.5 text-[11px] font-medium ${
                    on
                      ? 'border-slate-900 bg-slate-900 text-white'
                      : 'border-slate-200 bg-white text-slate-700'
                  }`}
                  data-testid={`persona-job-${j}`}
                >
                  {jobTendencyLabel(j)}
                </button>
              )
            })}
          </div>
        </fieldset>

        <fieldset className="mt-3">
          <legend className="text-[10px] font-semibold text-slate-600">熟悉度</legend>
          <div className="mt-1 flex flex-wrap gap-1.5" role="radiogroup" aria-label="熟悉度">
            {(
              [
                ['first', '第一次用'],
                ['used_similar', '用过类似工具'],
              ] as const
            ).map(([id, label]) => {
              const on = familiarity === id
              return (
                <button
                  key={id}
                  type="button"
                  role="radio"
                  aria-checked={on}
                  onClick={() => setFamiliarity(id)}
                  className={`btn-press focus-ring rounded-full border px-3 py-1.5 text-[11px] font-medium ${
                    on
                      ? 'border-slate-900 bg-slate-900 text-white'
                      : 'border-slate-200 bg-white text-slate-700'
                  }`}
                  data-testid={`persona-familiarity-${id}`}
                >
                  {label}
                </button>
              )
            })}
          </div>
        </fieldset>

        <div className="mt-3 flex flex-wrap items-center gap-2">
          <button
            type="button"
            className="btn-press focus-ring rounded-md border border-slate-200 bg-white px-2.5 py-1.5 text-[11px] font-medium text-slate-600"
            data-testid="persona-seed-skip"
            onClick={() => finish(true)}
          >
            跳过
          </button>
          <button
            type="button"
            className="btn-press focus-ring ml-auto rounded-md bg-slate-900 px-3 py-1.5 text-[12px] font-semibold text-white hover:bg-slate-800"
            data-testid="persona-seed-continue"
            onClick={() => finish(false)}
          >
            进大厅
          </button>
        </div>
      </div>
    </section>
  )
}
