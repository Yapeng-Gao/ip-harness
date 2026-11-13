/**
 * HITL 退回改稿脚本
 * 跑：node --import tsx --test apps/agent/src/business/hitlReturnRevise.test.ts
 */
import assert from 'node:assert/strict'
import { describe, it } from 'node:test'
import {
  buildHitlReviseScript,
  hitlReviseChipLabel,
} from './hitlReturnRevise'

describe('hitlReturnRevise', () => {
  it('builds revise lines that mention the note', () => {
    const s = buildHitlReviseScript(
      'disclosure_ready',
      'expert-disclosure',
      '效果数据偏少',
    )
    assert.equal(s.seatId, 'expert-disclosure')
    assert.ok(s.lines.length >= 3)
    assert.ok(s.lines.some((l) => l.includes('效果数据偏少')))
    assert.ok(s.lines.some((l) => l.includes('交卷请确认')))
    assert.equal(s.rewindToIndex(6), 4)
    assert.equal(s.rewindToIndex(1), 0)
  })

  it('labels chips by kind', () => {
    assert.match(hitlReviseChipLabel('research_ready'), /再查/)
    assert.match(hitlReviseChipLabel('disclosure_ready'), /改一版/)
  })
})
