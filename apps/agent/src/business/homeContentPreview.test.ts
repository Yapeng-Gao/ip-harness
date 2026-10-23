/**
 * 跑：node --import tsx --test apps/agent/src/business/homeContentPreview.test.ts
 */
import { describe, it } from 'node:test'
import assert from 'node:assert/strict'
import {
  assertHomeChainAligned,
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
})
