/**
 * 大厅平面用应用自己的界面语言：白面板、细边、灰图标、青色点缀。
 * 颜色只取自 src/index.css 的 surface / accent / status。
 */
import type { RoomLiveStatus } from '../../business/roomLiveStatus'
import {
  BUILDING,
  CORRIDOR_BOT,
  CORRIDOR_TOP,
  OFFICE_H,
  OFFICE_W,
  RECEPTION_DESK,
  RECEPTIONIST,
  SOUTH_Y,
  shirtFor,
  type OfficeRoom,
  type Pt,
  polylinePoint,
} from '../../business/officeLayout'

export type OfficeActor = {
  id: string
  slug: string
  x: number
  y: number
  shirt: string
  hair: string
  pants: string
  lead: boolean
  role: 'desk' | 'board' | 'side'
}

type RoomPaint = OfficeRoom & { status: RoomLiveStatus }

const SURFACE = '#ffffff'
const CANVAS = '#f5f5f7'
const BAND = '#f2f2f7'
const LINE = '#e2e8f0'
const INK = '#0f172a'
const MUTED = '#64748b'
const ACCENT = '#007aff'
const ACCENT_SOFT = '#e8f2ff'

const AVATAR = ['#007aff', '#0f172a', '#64748b', '#059669', '#0066d6']

/** 头顶到脚的高度。名牌底边再抬一点。 */
export const PERSON_HAIR = 15
export const PERSON_LABEL_LIFT = 18

function fillFor(id: string): string {
  const shirt = shirtFor(id)
  const known = AVATAR.find((color) => color.toLowerCase() === shirt.toLowerCase())
  if (known) return known
  let h = 0
  for (const ch of id) h = (h * 33 + ch.charCodeAt(0)) >>> 0
  return AVATAR[h % AVATAR.length]!
}

export function AppAvatar({ id, size = 28 }: { id: string; size?: number }) {
  const body = fillFor(id)
  return (
    <svg width={size} height={size} viewBox="0 0 32 32" aria-hidden className="shrink-0">
      <rect width="32" height="32" rx="10" fill="#f8fafc" />
      <rect x="8" y="18" width="16" height="10" rx="5" fill={body} />
      <circle cx="16" cy="13" r="6" fill="#f8fafc" stroke={LINE} strokeWidth="1" />
      <path d="M11 12.5c.4-3 2-4.5 5-4.5s4.6 1.5 5 4.5" fill="#1e293b" />
      <circle cx="14" cy="13.2" r="0.8" fill={INK} />
      <circle cx="18" cy="13.2" r="0.8" fill={INK} />
    </svg>
  )
}

function Person({
  x,
  y,
  id,
  frame,
  walking,
  reduced,
}: {
  x: number
  y: number
  id: string
  frame: number
  walking: boolean
  reduced: boolean
}) {
  const body = fillFor(id)
  const step = walking && !reduced ? (frame % 2 ? 0.8 : -0.8) : 0
  return (
    <g transform={`translate(${x} ${y})`}>
      <ellipse cx="0" cy="0.5" rx="4.2" ry="0.7" fill="#e2e8f0" />
      <g className={reduced || walking ? undefined : 'office-idle'}>
        <rect x={-1.7} y={-6.2 + step} width="1.5" height="6" rx="0.7" fill={MUTED} />
        <rect x={0.3} y={-6.2 - step} width="1.5" height="6" rx="0.7" fill={MUTED} />
        <rect x="-3.2" y="-10.4" width="6.4" height="5.2" rx="2" fill={body} />
        <circle cx="0" cy="-13.2" r="2.7" fill="#f8fafc" stroke={LINE} strokeWidth="0.4" />
        <path d="M-2.2 -14.2c.3-1.6 1.2-2.4 2.2-2.4s1.9.8 2.2 2.4" fill={INK} />
        <circle cx="-0.8" cy="-13.1" r="0.32" fill={INK} />
        <circle cx="0.8" cy="-13.1" r="0.32" fill={INK} />
      </g>
    </g>
  )
}

function Chair({ x, y }: { x: number; y: number }) {
  return <rect x={x - 2.6} y={y - 12} width="5.2" height="4.2" rx="1.2" fill="#e2e8f0" />
}

function Desk({ x, y, glow }: { x: number; y: number; glow: string }) {
  return (
    <g transform={`translate(${x} ${y})`}>
      <rect x="-7.2" y="-7.2" width="14.4" height="8" rx="1.6" fill={SURFACE} stroke={LINE} strokeWidth="0.6" />
      <rect x="-2.4" y="-10.2" width="4.8" height="3.2" rx="0.6" fill={INK} />
      <rect x="-1.8" y="-9.6" width="3.6" height="2" rx="0.3" fill={glow} />
    </g>
  )
}

