import { chromium } from 'playwright'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import fs from 'node:fs'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const out = __dirname
const base = 'http://127.0.0.1:5175'
const D = 'case-biz-layout-flywheel'
const B = 'case-biz-sensor-pack'

async function shot(page, name) {
  const fp = path.join(out, name)
  await page.screenshot({ path: fp, fullPage: true })
  console.log('shot', name)
}

async function clearBiz(page) {
  await page.goto(base + '/agent')
  await page.evaluate(() => {
    localStorage.removeItem('ip-harness-agent-business-v1')
  })
  await page.reload({ waitUntil: 'networkidle' })
}

const browser = await chromium.launch({
  executablePath: '/usr/bin/google-chrome',
  headless: true,
  args: ['--no-sandbox', '--disable-dev-shm-usage'],
})
const page = await browser.newPage({ viewport: { width: 1440, height: 900 } })

await clearBiz(page)
await shot(page, '01-agent-my-cases.png')

// layout-enabled flywheel case
await page.goto(base + `/agent/cases/${D}`)
await page.waitForSelector('[data-testid="business-case-page"]')
await page.waitForSelector('[data-testid="business-layout-enabled-badge"]')
await shot(page, '02-case-layout-enabled.png')

await page.locator('[data-testid="case-process-panel"]').scrollIntoViewIfNeeded()
await shot(page, '03-case-flywheel-process.png')

// pending inbox with layout adjust
await page.goto(base + '/agent/pending')
await page.waitForSelector('[data-testid="pending-confirm-inbox"]')
await shot(page, '04-pending-inbox-layout.png')

await page.goto(base + '/agent/pending/bcf-seed-layout-adjust')
await page.waitForSelector('[data-testid="pending-confirm-detail"]')
await shot(page, '05-pending-layout-adjust.png')

// confirm layout
await page.click('[data-testid="pending-confirm-submit"]')
await page.waitForTimeout(700)
await page.goto(base + `/agent/cases/${D}`)
await page.waitForSelector('[data-testid="business-case-page"]')
await shot(page, '06-after-layout-confirm.png')

// catalog F9 panel
await page.goto(base + '/agent/catalog')
await page.waitForSelector('[data-testid="pack-loops-f9"]')
await page.locator('[data-testid="pack-loops-f9"]').scrollIntoViewIfNeeded()
await shot(page, '07-catalog-f9-panel.png')

// expert-only flywheel on case B (no layout)
await page.click('[data-testid="pack-loops-flywheel-expert-only"]')
await page.waitForTimeout(400)
await shot(page, '08-catalog-expert-only-flywheel.png')

// grey chain demos
await page.click('[data-testid="pack-loops-pessimistic"]')
await page.waitForTimeout(200)
await page.click('[data-testid="pack-loops-low-score"]')
await page.waitForTimeout(300)
await page.locator('[data-testid="pack-loops-f9"]').scrollIntoViewIfNeeded()
await shot(page, '09-catalog-grey-reflux.png')

// new case wizard — phase grey 布局/维权
await page.goto(base + '/agent/cases/new')
await page.waitForTimeout(500)
const moreToggle = page.locator('[data-testid="business-more-experts-toggle"]')
if (await moreToggle.count()) {
  // may need to advance wizard steps first
}
// try open more on step that has it
for (let i = 0; i < 4; i++) {
  const t = page.locator('[data-testid="business-more-experts-toggle"]')
  if (await t.count()) {
    await t.click()
    await page.waitForSelector('[data-testid="business-phase-seats"]')
    await shot(page, '10-new-case-phase-grey.png')
    break
  }
  const next = page.locator('[data-testid="business-new-next"]')
  if (await next.count()) await next.click()
  await page.waitForTimeout(300)
}

// cold start again
await clearBiz(page)
await shot(page, '11-agent-cold-start.png')

// enforcement seat ≠ FTO note via catalog / seat page
await page.goto(base + '/agent/seats/expert-enforcement')
await page.waitForTimeout(800)
await shot(page, '12-seat-enforcement-not-fto.png')

await page.goto(base + '/agent/seats/expert-fto')
await page.waitForTimeout(600)
await shot(page, '13-seat-fto-separate.png')

await browser.close()
console.log('done', fs.readdirSync(out).filter((f) => f.endsWith('.png')).length, 'pngs')
