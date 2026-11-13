import assert from 'node:assert/strict'
import { describe, it } from 'node:test'
import {
  kitHoldLabelsForDeptSlug,
  kitProgressForPlanStep,
  kitProgressMeta,
  mergeKitDoneWithStep,
  shrinkKitDoneToStep,
  suggestKitDoneFromStep,
} from './kitStepSync'

describe('kitStepSync', () => {
  const labels = ['评分卡汇总', '报价', '国际路径意向', '会议纪要', '决议签署']

  it('intake hold is 决议签署', () => {
    assert.deepEqual(kitHoldLabelsForDeptSlug('intake'), ['决议签署'])
  })

  it('step 0 → no auto', () => {
    assert.deepEqual(
      suggestKitDoneFromStep({
        labels,
        stepIndex: 0,
        stepCount: 5,
        holdLabels: ['决议签署'],
      }),
      [],
    )
  })

  it('mid steps grow fillable; never auto hold', () => {
    const mid = suggestKitDoneFromStep({
      labels,
      stepIndex: 2,
      stepCount: 5,
      holdLabels: ['决议签署'],
    })
    assert.ok(mid.length >= 1)
    assert.ok(!mid.includes('决议签署'))
    const last = suggestKitDoneFromStep({
      labels,
      stepIndex: 4,
      stepCount: 5,
      holdLabels: ['决议签署'],
    })
    assert.deepEqual(last, ['评分卡汇总', '报价', '国际路径意向', '会议纪要'])
  })

  it('merge is monotonic', () => {
    const m = mergeKitDoneWithStep({
      labels,
      prevDone: ['决议签署', '报价'],
      stepIndex: 2,
      stepCount: 5,
      holdLabels: ['决议签署'],
    })
    assert.ok(m.includes('报价'))
    assert.ok(m.includes('决议签署'))
  })

  it('progress meta phases', () => {
    const empty = kitProgressMeta(
      labels.map((label) => ({ label, done: false })),
    )
    assert.equal(empty.phase, 'empty')
    const partial = kitProgressMeta([
      { label: 'a', done: true },
      { label: 'b', done: false },
    ])
    assert.equal(partial.phase, 'partial')
    assert.match(partial.short, /齐套中/)
    const full = kitProgressMeta([
      { label: 'a', done: true },
      { label: 'b', done: true },
    ])
    assert.equal(full.phase, 'complete')
  })

  it('plan step progress from kitDoneByDept', () => {
    const p = kitProgressForPlanStep({
      deptSlug: 'intake',
      kitDoneByDept: { intake: ['评分卡汇总', '报价'] },
    })
    assert.equal(p.done, 2)
    assert.equal(p.total, 5)
    assert.equal(p.phase, 'partial')
  })

  it('shrink on rewind drops auto beyond step', () => {
    const s = shrinkKitDoneToStep({
      labels,
      prevDone: ['评分卡汇总', '报价', '国际路径意向', '会议纪要'],
      stepIndex: 1,
      stepCount: 5,
      holdLabels: ['决议签署'],
    })
    assert.ok(s.length < 4)
    assert.ok(!s.includes('会议纪要') || s.length <= 2)
  })
})
