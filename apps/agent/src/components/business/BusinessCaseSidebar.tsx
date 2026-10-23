import { Link, useLocation, useNavigate, useSearchParams } from 'react-router-dom'
import { useEffect, useMemo, useState } from 'react'
import {
  Plus,
  Search,
  ChevronDown,
  FolderKanban,
  MessagesSquare,
  Users,
} from 'lucide-react'
import {
  CONFIRM_META,
  BUSINESS_STAGES,
  businessSeatLabel,
  confirmKindForSeat,
  currentSeatForProgress,
  expertsInNode,
} from '../../business/businessSeats'
import {
  DRILL_CLUSTERS,
  DRILL_ORCH_ID,
  drillSeatLabel,
} from '../../business/drillRoster'
import { useBusinessCases } from '../../business/BusinessCaseContext'
import { useEntryRole } from '../../business/useEntryRole'
import { CaseTeamPanel } from './CaseTeamPanel'
import type { ProjectExpertId } from '../../projects/types'
import {
  MAIN_CHAIN_DEPTS,
  PRE_DEPTS,
  POST_DEPTS_LIST,
  deptSlug,
  orgDeptByLeadSeat,
  type OrgDept,
} from '../../departments/orgDepts'
import {
  confirmKindOf,
  deptStatus,
} from '../../departments/deptProgress'
import { useOrgConfig } from '../../departments/OrgConfigContext'

/**
 * 业务壳左栏 · 双角色两套结构（同视觉 token，布局/导航不同）
 * - agency（案盘）：案列表 + 待确认/期限占位为主；本案部门次要
 * - enterprise（公司陪跑）：本案七部为主；全部案子降为次入口
 * 公司首页 / 部门齐套内容不在此深改（挂 data-entry-role 供 QA）
 */
