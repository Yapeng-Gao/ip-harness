/**
 * Agent stepwise walk S3–S5 · 2026-09-19
 * Evidence-only. Base http://127.0.0.1:5175
 */
import { chromium } from 'playwright'
import fs from 'node:fs'
import path from 'node:path'

const BASE = 'http://127.0.0.1:5175'
const ROOT = '/workspace/ip-harness/docs/ui-polish/agent-stepwise-ui'
const E2E = '/workspace/ip-harness/docs/ui-polish/agent-stepwise-e2e'
const OUT = {
  S3: path.join(ROOT, 'S3'),
  S4: path.join(ROOT, 'S4'),
  S5: path.join(ROOT, 'S5'),
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

async function shot(page, dir, name) {
  const p = path.join(dir, name)
  await page.screenshot({ path: p, fullPage: false })
  // also copy into e2e flat for parity
  const flat = path.join(E2E, name)
  fs.copyFileSync(p, flat)
  return p.replace('/workspace/ip-harness/', '')
}

async function hardGates(page) {
  return page.evaluate(() => {
    const hrefs = [...document.querySelectorAll('a[href]')].map((a) => a.getAttribute('href') || '')
    // Agent-surface mid deep links (product CTAs). Cross-app shell may list mid — flag only Agent CTA patterns + :5173 in agent main.
    const main = document.querySelector('#agent-main, main, [data-testid="agent-main"]') || document.body
    const mainHrefs = [...main.querySelectorAll('a[href]')].map((a) => a.getAttribute('href') || '')
    const midDeep = mainHrefs.filter(
      (h) => /:5173\b/.test(h) || /localhost:5173|127\.0\.0\.1:5173/.test(h),
    )
    const midCta = [...document.querySelectorAll('a, button')].filter((el) => {
      const t = (el.innerText || el.getAttribute('aria-label') || '').replace(/\s+/g, ' ')
      const h = el.getAttribute('href') || ''
      return /回中台|运营 Inbox|作业中台打开|打开费用中心|在运营 Inbox/.test(t) || /:5173/.test(h)
    }).map((el) => ({
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
        return { text: (el.textContent || '').replace(/\s+/g, ' ').trim().slice(0, 80), w: Math.round(r.width), h: Math.round(r.height) }
      })
    return {
      midDeep,
      midCta,
      billingBanner,
      amberFullWidth,
      shell5173Count: hrefs.filter((h) => /:5173/.test(h)).length,
    }
  })
}

const report = {
  headHint: 'continue-from-S0-S2',
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

// ═══════════════ S3 · 会话轨迹/回复可见 ═══════════════
report._cur = 'S3'
// Prefer seeded queued session that advances on 启动
await page.goto(`${BASE}/agent/sessions/sess-disclosure-1`, {
  waitUntil: 'networkidle',
  timeout: 60000,
})
await page.waitForTimeout(800)

const s3Before = await page.evaluate(() => {
  const scroller = document.querySelector('[data-testid="session-timeline-scroller"]')
  const steps = scroller
    ? [...scroller.querySelectorAll('[data-testid], .session-step, article, li, [class*="step"], [class*="bubble"], [class*="message"]')]
        .length
    : 0
  const text = scroller ? (scroller.innerText || '').replace(/\s+/g, ' ').trim() : ''
  const startBtn = [...document.querySelectorAll('button')].find((b) =>
    /启动|发送/.test((b.innerText || '').trim()),
  )
  return {
    url: location.href,
    hasScroller: !!scroller,
    stepishCount: steps,
    textLen: text.length,
    textSnippet: text.slice(0, 400),
    hasStart: !!startBtn,
    startText: startBtn ? (startBtn.innerText || '').trim().slice(0, 20) : null,
    startDisabled: startBtn ? !!startBtn.disabled : null,
  }
})
await shot(page, OUT.S3, 'S3-before-start.png')

// Click 启动 to advance mock script
const start = page.getByRole('button', { name: /启动|发送/ }).first()
let started = false
if (await start.isVisible().catch(() => false)) {
  await start.click()
  started = true
  // wait for timeline growth / HITL / new messages
  await page.waitForTimeout(2500)
  // try wait for more content
  try {
    await page.waitForFunction(
      (prevLen) => {
        const sc = document.querySelector('[data-testid="session-timeline-scroller"]')
        const t = sc ? (sc.innerText || '').length : 0
        return t > prevLen + 20 || !!document.querySelector('.confirm-hitl')
      },
      s3Before.textLen,
      { timeout: 20000 },
    )
  } catch {
    /* still capture */
  }
  await page.waitForTimeout(800)
}

const s3After = await page.evaluate(() => {
  const scroller = document.querySelector('[data-testid="session-timeline-scroller"]')
  const text = scroller ? (scroller.innerText || '').replace(/\s+/g, ' ').trim() : ''
  const bubbles = scroller
    ? [...scroller.querySelectorAll('[class*="bubble"], [class*="message"], article, .session-step, [data-role]')]
        .filter((el) => {
          const r = el.getBoundingClientRect()
          return r.width > 40 && r.height > 12
        }).length
    : 0
  const systemOrAgent = /系统|Agent|已|交底|会话|mock|回复|步骤/.test(text)
  const hitl = !!document.querySelector('.confirm-hitl')
  return {
    url: location.href,
    hasScroller: !!scroller,
    textLen: text.length,
    textSnippet: text.slice(0, 600),
    bubbles,
    systemOrAgent,
    hitlVisible: hitl,
  }
})
const s3Gates = await hardGates(page)
const s3Shot = await shot(page, OUT.S3, 'S3-after-advance.png')
// timeline closeup
const scroller = page.locator('[data-testid="session-timeline-scroller"]')
if (await scroller.count()) {
  await scroller.screenshot({ path: path.join(OUT.S3, 'S3-timeline-closeup.png') }).catch(() => {})
}

const s3Advanced =
  started &&
  (s3After.textLen > s3Before.textLen + 10 ||
    s3After.hitlVisible ||
    s3After.bubbles >= 1)
const s3Biz = s3After.hasScroller && (s3Advanced || s3After.textLen > 40)
const s3Page = s3After.hasScroller && /\/agent\/sessions\//.test(s3After.url)

report.steps.S3 = {
  before: s3Before,
  after: s3After,
  started,
  advanced: s3Advanced,
  gates: s3Gates,
  evidence: [
    'docs/ui-polish/agent-stepwise-ui/S3/S3-before-start.png',
    s3Shot,
    fs.existsSync(path.join(OUT.S3, 'S3-timeline-closeup.png'))
      ? 'docs/ui-polish/agent-stepwise-ui/S3/S3-timeline-closeup.png'
      : null,
  ].filter(Boolean),
  checks: { bizLogic: s3Biz, pageLogic: s3Page, hardOk: s3Gates.midDeep.length === 0 && !s3Gates.billingBanner?.visible && s3Gates.amberFullWidth.length === 0 },
}
fs.writeFileSync(path.join(OUT.S3, '_probe.json'), JSON.stringify(report.steps.S3, null, 2))
console.log('S3', JSON.stringify({ biz: s3Biz, page: s3Page, advanced: s3Advanced, before: s3Before.textLen, after: s3After.textLen, hitl: s3After.hitlVisible }))

// ═══════════════ S4 · HITL Confirm ═══════════════
report._cur = 'S4'
await page.goto(`${BASE}/agent/sessions/sess-oa-1?focus=hitl`, {
  waitUntil: 'networkidle',
  timeout: 60000,
})
await page.waitForTimeout(1000)

const s4Probe = await page.evaluate(() => {
  const bar = document.querySelector('.confirm-hitl')
  const dock = document.querySelector('[data-testid="session-bottom-dock"]')
  const barR = bar ? bar.getBoundingClientRect() : null
  const approve = [...document.querySelectorAll('button')].find((b) =>
    /批准策略/.test((b.innerText || '').replace(/\s+/g, ' ')),
  )
  const otherCtas = [...document.querySelectorAll('.confirm-hitl button, [data-testid="session-bottom-dock"] button')]
    .map((b) => (b.innerText || '').replace(/\s+/g, ' ').trim())
    .filter(Boolean)
    .slice(0, 12)
  const disabledReason = (() => {
    const t = document.body.innerText || ''
    const m = t.match(/请先[^。\n]{2,40}|未选[^。\n]{2,40}|禁用[^。\n]{2,40}/)
    return m ? m[0] : null
  })()
  const sticky = dock
    ? getComputedStyle(dock).position === 'sticky' || getComputedStyle(dock).position === 'fixed'
    : false
  const caseTop = document.querySelector('[data-testid="session-case-bind-top"]')
  let caseTopY = null
  let confirmY = null
  if (caseTop) caseTopY = Math.round(caseTop.getBoundingClientRect().top)
  if (bar) confirmY = Math.round(bar.getBoundingClientRect().top)
  const separated =
    caseTop && bar && caseTop.getBoundingClientRect().bottom < bar.getBoundingClientRect().top - 8
  return {
    url: location.href,
    hasConfirm: !!bar,
    hasDock: !!dock,
    barBox: barR
      ? { w: Math.round(barR.width), h: Math.round(barR.height), top: Math.round(barR.top), bottom: Math.round(barR.bottom) }
      : null,
    approveVisible: !!approve,
    approveDisabled: approve ? !!approve.disabled : null,
    approveText: approve ? (approve.innerText || '').trim() : null,
    otherCtas,
    disabledReason,
    sticky,
    caseTopPresent: !!caseTop,
    caseTopY,
    confirmY,
    caseConfirmSeparated: !!separated,
    focusClass: bar ? bar.className.includes('confirm-hitl-focus') || bar.classList.contains('confirm-hitl-focus') : false,
  }
})

const s4Gates = await hardGates(page)
await shot(page, OUT.S4, 'S4-hitl-session.png')
const dockLoc = page.locator('[data-testid="session-bottom-dock"], .confirm-hitl').first()
if (await dockLoc.count()) {
  await dockLoc.screenshot({ path: path.join(OUT.S4, 'S4-confirmbar-closeup.png') }).catch(() => {})
}

// Clickability: try focus/click on a secondary or primary if enabled; prefer fill gate if needed
let clickProbe = { attempted: false }
const approveBtn = page.getByRole('button', { name: /批准策略/ }).first()
if (await approveBtn.isVisible().catch(() => false)) {
  const disabled = await approveBtn.isDisabled().catch(() => true)
  if (!disabled) {
    // Don't fire full domain write — just verify pointer events / hover then leave
    await approveBtn.hover().catch(() => {})
    clickProbe = { attempted: true, kind: 'hover-enabled-approve', disabled: false }
  } else {
    // fill OA gate fields if present then recheck — but do NOT complete approve write
    // verify disabled reason visible = gate correct
    clickProbe = {
      attempted: true,
      kind: 'disabled-with-reason',
      disabled: true,
      reason: s4Probe.disabledReason,
    }
    // Try click a non-destructive control if any (e.g. 退回 preview sheet open?) skip destructive
    const sheetToggle = page.locator('.confirm-hitl button').filter({ hasText: /争点|策略|展开|填写/ }).first()
    if (await sheetToggle.isVisible().catch(() => false)) {
      await sheetToggle.click().catch(() => {})
      await page.waitForTimeout(400)
      clickProbe.sheetOpened = true
      await shot(page, OUT.S4, 'S4-confirm-sheet.png')
    }
  }
}

const s4Biz =
  s4Probe.hasConfirm &&
  s4Probe.approveVisible &&
  (s4Probe.approveDisabled === false || !!s4Probe.disabledReason || s4Probe.otherCtas.length > 0)
const s4Page = s4Probe.hasConfirm && s4Probe.sticky && /sess-oa-1/.test(s4Probe.url)

report.steps.S4 = {
  probe: s4Probe,
  clickProbe,
  gates: s4Gates,
  evidence: [
    'docs/ui-polish/agent-stepwise-ui/S4/S4-hitl-session.png',
    fs.existsSync(path.join(OUT.S4, 'S4-confirmbar-closeup.png'))
      ? 'docs/ui-polish/agent-stepwise-ui/S4/S4-confirmbar-closeup.png'
      : null,
    fs.existsSync(path.join(OUT.S4, 'S4-confirm-sheet.png'))
      ? 'docs/ui-polish/agent-stepwise-ui/S4/S4-confirm-sheet.png'
      : null,
  ].filter(Boolean),
  checks: {
    bizLogic: s4Biz,
    pageLogic: s4Page,
    hardOk: s4Gates.midDeep.length === 0 && !s4Gates.billingBanner?.visible && s4Gates.amberFullWidth.length === 0,
  },
}
fs.writeFileSync(path.join(OUT.S4, '_probe.json'), JSON.stringify(report.steps.S4, null, 2))
console.log('S4', JSON.stringify({ biz: s4Biz, page: s4Page, approve: s4Probe.approveVisible, disabled: s4Probe.approveDisabled, sticky: s4Probe.sticky, separated: s4Probe.caseConfirmSeparated }))

// ═══════════════ S5 · 会话顶栏绑案（先聊后案） ═══════════════
report._cur = 'S5'
// Fresh no-case session from Home
await page.goto(`${BASE}/agent`, { waitUntil: 'networkidle', timeout: 60000 })
await page.waitForTimeout(500)
// ensure unbound
if (await page.locator('[data-testid="case-unbind"]').count()) {
  await page.locator('[data-testid="case-unbind"]').click().catch(() => {})
  await page.waitForTimeout(300)
}
const ta = page.locator('textarea[aria-label="办理目标"]')
if (await ta.count()) await ta.fill('走查S5：先聊后案 · 会话顶栏绑案')
await page.locator('[data-testid="home-send"]').click()
try {
  await page.waitForURL(/\/agent\/sessions\/[^/]+/, { timeout: 10000 })
} catch {}
await page.waitForTimeout(900)

const s5Pre = await page.evaluate(() => {
  const top = document.querySelector('[data-testid="session-case-bind-top"]')
  const controls = document.querySelector('[data-testid="case-bind-controls"]')
  const current = document.querySelector('[data-testid="case-bind-current"]')
  const create = document.querySelector('[data-testid="case-create-bind"]')
  const existing = document.querySelector('[data-testid="case-bind-existing"]')
  const guide = /开始办理后可在此绑定|无案确认不会写入|可稍后创建或绑定/.test(document.body.innerText || '')
  return {
    url: location.href,
    sessionId: (location.pathname.match(/\/sessions\/([^/]+)/) || [])[1] || null,
    hasTop: !!top,
    hasControls: !!controls,
    bound: !!current,
    currentText: current ? (current.textContent || '').replace(/\s+/g, ' ').trim().slice(0, 80) : null,
    createVisible: !!create,
    existingVisible: !!existing,
    guide,
  }
})
await shot(page, OUT.S5, 'S5-unbound-top.png')
if (await page.locator('[data-testid="session-case-bind-top"]').count()) {
  await page.locator('[data-testid="session-case-bind-top"]').screenshot({
    path: path.join(OUT.S5, 'S5-case-bind-top-unbound.png'),
  }).catch(() => {})
}

// Bind existing or create
let bindMode = null
const createBtn = page.locator('[data-testid="case-create-bind"]').first()
const existingBtn = page.locator('[data-testid="case-bind-existing"]').first()
if (await createBtn.isVisible().catch(() => false)) {
  await createBtn.click()
  await page.waitForTimeout(350)
  const title = page.locator('[data-testid="case-create-title"]')
  if (await title.isVisible().catch(() => false)) {
    await title.fill('走查S5绑案-' + Date.now().toString().slice(-6))
  }
  await page.locator('[data-testid="case-create-confirm"]').click()
  bindMode = 'create'
  await page.waitForTimeout(700)
} else if (await existingBtn.isVisible().catch(() => false)) {
  await existingBtn.click()
  await page.waitForTimeout(350)
  const sel = page.locator('[data-testid="case-bind-select"]')
  if (await sel.isVisible().catch(() => false)) {
    const opts = await sel.locator('option').allTextContents()
    const pick = opts.find((o) => o && !/选|请选择|—/.test(o)) || opts[1]
    if (pick) await sel.selectOption({ label: pick }).catch(async () => {
      await sel.selectOption({ index: 1 })
    })
  }
  await page.locator('[data-testid="case-bind-confirm"]').click()
  bindMode = 'existing'
  await page.waitForTimeout(700)
}

const s5Post = await page.evaluate(() => {
  const current = document.querySelector('[data-testid="case-bind-current"]')
  const unbind = !!document.querySelector('[data-testid="case-unbind"]')
  const top = document.querySelector('[data-testid="session-case-bind-top"]')
  return {
    url: location.href,
    bound: !!(current || unbind),
    currentText: current ? (current.textContent || '').replace(/\s+/g, ' ').trim().slice(0, 100) : null,
    unbind,
    hasTop: !!top,
    stillOnSession: /\/agent\/sessions\//.test(location.pathname),
  }
})
const s5Gates = await hardGates(page)
await shot(page, OUT.S5, 'S5-bound.png')
if (await page.locator('[data-testid="session-case-bind-top"]').count()) {
  await page.locator('[data-testid="session-case-bind-top"]').screenshot({
    path: path.join(OUT.S5, 'S5-case-bind-top-bound.png'),
  }).catch(() => {})
}

const s5Biz = s5Pre.sessionId && s5Pre.createVisible && s5Post.bound && s5Post.stillOnSession
const s5Page = (s5Pre.hasTop || s5Pre.hasControls) && s5Post.bound

report.steps.S5 = {
  pre: s5Pre,
  post: s5Post,
  bindMode,
  gates: s5Gates,
  evidence: [
    'docs/ui-polish/agent-stepwise-ui/S5/S5-unbound-top.png',
    fs.existsSync(path.join(OUT.S5, 'S5-case-bind-top-unbound.png'))
      ? 'docs/ui-polish/agent-stepwise-ui/S5/S5-case-bind-top-unbound.png'
      : null,
    'docs/ui-polish/agent-stepwise-ui/S5/S5-bound.png',
    fs.existsSync(path.join(OUT.S5, 'S5-case-bind-top-bound.png'))
      ? 'docs/ui-polish/agent-stepwise-ui/S5/S5-case-bind-top-bound.png'
      : null,
  ].filter(Boolean),
  checks: {
    bizLogic: s5Biz,
    pageLogic: s5Page,
    hardOk: s5Gates.midDeep.length === 0 && !s5Gates.billingBanner?.visible && s5Gates.amberFullWidth.length === 0,
  },
}
fs.writeFileSync(path.join(OUT.S5, '_probe.json'), JSON.stringify(report.steps.S5, null, 2))
console.log('S5', JSON.stringify({ biz: s5Biz, page: s5Page, bindMode, bound: s5Post.bound, current: s5Post.currentText }))

report.finishedAt = new Date().toISOString()
report.consoleErrors = report.consoleErrors.filter(
  (e, i, arr) => arr.findIndex((x) => x.text === e.text && x.step === e.step) === i,
)
delete report._cur

fs.writeFileSync(path.join(ROOT, '_walk_s3_s5_report.json'), JSON.stringify(report, null, 2))
fs.writeFileSync(path.join(E2E, '_walk_s3_s5_report.json'), JSON.stringify(report, null, 2))
console.log('CONSOLE', report.consoleErrors.length)
console.log('DONE')
await browser.close()
