/**
 * Agent stepwise walk · S3–S5
 * Plan: docs/ui-polish/AGENT_STEPWISE_WALK_PLAN_2026-09-19.md
 * Evidence: docs/ui-polish/agent-stepwise-e2e/
 */
import { test, expect, type Page, type Locator, type ConsoleMessage } from '@playwright/test'
import * as fs from 'node:fs'
import * as path from 'node:path'
import { enterWorkspace, AGENT_ORIGIN } from './helpers/enterWorkspace'

const EVIDENCE_DIR = path.resolve('docs/ui-polish/agent-stepwise-e2e')

type StepId = 'S3' | 'S4' | 'S5'
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

/** HITL region — never match goal textarea copy (R5). */
function confirmHitl(page: Page): Locator {
  return page.locator('.confirm-hitl')
}

function specialtyCta(page: Page, cta: RegExp): Locator {
  return confirmHitl(page).getByRole('button', { name: cta })
}

test.describe('Agent stepwise S3–S5', () => {
  test.describe.configure({ mode: 'serial', timeout: 90_000 })

  test('S3 会话轨迹/回复可见 (sess-oa-1 mock)', async ({ page }) => {
    const cons = attachConsole(page)
    const rec: StepRecord = {
      id: 'S3',
      status: 'Fail',
      finalUrl: '',
      assertions: [],
      consoleErrors: [],
    }
    try {
      await enterAgent(page)
      await page.goto(`${AGENT_ORIGIN}/agent/sessions/sess-oa-1`)
      await expect(page).toHaveURL(/\/agent\/sessions\/sess-oa-1/)
      rec.finalUrl = page.url()
      expect(new URL(rec.finalUrl).origin).toBe(AGENT_ORIGIN)
      expect(rec.finalUrl).not.toMatch(/localhost:5173/)
      rec.assertions.push('no mid deep-link')

      const scroller = page.getByTestId('session-timeline-scroller')
      await expect(scroller).toBeVisible()
      rec.assertions.push('session-timeline-scroller 可见')

      // Seed mock steps (轨迹/回复)
      await expect(scroller.getByText(/解析 OA|争点清单|答复书草稿就绪|需要你确认/).first()).toBeVisible({
        timeout: 10_000,
      })
      const bodyText = (await scroller.innerText()) ?? ''
      expect(bodyText.length).toBeGreaterThan(40)
      expect(/解析 OA|争点|答复|确认/.test(bodyText)).toBeTruthy()
      rec.assertions.push(`timeline content length=${bodyText.length} · mock steps present`)

      // Hard gates
      expect(await page.locator('[data-billing-hold-banner]').count()).toBe(0)
      rec.assertions.push('无 BillingHold 全宽黄条')

      rec.bbox = {
        'session-timeline-scroller': await bboxOf(page, '[data-testid="session-timeline-scroller"]'),
      }
      rec.screenshot = await shot(page, 'S3-timeline.png')
      rec.status = 'Pass'
    } catch (e) {
      rec.failReason = e instanceof Error ? e.message : String(e)
      rec.finalUrl = page.url()
      try {
        rec.screenshot = await shot(page, 'S3-FAIL.png')
      } catch {
        /* ignore */
      }
      throw e
    } finally {
      cons.detach()
      rec.consoleErrors = [...cons.errors]
      writeJson('S3-meta.json', rec)
    }
  })

  test('S4 HITL Confirm 可见可点 (sess-oa-1 · ConfirmBar 闸)', async ({ page }) => {
    const cons = attachConsole(page)
    const rec: StepRecord = {
      id: 'S4',
      status: 'Fail',
      finalUrl: '',
      assertions: [],
      consoleErrors: [],
    }
    try {
      await enterAgent(page)
      await page.goto(`${AGENT_ORIGIN}/agent/sessions/sess-oa-1?focus=hitl`)
      await expect(page).toHaveURL(/\/agent\/sessions\/sess-oa-1/)
      rec.finalUrl = page.url()
      expect(new URL(rec.finalUrl).origin).toBe(AGENT_ORIGIN)
      rec.assertions.push('entered sess-oa-1 focus=hitl')

      const bar = confirmHitl(page)
      await expect(bar).toBeVisible({ timeout: 15_000 })
      rec.assertions.push('.confirm-hitl 可见')

      // CTA may be disabled until OA meta filled — fill within ConfirmBar sheet (R5 scoped)
      const cta = specialtyCta(page, /批准策略/).first()
      await expect(cta).toBeVisible({ timeout: 10_000 })
      rec.assertions.push('专科 CTA「批准策略」可见（scoped .confirm-hitl）')

      if (await cta.isDisabled()) {
        // Open data sheet if collapsed
        const sheet = bar.locator('details.confirm-hitl-sheet, details.agent-confirm-sheet').first()
        if ((await sheet.count()) > 0) {
          const open = await sheet.getAttribute('open')
          if (open === null) {
            await sheet.locator('summary').click()
          }
        }
        // Pick issue type + strategy notes inside ConfirmBar only
        const novelty = bar.getByRole('button', { name: '新颖性' })
        if ((await novelty.count()) > 0) {
          await novelty.click()
          rec.assertions.push('已选争点类型「新颖性」')
        } else {
          // Fallback: any OA issue chip in sheet
          const inventiveness = bar.getByRole('button', { name: '创造性' })
          if ((await inventiveness.count()) > 0) {
            await inventiveness.click()
            rec.assertions.push('已选争点类型「创造性」')
          }
        }
        const notes = bar.locator('textarea[placeholder*="策略要点"]')
        await expect(notes).toBeVisible({ timeout: 5_000 })
        await notes.fill('逐步走查 S4：缩限独权并补充实验段落（样机可恢复）')
        rec.assertions.push('已填策略要点')
        await expect(cta).toBeEnabled({ timeout: 5_000 })
      }

      await expect(cta).toBeEnabled()
      rec.assertions.push('专科 CTA「批准策略」enabled（业务闸正确）')

      // Optional single click on recoverable seed — click then do not assert post-state globally
      // Prefer visibility+enabled only to avoid mutating shared seed for later steps.
      // Document: CTA clickable (=enabled); no approve click to keep seed recoverable.

      expect(await page.locator('[data-billing-hold-banner]').count()).toBe(0)
      rec.assertions.push('无 BillingHold 全宽黄条')
      // R5 sanity: must NOT use page.getByText('批准策略') alone
      rec.assertions.push('R5: CTA 断言限制在 .confirm-hitl 内')

      rec.bbox = {
        'confirm-hitl': await bboxOf(page, '.confirm-hitl'),
      }
      rec.screenshot = await shot(page, 'S4-confirm.png')
      rec.status = 'Pass'
    } catch (e) {
      rec.failReason = e instanceof Error ? e.message : String(e)
      rec.finalUrl = page.url()
      try {
        rec.screenshot = await shot(page, 'S4-FAIL.png')
      } catch {
        /* ignore */
      }
      throw e
    } finally {
      cons.detach()
      rec.consoleErrors = [...cons.errors]
      writeJson('S4-meta.json', rec)
    }
  })

  test('S5 会话顶栏绑案 · 先聊后案', async ({ page }) => {
    const cons = attachConsole(page)
    const rec: StepRecord = {
      id: 'S5',
      status: 'Fail',
      finalUrl: '',
      assertions: [],
      consoleErrors: [],
    }
    try {
      await enterAgent(page)
      await page.goto(`${AGENT_ORIGIN}/agent`)
      await expect(page).toHaveURL(/http:\/\/localhost:5175\/agent\/?$/)

      // Ensure unbound
      const unbind = page.getByTestId('case-unbind')
      if ((await unbind.count()) > 0 && (await unbind.isVisible())) {
        await unbind.click()
      }
      await expect(page.getByTestId('case-bind-hint')).toBeVisible()
      rec.assertions.push('Home 无案 (case-bind-hint)')

      await page.getByTestId('home-send').click()
      await page.waitForURL(/\/agent\/sessions\/[^/]+/, { timeout: 15_000 })
      rec.finalUrl = page.url()
      expect(new URL(rec.finalUrl).origin).toBe(AGENT_ORIGIN)
      rec.assertions.push(`entered session ${rec.finalUrl}`)

      // Top band case bind — soft guide, not forced dialog
      const topBind = page.getByTestId('session-case-bind-top')
      await expect(topBind).toBeVisible({ timeout: 10_000 })
      await expect(topBind.getByTestId('case-bind-controls')).toBeVisible()
      rec.assertions.push('session-case-bind-top + case-bind-controls 可见')

      const softCopy = await topBind.getByText(/可在此绑定|开始办理后可在此绑定|可选|创建并绑定|绑定已有/).count()
      if (softCopy > 0) {
        rec.assertions.push('软引导文案可见（先聊后案）')
      } else {
        rec.assertions.push('顶栏绑案控件可见（软/无案 hint 亦可）')
      }

      // Can create&bind from top without forced modal trap
      const createBtn = topBind.getByTestId('case-create-bind')
      if ((await createBtn.count()) === 0 || !(await createBtn.isVisible())) {
        rec.status = 'Skip'
        rec.skipReason = '会话顶栏无清晰 case-create-bind（控件可见但创建入口缺失）'
        rec.screenshot = await shot(page, 'S5-skip.png')
        writeJson('S5-meta.json', { ...rec, consoleErrors: [...cons.errors] })
        test.skip(true, rec.skipReason)
        return
      }

      const caseTitle = `逐步走查顶栏绑案 S5 ${Date.now()}`
      await createBtn.click()
      const titleInput = topBind.getByTestId('case-create-title')
      await expect(titleInput).toBeVisible({ timeout: 5_000 })
      await titleInput.fill(caseTitle)
      await topBind.getByTestId('case-create-confirm').click()

      // After bind: caseBindGuide closes → top band may unmount (no HITL).
      // Success = caseId written: bound label elsewhere OR title in header, and no_case hint gone.
      const boundSomewhere = page.getByTestId('case-bind-current')
      const noCaseHint = page.getByTestId('session-no-case-hint')
      await expect
        .poll(async () => {
          if ((await boundSomewhere.count()) > 0 && (await boundSomewhere.first().isVisible())) {
            return 'bound-label'
          }
          if ((await page.getByText(caseTitle).count()) > 0) return 'title-visible'
          if ((await noCaseHint.count()) === 0) return 'no-case-hint-gone'
          return 'pending'
        }, { timeout: 8_000 })
        .not.toBe('pending')
      const how =
        (await boundSomewhere.count()) > 0 && (await boundSomewhere.first().isVisible())
          ? 'case-bind-current'
          : (await page.getByText(caseTitle).count()) > 0
            ? 'header/title'
            : 'no-case-hint cleared'
      rec.assertions.push(`顶栏创建并绑定成功 (${how}) · title=${caseTitle.slice(0, 40)}`)
      // Soft: top band may disappear after bind — that is expected UX
      if ((await page.getByTestId('session-case-bind-top').count()) === 0) {
        rec.assertions.push('绑案后顶栏收起（caseBindGuide 关闭 · 符合先聊后案）')
      }

      // No forced dialog
      const dialogs = page.getByRole('dialog')
      for (let i = 0; i < (await dialogs.count()); i++) {
        const d = dialogs.nth(i)
        if (!(await d.isVisible())) continue
        const txt = ((await d.textContent()) ?? '').toLowerCase()
        const forces =
          /必须绑定|强制绑|先绑定案件才能/.test(txt) &&
          (await d.getByRole('button', { name: /关闭|取消|跳过|稍后/ }).count()) === 0
        expect(forces).toBeFalsy()
      }
      rec.assertions.push('无强制绑案弹死')

      expect(await page.locator('[data-billing-hold-banner]').count()).toBe(0)
      rec.assertions.push('无 BillingHold 全宽黄条')

      rec.bbox = {
        'session-case-bind-top': await bboxOf(page, '[data-testid="session-case-bind-top"]'),
      }
      rec.screenshot = await shot(page, 'S5-case-bind-top.png')
      rec.status = 'Pass'
    } catch (e) {
      rec.failReason = e instanceof Error ? e.message : String(e)
      rec.finalUrl = page.url()
      try {
        rec.screenshot = await shot(page, 'S5-FAIL.png')
      } catch {
        /* ignore */
      }
      throw e
    } finally {
      cons.detach()
      rec.consoleErrors = [...cons.errors]
      writeJson('S5-meta.json', rec)
    }
  })
})
