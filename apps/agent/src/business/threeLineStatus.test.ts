import { describe, it } from 'node:test'
import assert from 'node:assert/strict'
import { inProgressTicketLine, threeLineStatus } from './threeLineStatus'

describe('threeLineStatus', () => {
  it('keeps three names distinct and all unmet when empty', () => {
    const rows = threeLineStatus({
      doneSeatIds: [],
      filed: false,
      oaRound: 0,
      completedStages: [],
    })
    assert.equal(rows.length, 3)
    assert.equal(rows[0]!.label, '④全绿')
    assert.equal(rows[1]!.label, '⑤过线')
    assert.equal(rows[2]!.label, '⑥本轮 D 过线')
    assert.equal(rows.every((r) => !r.reached), true)
    assert.match(rows[0]!.not, /⑤过线/)
    assert.match(rows[1]!.not, /④全绿/)
    assert.match(rows[2]!.not, /⑤过线/)
  })

  it('d4 green does not imply d5 pass', () => {
    const rows = threeLineStatus({
      doneSeatIds: ['expert-disclosure'],
      filed: false,
      oaRound: 0,
      completedStages: [],
    })
    assert.equal(rows[0]!.reached, true)
    assert.equal(rows[1]!.reached, false)
    assert.match(rows[1]!.detail, /尚未过线/)
  })

  it('filed+oaRound is not D pass without oa seat', () => {
    const rows = threeLineStatus({
      doneSeatIds: ['expert-disclosure', 'expert-draft'],
      filed: true,
      oaRound: 1,
      completedStages: ['filing'],
    })
    assert.equal(rows[0]!.reached, true)
    assert.equal(rows[1]!.reached, true)
    assert.equal(rows[2]!.reached, false)
    assert.match(rows[2]!.detail, /D 未过线/)
  })

  it('inProgressTicketLine prefers ④→⑤ when green but not pass', () => {
    const line = inProgressTicketLine({
      doneSeatIds: ['expert-disclosure'],
      filed: false,
      oaRound: 0,
      completedStages: [],
    })
    assert.match(line ?? '', /④→⑤/)
  })
})
