import { describe, it } from 'node:test'
import assert from 'node:assert/strict'
import {
  isCaseLevelShellPath,
  rankCasesForSwitcher,
  rewriteCasePath,
} from './caseShellSwitcher'

describe('caseShellSwitcher', () => {
  it('rewrites company / dept / professional paths', () => {
    assert.equal(
      rewriteCasePath('/agent/cases/a', 'b'),
      '/agent/cases/b',
    )
    assert.equal(
      rewriteCasePath('/agent/cases/a/depts/disclosure', 'b'),
      '/agent/cases/b/depts/disclosure',
    )
    assert.equal(
      rewriteCasePath('/agent/cases/a/professional', 'b'),
      '/agent/cases/b/professional',
    )
  })

  it('detects case-level shell only', () => {
    assert.equal(isCaseLevelShellPath('/agent'), false)
    assert.equal(isCaseLevelShellPath('/agent/cases'), false)
    assert.equal(isCaseLevelShellPath('/agent/cases/new'), false)
    assert.equal(isCaseLevelShellPath('/agent/cases/c1'), true)
    assert.equal(isCaseLevelShellPath('/agent/cases/c1/depts/oa'), true)
  })

  it('ranks by updatedAt', () => {
    const rows = rankCasesForSwitcher(
      [
        { id: '1', title: '旧' },
        { id: '2', title: '新' },
      ],
      (id) => (id === '2' ? '2026-10-31T12:00:00Z' : '2026-10-01T00:00:00Z'),
      undefined,
      6,
    )
    assert.equal(rows[0]!.id, '2')
  })
})
