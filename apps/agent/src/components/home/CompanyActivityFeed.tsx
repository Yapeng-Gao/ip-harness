import { useEffect, useMemo, useState } from 'react'
import {
  ACTIVITY_CATEGORY_LABEL,
  roleDotClass,
  type ActivityCategory,
  type CompanyActivityEvent,
} from '../../business/companyActivity'
import { useCompanyActivity } from '../../business/CompanyActivityContext'
import { formatElapsed } from '../../business/demoPace'

const FILTERS: Array<ActivityCategory | 'all'> = [
  'all',
  'speak',
  'handoff',
  'critique',
  'pass',
  'pending',
]

function ageLabel(at: string, now: number): string {
  const t = Date.parse(at)
  if (Number.isNaN(t)) return ''
  const ms = Math.max(0, now - t)
  if (ms > 24 * 60 * 60 * 1000) return '更早'
  return formatElapsed(ms)
}

export function CompanyActivityFeed({
  events,
}: {
  events?: CompanyActivityEvent[]
}) {
  const live = useCompanyActivity()
  const [now, setNow] = useState(() => Date.now())
  useEffect(() => {
    const timer = window.setInterval(() => setNow(Date.now()), 1000)
    return () => window.clearInterval(timer)
  }, [])
  const rows = events ?? live.events
  const [filter, setFilter] = useState<ActivityCategory | 'all'>('all')
  const visible = useMemo(
    () => (filter === 'all' ? rows : rows.filter((row) => row.category === filter)),
    [rows, filter],
  )

  return (
    <section
      className="flex h-full min-h-[16rem] flex-col rounded-[var(--radius-lg)] border border-slate-200 bg-white shadow-[var(--shadow-rest)]"
      data-testid="company-activity-feed"
      aria-label="公司动态"
    >
      <header className="flex items-center justify-between gap-2 border-b border-slate-100 px-3 py-2">
        <h2 className="text-[12px] font-semibold text-slate-800">公司动态</h2>
        <button
          type="button"
          className="btn-press focus-ring rounded-md px-1.5 py-0.5 text-[10px] text-slate-500 hover:bg-slate-50"
          onClick={() => live.clear()}
        >
          清空
        </button>
      </header>
      <div className="flex flex-wrap gap-1 px-2 py-2" role="tablist" aria-label="动态分类">
        {FILTERS.map((id) => {
          const on = filter === id
          const label = id === 'all' ? '全部' : ACTIVITY_CATEGORY_LABEL[id]
          return (
            <button
              key={id}
              type="button"
              role="tab"
              aria-selected={on}
              data-testid={`activity-filter-${id}`}
              className={`btn-press focus-ring rounded-full px-2 py-0.5 text-[10px] font-medium ${
                on ? 'bg-slate-900 text-white' : 'bg-slate-50 text-slate-600'
              }`}
              onClick={() => setFilter(id)}
            >
              {label}
            </button>
          )
        })}
      </div>
      <ol className="min-h-0 flex-1 space-y-1.5 overflow-y-auto px-2 pb-2">
        {visible.length === 0 ? (
          <li className="rounded-[var(--radius-md)] border border-dashed border-slate-200 px-2 py-3 text-[11px] text-slate-500">
            这一类还没有动静。
          </li>
        ) : (
          visible.map((event) => (
            <li
              key={event.id}
              className="rounded-[var(--radius-md)] bg-slate-50 px-2 py-1.5"
              data-testid={`activity-event-${event.id}`}
              data-category={event.category}
            >
              <div className="flex items-center gap-1.5">
                <span
                  className={`h-2 w-2 shrink-0 rounded-full ${roleDotClass(event.roleId)}`}
                  data-testid={`activity-dot-${event.roleId}`}
                  aria-hidden
                />
                <span className="text-[10px] font-semibold text-slate-700">{event.roleName}</span>
                <span className="rounded-full bg-white px-1.5 text-[10px] text-slate-500">
                  {ACTIVITY_CATEGORY_LABEL[event.category]}
                </span>
                <span className="ml-auto text-[10px] tabular-nums text-slate-400">
                  {ageLabel(event.at, now)}
                </span>
              </div>
              <p className="mt-0.5 text-[12px] leading-snug text-slate-800">{event.message}</p>
              {event.caseTitle ? (
                <p className="mt-0.5 text-[10px] text-slate-400">
                  {event.caseTitle}
                  {event.artifactPreview ? ` · ${event.artifactPreview}` : ''}
                </p>
              ) : null}
            </li>
          ))
        )}
      </ol>
    </section>
  )
}
