/**
 * STRICT Agent stepwise UI walk S0–S9 · 2026-09-19
 * Void soft "可过". Evidence-only. Base http://127.0.0.1:5175
 * Skills: apple-design · make-interfaces-feel-better · web-design-guidelines (fetched 2026-09-19)
 */
import { chromium } from 'playwright'
import fs from 'node:fs'
import path from 'node:path'

const BASE = 'http://127.0.0.1:5175'
const ROOT = '/workspace/ip-harness/docs/ui-polish/agent-stepwise-strict'
const OUT = Object.fromEntries(
  ['S0','S1','S2','S3','S4','S5','S6','S7','S8','S9'].map((s) => [s, path.join(ROOT, s)]),
)
for (const d of Object.values(OUT)) fs.mkdirSync(d, { recursive: true })

const CONSOLE_WHITELIST = [
  /Download the React DevTools/i, /\[vite\]/i, /favicon\.ico/i, /DevTools/i,
  /third-party cookie/i, /was preloaded using link preload/i,
]
const isWhitelisted = (t) => CONSOLE_WHITELIST.some((re) => re.test(t))

async function shot(page, dir, name, fullPage = false) {
  const p = path.join(dir, name)
  await page.screenshot({ path: p, fullPage })
  return p.replace('/workspace/ip-harness/', '')
}

