/**
 * Full newbie path walk + residual diagnostics (screenshots under flow/)
 */
import { chromium } from 'playwright'
import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const OUT = path.join(__dirname, 'flow')
const BASE = 'http://127.0.0.1:8766'
const findings = []
const steps = []

function note(sev, where, msg, extra) {
  findings.push({ sev, where, msg, ...(extra ? { extra } : {}) })
}

async function seed(page, { hasCase = true, active = 'c1', mode = 'assistant', role = 'enterprise' } = {}) {
  await page.addInitScript(({ hasCase, active, mode, role }) => {
    localStorage.setItem('mpv2-role', role)
    localStorage.setItem('mpv2-has-case', hasCase ? '1' : '0')
    localStorage.setItem('mpv2-active-case', active || '')
    localStorage.setItem('mpv2-mode', mode)
  }, { hasCase, active, mode, role })
}

async function shot(page, name) {
  const fp = path.join(OUT, name)
  await page.screenshot({ path: fp, fullPage: false })
  return fp
}

async function scanPage(page, where, { expectMode, expectGapCtaMax, expectEmptyVisible, expectEmptyHidden, expectDeptsFolded, expectNeedOne } = {}) {
  const d = await page.evaluate(({ expectMode }) => {
    const t = document.body.innerText
    const modeActive = [...document.querySelectorAll('.mode-switch button[data-mode].active')].map(b => b.dataset.mode)
    const inkVisible = [...document.querySelectorAll('a.btn-ink, button.btn-ink')]
      .filter(el => el.offsetParent !== null)
      .map(el => (el.textContent || '').trim().replace(/\s+/g, ' ').slice(0, 40))
    const gapLike = inkVisible.filter(s => /卡点|去当前部门|去干活|缺口主/.test(s))
    const companyCta = document.querySelector('[data-testid="company-gap-cta"]')
    const depts = document.querySelector('[data-company-fold="depts"]')
    const need = document.querySelector('[data-company-fold="need-me"]')
    const empties = [...document.querySelectorAll('.empty-state, [data-prof-empty], [data-cases-empty], [data-docket-empty], [data-billing-empty], [data-members-empty], [data-testid="prof-empty"]')]
      .map(el => ({
        sel: el.getAttribute('data-testid') || el.getAttribute('data-prof-empty') != null ? 'prof-empty' : (el.className || '').slice(0, 40),
        hidden: el.classList.contains('hidden') || el.hasAttribute('hidden') || getComputedStyle(el).display === 'none',
        text: (el.innerText || '').slice(0, 80).replace(/\s+/g, ' '),
      }))
    // a11y: buttons without accessible name, images without alt, duplicate h1
    const badBtns = [...document.querySelectorAll('button')].filter(b => {
      const name = (b.getAttribute('aria-label') || b.textContent || '').trim()
      return !name && b.offsetParent !== null
    }).length
    const badImgs = [...document.querySelectorAll('img')].filter(i => i.getAttribute('alt') == null && i.offsetParent !== null).length
    const h1n = document.querySelectorAll('h1').length
    const pageSub = document.querySelector('.page-sub:not(.hidden)')?.textContent?.trim() || ''
    const title = document.querySelector('.page-title')?.textContent?.trim() || document.title
    // residual jargon / broken phrases often left behind
    const jargonHits = []
    for (const re of [/阻塞交卷/, /未齐套交卷禁用/, /登录后同缺口在首页/, /同一缺口会出现在首页/, /齐套中/, /绝限强调/, /业务目标/, /侧栏已收起/, /不混账/]) {
      if (re.test(t)) jargonHits.push(re.source)
    }
    return {
      url: location.href,
      modeActive,
      modeStored: localStorage.getItem('mpv2-mode'),
      inkVisible,
      gapLike,
      hasCompanyCta: !!companyCta,
      companyCtaText: companyCta ? companyCta.textContent.trim() : '',
      deptsOpen: depts ? depts.open : null,
      needOpen: need ? need.open : null,
      needItems: need ? need.querySelectorAll('.rail-item').length : null,
      empties,
      badBtns,
      badImgs,
      h1n,
      pageSub: pageSub.slice(0, 100),
      title,
      jargonHits,
      head: t.slice(0, 200).replace(/\s+/g, ' '),
    }
  }, { expectMode })

  steps.push({ where, ...d })

  if (expectMode && !(d.modeActive.length === 1 && d.modeActive[0] === expectMode)) {
    // home forces assistant; other pages may highlight differently — only flag if mode switch exists and wrong
    if (d.modeActive.length) note('warn', where, `顶栏高亮=${d.modeActive.join(',')} 期望=${expectMode}`, d.modeActive)
  }
  if (typeof expectGapCtaMax === 'number' && d.gapLike.length > expectGapCtaMax) {
    note('fail', where, `缺口类墨色 CTA 过多 (${d.gapLike.length}>${expectGapCtaMax})`, d.gapLike)
  }
  if (expectDeptsFolded === true && d.deptsOpen === true) {
    note('fail', where, '七部默认应折却开着')
  }
  if (expectNeedOne === true && d.needItems !== 1) {
    note('warn', where, `need-me 条数=${d.needItems} 期望1`)
  }
  if (expectEmptyVisible) {
    const vis = d.empties.filter(e => !e.hidden)
    if (!vis.length) note('fail', where, '期望空态可见但没有')
  }
  if (expectEmptyHidden) {
    const vis = d.empties.filter(e => !e.hidden && e.text)
    // if list content present, empty should be hidden — checked by caller
  }
  if (d.jargonHits.length) note('fail', where, '残留旧词', d.jargonHits)
  if (d.badBtns > 0) note('warn', where, `无障碍名按钮 ${d.badBtns}`)
  if (d.h1n !== 1) note('warn', where, `h1 数量=${d.h1n}`)
  if (d.badImgs > 0) note('info', where, `img 缺 alt ${d.badImgs}`)

  return d
}

