import { Link } from 'react-router-dom'
import { useMemo, useState } from 'react'
import { Plus, Search } from 'lucide-react'
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

function shortCaseNo(id: string): string {
  const bare = id.replace(/^case-biz-/, '').replace(/^case-/, '')
  return bare.length > 18 ? `${bare.slice(0, 16)}…` : bare
}

/**
 * /agent/cases · 多案流水（案盘）· product-pages §4.2
 * 首屏：案列表（案名/编号、当前部门、待确认、期限、客户）+ 筛选 + 开新案
 * 点行 → 公司首页；不放八部作业 / 企业单案陪跑壳
 */
export function BusinessCasesPage() {
  const { cases, getProgress, stageLabel, getPendingConfirms } = useBusinessCases()
  const { deptLabel } = useOrgConfig()
  const { entryRole } = useEntryRole()
  const [query, setQuery] = useState('')
  /** 对齐原型 cases.html：全部 / 有待确认 / 近期限 / 在交底部 */
  const [chip, setChip] = useState<'all' | 'pending' | 'urgent' | 'intake'>('all')

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
        const pendingCount = getPendingConfirms(c.id).length
        return {
          id: c.id,
          title: c.title,
          caseNo: shortCaseNo(c.id),
          deptId: dept.id,
          deptName: deptLabel(dept),
          stage: stageLabel(prog.stageId),
          pendingCount,
          /** 样机：有待确认视为近期限红点 */
          urgent: pendingCount > 0,
          client: '—',
        }
      }),
    [cases, getProgress, stageLabel, deptLabel, getPendingConfirms],
  )

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase()
    return rows.filter((r) => {
      if (chip === 'pending' && r.pendingCount <= 0) return false
      if (chip === 'urgent' && !r.urgent) return false
      if (chip === 'intake' && r.deptId !== 'dept-disclosure') return false
      if (!q) return true
      return (
        r.title.toLowerCase().includes(q) ||
        r.caseNo.toLowerCase().includes(q) ||
        r.deptName.toLowerCase().includes(q) ||
        r.id.toLowerCase().includes(q)
      )
    })
  }, [rows, query, chip])

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
                : '案子清单：卡在哪、谁待确认、期限红点 · 点进公司首页'}
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <Link
              to="/agent/cases/new"
              className="btn-press focus-ring inline-flex items-center gap-1.5 rounded-md bg-slate-900 px-3 py-1.5 text-[13px] font-semibold text-white hover:bg-slate-800"
              data-testid="business-new-case"
            >
              <Plus className="h-4 w-4" strokeWidth={2.25} aria-hidden />
              开新案
            </Link>
            <Link
              to="/agent/pending"
              className="btn-press focus-ring inline-flex items-center gap-1.5 rounded-md border border-slate-200 bg-white px-3 py-1.5 text-[13px] font-medium text-slate-700 hover:border-slate-300"
              data-testid="business-cases-pending"
            >
              待确认
            </Link>
          </div>
        </div>

        <div
          className="mt-4 flex flex-wrap gap-2"
          role="group"
          aria-label="筛选"
          data-testid="business-cases-chips"
        >
          {(
            [
              ['all', '全部'],
              ['pending', '有待确认'],
              ['urgent', '近期限'],
              ['intake', '在交底部'],
            ] as const
          ).map(([id, label]) => (
            <button
              key={id}
              type="button"
              onClick={() => setChip(id)}
              className={`btn-press focus-ring rounded-full border px-3 py-1 text-[12px] font-medium ${
                chip === id
                  ? 'border-slate-900 bg-slate-900 text-white'
                  : 'border-slate-200 bg-white text-slate-600 hover:border-slate-300'
              }`}
              data-testid={`business-cases-chip-${id}`}
              aria-pressed={chip === id}
            >
              {label}
            </button>
          ))}
        </div>

        {rows.length > 0 ? (
          <label
            className="relative mt-3 block"
            data-testid="business-cases-filter"
          >
            <span className="sr-only">筛选案子</span>
            <Search
              className="pointer-events-none absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-slate-400"
              strokeWidth={1.75}
              aria-hidden
            />
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="筛选案名 / 编号 / 部门"
              className="focus-ring w-full rounded-lg border border-slate-200 bg-white py-2 pl-9 pr-3 text-[13px] text-slate-800 placeholder:text-slate-400"
              data-testid="business-cases-filter-input"
            />
          </label>
        ) : null}

        {rows.length === 0 ? (
          <div
            className="mt-8 rounded-xl border border-dashed border-slate-200 bg-white px-4 py-12 text-center"
            data-testid="business-cases-empty"
          >
            <p className="text-sm font-medium text-slate-700">还没有案子</p>
            <p className="mt-1 text-[12px] text-slate-500">开一个案子，立一条业务线</p>
            <Link
              to="/agent/cases/new"
              className="btn-press focus-ring mt-4 inline-flex items-center gap-1.5 rounded-md bg-slate-900 px-3 py-1.5 text-[13px] font-semibold text-white hover:bg-slate-800"
              data-testid="business-cases-empty-cta"
            >
              <Plus className="h-4 w-4" strokeWidth={2.25} aria-hidden />
              开新案子
            </Link>
          </div>
        ) : filtered.length === 0 ? (
          <div
            className="mt-5 rounded-xl border border-dashed border-slate-200 bg-white px-4 py-8 text-center"
            data-testid="business-cases-filter-empty"
          >
            <p className="text-sm text-slate-600">没有匹配的案子</p>
            <button
              type="button"
              className="mt-2 text-[12px] font-medium text-slate-700 underline-offset-2 hover:underline"
              onClick={() => setQuery('')}
            >
              清除筛选
            </button>
          </div>
        ) : (
          <div
            className="mt-5 overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm"
            data-testid="business-cases-table"
          >
            <div className="hidden grid-cols-[minmax(0,1.5fr)_minmax(0,0.9fr)_minmax(0,0.7fr)_4.5rem_3rem] gap-2 border-b border-slate-100 bg-slate-50/80 px-4 py-2 text-[11px] font-medium text-slate-500 lg:grid">
              <span>案名 / 编号</span>
              <span>当前部门</span>
              <span>客户</span>
              <span className="text-right">待确认</span>
              <span className="text-center" title="期限（后续接入）">
                期限
              </span>
            </div>
            <ul className="divide-y divide-slate-100" aria-label="案子列表">
              {filtered.map((row) => (
                <li key={row.id}>
                  <Link
                    to={`/agent/cases/${row.id}`}
                    className="focus-ring grid grid-cols-1 items-center gap-1 px-4 py-3 transition-colors hover:bg-slate-50 lg:grid-cols-[minmax(0,1.5fr)_minmax(0,0.9fr)_minmax(0,0.7fr)_4.5rem_3rem] lg:gap-2"
                    data-testid={`business-case-row-${row.id}`}
                  >
                    <span className="min-w-0">
                      <span className="block truncate text-[14px] font-semibold text-slate-900">
                        {row.title}
                      </span>
                      <span
                        className="mt-0.5 block truncate font-mono text-[11px] text-slate-400"
                        data-testid={`business-case-no-${row.id}`}
                      >
                        {row.caseNo}
                      </span>
                      <span className="mt-0.5 block truncate text-[11px] text-slate-400 lg:hidden">
                        {row.deptName}
                        {row.pendingCount > 0
                          ? ` · 待确认 ${row.pendingCount}`
                          : ''}
                      </span>
                    </span>
                    <span className="hidden min-w-0 lg:block">
                      <span className="block truncate text-[13px] text-slate-700">
                        {row.deptName}
                      </span>
                      <span className="mt-0.5 block truncate text-[11px] text-slate-400">
                        {row.stage}
                      </span>
                    </span>
                    <span
                      className="hidden truncate text-[13px] text-slate-500 lg:block"
                      data-testid={`business-case-client-${row.id}`}
                      title="客户字段样机暂未接入"
                    >
                      {row.client}
                    </span>
                    <span
                      className={`hidden text-right text-[13px] tabular-nums lg:block ${
                        row.pendingCount > 0
                          ? 'font-semibold text-amber-800'
                          : 'text-slate-400'
                      }`}
                      data-testid={`business-case-pending-${row.id}`}
                    >
                      {row.pendingCount > 0 ? row.pendingCount : '—'}
                    </span>
                    <span
                      className="hidden justify-center lg:flex"
                      title="期限台后续接入"
                      data-testid={`business-case-docket-${row.id}`}
                      aria-label="期限占位"
                    >
                      <span
                        className={`h-2 w-2 rounded-full ${
                          row.pendingCount > 0 ? 'bg-amber-500' : 'bg-slate-200'
                        }`}
                        aria-hidden
                      />
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
