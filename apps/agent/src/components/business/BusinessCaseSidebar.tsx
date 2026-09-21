import { Link, useLocation, useNavigate, useSearchParams } from 'react-router-dom'
import { useMemo, useState } from 'react'
import {
  Plus,
  Search,
  ChevronDown,
  LayoutGrid,
  FolderKanban,
  MessagesSquare,
} from 'lucide-react'
import {
  BUSINESS_STAGES,
  businessSeatLabel,
  currentSeatForProgress,
  seatsForCase,
} from '../../business/businessSeats'
import { useBusinessCases } from '../../business/BusinessCaseContext'
import type { ProjectExpertId } from '../../projects/types'

/**
 * 业务壳左栏（刀1 两栏）：案子列表 + 本案席（可折叠）+ 群聊入口。
 * 阶段极简并入；不占第三栏。
 */
export function BusinessCaseSidebar() {
  const { cases, getCase, getProgress, getPendingConfirms, stageLabel, primaryCta } =
    useBusinessCases()
  const loc = useLocation()
  const navigate = useNavigate()
  const [params] = useSearchParams()
  const [allOpen, setAllOpen] = useState(true)
  const [seatsOpen, setSeatsOpen] = useState(true)
  const [q, setQ] = useState('')

  const activeCaseId = useMemo(() => {
    const m = loc.pathname.match(/^\/agent\/cases\/([^/]+)/)
    return m?.[1] && m[1] !== 'new' ? m[1] : undefined
  }, [loc.pathname])

  const activeCase = activeCaseId ? getCase(activeCaseId) : undefined
  const prog = activeCaseId ? getProgress(activeCaseId) : undefined
  const pending = activeCaseId ? getPendingConfirms(activeCaseId) : []

  const seatIds = useMemo(() => {
    if (!activeCase || !prog) return [] as ProjectExpertId[]
    return seatsForCase({
      expertIds: activeCase.expertIds,
      moreSeatIds: prog.moreSeatIds,
    })
  }, [activeCase, prog])

  const defaultSeat = useMemo(() => {
    if (!prog) return null
    return currentSeatForProgress({
      stageId: prog.stageId,
      doneSeatIds: prog.doneSeatIds,
      moreSeatIds: prog.moreSeatIds,
    })
  }, [prog])

  const seatFromUrl = params.get('seat') as ProjectExpertId | null
  const activeSeat: ProjectExpertId | null =
    seatFromUrl && seatIds.includes(seatFromUrl)
      ? seatFromUrl
      : defaultSeat

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

  return (
    <aside
      className="business-case-sidebar flex w-[min(15rem,42vw)] min-w-[11.5rem] max-w-[16rem] shrink-0 flex-col border-r border-slate-200/90 bg-[#f5f5f7]"
      data-testid="business-case-sidebar"
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
        <button
          type="button"
          onClick={() => setAllOpen((v) => !v)}
          className="focus-ring mb-1 flex w-full items-center justify-between rounded-md px-2 py-1.5 text-[11px] font-semibold uppercase tracking-wide text-slate-500 hover:bg-white/70 hover:text-slate-700"
          aria-expanded={allOpen}
          data-testid="business-side-all-toggle"
        >
          <span>全部案子</span>
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
                      </span>
                      <span className="truncate pl-5 text-[10px] font-normal text-slate-400">
                        {stageLabel(p.stageId)}
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

        {/* 本案席 + 极简阶段（刀1 · 并入左栏） */}
        {activeCase && prog && (
          <div
            className="mt-3 border-t border-slate-200/80 pt-2"
            data-testid="business-side-case-seats"
          >
            <div className="mb-1 px-2 text-[10px] text-slate-400">
              当前阶段 · {stageMeta?.title ?? stageLabel(prog.stageId)}
              {prog.filed && prog.stageId === 'oa' && (prog.oaRound ?? 0) > 0
                ? ` · 第 ${prog.oaRound} 通`
                : ''}
            </div>
            <button
              type="button"
              onClick={() => setSeatsOpen((v) => !v)}
              className="focus-ring mb-1 flex w-full items-center justify-between rounded-md px-2 py-1.5 text-[11px] font-semibold uppercase tracking-wide text-slate-500 hover:bg-white/70 hover:text-slate-700"
              aria-expanded={seatsOpen}
              data-testid="business-side-seats-toggle"
            >
              <span>本案席位</span>
              <ChevronDown
                className={`h-3.5 w-3.5 transition ${seatsOpen ? 'rotate-0' : '-rotate-90'}`}
                aria-hidden
              />
            </button>
            {seatsOpen && (
              <ul className="space-y-0.5" data-testid="business-seven-seats">
                {seatIds.map((sid) => {
                  const selected = activeSeat === sid
                  const done = prog.doneSeatIds.includes(sid)
                  const seatPending = pending.some(
                    (p) =>
                      p.preparedBy === businessSeatLabel(sid) ||
                      (sid === 'expert-disclosure' &&
                        p.kind === 'disclosure_ready') ||
                      (sid === 'expert-research' && p.kind === 'research_ready') ||
                      (sid === 'expert-intake' && p.kind === 'go_nogo') ||
                      (sid === 'expert-draft' && p.kind === 'claims_ready') ||
                      (sid === 'expert-filing' && p.kind === 'file_authorize') ||
                      (sid === 'expert-oa' && p.kind === 'oa_strategy') ||
                      (sid === 'expert-layout' && p.kind === 'layout_adjust'),
                  )
                  return (
                    <li key={sid}>
                      <Link
                        to={`/agent/cases/${activeCaseId}?seat=${sid}`}
                        className={`focus-ring mb-0.5 flex w-full items-center gap-1.5 rounded-md px-2 py-1.5 text-left text-[12px] ${
                          selected
                            ? 'bg-slate-900 font-semibold text-white'
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
                              : seatPending
                                ? 'bg-amber-400'
                                : selected
                                  ? 'bg-white/70'
                                  : 'bg-slate-300'
                          }`}
                        />
                        <span className="truncate">{businessSeatLabel(sid)}</span>
                      </Link>
                    </li>
                  )
                })}
              </ul>
            )}

            <Link
              to={`/agent/cases/${activeCaseId}/room`}
              className="mt-2 flex items-center justify-center gap-1 rounded-md border border-violet-200 bg-violet-50 px-2 py-1.5 text-[10px] font-medium text-violet-900 hover:bg-violet-100"
              data-testid="business-case-group-chat"
              title="本案群聊 · 可进 room · 非第三栏"
            >
              <MessagesSquare className="h-3 w-3 shrink-0" aria-hidden />
              群聊 · 本案
            </Link>

            {pending.length > 0 && (
              <div className="mt-2 rounded-md border border-amber-100 bg-amber-50/80 p-1.5">
                <div className="mb-1 px-0.5 text-[9px] font-semibold uppercase text-amber-700">
                  待我确认 · {pending.length}
                </div>
                <ul className="space-y-1">
                  {pending.slice(0, 3).map((item) => (
                    <li key={item.id}>
                      <Link
                        to={`/agent/pending/${item.id}`}
                        className="block truncate rounded border border-amber-100 bg-white/70 px-1.5 py-1 text-[10px] font-medium text-amber-950"
                        data-testid={`business-case-pending-${item.id}`}
                      >
                        {item.title}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        )}
      </div>

      <div className="shrink-0 border-t border-slate-200/80 px-2 py-2">
        <Link
          to="/agent/catalog"
          className="focus-ring hit-40 flex w-full items-center gap-1.5 rounded-[var(--radius-sm)] px-2.5 text-[12px] text-slate-500 hover:bg-white/70 hover:text-slate-700"
          data-testid="business-side-expert-bench"
          title="专家工作台（旁路，非冷启动）"
        >
          <LayoutGrid className="h-3.5 w-3.5 shrink-0 opacity-70" aria-hidden />
          专家工作台
        </Link>
      </div>
    </aside>
  )
}
