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
  SOUTH_Y,
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

const CANVAS = '#f5f5f7'
const INK = '#0f172a'
const ACCENT = '#007aff'
const ACCENT_SOFT = '#e8f2ff'

const STROKE = '#cbd5e1'
const FILL = '#f8fafc'
const BODIES = ['#007aff', '#0f766e', '#64748b', '#4f46e5', '#b45309']

/** 头顶到脚的高度。名牌底边再抬一点。 */
export const PERSON_HAIR = 16
export const PERSON_LABEL_LIFT = 19

function look(id: string) {
  let h = 0
  for (const ch of id) h = (h * 33 + ch.charCodeAt(0)) >>> 0
  return { body: BODIES[h % BODIES.length]!, cut: (h >> 4) % 3 }
}

export function roomIconBox(room: { x: number; y: number; w: number }) {
  return { x: room.x + 8, y: room.y + 18, w: 20, h: 12 }
}

function HairCap({ cut, color }: { cut: number; color: string }) {
  if (cut === 1) return <path d="M-2.6 -13.6c.2-2.2 1.4-3.2 2.8-3.2 1.6 0 2.6 1.2 2.8 2.6-.8.4-2 .2-3.2-.2-1 .6-1.8.8-2.4.8z" fill={color} />
  if (cut === 2) return <ellipse cx="0" cy="-14.6" rx="2.6" ry="1.5" fill={color} />
  return <path d="M-2.8 -13.2c.2-2.4 1.6-3.4 2.8-3.4s2.6 1 2.8 3.4c-.8-.4-1.8-.6-2.8-.6s-2 .2-2.8.6z" fill={color} />
}

export function AppAvatar({ id, size = 28 }: { id: string; size?: number }) {
  const { body, cut } = look(id)
  return (
    <svg width={size} height={size} viewBox="0 0 32 32" aria-hidden className="shrink-0">
      <rect width="32" height="32" rx="10" fill={FILL} />
      <rect x="7" y="16" width="18" height="12" rx="6" fill={body} />
      <circle cx="16" cy="13" r="6.5" fill="#f8fafc" stroke={STROKE} strokeWidth="1" />
      {cut === 1 ? (
        <path d="M10.5 13c.4-4 2.4-6 5.8-6 3.6 0 5.2 2.2 5.4 5.2" fill="#1e293b" />
      ) : cut === 2 ? (
        <ellipse cx="16" cy="9.5" rx="5" ry="3" fill="#334155" />
      ) : (
        <path d="M11 12.2c.5-3.4 2.2-5 5-5s4.5 1.6 5 5" fill="#0f172a" />
      )}
      <circle cx="13.8" cy="13.4" r="0.85" fill={INK} />
      <circle cx="18.2" cy="13.4" r="0.85" fill={INK} />
      <path d="M14.4 16.1q1.6 1 3.2 0" stroke="#94a3b8" strokeWidth="0.7" fill="none" strokeLinecap="round" />
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
  seated,
}: {
  x: number
  y: number
  id: string
  frame: number
  walking: boolean
  reduced: boolean
  seated?: boolean
}) {
  const { body, cut } = look(id)
  const step = walking && !reduced ? (frame % 2 ? 0.6 : -0.6) : 0
  return (
    <g transform={`translate(${x} ${y})`}>
      <ellipse cx="0" cy="0.4" rx="4.6" ry="0.7" fill="#e2e8f0" />
      <g className={reduced || walking ? undefined : 'office-idle'}>
        {seated ? (
          <rect x="-4" y="-8.2" width="8" height="5.2" rx="2.4" fill={body} />
        ) : (
          <rect x={-4} y={-9.2 + step * 0.2} width="8" height="8.4" rx="3.4" fill={body} />
        )}
        <circle cx="0" cy="-12.4" r="3.4" fill="#f8fafc" stroke={STROKE} strokeWidth="0.45" />
        <HairCap cut={cut} color={cut === 2 ? '#334155' : cut === 1 ? '#1e293b' : '#0f172a'} />
        <circle cx="-1.05" cy="-12.3" r="0.38" fill={INK} />
        <circle cx="1.05" cy="-12.3" r="0.38" fill={INK} />
        <path d="M-1.1 -10.8 Q0 -10.1 1.1 -10.8" stroke="#94a3b8" strokeWidth="0.4" fill="none" strokeLinecap="round" />
      </g>
    </g>
  )
}

