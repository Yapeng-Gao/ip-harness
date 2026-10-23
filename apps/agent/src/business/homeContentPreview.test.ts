/**
 * 跑：node --import tsx --test apps/agent/src/business/homeContentPreview.test.ts
 */
import { describe, it } from 'node:test'
import assert from 'node:assert/strict'
import {
  assertHomeChainAligned,
  assertHomeExpertsBounded,
  HOME_CATEGORY_TITLE,
  HOME_CHAIN_STATIONS,
  HOME_DEMO_CASE,
  HOME_SAMPLE_DELIVERABLES,
} from './homeContentPreview'
import { MAIN_CHAIN_DEPT_IDS } from '../departments/orgDepts'

describe('homeContentPreview', () => {
  it('seven stations align with MAIN_CHAIN_DEPT_IDS', () => {
    assert.equal(assertHomeChainAligned(), true)
    assert.equal(HOME_CHAIN_STATIONS.length, 7)
    assert.deepEqual(
      HOME_CHAIN_STATIONS.map((s) => s.deptId),
      [...MAIN_CHAIN_DEPT_IDS],
    )
  })

  it('each station exposes 1–3 expert post labels for expand-on-click', () => {
    assert.equal(assertHomeExpertsBounded(), true)
    for (const s of HOME_CHAIN_STATIONS) {
      assert.ok(s.shortLabel.length > 0, s.deptId)
      assert.ok(s.experts.length >= 1 && s.experts.length <= 3, s.deptId)
    }
  })

  it('demo case highlights a main-chain station', () => {
    assert.ok(
      HOME_CHAIN_STATIONS.some((s) => s.deptId === HOME_DEMO_CASE.currentDeptId),
    )
    assert.ok(HOME_DEMO_CASE.title.length > 0)
    assert.ok(HOME_DEMO_CASE.currentDeptLabel.includes('部'))
  })

  it('sample deliverables are 2–3 patent artifacts', () => {
    assert.ok(HOME_SAMPLE_DELIVERABLES.length >= 2)
    assert.ok(HOME_SAMPLE_DELIVERABLES.length <= 3)
    assert.ok(HOME_SAMPLE_DELIVERABLES.some((d) => d.status === '待确认'))
  })

  it('category title is a short shelf headline', () => {
    assert.ok(HOME_CATEGORY_TITLE.includes('知识产权') || HOME_CATEGORY_TITLE.includes('专利'))
    assert.ok(HOME_CATEGORY_TITLE.length <= 20)
  })
})
