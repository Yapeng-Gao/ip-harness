import assert from 'node:assert/strict'
import { describe, it, beforeEach } from 'node:test'
import {
  PREF_STORE_KEY,
  addPreferenceManual,
  listSavedPreferences,
  loadPreferenceStore,
  removePreference,
  setPreferenceDeptHint,
  upsertSavedPreferences,
  prefsHintForDept,
  savePreferenceStore,
} from './preferenceStore'

describe('preferenceStore', () => {
  beforeEach(() => {
    const g = globalThis as { localStorage?: Storage }
    const mem = new Map<string, string>()
    g.localStorage = {
      getItem: (k) => (mem.has(k) ? mem.get(k)! : null),
      setItem: (k, v) => {
        mem.set(k, String(v))
      },
      removeItem: (k) => {
        mem.delete(k)
      },
      clear: () => mem.clear(),
      key: () => null,
      length: 0,
    } as Storage
    savePreferenceStore([])
  })

  it('manual add is readable and removable', () => {
    const p = addPreferenceManual({
      text: '跨案偏好：先钉事实',
      from: 'test',
      applyOnDept: '交底部',
    })
    assert.equal(p.saved, true)
    assert.equal(listSavedPreferences().length, 1)
    assert.equal(prefsHintForDept('交底部').length, 1)
    removePreference(p.id)
    assert.equal(listSavedPreferences().length, 0)
  })

  it('upsertSavedPreferences merges by text', () => {
    upsertSavedPreferences([
      {
        id: 'a',
        caseId: null,
        text: '同文偏好',
        from: 'j1',
        precipitable: false,
        saved: true,
      },
    ])
    upsertSavedPreferences([
      {
        id: 'b',
        caseId: null,
        text: '同文偏好',
        from: 'j2',
        precipitable: false,
        saved: true,
      },
    ])
    assert.equal(listSavedPreferences().length, 1)
    assert.ok(loadPreferenceStore().updatedAt)
    assert.equal(PREF_STORE_KEY.includes('preference'), true)
  })

  it('setPreferenceDeptHint filters hints', () => {
    const p = addPreferenceManual({ text: '通用偏好句', from: 't' })
    setPreferenceDeptHint(p.id, '立项部')
    assert.equal(prefsHintForDept('立项部').some((x) => x.id === p.id), true)
    assert.equal(prefsHintForDept('答复部').some((x) => x.id === p.id), false)
  })
})
