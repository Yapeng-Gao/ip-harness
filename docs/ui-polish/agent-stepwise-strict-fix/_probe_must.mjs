import { chromium } from 'playwright'
import fs from 'node:fs'
import path from 'node:path'

const BASE = 'http://127.0.0.1:5175'
const ROOT = '/workspace/ip-harness/docs/ui-polish/agent-stepwise-strict-fix'

async function shot(page, dir, name) {
  const p = path.join(dir, name)
  await page.screenshot({ path: p, fullPage: false })
  return path.relative('/workspace/ip-harness', p)
}

const report = { at: new Date().toISOString(), must: {} }

const browser = await chromium.launch({ headless: true })
const page = await browser.newPage({ viewport: { width: 1440, height: 900 } })

// S0
await page.goto(BASE + '/agent', { waitUntil: 'networkidle' })
await page.waitForTimeout(600)
const s0 = await page.evaluate(() => {
  const send = document.querySelector('[data-testid="home-send"]')
  const chip = document.querySelector('[data-testid="home-needs-human-chip"]')
  const fold = document.querySelector('[data-testid="home-common-fold"]')
  const pillsVisible = [...document.querySelectorAll('[data-testid="home-common-pills"] button')]
    .filter((b) => {
      const r = b.getBoundingClientRect()
      return r.width > 0 && r.height > 0 && fold?.open
    }).length
  const foldOpen = !!fold?.open
  const solidPrimary = [...document.querySelectorAll('button, a')].filter((el) => {
    const st = getComputedStyle(el)
    const bg = st.backgroundColor
    const t = (el.innerText || '').trim()
    const r = el.getBoundingClientRect()
    if (r.width < 20 || r.height < 20) return false
    const solid = bg && bg !== 'rgba(0, 0, 0, 0)' && bg !== 'transparent' && !bg.includes('255, 255, 255')
    return solid && /开始办理|启动|试用/.test(t) && !/待确认/.test(t)
  }).map(el => el.innerText.trim().slice(0, 20))
  const sendBox = send ? send.getBoundingClientRect() : null
  const chipBox = chip ? (() => {
    const st = getComputedStyle(chip)
    return { bg: st.backgroundColor, fw: st.fontWeight, border: st.border }
  })() : null
  const caseBind = document.querySelectorAll('[data-testid="home-case-bind"]').length
  const billing = document.querySelector('[data-billing-hold-banner]')
  return {
    foldOpen,
    pillsWhenClosed: foldOpen ? null : [...document.querySelectorAll('button')].filter(b => /检索现有技术|拆 OA/.test(b.innerText || '') && b.getBoundingClientRect().height > 0).length,
    solidPrimary,
    sendH: sendBox?.height,
    chipBox,
    caseBind,
    billing: !!billing,
  }
})
await shot(page, path.join(ROOT, 'S0'), 'S0-home-after.png')
report.must['SS-M-S0-1'] = {
  pass: !s0.foldOpen && (s0.pillsWhenClosed === 0) && s0.solidPrimary.filter(t => t.includes('开始办理')).length >= 1 && s0.caseBind === 1 && !s0.billing,
  detail: s0,
}

// S2 — start without case
await page.click('[data-testid="home-send"]')
await page.waitForTimeout(800)
const s2 = await page.evaluate(() => {
  const texts = [...document.querySelectorAll('button, a, span, p, div')].map(el => (el.innerText || '').trim()).filter(Boolean)
  const hasAutoCore = texts.some(t => /Auto 已按 Core|Auto\/Core/.test(t))
  const matchHint = document.querySelector('[data-testid="session-match-hint"]')
  const matchSwitch = document.querySelector('[data-testid="session-match-switch"]')
  const switchSolid = matchSwitch ? (() => {
    const bg = getComputedStyle(matchSwitch).backgroundColor
    return bg.includes('15, 23, 42') || bg.includes('0, 0, 0') || /rgb\(15,\s*23,\s*42\)/.test(bg)
  })() : false
  const startBtns = [...document.querySelectorAll('button')].filter(b => /^启动$/.test((b.innerText || '').replace(/\s/g, '').replace(/.*启动$/, '启动').slice(-2)) || (b.innerText || '').includes('启动'))
  const solidStarts = startBtns.filter(b => {
    const bg = getComputedStyle(b).backgroundColor
    return /rgb\(15,\s*23,\s*42\)|rgb\(30,\s*41,\s*59\)/.test(bg)
  })
  const empty = document.querySelector('[data-testid="session-timeline-empty"]')
  const matchedHuman = texts.some(t => /已匹配：/.test(t))
  return {
    hasAutoCore,
    matchHint: !!matchHint,
    switchSolid,
    solidStartCount: solidStarts.length,
    emptyAnchor: empty ? empty.innerText.slice(0, 80) : null,
    matchedHuman,
    url: location.pathname,
  }
}
)
await shot(page, path.join(ROOT, 'S2'), 'S2-session-after.png')
report.must['SS-M-S2-1'] = {
  pass: !s2.hasAutoCore && !s2.switchSolid && s2.solidStartCount <= 1 && !!s2.emptyAnchor,
  detail: s2,
}

