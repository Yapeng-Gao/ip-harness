/**
 * Agent stepwise walk S0–S2 only · 2026-09-19
 * Evidence-only; does not change product code.
 * Base: http://127.0.0.1:5175
 */
import { chromium } from 'playwright'
import fs from 'node:fs'
import path from 'node:path'

const BASE = 'http://127.0.0.1:5175'
const ROOT = '/workspace/ip-harness/docs/ui-polish/agent-stepwise-ui'
const OUT = {
  S0: path.join(ROOT, 'S0'),
  S1: path.join(ROOT, 'S1'),
  S2: path.join(ROOT, 'S2'),
}
for (const d of Object.values(OUT)) fs.mkdirSync(d, { recursive: true })

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

function visible(el) {
  const r = el.getBoundingClientRect()
  const s = getComputedStyle(el)
  return (
    r.width > 0 &&
    r.height > 0 &&
    s.visibility !== 'hidden' &&
    s.display !== 'none' &&
    parseFloat(s.opacity || '1') > 0.05
  )
}

async function shot(page, dir, name) {
  const p = path.join(dir, name)
  await page.screenshot({ path: p, fullPage: false })
  return p.replace('/workspace/ip-harness/', '')
}

async function hardGates(page) {
  return page.evaluate(() => {
    const body = document.body?.innerText || ''
    const hrefs = [...document.querySelectorAll('a[href]')].map((a) => a.getAttribute('href') || '')
    const midDeep = hrefs.filter(
      (h) =>
        /:5173\b/.test(h) ||
        /^https?:\/\/[^/]*5173/.test(h) ||
        /localhost:5173|127\.0\.0\.1:5173/.test(h),
    )
    // mid path CTAs that look like product deep links (exclude internal docs)
    const midCtaText = [...document.querySelectorAll('a, button')].filter((el) => {
      const t = (el.innerText || el.getAttribute('aria-label') || '').replace(/\s+/g, ' ')
      const h = el.getAttribute('href') || ''
      return /回中台|运营 Inbox|作业中台打开|打开费用中心|在运营/.test(t) || /:5173/.test(h)
    }).map((el) => ({
      text: (el.innerText || '').replace(/\s+/g, ' ').trim().slice(0, 60),
      href: el.getAttribute('href') || '',
    }))

    const bannerEl = document.querySelector('[data-billing-hold-banner]')
    let billingBanner = null
    if (bannerEl) {
      const r = bannerEl.getBoundingClientRect()
      const style = getComputedStyle(bannerEl)
      billingBanner = {
        variant: bannerEl.getAttribute('data-billing-hold-banner'),
        text: (bannerEl.textContent || '').replace(/\s+/g, ' ').trim().slice(0, 160),
        w: Math.round(r.width),
        h: Math.round(r.height),
        top: Math.round(r.top),
        visible: !!(bannerEl.offsetWidth || bannerEl.offsetHeight || bannerEl.getClientRects().length),
        display: style.display,
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
        const amber = R > 240 && G > 180 && G < 240 && B < 180
        if (!amber) return false
        const txt = (el.textContent || '').replace(/\s+/g, ' ').trim()
        return /不停审|仅提示|BillingHold|欠票|停权|欠费/.test(txt)
      })
      .slice(0, 6)
      .map((el) => {
        const r = el.getBoundingClientRect()
        return {
          text: (el.textContent || '').replace(/\s+/g, ' ').trim().slice(0, 100),
          w: Math.round(r.width),
          h: Math.round(r.height),
          top: Math.round(r.top),
        }
      })

    const caseBindRoots = document.querySelectorAll('[data-testid="home-case-bind"]').length
    const caseBindControls = document.querySelectorAll('[data-testid="case-bind-controls"]').length
    const associateSelect = document.querySelectorAll('select[aria-label="关联案件"]').length
    const associateLabel = [...document.querySelectorAll('label, span')].filter((el) =>
      /^关联案件$/.test((el.textContent || '').trim()),
    ).length

    return {
      midDeep,
      midCtaText,
      billingBanner,
      amberFullWidth,
      caseEntry: {
        homeCaseBind: caseBindRoots,
        caseBindControls,
        associateSelect,
        associateLabel,
        single: caseBindRoots === 1 && caseBindControls === 1 && associateSelect === 0,
      },
      hasForbiddenMidText: /回中台|在运营 Inbox|在作业中台打开/.test(body),
    }
  })
}

