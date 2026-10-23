import { useMemo } from 'react'
import { Link } from 'react-router-dom'
import { Bell, CheckCheck } from 'lucide-react'
import { useBusinessCases } from '../../business/BusinessCaseContext'
import {
  CONFIRM_KIND_LABEL,
  CONFIRM_META,
} from '../../business/businessSeats'
import { orgDeptByLeadSeat } from '../../departments/orgDepts'
import { deptLabel } from '../../business/deptRoster'

/**
 * G · 真待确认 · product-pages §4.0a
 * 骨架：【{案名}】{部门名}已交卷 · 待你确认：{关口一句话}
 * 与顶栏铃铛同源：getPendingConfirms()
 */
export function HomeTodoStrip() {
  const { getPendingConfirms, cases } = useBusinessCases()
  const pending = useMemo(() => getPendingConfirms(), [getPendingConfirms])

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
          暂无待确认——部门交卷后会停在这里请你拍板
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
          const caseName = c?.title ?? item.caseId
          const meta = CONFIRM_META[item.kind]
          const dept = meta ? orgDeptByLeadSeat(meta.seatId) : undefined
          const deptName = dept
            ? deptLabel(dept.id)
            : meta?.preparedBy
              ? `${meta.preparedBy}部`
              : '相关部门'
          const gate =
            CONFIRM_KIND_LABEL[item.kind] ?? item.title ?? '请确认本关口'
          return (
            <li key={item.id}>
              <Link
                to={`/agent/pending/${item.id}`}
                className="focus-ring flex min-h-8 items-start gap-2 rounded-[var(--radius-sm)] px-1.5 py-1 text-[12px] leading-snug text-amber-950 hover:bg-amber-100/70"
                data-testid={`home-todo-${item.id}`}
              >
                <span className="min-w-0 flex-1">
                  <span className="font-medium">【{caseName}】</span>
                  <span>
                    {deptName}已交卷 · 待你确认：{gate}
                  </span>
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