async function hardGates(page) {
  return page.evaluate(() => {
    const hrefs = [...document.querySelectorAll('a[href]')].map((a) => a.getAttribute('href') || '')
    const main = document.querySelector('#agent-main, main, [data-testid="agent-main"]') || document.body
    const mainHrefs = [...main.querySelectorAll('a[href]')].map((a) => a.getAttribute('href') || '')
    const midDeep = mainHrefs.filter((h) => /:5173\b|localhost:5173|127\.0\.0\.1:5173/.test(h))
    const midCta = [...document.querySelectorAll('a, button')]
      .filter((el) => {
        const t = (el.innerText || el.getAttribute('aria-label') || '').replace(/\s+/g, ' ')
        const h = el.getAttribute('href') || ''
        return /回中台|运营 Inbox|作业中台打开|打开费用中心|在运营 Inbox/.test(t) || /:5173/.test(h)
      })
      .map((el) => ({
        text: (el.innerText || '').replace(/\s+/g, ' ').trim().slice(0, 60),
        href: el.getAttribute('href') || '',
      }))
    const bannerEl = document.querySelector('[data-billing-hold-banner]')
    let billingBanner = null
    if (bannerEl) {
      const r = bannerEl.getBoundingClientRect()
      billingBanner = {
        variant: bannerEl.getAttribute('data-billing-hold-banner'),
        text: (bannerEl.textContent || '').replace(/\s+/g, ' ').trim().slice(0, 120),
        w: Math.round(r.width), h: Math.round(r.height),
        visible: !!(bannerEl.offsetWidth || bannerEl.offsetHeight),
      }
    }
    const vw = window.innerWidth
    const amberFullWidth = [...document.querySelectorAll('*')]
      .filter((el) => {
        const r = el.getBoundingClientRect()
        if (r.top > 200 || r.height < 16 || r.height > 120) return false
        if (r.width < vw * 0.65) return false
        const bg = getComputedStyle(el).backgroundColor
        const m = bg.match(/rgba?\((\d+),\s*(\d+),\s*(\d+)/)
        if (!m) return false
        const [, R, G, B] = m.map(Number)
        if (!(R > 240 && G > 180 && G < 240 && B < 180)) return false
        return /不停审|仅提示|BillingHold|欠票|停权|欠费|样机/.test((el.textContent || '').replace(/\s+/g, ' '))
      })
      .slice(0, 6)
      .map((el) => {
        const r = el.getBoundingClientRect()
        return { text: (el.textContent || '').replace(/\s+/g, ' ').trim().slice(0, 80), w: Math.round(r.width), h: Math.round(r.height) }
      })
    return {
      midDeep, midCta, billingBanner, amberFullWidth,
      shell5173Count: hrefs.filter((h) => /:5173/.test(h)).length,
      origin: location.origin,
      homeCaseBind: document.querySelectorAll('[data-testid="home-case-bind"]').length,
      caseBindControls: document.querySelectorAll('[data-testid="case-bind-controls"]').length,
    }
  })
}

async function uiAudit(page) {
  return page.evaluate(() => {
    const box = (el) => {
      if (!el) return null
      const r = el.getBoundingClientRect()
      const cs = getComputedStyle(el)
      return {
        w: Math.round(r.width), h: Math.round(r.height),
        top: Math.round(r.top), left: Math.round(r.left), bottom: Math.round(r.bottom),
        fontSize: cs.fontSize, fontWeight: cs.fontWeight, lineHeight: cs.lineHeight,
        radius: cs.borderRadius, bg: cs.backgroundColor, color: cs.color,
        padding: `${cs.paddingTop} ${cs.paddingRight} ${cs.paddingBottom} ${cs.paddingLeft}`,
        text: (el.innerText || '').replace(/\s+/g, ' ').trim().slice(0, 160),
        tag: el.tagName.toLowerCase(),
        role: el.getAttribute('role'),
        aria: el.getAttribute('aria-label'),
        testid: el.getAttribute('data-testid'),
        disabled: !!el.disabled,
      }
    }
    const buttons = [...document.querySelectorAll('button, a.ui-btn, [role="button"]')]
      .filter((el) => {
        const r = el.getBoundingClientRect()
        return r.width > 0 && r.height > 0 && r.top < innerHeight && r.bottom > 0
      })
      .map((el) => {
        const b = box(el)
        return {
          ...b,
          primaryish: /开始办理|批准|授权|创建|启动|确认|发送/.test(b.text || ''),
          tiny: (b?.h || 99) < 32 || parseFloat(b?.fontSize || '99') < 12,
        }
      })
      .slice(0, 40)

    // tiny text in viewport
    const tinyText = []
    const walk = (root) => {
      for (const el of root.querySelectorAll('*')) {
        if (el.children.length) continue
        const t = (el.textContent || '').trim()
        if (!t || t.length < 2) continue
        const r = el.getBoundingClientRect()
        if (r.width < 8 || r.height < 8 || r.top > innerHeight || r.bottom < 0) continue
        const fs = parseFloat(getComputedStyle(el).fontSize)
        if (fs > 0 && fs < 12) {
          tinyText.push({ fs, text: t.slice(0, 40), h: Math.round(r.height), top: Math.round(r.top) })
          if (tinyText.length >= 20) return
        }
      }
    }
    walk(document.body)

    const headings = [...document.querySelectorAll('h1,h2,h3')].slice(0, 24).map((h) => ({
      level: h.tagName, text: (h.innerText || '').replace(/\s+/g, ' ').trim().slice(0, 80),
    }))

    const primaryCtas = buttons.filter((b) => b.primaryish)
    const hitThin = buttons.filter((b) => (b.h || 0) > 0 && (b.h || 0) < 36 && b.primaryish)

    // Competing navy/filled CTAs in viewport
    const filledCtas = buttons.filter((b) => {
      const bg = b.bg || ''
      const m = bg.match(/rgba?\((\d+),\s*(\d+),\s*(\d+)/)
      if (!m) return false
      const [, R, G, B] = m.map(Number)
      // navy-ish or strong fill
      return (R < 80 && G < 100 && B > 80) || (R < 60 && G < 80 && B < 120 && (R+G+B) < 200)
    })

    return {
      url: location.href,
      title: document.title,
      vh: innerHeight, vw: innerWidth,
      headings,
      buttonsSample: buttons.slice(0, 25),
      primaryCtas: primaryCtas.slice(0, 12),
      hitThinPrimary: hitThin.slice(0, 8),
      filledCtaCount: filledCtas.length,
      filledCtaTexts: filledCtas.slice(0, 8).map((b) => b.text),
      tinyText,
      tinyCount: tinyText.length,
      confirm: box(document.querySelector('.confirm-hitl, [data-testid*="confirm"], .agent-hitl-dock')),
      dock: box(document.querySelector('.agent-hitl-dock, [data-testid="agent-hitl-dock"]')),
      timeline: box(document.querySelector('[data-testid="session-timeline-scroller"], .session-timeline-scroller')),
      composer: box(document.querySelector('[data-testid="session-composer"], .session-composer, textarea[aria-label*="办理"], textarea[aria-label*="消息"]')),
      sideNav: box(document.querySelector('[data-testid="agent-side-nav"]')),
      homeSend: box(document.querySelector('[data-testid="home-send"]')),
      homeCaseBind: box(document.querySelector('[data-testid="home-case-bind"]')),
      recommendFold: (() => {
        const el = document.querySelector('[data-testid="home-recommend-fold"], details[data-testid*="recommend"]')
        if (!el) return null
        return { open: el.open !== undefined ? el.open : el.hasAttribute('open'), text: (el.innerText || '').slice(0, 80), ...box(el) }
      })(),
      filterGroup: box(document.querySelector('[aria-label="会话状态筛选"]')),
      h1: (document.querySelector('h1')?.innerText || '').replace(/\s+/g, ' ').trim().slice(0, 80),
    }
  })
}

const report = {
  kind: 'STRICT-S0-S9',
  base: BASE,
  startedAt: new Date().toISOString(),
  head: '71fdc9cca4a7a6f100a2a6520ac8b8dca3481a25',
  steps: {},
  consoleErrors: [],
  evidence: [],
}

const browser = await chromium.launch({ headless: true })
const context = await browser.newContext({ viewport: { width: 1440, height: 900 }, deviceScaleFactor: 1 })
const page = await context.newPage()
page.on('console', (msg) => {
  if (msg.type() !== 'error') return
  const text = msg.text()
  if (isWhitelisted(text)) return
  report.consoleErrors.push({ step: report._cur || '?', text: text.slice(0, 280) })
})
page.on('pageerror', (err) => {
  report.consoleErrors.push({ step: report._cur || '?', text: `pageerror: ${String(err.message || err).slice(0, 280)}` })
})

async function finishStep(id, extra = {}) {
  const gates = await hardGates(page)
  const audit = await uiAudit(page)
  const step = {
    id, url: page.url(), gates, audit, ...extra,
    hardOk:
      gates.midDeep.length === 0 &&
      !gates.billingBanner?.visible &&
      gates.amberFullWidth.length === 0 &&
      !/:5173/.test(gates.origin || ''),
  }
  report.steps[id] = step
  fs.writeFileSync(path.join(OUT[id], '_probe.json'), JSON.stringify(step, null, 2))
  return step
}

// ─── S0 Home ───
report._cur = 'S0'
await page.goto(`${BASE}/agent`, { waitUntil: 'networkidle', timeout: 60000 })
await page.waitForTimeout(600)
report.evidence.push(await shot(page, OUT.S0, 'S0-home.png'))
report.evidence.push(await shot(page, OUT.S0, 'S0-home-full.png', true))
const compose = page.locator('[data-testid="home-send"]').first()
if (await compose.count()) await compose.screenshot({ path: path.join(OUT.S0, 'S0-cta-closeup.png') }).catch(() => {})
const caseBind = page.locator('[data-testid="home-case-bind"]').first()
if (await caseBind.count()) await caseBind.screenshot({ path: path.join(OUT.S0, 'S0-case-bind.png') }).catch(() => {})
const side = page.locator('[data-testid="agent-side-nav"]').first()
if (await side.count()) await side.screenshot({ path: path.join(OUT.S0, 'S0-sidenav.png') }).catch(() => {})
await finishStep('S0', {
  landmarks: await page.evaluate(() => ({
    sideNav: !!document.querySelector('[data-testid="agent-side-nav"]'),
    compact: !!document.querySelector('[data-testid="home-sidebar-compact"]'),
    needsChip: !!document.querySelector('[data-testid="home-needs-human-chip"]'),
    homeSend: !!document.querySelector('[data-testid="home-send"]'),
    homeCaseBind: document.querySelectorAll('[data-testid="home-case-bind"]').length,
    recommendFold: !!document.querySelector('[data-testid="home-recommend-fold"]'),
    foldOpen: document.querySelector('[data-testid="home-recommend-fold"]')?.open ?? null,
  })),
})

// ─── S1 create+bind case ───
report._cur = 'S1'
const createBtn = page.getByTestId('case-create-bind')
if (await createBtn.count()) {
  await createBtn.click()
  await page.waitForTimeout(400)
  const title = page.locator('input[name="title"], input[aria-label*="标题"], [data-testid="case-create-title"]').first()
  if (await title.count()) {
    await title.fill(`严格走查样机案 ${Date.now().toString().slice(-4)}`)
  }
  const confirm = page.getByTestId('case-create-confirm')
  if (await confirm.count()) await confirm.click()
  await page.waitForTimeout(500)
}
report.evidence.push(await shot(page, OUT.S1, 'S1-case-bound.png'))
await finishStep('S1', {
  bound: await page.evaluate(() => ({
    current: (document.querySelector('[data-testid="case-bind-current"]')?.innerText || '').slice(0, 80),
    homeCaseBind: document.querySelectorAll('[data-testid="home-case-bind"]').length,
    controls: document.querySelectorAll('[data-testid="case-bind-controls"]').length,
  })),
})

// ─── S2 start without forcing case (fresh session via home send) ───
report._cur = 'S2'
// Go home fresh unbound path: open new context-ish by clearing? Use home send with goal
await page.goto(`${BASE}/agent`, { waitUntil: 'networkidle', timeout: 60000 })
await page.waitForTimeout(400)
const goal = page.getByRole('textbox', { name: '办理目标' })
if (await goal.count()) await goal.fill('严格走查：无强制案开工')
const send = page.getByTestId('home-send')
await send.click()
await page.waitForURL(/\/agent\/sessions\//, { timeout: 20000 }).catch(() => {})
await page.waitForTimeout(800)
report.evidence.push(await shot(page, OUT.S2, 'S2-session.png'))
await finishStep('S2', {
  urlMatch: /\/agent\/sessions\//.test(page.url()),
  forceDialog: await page.locator('[role="dialog"]').count(),
})

// ─── S3 timeline on seed sess-oa-1 ───
report._cur = 'S3'
await page.goto(`${BASE}/agent/sessions/sess-oa-1`, { waitUntil: 'networkidle', timeout: 60000 })
await page.waitForTimeout(700)
report.evidence.push(await shot(page, OUT.S3, 'S3-timeline.png'))
const scroller = page.locator('[data-testid="session-timeline-scroller"]').first()
if (await scroller.count()) await scroller.screenshot({ path: path.join(OUT.S3, 'S3-scroller.png') }).catch(() => {})
await finishStep('S3', {
  timelineText: await page.evaluate(() => {
    const el = document.querySelector('[data-testid="session-timeline-scroller"]')
    return (el?.innerText || '').replace(/\s+/g, ' ').trim().slice(0, 400)
  }),
})

// ─── S4 HITL Confirm ───
report._cur = 'S4'
await page.goto(`${BASE}/agent/sessions/sess-oa-1?focus=hitl`, { waitUntil: 'networkidle', timeout: 60000 })
await page.waitForTimeout(800)
report.evidence.push(await shot(page, OUT.S4, 'S4-hitl.png'))
const confirmBar = page.locator('.confirm-hitl').first()
if (await confirmBar.count()) {
  await confirmBar.screenshot({ path: path.join(OUT.S4, 'S4-confirmbar.png') }).catch(() => {})
}
const dock = page.locator('.agent-hitl-dock').first()
if (await dock.count()) await dock.screenshot({ path: path.join(OUT.S4, 'S4-dock.png') }).catch(() => {})

const hitlDetail = await page.evaluate(() => {
  const bar = document.querySelector('.confirm-hitl')
  if (!bar) return { hasBar: false }
  const btns = [...bar.querySelectorAll('button')].map((b) => {
    const r = b.getBoundingClientRect()
    const cs = getComputedStyle(b)
    return {
      text: (b.innerText || '').replace(/\s+/g, ' ').trim().slice(0, 40),
      disabled: b.disabled,
      w: Math.round(r.width), h: Math.round(r.height),
      fontSize: cs.fontSize, fontWeight: cs.fontWeight,
    }
  })
  const chips = [...bar.querySelectorAll('*')].filter((el) => {
    const t = (el.textContent || '').trim()
    return /待批准|待授权|逐步|还有/.test(t) && el.children.length === 0
  }).slice(0, 12).map((el) => {
    const cs = getComputedStyle(el)
    const r = el.getBoundingClientRect()
    return { text: el.textContent.trim().slice(0, 30), fs: cs.fontSize, h: Math.round(r.height), w: Math.round(r.width) }
  })
  const reason = (bar.innerText.match(/请先[^\n]{0,40}/) || [])[0] || null
  const dockEl = document.querySelector('.agent-hitl-dock')
  const dockBox = dockEl ? (() => { const r = dockEl.getBoundingClientRect(); return { h: Math.round(r.height), top: Math.round(r.top) } })() : null
  const tl = document.querySelector('[data-testid="session-timeline-scroller"]')
  const tlBox = tl ? (() => { const r = tl.getBoundingClientRect(); return { h: Math.round(r.height), top: Math.round(r.top) } })() : null
  // right rail
  const right = document.querySelector('[data-testid="session-context-rail"], aside.session-right, [class*="context"]')
  return { hasBar: true, btns, chips, reason, dockBox, tlBox, barText: (bar.innerText || '').replace(/\s+/g, ' ').trim().slice(0, 350) }
})

// try open sheet by clicking disabled reason area / 补充
const moreBtn = page.locator('.confirm-hitl').getByRole('button', { name: /还有|补充|争点/ }).first()
if (await moreBtn.count()) {
  await moreBtn.click().catch(() => {})
  await page.waitForTimeout(400)
  report.evidence.push(await shot(page, OUT.S4, 'S4-sheet.png'))
}
await finishStep('S4', { hitlDetail })

// ─── S5 session top case bind (unbound session) ───
report._cur = 'S5'
// create unbound session
await page.goto(`${BASE}/agent`, { waitUntil: 'networkidle', timeout: 60000 })
await page.waitForTimeout(300)
if (await goal.count()) await goal.fill('严格走查：先聊后案')
await page.getByTestId('home-send').click()
await page.waitForURL(/\/agent\/sessions\//, { timeout: 20000 }).catch(() => {})
await page.waitForTimeout(700)
report.evidence.push(await shot(page, OUT.S5, 'S5-unbound.png'))
const topBind = page.locator('[data-testid="session-case-bind-top"], [data-testid="case-bind-controls"]').first()
if (await topBind.count()) await topBind.screenshot({ path: path.join(OUT.S5, 'S5-top-bind.png') }).catch(() => {})
const s5before = await page.evaluate(() => ({
  top: !!document.querySelector('[data-testid="session-case-bind-top"]'),
  controls: document.querySelectorAll('[data-testid="case-bind-controls"]').length,
  associateLabel: [...document.querySelectorAll('label, span')].filter((el) => /关联案件/.test(el.textContent || '')).length,
  noCaseHint: !!document.querySelector('[data-testid="session-no-case-hint"]'),
  hintText: (document.body.innerText.match(/开始办理后可在此绑定|先聊后案|绑定案件/) || [])[0] || null,
}))
// bind via create
const s5create = page.getByTestId('case-create-bind')
if (await s5create.count()) {
  await s5create.click()
  await page.waitForTimeout(300)
  const t = page.locator('input[name="title"], input[aria-label*="标题"], [data-testid="case-create-title"]').first()
  if (await t.count()) await t.fill(`先聊后案 ${Date.now().toString().slice(-4)}`)
  const c = page.getByTestId('case-create-confirm')
  if (await c.count()) await c.click()
  await page.waitForTimeout(500)
}
report.evidence.push(await shot(page, OUT.S5, 'S5-bound.png'))
await finishStep('S5', {
  before: s5before,
  after: await page.evaluate(() => ({
    top: !!document.querySelector('[data-testid="session-case-bind-top"]'),
    controls: document.querySelectorAll('[data-testid="case-bind-controls"]').length,
    current: (document.querySelector('[data-testid="case-bind-current"]')?.innerText || '').slice(0, 60),
  })),
})

// ─── S6 sessions filter ───
report._cur = 'S6'
await page.goto(`${BASE}/agent/sessions`, { waitUntil: 'networkidle', timeout: 60000 })
await page.waitForTimeout(600)
report.evidence.push(await shot(page, OUT.S6, 'S6-all.png'))
const seg = page.locator('[aria-label="会话状态筛选"]').first()
if (await seg.count()) await seg.screenshot({ path: path.join(OUT.S6, 'S6-segmented.png') }).catch(() => {})

const s6all = await page.evaluate(() => {
  const group = document.querySelector('[aria-label="会话状态筛选"]')
  const buttons = group ? [...group.querySelectorAll('button')].map((b) => ({
    text: (b.innerText || '').replace(/\s+/g, ' ').trim(),
    pressed: b.getAttribute('aria-pressed'),
    h: Math.round(b.getBoundingClientRect().height),
    w: Math.round(b.getBoundingClientRect().width),
    fs: getComputedStyle(b).fontSize,
  })) : []
  const mainRows = [...document.querySelectorAll('a[href*="/agent/sessions/"], tr, [data-testid*="session-row"]')]
    .filter((el) => {
      const href = el.getAttribute('href') || ''
      return /\/agent\/sessions\/sess-/.test(href) || el.closest('table, [role="list"]')
    })
  // better: main list rows
  const rows = [...document.querySelectorAll('main a[href*="/agent/sessions/sess-"], [data-testid="sessions-main"] a[href*="/sessions/"]')]
  return {
    url: location.href,
    h1: (document.querySelector('h1')?.innerText || '').trim(),
    buttons,
    mainRowEstimate: rows.length || document.querySelectorAll('main li, main [class*="row"]').length,
    filterParam: new URL(location.href).searchParams.get('filter'),
  }
})

await page.getByRole('group', { name: '会话状态筛选' }).getByRole('button', { name: /待确认/ }).click()
await page.waitForTimeout(500)
report.evidence.push(await shot(page, OUT.S6, 'S6-needs.png'))
const s6needs = await page.evaluate(() => {
  const rows = [...document.querySelectorAll('main a[href*="/agent/sessions/sess-"]')]
  const group = document.querySelector('[aria-label="会话状态筛选"]')
  const pressed = group ? [...group.querySelectorAll('button')].filter((b) => b.getAttribute('aria-pressed') === 'true').map((b) => b.innerText.trim()) : []
  return {
    url: location.href,
    h1: (document.querySelector('h1')?.innerText || '').trim(),
    filterParam: new URL(location.href).searchParams.get('filter'),
    mainRows: rows.length,
    pressed,
  }
})

await page.getByRole('group', { name: '会话状态筛选' }).getByRole('button', { name: /进行中/ }).click()
await page.waitForTimeout(400)
report.evidence.push(await shot(page, OUT.S6, 'S6-running.png'))
const s6run = await page.evaluate(() => ({
  url: location.href,
  h1: (document.querySelector('h1')?.innerText || '').trim(),
  filterParam: new URL(location.href).searchParams.get('filter'),
  emptyText: (document.body.innerText.match(/无匹配|暂无|没有/) || [])[0] || null,
}))

await page.goto(`${BASE}/agent/sessions?filter=needs_human`, { waitUntil: 'networkidle', timeout: 60000 })
await page.waitForTimeout(400)
report.evidence.push(await shot(page, OUT.S6, 'S6-url-filter.png'))
await finishStep('S6', { s6all, s6needs, s6run, s6url: await page.evaluate(() => ({
  url: location.href, h1: (document.querySelector('h1')?.innerText || '').trim(),
  mainRows: [...document.querySelectorAll('main a[href*="/agent/sessions/sess-"]')].length,
})) })

// ─── S7 Catalog ───
report._cur = 'S7'
await page.goto(`${BASE}/agent/agents`, { waitUntil: 'networkidle', timeout: 60000 })
await page.waitForTimeout(700)
report.evidence.push(await shot(page, OUT.S7, 'S7-catalog.png'))
report.evidence.push(await shot(page, OUT.S7, 'S7-catalog-full.png', true))
const s7 = await page.evaluate(() => {
  const headings = [...document.querySelectorAll('h1,h2,h3')].map((h) => (h.innerText || '').replace(/\s+/g, ' ').trim())
  const cards = [...document.querySelectorAll('[data-testid*="agent-picker"], [class*="agent-picker"], article, [class*="catalog"]')]
    .filter((el) => el.getBoundingClientRect().height > 80)
    .slice(0, 12)
    .map((el) => {
      const r = el.getBoundingClientRect()
      return { h: Math.round(r.height), w: Math.round(r.width), text: (el.innerText || '').replace(/\s+/g, ' ').trim().slice(0, 100) }
    })
  const ctas = [...document.querySelectorAll('button, a')].filter((el) => /启动|稍后|开始/.test(el.innerText || '')).map((el) => {
    const r = el.getBoundingClientRect()
    return { text: (el.innerText || '').trim().slice(0, 20), h: Math.round(r.height), w: Math.round(r.width) }
  }).slice(0, 15)
  const betaDup = headings.filter((t) => /Beta\s*Beta/.test(t))
  const englishIds = (document.body.innerText.match(/\b(dispatch_task|GENERAL-ORCHESTRATOR|expert-search|needs_human)\b/g) || []).slice(0, 10)
  return { headings, cards, ctas, betaDup, englishIds, cardCount: cards.length }
})
await finishStep('S7', { s7 })

// ─── S8 general project ───
report._cur = 'S8'
await page.goto(`${BASE}/agent/projects`, { waitUntil: 'networkidle', timeout: 60000 })
await page.waitForTimeout(500)
report.evidence.push(await shot(page, OUT.S8, 'S8-list.png'))
// try create general
const createProj = page.getByRole('button', { name: /新建|创建项目/ }).first()
if (await createProj.count()) {
  await createProj.click()
  await page.waitForTimeout(400)
  report.evidence.push(await shot(page, OUT.S8, 'S8-create-form.png'))
  const general = page.getByRole('button', { name: /通用/ }).first()
  if (await general.count()) await general.click()
  const nameIn = page.locator('input[name="name"], input[aria-label*="名称"], input[placeholder*="名称"]').first()
  if (await nameIn.count()) await nameIn.fill(`严格通用 ${Date.now().toString().slice(-4)}`)
  const submit = page.getByRole('button', { name: /创建|确认|开始/ }).last()
  if (await submit.count()) await submit.click()
  await page.waitForTimeout(1000)
}
await page.waitForURL(/\/agent\/projects\//, { timeout: 15000 }).catch(() => {})
report.evidence.push(await shot(page, OUT.S8, 'S8-general.png'))
const s8 = await page.evaluate(() => ({
  url: location.href,
  noPatent: !!document.querySelector('[data-testid="general-no-patent-steps"]') || /无专利步骤/.test(document.body.innerText),
  domainStepBar: document.querySelectorAll('[data-testid="domain-step-bar"]').length,
  orch: !!document.querySelector('[data-testid="project-chat-general-orchestrator"], [data-testid="project-chat-orchestrator"]'),
  englishTools: (document.body.innerText.match(/\b(dispatch_task|summarize_timeline|open_expert)\b/g) || []).slice(0, 8),
  composerTop: (() => {
    const el = document.querySelector('textarea, [data-testid*="composer"]')
    return el ? Math.round(el.getBoundingClientRect().top) : null
  })(),
}))
await finishStep('S8', { s8 })

// ─── S9 patent + expert ───
report._cur = 'S9'
await page.goto(`${BASE}/agent/projects`, { waitUntil: 'networkidle', timeout: 60000 })
await page.waitForTimeout(400)
const createProj2 = page.getByRole('button', { name: /新建|创建项目/ }).first()
if (await createProj2.count()) {
  await createProj2.click()
  await page.waitForTimeout(400)
  report.evidence.push(await shot(page, OUT.S9, 'S9-create-form.png'))
  const patent = page.getByRole('button', { name: /专利|patent|领域/i }).first()
  if (await patent.count()) await patent.click()
  const nameIn2 = page.locator('input[name="name"], input[aria-label*="名称"], input[placeholder*="名称"]').first()
  if (await nameIn2.count()) await nameIn2.fill(`严格专利 ${Date.now().toString().slice(-4)}`)
  const submit2 = page.getByRole('button', { name: /创建|确认|开始/ }).last()
  if (await submit2.count()) await submit2.click()
  await page.waitForTimeout(1200)
}
report.evidence.push(await shot(page, OUT.S9, 'S9-orchestrator.png'))
const stepBar = page.locator('[data-testid="domain-step-bar"]').first()
if (await stepBar.count()) await stepBar.screenshot({ path: path.join(OUT.S9, 'S9-step-bar.png') }).catch(() => {})

// navigate to expert
const expertLink = page.locator('a[href*="expert-search"], a[href*="/bots/"]').filter({ hasText: /检索|专家/ }).first()
if (await expertLink.count()) {
  await expertLink.click()
  await page.waitForTimeout(800)
} else {
  // try sidebar bot
  const bot = page.getByText(/检索专家|现有技术/).first()
  if (await bot.count()) await bot.click()
  await page.waitForTimeout(800)
}
report.evidence.push(await shot(page, OUT.S9, 'S9-expert.png'))
const s9 = await page.evaluate(() => ({
  url: location.href,
  domainStepBar: document.querySelectorAll('[data-testid="domain-step-bar"]').length,
  orch: !!document.querySelector('[data-testid="project-chat-orchestrator"]'),
  expert: /expert|检索专家|现有技术/.test(document.body.innerText + location.href),
  englishTools: (document.body.innerText.match(/\b(dispatch_task|summarize_timeline|open_expert|run_search)\b/g) || []).slice(0, 10),
  softYellow: [...document.querySelectorAll('*')].filter((el) => {
    const r = el.getBoundingClientRect()
    if (r.height < 20 || r.height > 80 || r.width < 200) return false
    const bg = getComputedStyle(el).backgroundColor
    const m = bg.match(/rgba?\((\d+),\s*(\d+),\s*(\d+)/)
    if (!m) return false
    const [, R, G, B] = m.map(Number)
    return R > 240 && G > 180 && B < 180
  }).slice(0, 3).map((el) => (el.textContent || '').replace(/\s+/g, ' ').trim().slice(0, 60)),
}))
await finishStep('S9', { s9 })

report.finishedAt = new Date().toISOString()
report.evidenceCount = report.evidence.length
fs.writeFileSync(path.join(ROOT, '_walk_strict_report.json'), JSON.stringify(report, null, 2))
console.log(JSON.stringify({
  ok: true,
  steps: Object.keys(report.steps),
  evidence: report.evidence.length,
  consoleErrors: report.consoleErrors.length,
  hard: Object.fromEntries(Object.entries(report.steps).map(([k, v]) => [k, v.hardOk])),
}, null, 2))
await browser.close()
