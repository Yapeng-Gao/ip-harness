import { chromium } from 'playwright'
import { mkdirSync } from 'fs'
import { join } from 'path'

const OUT = '/workspace/ip-harness/docs/ui-polish/agent-seat-bot-c'
mkdirSync(OUT, { recursive: true })
const base = 'http://127.0.0.1:5175'
const CASE = 'case-biz-edge-scheduler'

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
    for (const k of Object.keys(localStorage)) {
      if (k.includes('project') || k.includes('folder') || k.includes('thread') || k.includes('room')) {
        localStorage.removeItem(k)
      }
    }
  } catch {}
})
await page.reload({ waitUntil: 'networkidle' })
await page.waitForTimeout(500)
await shot(page, '01-home-intact.png')

await page.goto(base + `/agent/cases/${CASE}?seat=expert-research`, {
  waitUntil: 'networkidle',
})
await page.waitForTimeout(700)
await page.getByTestId('business-seat-tab-expert-research').click()
await page.waitForTimeout(300)
await page.getByTestId('business-seat-chat').waitFor({ state: 'visible', timeout: 10000 })
await shot(page, '02-research-seat.png')

await page.getByTestId('business-seat-tab-expert-intake').click()
await page.waitForTimeout(400)
await page.getByTestId('business-seat-chat').waitFor({ state: 'visible' })
await shot(page, '03-intake-seat.png')

await page.getByTestId('business-seat-rail').scrollIntoViewIfNeeded()
await shot(page, '04-seven-rail.png')

await page.getByTestId('business-case-group-chat').click()
await page.waitForURL(/\/room/, { timeout: 10000 })
await page.waitForTimeout(500)
await page.getByTestId('business-case-room-page').waitFor({ state: 'visible' })
await shot(page, '05-room-empty.png')

await page.getByTestId('business-case-room-shout').click()
await page.waitForTimeout(4200)
await shot(page, '06-room-shout.png')

await page.goto(base + `/agent/cases/${CASE}?seat=expert-disclosure`, {
  waitUntil: 'networkidle',
})
await page.waitForTimeout(600)
await page.getByTestId('business-seat-tab-expert-disclosure').click()
await page.waitForTimeout(300)
await page.getByTestId('business-seat-chat').waitFor({ state: 'visible' })
await shot(page, '07-disclosure-still.png')

await browser.close()
console.log('done')