const GLASS = new Set(['intake', 'disclosure', 'monetize'])

export function seatPlan(room: OfficeRoom): Pt[] {
  const { x, y, slug } = room
  if (slug === 'intake') return [{ x: x + 42, y: y + 46 }]
  if (slug === 'inspire') return [{ x: x + 24, y: y + 46 }]
  if (slug === 'mining') return [{ x: x + 52, y: y + 46 }]
  if (slug === 'disclosure') {
    return [
      { x: x + 28, y: y + 30 },
      { x: x + 56, y: y + 30 },
      { x: x + 42, y: y + 50 },
    ]
  }
  if (slug === 'draft') {
    return [
      { x: x + 16, y: y + 46 },
      { x: x + 40, y: y + 46 },
      { x: x + 64, y: y + 46 },
    ]
  }
  if (slug === 'oa') {
    return [
      { x: x + 18, y: y + 46 },
      { x: x + 42, y: y + 46 },
      { x: x + 64, y: y + 30 },
    ]
  }
  if (slug === 'annuity') return [{ x: x + 26, y: y + 46 }]
  return [{ x: x + 40, y: y + 46 }]
}

export function furnitureBlocks(room: OfficeRoom): Array<{ x: number; y: number; w: number; h: number }> {
  const { x, y, slug } = room
  if (slug === 'intake') return [{ x: x + 18, y: y + 16, w: 48, h: 28 }]
  if (slug === 'inspire') return [{ x: x + 8, y: y + 16, w: 36, h: 14 }, { x: x + 44, y: y + 36, w: 28, h: 16 }]
  if (slug === 'mining') return [{ x: x + 6, y: y + 16, w: 14, h: 30 }, { x: x + 28, y: y + 36, w: 44, h: 12 }]
  if (slug === 'disclosure') return [{ x: x + 22, y: y + 34, w: 40, h: 14 }]
  if (slug === 'draft') return [{ x: x + 6, y: y + 32, w: 70, h: 18 }, { x: x + 60, y: y + 12, w: 20, h: 16 }]
  if (slug === 'oa') return [{ x: x + 8, y: y + 34, w: 42, h: 14 }, { x: x + 58, y: y + 16, w: 16, h: 18 }]
  if (slug === 'annuity') return [{ x: x + 10, y: y + 34, w: 28, h: 14 }, { x: x + 52, y: y + 16, w: 22, h: 28 }]
  return [{ x: x + 16, y: y + 32, w: 36, h: 16 }, { x: x + 56, y: y + 16, w: 18, h: 12 }]
}

function floor(room: OfficeRoom) {
  const glass = GLASS.has(room.slug)
  return (
    <g>
      <rect x={room.x + 2} y={room.y + 2} width={room.w - 4} height={room.h - 4} fill={glass ? '#f4f8ff' : '#f8fafc'} />
      {Array.from({ length: Math.ceil(room.h / 4) }, (_, i) => (
        <line
          key={i}
          x1={room.x + 3}
          x2={room.x + room.w - 3}
          y1={room.y + 4 + i * 4}
          y2={room.y + 4 + i * 4}
          stroke={glass ? '#e6eef8' : '#eef2f6'}
          strokeWidth="0.8"
        />
      ))}
    </g>
  )
}