export function BusinessCaseSidebar() {
  const { entryRole } = useEntryRole()
  const { cases, getCase, getProgress, getPendingConfirms, stageLabel, primaryCta, enableMoreDepartments } =
    useBusinessCases()
  const { deptLabel } = useOrgConfig()
  const loc = useLocation()
  const navigate = useNavigate()
  const [params] = useSearchParams()
  const [allOpen, setAllOpen] = useState(true)
  const [deptsOpen, setDeptsOpen] = useState(true)
  const [moreOpen, setMoreOpen] = useState(false)
  const [teamOpen, setTeamOpen] = useState(false)
  const [q, setQ] = useState('')
  const [expandedNodes, setExpandedNodes] = useState<Set<string>>(new Set())

  const isAgency = entryRole === 'agency'
  const isEnterprise = entryRole === 'enterprise'
  const drillMode = params.get('drill') === '1'

  const activeCaseId = useMemo(() => {
    const m = loc.pathname.match(/^\/agent\/cases\/([^/]+)/)
    return m?.[1] && m[1] !== 'new' ? m[1] : undefined
  }, [loc.pathname])

  const activeDeptSlug = useMemo(() => {
    const m = loc.pathname.match(/^\/agent\/cases\/[^/]+\/depts\/([^/]+)/)
    return m?.[1]
  }, [loc.pathname])

  // 角色 × 是否案内：默认展开哪一块
  useEffect(() => {
    if (isEnterprise) {
      setAllOpen(!activeCaseId)
      setDeptsOpen(Boolean(activeCaseId))
    } else {
      setAllOpen(true)
      setDeptsOpen(Boolean(activeCaseId))
    }
  }, [activeCaseId, isEnterprise])

  const activeCase = activeCaseId ? getCase(activeCaseId) : undefined
  const prog = activeCaseId ? getProgress(activeCaseId) : undefined
  const pending = activeCaseId ? getPendingConfirms(activeCaseId) : []

  const defaultSeat = useMemo(() => {
    if (!prog) return null
    return currentSeatForProgress({
      stageId: prog.stageId,
      doneSeatIds: prog.doneSeatIds,
      moreSeatIds: prog.moreSeatIds,
    })
  }, [prog])

  const seatFromUrl = params.get('seat') as ProjectExpertId | null
  const activeSeat: ProjectExpertId | null = (() => {
    if (drillMode) {
      if (seatFromUrl === DRILL_ORCH_ID) return DRILL_ORCH_ID
      if (seatFromUrl) return seatFromUrl
      return DRILL_ORCH_ID
    }
    if (seatFromUrl) return seatFromUrl
    return defaultSeat
  })()

  useEffect(() => {
    const focus =
      activeSeat === 'expert-draft-spec' || defaultSeat === 'expert-draft'
        ? 'expert-draft'
        : activeSeat
    if (!focus || expertsInNode(focus).length < 2) return
    setExpandedNodes((prev) => {
      if (prev.has(focus)) return prev
      const next = new Set(prev)
      next.add(focus)
      return next
    })
  }, [activeSeat, defaultSeat, activeCaseId])

  const moreDepts: OrgDept[] = useMemo(() => {
    const mainIds = new Set(MAIN_CHAIN_DEPTS.map((d) => d.id))
    return [...PRE_DEPTS, ...POST_DEPTS_LIST].filter((d) => !mainIds.has(d.id))
  }, [])

  const moreEnabled = (prog?.moreSeatIds?.length ?? 0) > 0

  const seatHref = (sid: ProjectExpertId) => {
    if (drillMode) {
      const q = new URLSearchParams()
      q.set('seat', sid)
      q.set('drill', '1')
      return `/agent/cases/${activeCaseId}?${q.toString()}`
    }
    const dept = orgDeptByLeadSeat(sid)
    if (dept) {
      const q = new URLSearchParams()
      q.set('seat', sid)
      return `/agent/cases/${activeCaseId}/depts/${deptSlug(dept.id)}?${q.toString()}`
    }
    const q = new URLSearchParams()
    q.set('seat', sid)
    return `/agent/cases/${activeCaseId}?${q.toString()}`
  }

  const deptHref = (dept: OrgDept) =>
    `/agent/cases/${activeCaseId}/depts/${deptSlug(dept.id)}`

  const seatPending = (sid: ProjectExpertId) => {
    const kind = confirmKindForSeat(sid)
    const metaPrep = kind ? CONFIRM_META[kind].preparedBy : null
    return pending.some(
      (p) =>
        (kind && p.kind === kind) ||
        (metaPrep && p.preparedBy === metaPrep),
    )
  }

  const renderSeatLink = (sid: ProjectExpertId, label: string) => {
    const deptOfSeat = orgDeptByLeadSeat(sid)
    const selected =
      activeSeat === sid ||
      Boolean(
        activeDeptSlug &&
          deptOfSeat &&
          deptSlug(deptOfSeat.id) === activeDeptSlug &&
          deptOfSeat.leadSeatId === sid,
      )
    const done = prog?.doneSeatIds.includes(sid) ?? false
    const isPending = seatPending(sid)
    return (
      <li key={sid}>
        <Link
          to={seatHref(sid)}
          className={`focus-ring mb-0.5 flex w-full items-center gap-1.5 rounded-md px-2 py-1.5 text-left text-[12px] ${
            selected
              ? sid === DRILL_ORCH_ID && drillMode
                ? 'bg-indigo-800 font-semibold text-white'
                : 'bg-slate-900 font-semibold text-white'
              : 'text-slate-700 hover:bg-white'
          }`}
          data-testid={`business-seat-tab-${sid}`}
          data-selected={selected ? '1' : '0'}
          aria-current={selected ? 'page' : undefined}
        >
          <span
            className={`h-1.5 w-1.5 shrink-0 rounded-full ${
              done
                ? 'bg-emerald-400'
                : isPending
                  ? 'bg-amber-400'
                  : selected
                    ? 'bg-white/70'
                    : 'bg-slate-300'
            }`}
          />
          <span className="truncate">{label}</span>
        </Link>
      </li>
    )
  }

  const toggleNode = (seatId: string) => {
    setExpandedNodes((prev) => {
      const next = new Set(prev)
      if (next.has(seatId)) next.delete(seatId)
      else next.add(seatId)
      return next
    })
  }

  const renderNode = (sid: ProjectExpertId, labelForSingle?: string) => {
    const experts = expertsInNode(sid)
    if (experts.length < 2) {
      return (
        <ul key={sid} className="space-y-0.5">
          {renderSeatLink(sid, labelForSingle ?? businessSeatLabel(sid))}
        </ul>
      )
    }
    const open = expandedNodes.has(sid)
    const leadDone = prog?.doneSeatIds.includes(sid) ?? false
    const leadPend = seatPending(sid)
    return (
      <div key={sid} data-testid={`business-node-${sid}`}>
        <button
          type="button"
          onClick={() => toggleNode(sid)}
          className="focus-ring flex w-full items-center gap-1 rounded-md px-2 py-1 text-left text-[12px] font-medium text-slate-700 hover:bg-white/80"
          aria-expanded={open}
          data-testid={`business-node-toggle-${sid}`}
        >
          <ChevronDown
            className={`h-3 w-3 shrink-0 text-slate-400 transition ${open ? 'rotate-0' : '-rotate-90'}`}
            aria-hidden
          />
          <span
            className={`h-1.5 w-1.5 shrink-0 rounded-full ${
              leadDone
                ? 'bg-emerald-400'
                : leadPend
                  ? 'bg-amber-400'
                  : 'bg-slate-300'
            }`}
          />
          <span className="truncate">{businessSeatLabel(sid)}</span>
        </button>
        {open && (
          <ul className="ml-3 space-y-0.5 border-l border-slate-200/80 pl-1.5">
            {experts.map((expert) => renderSeatLink(expert.id, expert.label))}
          </ul>
        )}
      </div>
    )
  }

  const renderDeptLink = (dept: OrgDept) => {
    if (!prog || !activeCaseId) return null
    const selected = activeDeptSlug === deptSlug(dept.id)
    const status = deptStatus({
      dept,
      progress: prog,
      pending,
      confirmKind: confirmKindOf(dept),
    })
    const dot =
      status === '已完成'
        ? 'bg-emerald-400'
        : status === '待确认' || status === '退回'
          ? 'bg-amber-400'
          : status === '进行中'
            ? 'bg-sky-400'
            : selected
              ? 'bg-white/70'
              : 'bg-slate-300'
    return (
      <li key={dept.id}>
        <Link
          to={deptHref(dept)}
          className={`focus-ring mb-0.5 flex w-full items-center gap-1.5 rounded-md px-2 py-1.5 text-left text-[12px] ${
            selected
              ? 'bg-slate-900 font-semibold text-white'
              : 'text-slate-700 hover:bg-white'
          }`}
          data-testid={`business-dept-tab-${deptSlug(dept.id)}`}
          data-selected={selected ? '1' : '0'}
          aria-current={selected ? 'page' : undefined}
        >
          <span className={`h-1.5 w-1.5 shrink-0 rounded-full ${dot}`} />
          <span className="truncate">{deptLabel(dept)}</span>
        </Link>
      </li>
    )
  }

  const stageMeta = prog
    ? BUSINESS_STAGES.find((s) => s.id === prog.stageId)
    : undefined

  const filtered = useMemo(() => {
    const needle = q.trim().toLowerCase()
    if (!needle) return cases
    return cases.filter((c) => {
      const p = getProgress(c.id)
      const blob = `${c.title} ${c.summary ?? ''} ${stageLabel(p.stageId)}`.toLowerCase()
      return blob.includes(needle)
    })
  }, [cases, q, getProgress, stageLabel])

  const teamCount = prog?.teamMemberIds?.length ?? 0

  const caseListSection = (
    <>
      <button
        type="button"
        onClick={() => setAllOpen((v) => !v)}
        className="focus-ring mb-1 flex w-full items-center justify-between rounded-md px-2 py-1.5 text-[11px] font-semibold uppercase tracking-wide text-slate-500 hover:bg-white/70 hover:text-slate-700"
        aria-expanded={allOpen}
        data-testid="business-side-all-toggle"
      >
        <span>{isAgency ? '案盘' : '全部案子'}</span>
        <ChevronDown
          className={`h-3.5 w-3.5 transition ${allOpen ? 'rotate-0' : '-rotate-90'}`}
          aria-hidden
        />
      </button>

      {allOpen && (
        <>
          <label className="relative mb-2 block px-0.5">
            <Search
              className="pointer-events-none absolute left-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-slate-400"
              aria-hidden
            />
            <input
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder="搜索案子"
              className="focus-ring w-full rounded-md border border-slate-200 bg-white py-1.5 pl-8 pr-2 text-[12px] text-slate-800 placeholder:text-slate-400"
              data-testid="business-side-search"
              aria-label="搜索案子"
            />
          </label>

          <ul className="space-y-0.5" data-testid="business-side-case-list">
            {filtered.length === 0 && (
              <li
                className="px-2 py-4 text-center text-[11px] text-slate-400"
                data-testid="business-side-empty"
              >
                {cases.length === 0 ? '还没有案子' : '无匹配案子'}
              </li>
            )}
            {filtered.map((c) => {
              const p = getProgress(c.id)
              const pend = getPendingConfirms(c.id)
              const cta = primaryCta(c.id)
              const selected = activeCaseId === c.id
              const seat = currentSeatForProgress({
                stageId: p.stageId,
                doneSeatIds: p.doneSeatIds,
                moreSeatIds: p.moreSeatIds,
              })
              const dept = orgDeptByLeadSeat(seat) ?? MAIN_CHAIN_DEPTS[0]!
              return (
                <li key={c.id}>
                  <Link
                    to={`/agent/cases/${c.id}`}
                    className={`focus-ring hit-40 flex w-full flex-col gap-0.5 rounded-[var(--radius-sm)] px-2.5 py-2 text-left transition ${
                      selected
                        ? 'bg-white font-semibold text-slate-900 shadow-sm ring-1 ring-slate-200/80'
                        : 'font-medium text-slate-600 hover:bg-white/80 hover:text-slate-800'
                    }`}
                    data-testid={`business-side-case-${c.id}`}
                    aria-current={selected ? 'page' : undefined}
                  >
                    <span className="flex items-center gap-1.5 truncate text-[13px] leading-snug">
                      <FolderKanban
                        className="h-3.5 w-3.5 shrink-0 opacity-50"
                        aria-hidden
                      />
                      <span className="truncate">{c.title}</span>
                      {/* 期限占位 · 后续接 docket */}
                      <span
                        className="ml-auto h-1.5 w-1.5 shrink-0 rounded-full bg-slate-200"
                        title="期限占位"
                        data-testid={`business-side-docket-${c.id}`}
                        aria-hidden
                      />
                    </span>
                    <span className="truncate pl-5 text-[10px] font-normal text-slate-400">
                      {isAgency ? deptLabel(dept) : stageLabel(p.stageId)}
                      {pend.length > 0
                        ? ` · ${pend.length} 待确认`
                        : cta.action === 'confirm'
                          ? ` · ${cta.label}`
                          : ''}
                    </span>
                  </Link>
                </li>
              )
            })}
          </ul>
        </>
      )}
    </>
  )

  const deptNavSection =
    activeCase && prog ? (
      <div
        className={isEnterprise ? '' : 'mt-3 border-t border-slate-200/80 pt-2'}
        data-testid="business-side-case-depts"
        data-nav-priority={isEnterprise ? 'primary' : 'secondary'}
      >
        <div className="mb-1 px-2 text-[10px] text-slate-400">
          当前阶段 · {stageMeta?.title ?? stageLabel(prog.stageId)}
          {prog.filed && prog.stageId === 'oa' && (prog.oaRound ?? 0) > 0
            ? ` · 第 ${prog.oaRound} 通`
            : ''}
        </div>
        <button
          type="button"
          onClick={() => setDeptsOpen((v) => !v)}
          className="focus-ring mb-1 flex w-full items-center justify-between rounded-md px-2 py-1.5 text-[11px] font-semibold uppercase tracking-wide text-slate-500 hover:bg-white/70 hover:text-slate-700"
          aria-expanded={deptsOpen}
          data-testid="business-side-depts-toggle"
        >
          <span>
            {drillMode ? '演练全队' : isEnterprise ? '本案七部' : '本案部门'}
          </span>
          <ChevronDown
            className={`h-3.5 w-3.5 transition ${deptsOpen ? 'rotate-0' : '-rotate-90'}`}
            aria-hidden
          />
        </button>
        {deptsOpen &&
          (drillMode ? (
            <div className="space-y-2" data-testid="business-drill-seats">
              <ul className="space-y-0.5">
                {renderSeatLink(DRILL_ORCH_ID, '总控')}
              </ul>
              {DRILL_CLUSTERS.map((section) => (
                <div key={section.id} data-testid={`drill-node-section-${section.id}`}>
                  <div className="mb-0.5 px-2 text-[9px] font-semibold uppercase tracking-wide text-slate-400">
                    {section.title}
                  </div>
                  <div className="space-y-0.5">
                    {section.seatIds.map((sid) =>
                      expertsInNode(sid).length >= 2 ? (
                        renderNode(sid)
                      ) : (
                        <ul key={sid} className="space-y-0.5">
                          {renderSeatLink(sid, drillSeatLabel(sid))}
                        </ul>
                      ),
                    )}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="space-y-0.5" data-testid="business-dept-list">
              <ul className="space-y-0.5">
                {MAIN_CHAIN_DEPTS.map((dept) => renderDeptLink(dept))}
              </ul>
              <div
                className="mt-1 border-t border-slate-200/60 pt-1"
                data-testid="business-more-depts"
              >
                <button
                  type="button"
                  onClick={() => setMoreOpen((v) => !v)}
                  className="focus-ring mb-0.5 flex w-full items-center justify-between rounded-md px-2 py-1 text-left text-[9px] font-semibold uppercase tracking-wide text-slate-400 hover:bg-white/70"
                  aria-expanded={moreOpen}
                  data-testid="business-more-depts-toggle"
                >
                  <span>更多部门</span>
                  <ChevronDown
                    className={`h-3 w-3 transition ${moreOpen ? 'rotate-0' : '-rotate-90'}`}
                    aria-hidden
                  />
                </button>
                {moreOpen &&
                  (moreEnabled ? (
                    <ul className="space-y-0.5">
                      {moreDepts.map((dept) => renderDeptLink(dept))}
                    </ul>
                  ) : (
                    <button
                      type="button"
                      className="w-full rounded-md px-2 py-1.5 text-left text-[10px] text-slate-500 hover:bg-white"
                      data-testid="business-enable-more-depts"
                      onClick={() =>
                        activeCaseId && enableMoreDepartments(activeCaseId)
                      }
                    >
                      启用前研 / 布局…
                    </button>
                  ))}
              </div>
            </div>
          ))}

        {!drillMode && activeCaseId && (
          <>
            <button
              type="button"
              onClick={() => setTeamOpen((v) => !v)}
              className="focus-ring mt-2 flex w-full items-center justify-between rounded-md px-2 py-1.5 text-[11px] font-semibold uppercase tracking-wide text-slate-500 hover:bg-white/70 hover:text-slate-700"
              aria-expanded={teamOpen}
              data-testid="business-side-team-toggle"
            >
              <span className="flex items-center gap-1">
                <Users className="h-3 w-3" aria-hidden />
                本案团队
                {teamCount > 0 ? ` · ${teamCount}` : ''}
              </span>
              <ChevronDown
                className={`h-3.5 w-3.5 transition ${teamOpen ? 'rotate-0' : '-rotate-90'}`}
                aria-hidden
              />
            </button>
            {teamOpen && <CaseTeamPanel caseId={activeCaseId} compact />}
          </>
        )}

        {!drillMode && (
          <div className="mt-2 space-y-1.5">
            {prog?.casePlan?.trim() ? (
              <div
                className="rounded-md border border-slate-200 bg-white px-2 py-1.5"
                data-testid="business-sidebar-case-plan"
              >
                <div className="text-[9px] font-semibold uppercase tracking-wide text-slate-400">
                  本案计划
                </div>
                <p className="mt-0.5 line-clamp-3 whitespace-pre-wrap text-[10px] leading-snug text-slate-600">
                  {prog.casePlan}
                </p>
              </div>
            ) : null}
            <a
              href={`#case-assistant`}
              className="flex items-center justify-center gap-1 rounded-md border border-teal-200 bg-teal-50 px-2 py-1.5 text-[10px] font-medium text-teal-900 hover:bg-teal-100"
              data-testid="business-case-assistant-jump"
              title="跳到右栏案子助手巡检"
              onClick={(e) => {
                e.preventDefault()
                document
                  .querySelector('[data-testid="case-assistant-panel"]')
                  ?.scrollIntoView({ behavior: 'smooth', block: 'nearest' })
              }}
            >
              案子助手 · 巡检
            </a>
          </div>
        )}

        {drillMode && activeCaseId && (
          <button
            type="button"
            className="mt-2 w-full rounded-md border border-slate-200 bg-white px-2 py-1.5 text-[10px] font-medium text-slate-700 hover:bg-slate-50"
            data-testid="business-drill-exit-side"
            onClick={() =>
              navigate(`/agent/cases/${activeCaseId}`, { replace: true })
            }
          >
            退出演练 · 回简模式
          </button>
        )}

        <Link
          to={`/agent/cases/${activeCaseId}/room`}
          className="mt-2 flex items-center justify-center gap-1 rounded-md border border-violet-200 bg-violet-50 px-2 py-1.5 text-[10px] font-medium text-violet-900 hover:bg-violet-100"
          data-testid="business-case-group-chat"
          title="本案讨论组群聊"
        >
          <MessagesSquare className="h-3 w-3 shrink-0" aria-hidden />
          组队讨论
          {teamCount > 0 ? ` · ${teamCount}` : ''}
        </Link>

        {pending.length > 0 && (
          <Link
            to={`/agent/pending?caseId=${encodeURIComponent(activeCaseId!)}`}
            className="mt-2 flex items-center justify-center gap-1 rounded-md border border-amber-200 bg-amber-50 px-2 py-1.5 text-[10px] font-medium text-amber-950 hover:bg-amber-100"
            data-testid="business-case-pending-link"
          >
            待我确认 · {pending.length}（顶栏铃铛同口径）
          </Link>
        )}
      </div>
    ) : null

  /** 企业案内：全部案子降为次入口链接，不抢七部主栏 */
  const enterpriseAllCasesLink =
    isEnterprise && activeCaseId ? (
      <div className="mt-3 border-t border-slate-200/80 pt-2" data-testid="business-side-all-cases-secondary">
        <Link
          to="/agent/cases"
          className="focus-ring flex w-full items-center justify-between rounded-md px-2 py-1.5 text-[11px] font-semibold uppercase tracking-wide text-slate-500 hover:bg-white/70 hover:text-slate-700"
          data-testid="business-side-all-cases-link"
        >
          <span>全部案子</span>
          <span className="text-[10px] font-normal normal-case tracking-normal text-slate-400">
            次入口
          </span>
        </Link>
      </div>
    ) : null

  return (
    <aside
      className="business-case-sidebar flex w-[min(15rem,42vw)] min-w-[11.5rem] max-w-[16rem] shrink-0 flex-col border-r border-slate-200/90 bg-[#f5f5f7]"
      data-testid="business-case-sidebar"
      data-entry-role={entryRole}
      data-biz-case-ia="two-col"
    >
      <div className="shrink-0 px-2.5 pt-3 pb-1.5">
        <button
          type="button"
          onClick={() => navigate('/agent/cases/new')}
          className="btn-press focus-ring hit-40 flex w-full items-center justify-center gap-1.5 rounded-[var(--radius-md)] bg-slate-900 px-2.5 text-[13px] font-semibold text-white shadow-sm hover:bg-slate-800"
          data-testid="business-side-new-case"
          aria-label="开一个新案子"
        >
          <Plus className="h-4 w-4 shrink-0" strokeWidth={2.25} aria-hidden />
          开一个新案子
        </button>
      </div>

      <div className="min-h-0 flex-1 overflow-y-auto px-2 py-1">
        {isEnterprise && activeCaseId ? (
          <>
            {deptNavSection}
            {enterpriseAllCasesLink}
          </>
        ) : (
          <>
            {caseListSection}
            {deptNavSection}
          </>
        )}
      </div>
    </aside>
  )
}
