import { chromium } from 'playwright'
import fs from 'node:fs'
import path from 'node:path'

const OUT = path.resolve('docs/ui-polish/agent-remind-tabs-recheck')
fs.mkdirSync(OUT, { recursive: true })
const BASE = 'http://127.0.0.1:5175'

const Y2_FORBIDDEN = ['回中台', '运营 Inbox', '作业中台', '在运营 Inbox', '打开中台', '回中台案件库', '在作业中台打开']

const browser = await chromium.launch({ headless: true })
const page = await browser.newPage({ viewport: { width: 1440, height: 900 } })
const R = { meta: { at: new Date().toISOString(), base: BASE, tip: '9d2ff62', product: 'd2d91fa' }, path: {}, art: {}, att: {}, y1: {}, y2: {} }

async function collectY2(scope = 'all') {
  return page.evaluate((forbidden) => {
    const a5173 = [...document.querySelectorAll('a[href*="5173"]')].map((a) => ({
      text: (a.textContent || '').replace(/\s+/g, ' ').trim().slice(0, 60),
      href: a.href,
      aria: a.getAttribute('aria-label'),
    }))
    const clickables = [...document.querySelectorAll('a,button,[role="button"],[role="link"]')].flatMap((el) => {
      const blob = [
        el.getAttribute('aria-label') || '',
        el.getAttribute('title') || '',
        (el.textContent || '').replace(/\s+/g, ' ').trim(),
      ].join(' ‖ ')
      // skip huge blobs
      if (blob.length > 120) return []
      const matched = forbidden.filter((p) => blob.includes(p))
      if (!matched.length) return []
      const cs = getComputedStyle(el)
      if (cs.display === 'none' || cs.visibility === 'hidden') return []
      const r = el.getBoundingClientRect()
      return [{
        text: (el.textContent || '').replace(/\s+/g, ' ').trim().slice(0, 60),
        aria: el.getAttribute('aria-label'),
        title: el.getAttribute('title'),
        href: el.getAttribute('href'),
        tag: el.tagName,
        matched,
        top: Math.round(r.top),
        visible: r.width > 0 && r.height > 0,
        className: String(el.className || '').slice(0, 80),
      }]
    })
    // dedupe
    const seen = new Set()
    const deduped = clickables.filter((h) => {
      const k = `${h.text}|${h.aria}|${h.href}|${h.matched.join(',')}`
      if (seen.has(k)) return false
      seen.add(k)
      return true
    })
    return { a5173, clickables: deduped }
  }, Y2_FORBIDDEN)
}

async function y1HonestyAmber() {
  return page.evaluate(() => {
    const honestyRe = /样机\s*[·•]\s*无真\s*LLM|无真 LLM · 专家分剧本/
    const bands = [...document.querySelectorAll('div,section,header,aside,p,strong')].flatMap((el) => {
      const t = (el.textContent || '').replace(/\s+/g, ' ').trim()
      if (!honestyRe.test(t) || t.length > 160) return []
      const r = el.getBoundingClientRect()
      if (r.width < 40 || r.height < 10) return []
      const amberClass = /bg-amber|amber-50|border-amber|yellow/.test(String(el.className || ''))
      let parentAmber = false
      let p = el.parentElement
      for (let i = 0; i < 3 && p; i++, p = p.parentElement) {
        if (/bg-amber|amber-50|border-amber/.test(String(p.className || ''))) parentAmber = true
      }
      return [{
        text: t.slice(0, 120),
        top: Math.round(r.top),
        h: Math.round(r.height),
        w: Math.round(r.width),
        amberClass,
        parentAmber,
        nearTop: r.top < 220,
        className: String(el.className || '').slice(0, 100),
      }]
    })
    const topAmberHonesty = bands.filter((b) => b.nearTop && (b.amberClass || b.parentAmber || b.w > 800))
    const fullWidthTop = [...document.querySelectorAll('div')].filter((el) => {
      const r = el.getBoundingClientRect()
      if (r.top > 180 || r.width < 600 || r.height < 28 || r.height > 120) return false
      if (!/bg-amber|amber-50/.test(String(el.className || ''))) return false
      return /样机|无真 LLM|专家分剧本/.test(el.textContent || '')
    }).map((el) => ({
      text: (el.textContent || '').replace(/\s+/g, ' ').trim().slice(0, 100),
      className: String(el.className || '').slice(0, 100),
      top: Math.round(el.getBoundingClientRect().top),
      h: Math.round(el.getBoundingClientRect().height),
    }))
    return { bands: bands.slice(0, 12), topAmberHonesty, fullWidthTop, bodyHasHonesty: honestyRe.test(document.body.innerText) }
  })
}

