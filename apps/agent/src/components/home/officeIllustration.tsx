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
  RECEPTIONIST,
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

const SURFACE = '#ffffff'
const CANVAS = '#f5f5f7'
const BAND = '#f2f2f7'
const INK = '#0f172a'
const MUTED = '#64748b'
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

function Chair({ x, y }: { x: number; y: number }) {
  return <rect x={x - 2.6} y={y - 12} width="5.2" height="4.2" rx="1.2" fill="#e2e8f0" />
}

function Desk({ x, y, glow }: { x: number; y: number; glow: string }) {
  return (
    <g transform={`translate(${x} ${y})`}>
      <rect x="-7.5" y="-6.4" width="15" height="7.2" rx="1.6" fill={FILL} stroke={STROKE} strokeWidth="1" />
      <rect x="-2.6" y="-9.2" width="5.2" height="3" rx="0.6" fill={INK} />
      <rect x="-2" y="-8.6" width="4" height="1.8" rx="0.3" fill={glow} />
    </g>
  )
}

function icon(room: RoomPaint) {
  const box = roomIconBox(room)
  const x = box.x
  const y = box.y
  if (room.slug === 'intake') {
    return (
      <g>
        <rect x={x} y={y} width="22" height="12" rx="2" fill={FILL} stroke={STROKE} strokeWidth="1" />
        <rect x={x + 6} y={y + 3} width="10" height="6" rx="1" fill={INK} />
      </g>
    )
  }
  if (room.slug === 'inspire') {
    return (
      <g>
        <rect x={x} y={y} width="24" height="14" rx="2" fill={FILL} stroke={STROKE} strokeWidth="1" />
        {['#007aff', '#64748b', '#0f766e', '#b45309'].map((color, i) => (
          <rect key={color} x={x + 2 + (i % 2) * 11} y={y + 2 + Math.floor(i / 2) * 6} width="9" height="5" rx="1" fill={color} />
        ))}
      </g>
    )
  }
  if (room.slug === 'mining') {
    return (
      <g fill="none" stroke={STROKE} strokeWidth="1">
        <rect x={x} y={y} width="18" height="14" rx="2" fill={FILL} />
        <line x1={x + 3} y1={y + 4} x2={x + 15} y2={y + 4} />
        <line x1={x + 3} y1={y + 7} x2={x + 15} y2={y + 7} />
        <line x1={x + 3} y1={y + 10} x2={x + 15} y2={y + 10} />
      </g>
    )
  }
  if (room.slug === 'disclosure') {
    return <rect x={x} y={y + 2} width="22" height="8" rx="2" fill={FILL} stroke={STROKE} strokeWidth="1" />
  }
  if (room.slug === 'draft') {
    return (
      <g>
        <rect x={x} y={y} width="12" height="14" rx="1.4" fill={FILL} stroke={STROKE} strokeWidth="1" />
        <line x1={x + 2} y1={y + 4} x2={x + 10} y2={y + 4} stroke={STROKE} strokeWidth="1" />
        <line x1={x + 2} y1={y + 7} x2={x + 9} y2={y + 7} stroke={STROKE} strokeWidth="1" />
      </g>
    )
  }
  if (room.slug === 'oa') {
    return (
      <g>
        <rect x={x} y={y} width="18" height="12" rx="1.6" fill={FILL} stroke={STROKE} strokeWidth="1" />
        <circle cx={x + 13} cy={y + 6} r="2" fill="#e11d48" />
      </g>
    )
  }
  if (room.slug === 'annuity') {
    return (
      <g>
        <rect x={x} y={y} width="24" height="14" rx="2" fill={FILL} stroke={STROKE} strokeWidth="1" />
        {Array.from({ length: 8 }, (_, i) => (
          <rect key={i} x={x + 2 + (i % 4) * 5.2} y={y + 3 + Math.floor(i / 4) * 5} width="3.6" height="3.2" rx="0.5" fill={i === 2 || i === 6 ? ACCENT : '#e2e8f0'} />
        ))}
      </g>
    )
  }
  return (
    <g>
      <rect x={x} y={y} width="22" height="14" rx="2" fill={FILL} stroke={STROKE} strokeWidth="1" />
      {[8, 5, 11, 7].map((h, i) => (
        <rect key={h} x={x + 2 + i * 5} y={y + 12 - h} width="3.6" height={h} rx="0.6" fill={i % 2 ? ACCENT : MUTED} />
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
            stroke={room.slug === fromSlug || room.slug === toSlug ? ACCENT : STROKE}
            strokeWidth={room.slug === fromSlug || room.slug === toSlug ? 1 : 0.6}
          />
          {icon(room)}
        </g>
      ))}
      <Person x={RECEPTIONIST.x} y={RECEPTIONIST.y} id="reception" frame={frame} walking={false} reduced={reduced} />
      <rect x={28} y={SOUTH_Y + 22} width="144" height="10" rx="2" fill={FILL} stroke={STROKE} strokeWidth="1" />
      <rect x={36} y={SOUTH_Y + 32} width="14" height="8" rx="2" fill={FILL} stroke={STROKE} strokeWidth="1" />
      <rect x={58} y={SOUTH_Y + 32} width="14" height="8" rx="2" fill={FILL} stroke={STROKE} strokeWidth="1" />
      <g transform={`translate(${160} ${SOUTH_Y + 34})`}>
        <rect x="-2" y="1" width="4" height="3" rx="0.6" fill="#cbd5e1" />
        <circle cx="0" cy="-1" r="3" fill="#059669" />
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
        .filter((actor) => actor.id !== walkerId && actor.role === 'desk' && actor.slug !== 'inspire')
        .map((actor) => (
          <Chair key={`chair-${actor.id}`} x={actor.x} y={actor.y} />
        ))}
      {actors
        .filter((actor) => actor.id !== walkerId)
        .map((actor) => (
          <Person key={actor.id} x={actor.x} y={actor.y} id={actor.id} frame={frame} walking={false} reduced={reduced} seated={actor.role === 'desk' && actor.slug !== 'inspire'} />
        ))}
      {actors
        .filter((actor) => actor.id !== walkerId && actor.role === 'desk' && actor.slug !== 'inspire')
        .map((actor) =>
          actor.slug === 'intake' || actor.slug === 'disclosure' ? (
            <rect key={`table-${actor.id}`} x={actor.x - 8} y={actor.y - 5} width="16" height="6" rx="1.6" fill={FILL} stroke={STROKE} strokeWidth="1" />
          ) : (
            <Desk key={`desk-${actor.id}`} x={actor.x} y={actor.y} glow={glowFor(actor.slug)} />
          ),
        )}
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
