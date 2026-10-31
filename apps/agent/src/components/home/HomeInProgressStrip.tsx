import { Link } from 'react-router-dom'
import { Workflow } from 'lucide-react'
import { useMemo } from 'react'
import { useBusinessCases } from '../../business/BusinessCaseContext'
import { inProgressTicketLine } from '../../business/threeLineStatus'
import { disclosureToDraftTicket } from '../../business/interDeptTicket'

type Props = {
  latestId?: string
}

/**
 * 大厅「进行中工单」· 00-用户与系统 §165 / 交互大纲 §2
 * 机制：老板在大厅就能看见进行中工单，不只进部门才知道。
 */
export function HomeInProgressStrip({ latestId }: Props) {
  const { cases, getProgress } = useBusinessCases()

  const rows = useMemo(() => {
    return cases
      .map((c) => {
        const prog = getProgress(c.id)
        const line = inProgressTicketLine(prog)
        if (!line) return null
        const hasHandoff =
          prog.doneSeatIds.includes('expert-disclosure') &&
          !prog.doneSeatIds.includes('expert-draft') &&
          !prog.filed
        const ticket = hasHandoff ? disclosureToDraftTicket(c.id) : null
        return {
          id: c.id,
          title: c.title,
          line,
          ticketLabel: ticket?.intentLabel,
          href: ticket
            ? `/agent/cases/${c.id}/depts/disclosure?ticket=1`
            : prog.filed || (prog.oaRound ?? 0) > 0
              ? `/agent/cases/${c.id}/depts/oa`
              : `/agent/cases/${c.id}/depts/disclosure`,
        }
      })
      .filter(Boolean)
      .slice(0, 4) as {
      id: string
      title: string
      line: string
      ticketLabel?: string
      href: string
    }[]
  }, [cases, getProgress])

  if (rows.length === 0) {
    return (
      <div
        className="rounded-lg border border-dashed border-slate-200/80 bg-slate-50/50 px-3 py-2 text-[12px] text-slate-500"
        data-testid="home-in-progress-empty"
      >
        暂无进行中工单 · ④打包「现在做⑤」或进入答复后会出现在这里
      </div>
    )
  }

  return (
    <section
      className="rounded-lg bg-sky-50/50 px-1.5 py-1"
      data-testid="home-in-progress"
      aria-labelledby="home-in-progress-title"
    >
      <div className="mb-1.5 flex items-center gap-1.5">
        <Workflow className="h-3.5 w-3.5 text-sky-800" strokeWidth={1.75} aria-hidden />
        <h2
          id="home-in-progress-title"
          className="text-[12px] font-semibold text-sky-950"
        >
          进行中工单
        </h2>
        <span className="tabular rounded-full bg-sky-700 px-1.5 py-px text-[10px] font-semibold text-white">
          {rows.length}
        </span>
        {latestId ? (
          <Link
            to={`/agent/cases/${latestId}`}
            className="focus-ring ml-auto text-[11px] font-medium text-sky-900 underline-offset-2 hover:underline"
            data-testid="home-in-progress-company"
          >
            公司首页
          </Link>
        ) : null}
      </div>
      <ul className="space-y-1">
        {rows.map((r) => (
          <li key={r.id}>
            <Link
              to={r.href}
              className="focus-ring flex min-h-8 flex-col rounded-md px-1.5 py-1 text-[12px] leading-snug text-sky-950 hover:bg-sky-100/80"
              data-testid={`home-in-progress-${r.id}`}
            >
              <span>
                <span className="font-medium">【{r.title}】</span>
                {r.line}
              </span>
              {r.ticketLabel ? (
                <span className="text-[10px] text-sky-800/80">{r.ticketLabel}</span>
              ) : null}
            </Link>
          </li>
        ))}
      </ul>
      <p className="mt-1 px-1.5 text-[10px] text-sky-800/70">
        大厅可见进行中 · 拍板仍在部门工作台右栏 · 非真工单引擎
      </p>
    </section>
  )
}
