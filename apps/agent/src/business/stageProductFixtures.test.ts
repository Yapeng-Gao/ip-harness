/**
 * §135 · 八部阶段产物正文齐全（真实 Office 口径，禁样机横幅）
 * 跑：node --import tsx --test apps/agent/src/business/stageProductFixtures.test.ts
 */
import assert from 'node:assert/strict'
import { describe, it } from 'node:test'
import { HALL_DEPT_DOORS } from './hallDepts'
import { DEPT_HANDOFF } from '../departments/deptPageNarrative'
import {
  HALL_STAGE_FIXTURES,
  MIN_STAGE_BODY_CHARS,
  STAGE_CONTENT_MARKERS,
  allHallStageFixturesOk,
  findStageFixtureGaps,
  stageFixtureForDept,
  stageFixtureForSlug,
} from './stageProductFixtures'
import { D4_STEPS, D5_STEPS, D6_STEPS, THIN_LINE_BY_DEPT } from './workbenchSteps'

describe('stageProductFixtures §135', () => {
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

  it('every hall fixture has coherent product body + content marker', () => {
    const gaps = findStageFixtureGaps()
    assert.deepEqual(gaps, [], JSON.stringify(gaps, null, 2))
    assert.equal(allHallStageFixturesOk(), true)
  })

  it('stepful depts expose real Office markers, not 样机产物 banners', () => {
    for (const s of D4_STEPS) {
      assert.doesNotMatch(s.mainBody, /【样机产物/)
      assert.match(s.mainBody, /技术领域|交底|质检|交接清单/)
      assert.ok(s.mainBody.length >= 80)
    }
    assert.match(D4_STEPS[0]!.mainBody, /技术领域/)
    for (const s of D5_STEPS) {
      assert.doesNotMatch(s.mainBody, /【样机产物/)
      assert.match(s.mainBody, /独权|权利要求|申不申|递交|过线/)
      assert.ok(s.mainBody.length >= 80)
    }
    assert.match(D5_STEPS[0]!.mainBody, /独权/)
    for (const s of D6_STEPS) {
      assert.doesNotMatch(s.mainBody, /【样机产物/)
      assert.match(s.mainBody, /争辩|策略|审查意见|意见陈述/)
      assert.ok(s.mainBody.length >= 80)
    }
  })

  it('thin hall shells carry real deliverable bodies', () => {
    const thinIds = HALL_DEPT_DOORS.filter((d) => d.thin).map((d) => d.deptId)
    for (const id of thinIds) {
      const meta = THIN_LINE_BY_DEPT[id]
      assert.ok(meta, `THIN_LINE missing ${id}`)
      assert.ok(
        meta!.workBody.length >= MIN_STAGE_BODY_CHARS,
        `${id} workBody short`,
      )
      assert.doesNotMatch(meta!.workBody, /【样机产物/)
      assert.doesNotMatch(meta!.workTitle, /示意|样机|演示/)
    }
    assert.match(THIN_LINE_BY_DEPT['dept-intake']!.workBody, /建项卡|边缘散热/)
    assert.match(THIN_LINE_BY_DEPT['dept-inspire']!.workBody, /选题卡|路径 A/)
    assert.match(THIN_LINE_BY_DEPT['dept-mining']!.workBody, /可专利性|点包/)
    assert.match(THIN_LINE_BY_DEPT['dept-annuity']!.workBody, /年费/)
    assert.match(THIN_LINE_BY_DEPT['dept-monetize']!.workBody, /阶段复盘|1 研发/)
  })

  it('STAGE_CONTENT_MARKERS cover hall 8 + thick steps', () => {
    for (const slug of ['intake', 'inspire', 'mining', 'disclosure', 'draft', 'oa', 'annuity', 'monetize']) {
      assert.ok(STAGE_CONTENT_MARKERS[slug], `missing marker ${slug}`)
    }
    for (const id of ['draft', 'fact', 'qc', 'hand']) {
      assert.ok(STAGE_CONTENT_MARKERS[`disclosure-${id}`])
    }
    for (const id of ['a', 'b', 'c-qc', 'c-submit']) {
      assert.ok(STAGE_CONTENT_MARKERS[`draft-${id}`])
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
