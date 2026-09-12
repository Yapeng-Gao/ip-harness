import { test, expect, type Page, type Locator } from '@playwright/test'
import { enterWorkspace } from './helpers/enterWorkspace'

/** Catalog card headings — AgentPickerCard names (substring). */
const CATALOG_NAMES = [
  '调研检索',
  '立项评估',
  '交底',
  '权利要求',
  'OA',
  '年费',
  '监控',
  '转化',
  '布局',
] as const

const SEED_CASE_ID = 'c1'

/** HITL region — never match goal textarea copy (R5). */
function confirmHitl(page: Page): Locator {
  return page.locator('.confirm-hitl')
}

function specialtyCta(page: Page, cta: RegExp): Locator {
  const bar = confirmHitl(page)
  return bar.getByRole('button', { name: cta })
}

test.describe('L1 critical paths', () => {
  test('L1-01 iam:5177 → mid 资产与任务', async ({ page }) => {
    await enterWorkspace(page, { product: '作业中台', name: '星河智造' })
    await expect(page).toHaveURL(/http:\/\/localhost:5173\//)
    await expect(page.getByRole('heading', { name: /资产与任务/ })).toBeVisible()
  })

  test('L1-02 sess-oa-1 HITL CTA 可见（不点）', async ({ page }) => {
    await enterWorkspace(page, { product: '知产 Agent', name: '德恒' })
    await page.goto('http://localhost:5175/agent/sessions/sess-oa-1')
    const bar = confirmHitl(page)
    await expect(bar).toBeVisible()
    await expect(specialtyCta(page, /批准策略/).first()).toBeVisible()
  })

  test('L1-03 cases/c1?tab=audit 最近领域命令', async ({ page }) => {
    await enterWorkspace(page, { product: '作业中台', name: '星河智造' })
    await page.goto(`http://localhost:5173/cases/${SEED_CASE_ID}?tab=audit`)
    await expect(page.getByRole('heading', { name: '最近领域命令' })).toBeVisible()
  })

  test('L1-04 ops /config#alerts 通知渠道 + 试发一次', async ({ page }) => {
    await page.goto('http://localhost:5176/config#alerts')
    await expect(page.getByRole('heading', { name: '通知渠道' })).toBeVisible()
    const trial = page.getByRole('button', { name: /试发/ }).first()
    await expect(trial).toBeVisible()
    await trial.click()
  })

  test('L1-05 workbench + /workbench/research', async ({ page }) => {
    await enterWorkspace(page, { product: '作业中台', name: '星河智造' })
    await page.goto('http://localhost:5174/workbench')
    await expect(page.getByRole('heading', { name: '业务工作台' })).toBeVisible()
    await page.goto('http://localhost:5174/workbench/research')
    await expect(page.getByText('立项前调研').first()).toBeVisible()
  })

  test('L1-06 /agent/agents 9 heading', async ({ page }) => {
    await enterWorkspace(page, { product: '知产 Agent', name: '星河智造' })
    await page.goto('http://localhost:5175/agent/agents')
    for (const name of CATALOG_NAMES) {
      await expect(page.getByRole('heading', { name: new RegExp(name) }).first()).toBeVisible()
    }
  })

  test('L1-07 sess-disclosure-1 启动 → HITL CTA', async ({ page }) => {
    test.setTimeout(90_000)
    await enterWorkspace(page, { product: '知产 Agent', name: '德恒' })
    await page.goto('http://localhost:5175/agent/sessions/sess-disclosure-1')
    const start = page.getByRole('button', { name: /启动|发送/ })
    await expect(start.first()).toBeVisible({ timeout: 10_000 })
    await start.first().click()
    await expect(confirmHitl(page)).toBeVisible({ timeout: 45_000 })
    await expect(specialtyCta(page, /批准策略/).first()).toBeVisible({ timeout: 10_000 })
  })
})
