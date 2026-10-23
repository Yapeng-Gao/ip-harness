/**
 * 跑：node --import tsx --test apps/agent/src/business/pendingDeptQuery.test.ts
 */
import assert from 'node:assert/strict'
import { describe, it } from 'node:test'
import {
  confirmKindFromDeptQuery,
  deptSlugForConfirmKind,
  normalizeDeptQuery,
  pendingDetailPath,
} from './pendingDeptQuery.ts'

describe('pendingDeptQuery', () => {
  it('normalizes decision → intake', () => {
    assert.equal(normalizeDeptQuery('decision'), 'intake')
    assert.equal(normalizeDeptQuery('disclosure'), 'disclosure')
  })

  it('maps dept query to confirm kind', () => {
    assert.equal(confirmKindFromDeptQuery('disclosure'), 'disclosure_ready')
    assert.equal(confirmKindFromDeptQuery('research'), 'research_ready')
    assert.equal(confirmKindFromDeptQuery('decision'), 'go_nogo')
    assert.equal(confirmKindFromDeptQuery('intake'), 'go_nogo')
    assert.equal(confirmKindFromDeptQuery('nope'), null)
  })

  it('maps kind back to slug', () => {
    assert.equal(deptSlugForConfirmKind('disclosure_ready'), 'disclosure')
    assert.equal(deptSlugForConfirmKind('go_nogo'), 'intake')
  })

  it('builds detail path with dept', () => {
    assert.equal(pendingDetailPath('bcf-1'), '/agent/pending/bcf-1')
    assert.equal(
      pendingDetailPath('bcf-1', 'disclosure'),
      '/agent/pending/bcf-1?dept=disclosure',
    )
    assert.equal(
      pendingDetailPath('bcf-1', 'decision'),
      '/agent/pending/bcf-1?dept=intake',
    )
  })
})
