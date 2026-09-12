import { chromium } from 'playwright'
import path from 'path'
import fs from 'fs'
import { fileURLToPath } from 'url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const root = path.resolve(__dirname, '..')
const out = path.join(root, 'docs/ui-polish/unify-p1')
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
  await shot('http://127.0.0.1:5173/', 'mid-dashboard-after.png')
  await shot('http://127.0.0.1:5173/pipeline', 'mid-pipeline-after.png')
  await shot('http://127.0.0.1:5173/docket', 'mid-docket-after.png')

  await shot('http://127.0.0.1:5175/agent/agents', 'agent-catalog-expanded-after.png', async (p) => {
    const details = p.locator('article details summary')
    const n = Math.min(await details.count(), 3)
    for (let i = 0; i < n; i++) {
      await details.nth(i).click().catch(() => {})
      await p.waitForTimeout(250)
    }
  })

  await shot('http://127.0.0.1:5175/agent/sessions/sess-oa-1', 'agent-session-context-after.png', async (p) => {
    await p.waitForTimeout(800)
    const chip = p.getByRole('button', { name: /上下文/ })
    if (await chip.count()) {
      const pressed = await chip.first().getAttribute('aria-pressed')
      if (pressed !== 'true') await chip.first().click()
    }
  })

  await shot('http://127.0.0.1:5174/workbench/intake/c5', 'wb-intake-tips-after.png')
  await shot('http://127.0.0.1:5174/workbench/research/c2', 'wb-research-tips-after.png')
} catch (e) {
  console.error('SHOT_FAIL', e)
  process.exitCode = 1
} finally {
  await browser.close()
}
