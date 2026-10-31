import assert from 'node:assert/strict'
import { describe, it } from 'node:test'
import { lineDiff, diffStats } from './lineDiff'

describe('lineDiff', () => {
  it('shows add/del for changed lines', () => {
    const lines = lineDiff('a\nb\nc', 'a\nx\nc')
    const stats = diffStats(lines)
    assert.equal(stats.removed, 1)
    assert.equal(stats.added, 1)
    assert.ok(lines.some((l) => l.type === 'del' && l.text === 'b'))
    assert.ok(lines.some((l) => l.type === 'add' && l.text === 'x'))
  })

  it('identical → all same', () => {
    const lines = lineDiff('one\ntwo', 'one\ntwo')
    assert.ok(lines.every((l) => l.type === 'same'))
  })
})
