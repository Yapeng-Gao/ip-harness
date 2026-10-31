import assert from 'node:assert/strict'
import { describe, it } from 'node:test'
import { normalizePeerJobTitle, styleTagForDept } from './agentStyle'

describe('agentStyle T8', () => {
  it('normalizes 撰写专家 → 申请专家', () => {
    assert.equal(normalizePeerJobTitle('撰写专家'), '申请专家')
    assert.match(styleTagForDept('dept-draft').line, /过线/)
    assert.ok(styleTagForDept('dept-disclosure').label)
  })
})
