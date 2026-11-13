/**
 * 像素办公室绘制。全部用 1px 色块，外层放大时保持硬边。
 */
import type { RoomLiveStatus } from './roomLiveStatus'
import {
  BUILDING,
  LANE_X,
  OFFICE_H,
  OFFICE_W,
  RECEPTIONIST,
  RECEPTION_DESK,
  SOUTH_Y,
  type OfficeRoom,
  type Pt,
  polylinePoint,
} from './officeLayout'

const INK = '#2a2118'
const RUG = '#1f8f8a'
const DESK = '#8d5a2b'
const DESK_LIT = '#c9854a'
const GLOW = '#8ef6ff'
const SCREEN = '#102433'
const PLANT = '#2f9d55'
const PLANT_DARK = '#1d6b38'
const POT = '#d06a3a'

const FLOOR: Record<string, { a: string; b: string; rug: string }> = {
  intake: { a: '#f6e6c8', b: '#edd9b4', rug: '#e2b04a' },
  inspire: { a: '#f3ead4', b: '#e7dcc4', rug: '#7dcea0' },
  mining: { a: '#f0d8b4', b: '#e4c8a0', rug: '#d08a4a' },
  disclosure: { a: '#f8e0cc', b: '#f0d0b8', rug: '#e09070' },
  draft: { a: '#f4e7cf', b: '#ead8b8', rug: '#3aa8a4' },
  oa: { a: '#f3d8c0', b: '#e8c8ac', rug: '#e07a5f' },
  annuity: { a: '#eadcc8', b: '#e0d0b8', rug: '#8d6e63' },
  monetize: { a: '#f0ddd4', b: '#e6cfc4', rug: '#c47a9a' },
}

function block(ctx: CanvasRenderingContext2D, x: number, y: number, w: number, h: number, fill: string) {
  const ix = Math.round(x)
  const iy = Math.round(y)
  ctx.fillStyle = INK
  ctx.fillRect(ix - 1, iy - 1, w + 2, h + 2)
  ctx.fillStyle = fill
  ctx.fillRect(ix, iy, w, h)
}

function woodFloor(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  w: number,
  h: number,
  a = '#f3e2c4',
  b = '#ead6b2',
) {
  for (let py = 0; py < h; py++) {
    ctx.fillStyle = Math.floor(py / 6) % 2 === 0 ? a : b
    ctx.fillRect(x, y + py, w, 1)
  }
  ctx.fillStyle = '#c4a06a'
  for (let py = 5; py < h; py += 6) ctx.fillRect(x, y + py, w, 1)
}

function dusk(hex: string): string {
  const n = Number.parseInt(hex.slice(1), 16)
  const ch = (shift: number) => Math.max(0, ((n >> shift) & 255) - 36).toString(16).padStart(2, '0')
  return `#${ch(16)}${ch(8)}${ch(0)}`
}

function rug(ctx: CanvasRenderingContext2D, x: number, y: number, w: number, h: number, color = RUG) {
  ctx.fillStyle = INK
  ctx.fillRect(x - 1, y - 1, w + 2, h + 2)
  ctx.fillStyle = color
  ctx.fillRect(x, y, w, h)
  ctx.fillStyle = '#f6ead6'
  ctx.fillRect(x + 2, y + 2, w - 4, 1)
}

function plant(ctx: CanvasRenderingContext2D, x: number, y: number) {
  block(ctx, x, y + 6, 6, 4, POT)
  ctx.fillStyle = PLANT_DARK
  ctx.fillRect(x - 1, y + 2, 3, 3)
  ctx.fillRect(x + 4, y + 1, 3, 3)
  ctx.fillStyle = PLANT
  ctx.fillRect(x + 1, y, 4, 5)
  ctx.fillRect(x - 1, y + 3, 2, 2)
  ctx.fillRect(x + 5, y + 2, 2, 2)
}

function shelf(ctx: CanvasRenderingContext2D, x: number, y: number) {
  block(ctx, x, y, 8, 22, '#6b3a1f')
  const books = ['#c4493a', '#2f6f9f', '#e0b04a', '#2f8f4e', '#f4efe4']
  for (let i = 0; i < 5; i++) {
    ctx.fillStyle = books[i]!
    ctx.fillRect(x + 1 + (i % 3), y + 2 + Math.floor(i / 3) * 7, 2, 5)
  }
}

