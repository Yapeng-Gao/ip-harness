import {
  HOME_CHAIN_STATIONS,
  HOME_DEMO_CASE,
  HOME_HIGHLIGHTS,
  HOME_PATH_HOPS,
  HOME_SAMPLE_DELIVERABLES,
  HOME_VALUE_LINE,
} from '../../business/homeContentPreview'

/**
 * §4.0a 教育块内容预览（E→C→D→A+B）
 * 只认知、不可点进部门台/交卷作业；「已了解」由父级收起整块。
 */
export function HomeContentPreview({ onDismiss }: { onDismiss: () => void }) {
  const currentId = HOME_DEMO_CASE.currentDeptId

  return (
    <section
      aria-label="内容预览"
      className="mb-5 space-y-3"
      data-testid="home-intro-block"
      data-home-preview="triad"
    >
      {/* E · 示范案卡片 */}
      <div
        className="rounded-[var(--radius-md)] border border-slate-200 bg-white px-3.5 py-3 shadow-[var(--shadow-rest)]"
        data-testid="home-demo-case"
        aria-label="示范案预览"
      >
        <p className="mb-1 text-[10px] font-medium uppercase tracking-wide text-slate-400">
          示范案 · 示意
        </p>
        <p className="text-[14px] font-semibold text-slate-900">{HOME_DEMO_CASE.title}</p>
        <p className="mt-1 text-[12px] text-slate-700">
          当前部门{' '}
          <span className="font-medium text-slate-900">{HOME_DEMO_CASE.currentDeptLabel}</span>
        </p>
        <p className="mt-0.5 text-[11px] leading-snug text-slate-500">
          {HOME_DEMO_CASE.progressLine}
        </p>
      </div>

      {/* C · 七部微进度（不可点进作业） */}
      <div
        className="rounded-[var(--radius-md)] border border-slate-200 bg-white px-3 py-2.5 shadow-[var(--shadow-rest)]"
        data-testid="home-chain-micro"
        aria-label="主链七部进度（示意）"
      >
        <p className="mb-2 text-[11px] font-medium text-slate-500">
          主链七部 · 示意（不可点进作业）
        </p>
        <ol className="flex flex-wrap gap-1.5">
          {HOME_CHAIN_STATIONS.map((s) => {
            const active = s.deptId === currentId
            return (
              <li
                key={s.deptId}
                className={
                  active
                    ? 'rounded-[var(--radius-sm)] border border-slate-900 bg-slate-900 px-2 py-1 text-white'
                    : 'rounded-[var(--radius-sm)] border border-slate-200 bg-slate-50 px-2 py-1 text-slate-600'
                }
                data-testid={`home-chain-${s.deptId}`}
                data-active={active ? '1' : '0'}
              >
                <span className="block text-[11px] font-semibold leading-tight">
                  {s.shortLabel}
                </span>
                <span
                  className={
                    active
                      ? 'block text-[10px] leading-tight text-white/75'
                      : 'block text-[10px] leading-tight text-slate-400'
                  }
                >
                  {s.deliverable}
                </span>
              </li>
            )
          })}
        </ol>
      </div>

      {/* D · 交卷物样例卡 2–3 */}
      <ul
        className="grid gap-2 sm:grid-cols-3"
        data-testid="home-sample-deliverables"
        aria-label="交卷物样例"
      >
        {HOME_SAMPLE_DELIVERABLES.map((d) => (
          <li
            key={d.name}
            className="rounded-[var(--radius-md)] border border-slate-200 bg-white px-3 py-2.5 shadow-[var(--shadow-rest)]"
            data-testid={`home-sample-${d.name}`}
          >
            <p className="text-[12px] font-semibold text-slate-900">{d.name}</p>
            <p
              className={
                d.status === '待确认'
                  ? 'mt-0.5 text-[11px] font-medium text-amber-800'
                  : 'mt-0.5 text-[11px] text-slate-500'
              }
            >
              {d.name} · {d.status}
            </p>
          </li>
        ))}
      </ul>

      {/* A+B · 辅文（面积小于 E/C/D） */}
      <div
        className="space-y-1.5 rounded-[var(--radius-md)] border border-dashed border-slate-200 bg-slate-50/70 px-3 py-2"
        data-testid="home-aux-copy"
      >
        <p
          className="text-pretty text-[11px] leading-relaxed text-slate-600"
          data-testid="home-value-line"
        >
          {HOME_VALUE_LINE}
        </p>
        <ul className="space-y-0.5" data-testid="home-highlights">
          {HOME_HIGHLIGHTS.map((h) => (
            <li key={h.title} className="text-[10px] leading-snug text-slate-500">
              <span className="font-medium text-slate-600">{h.title}</span>
              <span className="text-slate-400"> · </span>
              <span>{h.body}</span>
            </li>
          ))}
        </ul>
        <div data-testid="home-path-micro" aria-label="上手路径（示意）">
          <ol className="flex flex-wrap items-center gap-x-1 gap-y-0.5">
            {HOME_PATH_HOPS.map((hop, i) => (
              <li key={hop} className="inline-flex items-center gap-1">
                {i > 0 ? (
                  <span className="text-[10px] text-slate-300" aria-hidden>
                    →
                  </span>
                ) : null}
                <span className="rounded-full border border-slate-200 bg-white px-1.5 py-px text-[10px] text-slate-500">
                  {hop}
                </span>
              </li>
            ))}
          </ol>
        </div>
      </div>

      <div className="flex justify-end">
        <button
          type="button"
          className="btn-press focus-ring rounded-[var(--radius-sm)] border border-slate-200 bg-white px-2.5 py-1 text-[11px] font-medium text-slate-600 hover:border-slate-300 hover:text-slate-800"
          onClick={onDismiss}
          data-testid="home-intro-dismiss"
        >
          已了解
        </button>
      </div>
    </section>
  )
}
