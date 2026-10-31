import type { CaseProgress } from '../../business/BusinessCaseContext'
import { threeLineStatus } from '../../business/threeLineStatus'

type Props = {
  prog: Pick<CaseProgress, 'doneSeatIds' | 'filed' | 'oaRound' | 'completedStages'>
  /** 紧凑：公司首页；宽：工作台顶 */
  dense?: boolean
  /** 部台中栏：默认折起，降信息墙（一行摘要） */
  foldByDefault?: boolean
}

/**
 * 三线分名词条 · 交互大纲原则 3 / 00 §6.1
 * 机制：分开展示 ④全绿 / ⑤过线 / ⑥本轮 D 过线，禁止混成一条「已过」。
 */
export function ThreeLineStatusStrip({
  prog,
  dense = false,
  foldByDefault = false,
}: Props) {
  const rows = threeLineStatus(prog)
  const reached = rows.filter((r) => r.reached).length
  const body = (
    <>
      <div className={`flex flex-wrap items-baseline gap-2 ${dense ? 'mb-1' : 'mb-1.5'}`}>
        {!foldByDefault ? (
          <h3 className="text-[11px] font-semibold text-slate-800">三线分名</h3>
        ) : null}
        {!dense ? (
          <span className="text-[10px] text-slate-500">
            ④全绿 ≠ ⑤过线 ≠ ⑥本轮 D 过线 · 勿混
          </span>
        ) : !foldByDefault ? (
          <span className="text-[9px] text-slate-400" title="④全绿 ≠ ⑤过线 ≠ ⑥本轮 D 过线 · 勿混">
            分开展示 · 勿混
          </span>
        ) : null}
      </div>
      <ul
        className={`flex flex-wrap ${dense ? 'gap-1' : 'gap-1.5'}`}
        data-testid="three-line-chips"
      >
        {rows.map((r) => (
          <li
            key={r.key}
            className={
              dense
                ? `rounded-full border px-2 py-0.5 ${
                    r.reached
                      ? 'border-emerald-200 bg-emerald-50/80'
                      : 'border-slate-200 bg-white'
                  }`
                : `min-w-0 flex-1 basis-[9rem] rounded-lg border px-2 py-1.5 ${
                    r.reached
                      ? 'border-emerald-200 bg-emerald-50/80'
                      : 'border-slate-200 bg-white'
                  }`
            }
            data-testid={`three-line-${r.key}`}
            data-reached={r.reached ? '1' : '0'}
            title={dense ? `${r.detail} · ${r.not}` : undefined}
          >
            <p
              className={`font-semibold ${
                dense ? 'text-[10px]' : 'text-[11px]'
              } ${r.reached ? 'text-emerald-900' : 'text-slate-800'}`}
            >
              {r.label}
              <span className="ml-1 text-[10px] font-medium opacity-80">
                {r.reached ? '· 到' : '· 未'}
              </span>
            </p>
            {!dense ? (
              <>
                <p className="mt-0.5 text-[10px] leading-snug text-slate-600">{r.detail}</p>
                <p className="mt-0.5 text-[9px] text-slate-400">{r.not}</p>
              </>
            ) : null}
          </li>
        ))}
      </ul>
    </>
  )

  if (foldByDefault) {
    return (
      <details
        className={
          dense
            ? 'rounded-md border border-slate-200/80 bg-slate-50/60 px-2 py-1.5'
            : 'rounded-xl border border-slate-200 bg-white px-3 py-2.5 shadow-sm'
        }
        data-testid="three-line-status"
        data-dense={dense ? '1' : '0'}
        data-fold="1"
        aria-label="三线分名"
      >
        <summary
          className="cursor-pointer select-none text-[11px] font-semibold text-slate-700"
          data-testid="three-line-fold-summary"
        >
          三线分名 · {reached}/{rows.length} 已到
          <span className="ml-1.5 text-[9px] font-medium text-slate-400">
            展开看分项 · 勿混成一条「已过」
          </span>
        </summary>
        <div className="mt-1.5 border-t border-slate-100 pt-1.5">{body}</div>
      </details>
    )
  }

  return (
    <section
      className={
        dense
          ? 'rounded-md border border-slate-200/80 bg-slate-50/60 px-2 py-1.5'
          : 'rounded-xl border border-slate-200 bg-white px-3 py-2.5 shadow-sm'
      }
      data-testid="three-line-status"
      data-dense={dense ? '1' : '0'}
      aria-label="三线分名"
    >
      {body}
    </section>
  )
}
