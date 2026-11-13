import { Link, useSearchParams } from 'react-router-dom'
import { SoftEmpty } from '../../components/soft/SoftEmpty'
import { useMemo } from 'react'
import { Plus, Search } from 'lucide-react'
import { useBusinessCases } from '../../business/BusinessCaseContext'
import { currentSeatForProgress } from '../../business/businessSeats'
import { collectBossTodos } from '../../business/bossTodos'
import {
  MAIN_CHAIN_DEPTS,
  deptSlug,
  orgDeptByLeadSeat,
} from '../../departments/orgDepts'
import { useOrgConfig } from '../../departments/OrgConfigContext'
import { useEntryRole } from '../../business/useEntryRole'
import { useProjectFolder } from '../../projects/ProjectFolderContext'
import { latestDepartmentSlug } from '../../business/departmentBrief'
import { deptIdFromSlug, orgDeptById } from '../../departments/orgDepts'
import { isBusinessSeedCaseId } from '../../business/businessSeeds'

export type BusinessHomeStartState = {
  summary?: string
  title?: string
  chip?: 'disclosure' | 'research'
  /** 首页对话框随指令带过来的资料（资产库 id） */
  attachments?: string[]
  /** @专家 / @部门 的提及，已格式化为可读串 */
  mentions?: string[]
  /** 助手委托链生成的计划文案（样机；供 createCaseFromWizard） */
  casePlan?: string
}

function shortCaseNo(id: string): string {
  const bare = id.replace(/^case-biz-/, '').replace(/^case-/, '')
  return bare.length > 18 ? `${bare.slice(0, 16)}…` : bare
}

type FilterChip = 'all' | 'pending' | 'deadline' | 'disclosure'

/**
 * /agent/cases · 项目列表（案盘）· 一期：单栏清单；§118：点行→当前部台（非概况）
 * §116：不挂侧栏案树；开新案/搜索各一处；不镜像壳层大厅/待确认链接。
 * 禁：把待确认与近期限筛成同一条件；期限点仅同源 bossTodos B（有截止日）。
 */
