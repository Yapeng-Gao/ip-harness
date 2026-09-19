/** 轻量 Network 摘要（Playwright request/response）；默认关，CasePack opt-in */

import type { Page, Request } from 'playwright'
import type { NetworkFailure, NetworkSummary } from './types.js'

const SLOW_MS = 2000
const MAX_FAILURES_RETAINED = 20

type Pending = { method: string; url: string; startedAt: number }

export class NetworkTelemetryCollector {
  private attached = false
  private pending = new Map<Request, Pending>()
  private failures: NetworkFailure[] = []
  private slowCount = 0
  private requestCount = 0

  attach(page: Page): void {
    if (this.attached) return
    this.attached = true

    page.on('request', (req) => {
      // 忽略 data:/blob: 等噪音
      const url = req.url()
      if (url.startsWith('data:') || url.startsWith('blob:')) return
      this.requestCount += 1
      this.pending.set(req, {
        method: req.method(),
        url,
        startedAt: Date.now(),
      })
    })

    page.on('response', (res) => {
      const req = res.request()
      const meta = this.pending.get(req)
      if (meta) {
        const dur = Date.now() - meta.startedAt
        if (dur > SLOW_MS) this.slowCount += 1
        this.pending.delete(req)
      }
      const status = res.status()
      if (status >= 400) {
        this.failures.push({
          url: req.url(),
          method: req.method(),
          reason: `HTTP ${status}`,
          status,
        })
        if (this.failures.length > MAX_FAILURES_RETAINED) {
          this.failures = this.failures.slice(-MAX_FAILURES_RETAINED)
        }
      }
    })

    page.on('requestfailed', (req) => {
      const meta = this.pending.get(req)
      this.pending.delete(req)
      const failure = req.failure()
      this.failures.push({
        url: req.url(),
        method: req.method(),
        reason: failure?.errorText ?? 'requestfailed',
      })
      if (this.failures.length > MAX_FAILURES_RETAINED) {
        this.failures = this.failures.slice(-MAX_FAILURES_RETAINED)
      }
      // 慢请求：若已耗时超阈值也计
      if (meta && Date.now() - meta.startedAt > SLOW_MS) {
        this.slowCount += 1
      }
    })
  }

  /** Drain delta since last call */
  drain(): NetworkSummary {
    const failures = this.failures.slice()
    const slowCount = this.slowCount
    const requestCount = this.requestCount
    this.failures = []
    this.slowCount = 0
    this.requestCount = 0
    return {
      failedCount: failures.length,
      slowCount,
      requestCount,
      failures,
    }
  }

  /** Aggregate helper for report summary */
  static merge(deltas: NetworkSummary[]): NetworkSummary {
    const failures: NetworkFailure[] = []
    let failedCount = 0
    let slowCount = 0
    let requestCount = 0
    for (const d of deltas) {
      failedCount += d.failedCount
      slowCount += d.slowCount
      requestCount += d.requestCount ?? 0
      for (const f of d.failures) {
        if (failures.length < MAX_FAILURES_RETAINED) failures.push(f)
      }
    }
    return { failedCount, slowCount, requestCount, failures }
  }
}
