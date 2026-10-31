import assert from 'node:assert/strict'
import { describe, it } from 'node:test'
import {
  PROF_AUX_HONEST,
  SIDE_AUX_DEPTS,
  auxBundleFor,
  methodLabelFromSkill,
} from './professionalAuxParts'

describe('professionalAuxParts', () => {
  it('disclosure has manuscript parts + aux hooks', () => {
    const b = auxBundleFor('dept-disclosure')
    assert.ok(b.parts.length >= 2)
    assert.ok(b.parts.some((p) => p.label.includes('权属') || p.label.includes('六段')))
    assert.ok(b.aux.length >= 1)
  })

  it('side aux depts are non-main doors', () => {
    assert.ok(SIDE_AUX_DEPTS.length >= 3)
    assert.match(PROF_AUX_HONEST, /非真官报/)
    assert.ok(SIDE_AUX_DEPTS.every((d) => d.honest.length > 0))
  })

  it('methodLabel strips engine-y names', () => {
    assert.equal(methodLabelFromSkill('MCP tool'), '方法配置（示意）')
    assert.ok(methodLabelFromSkill('六段采集').includes('六段'))
  })
})
