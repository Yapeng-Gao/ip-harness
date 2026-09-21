/**
 * 默认业务席深度验收（查新/立项/撰写/交底/附图/递交/OA）
 * 跑：node --import tsx --test apps/agent/src/business/seatStepBodies.research.test.ts
 */
import assert from 'node:assert/strict'
import { describe, it } from 'node:test'
import {
  buildProgressiveArtifact,
  buildProgressiveWorklog,
} from './seatStepBodies'
import { deliverableForExpert } from '../projects/patentDeliverables'
import { RESEARCH_DEPTH_STEPS } from '../projects/pack/researchDepth'
import { INTAKE_DEPTH_STEPS } from '../projects/pack/intakeDepth'
import { DRAFT_DEPTH_STEPS } from '../projects/pack/draftDepth'
import { DISCLOSURE_DEPTH_STEPS } from '../projects/pack/disclosureDepth'
import { FIGURE_DEPTH_STEPS } from '../projects/pack/figureDepth'
import { FILING_DEPTH_STEPS } from '../projects/pack/filingDepth'
import { OA_DEPTH_STEPS } from '../projects/pack/oaDepth'
import type { ExpertStepDef, ProjectExpertId } from '../projects/types'

function assertDeepSeat(
  label: string,
  steps: ExpertStepDef[],
  expertId: ProjectExpertId,
  mustMatch: RegExp[],
) {
  describe(label, () => {
    const dual = deliverableForExpert(expertId)
    assert.ok(dual, `missing deliverable ${expertId}`)

    it('meets step count and HITL on last', () => {
      assert.ok(steps.length >= 5, `${label} steps=${steps.length}`)
      assert.equal(steps[steps.length - 1]?.triggersHitl, true)
      assert.ok(steps.every((s) => s.structuredBody && s.structuredBody.length > 30))
    })

    it('artifact scannable at last step', () => {
      const body = buildProgressiveArtifact(dual!, steps, steps.length - 1)
      for (const re of mustMatch) {
        assert.match(body, re)
      }
      assert.ok(body.length > 500, `${label} artifact too short: ${body.length}`)
    })

    it('worklog grows', () => {
      const early = buildProgressiveWorklog(dual!, steps, 0)
      const late = buildProgressiveWorklog(dual!, steps, steps.length - 1)
      assert.ok(late.length > early.length)
    })
  })
}

assertDeepSeat('research', RESEARCH_DEPTH_STEPS, 'expert-research', [
  /划定检索范围/,
  /CN114882901A/,
])
assertDeepSeat('intake', INTAKE_DEPTH_STEPS, 'expert-intake', [/区别特征/, /Go/])
assertDeepSeat('disclosure', DISCLOSURE_DEPTH_STEPS, 'expert-disclosure', [
  /六段/,
  /实施例/,
])
assertDeepSeat('draft', DRAFT_DEPTH_STEPS, 'expert-draft', [/权项|特征表/, /超范围/])
assertDeepSeat('figure', FIGURE_DEPTH_STEPS, 'expert-figure', [/图号/, /术语/])
assertDeepSeat('filing', FILING_DEPTH_STEPS, 'expert-filing', [/齐套/, /授权/])
assertDeepSeat('oa', OA_DEPTH_STEPS, 'expert-oa', [/审查意见|一通/, /超范围/])
