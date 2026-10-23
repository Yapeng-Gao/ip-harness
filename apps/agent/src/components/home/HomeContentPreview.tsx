import { useState } from 'react'
import {
  HOME_CATEGORY_SUB,
  HOME_CATEGORY_TITLE,
  HOME_CHAIN_STATIONS,
  HOME_DEMO_CASE,
  HOME_SAMPLE_DELIVERABLES,
} from '../../business/homeContentPreview'
import type { OrgDeptId } from '../../departments/orgDepts'

/**
 * §4.0a 货架预览（展示页 · 非干活处）
 * 品类大标题 → 七部徽章墙（点部展开 ≤3 专家示意）→ 案卡∥交卷橱窗
 * 全灰态只认知；不可点进作业 / 交卷 / 采纳。
 */
export function HomeContentPreview({ onDismiss }: { onDismiss: () => void }) {
  const currentId = HOME_DEMO_CASE.currentDeptId
  const [expandedDeptId, setExpandedDeptId] = useState<OrgDeptId | null>(null)

  const expanded = HOME_CHAIN_STATIONS.find((s) => s.deptId === expandedDeptId)

  const toggleDept = (deptId: OrgDeptId) => {
    setExpandedDeptId((prev) => (prev === deptId ? null : deptId))
  }

  return (
    <section
      aria-label="货架预览"
      className="mb-6 space-y-4"
      data-testid="home-intro-block"
      data-home-preview="shelf"
    >
      {/* 1 · 品类大标题 */}
      <header className="text-center sm:text-left" data-testid="home-category-title">
        <h1 className="text-pretty text-[28px] font-bold leading-tight tracking-tight text-slate-900 sm:text-[32px]">
          {HOME_CATEGORY_TITLE}
        </h1>
        <p className="mt-1 text-[13px] font-medium text-slate-500">{HOME_CATEGORY_SUB}</p>
      </header>

      {/* 2 · 七部徽章墙（全站名；点开才见专家） */}
      <div
        className="rounded-[var(--radius-md)] border border-slate-200 bg-white p-3 shadow-[var(--shadow-rest)] sm:p-4"
        data-testid="home-chain-wall"
        aria-label="主链七部（示意，点部看专家岗）"
      >
        <p className="mb-2.5 text-[11px] font-medium text-slate-400">
          七部主链 · 点一部看专家岗（示意，不可作业）
        </p>
        <ol
          className="grid grid-cols-4 gap-2 sm:grid-cols-7"
          data-testid="home-chain-micro"
        >
          {HOME_CHAIN_STATIONS.map((s) => {
            const active = s.deptId === currentId
            const open = s.deptId === expandedDeptId
            return (
              <li key={s.deptId} className="min-w-0">
                <button
                  type="button"
                  className={
                    active
                      ? 'btn-press focus-ring flex h-full min-h-[4.25rem] w-full flex-col items-center justify-center rounded-[var(--radius-md)] border-2 border-slate-900 bg-slate-900 px-1.5 py-2.5 text-white shadow-sm'
                      : open
                        ? 'btn-press focus-ring flex h-full min-h-[4.25rem] w-full flex-col items-center justify-center rounded-[var(--radius-md)] border-2 border-slate-400 bg-slate-100 px-1.5 py-2.5 text-slate-800'
                        : 'btn-press focus-ring flex h-full min-h-[4.25rem] w-full flex-col items-center justify-center rounded-[var(--radius-md)] border border-slate-200 bg-slate-50 px-1.5 py-2.5 text-slate-700 hover:border-slate-300 hover:bg-slate-100'
                  }
                  aria-expanded={open}
                  aria-controls={`home-experts-${s.deptId}`}
                  onClick={() => toggleDept(s.deptId)}
                  data-testid={`home-chain-${s.deptId}`}
                  data-active={active ? '1' : '0'}
                  data-expanded={open ? '1' : '0'}
                >
                  <span className="text-[15px] font-bold leading-tight sm:text-[16px]">
                    {s.shortLabel}
                  </span>
                  <span
                    className={
                      active
                        ? 'mt-1 text-center text-[10px] leading-tight text-white/70'
                        : 'mt-1 text-center text-[10px] leading-tight text-slate-400'
                    }
                  >
                    {s.deliverable}
                  </span>
                </button>
              </li>
            )
          })}
        </ol>

        {expanded ? (
          <div
            id={`home-experts-${expanded.deptId}`}
            className="mt-3 rounded-[var(--radius-sm)] border border-dashed border-slate-200 bg-slate-50/80 px-3 py-2.5"
            data-testid="home-experts-panel"
            data-dept={expanded.deptId}
            aria-label={`${expanded.shortLabel}部专家岗示意`}
          >
            <p className="mb-1.5 text-[11px] font-medium text-slate-500">
              {expanded.shortLabel} · 专家岗示意（≤{expanded.experts.length}，不可作业）
            </p>
            <ul className="flex flex-wrap gap-1.5">
              {expanded.experts.map((name) => (
                <li
                  key={name}
                  className="rounded-full border border-slate-200 bg-white px-2.5 py-1 text-[12px] text-slate-600"
                  data-testid={`home-expert-${expanded.deptId}-${name}`}
                >
                  {name}
                </li>
              ))}
            </ul>
          </div>
        ) : (
          <p className="mt-2 text-[11px] text-slate-400" data-testid="home-experts-hint">
            默认只露七部名；点某部展开专家岗
          </p>
        )}
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
