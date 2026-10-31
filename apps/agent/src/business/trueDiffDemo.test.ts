import assert from 'node:assert/strict'
import { describe, it } from 'node:test'
import {
  seedTrueDiff,
  sideBySideRows,
  TRUE_DIFF_HONEST_LABEL,
  SEED_DIFF_LEFT,
  SEED_DIFF_RIGHT,
} from './trueDiffDemo'
import { lineDiff } from './lineDiff'

describe('trueDiffDemo', () => {
  it('seed has add and del', () => {
    const d = seedTrueDiff()
    assert.ok(d.stats.added >= 1)
    assert.ok(d.stats.removed >= 1)
    assert.ok(d.rows.some((r) => r.kind === 'add'))
    assert.ok(d.rows.some((r) => r.kind === 'del'))
  })

  it('sideBySide mirrors unified', () => {
    const lines = lineDiff('a\nb', 'a\nc')
    const rows = sideBySideRows(lines)
    assert.equal(rows.length, lines.length)
    const del = rows.find((r) => r.kind === 'del')
    const add = rows.find((r) => r.kind === 'add')
    assert.equal(del?.left, 'b')
    assert.equal(del?.right, null)
    assert.equal(add?.right, 'c')
    assert.equal(add?.left, null)
  })

  it('honest label + seed texts non-empty', () => {
    assert.match(TRUE_DIFF_HONEST_LABEL, /非真官报/)
    assert.ok(SEED_DIFF_LEFT.includes('微通道'))
    assert.ok(SEED_DIFF_RIGHT.includes('泄漏自检'))
  })
})
