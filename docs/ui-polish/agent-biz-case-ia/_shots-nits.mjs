import { chromium } from 'playwright'
import { mkdirSync } from 'fs'
import { join } from 'path'

const OUT = '/workspace/ip-harness/docs/ui-polish/agent-biz-case-ia'
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
await page.waitForTimeout(400)

await page.goto(base + `/agent/cases/${CASE}?seat=expert-disclosure`, {
  waitUntil: 'networkidle',
})
await page.waitForTimeout(800)
await page.getByTestId('business-case-page').waitFor({ state: 'visible', timeout: 15000 })
await page.getByTestId('business-seat-chat').waitFor({ state: 'visible', timeout: 10000 })

const cta = await page.getByTestId('business-case-primary-cta').innerText()
const chips = await page.getByTestId('business-seat-chips').count()
const deferred = await page.getByTestId('business-seat-chips-deferred').count()
const processOnChat = await page.getByTestId('case-process-panel').count()
console.log({ cta, chips, deferred, processOnChat })

await shot(page, '07-nit-pending-chips-deferred.png')

await page.getByTestId('business-seat-tab-worklog').click()
await page.waitForTimeout(400)
await page.getByTestId('case-process-panel').waitFor({ state: 'visible', timeout: 5000 })
const processOnTab = await page.getByTestId('case-process-panel').count()
console.log({ processOnTab })
await shot(page, '08-nit-process-in-tab.png')

await browser.close()
console.log('done')
