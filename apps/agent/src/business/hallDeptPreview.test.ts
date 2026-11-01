/**
 * 跑：node --import tsx --test apps/agent/src/business/hallDeptPreview.test.ts
 */
import { describe, it } from 'node:test'
import assert from 'node:assert/strict'
import { HALL_DEPT_DOORS } from './hallDepts'
import {
  assertHallDoorBlurbsPresent,
  assertHallExpertsBounded,
  hallDeptExpertPreviews,
  hallExpertShortName,
} from './hallDeptPreview'
import { MAIN_CHAIN_DEPT_IDS } from '../departments/orgDepts'

describe('hallDeptPreview (§95 door blurb + thin experts)', () => {
  it('eight doors align with MAIN_CHAIN and each has Office blurb', () => {
    assert.equal(HALL_DEPT_DOORS.length, 8)
    assert.deepEqual(
      HALL_DEPT_DOORS.map((d) => d.deptId),
      [...MAIN_CHAIN_DEPT_IDS],
    )
    assert.equal(assertHallDoorBlurbsPresent(), true)
    for (const d of HALL_DEPT_DOORS) {
      assert.ok(d.num.length > 0, d.deptId)
      assert.ok(d.label.includes('部'), d.deptId)
      assert.ok(d.desc.trim().length >= 4, d.deptId)
      assert.ok(!/HITL|DomainCommand|validator/i.test(d.desc), d.deptId)
    }
  })

  it('each door exposes 1–3 expert previews (no full roster wall)', () => {
    assert.equal(assertHallExpertsBounded(), true)
    for (const d of HALL_DEPT_DOORS) {
      const xs = hallDeptExpertPreviews(d)
      assert.ok(xs.length >= 1 && xs.length <= 3, d.deptId)
      assert.ok(xs.some((x) => x.lead), d.deptId)
      for (const x of xs) {
        assert.ok(x.name.trim().length > 0, x.id)
        assert.ok(x.duty.trim().length > 0, x.id)
        assert.ok(!/撰写专家/.test(x.name), x.name)
      }
    }
  })

  it('short name normalizes 撰写岗名', () => {
    assert.equal(hallExpertShortName('撰写代理师'), '申请代理师')
    assert.equal(hallExpertShortName('撰写专家'), '申请专家')
  })
})
