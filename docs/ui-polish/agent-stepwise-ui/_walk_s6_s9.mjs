/**
 * Agent stepwise UI walk S6–S9 · 2026-09-19
 * Evidence-only deep UI/UX (not mere e2e green). Base http://127.0.0.1:5175
 * Skills: apple-design · make-interfaces-feel-better · web-design-guidelines
 */
import { chromium } from 'playwright'
import fs from 'node:fs'
import path from 'node:path'

const BASE = 'http://127.0.0.1:5175'
const ROOT = '/workspace/ip-harness/docs/ui-polish/agent-stepwise-ui'
const OUT = {
  S6: path.join(ROOT, 'S6'),
  S7: path.join(ROOT, 'S7'),
  S8: path.join(ROOT, 'S8'),
  S9: path.join(ROOT, 'S9'),
}
for (const d of Object.values(OUT)) fs.mkdirSync(d, { recursive: true })

const CATALOG_NAMES = [
  '调研检索', '立项评估', '交底', '权利要求', 'OA', '年费', '监控', '转化', '布局',
]

const CONSOLE_WHITELIST = [
  /Download the React DevTools/i,
  /\[vite\]/i,
  /favicon\.ico/i,
  /DevTools/i,
  /third-party cookie/i,
  /was preloaded using link preload/i,
]

function isWhitelisted(text) {
  return CONSOLE_WHITELIST.some((re) => re.test(text))
}

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
    const midDeep = mainHrefs.filter(
      (h) => /:5173\b/.test(h) || /localhost:5173|127\.0\.0\.1:5173/.test(h),
    )
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
        w: Math.round(r.width),
        h: Math.round(r.height),
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
        return /不停审|仅提示|BillingHold|欠票|停权|欠费/.test((el.textContent || '').replace(/\s+/g, ' '))
      })
      .slice(0, 4)
      .map((el) => {
        const r = el.getBoundingClientRect()
        return {
          text: (el.textContent || '').replace(/\s+/g, ' ').trim().slice(0, 80),
          w: Math.round(r.width),
          h: Math.round(r.height),
        }
      })
    return {
      midDeep,
      midCta,
      billingBanner,
      amberFullWidth,
      shell5173Count: hrefs.filter((h) => /:5173/.test(h)).length,
      origin: location.origin,
    }
  })
}

function hardOk(g) {
  return (
    g.midDeep.length === 0 &&
    !g.billingBanner?.visible &&
    g.amberFullWidth.length === 0 &&
    !/:5173/.test(g.origin || '')
  )
}

/** Collect UI-facing metrics for deep review */
async function uiMetrics(page) {
  return page.evaluate(() => {
    const pick = (sel) => {
      const el = document.querySelector(sel)
      if (!el) return null
      const r = el.getBoundingClientRect()
      const cs = getComputedStyle(el)
      return {
        tag: el.tagName.toLowerCase(),
        w: Math.round(r.width),
        h: Math.round(r.height),
        top: Math.round(r.top),
        left: Math.round(r.left),
        fontSize: cs.fontSize,
        fontWeight: cs.fontWeight,
        radius: cs.borderRadius,
        bg: cs.backgroundColor,
        color: cs.color,
        display: cs.display,
        ariaPressed: el.getAttribute('aria-pressed'),
        ariaLabel: el.getAttribute('aria-label'),
        role: el.getAttribute('role'),
        testid: el.getAttribute('data-testid'),
        text: (el.innerText || '').replace(/\s+/g, ' ').trim().slice(0, 120),
      }
    }
    const focusable = [...document.querySelectorAll('a, button, input, select, textarea, [tabindex]')]
      .filter((el) => {
        const r = el.getBoundingClientRect()
        return r.width > 0 && r.height > 0
      })
      .slice(0, 80)
    const noLabelIconBtns = focusable
      .filter((el) => {
        if (el.tagName !== 'BUTTON') return false
        const t = (el.innerText || '').trim()
        const aria = el.getAttribute('aria-label')
        const titled = el.getAttribute('title')
        return t.length === 0 && !aria && !titled
      })
      .map((el) => ({
        class: (el.className || '').toString().slice(0, 80),
        testid: el.getAttribute('data-testid'),
      }))
      .slice(0, 8)
    const outlineNone = focusable
      .filter((el) => {
        const cs = getComputedStyle(el)
        return cs.outlineStyle === 'none' || cs.outlineWidth === '0px'
      })
      .length
    return {
      url: location.href,
      title: document.title,
      viewport: { w: window.innerWidth, h: window.innerHeight },
      sideNav: pick('[data-testid="agent-side-nav"]'),
      main: pick('main, #agent-main, [data-testid="agent-main"]'),
      noLabelIconBtns,
      focusableCount: focusable.length,
      outlineNoneSample: outlineNone,
      headings: [...document.querySelectorAll('h1,h2,h3')]
        .slice(0, 20)
        .map((h) => ({
          level: h.tagName,
          text: (h.innerText || '').replace(/\s+/g, ' ').trim().slice(0, 60),
        })),
    }
  })
}