// S4 — open needs_human session if possible
await page.goto(BASE + '/agent/sessions?filter=needs_human', { waitUntil: 'networkidle' })
await page.waitForTimeout(500)
const firstRow = page.locator('table tbody tr a, table tbody tr button').first()
if (await firstRow.count()) {
  await firstRow.click()
  await page.waitForTimeout(900)
}
const s4 = await page.evaluate(() => {
  const bar = document.querySelector('[data-confirm-bar], .confirm-hitl')
  if (!bar) return { present: false }
  const text = bar.innerText || ''
  const jargon = /Full-check|Persona|\bHITL\b/.test(text)
  const go = bar.querySelector('[data-testid="confirm-go-complete"]')
  const more = [...bar.querySelectorAll('button')].find(b => /查看全部条件/.test(b.innerText || ''))
  const tiny = [...bar.querySelectorAll('*')].filter(el => {
    const t = (el.childNodes && [...el.childNodes].some(n => n.nodeType === 3 && n.textContent.trim())) 
    if (!t) return false
    const fs = parseFloat(getComputedStyle(el).fontSize)
    const r = el.getBoundingClientRect()
    return fs > 0 && fs < 12 && r.height > 0 && (el.innerText || '').trim().length > 0
  }).slice(0, 8).map(el => ({ t: el.innerText.trim().slice(0, 40), fs: getComputedStyle(el).fontSize }))
  return {
    present: true,
    jargon,
    hasGoComplete: !!go,
    hasViewAll: !!more,
    tiny,
    sample: text.slice(0, 200),
  }
})
await shot(page, path.join(ROOT, 'S4'), 'S4-confirm-after.png')
report.must['SS-M-S4-1'] = {
  pass: s4.present && !s4.jargon && s4.hasGoComplete && s4.hasViewAll && s4.tiny.length === 0,
  detail: s4,
}

// S6
await page.goto(BASE + '/agent/sessions?filter=needs_human', { waitUntil: 'networkidle' })
await page.waitForTimeout(400)
const s6 = await page.evaluate(() => {
  const searches = [...document.querySelectorAll('input[type="search"]')].filter(el => el.getBoundingClientRect().height > 0)
  const news = [...document.querySelectorAll('button, a')].filter(el => {
    const t = (el.innerText || '').replace(/\s+/g, '')
    return /新建(任务)?会话/.test(t) && el.getBoundingClientRect().height > 0
  }).map(el => el.innerText.trim())
  const h1 = document.querySelector('h1')?.innerText
  return { searchCount: searches.length, newCount: news.length, news, h1 }
})
await shot(page, path.join(ROOT, 'S6'), 'S6-list-after.png')
report.must['SS-M-S6-1'] = {
  pass: s6.searchCount === 1 && s6.newCount === 1,
  detail: s6,
}

// S7
await page.goto(BASE + '/agent/agents', { waitUntil: 'networkidle' })
await page.waitForTimeout(500)
const s7 = await page.evaluate(() => {
  const starts = [...document.querySelectorAll('[data-testid="agent-picker-start"]')]
  const hs = starts.map(b => b.getBoundingClientRect().height)
  const hints = [...document.querySelectorAll('.agent-picker-card__hint--away')]
  const gaps = starts.slice(0, 3).map((b, i) => {
    const hint = b.parentElement?.querySelector('.agent-picker-card__hint--away')
    if (!hint) return null
    const br = b.getBoundingClientRect()
    const hr = hint.getBoundingClientRect()
    return Math.round(hr.top - br.bottom)
  }).filter(x => x != null)
  return { startCount: starts.length, minH: Math.min(...hs), maxH: Math.max(...hs), hintGaps: gaps }
})
await shot(page, path.join(ROOT, 'S7'), 'S7-catalog-after.png')
report.must['SS-M-S7-1'] = {
  pass: s7.minH >= 36 && s7.hintGaps.every(g => g >= 8),
  detail: s7,
}

