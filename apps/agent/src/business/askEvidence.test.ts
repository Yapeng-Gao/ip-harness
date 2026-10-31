import assert from 'node:assert/strict'
import { describe, it } from 'node:test'
import { buildAskEvidence } from './askEvidence'

describe('askEvidence T4', () => {
  it('marks gaps when previews thin — no fake all-green', () => {
    const b = buildAskEvidence({
      kind: 'disclosure_ready',
      summary: '短',
      resultPreview: '',
      processPreview: '',
    })
    assert.equal(b.signReady, false)
    assert.ok(b.gapLabels.length >= 1)
  })

  it('signReady when four pieces resolvable', () => {
    const b = buildAskEvidence({
      kind: 'oa_strategy',
      summary: '请确认答复策略',
      resultPreview:
        '【成果】建议限缩双密封+错位。\n【对比】对照 D1 仅公开水道。',
      processPreview: '【办理过程】理由分类创造性；汇入补充检索。',
    })
    assert.equal(b.signReady, true)
    assert.equal(b.pieces.length, 4)
    assert.ok(b.pieces.every((p) => p.present))
  })
})