const report = {
  headHint: 'ui-deep-S6-S9',
  base: BASE,
  startedAt: new Date().toISOString(),
  steps: {},
  consoleErrors: [],
}

const browser = await chromium.launch({ headless: true })
const context = await browser.newContext({
  viewport: { width: 1440, height: 900 },
  deviceScaleFactor: 1,
})
const page = await context.newPage()

page.on('console', (msg) => {
  if (msg.type() !== 'error') return
  const text = msg.text()
  if (isWhitelisted(text)) return
  report.consoleErrors.push({ step: report._cur || '?', text: text.slice(0, 300) })
})
page.on('pageerror', (err) => {
  report.consoleErrors.push({
    step: report._cur || '?',
    text: `pageerror: ${String(err.message || err).slice(0, 300)}`,
  })
})

// ═══════════════ S6 · 会话列表 + 待确认筛选 segmented ═══════════════
report._cur = 'S6'
await page.goto(`${BASE}/agent/sessions`, { waitUntil: 'networkidle', timeout: 60000 })
await page.waitForTimeout(700)

const s6ProbeAll = await page.evaluate(() => {
  const group = document.querySelector('[role="group"][aria-label="会话状态筛选"], [aria-label="会话状态筛选"]')
  const buttons = group
    ? [...group.querySelectorAll('button')].map((b) => ({
        text: (b.innerText || '').replace(/\s+/g, ' ').trim(),
        pressed: b.getAttribute('aria-pressed'),
        disabled: !!b.disabled,
        box: (() => {
          const r = b.getBoundingClientRect()
          return { w: Math.round(r.width), h: Math.round(r.height), x: Math.round(r.x), y: Math.round(r.y) }
        })(),
        cs: (() => {
          const c = getComputedStyle(b)
          return {
            fontSize: c.fontSize,
            fontWeight: c.fontWeight,
            radius: c.borderRadius,
            bg: c.backgroundColor,
            color: c.color,
            border: c.border,
          }
        })(),
      }))
    : []
  const listItems = [
    ...document.querySelectorAll(
      '[data-testid="browse-sidebar-compact"] a, aside a[href*="/sessions/"], [data-testid*="session-row"], [class*="session"] a',
    ),
  ]
  const rows = listItems
    .filter((a) => /\/agent\/sessions\//.test(a.getAttribute('href') || ''))
    .slice(0, 12)
    .map((a) => {
      const r = a.getBoundingClientRect()
      return {
        text: (a.innerText || '').replace(/\s+/g, ' ').trim().slice(0, 80),
        href: a.getAttribute('href'),
        h: Math.round(r.height),
        w: Math.round(r.width),
      }
    })
  const urlHasFilter = /filter=/.test(location.search)
  const counts = {
    all: buttons.find((b) => /全部/.test(b.text))?.text || null,
    needs: buttons.find((b) => /待确认/.test(b.text))?.text || null,
    running: buttons.find((b) => /进行中/.test(b.text))?.text || null,
  }
  // segmented visual cohesion: heights equal?
  const heights = buttons.map((b) => b.box.h)
  const heightConsistent = heights.length > 0 && heights.every((h) => h === heights[0])
  const gapish = (() => {
    if (buttons.length < 2) return null
    const g0 = buttons[1].box.x - (buttons[0].box.x + buttons[0].box.w)
    return g0
  })()
  return {
    url: location.href,
    hasGroup: !!group,
    groupLabel: group?.getAttribute('aria-label') || null,
    buttons,
    counts,
    rowCount: rows.length,
    rows,
    urlHasFilter,
    heightConsistent,
    segmentGapPx: gapish,
    sideNav: !!document.querySelector('[data-testid="agent-side-nav"]'),
  }
})
await shot(page, OUT.S6, 'S6-sessions-all.png')
const segLoc = page.locator('[aria-label="会话状态筛选"]').first()
if (await segLoc.count()) {
  await segLoc.screenshot({ path: path.join(OUT.S6, 'S6-segmented-closeup.png') }).catch(() => {})
}

// Click 待确认
const needsBtn = page.getByRole('group', { name: '会话状态筛选' }).getByRole('button', { name: /待确认/ })
await needsBtn.click()
await page.waitForTimeout(500)
const s6Needs = await page.evaluate(() => {
  const group = document.querySelector('[aria-label="会话状态筛选"]')
  const buttons = group
    ? [...group.querySelectorAll('button')].map((b) => ({
        text: (b.innerText || '').replace(/\s+/g, ' ').trim(),
        pressed: b.getAttribute('aria-pressed'),
      }))
    : []
  const pressed = buttons.find((b) => b.pressed === 'true')
  const rows = [...document.querySelectorAll('a[href*="/sessions/"]')]
    .filter((a) => /\/agent\/sessions\/[^/?]+/.test(a.getAttribute('href') || ''))
    .map((a) => (a.innerText || '').replace(/\s+/g, ' ').trim().slice(0, 60))
    .slice(0, 10)
  return {
    url: location.href,
    filterParam: new URL(location.href).searchParams.get('filter'),
    pressedText: pressed?.text || null,
    buttons,
    rowCount: rows.length,
    rows,
  }
})
await shot(page, OUT.S6, 'S6-sessions-needs.png')

// Click 进行中 then 全部
const runningBtn = page.getByRole('group', { name: '会话状态筛选' }).getByRole('button', { name: /进行中/ })
await runningBtn.click()
await page.waitForTimeout(400)
const s6Running = await page.evaluate(() => ({
  url: location.href,
  filter: new URL(location.href).searchParams.get('filter'),
  pressed: [...document.querySelectorAll('[aria-label="会话状态筛选"] button')]
    .filter((b) => b.getAttribute('aria-pressed') === 'true')
    .map((b) => (b.innerText || '').trim()),
}))
await shot(page, OUT.S6, 'S6-sessions-running.png')

const allBtn = page.getByRole('group', { name: '会话状态筛选' }).getByRole('button', { name: /全部/ })
await allBtn.click()
await page.waitForTimeout(300)

const s6Gates = await hardGates(page)
const s6Ui = await uiMetrics(page)

// a11y: segmented keyboard / role
const s6A11y = await page.evaluate(() => {
  const group = document.querySelector('[aria-label="会话状态筛选"]')
  if (!group) return { ok: false }
  const role = group.getAttribute('role')
  const btns = [...group.querySelectorAll('button')]
  const allHavePressed = btns.every((b) => b.hasAttribute('aria-pressed'))
  const singlePressed = btns.filter((b) => b.getAttribute('aria-pressed') === 'true').length === 1
  // hit area >= 32?
  const minH = Math.min(...btns.map((b) => b.getBoundingClientRect().height))
  const minW = Math.min(...btns.map((b) => b.getBoundingClientRect().width))
  // tabular count?
  const countEls = [...group.querySelectorAll('*')].filter((el) => /\d/.test(el.textContent || '') && el.children.length === 0)
  const tabular = countEls.slice(0, 3).map((el) => getComputedStyle(el).fontVariantNumeric)
  return {
    ok: true,
    role,
    allHavePressed,
    singlePressed,
    minH: Math.round(minH),
    minW: Math.round(minW),
    tabularSample: tabular,
    btnCount: btns.length,
  }
})

const s6Biz = s6ProbeAll.hasGroup && s6ProbeAll.buttons.length >= 3 && s6Needs.pressedText?.includes('待确认')
const s6Page = /\/agent\/sessions/.test(s6ProbeAll.url) && s6ProbeAll.sideNav
const s6GatesOk = hardOk(s6Gates)

report.steps.S6 = {
  all: s6ProbeAll,
  needs: s6Needs,
  running: s6Running,
  a11y: s6A11y,
  ui: s6Ui,
  gates: s6Gates,
  evidence: [
    'docs/ui-polish/agent-stepwise-ui/S6/S6-sessions-all.png',
    fs.existsSync(path.join(OUT.S6, 'S6-segmented-closeup.png'))
      ? 'docs/ui-polish/agent-stepwise-ui/S6/S6-segmented-closeup.png'
      : null,
    'docs/ui-polish/agent-stepwise-ui/S6/S6-sessions-needs.png',
    'docs/ui-polish/agent-stepwise-ui/S6/S6-sessions-running.png',
  ].filter(Boolean),
  checks: { bizLogic: s6Biz, pageLogic: s6Page, hardOk: s6GatesOk },
}
fs.writeFileSync(path.join(OUT.S6, '_probe.json'), JSON.stringify(report.steps.S6, null, 2))
console.log('S6', JSON.stringify({ biz: s6Biz, page: s6Page, hard: s6GatesOk, a11y: s6A11y, filterNeeds: s6Needs.filterParam, filterRun: s6Running.filter }))

// ═══════════════ S7 · Catalog /agent/agents ═══════════════
report._cur = 'S7'
await page.goto(`${BASE}/agent/agents`, { waitUntil: 'networkidle', timeout: 60000 })
await page.waitForTimeout(700)

const s7Probe = await page.evaluate((names) => {
  const headings = [...document.querySelectorAll('h1,h2,h3,h4')]
    .map((h) => ({
      level: h.tagName,
      text: (h.innerText || '').replace(/\s+/g, ' ').trim(),
      box: (() => {
        const r = h.getBoundingClientRect()
        return { w: Math.round(r.width), h: Math.round(r.height), top: Math.round(r.top) }
      })(),
    }))
    .filter((h) => h.text)
  const found = names.filter((n) => headings.some((h) => h.text.includes(n)))
  const missing = names.filter((n) => !found.includes(n))
  // cards
  const cards = [...document.querySelectorAll('[class*="card"], [data-testid*="agent"], article, a')]
    .filter((el) => {
      const t = (el.innerText || '').replace(/\s+/g, ' ')
      return names.some((n) => t.includes(n)) && el.getBoundingClientRect().height > 40
    })
    .slice(0, 12)
    .map((el) => {
      const r = el.getBoundingClientRect()
      const cs = getComputedStyle(el)
      return {
        tag: el.tagName.toLowerCase(),
        href: el.getAttribute('href'),
        text: (el.innerText || '').replace(/\s+/g, ' ').trim().slice(0, 100),
        w: Math.round(r.width),
        h: Math.round(r.height),
        radius: cs.borderRadius,
        bg: cs.backgroundColor,
      }
    })
  // dedupe by text prefix
  const seen = new Set()
  const uniqueCards = cards.filter((c) => {
    const k = c.text.slice(0, 20)
    if (seen.has(k)) return false
    seen.add(k)
    return true
  })
  // grid consistency
  const widths = uniqueCards.map((c) => c.w)
  const widthSpread = widths.length ? Math.max(...widths) - Math.min(...widths) : 0
  const radii = uniqueCards.map((c) => c.radius)
  return {
    url: location.href,
    headings: headings.slice(0, 24),
    found,
    missing,
    cardCount: uniqueCards.length,
    cards: uniqueCards,
    widthSpread,
    radiiSample: radii.slice(0, 5),
    pageTitle: (document.querySelector('h1')?.innerText || '').trim(),
  }
}, CATALOG_NAMES)

await shot(page, OUT.S7, 'S7-catalog.png', true)
await shot(page, OUT.S7, 'S7-catalog-viewport.png', false)

// Soft interact: hover first card-like
const firstCard = page.getByRole('heading', { name: /调研检索|OA|交底/ }).first()
if (await firstCard.isVisible().catch(() => false)) {
  await firstCard.hover().catch(() => {})
  await page.waitForTimeout(200)
  await shot(page, OUT.S7, 'S7-catalog-hover.png')
}

const s7Gates = await hardGates(page)
const s7Ui = await uiMetrics(page)
const s7Biz = s7Probe.missing.length === 0 && s7Probe.found.length >= 9
const s7Page = /\/agent\/agents/.test(s7Probe.url)
const s7GatesOk = hardOk(s7Gates)

report.steps.S7 = {
  probe: s7Probe,
  ui: s7Ui,
  gates: s7Gates,
  evidence: [
    'docs/ui-polish/agent-stepwise-ui/S7/S7-catalog.png',
    'docs/ui-polish/agent-stepwise-ui/S7/S7-catalog-viewport.png',
    fs.existsSync(path.join(OUT.S7, 'S7-catalog-hover.png'))
      ? 'docs/ui-polish/agent-stepwise-ui/S7/S7-catalog-hover.png'
      : null,
  ].filter(Boolean),
  checks: { bizLogic: s7Biz, pageLogic: s7Page, hardOk: s7GatesOk },
}
fs.writeFileSync(path.join(OUT.S7, '_probe.json'), JSON.stringify(report.steps.S7, null, 2))
console.log('S7', JSON.stringify({ biz: s7Biz, page: s7Page, hard: s7GatesOk, found: s7Probe.found.length, missing: s7Probe.missing, cards: s7Probe.cardCount, spread: s7Probe.widthSpread }))

// ═══════════════ S8 · 项目 general · 无专利步骤 ═══════════════
report._cur = 'S8'
await page.goto(`${BASE}/agent/projects`, { waitUntil: 'networkidle', timeout: 60000 })
await page.waitForTimeout(600)

await shot(page, OUT.S8, 'S8-projects-list.png')

const s8Form = await page.evaluate(() => {
  const radios = [...document.querySelectorAll('input[type="radio"], [role="radio"]')].map((el) => ({
    name: el.getAttribute('name') || el.getAttribute('aria-label') || '',
    value: el.getAttribute('value') || '',
    label: (() => {
      const id = el.id
      const lab = id ? document.querySelector(`label[for="${id}"]`) : el.closest('label')
      return (lab?.innerText || el.parentElement?.innerText || '').replace(/\s+/g, ' ').trim().slice(0, 80)
    })(),
    checked: el.checked || el.getAttribute('aria-checked') === 'true',
  }))
  const titleInput = document.querySelector('#project-title, [name="title"], input[aria-label*="标题"], label')
  const hint = /通用项目无专利步骤|无专利步骤/.test(document.body.innerText || '')
  return {
    url: location.href,
    radios,
    hint,
    heading: (document.querySelector('h1,h2')?.innerText || '').trim().slice(0, 40),
  }
})

const generalRadio = page.getByRole('radio', { name: /通用/ })
await generalRadio.check()
await page.waitForTimeout(200)
const title = `UI走查 general S8 ${Date.now()}`
await page.getByLabel('项目标题').fill(title)
await shot(page, OUT.S8, 'S8-create-general-form.png')
await page.getByTestId('project-create-submit').click()
await page.waitForURL(/\/agent\/projects\/[^/]+/, { timeout: 15000 })
await page.waitForTimeout(800)

const s8Probe = await page.evaluate(() => {
  const noPatent = document.querySelector('[data-testid="general-no-patent-steps"]')
  const stepBar = document.querySelector('[data-testid="domain-step-bar"]')
  const orch = document.querySelector('[data-testid="project-chat-general-orchestrator"]')
  const fto = /FTO|权利要求 HITL|专利步骤/.test(
    (document.querySelector('main')?.innerText || document.body.innerText || '').slice(0, 2000),
  )
  const noPatentText = noPatent ? (noPatent.innerText || '').replace(/\s+/g, ' ').trim() : null
  const bots = [...document.querySelectorAll('[data-testid^="project-bot-"]')].map((el) => ({
    id: el.getAttribute('data-testid'),
    text: (el.innerText || '').replace(/\s+/g, ' ').trim().slice(0, 40),
  }))
  return {
    url: location.href,
    hasNoPatent: !!noPatent,
    noPatentText,
    domainStepBar: !!stepBar,
    hasOrch: !!orch,
    ftoIshInMain: fto && !noPatent, // only flag if no explicit no-patent landmark
    bots,
    orchBox: orch
      ? (() => {
          const r = orch.getBoundingClientRect()
          return { w: Math.round(r.width), h: Math.round(r.height), top: Math.round(r.top) }
        })()
      : null,
  }
})
await shot(page, OUT.S8, 'S8-general-project.png', true)
if (await page.locator('[data-testid="general-no-patent-steps"]').count()) {
  await page.locator('[data-testid="general-no-patent-steps"]').screenshot({
    path: path.join(OUT.S8, 'S8-no-patent-badge.png'),
  }).catch(() => {})
}
const orchLoc = page.locator('[data-testid="project-chat-general-orchestrator"]').first()
if (await orchLoc.count()) {
  await orchLoc.screenshot({ path: path.join(OUT.S8, 'S8-orch-closeup.png') }).catch(() => {})
}

const s8Gates = await hardGates(page)
const s8Ui = await uiMetrics(page)
const s8Biz = s8Probe.hasNoPatent && !s8Probe.domainStepBar && s8Probe.hasOrch
const s8Page = /\/agent\/projects\/[^/]+/.test(s8Probe.url) && !/\/bots\//.test(s8Probe.url)
const s8GatesOk = hardOk(s8Gates)

report.steps.S8 = {
  form: s8Form,
  probe: s8Probe,
  ui: s8Ui,
  gates: s8Gates,
  evidence: [
    'docs/ui-polish/agent-stepwise-ui/S8/S8-projects-list.png',
    'docs/ui-polish/agent-stepwise-ui/S8/S8-create-general-form.png',
    'docs/ui-polish/agent-stepwise-ui/S8/S8-general-project.png',
    fs.existsSync(path.join(OUT.S8, 'S8-no-patent-badge.png'))
      ? 'docs/ui-polish/agent-stepwise-ui/S8/S8-no-patent-badge.png'
      : null,
    fs.existsSync(path.join(OUT.S8, 'S8-orch-closeup.png'))
      ? 'docs/ui-polish/agent-stepwise-ui/S8/S8-orch-closeup.png'
      : null,
  ].filter(Boolean),
  checks: { bizLogic: s8Biz, pageLogic: s8Page, hardOk: s8GatesOk },
}
fs.writeFileSync(path.join(OUT.S8, '_probe.json'), JSON.stringify(report.steps.S8, null, 2))
console.log('S8', JSON.stringify({ biz: s8Biz, page: s8Page, hard: s8GatesOk, noPatent: s8Probe.hasNoPatent, stepBar: s8Probe.domainStepBar }))

// ═══════════════ S9 · domain/patent + 专家私聊 ═══════════════
report._cur = 'S9'
await page.goto(`${BASE}/agent/projects`, { waitUntil: 'networkidle', timeout: 60000 })
await page.waitForTimeout(500)

const domainRadio = page.getByRole('radio', { name: /领域包/ })
await domainRadio.check()
await page.waitForTimeout(200)
const packSelect = page.locator('select').filter({ has: page.locator('option[value="patent"]') })
if ((await packSelect.count()) > 0) {
  await packSelect.first().selectOption('patent')
}
const title9 = `UI走查 patent S9 ${Date.now()}`
await page.getByLabel('项目标题').fill(title9)
await shot(page, OUT.S9, 'S9-create-patent-form.png')
await page.getByTestId('project-create-submit').click()
await page.waitForURL(/\/agent\/projects\/[^/]+$/, { timeout: 15000 })
await page.waitForTimeout(900)

const projectUrl = page.url()
const projectId = projectUrl.split('/').pop()

const s9Orch = await page.evaluate(() => {
  const orch = document.querySelector('[data-testid="project-chat-orchestrator"]')
  const stepBar = document.querySelector('[data-testid="domain-step-bar"]')
  const noPatent = document.querySelector('[data-testid="general-no-patent-steps"]')
  const stepText = stepBar ? (stepBar.innerText || '').replace(/\s+/g, ' ').trim() : null
  const orchText = orch
    ? (orch.innerText || orch.parentElement?.innerText || '').replace(/\s+/g, ' ').trim().slice(0, 400)
    : ''
  const bots = [...document.querySelectorAll('[data-testid^="project-bot-"]')].map((el) => {
    const r = el.getBoundingClientRect()
    return {
      id: el.getAttribute('data-testid'),
      text: (el.innerText || '').replace(/\s+/g, ' ').trim().slice(0, 50),
      h: Math.round(r.height),
      selected: el.getAttribute('aria-current') || el.classList.contains('active') || null,
    }
  })
  const steps = stepBar
    ? [...stepBar.querySelectorAll('button, a, [role="listitem"], li, span')]
        .map((el) => (el.innerText || '').replace(/\s+/g, ' ').trim())
        .filter((t) => t.length > 0 && t.length < 40)
        .slice(0, 16)
    : []
  return {
    url: location.href,
    hasOrch: !!orch,
    hasStepBar: !!stepBar,
    hasNoPatent: !!noPatent,
    stepText: stepText?.slice(0, 200) || null,
    steps,
    orchSnippet: orchText,
    orchHasMock: /总控|分派|mock|编排/.test(orchText),
    bots,
  }
})
await shot(page, OUT.S9, 'S9-patent-orchestrator.png', true)
if (await page.locator('[data-testid="domain-step-bar"]').count()) {
  await page.locator('[data-testid="domain-step-bar"]').screenshot({
    path: path.join(OUT.S9, 'S9-domain-step-bar.png'),
  }).catch(() => {})
}

// Expert DM
const searchBot = page.getByTestId('project-bot-search')
const expertSearch = page.getByTestId('project-bot-expert-search')
let expertId = null
if ((await expertSearch.count()) > 0) {
  await expertSearch.click()
  expertId = 'expert-search'
} else if ((await searchBot.count()) > 0) {
  await searchBot.click()
  expertId = 'search'
} else {
  const any = page.locator('[data-testid^="project-bot-"]:not([data-testid="project-bot-orchestrator"])').first()
  if ((await any.count()) > 0) {
    expertId = ((await any.getAttribute('data-testid')) || '').replace('project-bot-', '')
    await any.click()
  }
}

if (expertId) {
  await page.waitForURL(new RegExp(`/agent/projects/${projectId}/bots/`), { timeout: 10000 }).catch(() => {})
  await page.waitForTimeout(700)
}

const s9Expert = await page.evaluate((eid) => {
  const chat = document.querySelector(`[data-testid="project-chat-${eid}"]`) ||
    document.querySelector('[data-testid^="project-chat-"]')
  const stepBar = document.querySelector('[data-testid="domain-step-bar"]')
  const header = chat ? (chat.innerText || '').replace(/\s+/g, ' ').trim().slice(0, 200) : ''
  const bodyText = (document.querySelector('main')?.innerText || '').replace(/\s+/g, ' ').trim().slice(0, 500)
  const isOrchestratorLabel = /^总控/.test(header) || /总控编排/.test(header)
  return {
    url: location.href,
    expertId: eid,
    hasChat: !!chat,
    hasStepBar: !!stepBar,
    headerSnippet: header,
    bodySnippet: bodyText.slice(0, 300),
    looksLikeExpert: !isOrchestratorLabel && /专家|检索|FTO|起草|草拟|现有技术/.test(header + bodyText),
    notOrchestratorCopy: !isOrchestratorLabel,
  }
}, expertId || 'unknown')

await shot(page, OUT.S9, 'S9-patent-expert.png', true)
const expertChatLoc = page.locator(`[data-testid="project-chat-${expertId}"]`).first()
if (expertId && (await expertChatLoc.count())) {
  await expertChatLoc.screenshot({ path: path.join(OUT.S9, 'S9-expert-chat-closeup.png') }).catch(() => {})
}
// sidebar bots closeup
const botNav = page.locator('[data-testid^="project-bot-"]').first()
if (await botNav.count()) {
  // try parent nav
  await page.locator('aside, [class*="sidebar"], nav').last().screenshot({
    path: path.join(OUT.S9, 'S9-bot-sidebar.png'),
  }).catch(() => {})
}

const s9Gates = await hardGates(page)
const s9Ui = await uiMetrics(page)
const s9Biz =
  s9Orch.hasOrch &&
  s9Orch.hasStepBar &&
  !s9Orch.hasNoPatent &&
  !!expertId &&
  s9Expert.hasChat &&
  s9Expert.notOrchestratorCopy
const s9Page = /\/bots\//.test(s9Expert.url) && s9Expert.hasStepBar
const s9GatesOk = hardOk(s9Gates)

report.steps.S9 = {
  orch: s9Orch,
  expert: s9Expert,
  expertId,
  projectId,
  ui: s9Ui,
  gates: s9Gates,
  evidence: [
    'docs/ui-polish/agent-stepwise-ui/S9/S9-create-patent-form.png',
    'docs/ui-polish/agent-stepwise-ui/S9/S9-patent-orchestrator.png',
    fs.existsSync(path.join(OUT.S9, 'S9-domain-step-bar.png'))
      ? 'docs/ui-polish/agent-stepwise-ui/S9/S9-domain-step-bar.png'
      : null,
    'docs/ui-polish/agent-stepwise-ui/S9/S9-patent-expert.png',
    fs.existsSync(path.join(OUT.S9, 'S9-expert-chat-closeup.png'))
      ? 'docs/ui-polish/agent-stepwise-ui/S9/S9-expert-chat-closeup.png'
      : null,
    fs.existsSync(path.join(OUT.S9, 'S9-bot-sidebar.png'))
      ? 'docs/ui-polish/agent-stepwise-ui/S9/S9-bot-sidebar.png'
      : null,
  ].filter(Boolean),
  checks: { bizLogic: s9Biz, pageLogic: s9Page, hardOk: s9GatesOk },
}
fs.writeFileSync(path.join(OUT.S9, '_probe.json'), JSON.stringify(report.steps.S9, null, 2))
console.log('S9', JSON.stringify({ biz: s9Biz, page: s9Page, hard: s9GatesOk, expertId, stepBar: s9Orch.hasStepBar, header: s9Expert.headerSnippet?.slice(0, 60) }))

report.finishedAt = new Date().toISOString()
report.consoleErrors = report.consoleErrors.filter(
  (e, i, arr) => arr.findIndex((x) => x.text === e.text && x.step === e.step) === i,
)
delete report._cur

fs.writeFileSync(path.join(ROOT, '_walk_s6_s9_report.json'), JSON.stringify(report, null, 2))
console.log('CONSOLE', report.consoleErrors.length)
console.log('DONE')
await browser.close()
