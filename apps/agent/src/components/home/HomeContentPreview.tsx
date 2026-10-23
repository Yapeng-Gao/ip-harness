import {
  HOME_CATEGORY_SUB,
  HOME_CATEGORY_TITLE,
  HOME_CHAIN_STATIONS,
  HOME_DEMO_CASE,
  HOME_SAMPLE_DELIVERABLES,
  HOME_SCENARIOS,
} from '../../business/homeContentPreview'
import { ExpertAvatar } from '../departments/ExpertAvatar'

/**
 * §4.0p 登录前宣传站货架（展示页 · 非干活处）
 * 品类大标题 → 七部徽章墙（每部默认露出 ≤3 专家+照片风占位头像）→ 案卡∥交卷橱窗 → 场景卡
 * 全灰态只认知；不可点进作业 / 交卷 / 采纳。
 * **未**挂入 HomePage / 登录后 `/agent`（§3.3 B / §4.0a 禁货架）；官网接线时再用。
 */
export function HomeContentPreview() {
  const currentId = HOME_DEMO_CASE.currentDeptId

  return (
    <section
      aria-label="货架预览"
      className="space-y-4"
      data-testid="welcome-shelf"
      data-home-preview="shelf"
    >
      {/* 1 · 品类大标题 */}
      <header className="text-center sm:text-left" data-testid="home-category-title">
        <h1 className="text-pretty text-[28px] font-bold leading-tight tracking-tight text-slate-900 sm:text-[32px]">
          {HOME_CATEGORY_TITLE}
        </h1>
        <p className="mt-1 text-[13px] font-medium text-slate-500">{HOME_CATEGORY_SUB}</p>
      </header>

      {/* 2 · 七部徽章墙：每部默认露出 ≤3 专家岗+头像（只展示） */}
      <div
        className="rounded-[var(--radius-lg)] border border-slate-200 bg-white p-3 shadow-[var(--shadow-rest)] sm:p-4"
        data-testid="home-chain-wall"
        aria-label="主链七部与专家岗示意（只展示，不可作业）"
      >
        <p className="mb-2.5 text-[11px] font-medium text-slate-400">
          七部主链 · 每部专家岗示意（只展示，不可作业）
        </p>
        <ol
          className="grid grid-cols-2 gap-2 sm:grid-cols-4 lg:grid-cols-7"
          data-testid="home-chain-micro"
        >
          {HOME_CHAIN_STATIONS.map((s) => {
            const active = s.deptId === currentId
            return (
              <li key={s.deptId} className="min-w-0">
                <div
                  className={
                    active
                      ? 'flex h-full min-h-[7.5rem] flex-col rounded-[var(--radius-md)] border-2 border-slate-900 bg-slate-900 px-1.5 py-2 text-white shadow-sm'
                      : 'flex h-full min-h-[7.5rem] flex-col rounded-[var(--radius-md)] border border-slate-200 bg-slate-50 px-1.5 py-2 text-slate-700'
                  }
                  data-testid={`home-chain-${s.deptId}`}
                  data-active={active ? '1' : '0'}
                  aria-label={`${s.shortLabel}部 · 专家岗示意`}
                >
                  <span className="text-center text-[15px] font-bold leading-tight sm:text-[16px]">
                    {s.shortLabel}
                  </span>
                  <span
                    className={
                      active
                        ? 'mt-0.5 text-center text-[10px] leading-tight text-white/70'
                        : 'mt-0.5 text-center text-[10px] leading-tight text-slate-400'
                    }
                  >
                    {s.deliverable}
                  </span>
                  <ul
                    className="mt-1.5 flex flex-1 flex-col justify-end gap-1"
                    data-testid={`home-experts-${s.deptId}`}
                    aria-label={`${s.shortLabel}专家岗`}
                  >
                    {s.experts.slice(0, 3).map((name) => (
                      <li
                        key={name}
                        className={
                          active
                            ? 'flex items-center gap-1 truncate rounded-full bg-white/10 px-1 py-0.5 text-[10px] leading-tight text-white/90'
                            : 'flex items-center gap-1 truncate rounded-full bg-white px-1 py-0.5 text-[10px] leading-tight text-slate-600 ring-1 ring-slate-200'
                        }
                        data-testid={`home-expert-${s.deptId}-${name}`}
                        title={name}
                      >
                        <ExpertAvatar name={name} size="sm" tone={active ? 'onDark' : 'light'} />
                        <span className="min-w-0 truncate">{name}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </li>
            )
          })}
        </ol>
      </div>

      {/* 3 · 橱窗：案卡 ∥ 交卷缩略 */}
      <div
        className="grid gap-3 sm:grid-cols-2"
        data-testid="home-showcase"
        aria-label="示范案与交卷橱窗"
      >
        <div
          className="rounded-[var(--radius-md)] border border-slate-200 bg-white px-4 py-3.5 shadow-[var(--shadow-rest)]"
          data-testid="home-demo-case"
          aria-label="示范案预览"
        >
          <p className="mb-1.5 text-[10px] font-medium uppercase tracking-wide text-slate-400">
            示范案 · 示意
          </p>
          <p className="text-[16px] font-semibold text-slate-900">{HOME_DEMO_CASE.title}</p>
          <p className="mt-1.5 text-[13px] text-slate-700">
            当前部门{' '}
            <span className="font-semibold text-slate-900">
              {HOME_DEMO_CASE.currentDeptLabel}
            </span>
          </p>
          <p className="mt-1 text-[12px] leading-snug text-slate-500">
            {HOME_DEMO_CASE.progressLine}
          </p>
        </div>

        <ul
          className="flex flex-col gap-2"
          data-testid="home-sample-deliverables"
          aria-label="交卷物样例"
        >
          {HOME_SAMPLE_DELIVERABLES.map((d) => (
            <li
              key={d.name}
              className="flex flex-1 items-center justify-between gap-2 rounded-[var(--radius-md)] border border-slate-200 bg-white px-3.5 py-2.5 shadow-[var(--shadow-rest)]"
              data-testid={`home-sample-${d.name}`}
            >
              <span className="text-[13px] font-semibold text-slate-900">{d.name}</span>
              <span
                className={
                  d.status === '待确认'
                    ? 'shrink-0 rounded-full bg-amber-100 px-2 py-0.5 text-[11px] font-medium text-amber-900'
                    : 'shrink-0 rounded-full bg-slate-100 px-2 py-0.5 text-[11px] text-slate-600'
                }
              >
                {d.status}
              </span>
            </li>
          ))}
        </ul>
      </div>

      {/* 4 · 场景卡 */}
      <div data-testid="welcome-scenarios" aria-label="使用场景">
        <p className="mb-2 text-[11px] font-medium text-slate-400">场景</p>
        <ul className="grid gap-2 sm:grid-cols-3">
          {HOME_SCENARIOS.map((sc) => (
            <li
              key={sc.id}
              className="rounded-[var(--radius-md)] border border-slate-200 bg-white px-3.5 py-3 shadow-[var(--shadow-rest)]"
              data-testid={`welcome-scenario-${sc.id}`}
            >
              <p className="text-[13px] font-semibold text-slate-900">{sc.title}</p>
              <p className="mt-1 text-[12px] leading-snug text-slate-500">{sc.body}</p>
            </li>
          ))}
        </ul>
      </div>
    </section>
  )
}
