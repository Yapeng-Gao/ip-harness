import assert from 'node:assert/strict'
import { describe, it, beforeEach } from 'node:test'
import {
  ACTIVITY_CATEGORY_LABEL,
  COMPANY_ACTIVITY_LS_KEY,
  artifactPreviewLine,
  clearCompanyActivity,
  elapsedLabel,
  emitCompanyActivity,
  loadCompanyActivity,
  pendingCardFacts,
  resetCompanyActivityState,
  roleDotClass,
  seedCompanyActivityIfEmpty,
  stageLabelForConfirmKind,
  subscribeCompanyActivity,
} from './companyActivity'
import { handoffRouteForSeat, pickHandoffPhrase, HANDOFF_PHRASES } from './handoffCue'
import { roomLiveStatusForDoor } from './roomLiveStatus'
import { HALL_DEPT_DOORS } from './hallDepts'
import type { CaseProgress } from './BusinessCaseContext'

function memoryStorage() {
  const mem = new Map<string, string>()
  const g = globalThis as { localStorage?: Storage }
  g.localStorage = {
    getItem: (k) => (mem.has(k) ? mem.get(k)! : null),
    setItem: (k, v) => {
      mem.set(k, String(v))
    },
    removeItem: (k) => {
      mem.delete(k)
    },
    clear: () => mem.clear(),
    key: (i) => [...mem.keys()][i] ?? null,
    get length() {
      return mem.size
    },
  } as Storage
}

function progress(caseId: string, patch: Partial<CaseProgress> = {}): CaseProgress {
  return {
    caseId,
    stageId: 'intake',
    completedStages: [],
    filed: false,
    oaRound: 0,
    doneSeatIds: [],
    moreSeatIds: [],
    teamMemberIds: [],
    updatedAt: '2026-11-13T00:00:00.000Z',
    ...patch,
  }
}

describe('companyActivity', () => {
  beforeEach(() => {
    memoryStorage()
    resetCompanyActivityState()
  })

  it('appends categorized events and persists', () => {
    const event = emitCompanyActivity({
      category: 'speak',
      roleId: 'expert-disclosure',
      roleName: '林交底',
      caseId: 'c1',
      message: '六段还缺效果数据。',
    })
    assert.equal(event.category, 'speak')
    assert.equal(ACTIVITY_CATEGORY_LABEL.speak, '发言')
    const loaded = loadCompanyActivity()
    assert.equal(loaded.length, 1)
    assert.equal(loaded[0]?.message, '六段还缺效果数据。')
    assert.equal(roleDotClass('expert-disclosure'), 'bg-[#007aff]')
    assert.ok(localStorage.getItem(COMPANY_ACTIVITY_LS_KEY))
  })

  it('notifies subscribers and caps the log', () => {
    const seen: number[] = []
    const unsub = subscribeCompanyActivity((events) => seen.push(events.length))
    for (let i = 0; i < 90; i++) {
      emitCompanyActivity({
        category: 'pass',
        roleId: 'expert-intake',
        roleName: '立项',
        message: `通过 ${i}`,
      })
    }
    assert.equal(loadCompanyActivity().length, 80)
    assert.equal(loadCompanyActivity()[0]?.message, '通过 89')
    assert.ok(seen.at(-1) === 80)
    unsub()
    clearCompanyActivity()
    assert.equal(loadCompanyActivity().length, 0)
  })

  it('corrupt storage falls back to empty and seed writes once', () => {
    localStorage.setItem(COMPANY_ACTIVITY_LS_KEY, '{')
    assert.deepEqual(loadCompanyActivity(), [])
    localStorage.removeItem(COMPANY_ACTIVITY_LS_KEY)
    const first = seedCompanyActivityIfEmpty()
    assert.ok(first.some((e) => e.category === 'handoff'))
    emitCompanyActivity({
      category: 'critique',
      roleId: 'expert-oa',
      roleName: '沈答复',
      message: '这里站不住。',
    })
    const second = seedCompanyActivityIfEmpty()
    assert.equal(second[0]?.message, '这里站不住。')
    assert.equal(second.length, first.length + 1)
  })

  it('handoff phrase stays in the pool and disclosure pack routes to draft', () => {
    const phrase = pickHandoffPhrase(() => 0)
    assert.equal(phrase, HANDOFF_PHRASES[0])
    assert.ok(HANDOFF_PHRASES.includes(pickHandoffPhrase(() => 0.99) as (typeof HANDOFF_PHRASES)[number]))
    const route = handoffRouteForSeat('expert-disclosure')
    assert.equal(route?.fromSlug, 'disclosure')
    assert.equal(route?.toSlug, 'draft')
    assert.equal(route?.artifact, '交底包')
    assert.equal(handoffRouteForSeat('expert-figure'), null)
  })

  it('pending card carries stage, elapsed and artifact preview', () => {
    const now = Date.parse('2026-11-13T00:02:05.000Z')
    const facts = pendingCardFacts({
      kind: 'claims_ready',
      createdAt: '2026-11-13T00:00:00.000Z',
      resultPreview: '【成果】权利要求 1–8：独立权项覆盖传感采样。',
      now,
    })
    assert.equal(facts.stage, '撰写')
    assert.equal(stageLabelForConfirmKind('oa_strategy'), '待确认')
    assert.equal(facts.elapsed, '2:05')
    assert.equal(facts.artifactPreview.startsWith('权利要求'), true)
    assert.equal(artifactPreviewLine(''), '暂无成果预览')
    assert.equal(elapsedLabel('不是日期'), '登记于 不是日期')
  })

  it('room status follows pending confirms and otherwise stays idle', () => {
    const intake = HALL_DEPT_DOORS.find((d) => d.slug === 'intake')!
    const inspire = HALL_DEPT_DOORS.find((d) => d.slug === 'inspire')!
    const waiting = roomLiveStatusForDoor(intake, [
      {
        progress: progress('case-a'),
        confirms: [
          { caseId: 'case-a', kind: 'go_nogo', status: 'pending' },
        ],
      },
    ])
    const quiet = roomLiveStatusForDoor(inspire, [
      { progress: progress('case-a'), confirms: [] },
    ])
    assert.equal(waiting, '待确认')
    assert.equal(quiet, '待机')
  })
})