async function main() {
  fs.mkdirSync(OUT, { recursive: true })
  const browser = await chromium.launch({ headless: true, channel: 'chrome' })
  const ctx = await browser.newContext({ viewport: { width: 1440, height: 900 } })

  // 01 welcome
  {
    const page = await ctx.newPage()
    await page.goto(`${BASE}/welcome.html`, { waitUntil: 'networkidle' })
    await page.waitForTimeout(300)
    await scanPage(page, '01-welcome')
    await shot(page, '01-welcome.png')
    // click login
    await page.click('a.btn-primary[href*="login"], a[href="login.html"]')
    await page.waitForURL(/login\.html/)
    await page.waitForTimeout(200)
    await scanPage(page, '02-login')
    await shot(page, '02-login.png')
    await page.click('#go')
    await page.waitForURL(/home\.html/)
    await page.waitForTimeout(400)
    const home = await scanPage(page, '03-home-assistant', { expectMode: 'assistant', expectGapCtaMax: 0 })
    await shot(page, '03-home-assistant.png')
    if (home.gapLike.length) note('fail', '03-home-assistant', 'home 仍有缺口类墨色 CTA', home.gapLike)
    await page.close()
  }

  // 04 project → company (active case)
  {
    const page = await ctx.newPage()
    await seed(page, { hasCase: true, active: 'c1', mode: 'assistant' })
    await page.goto(`${BASE}/home.html?role=enterprise&case=c1`, { waitUntil: 'networkidle' })
    await page.waitForTimeout(300)
    await page.click('button[data-mode="project"]')
    await page.waitForTimeout(800)
    const co = await scanPage(page, '04-company-gap', { expectMode: 'project', expectGapCtaMax: 1, expectDeptsFolded: true, expectNeedOne: true })
    await shot(page, '04-company-gap.png')
    if (!co.hasCompanyCta) note('fail', '04-company-gap', '缺 company-gap-cta')
    if (co.gapLike.length !== 1) note('fail', '04-company-gap', `缺口 CTA 数=${co.gapLike.length}`, co.gapLike)
    // follow CTA to dept
    const cta = page.locator('[data-testid="company-gap-cta"]')
    if (await cta.count()) {
      await cta.click()
      await page.waitForTimeout(800)
      await scanPage(page, '05-dept-right', { expectMode: 'project' })
      await shot(page, '05-dept-right.png')
      const right = await page.evaluate(() => {
        const t = document.body.innerText
        return {
          hasGate: /还缺|已齐|通过|驳回|还不能交出去/.test(t),
          hasComposer: !!document.querySelector('textarea, .composer, [data-chat-input]'),
        }
      })
      if (!right.hasGate) note('fail', '05-dept-right', '右栏闸/白话不见')
      steps[steps.length - 1].right = right
    } else {
      note('fail', '05-dept-right', '无法点击 company-gap-cta')
    }
    await page.close()
  }

  // 06 project no-active → cases
  {
    const page = await ctx.newPage()
    await seed(page, { hasCase: true, active: '', mode: 'assistant' })
    await page.goto(`${BASE}/home.html?role=enterprise&hascase=1&noactive=1`, { waitUntil: 'networkidle' })
    await page.waitForTimeout(300)
    await page.click('button[data-mode="project"]')
    await page.waitForTimeout(800)
    await scanPage(page, '06-cases-noactive', { expectMode: 'project' })
    await shot(page, '06-cases.png')
    if (!/cases\.html/.test(page.url())) note('fail', '06-cases-noactive', '未落到 cases: ' + page.url())
    await page.close()
  }

  // 07 project none → case-new
  {
    const page = await ctx.newPage()
    await seed(page, { hasCase: false, active: '', mode: 'assistant' })
    await page.goto(`${BASE}/home.html?role=enterprise&nocase=1`, { waitUntil: 'networkidle' })
    await page.waitForTimeout(300)
    await page.click('button[data-mode="project"]')
    await page.waitForTimeout(800)
    await scanPage(page, '07-case-new', { expectMode: 'project' })
    await shot(page, '07-case-new.png')
    if (!/case-new\.html/.test(page.url())) note('fail', '07-case-new', '未落到 case-new: ' + page.url())
    await page.close()
  }

  // 08 professional with case
  {
    const page = await ctx.newPage()
    await seed(page, { hasCase: true, active: 'c1', mode: 'studio' })
    await page.goto(`${BASE}/professional.html?role=enterprise&case=c1`, { waitUntil: 'networkidle' })
    await page.waitForTimeout(500)
    await scanPage(page, '08-professional', { expectMode: 'studio' })
    await shot(page, '08-professional.png')
    await page.close()
  }

  // 09 professional empty
  {
    const page = await ctx.newPage()
    await seed(page, { hasCase: false, active: '', mode: 'studio' })
    await page.goto(`${BASE}/professional.html?role=enterprise&nocase=1`, { waitUntil: 'networkidle' })
    await page.waitForTimeout(500)
    const pe = await scanPage(page, '09-professional-empty', { expectMode: 'studio', expectEmptyVisible: true })
    await shot(page, '09-professional-empty.png')
    const fake = await page.evaluate(() => {
      const box = document.querySelector('[data-testid="prof-empty"], [data-prof-empty]')
      const vis = box && !box.classList.contains('hidden')
      const cards = document.querySelectorAll('.prof-card').length
      return { vis, cards }
    })
    if (!fake.vis || fake.cards > 0) note('fail', '09-professional-empty', '专业无案空态假或仍有卡', fake)
    await page.close()
  }

  // 10-12 logistics weak
  for (const [name, file] of [['10-docket', 'docket.html'], ['11-billing', 'billing.html'], ['12-members', 'members.html']]) {
    const page = await ctx.newPage()
    await seed(page, { hasCase: true, active: 'c1', mode: 'project' })
    await page.goto(`${BASE}/${file}?role=enterprise&case=c1`, { waitUntil: 'networkidle' })
    await page.waitForTimeout(300)
    const d = await scanPage(page, name, { expectGapCtaMax: 0 })
    await shot(page, `${name}.png`)
    const weak = await page.evaluate(() => {
      const ret = !!document.querySelector('[data-logistics-return], .logistics-return')
      const inkGap = [...document.querySelectorAll('a.btn-ink, button.btn-ink')]
        .filter(el => el.offsetParent !== null)
        .filter(el => /卡点|去当前部门/.test(el.textContent || ''))
      return { ret, inkGap: inkGap.map(e => e.textContent.trim()) }
    })
    if (!weak.ret) note('warn', name, '缺后勤回链')
    if (weak.inkGap.length) note('fail', name, '后勤页出现公司缺口主 CTA', weak.inkGap)
    // empty should be hidden when content present
    const emptyVis = d.empties.filter(e => !e.hidden)
    if (emptyVis.length) note('warn', name, '有内容时空态仍可见', emptyVis)
    await page.close()
  }

  // 13 cases with content — empty hidden
  {
    const page = await ctx.newPage()
    await seed(page, { hasCase: true, active: 'c1', mode: 'project' })
    await page.goto(`${BASE}/cases.html?role=enterprise&case=c1`, { waitUntil: 'networkidle' })
    await page.waitForTimeout(400)
    const d = await scanPage(page, '13-cases-filled')
    await shot(page, '13-cases-filled.png')
    const emptyVis = d.empties.filter(e => !e.hidden)
    if (emptyVis.length) note('fail', '13-cases-filled', '有案子时空态仍可见', emptyVis)
    await page.close()
  }

  // 14 dept direct vernacular
  {
    const page = await ctx.newPage()
    await seed(page, { hasCase: true, active: 'c1', mode: 'project' })
    await page.goto(`${BASE}/dept.html?role=enterprise&case=c1&dept=disclosure`, { waitUntil: 'networkidle' })
    await page.waitForTimeout(500)
    await scanPage(page, '14-dept-disclosure')
    await shot(page, '14-dept-disclosure.png')
    await page.close()
  }

  // 15 home secondary weak links only
  {
    const page = await ctx.newPage()
    await seed(page, { hasCase: true, active: 'c1', mode: 'assistant' })
    await page.goto(`${BASE}/home.html?role=enterprise&case=c1`, { waitUntil: 'networkidle' })
    await page.waitForTimeout(300)
    // open logistics from avatar if present
    const hasLog = await page.evaluate(() => {
      const links = [...document.querySelectorAll('a[href*="docket"], a[href*="billing"], a[href*="members"]')]
      return links.map(a => ({ href: a.getAttribute('href'), text: a.textContent.trim(), inAvatar: !!a.closest('details') }))
    })
    steps.push({ where: '15-logistics-entry', hasLog })
    if (!hasLog.length) note('warn', '15-logistics-entry', '顶栏/头像无后勤弱链')
    await shot(page, '15-home-logistics-entry.png')
    await page.close()
  }

  await browser.close()

  const report = {
    at: new Date().toISOString(),
    findings,
    fail: findings.filter(f => f.sev === 'fail'),
    warn: findings.filter(f => f.sev === 'warn'),
    steps: steps.map(s => ({
      where: s.where,
      url: s.url,
      modeActive: s.modeActive,
      gapLike: s.gapLike,
      jargonHits: s.jargonHits,
      deptsOpen: s.deptsOpen,
      needItems: s.needItems,
      empties: s.empties,
      badBtns: s.badBtns,
      h1n: s.h1n,
      pageSub: s.pageSub,
      title: s.title,
      right: s.right,
      hasLog: s.hasLog,
    })),
  }
  fs.writeFileSync(path.join(OUT, 'flow-report.json'), JSON.stringify(report, null, 2))
  console.log(JSON.stringify({
    failN: report.fail.length,
    warnN: report.warn.length,
    fails: report.fail,
    warns: report.warn,
    shotDir: OUT,
  }, null, 2))
  process.exit(report.fail.length ? 1 : 0)
}

main().catch(e => { console.error(e); process.exit(2) })
