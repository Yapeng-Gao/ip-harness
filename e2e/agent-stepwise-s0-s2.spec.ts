/**
 * Agent stepwise walk · S0–S2 only
 * Plan: docs/ui-polish/AGENT_STEPWISE_WALK_PLAN_2026-09-19.md
 * Evidence: docs/ui-polish/agent-stepwise-e2e/
 */
import { test, expect, type Page, type ConsoleMessage } from '@playwright/test'
import * as fs from 'node:fs'
import * as path from 'node:path'
import { enterWorkspace, AGENT_ORIGIN } from './helpers/enterWorkspace'

const EVIDENCE_DIR = path.resolve('docs/ui-polish/agent-stepwise-e2e')

type StepRecord = {
  id: 'S0' | 'S1' | 'S2'
  status: 'Pass' | 'Fail' | 'Skip'
  finalUrl: string
  assertions: string[]
  screenshot?: string
  skipReason?: string
  failReason?: string
  consoleErrors: string[]
  bbox?: Record<string, { x: number; y: number; width: number; height: number } | null>
}

function ensureEvidenceDir() {
  fs.mkdirSync(EVIDENCE_DIR, { recursive: true })
}

function writeJson(name: string, data: unknown) {
  ensureEvidenceDir()
  const p = path.join(EVIDENCE_DIR, name)
  fs.writeFileSync(p, JSON.stringify(data, null, 2), 'utf8')
  return p
}

async function shot(page: Page, name: string) {
  ensureEvidenceDir()
  const p = path.join(EVIDENCE_DIR, name)
  await page.screenshot({ path: p, fullPage: true })
  return p
}

async function bboxOf(page: Page, selector: string) {
  const el = page.locator(selector).first()
  if ((await el.count()) === 0) return null
  return el.boundingBox()
}

function attachConsole(page: Page) {
  const errors: string[] = []
  const handler = (msg: ConsoleMessage) => {
    if (msg.type() === 'error') errors.push(msg.text())
  }
  page.on('console', handler)
  return {
    errors,
    detach: () => page.off('console', handler),
  }
}

async function gotoAgentHome(page: Page) {
  await enterWorkspace(page, { product: '知产 Agent', name: '德恒' })
  await page.goto(`${AGENT_ORIGIN}/agent`)
  await expect(page).toHaveURL(/http:\/\/localhost:5175\/agent\/?$/)
}

