import assert from 'node:assert/strict'
import { describe, it } from 'node:test'
import {
  buildPlanChain,
  classifyGoal,
  formatCasePlanText,
  movePlanStep,
  nextQueuedStep,
  planStepsForGoal,
  resolveFirstStep,
} from './delegateChain'

describe('delegateChain', () => {
  it('classifies four goal kinds', () => {
    assert.equal(classifyGoal('下周要交这件的权属声明'), 'disclosure_pack')
    assert.equal(classifyGoal('整理一项散热技术，评估如何保护'), 'protect_start')
    assert.equal(classifyGoal('新产品上市前排查 FTO 风险'), 'fto_scan')
    assert.equal(classifyGoal('收到第一次审查意见，需要答复策略'), 'oa_reply')
    assert.equal(classifyGoal('随便聊聊'), 'generic')
  })

  it('builds adjustable plans with first station', () => {
    const steps = planStepsForGoal('protect_start')
    assert.ok(steps.length >= 2)
    const first = resolveFirstStep(steps)
    assert.equal(first?.deptId, 'dept-intake')
    const flipped = steps.map((s) =>
      s.id === 'intake' ? { ...s, enabled: false } : s,
    )
    assert.equal(resolveFirstStep(flipped)?.deptId, 'dept-disclosure')
  })

  it('formats casePlan text with 示意 label', () => {
    const steps = planStepsForGoal('oa_reply')
    const text = formatCasePlanText({
      goalKind: 'oa_reply',
      goalText: '答审查意见',
      steps,
    })
    assert.match(text, /审查答复/)
    assert.match(text, /样机示意/)
  })
})

describe('plan multi-step chain', () => {
  it('moves steps and builds active/queued/skipped', () => {
    const steps = planStepsForGoal('protect_start')
    assert.equal(steps[0]?.id, 'intake')
    const moved = movePlanStep(steps, 'disclosure', 'up')
    assert.equal(moved[0]?.id, 'disclosure')
    assert.equal(moved[1]?.id, 'intake')
    const toggled = moved.map((s) =>
      s.id === 'draft' ? { ...s, enabled: false } : s,
    )
    const chain = buildPlanChain(toggled, 'disclosure')
    assert.equal(chain.find((c) => c.id === 'disclosure')?.status, 'active')
    assert.equal(chain.find((c) => c.id === 'intake')?.status, 'queued')
    assert.equal(chain.find((c) => c.id === 'draft')?.status, 'skipped')
    assert.equal(nextQueuedStep(chain)?.id, 'intake')
  })

  it('format uses 排期 office wording', () => {
    const steps = planStepsForGoal('protect_start')
    const text = formatCasePlanText({
      goalKind: 'protect_start',
      goalText: '散热开案',
      steps,
    })
    assert.match(text, /本稿排期/)
    assert.match(text, /开篇之后待办/)
    assert.match(text, /排期可改稿/)
  })
})
