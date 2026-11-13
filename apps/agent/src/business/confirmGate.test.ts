/**
 * 交卷闸纯函数 · §3.1a / §4.11
 * 跑：node --import tsx --test apps/agent/src/business/confirmGate.test.ts
 */
import assert from 'node:assert/strict'
import { describe, it } from 'node:test'
import {
  AWAITING_ADVANCE_LOCK_HINT,
  canActorConfirm,
  canPassConfirmMaterials,
  canRejectConfirm,
  canSubmitDeliverable,
  confirmDecisionMeta,
  confirmStatusLabel,
  isAwaitingConfirm,
  isDeptAdvanceLocked,
  missingChecklistLabels,
  passConfirmEnabled,
  resolveConfirmActorKind,
} from './confirmGate'

describe('confirmGate §3.1a', () => {
  it('齐套未齐 → 不可交卷，并列出缺项', () => {
    const items = [
      { label: '六项技术内容已填', done: true },
      { label: '四组事实已闭合', done: false },
      { label: '发明人已确认', done: false },
    ]
    assert.equal(canSubmitDeliverable(items), false)
    assert.deepEqual(missingChecklistLabels(items), [
      '四组事实已闭合',
      '发明人已确认',
    ])
  })

  it('齐套全齐 → 可交卷', () => {
    assert.equal(
      canSubmitDeliverable([
        { label: 'a', done: true },
        { label: 'b', done: true },
      ]),
      true,
    )
  })

  it('无人确认态可判定', () => {
    assert.equal(
      isAwaitingConfirm(
        [{ kind: 'disclosure_ready', status: 'pending' }],
        'disclosure_ready',
      ),
      true,
    )
    assert.equal(
      isAwaitingConfirm(
        [{ kind: 'disclosure_ready', status: 'confirmed' }],
        'disclosure_ready',
      ),
      false,
    )
  })

  it('确认页状态标签不把未确认读成已办完', () => {
    assert.equal(confirmStatusLabel('pending'), '待你确认')
    assert.equal(confirmStatusLabel('confirmed'), '已通过')
    assert.equal(confirmStatusLabel('returned'), '已驳回')
  })

  it('立项确认上屏人话；D 码只进档案字段', () => {
    const m = confirmDecisionMeta('go_nogo')
    assert.equal(m.decisionShort, '立项决议')
    assert.doesNotMatch(m.decisionShort, /D\d/)
    assert.equal(m.decisionArchiveCode, 'D1/D2')
    assert.match(m.decisionMeaning, /D1\/D2/)
    assert.match(m.confirmerLabel, /企业|总监|委员会/)
    assert.match(m.suggesterLabel, /专家/)
  })

  it('保护范围/答复策略钮面无 D 码', () => {
    const c = confirmDecisionMeta('claims_ready')
    assert.equal(c.decisionShort, '保护范围确认')
    assert.doesNotMatch(c.decisionShort, /D\d/)
    assert.equal(c.decisionArchiveCode, 'D3')
    const o = confirmDecisionMeta('oa_strategy')
    assert.equal(o.decisionShort, '答复策略确认')
    assert.doesNotMatch(o.decisionShort, /D\d/)
    assert.equal(o.decisionArchiveCode, 'D5')
  })

  it('专家不可自批；人可批', () => {
    assert.equal(canActorConfirm('expert'), false)
    assert.equal(canActorConfirm('human'), true)
    assert.equal(resolveConfirmActorKind('enterprise'), 'human')
    assert.equal(resolveConfirmActorKind('agency', 'expert'), 'expert')
  })

  it('驳回须有意见；空材料不可通过', () => {
    assert.equal(canRejectConfirm(''), false)
    assert.equal(canRejectConfirm('请补实施例'), true)
    assert.equal(
      canPassConfirmMaterials({
        status: 'pending',
        resultPreview: '【成果】—',
      }),
      false,
    )
    assert.equal(
      passConfirmEnabled({
        status: 'pending',
        actor: 'human',
        resultPreview: '【成果】交底包草稿已生成（样机）。',
      }),
      true,
    )
    assert.equal(
      passConfirmEnabled({
        status: 'pending',
        actor: 'expert',
        resultPreview: '【成果】交底包草稿已生成（样机）。',
      }),
      false,
    )
  })

  it('待确认时不可推进主链更后部门', () => {
    assert.equal(
      isDeptAdvanceLocked({
        currentDeptId: 'dept-disclosure',
        targetDeptId: 'dept-draft',
        awaitingConfirm: true,
      }),
      true,
    )
    assert.equal(
      isDeptAdvanceLocked({
        currentDeptId: 'dept-disclosure',
        targetDeptId: 'dept-disclosure',
        awaitingConfirm: true,
      }),
      false,
    )
    assert.equal(
      isDeptAdvanceLocked({
        currentDeptId: 'dept-disclosure',
        targetDeptId: 'dept-draft',
        awaitingConfirm: false,
      }),
      false,
    )
    assert.ok(AWAITING_ADVANCE_LOCK_HINT.includes('待你确认'))
  })
})
