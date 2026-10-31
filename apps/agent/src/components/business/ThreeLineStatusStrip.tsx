import type { CaseProgress } from '../../business/BusinessCaseContext'
import { threeLineStatus } from '../../business/threeLineStatus'

type Props = {
  prog: Pick<CaseProgress, 'doneSeatIds' | 'filed' | 'oaRound' | 'completedStages'>
  /** 紧凑：公司首页；宽：工作台顶 */
  dense?: boolean
}

/**
 * 三线分名词条 · 交互大纲原则 3 / 00 §6.1
 * 机制：分开展示 ④全绿 / ⑤过线 / ⑥本轮 D 过线，禁止混成一条「已过」。
 */
export function ThreeLineStatusStrip({ prog, dense = false }: Props) {
  const rows = threeLineStatus(prog)
  return (
    <section
      className={
        dense
          ? 'rounded-lg border border-slate-200 bg-slate-50/80 px-3 py-2'
          : 'rounded-xl border border-slate-200 bg-white px-3 py-2.5 shadow-sm'
      }
      data-testid="three-line-status"
      aria-label="三线分名"
    >
      <div className="mb-1.5 flex flex-wrap items-baseline gap-2">
        <h3 className="text-[11px] font-semibold text-slate-800">三线分名</h3>
        <span className="text-[10px] text-slate-500">
          ④全绿 ≠ ⑤过线 ≠ ⑥本轮 D 过线 · 勿混
        </span>
      </div>
      <ul className="flex flex-wrap gap-1.5" data-testid="three-line-chips">
        {rows.map((r) => (
          <li
            key={r.key}
            className={`min-w-0 flex-1 basis-[9rem] rounded-lg border px-2 py-1.5 ${
              r.reached
                ? 'border-emerald-200 bg-emerald-50/80'
                : 'border-slate-200 bg-white'
            }`}
            data-testid={`three-line-${r.key}`}
            data-reached={r.reached ? '1' : '0'}
          >
            <p
              className={`text-[11px] font-semibold ${
                r.reached ? 'text-emerald-900' : 'text-slate-800'
              }`}
            >
              {r.label}
              <span className="ml-1 text-[10px] font-medium opacity-80">
                {r.reached ? '· 到' : '· 未'}
              </span>
            </p>
            <p className="mt-0.5 text-[10px] leading-snug text-slate-600">{r.detail}</p>
            <p className="mt-0.5 text-[9px] text-slate-400">{r.not}</p>
          </li>
        ))}
      </ul>
    </section>
  )
}
