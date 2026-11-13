import assert from 'node:assert/strict'
import { describe, it, beforeEach } from 'node:test'
import {
  TEACH_FADE_KEY,
  dismissTeachTip,
  loadTeachFade,
  reopenAllTeachTips,
  shouldShowTeachTip,
  teachCopyForDept,
  clearForceShow,
  saveTeachFade,
} from './teachingFade'

describe('teachingFade T7', () => {
  beforeEach(() => {
    const mem = new Map<string, string>()
    ;(globalThis as { localStorage?: Storage }).localStorage = {
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
    saveTeachFade({ dismissed: {}, forceShow: false })
  })

  it('first visit shows; dismiss hides; reopen forces', () => {
    assert.equal(shouldShowTeachTip('dept-disclosure'), true)
    dismissTeachTip('dept-disclosure')
    assert.equal(shouldShowTeachTip('dept-disclosure'), false)
    assert.equal(shouldShowTeachTip('dept-draft'), true)
    reopenAllTeachTips()
    assert.equal(shouldShowTeachTip('dept-disclosure'), true)
    clearForceShow()
    assert.ok(TEACH_FADE_KEY)
    assert.match(teachCopyForDept('dept-disclosure').askLine, /拍/)
    assert.equal(loadTeachFade().forceShow, false)
  })
})
