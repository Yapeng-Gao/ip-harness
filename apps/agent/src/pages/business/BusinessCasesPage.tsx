import { Link, useNavigate } from 'react-router-dom'
import { FolderPlus, Bell, ChevronRight } from 'lucide-react'
import { useBusinessCases } from '../../business/BusinessCaseContext'
import {
  BUSINESS_DEFAULT_SEAT_IDS,
  businessSeatLabel,
} from '../../business/businessSeats'

/**
 * /agent cold start — 我的案子（非 Catalog）
 */
export function BusinessCasesPage() {
  const { cases, getProgress, getPendingConfirms, primaryCta, stageLabel } =
    useBusinessCases()
  const navigate = useNavigate()
  const inbox = getPendingConfirms()

  return (
    <div
      className="flex-1 overflow-y-auto px-4 py-6 lg:px-8"
      data-testid="business-cases-page"
    >
      <div className="mx-auto max-w-3xl">
        <header className="mb-6 flex flex-wrap items-start justify-between gap-3">
          <div>
            <h1 className="text-[22px] font-semibold tracking-tight text-slate-900">
              我的案子
            </h1>
            <p className="mt-1 text-sm text-slate-500">
              进度与待确认同源 · 默认 {BUSINESS_DEFAULT_SEAT_IDS.length}{' '}
              个业务专家席
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <Link
              to="/agent/pending"
              className="btn-press focus-ring inline-flex items-center gap-1.5 rounded-full border border-amber-200 bg-amber-50 px-3 py-1.5 text-xs font-medium text-amber-900"
              data-testid="business-inbox-link"
            >
              <Bell className="h-3.5 w-3.5" aria-hidden />
              待我确认
              {inbox.length > 0 && (
                <span className="ml-0.5 inline-flex min-w-[1.125rem] items-center justify-center rounded-full bg-amber-600 px-1 text-[10px] font-semibold text-white">
                  {inbox.length}
                </span>
              )}
            </Link>
            <button
              type="button"
              onClick={() => navigate('/agent/cases/new')}
              className="btn-press focus-ring inline-flex items-center gap-1.5 rounded-md bg-slate-900 px-3 py-1.5 text-xs font-semibold text-white"
              data-testid="business-new-case"
            >
              <FolderPlus className="h-3.5 w-3.5" aria-hidden />
              新建案子
            </button>
          </div>
        </header>

        {inbox.length > 0 && (
          <section
            className="mb-5 rounded-xl border border-amber-200 bg-amber-50/80 p-3"
            data-testid="business-inbox-preview"
          >
            <div className="mb-2 flex items-center justify-between">
              <h2 className="text-xs font-semibold text-amber-900">
                待我确认
              </h2>
              <Link
                to="/agent/pending"
                className="text-[11px] font-medium text-amber-800 underline-offset-2 hover:underline"
              >
                全部
              </Link>
            </div>
            <ul className="space-y-1.5">
              {inbox.slice(0, 3).map((item) => {
                const c = cases.find((x) => x.id === item.caseId)
                return (
                  <li key={item.id}>
                    <Link
                      to={`/agent/pending/${item.id}`}
                      className="focus-ring flex items-center justify-between gap-2 rounded-lg border border-amber-100 bg-white px-3 py-2 text-left hover:border-amber-300"
                      data-testid={`business-inbox-row-${item.id}`}
                    >
                      <div className="min-w-0">
                        <div className="truncate text-xs font-medium text-slate-800">
                          {c?.title ?? '案子'} · {item.title}
                        </div>
                        <div className="truncate text-[11px] text-slate-500">
                          {item.preparedBy}准备好的 · {item.createdAt}
                        </div>
                      </div>
                      <ChevronRight
                        className="h-4 w-4 shrink-0 text-slate-400"
                        aria-hidden
                      />
                    </Link>
                  </li>
                )
              })}
            </ul>
          </section>
        )}

        <ul className="space-y-2" data-testid="business-case-list">
          {cases.length === 0 && (
            <li className="rounded-xl border border-dashed border-slate-200 bg-white px-4 py-10 text-center">
              <p className="text-sm text-slate-600">还没有案子</p>
              <button
                type="button"
                onClick={() => navigate('/agent/cases/new')}
                className="btn-press focus-ring mt-3 rounded-md bg-slate-900 px-4 py-2 text-xs font-semibold text-white"
              >
                新建案子
              </button>
            </li>
          )}
          {cases.map((c) => {
            const prog = getProgress(c.id)
            const cta = primaryCta(c.id)
            const pending = getPendingConfirms(c.id)
            return (
              <li key={c.id}>
                <Link
                  to={`/agent/cases/${c.id}`}
                  className="focus-ring block rounded-xl border border-slate-200 bg-white px-4 py-3 shadow-sm hover:border-slate-300 hover:shadow"
                  data-testid={`business-case-row-${c.id}`}
                >
                  <div className="flex flex-wrap items-start justify-between gap-2">
                    <div className="min-w-0">
                      <div className="text-sm font-semibold text-slate-900">
                        {c.title}
                      </div>
                      <div className="mt-0.5 text-[11px] text-slate-500">
                        当前：{stageLabel(prog.stageId)}
                        {pending.length > 0
                          ? ` · ${pending.length} 项待确认`
                          : ''}
                      </div>
                      <div className="mt-2 flex flex-wrap gap-1">
                        {BUSINESS_DEFAULT_SEAT_IDS.map((sid) => {
                          const done = prog.doneSeatIds.includes(sid)
                          return (
                            <span
                              key={sid}
                              className={`rounded-full border px-1.5 py-px text-[10px] ${
                                done
                                  ? 'border-emerald-200 bg-emerald-50 text-emerald-800'
                                  : 'border-slate-200 bg-slate-50 text-slate-500'
                              }`}
                            >
                              {businessSeatLabel(sid)}
                            </span>
                          )
                        })}
                      </div>
                    </div>
                    <span
                      className={`shrink-0 rounded-full px-2.5 py-1 text-[11px] font-medium ${
                        cta.action === 'confirm'
                          ? 'bg-amber-100 text-amber-900'
                          : 'bg-slate-100 text-slate-700'
                      }`}
                    >
                      {cta.label}
                    </span>
                  </div>
                </Link>
              </li>
            )
          })}
        </ul>

        <p className="mt-8 text-center text-[11px] text-slate-400">
          演示环境：进度与确认为样机闭环，非真递交局端。
        </p>
        <div className="mt-3 flex justify-center gap-3 text-[11px] text-slate-400">
          <Link
            to="/agent/catalog"
            className="hover:text-slate-600 hover:underline"
            data-testid="business-to-catalog"
          >
            专家工作台
          </Link>
        </div>
      </div>
    </div>
  )
}
