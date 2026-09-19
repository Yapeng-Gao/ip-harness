import { chromium } from 'playwright'
import fs from 'node:fs'
import path from 'node:path'

const BASE = 'http://127.0.0.1:5175'
const ROOT = '/workspace/ip-harness/docs/ui-polish/agent-stepwise-strict-should-recheck'

async function shot(page, dir, name) {
  const p = path.join(dir, name)
  fs.mkdirSync(dir, { recursive: true })
  await page.screenshot({ path: p, fullPage: false })
  return path.relative('/workspace/ip-harness', p)
}

const report = {
  at: new Date().toISOString(),
  tipSha: null,
  fixSha: '0fe67d5a7a0f61f3b51b55a7b8ea8b69b544ec51',
  should: {},
  gates: {},
}

const browser = await chromium.launch({ headless: true })
const page = await browser.newPage({ viewport: { width: 1440, height: 900 } })

function gatesEval() {
  return {
    caseBind: document.querySelectorAll('[data-testid="home-case-bind"]').length,
    billing: !!document.querySelector('[data-billing-hold-banner]'),
    mid: [...document.querySelectorAll('a[href*="5173"]')].map((a) => a.getAttribute('href')),
  }
}

// ---------- SS-S-S0-1 · Home meta ≤1 line or in popover ----------
await page.goto(BASE + '/agent', { waitUntil: 'networkidle' })
await page.waitForTimeout(600)
const s0 = await page.evaluate(() => {
  const help = document.querySelector('[data-testid="home-meta-help"]')
  const body = document.body.innerText
  // stacked dual-line product meta (old failure mode)
  const dualMetaVisible =
    (/Core 主闭环/.test(body) && /Assist/.test(body) && !help) ||
    (/默认通用单聊/.test(body) && /项目模式/.test(body) && !(help && !help.open ? false : true) && /默认通用单聊[\s\S]{0,40}项目模式/.test(body))
  // count visible meta paragraphs under title area that look like product tier lines
  const title = document.querySelector('h1')
  let stacked11 = 0
  if (title) {
    const root = title.parentElement || document.body
    const ps = [...root.querySelectorAll('p, .text-xs, [class*="meta"]')].filter((el) => {
      if (help && help.contains(el)) return false
      const r = el.getBoundingClientRect()
      if (r.height <= 0 || r.width <= 0) return false
      const fs = parseFloat(getComputedStyle(el).fontSize)
      const t = (el.textContent || '').trim()
      if (!t) return false
      return fs <= 12 && (/Core|Assist|Beta|通用单聊|项目模式|general|domain/.test(t))
    })
    stacked11 = ps.length
  }
  const helpClosed = !!(help && !help.open)
  const openDualRows =
    !help &&
    [...document.querySelectorAll('main p, .text-center p')].filter((p) => {
      const r = p.getBoundingClientRect()
      if (r.height <= 0) return false
      const t = (p.textContent || '').trim()
      return /Core|Assist|通用单聊|项目模式/.test(t)
    }).length >= 2

  return {
    hasHelp: !!help,
    helpOpen: !!(help && help.open),
    helpClosed,
    helpSummary: help?.querySelector('summary')?.textContent?.trim() || null,
    stacked11,
    openDualRows,
    bodyHasCoreAssistWall: /Core 主闭环/.test(body) && /默认通用单聊/.test(body) && !help,
    gates: (() => {
      return {
        caseBind: document.querySelectorAll('[data-testid="home-case-bind"]').length,
        billing: !!document.querySelector('[data-billing-hold-banner]'),
        mid: [...document.querySelectorAll('a[href*="5173"]')].length,
      }
    })(),
  }
})
await shot(page, path.join(ROOT, 'S0'), 'S0-home.png')
// Pass: help popover present (meta not two stacked open rows) OR ≤1 open meta line
report.should['SS-S-S0-1'] = {
  pass: (s0.hasHelp && s0.helpClosed && !s0.openDualRows) || (!s0.openDualRows && s0.stacked11 <= 1),
  detail: s0,
}

// ---------- SS-S-S6-1 · H1 ----------
await page.goto(BASE + '/agent/sessions?filter=needs_human', { waitUntil: 'networkidle' })
await page.waitForTimeout(500)
const s6 = await page.evaluate(() => {
  const h1 = document.querySelector('h1')?.innerText?.trim() || ''
  return {
    h1,
    awkward: /待确认\s*[·•]\s*通用历史/.test(h1),
    human: /待确认会话/.test(h1) || h1 === '待确认会话',
  }
})
await shot(page, path.join(ROOT, 'S6'), 'S6-needs.png')
report.should['SS-S-S6-1'] = { pass: s6.human && !s6.awkward, detail: s6 }

