import assert from 'node:assert/strict'
import { describe, it } from 'node:test'
import {
  evaluateKitChecklist,
  kitLabelsForDeptSlug,
  resolveKitChecklist,
  seedAllKitDone,
  toggleKitDoneLabel,
} from './kitChecklistGate'
import { planAdvanceHandoffGate } from './handoffPlanGate'

describe('kitChecklistGate', () => {
  it('intake labels from DEPT_HANDOFF', () => {
    const labels = kitLabelsForDeptSlug('intake')
    assert.ok(labels.length >= 3)
    assert.ok(labels.some((l) => l.includes('决议') || l.includes('报价')))
  })

  it('resolve uses persisted done labels when touched', () => {
    const items = resolveKitChecklist({
      labels: ['a', 'b', 'c'],
      doneLabels: ['a'],
      kitTouched: true,
      heuristicDone: () => true,
    })
    assert.deepEqual(
      items.map((x) => x.done),
      [true, false, false],
    )
  })

  it('evaluate lists missing', () => {
    const r = evaluateKitChecklist([
      { label: '技术交底正文', done: true },
      { label: '权属声明', done: false },
    ])
    assert.equal(r.ok, false)
    if (!r.ok) {
      assert.deepEqual(r.missing, ['权属声明'])
      assert.match(r.hint, /权属声明/)
    }
  })

  it('toggle and seed all', () => {
    assert.deepEqual(toggleKitDoneLabel([], 'x'), ['x'])
    assert.deepEqual(toggleKitDoneLabel(['x'], 'x'), [])
    assert.deepEqual(seedAllKitDone(['a', 'b']), ['a', 'b'])
  })

  it('plan gate blocks on kit before no_submit', () => {
    const g = planAdvanceHandoffGate({
      activeDeptSlug: 'intake',
      confirms: [],
      checklist: [
        { label: '报价', done: false },
        { label: '决议签署', done: false },
      ],
    })
    assert.equal(g.allow, false)
    if (!g.allow) {
      assert.equal(g.code, 'kit_incomplete')
      assert.equal(g.cta, 'go_kit')
      assert.ok(g.missing && g.missing.length >= 1)
    }
  })

  it('confirmed still allows even if kit empty', () => {
    const g = planAdvanceHandoffGate({
      activeDeptSlug: 'intake',
      confirms: [{ kind: 'go_nogo', status: 'confirmed' }],
      checklist: [{ label: '报价', done: false }],
    })
    assert.equal(g.allow, true)
  })
})
