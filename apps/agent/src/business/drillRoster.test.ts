/**
 * 演练名单
 * 跑：node --import tsx --test apps/agent/src/business/drillRoster.test.ts
 */
import assert from 'node:assert/strict'
import { describe, it } from 'node:test'
import {
  assertDrillRosterSize,
  DRILL_CLUSTERS,
  DRILL_ORCH_ID,
  DRILL_OWNER_IDS,
  drillDeptSections,
  drillDispatchBrief,
  drillSeatLabel,
} from './drillRoster'

describe('drillRoster', () => {
  it('has exactly 14 owners + orch', () => {
    const s = assertDrillRosterSize()
    assert.equal(s.owners, 14)
    assert.equal(s.withOrch, 15)
    assert.equal(DRILL_ORCH_ID, 'orchestrator')
    assert.equal(new Set(DRILL_OWNER_IDS).size, 14)
  })

  it('clusters cover all owners without overlap', () => {
    const flat = DRILL_CLUSTERS.flatMap((c) => c.seatIds)
    assert.deepEqual(flat, DRILL_OWNER_IDS)
    assert.equal(DRILL_CLUSTERS.length, 3)
  })

  it('node sections avoid 部门 titles and cover 14 owners', () => {
    const sections = drillDeptSections()
    assert.deepEqual(
      sections.map((s) => s.title),
      ['主链', '前研', '其他'],
    )
    assert.ok(sections.every((s) => !s.title.includes('部门')))
    const fromDepts = sections.flatMap((s) => [
      ...s.depts.map((d) => d.leadSeatId),
      ...s.extraSeatIds,
    ])
    assert.equal(new Set(fromDepts).size, 14)
    assert.deepEqual([...fromDepts].sort(), [...DRILL_OWNER_IDS].sort())
  })

  it('labels orch as 总控 in drill', () => {
    assert.equal(drillSeatLabel('orchestrator'), '总控')
    assert.match(drillDispatchBrief('expert-research'), /查新/)
  })
})
