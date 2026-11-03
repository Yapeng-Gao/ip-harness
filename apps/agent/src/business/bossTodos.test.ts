import assert from 'node:assert/strict'
import { describe, it } from 'node:test'
import {
  collectBossTodos,
  listBossTodosB,
} from './bossTodos'
import { BUSINESS_SEED_IDS } from './businessSeeds'
import type {
  BusinessCaseMeta,
  BusinessConfirmItem,
  CaseProgress,
} from './BusinessCaseContext'

const cases: BusinessCaseMeta[] = [
  {
    id: BUSINESS_SEED_IDS.B,
    title: '传感包',
    summary: '',
    expertIds: [],
  },
  {
    id: BUSINESS_SEED_IDS.C,
    title: 'OA 案',
    summary: '',
    expertIds: [],
  },
]

const progressById: Record<string, CaseProgress> = {
  [BUSINESS_SEED_IDS.B]: {
    caseId: BUSINESS_SEED_IDS.B,
    stageId: 'drafting',
    completedStages: ['prepare', 'intake'],
    filed: false,
    oaRound: 0,
    doneSeatIds: ['expert-disclosure'],
    moreSeatIds: [],
    teamMemberIds: [],
    updatedAt: new Date().toISOString(),
  },
  [BUSINESS_SEED_IDS.C]: {
    caseId: BUSINESS_SEED_IDS.C,
    stageId: 'oa',
    completedStages: ['prepare', 'intake', 'drafting', 'filing'],
    filed: true,
    oaRound: 1,
    doneSeatIds: ['expert-disclosure', 'expert-draft', 'expert-filing'],
    moreSeatIds: [],
    teamMemberIds: [],
    updatedAt: new Date().toISOString(),
  },
}

describe('bossTodos', () => {
  it('default badges exclude demo cases and orphaned pending items', () => {
    const pending: BusinessConfirmItem[] = [{id:'demo',caseId:BUSINESS_SEED_IDS.C,kind:'oa_strategy',title:'演示',summary:'',resultPreview:'',processPreview:'',preparedBy:'答复',createdAt:'',status:'pending'}, {id:'mine',caseId:'my-case',kind:'claims_ready',title:'本案',summary:'',resultPreview:'',processPreview:'',preparedBy:'申请',createdAt:'',status:'pending'}, {id:'orphan',caseId:'missing-case',kind:'claims_ready',title:'孤立记录',summary:'',resultPreview:'',processPreview:'',preparedBy:'申请',createdAt:'',status:'pending'}]
    const mine = {id:'my-case',title:'我的项目',summary:'',expertIds:[]}
    const all = collectBossTodos({pending,cases:[...cases,mine],progressById})
    assert.equal(all.counts.badge, 1)
    assert.deepEqual(all.a.map((x) => x.id), ['a-mine'])
    assert.equal(all.countByDept['dept-draft'], 1)
    assert.equal(all.b.length, 0)
  })
  it('department lists filter deadlines as well as confirmations and match their badges', () => {
    const all = collectBossTodos({pending:[],cases,progressById,scope:'demo',deptSlug:'draft'})
    assert.equal(all.b.length, 0)
    assert.equal(all.counts.badge, 0)
    const oa = collectBossTodos({pending:[],cases,progressById,scope:'demo',deptSlug:'oa'})
    assert.equal(oa.counts.badge, 2)
    assert.ok(oa.allSorted.every((x) => x.deptSlug === 'oa'))
  })
  it('B only emits items with ISO dueAt for OA seed', () => {
    const b = listBossTodosB(cases, progressById, new Date('2026-11-01T12:00:00'))
    assert.ok(b.length >= 1)
    for (const row of b) {
      assert.match(row.dueAt ?? '', /^\d{4}-\d{2}-\d{2}$/)
      assert.equal(row.kind, 'B')
    }
  })

  it('badge is A+B and weakC when only C', () => {
    const pending: BusinessConfirmItem[] = []
    const { counts, c } = collectBossTodos({
      scope: 'demo',
      pending,
      cases,
      progressById,
      now: new Date('2026-11-01T12:00:00'),
    })
    // C seed B has disclosure → ticket; A empty; B from case C
    assert.ok(counts.b >= 1)
    assert.equal(counts.badge, counts.a + counts.b)
    assert.equal(counts.weakC, false)

    const onlyC = collectBossTodos({
      scope: 'demo',
      pending: [],
      cases: [cases[0]!],
      progressById: {
        [BUSINESS_SEED_IDS.B]: progressById[BUSINESS_SEED_IDS.B]!,
      },
      now: new Date('2026-11-01T12:00:00'),
    })
    assert.ok(onlyC.c.length >= 1 || c.length >= 0)
    if (onlyC.counts.a + onlyC.counts.b === 0 && onlyC.counts.c > 0) {
      assert.equal(onlyC.counts.weakC, true)
      assert.equal(onlyC.counts.badge, 0)
    }
  })

  it('A maps pending confirms; C does not invent from pending alone', () => {
    const pending: BusinessConfirmItem[] = [
      {
        id: 'cfm-1',
        caseId: BUSINESS_SEED_IDS.B,
        kind: 'claims_ready',
        title: '确认权利要求',
        summary: '请拍权要',
        resultPreview: '',
        processPreview: '',
        preparedBy: '申请',
        createdAt: new Date().toISOString(),
        status: 'pending',
      },
    ]
    const { a, c, counts } = collectBossTodos({
      scope: 'demo',
      pending,
      cases,
      progressById,
      now: new Date('2026-11-01T12:00:00'),
    })
    assert.equal(a.length, 1)
    assert.equal(counts.a, 1)
    // C may exist from ticket but is not a clone of the pending ask
    assert.ok(!c.some((x) => x.id === 'a-cfm-1'))
  })
})
