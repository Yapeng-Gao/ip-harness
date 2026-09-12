import { test, expect } from '@playwright/test'
import { enterWorkspace } from './helpers/enterWorkspace'

/**
 * api-mock 起/停样机冒烟（PLAN-API-MOCK-SMOKE.md §7 已决）
 * - 壳仅 mid；UP/DOWN 强制 enterWorkspace（iam:5177 → 星河智造）
 * - UP 只验读，不要写 / dispatch
 * - DOWN：page.route 模拟不可达，进程仍起；禁止「关开关=停服」
 */

function isListCasesUrl(url: string): boolean {
  try {
    const u = new URL(url)
    return u.origin === 'http://localhost:5180' && u.pathname === '/v1/cases'
  } catch {
    return false
  }
}

test.describe('L1-API-UP-01', () => {
  test.use({ baseURL: 'http://localhost:5173' })

  test('L1-API-UP-01 api 起 · 读 /v1/cases + 地标', async ({ page }) => {
    // UP：5180 起着；只验读，不要写 / dispatch
    const casesOk = page.waitForResponse(
      (r) =>
        isListCasesUrl(r.url()) &&
        r.request().method() === 'GET' &&
        r.ok(),
      { timeout: 20_000 },
    )

    await enterWorkspace(page, { product: '作业中台', name: '星河智造' })
    await casesOk

    // 壳地标「资产与任务」或案可见；勿触发写/dispatch
    await expect(page.getByRole('heading', { name: /资产与任务/ })).toBeVisible({
      timeout: 15_000,
    })
  })
})

test.describe('L1-API-DOWN-01', () => {
  test.use({ baseURL: 'http://localhost:5173' })

  test('L1-API-DOWN-01 page.route 模拟不可达 · fallback 壳可用', async ({ page }) => {
    // page.route 模拟不可达，进程仍起；禁止标成关开关 / 「关开关=停服」
    // （无开关=0 对照；不杀 5180）
    await enterWorkspace(page, { product: '作业中台', name: '星河智造' })

    // 先 abort 读路径，再 goto/reload 让读请求失败 → fallback 内存 seed
    await page.route('http://localhost:5180/**', (route) => route.abort())
    await page.goto('http://localhost:5173/')

    const dash = page.getByRole('heading', { name: /资产与任务/ })
    await expect(dash).toBeVisible({ timeout: 15_000 })
    // 可交互：地标在 timeout 内可见且页面未挂死
    await expect(page.locator('body')).toBeVisible()
    await expect(dash).toBeEnabled()
  })
})
