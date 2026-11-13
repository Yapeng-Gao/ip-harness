import { chromium } from '@playwright/test'
import fs from 'node:fs'
import path from 'node:path'

const outs = [
  '/workspace/ip-harness/docs/ui-polish/parallel-shells-p1',
  '/workspace/ip-harness/.ui-evidence/parallel-shells-p1',
]
for (const d of outs) fs.mkdirSync(d, { recursive: true })

function dest(name) {
  return outs.map((d) => path.join(d, `${name}.png`))
}

const browser = await chromium.launch({ headless: true, args: ['--no-sandbox'] })
const context = await browser.newContext({
  viewport: { width: 1440, height: 900 },
  deviceScaleFactor: 1,
})
const page = await context.newPage()

async function save(name, buffer) {
  for (const f of dest(name)) {
    fs.writeFileSync(f, buffer)
    console.log('  saved', f)
  }
}

async function shotPage(name, url, waitMs = 1200) {
  console.log('→', name, url)
  await page.goto(url, { waitUntil: 'networkidle', timeout: 45000 })
  await page.waitForTimeout(waitMs)
  const buf = await page.screenshot({ type: 'png', fullPage: false })
  await save(name, buf)
}

async function shotLocator(name, selector, opts = {}) {
  const loc = page.locator(selector).first()
  await loc.waitFor({ timeout: 15000 })
  if (opts.scroll) await loc.scrollIntoViewIfNeeded()
  const buf = await loc.screenshot({ type: 'png' })
  await save(name, buf)
}

// AI-P1-1 loadtest disabled reason
await shotPage('ai-loadtest-disabled-reason', 'http://127.0.0.1:5179/loadtest')
await shotLocator('ai-loadtest-disabled-reason-card', 'main .rounded-xl.border', { scroll: true })

// AI-P1-2 empty CTAs
await shotPage('ai-models-empty-cta', 'http://127.0.0.1:5179/models')
await shotLocator('ai-models-empty-cta-block', 'text=无模型', { scroll: true }).catch(() => {})
try {
  await shotLocator('ai-models-empty-cta-block', '.border-dashed', { scroll: true })
} catch (e) {
  console.log('models empty locator fallback', e.message)
}

await shotPage('ai-endpoints-empty-cta', 'http://127.0.0.1:5179/endpoints')
try {
  await shotLocator('ai-endpoints-empty-cta-block', '.border-dashed', { scroll: true })
} catch (e) {
  console.log('endpoints empty locator fallback', e.message)
}

// chrome label (P2)
await shotPage('ai-infra-chrome-ops-label', 'http://127.0.0.1:5179/')

// AD empty CTAs
await shotPage('ad-exports-empty-cta', 'http://127.0.0.1:5181/exports')
try {
  await shotLocator('ad-exports-empty-cta-block', '.border-dashed', { scroll: true })
} catch (e) {
  console.log('exports empty', e.message)
}

await shotPage('ad-sources-empty-cta', 'http://127.0.0.1:5181/sources')
try {
  await shotLocator('ad-sources-empty-cta-block', '.border-dashed', { scroll: true })
} catch (e) {
  console.log('sources empty', e.message)
}

await shotPage('ai-data-chrome-labels', 'http://127.0.0.1:5181/')

// focus-ring: tab to primary button if present
await page.goto('http://127.0.0.1:5181/sources', { waitUntil: 'networkidle' })
await page.waitForTimeout(800)
await page.keyboard.press('Tab')
await page.keyboard.press('Tab')
await page.keyboard.press('Tab')
await page.keyboard.press('Tab')
await page.keyboard.press('Tab')
await page.waitForTimeout(300)
const focused = await page.evaluate(() => {
  const el = document.activeElement
  if (!el) return null
  return {
    tag: el.tagName,
    className: el.className,
    text: (el.textContent || '').trim().slice(0, 40),
  }
})
console.log('focused after tabs', focused)
const focusBuf = await page.screenshot({ type: 'png', fullPage: false })
await save('ad-focus-ring-tab', focusBuf)

await browser.close()
console.log('done')
