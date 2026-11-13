import { useEffect, useMemo, useRef, useState } from 'react'
import type { CompanyActivityEvent } from '../../business/companyActivity'
import { Link } from 'react-router-dom'
import { HALL_DEPT_DOORS, hallDeptHref, type HallDeptDoor } from '../../business/hallDepts'
import { hallDeptExpertPreviews } from '../../business/hallDeptPreview'
import { roomLiveStatusForDoor, type RoomLiveStatus } from '../../business/roomLiveStatus'
import { useBusinessCases } from '../../business/BusinessCaseContext'
import { useCompanyActivity } from '../../business/CompanyActivityContext'
import { useDemoPace } from '../../business/DemoPaceContext'
import { handoffDurationMs } from '../../business/demoPace'
import { collectBossTodos } from '../../business/bossTodos'
import { prefersReducedMotion } from '../../lib/motionPref'

const ANCHOR: Record<string, { x: number; y: number }> = {
  reception: { x: 50, y: 14 },
  intake: { x: 13.5, y: 44 },
  inspire: { x: 38, y: 44 },
  mining: { x: 62, y: 44 },
  disclosure: { x: 86.5, y: 44 },
  draft: { x: 13.5, y: 78 },
  oa: { x: 38, y: 78 },
  annuity: { x: 62, y: 78 },
  monetize: { x: 86.5, y: 78 },
}

type Play = {
  id: string
  fromSlug: string
  toSlug: string
  phrase: string
  caseTitle: string
}

function playableHandoff(events: CompanyActivityEvent[], openedAt: number): Play | null {
  const hit = events.find((event) => event.handoff)
  if (!hit?.handoff) return null
  const at = Date.parse(hit.at)
  if (Number.isFinite(at) && at < openedAt - 25000) return null
  return {
    id: hit.id,
    fromSlug: hit.handoff.fromSlug,
    toSlug: hit.handoff.toSlug,
    phrase: hit.handoff.phrase,
    caseTitle: hit.caseTitle ?? '本案',
  }
}

function statusClass(status: RoomLiveStatus, thin: boolean): string {
  if (status === '待确认') {
    return thin
      ? 'border-dashed border-amber-300 bg-amber-50/70'
      : 'border-amber-300 bg-amber-50'
  }
  if (status === '进行中') {
    return thin
      ? 'border-dashed border-[#9ec5ff] bg-[#f3f8ff]'
      : 'border-[#007aff]/40 bg-[#e8f2ff]'
  }
  return thin
    ? 'border-dashed border-slate-200 bg-slate-50/80'
    : 'border-slate-200 bg-white shadow-[var(--shadow-rest)]'
}

function RoomFace({
  door,
  status,
  caseId,
  abCount,
}: {
  door: HallDeptDoor
  status: RoomLiveStatus
  caseId?: string
  abCount: number
}) {
  const lead = hallDeptExpertPreviews(door).find((e) => e.lead)
  const name = lead?.name ?? door.label
  const quiet = door.thin
  return (
    <li className="relative min-h-0 min-w-0">
      {abCount > 0 ? (
        <Link
          to={`/agent/pending?dept=${door.slug}&seg=AB`}
          className="focus-ring absolute right-1.5 top-1.5 z-[1] rounded-md bg-amber-50 px-1.5 py-0.5 text-[10px] font-semibold text-amber-900 ring-1 ring-amber-200"
          data-testid={`home-dept-ab-badge-${door.slug}`}
        >
          待处理 {abCount}
        </Link>
      ) : null}
      <Link
        to={hallDeptHref(caseId, door)}
        className={`btn-press focus-ring flex h-full min-h-0 flex-col justify-between overflow-hidden rounded-[var(--radius-lg)] border px-2 py-1.5 ${statusClass(status, quiet)} ${quiet ? 'opacity-80' : ''}`}
        data-testid={`home-dept-door-${door.slug}`}
        data-thin={quiet ? '1' : '0'}
        data-room-status={status}
        title={`${door.label} · ${door.desc}`}
      >
        <span className="flex items-center gap-1.5">
          <span
            className={`inline-flex h-6 w-6 shrink-0 items-center justify-center rounded-full text-[11px] font-semibold ${
              quiet ? 'bg-slate-200 text-slate-500' : 'bg-slate-900 text-white'
            }`}
            aria-hidden
          >
            {name.slice(0, 1)}
          </span>
          <span className="min-w-0">
            <span className={`block truncate text-[12px] font-semibold ${quiet ? 'text-slate-500' : 'text-slate-900'}`}>
              {door.label}
            </span>
            <span className={`block truncate text-[10px] ${quiet ? 'text-slate-400' : 'text-slate-500'}`}>
              {name}
            </span>
          </span>
        </span>
        <span className="mt-2 flex items-center justify-between gap-1">
          <span
            className={`inline-flex items-center gap-1 rounded-full px-1.5 py-0.5 text-[10px] font-medium ${
              status === '待确认'
                ? 'bg-amber-100 text-amber-950'
                : status === '进行中'
                  ? 'bg-white/80 text-[#0066d6]'
                  : 'bg-white/70 text-slate-400'
            }`}
            data-testid={`hall-room-status-${door.slug}`}
          >
            <span
              className={`h-1.5 w-1.5 rounded-full ${
                status === '待确认'
                  ? 'bg-amber-500'
                  : status === '进行中'
                    ? 'bg-[#007aff] animate-pulse'
                    : 'bg-slate-300'
              }`}
              aria-hidden
            />
            {status}
          </span>
          {quiet ? (
            <span className="text-[10px] text-slate-400">薄</span>
          ) : (
            <span className="text-[10px] text-slate-400">{door.num}</span>
          )}
        </span>
      </Link>
    </li>
  )
}

