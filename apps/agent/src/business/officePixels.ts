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
  SIGN,
  SOUTH_Y,
  type OfficeRoom,
  type Pt,
  polylinePoint,
} from './officeLayout'

const INK = '#2a2118'
const WOOD = ['#f0d7a6', '#e4c48a', '#d7b27a', '#c99762']
const RUG = '#1f8f8a'
const RUG_DARK = '#146e6a'
const WALL = '#f6ead6'
const DESK = '#8d5a2b'
const DESK_LIT = '#c9854a'
const GLOW = '#8ef6ff'
const SCREEN = '#102433'
const CHAIR = '#3e4c59'
const PLANT = '#2f9d55'
const PLANT_DARK = '#1d6b38'
const POT = '#d06a3a'

const TINT: Record<string, number> = {
  intake: 0,
  inspire: 1,
  mining: 2,
  disclosure: 0,
  draft: 1,
  oa: 2,
  annuity: 3,
  monetize: 3,
}

function block(ctx: CanvasRenderingContext2D, x: number, y: number, w: number, h: number, fill: string) {
  const ix = Math.round(x)
  const iy = Math.round(y)
  ctx.fillStyle = INK
  ctx.fillRect(ix - 1, iy - 1, w + 2, h + 2)
  ctx.fillStyle = fill
  ctx.fillRect(ix, iy, w, h)
}

function woodFloor(ctx: CanvasRenderingContext2D, x: number, y: number, w: number, h: number, tint: number) {
  for (let py = 0; py < h; py++) {
    const stripe = Math.floor(py / 3) % 2
    for (let px = 0; px < w; px++) {
      const plank = Math.floor((px + (stripe ? 6 : 0)) / 8) % WOOD.length
      const shift = (plank + tint) % WOOD.length
      ctx.fillStyle = WOOD[shift]!
      ctx.fillRect(x + px, y + py, 1, 1)
    }
    if (py % 3 === 2) {
      ctx.fillStyle = 'rgba(42,33,24,0.18)'
      ctx.fillRect(x, y + py, w, 1)
    }
  }
}

