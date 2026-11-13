/**
 * 大厅扁平插画。房间、家具、人物都是圆角矢量，和前台卡、动态共用同一套暖色。
 */
import type { RoomLiveStatus } from '../../business/roomLiveStatus'
import {
  BUILDING,
  CORRIDOR_TOP,
  CORRIDOR_BOT,
  LANE_X,
  OFFICE_H,
  OFFICE_W,
  RECEPTIONIST,
  RECEPTION_DESK,
  SOUTH_Y,
  cutFor,
  hairFor,
  pantsFor,
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

const PAPER = '#fffaf3'
const WOOD_DARK = '#c4925a'
const TEAL = '#7ec8c3'

const FLOOR: Record<string, string> = {
  intake: '#f6e3c8',
  inspire: '#f4ead8',
  mining: '#f0d8b6',
  disclosure: '#f8e0cc',
  draft: '#f3e4cc',
  oa: '#f6dcc8',
  annuity: '#efe0cc',
  monetize: '#f4e0d4',
}

function dusk(hex: string): string {
  const n = Number.parseInt(hex.slice(1), 16)
  const ch = (shift: number) => Math.max(0, ((n >> shift) & 255) - 18).toString(16).padStart(2, '0')
  return `#${ch(16)}${ch(8)}${ch(0)}`
}

export function FlatBust({ id, size = 28 }: { id: string; size?: number }) {
  const shirt = shirtFor(id)
  const hair = hairFor(id)
  const cut = cutFor(id)
  return (
    <svg width={size} height={size} viewBox="0 0 32 32" aria-hidden className="shrink-0">
      <circle cx="16" cy="16" r="15" fill="#f8efe4" />
      <ellipse cx="16" cy="27" rx="10" ry="7" fill={shirt} />
      <path d="M11 24h10v2.2a5 5 0 0 1-10 0Z" fill="#fff6ea" />
      <circle cx="16" cy="13.5" r="6.2" fill="#f4c7a8" />
      <Hair cx={16} cy={12} cut={cut} color={hair} scale={1.7} />
      <circle cx="13.8" cy="13.6" r="0.85" fill="#3d2b22" />
      <circle cx="18.2" cy="13.6" r="0.85" fill="#3d2b22" />
      <path d="M14.2 16.2q1.8 1.2 3.6 0" stroke="#e09a86" strokeWidth="0.7" fill="none" strokeLinecap="round" />
    </svg>
  )
}

function Hair({ cx, cy, cut, color, scale }: { cx: number; cy: number; cut: 0 | 1 | 2; color: string; scale: number }) {
  if (cut === 1) {
    return (
      <path
        d={`M${cx - 3.2 * scale} ${cy - 0.2 * scale} Q${cx - 1 * scale} ${cy - 3.4 * scale} ${cx + 3 * scale} ${cy - 1.2 * scale} L${cx + 2.2 * scale} ${cy + 1.4 * scale} Q${cx} ${cy + 0.2 * scale} ${cx - 2.8 * scale} ${cy + 1.6 * scale} Z`}
        fill={color}
      />
    )
  }
  if (cut === 2) {
    return <ellipse cx={cx} cy={cy - 1.3 * scale} rx={3.3 * scale} ry={2.3 * scale} fill={color} />
  }
  return (
    <path
      d={`M${cx - 3.3 * scale} ${cy} Q${cx} ${cy - 3.6 * scale} ${cx + 3.3 * scale} ${cy} L${cx + 3 * scale} ${cy + 1.8 * scale} Q${cx} ${cy + 0.4 * scale} ${cx - 3 * scale} ${cy + 1.8 * scale} Z`}
      fill={color}
    />
  )
}

function Person({
  x,
  y,
  shirt,
  hair,
  pants,
  cut,
  frame,
  walking,
  reduced,
}: {
  x: number
  y: number
  shirt: string
  hair: string
  pants: string
  cut: 0 | 1 | 2
  frame: number
  walking: boolean
  reduced: boolean
}) {
  const step = walking && !reduced ? (frame % 2 ? 1.1 : -1.1) : 0
  return (
    <g transform={`translate(${x} ${y})`}>
      <g className={reduced || walking ? undefined : 'office-idle'}>
        <ellipse cx="0" cy="0.4" rx="5.2" ry="1.5" fill="#e2c8a4" />
        <rect x={-3.3} y={-10.5 + step} width="2.5" height="5.2" rx="1.2" fill={pants} />
        <rect x={0.8} y={-10.5 - step} width="2.5" height="5.2" rx="1.2" fill={pants} />
        <rect x="-4.6" y="-16.2" width="9.2" height="7.2" rx="2.6" fill={shirt} />
        <rect x="-2.2" y="-15.6" width="4.4" height="1.5" rx="0.7" fill="#fff6ea" />
        <rect x="-5.4" y="-14.2" width="1.8" height="4.2" rx="0.8" fill="#f4c7a8" />
        <rect x="3.6" y="-14.2" width="1.8" height="4.2" rx="0.8" fill="#f4c7a8" />
        <circle cx="0" cy="-19.2" r="3.7" fill="#f4c7a8" />
        <Hair cx={0} cy={-19.4} cut={cut} color={hair} scale={1} />
        <circle cx="-1.25" cy="-19.3" r="0.48" fill="#3d2b22" />
        <circle cx="1.25" cy="-19.3" r="0.48" fill="#3d2b22" />
        <path d="M-1.1 -17.8 Q0 -17.1 1.1 -17.8" stroke="#e09a86" strokeWidth="0.35" fill="none" strokeLinecap="round" />
      </g>
    </g>
  )
}

function Desk({ x, y, glow }: { x: number; y: number; glow: string }) {
  return (
    <g transform={`translate(${x} ${y})`} filter="url(#office-soft)">
      <rect x="-12" y="-5" width="24" height="7.5" rx="1.8" fill={WOOD_DARK} />
      <rect x="-11" y="-4.4" width="22" height="1.6" rx="0.7" fill="#e7b578" />
      <rect x="-5.2" y="-11.2" width="10.4" height="6.2" rx="1.1" fill="#1d3344" />
      <rect x="-4.2" y="-10.2" width="8.4" height="4.2" rx="0.7" fill={glow} />
      <rect x="-3.2" y="-1.6" width="6.4" height="1.6" rx="0.4" fill="#3d2c22" />
    </g>
  )
}

function WideTable({ x, y }: { x: number; y: number }) {
  return (
    <g transform={`translate(${x} ${y})`} filter="url(#office-soft)">
      <rect x="-14" y="-5" width="28" height="8" rx="2.4" fill={WOOD_DARK} />
      <rect x="-12.5" y="-3.6" width="25" height="5" rx="1.4" fill="#e7b578" />
    </g>
  )
}

function Plant({ x, y }: { x: number; y: number }) {
  return (
    <g transform={`translate(${x} ${y})`}>
      <rect x="-2.2" y="1.2" width="4.4" height="3.2" rx="0.8" fill="#d06a3a" />
      <ellipse cx="-1.6" cy="-0.4" rx="2.2" ry="1.8" fill="#1d6b38" />
      <ellipse cx="1.8" cy="-0.8" rx="2.2" ry="1.8" fill="#2f9d55" />
      <ellipse cx="0" cy="-2" rx="2" ry="2.2" fill="#3cb56a" />
    </g>
  )
}

function Stickies({ x, y }: { x: number; y: number }) {
  const colors = ['#f2c14e', '#e07a5f', '#7dcea0', '#7ec8e3', '#f4a3c8']
  return (
    <g>
      {colors.map((color, i) => {
        const col = i % 3
        const row = Math.floor(i / 3)
        return (
          <rect
            key={color}
            x={x + col * 8}
            y={y + row * 7}
            width="6.4"
            height="5.6"
            rx="0.8"
            fill={color}
            transform={`rotate(${i % 2 ? -4 : 3} ${x + col * 8 + 3} ${y + row * 7 + 2})`}
          />
        )
      })}
    </g>
  )
}

function furnish(room: RoomPaint) {
  const x = room.x
  const y = room.y
  if (room.slug === 'intake') {
    return (
      <g>
        <rect x={x + 22} y={y + 16} width="28" height="12" rx="1.4" fill="#243044" />
        <rect x={x + 25} y={y + 18} width="22" height="7" rx="0.8" fill="#9fd4ea" />
        <ellipse cx={x + 36} cy={y + 34} rx="16" ry="7" fill="#e2b04a" opacity="0.85" />
      </g>
    )
  }
  if (room.slug === 'inspire') {
    return (
      <g>
        <rect x={x + 8} y={y + 13} width="40" height="20" rx="2" fill={PAPER} stroke="#e7d3b8" strokeWidth="0.6" />
        <rect x={x + 8} y={y + 13} width="40" height="2.2" rx="1" fill={WOOD_DARK} />
        <Stickies x={x + 12} y={y + 17} />
        <ellipse cx={x + 16} cy={y + 42} rx="7" ry="4.2" fill="#3d8f6e" />
        <ellipse cx={x + 14} cy={y + 41} rx="2.4" ry="1.2" fill="#8fd0ae" />
        <ellipse cx={x + 32} cy={y + 44} rx="7" ry="4.2" fill="#e07a5f" />
        <ellipse cx={x + 30} cy={y + 43} rx="2.4" ry="1.2" fill="#f4b5a4" />
      </g>
    )
  }
  if (room.slug === 'mining') {
    return (
      <g>
        <rect x={x + 8} y={y + 14} width="10" height="22" rx="1.2" fill="#8d5a3a" />
        <rect x={x + 20} y={y + 14} width="10" height="22" rx="1.2" fill="#a56b42" />
        {['#c4493a', '#2f6f9f', '#e0b04a', '#2f8f4e', '#f4efe4'].map((color, i) => (
          <rect key={color} x={x + 9 + (i % 3) * 3} y={y + 16 + Math.floor(i / 3) * 9} width="2.2" height="7" rx="0.4" fill={color} />
        ))}
        <rect x={x + 34} y={y + 28} width="10" height="7" rx="1" fill="#d7d2cb" />
        <rect x={x + 46} y={y + 26} width="10" height="9" rx="1" fill="#c4b8a8" />
      </g>
    )
  }
  if (room.slug === 'disclosure') {
    return (
      <g>
        <ellipse cx={x + 40} cy={y + 34} rx="16" ry="8" fill="#e09070" opacity="0.8" />
      </g>
    )
  }
  if (room.slug === 'draft') {
    return (
      <g>
        <rect x={x + 46} y={y + 18} width="8" height="10" rx="0.6" fill={PAPER} stroke="#e7d3b8" strokeWidth="0.4" />
        <rect x={x + 48} y={y + 16} width="8" height="10" rx="0.6" fill="#fff" stroke="#eadcc8" strokeWidth="0.4" />
        <rect x={x + 64} y={y + 36} width="12" height="8" rx="1.2" fill="#d7d2cb" />
        <rect x={x + 66} y={y + 33} width="8" height="4" rx="0.6" fill={PAPER} />
        <circle cx={x + 73} cy={y + 41} r="1" fill="#3dcea0" />
      </g>
    )
  }
  if (room.slug === 'oa') {
    return (
      <g>
        <rect x={x + 10} y={y + 16} width="16" height="11" rx="1" fill={PAPER} stroke="#eadcc8" strokeWidth="0.4" />
        <rect x={x + 12} y={y + 14} width="16" height="11" rx="1" fill="#fff" stroke="#eadcc8" strokeWidth="0.4" />
        <circle cx={x + 24} cy={y + 20} r="2.2" fill="#e85d4c" />
        <rect x={x + 36} y={y + 18} width="18" height="12" rx="1.2" fill="#efe6d4" />
      </g>
    )
  }
  if (room.slug === 'annuity') {
    return (
      <g>
        <rect x={x + 36} y={y + 14} width="38" height="22" rx="2" fill={PAPER} stroke="#e7d3b8" strokeWidth="0.5" />
        <rect x={x + 36} y={y + 14} width="38" height="4" rx="1" fill={WOOD_DARK} />
        {Array.from({ length: 24 }, (_, i) => {
          const col = i % 6
          const row = Math.floor(i / 6)
          const mark: Record<number, string> = { 1: '#e85d4c', 8: '#f2c14e', 14: '#2f6f9f', 17: '#3d8f6e', 22: '#e07a5f' }
          return (
            <rect
              key={i}
              x={x + 38.2 + col * 5.8}
              y={y + 19.2 + row * 4}
              width="4.2"
              height="2.8"
              rx="0.5"
              fill={mark[i] ?? '#f3e6d4'}
            />
          )
        })}
        <rect x={x + 8} y={y + 30} width="8" height="14" rx="1" fill="#8d6e63" />
        <rect x={x + 18} y={y + 34} width="8" height="10" rx="1" fill="#a1887f" />
      </g>
    )
  }
  return (
    <g>
      <rect x={x + 8} y={y + 14} width="40" height="22" rx="2" fill={PAPER} stroke="#e7d3b8" strokeWidth="0.5" />
      <line x1={x + 12} y1={y + 32} x2={x + 44} y2={y + 32} stroke="#eadcc8" strokeWidth="0.8" />
      {[
        [14, '#e85d4c'],
        [8, '#f2c14e'],
        [18, '#2f6f9f'],
        [11, '#3d8f6e'],
      ].map(([h, color], i) => (
        <rect key={color as string} x={x + 13 + i * 8} y={y + 32 - Number(h)} width="5" height={Number(h)} rx="1" fill={String(color)} />
      ))}
    </g>
  )
}

function walls(room: OfficeRoom, hot: 'from' | 'to' | null) {
  const { x, y, w, h, door, doorSide } = room
  const gap = 8
  const stroke = '#d7b48a'
  const doorFill = hot === 'from' ? '#f2c14e' : hot === 'to' ? '#8ee7ea' : '#e7b578'
  return (
    <g>
      {y > 4 ? <line x1={x} y1={y} x2={x + w} y2={y} stroke={stroke} strokeWidth="1.6" strokeLinecap="round" /> : null}
      {doorSide === 'e' ? (
        <>
          <line x1={x + w} y1={y} x2={x + w} y2={door.y - gap} stroke={stroke} strokeWidth="1.6" />
          <line x1={x + w} y1={door.y + gap} x2={x + w} y2={y + h} stroke={stroke} strokeWidth="1.6" />
        </>
      ) : (
        <>
          <line x1={x} y1={y} x2={x} y2={door.y - gap} stroke={stroke} strokeWidth="1.6" />
          <line x1={x} y1={door.y + gap} x2={x} y2={y + h} stroke={stroke} strokeWidth="1.6" />
        </>
      )}
      <rect x={door.x - 2.2} y={door.y - 5} width="4.4" height="10" rx="1.2" fill={doorFill} />
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
  const glowFor = (slug: string) => (rooms.find((room) => room.slug === slug)?.status === '进行中' ? '#c9f6ff' : '#b7d7ea')
  return (
    <>
      <defs>
        <filter id="office-soft" x="-30%" y="-30%" width="160%" height="160%">
          <feDropShadow dx="0" dy="0.5" stdDeviation="0.5" floodColor="#8a5a32" floodOpacity="0.22" />
        </filter>
      </defs>
      {reduced ? null : (
        <style>
          {`@keyframes office-idle { 0%, 100% { transform: translateY(0); } 50% { transform: translateY(-0.7px); } }
            .office-idle { animation: office-idle 2.6s ease-in-out infinite; transform-box: fill-box; transform-origin: center bottom; }
            @media (prefers-reduced-motion: reduce) { .office-idle { animation: none; } }`}
        </style>
      )}
      <rect width={OFFICE_W} height={OFFICE_H} rx="8" fill="#f3e6d2" />
      <rect x={BUILDING.x} y={BUILDING.y} width={BUILDING.w} height={BUILDING.h} rx="6" fill="#efe0c8" />
      {rooms.map((room) => (
        <rect
          key={room.slug}
          x={room.x + 0.6}
          y={room.y + 0.6}
          width={room.w - 1.2}
          height={room.h - 1.2}
          fill={room.thin ? dusk(FLOOR[room.slug] ?? '#f3e4cc') : FLOOR[room.slug]}
        />
      ))}
      <rect x={CORRIDOR_TOP} y={4} width={CORRIDOR_BOT - CORRIDOR_TOP} height={SOUTH_Y - 4} fill="#ecd7b4" />
      <rect x={LANE_X - 6} y={8} width="12" height={SOUTH_Y - 16} rx="6" fill={TEAL} />
      <rect x={LANE_X - 1.4} y={10} width="2.8" height={SOUTH_Y - 22} rx="1.4" fill="#f6ead6" opacity="0.45" />
      <rect x={8} y={SOUTH_Y + 2} width={OFFICE_W - 16} height={OFFICE_H - SOUTH_Y - 8} rx="4" fill="#f6e3c8" />
      {rooms.map((room) => (
        <g key={`furn-${room.slug}`}>{furnish(room)}</g>
      ))}
      <g filter="url(#office-soft)">
        <rect x={RECEPTION_DESK.x} y={RECEPTION_DESK.y} width={RECEPTION_DESK.w} height={RECEPTION_DESK.h} rx="2" fill={WOOD_DARK} />
        <rect x={RECEPTION_DESK.x + 2} y={RECEPTION_DESK.y + 1.4} width={RECEPTION_DESK.w - 4} height="2" rx="1" fill="#e7b578" />
      </g>
      <rect x={16} y={252} width="28" height="12" rx="3" fill={TEAL} />
      <rect x={18} y={254} width="10" height="6" rx="1.5" fill="#b7ebe4" />
      <Plant x={18} y={244} />
      <Plant x={168} y={250} />
      <rect x={LANE_X - 10} y={270} width="20" height="6" rx="1.2" fill="#c47a3a" />
      {path && path.length > 1 ? (
        <polyline
          points={path.map((pt) => `${pt.x},${pt.y}`).join(' ')}
          fill="none"
          stroke="#fffaf3"
          strokeWidth="1.3"
          strokeDasharray="1.4 2.2"
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
            shirt={actor.shirt}
            hair={actor.hair}
            pants={actor.pants}
            cut={cutFor(actor.id)}
            frame={frame}
            walking={false}
            reduced={reduced}
          />
        ))}
      {actors
        .filter((actor) => actor.id !== walkerId && actor.role === 'desk')
        .map((actor) =>
          actor.slug === 'intake' || actor.slug === 'disclosure' ? (
            <WideTable key={`table-${actor.id}`} x={actor.x} y={actor.y} />
          ) : actor.slug === 'inspire' ? null : (
            <Desk key={`desk-${actor.id}`} x={actor.x} y={actor.y} glow={glowFor(actor.slug)} />
          ),
        )}
      <Person
        x={RECEPTIONIST.x}
        y={RECEPTIONIST.y}
        shirt={shirtFor('reception')}
        hair={hairFor('reception')}
        pants={pantsFor('reception')}
        cut={cutFor('reception')}
        frame={frame}
        walking={false}
        reduced={reduced}
      />
      {walker && along ? (
        <g>
          <g transform={`translate(${along.x} ${along.y - 24})`} filter="url(#office-soft)">
            <rect x="-4.2" y="-5" width="8.4" height="7" rx="1" fill="#f2c14e" />
            <rect x="-2.2" y="-6.4" width="3.6" height="2.2" rx="0.5" fill="#e07a5f" />
            <line x1="-2.4" y1="-2.2" x2="2.4" y2="-2.2" stroke="#fff6dc" strokeWidth="0.5" />
          </g>
          <Person
            x={along.x}
            y={along.y}
            shirt={walker.shirt}
            hair={walker.hair}
            pants={walker.pants}
            cut={cutFor(walker.id)}
            frame={frame}
            walking
            reduced={reduced}
          />
        </g>
      ) : null}
      {rooms.map((room) => (
        <g key={`wall-${room.slug}`}>
          {walls(room, room.slug === fromSlug ? 'from' : room.slug === toSlug ? 'to' : null)}
        </g>
      ))}
      <Plant x={LANE_X - 10} y={40} />
      <Plant x={LANE_X + 8} y={150} />
    </>
  )
}
