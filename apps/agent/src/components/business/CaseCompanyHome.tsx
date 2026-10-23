import { Link } from 'react-router-dom'
import { ArrowRight, Bell, ChevronDown, ChevronRight } from 'lucide-react'
import { useMemo, useState } from 'react'
import { useBusinessCases } from '../../business/BusinessCaseContext'
import {
  currentSeatForProgress,
} from '../../business/businessSeats'
import {
  MAIN_CHAIN_DEPTS,
  PRE_DEPTS,
  POST_DEPTS_LIST,
  deptSlug,
  orgDeptByLeadSeat,
  type OrgDept,
  type OrgDeptId,
} from '../../departments/orgDepts'
import { peerDisplayLabel } from '../../departments/deptPageNarrative'
import {
  confirmKindOf,
  deptStatus,
  rollupByDept,
} from '../../departments/deptProgress'
import { useOrgConfig } from '../../departments/OrgConfigContext'
import { DeptStatusDot } from '../departments/DeptStatusDot'

type Props = {
  caseId: string
  title: string
  summary?: string
}

/**
 * 公司首页 · product-pages §4.3
 * 定位句 + 七部地图（点部门展开 ≤3 专家）+ 去当前部门 + 待确认 + 更多部门
 */
export function CaseCompanyHome({ caseId, title, summary }: Props) {
  const { getProgress, getPendingConfirms, cases } = useBusinessCases()
  const { deptLabel } = useOrgConfig()
  const [moreOpen, setMoreOpen] = useState(false)
  const [expandedDeptId, setExpandedDeptId] = useState<OrgDeptId | null>(null)
  const prog = getProgress(caseId)
  const pending = getPendingConfirms(caseId)

  const currentSeat = useMemo(
    () =>
      currentSeatForProgress({
        stageId: prog.stageId,
        doneSeatIds: prog.doneSeatIds,
        moreSeatIds: prog.moreSeatIds,
      }),
    [prog.stageId, prog.doneSeatIds, prog.moreSeatIds],
  )
  const currentDept =
    orgDeptByLeadSeat(currentSeat) ?? MAIN_CHAIN_DEPTS[0]!
  const currentHref = `/agent/cases/${caseId}/depts/${deptSlug(currentDept.id)}`

  const rollups = useMemo(
    () =>
      rollupByDept({
        cases,
        getProgress,
        pending: getPendingConfirms(),
      }),
    [cases, getProgress, getPendingConfirms],
  )

  const moreDepts: OrgDept[] = useMemo(() => {
    const mainIds = new Set(MAIN_CHAIN_DEPTS.map((d) => d.id))
    return [...PRE_DEPTS, ...POST_DEPTS_LIST].filter((d) => !mainIds.has(d.id))
  }, [])

  const toggleDept = (id: OrgDeptId) => {
    setExpandedDeptId((cur) => (cur === id ? null : id))
  }

  return (
    <div
      className="mx-auto flex w-full max-w-3xl flex-col gap-5"
      data-testid="case-company-home"
      data-case-id={caseId}
    >
      <section className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
        <div className="flex flex-wrap items-baseline gap-x-2 gap-y-0.5">
          <p
            className="text-[13px] font-medium text-slate-800"
            data-testid="company-tagline"
          >
            一案一家外挂 IP 部
          </p>
          <span
            className="font-mono text-[11px] text-slate-400"
            data-testid="company-case-id"
          >
            {caseId}
          </span>
        </div>
        <p className="mt-1 text-[12px] leading-relaxed text-slate-500">
          这是本案的 IP 部：看清当前部门，点开才见专家，去当前部门干活。
        </p>
        <div className="mt-3 flex flex-wrap items-baseline gap-2">
          <h2 className="text-[16px] font-semibold text-slate-900">{title}</h2>
          {summary ? (
            <span className="text-[12px] text-slate-500">{summary}</span>
          ) : null}
        </div>
        <p className="mt-2 text-[12px] text-slate-600">
          当前部门：
          <span className="font-semibold text-slate-900">
            {deptLabel(currentDept)}
          </span>
        </p>
        <div className="mt-3 flex flex-wrap gap-2">
          <Link
            to={currentHref}
            className="btn-press focus-ring inline-flex items-center gap-1.5 rounded-md bg-slate-900 px-3 py-1.5 text-xs font-semibold text-white"
            data-testid="company-go-current-dept"
          >
            去当前部门
            <ArrowRight className="h-3.5 w-3.5" aria-hidden />
          </Link>
          <Link
            to={pending[0] ? `/agent/pending/${pending[0].id}` : '/agent/pending'}
            className="btn-press focus-ring inline-flex items-center gap-1.5 rounded-md border border-amber-200 bg-amber-50 px-3 py-1.5 text-xs font-medium text-amber-950"
            data-testid="company-pending-link"
          >
            <Bell className="h-3.5 w-3.5" aria-hidden />
            待确认{pending.length > 0 ? ` · ${pending.length}` : ''}
          </Link>
          <Link
            to={`/agent/cases/${caseId}/docket`}
            className="btn-press focus-ring inline-flex items-center gap-1.5 rounded-md border border-slate-200 bg-white px-3 py-1.5 text-xs font-medium text-slate-700"
            data-testid="company-link-docket"
          >
            近期限
          </Link>
        </div>
        <p
          className="mt-3 flex flex-wrap gap-x-3 gap-y-1 text-[11px] text-slate-400"
          data-testid="company-logistics-links"
        >
          <span>后勤</span>
          <Link
            to={`/agent/cases/${caseId}/billing`}
            className="underline-offset-2 hover:text-slate-600 hover:underline"
            data-testid="company-link-billing"
          >
            账单
          </Link>
          <Link
            to={`/agent/cases/${caseId}/members`}
            className="underline-offset-2 hover:text-slate-600 hover:underline"
            data-testid="company-link-members"
          >
            成员
          </Link>
        </p>
      </section>

      <section aria-labelledby="seven-dept-map-title">
        <div className="mb-2 flex items-baseline gap-2">
          <h3
            id="seven-dept-map-title"
            className="text-[13px] font-semibold text-slate-900"
          >
            上手七部
          </h3>
          <span className="text-[11px] text-slate-500">
            交底 → 查新 → 立项 → 撰写 → 附图 → 递交 → 答复
          </span>
        </div>
        <ol
          className="grid gap-2 sm:grid-cols-2"
          data-testid="seven-dept-map"
        >
          {MAIN_CHAIN_DEPTS.map((dept, i) => {
            const st = deptStatus({
              dept,
              progress: prog,
              pending,
              confirmKind: confirmKindOf(dept),
            })
            const active = dept.id === currentDept.id
            const href = `/agent/cases/${caseId}/depts/${deptSlug(dept.id)}`
            const roll = rollups[dept.id]
            const expanded = expandedDeptId === dept.id
            const peers = dept.peers.slice(0, 3)
            return (
              <li key={dept.id}>
                <div
                  className={`rounded-lg border transition ${
                    active
                      ? 'border-slate-900 bg-slate-900 text-white'
                      : 'border-slate-200 bg-white text-slate-800'
                  } ${expanded && !active ? 'border-slate-300' : ''}`}
                  data-testid={`dept-map-card-${dept.id}`}
                  data-active={active ? '1' : '0'}
                  data-expanded={expanded ? '1' : '0'}
                >
                  <button
                    type="button"
                    className={`focus-ring flex w-full items-start gap-2 rounded-lg px-3 py-2.5 text-left ${
                      !active ? 'hover:bg-slate-50' : 'hover:bg-white/5'
                    }`}
                    onClick={() => toggleDept(dept.id)}
                    aria-expanded={expanded}
                    data-testid={`dept-map-toggle-${dept.id}`}
                  >
                    <span
                      className={`mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full text-[10px] font-bold ${
                        active
                          ? 'bg-white/20 text-white'
                          : 'bg-slate-100 text-slate-600'
                      }`}
                    >
                      {i + 1}
                    </span>
                    <span className="min-w-0 flex-1">
                      <span className="flex items-center gap-1.5 text-[13px] font-semibold">
                        {deptLabel(dept)}
                        <DeptStatusDot status={st} withLabel={!active} />
                      </span>
                      <span
                        className={`mt-0.5 block text-[11px] ${
                          active ? 'text-white/70' : 'text-slate-500'
                        }`}
                      >
                        {dept.blurb}
                        {roll?.pendingCount
                          ? ` · 待确认 ${roll.pendingCount}`
                          : ''}
                      </span>
                    </span>
                    {expanded ? (
                      <ChevronDown
                        className={`mt-1 h-4 w-4 shrink-0 ${
                          active ? 'text-white/70' : 'text-slate-400'
                        }`}
                        aria-hidden
                      />
                    ) : (
                      <ChevronRight
                        className={`mt-1 h-4 w-4 shrink-0 ${
                          active ? 'text-white/70' : 'text-slate-300'
                        }`}
                        aria-hidden
                      />
                    )}
                  </button>
                  {expanded ? (
                    <div
                      className={`border-t px-3 py-2.5 ${
                        active
                          ? 'border-white/15'
                          : 'border-slate-100 bg-slate-50/80'
                      }`}
                      data-testid={`dept-map-peers-${dept.id}`}
                    >
                      <p
                        className={`mb-1.5 text-[10px] font-semibold uppercase tracking-wide ${
                          active ? 'text-white/60' : 'text-slate-400'
                        }`}
                      >
                        专家岗（≤3）
                      </p>
                      {peers.length === 0 ? (
                        <p
                          className={`text-[11px] ${
                            active ? 'text-white/70' : 'text-slate-500'
                          }`}
                        >
                          本部门暂未配置专家岗
                        </p>
                      ) : (
                        <ul className="mb-2 space-y-1">
                          {peers.map((peer) => (
                            <li
                              key={peer.id}
                              className={`rounded-md px-2 py-1 text-[12px] ${
                                active
                                  ? 'bg-white/10 text-white'
                                  : 'bg-white text-slate-700 ring-1 ring-slate-200'
                              }`}
                              data-testid={`dept-map-peer-${peer.id}`}
                            >
                              {peerDisplayLabel(dept.id, peer.id, peer.label)}
                            </li>
                          ))}
                        </ul>
                      )}
                      <Link
                        to={href}
                        className={`btn-press focus-ring inline-flex items-center gap-1 rounded-md px-2.5 py-1 text-[11px] font-semibold ${
                          active
                            ? 'bg-white text-slate-900'
                            : 'bg-slate-900 text-white'
                        }`}
                        data-testid={`dept-map-enter-${dept.id}`}
                        onClick={(e) => e.stopPropagation()}
                      >
                        进本部门
                        <ArrowRight className="h-3 w-3" aria-hidden />
                      </Link>
                    </div>
                  ) : null}
                </div>
              </li>
            )
          })}
        </ol>
      </section>

      <section>
        <button
          type="button"
          className="focus-ring flex w-full items-center gap-1.5 rounded-md px-1 py-1 text-left text-[12px] font-medium text-slate-600 hover:text-slate-900"
          onClick={() => setMoreOpen((o) => !o)}
          data-testid="company-more-depts-toggle"
          aria-expanded={moreOpen}
        >
          {moreOpen ? (
            <ChevronDown className="h-3.5 w-3.5" aria-hidden />
          ) : (
            <ChevronRight className="h-3.5 w-3.5" aria-hidden />
          )}
          更多部门
          <span className="font-normal text-slate-400">
            （布局 / 前研 / 授权后，默认折叠）
          </span>
        </button>
        {moreOpen && (
          <ul
            className="mt-2 grid gap-1.5 sm:grid-cols-2"
            data-testid="company-more-depts"
          >
            {moreDepts.map((dept) => (
              <li key={dept.id}>
                <Link
                  to={`/agent/cases/${caseId}/depts/${deptSlug(dept.id)}`}
                  className="focus-ring flex items-center justify-between rounded-md border border-dashed border-slate-200 bg-slate-50/80 px-3 py-2 text-[12px] text-slate-700 hover:border-slate-300"
                >
                  <span className="font-medium">{deptLabel(dept)}</span>
                  <span className="text-[11px] text-slate-400">{dept.blurb}</span>
                </Link>
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  )
}
