import { useMemo } from 'react'
import { Link } from 'react-router-dom'
import { Bell, CheckCheck } from 'lucide-react'
import { useBusinessCases } from '../../business/BusinessCaseContext'
import { CONFIRM_META } from '../../business/businessSeats'

/**
 * 首页待办条 · 待我确认
 * 口径：getPendingConfirms() 无参只返回用户自建案的 pending（种子案不计），
 * 这里明说，避免「看不到待办」被误判为 bug。
 */
export function HomeTodoStrip() {
  const { getPendingConfirms, cases } = useBusinessCases()
  /**
   * getPendingConfirms() 无参时按设计过滤掉演示案；首页要看全量，
   * 所以按案聚合，口径与部门页一致。
   */
  const pending = useMemo(
    () => cases.flatMap((c) => getPendingConfirms(c.id)),
    [cases, getPendingConfirms],
  )

  if (pending.length === 0) {
    return (
      <div
        className="flex items-center gap-2 rounded-[var(--radius-md)] border border-slate-200 bg-white px-3 py-2.5 shadow-[var(--shadow-rest)]"
        data-testid="home-todo-empty"
      >
        <CheckCheck
          className="h-4 w-4 shrink-0 text-emerald-600"
          strokeWidth={1.75}
          aria-hidden
        />
        <span className="text-[12px] text-slate-600">
          没有待确认 · 交卷后会出现在这里
        </span>
        <Link
          to="/agent/pending"
          className="focus-ring ml-auto shrink-0 rounded-[var(--radius-sm)] px-1.5 py-0.5 text-[11px] font-medium text-slate-600 hover:underline"
        >
          全部待办
        </Link>
      </div>
    )
  }

  const first = pending.slice(0, 3)
  return (
    <section
      aria-label="待我确认"
      className="rounded-[var(--radius-md)] border border-amber-200/90 bg-amber-50/60 px-3 py-2.5"
      data-testid="home-todo-strip"
    >
      <div className="mb-1.5 flex items-center gap-1.5">
        <Bell className="h-3.5 w-3.5 text-amber-700" strokeWidth={1.75} aria-hidden />
        <span className="text-[12px] font-semibold text-amber-950">待我确认</span>
        <span className="tabular rounded-full bg-amber-600 px-1.5 py-px text-[10px] font-semibold text-white">
          {pending.length}
        </span>
        <Link
          to="/agent/pending"
          className="focus-ring ml-auto rounded-[var(--radius-sm)] px-1.5 py-0.5 text-[11px] font-medium text-amber-800 hover:underline"
          data-testid="home-todo-all"
        >
          全部
        </Link>
      </div>
      <ul className="space-y-0.5">
        {first.map((item) => {
          const c = cases.find((x) => x.id === item.caseId)
          return (
            <li key={item.id}>
              <Link
                to={`/agent/pending/${item.id}`}
                className="focus-ring flex min-h-8 items-center gap-2 rounded-[var(--radius-sm)] px-1.5 py-1 text-[12px] text-amber-950 hover:bg-amber-100/70"
                data-testid={`home-todo-${item.id}`}
              >
                <span className="shrink-0 rounded border border-amber-300 bg-white px-1 py-px text-[10px] font-medium text-amber-900">
                  {CONFIRM_META[item.kind]?.preparedBy ?? '交卷'}
                </span>
                <span className="min-w-0 flex-1 truncate">
                  <span className="font-medium">{item.title}</span>
                  <span className="mx-1 text-amber-800/60">·</span>
                  <span className="text-amber-900/85">{c?.title ?? item.caseId}</span>
                </span>
              </Link>
            </li>
          )
        })}
      </ul>
      {pending.length > first.length && (
        <p className="mt-1 px-1.5 text-[11px] text-amber-800/80">
          另有 {pending.length - first.length} 项
        </p>
      )}
    </section>
  )
}
