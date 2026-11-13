import { useEffect, useMemo, useRef, useState, type RefObject } from 'react'
import { Link } from 'react-router-dom'
import type { CompanyActivityEvent } from '../../business/companyActivity'
import { HALL_DEPT_DOORS, hallDeptHref, type HallDeptDoor } from '../../business/hallDepts'
import { hallDeptExpertPreviews } from '../../business/hallDeptPreview'
import { businessSeatPersonaName } from '../../business/businessSeats'
import { roomLiveStatusForDoor, type RoomLiveStatus } from '../../business/roomLiveStatus'
import { useBusinessCases } from '../../business/BusinessCaseContext'
import { useCompanyActivity } from '../../business/CompanyActivityContext'
import { useDemoPace } from '../../business/DemoPaceContext'
import { handoffDurationMs, type DemoSpeed } from '../../business/demoPace'
import { collectBossTodos } from '../../business/bossTodos'
import { prefersReducedMotion } from '../../lib/motionPref'
import {
  BUILDING,
  CHATTER,
  LANE_X,
  OFFICE_H,
  OFFICE_W,
  RECEPTIONIST,
  RECEPTION_DESK,
  boardCopy,
  hairFor,
  handoffWaypoints,
  officeRooms,
  polylinePoint,
  roomBySlug,
  shirtFor,
  type OfficeRoom,
  type Pt,
} from '../../business/officeLayout'

