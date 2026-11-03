import assert from 'node:assert/strict'
import { test } from 'node:test'
import { HALL_DEPT_DOORS, hallDeptHref } from './hallDepts'
import { latestReturnNote } from '../departments/handoffPhase'
import { deptStatus } from '../departments/deptProgress'
import { orgDeptById } from '../departments/orgDepts'
import type { CaseProgress } from './BusinessCaseContext'

test('all direct department entrances preserve destination through case creation', () => {
  for (const door of HALL_DEPT_DOORS) {
    assert.equal(new URL(hallDeptHref(undefined, door), 'http://localhost').searchParams.get('dept'), door.slug)
    assert.equal(hallDeptHref('old-case', door), `/agent/cases/new?dept=${door.slug}`)
  }
})
test('latest confirmation clears an older return note and returned status', () => {
  const pending = [
    { caseId: 'c1', kind: 'disclosure_ready' as const, status: 'confirmed' as const },
    { caseId: 'c1', kind: 'disclosure_ready' as const, status: 'returned' as const, returnNote: '补充测法' },
  ]
  assert.equal(latestReturnNote(pending, 'disclosure_ready'), null)
  const progress = { caseId: 'c1', stageId: 'prepare', doneSeatIds: ['expert-disclosure'] } as CaseProgress
  assert.equal(deptStatus({ dept: orgDeptById('dept-disclosure')!, progress, pending, confirmKind: 'disclosure_ready' }), '已完成')
  assert.equal(latestReturnNote(pending.slice(1), 'disclosure_ready'), '补充测法')
  assert.equal(deptStatus({ dept: orgDeptById('dept-disclosure')!, progress, pending: pending.slice(1), confirmKind: 'disclosure_ready' }), '退回')
})
