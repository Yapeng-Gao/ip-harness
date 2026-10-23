import { describe, it } from 'node:test'
import assert from 'node:assert/strict'
import { pickLatestCaseId, isEntryRole } from './entryRole'

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
