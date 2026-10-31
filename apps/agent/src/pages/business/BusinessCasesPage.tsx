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

type FilterChip = 'all' | 'pending' | 'deadline' | 'disclosure'

/**
 * /agent/cases · 多案流水（案盘）· product-pages §4.2
 * 机制：清单看卡点/下一步/谁在干；点行→公司首页。
 * 禁：把待确认与近期限筛成同一条件；禁用待确认点冒充期限红点；
 * 禁：待确认钮与开新案同权抢主（拍板主路径=工作台右栏；审计另走）。
 */
export function BusinessCasesPage() {
  const { cases, getProgress, stageLabel, getPendingConfirms } = useBusinessCases()
  const { deptLabel } = useOrgConfig()
  const { entryRole } = useEntryRole()
  const [query, setQuery] = useState('')
  const [chip, setChip] = useState<FilterChip>('all')

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
        /** 期限阶段示意：已递交或已进答复轮 · 非官报、非把待拍当期限 */
        const inDeadlinePhase =
          Boolean(prog.filed) || (prog.oaRound ?? 0) > 0 || prog.stageId === 'oa'
        return {
          id: c.id,
          title: c.title,
          caseNo: shortCaseNo(c.id),
          deptId: dept.id,
          deptName: deptLabel(dept),
          stage: stageLabel(prog.stageId),
          pendingCount,
          inDeadlinePhase,
          who: deptLabel(dept),
        }
      }),
    [cases, getProgress, stageLabel, deptLabel, getPendingConfirms],
  )

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase()
    return rows.filter((r) => {
      if (chip === 'pending' && r.pendingCount <= 0) return false
      if (chip === 'deadline' && !r.inDeadlinePhase) return false
      if (chip === 'disclosure' && r.deptId !== 'dept-disclosure') return false
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
      data-cases-dedupe="list-v1"
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
                ? '企业主路径是公司首页；这里回看全部案子 · 点行进该公司'
                : '卡点 · 待你拍 · 谁在干 · 点行进公司首页（拍板仍在部门工作台）'}
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
          </div>
        </div>

        <nav
          className="mt-2 flex flex-wrap items-center gap-x-2.5 gap-y-1 text-[11px] text-slate-500"
          aria-label="案盘次要入口"
          data-testid="business-cases-secondary"
        >
          <Link
            to="/agent"
            className="focus-ring rounded-sm font-medium text-slate-600 underline-offset-2 hover:text-slate-900 hover:underline"
            data-testid="business-cases-back-hall"
          >
            回大厅
          </Link>
          <span aria-hidden className="text-slate-300">
            ·
          </span>
          <Link
            to="/agent/pending?audit=1"
            className="focus-ring rounded-sm font-medium text-slate-600 underline-offset-2 hover:text-slate-900 hover:underline"
            data-testid="business-cases-pending"
          >
            审计列表
          </Link>
          <span className="text-slate-400">（拍板不在此页）</span>
        </nav>

        <div
          className="mt-4 flex flex-wrap gap-2"
          role="group"
          aria-label="筛选"
          data-testid="business-cases-chips"
        >
          {(
            [
              ['all', '全部'],
              ['pending', '有待你拍'],
              ['deadline', '答复/期限阶段'],
              ['disclosure', '在交底部'],
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
              onClick={() => {
                setQuery('')
                setChip('all')
              }}
            >
              清除筛选
            </button>
          </div>
        ) : (
          <div
            className="mt-5 overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm"
            data-testid="business-cases-table"
          >
            <div className="hidden grid-cols-[minmax(0,1.6fr)_minmax(0,1fr)_4.5rem_4.5rem] gap-2 border-b border-slate-100 bg-slate-50/80 px-4 py-2 text-[11px] font-medium text-slate-500 lg:grid">
              <span>案名 / 编号</span>
              <span>当前部门 · 谁在干</span>
              <span className="text-right">待你拍</span>
              <span className="text-center" title="答复/期限阶段示意 · 非官报">
                期限态
              </span>
            </div>
            <ul className="divide-y divide-slate-100" aria-label="案子列表">
              {filtered.map((row) => (
                <li key={row.id}>
                  <Link
                    to={`/agent/cases/${row.id}`}
                    className="focus-ring grid grid-cols-1 items-center gap-1 px-4 py-3 transition-colors hover:bg-slate-50 lg:grid-cols-[minmax(0,1.6fr)_minmax(0,1fr)_4.5rem_4.5rem] lg:gap-2"
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
                          ? ` · 待你拍 ${row.pendingCount}`
                          : ''}
                        {row.inDeadlinePhase ? ' · 期限阶段' : ''}
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
                      title={
                        row.inDeadlinePhase
                          ? '已递交/答复阶段 · 示意 · 非官报'
                          : '未进答复期限阶段'
                      }
                      data-testid={`business-case-docket-${row.id}`}
                      data-deadline={row.inDeadlinePhase ? '1' : '0'}
                      aria-label={
                        row.inDeadlinePhase ? '期限阶段示意' : '未进期限阶段'
                      }
                    >
                      <span
                        className={`h-2 w-2 rounded-full ${
                          row.inDeadlinePhase ? 'bg-rose-500' : 'bg-slate-200'
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
