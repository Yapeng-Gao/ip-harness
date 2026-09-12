import type { FulfillmentMode, StageId } from '../types'
import { getRaciForStage } from '../data/raci'
import { getStageMeta } from '../data/stages'

const LETTERS = ['R', 'A', 'C', 'I'] as const

function Cell({ on, letter }: { on: boolean; letter: string }) {
  return (
    <td className="px-2 py-1.5 text-center">
      <span
        className={`inline-flex h-6 w-6 items-center justify-center rounded-md text-[11px] font-semibold ${
          on
            ? 'bg-slate-100 text-slate-800 ring-1 ring-slate-200'
            : 'bg-slate-50 text-slate-300'
        }`}
      >
        {on ? letter : '·'}
      </span>
    </td>
  )
}

export function RaciPanel({
  stage,
  mode,
}: {
  stage: StageId
  mode: FulfillmentMode
}) {
  const raci = getRaciForStage(stage, mode)
  const meta = getStageMeta(stage)

  return (
    <div className="rounded-xl border border-slate-200 bg-white p-5">
      <div className="mb-3 flex items-center justify-between gap-2">
        <h2 className="text-sm font-medium text-slate-800">
          RACI 面板 · {meta.shortName}
        </h2>
        <span className="text-[10px] text-slate-400">R 负责 · A 问责 · C 咨询 · I 知会</span>
      </div>
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b border-slate-100 text-[11px] text-slate-500">
            <th className="px-2 py-1.5 text-left font-medium">角色</th>
            {LETTERS.map((l) => (
              <th key={l} className="px-2 py-1.5 text-center font-medium">
                {l}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          <tr className="border-b border-slate-50">
            <td className="px-2 py-1.5 text-xs font-medium text-slate-700">企业</td>
            {LETTERS.map((l) => (
              <Cell key={l} letter={l} on={raci.enterprise[l]} />
            ))}
          </tr>
          <tr className={raci.agencyDisabled ? 'opacity-45' : ''}>
            <td className="px-2 py-1.5 text-xs font-medium text-slate-700">
              代理
              {raci.agencyDisabled && (
                <span className="ml-1.5 rounded bg-slate-100 px-1.5 py-0.5 text-[10px] text-slate-500">
                  未委托
                </span>
              )}
            </td>
            {LETTERS.map((l) => (
              <Cell key={l} letter={l} on={!raci.agencyDisabled && raci.agency[l]} />
            ))}
          </tr>
        </tbody>
      </table>
      {raci.note && (
        <p className="mt-3 rounded-lg bg-slate-50 px-3 py-2 text-[11px] text-slate-500 ring-1 ring-slate-100">
          {raci.note}
        </p>
      )}
    </div>
  )
}
