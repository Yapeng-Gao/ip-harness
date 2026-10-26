/**
 * 主路径 v2 收口验收 —— 缺口主 CTA 只落公司 / 登录助手 / 三态 / 右栏 / 专业无案空态
 * + welcome 宣传桥接公司 / 案盘可发现 / 开案短字段 / delegate 非第一跳 / 后勤弱入口
 * + 三 tab 关系 / 当前部露出 / 让该部开工
 */
import { chromium } from 'playwright'
import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const OUT = __dirname
const BASE = 'http://127.0.0.1:8766'
const notes = []
const evidence = {}
let passN = 0, failN = 0

function pass(k, msg) { passN++; notes.push(`PASS ${k}: ${msg}`); }
function fail(k, msg) { failN++; notes.push(`FAIL ${k}: ${msg}`); }

async function seed(page, { hasCase = true, active = 'c1', mode = 'assistant', role = 'enterprise' } = {}) {
  await page.addInitScript(({ hasCase, active, mode, role }) => {
    localStorage.setItem('mpv2-role', role)
    localStorage.setItem('mpv2-has-case', hasCase ? '1' : '0')
    localStorage.setItem('mpv2-active-case', active || '')
    localStorage.setItem('mpv2-mode', mode)
  }, { hasCase, active, mode, role })
}

async function shot(page, name) {
  await page.screenshot({ path: path.join(OUT, name), fullPage: false })
}

function kickersOk(arr) {
  return arr.every(k => /当前在办\/缺口/.test(k))
}

