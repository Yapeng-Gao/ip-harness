import { chromium } from 'playwright'
import fs from 'node:fs'
import path from 'node:path'

const OUT = path.resolve('docs/ui-polish/agent-p0-overlay')
const BASE = 'http://127.0.0.1:5175'
const browser = await chromium.launch({ headless: true })
const page = await browser.newPage({ viewport: { width: 1440, height: 900 } })

await page.goto(`${BASE}/agent`, { waitUntil: 'networkidle' })
await page.waitForTimeout(500)

const patched = await page.evaluate(() => {
  const key = 'ip-harness.cross.v1.snapshot'
  const raw = localStorage.getItem(key)
  if (!raw) return { ok: false, reason: 'no snapshot' }
  const snap = JSON.parse(raw)
  snap.overdueStopEnabled = true
  // ensure agency persona/role if present
  if ('persona' in snap) snap.persona = 'agency'
  if ('role' in snap) snap.role = 'agency'
  // mark first invoice overdue if structure known
  if (Array.isArray(snap.cases)) {
    for (const c of snap.cases) {
      if (!Array.isArray(c.invoices)) continue
      for (const inv of c.invoices) {
        inv.status = inv.status || '逾期'
        if (!inv.dueDate) inv.dueDate = '2020-01-01'
        inv.status = '逾期'
      }
      if (!c.invoices.length) {
        c.invoices = [
          {
            id: 'inv-force-1',
            status: '逾期',
            dueDate: '2020-01-01',
            amount: 1000,
            no: 'INV-FORCE',
          },
        ]
      }
    }
  }
  localStorage.setItem(key, JSON.stringify(snap))
  return {
    ok: true,
    overdueStopEnabled: snap.overdueStopEnabled,
    persona: snap.persona,
    role: snap.role,
    invoiceStatuses: (snap.cases || []).slice(0, 3).map((c) => ({
      id: c.id,
      inv: (c.invoices || []).map((i) => i.status),
    })),
  }
})
console.log('patched', patched)

await page.reload({ waitUntil: 'networkidle' })
await page.waitForTimeout(1000)

const banner = await page.evaluate(() => {
  const el = document.querySelector('[data-billing-hold-banner]')
  if (!el) {
    // also search text
    const hit = [...document.querySelectorAll('div')].find((d) =>
      /欠票|停权|费用冻结/.test(d.textContent || '') && (d.textContent || '').length < 400,
    )
    return {
      present: false,
      maybe: hit
        ? {
            text: hit.textContent.replace(/\s+/g, ' ').trim().slice(0, 200),
            hrefs: [...hit.querySelectorAll('a[href]')].map((a) => a.href),
          }
        : null,
    }
  }
  return {
    present: true,
    variant: el.getAttribute('data-billing-hold-banner'),
    text: (el.textContent || '').replace(/\s+/g, ' ').trim().slice(0, 240),
    hrefs: [...el.querySelectorAll('a[href]')].map((a) => ({
      href: a.href,
      text: (a.textContent || '').replace(/\s+/g, ' ').trim(),
    })),
    tagNames: [...el.querySelectorAll('*')].map((n) => n.tagName).slice(0, 40),
  }
})
console.log(JSON.stringify(banner, null, 2))
await page.screenshot({ path: path.join(OUT, 'live-06-billing-hold.png'), fullPage: false })
fs.writeFileSync(path.join(OUT, '_live-billing-force.json'), JSON.stringify({ patched, banner }, null, 2))

const pass = banner.present ? banner.hrefs.length === 0 : banner.maybe?.hrefs?.length === 0 || !banner.maybe
console.log('PASS_BILLING_NO_MID', pass, 'present', banner.present)
await browser.close()
process.exit(0)