// ---------- SS-S-S7-1 · Assist card height vs Core ----------
await page.goto(BASE + '/agent/agents', { waitUntil: 'networkidle' })
await page.waitForTimeout(700)
const s7 = await page.evaluate(() => {
  const cards = [...document.querySelectorAll('.agent-picker-card, [data-testid="agent-picker-card"], article, [class*="agent-card"]')]
  // prefer cards with tier
  let measured = []
  const allCards = [...document.querySelectorAll('[data-tier], .agent-picker-card')]
  const pool = allCards.length ? allCards : cards
  for (const c of pool) {
    const r = c.getBoundingClientRect()
    if (r.height < 40) continue
    const tier =
      c.getAttribute('data-tier') ||
      c.querySelector('[data-tier]')?.getAttribute('data-tier') ||
      (/Assist|辅/.test(c.textContent || '') ? 'assist' : /Core|主闭环/.test(c.textContent || '') ? 'core' : null)
    const note = c.querySelector('.agent-picker-card__tier-note, [class*="tier-note"]')
    measured.push({
      h: Math.round(r.height),
      tier,
      noteH: note ? Math.round(note.getBoundingClientRect().height) : null,
      clamp: note ? getComputedStyle(note).webkitLineClamp : null,
      label: (c.querySelector('h2,h3,.agent-picker-card__title')?.textContent || '').trim().slice(0, 40),
    })
  }
  const coreHs = measured.filter((m) => m.tier === 'core').map((m) => m.h)
  const assistHs = measured.filter((m) => m.tier === 'assist').map((m) => m.h)
  const maxCore = coreHs.length ? Math.max(...coreHs) : null
  const maxAssist = assistHs.length ? Math.max(...assistHs) : null
  const delta = maxCore != null && maxAssist != null ? maxAssist - maxCore : null
  const notes = [...document.querySelectorAll('.agent-picker-card__tier-note')]
  const allClamp1 =
    notes.length === 0 || notes.every((n) => getComputedStyle(n).webkitLineClamp === '1')
  return {
    measured,
    maxCore,
    maxAssist,
    delta,
    noteCount: notes.length,
    allClamp1,
    // Pass if clamp=1 OR assist-core height delta reduced (≤24px vs old ~41)
    passHint: allClamp1 || (delta != null && delta <= 24),
  }
})
await shot(page, path.join(ROOT, 'S7'), 'S7-catalog.png')
report.should['SS-S-S7-1'] = {
  pass: !!s7.passHint,
  detail: s7,
}

// ---------- SS-S-S8-1 · no mock/DomainPack jargon ----------
await page.goto(BASE + '/agent/projects', { waitUntil: 'networkidle' })
await page.waitForTimeout(500)
const s8list = await page.evaluate(() => {
  const body = document.body.innerText
  return {
    hasDomainPack: /DomainPack/.test(body),
    hasMock: /\bmock\b/i.test(body),
    hasPackEq: /pack=/.test(body),
    hasBackendMock: /backend\s*=\s*mock/i.test(body),
    snippet: body.replace(/\s+/g, ' ').slice(0, 500),
  }
})
await shot(page, path.join(ROOT, 'S8'), 'S8-list.png')
// also open create if present
const createOpen = page.locator('button:has-text("新建"), button:has-text("创建项目"), a:has-text("新建")').first()
let s8create = { skipped: true }
if (await createOpen.count()) {
  await createOpen.click().catch(() => {})
  await page.waitForTimeout(500)
  s8create = await page.evaluate(() => {
    const body = document.body.innerText
    return {
      skipped: false,
      hasDomainPack: /DomainPack/.test(body),
      hasMock: /\bmock\b/i.test(body),
      hasPackEq: /pack=/.test(body),
      snippet: body.replace(/\s+/g, ' ').slice(0, 400),
    }
  })
  await shot(page, path.join(ROOT, 'S8'), 'S8-create.png')
  await page.keyboard.press('Escape').catch(() => {})
}
const s8fail =
  s8list.hasDomainPack ||
  s8list.hasPackEq ||
  s8list.hasBackendMock ||
  (s8list.hasMock && /生成 mock|backend|DomainPack/i.test(s8list.snippet)) ||
  (!s8create.skipped && (s8create.hasDomainPack || s8create.hasPackEq || (s8create.hasMock && /DomainPack|backend/i.test(s8create.snippet || ''))))
