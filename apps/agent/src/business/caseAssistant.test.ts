/**
 * 案子助手巡检 · 本案计划补丁
 * 跑：node --import tsx --test apps/agent/src/business/caseAssistant.test.ts
 */
import assert from 'node:assert/strict'
import { describe, it } from 'node:test'
import {
  buildCaseAssistantSuggestions,
  patchCasePlan,
} from './caseAssistant'

describe('caseAssistant', () => {
  it('caps at 3 and prioritizes pending confirm links', () => {
    const s = buildCaseAssistantSuggestions({
      stageId: 'drafting',
      activeSeat: 'expert-draft',
      pending: [
        {
          id: 'bcf-1',
          kind: 'claims_ready',
          title: '确认权利要求',
        },
      ],
    })
    assert.ok(s.length <= 3)
    assert.equal(s[0]?.action.type, 'go_confirm')
    if (s[0]?.action.type === 'go_confirm') {
      assert.equal(s[0].action.confirmId, 'bcf-1')
    }
    assert.match(s[0]?.title ?? '', /建议退回|建议确认/)
  })

  it('offers proxy feedback when no pending', () => {
    const s = buildCaseAssistantSuggestions({
      stageId: 'drafting',
      activeSeat: 'expert-draft',
      pending: [],
    })
    assert.ok(s.length >= 1 && s.length <= 3)
    assert.ok(
      s.some(
        (x) =>
          x.action.type === 'proxy_feedback' || x.action.type === 'word_hint',
      ),
    )
  })
})

describe('patchCasePlan', () => {
  it('complete_from_patrol appends stage/seat patrol lines without dropping base', () => {
    const base = '案子：边缘调度\n目标：实用新型\n下一步：查新'
    const next = patchCasePlan({
      mode: 'complete_from_patrol',
      currentPlan: base,
      stageId: 'drafting',
      activeSeat: 'expert-draft',
      stageTitle: '撰写申请',
      seatLabel: '撰写',
    })
    assert.match(next, /边缘调度/)
    assert.match(next, /巡检补全/)
    assert.match(next, /当前节点：撰写/)
    assert.doesNotMatch(next, /部门/)
    assert.ok(next.length > base.length)
  })

  it('rewrite replaces skeleton with scripted plan for current stage', () => {
    const next = patchCasePlan({
      mode: 'rewrite',
      currentPlan: '旧计划一行',
      stageId: 'intake',
      activeSeat: 'expert-research',
      stageTitle: '立项',
      seatLabel: '查新',
      caseTitle: '传感校准模组',
    })
    assert.doesNotMatch(next, /旧计划一行/)
    assert.match(next, /传感校准模组|本案计划/)
    assert.match(next, /当前在「查新」/)
    assert.doesNotMatch(next, /部门/)
    assert.match(next, /改写/)
  })

  it('rewrite prepends客户事实 block when present', () => {
    const current = [
      '案子：边缘调度',
      '目标：实用新型',
      '客户事实：保护=算法；材料=缺；缓急=急',
      '下一步：旧下一步',
    ].join('\n')
    const next = patchCasePlan({
      mode: 'rewrite',
      currentPlan: current,
      stageId: 'intake',
      activeSeat: 'expert-research',
      stageTitle: '立项',
      seatLabel: '查新',
      caseTitle: '边缘调度',
    })
    assert.match(next, /客户事实：保护=算法/)
    assert.match(next, /助手改写/)
    assert.ok(next.indexOf('客户事实') < next.indexOf('助手改写'))
  })
})
