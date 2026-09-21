import { test, expect } from '@playwright/test'

/**
 * L0 路由冒烟：零 click。goto / request.get + 地标。
 * 显式 localhost URL（禁止 127.0.0.1）。
 */

test.describe('L0-MID-01', () => {
  test.use({ baseURL: 'http://localhost:5173' })

  test('L0-MID-01 mid / 壳可达', async ({ page }) => {
    const res = await page.goto('http://localhost:5173/')
    expect(res, 'mid:5173 无响应').toBeTruthy()
    expect(res!.ok(), `mid:5173 HTTP ${res!.status()}`).toBeTruthy()

    const dash = page.getByRole('heading', { name: /资产与任务/ })
    if ((await dash.count()) > 0) {
      await expect(dash.first()).toBeVisible()
    } else {
      // 未进仓：只验壳可达 / 跳转落地
      await expect(page.locator('body')).toBeVisible()
    }
  })
})

test.describe('L0-WB-01', () => {
  test.use({ baseURL: 'http://localhost:5174' })

  test('L0-WB-01 workbench / 业务工作台', async ({ page }) => {
    await page.goto('http://localhost:5174/workbench')
    await expect(page.getByRole('heading', { name: '业务工作台' })).toBeVisible()
  })
})

test.describe('L0-AG-01', () => {
  test.use({ baseURL: 'http://localhost:5175' })

  test('L0-AG-01 agent home / 办理入口', async ({ page }) => {
    await page.goto('http://localhost:5175/agent')
    // UI 已迁 Catalog：主标题「专利专家 Catalog」（零 click）
    await expect(
      page.getByRole('heading', { name: /专利专家 Catalog|办理|Catalog/ }),
    ).toBeVisible()
  })
})

test.describe('L0-OPS-01', () => {
  test.use({ baseURL: 'http://localhost:5176' })

  test('L0-OPS-01 ops / 运维占位标题', async ({ page }) => {
    await page.goto('http://localhost:5176/')
    const title = page
      .getByRole('heading', { name: /运维面总览|运维/ })
      .or(page.getByText(/运维面总览/))
    await expect(title.first()).toBeVisible()
  })
})

test.describe('L0-IAM-01', () => {
  test.use({ baseURL: 'http://localhost:5177' })

  test('L0-IAM-01 iam /login IP Harness', async ({ page }) => {
    await page.goto('http://localhost:5177/login')
    await expect(page.getByRole('heading', { name: 'IP Harness' })).toBeVisible()
  })
})

test.describe('L0-API-01', () => {
  test('L0-API-01 GET localhost:5180/health', async ({ request }) => {
    const res = await request.get('http://localhost:5180/health')
    expect(res.status(), `api-mock /health HTTP ${res.status()}`).toBeGreaterThanOrEqual(200)
    expect(res.status()).toBeLessThan(300)
    const body = (await res.json()) as { ok?: boolean; mock?: boolean; service?: string }
    expect(body.ok, 'health.ok === true 强制').toBe(true)
    // 可兼看 mock / service（README：{ ok, mock, service }）
    if (body.mock !== undefined) expect(body.mock).toBe(true)
    if (body.service !== undefined) expect(body.service).toBe('api-mock')
  })
})
