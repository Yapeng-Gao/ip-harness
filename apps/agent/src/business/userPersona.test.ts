import assert from 'node:assert/strict'
import { describe, it } from 'node:test'
import {
  receptionExamplesForPersona,
  type UserPersonaSeed,
} from './userPersona'

describe('receptionExamplesForPersona', () => {
  it('orders OA-first when persona prefers oa', () => {
    const seed: UserPersonaSeed = {
      roleHint: 'agency',
      jobTendencies: ['oa', 'draft'],
      familiarity: 'used_similar',
      skipped: false,
      updatedAt: '2026-11-01',
    }
    const ex = receptionExamplesForPersona(seed)
    assert.equal(ex[0]?.slugHint, 'oa')
  })

  it('defaults disclosure-first without persona', () => {
    const ex = receptionExamplesForPersona(null)
    assert.equal(ex[0]?.slugHint, 'disclosure')
  })
})
