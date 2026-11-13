import { chromium } from 'playwright'
import fs from 'node:fs'
import path from 'node:path'

const OUT = path.resolve('docs/ui-polish/agent-p0-overlay')
fs.mkdirSync(OUT, { recursive: true })
const BASE = 'http://127.0.0.1:5175'

const browser = await chromium.launch({ headless: true })
const page = await browser.newPage({ viewport: { width: 1440, height: 900 } })

const report = { sha: null, pages: {}, checklist: {} }

async function audit(label) {
  const hits = await page.evaluate(() => {
    const body = document.body.innerText || ''
    const patterns = [
      '样机 · 无真 LLM',
      '样机·无真LLM',
      '样机·无真 LLM',
      '无真 LLM',
      '回中台',
      '运营 Inbox',
      '在运营 Inbox',
      '案详 mid',
      '案详',
      '费用 mid',
      '打开费用中心',
      '在作业中台打开',
      '打开案件',
    ]
    const copy = {}
    for (const p of patterns) {
      copy[p] = (body.match(new RegExp(p.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'g')) || []).length
    }

    const href5173 = [...document.querySelectorAll('a[href*=":5173"], a[href*="localhost:5173"]')]
      .map((a) => ({ href: a.getAttribute('href'), text: (a.textContent || '').replace(/\s+/g, ' ').trim().slice(0, 60) }))

    // also catch buttons/links with onclick navigating, and any element with href-like data
    const any5173Attr = [...document.querySelectorAll('[href*="5173"], [data-href*="5173"]')]
      .map((el) => ({ tag: el.tagName, href: el.getAttribute('href') || el.getAttribute('data-href'), text: (el.textContent || '').replace(/\s+/g, ' ').trim().slice(0, 40) }))

    const amberBars = [...document.querySelectorAll('*')].filter((el) => {
      const cs = getComputedStyle(el)
      const bg = cs.backgroundColor
      const r = el.getBoundingClientRect()
      if (r.top > 200) return false // only top region for "顶无"
      if (r.height < 20 || r.height > 140 || r.width < window.innerWidth * 0.7) return false
      const m = bg.match(/rgba?\((\d+),\s*(\d+),\s*(\d+)/)
      if (!m) return false
      const [, R, G, B] = m.map(Number)
      // amber-50-ish
      return R > 240 && G > 180 && G < 240 && B < 200
    }).slice(0, 10).map((el) => ({
      text: (el.textContent || '').replace(/\s+/g, ' ').trim().slice(0, 100),
      w: Math.round(el.getBoundingClientRect().width),
      h: Math.round(el.getBoundingClientRect().height),
      top: Math.round(el.getBoundingClientRect().top),
      bg: getComputedStyle(el).backgroundColor,
      cls: (el.className || '').toString().slice(0, 120),
    }))

    // specifically look for bg-amber-50 class on near-full-width top bars with tip text
    const amber50Full = [...document.querySelectorAll('[class*="bg-amber-50"]')].filter((el) => {
      const r = el.getBoundingClientRect()
      return r.top < 160 && r.width >= window.innerWidth * 0.85 && r.height >= 28 && r.height <= 120
    }).map((el) => ({
      text: (el.textContent || '').replace(/\s+/g, ' ').trim().slice(0, 100),
      w: Math.round(el.getBoundingClientRect().width),
      h: Math.round(el.getBoundingClientRect().height),
      top: Math.round(el.getBoundingClientRect().top),
      cls: (el.className || '').toString().slice(0, 160),
    }))

    return { copy, href5173, any5173Attr, amberBars, amber50Full, url: location.href }
  })
  report.pages[label] = hits
  return hits
}

async function shot(name) {
  await page.screenshot({ path: path.join(OUT, name), fullPage: false })
}

// 1 home
await page.goto(`${BASE}/agent`, { waitUntil: 'networkidle' })
await page.waitForTimeout(800)
await shot('01-home-after.png')
await audit('home')

// 2 sessions list
await page.goto(`${BASE}/agent/sessions`, { waitUntil: 'networkidle' })
await page.waitForTimeout(800)
await shot('02-sessions-after.png')
await audit('sessions')

// 3 session workspace
const row = page.locator('tr[role="link"], a[href*="/agent/sessions/"], [data-session-id]').first()
if (await row.count()) {
  await row.click()
  await page.waitForTimeout(1000)
} else {
  // try first link into a session
  const sess = page.locator('a[href*="/agent/session"]').first()
  if (await sess.count()) {
    await sess.click()
    await page.waitForTimeout(1000)
  }
}
await shot('03-session-workspace-after.png')
await audit('session')

// 4 projects list — hard item 1
await page.goto(`${BASE}/agent/projects`, { waitUntil: 'networkidle' })
await page.waitForTimeout(800)
await shot('04-projects-list-after.png')
await audit('projectsList')

// 5 project workspace — hard item 1
const proj = page.locator('a[href*="/agent/projects/"]').first()
if (await proj.count()) {
  await proj.click()
  await page.waitForTimeout(1000)
}
await shot('05-project-workspace-after.png')
await audit('projectWorkspace')

// checklist aggregation
const pages = Object.values(report.pages)
const allHref5173 = pages.flatMap((p) => p.href5173 || [])
const allAny5173 = pages.flatMap((p) => p.any5173Attr || [])
const midCopyKeys = ['回中台', '运营 Inbox', '在运营 Inbox', '案详 mid', '费用 mid', '打开费用中心', '在作业中台打开']
const midCopyHits = {}
for (const k of midCopyKeys) {
  midCopyHits[k] = pages.reduce((n, p) => n + (p.copy?.[k] || 0), 0)
}
// 案详 alone may appear in non-CTA context — track but soft
midCopyHits['案详'] = pages.reduce((n, p) => n + (p.copy?.['案详'] || 0), 0)

const tipCopy = pages.reduce((n, p) => n + (p.copy?.['样机 · 无真 LLM'] || 0) + (p.copy?.['样机·无真LLM'] || 0) + (p.copy?.['样机·无真 LLM'] || 0) + (p.copy?.['无真 LLM'] || 0), 0)

// amber tip bars only on projects pages matter for hard item 1
const projAmberTip = [...(report.pages.projectsList?.amber50Full || []), ...(report.pages.projectWorkspace?.amber50Full || [])]
  .filter((b) => /样机|无真\s*LLM|诚实|原型/.test(b.text))

report.checklist = {
  '1_no_fullwidth_amber_prototype_bar': {
    pass: tipCopy === 0 && projAmberTip.length === 0,
    tipCopyCount: tipCopy,
    projAmberTipBars: projAmberTip,
    projectsListAmber50Full: report.pages.projectsList?.amber50Full || [],
    projectWorkspaceAmber50Full: report.pages.projectWorkspace?.amber50Full || [],
  },
  '2_no_mid_5173_href': {
    pass: allHref5173.length === 0 && allAny5173.length === 0,
    href5173: allHref5173,
    any5173Attr: allAny5173,
  },
  '2b_no_mid_cta_copy': {
    pass: midCopyKeys.every((k) => midCopyHits[k] === 0),
    midCopyHits,
  },
}

const allPass = report.checklist['1_no_fullwidth_amber_prototype_bar'].pass
  && report.checklist['2_no_mid_5173_href'].pass
  && report.checklist['2b_no_mid_cta_copy'].pass

report.allPass = allPass

fs.writeFileSync(path.join(OUT, '_audit-after.json'), JSON.stringify(report, null, 2))
console.log(JSON.stringify(report, null, 2))
await browser.close()
process.exit(allPass ? 0 : 1)
