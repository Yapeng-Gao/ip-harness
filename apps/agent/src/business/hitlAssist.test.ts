/**
 * HITL 辅审表
 * 跑：node --import tsx --test apps/agent/src/business/hitlAssist.test.ts
 */
import assert from 'node:assert/strict'
import { describe, it } from 'node:test'
import {
  buildHitlAssistReview,
  hitlAssistTitle,
} from './hitlAssist'
import type { BusinessConfirmKind } from './businessSeats'

const KINDS: BusinessConfirmKind[] = [
  'research_ready',
  'go_nogo',
  'disclosure_ready',
  'claims_ready',
  'figures_ready',
  'file_authorize',
  'oa_strategy',
  'layout_adjust',
]

describe('hitlAssist', () => {
  it('covers every confirm kind with ≤3 reasons', () => {
    for (const kind of KINDS) {
      const r = buildHitlAssistReview(kind)
      assert.equal(r.kind, kind)
      assert.ok(r.reasons.length >= 1 && r.reasons.length <= 3)
      assert.ok(r.returnNote.length > 4)
      assert.ok(r.ownerSelfCheck.length > 4)
      assert.match(r.disclaimer, /样机/)
      assert.ok(hitlAssistTitle(kind).includes('助手审校'))
    }
  })

  it('includes return-verdict samples (not rubber-stamp)', () => {
    assert.equal(buildHitlAssistReview('disclosure_ready').verdict, 'return')
    assert.equal(buildHitlAssistReview('claims_ready').verdict, 'return')
    assert.equal(buildHitlAssistReview('layout_adjust').verdict, 'return')
    assert.equal(buildHitlAssistReview('research_ready').verdict, 'approve')
  })

  it('flips to approve after revise pass', () => {
    const r = buildHitlAssistReview('disclosure_ready', {
      pass: 'after_revise',
      priorReturnNote: '效果数据偏少',
    })
    assert.equal(r.verdict, 'approve')
    assert.equal(r.pass, 'after_revise')
    assert.ok(r.reasons.some((x) => x.includes('效果数据偏少')))
  })
})