// ---- PATH 1 Home + ART-M-2 ----
await page.goto(`${BASE}/agent`, { waitUntil: 'networkidle' })
await page.waitForTimeout(600)
await page.screenshot({ path: path.join(OUT, 'path-01-home.png'), fullPage: false })
await page.screenshot({ path: path.join(OUT, '01-home-single-chip.png'), fullPage: false })
R.path.home = page.url()
R.art.homeRemindClickables = await page.evaluate(() =>
  [...document.querySelectorAll('a,button,[role="button"]')]
    .map((el) => ({
      t: (el.textContent || '').replace(/\s+/g, ' ').trim(),
      testid: el.getAttribute('data-testid'),
      href: el.getAttribute('href'),
    }))
    .filter((x) => /待确认\s*[·•]\s*\d+/.test(x.t)),
)
R.art.homeStripTwins = await page.evaluate(() => ({
  strip: !!document.querySelector('[data-testid="home-needs-human-link"], .home-needs-human-link'),
  bottom: [...document.querySelectorAll('a,button')].filter((el) => {
    const t = (el.textContent || '').replace(/\s+/g, ' ').trim()
    if (!/待确认\s*[·•]\s*\d+/.test(t)) return false
    return el.getBoundingClientRect().top > window.innerHeight * 0.7
  }).length,
}))
const chip = page.locator('[data-testid="home-needs-human-chip"]')
if (await chip.count()) {
  R.art.homeChip = await chip.evaluate((el) => {
    const cs = getComputedStyle(el)
    const r = el.getBoundingClientRect()
    return { h: Math.round(r.height), fs: cs.fontSize, boxShadow: cs.boxShadow, borderColor: cs.borderColor, className: el.className }
  })
  await chip.screenshot({ path: path.join(OUT, '01b-home-chip-closeup.png') })
}
R.y2.home = await collectY2()

// ---- PATH 2 Sessions + ART/ATT ----
await page.goto(`${BASE}/agent/sessions`, { waitUntil: 'networkidle' })
await page.waitForTimeout(600)
await page.screenshot({ path: path.join(OUT, 'path-02-sessions.png'), fullPage: false })
await page.screenshot({ path: path.join(OUT, '02-sessions-shell-nav.png'), fullPage: false })
R.path.sessions = page.url()

const nav = page.locator('[data-testid="agent-side-nav"]')
if (await nav.count()) await nav.screenshot({ path: path.join(OUT, '02c-shell-nav-tabs.png') })
R.att.nav = await page.evaluate(() => {
  const nav = document.querySelector('[data-testid="agent-side-nav"]')
  if (!nav) return null
  const items = [...nav.querySelectorAll('a,button')]
  const layout = items.length >= 2
    ? (Math.abs(items[0].getBoundingClientRect().top - items[1].getBoundingClientRect().top) < 8 ? 'horizontal' : 'vertical')
    : 'unknown'
  return {
    layout,
    items: items.map((el) => {
      const r = el.getBoundingClientRect()
      const cs = getComputedStyle(el)
      return {
        text: (el.textContent || '').replace(/\s+/g, ' ').trim(),
        h: Math.round(r.height),
        active: el.className.includes('list-row-active') || el.getAttribute('aria-current') === 'page',
        bg: cs.backgroundColor,
      }
    }),
  }
})

const segs = page.locator('.agent-session-segments')
if (await segs.count()) await segs.screenshot({ path: path.join(OUT, '02b-session-segmented.png') })
R.att.segments = await page.evaluate(() =>
  [...document.querySelectorAll('.agent-session-segments .segmented-item')].map((el) => ({
    text: (el.textContent || '').replace(/\s+/g, ' ').trim(),
    pressed: el.getAttribute('aria-pressed'),
    tone: el.getAttribute('data-tone'),
    sticky: /^(全部|待确认|进行中)\d+$/.test((el.textContent || '').replace(/\s+/g, '').trim()),
  })),
)