const report = {
  head: '1fb148255e7757295e45d07327f08768c883e81d',
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
  report.consoleErrors.push({ step: report._currentStep || '?', text: text.slice(0, 300) })
})
page.on('pageerror', (err) => {
  report.consoleErrors.push({
    step: report._currentStep || '?',
    text: `pageerror: ${String(err.message || err).slice(0, 300)}`,
  })
})

// ───────────── S0 ─────────────
report._currentStep = 'S0'
await page.goto(`${BASE}/agent`, { waitUntil: 'networkidle', timeout: 60000 })
await page.waitForTimeout(900)

const s0Probe = await page.evaluate(() => {
  const vis = (el) => {
    const r = el.getBoundingClientRect()
    const s = getComputedStyle(el)
    return r.width > 0 && r.height > 0 && s.visibility !== 'hidden' && s.display !== 'none'
  }
  const aside =
    document.querySelector('aside') ||
    document.querySelector('[class*="sidebar"]') ||
    document.querySelector('nav')
  const navLinks = aside
    ? [...aside.querySelectorAll('a, button')].filter(vis).map((el) => ({
        text: (el.innerText || '').replace(/\s+/g, ' ').trim().slice(0, 40),
        href: el.getAttribute('href') || '',
      }))
    : []
  const verticalNav =
    !!aside &&
    aside.getBoundingClientRect().width < 360 &&
    aside.getBoundingClientRect().left < 80

  const chip = [...document.querySelectorAll('a, button')].find((el) => {
    if (!vis(el)) return false
    const t = (el.innerText || '').replace(/\s+/g, ' ')
    const h = el.getAttribute('href') || ''
    return /待确认/.test(t) || h.includes('filter=needs_human')
  })

  const compose =
    !!document.querySelector('textarea[aria-label="办理目标"]') ||
    !!document.querySelector('textarea')
  const startBtn = document.querySelector('[data-testid="home-send"]')
  const startText = startBtn ? (startBtn.innerText || '').trim() : ''
  const homeCaseBind = document.querySelectorAll('[data-testid="home-case-bind"]').length
  const caseBindControls = document.querySelectorAll('[data-testid="case-bind-controls"]').length
  const createBind = !!document.querySelector('[data-testid="case-create-bind"]')
  const bindExisting = !!document.querySelector('[data-testid="case-bind-existing"]')
  const associateSelect = document.querySelectorAll('select[aria-label="关联案件"]').length
  const softHint = /也可先开始办理/.test(document.body.innerText || '')
  const url = location.href

  return {
    url,
    verticalNav,
    asideW: aside ? Math.round(aside.getBoundingClientRect().width) : 0,
    navLinks: navLinks.slice(0, 16),
    needsHumanChip: chip
      ? {
          text: (chip.innerText || '').replace(/\s+/g, ' ').trim().slice(0, 40),
          href: chip.getAttribute('href') || '',
        }
      : null,
    compose,
    startText,
    homeCaseBind,
    caseBindControls,
    createBind,
    bindExisting,
    associateSelect,
    softHint,
  }
})

const s0Gates = await hardGates(page)
const s0Shot1 = await shot(page, OUT.S0, 'S0-home.png')
// closeup of case bind + compose
const caseBind = page.locator('[data-testid="home-case-bind"]')
if (await caseBind.count()) {
  await caseBind.screenshot({ path: path.join(OUT.S0, 'S0-case-bind-closeup.png') }).catch(() => {})
}
const composeEl = page.locator('textarea[aria-label="办理目标"]').first()
if (await composeEl.count()) {
  await page.locator('.rounded-\\[var\\(--radius-xl\\)\\]').first().screenshot({
    path: path.join(OUT.S0, 'S0-compose.png'),
  }).catch(async () => {
    await shot(page, OUT.S0, 'S0-compose-fallback.png')
  })
}

const s0Evidence = [
  s0Shot1,
  fs.existsSync(path.join(OUT.S0, 'S0-case-bind-closeup.png'))
    ? 'docs/ui-polish/agent-stepwise-ui/S0/S0-case-bind-closeup.png'
    : null,
  fs.existsSync(path.join(OUT.S0, 'S0-compose.png'))
    ? 'docs/ui-polish/agent-stepwise-ui/S0/S0-compose.png'
    : fs.existsSync(path.join(OUT.S0, 'S0-compose-fallback.png'))
      ? 'docs/ui-polish/agent-stepwise-ui/S0/S0-compose-fallback.png'
      : null,
].filter(Boolean)

