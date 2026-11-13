/**
 * 全局待确认收件箱 · 种子案过滤
 * 跑：node --import tsx --test apps/agent/src/business/pendingInbox.test.ts
 */
import assert from 'node:assert/strict'
import { describe, it } from 'node:test'
import { BUSINESS_SEED_IDS, isBusinessSeedCaseId } from './businessSeeds'

describe('pendingInbox seed filter', () => {
  it('recognizes all business seed case ids', () => {
    for (const id of Object.values(BUSINESS_SEED_IDS)) {
      assert.equal(isBusinessSeedCaseId(id), true)
    }
    assert.equal(isBusinessSeedCaseId('proj-user-new-1'), false)
  })
})