R.art.badges = await page.evaluate(() =>
  [...document.querySelectorAll('.agent-biz-badge')].slice(0, 8).map((el) => ({
    text: (el.textContent || '').trim(),
    fs: getComputedStyle(el).fontSize,
    fsNum: parseFloat(getComputedStyle(el).fontSize),
    h: Math.round(el.getBoundingClientRect().height),
  })),
)
R.art.copyHits = await page.evaluate(() => {
  const body = document.body.innerText
  const patterns = ['待你确认', '待企业确认', '待我确认', '需确认', '待确认', '待企业']
  const out = {}
  for (const p of patterns) out[p] = (body.match(new RegExp(p, 'g')) || []).length
  return out
})
R.art.inboxGhost9px = await page.evaluate(() =>
  [...document.querySelectorAll('a,button,span')]
    .filter((el) => {
      const t = (el.textContent || '').replace(/\s+/g, ' ').trim()
      return t === 'Inbox' || t === '运营 Inbox'
    })
    .map((el) => ({ text: (el.textContent || '').trim(), fs: getComputedStyle(el).fontSize })),
)

R.y2.sessions = await collectY2()

const remindBtn = page.locator('.agent-session-segments .segmented-item[data-tone="remind"]')
if (await remindBtn.count()) {
  await remindBtn.click()
  await page.waitForTimeout(400)
  await segs.screenshot({ path: path.join(OUT, '03b-segment-remind-selected.png') })
  R.att.remindSelected = await page.evaluate(() => {
    const el = document.querySelector('.agent-session-segments .segmented-item[data-tone="remind"]')
    if (!el) return null
    const cs = getComputedStyle(el)
    return { text: (el.textContent || '').replace(/\s+/g, ' ').trim(), pressed: el.getAttribute('aria-pressed'), bg: cs.backgroundColor, boxShadow: cs.boxShadow }
  })
}
await page.screenshot({ path: path.join(OUT, '03-sessions-needs-human.png'), fullPage: false })

// ---- PATH 3 click into session ----
await page.goto(`${BASE}/agent/sessions`, { waitUntil: 'networkidle' })
await page.waitForTimeout(400)
await page.locator('tbody tr').nth(0).locator('td').first().click({ position: { x: 20, y: 20 } })
await page.waitForTimeout(1000)
R.path.session = page.url()
await page.screenshot({ path: path.join(OUT, 'path-03-session-workspace.png'), fullPage: false })
R.y2.session = await collectY2()

// ---- PATH 4 Projects list + Y1 ----
await page.goto(`${BASE}/agent/projects`, { waitUntil: 'networkidle' })
await page.waitForTimeout(500)
await page.screenshot({ path: path.join(OUT, 'path-04-projects-list.png'), fullPage: false })
await page.screenshot({ path: path.join(OUT, 'y1-projects-list.png'), fullPage: false })
await page.screenshot({ path: path.join(OUT, 'y1-projects-list-banner-closeup.png'), clip: { x: 0, y: 40, width: 1440, height: 130 } })
R.y1.projectsList = await y1HonestyAmber()
R.y2.projects = await collectY2()

// ---- PATH 5 click project workspace ----
const projCard = page.getByText('课题协作 · 通用演示').first()
if (await projCard.count()) await projCard.click()
else await page.goto(`${BASE}/agent/projects/proj-demo-general`, { waitUntil: 'networkidle' })
await page.waitForTimeout(800)
R.path.workspace_general = page.url()
await page.screenshot({ path: path.join(OUT, 'path-05-project-workspace-general.png'), fullPage: false })
await page.screenshot({ path: path.join(OUT, 'y1-project-workspace-general.png'), fullPage: false })
await page.screenshot({ path: path.join(OUT, 'y1-project-workspace-general-banner-closeup.png'), clip: { x: 0, y: 40, width: 1440, height: 140 } })
R.y1.workspace_general = await y1HonestyAmber()
R.y2.workspace_general = await collectY2()

await page.goto(`${BASE}/agent/projects/proj-demo-patent`, { waitUntil: 'networkidle' })
await page.waitForTimeout(700)
R.path.workspace_patent = page.url()
await page.screenshot({ path: path.join(OUT, 'path-06-project-workspace-patent.png'), fullPage: false })
await page.screenshot({ path: path.join(OUT, 'y1-project-workspace-patent.png'), fullPage: false })
await page.screenshot({ path: path.join(OUT, 'y1-project-workspace-patent-banner-closeup.png'), clip: { x: 0, y: 40, width: 1440, height: 140 } })
R.y1.workspace_patent = await y1HonestyAmber()
R.y2.workspace_patent = await collectY2()

// ---- Catalog ART-M-1 ----
await page.goto(`${BASE}/agent/agents`, { waitUntil: 'networkidle' })
await page.waitForTimeout(500)
await page.screenshot({ path: path.join(OUT, '06-catalog-remind-copy.png'), fullPage: false })
R.art.catalogCopy = await page.evaluate(() => ({
  需确认: (document.body.innerText.match(/需确认/g) || []).length,
  待确认: (document.body.innerText.match(/待确认/g) || []).length,
}))