const s0BizLogic =
  s0Probe.compose &&
  /开始办理|试用/.test(s0Probe.startText) &&
  s0Probe.homeCaseBind === 1 &&
  s0Probe.caseBindControls === 1 &&
  s0Probe.associateSelect === 0
const s0PageLogic =
  s0Probe.verticalNav && !!s0Probe.needsHumanChip && s0Gates.caseEntry.single
const s0HardOk =
  s0Gates.midDeep.length === 0 &&
  !s0Gates.billingBanner?.visible &&
  s0Gates.amberFullWidth.length === 0 &&
  s0Gates.caseEntry.single

report.steps.S0 = {
  probe: s0Probe,
  gates: s0Gates,
  evidence: s0Evidence,
  checks: {
    bizLogic: s0BizLogic,
    pageLogic: s0PageLogic,
    hardGates: s0HardOk,
  },
}

fs.writeFileSync(path.join(OUT.S0, '_probe.json'), JSON.stringify(report.steps.S0, null, 2))
console.log('S0 done', JSON.stringify({ biz: s0BizLogic, page: s0PageLogic, hard: s0HardOk }))

// ───────────── S1 (optional create+bind) ─────────────
report._currentStep = 'S1'
// Ensure unbound first
const unbind = page.locator('[data-testid="case-unbind"]')
if (await unbind.count()) {
  await unbind.click().catch(() => {})
  await page.waitForTimeout(300)
}

await page.locator('[data-testid="case-create-bind"]').click()
await page.waitForTimeout(400)
const titleInput = page.locator('[data-testid="case-create-title"]')
const titleVisible = await titleInput.isVisible().catch(() => false)
if (titleVisible) {
  await titleInput.fill('走查S1新案-' + Date.now().toString().slice(-6))
}
await page.locator('[data-testid="case-create-confirm"]').click()
await page.waitForTimeout(700)

const s1Probe = await page.evaluate(() => {
  const current = document.querySelector('[data-testid="case-bind-current"]')
  const caseIdText = current ? (current.textContent || '').replace(/\s+/g, ' ').trim() : ''
  const unbind = !!document.querySelector('[data-testid="case-unbind"]')
  const start = document.querySelector('[data-testid="home-send"]')
  const startEnabled = start ? !start.disabled : false
  const startText = start ? (start.innerText || '').trim() : ''
  // URL may carry ?case=
  const urlCase = new URL(location.href).searchParams.get('case')
  const homeCaseBind = document.querySelectorAll('[data-testid="home-case-bind"]').length
  const associateSelect = document.querySelectorAll('select[aria-label="关联案件"]').length
  return {
    url: location.href,
    caseIdText,
    unbind,
    startEnabled,
    startText,
    urlCase,
    bound: !!caseIdText || !!urlCase || unbind,
    homeCaseBind,
    associateSelect,
    stillSingleEntry: homeCaseBind === 1 && associateSelect === 0,
  }
})

const s1Gates = await hardGates(page)
const s1Shot = await shot(page, OUT.S1, 'S1-bound.png')
if (await caseBind.count()) {
  await caseBind.screenshot({ path: path.join(OUT.S1, 'S1-case-bind-bound.png') }).catch(() => {})
}

const s1BizLogic = s1Probe.bound && s1Probe.startEnabled && /开始办理|试用/.test(s1Probe.startText)
const s1PageLogic = s1Probe.stillSingleEntry && s1Probe.unbind

report.steps.S1 = {
  probe: s1Probe,
  gates: s1Gates,
  evidence: [
    s1Shot,
    fs.existsSync(path.join(OUT.S1, 'S1-case-bind-bound.png'))
      ? 'docs/ui-polish/agent-stepwise-ui/S1/S1-case-bind-bound.png'
      : null,
  ].filter(Boolean),
  checks: { bizLogic: s1BizLogic, pageLogic: s1PageLogic },
}
fs.writeFileSync(path.join(OUT.S1, '_probe.json'), JSON.stringify(report.steps.S1, null, 2))
console.log('S1 done', JSON.stringify({ biz: s1BizLogic, page: s1PageLogic, bound: s1Probe.bound }))

// Unbind for clean S2 (无案点开始办理)
if (await page.locator('[data-testid="case-unbind"]').count()) {
  await page.locator('[data-testid="case-unbind"]').click()
  await page.waitForTimeout(400)
}

