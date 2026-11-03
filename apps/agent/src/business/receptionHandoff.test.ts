import assert from 'node:assert/strict'
import { describe, it } from 'node:test'
import {
  buildReceptionHandoff,
  parseReceptionHandoff,
  receptionHandoffForDept,
} from './receptionHandoff'

describe('receptionHandoff', () => {
  it('build marks override when selected ≠ primary', () => {
    const h = buildReceptionHandoff({
      goalText: '想递申请',
      selectedSlug: 'oa',
      primarySlug: 'draft',
      intents: ['递交申请'],
    })
    assert.equal(h.overriddenPrimary, true)
    assert.equal(h.goalText, '想递申请')
  })

  it('parse roundtrip keeps fields', () => {
    const h = buildReceptionHandoff({
      selectedSlug: 'disclosure',
      primarySlug: 'disclosure',
      fileNames: ['a.pdf'],
      roughGaps: ['缺交底'],
    })
    const again = parseReceptionHandoff(JSON.parse(JSON.stringify(h)))
    assert.equal(again?.selectedSlug, 'disclosure')
    assert.deepEqual(again?.fileNames, ['a.pdf'])
    assert.equal(again?.overriddenPrimary, false)
  })

  it('receptionHandoffForDept filters other depts', () => {
    const h = buildReceptionHandoff({
      selectedSlug: 'disclosure',
      primarySlug: 'disclosure',
    })
    assert.equal(receptionHandoffForDept(h, 'disclosure'), h)
    assert.equal(receptionHandoffForDept(h, 'draft'), null)
  })
})