function rug(ctx: CanvasRenderingContext2D, x: number, y: number, w: number, h: number) {
  ctx.fillStyle = INK
  ctx.fillRect(x - 1, y - 1, w + 2, h + 2)
  ctx.fillStyle = RUG
  ctx.fillRect(x, y, w, h)
  ctx.fillStyle = RUG_DARK
  ctx.fillRect(x + 2, y + 2, w - 4, h - 4)
  ctx.fillStyle = '#8ef0e4'
  ctx.fillRect(x + 3, y + 3, w - 6, 1)
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

function deskSet(ctx: CanvasRenderingContext2D, x: number, y: number, glow: string) {
  rug(ctx, x - 4, y - 2, 32, 18)
  block(ctx, x + 6, y + 8, 10, 7, CHAIR)
  ctx.fillStyle = '#2a2118'
  ctx.fillRect(x + 8, y + 10, 6, 2)
  block(ctx, x, y, 26, 8, DESK)
  ctx.fillStyle = DESK_LIT
  ctx.fillRect(x + 1, y + 1, 24, 2)
  block(ctx, x + 7, y - 8, 12, 8, SCREEN)
  ctx.fillStyle = glow
  ctx.fillRect(x + 9, y - 6, 8, 4)
  ctx.fillStyle = '#f7fbff'
  ctx.fillRect(x + 10, y - 5, 3, 1)
  ctx.fillStyle = INK
  ctx.fillRect(x + 8, y + 3, 10, 2)
  ctx.fillStyle = '#efe6d4'
  ctx.fillRect(x + 9, y + 3, 8, 1)
}

function whiteboard(ctx: CanvasRenderingContext2D, x: number, y: number, status: RoomLiveStatus) {
  block(ctx, x, y, 26, 14, '#fffaf2')
  ctx.fillStyle = '#8d5a2b'
  ctx.fillRect(x, y, 26, 2)
  const notes =
    status === '待确认'
      ? ['#e85d4c', '#f2c14e']
      : status === '进行中'
        ? ['#f2c14e', '#7dcea0', '#7ec8e3']
        : ['#f2c14e']
  notes.forEach((color, i) => {
    ctx.fillStyle = INK
    ctx.fillRect(x + 2 + i * 7, y + 4, 6, 6)
    ctx.fillStyle = color
    ctx.fillRect(x + 3 + i * 7, y + 5, 4, 4)
  })
}

function drawPerson(
  ctx: CanvasRenderingContext2D,
  fx: number,
  fy: number,
  shirt: string,
  hair: string,
  pants: string,
  frame: number,
) {
  const x = Math.round(fx) - 5
  const y = Math.round(fy) - 16
  const bob = frame % 2
  ctx.fillStyle = 'rgba(42,33,24,0.28)'
  ctx.fillRect(x + 1, fy - 1, 8, 2)
  block(ctx, x + 1, y + 12, 3, 3, pants)
  block(ctx, x + 6, y + 12, 3, 3, pants)
  ctx.fillStyle = INK
  ctx.fillRect(x + 1, y + 14, 3, 1)
  ctx.fillRect(x + 6, y + 14, 3, 1)
  block(ctx, x + 1, y + 6, 8, 6, shirt)
  ctx.fillStyle = '#f3c7a8'
  ctx.fillRect(x, y + 7 + bob, 2, 3)
  ctx.fillRect(x + 8, y + 7 + (1 - bob), 2, 3)
  block(ctx, x + 2, y + 1, 6, 5, '#f3c7a8')
  ctx.fillStyle = hair
  ctx.fillRect(x + 1, y, 8, 3)
  ctx.fillRect(x + 1, y + 2, 1, 2)
  ctx.fillRect(x + 8, y + 2, 1, 2)
  ctx.fillStyle = INK
  ctx.fillRect(x + 3, y + 3, 1, 1)
  ctx.fillRect(x + 6, y + 3, 1, 1)
}

function folder(ctx: CanvasRenderingContext2D, x: number, y: number) {
  block(ctx, x, y, 7, 8, '#f2c14e')
  ctx.fillStyle = '#fff8dc'
  ctx.fillRect(x + 1, y + 2, 5, 1)
  ctx.fillRect(x + 1, y + 4, 4, 1)
  ctx.fillStyle = '#e85d4c'
  ctx.fillRect(x + 1, y, 3, 2)
}

function dimRoom(ctx: CanvasRenderingContext2D, room: OfficeRoom) {
  ctx.fillStyle = 'rgba(42,28,16,0.38)'
  ctx.fillRect(room.x + 1, room.y + 1, room.w - 2, room.h - 2)
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

  woodFloor(ctx, BUILDING.x, BUILDING.y, BUILDING.w, BUILDING.h, 1)

  for (const room of scene.rooms) {
    woodFloor(ctx, room.x + 1, room.y + 1, room.w - 2, room.h - 2, TINT[room.slug] ?? 0)
    rug(ctx, room.x + 8, room.y + 28, 40, 22)
    const deskX = room.doorSide === 'e' ? room.x + 10 : room.x + room.w - 36
    const deskY = room.y + 34
    deskSet(ctx, deskX, deskY, room.status === '进行中' ? GLOW : '#5aa8c4')
    whiteboard(ctx, room.board.x, room.board.y, room.status)
    if (room.doorSide === 'e') {
      shelf(ctx, room.x + room.w - 14, room.y + 8)
      plant(ctx, room.x + room.w - 16, room.y + room.h - 16)
      if (!room.thin) printer(ctx, room.x + 40, room.y + room.h - 16)
    } else {
      shelf(ctx, room.x + 4, room.y + 8)
      plant(ctx, room.x + 6, room.y + room.h - 16)
      if (!room.thin) printer(ctx, room.x + room.w - 52, room.y + room.h - 16)
    }
    ctx.fillStyle = WALL
    ctx.fillRect(room.x + 4, room.y + 2, room.w - 8, 8)
    ctx.fillStyle = INK
    ctx.font = '7px sans-serif'
    ctx.textAlign = 'center'
    ctx.textBaseline = 'middle'
    ctx.fillText(SIGN[room.slug] ?? room.label, room.x + room.w / 2, room.y + 6)
    if (room.thin) dimRoom(ctx, room)
  }

  woodFloor(ctx, LANE_X - 12, BUILDING.y + 2, 24, SOUTH_Y - BUILDING.y - 2, 2)
  ctx.fillStyle = RUG
  ctx.fillRect(LANE_X - 3, BUILDING.y + 6, 6, SOUTH_Y - BUILDING.y - 12)
  ctx.fillStyle = RUG_DARK
  ctx.fillRect(LANE_X - 1, BUILDING.y + 8, 2, SOUTH_Y - BUILDING.y - 16)
  block(ctx, LANE_X - 10, 78, 20, 6, '#c9854a')
  block(ctx, LANE_X - 10, 150, 20, 6, '#c9854a')
  plant(ctx, LANE_X - 12, 40)
  plant(ctx, LANE_X + 4, 188)

  woodFloor(ctx, BUILDING.x + 1, SOUTH_Y + 1, BUILDING.w - 2, BUILDING.h - SOUTH_Y - 2, 0)
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
  ctx.fillStyle = '#f6ead6'
  ctx.font = 'bold 7px sans-serif'
  ctx.textAlign = 'center'
  ctx.fillText('NT', LANE_X, SOUTH_Y + 9)

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
  for (const actor of scene.actors) {
    if (actor.id === scene.walkerId) continue
    drawPerson(ctx, actor.x, actor.y, actor.shirt, actor.hair, actor.pants, actor.role === 'desk' ? scene.frame : 0)
  }
  drawPerson(ctx, RECEPTIONIST.x, RECEPTIONIST.y, '#1f8f8a', '#3a2414', '#243044', scene.frame)
  if (walker) {
    const along = scene.path ? polylinePoint(scene.path, scene.progress) : { x: walker.x, y: walker.y }
    drawPerson(ctx, along.x, along.y, walker.shirt, walker.hair, walker.pants, scene.frame)
    ctx.strokeStyle = '#f2c14e'
    ctx.lineWidth = 1
    ctx.strokeRect(Math.round(along.x) - 7, Math.round(along.y) - 18, 14, 18)
    folder(ctx, along.x + 7, along.y - 14)
    folder(ctx, along.x + 8, along.y - 12)
  }
}
