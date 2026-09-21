/**
 * 跨席 feedback 口令与边表
 * 跑：node --import tsx --test apps/agent/src/business/seatFeedback.test.ts
 */
import assert from 'node:assert/strict'
import { describe, it } from 'node:test'
import {
  SEAT_FEEDBACK_EDGES,
  feedbackEdgesFrom,
  feedbackNeedsMoreSeat,
  feedbackToolName,
  parseUpstreamFeedbackIntent,
  upstreamAdjustScript,
} from './seatFeedback'

describe('seatFeedback', () => {
  it('covers F5/F6/F9 outer-loop edges', () => {
    assert.ok(SEAT_FEEDBACK_EDGES.length >= 12)
    const pairs = SEAT_FEEDBACK_EDGES.map((e) => `${e.from}->${e.to}`)
    assert.ok(pairs.includes('expert-draft->expert-disclosure'))
    assert.ok(pairs.includes('expert-figure->expert-draft'))
    assert.ok(pairs.includes('expert-oa->expert-research'))
    assert.ok(pairs.includes('expert-oa->expert-draft'))
    assert.ok(pairs.includes('expert-enforcement->expert-layout'))
    assert.ok(pairs.includes('expert-research->expert-inspire'))
    assert.ok(pairs.includes('expert-intake->expert-inspire'))
  })

  it('lists multiple edges from draft', () => {
    const edges = feedbackEdgesFrom('expert-draft')
    assert.equal(edges.length, 2)
    assert.deepEqual(
      edges.map((e) => e.to).sort(),
      ['expert-disclosure', 'expert-research'],
    )
  })

  it('parses 请交底 vs 请查新 from draft', () => {
    const a = parseUpstreamFeedbackIntent(
      '请交底补一段效果数据',
      'expert-draft',
    )
    assert.equal(a?.toSeat, 'expert-disclosure')
    const b = parseUpstreamFeedbackIntent(
      '请查新补检索对比文件',
      'expert-draft',
    )
    assert.equal(b?.toSeat, 'expert-research')
  })

  it('ignores rewind-like phrases', () => {
    assert.equal(
      parseUpstreamFeedbackIntent('回到第2步', 'expert-draft'),
      null,
    )
  })

  it('parses OA and flywheel intents', () => {
    assert.equal(
      parseUpstreamFeedbackIntent('请查新补充检索创造性', 'expert-oa')
        ?.toSeat,
      'expert-research',
    )
    assert.equal(
      parseUpstreamFeedbackIntent('请撰写修清楚性术语', 'expert-oa')?.toSeat,
      'expert-draft',
    )
    assert.equal(
      parseUpstreamFeedbackIntent('布局漏洞回流', 'expert-enforcement')
        ?.toSeat,
      'expert-layout',
    )
  })

  it('marks layout/inspire as more-seat targets', () => {
    assert.equal(feedbackNeedsMoreSeat('expert-layout'), true)
    assert.equal(feedbackNeedsMoreSeat('expert-inspire'), true)
    assert.equal(feedbackNeedsMoreSeat('expert-disclosure'), false)
  })

  it('maps tool names and v2 scripts', () => {
    assert.equal(feedbackToolName('expert-research'), 'commercial_patent_search')
    assert.match(
      upstreamAdjustScript(
        'expert-layout',
        'expert-enforcement',
        '漏洞',
      ),
      /布局 v2/,
    )
  })
})
