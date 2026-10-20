/**
 * 本案计划驱动开案落点
 * 跑：node --import tsx --test apps/agent/src/business/casePlanDrive.test.ts
 */
import assert from 'node:assert/strict'
import { describe, it } from 'node:test'
import {
  buildCasePlanFromIntake,
  extractCasePlanFactBlock,
  resolveCasePlanStart,
  type CaseIntakeAnswers,
} from './casePlanDrive'

const answers: CaseIntakeAnswers = {
  protectWhat: '边缘调度算法',
  materialsReady: '缺',
  urgency: '急',
}

describe('resolveCasePlanStart', () => {
  it('reads explicit 起点席 / 阶段 / 下一步 markers', () => {
    const plan = [
      '案子：传感校准',
      '起点席：expert-disclosure',
      '阶段：drafting',
      '下一步：先补交底六段再进撰写',
    ].join('\n')
    const r = resolveCasePlanStart({ casePlan: plan })
    assert.equal(r.stageId, 'drafting')
    assert.equal(r.seatId, 'expert-disclosure')
    assert.match(r.nextStepLabel, /交底/)
  })

  it('falls back to skipPrepare + route when plan empty', () => {
    const skip = resolveCasePlanStart({ skipPrepare: true, routeId: 'intake' })
    assert.equal(skip.stageId, 'intake')
    assert.equal(skip.seatId, 'expert-intake')

    const prep = resolveCasePlanStart({ skipPrepare: false, routeId: 'prepare' })
    assert.equal(prep.stageId, 'prepare')
  })

  it('parses 起点节点 and legacy 起点部门 when no seat marker', () => {
    const node = resolveCasePlanStart({
      casePlan: '起点节点：撰写\n下一步：写权要草稿',
      skipPrepare: true,
    })
    assert.equal(node.seatId, 'expert-draft')
    assert.equal(node.stageId, 'drafting')
  })

  it('parses 起点部门 Chinese label when no seat marker', () => {
    const r = resolveCasePlanStart({
      casePlan: '办理起点：撰写部主责开干\n下一步：写权要草稿',
      skipPrepare: true,
    })
    assert.equal(r.seatId, 'expert-draft')
    assert.equal(r.stageId, 'drafting')
  })
})

describe('buildCasePlanFromIntake', () => {
  it('emits structured plan with facts + start markers', () => {
    const plan = buildCasePlanFromIntake({
      title: '边缘调度模组',
      summary: '',
      answers,
      skipPrepare: true,
      routeId: 'intake',
    })
    assert.match(plan, /边缘调度模组/)
    assert.match(plan, /客户事实|保护/)
    assert.match(plan, /边缘调度算法/)
    assert.match(plan, /材料[=：]缺/)
    assert.match(plan, /缓急[=：]急/)
    assert.match(plan, /起点节点：立项/)
    assert.doesNotMatch(plan, /起点部门/)
    assert.match(plan, /起点席：expert-intake/)
    assert.match(plan, /阶段：intake/)
    assert.match(plan, /下一步：/)
  })

  it('materials 缺 nudges toward disclosure when not skip-prepare false path', () => {
    const plan = buildCasePlanFromIntake({
      title: '缺材料案',
      answers: { ...answers, materialsReady: '缺', urgency: '不急' },
      skipPrepare: true,
      routeId: 'drafting',
    })
    assert.match(plan, /expert-disclosure|交底/)
  })
})

describe('extractCasePlanFactBlock', () => {
  it('keeps 案子/目标/客户事实 lines for rewrite prepend', () => {
    const plan = [
      '案子：A',
      '目标：实用新型',
      '客户事实：保护=阀体密封；材料=缺；缓急=急',
      '办理起点：已跳过准备',
      '下一步：查新',
    ].join('\n')
    const facts = extractCasePlanFactBlock(plan)
    assert.match(facts, /案子：A/)
    assert.match(facts, /客户事实/)
    assert.doesNotMatch(facts, /下一步：查新/)
  })
})
