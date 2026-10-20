import { useMemo, useState } from 'react'
import { ArrowRight } from 'lucide-react'
import {
  COLLAB_EDGES,
  DEPT_RICH,
  LEVEL_LABEL,
  levelFromXp,
  NETWORK_POS,
  relationsFor,
  workerIds,
} from '../../departments/orgData'
import type { CollabEdge } from '../../departments/orgData'
import { MAIN_CHAIN_DEPTS, type OrgDeptId } from '../../departments/orgDepts'

/**
 * 协作网络 · 样机
 * 实线 = 主链案件移交，虚线 = 横向协作；周协作量为样机数据。
 * 节点摆位固定（NETWORK_POS），选中部门时右侧给出该部的协作关系。
 */
export function CollabNetwork() {
  const [selected, setSelected] = useState<OrgDeptId>('dept-research')
  const selDept = MAIN_CHAIN_DEPTS.find((d) => d.id === selected)!
  const rel = relationsFor(selected)
  const rich = DEPT_RICH[selected]

  const edges = useMemo(
    () =>
      COLLAB_EDGES.map((e) => {
        const a = NETWORK_POS[e.from]
        const b = NETWORK_POS[e.to]
        if (!a || !b) return null
        // 横向边略拱起：取两点的中点往垂直方向偏移
        const mx = (a.x + b.x) / 2
        const my = (a.y + b.y) / 2
        const dx = b.x - a.x
        const dy = b.y - a.y
        const len = Math.hypot(dx, dy) || 1
        const off = e.kind === 'cross' ? 9 : 0
        return {
          ...e,
          x1: a.x,
          y1: a.y,
          x2: b.x,
          y2: b.y,
          cx: mx + (-dy / len) * off,
          cy: my + (dx / len) * off,
        }
      }).filter((e): e is NonNullable<typeof e> => e !== null),
    [],
  )

  const sortedEdges = useMemo(
    () => [...COLLAB_EDGES].sort((a, b) => b.weekly - a.weekly),
    [],
  )

  return (
    <div className="grid gap-3 lg:grid-cols-[1fr_300px]" data-testid="collab-network">
      <section className="rounded-[var(--radius-lg)] border border-slate-200 bg-white shadow-[var(--shadow-rest)]">
        <div className="flex flex-wrap items-baseline gap-2 border-b border-slate-100 px-3.5 py-2.5">
          <h2 className="text-[13px] font-semibold tracking-tight text-slate-900">
            协作网络
          </h2>
          <span className="text-[11px] text-slate-500">
            实线 = 下游案件移交 · 虚线 = 横向协作 · 样机
          </span>
        </div>
        <div className="relative mx-auto aspect-[16/9] w-full max-w-3xl">
          <svg
            viewBox="0 0 100 100"
            className="absolute inset-0 h-full w-full"
            aria-hidden
          >
            {edges.map((e, i) => (
              <g key={`${e.from}-${e.to}`}>
                <path
                  d={`M ${e.x1} ${e.y1} Q ${e.cx} ${e.cy} ${e.x2} ${e.y2}`}
                  fill="none"
                  stroke={e.kind === 'handoff' ? '#cbd5e1' : '#94a3b8'}
                  strokeWidth={e.kind === 'handoff' ? 0.55 : 0.4}
                  strokeDasharray={e.kind === 'cross' ? '1.6 1.4' : undefined}
                  markerEnd={
                    e.kind === 'handoff' ? 'url(#cn-arrow)' : undefined
                  }
                />
                {i < 10 && (
                  <text
                    x={(e.x1 + e.x2) / 2}
                    y={(e.y1 + e.y2) / 2 - 1.2}
                    className="fill-slate-400 text-[2.6px]"
                    textAnchor="middle"
                  >
                    {e.label}
                  </text>
                )}
              </g>
            ))}
            <defs>
              <marker
                id="cn-arrow"
                viewBox="0 0 6 6"
                refX="5"
                refY="3"
                markerWidth="4"
                markerHeight="4"
                orient="auto-start-reverse"
              >
                <path d="M 0 0 L 6 3 L 0 6 Z" fill="#cbd5e1" />
              </marker>
            </defs>
          </svg>
          {MAIN_CHAIN_DEPTS.map((d) => {
            const pos = NETWORK_POS[d.id]
            if (!pos) return null
            const r = DEPT_RICH[d.id]
            const isSel = d.id === selected
            return (
              <button
                key={d.id}
                type="button"
                onClick={() => setSelected(d.id)}
                aria-pressed={isSel}
                className={`focus-ring absolute -translate-x-1/2 -translate-y-1/2 rounded-[var(--radius-md)] border px-2 py-1.5 text-left shadow-[var(--shadow-rest)] transition-[border-color,background-color] duration-150 ${
                  isSel
                    ? 'border-sky-300 bg-sky-50'
                    : 'border-slate-200 bg-white hover:border-slate-300'
                }`}
                style={{ left: `${pos.x}%`, top: `${pos.y}%` }}
                data-testid={`cn-node-${d.id}`}
              >
                <span className="block text-[11px] font-semibold leading-tight text-slate-900">
                  {d.label}
                </span>
                {r && (
                  <span className="mt-0.5 block text-[9px] leading-tight text-slate-500">
                    {r.mainAgent.name} · {r.workerCount} 台
                  </span>
                )}
              </button>
            )
          })}
        </div>
      </section>

      <div className="space-y-3">
        <section
          className="rounded-[var(--radius-lg)] border border-slate-200 bg-white shadow-[var(--shadow-rest)]"
          aria-label={`${selDept.label} 协作关系`}
        >
          <div className="border-b border-slate-100 px-3.5 py-2.5">
            <h3 className="text-[13px] font-semibold tracking-tight text-slate-900">
              {selDept.label} · 协作关系
            </h3>
          </div>
          <div className="space-y-2.5 px-3.5 py-3">
            <RelRow
              dir="上游"
              edge={rel.upstream}
              targetLabel={rel.upstream ? (MAIN_CHAIN_DEPTS.find((d) => d.id === rel.upstream!.from)?.label ?? null) : null}
            />
            <RelRow
              dir="下游"
              edge={rel.downstream}
              targetLabel={rel.downstream ? (MAIN_CHAIN_DEPTS.find((d) => d.id === rel.downstream!.to)?.label ?? null) : null}
            />
            <div>
              <p className="mb-1 text-[10px] font-semibold uppercase tracking-wide text-slate-500">
                横向协作 · {rel.cross.length}
              </p>
              <ul className="space-y-1">
                {rel.cross.map((e) => (
                  <li key={`${e.from}-${e.to}`} className="flex items-baseline gap-1.5 text-[11px]">
                    <span className="min-w-0 flex-1 truncate text-slate-700">
                      {e.from === selected
                        ? `${MAIN_CHAIN_DEPTS.find((d) => d.id === e.to)?.label} · ${e.label}`
                        : `${MAIN_CHAIN_DEPTS.find((d) => d.id === e.from)?.label} · ${e.label}`}
                    </span>
                    <span className="tabular shrink-0 text-[10px] text-slate-500">
                      {e.weekly}/周
                    </span>
                  </li>
                ))}
                {rel.cross.length === 0 && (
                  <li className="text-[11px] text-slate-500">无</li>
                )}
              </ul>
            </div>
            {rich && (
              <div>
                <p className="mb-1 text-[10px] font-semibold uppercase tracking-wide text-slate-500">
                  执行集群 · {workerIds(rich.workerPrefix, rich.workerCount).length} 台
                </p>
                <p className="tabular text-[11px] leading-relaxed text-slate-600">
                  {workerIds(rich.workerPrefix, rich.workerCount).join(' · ')}
                </p>
              </div>
            )}
            {rich && (
              <div>
                <p className="mb-1 text-[10px] font-semibold uppercase tracking-wide text-slate-500">
                  支撑工具
                </p>
                <ul className="space-y-1">
                  {rich.tools.map((t) => (
                    <li key={t.id} className="flex items-baseline gap-1.5 text-[11px]">
                      <span className="min-w-0 flex-1 truncate text-slate-700">
                        {t.name}
                        <span className="tabular ml-1 text-[10px] text-slate-400">
                          {t.version}
                        </span>
                      </span>
                      <span className="tabular shrink-0 text-[10px] text-slate-500">
                        周{t.weeklyCalls} · 自动化 {t.automation}%
                      </span>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        </section>

        <section
          className="rounded-[var(--radius-lg)] border border-slate-200 bg-white shadow-[var(--shadow-rest)]"
          aria-label="协作量排行"
        >
          <div className="border-b border-slate-100 px-3.5 py-2.5">
            <h3 className="text-[12px] font-semibold tracking-tight text-slate-900">
              周协作量 Top
            </h3>
          </div>
          <ul className="space-y-1 px-3.5 py-3">
            {sortedEdges.slice(0, 5).map((e) => (
              <li
                key={`${e.from}-${e.to}`}
                className="flex items-baseline gap-1.5 text-[11px]"
              >
                <span className="min-w-0 flex-1 truncate text-slate-700">
                  {MAIN_CHAIN_DEPTS.find((d) => d.id === e.from)?.label}
                  <ArrowRight
                    className="mb-0.5 ml-1 inline h-3 w-3 text-slate-400"
                    strokeWidth={1.75}
                    aria-hidden
                  />
                  {MAIN_CHAIN_DEPTS.find((d) => d.id === e.to)?.label}
                  <span className="ml-1 text-slate-500">{e.label}</span>
                </span>
                <span className="tabular shrink-0 text-[10px] font-medium text-sky-700">
                  {e.weekly}/周
                </span>
              </li>
            ))}
          </ul>
        </section>
      </div>
    </div>
  )
}

function RelRow({
  dir,
  edge,
  targetLabel,
}: {
  dir: string
  edge: CollabEdge | undefined
  targetLabel: string | null
}) {
  return (
    <div className="flex items-baseline gap-1.5 text-[11px]">
      <span className="w-8 shrink-0 text-[10px] font-semibold text-slate-500">{dir}</span>
      {edge ? (
        <span className="min-w-0 flex-1 truncate text-slate-700">
          {targetLabel} · {edge.label}
        </span>
      ) : (
        <span className="min-w-0 flex-1 text-slate-400">—（链首/链尾）</span>
      )}
      {edge && (
        <span className="tabular shrink-0 text-[10px] text-slate-500">
          {edge.weekly}/周
        </span>
      )}
    </div>
  )
}

/** 供外部：某部主理档位（基准 xp 决定） */
export function mainAgentLevel(deptId: OrgDeptId): string {
  const r = DEPT_RICH[deptId]
  if (!r) return ''
  // 主理档位取该部最强专家的基准 xp（样机口径）
  const base = Math.max(...r.experts.map((e) => e.baseXp), 0)
  return LEVEL_LABEL[levelFromXp(base + 100)]
}