function printer(ctx: CanvasRenderingContext2D, x: number, y: number) {
  block(ctx, x, y + 3, 12, 7, '#d7d2cb')
  ctx.fillStyle = '#2a2118'
  ctx.fillRect(x + 2, y + 5, 8, 2)
  ctx.fillStyle = '#fffaf2'
  ctx.fillRect(x + 3, y, 6, 3)
  ctx.fillStyle = '#3ddc97'
  ctx.fillRect(x + 9, y + 7, 1, 1)
}

function drawPerson(
  ctx: CanvasRenderingContext2D,
  fx: number,
  fy: number,
  shirt: string,
  hair: string,
  pants: string,
  frame: number,
  walking = false,
) {
  const x = Math.round(fx) - 5
  const y = Math.round(fy) - 16
  const step = walking ? frame % 2 : 0
  ctx.fillStyle = '#c9b08a'
  ctx.fillRect(x + 1, Math.round(fy) - 1, 8, 1)
  block(ctx, x + 1, y + 12 + step, 3, 3, pants)
  block(ctx, x + 6, y + 12 + (walking ? 1 - step : 0), 3, 3, pants)
  ctx.fillStyle = INK
  ctx.fillRect(x + 1, y + 14, 3, 1)
  ctx.fillRect(x + 6, y + 14, 3, 1)
  block(ctx, x + 1, y + 6, 8, 6, shirt)
  ctx.fillStyle = dusk(shirt)
  ctx.fillRect(x + 2, y + 10, 6, 2)
  ctx.fillStyle = '#fff8e8'
  ctx.fillRect(x + 3, y + 7, 4, 1)
  ctx.fillStyle = '#f3c7a8'
  ctx.fillRect(x, y + 7 + (frame % 2), 2, 3)
  ctx.fillRect(x + 8, y + 8 - (frame % 2), 2, 3)
  block(ctx, x + 2, y + 1, 6, 5, '#f3c7a8')
  ctx.fillStyle = hair
  ctx.fillRect(x + 1, y, 8, 3)
  ctx.fillRect(x + 1, y + 3, 2, 2)
  ctx.fillRect(x + 7, y + 3, 2, 2)
  ctx.fillStyle = '#fffaf2'
  ctx.fillRect(x + 3, y + 3, 2, 2)
  ctx.fillRect(x + 6, y + 3, 2, 2)
  ctx.fillStyle = INK
  ctx.fillRect(x + 4, y + 4, 1, 1)
  ctx.fillRect(x + 7, y + 4, 1, 1)
}

function deskFront(ctx: CanvasRenderingContext2D, fx: number, fy: number, glow: string) {
  block(ctx, fx - 13, fy - 6, 26, 8, DESK)
  ctx.fillStyle = DESK_LIT
  ctx.fillRect(fx - 12, fy - 5, 24, 2)
  block(ctx, fx - 6, fy - 13, 12, 7, SCREEN)
  ctx.fillStyle = glow
  ctx.fillRect(fx - 4, fy - 11, 8, 4)
  ctx.fillStyle = INK
  ctx.fillRect(fx - 4, fy - 2, 8, 2)
}

function beanbag(ctx: CanvasRenderingContext2D, x: number, y: number, color: string) {
  const rows = ['  ####', ' ######', '########', ' ######', '  ####']
  rows.forEach((row, iy) => {
    for (let ix = 0; ix < row.length; ix++) {
      if (row[ix] !== '#') continue
      ctx.fillStyle = INK
      ctx.fillRect(x + ix - 1, y + iy - 1, 3, 3)
    }
  })
  rows.forEach((row, iy) => {
    for (let ix = 0; ix < row.length; ix++) {
      if (row[ix] !== '#') continue
      ctx.fillStyle = color
      ctx.fillRect(x + ix, y + iy, 1, 1)
    }
  })
  ctx.fillStyle = '#fffaf2'
  ctx.fillRect(x + 3, y + 1, 2, 1)
}

function stickies(ctx: CanvasRenderingContext2D, x: number, y: number) {
  const colors = ['#f2c14e', '#e85d4c', '#7dcea0', '#7ec8e3', '#f4a3c8']
  colors.forEach((color, i) => {
    const col = i % 3
    const row = Math.floor(i / 3)
    ctx.fillStyle = INK
    ctx.fillRect(x + col * 8, y + row * 8, 7, 7)
    ctx.fillStyle = color
    ctx.fillRect(x + 1 + col * 8, y + 1 + row * 8, 5, 5)
  })
}