function playableHandoff(events: CompanyActivityEvent[], openedAt: number) {
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

function walkDurationMs(speed: DemoSpeed, reduced: boolean): number {
  const base = handoffDurationMs(speed, reduced)
  return base === 0 ? 0 : base * 3
}

type Fit = { x: number; y: number; w: number; h: number }

function useSvgFit(svgRef: RefObject<SVGSVGElement | null>): Fit {
  const [fit, setFit] = useState<Fit>({ x: 0, y: 0, w: 0, h: 0 })
  useEffect(() => {
    const el = svgRef.current
    const parent = el?.parentElement
    if (!el || !parent) return
    const measure = () => {
      const box = el.getBoundingClientRect()
      const host = parent.getBoundingClientRect()
      const scale = Math.min(box.width / OFFICE_W, box.height / OFFICE_H)
      const w = OFFICE_W * scale
      const h = OFFICE_H * scale
      setFit({
        x: box.left - host.left + (box.width - w) / 2,
        y: box.top - host.top + (box.height - h) / 2,
        w,
        h,
      })
    }
    measure()
    const observer = new ResizeObserver(measure)
    observer.observe(el)
    observer.observe(parent)
    return () => observer.disconnect()
  }, [svgRef])
  return fit
}

function place(pt: Pt, fit: Fit): { left: number; top: number } {
  return {
    left: fit.x + (pt.x / OFFICE_W) * fit.w,
    top: fit.y + (pt.y / OFFICE_H) * fit.h,
  }
}

function clampBubble(left: number, fit: Fit): number {
  return Math.max(fit.x + 88, Math.min(fit.x + fit.w - 88, left))
}

function personName(id: string, fallback: string): string {
  return businessSeatPersonaName(id) ?? fallback
}

type Actor = {
  id: string
  name: string
  slug: string
  lead: boolean
  home: Pt
  shirt: string
  hair: string
}

function actorsFor(room: OfficeRoom): Actor[] {
  const door = HALL_DEPT_DOORS.find((item) => item.slug === room.slug)
  if (!door) return []
  const previews = hallDeptExpertPreviews(door).slice(0, room.thin ? 1 : 3)
  return previews.map((preview, index) => ({
    id: preview.id,
    name: personName(preview.id, preview.name),
    slug: room.slug,
    lead: index === 0,
    home: room.seats[index] ?? room.seats[0]!,
    shirt: shirtFor(preview.id),
    hair: hairFor(preview.id),
  }))
}

function PersonSprite({
  shirt,
  hair,
  walking,
  paused,
  speed,
  delay,
}: {
  shirt: string
  hair: string
  walking: boolean
  paused: boolean
  speed: DemoSpeed
  delay: string
}) {
  return (
    <svg
      width="40"
      height="48"
      viewBox="0 0 40 48"
      aria-hidden
      className={walking ? 'office-walk' : 'office-idle'}
      style={{
        animationDuration: walking ? `${0.32 / speed}s` : '2.6s',
        animationDelay: delay,
        animationPlayState: paused ? 'paused' : 'running',
      }}
    >
      <ellipse cx="20" cy="44" rx="9" ry="3.2" fill="rgba(15,23,42,0.22)" />
      <rect x="13" y="28" width="5" height="11" rx="2" fill="#334155" className="office-leg office-leg-a" />
      <rect x="22" y="28" width="5" height="11" rx="2" fill="#1e293b" className="office-leg office-leg-b" />
      <rect x="11" y="18" width="18" height="14" rx="5" fill={shirt} />
      <rect x="8" y="20" width="4" height="9" rx="2" fill={shirt} />
      <rect x="28" y="20" width="4" height="9" rx="2" fill={shirt} />
      <circle cx="20" cy="12" r="8" fill="#f3d2c4" />
      <path d="M12 12 Q12 4 20 4 Q28 4 28 12 Q26 7 20 6 Q14 7 12 12" fill={hair} />
      <circle cx="17" cy="12.5" r="0.9" fill="#0f172a" />
      <circle cx="23" cy="12.5" r="0.9" fill="#0f172a" />
    </svg>
  )
}

function Desk({ x, y }: { x: number; y: number }) {
  const top = y - 34
  return (
    <g filter="url(#furnShadow)">
      <rect x={x - 26} y={top} width="52" height="26" rx="4" fill="#ffffff" stroke="#e2e8f0" />
      <rect x={x - 14} y={top + 5} width="22" height="13" rx="2" fill="#0f172a" />
      <rect x={x - 12} y={top + 7} width="18" height="8" rx="1" fill="#1e293b" />
      <rect x={x - 11} y={top + 8} width="10" height="2" rx="1" fill="#007aff" opacity="0.85" />
    </g>
  )
}

function RoomArt({
  room,
  status,
  staff,
}: {
  room: OfficeRoom
  status: RoomLiveStatus
  staff: number
}) {
  const [lineA, lineB] = boardCopy(status)
  const dim = room.thin
  return (
    <g data-room={room.slug}>
      <rect
        x={room.x + 8}
        y={room.y + 8}
        width={room.w - 16}
        height={room.h - 16}
        fill={dim ? '#e7e9ef' : 'url(#plank)'}
      />
      {dim ? <rect x={room.x + 8} y={room.y + 8} width={room.w - 16} height={room.h - 16} fill="#0f172a" opacity="0.06" /> : null}
      {!dim ? (
        <ellipse
          cx={room.x + room.w / 2}
          cy={room.y + 70}
          rx="70"
          ry="28"
          fill="#ffffff"
          opacity="0.45"
        />
      ) : null}
      {!dim ? (
        <rect
          x={room.doorSide === 'e' ? room.x + 14 : room.x + room.w - 68}
          y={room.y + 58}
          width="54"
          height="8"
          rx="2"
          fill="#dbeafe"
          stroke="#93c5fd"
        />
      ) : null}
      <g>
        <rect
          x={room.board.x}
          y={room.board.y}
          width={room.board.w}
          height={room.board.h}
          rx="3"
          fill="#ffffff"
          stroke="#94a3b8"
        />
        <text x={room.board.x + 8} y={room.board.y + 16} fill="#334155" fontSize="11">
          {lineA}
        </text>
        <text x={room.board.x + 8} y={room.board.y + 32} fill="#64748b" fontSize="11">
          {lineB}
        </text>
      </g>
      {room.seats.slice(0, staff).map((seat, index) => (
        <Desk key={index} x={seat.x} y={seat.y} />
      ))}
      <g>
        <rect x={room.x + 16} y={room.y + 78} width="16" height="64" rx="2" fill="#e2e8f0" stroke="#cbd5e1" />
        <path d={`M${room.x + 18} ${room.y + 92} H${room.x + 30} M${room.x + 18} ${room.y + 104} H${room.x + 30} M${room.x + 18} ${room.y + 116} H${room.x + 30}`} stroke="#94a3b8" strokeWidth="1" />
      </g>
      <g transform={`translate(${room.x + room.w - 36} ${room.y + 86})`}>
        <rect width="22" height="28" rx="2" fill="#f8fafc" stroke="#cbd5e1" />
        <path d="M2 10 H20 M2 18 H20" stroke="#e2e8f0" />
      </g>
      {!dim ? (
        <g transform={`translate(${room.x + room.w - 40} ${room.y + room.h - 48})`}>
          <ellipse cx="12" cy="22" rx="10" ry="4" fill="rgba(15,23,42,0.12)" />
          <rect x="8" y="14" width="8" height="8" rx="1" fill="#d6d3d1" />
          <circle cx="12" cy="10" r="8" fill="#059669" />
          <circle cx="7" cy="12" r="5" fill="#34d399" />
          <circle cx="16" cy="11" r="4" fill="#047857" />
        </g>
      ) : null}
      {!dim ? (
        <g filter="url(#furnShadow)">
          <ellipse cx={room.x + room.w - 78} cy={room.y + room.h / 2 + 10} rx="28" ry="16" fill="#f8fafc" stroke="#e2e8f0" />
        </g>
      ) : null}
      <text
        x={room.x + room.w - 18}
        y={room.y + 28}
        fill={dim ? '#94a3b8' : '#475569'}
        fontSize="14"
        fontWeight="700"
        textAnchor="end"
      >
        {room.label}
      </text>
    </g>
  )
}

function wallSegments(): Array<[number, number, number, number]> {
  const rooms = officeRooms()
  const lines: Array<[number, number, number, number]> = []
  const top = BUILDING.y
  const bottom = BUILDING.y + BUILDING.h
  const left = BUILDING.x
  const right = BUILDING.x + BUILDING.w
  lines.push([left, top, right, top])
  lines.push([left, top, left, bottom])
  lines.push([right, top, right, bottom])
  lines.push([left, bottom, LANE_X - 70, bottom])
  lines.push([LANE_X + 70, bottom, right, bottom])
  lines.push([left, 938, LANE_X - 100, 938])
  lines.push([LANE_X + 100, 938, right, 938])
  for (const room of rooms) {
    if (room.y > top + 1) {
      lines.push([room.x, room.y, room.x + room.w, room.y])
    }
    const gap = 24
    if (room.doorSide === 'e') {
      lines.push([room.x + room.w, room.y, room.x + room.w, room.door.y - gap])
      lines.push([room.x + room.w, room.door.y + gap, room.x + room.w, room.y + room.h])
    } else {
      lines.push([room.x, room.y, room.x, room.door.y - gap])
      lines.push([room.x, room.door.y + gap, room.x, room.y + room.h])
    }
  }
  return lines
}

export function HallFloorPlan({ caseId }: { caseId?: string }) {
  const { cases, getProgress, getCaseConfirms, getPendingConfirms } = useBusinessCases()
  const { events } = useCompanyActivity()
  const { speed, aborted } = useDemoPace()
  const svgRef = useRef<SVGSVGElement>(null)
  const fit = useSvgFit(svgRef)
  const [openedAt] = useState(() => Date.now())
  const play = playableHandoff(events, openedAt)
  const reduced = prefersReducedMotion()
  const [progress, setProgress] = useState(reduced ? 1 : 0)
  const [trackedId, setTrackedId] = useState<string | null>(play?.id ?? null)
  const [showPhrase, setShowPhrase] = useState(true)
  const playId = play?.id ?? null
  if (playId !== trackedId) {
    setTrackedId(playId)
    setProgress(!playId || reduced ? 1 : 0)
    setShowPhrase(!!playId)
  }
  const progressRef = useRef(progress)
  const arrived = progress >= 1
  const [chatterTick, setChatterTick] = useState(0)

  const rooms = useMemo(() => officeRooms(), [])
  const snaps = useMemo(
    () =>
      cases.map((item) => ({
        progress: getProgress(item.id),
        confirms: getCaseConfirms(item.id),
      })),
    [cases, getProgress, getCaseConfirms],
  )
  const progressById = useMemo(() => {
    const map: Record<string, ReturnType<typeof getProgress>> = {}
    for (const item of cases) map[item.id] = getProgress(item.id)
    return map
  }, [cases, getProgress])
  const { countByDept } = useMemo(
    () => collectBossTodos({ pending: getPendingConfirms(), cases, progressById }),
    [getPendingConfirms, cases, progressById],
  )
  const statusBySlug = useMemo(() => {
    const map: Record<string, RoomLiveStatus> = {}
    for (const door of HALL_DEPT_DOORS) {
      map[door.slug] = roomLiveStatusForDoor(door, snaps)
    }
    return map
  }, [snaps])

  const cast = useMemo(() => rooms.flatMap((room) => actorsFor(room)), [rooms])

  const route = useMemo(() => {
    if (!play) return null
    const from = roomBySlug(play.fromSlug)
    const to = roomBySlug(play.toSlug)
    if (!from || !to) return null
    return handoffWaypoints(from, to)
  }, [play])

  const walkerHomeId = cast.find((actor) => actor.lead && actor.slug === play?.fromSlug)?.id
  const walkerPt = route ? polylinePoint(route, progress) : null

  useEffect(() => {
    progressRef.current = progress
  }, [progress])

  useEffect(() => {
    if (!playId || aborted || progressRef.current >= 1) return
    const duration = walkDurationMs(speed, prefersReducedMotion())
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
    const timer = window.setTimeout(() => setShowPhrase(false), 4200)
    return () => window.clearTimeout(timer)
  }, [playId, arrived])

  useEffect(() => {
    if (aborted || reduced) return
    const timer = window.setInterval(() => setChatterTick((n) => n + 1), Math.round(4200 / speed))
    return () => window.clearInterval(timer)
  }, [aborted, reduced, speed])

  const talkSlug = useMemo(() => {
    const lively = rooms.filter((room) => statusBySlug[room.slug] && statusBySlug[room.slug] !== '待机')
    const pool = lively.length > 0 ? lively : rooms.filter((room) => !room.thin)
    return pool[chatterTick % pool.length]?.slug
  }, [rooms, statusBySlug, chatterTick])

  const walls = wallSegments()
  const ready = fit.w > 20

  return (
    <section
      className="relative flex h-full min-h-0 flex-col overflow-hidden rounded-[var(--radius-xl)] bg-[#d5dae3] shadow-[var(--shadow-shell)]"
      data-testid="hall-floor-plan"
      aria-labelledby="home-eight-depts-title"
    >
      <style>{`
        @keyframes office-bob { 50% { transform: translateY(-2px); } }
        @keyframes office-step { 50% { transform: translateY(-3px); } }
        .office-idle { animation: office-bob 2.6s ease-in-out infinite; transform-origin: 50% 100%; }
        .office-walk { animation: office-step 0.32s ease-in-out infinite; transform-origin: 50% 100%; }
        .office-walk .office-leg-a { transform: translateY(-1px); }
        @media (prefers-reduced-motion: reduce) {
          .office-idle, .office-walk { animation: none; }
        }
      `}</style>
      <div className="flex shrink-0 items-baseline justify-between gap-2 px-3 py-1.5">
        <h2 id="home-eight-depts-title" className="text-[12px] font-semibold text-slate-700">
          公司楼层
        </h2>
        <p className="text-[10px] text-slate-500">点人或房间进部门 · 薄部人少、灯暗</p>
      </div>
      <div className="relative min-h-0 flex-1">
        <svg
          ref={svgRef}
          viewBox={`0 0 ${OFFICE_W} ${OFFICE_H}`}
          className="h-full w-full"
          role="img"
          aria-label="专利公司办公室俯视图"
        >
          <defs>
            <pattern id="plank" width="36" height="18" patternUnits="userSpaceOnUse">
              <rect width="36" height="18" fill="#f3f1ec" />
              <path d="M0 18 H36" stroke="#e4dfd6" strokeWidth="1" />
              <path d="M18 0 V18" stroke="#e7e2da" strokeWidth="0.6" />
            </pattern>
            <pattern id="tile" width="24" height="24" patternUnits="userSpaceOnUse">
              <rect width="24" height="24" fill="#e6e8ee" />
              <path d="M0 24 H24 M24 0 V24" stroke="#d5d9e3" strokeWidth="0.8" />
            </pattern>
            <filter id="furnShadow" x="-30%" y="-30%" width="170%" height="180%">
              <feDropShadow dx="0" dy="1.4" stdDeviation="1.2" floodColor="#0f172a" floodOpacity="0.18" />
            </filter>
            <filter id="hallShadow" x="-4%" y="-4%" width="112%" height="116%">
              <feDropShadow dx="0" dy="8" stdDeviation="8" floodColor="#0f172a" floodOpacity="0.16" />
            </filter>
            <radialGradient id="vignette" cx="50%" cy="45%" r="70%">
              <stop offset="0%" stopColor="#ffffff" stopOpacity="0" />
              <stop offset="100%" stopColor="#0f172a" stopOpacity="0.08" />
            </radialGradient>
          </defs>
          <rect
            x={BUILDING.x}
            y={BUILDING.y}
            width={BUILDING.w}
            height={BUILDING.h}
            rx="18"
            fill="#efece6"
            filter="url(#hallShadow)"
          />
          <rect
            x={LANE_X - 86}
            y={BUILDING.y + 8}
            width="172"
            height={BUILDING.h - 16}
            fill="url(#tile)"
          />
          {rooms.map((room) => (
            <RoomArt
              key={room.slug}
              room={room}
              status={statusBySlug[room.slug] ?? '待机'}
              staff={room.thin ? 1 : 3}
            />
          ))}
          <g filter="url(#furnShadow)">
            <rect
              x={RECEPTION_DESK.x}
              y={RECEPTION_DESK.y}
              width={RECEPTION_DESK.w}
              height={RECEPTION_DESK.h}
              rx="6"
              fill="#ffffff"
              stroke="#e2e8f0"
            />
            <rect x={RECEPTION_DESK.x + 10} y={RECEPTION_DESK.y + 8} width="28" height="16" rx="2" fill="#0f172a" />
            <rect x={RECEPTION_DESK.x + 46} y={RECEPTION_DESK.y + 10} width="18" height="12" rx="2" fill="#e8f2ff" />
          </g>
          <g filter="url(#furnShadow)">
            <rect x={LANE_X - 30} y={470} width="60" height="14" rx="4" fill="#ffffff" stroke="#e2e8f0" />
            <rect x={LANE_X - 24} y={700} width="48" height="12" rx="3" fill="#f8fafc" stroke="#e2e8f0" />
          </g>
          <g transform={`translate(${LANE_X - 78} 990)`}>
            <rect x="6" y="10" width="8" height="8" rx="1" fill="#d6d3d1" />
            <circle cx="10" cy="8" r="8" fill="#059669" />
          </g>
          <ellipse cx={LANE_X} cy={1018} rx="36" ry="12" fill="#e8f2ff" />
          <text x={LANE_X} y={1022} fill="#0066d6" fontSize="12" fontWeight="700" textAnchor="middle">
            入口
          </text>
          <g stroke="#9aa3b5" strokeWidth="12" strokeLinecap="square">
            {walls.map(([x1, y1, x2, y2], index) => (
              <line key={index} x1={x1} y1={y1} x2={x2} y2={y2} />
            ))}
          </g>
          <g stroke="#e8edf5" strokeWidth="3" strokeLinecap="square" opacity="0.7">
            {walls.map(([x1, y1, x2, y2], index) => (
              <line key={index} x1={x1} y1={y1 - 2} x2={x2} y2={y2 - 2} />
            ))}
          </g>
          {rooms.map((room) => {
            const swing = room.doorSide === 'e' ? 18 : -18
            return (
              <g key={`door-${room.slug}`} stroke="#cbd5e1" strokeWidth="3" fill="none">
                <path d={`M${room.door.x} ${room.door.y - 20} h${swing}`} />
                <circle cx={room.door.x + swing} cy={room.door.y - 12} r="1.6" fill="#007aff" stroke="none" />
              </g>
            )
          })}
          <path d={`M${LANE_X - 70} ${BUILDING.y + BUILDING.h} v-16`} stroke="#007aff" strokeWidth="4" />
          <path d={`M${LANE_X + 70} ${BUILDING.y + BUILDING.h} v-16`} stroke="#007aff" strokeWidth="4" />
          <rect x="0" y="0" width={OFFICE_W} height={OFFICE_H} fill="url(#vignette)" pointerEvents="none" />
        </svg>

        {ready
          ? rooms.map((room) => {
              const door = HALL_DEPT_DOORS.find((item) => item.slug === room.slug) as HallDeptDoor
              const origin = place({ x: room.x, y: room.y }, fit)
              const far = place({ x: room.x + room.w, y: room.y + room.h }, fit)
              const status = statusBySlug[room.slug] ?? '待机'
              const badgeAt = place({ x: room.door.x, y: room.door.y - 28 }, fit)
              const count = countByDept[door.deptId] ?? 0
              return (
                <div key={room.slug}>
                  <Link
                    to={hallDeptHref(caseId, door)}
                    className="focus-ring absolute rounded-sm"
                    style={{
                      left: origin.left,
                      top: origin.top,
                      width: far.left - origin.left,
                      height: far.top - origin.top,
                    }}
                    data-testid={`home-dept-door-${room.slug}`}
                    data-thin={room.thin ? '1' : '0'}
                    aria-label={`${door.label}，${status}，进入部门`}
                    title={`${door.label} · ${door.desc}`}
                  />
                  <span
                    className={`pointer-events-none absolute z-[3] -translate-x-1/2 rounded-full px-1.5 py-0.5 text-[10px] font-semibold shadow-sm ${
                      status === '待确认'
                        ? 'bg-amber-100 text-amber-950'
                        : status === '进行中'
                          ? 'bg-[#e8f2ff] text-[#0066d6]'
                          : 'bg-white/80 text-slate-400'
                    }`}
                    style={{ left: badgeAt.left, top: badgeAt.top }}
                    data-testid={`hall-room-status-${room.slug}`}
                  >
                    {status}
                  </span>
                  {count > 0 ? (
                    <Link
                      to={`/agent/pending?dept=${room.slug}&seg=AB`}
                      className="focus-ring absolute z-[4] rounded-full bg-amber-50 px-1.5 py-0.5 text-[10px] font-semibold text-amber-950 ring-1 ring-amber-200"
                      style={{ left: origin.left + 8, top: origin.top + 8 }}
                      data-testid={`home-dept-ab-badge-${room.slug}`}
                    >
                      待处理 {count}
                    </Link>
                  ) : null}
                </div>
              )
            })
          : null}

        {ready
          ? cast.map((actor) => {
              const walking = actor.id === walkerHomeId && !!walkerPt && progress < 1
              const pt = walking && walkerPt ? walkerPt : actor.home
              const at = place(pt, fit)
              const door = HALL_DEPT_DOORS.find((item) => item.slug === actor.slug) as HallDeptDoor
              const chatter =
                !play && actor.lead && actor.slug === talkSlug
                  ? CHATTER[actor.slug]?.[chatterTick % (CHATTER[actor.slug]?.length ?? 1)]
                  : null
              return (
                <Link
                  key={actor.id}
                  to={hallDeptHref(caseId, door)}
                  className="focus-ring absolute z-[5] -translate-x-1/2 -translate-y-full"
                  style={{ left: at.left, top: at.top }}
                  data-testid={walking ? 'hall-live-token' : undefined}
                  data-from={walking ? play?.fromSlug : undefined}
                  data-to={walking ? play?.toSlug : undefined}
                  aria-label={`${actor.name}，${door.label}`}
                >
                  <span className="absolute -top-4 left-1/2 -translate-x-1/2 whitespace-nowrap rounded-full bg-white/95 px-1.5 py-px text-[10px] font-semibold text-slate-800 shadow-sm">
                    {actor.name}
                  </span>
                  <PersonSprite
                    shirt={actor.shirt}
                    hair={actor.hair}
                    walking={walking && !reduced}
                    paused={aborted}
                    speed={speed}
                    delay={`${(actor.name.length % 5) * 0.2}s`}
                  />
                  {walking ? (
                    <span className="absolute -right-2 top-3 rounded-sm bg-[#fffbeb] px-1 text-[9px] font-semibold text-amber-950 shadow-sm">
                      {play?.caseTitle}
                    </span>
                  ) : null}
                  {chatter ? (
                    <span className="pointer-events-none absolute bottom-full left-1/2 z-[6] mb-5 w-max max-w-[9rem] -translate-x-1/2 rounded-lg border border-slate-200 bg-white px-2 py-1 text-[11px] leading-snug text-slate-800 shadow-[var(--shadow-elevated)]">
                      {chatter}
                    </span>
                  ) : null}
                </Link>
              )
            })
          : null}

        {ready ? (
          <button
            type="button"
            className="focus-ring absolute z-[5] -translate-x-1/2 -translate-y-full"
            style={place(RECEPTIONIST, fit)}
            data-testid="hall-reception-room"
            aria-label="前台小林，回到登记"
            onClick={() => document.getElementById('home-reception-line')?.focus()}
          >
            <span className="absolute -top-4 left-1/2 -translate-x-1/2 whitespace-nowrap rounded-full bg-[#e8f2ff] px-1.5 py-px text-[10px] font-semibold text-[#0066d6]">
              小林 · 前台
            </span>
            <PersonSprite
              shirt="#007aff"
              hair="#1e293b"
              walking={false}
              paused={aborted}
              speed={speed}
              delay="0.4s"
            />
            {!play ? (
              <span className="pointer-events-none absolute bottom-full left-1/2 mb-5 w-max max-w-[10rem] -translate-x-1/2 rounded-lg border border-[#cfe3ff] bg-white px-2 py-1 text-[11px] leading-snug text-slate-800 shadow-[var(--shadow-elevated)]">
                {CHATTER.reception[chatterTick % CHATTER.reception.length]}
              </span>
            ) : null}
          </button>
        ) : null}

        {ready && showPhrase && play && walkerPt ? (
          <div
            className="pointer-events-none absolute z-[7] w-max max-w-[12rem] -translate-x-1/2 rounded-lg border border-slate-200 bg-white px-2.5 py-1.5 text-[12px] leading-snug text-slate-800 shadow-[var(--shadow-elevated)]"
            style={{
              left: clampBubble(place(walkerPt, fit).left, fit),
              top: place(walkerPt, fit).top - 78,
            }}
            data-testid="hall-handoff-bubble"
            role="status"
          >
            {play.phrase}
          </div>
        ) : null}

        <div className="sr-only" data-testid="home-eight-depts" data-dept-grid="floor">
          八个部门在同一层办公室里
        </div>
      </div>
    </section>
  )
}
