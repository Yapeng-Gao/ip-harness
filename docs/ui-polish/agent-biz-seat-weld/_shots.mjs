import { chromium } from 'playwright'
import { mkdirSync } from 'fs'
import { join } from 'path'

const OUT = '/workspace/ip-harness/docs/ui-polish/agent-biz-seat-weld'
mkdirSync(OUT, { recursive: true })
const base = 'http://127.0.0.1:5175'

async function shot(page, name) {
  const path = join(OUT, name)
  await page.screenshot({ path, fullPage: true })
  console.log('saved', name)
}

const browser = await chromium.launch({
  headless: true,
  executablePath: '/usr/bin/google-chrome',
  args: ['--no-sandbox', '--disable-dev-shm-usage'],
})
const context = await browser.newContext({
  viewport: { width: 1440, height: 900 },
  locale: 'zh-CN',
})
const page = await context.newPage()
await page.goto(base + '/agent', { waitUntil: 'networkidle' })
await page.evaluate(() => {
  try {
    localStorage.removeItem('ip-harness-agent-business-v1')
  } catch {}
})
await page.reload({ waitUntil: 'networkidle' })
await page.waitForTimeout(600)
await shot(page, '01-home-chat-intact.png')

// Case B — drafting / disclosure done, claims pending — open disclosure seat
await page.goto(base + '/agent/cases/case-biz-sensor-pack?seat=expert-disclosure', {
  waitUntil: 'networkidle',
})
await page.waitForTimeout(700)
await shot(page, '02-case-seat-rail.png')

// Click 交底 tab ensure, then advance until pending or navigate
const discTab = page.getByTestId('business-seat-tab-expert-disclosure')
if (await discTab.count()) await discTab.click()
await page.waitForTimeout(300)

// Switch to a seat that can still deliver - use research on a fresh-ish path
// For sensor pack drafting: disclosure already done. Use figure or re-advance disclosure.
// Better: open case that needs disclosure prep - use edge-scheduler after confirming go_nogo
// Or just click advance on disclosure repeatedly to recreate confirm
const adv = page.getByTestId('business-seat-advance')
if (await adv.count()) {
  await adv.click()
  await page.waitForTimeout(800)
}
// If navigated to pending, shot; else stay and force via prepare by advancing draft
if (page.url().includes('/pending/')) {
  await shot(page, '03-advance-disclosure.png')
} else {
  // try disclosure on edge case by selecting seat and advancing
  await page.goto(
    base + '/agent/cases/case-biz-edge-scheduler?seat=expert-disclosure',
    { waitUntil: 'networkidle' },
  )
  await page.waitForTimeout(500)
  const tab = page.getByTestId('business-seat-tab-expert-disclosure')
  if (await tab.count()) await tab.click()
  await page.waitForTimeout(200)
  // advance multiple times to hit HITL step
  for (let i = 0; i < 5; i++) {
    const btn = page.getByTestId('business-seat-advance')
    if (!(await btn.count())) break
    await btn.click()
    await page.waitForTimeout(500)
    if (page.url().includes('/pending/')) break
  }
  await shot(page, '03-advance-disclosure.png')
}

// Catalog weld
await page.goto(base + '/agent/catalog', { waitUntil: 'networkidle' })
await page.waitForTimeout(600)
const sel = page.getByTestId('catalog-biz-case-select')
if (await sel.count()) {
  await sel.selectOption('case-biz-sensor-pack')
}
await page.waitForTimeout(300)
await shot(page, '04-catalog-biz-weld.png')

// Click 进本案 on disclosure
const bizBtn = page.getByTestId('patent-seat-biz-expert-disclosure')
if (await bizBtn.count()) {
  await bizBtn.click()
  await page.waitForTimeout(800)
  await shot(page, '05-catalog-into-case-seat.png')
}

await browser.close()
console.log('done')