// S8 general project
await page.goto(BASE + '/agent/projects', { waitUntil: 'networkidle' })
await page.waitForTimeout(400)
// create general if button exists
const createBtn = page.locator('button', { hasText: /创建并打开总控|新建项目|创建项目/ }).first()
if (await createBtn.count()) {
  await createBtn.click()
  await page.waitForTimeout(1000)
}
const s8 = await page.evaluate(() => {
  const solidDispatch = [...document.querySelectorAll('a, button')].filter(el => {
    const t = (el.innerText || '').replace(/\s+/g, '')
    if (!/打开总控分派|分派/.test(t)) return false
    if (!/打开总控|回总控分派/.test(t) && !/^分派/.test(t)) return false
    const bg = getComputedStyle(el).backgroundColor
    const r = el.getBoundingClientRect()
    if (r.height < 10) return false
    return /rgb\(15,\s*23,\s*42\)|rgb\(0,\s*0,\s*0\)/.test(bg)
  }).map(el => el.innerText.trim())
  const pills = [...document.querySelectorAll('.project-dispatch-pill')]
  const pillMetrics = pills.slice(0, 5).map(p => ({
    h: Math.round(p.getBoundingClientRect().height),
    fs: getComputedStyle(p).fontSize,
    t: p.innerText.trim().slice(0, 20),
  }))
  const composer = document.querySelector('.project-chat-composer')
  const vh = window.innerHeight
  const composerTop = composer ? composer.getBoundingClientRect().top : null
  const contentBand = composerTop != null ? vh - composerTop : null
  const orchHint = document.querySelector('[data-testid="project-timeline-cta-orch"]')
  const orchTag = orchHint?.tagName
  const orchSolid = orchHint && orchHint.tagName === 'A' ? /rgb\(15,\s*23,\s*42\)/.test(getComputedStyle(orchHint).backgroundColor) : false
  return {
    solidDispatch,
    pillMetrics,
    contentBand,
    orchTag,
    orchSolid,
    orchText: orchHint?.innerText?.slice(0, 40),
    url: location.pathname,
  }
})
await shot(page, path.join(ROOT, 'S8'), 'S8-general-after.png')
report.must['SS-M-S8-1'] = {
  pass: s8.solidDispatch.length <= 1 && (s8.pillMetrics.length === 0 || s8.pillMetrics.every(p => p.h >= 32)) && (s8.contentBand == null || s8.contentBand >= 72) && !s8.orchSolid,
  detail: s8,
}

// S9 patent expert
await page.goto(BASE + '/agent/projects', { waitUntil: 'networkidle' })
await page.waitForTimeout(400)
// try open patent project link
const patentLink = page.locator('a[href*="/agent/projects/"]').filter({ hasText: /专利|patent|领域/i }).first()
const anyProj = page.locator('a[href*="/agent/projects/"]').first()
if (await patentLink.count()) await patentLink.click()
else if (await anyProj.count()) await anyProj.click()
await page.waitForTimeout(800)
// go to expert-search if link
const searchExpert = page.locator('a[href*="expert-search"], a', { hasText: /检索专家/ }).first()
if (await searchExpert.count()) {
  await searchExpert.click()
  await page.waitForTimeout(800)
}
const s9 = await page.evaluate(() => {
  const amberFull = [...document.querySelectorAll('.case-bind-controls, [data-testid="case-bind-controls"]')].map(el => {
    const st = getComputedStyle(el)
    return { bg: st.backgroundColor, border: st.borderColor, text: el.innerText.slice(0, 60) }
  })
  const isAmber = amberFull.some(x => /255,\s*251,\s*235|254,\s*243,\s*199|251,\s*191,\s*36|245,\s*158,\s*11|amber/i.test(x.bg) || /251,\s*191,\s*36|245,\s*158,\s*11/.test(x.border))
  const solidBlack = [...document.querySelectorAll('button, a')].filter(el => {
    const bg = getComputedStyle(el).backgroundColor
    const r = el.getBoundingClientRect()
    if (r.height < 16 || r.width < 30) return false
    return /rgb\(15,\s*23,\s*42\)/.test(bg)
  }).map(el => el.innerText.trim().slice(0, 24))
  const bodyText = document.body.innerText
  const snake = (bodyText.match(/\b[a-z]+_[a-z_]+\b/g) || []).filter(s =>
    /approve_strategy|commercial_patent|expert-search|authorize_file|dispatch_task/.test(s)
  )
  const wrongNext = /去检索专家/.test(bodyText) && /检索专家/.test(document.querySelector('[data-testid^="project-chat-"]')?.innerText || '')
  const advance = document.querySelector('[data-testid="expert-advance-cta"]')
  return {
    isAmber,
    amberFull,
    solidBlack,
    snake: [...new Set(snake)].slice(0, 10),
    wrongNext,
    hasAdvance: !!advance,
    url: location.pathname,
  }
})
await shot(page, path.join(ROOT, 'S9'), 'S9-expert-after.png')
report.must['SS-M-S9-1'] = {
  pass: !s9.isAmber && s9.solidBlack.filter(t => /推进一步|打开总控分派|回总控分派/.test(t)).length <= 1 && s9.snake.length === 0 && !s9.wrongNext,
  detail: s9,
}

fs.writeFileSync(path.join(ROOT, '_probe.json'), JSON.stringify(report, null, 2))
console.log(JSON.stringify(report, null, 2))
await browser.close()
