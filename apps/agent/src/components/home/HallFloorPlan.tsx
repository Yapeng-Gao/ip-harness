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
  SIGN,
  CHATTER,
  OFFICE_H,
  OFFICE_W,
  RECEPTIONIST,
  hairFor,
  handoffWaypoints,
  officeRooms,
  polylinePoint,
  roomBySlug,
  shirtFor,
  type OfficeRoom,
  type Pt,
} from '../../business/officeLayout'
import { drawOffice, type PixelActor } from '../../business/officePixels'

const PANTS = ['#243044', '#4a3428', '#1e3d34', '#3d2a44', '#2c3a28']

function hashId(id: string): number {
  let h = 0
  for (const ch of id) h = (h * 33 + ch.charCodeAt(0)) >>> 0
  return h
}

function pantsFor(id: string): string {
  return PANTS[hashId(id + ':pants') % PANTS.length]!
}

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
  return base === 0 ? 0 : base * 4
}

type Fit = { x: number; y: number; w: number; h: number }

function useCanvasFit(canvasRef: RefObject<HTMLCanvasElement | null>): Fit {
  const [fit, setFit] = useState<Fit>({ x: 0, y: 0, w: 0, h: 0 })
  useEffect(() => {
    const el = canvasRef.current
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
  }, [canvasRef])
  return fit
}

function place(pt: Pt, fit: Fit): { left: number; top: number } {
  return {
    left: fit.x + (pt.x / OFFICE_W) * fit.w,
    top: fit.y + (pt.y / OFFICE_H) * fit.h,
  }
}

function shortName(id: string, fallback: string): string {
  const name = businessSeatPersonaName(id) ?? fallback
  return name.length > 4 ? name.slice(0, 4) : name
}

function actorsFor(room: OfficeRoom): PixelActor[] {
  const door = HALL_DEPT_DOORS.find((item) => item.slug === room.slug)
  if (!door) return []
  const previews = hallDeptExpertPreviews(door).slice(0, room.thin ? 1 : 3)
  const roles: PixelActor['role'][] =
    room.slug === 'inspire'
      ? ['board', 'board', 'side']
      : room.slug === 'disclosure'
        ? ['desk', 'board', 'side']
        : ['desk', 'board', 'side']
  return previews.map((preview, index) => ({
    id: preview.id,
    slug: room.slug,
    x: room.seats[index]?.x ?? room.seats[0]!.x,
    y: room.seats[index]?.y ?? room.seats[0]!.y,
    shirt: shirtFor(preview.id),
    hair: hairFor(preview.id),
    pants: pantsFor(preview.id),
    lead: index === 0,
    role: roles[index] ?? 'desk',
  }))
}

