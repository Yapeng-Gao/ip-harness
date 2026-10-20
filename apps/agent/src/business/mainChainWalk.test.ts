/**
 * 主链走通 · 阶段推进表（对照 confirmItem）
 * 跑：node --import tsx --test apps/agent/src/business/mainChainWalk.test.ts
 *
 * 业务主链：立项 → 交底 → 查新 → 撰写 → 再查新 → 附图 → 递交 → 审查答复
 */
import assert from 'node:assert/strict'
import { describe, it } from 'node:test'
import {
  BUSINESS_STAGES,
  SEAT_CONFIRM_KIND,
  applyMainChainConfirm,
  currentSeatForProgress,
  nextSeatAfterConfirm,
  type BusinessConfirmKind,
  type MainChainSnapshot,
} from './businessSeats'
import type { ProjectExpertId } from '../projects/types'
import { getProjectExpert } from '../projects/experts'

const MAIN_CHAIN: {
  seat: ProjectExpertId
  kind: BusinessConfirmKind
  next: ProjectExpertId
}[] = [
  { seat: 'expert-intake', kind: 'go_nogo', next: 'expert-disclosure' },
  { seat: 'expert-disclosure', kind: 'disclosure_ready', next: 'expert-research' },
  { seat: 'expert-research', kind: 'research_ready', next: 'expert-draft' },
  { seat: 'expert-draft', kind: 'claims_ready', next: 'expert-research' },
  { seat: 'expert-research', kind: 'research_ready', next: 'expert-figure' },
  { seat: 'expert-figure', kind: 'figures_ready', next: 'expert-filing' },
  { seat: 'expert-filing', kind: 'file_authorize', next: 'expert-oa' },
  { seat: 'expert-oa', kind: 'oa_strategy', next: 'expert-oa' },
]

describe('mainChainWalk', () => {
  it('every main-chain seat has confirm kind + HITL step', () => {
    for (const { seat, kind } of MAIN_CHAIN) {
      assert.equal(SEAT_CONFIRM_KIND[seat], kind)
      const def = getProjectExpert(seat)
      assert.ok(def.steps.some((s) => s.triggersHitl), `${seat} needs HITL step`)
    }
  })

  it('walks disclosure search, spec search, then figures', () => {
    let prog: MainChainSnapshot = {
      stageId: 'intake',
      doneSeatIds: [],
      completedStages: ['prepare'],
      filed: false,
      oaRound: 0,
      researchPass: 0,
    }

    let researchConfirms = 0
    for (const step of MAIN_CHAIN) {
      const highlight = currentSeatForProgress({
        stageId: prog.stageId,
        doneSeatIds: prog.doneSeatIds,
      })
      if (step.kind !== 'oa_strategy') {
        assert.equal(
          highlight,
          step.seat,
          `before ${step.kind} pass=${prog.researchPass}: highlight ${highlight}`,
        )
      }
      const next = nextSeatAfterConfirm(step.kind, prog.researchPass)
      assert.equal(next, step.next)
      prog = applyMainChainConfirm(prog, step.kind)
      if (step.kind === 'research_ready') researchConfirms += 1
      if (step.kind === 'disclosure_ready') {
        assert.equal(next, 'expert-research')
        assert.ok(!prog.doneSeatIds.includes('expert-research'))
      }
      if (step.kind === 'claims_ready') {
        assert.equal(prog.researchPass, 1)
        assert.ok(!prog.doneSeatIds.includes('expert-research'))
      }
      if (step.kind === 'figures_ready') {
        assert.equal(prog.stageId, 'filing')
        assert.equal(prog.researchPass, 2)
      }
    }

    assert.equal(researchConfirms, 2)
    assert.ok(prog.filed)
    assert.equal(prog.stageId, 'oa')
  })

  it('drafting stage is disclosure → search → draft → figures', () => {
    const drafting = BUSINESS_STAGES.find((s) => s.id === 'drafting')
    assert.deepEqual(drafting?.seatIds, [
      'expert-disclosure',
      'expert-research',
      'expert-draft',
      'expert-figure',
    ])
  })
})