test.describe('Agent stepwise S0–S2', () => {
  test.describe.configure({ mode: 'serial', timeout: 90_000 })

  test('S0 Home landmarks + hard gates', async ({ page }) => {
    const cons = attachConsole(page)
    const rec: StepRecord = {
      id: 'S0',
      status: 'Fail',
      finalUrl: '',
      assertions: [],
      consoleErrors: [],
    }
    try {
      await gotoAgentHome(page)
      rec.finalUrl = page.url()
      rec.assertions.push(`url=${rec.finalUrl}`)

      // Hard gate: stay on agent host (no mid deep-link)
      expect(new URL(page.url()).origin).toBe(AGENT_ORIGIN)
      expect(page.url()).not.toMatch(/localhost:5173/)
      rec.assertions.push('no mid deep-link (origin=5175)')

      // 业务首页（becca1e）：侧栏在 /agent 业务面隐藏；硬闸保留 origin/无 mid
      // Home =「我的案子」（与 L0-AG-01 同口径；Catalog 已迁 /agent/catalog）
      await expect(page.getByRole('heading', { name: '我的案子' })).toBeVisible()
      await expect(page.getByTestId('business-cases-page')).toBeVisible()
      await expect(page.getByTestId('patent-catalog-page')).toHaveCount(0)
      rec.assertions.push('我的案子 h1 + business-cases-page 可见；无 patent-catalog-page')

      // No BillingHold full-width amber banner
      const fullBanner = page.locator('[data-billing-hold-banner]')
      expect(await fullBanner.count()).toBe(0)
      rec.assertions.push('无 BillingHold 全宽黄条 (data-billing-hold-banner=0)')

      rec.bbox = {
        'business-cases-page': await bboxOf(page, '[data-testid="business-cases-page"]'),
        'business-new-case': await bboxOf(page, '[data-testid="business-new-case"]'),
      }

      rec.screenshot = await shot(page, 'S0-home.png')
      rec.status = 'Pass'
    } catch (e) {
      rec.failReason = e instanceof Error ? e.message : String(e)
      rec.finalUrl = page.url()
      try {
        rec.screenshot = await shot(page, 'S0-home-FAIL.png')
      } catch {
        /* ignore */
      }
      throw e
    } finally {
      cons.detach()
      rec.consoleErrors = [...cons.errors]
      writeJson('S0-meta.json', rec)
    }
  })

  test('S1 创建并绑定新案 (optional if UI clear)', async ({ page }) => {
    const cons = attachConsole(page)
    const rec: StepRecord = {
      id: 'S1',
      status: 'Fail',
      finalUrl: '',
      assertions: [],
      consoleErrors: [],
    }
    try {
      await gotoAgentHome(page)
      rec.finalUrl = page.url()

      const createBtn = page.getByTestId('case-create-bind')
      if ((await createBtn.count()) === 0 || !(await createBtn.isVisible())) {
        rec.status = 'Skip'
        rec.skipReason = 'Home 无清晰「创建并绑定新案」入口 (case-create-bind 不可见)'
        rec.screenshot = await shot(page, 'S1-skip.png')
        writeJson('S1-meta.json', rec)
        test.info().annotations.push({ type: 'skip-reason', description: rec.skipReason })
        // Soft skip — do not hard-fail green; mark skipped via test.skip semantics
        test.skip(true, rec.skipReason)
        return
      }

      await createBtn.click()
      const titleInput = page.getByTestId('case-create-title')
      await expect(titleInput).toBeVisible({ timeout: 5_000 })
      const title = `逐步走查样机案 S1 ${Date.now()}`
      await titleInput.fill(title)
      await page.getByTestId('case-create-confirm').click()

      const current = page.getByTestId('case-bind-current')
      await expect(current).toBeVisible({ timeout: 5_000 })
      const boundText = (await current.textContent()) ?? ''
      expect(boundText.length).toBeGreaterThan(0)
      // mock-case-* id appears in title attr or nearby; also "样机" badge
      await expect(current).toContainText(/样机|案/)
      rec.assertions.push(`case bound label=${boundText.trim().slice(0, 80)}`)

      // Entry still usable — 开始办理 still enabled
      const startBtn = page.getByTestId('home-send')
      await expect(startBtn).toBeVisible()
      await expect(startBtn).toBeEnabled()
      rec.assertions.push('绑定后仍可开工 (home-send enabled)')

      // Still single case entry
      expect(await page.getByTestId('home-case-bind').count()).toBe(1)
      rec.assertions.push('Home 案件入口仍=1')

      rec.finalUrl = page.url()
      expect(new URL(page.url()).origin).toBe(AGENT_ORIGIN)

      rec.bbox = {
        'case-bind-current': await bboxOf(page, '[data-testid="case-bind-current"]'),
        'home-send': await bboxOf(page, '[data-testid="home-send"]'),
      }
      rec.screenshot = await shot(page, 'S1-case-bound.png')
      rec.status = 'Pass'
    } catch (e) {
      rec.failReason = e instanceof Error ? e.message : String(e)
      rec.finalUrl = page.url()
      try {
        rec.screenshot = await shot(page, 'S1-FAIL.png')
      } catch {
        /* ignore */
      }
      // If UI half-broken, prefer Skip annotation over fake green — still fail the test honestly
      throw e
    } finally {
      cons.detach()
      rec.consoleErrors = [...cons.errors]
      writeJson('S1-meta.json', rec)
    }
  })

  test('S2 无案点开始办理 → /agent/sessions/:id', async ({ page }) => {
    const cons = attachConsole(page)
    const rec: StepRecord = {
      id: 'S2',
      status: 'Fail',
      finalUrl: '',
      assertions: [],
      consoleErrors: [],
    }
    try {
      await gotoAgentHome(page)

      // Ensure unbound (fresh home defaults empty; unbind if leftover)
      const unbind = page.getByTestId('case-unbind')
      if ((await unbind.count()) > 0 && (await unbind.isVisible())) {
        await unbind.click()
      }
      await expect(page.getByTestId('case-bind-hint')).toBeVisible()
      rec.assertions.push('无案状态确认 (case-bind-hint)')

      const startBtn = page.getByTestId('home-send')
      await expect(startBtn).toBeVisible()
      await startBtn.click()

      await page.waitForURL(/\/agent\/sessions\/[^/]+/, { timeout: 15_000 })
      rec.finalUrl = page.url()
      expect(rec.finalUrl).toMatch(/http:\/\/localhost:5175\/agent\/sessions\/[^/?#]+/)
      expect(new URL(rec.finalUrl).origin).toBe(AGENT_ORIGIN)
      rec.assertions.push(`entered session url=${rec.finalUrl}`)

      // No forced bind dialog/modal that traps the user
      const dialogs = page.getByRole('dialog')
      const dialogCount = await dialogs.count()
      for (let i = 0; i < dialogCount; i++) {
        const d = dialogs.nth(i)
        if (!(await d.isVisible())) continue
        const txt = ((await d.textContent()) ?? '').toLowerCase()
        const forces =
          /必须绑定|强制绑|先绑定案件才能|写入案件前须/.test(txt) &&
          (await d.getByRole('button', { name: /关闭|取消|跳过|稍后/ }).count()) === 0
        expect(forces, '不应出现无法关闭的强制绑案弹窗').toBeFalsy()
      }
      rec.assertions.push('无强制绑案弹死 dialog')

      // Soft guide ok: session-case-bind-top may appear with soft copy
      const topBind = page.getByTestId('session-case-bind-top')
      if ((await topBind.count()) > 0 && (await topBind.isVisible())) {
        await expect(topBind).toContainText(/可在此绑定|可选|创建并绑定|绑定已有/)
        rec.assertions.push('会话顶栏软引导绑案可见（非强制）')
      } else {
        rec.assertions.push('无顶栏绑案带（亦可）')
      }

      // Session workspace usable
      await expect(page.getByTestId('session-timeline-scroller')).toBeVisible()
      rec.assertions.push('会话主区可见')

      // Still no full-width billing hold
      expect(await page.locator('[data-billing-hold-banner]').count()).toBe(0)
      rec.assertions.push('会话页无 BillingHold 全宽黄条')

      rec.bbox = {
        'session-case-bind-top': await bboxOf(page, '[data-testid="session-case-bind-top"]'),
        'agent-side-nav': await bboxOf(page, '[data-testid="agent-side-nav"]'),
      }
      rec.screenshot = await shot(page, 'S2-session.png')
      rec.status = 'Pass'
    } catch (e) {
      rec.failReason = e instanceof Error ? e.message : String(e)
      rec.finalUrl = page.url()
      try {
        rec.screenshot = await shot(page, 'S2-FAIL.png')
      } catch {
        /* ignore */
      }
      throw e
    } finally {
      cons.detach()
      rec.consoleErrors = [...cons.errors]
      writeJson('S2-meta.json', rec)
    }
  })
})
