/** CheapSignals：console error · pageerror · requestfailed（可白名单） */

import type { Page } from 'playwright'
import { isWhitelistedSignal } from './rules.js'
import type { CheapSignal } from './types.js'

export class CheapSignalCollector {
  private buffer: CheapSignal[] = []
  private attached = false

  attach(page: Page): void {
    if (this.attached) return
    this.attached = true

    page.on('console', (msg) => {
      const type = msg.type()
      if (type !== 'error' && type !== 'warning') return
      const entry: CheapSignal = {
        kind: 'console',
        level: type === 'warning' ? 'warn' : 'error',
        text: msg.text(),
        url: page.url(),
        at: new Date().toISOString(),
      }
      entry.whitelisted = isWhitelistedSignal(entry)
      this.buffer.push(entry)
    })

    page.on('pageerror', (err) => {
      const entry: CheapSignal = {
        kind: 'pageerror',
        text: err.message || String(err),
        url: page.url(),
        at: new Date().toISOString(),
      }
      entry.whitelisted = isWhitelistedSignal(entry)
      this.buffer.push(entry)
    })

    page.on('requestfailed', (req) => {
      const failure = req.failure()
      const entry: CheapSignal = {
        kind: 'requestfailed',
        text: `${req.method()} ${req.url()} → ${failure?.errorText ?? 'failed'}`,
        url: req.url(),
        at: new Date().toISOString(),
      }
      entry.whitelisted = isWhitelistedSignal(entry)
      this.buffer.push(entry)
    })
  }

  /** Drain signals since last call (includes whitelisted for observability). */
  drain(): CheapSignal[] {
    const out = this.buffer.slice()
    this.buffer = []
    return out
  }

  /** Only non-whitelisted signals that should feed judge/findings. */
  drainActionable(): CheapSignal[] {
    return this.drain().filter((s) => !isWhitelistedSignal(s))
  }

  peek(): CheapSignal[] {
    return this.buffer.slice()
  }
}
