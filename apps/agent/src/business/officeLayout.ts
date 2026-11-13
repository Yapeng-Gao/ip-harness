/**
 * 大厅俯视办公室的几何。房间共用墙体，不留卡片缝。
 * 坐标是 SVG viewBox，人物脚点与家具对齐。
 */
import { HALL_DEPT_DOORS } from './hallDepts'
import type { RoomLiveStatus } from './roomLiveStatus'

/** 像素网格。屏幕上按整数倍放大，image-rendering: pixelated。 */
export const OFFICE_W = 200
export const OFFICE_H = 280

export type Pt = { x: number; y: number }

export type OfficeRoom = {
  slug: string
  label: string
  thin: boolean
  x: number
  y: number
  w: number
  h: number
  doorSide: 'e' | 'w'
  door: Pt
  doorOut: Pt
  seats: Pt[]
  board: { x: number; y: number; w: number; h: number }
}

const LEFT_X = 2
const LEFT_W = 84
const CORRIDOR_X = 86
const CORRIDOR_W = 28
const RIGHT_X = 114
const RIGHT_W = 84
const ROW_Y = 2
const ROW_H = 58
const LOBBY_Y = 234

export const CORRIDOR_TOP = CORRIDOR_X
export const CORRIDOR_BOT = CORRIDOR_X + CORRIDOR_W
export const SOUTH_Y = LOBBY_Y
export const LANE_X = CORRIDOR_X + CORRIDOR_W / 2

export const BUILDING = { x: LEFT_X, y: ROW_Y, w: RIGHT_X + RIGHT_W - LEFT_X, h: OFFICE_H - 4 }

export const RECEPTIONIST: Pt = { x: LANE_X, y: 266 }
export const RECEPTION_DESK = { x: LANE_X - 22, y: 248, w: 44, h: 12 }

const ORDER = ['intake', 'mining', 'draft', 'annuity', 'inspire', 'disclosure', 'oa', 'monetize']

export function officeRooms(): OfficeRoom[] {
  const bySlug = new Map(HALL_DEPT_DOORS.map((door) => [door.slug, door]))
  return ORDER.map((slug, index) => {
    const meta = bySlug.get(slug)!
    const left = index < 4
    const row = index % 4
    const x = left ? LEFT_X : RIGHT_X
    const w = left ? LEFT_W : RIGHT_W
    const y = ROW_Y + row * ROW_H
    const h = ROW_H
    const door = left
      ? { x: x + w - 1, y: y + Math.round(h / 2) }
      : { x: x + 1, y: y + Math.round(h / 2) }
    const doorOut = { x: LANE_X, y: door.y }
    const seats = left
      ? [
          { x: x + 26, y: y + 46 },
          { x: x + 68, y: y + 36 },
          { x: x + 60, y: y + 54 },
        ]
      : [
          { x: x + w - 26, y: y + 46 },
          { x: x + w - 68, y: y + 36 },
          { x: x + w - 60, y: y + 54 },
        ]
    const board = left
      ? { x: x + 6, y: y + 16, w: 26, h: 14 }
      : { x: x + w - 32, y: y + 16, w: 26, h: 14 }
    return {
      slug: meta.slug,
      label: meta.label.replace(/部$/, ''),
      thin: meta.thin,
      x,
      y,
      w,
      h,
      doorSide: left ? 'e' : 'w',
      door,
      doorOut,
      seats,
      board,
    }
  })
}

export function roomBySlug(slug: string): OfficeRoom | undefined {
  return officeRooms().find((room) => room.slug === slug)
}

/** 从门口经走廊走到对方门口，方便看见交接的人。 */
export function handoffWaypoints(from: OfficeRoom, to: OfficeRoom): Pt[] {
  return [
    from.door,
    from.doorOut,
    { x: LANE_X, y: from.door.y },
    { x: LANE_X, y: to.door.y },
    to.doorOut,
    to.door,
  ]
}

export function polylinePoint(points: Pt[], t: number): Pt {
  if (points.length === 0) return { x: 0, y: 0 }
  const clamped = Math.max(0, Math.min(1, t))
  if (points.length === 1 || clamped <= 0) return points[0]!
  if (clamped >= 1) return points[points.length - 1]!
  const lengths: number[] = []
  let total = 0
  for (let i = 1; i < points.length; i++) {
    const len = Math.hypot(points[i]!.x - points[i - 1]!.x, points[i]!.y - points[i - 1]!.y)
    lengths.push(len)
    total += len
  }
  if (total <= 0) return points[0]!
  let remain = clamped * total
  for (let i = 0; i < lengths.length; i++) {
    const len = lengths[i]!
    const a = points[i]!
    const b = points[i + 1]!
    if (remain <= len || i === lengths.length - 1) {
      const u = len === 0 ? 0 : Math.max(0, Math.min(1, remain / len))
      return { x: a.x + (b.x - a.x) * u, y: a.y + (b.y - a.y) * u }
    }
    remain -= len
  }
  return points[points.length - 1]!
}

export const SIGN: Record<string, string> = {
  intake: '立项',
  inspire: '激发',
  mining: '挖掘',
  disclosure: '交底',
  draft: '申请',
  oa: '答复',
  annuity: '维护',
  monetize: '复盘',
}

export function boardCopy(status: RoomLiveStatus): [string, string] {
  if (status === '待确认') return ['等你看一眼', '稿留在桌上']
  if (status === '进行中') return ['正在往下写', '先别收走']
  return ['今天还空着', '可以进来谈']
}

const SHIRTS = ['#0f172a', '#007aff', '#059669', '#b45309', '#1e293b', '#0066d6', '#475569', '#0f766e']
const HAIR = ['#1c1917', '#292524', '#44403c', '#0f172a', '#3f3f46']

function hashId(id: string): number {
  let h = 0
  for (const ch of id) h = (h * 33 + ch.charCodeAt(0)) >>> 0
  return h
}

export function shirtFor(id: string): string {
  return SHIRTS[hashId(id) % SHIRTS.length]!
}

export function hairFor(id: string): string {
  return HAIR[hashId(id + ':hair') % HAIR.length]!
}

export const CHATTER: Record<string, string[]> = {
  reception: ['请进，先说想来办什么。', '我帮你看该进哪一间。'],
  intake: ['方向先钉成一句话。', '立不立，等你拍。'],
  inspire: ['先留三条能写的。', '这条路径更干净。'],
  mining: ['创新点先拆开。', '这一包可以交下去。'],
  disclosure: ['六段还缺效果数据。', '齐了再送到申请部。'],
  draft: ['独权先别写太宽。', '说明书对着交底写。'],
  oa: ['这通先看创造性。', '策略等你点头。'],
  annuity: ['年费日写在台账上。', '这件先维持。'],
  monetize: ['年末再看留不留。', '复盘还差一页。'],
}
