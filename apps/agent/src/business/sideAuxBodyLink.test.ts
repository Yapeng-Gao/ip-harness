import assert from 'node:assert/strict'
import { describe, it } from 'node:test'
import {
  auxHookToSideTarget,
  findSideAuxPart,
  parseSideAuxMaterialId,
  seedBodyForSideAux,
  sideAuxHostDeptId,
  sideAuxMaterialId,
  sideAuxWorkbenchHref,
  SIDE_AUX_BODY_HONEST,
} from './sideAuxBodyLink'

describe('sideAuxBodyLink', () => {
  it('host mapping', () => {
    assert.equal(sideAuxHostDeptId('research'), 'dept-disclosure')
    assert.equal(sideAuxHostDeptId('figure'), 'dept-draft')
    assert.equal(sideAuxHostDeptId('file'), 'dept-oa')
  })

  it('href carries side + sidePart', () => {
    const h = sideAuxWorkbenchHref({
      caseId: 'c1',
      sideId: 'research',
      partId: 'hit-list',
    })
    assert.match(h, /\/depts\/disclosure\?/)
    assert.match(h, /side=research/)
    assert.match(h, /sidePart=hit-list/)
  })

  it('material id roundtrip', () => {
    const id = sideAuxMaterialId('figure', 'sheet')
    assert.equal(id, 'side-figure-sheet')
    assert.deepEqual(parseSideAuxMaterialId(id), {
      sideId: 'figure',
      partId: 'sheet',
    })
    assert.equal(parseSideAuxMaterialId('part-six-sec'), null)
  })

  it('seed body honest + extras', () => {
    const part = findSideAuxPart('file', 'pack')!
    const body = seedBodyForSideAux({ sideId: 'file', part })
    assert.match(body, /递交包目录/)
    assert.match(body, new RegExp(SIDE_AUX_BODY_HONEST.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')))
    assert.match(body, /禁真递交/)
  })

  it('aux hook maps', () => {
    assert.deepEqual(auxHookToSideTarget('research-pre'), {
      sideId: 'research',
      partId: 'hit-list',
    })
    assert.deepEqual(auxHookToSideTarget('fig-hook'), {
      sideId: 'figure',
      partId: 'sheet',
    })
  })
})