function icon(room: RoomPaint) {
  const x = room.x
  const y = room.y
  const ink = MUTED
  if (room.slug === 'intake') {
    return (
      <g stroke={ink} fill="none" strokeWidth="0.7">
        <rect x={x + 10} y={y + 16} width="22" height="12" rx="2" fill={ACCENT_SOFT} />
        <rect x={x + 16} y={y + 19} width="10" height="6" rx="1" fill={INK} stroke="none" />
      </g>
    )
  }
  if (room.slug === 'inspire') {
    return (
      <g>
        <rect x={x + 8} y={y + 14} width="28" height="16" rx="2" fill={SURFACE} stroke={LINE} strokeWidth="0.6" />
        {['#007aff', '#64748b', '#059669', '#d97706'].map((color, i) => (
          <rect key={color} x={x + 11 + (i % 2) * 8} y={y + 17 + Math.floor(i / 2) * 6} width="6" height="4" rx="0.8" fill={color} opacity="0.85" />
        ))}
      </g>
    )
  }
  if (room.slug === 'mining') {
    return (
      <g stroke={ink} strokeWidth="0.7" fill="none">
        <rect x={x + 8} y={y + 14} width="16" height="18" rx="1.5" />
        <line x1={x + 10} y1={y + 19} x2={x + 22} y2={y + 19} />
        <line x1={x + 10} y1={y + 23} x2={x + 22} y2={y + 23} />
        <line x1={x + 10} y1={y + 27} x2={x + 22} y2={y + 27} />
      </g>
    )
  }
  if (room.slug === 'disclosure') {
    return <rect x={x + 28} y={y + 16} width="22" height="8" rx="2" fill={SURFACE} stroke={LINE} strokeWidth="0.6" />
  }
  if (room.slug === 'draft') {
    return (
      <g>
        <rect x={x + 8} y={y + 14} width="10" height="13" rx="1" fill={SURFACE} stroke={LINE} strokeWidth="0.5" />
        <line x1={x + 10} y1={y + 18} x2={x + 16} y2={y + 18} stroke={LINE} strokeWidth="0.5" />
        <line x1={x + 10} y1={y + 21} x2={x + 15} y2={y + 21} stroke={LINE} strokeWidth="0.5" />
        <rect x={x + 62} y={y + 28} width="14" height="9" rx="1.4" fill={SURFACE} stroke={LINE} strokeWidth="0.6" />
        <rect x={x + 64} y={y + 26} width="8" height="3" rx="0.4" fill={SURFACE} stroke={LINE} strokeWidth="0.4" />
        <circle cx={x + 72} cy={y + 33} r="1" fill={ACCENT} />
      </g>
    )
  }
  if (room.slug === 'oa') {
    return (
      <g>
        <rect x={x + 8} y={y + 18} width="16" height="11" rx="1.2" fill={SURFACE} stroke={LINE} strokeWidth="0.6" />
        <circle cx={x + 18} cy={y + 23} r="1.6" fill="#e11d48" />
      </g>
    )
  }
  if (room.slug === 'annuity') {
    return (
      <g>
        <rect x={x + 34} y={y + 14} width="28" height="16" rx="2" fill={SURFACE} stroke={LINE} strokeWidth="0.6" />
        {Array.from({ length: 12 }, (_, i) => (
          <rect
            key={i}
            x={x + 37 + (i % 6) * 4}
            y={y + 20 + Math.floor(i / 6) * 4}
            width="2.4"
            height="2.4"
            rx="0.4"
            fill={i === 2 || i === 9 ? ACCENT : '#e2e8f0'}
          />
        ))}
      </g>
    )
  }
  return (
    <g>
      <rect x={x + 8} y={y + 16} width="26" height="14" rx="2" fill={SURFACE} stroke={LINE} strokeWidth="0.6" />
      {[10, 6, 13, 8].map((h, i) => (
        <rect key={h} x={x + 11 + i * 5.5} y={y + 27 - h} width="3.5" height={h} rx="0.6" fill={i % 2 ? ACCENT : MUTED} />
      ))}
    </g>
  )
}

