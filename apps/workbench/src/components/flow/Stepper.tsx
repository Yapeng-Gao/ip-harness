export function Stepper({
  steps,
  current,
}: {
  steps: readonly string[]
  current: number
}) {
  return (
    <div
      className="mb-6 flex items-center gap-1.5 overflow-x-auto rounded-[var(--radius-lg)] border border-slate-200/80 bg-white/80 p-1.5 shadow-[var(--shadow-rest)]"
      role="list"
      aria-label="办理进度（只读高亮，非可点导航）"
    >
      {steps.map((label, i) => {
        const done = i < current
        const active = i === current
        return (
          <div key={label} className="flex min-w-0 flex-1 items-center gap-1" role="listitem">
            <div
              className={`flex w-full flex-col items-center gap-1 rounded-[var(--radius-md)] border px-2 py-2 ${
                active
                  ? 'border-slate-300 bg-slate-100 shadow-[var(--shadow-rest)]'
                  : done
                    ? 'border-emerald-200/80 bg-emerald-50/90'
                    : 'border-transparent bg-transparent'
              }`}
              aria-current={active ? 'step' : undefined}
              title={active ? '当前进度（只读）' : done ? '已覆盖' : '未到达'}
            >
              <span
                className={`flex h-5 w-5 items-center justify-center rounded-full text-xs font-medium ${
                  active
                    ? 'bg-slate-900 text-white'
                    : done
                      ? 'bg-emerald-600 text-white'
                      : 'bg-slate-100 text-slate-500'
                }`}
              >
                {done ? '✓' : i + 1}
              </span>
              <span
                className={`truncate text-xs ${
                  active ? 'text-slate-800' : done ? 'text-emerald-700' : 'text-slate-500'
                }`}
              >
                {label}
              </span>
            </div>
            {i < steps.length - 1 && (
              <div className="hidden h-px w-1.5 shrink-0 bg-transparent sm:block" aria-hidden />
            )}
          </div>
        )
      })}
    </div>
  )
}
