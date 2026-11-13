import assert from 'node:assert/strict'
import { describe, it } from 'node:test'
import {
  OFFICIAL_DEMO_HONEST,
  looksLikeLiveSubmitCta,
  officialDemoKindFromSide,
  sampleFilingPackDemo,
  sampleFilingReceiptDemo,
  sampleResearchSummaryDemo,
} from './officialDemoHonest'
import { seedBodyForSideAux, findSideAuxPart } from './sideAuxBodyLink'

describe('officialDemoHonest', () => {
  it('maps side kinds', () => {
    assert.equal(officialDemoKindFromSide('research'), 'research')
    assert.equal(officialDemoKindFromSide('file'), 'file')
    assert.equal(officialDemoKindFromSide('figure'), 'figure')
  })

  it('guards live-submit CTA labels', () => {
    assert.equal(looksLikeLiveSubmitCta('授权递交示意'), false)
    assert.equal(looksLikeLiveSubmitCta('真递交官方'), true)
    assert.equal(looksLikeLiveSubmitCta('一键递交'), true)
    assert.equal(looksLikeLiveSubmitCta('提交至局'), true)
    assert.equal(looksLikeLiveSubmitCta('预览递交包（示意）'), false)
  })

  it('research sample is watermarked DEMO not live numbers', () => {
    const s = sampleResearchSummaryDemo()
    assert.match(s, /DEMO-CN/)
    assert.match(s, /示意/)
    assert.match(s, /非真|样机|示意稿件/)
    assert.ok(!/CN20\d{2}\d{6}\.\d/.test(s), 'no real-looking CNIPA serial')
  })

  it('receipt sample has DEMO case no official channel', () => {
    const s = sampleFilingReceiptDemo()
    assert.match(s, /DEMO-示意-0000/)
    assert.match(s, /无 · 本页不连局端|不连局端/)
    assert.match(s, /不产生/)
  })

  it('pack demo bans live submit copy', () => {
    const s = sampleFilingPackDemo()
    assert.match(s, /禁真递交官方/)
    assert.match(s, /无「提交至局」/)
  })

  it('side aux hit-list / receipt use deepened samples', () => {
    const hit = findSideAuxPart('research', 'hit-list')!
    const body = seedBodyForSideAux({ sideId: 'research', part: hit })
    assert.match(body, /DEMO-CN/)
    assert.match(body, /OFFICIAL_DEMO|示意稿件|非真检索|样机示意|非真官报/.source ? /示意/ : /示意/)
    assert.ok(body.includes(OFFICIAL_DEMO_HONEST) || /非真检索/.test(body))

    const rc = findSideAuxPart('file', 'receipt')!
    const rb = seedBodyForSideAux({ sideId: 'file', part: rc })
    assert.match(rb, /DEMO-示意-0000/)
    assert.match(rb, /禁真递交|非真递交|不连局端/)
  })
})
