import { useEffect, useMemo, useState } from 'react'
import {
  ACTIVITY_CATEGORY_LABEL,
  type ActivityCategory,
  type CompanyActivityEvent,
} from '../../business/companyActivity'
import { useCompanyActivity } from '../../business/CompanyActivityContext'
import { formatElapsed } from '../../business/demoPace'
import { FlatBust } from './officeIllustration'

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
      className="flex h-full min-h-[16rem] flex-col rounded-2xl border border-[#eadcc8] bg-[#fffaf3] shadow-[0_8px_24px_rgba(90,60,30,0.08)]"
      data-testid="company-activity-feed"
      aria-label="公司动态"
    >
      <header className="flex items-center justify-between gap-2 border-b border-[#f0e2d0] px-3 py-2">
        <h2 className="text-[12px] font-semibold text-[#5c4030]">公司动态</h2>
        <button
          type="button"
          className="btn-press focus-ring rounded-full px-1.5 py-0.5 text-[10px] text-[#8a6a4a] hover:bg-[#f6ead8]"
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
                on ? 'bg-[#2f8f8a] text-white' : 'bg-[#f6ead8] text-[#6b5436]'
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
          <li className="rounded-xl border border-dashed border-[#ead9c2] px-2 py-3 text-[11px] text-[#8a6a4a]">
            这一类还没有动静。
          </li>
        ) : (
          visible.map((event) => (
            <li
              key={event.id}
              className="rounded-xl bg-[#fbf6ee] px-2 py-1.5"
              data-testid={`activity-event-${event.id}`}
              data-category={event.category}
            >
              <div className="flex items-center gap-1.5">
                <span className="inline-flex shrink-0" data-testid={`activity-dot-${event.roleId}`} aria-hidden>
                  <FlatBust id={event.roleId} size={22} />
                </span>
                <span className="text-[10px] font-semibold text-[#5c4030]">{event.roleName}</span>
                <span className="rounded-full bg-white px-1.5 text-[10px] text-[#8a6a4a]">
                  {ACTIVITY_CATEGORY_LABEL[event.category]}
                </span>
                <span className="ml-auto text-[10px] tabular-nums text-[#c4a574]">
                  {ageLabel(event.at, now)}
                </span>
              </div>
              <p className="mt-0.5 text-[12px] leading-snug text-[#3d2c22]">{event.message}</p>
              {event.caseTitle ? (
                <p className="mt-0.5 text-[10px] text-[#a68462]">
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