export function BusinessCasesPage() {
  const { threads } = useProjectFolder()
  const { cases, getProgress, stageLabel, getPendingConfirms } = useBusinessCases()
  const { deptLabel } = useOrgConfig()
  const { entryRole } = useEntryRole()
  const [params, setParams] = useSearchParams()
  const query = params.get('q') ?? ''
  const scope = params.get('scope') === 'demo' ? 'demo' : 'workspace'
  const chipRaw = params.get('chip')
  const chip: FilterChip =
    chipRaw === 'pending' ||
    chipRaw === 'deadline' ||
    chipRaw === 'disclosure' ||
    chipRaw === 'all'
      ? chipRaw
      : 'all'
  const setQuery = (q: string) => {
    const p = new URLSearchParams(params)
    if (q.trim()) p.set('q', q)
    else p.delete('q')
    setParams(p, { replace: true })
  }
  const setChip = (c: FilterChip) => {
    const p = new URLSearchParams(params)
    if (c === 'all') p.delete('chip')
    else p.set('chip', c)
    setParams(p, { replace: true })
  }

  const setScope = (next: 'workspace' | 'demo') => {
    const p = new URLSearchParams(params)
    if (next === 'demo') p.set('scope', 'demo')
    else p.delete('scope')
    p.delete('q')
    p.delete('chip')
    setParams(p, { replace: true })
  }

  const visibleCases = useMemo(
    () => cases.filter((c) => isBusinessSeedCaseId(c.id) === (scope === 'demo')),
    [cases, scope],
  )

  const progressById = useMemo(() => {
    const map: Record<string, ReturnType<typeof getProgress>> = {}
    for (const c of cases) map[c.id] = getProgress(c.id)
    return map
  }, [cases, getProgress])

  const todos = useMemo(
    () =>
      collectBossTodos({
        scope,
        pending: getPendingConfirms().filter((item) => isBusinessSeedCaseId(item.caseId) === (scope === 'demo')),
        cases: visibleCases,
        progressById,
      }),
    [getPendingConfirms, visibleCases, progressById, scope],
  )

  const rows = useMemo(
    () =>
      visibleCases.map((c) => {
        const prog = progressById[c.id]!
        const seat = currentSeatForProgress({
          stageId: prog.stageId,
          doneSeatIds: prog.doneSeatIds,
          moreSeatIds: prog.moreSeatIds,
        })
        const selectedSlug = latestDepartmentSlug(c.id, threads) ?? prog.receptionHandoff?.selectedSlug
        const dept = (selectedSlug ? orgDeptById(deptIdFromSlug(selectedSlug) ?? '') : undefined) ?? orgDeptByLeadSeat(seat) ?? MAIN_CHAIN_DEPTS[0]!
        const pendingCount = getPendingConfirms(c.id).length
        /** 诚实 B：仅有截止日的催办，不用 filed/oa 启发式冒充 */
        const hasDeadlineB = todos.b.some((x) => x.caseId === c.id)
        const deadlineOverdue = todos.b.some(
          (x) => x.caseId === c.id && x.overdue,
        )
        return {
          id: c.id,
          demo: isBusinessSeedCaseId(c.id),
          title: c.title,
          caseNo: shortCaseNo(c.id),
          deptId: dept.id,
          deptSlug: deptSlug(dept.id),
          deptName: deptLabel(dept),
          stage: stageLabel(prog.stageId),
          pendingCount,
          inDeadlinePhase: hasDeadlineB,
          deadlineOverdue,
          who: deptLabel(dept),
        }
      }),
    [
      visibleCases,
      progressById,
      threads,
      stageLabel,
      deptLabel,
      getPendingConfirms,
      todos.b,
    ],
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
      data-cases-dedupe="list-v118"
    >
      <div className="mx-auto w-full max-w-3xl">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div className="min-w-0">
            <h1
              className="text-balance text-[20px] font-semibold text-slate-900"
              data-testid="business-cases-title"
            >
              项目
            </h1>
            <p className="mt-1 text-sm text-slate-500" data-testid="business-cases-subtitle">
              {scope === 'demo' ? `演示项目 · ${visibleCases.length} 个，仅供查看流程` : `我的项目 · ${visibleCases.length} 个`}
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

        <div className="mt-4 flex flex-wrap items-center gap-2" role="group" aria-label="项目范围">
          <button type="button" aria-pressed={scope === 'workspace'} onClick={() => setScope('workspace')} className={'focus-ring min-h-9 rounded-lg border px-3 py-2 text-xs ' + (scope === 'workspace' ? 'border-slate-900 bg-slate-900 text-white' : 'border-slate-200 bg-white text-slate-600')} data-testid="business-cases-scope-workspace">我的项目</button>
          <button type="button" aria-pressed={scope === 'demo'} onClick={() => setScope('demo')} className={'focus-ring min-h-9 rounded-lg border px-3 py-2 text-xs ' + (scope === 'demo' ? 'border-amber-300 bg-amber-50 text-amber-900' : 'border-slate-200 bg-white text-slate-500')} data-testid="business-cases-scope-demo">演示项目</button>
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
              ['pending', '要你拍'],
              ['deadline', '有期限催办'],
              ['disclosure', '在交底部'],
            ] as const
          ).map(([id, label]) => (
            <button
              key={id}
              type="button"
              onClick={() => setChip(id)}
              className={`btn-press focus-ring min-h-10 rounded-full border px-3 py-1.5 text-[12px] font-medium ${
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
              type="search"
              name="case-filter"
              autoComplete="off"
              className="focus-ring w-full rounded-lg border border-slate-200 bg-white py-2 pl-9 pr-3 text-[13px] text-slate-800 placeholder:text-slate-400"
              data-testid="business-cases-filter-input"
            />
          </label>
        ) : null}

        {rows.length === 0 ? (
          <SoftEmpty
            kind="cases-list"
            testId="business-cases-empty"
            className="mt-8 bg-white py-12"
            action={
              <Link
                to="/agent"
                className="btn-press focus-ring inline-flex items-center gap-1.5 rounded-md bg-slate-900 px-3 py-1.5 text-[13px] font-semibold text-white hover:bg-slate-800"
                data-testid="business-cases-empty-cta"
              >
                去大厅
              </Link>
            }
          />
        ) : filtered.length === 0 ? (
          <div
            className="mt-5"
            data-testid="business-cases-filter-empty"
            data-empty-tone="office"
          >
            <SoftEmpty
              kind="cases-filter"
              testId="business-cases-filter-empty-copy"
              className="bg-white py-8"
            />
            <div className="mt-2 text-center">
              <button
                type="button"
                className="btn-press focus-ring rounded-md px-2 py-1.5 text-[12px] font-medium text-slate-700 underline-offset-2 hover:underline"
                onClick={() => {
                  setQuery('')
                  setChip('all')
                }}
              >
                清除筛选
              </button>
            </div>
          </div>
        ) : (
          <div
            className="mt-5 overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm"
            data-testid="business-cases-table"
          >
            <div className="hidden grid-cols-[minmax(0,1.6fr)_minmax(0,1fr)_4.5rem_4.5rem] gap-2 border-b border-slate-100 bg-slate-50/80 px-4 py-2 text-[11px] font-medium text-slate-500 lg:grid">
              <span>案名 / 编号</span>
              <span>当前部门 · 谁在干</span>
              <span className="text-right">要你拍</span>
              <span className="text-center" title="带截止日的催办 · 样机日亦可">
                期限
              </span>
            </div>
            <ul className="divide-y divide-slate-100" aria-label="案子列表">
              {filtered.map((row) => (
                <li key={row.id}>
                  <Link
                    to={`/agent/cases/${row.id}/depts/${row.deptSlug}`}
                    className="focus-ring grid grid-cols-1 items-center gap-1 px-4 py-3 transition-colors hover:bg-slate-50 lg:grid-cols-[minmax(0,1.6fr)_minmax(0,1fr)_4.5rem_4.5rem] lg:gap-2"
                    data-testid={`business-case-row-${row.id}`}
                    data-enter="current-dept"
                  >
                    <span className="min-w-0">
                      <span className="block truncate text-[14px] font-semibold text-slate-900">
                        {row.title}
                        {row.demo ? <span className="ml-2 inline-flex rounded-sm bg-amber-50 px-1.5 py-0.5 align-middle text-[10px] font-medium text-amber-800">演示</span> : null}
                      </span>
                      <span
                        className="mt-0.5 block truncate font-mono text-[11px] text-slate-400"
                        data-testid={`business-case-no-${row.id}`}
                      >
                        {row.caseNo}
                      </span>
                      <span className="mt-0.5 block truncate text-[11px] text-slate-400 lg:hidden">
                        {row.deptName}
                        {row.pendingCount > 0 ? ' · 要你拍' : ''}
                      </span>
                    </span>
                    <span className="hidden min-w-0 lg:block">
                      <span className="block truncate text-[13px] text-slate-700">
                        {row.deptName}
                      </span>
                      <span
                        className="mt-0.5 block truncate text-[11px] text-slate-400"
                        data-testid={`business-case-status-${row.id}`}
                      >
                        {row.pendingCount > 0 ? '要你拍' : '进行中'}
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
                        row.deadlineOverdue
                          ? '有逾期催办'
                          : row.inDeadlinePhase
                            ? '有期限催办（含样机日）'
                            : '无带截止日的催办'
                      }
                      data-testid={`business-case-docket-${row.id}`}
                      data-deadline={row.inDeadlinePhase ? '1' : '0'}
                      data-overdue={row.deadlineOverdue ? '1' : '0'}
                      aria-label={
                        row.deadlineOverdue
                          ? '逾期催办'
                          : row.inDeadlinePhase
                            ? '期限催办'
                            : '无期限催办'
                      }
                    >
                      <span
                        className={`h-2 w-2 rounded-full ${
                          row.deadlineOverdue
                            ? 'bg-rose-500'
                            : row.inDeadlinePhase
                              ? 'bg-orange-400'
                              : 'bg-slate-200'
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
