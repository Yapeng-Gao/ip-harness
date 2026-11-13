import assert from 'node:assert/strict'
import { describe, it } from 'node:test'
import {
  AUX_BODY_LINK_HONEST,
  findManuscriptPart,
  parsePartMaterialId,
  partMaterialId,
  partWorkbenchHref,
  seedBodyForPart,
} from './auxPartBodyLink'

describe('auxPartBodyLink', () => {
  it('material id roundtrip', () => {
    assert.equal(partMaterialId('six-sec'), 'part-six-sec')
    assert.equal(parsePartMaterialId('part-six-sec'), 'six-sec')
    assert.equal(parsePartMaterialId('deliverable'), null)
  })

  it('href carries part query', () => {
    const href = partWorkbenchHref({
      caseId: 'case-x',
      deptId: 'dept-disclosure',
      partId: 'six-sec',
    })
    assert.match(href, /\/depts\/disclosure\?/)
    assert.match(href, /part=six-sec/)
  })

  it('seed body is Office-ish and honest', () => {
    const part = findManuscriptPart('dept-disclosure', 'six-sec')
    assert.ok(part)
    const body = seedBodyForPart({ part: part!, deptLabel: '交底部' })
    assert.match(body, /六段事实稿/)
    assert.match(body, /非真官报/)
    assert.match(body, /技术领域/)
    assert.match(AUX_BODY_LINK_HONEST, /零件联正文/)
  })
})