// ───────────── S2 ─────────────
report._currentStep = 'S2'
// confirm unbound
const s2Pre = await page.evaluate(() => {
  const unbind = !!document.querySelector('[data-testid="case-unbind"]')
  const current = document.querySelector('[data-testid="case-bind-current"]')
  return {
    unbound: !unbind,
    current: current ? (current.textContent || '').trim().slice(0, 80) : null,
    urlCase: new URL(location.href).searchParams.get('case'),
  }
})
await shot(page, OUT.S2, 'S2-home-unbound.png')

// fill a short goal so session has content, then start
const ta = page.locator('textarea[aria-label="办理目标"]')
if (await ta.count()) {
  await ta.fill('走查S2：无案开始办理，确认进会话且无强制案')
}
await page.locator('[data-testid="home-send"]').click()
await page.waitForTimeout(1200)
// wait for session URL
try {
  await page.waitForURL(/\/agent\/sessions\/[^/]+/, { timeout: 8000 })
} catch {
  /* capture whatever we landed on */
}
await page.waitForTimeout(600)

const s2Probe = await page.evaluate(() => {
  const url = location.href
  const path = location.pathname
  const sessionMatch = path.match(/\/agent\/sessions\/([^/]+)/)
  const sessionId = sessionMatch ? sessionMatch[1] : null
  const body = document.body?.innerText || ''
  // forced case signals
  const mustBindBanner = /须绑定|写回中台前须绑定|请先绑定案件才能开始/.test(body)
  const caseCurrent = document.querySelector('[data-testid="case-bind-current"]')
  const caseBound = !!caseCurrent && !/未绑定|暂无|无案件|可选/.test(caseCurrent.textContent || '')
  const createBind = !!document.querySelector('[data-testid="case-create-bind"]')
  const softOptional =
    /也可|可选|先开始|未绑定|暂未绑定|创建并绑定|绑定已有/.test(body) || createBind
  // mid deep links on session
  const midHrefs = [...document.querySelectorAll('a[href]')]
    .map((a) => a.getAttribute('href') || '')
    .filter((h) => /:5173\b|localhost:5173|127\.0\.0\.1:5173/.test(h))
  return {
    url,
    path,
    sessionId,
    onSession: !!sessionId,
    mustBindBanner,
    caseBound,
    createBind,
    softOptional,
    midHrefs,
    bodySnippet: body.slice(0, 800),
  }
})

const s2Gates = await hardGates(page)
const s2Shot = await shot(page, OUT.S2, 'S2-session.png')
// topbar / case area closeup if present
const header = page.locator('header, [class*="SessionWorkspace"], [data-testid*="case"]').first()
await page.screenshot({ path: path.join(OUT.S2, 'S2-session-full.png'), fullPage: false })

const s2BizLogic =
  s2Probe.onSession && !s2Probe.mustBindBanner && !s2Probe.caseBound
const s2PageLogic = s2Probe.onSession && s2Probe.midHrefs.length === 0

report.steps.S2 = {
  pre: s2Pre,
  probe: s2Probe,
  gates: s2Gates,
  evidence: [
    'docs/ui-polish/agent-stepwise-ui/S2/S2-home-unbound.png',
    s2Shot,
    'docs/ui-polish/agent-stepwise-ui/S2/S2-session-full.png',
  ],
  checks: { bizLogic: s2BizLogic, pageLogic: s2PageLogic },
}
fs.writeFileSync(path.join(OUT.S2, '_probe.json'), JSON.stringify(report.steps.S2, null, 2))
console.log(
  'S2 done',
  JSON.stringify({
    biz: s2BizLogic,
    page: s2PageLogic,
    sessionId: s2Probe.sessionId,
    url: s2Probe.url,
  }),
)

report.finishedAt = new Date().toISOString()
report.consoleErrors = report.consoleErrors.filter(
  (e, i, arr) => arr.findIndex((x) => x.text === e.text && x.step === e.step) === i,
)
delete report._currentStep

fs.writeFileSync(
  path.join(ROOT, '_walk_s0_s2_report.json'),
  JSON.stringify(report, null, 2),
)
fs.writeFileSync(
  '/workspace/ip-harness/docs/ui-polish/agent-stepwise-e2e/_walk_s0_s2_report.json',
  JSON.stringify(report, null, 2),
)

console.log('CONSOLE_ERRORS', report.consoleErrors.length)
console.log('DONE')
await browser.close()