export function OfficeScene({
  rooms,
  actors,
  frame,
  path,
  progress,
  fromSlug,
  toSlug,
  walkerId,
  reduced,
}: {
  rooms: RoomPaint[]
  actors: OfficeActor[]
  frame: number
  path: Pt[] | null
  progress: number
  fromSlug?: string
  toSlug?: string
  walkerId?: string
  reduced: boolean
}) {
  const walker = actors.find((actor) => actor.id === walkerId)
  const along = walker && path ? polylinePoint(path, progress) : null
  const glowFor = (slug: string) => (rooms.find((room) => room.slug === slug)?.status === '进行中' ? ACCENT : '#cbd5e1')
  return (
    <>
      <style>
        {reduced
          ? ''
          : `@keyframes office-idle { 0%, 100% { transform: translateY(0); } 50% { transform: translateY(-0.4px); } }
            .office-idle { animation: office-idle 2.8s ease-in-out infinite; transform-box: fill-box; transform-origin: center bottom; }
            @media (prefers-reduced-motion: reduce) { .office-idle { animation: none; } }`}
      </style>
      <rect width={OFFICE_W} height={OFFICE_H} rx="8" fill={CANVAS} />
      <rect x={BUILDING.x} y={BUILDING.y} width={BUILDING.w} height={BUILDING.h} rx="6" fill={BAND} />
      <rect x={CORRIDOR_TOP} y={4} width={CORRIDOR_BOT - CORRIDOR_TOP} height={SOUTH_Y - 4} fill="#eef0f3" />
      {rooms.map((room) => (
        <g key={room.slug}>
          <rect
            x={room.x + 1.5}
            y={room.y + 1.5}
            width={room.w - 3}
            height={room.h - 3}
            rx="3"
            fill={room.status === '进行中' ? '#f5f9ff' : SURFACE}
            stroke={room.slug === fromSlug || room.slug === toSlug ? ACCENT : LINE}
            strokeWidth={room.slug === fromSlug || room.slug === toSlug ? 1 : 0.6}
          />
          {icon(room)}
        </g>
      ))}
      <rect x={RECEPTION_DESK.x} y={RECEPTION_DESK.y} width={RECEPTION_DESK.w} height={RECEPTION_DESK.h} rx="2" fill={SURFACE} stroke={LINE} strokeWidth="0.6" />
      <rect x={18} y={252} width="26" height="10" rx="2" fill={SURFACE} stroke={LINE} strokeWidth="0.5" />
      {path && path.length > 1 ? (
        <polyline
          points={path.map((pt) => `${pt.x},${pt.y}`).join(' ')}
          fill="none"
          stroke={ACCENT}
          strokeWidth="1.1"
          strokeDasharray="2 2"
          strokeLinecap="round"
        />
      ) : null}
      {actors
        .filter((actor) => actor.id !== walkerId && actor.role === 'desk' && actor.slug !== 'inspire')
        .map((actor) => (
          <Chair key={`chair-${actor.id}`} x={actor.x} y={actor.y} />
        ))}
      {actors
        .filter((actor) => actor.id !== walkerId)
        .map((actor) => (
          <Person key={actor.id} x={actor.x} y={actor.y} id={actor.id} frame={frame} walking={false} reduced={reduced} />
        ))}
      {actors
        .filter((actor) => actor.id !== walkerId && actor.role === 'desk' && actor.slug !== 'inspire')
        .map((actor) =>
          actor.slug === 'intake' || actor.slug === 'disclosure' ? (
            <rect key={`table-${actor.id}`} x={actor.x - 8} y={actor.y - 6} width="16" height="7" rx="1.6" fill={SURFACE} stroke={LINE} strokeWidth="0.6" />
          ) : (
            <Desk key={`desk-${actor.id}`} x={actor.x} y={actor.y} glow={glowFor(actor.slug)} />
          ),
        )}
      <Person x={RECEPTIONIST.x} y={RECEPTIONIST.y} id="reception" frame={frame} walking={false} reduced={reduced} />
      {walker && along ? (
        <g>
          <rect x={along.x + 4} y={along.y - 11} width="5" height="4" rx="0.6" fill={ACCENT_SOFT} stroke={ACCENT} strokeWidth="0.4" />
          <Person x={along.x} y={along.y} id={walker.id} frame={frame} walking reduced={reduced} />
        </g>
      ) : null}
      {rooms.map((room) => (
        <rect
          key={`door-${room.slug}`}
          x={room.door.x - 1.5}
          y={room.door.y - 3.5}
          width="3"
          height="7"
          rx="0.8"
          fill={room.slug === fromSlug ? '#d97706' : room.slug === toSlug ? ACCENT : '#cbd5e1'}
        />
      ))}
    </>
  )
}
