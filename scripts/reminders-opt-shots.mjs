import { chromium } from 'playwright'
import path from 'path'
import fs from 'fs'
import { fileURLToPath } from 'url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const root = path.resolve(__dirname, '..')
const out = path.join(root, 'docs/ui-polish/reminders-opt')
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
  await page.waitForTimeout(1000)
  if (prep) await prep(page)
  await page.waitForTimeout(400)
  const dest = path.join(out, file)
  await page.screenshot({ path: dest, fullPage: false })
  console.log('OK', file, fs.statSync(dest).size)
}

try {
  // Docket list — urgency rails + actions
  await shot('http://127.0.0.1:5173/docket', 'mid-docket-list-after.png', async (p) => {
    await p.locator('.mid-docket-row').first().waitFor({ timeout: 15000 }).catch(() => {})
  })

  // Remind toast (honest info) — click first 记录提醒
  await shot('http://127.0.0.1:5173/docket', 'mid-docket-remind-toast-after.png', async (p) => {
    const btn = p.getByRole('button', { name: /记录提醒/ }).first()
    if (await btn.count()) {
      await btn.click()
      await p.waitForTimeout(600)
      await p.locator('.ui-toast-info, .ui-toast').first().waitFor({ timeout: 5000 }).catch(() => {})
    } else {
      console.log('no remind button visible — maybe already reminded')
    }
  })

  // Dashboard next + inbox urgency / SLA chips
  await shot('http://127.0.0.1:5173/', 'mid-dashboard-next-inbox-after.png', async (p) => {
    await p.locator('.dash-next, #ops-inbox, [aria-label="下一步 · 优先办理"]').first().waitFor({ timeout: 15000 }).catch(() => {})
  })

  // Scroll inbox for chip colors
  await shot('http://127.0.0.1:5173/', 'mid-dashboard-inbox-chips-after.png', async (p) => {
    const inbox = p.locator('#ops-inbox')
    if (await inbox.count()) {
      await inbox.scrollIntoViewIfNeeded()
      await p.waitForTimeout(400)
    }
  })

  // Settings notify honesty
  await shot('http://127.0.0.1:5173/settings#notify', 'mid-settings-notify-after.png')

  // Prosecution sticky tip
  await shot('http://127.0.0.1:5174/workbench/prosecution/c1', 'wb-prosecution-sticky-after.png', async (p) => {
    await p.locator('[data-sticky-tip="1"], .wb-tip-sticky').first().waitFor({ timeout: 8000 }).catch(() => {})
  })
} catch (e) {
  console.error('SHOT_FAIL', e)
  process.exitCode = 1
} finally {
  await browser.close()
}
