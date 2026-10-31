/**
 * 跑：node --import tsx --test apps/agent/src/business/entryGate.test.ts
 */
import assert from 'node:assert/strict'
import { describe, it } from 'node:test'
import { evaluateEntryGate } from './entryGate'

describe('entryGate', () => {
  it('blocks draft without disclosure', () => {
    const r = evaluateEntryGate({
      deptId: 'dept-draft',
      doneSeatIds: [],
    })
    assert.equal(r.ok, false)
    assert.ok(r.title.includes('⑤'))
  })

  it('allows draft after disclosure done', () => {
    const r = evaluateEntryGate({
      deptId: 'dept-draft',
      doneSeatIds: ['expert-disclosure'],
    })
    assert.equal(r.ok, true)
  })

  it('blocks oa without filed/draft', () => {
    const r = evaluateEntryGate({
      deptId: 'dept-oa',
      doneSeatIds: ['expert-disclosure'],
      filed: false,
    })
    assert.equal(r.ok, false)
  })

  it('allows oa when filed', () => {
    const r = evaluateEntryGate({
      deptId: 'dept-oa',
      doneSeatIds: [],
      filed: true,
    })
    assert.equal(r.ok, true)
  })

  it('bypass works', () => {
    const r = evaluateEntryGate({
      deptId: 'dept-draft',
      doneSeatIds: [],
      bypass: true,
    })
    assert.equal(r.ok, true)
  })
})

describe('entryGate B2 / agency escort', () => {
  it('enterprise without disclosure → blocked (B2)', () => {
    const r = evaluateEntryGate({
      deptId: 'dept-draft',
      doneSeatIds: [],
      disclosureConfirmed: false,
    })
    assert.equal(r.ok, false)
    assert.match(r.title, /进入门槛未过/)
  })

  it('agency escort bypasses B2 shell without claiming 交底过线', () => {
    const r = evaluateEntryGate({
      deptId: 'dept-draft',
      doneSeatIds: [],
      disclosureConfirmed: false,
      agencyEscort: true,
    })
    assert.equal(r.ok, true)
    assert.match(r.title, /陪同/)
    assert.match(r.reason, /不装交底已过线/)
  })
})
