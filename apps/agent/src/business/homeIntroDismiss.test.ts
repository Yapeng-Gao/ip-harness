/**
 * 跑：node --import tsx --test apps/agent/src/business/homeIntroDismiss.test.ts
 */
import { describe, it, beforeEach } from 'node:test'
import assert from 'node:assert/strict'
import {
  HOME_INTRO_DISMISS_LS_KEY,
  isHomeIntroDismissed,
  dismissHomeIntro,
  clearHomeIntroDismiss,
} from './homeIntroDismiss'

const mem = new Map<string, string>()

beforeEach(() => {
  mem.clear()
  const g = globalThis as {
    localStorage?: Storage
  }
  g.localStorage = {
    getItem: (k: string) => (mem.has(k) ? mem.get(k)! : null),
    setItem: (k: string, v: string) => {
      mem.set(k, String(v))
    },
    removeItem: (k: string) => {
      mem.delete(k)
    },
    clear: () => mem.clear(),
    key: () => null,
    get length() {
      return mem.size
    },
  }
})

describe('homeIntroDismiss', () => {
  it('starts not dismissed (first visit expands)', () => {
    assert.equal(isHomeIntroDismissed(), false)
  })

  it('dismissHomeIntro persists and collapses on return', () => {
    assert.equal(dismissHomeIntro(), true)
    assert.equal(isHomeIntroDismissed(), true)
    assert.equal(mem.get(HOME_INTRO_DISMISS_LS_KEY), '1')
  })

  it('clearHomeIntroDismiss restores expanded default', () => {
    dismissHomeIntro()
    clearHomeIntroDismiss()
    assert.equal(isHomeIntroDismissed(), false)
    assert.equal(mem.has(HOME_INTRO_DISMISS_LS_KEY), false)
  })
})