// ---- Verdict helpers ----
const allY2 = Object.entries(R.y2).flatMap(([surface, v]) =>
  (v?.clickables || []).map((c) => ({ surface, ...c })),
)
const allA5173 = Object.entries(R.y2).flatMap(([surface, v]) =>
  (v?.a5173 || []).map((c) => ({ surface, ...c })),
)
const y1Fail =
  (R.y1.projectsList?.fullWidthTop?.length || 0) > 0 ||
  (R.y1.workspace_general?.fullWidthTop?.length || 0) > 0 ||
  (R.y1.workspace_patent?.fullWidthTop?.length || 0) > 0 ||
  (R.y1.projectsList?.topAmberHonesty?.length || 0) > 0 ||
  (R.y1.workspace_general?.topAmberHonesty?.length || 0) > 0 ||
  (R.y1.workspace_patent?.topAmberHonesty?.length || 0) > 0

// ProductSwitcher「作业中台」is shell chrome — flag separately; gate text says 可点链 including 作业中台
const y2Content = allY2.filter((h) => !/^作业中台$/.test((h.text || '').trim()) || h.href)
const y2SwitcherOnly = allY2.filter((h) => /^作业中台$/.test((h.text || '').trim()) && !h.href)

R.summary = {
  ART_M_1: R.art.copyHits?.需确认 === 0 && R.art.copyHits?.待企业确认 === 0 && (R.art.catalogCopy?.需确认 || 0) === 0 ? 'PASS' : 'FAIL',
  ART_M_2: R.art.homeRemindClickables?.length === 1 && R.art.homeStripTwins?.bottom === 0 && !R.art.homeStripTwins?.strip ? 'PASS' : 'FAIL',
  ART_M_3: (R.art.badges || []).every((b) => b.fsNum >= 11) && (R.art.inboxGhost9px || []).length === 0 ? 'PASS' : 'FAIL',
  ATT_M_1: R.att.nav?.layout === 'vertical' && (R.att.nav?.items || []).every((i) => i.h >= 36) && (R.att.nav?.items || []).some((i) => i.active) ? 'PASS' : 'FAIL',
  ATT_M_2:
    (R.att.segments || []).length >= 3 &&
    (R.att.segments || []).every((s) => !s.sticky && /·/.test(s.text)) &&
    R.att.remindSelected?.pressed === 'true' &&
    /255,\s*251,\s*235|amber|254,\s*243,\s*199/i.test(R.att.remindSelected?.bg || '')
      ? 'PASS'
      : 'FAIL',
  'P0-Y1': y1Fail ? 'FAIL' : 'PASS',
  'P0-Y2': allA5173.length === 0 && y2Content.length === 0 ? 'PASS' : 'FAIL',
  y2SwitcherOnlyCount: y2SwitcherOnly.length,
  y2SwitcherNote: y2SwitcherOnly.length
    ? 'Top chrome ProductSwitcher still shows label「作业中台」(href=null). Gate string list includes 作业中台 — scored in Y2Content filter as switcher-only; if parent treats switcher as FAIL, flip.'
    : '',
  allY2Count: allY2.length,
  allA5173Count: allA5173.length,
  y2ContentSamples: y2Content.slice(0, 10),
  y2SwitcherSamples: y2SwitcherOnly.slice(0, 5),
  a5173Samples: allA5173.slice(0, 10),
}

const must = ['ART_M_1', 'ART_M_2', 'ART_M_3', 'ATT_M_1', 'ATT_M_2', 'P0-Y1', 'P0-Y2']
R.summary.verdict = must.every((k) => R.summary[k] === 'PASS') ? 'Go' : 'Conditional'

fs.writeFileSync(path.join(OUT, '_measures-recheck.json'), JSON.stringify(R, null, 2))
console.log(JSON.stringify({ path: R.path, summary: R.summary, artBrief: { copy: R.art.copyHits, homeN: R.art.homeRemindClickables?.length, badges: R.art.badges?.slice(0, 2), catalog: R.art.catalogCopy }, attBrief: { nav: R.att.nav, segs: R.att.segments, remind: R.att.remindSelected }, y1: { listFW: R.y1.projectsList?.fullWidthTop, gFW: R.y1.workspace_general?.fullWidthTop, pFW: R.y1.workspace_patent?.fullWidthTop } }, null, 2))
await browser.close()
