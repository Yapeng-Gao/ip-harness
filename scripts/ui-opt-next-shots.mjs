import { chromium } from 'playwright'
import path from 'path'
import fs from 'fs'
import { fileURLToPath } from 'url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const root = path.resolve(__dirname, '..')
const out = path.join(root, 'docs/ui-polish/ui-opt-next')
const sync = path.join(root, '.ui-evidence/ui-opt-next')
fs.mkdirSync(out, { recursive: true })
fs.mkdirSync(sync, { recursive: true })

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
  await page.waitForTimeout(1400)
  if (prep) await prep(page)
  await page.waitForTimeout(400)
  const dest = path.join(out, file)
  await page.screenshot({ path: dest, fullPage: false })
  fs.copyFileSync(dest, path.join(sync, file))
  console.log('OK', file, fs.statSync(dest).size)
}

try {
  // 1 catalog secondary links / weak hint
  await shot(
    'http://127.0.0.1:5175/agent/agents',
    'agent-catalog-secondary-after.png',
    async (p) => {
      await p.locator('.agent-picker-card').first().waitFor({ timeout: 15000 })
      // expand one details for weak summary
      const sum = p.locator('.agent-picker-card__details-summary').first()
      if (await sum.count()) {
        await sum.click().catch(() => {})
        await p.waitForTimeout(300)
      }
    },
  )

  // 2 mid picker surface via legacy? mid agent may be under mid shell — use agent home harness as mid-language surface
  // Prefer mid catalog if exposed; otherwise agent harness list + card tokens
  await shot(
    'http://127.0.0.1:5175/agent/harness',
    'mid-agent-picker-mirror-after.png',
    async (p) => {
      await p.locator('.agent-harness-row, .agent-picker-card').first().waitFor({ timeout: 15000 })
    },
  )

  // Also shoot mid shell agent catalog if route exists on 5173
  await shot(
    'http://127.0.0.1:5173/agent/agents',
    'mid-catalog-picker-after.png',
    async (p) => {
      await p.waitForTimeout(800)
      const card = p.locator('.agent-picker-card').first()
      if (await card.count()) {
        await card.waitFor({ timeout: 10000 })
      }
    },
  ).catch((e) => console.log('mid catalog skip', e.message))

  // 3 session rail density
  await shot(
    'http://127.0.0.1:5175/agent/sessions/sess-oa-1',
    'agent-session-rail-density-after.png',
    async (p) => {
      await p.locator('.agent-rail-row, aside').first().waitFor({ timeout: 15000 })
    },
  )

  // 4 mid inbox density reference
  await shot(
    'http://127.0.0.1:5173/',
    'mid-inbox-density-after.png',
    async (p) => {
      await p.locator('.dash-inbox-row, [class*="inbox"]').first().waitFor({ timeout: 15000 }).catch(() => {})
    },
  )

  // extras: maintain table, rail empty (filter nonsense)
  await shot(
    'http://127.0.0.1:5174/workbench/maintain/c6',
    'wb-maintain-table-after.png',
    async (p) => {
      await p.getByText('年费日程表').first().waitFor({ timeout: 15000 })
      await p.getByText('年费日程表').first().scrollIntoViewIfNeeded()
    },
  )

  await shot(
    'http://127.0.0.1:5175/agent/sessions',
    'agent-rail-empty-or-list-after.png',
    async (p) => {
      // try search that empties
      const input = p.locator('#agent-session-search, input[type="search"], input[placeholder*="搜"]').first()
      if (await input.count()) {
        await input.fill('___no_match_ui_opt_next___')
        await p.waitForTimeout(500)
      }
    },
  )
} finally {
  await browser.close()
}
console.log('done')
