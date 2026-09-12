import { chromium } from 'playwright'
import path from 'path'
import fs from 'fs'
import { fileURLToPath } from 'url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const root = path.resolve(__dirname, '..')
const out = path.join(root, 'docs/ui-polish/continue-opt')
fs.mkdirSync(out, { recursive: true })

const browser = await chromium.launch({
  headless: true,
  args: ['--no-sandbox', '--disable-dev-shm-usage'],
})
const context = await browser.newContext({
  viewport: { width: 1440, height: 900 },
  deviceScaleFactor: 1,
})
const page = await context.newPage()

async function shot(url, file, prep) {
  console.log('goto', url)
  await page.goto(url, { waitUntil: 'domcontentloaded', timeout: 60000 })
  await page.waitForTimeout(1200)
  if (prep) await prep(page)
  await page.waitForTimeout(500)
  const dest = path.join(out, file)
  await page.screenshot({ path: dest, fullPage: false })
  console.log('OK', file, fs.statSync(dest).size)
}

try {
  // R-P1-3 Confirm collapse
  await shot(
    'http://127.0.0.1:5175/agent/sessions/sess-oa-1?focus=hitl',
    'agent-confirm-oa-collapsed-after.png',
    async (p) => {
      await p.locator('#session-confirm-bar, [data-confirm-bar]').first().waitFor({ timeout: 15000 })
      await p.locator('#session-confirm-bar').scrollIntoViewIfNeeded().catch(() => {})
      // try expand more if present
      const more = p.getByRole('button', { name: /还有 \d+ 条/ })
      if (await more.count()) {
        console.log('found more button')
      }
    },
  )

  await shot(
    'http://127.0.0.1:5175/agent/sessions/sess-oa-1?focus=hitl',
    'agent-confirm-oa-expand-after.png',
    async (p) => {
      await p.locator('#session-confirm-bar').first().waitFor({ timeout: 15000 })
      const more = p.getByRole('button', { name: /还有 \d+ 条/ })
      if (await more.count()) {
        await more.first().click()
        await p.waitForTimeout(400)
      }
      await p.locator('#session-confirm-bar').scrollIntoViewIfNeeded().catch(() => {})
    },
  )

  await shot(
    'http://127.0.0.1:5175/agent/sessions/sess-oa-1?focus=hitl',
    'agent-composer-primary-after.png',
    async (p) => {
      await p.locator('#agent-confirm-reason-composer, .agent-confirm-reason').last().scrollIntoViewIfNeeded().catch(() => {})
      // scroll to bottom composer
      await p.evaluate(() => window.scrollTo(0, document.body.scrollHeight))
      await p.waitForTimeout(300)
    },
  )

  // R-P1-4 ops
  await shot('http://127.0.0.1:5176/', 'ops-home-deeplinks-after.png')
  await shot('http://127.0.0.1:5176/config#alerts', 'ops-alerts-biz-entry-after.png', async (p) => {
    await p.locator('#alerts').waitFor({ timeout: 10000 }).catch(() => {})
    await p.locator('#alerts').scrollIntoViewIfNeeded().catch(() => {})
  })
  await shot('http://127.0.0.1:5176/config#alerts', 'ops-alerts-mock-toast-after.png', async (p) => {
    await p.locator('#alerts').waitFor({ timeout: 10000 }).catch(() => {})
    const trial = p.getByRole('button', { name: /总控试发|试发/ }).first()
    if (await trial.count()) {
      await trial.click()
      await p.waitForTimeout(600)
    }
  })

  // Remind P2 inbox weight
  await shot('http://127.0.0.1:5173/', 'mid-dashboard-inbox-weight-after.png', async (p) => {
    const inbox = p.locator('#ops-inbox')
    if (await inbox.count()) {
      await inbox.scrollIntoViewIfNeeded()
      await p.waitForTimeout(400)
    }
  })

  // Deep P2 samples
  await shot('http://127.0.0.1:5173/', 'mid-phase0-badge-after.png', async (p) => {
    await p.locator('[aria-label="应用面切换"]').first().waitFor({ timeout: 8000 }).catch(() => {})
  })
  await shot('http://127.0.0.1:5177/', 'iam-devtools-after.png')
  await shot('http://127.0.0.1:5173/cases', 'mid-cases-truncate-after.png', async (p) => {
    await p.waitForTimeout(600)
  })
} catch (e) {
  console.error('SHOT_FAIL', e)
  process.exitCode = 1
} finally {
  await browser.close()
}