export function HallFloorPlan({ caseId }: { caseId?: string }) {
  const { cases, getProgress, getCaseConfirms, getPendingConfirms } = useBusinessCases()
  const { events } = useCompanyActivity()
  const { speed, aborted } = useDemoPace()
  const [openedAt] = useState(() => Date.now())
  const play = playableHandoff(events, openedAt)
  const reduced = prefersReducedMotion()
  const [progress, setProgress] = useState(reduced ? 1 : 0)
  const [trackedId, setTrackedId] = useState<string | null>(play?.id ?? null)
  const [showPhrase, setShowPhrase] = useState(true)
  if ((play?.id ?? null) !== trackedId) {
    setTrackedId(play?.id ?? null)
    setProgress(!play || reduced ? 1 : 0)
    setShowPhrase(!!play)
  }
  const progressRef = useRef(progress)
  const playRef = useRef(play)
  const playId = play?.id ?? null
  const arrived = progress >= 1

  const snaps = useMemo(
    () =>
      cases.map((c) => ({
        progress: getProgress(c.id),
        confirms: getCaseConfirms(c.id),
      })),
    [cases, getProgress, getCaseConfirms],
  )

  const progressById = useMemo(() => {
    const map: Record<string, ReturnType<typeof getProgress>> = {}
    for (const c of cases) map[c.id] = getProgress(c.id)
    return map
  }, [cases, getProgress])

  const { countByDept } = useMemo(
    () =>
      collectBossTodos({
        pending: getPendingConfirms(),
        cases,
        progressById,
      }),
    [getPendingConfirms, cases, progressById],
  )

  useEffect(() => {
    progressRef.current = progress
    playRef.current = play
  }, [progress, play])

  useEffect(() => {
    if (!playId || aborted || progressRef.current >= 1) return
    const duration = handoffDurationMs(speed, prefersReducedMotion())
    if (duration <= 0) return
    const from = progressRef.current
    const start = performance.now()
    let frame = 0
    const tick = (now: number) => {
      const next = Math.min(1, from + (now - start) / duration)
      setProgress(next)
      if (next < 1) frame = window.requestAnimationFrame(tick)
    }
    frame = window.requestAnimationFrame(tick)
    return () => window.cancelAnimationFrame(frame)
  }, [playId, aborted, speed])

  useEffect(() => {
    if (!playId || !arrived) return
    const timer = window.setTimeout(() => setShowPhrase(false), 6000)
    return () => window.clearTimeout(timer)
  }, [playId, arrived])

  const from = play ? ANCHOR[play.fromSlug] : null
  const to = play ? ANCHOR[play.toSlug] : null
  const token =
    play && from && to
      ? {
          x: from.x + (to.x - from.x) * progress,
          y: from.y + (to.y - from.y) * progress,
        }
      : null

  const top = HALL_DEPT_DOORS.slice(0, 4)
  const bottom = HALL_DEPT_DOORS.slice(4)

  return (
    <section
      className="relative flex h-full min-h-0 flex-col overflow-hidden rounded-[var(--radius-xl)] border border-slate-200 bg-[#f5f5f7] p-3 shadow-[var(--shadow-rest)]"
      data-testid="hall-floor-plan"
      aria-labelledby="home-eight-depts-title"
    >
      <svg
        className="pointer-events-none absolute inset-3 h-[calc(100%-1.5rem)] w-[calc(100%-1.5rem)]"
        viewBox="0 0 100 100"
        preserveAspectRatio="none"
        aria-hidden
      >
        <rect x="1.5" y="1.5" width="97" height="97" rx="3" fill="none" stroke="#e2e8f0" strokeWidth="0.6" />
        <line x1="4" y1="30" x2="96" y2="30" stroke="#e2e8f0" strokeWidth="0.45" />
        <line x1="4" y1="64" x2="96" y2="64" stroke="#e2e8f0" strokeWidth="0.45" />
      </svg>
      <div className="relative mb-2 flex items-baseline justify-between gap-2">
        <h2 id="home-eight-depts-title" className="text-[12px] font-semibold text-slate-700">
          公司楼层
        </h2>
        <p className="text-[10px] text-slate-400">点房间进部门 · 薄部更安静</p>
      </div>
      <div className="relative grid min-h-0 flex-1 grid-rows-[auto_minmax(0,1fr)_minmax(0,1fr)] gap-1.5">
        <button
          type="button"
          className="focus-ring flex items-center gap-2 rounded-[var(--radius-lg)] border border-slate-300 bg-white px-3 py-2 text-left shadow-[var(--shadow-rest)]"
          data-testid="hall-reception-room"
          onClick={() => {
            document.getElementById('home-reception-line')?.focus()
          }}
        >
          <span className="inline-flex h-7 w-7 items-center justify-center rounded-full bg-[#007aff] text-[12px] font-semibold text-white">
            小
          </span>
          <span className="min-w-0">
            <span className="block text-[12px] font-semibold text-slate-900">前台 · 小林</span>
            <span className="block text-[10px] text-slate-500">入口接待 · 弄清先去哪一间</span>
          </span>
          <span className="ml-auto rounded-full bg-[#e8f2ff] px-2 py-0.5 text-[10px] font-medium text-[#0066d6]">
            接待
          </span>
        </button>
        <ol className="grid min-h-0 grid-cols-4 gap-1.5" data-testid="home-eight-depts" data-dept-grid="floor">
          {top.map((door) => (
            <RoomFace
              key={door.deptId}
              door={door}
              caseId={caseId}
              abCount={countByDept[door.deptId] ?? 0}
              status={roomLiveStatusForDoor(door, snaps)}
            />
          ))}
        </ol>
        <ol className="grid min-h-0 grid-cols-4 gap-1.5">
          {bottom.map((door) => (
            <RoomFace
              key={door.deptId}
              door={door}
              caseId={caseId}
              abCount={countByDept[door.deptId] ?? 0}
              status={roomLiveStatusForDoor(door, snaps)}
            />
          ))}
        </ol>
      </div>
      {token && play ? (
        <div
          className="pointer-events-none absolute z-[2] -translate-x-1/2 -translate-y-1/2"
          style={{ left: `${token.x}%`, top: `${token.y}%` }}
          data-testid="hall-live-token"
          data-from={play.fromSlug}
          data-to={play.toSlug}
        >
          <span className="inline-flex max-w-[8rem] items-center rounded-full bg-slate-900 px-2 py-1 text-[10px] font-semibold text-white shadow-[var(--shadow-elevated)]">
            {play.caseTitle}
          </span>
        </div>
      ) : null}
      {showPhrase && play && to ? (
        <div
          className="pointer-events-none absolute z-[2] max-w-[11rem] -translate-x-1/2 rounded-[var(--radius-md)] border border-slate-200 bg-white px-2.5 py-1.5 text-[11px] leading-snug text-slate-800 shadow-[var(--shadow-elevated)]"
          style={{ left: `${to.x}%`, top: `calc(${to.y}% - 2.6rem)` }}
          data-testid="hall-handoff-bubble"
          role="status"
        >
          {play.phrase}
        </div>
      ) : null}
    </section>
  )
}
