import { Link } from 'react-router-dom'
import { useMemo } from 'react'
import { Plus } from 'lucide-react'
import { useBusinessCases } from '../../business/BusinessCaseContext'
import { currentSeatForProgress } from '../../business/businessSeats'
import {
  MAIN_CHAIN_DEPTS,
  orgDeptByLeadSeat,
} from '../../departments/orgDepts'
import { useOrgConfig } from '../../departments/OrgConfigContext'
import { useEntryRole } from '../../business/useEntryRole'

export type BusinessHomeStartState = {
  summary?: string
  title?: string
  chip?: 'disclosure' | 'research'
  /** 首页对话框随指令带过来的资料（资产库 id） */
  attachments?: string[]
  /** @专家 / @部门 的提及，已格式化为可读串 */
  mentions?: string[]
}

/**
 * /agent/cases · 多案流水（代理人默认首页）
 * product-vision §3.2/§6.2 · product-pages §4.2
 * 案表：案名 / 当前部门 / 待确认 / 期限占位 → 点行进公司首页
 */
export function BusinessCasesPage() {
  const { cases, getProgress, stageLabel, getPendingConfirms } = useBusinessCases()
  const { deptLabel } = useOrgConfig()
  const { entryRole } = useEntryRole()

  const rows = useMemo(
    () =>
      cases.map((c) => {
        const prog = getProgress(c.id)
        const seat = currentSeatForProgress({
          stageId: prog.stageId,
          doneSeatIds: prog.doneSeatIds,
          moreSeatIds: prog.moreSeatIds,
        })
        const dept = orgDeptByLeadSeat(seat) ?? MAIN_CHAIN_DEPTS[0]!
        return {
          id: c.id,
          title: c.title,
          deptName: deptLabel(dept),
          stage: stageLabel(prog.stageId),
          pendingCount: getPendingConfirms(c.id).length,
        }
      }),
    [cases, getProgress, stageLabel, deptLabel, getPendingConfirms],
  )

  return (
    <div
      className="flex-1 overflow-y-auto px-4 py-6 lg:px-8"
      data-testid="business-cases-page"
      data-entry-role={entryRole}
      data-home="cases"
    >
      <div className="mx-auto w-full max-w-3xl">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div className="min-w-0">
            {entryRole === 'enterprise' ? (
              <p
                className="text-[11px] font-medium uppercase tracking-wide text-slate-400"
                data-testid="business-cases-eyebrow"
              >
                全部案子（次入口）
              </p>
            ) : null}
            <h1
              className={`text-[20px] font-semibold tracking-tight text-slate-900 ${
                entryRole === 'enterprise' ? 'mt-0.5' : ''
              }`}
              data-testid="business-cases-title"
            >
              {entryRole === 'agency' ? '案盘 · 多案流水' : '全部案子'}
            </h1>
            <p className="mt-1 text-sm text-slate-500">
              {entryRole === 'enterprise'
                ? '企业主路径是公司首页；这里可回看全部案子'
                : '点进案子进公司首页 · 待确认看右上铃铛'}
            </p>
          </div>
          <Link
            to="/agent/cases/new"
            className="btn-press focus-ring inline-flex items-center gap-1.5 rounded-md bg-slate-900 px-3 py-1.5 text-[13px] font-semibold text-white hover:bg-slate-800"
            data-testid="business-new-case"
          >
            <Plus className="h-4 w-4" strokeWidth={2.25} aria-hidden />
            开新案子
          </Link>
        </div>

        {rows.length === 0 ? (
          <div
            className="mt-8 rounded-xl border border-dashed border-slate-200 bg-white px-4 py-12 text-center"
            data-testid="business-cases-empty"
          >
            <p className="text-sm font-medium text-slate-700">还没有案子</p>
            <p className="mt-1 text-[12px] text-slate-500">
              开一个案子，从交底开始走七部主链
            </p>
            <Link
              to="/agent/cases/new"
              className="btn-press focus-ring mt-4 inline-flex items-center gap-1.5 rounded-md bg-slate-900 px-3 py-1.5 text-[13px] font-semibold text-white hover:bg-slate-800"
              data-testid="business-cases-empty-cta"
            >
              <Plus className="h-4 w-4" strokeWidth={2.25} aria-hidden />
              开新案子
            </Link>
          </div>
        ) : (
          <div
            className="mt-5 overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm"
            data-testid="business-cases-table"
          >
            <div className="hidden grid-cols-[minmax(0,1.4fr)_minmax(0,1fr)_5.5rem_3.5rem] gap-2 border-b border-slate-100 bg-slate-50/80 px-4 py-2 text-[11px] font-medium text-slate-500 sm:grid">
              <span>案名</span>
              <span>当前部门</span>
              <span className="text-right">待确认</span>
              <span className="text-center" title="期限（后续接入）">
                期限
              </span>
            </div>
            <ul className="divide-y divide-slate-100" aria-label="案子列表">
              {rows.map((row) => (
                <li key={row.id}>
                  <Link
                    to={`/agent/cases/${row.id}`}
                    className="focus-ring grid grid-cols-1 items-center gap-1 px-4 py-3 transition-colors hover:bg-slate-50 sm:grid-cols-[minmax(0,1.4fr)_minmax(0,1fr)_5.5rem_3.5rem] sm:gap-2"
                    data-testid={`business-case-row-${row.id}`}
                  >
                    <span className="min-w-0">
                      <span className="block truncate text-[14px] font-semibold text-slate-900">
                        {row.title}
                      </span>
                      <span className="mt-0.5 block truncate text-[11px] text-slate-400 sm:hidden">
                        {row.deptName}
                        {row.pendingCount > 0
                          ? ` · 待确认 ${row.pendingCount}`
                          : ''}
                      </span>
                    </span>
                    <span className="hidden min-w-0 sm:block">
                      <span className="block truncate text-[13px] text-slate-700">
                        {row.deptName}
                      </span>
                      <span className="mt-0.5 block truncate text-[11px] text-slate-400">
                        {row.stage}
                      </span>
                    </span>
                    <span
                      className={`hidden text-right text-[13px] tabular-nums sm:block ${
                        row.pendingCount > 0
                          ? 'font-semibold text-amber-800'
                          : 'text-slate-400'
                      }`}
                      data-testid={`business-case-pending-${row.id}`}
                    >
                      {row.pendingCount > 0 ? row.pendingCount : '—'}
                    </span>
                    <span
                      className="hidden justify-center sm:flex"
                      title="期限台后续接入"
                      data-testid={`business-case-docket-${row.id}`}
                      aria-label="期限占位"
                    >
                      <span className="h-2 w-2 rounded-full bg-slate-200" aria-hidden />
                    </span>
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>
    </div>
  )
}
