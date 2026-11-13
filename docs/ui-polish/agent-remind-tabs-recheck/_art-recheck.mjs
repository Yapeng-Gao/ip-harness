import { chromium } from 'playwright'
import fs from 'node:fs'
import path from 'node:path'

const OUT = path.resolve('docs/ui-polish/agent-remind-tabs-recheck')
fs.mkdirSync(OUT, { recursive: true })
const BASE = 'http://127.0.0.1:5175'

const browser = await chromium.launch({ headless: true })
const page = await browser.newPage({ viewport: { width: 1440, height: 900 } })

const measures = { meta: { head: 'recheck', viewport: '1440x900', base: BASE, at: new Date().toISOString() } }

await page.goto(`${BASE}/agent`, { waitUntil: 'networkidle' })
await page.waitForTimeout(700)
await page.screenshot({ path: path.join(OUT, '01-home-single-chip.png'), fullPage: false })

measures.homeRemindClickables = await page.evaluate(() => {
  return [...document.querySelectorAll('a,button,[role="button"]')]
    .map((el) => ({
      t: (el.textContent || '').replace(/\s+/g, ' ').trim(),
      testid: el.getAttribute('data-testid'),
      tag: el.tagName,
      href: el.getAttribute('href'),
      className: typeof el.className === 'string' ? el.className.slice(0, 80) : '',
    }))
    .filter((x) => /待确认\s*[·•]\s*\d+/.test(x.t))
})

measures.homeStripTwins = await page.evaluate(() => {
  const strip = document.querySelector('[data-testid="home-needs-human-link"], .home-needs-human-link, [class*="home-needs-human"]')
  const bottom = [...document.querySelectorAll('a,button')].filter((el) => {
    const t = (el.textContent || '').replace(/\s+/g, ' ').trim()
    if (!/待确认\s*[·•]\s*\d+/.test(t)) return false
    const r = el.getBoundingClientRect()
    return r.top > window.innerHeight * 0.7
  })
  return {
    stripSelectorFound: !!strip,
    bottomClickables: bottom.map((el) => ({
      t: (el.textContent || '').replace(/\s+/g, ' ').trim(),
      testid: el.getAttribute('data-testid'),
      top: Math.round(el.getBoundingClientRect().top),
    })),
  }
})

const chip = page.locator('[data-testid="home-needs-human-chip"]')
if (await chip.count()) {
  measures.homeChip = await chip.evaluate((el) => {
    const r = el.getBoundingClientRect()
    const cs = getComputedStyle(el)
    return {
      x: r.x, y: r.y, width: r.width, height: r.height,
      fs: cs.fontSize,
      bg: cs.backgroundColor,
      color: cs.color,
      borderColor: cs.borderColor,
      boxShadow: cs.boxShadow,
      className: el.className,
    }
  })
  await chip.screenshot({ path: path.join(OUT, '01b-home-chip-closeup.png') })
}

const compact = page.locator('[data-testid="home-sidebar-compact"]')
if (await compact.count()) {
  await compact.screenshot({ path: path.join(OUT, '01c-home-compact-sidebar.png') })
}

await page.goto(`${BASE}/agent/sessions`, { waitUntil: 'networkidle' })
await page.waitForTimeout(700)
await page.screenshot({ path: path.join(OUT, '02-sessions-shell-nav.png'), fullPage: false })

const nav = page.locator('[data-testid="agent-side-nav"]')
if (await nav.count()) {
  await nav.screenshot({ path: path.join(OUT, '02c-shell-nav-tabs.png') })
}
measures.navItems = await page.evaluate(() => {
  const nav = document.querySelector('[data-testid="agent-side-nav"]')
  if (!nav) return []
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
        w: Math.round(r.width),
        top: Math.round(r.top),
        fs: cs.fontSize,
        bg: cs.backgroundColor,
        active: el.className.includes('list-row-active') || el.getAttribute('aria-current') === 'page',
        classes: el.className,
      }
    }),
  }
})

const segs = page.locator('.agent-session-segments')
if (await segs.count()) {
  await segs.screenshot({ path: path.join(OUT, '02b-session-segmented.png') })
}
measures.segments = await page.evaluate(() => {
  return [...document.querySelectorAll('.agent-session-segments .segmented-item')].map((el) => {
    const r = el.getBoundingClientRect()
    const cs = getComputedStyle(el)
    const raw = el.textContent || ''
    const spaced = /[全部待确认进行中]\s*[·•]\s*\d+/.test(raw.replace(/\s+/g, ' ').trim()) ||
      /·\s*\d+/.test(raw)
    const sticky = /^(全部|待确认|进行中)\d+$/.test(raw.replace(/\s+/g, '').trim())
    return {
      text: raw.replace(/\s+/g, ' ').trim(),
      pressed: el.getAttribute('aria-pressed'),
      tone: el.getAttribute('data-tone'),
      color: cs.color,
      bg: cs.backgroundColor,
      h: Math.round(r.height),
      hasDotSpacer: spaced,
      stickyCount: sticky,
    }
  })
})

