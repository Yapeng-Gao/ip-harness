import { describe, it } from 'node:test'
import assert from 'node:assert/strict'
import {
  pickLatestCaseId,
  isEntryRole,
  resolveEntryLandingPath,
  resolveRolePrimaryPath,
} from './entryRole'

describe('entryRole', () => {
  it('isEntryRole', () => {
    assert.equal(isEntryRole('agency'), true)
    assert.equal(isEntryRole('enterprise'), true)
    assert.equal(isEntryRole('other'), false)
  })

  it('pickLatestCaseId prefers higher updatedAt', () => {
    const cases = [{ id: 'a' }, { id: 'b' }, { id: 'c' }]
    const id = pickLatestCaseId(
      cases,
      (cid) =>
        ({ a: '2026-01-01T00:00:00.000Z', b: '2026-10-01T00:00:00.000Z', c: '2026-05-01T00:00:00.000Z' })[
          cid
        ],
    )
    assert.equal(id, 'b')
  })

  it('pickLatestCaseId uses log at when newer than updatedAt', () => {
    const cases = [{ id: 'a' }, { id: 'b' }]
    const id = pickLatestCaseId(
      cases,
      (cid) =>
        ({ a: '2026-01-01T00:00:00.000Z', b: '2026-02-01T00:00:00.000Z' })[cid],
      (cid) =>
        ({ a: '2026-09-01T00:00:00.000Z', b: '2026-03-01T00:00:00.000Z' })[cid],
    )
    assert.equal(id, 'a')
  })

  it('pickLatestCaseId falls back to first case when empty scores', () => {
    const cases = [{ id: 'x' }, { id: 'y' }]
    assert.equal(
      pickLatestCaseId(cases, () => undefined),
      'x',
    )
  })

  it('pickLatestCaseId empty list', () => {
    assert.equal(pickLatestCaseId([], () => undefined), undefined)
  })
})

describe('resolveEntryLandingPath', () => {
  const cases = [{ id: 'a' }, { id: 'b' }]
  const updated = (cid: string) =>
    ({ a: '2026-01-01T00:00:00.000Z', b: '2026-10-01T00:00:00.000Z' })[cid]

  it('always lands on /agent home (agency)', () => {
    assert.equal(resolveEntryLandingPath('agency', cases, updated), '/agent')
  })

  it('always lands on /agent home (enterprise)', () => {
    assert.equal(resolveEntryLandingPath('enterprise', cases, updated), '/agent')
  })

  it('always lands on /agent home (enterprise, no cases)', () => {
    assert.equal(
      resolveEntryLandingPath('enterprise', [], () => undefined),
      '/agent',
    )
  })
})

describe('resolveRolePrimaryPath', () => {
  const cases = [{ id: 'a' }, { id: 'b' }]
  const updated = (cid: string) =>
    ({ a: '2026-01-01T00:00:00.000Z', b: '2026-10-01T00:00:00.000Z' })[cid]

  it('agency → cases list', () => {
    assert.equal(resolveRolePrimaryPath('agency', cases, updated), '/agent/cases')
  })

  it('enterprise with cases → latest case home', () => {
    assert.equal(
      resolveRolePrimaryPath('enterprise', cases, updated),
      '/agent/cases/b',
    )
  })

  it('enterprise without cases → new', () => {
    assert.equal(
      resolveRolePrimaryPath('enterprise', [], () => undefined),
      '/agent/cases/new',
    )
  })
})
