import { chromium } from 'playwright'
import fs from 'node:fs'
import path from 'node:path'

const OUT = path.resolve('/workspace/ip-harness/docs/ui-polish/agent-remind-tabs-recheck')
fs.mkdirSync(OUT, { recursive: true })
const BASE = process.env.ART_BASE || 'http://127.0.0.1:5199'

const Y2_PATTERNS = [
  '回中台',
  '运营 Inbox',
  '打开中台',
  '在运营 Inbox 打开',
  '在运营 Inbox 中查看',
  '回中台案件库',
  '回中台案件',
]

const browser = await chromium.launch({ headless: true })
const page = await browser.newPage({ viewport: { width: 1440, height: 900 } })
const report = {
  meta: {
    at: new Date().toISOString(),
    base: BASE,
    productSha: 'c665a7d',
    tip: '5e5a750',
    note: 'Measured against clean worktree at 5e5a750 (c665a7d product), not dirty WIP on :5175',
  },
  y1: {},
  y2: { surfaces: {} },
}

async function honestyTopBanners() {
  return page.evaluate(() => {
    const honestyRe = /样机\s*[·•]\s*无真\s*LLM|无真 LLM · 专家分剧本|专家分剧本/
    const out = []
    for (const el of document.querySelectorAll('div,section,aside,header,p,strong,span')) {
      const t = (el.textContent || '').replace(/\s+/g, ' ').trim()
      if (!honestyRe.test(t)) continue
      if (t.length > 180) continue // skip huge parents
      const r = el.getBoundingClientRect()
      if (r.width < 40 || r.height < 10) continue
      const cs = getComputedStyle(el)
      const bg = cs.backgroundColor
      const m = bg.match(/rgba?\((\d+),\s*(\d+),\s*(\d+)(?:,\s*([\d.]+))?/)
      let amberBg = false
      if (m) {
        const a = m[4] === undefined ? 1 : +m[4]
        amberBg = a > 0.05 && +m[1] > 200 && +m[2] > 160 && +m[3] < 200 && (+m[1] - +m[3]) > 30
      }
      const amberClass = /amber|yellow/.test(String(el.className || ''))
      // also check parent for amber band
      let parentAmber = false
      let p = el.parentElement
      for (let i = 0; i < 3 && p; i++, p = p.parentElement) {
        if (/amber|yellow|bg-amber/.test(String(p.className || ''))) parentAmber = true
        const pbg = getComputedStyle(p).backgroundColor
        const pm = pbg.match(/rgba?\((\d+),\s*(\d+),\s*(\d+)(?:,\s*([\d.]+))?/)
        if (pm) {
          const a = pm[4] === undefined ? 1 : +pm[4]
          if (a > 0.05 && +pm[1] > 200 && +pm[2] > 160 && +pm[3] < 200 && (+pm[1] - +pm[3]) > 30) parentAmber = true
        }
      }
      out.push({
        text: t.slice(0, 120),
        top: Math.round(r.top),
        h: Math.round(r.height),
        w: Math.round(r.width),
        bg,
        amberBg,
        amberClass,
        parentAmber,
        nearTop: r.top < 220,
        className: String(el.className || '').slice(0, 100),
        tag: el.tagName,
      })
    }
    return out.sort((a, b) => a.top - b.top).slice(0, 15)
  })
}

async function amberTopBands() {
  return page.evaluate(() => {
    return [...document.querySelectorAll('div,section,header,aside')]
      .map((el) => {
        const r = el.getBoundingClientRect()
        if (r.top > 200 || r.width < 360 || r.height < 24 || r.height > 140) return null
        const cs = getComputedStyle(el)
        const m = cs.backgroundColor.match(/rgba?\((\d+),\s*(\d+),\s*(\d+)(?:,\s*([\d.]+))?/)
        if (!m) return null
        const a = m[4] === undefined ? 1 : +m[4]
        if (a < 0.05) return null
        const amber = +m[1] > 200 && +m[2] > 160 && +m[3] < 200 && (+m[1] - +m[3]) > 30
        const amberClass = /bg-amber|border-amber|amber-50|amber-100/.test(String(el.className || ''))
        if (!amber && !amberClass) return null
        return {
          text: (el.textContent || '').replace(/\s+/g, ' ').trim().slice(0, 140),
          top: Math.round(r.top),
          h: Math.round(r.height),
          w: Math.round(r.width),
          bg: cs.backgroundColor,
          className: String(el.className || '').slice(0, 120),
          honesty: /样机|无真 LLM|专家分剧本/.test(el.textContent || ''),
        }
      })
      .filter(Boolean)
      .slice(0, 8)
  })
}

async function collectY2() {
  return page.evaluate((patterns) => {
    const hits = []
    for (const el of document.querySelectorAll('a,button,[role="button"],[role="link"]')) {
      const blob = [
        el.getAttribute('aria-label') || '',
        el.getAttribute('title') || '',
        (el.textContent || '').replace(/\s+/g, ' ').trim(),
      ].join(' ‖ ')
      const matched = patterns.filter((p) => blob.includes(p))
      if (!matched.length) continue
      const cs = getComputedStyle(el)
      if (cs.display === 'none' || cs.visibility === 'hidden') continue
      const r = el.getBoundingClientRect()
      hits.push({
        text: (el.textContent || '').replace(/\s+/g, ' ').trim().slice(0, 80),
        aria: el.getAttribute('aria-label'),
        title: el.getAttribute('title'),
        href: el.getAttribute('href'),
        tag: el.tagName,
        matched,
        top: Math.round(r.top),
        w: Math.round(r.width),
        h: Math.round(r.height),
        visible: r.width > 0 && r.height > 0,
      })
    }
    // dedupe
    const seen = new Set()
    return hits.filter((h) => {
      const k = `${h.text}|${h.aria}|${h.href}|${h.title}`
      if (seen.has(k)) return false
      seen.add(k)
      return true
    })
  }, Y2_PATTERNS)
}

async function shotClipHonesty(file) {
  const loc = page.locator('text=/样机.*无真 LLM|无真 LLM · 专家分剧本/').first()
  if (await loc.count()) {
    const box = await loc.boundingBox()
    if (box) {
      await page.screenshot({
        path: path.join(OUT, file),
        clip: {
          x: 0,
          y: Math.max(0, box.y - 24),
          width: 1440,
          height: Math.min(160, box.height + 80),
        },
      })
      return true
    }
  }
  return false
}

// ---- Y1 Project List ----
await page.goto(`${BASE}/agent/projects`, { waitUntil: 'networkidle' })
await page.waitForTimeout(700)
await page.screenshot({ path: path.join(OUT, 'y1-projects-list.png'), fullPage: false })
report.y1.projectsList = {
  honesty: await honestyTopBanners(),
  amberBands: await amberTopBands(),
}
await shotClipHonesty('y1-projects-list-banner-closeup.png')

// ---- Y1 workspaces ----
for (const [label, url] of [
  ['general', '/agent/projects/proj-demo-general'],
  ['patent', '/agent/projects/proj-demo-patent'],
]) {
  await page.goto(`${BASE}${url}`, { waitUntil: 'networkidle' })
  await page.waitForTimeout(800)
  await page.screenshot({ path: path.join(OUT, `y1-project-workspace-${label}.png`), fullPage: false })
  report.y1[`workspace_${label}`] = {
    url: page.url(),
    honesty: await honestyTopBanners(),
    amberBands: await amberTopBands(),
    y2: await collectY2(),
  }
  await shotClipHonesty(`y1-project-workspace-${label}-banner-closeup.png`)
}

// ---- Y2 surfaces ----
for (const [name, url] of [
  ['home', '/agent'],
  ['sessions', '/agent/sessions'],
  ['sessions_needs_human', '/agent/sessions?filter=needs_human'],
  ['projects', '/agent/projects'],
  ['agents', '/agent/agents'],
]) {
  await page.goto(`${BASE}${url}`, { waitUntil: 'networkidle' })
  await page.waitForTimeout(500)
  const hits = await collectY2()
  report.y2.surfaces[name] = hits
  await page.screenshot({ path: path.join(OUT, `y2-${name}.png`), fullPage: false })
}

// Session workspace
await page.goto(`${BASE}/agent/sessions?filter=needs_human`, { waitUntil: 'networkidle' })
await page.waitForTimeout(600)
const sessionLink = await page.evaluate(() => {
  const a = [...document.querySelectorAll('a')].find((el) =>
    /\/agent\/sessions\/[^/?]+/.test(el.getAttribute('href') || ''),
  )
  return a ? a.getAttribute('href') : null
})
report.sessionLink = sessionLink
if (sessionLink) {
  await page.goto(`${BASE}${sessionLink}`, { waitUntil: 'networkidle' })
  await page.waitForTimeout(900)
  report.y2.surfaces.session_workspace = await collectY2()
  await page.screenshot({ path: path.join(OUT, 'y2-session-workspace.png'), fullPage: false })
  const huitai = page.locator('text=回中台').first()
  if (await huitai.count()) {
    const box = await huitai.boundingBox()
    if (box) {
      await page.screenshot({
        path: path.join(OUT, 'y2-session-huitai-closeup.png'),
        clip: {
          x: Math.max(0, box.x - 60),
          y: Math.max(0, box.y - 24),
          width: Math.min(420, 1440 - box.x + 60),
          height: 70,
        },
      })
    }
  }
  const inbox = page.locator('text=/运营 Inbox|在运营 Inbox/').first()
  if (await inbox.count()) {
    const box = await inbox.boundingBox()
    if (box) {
      await page.screenshot({
        path: path.join(OUT, 'y2-confirmbar-inbox-closeup.png'),
        clip: {
          x: Math.max(0, box.x - 100),
          y: Math.max(0, box.y - 40),
          width: Math.min(520, 1440 - box.x + 100),
          height: 100,
        },
      })
    }
  }
}

// Sessions list body text audit (includes empty-state CTA)
await page.goto(`${BASE}/agent/sessions`, { waitUntil: 'networkidle' })
await page.waitForTimeout(400)
report.y2.sessionsTextAudit = await page.evaluate((patterns) => {
  const body = document.body.innerText
  const counts = {}
  for (const p of patterns) counts[p] = (body.match(new RegExp(p.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'g')) || []).length
  return counts
}, Y2_PATTERNS)

const allY2 = Object.entries(report.y2.surfaces).flatMap(([surface, hits]) =>
  (hits || []).map((h) => ({ surface, ...h })),
)

const y1FailReasons = []
const listBands = report.y1.projectsList.amberBands || []
const listHonesty = (report.y1.projectsList.honesty || []).filter((h) => h.nearTop && (h.amberBg || h.amberClass || h.parentAmber))
if (listBands.some((b) => b.honesty) || listHonesty.length) y1FailReasons.push('projects_list_top_honesty_amber')
for (const k of ['workspace_general', 'workspace_patent']) {
  const ws = report.y1[k]
  if (!ws) continue
  const bands = (ws.amberBands || []).filter((b) => b.honesty)
  const hon = (ws.honesty || []).filter((h) => h.nearTop && (h.amberBg || h.amberClass || h.parentAmber || h.top < 180))
  // also fail if near-top honesty text exists even without amber (large prototype banner)
  const topHonesty = (ws.honesty || []).filter((h) => h.nearTop && /样机|无真 LLM/.test(h.text))
  if (bands.length || hon.length || topHonesty.length) y1FailReasons.push(`${k}_top_honesty`)
}
// Project list: strong tag in amber bar
if ((report.y1.projectsList.amberBands || []).length && (report.y1.projectsList.honesty || []).some((h) => /样机/.test(h.text))) {
  if (!y1FailReasons.includes('projects_list_top_honesty_amber')) y1FailReasons.push('projects_list_top_honesty_amber')
}

report.y1.summary = {
  failReasons: y1FailReasons,
  listAmberBands: listBands,
  listHonestySample: (report.y1.projectsList.honesty || []).slice(0, 5),
  wsGeneralAmber: report.y1.workspace_general?.amberBands,
  wsPatentAmber: report.y1.workspace_patent?.amberBands,
  wsGeneralHonesty: (report.y1.workspace_general?.honesty || []).slice(0, 5),
  wsPatentHonesty: (report.y1.workspace_patent?.honesty || []).slice(0, 5),
}

report.y2.summary = {
  clickableDeepLinkCount: allY2.length,
  byPattern: Y2_PATTERNS.reduce((acc, p) => {
    acc[p] = allY2.filter((h) => (h.matched || []).includes(p) || (h.text || '').includes(p) || (h.aria || '').includes(p)).length
    return acc
  }, {}),
  samples: allY2.slice(0, 25),
  sessionsTextAudit: report.y2.sessionsTextAudit,
}

report.verdictHints = {
  'P0-Y1': y1FailReasons.length ? 'FAIL' : 'PASS',
  'P0-Y2': allY2.length > 0 || Object.values(report.y2.sessionsTextAudit || {}).some((n) => n > 0) ? 'FAIL' : 'PASS',
}

fs.writeFileSync(path.join(OUT, '_p0y-measures.json'), JSON.stringify(report, null, 2))
console.log(JSON.stringify({
  base: BASE,
  Y1: report.verdictHints['P0-Y1'],
  Y2: report.verdictHints['P0-Y2'],
  y1Reasons: y1FailReasons,
  y2Count: allY2.length,
  y2ByPattern: report.y2.summary.byPattern,
  samples: allY2.slice(0, 12),
  listBands,
  wsG: report.y1.workspace_general?.amberBands,
  wsP: report.y1.workspace_patent?.amberBands,
}, null, 2))
await browser.close()
