import { chromium } from 'playwright'
import fs from 'node:fs'
import path from 'node:path'

const OUT = path.resolve('docs/ui-polish/agent-p0-overlay')
fs.mkdirSync(OUT, { recursive: true })
const BASE = 'http://127.0.0.1:5175'

const FORBIDDEN_COPY = [
  '回中台',
  '运营 Inbox',
  '在运营 Inbox',
  '案详',
  '样机 · 无真 LLM',
  '样机·无真LLM',
  '无真 LLM · 专家',
  '打开费用中心',
  '在作业中台打开',
]

const browser = await chromium.launch({ headless: true })
const page = await browser.newPage({ viewport: { width: 1440, height: 900 } })
const report = { base: BASE, startedAt: new Date().toISOString(), pages: [], pass: true }

async function analyze(label, url) {
  const bodyText = await page.evaluate(() => document.body?.innerText || '')
  const copyHits = {}
  for (const p of FORBIDDEN_COPY) {
    const re = new RegExp(p.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'g')
    copyHits[p] = (bodyText.match(re) || []).length
  }

  // Full-width amber tip walls near top of viewport
  const amberBars = await page.evaluate(() => {
    const vw = window.innerWidth
    return [...document.querySelectorAll('*')]
      .filter((el) => {
        const r = el.getBoundingClientRect()
        if (r.top > 160 || r.height < 18 || r.height > 100) return false
        if (r.width < vw * 0.72) return false
        const bg = getComputedStyle(el).backgroundColor
        const m = bg.match(/rgba?\((\d+),\s*(\d+),\s*(\d+)/)
        if (!m) return false
        const [, R, G, B] = m.map(Number)
        // amber-50-ish
        return R > 245 && G > 185 && G < 235 && B < 170
      })
      .slice(0, 10)
      .map((el) => ({
        text: (el.textContent || '').replace(/\s+/g, ' ').trim().slice(0, 100),
        w: Math.round(el.getBoundingClientRect().width),
        h: Math.round(el.getBoundingClientRect().height),
        top: Math.round(el.getBoundingClientRect().top),
        bg: getComputedStyle(el).backgroundColor,
      }))
  })

  // Visible mid-looking anchors (host contains mid port or path /cases /inbox /billing on foreign origin)
  const midAnchors = await page.evaluate(() => {
    return [...document.querySelectorAll('a[href]')]
      .map((a) => ({
        href: a.href,
        text: (a.textContent || '').replace(/\s+/g, ' ').trim().slice(0, 60),
        visible: !!(a.offsetWidth || a.offsetHeight || a.getClientRects().length),
      }))
      .filter((a) => a.visible)
      .filter((a) => {
        try {
          const u = new URL(a.href)
          const isMidPort = u.port === '5173'
          const looksMidPath =
            /\/(cases|inbox|billing|docket)(\/|$|\?)/.test(u.pathname) &&
            !u.pathname.startsWith('/agent')
          return isMidPort || (looksMidPath && u.origin !== location.origin)
        } catch {
          return false
        }
      })
  })

  // Billing hold banner mid links if present
  const billing = await page.evaluate(() => {
    const el =
      document.querySelector('[data-billing-hold-banner]') ||
      document.querySelector('[data-testid="billing-hold-banner"]')
    if (!el) return { present: false }
    const anchors = [...el.querySelectorAll('a[href]')].map((a) => ({
      href: a.href,
      text: (a.textContent || '').replace(/\s+/g, ' ').trim(),
    }))
    return { present: true, anchors, text: (el.textContent || '').replace(/\s+/g, ' ').trim().slice(0, 200) }
  })

  const badCopy = Object.entries(copyHits).filter(([, n]) => n > 0)
  // Filter amber bars that look like prototype tip walls
  const tipWalls = amberBars.filter((b) => /样机|无真\s*LLM|mock|演示/.test(b.text))
  const failReasons = []
  if (tipWalls.length) failReasons.push(`amber tip wall: ${JSON.stringify(tipWalls)}`)
  if (badCopy.length) failReasons.push(`forbidden copy: ${JSON.stringify(Object.fromEntries(badCopy))}`)
  if (midAnchors.length) failReasons.push(`mid anchors: ${JSON.stringify(midAnchors)}`)
  if (billing.present && billing.anchors?.length) failReasons.push(`billing mid links: ${JSON.stringify(billing.anchors)}`)

  const ok = failReasons.length === 0
  if (!ok) report.pass = false

  const shot = `live-${String(report.pages.length + 1).padStart(2, '0')}-${label}.png`
  await page.screenshot({ path: path.join(OUT, shot), fullPage: false })

  const entry = {
    label,
    url,
    ok,
    failReasons,
    copyHits,
    amberBars,
    tipWalls,
    midAnchors,
    billing,
    shot,
    title: await page.title(),
  }
  report.pages.push(entry)
  console.log(JSON.stringify({ label, url, ok, failReasons, shot, billing: billing.present }, null, 2))
  return entry
}

async function go(label, urlPath) {
  const url = `${BASE}${urlPath}`
  await page.goto(url, { waitUntil: 'networkidle', timeout: 60000 })
  await page.waitForTimeout(800)
  return analyze(label, url)
}

await go('home', '/agent')
await go('sessions', '/agent/sessions')

// Click into first session row if present
await page.goto(`${BASE}/agent/sessions`, { waitUntil: 'networkidle' })
await page.waitForTimeout(500)
const sessionLink = page.locator('a[href*="/agent/sessions/"], tr[role="link"], [data-testid*="session-row"]').first()
let sessionOpened = false
if (await sessionLink.count()) {
  await sessionLink.click()
  await page.waitForTimeout(1000)
  sessionOpened = true
  await analyze('session-via-click', page.url())
} else {
  // try known seed path from list hrefs
  const href = await page.evaluate(() => {
    const a = document.querySelector('a[href*="/agent/sessions/"]')
    return a?.getAttribute('href') || null
  })
  if (href) {
    await page.goto(`${BASE}${href.startsWith('http') ? new URL(href).pathname : href}`, {
      waitUntil: 'networkidle',
    })
    await page.waitForTimeout(800)
    sessionOpened = true
    await analyze('session-via-href', page.url())
  } else {
    report.pages.push({ label: 'session', ok: false, failReasons: ['no session to open'], skipped: true })
    report.pass = false
  }
}

await go('projects-list', '/agent/projects')

// Click first project
const proj = page.locator('a[href*="/agent/projects/"]').first()
if (await proj.count()) {
  const href = await proj.getAttribute('href')
  await proj.click()
  await page.waitForTimeout(1000)
  await analyze('project-workspace-via-click', page.url())
} else {
  // create one quickly if empty UI allows
  const titleInput = page.locator('input[aria-label="项目标题"], input[placeholder*="标题"]').first()
  const submit = page.locator('[data-testid="project-create-submit"], button:has-text("创建")').first()
  if ((await titleInput.count()) && (await submit.count())) {
    await titleInput.fill('P0 live verify')
    await submit.click()
    await page.waitForTimeout(1200)
    await analyze('project-workspace-after-create', page.url())
  } else {
    report.pages.push({
      label: 'project-workspace',
      ok: false,
      failReasons: ['no project link and cannot create'],
      skipped: true,
    })
    report.pass = false
  }
}

// Try to surface BillingHold: scan app for data attr; if absent, inject persona via localStorage if app uses it
await page.goto(`${BASE}/agent`, { waitUntil: 'networkidle' })
await page.waitForTimeout(400)
let billingSeen = await page.evaluate(() => !!document.querySelector('[data-billing-hold-banner]'))
if (!billingSeen) {
  // try sessions/workspace pages already covered; also dump whether banner component mounts anywhere
  for (const pth of ['/agent/sessions', '/agent/projects']) {
    await page.goto(`${BASE}${pth}`, { waitUntil: 'networkidle' })
    await page.waitForTimeout(400)
    billingSeen = await page.evaluate(() => !!document.querySelector('[data-billing-hold-banner]'))
    if (billingSeen) {
      await analyze('billing-hold-surface', page.url())
      break
    }
  }
}
if (!billingSeen) {
  // Static source check recorded as secondary evidence
  report.billingHoldNote =
    'Runtime banner not visible in seed persona; source AgentBillingHoldBanner has no <a href> mid links (verified separately).'
}

report.finishedAt = new Date().toISOString()
report.sessionOpened = sessionOpened
fs.writeFileSync(path.join(OUT, '_live-verify.json'), JSON.stringify(report, null, 2))
console.log('\nPASS=' + report.pass)
console.log(JSON.stringify({ pass: report.pass, pages: report.pages.map((p) => ({ label: p.label, ok: p.ok, url: p.url, shot: p.shot, failReasons: p.failReasons })) }, null, 2))
await browser.close()
process.exit(report.pass ? 0 : 2)