async function main() {
  fs.mkdirSync(OUT, { recursive: true })
  const browser = await chromium.launch({ headless: true, channel: 'chrome' })
  const ctx = await browser.newContext({ viewport: { width: 1440, height: 900 } })

  // ---- L: login → home 助手高亮、无墨色缺口大卡 ----
  {
    const page = await ctx.newPage()
    await page.goto(`${BASE}/login.html`, { waitUntil: 'networkidle', timeout: 30000 })
    await page.waitForTimeout(200)
    await page.click('#go')
    await page.waitForURL(/home\.html/, { timeout: 10000 })
    await page.waitForTimeout(400)
    const L = await page.evaluate(() => {
      const mode = localStorage.getItem('mpv2-mode')
      const asstActive = !!document.querySelector('.mode-switch button[data-mode="assistant"].active')
      const gapCard = document.querySelector('.gap-primary-card, [data-home-gap="has"] .btn-ink, [data-testid="home-action-primary"]')
      // ink buttons that are NOT the assistant goal submit / no-case open
      const inkAll = [...document.querySelectorAll('a.btn-ink, button.btn-ink')].map(el => (el.textContent || '').trim())
      const inkGapLike = inkAll.filter(t => /缺口|去干活|去当前部门|卡点/.test(t))
      const weak = !!document.querySelector('[data-testid="home-secondary-actions"], a.weak-link[href*="company"]')
      return { mode, asstActive, hasGapCard: !!gapCard, inkGapLike, weak, url: location.href }
    })
    evidence.L_login = L
    if (L.mode === 'assistant' && L.asstActive) pass('L_login_assistant', 'login→home 助手高亮')
    else fail('L_login_assistant', JSON.stringify(L))
    if (!L.hasGapCard && L.inkGapLike.length === 0) pass('L_no_gap_card', 'home 无墨色缺口大卡')
    else fail('L_no_gap_card', JSON.stringify(L))
    if (L.weak) pass('L_weak_links', '弱链可见')
    else fail('L_weak_links', JSON.stringify(L))
    await shot(page, 'L-login-home-assistant.png')
    await page.close()
  }

  // ---- A1: 有活跃案 → 点项目 → company ----
  {
    const page = await ctx.newPage()
    await seed(page, { hasCase: true, active: 'c1', mode: 'assistant' })
    await page.goto(`${BASE}/home.html?role=enterprise&case=c1`, { waitUntil: 'networkidle', timeout: 30000 })
    await page.waitForTimeout(400)
    const homeMode = await page.evaluate(() => localStorage.getItem('mpv2-mode'))
    evidence.A1_homeModeForced = homeMode
    if (homeMode === 'assistant') pass('A1_home_assistant', 'home 强制助手态')
    else fail('A1_home_assistant', `mode=${homeMode}`)
    await page.click('button[data-mode="project"]')
    await page.waitForTimeout(800)
    const url = page.url()
    evidence.A1_url = url
    if (/company\.html/.test(url)) pass('A1_project_active', '有活跃→company')
    else fail('A1_project_active', url)
    await shot(page, 'A1-project-active-company.png')

    const fill = await page.evaluate(() => {
      const t = document.body.innerText
      const cta = document.querySelector('[data-testid="company-gap-cta"]')
      const inkCtas = [...document.querySelectorAll('a.btn-ink, button.btn-ink')]
        .filter(el => el.offsetParent !== null)
        .map(el => (el.textContent || '').trim())
      const gapCtas = inkCtas.filter(t => /卡点|去当前部门/.test(t))
      const need = document.querySelector('[data-company-fold="need-me"]')
      const depts = document.querySelector('[data-company-fold="depts"]')
      const needItems = need ? need.querySelectorAll('.rail-item').length : -1
      const currentDept = document.querySelector('[data-company-current-dept]')
      const currentVisible = !!(currentDept && !currentDept.classList.contains('hidden') && currentDept.offsetParent !== null)
      const currentText = currentDept ? currentDept.innerText.replace(/\s+/g, ' ').slice(0, 120) : ''
      return {
        hasCta: !!cta,
        ctaText: cta ? cta.textContent.trim() : '',
        gapCtaCount: gapCtas.length,
        inkCtas,
        needOpen: need ? need.open : null,
        deptsOpen: depts ? depts.open : null,
        needItems,
        currentVisible,
        currentText,
        hasCaseStrip: /卡点|缺口|需我|交底|下一步|谁在干/.test(t),
        hasDeptGrid: !!document.querySelector('.dept-grid') || /立项|撰写|附图|递交/.test(t),
        textHead: t.slice(0, 220).replace(/\s+/g, ' '),
      }
    })
    evidence.A1_company = fill
    if (fill.hasCta && fill.gapCtaCount === 1) pass('A1_company_gap_cta', `唯一缺口主 CTA: ${fill.ctaText}`)
    else fail('A1_company_gap_cta', JSON.stringify(fill))
    if (fill.currentVisible && /交底|当前部/.test(fill.currentText)) pass('A1_current_dept', '当前部默认露出')
    else fail('A1_current_dept', JSON.stringify({ currentVisible: fill.currentVisible, currentText: fill.currentText }))
    if (fill.deptsOpen === false) pass('A1_other_depts_folded', '其余部门默认折')
    else fail('A1_other_depts_folded', `deptsOpen=${fill.deptsOpen}`)
    if (fill.needOpen === true && fill.needItems === 1) pass('A1_need_one', '有缺口 need-me 只开一条')
    else fail('A1_need_one', JSON.stringify({ needOpen: fill.needOpen, needItems: fill.needItems }))
    if (fill.hasCaseStrip) pass('A1_company_fill', '公司案况可见')
    else fail('A1_company_fill', JSON.stringify(fill))
    await shot(page, 'A1b-company-gap-cta.png')
    await page.close()
  }

  // ---- A2: 有案无活跃 → cases ----
  {
    const page = await ctx.newPage()
    await seed(page, { hasCase: true, active: '', mode: 'assistant' })
    await page.goto(`${BASE}/home.html?role=enterprise&hascase=1&noactive=1`, { waitUntil: 'networkidle', timeout: 30000 })
    await page.waitForTimeout(300)
    await page.click('button[data-mode="project"]')
    await page.waitForTimeout(800)
    const url = page.url()
    evidence.A2_url = url
    if (/cases\.html/.test(url)) pass('A2_project_noactive', '有案无活跃→cases')
    else fail('A2_project_noactive', url)
    await shot(page, 'A2-project-noactive-cases.png')
    await page.close()
  }

  // ---- A3: 无案 → case-new ----
  {
    const page = await ctx.newPage()
    await seed(page, { hasCase: false, active: '', mode: 'assistant' })
    await page.goto(`${BASE}/home.html?role=enterprise&nocase=1`, { waitUntil: 'networkidle', timeout: 30000 })
    await page.waitForTimeout(300)
    await page.click('button[data-mode="project"]')
    await page.waitForTimeout(800)
    const url = page.url()
    evidence.A3_url = url
    if (/case-new\.html/.test(url)) pass('A3_project_none', '无案→case-new')
    else fail('A3_project_none', url)
    await shot(page, 'A3-project-none-case-new.png')
    await page.close()
  }

  // ---- B: 专业卡 当前在办/缺口 + MCP 收折 ----
  {
    const page = await ctx.newPage()
    await seed(page, { hasCase: true, active: 'c1', mode: 'studio' })
    await page.goto(`${BASE}/professional.html?role=enterprise&case=c1`, { waitUntil: 'networkidle', timeout: 30000 })
    await page.waitForTimeout(500)
    const prof = await page.evaluate(() => {
      const kickers = [...document.querySelectorAll('.prof-status-kicker')].map(e => e.textContent.trim())
      const details = document.querySelector('#prof-skills-mcp, details.prof-advanced')
      const mcpOpen = details ? details.open : null
      const mcpSummary = details?.querySelector('summary')?.textContent?.trim() || ''
      const htmlHidden = document.documentElement.classList.contains('hidden')
      const htmlDisplay = getComputedStyle(document.documentElement).display
      const cardsVisible = [...document.querySelectorAll('.prof-card')].filter(c => c.offsetParent !== null).length
      return { kickers: kickers.slice(0, 3), kickerCount: kickers.length, mcpOpen, mcpSummary, hasGo: [...document.querySelectorAll('[data-go-dept]')].length, htmlHidden, htmlDisplay, cardsVisible }
    })
    evidence.B_prof = prof
    if (!prof.htmlHidden && prof.htmlDisplay !== 'none' && prof.cardsVisible >= 5) pass('B_prof_visible', `专业有案可见×${prof.cardsVisible}`)
    else fail('B_prof_visible', JSON.stringify(prof))
    if (prof.kickerCount >= 5 && kickersOk(prof.kickers)) pass('B_prof_status', `专业卡在办/缺口 ×${prof.kickerCount}`)
    else fail('B_prof_status', JSON.stringify(prof))
    if (prof.mcpOpen === false && /技能|MCP/.test(prof.mcpSummary)) pass('B_mcp_folded', '技能/MCP 默认收折')
    else fail('B_mcp_folded', JSON.stringify(prof))
    await shot(page, 'B-professional.png')
    await page.close()
  }

  // ---- C: home 仅助手主叙事（无墨色缺口大卡） ----
  {
    const page = await ctx.newPage()
    await seed(page, { hasCase: true, active: 'c1', mode: 'assistant' })
    await page.goto(`${BASE}/home.html?role=enterprise&case=c1`, { waitUntil: 'networkidle', timeout: 30000 })
    await page.waitForTimeout(400)
    const home = await page.evaluate(() => {
      const t = document.body.innerText
      const asstSub = [...document.querySelectorAll('[data-show-mode="assistant"]')].some(e => !e.classList.contains('hidden'))
      const projSub = [...document.querySelectorAll('[data-show-mode="project"]')].some(e => !e.classList.contains('hidden'))
      const gapCard = !!document.querySelector('.gap-primary-card')
      const asstActive = !!document.querySelector('.mode-switch button[data-mode="assistant"].active')
      return {
        asstSub, projSub, gapCard, asstActive,
        hasWeak: /进公司|开案子|案盘|全部案子/.test(t) || !!document.querySelector('a[href*="company"], a[href*="case-new"], a[href*="cases"]'),
        noCompanyFill: !document.querySelector('.dept-grid, #company-dept-grid, [data-testid="company-dept-grid"]'),
        head: t.slice(0, 200).replace(/\s+/g, ' '),
      }
    })
    evidence.C_home = home
    if (home.asstSub && !home.projSub && home.noCompanyFill && !home.gapCard && home.asstActive) pass('C_home_assistant_only', 'home 仅助手叙事·无缺口大卡')
    else fail('C_home_assistant_only', JSON.stringify(home))
    await shot(page, 'C-home-assistant.png')
    await page.close()
  }

  // ---- D: 右栏闸 dept ----
  {
    const page = await ctx.newPage()
    await seed(page, { hasCase: true, active: 'c1', mode: 'project' })
    await page.goto(`${BASE}/dept.html?role=enterprise&case=c1&dept=draft`, { waitUntil: 'networkidle', timeout: 30000 })
    await page.waitForTimeout(600)
    const dept = await page.evaluate(() => {
      const t = document.body.innerText
      const right = document.querySelector('.dept-right, aside.right, [data-testid="dept-right"], .workbench-right, .col-right, [data-workbench]')
      const hasRight = !!right || /通过|驳回|缺项|交卷|齐套/.test(t)
      const hasComposer = !!document.querySelector('textarea, [contenteditable="true"].composer, .composer, [data-chat-input]')
      return {
        hasRight,
        hasComposer,
        has缺项或禁用: /缺项|交卷已禁用|交卷不可用|齐套|未齐套/.test(t),
        has拍板: /通过|驳回|确认/.test(t),
        threeCol: !!document.querySelector('.workbench, [data-workbench], .dept-layout, .cursor-layout'),
        head: t.slice(0, 220).replace(/\s+/g, ' '),
      }
    })
    evidence.D_dept = dept
    if (dept.hasRight && dept.has缺项或禁用) pass('D_right_rail', '右栏/齐套闸可见')
    else fail('D_right_rail', JSON.stringify(dept))
    if (dept.threeCol || dept.hasComposer) pass('D_workbench', '工作台三栏/composer')
    else fail('D_workbench', JSON.stringify(dept))
    await shot(page, 'D-dept-right.png')
    await page.close()
  }

  // ---- E: 三 tab 壳存在 ----
  {
    const page = await ctx.newPage()
    await seed(page, { hasCase: true, active: 'c1', mode: 'assistant' })
    await page.goto(`${BASE}/home.html?role=enterprise&case=c1`, { waitUntil: 'networkidle', timeout: 30000 })
    await page.waitForTimeout(300)
    const tabs = await page.evaluate(() => {
      const btns = [...document.querySelectorAll('.mode-switch button[data-mode]')]
      return btns.map(b => b.dataset.mode + ':' + b.textContent.trim())
    })
    evidence.E_tabs = tabs
    const joined = tabs.join('|')
    if (/assistant/.test(joined) && /project/.test(joined) && /studio/.test(joined)) pass('E_three_tabs', tabs.join(', '))
    else fail('E_three_tabs', joined)
    await page.close()
  }


  // ---- F: 专业无案诚实空态（勿假编制满屏） ----
  {
    const page = await ctx.newPage()
    await seed(page, { hasCase: false, active: '', mode: 'studio' })
    await page.goto(`${BASE}/professional.html?role=enterprise&nocase=1`, { waitUntil: 'networkidle', timeout: 30000 })
    await page.waitForTimeout(500)
    const empty = await page.evaluate(() => {
      const box = document.querySelector('[data-testid="prof-empty"], [data-prof-empty]')
      const boxVisible = !!(box && !box.classList.contains('hidden'))
      const grid = document.querySelector('#prof-capability-grid, [data-prof-grid]')
      const gridHidden = !grid || grid.classList.contains('hidden') || grid.children.length === 0
      const cards = document.querySelectorAll('.prof-card').length
      const mcp = document.querySelector('#prof-skills-mcp')
      const mcpHidden = !mcp || mcp.classList.contains('hidden')
      const t = (box && box.innerText) || ''
      const hasGuide = /案盘|开新|开案子|先有案|未选/.test(t) || !!document.querySelector('[data-prof-empty] a[href*="cases"], [data-prof-empty] a[href*="case-new"]')
      return { boxVisible, gridHidden, cards, mcpHidden, hasGuide, head: t.slice(0, 160).replace(/\s+/g, ' ') }
    })
    evidence.F_prof_empty = empty
    if (empty.boxVisible && empty.cards === 0 && empty.hasGuide) pass('F_prof_empty', '无案专业空态+引导')
    else fail('F_prof_empty', JSON.stringify(empty))
    if (empty.gridHidden || empty.cards === 0) pass('F_no_fake_roster', '无假编制满屏')
    else fail('F_no_fake_roster', JSON.stringify(empty))
    await shot(page, 'F-professional-empty.png')
    await page.close()
  }

  // ---- G: dept 缺项 chip 突出一条 + 白话 ----
  {
    const page = await ctx.newPage()
    await seed(page, { hasCase: true, active: 'c1', mode: 'project' })
    await page.goto(`${BASE}/dept.html?role=enterprise&case=c1&dept=disclosure`, { waitUntil: 'networkidle', timeout: 30000 })
    await page.waitForTimeout(500)
    const chip = await page.evaluate(() => {
      const el = document.querySelector('[data-testid="dept-gap-chip"], .gap-chip.is-current-gap, .gap-chip')
      const t = document.body.innerText
      return {
        hasChip: !!el,
        isCurrent: !!(el && el.classList.contains('is-current-gap')),
        label: el ? el.textContent.replace(/\s+/g, ' ').trim() : '',
        vernacular: /还缺|已齐|还不能交出去|交出去/.test(t),
        no旧词堆砌: !/未齐套交卷禁用/.test(t),
      }
    })
    evidence.G_chip = chip
    if (chip.hasChip && chip.isCurrent) pass('G_gap_chip_current', chip.label)
    else fail('G_gap_chip_current', JSON.stringify(chip))
    if (chip.vernacular && chip.no旧词堆砌) pass('G_dept_vernacular', 'dept 白话')
    else fail('G_dept_vernacular', JSON.stringify(chip))
    await shot(page, 'G-dept-gap-chip.png')
    await page.close()
  }

  // ---- T: 专业「让该部开工」+ home 弱提示三 tab ----
  {
    const page = await ctx.newPage()
    await seed(page, { hasCase: true, active: 'c1', mode: 'studio' })
    await page.goto(`${BASE}/professional.html?role=enterprise&case=c1`, { waitUntil: 'networkidle', timeout: 30000 })
    await page.waitForTimeout(500)
    const T = await page.evaluate(() => {
      const t = document.body.innerText
      const btns = [...document.querySelectorAll('[data-go-dept], .prof-go, .prof-status-go')].map(el => (el.textContent || '').trim())
      const has开工 = btns.some(x => /让该部开工/.test(x)) || /让该部开工/.test(t)
      const no旧 = !/去该部干活/.test(t)
      const htmlHidden = document.documentElement.classList.contains('hidden')
      return { has开工, no旧, htmlHidden, btns: btns.slice(0, 5), head: t.slice(0, 160).replace(/\s+/g, ' ') }
    })
    evidence.T_prof_cta = T
    if (T.has开工 && T.no旧 && !T.htmlHidden) pass('T_prof_start_dept', '专业 CTA=让该部开工')
    else fail('T_prof_start_dept', JSON.stringify(T))
    await shot(page, 'T-prof-start-dept.png')
    await page.close()
  }
  {
    const page = await ctx.newPage()
    await seed(page, { hasCase: true, active: 'c1', mode: 'assistant' })
    await page.goto(`${BASE}/home.html?role=enterprise&case=c1`, { waitUntil: 'networkidle', timeout: 30000 })
    await page.waitForTimeout(300)
    const H = await page.evaluate(() => {
      const t = document.body.innerText
      return {
        tip: /盯整案用「项目」/.test(t) && /选部开工用「专业」/.test(t),
        noGapCard: !document.querySelector('.gap-primary-card'),
      }
    })
    evidence.T_home_tip = H
    if (H.tip && H.noGapCard) pass('T_home_tab_tip', 'home 弱提示项目/专业')
    else fail('T_home_tab_tip', JSON.stringify(H))
    await page.close()
  }

  // ---- W: welcome 宣传在登录前；缺口桥接指向公司（非首页作业） ----
  {
    const page = await ctx.newPage()
    await page.goto(`${BASE}/welcome.html`, { waitUntil: 'networkidle', timeout: 30000 })
    await page.waitForTimeout(300)
    const W = await page.evaluate(() => {
      const t = document.body.innerText
      const marketing = document.body.classList.contains('marketing-site')
      const loginCta = [...document.querySelectorAll('a[href*="login"]')].some(a => /登录/.test(a.textContent || ''))
      const noTabs = !document.querySelector('.mode-switch')
      const bridgeCompany = /登录后进公司页补同一缺口/.test(t)
      const noHomeGapBridge = !/登录后同缺口在首页|同一缺口会出现在首页/.test(t)
      const vernacular = /还不能交出去/.test(t)
      return { marketing, loginCta, noTabs, bridgeCompany, noHomeGapBridge, vernacular, head: t.slice(0, 180).replace(/\s+/g, ' ') }
    })
    evidence.W_welcome = W
    if (W.marketing && W.loginCta && W.noTabs) pass('W_welcome_marketing', '宣传站·登录干活·无三 tab')
    else fail('W_welcome_marketing', JSON.stringify(W))
    if (W.bridgeCompany && W.noHomeGapBridge) pass('W_welcome_bridge_company', '示范缺口桥接公司页')
    else fail('W_welcome_bridge_company', JSON.stringify(W))
    await shot(page, 'W-welcome.png')
    await page.close()
  }

  // ---- H: 案盘可发现 + 白话 ----
  {
    const page = await ctx.newPage()
    await seed(page, { hasCase: true, active: 'c1', mode: 'project' })
    await page.goto(`${BASE}/cases.html?role=enterprise&case=c1`, { waitUntil: 'networkidle', timeout: 30000 })
    await page.waitForTimeout(400)
    const H = await page.evaluate(() => {
      const t = document.body.innerText
      const title = document.querySelector('.page-title')?.textContent?.trim() || ''
      const filter = [...document.querySelectorAll('[data-cases-filter] .filter-chip')].map(b => b.textContent.trim())
      const hasOpen = !!document.querySelector('a.btn-ink[href*="case-new"]')
      const vernacular = /还不能交出去/.test(t)
      const no阻塞 = !/阻塞交卷/.test(t)
      const discover = /全部案子|案盘|卡点/.test(t) && !!document.querySelector('[data-cases-list] .row, [data-cases-list] a.row')
      return { title, filter, hasOpen, vernacular, no阻塞, discover, head: t.slice(0, 160).replace(/\s+/g, ' ') }
    })
    evidence.H_cases = H
    if (H.discover && H.hasOpen) pass('H_cases_discover', `案盘可发现·${H.title}`)
    else fail('H_cases_discover', JSON.stringify(H))
    if (H.vernacular && H.no阻塞 && H.filter.includes('进行中')) pass('H_cases_vernacular', '案盘白话·进行中')
    else fail('H_cases_vernacular', JSON.stringify(H))
    await shot(page, 'H-cases.png')
    await page.close()
  }

  // ---- I: 开案字段短 ----
  {
    const page = await ctx.newPage()
    await seed(page, { hasCase: false, active: '', mode: 'assistant' })
    await page.goto(`${BASE}/case-new.html?role=enterprise&nocase=1`, { waitUntil: 'networkidle', timeout: 30000 })
    await page.waitForTimeout(300)
    const I = await page.evaluate(() => {
      const labels = [...document.querySelectorAll('#new-case label')].map(l => (l.childNodes[0]?.textContent || l.textContent || '').trim().split('\n')[0].trim())
      const goalLabel = labels.find(x => /目标/.test(x)) || ''
      const short = labels.some(x => /^案名$/.test(x)) && /可选/.test(goalLabel)
      const note = document.querySelector('.primary-cta-note')?.textContent || ''
      const notFirstHop = /不是登录后第一跳|次级才走委托/.test(note)
      const mainInk = [...document.querySelectorAll('#new-case .btn-ink')].some(b => /进公司/.test(b.textContent || ''))
      return { labels, goalLabel, short, notFirstHop, mainInk }
    })
    evidence.I_case_new = I
    if (I.short && I.mainInk) pass('I_case_new_short', `字段短·${I.labels.join('|')}`)
    else fail('I_case_new_short', JSON.stringify(I))
    if (I.notFirstHop) pass('I_case_new_delegate_secondary', '委托次级非第一跳')
    else fail('I_case_new_delegate_secondary', JSON.stringify(I))
    await shot(page, 'I-case-new.png')
    await page.close()
  }

  // ---- J: delegate 不替代登录后第一跳 ----
  {
    const page = await ctx.newPage()
    await seed(page, { hasCase: true, active: 'c1', mode: 'assistant' })
    await page.goto(`${BASE}/delegate.html?role=enterprise&case=c1`, { waitUntil: 'networkidle', timeout: 30000 })
    await page.waitForTimeout(300)
    const J = await page.evaluate(() => {
      const sub = document.querySelector('.page-sub')?.textContent || ''
      const label = document.querySelector('label')?.childNodes[0]?.textContent?.trim() || ''
      const notFirst = /不是第一跳|先进首页助手/.test(sub)
      const goalPlain = /你的目标/.test(label) || /你的目标/.test(document.body.innerText)
      return { sub: sub.slice(0, 120), label, notFirst, goalPlain }
    })
    evidence.J_delegate = J
    if (J.notFirst && J.goalPlain) pass('J_delegate_not_first_hop', 'delegate 非登录第一跳')
    else fail('J_delegate_not_first_hop', JSON.stringify(J))
    await shot(page, 'J-delegate.png')
    await page.close()
  }

  // ---- K: 后勤弱入口 · 空态诚实（期限/账单/成员） ----
  {
    const page = await ctx.newPage()
    await seed(page, { hasCase: true, active: 'c1', mode: 'project' })
    const pages = [
      { path: 'docket.html', emptySel: '[data-docket-empty]', expectSub: /期限|逾期/, emptyText: /还没有期限|暂无期限/ },
      { path: 'billing.html', emptySel: '[data-billing-empty]', expectSub: /官费|服务费|口袋/, emptyText: /还没有报价|尚未报价/ },
      { path: 'members.html', emptySel: '[data-members-empty]', expectSub: /拍板|成员|权限/, emptyText: /只有你一人|只有创建者/ },
    ]
    const K = {}
    for (const spec of pages) {
      await page.goto(`${BASE}/${spec.path}?role=enterprise&case=c1`, { waitUntil: 'networkidle', timeout: 30000 })
      await page.waitForTimeout(300)
      K[spec.path] = await page.evaluate(({ emptySel, expectSubSource, emptyTextSource }) => {
        const expectSub = new RegExp(expectSubSource)
        const emptyText = new RegExp(emptyTextSource)
        const sub = document.querySelector('.page-sub')?.textContent || ''
        const empty = document.querySelector(emptySel)
        const emptyExists = !!empty
        const ret = !!document.querySelector('[data-logistics-return], .logistics-return')
        const noMenuWall = !document.querySelector('.nav-menu-wall, .mega-menu') && document.querySelectorAll('.mode-switch button[data-mode]').length <= 3
        const t = (empty && empty.innerText) || ''
        return { subOk: expectSub.test(sub), emptyExists, emptyCopyOk: !t || emptyText.test(t) || empty.classList.contains('hidden'), ret, noMenuWall, sub: sub.slice(0, 80) }
      }, { emptySel: spec.emptySel, expectSubSource: spec.expectSub.source, emptyTextSource: spec.emptyText.source })
    }
    evidence.K_logistics = K
    const allOk = pages.every(s => {
      const r = K[s.path]
      return r && r.subOk && r.emptyExists && r.ret && r.noMenuWall
    })
    if (allOk) pass('K_logistics_weak', '期限/账单/成员弱入口+空态壳')
    else fail('K_logistics_weak', JSON.stringify(K))
    await shot(page, 'K-logistics-members.png')
    await page.close()
  }

  // ---- P: pending/confirm-log 守住不扩 ----
  {
    const page = await ctx.newPage()
    await seed(page, { hasCase: true, active: 'c1', mode: 'project' })
    await page.goto(`${BASE}/pending.html?role=enterprise&dept=disclosure`, { waitUntil: 'domcontentloaded', timeout: 30000 })
    await page.waitForTimeout(500)
    const Purl = page.url()
    const pendingOk = /dept\.html/.test(Purl) && /gate=1/.test(Purl)
    if (pendingOk) pass('P_pending_soft', 'pending 软跳工作台 gate')
    else fail('P_pending_soft', Purl)
    await page.goto(`${BASE}/confirm-log.html?role=enterprise&case=c1`, { waitUntil: 'networkidle', timeout: 30000 })
    await page.waitForTimeout(300)
    const CL = await page.evaluate(() => {
      const t = document.body.innerText
      const noExpand = !/菜单墙|七部货架|开案子表单/.test(t)
      const isLog = /确认|记录|留痕/.test(t)
      return { noExpand, isLog, title: document.title }
    })
    evidence.P_hold = { pendingUrl: Purl, CL }
    if (CL.isLog && CL.noExpand) pass('P_confirm_log_hold', 'confirm-log 守住不扩')
    else fail('P_confirm_log_hold', JSON.stringify(CL))
    await page.close()
  }

  await browser.close()
  const report = { passN, failN, notes, evidence, at: new Date().toISOString() }
  fs.writeFileSync(path.join(OUT, 'accept-close-report.json'), JSON.stringify(report, null, 2))
  console.log(JSON.stringify({ passN, failN, notes }, null, 2))
  process.exit(failN ? 1 : 0)
}

main().catch(e => { console.error(e); process.exit(2) })
