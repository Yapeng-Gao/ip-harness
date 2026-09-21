import { chromium } from 'playwright'
import { mkdirSync } from 'fs'
import { join } from 'path'

const OUT = '/workspace/ip-harness/docs/ui-polish/agent-seat-as-bot'
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
await page.waitForTimeout(500)
await shot(page, '01-home-chat-intact.png')

await page.goto(
  base + '/agent/cases/case-biz-edge-scheduler?seat=expert-disclosure',
  { waitUntil: 'networkidle' },
)
await page.waitForTimeout(800)
const discTab = page.getByTestId('business-seat-tab-expert-disclosure')
if (await discTab.count()) await discTab.click()
await page.waitForTimeout(400)

await page.getByTestId('business-seat-chat').waitFor({ state: 'visible', timeout: 10000 })
await shot(page, '02-disclosure-seat-chat.png')

// scripted round via composer
const composer = page.getByTestId('business-seat-composer')
await composer.fill('边缘节点调度，请先收技术点')
await page.getByTestId('business-seat-send').click()
await page.waitForTimeout(900)
await shot(page, '03-after-chat-round.png')

// open artifact panel
await page.getByTestId('business-seat-tab-artifact').click()
await page.waitForTimeout(300)
await shot(page, '04-artifact-panel.png')

// back to chat, keep working until HITL
await page.getByTestId('business-seat-tab-chat').click()
await page.waitForTimeout(200)
for (let i = 0; i < 6; i++) {
  if (page.url().includes('/pending/')) break
  const gate = page.getByTestId('business-seat-pending-gate')
  if ((await gate.count()) > 0) break
  const chip = page.getByTestId('business-seat-chip-work')
  const deliver = page.getByTestId('business-seat-chip-deliver')
  const label = await page
    .getByTestId('business-seat-advance')
    .getAttribute('data-advance-label')
  console.log('round', i, label)
  if (label === '交卷待确认') {
    await deliver.click()
  } else {
    await chip.click()
  }
  await page.waitForTimeout(700)
  if (page.url().includes('/pending/')) break
}
await page.waitForTimeout(500)
await shot(page, '05-hitl-after-deliver.png')

// if still on case, show group chat placeholder
if (!page.url().includes('/pending/')) {
  const g = page.getByTestId('business-case-group-chat')
  if (await g.count()) {
    await g.scrollIntoViewIfNeeded()
    await shot(page, '06-group-chat-placeholder.png')
  }
} else {
  // go back to case to capture group chat entry
  await page.goto(
    base + '/agent/cases/case-biz-edge-scheduler?seat=expert-disclosure',
    { waitUntil: 'networkidle' },
  )
  await page.waitForTimeout(600)
  await shot(page, '06-group-chat-placeholder.png')
}

await browser.close()
console.log('done')
