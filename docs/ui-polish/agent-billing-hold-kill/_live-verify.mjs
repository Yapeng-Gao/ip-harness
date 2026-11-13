import { chromium } from 'playwright'
import fs from 'node:fs'
import path from 'node:path'

const OUT = path.resolve('docs/ui-polish/agent-billing-hold-kill')
fs.mkdirSync(OUT, { recursive: true })
const BASE = 'http://127.0.0.1:5175'

const FORBIDDEN_TEXT = ['不停审', '仅提示·不停审', '仅提示（企业不停审）', '递交已停权']

const browser = await chromium.launch({ headless: true })
const page = await browser.newPage({ viewport: { width: 1440, height: 900 } })

const report = {
  base: BASE,
  startedAt: new Date().toISOString(),
  pages: [],
  pass: true,
  note: 'Assert NO full-width BillingHold / 不停审 amber on Agent shell routes',
}

async function forceBillingHold() {
  return page.evaluate(() => {
    const key = 'ip-harness.cross.v1.snapshot'
    const raw = localStorage.getItem(key)
    if (!raw) return { ok: false, reason: 'no snapshot' }
    const snap = JSON.parse(raw)
    snap.overdueStopEnabled = true
    if ('persona' in snap) snap.persona = 'enterprise_ip'
    if ('role' in snap) snap.role = 'enterprise_ip'
    if (Array.isArray(snap.cases)) {
      for (const c of snap.cases) {
        if (!Array.isArray(c.invoices)) c.invoices = []
        if (!c.invoices.length) {
          c.invoices = [
            {
              id: `inv-force-${c.id || 'x'}`,
              status: '逾期',
              dueDate: '2020-01-01',
              amount: 1000,
              no: 'INV-FORCE',
            },
          ]
        } else {
          for (const inv of c.invoices) {
            inv.status = '逾期'
            if (!inv.dueDate) inv.dueDate = '2020-01-01'
          }
        }
      }
    }
    localStorage.setItem(key, JSON.stringify(snap))
    return {
      ok: true,
      persona: snap.persona,
      role: snap.role,
      overdueStopEnabled: snap.overdueStopEnabled,
      caseCount: (snap.cases || []).length,
    }
  })
}

async function probe(label, urlPath, shotName) {
  await page.goto(`${BASE}${urlPath}`, { waitUntil: 'networkidle', timeout: 60000 })
  await page.waitForTimeout(800)

  const bodyText = await page.evaluate(() => document.body?.innerText || '')
  const textHits = {}
  for (const t of FORBIDDEN_TEXT) {
    textHits[t] = bodyText.includes(t)
  }

  const bannerEl = await page.evaluate(() => {
    const el = document.querySelector('[data-billing-hold-banner]')
    if (!el) return null
    const r = el.getBoundingClientRect()
    const style = getComputedStyle(el)
    return {
      variant: el.getAttribute('data-billing-hold-banner'),
      text: (el.textContent || '').replace(/\s+/g, ' ').trim().slice(0, 200),
      w: Math.round(r.width),
      h: Math.round(r.height),
      top: Math.round(r.top),
      visible: !!(el.offsetWidth || el.offsetHeight || el.getClientRects().length),
      display: style.display,
      bg: style.backgroundColor,
    }
  })

  const amberFullWidth = await page.evaluate(() => {
    const vw = window.innerWidth
    return [...document.querySelectorAll('*')]
      .filter((el) => {
        const r = el.getBoundingClientRect()
        if (r.top > 200 || r.height < 16 || r.height > 120) return false
        if (r.width < vw * 0.65) return false
        const bg = getComputedStyle(el).backgroundColor
        const m = bg.match(/rgba?\((\d+),\s*(\d+),\s*(\d+)/)
        if (!m) return false
        const [, R, G, B] = m.map(Number)
        // amber-ish
        const amber = R > 240 && G > 180 && G < 240 && B < 180
        if (!amber) return false
        const txt = (el.textContent || '').replace(/\s+/g, ' ').trim()
        return /不停审|仅提示|BillingHold|欠票|停权/.test(txt)
      })
      .slice(0, 8)
      .map((el) => {
        const r = el.getBoundingClientRect()
        return {
          text: (el.textContent || '').replace(/\s+/g, ' ').trim().slice(0, 120),
          w: Math.round(r.width),
          h: Math.round(r.height),
          top: Math.round(r.top),
          bg: getComputedStyle(el).backgroundColor,
        }
      })
  })

  const forbiddenVisible =
    Object.values(textHits).some(Boolean) ||
    !!bannerEl?.visible ||
    amberFullWidth.length > 0

  if (forbiddenVisible) report.pass = false

  const shotPath = path.join(OUT, shotName)
  await page.screenshot({ path: shotPath, fullPage: false })

  const entry = {
    label,
    url: `${BASE}${urlPath}`,
    textHits,
    bannerEl,
    amberFullWidth,
    forbiddenVisible,
    shot: shotName,
  }
  report.pages.push(entry)
  console.log(
    JSON.stringify(
      {
        label,
        forbiddenVisible,
        textHits,
        banner: !!bannerEl,
        amber: amberFullWidth.length,
      },
      null,
      0,
    ),
  )
  return entry
}

// seed page + force hold so we prove absence even when hold would fire
await page.goto(`${BASE}/agent`, { waitUntil: 'networkidle', timeout: 60000 })
await page.waitForTimeout(500)
const patched = await forceBillingHold()
report.forcePatch = patched
await page.reload({ waitUntil: 'networkidle' })
await page.waitForTimeout(800)

await probe('home-forced-hold', '/agent', 'live-01-home.png')
await probe('sessions-forced-hold', '/agent/sessions', 'live-02-sessions.png')
await probe('projects-list-forced-hold', '/agent/projects', 'live-03-projects-list.png')

// try open first project link if any
const projectHref = await page.evaluate(() => {
  const a = [...document.querySelectorAll('a[href*="/agent/projects/"]')].find(
    (el) => /\/agent\/projects\/[^/]+/.test(el.getAttribute('href') || ''),
  )
  return a ? a.getAttribute('href') : null
})
report.projectHref = projectHref
if (projectHref) {
  const rel = projectHref.startsWith('http')
    ? new URL(projectHref).pathname
    : projectHref
  await probe('project-workspace-forced-hold', rel, 'live-04-project.png')
} else {
  // fallback known seed path attempt
  await probe(
    'project-fallback',
    '/agent/projects',
    'live-04-project-fallback-list.png',
  )
  report.pages[report.pages.length - 1].note =
    'No project deep link found; shot projects list again'
}

report.finishedAt = new Date().toISOString()
fs.writeFileSync(path.join(OUT, '_live-verify.json'), JSON.stringify(report, null, 2))
console.log('PASS=', report.pass)
await browser.close()
process.exit(report.pass ? 0 : 1)
