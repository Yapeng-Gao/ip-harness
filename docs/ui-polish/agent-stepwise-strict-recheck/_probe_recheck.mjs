import { chromium } from 'playwright'
import fs from 'node:fs'
import path from 'node:path'

const BASE = 'http://127.0.0.1:5175'
const ROOT = '/workspace/ip-harness/docs/ui-polish/agent-stepwise-strict-recheck'
const TIP = process.env.TIP_SHA || 'unknown'

function isSolidNavy(bg) {
  return /rgb\(\s*15,\s*23,\s*42\s*\)|rgb\(\s*30,\s*41,\s*59\s*\)|rgb\(\s*0,\s*0,\s*0\s*\)/.test(bg || '')
}
function isSolidNonWhite(bg) {
  if (!bg || bg === 'transparent' || bg === 'rgba(0, 0, 0, 0)') return false
  if (/rgba?\(\s*255,\s*255,\s*255/.test(bg)) return false
  return true
}

async function shot(page, dir, name) {
  const p = path.join(dir, name)
  await page.screenshot({ path: p, fullPage: false })
  return path.relative('/workspace/ip-harness', p)
}

async function hardGates(page) {
  return page.evaluate(() => {
    const mid = [...document.querySelectorAll('a[href*="5173"]')].map(a => a.getAttribute('href'))
    const billing = !!document.querySelector('[data-billing-hold-banner]')
    const caseBind = document.querySelectorAll('[data-testid="home-case-bind"]').length
    const amberProto = [...document.querySelectorAll('*')].some(el => {
      const t = (el.innerText || '').slice(0, 80)
      return /不停审|仅提示|欠费诚实/.test(t) && el.getBoundingClientRect().height > 20
    })
    return { midDeep: mid, billingHold: billing, homeCaseBind: caseBind, amberPrototype: amberProto }
  })
}

const report = {
  at: new Date().toISOString(),
  tipSha: TIP,
  fixSha: 'b0a0a00',
  base: BASE,
  viewport: { w: 1440, h: 900 },
  must: {},
  hardGates: {},
  shots: [],
}

const browser = await chromium.launch({ headless: true })
const page = await browser.newPage({ viewport: { width: 1440, height: 900 } })

// ─── S0 ───
await page.goto(BASE + '/agent', { waitUntil: 'networkidle' })
await page.waitForTimeout(700)
const s0 = await page.evaluate(() => {
  const send = document.querySelector('[data-testid="home-send"]')
  const chip = document.querySelector('[data-testid="home-needs-human-chip"]')
  const fold = document.querySelector('[data-testid="home-common-fold"], [data-testid="home-recommend-fold"]')
  const foldOpen = !!fold?.open
  // Core pills under compose when fold closed
  const pillsUnderCompose = [...document.querySelectorAll('button, a')].filter(b => {
    const t = (b.innerText || '').trim()
    const r = b.getBoundingClientRect()
    if (r.height < 8 || r.width < 8) return false
    return /检索现有技术|拆 OA|Core |起草答复|新颖性|侵权风险/.test(t)
  }).map(b => ({ t: b.innerText.trim().slice(0, 30), h: Math.round(b.getBoundingClientRect().height) }))
  const solidPrimary = [...document.querySelectorAll('button, a')].filter(el => {
    const st = getComputedStyle(el)
    const bg = st.backgroundColor
    const t = (el.innerText || '').trim()
    const r = el.getBoundingClientRect()
    if (r.width < 20 || r.height < 20 || r.bottom < 0 || r.top > innerHeight) return false
    const solid = bg && bg !== 'rgba(0, 0, 0, 0)' && bg !== 'transparent' && !/rgba?\(\s*255,\s*255,\s*255/.test(bg)
    return solid && /开始办理|启动|试用/.test(t) && !/待确认/.test(t)
  }).map(el => {
    const st = getComputedStyle(el)
    return { t: el.innerText.trim().slice(0, 24), bg: st.backgroundColor, h: Math.round(el.getBoundingClientRect().height) }
  })
  const sendBox = send ? (() => {
    const st = getComputedStyle(send)
    const r = send.getBoundingClientRect()
    return { bg: st.backgroundColor, fw: st.fontWeight, h: Math.round(r.height), w: Math.round(r.width), t: send.innerText.trim() }
  })() : null
  const chipBox = chip ? (() => {
    const st = getComputedStyle(chip)
    const r = chip.getBoundingClientRect()
    return { bg: st.backgroundColor, fw: st.fontWeight, border: st.borderColor, h: Math.round(r.height), w: Math.round(r.width), t: chip.innerText.trim().slice(0, 40) }
  })() : null
  const caseBind = document.querySelectorAll('[data-testid="home-case-bind"]').length
  const billing = !!document.querySelector('[data-billing-hold-banner]')
  const mid = [...document.querySelectorAll('a[href*="5173"]')].map(a => a.href)
  return {
    foldOpen,
    foldTestId: fold?.getAttribute('data-testid') || null,
    pillsVisibleWhenClosed: foldOpen ? 'n/a-open' : pillsUnderCompose.length,
    pillsSample: pillsUnderCompose.slice(0, 8),
    solidPrimary,
    sendBox,
    chipBox,
    caseBind,
    billing,
    mid,
  }
})
const s0shot = await shot(page, path.join(ROOT, 'S0'), 'S0-home.png')
report.shots.push(s0shot)
const s0gates = await hardGates(page)
const chipWeaker = s0.chipBox && s0.sendBox
  ? (!isSolidNavy(s0.chipBox.bg) && (isSolidNavy(s0.sendBox.bg) || isSolidNonWhite(s0.sendBox.bg)))
  : true
const s0pass =
  !s0.foldOpen &&
  (s0.pillsVisibleWhenClosed === 0 || s0.pillsVisibleWhenClosed === 'n/a-open') &&
  s0.solidPrimary.filter(x => /开始办理/.test(x.t)).length === 1 &&
  s0.solidPrimary.filter(x => !/开始办理/.test(x.t)).length === 0 &&
  s0.caseBind === 1 &&
  !s0.billing &&
  s0.mid.length === 0 &&
  chipWeaker
report.must['SS-M-S0-1'] = {
  pass: s0pass,
  detail: { ...s0, chipWeaker },
  evidence: 'fold closed; Core pills not under compose; solid CTA=开始办理×1; chip weaker than send',
}

// ─── S2 ───
await page.click('[data-testid="home-send"]')
await page.waitForURL(/\/agent\/sessions\//, { timeout: 8000 }).catch(() => {})
await page.waitForTimeout(900)
const s2 = await page.evaluate(() => {
  const bodyText = document.body.innerText || ''
  const hasAutoCore = /Auto 已按 Core|Auto\/Core|\bAuto\b.*\bCore\b/.test(bodyText)
  const matchSwitch = document.querySelector('[data-testid="session-match-switch"]')
  const switchSolid = matchSwitch ? (() => {
    const bg = getComputedStyle(matchSwitch).backgroundColor
    return /rgb\(\s*15,\s*23,\s*42\s*\)|rgb\(\s*0,\s*0,\s*0\s*\)|rgb\(\s*30,\s*41,\s*59\s*\)/.test(bg)
  })() : false
  const viewportSolids = [...document.querySelectorAll('button, a')].filter(el => {
    const r = el.getBoundingClientRect()
    if (r.height < 20 || r.width < 30 || r.bottom < 0 || r.top > innerHeight) return false
    const bg = getComputedStyle(el).backgroundColor
    const t = (el.innerText || '').trim()
    if (!t || t.length > 40) return false
    return /rgb\(\s*15,\s*23,\s*42\s*\)|rgb\(\s*30,\s*41,\s*59\s*\)/.test(bg) &&
      /启动|切换|开始办理|试用|确认|发送/.test(t)
  }).map(el => ({ t: el.innerText.trim().slice(0, 24), bg: getComputedStyle(el).backgroundColor }))
  const empty = document.querySelector('[data-testid="session-timeline-empty"]')
  const emptyText = empty ? empty.innerText.trim().slice(0, 120) : null
  // also look for any empty-state anchor copy
  const emptyish = emptyText || [...document.querySelectorAll('p, div, span')].map(el => el.innerText?.trim()).find(t => t && /先说|下一步|开始|空|暂无|点下方|启动/.test(t) && t.length < 80) || null
  const matchedHuman = /已匹配：/.test(bodyText)
  const mid = [...document.querySelectorAll('a[href*="5173"]')].map(a => a.href)
  const billing = !!document.querySelector('[data-billing-hold-banner]')
  return {
    hasAutoCore,
    switchSolid,
    switchText: matchSwitch?.innerText?.trim()?.slice(0, 40) || null,
    viewportSolids,
    solidMainCount: viewportSolids.length,
    emptyAnchor: emptyText,
    emptyish,
    matchedHuman,
    url: location.pathname + location.search,
    mid,
    billing,
  }
})
const s2shot = await shot(page, path.join(ROOT, 'S2'), 'S2-session.png')
report.shots.push(s2shot)
const s2pass =
  !s2.hasAutoCore &&
  !s2.switchSolid &&
  s2.solidMainCount <= 1 &&
  !!(s2.emptyAnchor || s2.emptyish) &&
  s2.mid.length === 0 &&
  !s2.billing
report.must['SS-M-S2-1'] = {
  pass: s2pass,
  detail: s2,
  evidence: 'solid CTA≤1; empty anchor; no Auto/Core jargon; switch not solid',
}

// ─── S4 ───
await page.goto(BASE + '/agent/sessions/sess-oa-1?focus=hitl', { waitUntil: 'networkidle' })
await page.waitForTimeout(900)
let s4 = await page.evaluate(() => {
  const bar = document.querySelector('[data-confirm-bar], .confirm-hitl, [data-testid="session-confirm-bar"]')
  // fallback: look for Confirm region text
  const region = bar || [...document.querySelectorAll('section, aside, div')].find(el => {
    const t = el.innerText || ''
    return /去补全|查看全部条件|待确认|需要你/.test(t) && el.querySelector('button') && el.getBoundingClientRect().height > 40 && el.getBoundingClientRect().height < 500
  })
  if (!region) return { present: false, bodySample: document.body.innerText.slice(0, 300) }
  const text = region.innerText || ''
  const jargon = /Full-check|Persona|\bHITL\b|full-check/i.test(text)
  const go = region.querySelector('[data-testid="confirm-go-complete"]') ||
    [...region.querySelectorAll('button, a')].find(b => /去补全|去完善|补全条件/.test(b.innerText || ''))
  const more = [...region.querySelectorAll('button, a')].find(b => /查看全部条件|全部条件/.test(b.innerText || ''))
  const tiny = [...region.querySelectorAll('*')].filter(el => {
    const hasOwnText = [...el.childNodes].some(n => n.nodeType === 3 && n.textContent.trim())
    if (!hasOwnText) return false
    const fs = parseFloat(getComputedStyle(el).fontSize)
    const r = el.getBoundingClientRect()
    return fs > 0 && fs < 12 && r.height > 0 && (el.innerText || '').trim().length > 0
  }).slice(0, 8).map(el => ({ t: el.innerText.trim().slice(0, 40), fs: getComputedStyle(el).fontSize }))
  const goBox = go ? { t: go.innerText.trim(), h: Math.round(go.getBoundingClientRect().height), tag: go.tagName } : null
  return {
    present: true,
    jargon,
    hasGoComplete: !!go,
    hasViewAll: !!more,
    tiny,
    sample: text.slice(0, 240),
    goBox,
    url: location.pathname + location.search,
  }
})
if (!s4.present) {
  // fallback via needs_human list
  await page.goto(BASE + '/agent/sessions?filter=needs_human', { waitUntil: 'networkidle' })
  await page.waitForTimeout(500)
  const firstRow = page.locator('table tbody tr a, [data-testid="session-row"] a, a[href*="/agent/sessions/"]').first()
  if (await firstRow.count()) {
    await firstRow.click()
    await page.waitForTimeout(900)
  }
  s4 = await page.evaluate(() => {
    const bar = document.querySelector('[data-confirm-bar], .confirm-hitl, [data-testid="session-confirm-bar"]')
    const region = bar || [...document.querySelectorAll('section, aside, div')].find(el => {
      const t = el.innerText || ''
      return /去补全|查看全部条件|待确认/.test(t) && el.querySelector('button') && el.getBoundingClientRect().height > 40
    })
    if (!region) return { present: false, bodySample: document.body.innerText.slice(0, 300) }
    const text = region.innerText || ''
    const jargon = /Full-check|Persona|\bHITL\b/i.test(text)
    const go = region.querySelector('[data-testid="confirm-go-complete"]') ||
      [...region.querySelectorAll('button, a')].find(b => /去补全|去完善|补全条件/.test(b.innerText || ''))
    const more = [...region.querySelectorAll('button, a')].find(b => /查看全部条件|全部条件/.test(b.innerText || ''))
    const tiny = [...region.querySelectorAll('*')].filter(el => {
      const hasOwnText = [...el.childNodes].some(n => n.nodeType === 3 && n.textContent.trim())
      if (!hasOwnText) return false
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
      sample: text.slice(0, 240),
      goBox: go ? { t: go.innerText.trim(), h: Math.round(go.getBoundingClientRect().height) } : null,
      url: location.pathname + location.search,
      via: 'list-fallback',
    }
  })
}
const s4shot = await shot(page, path.join(ROOT, 'S4'), 'S4-confirm.png')
report.shots.push(s4shot)
const s4pass = s4.present && !s4.jargon && s4.hasGoComplete && s4.hasViewAll && s4.tiny.length === 0
report.must['SS-M-S4-1'] = {
  pass: s4pass,
  detail: s4,
  evidence: '去补全 1-click; no Full-check/Persona/HITL; font≥12',
}

// ─── S6 ───
await page.goto(BASE + '/agent/sessions?filter=needs_human', { waitUntil: 'networkidle' })
await page.waitForTimeout(500)
const s6 = await page.evaluate(() => {
  const searches = [...document.querySelectorAll('input[type="search"], input[placeholder*="搜索"], input[aria-label*="搜索"]')]
    .filter(el => el.getBoundingClientRect().height > 0)
  const news = [...document.querySelectorAll('button, a')].filter(el => {
    const t = (el.innerText || '').replace(/\s+/g, '')
    return /新建(任务)?会话/.test(t) && el.getBoundingClientRect().height > 0
  }).map(el => {
    const st = getComputedStyle(el)
    return { t: el.innerText.trim(), bg: st.backgroundColor, border: st.borderColor }
  })
  const h1 = document.querySelector('h1')?.innerText?.trim()
  const mid = [...document.querySelectorAll('a[href*="5173"]')].map(a => a.href)
  const billing = !!document.querySelector('[data-billing-hold-banner]')
  return { searchCount: searches.length, newCount: news.length, news, h1, mid, billing, url: location.pathname + location.search }
})
const s6shot = await shot(page, path.join(ROOT, 'S6'), 'S6-list.png')
report.shots.push(s6shot)
const s6pass = s6.searchCount === 1 && s6.newCount === 1 && s6.mid.length === 0 && !s6.billing
report.must['SS-M-S6-1'] = {
  pass: s6pass,
  detail: s6,
  evidence: `search=${s6.searchCount}; new=${s6.newCount}; h1=${s6.h1}`,
}

// ─── S7 ───
await page.goto(BASE + '/agent/agents', { waitUntil: 'networkidle' })
await page.waitForTimeout(600)
const s7 = await page.evaluate(() => {
  const starts = [...document.querySelectorAll('[data-testid="agent-picker-start"]')]
  const hs = starts.map(b => Math.round(b.getBoundingClientRect().height))
  const cardSolids = starts.map(b => {
    const bg = getComputedStyle(b).backgroundColor
    return { t: b.innerText.trim().slice(0, 16), bg, solid: /rgb\(\s*15,\s*23,\s*42\s*\)/.test(bg) }
  })
  const gaps = starts.slice(0, 6).map((b) => {
    const hint = b.parentElement?.querySelector('.agent-picker-card__hint--away, [data-testid="agent-picker-hint"]')
      || [...(b.parentElement?.querySelectorAll('*') || [])].find(el => /稍后关联|暂不|稍后再/.test(el.innerText || ''))
    if (!hint) return null
    const br = b.getBoundingClientRect()
    const hr = hint.getBoundingClientRect()
    // gap between start button and hint (hint usually below)
    const gap = hr.top >= br.bottom ? Math.round(hr.top - br.bottom) : Math.round(br.top - hr.bottom)
    return { gap, hint: hint.innerText.trim().slice(0, 20) }
  }).filter(x => x != null)
  // unique solid CTA per card scan
  const solidPerCard = [...document.querySelectorAll('.agent-picker-card, [data-testid="agent-picker-card"]')].map(card => {
    const solids = [...card.querySelectorAll('button, a')].filter(el => {
      const bg = getComputedStyle(el).backgroundColor
      const r = el.getBoundingClientRect()
      return r.height > 16 && /rgb\(\s*15,\s*23,\s*42\s*\)/.test(bg)
    })
    return solids.length
  })
  const mid = [...document.querySelectorAll('a[href*="5173"]')].map(a => a.href)
  return {
    startCount: starts.length,
    minH: hs.length ? Math.min(...hs) : 0,
    maxH: hs.length ? Math.max(...hs) : 0,
    hs: hs.slice(0, 6),
    hintGaps: gaps,
    solidPerCard: solidPerCard.slice(0, 8),
    cardSolids: cardSolids.slice(0, 4),
    mid,
  }
})
const s7shot = await shot(page, path.join(ROOT, 'S7'), 'S7-catalog.png')
report.shots.push(s7shot)
const s7pass =
  s7.minH >= 36 &&
  (s7.hintGaps.length === 0 || s7.hintGaps.every(g => g.gap >= 8)) &&
  (s7.solidPerCard.length === 0 || s7.solidPerCard.every(n => n <= 1)) &&
  s7.mid.length === 0
report.must['SS-M-S7-1'] = {
  pass: s7pass,
  detail: s7,
  evidence: `start minH=${s7.minH}; gaps=${JSON.stringify(s7.hintGaps)}; solid/card≤1`,
}

// ─── S8 ───
await page.goto(BASE + '/agent/projects/proj-demo-general', { waitUntil: 'networkidle' })
await page.waitForTimeout(800)
const s8 = await page.evaluate(() => {
  const solidMain = [...document.querySelectorAll('a, button')].filter(el => {
    const t = (el.innerText || '').replace(/\s+/g, '')
    const bg = getComputedStyle(el).backgroundColor
    const r = el.getBoundingClientRect()
    if (r.height < 16 || r.width < 20 || r.bottom < 0 || r.top > innerHeight) return false
    if (!/rgb\(\s*15,\s*23,\s*42\s*\)|rgb\(\s*0,\s*0,\s*0\s*\)/.test(bg)) return false
    return /打开总控分派|回总控分派|分派|推进一步|发送|启动/.test(t) || t.length <= 12
  }).map(el => ({ t: el.innerText.trim().slice(0, 28), bg: getComputedStyle(el).backgroundColor, h: Math.round(el.getBoundingClientRect().height) }))
  const pills = [...document.querySelectorAll('.project-dispatch-pill, [data-testid="project-dispatch-pill"]')]
  const pillMetrics = pills.slice(0, 8).map(p => ({
    h: Math.round(p.getBoundingClientRect().height),
    fs: parseFloat(getComputedStyle(p).fontSize),
    t: p.innerText.trim().slice(0, 20),
    clickable: p.tagName === 'BUTTON' || p.tagName === 'A' || p.getAttribute('role') === 'button' || !!p.onclick,
  }))
  const composer = document.querySelector('.project-chat-composer, [data-testid="project-chat-composer"]')
  const vh = window.innerHeight
  const composerTop = composer ? composer.getBoundingClientRect().top : null
  const contentBand = composerTop != null ? Math.round(vh - composerTop) : null
  const orchHint = document.querySelector('[data-testid="project-timeline-cta-orch"]')
  const orchSolid = orchHint && (orchHint.tagName === 'A' || orchHint.tagName === 'BUTTON')
    ? /rgb\(\s*15,\s*23,\s*42\s*\)/.test(getComputedStyle(orchHint).backgroundColor)
    : false
  const mid = [...document.querySelectorAll('a[href*="5173"]')].map(a => a.href)
  const billing = !!document.querySelector('[data-billing-hold-banner]')
  return {
    solidMain,
    solidCount: solidMain.length,
    pillMetrics,
    contentBand,
    orchTag: orchHint?.tagName || null,
    orchSolid,
    orchText: orchHint?.innerText?.slice(0, 40) || null,
    url: location.pathname,
    mid,
    billing,
  }
})
const s8shot = await shot(page, path.join(ROOT, 'S8'), 'S8-general.png')
report.shots.push(s8shot)
const s8pass =
  s8.solidCount <= 1 &&
  (s8.pillMetrics.length === 0 || s8.pillMetrics.every(p => p.h >= 32 && p.fs >= 12)) &&
  (s8.contentBand == null || s8.contentBand >= 72) &&
  !s8.orchSolid &&
  s8.mid.length === 0 &&
  !s8.billing
report.must['SS-M-S8-1'] = {
  pass: s8pass,
  detail: s8,
  evidence: `solid≤1; pills≥32/12; contentBand=${s8.contentBand}; orch not solid`,
}

// ─── S9 ───
await page.goto(BASE + '/agent/projects/proj-demo-patent/bots/expert-search', { waitUntil: 'networkidle' })
await page.waitForTimeout(900)
const s9 = await page.evaluate(() => {
  // full-width amber case bind bar
  const candidates = [...document.querySelectorAll('.case-bind-controls, [data-testid="case-bind-controls"], [class*="case-bind"]')]
  const amberBars = candidates.map(el => {
    const st = getComputedStyle(el)
    const r = el.getBoundingClientRect()
    const amber = /255,\s*251,\s*235|254,\s*243,\s*199|251,\s*191,\s*36|245,\s*158,\s*11|253,\s*230,\s*138/.test(st.backgroundColor)
      || /251,\s*191,\s*36|245,\s*158,\s*11/.test(st.borderColor)
    return { amber, bg: st.backgroundColor, border: st.borderColor, w: Math.round(r.width), h: Math.round(r.height), fullish: r.width > innerWidth * 0.7, text: el.innerText.slice(0, 60) }
  })
  const isAmberFull = amberBars.some(x => x.amber && x.fullish && x.h > 24)
  const solidBlack = [...document.querySelectorAll('button, a')].filter(el => {
    const bg = getComputedStyle(el).backgroundColor
    const r = el.getBoundingClientRect()
    if (r.height < 16 || r.width < 30 || r.bottom < 0 || r.top > innerHeight) return false
    return /rgb\(\s*15,\s*23,\s*42\s*\)/.test(bg)
  }).map(el => ({ t: el.innerText.trim().slice(0, 28), h: Math.round(el.getBoundingClientRect().height) }))
  const bodyText = document.body.innerText
  const snake = (bodyText.match(/\b[a-z]+_[a-z_]+\b/g) || []).filter(s =>
    /approve_strategy|commercial_patent|expert_search|authorize_file|dispatch_task|needs_human|full_check/.test(s)
  )
  // next-step copy coherence: shouldn't say 去检索专家 while already on 检索专家
  const onSearch = /expert-search|检索专家/.test(location.pathname + (document.querySelector('h1,h2,[data-testid^="project-chat"]')?.innerText || ''))
  const wrongNext = onSearch && /去检索专家/.test(bodyText)
  const advance = document.querySelector('[data-testid="expert-advance-cta"]')
  const mid = [...document.querySelectorAll('a[href*="5173"]')].map(a => a.href)
  const billing = !!document.querySelector('[data-billing-hold-banner]')
  // also scan for amber full-width banners not using case-bind class
  const anyAmberFull = [...document.querySelectorAll('div, section, aside')].some(el => {
    const r = el.getBoundingClientRect()
    if (r.width < innerWidth * 0.75 || r.height < 28 || r.height > 120) return false
    const bg = getComputedStyle(el).backgroundColor
    return /255,\s*251,\s*235|254,\s*243,\s*199|253,\s*230,\s*138/.test(bg) && /案件|绑|案号|未绑/.test(el.innerText || '')
  })
  return {
    isAmberFull: isAmberFull || anyAmberFull,
    amberBars,
    solidBlack,
    solidMainCtas: solidBlack.filter(x => /推进一步|打开总控分派|回总控分派|启动|开始办理/.test(x.t)),
    snake: [...new Set(snake)].slice(0, 10),
    wrongNext,
    hasAdvance: !!advance,
    advanceText: advance?.innerText?.trim()?.slice(0, 40) || null,
    url: location.pathname,
    mid,
    billing,
  }
})
const s9shot = await shot(page, path.join(ROOT, 'S9'), 'S9-expert.png')
report.shots.push(s9shot)
const s9pass =
  !s9.isAmberFull &&
  s9.solidMainCtas.length <= 1 &&
  s9.snake.length === 0 &&
  !s9.wrongNext &&
  s9.mid.length === 0 &&
  !s9.billing
report.must['SS-M-S9-1'] = {
  pass: s9pass,
  detail: s9,
  evidence: `no amber full bar; solid main=${s9.solidMainCtas.length}; snake=0; next ok`,
}

// aggregate hard gates across faces we visited
report.hardGates = {
  noMidDeep: Object.values(report.must).every(m => !(m.detail?.mid?.length)),
  noBillingHold: Object.values(report.must).every(m => !m.detail?.billing),
  homeCaseEntry1: report.must['SS-M-S0-1']?.detail?.caseBind === 1,
  noPrototypeAmberBilling: !s9.isAmberFull && !report.must['SS-M-S0-1']?.detail?.billing,
}

const passIds = Object.entries(report.must).filter(([, v]) => v.pass).map(([k]) => k)
const failIds = Object.entries(report.must).filter(([, v]) => !v.pass).map(([k]) => k)
report.summary = {
  passCount: passIds.length,
  failCount: failIds.length,
  passIds,
  failIds,
  overall: passIds.length === 7 && Object.values(report.hardGates).every(Boolean) ? 'Go' : 'Conditional',
}

fs.writeFileSync(path.join(ROOT, '_probe.json'), JSON.stringify(report, null, 2))
console.log(JSON.stringify({ summary: report.summary, hardGates: report.hardGates, mustPass: Object.fromEntries(Object.entries(report.must).map(([k, v]) => [k, v.pass])) }, null, 2))
await browser.close()
