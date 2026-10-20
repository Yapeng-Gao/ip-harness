/**
 * 部门花名册 · agent-dept-expert-team
 * 跑：node --import tsx --test apps/agent/src/business/deptRoster.test.ts
 */
import assert from 'node:assert/strict'
import { describe, it } from 'node:test'
import {
  BUSINESS_DEFAULT_DEPT_IDS,
  DEFAULT_DEPT_COUNT,
  applyTeamDrop,
  deptByLeadSeat,
  deptLabel,
  departmentsForCase,
  isPeerPlaceholder,
  moreDepartmentsForCase,
  navigablePeerSeatIds,
  peersForDept,
  buildTeamRecommendPlan,
  recommendTeamForStage,
  resolveSidebarClick,
} from './deptRoster'
import { expertsInNode, teamRosterRows } from './businessSeats'

describe('deptRoster', () => {
  it('defaults to exactly 7 departments with stable lead seats', () => {
    assert.equal(DEFAULT_DEPT_COUNT, 7)
    assert.equal(BUSINESS_DEFAULT_DEPT_IDS.length, 7)
    assert.deepEqual(
      BUSINESS_DEFAULT_DEPT_IDS.map((d) => d.leadSeatId),
      [
        'expert-research',
        'expert-intake',
        'expert-disclosure',
        'expert-draft',
        'expert-figure',
        'expert-filing',
        'expert-oa',
      ],
    )
  })

  it('labels departments with 部 suffix', () => {
    assert.equal(deptLabel('dept-research'), '查新部')
    assert.equal(deptLabel('dept-draft'), '撰写部')
    assert.equal(deptByLeadSeat('expert-oa')?.id, 'dept-oa')
  })

  it('draft dept has one session peer and placeholders for features/qa', () => {
    const peers = peersForDept('dept-draft')
    assert.ok(peers.length >= 3)
    const session = peers.find((p) => p.kind === 'session')
    const ph = peers.filter((p) => p.kind === 'placeholder')
    assert.ok(session)
    assert.equal(session!.sessionSeatId, 'expert-draft-spec')
    assert.ok(ph.length >= 2)
  })

  it('each default dept has ≥2 peer roles (process split)', () => {
    for (const d of BUSINESS_DEFAULT_DEPT_IDS) {
      assert.ok(
        d.peers.length >= 2,
        `${d.id} should have ≥2 peers, got ${d.peers.length}`,
      )
    }
  })

  it('sidebar click on placeholder peer is not navigable', () => {
    const peers = peersForDept('dept-research')
    const peerId = peers[0]!.id
    const resolved = resolveSidebarClick(peerId)
    assert.equal(resolved.navigable, false)
    assert.equal(resolved.leadSeatId, 'expert-research')
  })

  it('sidebar click on draft session peer navigates to expert-draft-spec', () => {
    const peers = peersForDept('dept-draft')
    const session = peers.find((p) => p.kind === 'session')!
    const resolved = resolveSidebarClick(session.id)
    assert.equal(resolved.navigable, true)
    assert.equal(resolved.leadSeatId, 'expert-draft')
    assert.equal(resolved.seatId, 'expert-draft-spec')
  })

  it('sidebar click on lead is navigable', () => {
    const resolved = resolveSidebarClick('expert-draft')
    assert.equal(resolved.navigable, true)
    assert.equal(resolved.seatId, 'expert-draft')
  })

  it('departmentsForCase keeps layout and prep in more only', () => {
    const base = departmentsForCase({ moreSeatIds: [] })
    assert.equal(base.length, 7)
    assert.ok(!base.some((d) => d.id === 'dept-layout'))

    const withLayoutMain = departmentsForCase({
      moreSeatIds: ['expert-layout'],
    })
    assert.equal(withLayoutMain.length, 7)
    assert.ok(!withLayoutMain.some((d) => d.id === 'dept-layout'))

    const more = moreDepartmentsForCase({
      moreSeatIds: ['expert-landscape', 'expert-mining', 'expert-layout'],
    })
    assert.ok(more.some((d) => d.id === 'dept-landscape'))
    assert.ok(more.some((d) => d.id === 'dept-mining'))
    assert.ok(more.some((d) => d.id === 'dept-layout'))
    assert.equal(moreDepartmentsForCase({ moreSeatIds: [] }).length, 0)
  })

  it('recommendTeamForStage returns current lead + up/downstream', () => {
    const ids = recommendTeamForStage('drafting')
    assert.ok(ids.includes('expert-disclosure'))
    assert.ok(ids.includes('expert-draft'))
    assert.ok(ids.includes('expert-figure'))
    assert.equal(new Set(ids).size, ids.length)
  })

  it('buildTeamRecommendPlan explains gaps vs current', () => {
    const plan = buildTeamRecommendPlan('drafting', ['expert-draft'])
    assert.ok(plan.blurb.length > 0)
    assert.ok(plan.reasons.length === plan.ids.length)
    assert.ok(plan.missingIds.includes('expert-disclosure'))
    assert.ok(!plan.missingIds.includes('expert-draft'))
  })

  it('navigablePeerSeatIds includes draft-spec', () => {
    assert.deepEqual(navigablePeerSeatIds(), ['expert-draft-spec'])
  })

  it('applyTeamDrop adds lead seat from payload', () => {
    assert.deepEqual(
      applyTeamDrop(['expert-research'], 'expert-draft'),
      ['expert-research', 'expert-draft'],
    )
    assert.deepEqual(
      applyTeamDrop(['expert-draft'], 'expert-draft'),
      ['expert-draft'],
    )
    assert.deepEqual(applyTeamDrop([], 'peer:x:y'), [])
    assert.deepEqual(applyTeamDrop([], 'expert-draft-spec'), [
      'expert-draft-spec',
    ])
  })

  it('team roster uses node names and only splits 撰写', () => {
    const rows = teamRosterRows([
      'expert-research',
      'expert-draft',
      'expert-figure',
    ])
    assert.deepEqual(
      rows.map((r) => r.label),
      ['查新', '权要', '说明书', '附图'],
    )
    assert.equal(expertsInNode('expert-research').length, 0)
    assert.equal(rows.find((r) => r.id === 'expert-draft')?.group, '撰写')
    assert.equal(rows.find((r) => r.id === 'expert-research')?.group, undefined)
  })

  it('recommend reasons use node names', () => {
    const plan = buildTeamRecommendPlan('intake', [])
    assert.ok(plan.reasons.every((r) => !r.reason.includes('部')))
    assert.match(plan.reasons.map((r) => r.reason).join(' '), /查新|立项/)
  })
})
