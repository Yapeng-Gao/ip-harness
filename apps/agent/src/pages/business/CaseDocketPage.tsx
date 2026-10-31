import { useMemo, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { useBusinessCases } from '../../business/BusinessCaseContext'
import type { CaseProgress } from '../../business/BusinessCaseContext'

type FilterChip = 'all' | 'soon' | 'overdue'

type DocketRow = {
  id: string
  name: string
  dueLabel: string
  status: 'overdue' | 'soon' | 'ok'
  statusLabel: string
  deptSlug: string
  deptLabel: string
  note: string
}

/**
 * 期限台 · product-pages §4.11
 * 机制：案级后勤横切——看见期限列表；主 CTA 进关联部工作台。
 * 禁：抢公司→工作台主链；与案卷抽屉混名；冒充官报/真期限引擎；假「当前项目」。
 * 示意行由本案进度派生（filed / oa），非官方法律状态。
 */
function demoRows(caseId: string, prog: CaseProgress): DocketRow[] {
  const rows: DocketRow[] = []
  const round = Math.max(prog.oaRound || 0, 0)
  if (prog.filed || round > 0 || prog.stageId === 'oa') {
    const r = Math.max(round, 1)
    rows.push({
      id: `${caseId}-oa-${r}`,
      name: `第 ${r} 通答复期限`,
      dueLabel: '示意 · 约 15 日内',
      status: 'soon',
      statusLabel: '即将到期',
      deptSlug: 'oa',
      deptLabel: '答复部',
      note: '程序期限示意 · 非官报绝限日',
    })
  }
  if (prog.filed) {
    rows.push({
      id: `${caseId}-annuity`,
      name: '年费窗口提醒',
      dueLabel: '示意 · 维持周期',
      status: 'ok',
      statusLabel: '正常',
      deptSlug: 'annuity',
      deptLabel: '维护部',
      note: '结构示意 · 无真年费引擎',
    })
  }
  // 演示：审查中案补一条可见逾期，验「逾期须可见不可静默」
  if (prog.stageId === 'oa' && round >= 1) {
    rows.unshift({
      id: `${caseId}-oa-overdue-demo`,
      name: '补正通知绝限（演示）',
      dueLabel: '示意 · 已过',
      status: 'overdue',
      statusLabel: '已逾期',
      deptSlug: 'oa',
      deptLabel: '答复部',
      note: '演示逾期可见 · 非法条改写',
    })
  }
  return rows
}

export function CaseDocketPage() {
  const { caseId = '' } = useParams()
  const { getCase, getProgress } = useBusinessCases()
  const c = getCase(caseId)
  const home = `/agent/cases/${caseId}`
  const [chip, setChip] = useState<FilterChip>('all')

  const prog = getProgress(caseId)
  const rows = useMemo(
    () => (c && prog ? demoRows(caseId, prog) : []),
    [c, caseId, prog],
  )
  const filtered = useMemo(() => {
    if (chip === 'soon') return rows.filter((r) => r.status === 'soon')
    if (chip === 'overdue') return rows.filter((r) => r.status === 'overdue')
    return rows
  }, [rows, chip])

  if (!c) {
    return (
      <div
        className="flex flex-1 items-center justify-center p-8"
        data-testid="case-docket-page"
      >
        <div className="text-center">
          <p className="text-sm text-slate-600">找不到这个案子</p>
          <Link
            to="/agent/cases"
            className="mt-3 inline-block text-sm font-medium text-slate-900 underline"
          >
            返回案盘
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div
      className="flex-1 overflow-y-auto px-4 py-6 lg:px-8"
      data-testid="case-docket-page"
      data-docket="list-v1"
      data-case-id={caseId}
    >
      <div className="mx-auto max-w-2xl">
        <nav
          className="mb-3 flex flex-wrap items-center gap-x-2.5 gap-y-1 text-[11px] text-slate-500"
          aria-label="期限台次要入口"
          data-testid="case-docket-secondary"
        >
          <Link
            to="/agent"
            className="focus-ring rounded-sm font-medium text-slate-600 underline-offset-2 hover:text-slate-900 hover:underline"
            data-testid="case-docket-back-hall"
          >
            回大厅
          </Link>
          <span aria-hidden className="text-slate-300">
            ·
          </span>
          <Link
            to={home}
            className="focus-ring rounded-sm font-medium text-slate-600 underline-offset-2 hover:text-slate-900 hover:underline"
            data-testid="case-docket-back-home"
          >
            公司案首页
          </Link>
          <span aria-hidden className="text-slate-300">
            ·
          </span>
          <Link
            to={`${home}/billing`}
            className="focus-ring rounded-sm font-medium text-slate-600 underline-offset-2 hover:text-slate-900 hover:underline"
          >
            账单
          </Link>
          <span aria-hidden className="text-slate-300">
            ·
          </span>
          <Link
            to={`${home}/members`}
            className="focus-ring rounded-sm font-medium text-slate-600 underline-offset-2 hover:text-slate-900 hover:underline"
          >
            成员
          </Link>
        </nav>

        <p
          className="rounded-lg border border-dashed border-slate-200 bg-slate-50 px-3 py-2 text-[11px] text-slate-600"
          data-testid="case-docket-thin-hint"
          role="status"
        >
          后勤横切 · 不抢「公司 → 工作台」主链 · 示意非官报 / 无真期限引擎
        </p>

        <h1
          className="mt-3 text-[20px] font-semibold text-slate-900"
          data-testid="case-docket-heading"
        >
          期限台
        </h1>
        <p className="mt-1 text-sm text-slate-500">
          看见本案法定/程序期限与绝限 · 逾期须可见。案卷（材料/检查表/工单）在工作台顶栏抽屉，不与本台混名。
        </p>

        <div
          className="mt-4 flex flex-wrap gap-2"
          role="group"
          aria-label="期限筛选"
          data-testid="case-docket-chips"
        >
          {(
            [
              ['all', '全部'],
              ['soon', '即将到期'],
              ['overdue', '已逾期'],
            ] as const
          ).map(([id, label]) => (
            <button
              key={id}
              type="button"
              onClick={() => setChip(id)}
              className={`btn-press focus-ring rounded-full px-3 py-1 text-[12px] font-medium ${
                chip === id
                  ? 'bg-slate-900 text-white'
                  : 'border border-slate-200 bg-white text-slate-700 hover:border-slate-300'
              }`}
              data-testid={`case-docket-chip-${id}`}
              aria-pressed={chip === id}
            >
              {label}
            </button>
          ))}
        </div>

        {filtered.length === 0 ? (
          <div
            className="mt-6 rounded-xl border border-dashed border-slate-200 bg-white px-4 py-10 text-center"
            data-testid="case-docket-empty"
          >
            <p className="text-sm text-slate-500">本案暂无期限事件</p>
            <p className="mt-1 text-[11px] text-slate-400">
              递交/进答复轮后会出现示意行；逾期不可静默。
            </p>
            <Link
              to={home}
              className="btn-press focus-ring mt-4 inline-flex rounded-md bg-slate-900 px-3 py-1.5 text-[12px] font-semibold text-white"
              data-testid="case-docket-empty-company"
            >
              回公司办主链
            </Link>
          </div>
        ) : (
          <ul
            className="mt-5 space-y-2"
            aria-label="期限列表"
            data-testid="case-docket-list"
          >
            {filtered.map((row) => (
              <li key={row.id}>
                <Link
                  to={`${home}/depts/${row.deptSlug}?ask=1`}
                  className={`focus-ring block rounded-xl border bg-white px-4 py-3 shadow-sm transition-colors hover:border-slate-300 ${
                    row.status === 'overdue'
                      ? 'border-rose-300'
                      : row.status === 'soon'
                        ? 'border-amber-200'
                        : 'border-slate-200'
                  }`}
                  data-testid={`case-docket-row-${row.id}`}
                  data-status={row.status}
                >
                  <div className="flex flex-wrap items-center gap-2">
                    <span
                      className={`rounded-full px-2 py-0.5 text-[10px] font-semibold ${
                        row.status === 'overdue'
                          ? 'bg-rose-100 text-rose-900'
                          : row.status === 'soon'
                            ? 'bg-amber-100 text-amber-950'
                            : 'bg-slate-100 text-slate-700'
                      }`}
                    >
                      {row.statusLabel}
                    </span>
                    <span className="text-sm font-semibold text-slate-900">
                      {row.name}
                    </span>
                  </div>
                  <div className="mt-0.5 text-[11px] text-slate-500">
                    {row.dueLabel} · {row.deptLabel} · 点进该部工作台
                  </div>
                  <div className="mt-1 text-[10px] text-slate-400">{row.note}</div>
                </Link>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  )
}
