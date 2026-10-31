import { Link } from 'react-router-dom'
import { ArrowRight, Package } from 'lucide-react'
import type { InterDeptTicket } from '../../business/interDeptTicket'

type Props = {
  caseId: string
  ticket: InterDeptTicket
  /** disclosure = 发出侧；draft = 接单侧 */
  side: 'from' | 'to'
  className?: string
}

/**
 * ④→⑤ 部间工单卡 · 线框 s-handoff / 04§8.1
 * 打包方可见；三线分词；结束检查表摘要；进入申请部接单。
 */
export function DeptHandoffTicket({
  caseId,
  ticket,
  side,
  className = '',
}: Props) {
  const enterHref = `/agent/cases/${caseId}/depts/${ticket.toSlug}?ticket=1`
  const backHref = `/agent/cases/${caseId}/depts/${ticket.fromSlug}`

  return (
    <section
      className={`rounded-xl border border-slate-200 bg-white p-4 shadow-sm ${className}`}
      data-testid="dept-handoff-ticket"
      data-ticket-id={ticket.id}
      data-ticket-side={side}
      data-ticket-intent={ticket.intent}
      aria-labelledby="dept-handoff-ticket-title"
    >
      <div className="flex flex-wrap items-start justify-between gap-2">
        <div className="min-w-0">
          <p className="text-[10px] font-semibold uppercase tracking-wide text-slate-400">
            部间工单
          </p>
          <h2
            id="dept-handoff-ticket-title"
            className="mt-0.5 text-[15px] font-semibold text-slate-900"
          >
            {ticket.intentLabel}
          </h2>
        </div>
        <span className="inline-flex items-center gap-1 rounded-full border border-slate-200 bg-slate-50 px-2 py-0.5 text-[10px] font-medium text-slate-600">
          <Package className="h-3 w-3" aria-hidden />
          {ticket.intent}
        </span>
      </div>

      <dl className="mt-3 grid gap-2 text-[12px] sm:grid-cols-2">
        <div className="rounded-lg bg-slate-50 px-2.5 py-2">
          <dt className="text-[10px] font-medium text-slate-400">打包</dt>
          <dd className="mt-0.5 font-medium text-slate-800" data-testid="ticket-packer">
            {ticket.packer}
          </dd>
        </div>
        <div className="rounded-lg bg-slate-50 px-2.5 py-2">
          <dt className="text-[10px] font-medium text-slate-400">接单</dt>
          <dd className="mt-0.5 font-medium text-slate-800" data-testid="ticket-receiver">
            {ticket.receiver}
          </dd>
        </div>
      </dl>

      <div
        className="mt-3 flex flex-wrap gap-1.5"
        data-testid="ticket-three-lines"
        aria-label="三线分词"
      >
        {ticket.lines.map((line) => {
          const ok = line.includes('全绿') || line.includes('过线）')
          const muted = line.includes('尚未')
          return (
            <span
              key={line}
              className={`rounded-full px-2 py-0.5 text-[10px] font-medium ${
                muted
                  ? 'bg-slate-100 text-slate-500'
                  : ok
                    ? 'bg-emerald-50 text-emerald-800'
                    : 'bg-slate-100 text-slate-700'
              }`}
              data-line={line}
            >
              {line}
            </span>
          )
        })}
      </div>

      <div className="mt-3">
        <h3 className="text-[11px] font-semibold text-slate-700">结束检查表摘要</h3>
        <ul
          className="mt-1.5 space-y-1 text-[12px] text-slate-600"
          data-testid="ticket-checklist"
        >
          {ticket.checklist.map((item) => (
            <li key={item.label} className="flex items-baseline gap-2">
              <span
                className={`mt-0.5 inline-block h-1.5 w-1.5 shrink-0 rounded-full ${
                  item.done ? 'bg-emerald-500' : 'bg-amber-400'
                }`}
                aria-hidden
              />
              <span>
                {item.label}
                {item.done ? ' · 有' : ' · 无'}
                {item.note ? `（${item.note}）` : ''}
              </span>
            </li>
          ))}
        </ul>
      </div>

      <div className="mt-4 flex flex-wrap gap-2">
        {side === 'from' ? (
          <Link
            to={enterHref}
            className="btn-press focus-ring inline-flex items-center gap-1 rounded-md bg-slate-900 px-3 py-2 text-[12px] font-semibold text-white"
            data-testid="ticket-enter-to-dept"
          >
            进入申请部接单
            <ArrowRight className="h-3.5 w-3.5" aria-hidden />
          </Link>
        ) : (
          <Link
            to={backHref}
            className="btn-press focus-ring inline-flex items-center gap-1 rounded-md border border-slate-200 bg-white px-3 py-2 text-[12px] font-medium text-slate-700"
            data-testid="ticket-back-from-dept"
          >
            ← 回交底部工单
          </Link>
        )}
        <p className="w-full text-[10px] text-slate-400">
          全绿 ≠ 申请已过线 · 三线分词勿混
        </p>
      </div>
    </section>
  )
}
