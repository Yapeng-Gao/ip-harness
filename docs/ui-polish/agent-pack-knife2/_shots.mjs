import { chromium } from 'playwright'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import fs from 'node:fs'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const out = __dirname
const base = 'http://127.0.0.1:5175'
const OA = 'case-biz-oa-filed'
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

// locked OA on unfiled case B
await page.goto(base + `/agent/cases/${B}`)
await page.waitForSelector('[data-testid="business-case-page"]')
await shot(page, '02-case-unfiled-oa-locked.png')

// filed OA case
await page.goto(base + `/agent/cases/${OA}`)
await page.waitForSelector('[data-testid="business-case-page"]')
await page.waitForSelector('[data-testid="business-oa-round-badge"]')
await shot(page, '03-case-oa-round1.png')

// process panel with OA logs
await page.locator('[data-testid="case-process-panel"]').scrollIntoViewIfNeeded()
await shot(page, '04-case-oa-process.png')

// pending inbox
await page.goto(base + '/agent/pending')
await page.waitForSelector('[data-testid="pending-confirm-inbox"]')
await shot(page, '05-pending-inbox-oa.png')

// OA strategy detail
await page.goto(base + '/agent/pending/bcf-seed-oa-strategy')
await page.waitForSelector('[data-testid="pending-confirm-detail"]')
await shot(page, '06-pending-oa-strategy.png')

// reject strategy
await page.click('[data-testid="pending-confirm-return"]')
await page.waitForTimeout(700)
await page.goto(base + `/agent/cases/${OA}`)
await page.waitForSelector('[data-testid="business-return-hint"]', { timeout: 5000 }).catch(() => {})
await shot(page, '07-after-strategy-reject.png')

// re-open pending and confirm
const pendingLink = page.locator('[data-testid^="business-case-pending-"]').first()
await pendingLink.click()
await page.waitForSelector('[data-testid="pending-confirm-submit"]')
await page.click('[data-testid="pending-confirm-submit"]')
await page.waitForTimeout(700)
await page.goto(base + `/agent/cases/${OA}`)
await page.waitForSelector('[data-testid="business-case-page"]')
await shot(page, '08-after-strategy-confirm.png')

// catalog F6 panel + round2 + blocker
await page.goto(base + '/agent/catalog')
await page.waitForSelector('[data-testid="pack-loops-f6"]')
await page.locator('[data-testid="pack-loops-f6"]').scrollIntoViewIfNeeded()
await shot(page, '09-catalog-f6-panel.png')

await page.click('[data-testid="pack-loops-oa-round2"]')
await page.waitForTimeout(400)
await page.locator('[data-testid="pack-loops-oa-round"]').scrollIntoViewIfNeeded()
await shot(page, '10-catalog-round2.png')

await page.click('[data-testid="pack-loops-oa-blocker"]')
await page.waitForTimeout(300)
await shot(page, '11-catalog-blocker.png')

// OA case after round2
await page.goto(base + `/agent/cases/${OA}`)
await page.waitForSelector('[data-testid="business-oa-round-badge"]')
await shot(page, '12-case-oa-round2.png')

// seat validator OA blocker
await page.goto(base + '/agent/seats/expert-oa')
await page.waitForTimeout(800)
const blockerBtn = page.locator('[data-testid="validator-oa-blocker"]')
if (await blockerBtn.count()) {
  await blockerBtn.scrollIntoViewIfNeeded()
  await blockerBtn.click()
  await page.waitForTimeout(300)
  await shot(page, '13-seat-oa-blocker.png')
} else {
  console.log('no validator-oa-blocker — cold start blocked?')
  await shot(page, '13-seat-oa-blocker.png')
}

await shot(page, '14-agent-cold-start.png') // overwrite after goto agent
await page.goto(base + '/agent')
await page.waitForSelector('[data-testid="business-cases-page"], h1')
await shot(page, '14-agent-cold-start.png')

await browser.close()
console.log('done', fs.readdirSync(out).filter((f) => f.endsWith('.png')).length, 'pngs')
