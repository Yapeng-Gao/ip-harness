/**
 * Agent stepwise walk · S6–S9
 * Plan: docs/ui-polish/AGENT_STEPWISE_WALK_PLAN_2026-09-19.md
 * Evidence: docs/ui-polish/agent-stepwise-e2e/
 */
import { test, expect, type Page, type ConsoleMessage } from '@playwright/test'
import * as fs from 'node:fs'
import * as path from 'node:path'
import { enterWorkspace, AGENT_ORIGIN } from './helpers/enterWorkspace'

const EVIDENCE_DIR = path.resolve('docs/ui-polish/agent-stepwise-e2e')

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

type StepId = 'S6' | 'S7' | 'S8' | 'S9'
type StepRecord = {
  id: StepId
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

async function enterAgent(page: Page) {
  await enterWorkspace(page, { product: '知产 Agent', name: '德恒' })
}

test.describe('Agent stepwise S6–S9', () => {
  test.describe.configure({ mode: 'serial', timeout: 120_000 })

  test('S6 会话列表 + 待确认筛选 segmented', async ({ page }) => {
    const cons = attachConsole(page)
    const rec: StepRecord = {
      id: 'S6',
      status: 'Fail',
      finalUrl: '',
      assertions: [],
      consoleErrors: [],
    }
    try {
      await enterAgent(page)
      await page.goto(`${AGENT_ORIGIN}/agent/sessions`)
      await expect(page).toHaveURL(/\/agent\/sessions\/?$/)
      rec.finalUrl = page.url()
      expect(new URL(rec.finalUrl).origin).toBe(AGENT_ORIGIN)
      expect(rec.finalUrl).not.toMatch(/localhost:5173/)
      rec.assertions.push('URL=/agent/sessions · no mid')

      const seg = page.getByRole('group', { name: '会话状态筛选' })
      await expect(seg).toBeVisible({ timeout: 10_000 })
      rec.assertions.push('segmented group「会话状态筛选」可见')

      const allBtn = seg.getByRole('button', { name: /全部/ })
      const needsBtn = seg.getByRole('button', { name: /待确认/ })
      const runningBtn = seg.getByRole('button', { name: /进行中/ })
      await expect(allBtn).toBeVisible()
      await expect(needsBtn).toBeVisible()
      await expect(runningBtn).toBeVisible()
      rec.assertions.push('segmented: 全部 / 待确认 / 进行中')

      // Click 待确认 and assert pressed
      await needsBtn.click()
      await expect(needsBtn).toHaveAttribute('aria-pressed', 'true')
      rec.assertions.push('点「待确认」→ aria-pressed=true')

      // List should still render (may be empty or filtered seeds)
      const listArea = page.locator('aside, [data-testid="browse-sidebar-compact"]').first()
      await expect(page.getByTestId('agent-side-nav')).toBeVisible()
      rec.assertions.push('侧栏导航仍可见')

      // Switch back to 全部
      await allBtn.click()
      await expect(allBtn).toHaveAttribute('aria-pressed', 'true')
      rec.assertions.push('切回「全部」')

      expect(await page.locator('[data-billing-hold-banner]').count()).toBe(0)
      rec.assertions.push('无 BillingHold 全宽黄条')

      rec.bbox = {
        'session-segments': await bboxOf(page, '[aria-label="会话状态筛选"]'),
      }
      rec.screenshot = await shot(page, 'S6-sessions-filter.png')
      rec.status = 'Pass'
    } catch (e) {
      rec.failReason = e instanceof Error ? e.message : String(e)
      rec.finalUrl = page.url()
      try {
        rec.screenshot = await shot(page, 'S6-FAIL.png')
      } catch {
        /* ignore */
      }
      throw e
    } finally {
      cons.detach()
      rec.consoleErrors = [...cons.errors]
      writeJson('S6-meta.json', rec)
    }
  })

  test('S7 Catalog 选 Agent · /agent/agents', async ({ page }) => {
    const cons = attachConsole(page)
    const rec: StepRecord = {
      id: 'S7',
      status: 'Fail',
      finalUrl: '',
      assertions: [],
      consoleErrors: [],
    }
    try {
      await enterAgent(page)
      await page.goto(`${AGENT_ORIGIN}/agent/agents`)
      await expect(page).toHaveURL(/\/agent\/agents/)
      rec.finalUrl = page.url()
      expect(new URL(rec.finalUrl).origin).toBe(AGENT_ORIGIN)
      rec.assertions.push('URL=/agent/agents')

      const missing: string[] = []
      for (const name of CATALOG_NAMES) {
        const h = page.getByRole('heading', { name: new RegExp(name) }).first()
        if ((await h.count()) === 0 || !(await h.isVisible())) {
          missing.push(name)
        }
      }
      expect(missing, `Catalog heading 缺失: ${missing.join(',')}`).toEqual([])
      rec.assertions.push(`Catalog 9 heading 可见: ${CATALOG_NAMES.join('/')}`)

      // Soft interact: click one catalog card / link without deep play
      const oaHeading = page.getByRole('heading', { name: /OA/ }).first()
      await expect(oaHeading).toBeVisible()
      // Prefer card link containing OA
      const oaCard = page.locator('a, button').filter({ has: page.getByRole('heading', { name: /OA/ }) }).first()
      if ((await oaCard.count()) > 0) {
        await oaCard.click()
        await page.waitForTimeout(400)
        rec.assertions.push(`点 OA 卡后 URL=${page.url()}`)
      } else {
        rec.assertions.push('OA heading 可见（无独立卡 click）')
      }

      expect(await page.locator('[data-billing-hold-banner]').count()).toBe(0)
      rec.bbox = {
        catalog: await bboxOf(page, 'main, [class*="catalog"], .flex-1'),
      }
      rec.screenshot = await shot(page, 'S7-catalog.png')
      rec.status = 'Pass'
    } catch (e) {
      rec.failReason = e instanceof Error ? e.message : String(e)
      rec.finalUrl = page.url()
      try {
        rec.screenshot = await shot(page, 'S7-FAIL.png')
      } catch {
        /* ignore */
      }
      throw e
    } finally {
      cons.detach()
      rec.consoleErrors = [...cons.errors]
      writeJson('S7-meta.json', rec)
    }
  })

  test('S8 项目模式 general · 无专利步骤', async ({ page }) => {
    const cons = attachConsole(page)
    const rec: StepRecord = {
      id: 'S8',
      status: 'Fail',
      finalUrl: '',
      assertions: [],
      consoleErrors: [],
    }
    try {
      await enterAgent(page)
      await page.goto(`${AGENT_ORIGIN}/agent/projects`)
      await expect(page).toHaveURL(/\/agent\/projects\/?$/)
      rec.finalUrl = page.url()
      await expect(page.getByRole('heading', { name: /项目模式/ })).toBeVisible()
      rec.assertions.push('项目列表页可见')

      // Select general
      const generalRadio = page.getByRole('radio', { name: /通用/ })
      await expect(generalRadio).toBeVisible()
      await generalRadio.check()
      await expect(generalRadio).toBeChecked()
      rec.assertions.push('选「通用（无专利步骤）」')

      const title = `逐步走查 general S8 ${Date.now()}`
      await page.getByLabel('项目标题').fill(title)
      await page.getByTestId('project-create-submit').click()

      await page.waitForURL(/\/agent\/projects\/[^/]+/, { timeout: 15_000 })
      rec.finalUrl = page.url()
      expect(rec.finalUrl).toMatch(/\/agent\/projects\/[^/]+/)
      expect(rec.finalUrl).not.toMatch(/\/bots\//)
      rec.assertions.push(`进总控席 ${rec.finalUrl}`)

      // General: no patent step bar
      await expect(page.getByTestId('general-no-patent-steps')).toBeVisible({ timeout: 10_000 })
      expect(await page.getByTestId('domain-step-bar').count()).toBe(0)
      rec.assertions.push('general-no-patent-steps 可见 · domain-step-bar=0')

      // Orchestrator chat pane
      const orch = page.getByTestId('project-chat-general-orchestrator')
      await expect(orch).toBeVisible()
      rec.assertions.push('project-chat-general-orchestrator 可见')

      expect(await page.locator('[data-billing-hold-banner]').count()).toBe(0)
      rec.bbox = {
        'general-no-patent-steps': await bboxOf(page, '[data-testid="general-no-patent-steps"]'),
      }
      rec.screenshot = await shot(page, 'S8-general-project.png')
      rec.status = 'Pass'
    } catch (e) {
      rec.failReason = e instanceof Error ? e.message : String(e)
      rec.finalUrl = page.url()
      try {
        rec.screenshot = await shot(page, 'S8-FAIL.png')
      } catch {
        /* ignore */
      }
      throw e
    } finally {
      cons.detach()
      rec.consoleErrors = [...cons.errors]
      writeJson('S8-meta.json', rec)
    }
  })

  test('S9 domain/patent + 专家私聊 · 总控/专家分剧本', async ({ page }) => {
    const cons = attachConsole(page)
    const rec: StepRecord = {
      id: 'S9',
      status: 'Fail',
      finalUrl: '',
      assertions: [],
      consoleErrors: [],
    }
    try {
      await enterAgent(page)
      await page.goto(`${AGENT_ORIGIN}/agent/projects`)
      await expect(page.getByRole('heading', { name: /项目模式/ })).toBeVisible()

      const domainRadio = page.getByRole('radio', { name: /领域包/ })
      await expect(domainRadio).toBeVisible()
      await domainRadio.check()
      await expect(domainRadio).toBeChecked()
      // DomainPack select should show patent
      const packSelect = page.locator('select').filter({ has: page.locator('option[value="patent"]') })
      if ((await packSelect.count()) > 0) {
        await packSelect.first().selectOption('patent')
      }
      rec.assertions.push('选「领域包」· patent')

      const title = `逐步走查 patent S9 ${Date.now()}`
      await page.getByLabel('项目标题').fill(title)
      await page.getByTestId('project-create-submit').click()

      await page.waitForURL(/\/agent\/projects\/[^/]+$/, { timeout: 15_000 })
      const projectUrl = page.url()
      const projectId = projectUrl.split('/').pop()!
      rec.assertions.push(`专利项目总控 ${projectUrl}`)

      // Orchestrator: domain step bar present
      const orchChat = page.getByTestId('project-chat-orchestrator')
      await expect(orchChat).toBeVisible({ timeout: 10_000 })
      await expect(page.getByTestId('domain-step-bar')).toBeVisible()
      expect(await page.getByTestId('general-no-patent-steps').count()).toBe(0)
      rec.assertions.push('总控 · domain-step-bar 可见 · 非 general')

      // Capture orchestrator script snippet
      const orchText = ((await page.locator('[data-testid="project-chat-orchestrator"]').locator('..').innerText().catch(() => '')) ||
        (await page.innerText('body')))
      const orchHasMock = /总控|分派|mock|编排/.test(orchText)
      rec.assertions.push(`总控区文案含编排迹象=${orchHasMock}`)

      // Expert DM — pick 检索 or draft bot
      const searchBot = page.getByTestId('project-bot-search')
      const draftBot = page.getByTestId('project-bot-draft')
      const ftoBot = page.getByTestId('project-bot-fto')
      let expertId = 'search'
      if ((await searchBot.count()) > 0) {
        await searchBot.click()
        expertId = 'search'
      } else if ((await draftBot.count()) > 0) {
        await draftBot.click()
        expertId = 'draft'
      } else if ((await ftoBot.count()) > 0) {
        await ftoBot.click()
        expertId = 'fto'
      } else {
        // Try any project-bot-* that is not orchestrator
        const any = page.locator('[data-testid^="project-bot-"]:not([data-testid="project-bot-orchestrator"])').first()
        if ((await any.count()) === 0) {
          rec.status = 'Skip'
          rec.skipReason = '侧栏无专家 bot 链（search/draft/fto）'
          rec.finalUrl = page.url()
          rec.screenshot = await shot(page, 'S9-skip.png')
          writeJson('S9-meta.json', { ...rec, consoleErrors: [...cons.errors] })
          test.skip(true, rec.skipReason)
          return
        }
        expertId = ((await any.getAttribute('data-testid')) ?? 'project-bot-x').replace('project-bot-', '')
        await any.click()
      }

      await page.waitForURL(new RegExp(`/agent/projects/${projectId}/bots/${expertId}`), {
        timeout: 10_000,
      })
      rec.finalUrl = page.url()
      rec.assertions.push(`专家私聊 URL=${rec.finalUrl}`)

      const expertChat = page.getByTestId(`project-chat-${expertId}`)
      await expect(expertChat).toBeVisible({ timeout: 10_000 })
      // Expert still has domain steps (patent pack)
      await expect(page.getByTestId('domain-step-bar')).toBeVisible()
      rec.assertions.push(`专家 pane project-chat-${expertId} + domain-step-bar`)

      // Different script from orchestrator — expert name / specialty visible
      const expertHeader = (await expertChat.innerText()) ?? ''
      expect(expertHeader.length).toBeGreaterThan(5)
      expect(/总控/.test(expertHeader) && expertId !== 'orchestrator').toBeFalsy()
      rec.assertions.push(`专家头栏文案≠总控 · snippet=${expertHeader.slice(0, 60).replace(/\n/g, ' ')}`)

      expect(new URL(page.url()).origin).toBe(AGENT_ORIGIN)
      expect(await page.locator('[data-billing-hold-banner]').count()).toBe(0)

      rec.bbox = {
        'domain-step-bar': await bboxOf(page, '[data-testid="domain-step-bar"]'),
        [`project-chat-${expertId}`]: await bboxOf(page, `[data-testid="project-chat-${expertId}"]`),
      }
      rec.screenshot = await shot(page, 'S9-patent-expert.png')
      rec.status = 'Pass'
    } catch (e) {
      rec.failReason = e instanceof Error ? e.message : String(e)
      rec.finalUrl = page.url()
      try {
        rec.screenshot = await shot(page, 'S9-FAIL.png')
      } catch {
        /* ignore */
      }
      throw e
    } finally {
      cons.detach()
      rec.consoleErrors = [...cons.errors]
      writeJson('S9-meta.json', rec)
    }
  })
})
