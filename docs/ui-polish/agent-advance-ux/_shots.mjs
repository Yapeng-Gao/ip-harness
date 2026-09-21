import { chromium } from 'playwright'
import { mkdirSync } from 'fs'
import { join } from 'path'

const OUT = '/workspace/ip-harness/docs/ui-polish/agent-advance-ux'
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
    for (const k of Object.keys(localStorage)) {
      if (k.includes('project') || k.includes('folder') || k.includes('thread')) {
        localStorage.removeItem(k)
      }
    }
  } catch {}
})
await page.reload({ waitUntil: 'networkidle' })
await page.waitForTimeout(400)

await page.goto(
  base + '/agent/cases/case-biz-edge-scheduler?seat=expert-disclosure',
  { waitUntil: 'networkidle' },
)
await page.waitForTimeout(700)
const discTab = page.getByTestId('business-seat-tab-expert-disclosure')
if (await discTab.count()) await discTab.click()
await page.waitForTimeout(300)

const adv = page.getByTestId('business-seat-advance')
await adv.waitFor({ state: 'visible', timeout: 10000 })
console.log('btn', await adv.getAttribute('data-advance-label'))
await shot(page, '01-disclosure-step0.png')

await adv.click()
await page.waitForTimeout(700)
await shot(page, '02-after-advance-worklog.png')

const artTab = page.getByTestId('business-dual-tab-artifact')
if (await artTab.count()) await artTab.click()
await page.waitForTimeout(300)
await shot(page, '03-artifact-grew.png')

// continue to HITL
for (let i = 0; i < 6; i++) {
  const btn = page.getByTestId('business-seat-advance')
  if (!(await btn.count())) break
  const label = await btn.getAttribute('data-advance-label')
  console.log('advance', i, label)
  await btn.click()
  await page.waitForTimeout(550)
  if (page.url().includes('/pending/')) break
  const pending = page.getByTestId('business-seat-pending-gate')
  if ((await pending.count()) > 0) break
}
await page.waitForTimeout(400)
await shot(page, '04-hitl-pending.png')

await browser.close()
console.log('done')
