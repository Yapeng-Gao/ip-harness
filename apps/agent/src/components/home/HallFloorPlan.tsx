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
  hairFor,
  handoffWaypoints,
  officeRooms,
  pantsFor,
  polylinePoint,
  roomBySlug,
  shirtFor,
  type OfficeRoom,
  type Pt,
} from '../../business/officeLayout'
import { OfficeScene, PERSON_HAIR, PERSON_LABEL_LIFT, roomIconBox, type OfficeActor } from './officeIllustration'

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

function useCanvasFit(canvasRef: RefObject<SVGSVGElement | null>): Fit {
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

const BUBBLE_CHARS = 12

function wrapCn(text: string, size = BUBBLE_CHARS): string[] {
  const lines: string[] = []
  for (let i = 0; i < text.length; i += size) lines.push(text.slice(i, i + size))
  return lines.length > 0 ? lines : ['']
}

function bubbleBox(lines: string[]) {
  const chars = Math.max(1, ...lines.map((line) => line.length))
  return { w: chars * 12 + 16, h: lines.length * 16 + 10 }
}

type CssBox = { left: number; top: number; w: number; h: number }

function hit(a: CssBox, b: CssBox) {
  return a.left < b.left + b.w + 3 && a.left + a.w + 3 > b.left && a.top < b.top + b.h + 2 && a.top + a.h + 2 > b.top
}

function clampBox(box: CssBox, bounds: CssBox): CssBox {
  return {
    ...box,
    left: Math.max(bounds.left, Math.min(box.left, bounds.left + bounds.w - box.w)),
    top: Math.max(bounds.top, Math.min(box.top, bounds.top + bounds.h - box.h)),
  }
}

function findClear(seed: CssBox, blockers: CssBox[], bounds: CssBox): CssBox | null {
  const blocked = (item: CssBox) => blockers.some((other) => hit(item, other))
  const fits = (item: CssBox) =>
    item.left >= bounds.left - 0.5 &&
    item.top >= bounds.top - 0.5 &&
    item.left + item.w <= bounds.left + bounds.w + 0.5 &&
    item.top + item.h <= bounds.top + bounds.h + 0.5
  const shifts: Array<[number, number]> = [[0, 0]]
  for (const dy of [0, -14, 14, -28, 28, -42]) {
    for (const dx of [0, -18, 18, -36, 36, -54, 54, -72]) shifts.push([dx, dy])
  }
  for (const [dx, dy] of shifts) {
    const next = { ...seed, left: seed.left + dx, top: seed.top + dy }
    if (!blocked(next) && fits(next)) return next
  }
  return null
}

function tagBox(centerBottom: { left: number; top: number }, label: string): CssBox {
  const w = Math.max(26, label.length * 10 + 8)
  const h = 14
  return { left: centerBottom.left - w / 2, top: centerBottom.top - h, w, h }
}

/** 气泡贴在名牌一侧；贴边时换到另一侧，并躲开名牌和徽章。 */
function placeBesideHead(
  name: CssBox,
  lines: string[],
  preferLeft: boolean,
  fit: Fit,
  blockers: CssBox[],
) {
  const box = bubbleBox(lines)
  const margin = 6
  const bounds = { left: fit.x + margin, top: fit.y + margin, w: fit.w - margin * 2, h: fit.h - margin * 2 }
  const left = { left: name.left - box.w - 6, top: name.top - 2, w: box.w, h: box.h }
  const right = { left: name.left + name.w + 6, top: name.top - 2, w: box.w, h: box.h }
  const above = { left: name.left + name.w / 2 - box.w / 2, top: name.top - box.h - 4, w: box.w, h: box.h }
  const candidates = preferLeft ? [left, right, above] : [right, left, above]
  for (const candidate of candidates) {
    const cleared = findClear(candidate, [...blockers, name], bounds)
    if (cleared && !hit(cleared, name)) {
      return { ...cleared, tail: cleared.left + cleared.w / 2 <= name.left + name.w / 2 ? 'right' : 'left' }
    }
  }
  return null
}

function placeHandoffBubble(
  head: { left: number; top: number },
  lines: string[],
  fit: Fit,
  blockers: CssBox[],
) {
  const box = bubbleBox(lines)
  const gap = 6
  const margin = 6
  const candidates = [
    { left: head.left - box.w - gap, top: head.top - box.h },
    { left: head.left - box.w / 2, top: head.top - box.h - 16 },
    { left: head.left + 28, top: head.top - box.h },
  ]
  const bounds = { left: fit.x + margin, top: fit.y + margin, w: fit.w - margin * 2, h: fit.h - margin * 2 }
  for (const candidate of candidates) {
    const clamped = clampBox({ ...candidate, w: box.w, h: box.h }, bounds)
    if (!blockers.some((item) => hit(clamped, item))) {
      return { ...clamped, tailRight: clamped.left + clamped.w / 2 <= head.left }
    }
  }
  const fallback = clampBox({ ...candidates[0]!, w: box.w, h: box.h }, bounds)
  return { ...fallback, tailRight: fallback.left + fallback.w / 2 <= head.left }
}

function shortName(id: string, fallback: string): string {
  const name = businessSeatPersonaName(id) ?? fallback
  return name.length > 4 ? name.slice(0, 4) : name
}

function actorsFor(room: OfficeRoom): OfficeActor[] {
  const door = HALL_DEPT_DOORS.find((item) => item.slug === room.slug)
  if (!door) return []
  const previews = hallDeptExpertPreviews(door).slice(0, room.thin ? 1 : 3)
  const roles: OfficeActor['role'][] =
    room.slug === 'inspire'
      ? ['board', 'board', 'side']
      : room.slug === 'disclosure'
        ? ['desk', 'board', 'side']
        : ['desk', 'board', 'side']
  const foot = room.y
  const spots =
    previews.length === 1
      ? [
          {
            x: room.slug === 'annuity' ? room.x + 26 : room.slug === 'inspire' ? room.x + room.w - 22 : room.doorSide === 'e' ? room.x + 50 : room.x + room.w - 32,
            y: foot + 52,
          },
        ]
      : room.doorSide === 'e'
        ? [
            { x: room.x + 26, y: foot + 56 },
            { x: room.x + 54, y: foot + 47 },
            { x: room.x + 38, y: foot + 51 },
          ].slice(0, previews.length)
        : [
            { x: room.x + room.w - 32, y: foot + 56 },
            { x: room.x + 32, y: foot + 47 },
            { x: room.x + 48, y: foot + 51 },
          ].slice(0, previews.length)
  return previews.map((preview, index) => ({
    id: preview.id,
    slug: room.slug,
    x: spots[index]?.x ?? spots[0]!.x,
    y: spots[index]?.y ?? spots[0]!.y,
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
  const sceneRef = useRef<SVGSVGElement>(null)
  const fit = useCanvasFit(sceneRef)
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

  const ready = fit.w > 8
  const nameAnchors = new Map<string, { left: number; top: number; box: CssBox }>()
  const fixedBlocks: CssBox[] = []
  if (ready) {
    const bounds = { left: fit.x + 4, top: fit.y + 4, w: fit.w - 8, h: fit.h - 8 }
    for (const room of rooms) {
      const signAt = place({ x: room.x + 6, y: room.y + 4 }, fit)
      const signText = SIGN[room.slug] ?? room.label
      const signW = signText.length * 13 + 12
      fixedBlocks.push({ left: signAt.left, top: signAt.top, w: signW, h: 20 })
      const badgeAt = place({ x: room.x + room.w - 5, y: room.y + 4 }, fit)
      const status = statusBySlug[room.slug] ?? '待机'
      const badgeW = status.length * 11 + 14
      fixedBlocks.push({ left: badgeAt.left - badgeW, top: badgeAt.top, w: badgeW, h: 18 })
      const prop = roomIconBox(room)
      const propOrigin = place({ x: prop.x, y: prop.y }, fit)
      const propFar = place({ x: prop.x + prop.w, y: prop.y + prop.h }, fit)
      fixedBlocks.push({ left: propOrigin.left, top: propOrigin.top, w: propFar.left - propOrigin.left, h: propFar.top - propOrigin.top })
    }
    const taken = [...fixedBlocks]
    for (const actor of [...cast].sort((a, b) => b.x - a.x)) {
      const walking = actor.id === walker?.id && !!route
      const spot = walking && route ? polylinePoint(route, progress) : { x: actor.x, y: actor.y }
      const door = HALL_DEPT_DOORS.find((item) => item.slug === actor.slug) as HallDeptDoor
      const preview = hallDeptExpertPreviews(door).find((item) => item.id === actor.id)
      const label = shortName(actor.id, preview?.name ?? actor.slug)
      const anchor = place({ x: spot.x, y: spot.y - PERSON_LABEL_LIFT }, fit)
      const box = findClear(tagBox(anchor, label), taken, bounds) ?? tagBox(anchor, label)
      taken.push(box)
      nameAnchors.set(actor.id, { left: box.left + box.w / 2, top: box.top + box.h, box })
    }
    for (const actor of cast) {
      const walking = actor.id === walker?.id && !!route
      const spot = walking && route ? polylinePoint(route, progress) : { x: actor.x, y: actor.y }
      const topLeft = place({ x: spot.x - 6, y: spot.y - PERSON_HAIR - 1 }, fit)
      const botRight = place({ x: spot.x + 6, y: spot.y + 1 }, fit)
      fixedBlocks.push({
        left: topLeft.left,
        top: topLeft.top,
        w: botRight.left - topLeft.left,
        h: botRight.top - topLeft.top,
      })
    }
  }

  return (
    <section
      className="relative flex h-full min-h-0 flex-col overflow-hidden rounded-[var(--radius-xl)] border border-slate-200 bg-[#f5f5f7] shadow-[var(--shadow-rest)]"
      data-testid="hall-floor-plan"
      aria-labelledby="home-eight-depts-title"
    >
      <h2 id="home-eight-depts-title" className="sr-only">
        公司楼层
      </h2>
      <div className="relative min-h-0 flex-1">
        <svg
          ref={sceneRef}
          viewBox={`0 0 ${OFFICE_W} ${OFFICE_H}`}
          preserveAspectRatio="xMidYMid meet"
          className="h-full w-full"
          role="img"
          aria-label="专利公司办公室"
        >
          <OfficeScene
            rooms={rooms.map((room) => ({ ...room, status: statusBySlug[room.slug] ?? '待机' }))}
            actors={cast}
            frame={reduced || aborted ? 0 : frame}
            path={route}
            progress={progress}
            fromSlug={play?.fromSlug}
            toSlug={play?.toSlug}
            walkerId={walker?.id}
            reduced={reduced || aborted}
          />
        </svg>
        {ready
          ? rooms.map((room) => {
              const door = HALL_DEPT_DOORS.find((item) => item.slug === room.slug) as HallDeptDoor
              const origin = place({ x: room.x, y: room.y }, fit)
              const far = place({ x: room.x + room.w, y: room.y + room.h }, fit)
              const status = statusBySlug[room.slug] ?? '待机'
              const sign = place({ x: room.x + 6, y: room.y + 4 }, fit)
              const badge = place({ x: room.x + room.w - 5, y: room.y + 4 }, fit)
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
                    className="pointer-events-none absolute z-[4] whitespace-nowrap rounded-md border border-slate-200 bg-white px-1.5 text-[12px] font-semibold leading-5 text-slate-900 shadow-[var(--shadow-rest)]"
                    style={{ left: sign.left, top: sign.top }}
                  >
                    {SIGN[room.slug] ?? room.label}
                  </span>
                  <span
                    className={`pointer-events-none absolute z-[4] -translate-x-full whitespace-nowrap rounded-full border px-1.5 text-[11px] font-medium leading-4 ${
                      status === '待确认'
                        ? 'border-[#fde68a] bg-[#fffbeb] text-[#d97706]'
                        : status === '进行中'
                          ? 'border-[#bfdbfe] bg-[#e8f2ff] text-[#007aff]'
                          : 'border-slate-200 bg-white text-slate-500'
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
              const placed = nameAnchors.get(actor.id)
              const at = placed ?? place({ x: spot.x, y: spot.y - PERSON_LABEL_LIFT }, fit)
              const room = rooms.find((item) => item.slug === actor.slug)
              const preview = hallDeptExpertPreviews(door).find((item) => item.id === actor.id)
              const label = shortName(actor.id, preview?.name ?? actor.slug)
              const preferLeft = room?.doorSide === 'e'
              const line = CHATTER[actor.slug]?.[chatterTick % (CHATTER[actor.slug]?.length ?? 1)] ?? ''
              const idle =
                actor.lead && !walking && talking.has(actor.slug) && line && placed
                  ? placeBesideHead(
                      placed.box,
                      wrapCn(line),
                      preferLeft,
                      fit,
                      [...fixedBlocks, ...[...nameAnchors.values()].map((item) => item.box)],
                    )
                  : null
              return (
                <span key={actor.id}>
                  <Link
                    to={hallDeptHref(caseId, door)}
                    className="focus-ring absolute z-[5] -translate-x-1/2 -translate-y-full whitespace-nowrap rounded-full border border-slate-200 bg-white px-1 py-px text-[10px] font-medium leading-none text-slate-700 shadow-[var(--shadow-rest)]"
                    style={{ left: at.left, top: at.top }}
                    aria-label={`${label}，${door.label}`}
                    title={preview?.name ?? label}
                    data-testid={walking ? 'hall-live-token' : undefined}
                    data-from={walking ? play?.fromSlug : undefined}
                    data-to={walking ? play?.toSlug : undefined}
                  >
                    {label}
                  </Link>
                  {idle ? (
                    <span
                      className="pointer-events-none absolute z-[6] rounded-lg border border-slate-200 bg-white px-1.5 py-0.5 text-[11px] font-medium leading-4 text-slate-800 shadow-[var(--shadow-elevated)]"
                      style={{ left: idle.left, top: idle.top, width: idle.w }}
                      data-testid={`hall-idle-bubble-${actor.slug}`}
                      data-side={idle.tail === 'left' ? 'right' : 'left'}
                    >
                      <span
                        className={`absolute top-1/2 h-1.5 w-1.5 -translate-y-1/2 rotate-45 border-slate-200 bg-white ${
                          idle.tail === 'right' ? '-right-1 border-b border-r' : '-left-1 border-b border-l'
                        }`}
                      />
                      {wrapCn(line).map((part) => (
                        <span key={part} className="block">
                          {part}
                        </span>
                      ))}
                    </span>
                  ) : null}
                </span>
              )
            })
          : null}
        {ready && walker && route && showPhrase && play
          ? (() => {
              const along = polylinePoint(route, progress)
              const walkerTag = walker ? nameAnchors.get(walker.id) : undefined
              const head = walkerTag ?? place({ x: along.x, y: along.y - PERSON_LABEL_LIFT }, fit)
              const lines = wrapCn(play.phrase)
              const bubble = placeHandoffBubble(head, lines, fit, [
                ...fixedBlocks,
                ...[...nameAnchors.values()].map((item) => item.box),
              ])
              return (
                <div
                  className="pointer-events-none absolute z-[6] rounded-lg border border-slate-200 bg-white px-1.5 py-0.5 text-[11px] font-semibold leading-4 text-slate-800 shadow-[var(--shadow-elevated)]"
                  style={{ left: bubble.left, top: bubble.top, width: bubble.w }}
                  data-testid="hall-handoff-bubble"
                  role="status"
                >
                  <span
                    className={`absolute top-1/2 h-1.5 w-1.5 -translate-y-1/2 rotate-45 border-slate-200 bg-white ${
                      bubble.tailRight ? '-right-1 border-b border-r' : '-left-1 border-b border-l'
                    }`}
                  />
                  {lines.map((part) => (
                    <span key={part} className="block">
                      {part}
                    </span>
                  ))}
                </div>
              )
            })()
          : null}
        <div className="sr-only" data-testid="home-eight-depts" data-dept-grid="floor">
          八个部门在同一层办公室里
        </div>
      </div>
    </section>
  )
}
