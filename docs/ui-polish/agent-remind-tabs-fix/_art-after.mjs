import { chromium } from 'playwright'
import fs from 'node:fs'
import path from 'node:path'

const OUT = path.resolve('docs/ui-polish/agent-remind-tabs-fix')
fs.mkdirSync(OUT, { recursive: true })
const BASE = 'http://127.0.0.1:5175'

const browser = await chromium.launch({ headless: true })
const page = await browser.newPage({ viewport: { width: 1440, height: 900 } })

const measures = {}

await page.goto(`${BASE}/agent`, { waitUntil: 'networkidle' })
await page.waitForTimeout(600)
await page.screenshot({ path: path.join(OUT, '01-home-single-chip.png'), fullPage: false })

const homeChips = await page.evaluate(() => {
  const texts = [...document.querySelectorAll('a,button,span')]
    .map((el) => ({
      t: (el.textContent || '').replace(/\s+/g, ' ').trim(),
      testid: el.getAttribute('data-testid'),
      tag: el.tagName,
      clickable: el.tagName === 'A' || el.tagName === 'BUTTON' || el.getAttribute('role') === 'button',
    }))
    .filter((x) => /待确认\s*·\s*\d+/.test(x.t) && x.clickable)
  return texts
})
measures.homeRemindClickables = homeChips

const chip = page.locator('[data-testid="home-needs-human-chip"]')
if (await chip.count()) {
  const box = await chip.boundingBox()
  measures.homeChip = box
  await chip.screenshot({ path: path.join(OUT, '01b-home-chip-closeup.png') })
}

const compact = page.locator('[data-testid="home-sidebar-compact"]')
if (await compact.count()) {
  await compact.screenshot({ path: path.join(OUT, '01c-home-compact-sidebar.png') })
}

await page.goto(`${BASE}/agent/sessions`, { waitUntil: 'networkidle' })
await page.waitForTimeout(600)
await page.screenshot({ path: path.join(OUT, '02-sessions-shell-nav.png'), fullPage: false })

const nav = page.locator('[data-testid="agent-side-nav"]')
await nav.screenshot({ path: path.join(OUT, '02c-shell-nav-tabs.png') })
measures.navItems = await page.evaluate(() => {
  const nav = document.querySelector('[data-testid="agent-side-nav"]')
  if (!nav) return []
  return [...nav.querySelectorAll('a,button')].map((el) => {
    const r = el.getBoundingClientRect()
    const cs = getComputedStyle(el)
    return {
      text: (el.textContent || '').replace(/\s+/g, ' ').trim(),
      h: Math.round(r.height),
      w: Math.round(r.width),
      fs: cs.fontSize,
      bg: cs.backgroundColor,
      active: el.className.includes('list-row-active') || el.getAttribute('aria-current') === 'page',
    }
  })
})

const segs = page.locator('.agent-session-segments')
if (await segs.count()) {
  await segs.screenshot({ path: path.join(OUT, '02b-session-segmented.png') })
}
measures.segments = await page.evaluate(() => {
  return [...document.querySelectorAll('.agent-session-segments .segmented-item')].map((el) => {
    const r = el.getBoundingClientRect()
    const cs = getComputedStyle(el)
    return {
      text: (el.textContent || '').replace(/\s+/g, ' ').trim(),
      pressed: el.getAttribute('aria-pressed'),
      tone: el.getAttribute('data-tone'),
      color: cs.color,
      bg: cs.backgroundColor,
      h: Math.round(r.height),
    }
  })
})

measures.badges = await page.evaluate(() => {
  return [...document.querySelectorAll('.agent-biz-badge')].slice(0, 8).map((el) => {
    const cs = getComputedStyle(el)
    const r = el.getBoundingClientRect()
    return {
      text: (el.textContent || '').trim(),
      fs: cs.fontSize,
      h: Math.round(r.height),
    }
  })
})

measures.copyHits = await page.evaluate(() => {
  const body = document.body.innerText
  const patterns = ['待你确认', '待企业确认', '待我确认', '需确认', '待确认', '我方', '待企业']
  const out = {}
  for (const p of patterns) out[p] = (body.match(new RegExp(p, 'g')) || []).length
  return out
})

// select 待确认
const remindBtn = page.locator('.agent-session-segments .segmented-item[data-tone="remind"]')
if (await remindBtn.count()) {
  await remindBtn.click()
  await page.waitForTimeout(400)
  await page.screenshot({ path: path.join(OUT, '03-sessions-needs-human.png'), fullPage: false })
  await segs.screenshot({ path: path.join(OUT, '03b-segment-remind-selected.png') })
  measures.remindSelected = await page.evaluate(() => {
    const el = document.querySelector('.agent-session-segments .segmented-item[data-tone="remind"]')
    if (!el) return null
    const cs = getComputedStyle(el)
    return {
      text: (el.textContent || '').replace(/\s+/g, ' ').trim(),
      pressed: el.getAttribute('aria-pressed'),
      bg: cs.backgroundColor,
      color: cs.color,
      boxShadow: cs.boxShadow,
    }
  })
}

await page.goto(`${BASE}/agent/agents`, { waitUntil: 'networkidle' })
await page.waitForTimeout(500)
await page.screenshot({ path: path.join(OUT, '06-catalog-remind-copy.png'), fullPage: false })
measures.catalogCopy = await page.evaluate(() => {
  const body = document.body.innerText
  return {
    需确认: (body.match(/需确认/g) || []).length,
    待确认: (body.match(/待确认/g) || []).length,
  }
})

fs.writeFileSync(path.join(OUT, '_measures-after.json'), JSON.stringify(measures, null, 2))
console.log(JSON.stringify(measures, null, 2))
await browser.close()
