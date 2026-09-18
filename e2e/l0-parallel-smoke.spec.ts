import { test, expect } from '@playwright/test'

/**
 * 并行壳 L0 路由冒烟（5182–5187）：零 click。
 * 地标以 h1 getByRole('heading') 为准；inspire 可 .or(创新激发)。
 * host 一律 localhost（禁止 127.0.0.1）。
 * 依据：PLAN-L0-PARALLEL-5182-5187.md §6 已决 A–E。
 */

test.describe('L0-SEARCH-01', () => {
  test.use({ baseURL: 'http://localhost:5182' })

  test('L0-SEARCH-01 search / 专利检索工作台', async ({ page }) => {
    const res = await page.goto('http://localhost:5182/')
    expect(res, 'search:5182 无响应').toBeTruthy()
    expect(res!.ok(), `search:5182 HTTP ${res!.status()}`).toBeTruthy()
    await expect(page.getByRole('heading', { name: '专利检索工作台' })).toBeVisible()
  })
})

test.describe('L0-FTO-01', () => {
  test.use({ baseURL: 'http://localhost:5183' })

  test('L0-FTO-01 fto / FTO 样机项目', async ({ page }) => {
    const res = await page.goto('http://localhost:5183/')
    expect(res, 'fto:5183 无响应').toBeTruthy()
    expect(res!.ok(), `fto:5183 HTTP ${res!.status()}`).toBeTruthy()
    await expect(page.getByRole('heading', { name: 'FTO 样机项目' })).toBeVisible()
  })
})

test.describe('L0-MINING-01', () => {
  test.use({ baseURL: 'http://localhost:5184' })

  test('L0-MINING-01 mining / 专利挖掘样机项目', async ({ page }) => {
    const res = await page.goto('http://localhost:5184/')
    expect(res, 'mining:5184 无响应').toBeTruthy()
    expect(res!.ok(), `mining:5184 HTTP ${res!.status()}`).toBeTruthy()
    await expect(page.getByRole('heading', { name: '专利挖掘样机项目' })).toBeVisible()
  })
})

test.describe('L0-INSPIRE-01', () => {
  test.use({ baseURL: 'http://localhost:5185' })

  test('L0-INSPIRE-01 inspire / 问题·技术点', async ({ page }) => {
    const res = await page.goto('http://localhost:5185/')
    expect(res, 'inspire:5185 无响应').toBeTruthy()
    expect(res!.ok(), `inspire:5185 HTTP ${res!.status()}`).toBeTruthy()
    const landmark = page
      .getByRole('heading', { name: '问题 / 技术点' })
      .or(page.getByText('创新激发'))
    await expect(landmark.first()).toBeVisible()
  })
})

test.describe('L0-LANDSCAPE-01', () => {
  test.use({ baseURL: 'http://localhost:5186' })

  test('L0-LANDSCAPE-01 landscape / 选择产业域', async ({ page }) => {
    const res = await page.goto('http://localhost:5186/')
    expect(res, 'landscape:5186 无响应').toBeTruthy()
    expect(res!.ok(), `landscape:5186 HTTP ${res!.status()}`).toBeTruthy()
    await expect(page.getByRole('heading', { name: '选择产业域' })).toBeVisible()
  })
})

test.describe('L0-FIGURE-01', () => {
  test.use({ baseURL: 'http://localhost:5187' })

  test('L0-FIGURE-01 figure / 附图资产', async ({ page }) => {
    const res = await page.goto('http://localhost:5187/')
    expect(res, 'figure:5187 无响应').toBeTruthy()
    expect(res!.ok(), `figure:5187 HTTP ${res!.status()}`).toBeTruthy()
    await expect(page.getByRole('heading', { name: '附图资产' })).toBeVisible()
  })
})