export function HallFloorPlan({ caseId }: { caseId?: string }) {
  const { cases, getProgress, getCaseConfirms, getPendingConfirms } = useBusinessCases()
  const { events } = useCompanyActivity()
  const { speed, aborted } = useDemoPace()
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const fit = useCanvasFit(canvasRef)
  const [openedAt] = useState(() => Date.now())
  const play = playableHandoff(events, openedAt)
  const reduced = prefersReducedMotion()
  const [progress, setProgress] = useState(reduced ? 1 : 0)
  const [trackedId, setTrackedId] = useState<string | null>(play?.id ?? null)
  const [showPhrase, setShowPhrase] = useState(true)
  const [frame, setFrame] = useState(0)
  const [chatterTick, setChatterTick] = useState(0)
  const playId = play?.id ?? null
  if (playId !== trackedId) {
    setTrackedId(playId)
    setProgress(!playId || reduced ? 1 : 0)
    setShowPhrase(!!playId)
  }
  const progressRef = useRef(progress)
  const arrived = progress >= 1

  const rooms = useMemo(() => officeRooms(), [])
  const snaps = useMemo(
    () => cases.map((item) => ({ progress: getProgress(item.id), confirms: getCaseConfirms(item.id) })),
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
    for (const door of HALL_DEPT_DOORS) map[door.slug] = roomLiveStatusForDoor(door, snaps)
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
  const walker = cast.find((actor) => actor.lead && actor.slug === play?.fromSlug)

  useEffect(() => {
    progressRef.current = progress
  }, [progress])

  useEffect(() => {
    if (!playId || aborted || reduced || progressRef.current >= 1) return
    const duration = walkDurationMs(speed, false)
    const from = progressRef.current
    const start = performance.now()
    let raf = 0
    const tick = (now: number) => {
      const next = Math.min(1, from + (now - start) / duration)
      setProgress(next)
      if (next < 1) raf = window.requestAnimationFrame(tick)
    }
    raf = window.requestAnimationFrame(tick)
    return () => window.cancelAnimationFrame(raf)
  }, [playId, aborted, reduced, speed])

  useEffect(() => {
    if (reduced || aborted) return
    const timer = window.setInterval(() => setFrame((n) => (n + 1) % 2), Math.round(420 / speed))
    return () => window.clearInterval(timer)
  }, [reduced, aborted, speed])

  const talking = useMemo(() => {
    const slugs = rooms.map((room) => room.slug)
    if (slugs.length === 0) return new Set<string>()
    const first = slugs[(chatterTick + 4) % slugs.length]!
    const second = slugs[(chatterTick + 2) % slugs.length]!
    return new Set([first, second])
  }, [rooms, chatterTick])

  useEffect(() => {
    if (reduced) return
    const timer = window.setInterval(() => setChatterTick((n) => n + 1), 4800)
    return () => window.clearInterval(timer)
  }, [reduced])

  useEffect(() => {
    if (!playId || !arrived) return
    const timer = window.setTimeout(() => setShowPhrase(false), 4200)
    return () => window.clearTimeout(timer)
  }, [playId, arrived])

  useEffect(() => {
    const canvas = canvasRef.current
    const ctx = canvas?.getContext('2d')
    if (!canvas || !ctx) return
    drawOffice(ctx, {
      rooms: rooms.map((room) => ({ ...room, status: statusBySlug[room.slug] ?? '待机' })),
      actors: cast,
      frame: reduced || aborted ? 0 : frame,
      path: route,
      progress,
      fromSlug: play?.fromSlug,
      toSlug: play?.toSlug,
      walkerId: walker?.id,
    })
  }, [rooms, statusBySlug, cast, frame, route, progress, play, walker, reduced, aborted])

  const ready = fit.w > 8
  const greet = CHATTER.reception[frame % CHATTER.reception.length] ?? CHATTER.reception[0]

  return (
    <section
      className="relative flex h-full min-h-0 flex-col overflow-hidden bg-[#c4a27a]"
      data-testid="hall-floor-plan"
      aria-labelledby="home-eight-depts-title"
    >
      <h2 id="home-eight-depts-title" className="sr-only">
        公司楼层
      </h2>
      <div className="relative min-h-0 flex-1">
        <canvas
          ref={canvasRef}
          width={OFFICE_W}
          height={OFFICE_H}
          className="h-full w-full"
          style={{ imageRendering: 'pixelated' }}
          aria-label="专利公司像素办公室"
        />
        {ready
          ? rooms.map((room) => {
              const door = HALL_DEPT_DOORS.find((item) => item.slug === room.slug) as HallDeptDoor
              const origin = place({ x: room.x, y: room.y }, fit)
              const far = place({ x: room.x + room.w, y: room.y + room.h }, fit)
              const status = statusBySlug[room.slug] ?? '待机'
              const sign = place({ x: room.x + room.w / 2, y: room.y + 7 }, fit)
              const badge = place({ x: room.x + room.w - 3, y: room.y + 7 }, fit)
              const count = countByDept[door.deptId] ?? 0
              return (
                <div key={room.slug}>
                  <Link
                    to={hallDeptHref(caseId, door)}
                    className="focus-ring absolute"
                    style={{ left: origin.left, top: origin.top, width: Math.max(8, far.left - origin.left), height: Math.max(8, far.top - origin.top) }}
                    data-testid={`home-dept-door-${room.slug}`}
                    data-thin={room.thin ? '1' : '0'}
                    aria-label={`${door.label}，${status}`}
                  />
                  <span
                    className="pointer-events-none absolute z-[4] -translate-x-1/2 -translate-y-1/2 whitespace-nowrap rounded-sm border-2 border-[#5c3b22] bg-[#e7c48a] px-1.5 text-[12px] font-semibold leading-5 text-[#2a2118] shadow-[2px_2px_0_#5c3b22]"
                    style={{ left: sign.left, top: sign.top }}
                  >
                    {SIGN[room.slug] ?? room.label}
                  </span>
                  <span
                    className={`pointer-events-none absolute z-[4] -translate-x-full whitespace-nowrap rounded-sm border border-[#2a2118] px-1 text-[11px] font-semibold leading-4 ${
                      status === '待确认'
                        ? 'bg-[#f2c14e] text-[#2a2118]'
                        : status === '进行中'
                          ? 'bg-[#d9fbff] text-[#123044]'
                          : 'bg-[#fff8e8] text-[#6b5436]'
                    }`}
                    style={{ left: badge.left, top: badge.top }}
                    data-testid={`hall-room-status-${room.slug}`}
                  >
                    {status}
                  </span>
                  {count > 0 ? (
                    <Link
                      to={`/agent/pending?dept=${room.slug}&seg=AB`}
                      className="focus-ring absolute z-[4] rounded-sm bg-[#f2c14e] px-1 text-[10px] font-semibold text-[#2a2118]"
                      style={{ left: origin.left + 4, top: origin.top + 4 }}
                      data-testid={`home-dept-ab-badge-${room.slug}`}
                    >
                      {count}
                    </Link>
                  ) : null}
                </div>
              )
            })
          : null}
        {ready
          ? cast.map((actor) => {
              const door = HALL_DEPT_DOORS.find((item) => item.slug === actor.slug) as HallDeptDoor
              const walking = actor.id === walker?.id && !!route
              const spot = walking && route ? polylinePoint(route, progress) : { x: actor.x, y: actor.y }
              const at = place({ x: spot.x, y: spot.y - 18 }, fit)
              const room = rooms.find((item) => item.slug === actor.slug)
              const preview = hallDeptExpertPreviews(door).find((item) => item.id === actor.id)
              const label = shortName(actor.id, preview?.name ?? actor.slug)
              const toLeft = room?.doorSide === 'e'
              const line = CHATTER[actor.slug]?.[chatterTick % (CHATTER[actor.slug]?.length ?? 1)] ?? ''
              return (
                <Link
                  key={actor.id}
                  to={hallDeptHref(caseId, door)}
                  className="focus-ring absolute z-[5] -translate-x-1/2 -translate-y-full whitespace-nowrap rounded-sm border border-[#2a2118] bg-[#fff8e8] px-1 text-[10px] font-semibold leading-4 text-[#2a2118]"
                  style={{ left: at.left, top: at.top }}
                  aria-label={`${label}，${door.label}`}
                  title={preview?.name ?? label}
                  data-testid={walking ? 'hall-live-token' : undefined}
                  data-from={walking ? play?.fromSlug : undefined}
                  data-to={walking ? play?.toSlug : undefined}
                >
                  {label}
                  {actor.lead && !walking && talking.has(actor.slug) && line ? (
                    <span
                      className={`pointer-events-none absolute top-0 z-[6] w-max max-w-[7.5rem] -translate-y-full rounded-sm border border-[#2a2118] bg-[#fff8e8] px-1.5 py-0.5 text-[11px] font-medium leading-4 text-[#2a2118] ${
                        toLeft ? 'right-full mr-1' : 'left-full ml-1'
                      }`}
                      data-testid={`hall-idle-bubble-${actor.slug}`}
                    >
                      <span
                        className={`absolute bottom-0 h-1.5 w-1.5 translate-y-1/2 rotate-45 border-[#2a2118] bg-[#fff8e8] ${
                          toLeft ? '-right-1 border-b border-r' : '-left-1 border-b border-l'
                        }`}
                      />
                      {line}
                    </span>
                  ) : null}
                </Link>
              )
            })
          : null}
        {ready && walker && route && showPhrase && play ? (
          <div
            className="pointer-events-none absolute z-[6] max-w-[10rem] rounded-sm border border-[#2a2118] bg-[#fff8e8] px-1.5 py-0.5 text-[11px] font-semibold text-[#2a2118]"
            style={{
              left: place(polylinePoint(route, progress), fit).left + 18,
              top: place({ x: 0, y: polylinePoint(route, progress).y - 22 }, fit).top,
              transform: 'translate(0, -100%)',
            }}
            data-testid="hall-handoff-bubble"
            role="status"
          >
            <span className="absolute -left-1 bottom-1 h-1.5 w-1.5 rotate-45 border-b border-l border-[#2a2118] bg-[#fff8e8]" />
            {play.phrase}
          </div>
        ) : null}
        {ready ? (
          <button
            type="button"
            className="focus-ring absolute z-[5] -translate-x-1/2 rounded-sm border border-[#2a2118] bg-[#e7fff8] px-1 text-[10px] font-semibold text-[#146e6a]"
            style={place({ x: RECEPTIONIST.x, y: RECEPTIONIST.y - 18 }, fit)}
            data-testid="hall-reception-room"
            onClick={() => document.getElementById('home-reception-line')?.focus()}
          >
            小林
            <span className="pointer-events-none absolute left-full top-0 ml-1 w-max max-w-[9rem] rounded-sm border border-[#2a2118] bg-white px-1.5 py-0.5 text-[11px] font-medium leading-4 text-[#2a2118]">
              {play ? '案子正在送去下一间。' : greet}
            </span>
            <span className="pointer-events-none absolute bottom-full left-1/2 mb-6 -translate-x-1/2 text-[11px] font-bold tracking-wide text-[#f6ead6]">
              NT
            </span>
          </button>
        ) : null}
        <div className="sr-only" data-testid="home-eight-depts" data-dept-grid="floor">
          八个部门在同一层像素办公室里
        </div>
      </div>
    </section>
  )
}
