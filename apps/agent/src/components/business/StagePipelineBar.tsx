import { formatElapsed, PIPELINE_STAGES, pipelineIndex } from '../../business/demoPace'
import { useDemoPace } from '../../business/DemoPaceContext'

type Props = {
  stepIndex?: number
  stepCount?: number
  pending?: boolean
  done?: boolean
  streaming?: boolean
  /** 大厅等没有席位步号时直接指定亮到哪一颗 */
  index?: number
  caption?: string
  tone?: 'default' | 'warm'
}

export function StagePipelineBar({
  stepIndex = 0,
  stepCount = 1,
  pending = false,
  done = false,
  streaming = false,
  index,
  caption,
  tone = 'default',
}: Props) {
  const pace = useDemoPace()
  const current =
    index ??
    pipelineIndex({
      stepIndex,
      stepCount,
      pending,
      done,
      streaming,
    })
  const settled = done && !pending

  const warm = tone === 'warm'
  return (
    <div
      className={
        warm
          ? 'flex flex-wrap items-center gap-x-3 gap-y-2 rounded-2xl border border-[#eadcc8] bg-[#fffaf3] px-3 py-2 shadow-[0_8px_24px_rgba(90,60,30,0.08)]'
          : 'flex flex-wrap items-center gap-x-3 gap-y-2 rounded-[var(--radius-lg)] border border-slate-200 bg-white px-3 py-2 shadow-[var(--shadow-rest)]'
      }
      data-testid="stage-pipeline-bar"
    >
      {caption ? (
        <p className={`min-w-0 max-w-[16rem] truncate text-[12px] font-semibold ${warm ? 'text-[#5c4030]' : 'text-slate-800'}`}>
          {caption}
        </p>
      ) : (
        <p className="text-[11px] font-semibold text-slate-500">本案阶段</p>
      )}
      <ol className="flex min-w-0 flex-wrap items-center gap-1" data-testid="stage-pipeline">
        {PIPELINE_STAGES.map((label, i) => {
          const state = settled || i < current ? 'done' : i === current ? 'current' : 'todo'
          return (
            <li key={label} className="flex items-center gap-1" data-stage={label} data-state={state}>
              <span
                className={`h-2 w-2 rounded-full ${
                  state === 'current'
                    ? warm
                      ? 'bg-[#2f8f8a]'
                      : 'bg-[#007aff]'
                    : state === 'done'
                      ? warm
                        ? 'bg-[#3d8f6e]'
                        : 'bg-emerald-500'
                      : warm
                        ? 'bg-[#ead9c2]'
                        : 'bg-slate-200'
                }`}
                aria-hidden
              />
              <span
                className={`text-[10px] ${
                  state === 'current' ? (warm ? 'font-semibold text-[#3d2c22]' : 'font-semibold text-slate-900') : warm ? 'text-[#8a6a4a]' : 'text-slate-500'
                }`}
              >
                {label}
              </span>
              {i < PIPELINE_STAGES.length - 1 ? (
                <span className="px-0.5 text-[10px] text-slate-300" aria-hidden>
                  →
                </span>
              ) : null}
            </li>
          )
        })}
      </ol>
      <div className="ml-auto flex flex-wrap items-center gap-1" role="group" aria-label="演示速度">
        {([1, 2, 4] as const).map((speed) => {
          const on = pace.speed === speed && !pace.aborted
          return (
            <button
              key={speed}
              type="button"
              aria-pressed={on}
              data-testid={`demo-pace-${speed}x`}
              className={`btn-press focus-ring min-h-8 px-2 text-[11px] font-semibold tabular-nums ${warm ? 'rounded-full' : 'rounded-md'} ${
                on
                  ? warm
                    ? 'bg-[#2f8f8a] text-white'
                    : 'bg-slate-900 text-white'
                  : warm
                    ? 'border border-[#ead9c2] bg-white text-[#6b5436]'
                    : 'border border-slate-200 bg-white text-slate-600'
              }`}
              onClick={() => pace.setSpeed(speed)}
            >
              {speed}×
            </button>
          )
        })}
        <button
          type="button"
          data-testid="demo-pace-abort"
          aria-pressed={pace.aborted}
          className={`btn-press focus-ring min-h-8 px-2 text-[11px] font-semibold ${warm ? 'rounded-full' : 'rounded-md'} ${
            pace.aborted
              ? warm
                ? 'bg-[#f2c14e] text-[#5c4030]'
                : 'bg-amber-100 text-amber-950'
              : warm
                ? 'border border-[#ead9c2] bg-white text-[#6b5436]'
                : 'border border-slate-200 bg-white text-slate-700'
          }`}
          onClick={() => (pace.aborted ? pace.resume() : pace.abort())}
        >
          中止
        </button>
        <span
          className={`min-w-[3.2rem] text-right text-[12px] font-semibold tabular-nums ${warm ? 'text-[#5c4030]' : 'text-slate-700'}`}
          data-testid="demo-pace-elapsed"
        >
          {formatElapsed(pace.displayMs)}
          {pace.aborted ? ' 已停' : ''}
        </span>
      </div>
    </div>
  )
}