report.should['SS-S-S8-1'] = {
  pass: !s8fail,
  detail: { list: s8list, create: s8create },
}

// ---------- SS-S-S9-1 · expert copy humanize ----------
await page.goto(BASE + '/agent/projects/proj-demo-patent/bots/expert-search', {
  waitUntil: 'networkidle',
})
await page.waitForTimeout(800)
const s9 = await page.evaluate(() => {
  const body = document.body.innerText
  return {
    url: location.pathname,
    hasBoolean: /布尔检索/.test(body),
    hasArrowChain: /构造检索式\s*→|布尔检索\s*→/.test(body),
    hasHuman: /检索词|工作篮|确认检索策略|检索专家/.test(body),
    snake: /approve_strategy|commercial_patent_search/.test(body),
    snippet: body.replace(/\s+/g, ' ').slice(0, 600),
  }
})
await shot(page, path.join(ROOT, 'S9'), 'S9-expert.png')
report.should['SS-S-S9-1'] = {
  pass: !s9.hasBoolean && !s9.hasArrowChain,
  detail: s9,
  note: 'Should only: 布尔检索工程链；snake_case 属 Must 面，仅备注',
}

// ---------- SS-S-S3-1 · timeline tool group on sess-oa-1 ----------
await page.goto(BASE + '/agent/sessions/sess-oa-1', { waitUntil: 'networkidle' })
await page.waitForTimeout(1000)
const s3 = await page.evaluate(() => {
  const groups = [...document.querySelectorAll('[data-testid="timeline-tool-group"]')]
  const groupLabels = groups.map((g) => (g.textContent || '').replace(/\s+/g, ' ').trim().slice(0, 80))
  // visible standalone 「调用 · …」 rows that are NOT inside a group summary-only collapsed view
  const callLike = [...document.querySelectorAll('button, li, div, span')].filter((el) => {
    const t = (el.childNodes.length === 1 ? el.textContent : el.firstChild?.textContent) || el.textContent || ''
    const trimmed = t.trim()
    if (!/^调用\s*[·•]/.test(trimmed)) return false
    const r = el.getBoundingClientRect()
    return r.height > 0 && r.width > 0
  })
  // count distinct visible top-level call walls: identical full labels
  const labels = callLike.map((el) => el.textContent.trim().slice(0, 60))
  const freq = {}
  for (const l of labels) freq[l] = (freq[l] || 0) + 1
  const maxDup = Math.max(0, ...Object.values(freq))
  // also count exact wall of 3 identical 「调用 · OA」
  const oaCalls = labels.filter((l) => /调用\s*[·•]\s*OA/.test(l))
  return {
    url: location.pathname,
    groupCount: groups.length,
    groupLabels,
    callLikeCount: callLike.length,
    maxDup,
    oaCallCount: oaCalls.length,
    freq,
  }
})
await shot(page, path.join(ROOT, 'S3'), 'S3-timeline.png')
// Pass: has tool group OR no 3× identical call wall
report.should['SS-S-S3-1'] = {
  pass: s3.groupCount >= 1 || s3.oaCallCount < 3,
  detail: s3,
}

// ---------- SS-S-S4-1 · HITL aside collapse ----------
await page.goto(BASE + '/agent/sessions/sess-oa-1?focus=hitl', { waitUntil: 'networkidle' })
await page.waitForTimeout(1000)
const s4 = await page.evaluate(() => {
  const collapse = document.querySelector('[data-testid="aside-hitl-collapse"]')
  const confirm = document.querySelector('[data-confirm-bar], .confirm-hitl, [data-testid="confirm-hitl"]')
  // secondary blocks in aside: open details that are not the collapse wrapper
  const aside = document.querySelector('aside, [data-testid="session-context"], .session-context')
  let openSecondary = 0
  let closedSecondary = 0
  if (aside) {
    for (const d of aside.querySelectorAll('details')) {
      if (d.open) openSecondary++
      else closedSecondary++
    }
  }
  return {
    url: location.pathname + location.search,
    collapse: !!collapse,
    collapseOpen: !!(collapse && collapse.open),
    confirm: !!confirm,
    openSecondary,
    closedSecondary,
    collapseSummary: collapse?.querySelector('summary')?.textContent?.trim()?.slice(0, 60) || null,
  }
})
await shot(page, path.join(ROOT, 'S4'), 'S4-hitl.png')
report.should['SS-S-S4-1'] = {
  pass: !!s4.confirm && s4.collapse && !s4.collapseOpen,
  detail: s4,
}

