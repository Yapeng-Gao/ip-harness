import assert from 'node:assert/strict'
import { describe, it } from 'node:test'
import {
  handoffWaypoints,
  officeRooms,
  polylinePoint,
  roomBySlug,
} from './officeLayout'

describe('officeLayout', () => {
  it('builds eight adjoining rooms and a disclosure-to-draft walk', () => {
    const rooms = officeRooms()
    assert.equal(rooms.length, 8)
    assert.deepEqual(
      rooms.map((room) => room.slug),
      ['intake', 'mining', 'draft', 'annuity', 'inspire', 'disclosure', 'oa', 'monetize'],
    )
    const from = roomBySlug('disclosure')!
    const to = roomBySlug('draft')!
    const path = handoffWaypoints(from, to)
    const mid = polylinePoint(path, 0.5)
    assert.ok(mid.x > Math.min(from.door.x, to.door.x))
    assert.ok(mid.x < Math.max(from.door.x, to.door.x) || Math.abs(from.door.x - to.door.x) < 40)
    const start = polylinePoint(path, 0)
    const end = polylinePoint(path, 1)
    assert.equal(start.x, 86)
    assert.equal(start.y, from.door.y)
    assert.equal(end.x, to.door.x)
    assert.ok(Math.abs(mid.x - 100) < 30)
  })
})
