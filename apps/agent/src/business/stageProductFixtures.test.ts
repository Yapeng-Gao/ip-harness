/**
 * §134 · 八部阶段产物样机齐全（防空壳）
 * 跑：node --import tsx --test apps/agent/src/business/stageProductFixtures.test.ts
 */
import assert from 'node:assert/strict'
import { describe, it } from 'node:test'
import { HALL_DEPT_DOORS } from './hallDepts'
import { DEPT_HANDOFF } from '../departments/deptPageNarrative'
import {
  HALL_STAGE_FIXTURES,
  MIN_STAGE_BODY_CHARS,
  allHallStageFixturesOk,
  findStageFixtureGaps,
  stageFixtureForDept,
  stageFixtureForSlug,
} from './stageProductFixtures'
import { D4_STEPS, D5_STEPS, D6_STEPS, THIN_LINE_BY_DEPT } from './workbenchSteps'

describe('stageProductFixtures §134', () => {
  it('covers all 8 hall doors', () => {
    assert.equal(HALL_STAGE_FIXTURES.length, 8)
    assert.equal(HALL_DEPT_DOORS.length, 8)
    for (const door of HALL_DEPT_DOORS) {
      const f = stageFixtureForDept(door.deptId)
      assert.ok(f, `missing fixture for ${door.label}`)
      assert.equal(f!.slug, door.slug)
      assert.ok(stageFixtureForSlug(door.slug))
    }
  })

  it('every hall fixture has coherent product body + marker', () => {
    const gaps = findStageFixtureGaps()
    assert.deepEqual(gaps, [], JSON.stringify(gaps, null, 2))
    assert.equal(allHallStageFixturesOk(), true)
  })

  it('stepful depts expose per-step 样机 markers in mainBody', () => {
    for (const s of D4_STEPS) {
      assert.match(s.mainBody, /【样机产物·交底/)
      assert.ok(s.mainBody.length >= 40)
    }
    for (const s of D5_STEPS) {
      assert.match(s.mainBody, /【样机产物·申请/)
      assert.ok(s.mainBody.length >= 40)
    }
    for (const s of D6_STEPS) {
      assert.match(s.mainBody, /【样机产物·答复/)
      assert.ok(s.mainBody.length >= 40)
    }
  })

  it('thin hall shells carry 样机产物 workBody', () => {
    const thinIds = HALL_DEPT_DOORS.filter((d) => d.thin).map((d) => d.deptId)
    for (const id of thinIds) {
      const meta = THIN_LINE_BY_DEPT[id]
      assert.ok(meta, `THIN_LINE missing ${id}`)
      assert.ok(
        meta!.workBody.length >= MIN_STAGE_BODY_CHARS,
        `${id} workBody short`,
      )
      assert.match(meta!.workBody, /【样机产物/)
    }
  })

  it('DEPT_HANDOFF deliverable present for all hall 8', () => {
    for (const door of HALL_DEPT_DOORS) {
      const hand = DEPT_HANDOFF[door.deptId]
      assert.ok(hand?.deliverable?.trim(), `handoff deliverable missing: ${door.label}`)
      assert.ok(hand!.deliverable.length >= 8)
    }
  })
})