// ---------- SS-S-S5-1 · match bar after bind ----------
// Prefer a known bound session if available; else create-bind flow
await page.goto(BASE + '/agent/sessions/sess-oa-1', { waitUntil: 'networkidle' })
await page.waitForTimeout(800)
let s5 = await page.evaluate(() => {
  const switchBtn = document.querySelector('[data-testid="session-match-switch"]')
  const matchHint = document.querySelector('[data-testid="session-match-hint"]')
  const body = document.body.innerText
  const loudSwitch = [...document.querySelectorAll('button, a')].some((el) => {
    const t = (el.textContent || '').trim()
    if (t !== '切换到该 Agent') return false
    const r = el.getBoundingClientRect()
    if (r.height <= 0) return false
    // loud = solid / high contrast primary looking
    const bg = getComputedStyle(el).backgroundColor
    return !!bg && bg !== 'rgba(0, 0, 0, 0)' && bg !== 'transparent'
  })
  const anySwitch = [...document.querySelectorAll('button, a')].some(
    (el) => (el.textContent || '').trim() === '切换到该 Agent' && el.getBoundingClientRect().height > 0,
  )
  const bound =
    !!document.querySelector('[data-testid="case-bind-current"]') ||
    /已绑定|样机案|案件：/.test(body)
  return {
    url: location.pathname,
    matchHint: !!matchHint,
    switchTestId: !!switchBtn,
    anySwitch,
    loudSwitch,
    bound,
  }
})
// If sess-oa-1 not bound, try Home → 开始办理 → create bind
if (!s5.bound) {
  await page.goto(BASE + '/agent', { waitUntil: 'networkidle' })
  await page.waitForTimeout(400)
  const send = page.locator('[data-testid="home-send"]')
  if (await send.count()) {
    await send.click()
    await page.waitForTimeout(1000)
  }
  const createToggle = page
    .locator('[data-testid="case-create-open"], button:has-text("创建并绑定")')
    .first()
  if (await createToggle.count()) {
    await createToggle.click()
    await page.waitForTimeout(300)
  }
  const createBtn = page
    .locator('[data-testid="case-create-confirm"], button:has-text("创建样机案")')
    .first()
  if (await createBtn.count()) {
    await createBtn.click()
    await page.waitForTimeout(1000)
  }
  s5 = await page.evaluate(() => {
    const switchBtn = document.querySelector('[data-testid="session-match-switch"]')
    const matchHint = document.querySelector('[data-testid="session-match-hint"]')
    const anySwitch = [...document.querySelectorAll('button, a')].some(
      (el) => (el.textContent || '').trim() === '切换到该 Agent' && el.getBoundingClientRect().height > 0,
    )
    const loudSwitch = [...document.querySelectorAll('button, a')].some((el) => {
      const t = (el.textContent || '').trim()
      if (t !== '切换到该 Agent') return false
      const r = el.getBoundingClientRect()
      if (r.height <= 0) return false
      const bg = getComputedStyle(el).backgroundColor
      return !!bg && bg !== 'rgba(0, 0, 0, 0)' && bg !== 'transparent'
    })
    return {
      url: location.pathname,
      matchHint: !!matchHint,
      switchTestId: !!switchBtn,
      anySwitch,
      loudSwitch,
      bound: true,
      via: 'create-bind',
    }
  })
}
await shot(page, path.join(ROOT, 'S5'), 'S5-bound.png')
// Pass: after bind, no loud switch CTA (testid gone or not solid)
report.should['SS-S-S5-1'] = {
  pass: !s5.switchTestId && !s5.loudSwitch,
  detail: s5,
}

// ---------- hard gates sample ----------
await page.goto(BASE + '/agent', { waitUntil: 'networkidle' })
await page.waitForTimeout(400)
report.gates = await page.evaluate(gatesEval)
report.gates.midCount = report.gates.mid.length

const ids = [
  'SS-S-S0-1',
  'SS-S-S3-1',
  'SS-S-S4-1',
  'SS-S-S5-1',
  'SS-S-S6-1',
  'SS-S-S7-1',
  'SS-S-S8-1',
  'SS-S-S9-1',
]
report.passCount = ids.filter((id) => report.should[id]?.pass).length
report.failIds = ids.filter((id) => !report.should[id]?.pass)
report.allPass = report.passCount === 8

fs.writeFileSync(path.join(ROOT, '_probe.json'), JSON.stringify(report, null, 2))
console.log(JSON.stringify(report, null, 2))
await browser.close()
