/** Playwright Driver — same semantic actions as cursor-browser MVP. */

import { chromium, type Browser, type Locator, type Page } from 'playwright'
import type { DriverAction, DriverKind } from './types.js'

function nameMatcher(name?: string | RegExp): string | RegExp | undefined {
  return name
}

export class PlaywrightDriver {
  readonly kind: DriverKind = 'playwright'
  private browser: Browser | null = null
  private page: Page | null = null

  async launch(opts?: { headless?: boolean }): Promise<Page> {
    this.browser = await chromium.launch({ headless: opts?.headless ?? true })
    const ctx = await this.browser.newContext({
      viewport: { width: 1280, height: 800 },
      locale: 'zh-CN',
    })
    this.page = await ctx.newPage()
    return this.page
  }

  getPage(): Page {
    if (!this.page) throw new Error('Driver not launched')
    return this.page
  }

  async close(): Promise<void> {
    await this.browser?.close()
    this.browser = null
    this.page = null
  }

  private resolveClickLocator(action: Extract<DriverAction, { type: 'click' }>): Locator {
    const page = this.getPage()
    if (action.testId) {
      return page.getByTestId(action.testId)
    }
    if (action.role) {
      const opts =
        action.name != null
          ? {
              name: nameMatcher(action.name),
              exact: typeof action.name === 'string' ? true : undefined,
            }
          : undefined
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      return page.getByRole(action.role as any, opts as any)
    }
    throw new Error('click requires role or testId')
  }

  private resolveFillLocator(action: Extract<DriverAction, { type: 'fill' }>): Locator {
    const page = this.getPage()
    if (action.testId) return page.getByTestId(action.testId)
    if (action.label) return page.getByLabel(action.label)
    if (action.placeholder) return page.getByPlaceholder(action.placeholder)
    if (action.role) {
      const opts = action.name != null ? { name: nameMatcher(action.name) } : undefined
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      return page.getByRole(action.role as any, opts as any)
    }
    throw new Error('fill requires testId | label | placeholder | role')
  }

  async act(action: DriverAction): Promise<{ ok: boolean; error?: string }> {
    const page = this.getPage()
    try {
      switch (action.type) {
        case 'goto': {
          const res = await page.goto(action.url, { waitUntil: 'domcontentloaded', timeout: 30_000 })
          if (!res) return { ok: false, error: 'goto: no response' }
          if (!res.ok() && res.status() >= 400) {
            return { ok: false, error: `goto: HTTP ${res.status()}` }
          }
          return { ok: true }
        }
        case 'click': {
          let loc = this.resolveClickLocator(action)
          if (action.nth != null) loc = loc.nth(action.nth)
          await loc.first().click({ timeout: 15_000 })
          return { ok: true }
        }
        case 'fill': {
          const loc = this.resolveFillLocator(action)
          await loc.first().fill(action.value, { timeout: 15_000 })
          return { ok: true }
        }
        case 'scroll': {
          const amount = action.amount ?? 600
          if (action.direction === 'top') {
            await page.evaluate(() => window.scrollTo(0, 0))
          } else if (action.direction === 'bottom') {
            await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight))
          } else if (action.direction === 'up') {
            await page.evaluate((a) => window.scrollBy(0, -a), amount)
          } else {
            await page.evaluate((a) => window.scrollBy(0, a), amount)
          }
          return { ok: true }
        }
        case 'wait': {
          if (action.ms != null) {
            await page.waitForTimeout(action.ms)
            return { ok: true }
          }
          if (action.selector) {
            await page.waitForSelector(action.selector, { timeout: 15_000 })
            return { ok: true }
          }
          if (action.role) {
            const opts = action.name != null ? { name: nameMatcher(action.name) } : undefined
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            await page.getByRole(action.role as any, opts as any).first().waitFor({
              state: 'visible',
              timeout: 15_000,
            })
            return { ok: true }
          }
          await page.waitForTimeout(300)
          return { ok: true }
        }
        case 'snapshot':
          return { ok: true }
        case 'stop':
          return { ok: true }
        default: {
          const _exhaustive: never = action
          return { ok: false, error: `unknown action: ${JSON.stringify(_exhaustive)}` }
        }
      }
    } catch (err) {
      return { ok: false, error: err instanceof Error ? err.message : String(err) }
    }
  }
}