function walls(room: OfficeRoom, hot = false) {
  const { x, y, w, h, door, doorSide } = room
  const glass = GLASS.has(room.slug)
  const stroke = hot ? ACCENT : glass ? '#bfdbfe' : '#cbd5e1'
  const width = glass ? 1.4 : 2.2
  const gap = 8
  return (
    <g stroke={stroke} strokeWidth={width} strokeLinecap="square" fill="none">
      <line x1={x} y1={y} x2={x + w} y2={y} />
      <line x1={x} y1={y + h} x2={x + w} y2={y + h} />
      {doorSide === 'e' ? (
        <>
          <line x1={x} y1={y} x2={x} y2={y + h} />
          <line x1={x + w} y1={y} x2={x + w} y2={door.y - gap} />
          <line x1={x + w} y1={door.y + gap} x2={x + w} y2={y + h} />
        </>
      ) : (
        <>
          <line x1={x + w} y1={y} x2={x + w} y2={y + h} />
          <line x1={x} y1={y} x2={x} y2={door.y - gap} />
          <line x1={x} y1={door.y + gap} x2={x} y2={y + h} />
        </>
      )}
    </g>
  )
}

function workstation(px: number, py: number, glow: string) {
  return (
    <g>
      <circle cx={px} cy={py} r="3.4" fill="none" stroke={STROKE} strokeWidth="1" />
      <rect x={px - 8} y={py - 11} width="16" height="7" rx="1.2" fill="#ffffff" stroke={STROKE} strokeWidth="1" />
      <rect x={px - 2.4} y={py - 13.2} width="4.8" height="2.6" rx="0.4" fill={INK} />
      <rect x={px - 1.8} y={py - 12.6} width="3.6" height="1.4" rx="0.2" fill={glow} />
    </g>
  )
}

