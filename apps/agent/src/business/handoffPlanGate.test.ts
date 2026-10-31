import assert from 'node:assert/strict'
import { describe, it } from 'node:test'
import {
  confirmKindForPlanSlug,
  planAdvanceHandoffGate,
} from './handoffPlanGate'

describe('handoffPlanGate', () => {
  it('intake slug → go_nogo', () => {
    assert.equal(confirmKindForPlanSlug('intake'), 'go_nogo')
    assert.equal(confirmKindForPlanSlug('disclosure'), 'disclosure_ready')
    assert.equal(confirmKindForPlanSlug('draft'), 'claims_ready')
  })

  it('未交卷 → 挡', () => {
    const g = planAdvanceHandoffGate({
      activeDeptSlug: 'intake',
      confirms: [],
    })
    assert.equal(g.allow, false)
    if (!g.allow) {
      assert.equal(g.code, 'no_submit')
      assert.equal(g.cta, 'go_chapter')
      assert.match(g.hint, /未交卷/)
    }
  })

  it('待拍板 → 挡', () => {
    const g = planAdvanceHandoffGate({
      activeDeptSlug: 'disclosure',
      confirms: [{ kind: 'disclosure_ready', status: 'pending' }],
    })
    assert.equal(g.allow, false)
    if (!g.allow) {
      assert.equal(g.code, 'awaiting_confirm')
      assert.equal(g.cta, 'go_confirm')
      assert.match(g.hint, /待你拍板/)
    }
  })

  it('已通过 → 放行', () => {
    const g = planAdvanceHandoffGate({
      activeDeptSlug: 'draft',
      confirms: [{ kind: 'claims_ready', status: 'confirmed' }],
    })
    assert.equal(g.allow, true)
    if (g.allow) {
      assert.equal(g.code, 'confirmed')
      assert.match(g.hint, /已通过/)
    }
  })

  it('无闸章 → 放行', () => {
    const g = planAdvanceHandoffGate({
      activeDeptSlug: 'inspire',
      confirms: [],
    })
    assert.equal(g.allow, true)
    if (g.allow) assert.equal(g.code, 'no_hitl_kind')
  })
})
