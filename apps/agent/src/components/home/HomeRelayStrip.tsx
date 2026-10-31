/**
 * 助手「待接力」条 · vision §3.1d
 * progress.delegate（刷新可恢复）+ seed 待拍/工单；非官报。
 */
import { Link } from 'react-router-dom'
import { useMemo, useState, useEffect } from 'react'
import { ArrowRightLeft } from 'lucide-react'
import { useBusinessCases } from '../../business/BusinessCaseContext'
import { disclosureToDraftTicket } from '../../business/interDeptTicket'
import {
  readLastDispatch,
  type RelayItem,
} from '../../business/delegateChain'
import { workbenchAskPath } from '../../business/pendingDeptQuery'

type Props = {
  refreshKey?: number
}

export function HomeRelayStrip({ refreshKey = 0 }: Props) {
  const { cases, getPendingConfirms, getProgress } = useBusinessCases()
  const [tick, setTick] = useState(0)

  useEffect(() => {
    setTick((t) => t + 1)
  }, [refreshKey])

  const items = useMemo(() => {
    const rows: RelayItem[] = []
    // progress 状态机里的分发（跨刷新）
    const fromProgress = cases
      .map((c) => {
        const d = getProgress(c.id).delegate
        if (!d) return null
        return { caseId: c.id, title: c.title, d }
      })
      .filter(Boolean) as Array<{
      caseId: string
      title: string
      d: NonNullable<ReturnType<typeof getProgress>['delegate']>
    }>
    fromProgress.sort((a, b) => b.d.at.localeCompare(a.d.at))
    for (const row of fromProgress.slice(0, 3)) {
      rows.push({
        id: `dispatched-${row.caseId}`,
        title: row.d.goalText.slice(0, 36) || row.title,
        kind: 'dispatched',
        badge: '已分发',
        href: `/agent/cases/${row.caseId}/depts/${row.d.deptSlug}?delegate=1`,
      })
    }
    // LS 兜底（无案开新路径）
    const last = readLastDispatch()
    if (last && !last.caseId) {
      rows.unshift({
        id: 'dispatched-last-new',
        title: last.goalText.slice(0, 36) || last.stepLabel,
        kind: 'dispatched',
        badge: '待开新',
        href: '/agent/cases/new',
      })
    } else if (last?.caseId && !rows.some((r) => r.id === `dispatched-${last.caseId}`)) {
      rows.unshift({
        id: 'dispatched-last',
        title: last.goalText.slice(0, 36) || last.stepLabel,
        kind: 'dispatched',
        badge: '刚分发',
        href: `/agent/cases/${last.caseId}/depts/${last.deptSlug}?delegate=1`,
      })
    }
    const pending = getPendingConfirms().slice(0, 3)
    for (const p of pending) {
      const c = cases.find((x) => x.id === p.caseId)
      rows.push({
        id: `pending-${p.id}`,
        title: c?.title ?? '案子',
        kind: 'pending',
        badge: '待你拍',
        href: workbenchAskPath(p.caseId, p.kind, { confirmId: p.id }),
      })
    }
    for (const c of cases) {
      const prog = getProgress(c.id)
      if (
        prog.doneSeatIds.includes('expert-disclosure') &&
        !prog.doneSeatIds.includes('expert-draft') &&
        !prog.filed
      ) {
        const ticket = disclosureToDraftTicket(c.id)
        rows.push({
          id: `handoff-${c.id}`,
          title: c.title,
          kind: 'handoff',
          badge: ticket.intentLabel,
          href: `/agent/cases/${c.id}/depts/disclosure?ticket=1`,
        })
      }
    }
    const seen = new Set<string>()
    return rows
      .filter((r) => {
        if (seen.has(r.id)) return false
        seen.add(r.id)
        return true
      })
      .slice(0, 5)
  }, [cases, getPendingConfirms, getProgress, tick])

  return (
    <section
      className="mt-3 rounded-xl border border-slate-200 bg-white px-3 py-2.5 shadow-sm"
      data-testid="home-relay-strip"
      aria-labelledby="home-relay-title"
    >
      <div className="mb-1.5 flex flex-wrap items-center gap-1.5">
        <ArrowRightLeft
          className="h-3.5 w-3.5 text-slate-500"
          strokeWidth={1.75}
          aria-hidden
        />
        <h3
          id="home-relay-title"
          className="text-[12px] font-semibold text-slate-900"
        >
          待接力
        </h3>
        <span className="text-[10px] text-slate-400">
          progress 可恢复 · 样机示意
        </span>
        <span
          className="ml-auto tabular rounded-full bg-slate-100 px-1.5 py-px text-[10px] font-semibold text-slate-600"
          data-testid="home-relay-count"
        >
          {items.length}
        </span>
      </div>
      {items.length === 0 ? (
        <p
          className="text-[12px] text-slate-500"
          data-testid="home-relay-empty"
        >
          暂无待接力 · 上方委托分发后写入本案进度
        </p>
      ) : (
        <ul className="space-y-1" data-testid="home-relay-list">
          {items.map((r) => (
            <li key={r.id}>
              <Link
                to={r.href}
                className="btn-press focus-ring flex items-center gap-2 rounded-lg px-2 py-1.5 text-[12px] hover:bg-slate-50"
                data-testid={`home-relay-${r.kind}`}
                data-relay-id={r.id}
              >
                <span
                  className={`shrink-0 rounded-full px-1.5 py-px text-[10px] font-semibold ${
                    r.kind === 'pending'
                      ? 'bg-amber-100 text-amber-900'
                      : r.kind === 'dispatched'
                        ? 'bg-emerald-100 text-emerald-900'
                        : 'bg-sky-100 text-sky-900'
                  }`}
                >
                  {r.badge}
                </span>
                <span className="min-w-0 flex-1 truncate text-slate-800">
                  {r.title}
                </span>
              </Link>
            </li>
          ))}
        </ul>
      )}
    </section>
  )
}