function furnish(room: OfficeRoom, glow: string) {
  const { x, y, slug } = room
  if (slug === 'intake') {
    return (
      <g>
        <rect x={x + 24} y={y + 14} width="20" height="8" rx="1" fill={INK} />
        <rect x={x + 27} y={y + 16} width="14" height="4" fill={glow} />
        <rect x={x + 22} y={y + 28} width="40" height="14" rx="1.6" fill="#ffffff" stroke={STROKE} strokeWidth="1" />
        {[28, 42, 56].map((cx) => (
          <g key={cx}>
            <circle cx={x + cx} cy={y + 26} r="2.2" fill="none" stroke={STROKE} strokeWidth="0.8" />
            <circle cx={x + cx} cy={y + 44} r="2.2" fill="none" stroke={STROKE} strokeWidth="0.8" />
          </g>
        ))}
      </g>
    )
  }
  if (slug === 'inspire') {
    return (
      <g>
        <rect x={x + 8} y={y + 16} width="32" height="12" rx="1.2" fill="#ffffff" stroke={STROKE} strokeWidth="1" />
        {['#007aff', '#64748b', '#0f766e', '#b45309'].map((color, i) => (
          <rect key={color} x={x + 11 + (i % 4) * 7} y={y + 19} width="5" height="6" rx="0.6" fill={color} />
        ))}
        <ellipse cx={x + 56} cy={y + 40} rx="10" ry="7" fill="#ffffff" stroke={STROKE} strokeWidth="1" />
        <rect x={x + 40} y={y + 48} width="28" height="6" rx="2" fill="#e2e8f0" stroke={STROKE} strokeWidth="0.8" />
      </g>
    )
  }
  if (slug === 'mining') {
    return (
      <g>
        <rect x={x + 6} y={y + 16} width="12" height="32" rx="1" fill="#ffffff" stroke={STROKE} strokeWidth="1" />
        {[0, 1, 2, 3].map((i) => (
          <line key={i} x1={x + 8} x2={x + 16} y1={y + 22 + i * 6} y2={y + 22 + i * 6} stroke="#94a3b8" strokeWidth="0.8" />
        ))}
        <rect x={x + 28} y={y + 36} width="16" height="8" rx="1" fill="#ffffff" stroke={STROKE} strokeWidth="1" />
        <rect x={x + 50} y={y + 36} width="16" height="8" rx="1" fill="#ffffff" stroke={STROKE} strokeWidth="1" />
      </g>
    )
  }
  if (slug === 'disclosure') {
    return (
      <g>
        <rect x={x + 22} y={y + 34} width="40" height="12" rx="1.4" fill="#ffffff" stroke={STROKE} strokeWidth="1" />
        {[28, 56].map((cx) => (
          <g key={cx}>
            <circle cx={x + cx} cy={y + 30} r="2.4" fill="none" stroke={STROKE} strokeWidth="0.8" />
            <circle cx={x + cx} cy={y + 50} r="2.4" fill="none" stroke={STROKE} strokeWidth="0.8" />
          </g>
        ))}
      </g>
    )
  }
  if (slug === 'draft') {
    return (
      <g>
        {seatPlan(room).map((seat) => (
          <g key={`${seat.x}-${seat.y}`}>{workstation(seat.x, seat.y, glow)}</g>
        ))}
        <rect x={x + 64} y={y + 16} width="14" height="10" rx="1.2" fill="#ffffff" stroke={STROKE} strokeWidth="1" />
        <rect x={x + 66} y={y + 14} width="8" height="3" rx="0.4" fill="#ffffff" stroke={STROKE} strokeWidth="0.8" />
        <circle cx={x + 74} cy={y + 22} r="1.1" fill={ACCENT} />
      </g>
    )
  }
  if (slug === 'oa') {
    return (
      <g>
        {seatPlan(room).slice(0, 2).map((seat) => (
          <g key={`${seat.x}-${seat.y}`}>{workstation(seat.x, seat.y, glow)}</g>
        ))}
        <rect x={x + 56} y={y + 16} width="18" height="16" rx="1.2" fill="#ffffff" stroke={STROKE} strokeWidth="1" />
        {[0, 1, 2].map((i) => (
          <line key={i} x1={x + 59} x2={x + 71} y1={y + 20 + i * 4} y2={y + 20 + i * 4} stroke="#94a3b8" strokeWidth="0.7" />
        ))}
      </g>
    )
  }
  if (slug === 'annuity') {
    return (
      <g>
        {workstation(x + 26, y + 46, glow)}
        <rect x={x + 52} y={y + 18} width="14" height="22" rx="1" fill="#ffffff" stroke={STROKE} strokeWidth="1" />
        <rect x={x + 68} y={y + 24} width="10" height="16" rx="1" fill="#ffffff" stroke={STROKE} strokeWidth="1" />
        <rect x={x + 8} y={y + 16} width="18" height="12" rx="1" fill="#ffffff" stroke={STROKE} strokeWidth="1" />
        <rect x={x + 11} y={y + 20} width="3" height="3" rx="0.4" fill={ACCENT} />
      </g>
    )
  }
  return (
    <g>
      <rect x={x + 54} y={y + 16} width="20" height="12" rx="1" fill={INK} />
      <rect x={x + 57} y={y + 18} width="14" height="8" fill={glow} />
      {[8, 5, 11, 7].map((h, i) => (
        <rect key={h} x={x + 57 + i * 3.2} y={y + 24 - h * 0.4} width="2.2" height={h * 0.45} fill={i % 2 ? ACCENT : '#94a3b8'} />
      ))}
      <rect x={x + 18} y={y + 34} width="28" height="12" rx="1.4" fill="#ffffff" stroke={STROKE} strokeWidth="1" />
      <circle cx={x + 40} cy={y + 46} r="2.6" fill="none" stroke={STROKE} strokeWidth="0.8" />
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
  const toRoom = rooms.find((room) => room.slug === toSlug)
  const residents = actors.filter((actor) => actor.id !== walkerId && actor.slug === toSlug)
  let pose = along
  if (along && path && toRoom && progress > 0.86) {
    const free = [
      { x: toRoom.x + 20, y: toRoom.y + 22 },
      { x: toRoom.x + toRoom.w - 18, y: toRoom.y + 22 },
      { x: toRoom.x + toRoom.w / 2, y: toRoom.y + 22 },
    ].find((slot) => residents.every((actor) => Math.hypot(actor.x - slot.x, actor.y - slot.y) > 22))
    if (free) {
      const door = path[path.length - 1]!
      const u = Math.min(1, (progress - 0.86) / 0.14)
      pose = { x: door.x + (free.x - door.x) * u, y: door.y + (free.y - door.y) * u }
    }
  }
  const glowFor = (slug: string) => (rooms.find((room) => room.slug === slug)?.status === '进行中' ? ACCENT : '#93c5fd')
  return (
    <>
      <style>
        {reduced
          ? ''
          : `@keyframes office-idle { 0%, 100% { transform: translateY(0); } 50% { transform: translateY(-0.45px); } }
            .office-idle { animation: office-idle 2.6s ease-in-out infinite; transform-box: fill-box; transform-origin: center bottom; }
            @media (prefers-reduced-motion: reduce) { .office-idle { animation: none; } }`}
      </style>
      <rect width={OFFICE_W} height={OFFICE_H} rx="8" fill={CANVAS} />
      <rect x={BUILDING.x} y={BUILDING.y} width={BUILDING.w} height={BUILDING.h} rx="4" fill="#eef0f3" />
      {Array.from({ length: 18 }, (_, i) => (
        <rect key={i} x={CORRIDOR_TOP + 2} y={8 + i * 14} width={CORRIDOR_BOT - CORRIDOR_TOP - 4} height="12" rx="0.4" fill={i % 2 ? '#f8fafc' : '#f1f5f9'} />
      ))}
      {rooms.map((room) => (
        <g key={room.slug}>
          {floor(room)}
          {furnish(room, glowFor(room.slug))}
          {walls(room, room.slug === fromSlug || room.slug === toSlug)}
        </g>
      ))}
      <g>
        <rect x={8} y={SOUTH_Y + 6} width="70" height="28" rx="2" fill="#f8fafc" stroke={STROKE} strokeWidth="1" />
        <rect x={8} y={SOUTH_Y + 16} width="8" height="10" fill="#eef0f3" />
        <rect x={130} y={SOUTH_Y + 8} width="36" height="10" rx="1.2" fill="#ffffff" stroke={STROKE} strokeWidth="1" />
        <rect x={136} y={SOUTH_Y + 10} width="6" height="5" rx="0.6" fill={INK} />
        <circle cx={148} cy={SOUTH_Y + 12} r="1.2" fill={ACCENT} />
        <circle cx={140} cy={SOUTH_Y + 24} r="2.2" fill="none" stroke={STROKE} strokeWidth="0.8" />
        <circle cx={154} cy={SOUTH_Y + 24} r="2.2" fill="none" stroke={STROKE} strokeWidth="0.8" />
        <g transform={`translate(${176} ${SOUTH_Y + 22})`}>
          <rect x="-1.6" y="1" width="3.2" height="3" rx="0.4" fill="#cbd5e1" />
          <circle cx="0" cy="-1.2" r="2.6" fill="#059669" />
        </g>
      </g>
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
        .filter((actor) => actor.id !== walkerId)
        .map((actor) => (
          <Person
            key={actor.id}
            x={actor.x}
            y={actor.y}
            id={actor.id}
            frame={frame}
            walking={false}
            reduced={reduced}
            seated={actor.role === 'desk'}
          />
        ))}
      {walker && pose ? (
        <g>
          <rect x={pose.x + 4} y={pose.y - 11} width="5" height="4" rx="0.6" fill={ACCENT_SOFT} stroke={ACCENT} strokeWidth="0.4" />
          <Person x={pose.x} y={pose.y} id={walker.id} frame={frame} walking reduced={reduced} />
        </g>
      ) : null}
    </>
  )
}
