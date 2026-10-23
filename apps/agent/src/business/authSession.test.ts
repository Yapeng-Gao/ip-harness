/**
 * 跑：node --import tsx --test apps/agent/src/business/authSession.test.ts
 */
import { describe, it, beforeEach } from 'node:test'
import assert from 'node:assert/strict'
import {
  AUTH_SESSION_LS_KEY,
  isLoggedIn,
  loginDemo,
  logoutDemo,
} from './authSession'

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

describe('authSession', () => {
  it('starts logged out', () => {
    assert.equal(isLoggedIn(), false)
  })

  it('loginDemo sets session', () => {
    assert.equal(loginDemo(), true)
    assert.equal(isLoggedIn(), true)
    assert.equal(mem.get(AUTH_SESSION_LS_KEY), '1')
  })

  it('logoutDemo clears session', () => {
    loginDemo()
    logoutDemo()
    assert.equal(isLoggedIn(), false)
    assert.equal(mem.has(AUTH_SESSION_LS_KEY), false)
  })
})
