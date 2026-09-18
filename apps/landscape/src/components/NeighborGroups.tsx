import { Link } from 'react-router-dom'
import { Chip } from './ui'
import { EDGE_TYPE_LABELS, type Edge } from '../state/types'
import type { NeighborRow } from '../state/store'

const DEFAULT_LIMIT = 6

const TYPE_ORDER: Edge['type'][] = [
  'part-org',
  'part-hit',
  'node-insight',
  'org-competitor',
  'org-standard',
]

function groupNeighbors(rows: NeighborRow[]): { type: Edge['type']; rows: NeighborRow[] }[] {
  const map = new Map<Edge['type'], NeighborRow[]>()
  for (const row of rows) {
    const list = map.get(row.edgeType) ?? []
    list.push(row)
    map.set(row.edgeType, list)
  }
  const ordered: { type: Edge['type']; rows: NeighborRow[] }[] = []
  for (const t of TYPE_ORDER) {
    const list = map.get(t)
    if (list?.length) ordered.push({ type: t, rows: list })
  }
  for (const [t, list] of map) {
    if (!TYPE_ORDER.includes(t) && list.length) ordered.push({ type: t, rows: list })
  }
  return ordered
}

export function NeighborGroups({
  neighbors,
  limit = DEFAULT_LIMIT,
  emptyText = '无邻居边。',
}: {
  neighbors: NeighborRow[]
  limit?: number
  emptyText?: string
}) {
  if (neighbors.length === 0) {
    return <p className="mt-3 text-xs text-slate-400">{emptyText}</p>
  }

  const groups = groupNeighbors(neighbors)

  return (
    <div className="mt-3 space-y-4">
      {groups.map(({ type, rows }) => {
        const shown = rows.slice(0, limit)
        const rest = rows.length - shown.length
        return (
          <div key={type}>
            <div className="mb-1.5 flex flex-wrap items-center gap-2">
              <Chip tone="mock">{EDGE_TYPE_LABELS[type]}</Chip>
              <span className="text-[11px] text-slate-400">{rows.length} 条</span>
            </div>
            <ul className="space-y-1">
              {shown.map((row, i) => (
                <li
                  key={`${row.edgeType}-${row.label}-${i}`}
                  className="flex flex-wrap items-baseline justify-between gap-2 rounded-lg border border-slate-100 px-2.5 py-1.5 text-xs"
                >
                  <span className="min-w-0">
                    {row.href ? (
                      <Link
                        to={row.href}
                        className="font-medium text-slate-800 underline-offset-2 hover:underline"
                      >
                        {row.label}
                      </Link>
                    ) : (
                      <span className="font-medium text-slate-800">{row.label}</span>
                    )}
                  </span>
                  <span className="shrink-0 text-slate-500">{row.meta ?? '—'}</span>
                </li>
              ))}
            </ul>
            {rest > 0 ? (
              <p className="mt-1 text-[11px] text-slate-400">另有 {rest} 条</p>
            ) : null}
          </div>
        )
      })}
      <p className="text-[11px] text-slate-400">
        共 {groups.length} 类边 · {neighbors.length} 行（每组最多 {limit}）
      </p>
    </div>
  )
}