measures.badges = await page.evaluate(() => {
  return [...document.querySelectorAll('.agent-biz-badge')].slice(0, 12).map((el) => {
    const cs = getComputedStyle(el)
    const r = el.getBoundingClientRect()
    return {
      text: (el.textContent || '').trim(),
      fs: cs.fontSize,
      fsNum: parseFloat(cs.fontSize),
      h: Math.round(r.height),
    }
  })
})

measures.inboxGhosts = await page.evaluate(() => {
  const nodes = [...document.querySelectorAll('a,button,span')]
    .filter((el) => {
      const t = (el.textContent || '').replace(/\s+/g, ' ').trim()
      return t === 'Inbox' || t === '运营 Inbox' || /^Inbox$/i.test(t)
    })
    .map((el) => {
      const cs = getComputedStyle(el)
      const r = el.getBoundingClientRect()
      return {
        text: (el.textContent || '').replace(/\s+/g, ' ').trim(),
        tag: el.tagName,
        fs: cs.fontSize,
        fsNum: parseFloat(cs.fontSize),
        color: cs.color,
        h: Math.round(r.height),
        visible: r.width > 0 && r.height > 0,
      }
    })
  return nodes
})

measures.copyHits = await page.evaluate(() => {
  const body = document.body.innerText
  const patterns = ['待你确认', '待企业确认', '待我确认', '需确认', '待确认', '我方', '待企业', '待代理']
  const out = {}
  for (const p of patterns) out[p] = (body.match(new RegExp(p, 'g')) || []).length
  // contexts for legacy strings
  const contexts = {}
  for (const p of ['待你确认', '待企业确认', '需确认']) {
    const idx = body.indexOf(p)
    contexts[p] = idx >= 0 ? body.slice(Math.max(0, idx - 40), idx + p.length + 40).replace(/\s+/g, ' ') : null
  }
  out._contexts = contexts
  return out
})

const remindBtn = page.locator('.agent-session-segments .segmented-item[data-tone="remind"]')
if (await remindBtn.count()) {
  await remindBtn.click()
  await page.waitForTimeout(500)
  await page.screenshot({ path: path.join(OUT, '03-sessions-needs-human.png'), fullPage: false })
  if (await segs.count()) await segs.screenshot({ path: path.join(OUT, '03b-segment-remind-selected.png') })
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
      url: location.href,
    }
  })
  measures.copyHitsNeedsHuman = await page.evaluate(() => {
    const body = document.body.innerText
    const patterns = ['待你确认', '待企业确认', '待我确认', '需确认', '待确认', '我方', '待企业']
    const out = {}
    for (const p of patterns) out[p] = (body.match(new RegExp(p, 'g')) || []).length
    return out
  })
}

await page.goto(`${BASE}/agent/sessions?filter=needs_human`, { waitUntil: 'networkidle' })
await page.waitForTimeout(500)
await page.screenshot({ path: path.join(OUT, '03c-filter-needs-human-url.png'), fullPage: false })
measures.filterUrl = await page.evaluate(() => ({
  href: location.href,
  remindPressed: document.querySelector('.agent-session-segments .segmented-item[data-tone="remind"]')?.getAttribute('aria-pressed'),
}))

await page.goto(`${BASE}/agent/agents`, { waitUntil: 'networkidle' })
await page.waitForTimeout(600)
await page.screenshot({ path: path.join(OUT, '06-catalog-remind-copy.png'), fullPage: false })
measures.catalogCopy = await page.evaluate(() => {
  const body = document.body.innerText
  return {
    需确认: (body.match(/需确认/g) || []).length,
    待确认: (body.match(/待确认/g) || []).length,
    sample: [...document.querySelectorAll('.agent-catalog-remind-chip, [class*="catalog"]')]
      .slice(0, 6)
      .map((el) => (el.textContent || '').replace(/\s+/g, ' ').trim().slice(0, 60)),
  }
})

fs.writeFileSync(path.join(OUT, '_measures-recheck.json'), JSON.stringify(measures, null, 2))
console.log(JSON.stringify(measures, null, 2))
await browser.close()
