import { Link, useLocation, useNavigate, useSearchParams } from 'react-router-dom'
import { useEffect, useMemo, useState } from 'react'
import {
  Plus,
  Search,
  ChevronDown,
  FolderKanban,
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
 * - enterprise（公司陪跑）：案内身份「正在 · 部」+ 已办回看；换站回大厅（§128）
 * 公司首页 / 部门齐套内容不在此深改（挂 data-entry-role 供 QA）
 */
export function BusinessCaseSidebar() {
  const { entryRole } = useEntryRole()
  const { cases, getCase, getProgress, getPendingConfirms, stageLabel, primaryCta } =
    useBusinessCases()
  const { deptLabel } = useOrgConfig()
  const loc = useLocation()
  const navigate = useNavigate()
  const [params] = useSearchParams()
  const [allOpen, setAllOpen] = useState(true)
  const [deptsOpen, setDeptsOpen] = useState(false) // §128：部台不再展开八部 peer；仅 drill 用
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

  // 角色 × 是否案内：案列表展开；§128 八部 peer 永不作部台主航
  useEffect(() => {
    if (isEnterprise) {
      setAllOpen(!activeCaseId)
      setDeptsOpen(drillMode) // 仅演练可列席位
    } else {
      setAllOpen(true)
      setDeptsOpen(drillMode)
    }
  }, [activeCaseId, activeDeptSlug, isEnterprise, drillMode])

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

  /** §118：无 URL 部 slug（本案概况）时，用进度席位推当前部，供 current-only 芯片 */
  const currentDept = (() => {
    if (!activeCase) return undefined
    if (activeDeptSlug) {
      return (
        MAIN_CHAIN_DEPTS.find((d) => deptSlug(d.id) === activeDeptSlug) ||
        moreDepts.find((d) => deptSlug(d.id) === activeDeptSlug)
      )
    }
    if (!defaultSeat) return MAIN_CHAIN_DEPTS[0]
    return orgDeptByLeadSeat(defaultSeat) ?? MAIN_CHAIN_DEPTS[0]
  })()

  /** §128：已办前序（可空）· 只读回看，不作切部主航 */
  const lookbackDepts = useMemo(() => {
    if (!prog || !activeCaseId) return [] as OrgDept[]
    const curIdx = activeDeptSlug
      ? MAIN_CHAIN_DEPTS.findIndex((d) => deptSlug(d.id) === activeDeptSlug)
      : currentDept
        ? MAIN_CHAIN_DEPTS.findIndex((d) => d.id === currentDept.id)
        : -1
    return MAIN_CHAIN_DEPTS.filter((dept, i) => {
      if (curIdx >= 0 && i >= curIdx) return false
      if (activeDeptSlug && deptSlug(dept.id) === activeDeptSlug) return false
      const status = deptStatus({
        dept,
        progress: prog,
        pending,
        confirmKind: confirmKindOf(dept),
      })
      return status === '已完成'
    })
  }, [prog, activeCaseId, activeDeptSlug, currentDept, pending])

  /** §128：知情跳部 → 「未经过」；①②③ 任意开工不标假未经过 */
  const skippedPriorLabels = useMemo(() => {
    if (!prog || !activeDeptSlug) return [] as string[]
    const curIdx = MAIN_CHAIN_DEPTS.findIndex((d) => deptSlug(d.id) === activeDeptSlug)
    const disclosureIdx = MAIN_CHAIN_DEPTS.findIndex((d) => d.id === 'dept-disclosure')
    if (curIdx <= 0) return []
    // 只检查交底起的主链前序（厚站）；前面立项/激发/挖掘空着＝任意开工
    const fromIdx = Math.max(disclosureIdx, 0)
    if (curIdx <= fromIdx) return []
    return MAIN_CHAIN_DEPTS.filter((dept, i) => {
      if (i < fromIdx || i >= curIdx) return false
      const status = deptStatus({
        dept,
        progress: prog,
        pending,
        confirmKind: confirmKindOf(dept),
      })
      return status !== '已完成' && status !== '锁定'
    }).map((d) => deptLabel(d))
  }, [prog, activeDeptSlug, pending, deptLabel])

  const hallHref = '/agent'

  const deptNavSection =
    activeCase && prog ? (
      <div
        className={isEnterprise ? '' : 'mt-3 border-t border-slate-200/80 pt-2'}
        data-testid="business-side-case-depts"
        data-nav-priority={isEnterprise ? 'primary' : 'secondary'}
        data-eight-collapsed="1"
        data-nav-role="current-station"
        data-eight-mode="current-only"
      >
        {drillMode ? (
          <>
            <button
              type="button"
              onClick={() => setDeptsOpen((v) => !v)}
              className="focus-ring mb-1 flex w-full items-center justify-between rounded-md px-2 py-1.5 text-[11px] font-semibold uppercase tracking-wide text-slate-500 hover:bg-white/70 hover:text-slate-700"
              aria-expanded={deptsOpen}
              data-testid="business-side-depts-toggle"
            >
              <span>席位演练</span>
              <ChevronDown
                className={`h-3.5 w-3.5 transition ${deptsOpen ? 'rotate-0' : '-rotate-90'}`}
                aria-hidden
              />
            </button>
            {deptsOpen ? (
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
            ) : null}
          </>
        ) : (
          <>
            {currentDept ? (
              <div
                className="mb-1 flex w-full flex-col items-stretch gap-0.5 rounded-md border border-slate-200/80 bg-white px-2 py-1.5 text-left"
                data-testid="business-side-depts-toggle"
                data-collapsed-current="1"
                data-nav-role="current-station"
                title="当前这一站 · 换站请回大厅"
              >
                <span className="text-[9px] font-semibold uppercase tracking-wide text-slate-400">
                  正在
                </span>
                <span className="truncate text-[12px] font-semibold text-slate-900">
                  {deptLabel(currentDept)}
                </span>
                <span className="text-[9px] text-slate-400">本站办事 · 非切部</span>
              </div>
            ) : (
              <div className="mb-1 px-2 text-[10px] text-slate-400">
                当前阶段 · {stageMeta?.title ?? stageLabel(prog.stageId)}
              </div>
            )}

            {skippedPriorLabels.length > 0 ? (
              <p
                className="mb-1.5 rounded-md bg-amber-50/90 px-2 py-1.5 text-[10px] leading-snug text-amber-950"
                data-testid="business-side-skipped-prior"
                data-skipped-count={skippedPriorLabels.length}
              >
                本案从本站开干 · 未经过
                {skippedPriorLabels.slice(0, 2).join('、')}
                {skippedPriorLabels.length > 2 ? '…' : ''}
                <span className="sr-only" data-testid="business-side-skipped-hall" data-removed="v130">
                  换站用下方回大厅选站
                </span>
              </p>
            ) : null}

            <Link
              to={hallHref}
              className="focus-ring mb-1.5 flex w-full items-center justify-center rounded-md border border-slate-200/80 bg-white px-2 py-1.5 text-[10px] font-medium text-slate-600 hover:bg-slate-50"
              data-testid="business-side-hall-reselect"
            >
              回大厅选站
            </Link>

            {lookbackDepts.length > 0 ? (
              <details
                className="mb-1.5 rounded-md border border-slate-200/70 bg-white/70"
                data-testid="business-side-lookback"
                data-lookback-fold="1"
              >
                <summary className="cursor-pointer select-none px-2 py-1 text-[9px] font-semibold uppercase tracking-wide text-slate-400">
                  回看已办 · {lookbackDepts.length}
                </summary>
                <ul className="space-y-0.5 border-t border-slate-100 px-1 py-1">
                  {lookbackDepts.map((dept) => (
                    <li key={dept.id}>
                      <Link
                        to={`${deptHref(dept)}?lookback=1`}
                        className="focus-ring mb-0.5 flex w-full items-center gap-1 rounded-md px-1.5 py-1 text-left text-[11px] leading-snug text-slate-600 hover:bg-slate-50"
                        data-testid={`business-dept-lookback-${deptSlug(dept.id)}`}
                        data-lookback="1"
                        data-lookback-readonly="1"
                        title="回看已办 · 只读案卷"
                      >
                        <span className="h-1.5 w-1.5 shrink-0 rounded-full bg-emerald-400" />
                        <span className="truncate">{deptLabel(dept)}</span>
                      </Link>
                    </li>
                  ))}
                </ul>
              </details>
            ) : (
              <p
                className="mb-1.5 px-2 text-[10px] leading-snug text-slate-500"
                data-testid="business-side-lookback-empty"
              >
                暂无已办可回看
              </p>
            )}

            {/* 兼容：旧 smoke 曾点 business-dept-list；§128 不再列八部 peer */}
            <div className="hidden" data-testid="business-dept-list" data-removed="v128" hidden />
          </>
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
      </div>
    ) : null

  /** §118 G04：回列表走壳层「项目」；案内不再叠「全部案子」次链 */
  const enterpriseAllCasesLink = null

  return (
    <aside
      className={`business-case-sidebar flex shrink-0 flex-col border-r border-slate-200/90 bg-[#f5f5f7] ${
        activeDeptSlug && !deptsOpen
          ? 'w-[6.75rem] min-w-[6.75rem] max-w-[6.75rem]'
          : 'w-[min(9.75rem,28vw)] min-w-[7.25rem] max-w-[10.5rem]'
      }`}
      data-testid="business-case-sidebar"
      data-entry-role={entryRole}
      data-biz-case-ia="two-col"
      data-rail="thin-eight"
      data-eight-mode="current-only"
      data-nav-role="current-station"
      data-dept-rail={activeDeptSlug ? 'identity-slim' : 'default'}
    >
      <div className="shrink-0 px-2.5 pt-3 pb-1.5">
        {activeCaseId ? (
          <p
            className="px-0.5 text-[10px] leading-snug text-slate-400"
            data-testid="business-side-new-case-folded"
          >
            {/* §124 G08：部台弱训导；开新案回壳层「项目」 */}
            <span className="sr-only">开新案请回左栏项目</span>
            <button
              type="button"
              onClick={() => navigate('/agent/cases/new')}
              className="btn-press focus-ring text-slate-500 underline-offset-2 hover:underline"
              data-testid="business-side-new-case"
              aria-label="开一个新案子"
            >
              开新案
            </button>
          </p>
        ) : (
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
        )}
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
