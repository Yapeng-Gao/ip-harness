import assert from 'node:assert/strict'
import { describe, it } from 'node:test'
import {
  sortProfessionalCards,
  thickenStatus,
} from './professionalThicken'
import { ORG_DEPTS } from '../departments/orgDepts'
import type { CaseProgress } from './BusinessCaseContext'

const prog: CaseProgress = {
  caseId: 'c1',
  stageId: 'drafting',
  completedStages: [],
  filed: false,
  oaRound: 0,
  doneSeatIds: [],
  moreSeatIds: [],
  teamMemberIds: [],
  updatedAt: '',
}

describe('professionalThicken', () => {
  it('thickens gap/work with detail', () => {
    const dept = ORG_DEPTS.find((d) => d.id === 'dept-disclosure')!
    const gap = thickenStatus('待确认', dept, prog)
    assert.equal(gap.kind, 'gap')
    assert.match(gap.text, /缺口/)
    assert.ok(gap.detail)
    const work = thickenStatus('进行中', dept, prog)
    assert.equal(work.kind, 'work')
    assert.match(work.detail!, /主责/)
  })

  it('sorts gap before work before idle', () => {
    const sorted = sortProfessionalCards([
      { line: { kind: 'idle' as const } },
      { line: { kind: 'gap' as const } },
      { line: { kind: 'work' as const } },
    ])
    assert.deepEqual(
      sorted.map((s) => s.line.kind),
      ['gap', 'work', 'idle'],
    )
  })
})