function folder(ctx: CanvasRenderingContext2D, x: number, y: number) {
  block(ctx, x, y, 7, 8, '#f2c14e')
  ctx.fillStyle = '#fff8dc'
  ctx.fillRect(x + 1, y + 2, 5, 1)
  ctx.fillRect(x + 1, y + 4, 4, 1)
  ctx.fillStyle = '#e85d4c'
  ctx.fillRect(x + 1, y, 3, 2)
}

function furnish(ctx: CanvasRenderingContext2D, room: OfficeRoom & { status: RoomLiveStatus }) {
  const tone = FLOOR[room.slug] ?? FLOOR.draft!
  const floorA = room.thin ? dusk(tone.a) : tone.a
  const floorB = room.thin ? dusk(tone.b) : tone.b
  woodFloor(ctx, room.x + 1, room.y + 1, room.w - 2, room.h - 2, floorA, floorB)
  const glow = room.status === '进行中' ? GLOW : '#7ec8e3'
  if (room.slug === 'intake') {
    rug(ctx, room.x + 18, room.y + 24, 46, 24, tone.rug)
    block(ctx, room.x + 26, room.y + 30, 30, 12, '#6b4428')
    block(ctx, room.x + 34, room.y + 26, 10, 5, '#243044')
    ctx.fillStyle = glow
    ctx.fillRect(room.x + 37, room.y + 28, 4, 2)
  } else if (room.slug === 'inspire') {
    block(ctx, room.x + 6, room.y + 14, 36, 22, '#fffaf2')
    ctx.fillStyle = '#8d5a2b'
    ctx.fillRect(room.x + 6, room.y + 14, 36, 2)
    stickies(ctx, room.x + 8, room.y + 18)
    beanbag(ctx, room.x + 8, room.y + 40, '#3d8f6e')
    beanbag(ctx, room.x + 28, room.y + 42, '#e07a5f')
  } else if (room.slug === 'annuity') {
    const calX = room.x + 40
    const calY = room.y + 14
    block(ctx, calX, calY, 36, 22, '#fffaf2')
    ctx.fillStyle = INK
    for (let row = 0; row < 4; row++) ctx.fillRect(calX + 2, calY + 4 + row * 4, 32, 1)
    for (let col = 0; col < 6; col++) ctx.fillRect(calX + 4 + col * 5, calY + 2, 1, 18)
    const marks: Array<[number, number, string]> = [[0, 1, '#e85d4c'], [2, 0, '#f2c14e'], [3, 2, '#2f6f9f'], [4, 3, '#e85d4c'], [5, 1, '#3d8f6e']]
    for (const [col, row, color] of marks) {
      ctx.fillStyle = color
      ctx.fillRect(calX + 5 + col * 5, calY + 5 + row * 4, 3, 2)
    }
    block(ctx, room.x + 8, room.y + 36, 8, 14, '#8d6e63')
    block(ctx, room.x + 18, room.y + 40, 8, 10, '#a1887f')
  } else if (room.slug === 'monetize') {
    block(ctx, room.x + 6, room.y + 14, 40, 24, '#fffaf2')
    ctx.fillStyle = INK
    ctx.fillRect(room.x + 10, room.y + 32, 32, 2)
    const bars: Array<[number, string]> = [[14, '#e85d4c'], [8, '#f2c14e'], [18, '#2f6f9f'], [11, '#3d8f6e']]
    bars.forEach(([h, color], i) => {
      ctx.fillStyle = INK
      ctx.fillRect(room.x + 11 + i * 8, room.y + 32 - h - 1, 6, h + 2)
      ctx.fillStyle = color
      ctx.fillRect(room.x + 12 + i * 8, room.y + 32 - h, 4, h)
    })
  } else if (room.slug === 'mining') {
    shelf(ctx, room.x + 6, room.y + 16)
    shelf(ctx, room.x + 16, room.y + 16)
    block(ctx, room.x + 28, room.y + 28, 10, 8, '#d7d2cb')
    block(ctx, room.x + 40, room.y + 26, 10, 10, '#c4b8a8')
  } else if (room.slug === 'disclosure') {
    rug(ctx, room.x + 16, room.y + 26, 40, 22, tone.rug)
    block(ctx, room.x + 24, room.y + 32, 24, 10, '#6b4428')
    ctx.fillStyle = '#fffaf2'
    ctx.fillRect(room.x + 30, room.y + 34, 10, 4)
  } else if (room.slug === 'draft') {
    rug(ctx, room.x + 8, room.y + 30, 28, 16, tone.rug)
    ctx.fillStyle = '#fffaf2'
    ctx.fillRect(room.x + 14, room.y + 28, 8, 3)
    ctx.fillRect(room.x + 16, room.y + 26, 6, 2)
    printer(ctx, room.x + room.w - 20, room.y + room.h - 16)
    if (!room.thin) {
      rug(ctx, room.x + 44, room.y + 30, 28, 16, tone.rug)
      ctx.fillStyle = '#fffaf2'
      ctx.fillRect(room.x + 52, room.y + 28, 8, 3)
    }
  } else if (room.slug === 'oa') {
    rug(ctx, room.x + 10, room.y + 30, 32, 16, tone.rug)
    block(ctx, room.x + 46, room.y + 28, 14, 10, '#efe6d4')
    ctx.fillStyle = '#e85d4c'
    ctx.fillRect(room.x + 50, room.y + 31, 4, 3)
    ctx.fillStyle = '#fffaf2'
    ctx.fillRect(room.x + 48, room.y + 24, 10, 4)
  } else {
    rug(ctx, room.x + 10, room.y + 30, 32, 16, tone.rug)
  }
  plant(ctx, room.x + room.w - 14, room.y + room.h - 14)
}

