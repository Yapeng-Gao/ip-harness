/**
 * 席内 loop 口令
 * 跑：node --import tsx --test apps/agent/src/business/seatLoops.test.ts
 */
import assert from 'node:assert/strict'
import { describe, it } from 'node:test'
import {
  loopActionsForSeat,
  parseSeatLoopIntent,
  resolveLoopDemo,
} from './seatLoops'

describe('seatLoops', () => {
  it('exposes heal/ask/oa actions by seat', () => {
    assert.ok(
      loopActionsForSeat('expert-disclosure').some((a) => a.id === 'ask'),
    )
    assert.ok(
      loopActionsForSeat('expert-research').some((a) => a.id === 'heal'),
    )
    assert.ok(
      loopActionsForSeat('expert-draft').some((a) => a.id === 'heal'),
    )
    assert.ok(
      loopActionsForSeat('expert-oa', { filed: true }).some(
        (a) => a.id === 'oa_round',
      ),
    )
    assert.equal(
      loopActionsForSeat('expert-oa', { filed: false }).some(
        (a) => a.id === 'oa_round',
      ),
      false,
    )
  })

  it('shows hitl_reject only when pending', () => {
    assert.equal(
      loopActionsForSeat('expert-draft', { hasPending: false }).some(
        (a) => a.id === 'hitl_reject',
      ),
      false,
    )
    assert.ok(
      loopActionsForSeat('expert-draft', { hasPending: true }).some(
        (a) => a.id === 'hitl_reject',
      ),
    )
  })

  it('parses chat intents', () => {
    assert.equal(
      parseSeatLoopIntent('跑一下覆盖度自修复', 'expert-research')?.id,
      'heal',
    )
    assert.equal(
      parseSeatLoopIntent('缺项追问一轮', 'expert-disclosure')?.id,
      'ask',
    )
    assert.equal(
      parseSeatLoopIntent('下一通到达', 'expert-oa', { filed: true })?.id,
      'oa_round',
    )
    assert.equal(
      parseSeatLoopIntent('请交底补效果', 'expert-draft'),
      null,
    )
  })

  it('resolves research escalate specially', () => {
    const esc = loopActionsForSeat('expert-research').find(
      (a) => a.id === 'heal_escalate',
    )!
    assert.equal(
      resolveLoopDemo('expert-research', esc),
      'research_escalate',
    )
  })
})
