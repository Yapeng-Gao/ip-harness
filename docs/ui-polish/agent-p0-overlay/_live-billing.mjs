import { chromium } from 'playwright'
import fs from 'node:fs'
import path from 'node:path'

const OUT = path.resolve('docs/ui-polish/agent-p0-overlay')
const BASE = 'http://127.0.0.1:5175'
const browser = await chromium.launch({ headless: true })
const page = await browser.newPage({ viewport: { width: 1440, height: 900 } })

await page.goto(`${BASE}/agent`, { waitUntil: 'networkidle' })
await page.waitForTimeout(600)

// Try open tenant/role menus and find overdue toggle; also poke localStorage keys
const lsKeys = await page.evaluate(() => Object.keys(localStorage))
console.log('ls keys sample', lsKeys.slice(0, 40))

// Force: patch overdueStopEnabled via any global store if present
const forced = await page.evaluate(() => {
  const keys = Object.keys(localStorage)
  const hits = {}
  for (const k of keys) {
    const v = localStorage.getItem(k) || ''
    if (/overdue|billing|stop|persona|agency/i.test(k) || /overdue|stopEnabled/.test(v)) {
      hits[k] = v.slice(0, 200)
    }
  }
  return hits
})
console.log('interesting ls', forced)

// Click role dropdowns looking for 欠费/停权
const texts = await page.evaluate(() =>
  [...document.querySelectorAll('button,a,label,summary')]
    .map((el) => (el.textContent || '').replace(/\s+/g, ' ').trim())
    .filter((t) => /停权|欠费|逾期|overdue|billing/i.test(t))
    .slice(0, 20),
)
console.log('billing-ish controls', texts)

// Source-level DOM: confirm no mid anchors inside any billing banner component class patterns
const midInBanner = await page.evaluate(() => {
  const banners = [
    ...document.querySelectorAll('[data-billing-hold-banner]'),
    ...document.querySelectorAll('[class*="billing"]'),
  ]
  return banners.map((b) => ({
    text: (b.textContent || '').replace(/\s+/g, ' ').trim().slice(0, 120),
    hrefs: [...b.querySelectorAll('a[href]')].map((a) => a.href),
  }))
})
console.log('banners', midInBanner)

// Last resort: temporarily mount check by reading module export isn't possible;
// Instead open agent and inject a fake banner sibling is NOT acceptable.
// Record: banner not in seed + source has zero <a>.

await page.screenshot({ path: path.join(OUT, 'live-06-home-billing-probe.png') })

// Grep-equivalent: count <a in component by fetching? skip.
fs.writeFileSync(
  path.join(OUT, '_live-billing.json'),
  JSON.stringify({ lsKeys: lsKeys.slice(0, 50), forced, texts, midInBanner }, null, 2),
)

// Also open Confirm-focused session and crop confirm region text for mid CTA assert
await page.goto(`${BASE}/agent/sessions/sess-oa-1?focus=hitl`, { waitUntil: 'networkidle' })
await page.waitForTimeout(900)
const confirmText = await page.evaluate(() => {
  const bar =
    document.querySelector('[data-testid="session-confirm-bar"]') ||
    document.querySelector('.confirm-hitl') ||
    [...document.querySelectorAll('div')].find((d) =>
      /待确认|批准策略|确认递交/.test(d.textContent || ''),
    )
  if (!bar) return null
  const text = (bar.textContent || '').replace(/\s+/g, ' ').trim()
  const hrefs = [...bar.querySelectorAll('a[href]')].map((a) => ({
    href: a.href,
    text: (a.textContent || '').replace(/\s+/g, ' ').trim(),
  }))
  return { text: text.slice(0, 400), hrefs }
})
console.log('confirm', confirmText)
await page.screenshot({ path: path.join(OUT, 'live-07-confirm-hitl.png') })

const forbidden = ['回中台', '运营 Inbox', '案详']
const confirmBad = confirmText
  ? forbidden.filter((f) => (confirmText.text || '').includes(f))
  : ['confirm-bar-missing']
const midHrefs = (confirmText?.hrefs || []).filter((h) => {
  try {
    const u = new URL(h.href)
    return u.port === '5173' || /\/(cases|inbox|billing)\b/.test(u.pathname)
  } catch {
    return false
  }
})

const result = {
  confirmBad,
  midHrefs,
  billingBannerAnchors: midInBanner.flatMap((b) => b.hrefs),
  pass: confirmBad.length === 0 && midHrefs.length === 0,
}
fs.writeFileSync(path.join(OUT, '_live-confirm-billing.json'), JSON.stringify(result, null, 2))
console.log(JSON.stringify(result, null, 2))
await browser.close()
process.exit(result.pass ? 0 : 2)