export type PixelActor = {
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

export type PixelScene = {
  rooms: Array<OfficeRoom & { status: RoomLiveStatus }>
  actors: PixelActor[]
  frame: number
  path: Pt[] | null
  progress: number
  fromSlug?: string
  toSlug?: string
  walkerId?: string
}

export function drawOffice(ctx: CanvasRenderingContext2D, scene: PixelScene) {
  ctx.imageSmoothingEnabled = false
  ctx.clearRect(0, 0, OFFICE_W, OFFICE_H)
  ctx.fillStyle = '#c4a27a'
  ctx.fillRect(0, 0, OFFICE_W, OFFICE_H)

  for (const room of scene.rooms) furnish(ctx, room)

  woodFloor(ctx, LANE_X - 12, BUILDING.y + 2, 24, SOUTH_Y - BUILDING.y - 2, '#f3e2c4', '#ead6b2')
  ctx.fillStyle = RUG
  ctx.fillRect(LANE_X - 3, BUILDING.y + 6, 6, SOUTH_Y - BUILDING.y - 12)
  ctx.fillStyle = '#146e6a'
  ctx.fillRect(LANE_X - 1, BUILDING.y + 8, 2, SOUTH_Y - BUILDING.y - 16)
  block(ctx, LANE_X - 10, 78, 20, 6, '#c9854a')
  block(ctx, LANE_X - 10, 150, 20, 6, '#c9854a')
  plant(ctx, LANE_X - 12, 40)
  plant(ctx, LANE_X + 4, 188)

  woodFloor(ctx, BUILDING.x + 1, SOUTH_Y + 1, BUILDING.w - 2, BUILDING.h - SOUTH_Y - 2, '#f6e6c8', '#edd9b4')
  rug(ctx, LANE_X - 28, SOUTH_Y + 8, 56, 18)
  block(ctx, RECEPTION_DESK.x, RECEPTION_DESK.y, RECEPTION_DESK.w, RECEPTION_DESK.h, DESK)
  ctx.fillStyle = GLOW
  ctx.fillRect(RECEPTION_DESK.x + 16, RECEPTION_DESK.y + 3, 10, 4)
  block(ctx, BUILDING.x + 8, SOUTH_Y + 10, 28, 12, '#c46b4a')
  block(ctx, BUILDING.x + BUILDING.w - 36, SOUTH_Y + 10, 28, 12, '#c46b4a')
  plant(ctx, BUILDING.x + 10, SOUTH_Y + 26)
  plant(ctx, BUILDING.x + BUILDING.w - 20, SOUTH_Y + 26)
  ctx.fillStyle = INK
  ctx.fillRect(LANE_X - 16, OFFICE_H - 8, 32, 4)
  ctx.fillStyle = '#8d5a2b'
  ctx.fillRect(LANE_X - 14, OFFICE_H - 7, 6, 2)
  ctx.fillRect(LANE_X - 4, OFFICE_H - 7, 6, 2)
  ctx.fillRect(LANE_X + 6, OFFICE_H - 7, 6, 2)
  block(ctx, LANE_X - 14, SOUTH_Y + 4, 28, 10, '#243044')

  ctx.fillStyle = INK
  ctx.fillRect(BUILDING.x, BUILDING.y, BUILDING.w, 2)
  ctx.fillRect(BUILDING.x, BUILDING.y, 2, BUILDING.h)
  ctx.fillRect(BUILDING.x + BUILDING.w - 2, BUILDING.y, 2, BUILDING.h)
  ctx.fillRect(BUILDING.x, BUILDING.y + BUILDING.h - 2, LANE_X - 14 - BUILDING.x, 2)
  ctx.fillRect(LANE_X + 14, BUILDING.y + BUILDING.h - 2, BUILDING.x + BUILDING.w - (LANE_X + 14), 2)

  for (const room of scene.rooms) {
    if (room.y > BUILDING.y + 2) ctx.fillRect(room.x, room.y, room.w, 2)
    const gap = 7
    if (room.doorSide === 'e') {
      ctx.fillRect(room.x + room.w - 2, room.y, 2, room.door.y - room.y - gap)
      ctx.fillRect(room.x + room.w - 2, room.door.y + gap, 2, room.y + room.h - (room.door.y + gap))
    } else {
      ctx.fillRect(room.x, room.y, 2, room.door.y - room.y - gap)
      ctx.fillRect(room.x, room.door.y + gap, 2, room.y + room.h - (room.door.y + gap))
    }
    const hot = room.slug === scene.fromSlug || room.slug === scene.toSlug
    ctx.fillStyle = room.slug === scene.fromSlug ? '#f2c14e' : room.slug === scene.toSlug ? '#8ef6ff' : '#c9854a'
    ctx.fillRect(room.door.x - 2, room.door.y - 5, 5, 10)
    if (hot) {
      ctx.fillStyle = INK
      ctx.strokeStyle = room.slug === scene.fromSlug ? '#f2c14e' : '#8ef6ff'
      ctx.lineWidth = 1
      ctx.strokeRect(room.door.x - 4, room.door.y - 7, 9, 14)
    }
  }
  ctx.fillRect(BUILDING.x, SOUTH_Y, LANE_X - 14 - BUILDING.x, 2)
  ctx.fillRect(LANE_X + 14, SOUTH_Y, BUILDING.x + BUILDING.w - (LANE_X + 14), 2)

  if (scene.path && scene.path.length > 1) {
    ctx.fillStyle = '#fff8e8'
    const steps = 56
    for (let i = 0; i <= steps; i++) {
      if (i % 2) continue
      const p = polylinePoint(scene.path, i / steps)
      ctx.fillRect(Math.round(p.x) - 0, Math.round(p.y), 2, 2)
    }
  }

  const walker = scene.actors.find((actor) => actor.id === scene.walkerId)
  const glowFor = (status: RoomLiveStatus) => (status === '进行中' ? GLOW : '#7ec8e3')
  for (const actor of scene.actors) {
    if (actor.id === scene.walkerId) continue
    if (actor.role !== 'desk') continue
    drawPerson(ctx, actor.x, actor.y, actor.shirt, actor.hair, actor.pants, scene.frame, false)
    const status = scene.rooms.find((room) => room.slug === actor.slug)?.status ?? '待机'
    if (actor.slug !== 'inspire') deskFront(ctx, actor.x, actor.y, glowFor(status))
  }
  for (const actor of scene.actors) {
    if (actor.id === scene.walkerId || actor.role === 'desk') continue
    drawPerson(ctx, actor.x, actor.y, actor.shirt, actor.hair, actor.pants, 0, false)
  }
  drawPerson(ctx, RECEPTIONIST.x, RECEPTIONIST.y, '#1f8f8a', '#3a2414', '#243044', scene.frame, false)
  if (walker) {
    const along = scene.path ? polylinePoint(scene.path, scene.progress) : { x: walker.x, y: walker.y }
    folder(ctx, along.x - 3, along.y - 26)
    drawPerson(ctx, along.x, along.y, walker.shirt, walker.hair, walker.pants, scene.frame, true)
  }
}
