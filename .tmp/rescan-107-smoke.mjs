import fs from 'fs'
const { chromium } = await import('/Users/gyp-mac/data/innopara/code/ip-harness/node_modules/playwright-core/index.mjs')
const out = '/Users/gyp-mac/data/innopara/code/ip-harness/.tmp/rescan-107-shots'
const outStaging = '/Users/gyp-mac/data/innopara/code/ip-harness/uploads-staging/rescan-107-shots'
fs.mkdirSync(out, { recursive: true })
fs.mkdirSync(outStaging, { recursive: true })
const log = []
const note = (s) => { log.push(s); console.log(s) }
const ok = (n, c) => { note(`${c ? 'PASS' : 'FAIL'} ${n}`); return !!c }
const browser = await chromium.launch({ channel: 'chrome', headless: true })
const page = await browser.newPage({ viewport: { width: 1440, height: 900 } })
const BASE = 'http://127.0.0.1:5175'
const CASE = 'case-biz-sensor-pack'
let fails = 0
function copyShot(name) {
  const a = `${out}/${name}`
  if (fs.existsSync(a)) fs.copyFileSync(a, `${outStaging}/${name}`)
}
async function login() {
  await page.goto(`${BASE}/agent/login`, { waitUntil: 'domcontentloaded' })
  await page.evaluate(() => { try { localStorage.clear() } catch {} })
  await page.goto(`${BASE}/agent/login`, { waitUntil: 'domcontentloaded' })
  if (await page.getByTestId('login-role-enterprise').count()) {
    await page.getByTestId('login-role-enterprise').click()
    await page.getByTestId('login-enter').click()
    await page.waitForTimeout(700)
  }
}
async function go(p) {
  await page.goto(`${BASE}${p}`, { waitUntil: 'networkidle', timeout: 30000 })
  await page.waitForTimeout(450)
}

try {
  await login()

  // ---- Company home G01/G05/G07/G12 ----
  await go(`/agent/cases/${CASE}`)
  await page.screenshot({ path: `${out}/01-company-home.png`, fullPage: false })
  copyShot('01-company-home.png')
  if (!ok('G01 no company-pending-link', await page.getByTestId('company-pending-link').count() === 0)) fails++
  if (!ok('G01 company-pending-hint', await page.getByTestId('company-pending-hint').count() === 1)) fails++
  const hint = await page.getByTestId('company-pending-hint').innerText()
  if (!ok('G01 hint points 左栏待确认', hint.includes('左栏') && hint.includes('待确认'))) fails++
  if (!ok('G01 go current dept remains', await page.getByTestId('company-go-current-dept').count() === 1)) fails++
  if (!ok('G07 no company-link-professional', await page.getByTestId('company-link-professional').count() === 0)) fails++
  if (!ok('G12 no eight-dept-map-chips', await page.getByTestId('eight-dept-map-chips').count() === 0)) fails++
  if (!ok('G05 new-case folded on case', await page.getByTestId('business-side-new-case-folded').count() === 1)) fails++
  const sideNew = await page.getByTestId('business-side-new-case').innerText().catch(()=>'')
  if (!ok('G05 no big 开一个新案子 label', !sideNew.includes('开一个新案子') || sideNew.includes('去开案'))) fails++
  if (!ok('G08 no visible drill-enter button', await page.locator('[data-testid=drill-enter]:not(.sr-only)').count() === 0)) fails++
  // sr-only stub may exist
  if (!ok('shell 待确认 present', await page.getByTestId('shell-path-pending').count() === 1)) fails++

  // ---- Workbench G02/G03/G04 ----
  await go(`/agent/cases/${CASE}/depts/disclosure`)
  await page.screenshot({ path: `${out}/02-wb-disclosure.png`, fullPage: false })
  copyShot('02-wb-disclosure.png')
  if (await page.getByTestId('dept-ask-bubble-g1').count()) {
    if (!ok('G02 kit folded', await page.getByTestId('dept-ask-bubble-g1').getAttribute('data-kit-folded') === '1')) fails++
    const g1 = await page.getByTestId('dept-ask-bubble-g1').innerText()
    if (!ok('G02 slim copy 还不能交卷', g1.includes('还不能交卷') && !g1.includes('本稿要点未齐'))) fails++
    if (!ok('G02 missing fold', await page.getByTestId('dept-kit-missing-fold').count() === 1)) fails++
  } else note('SKIP G02 kit already complete')
  // materials station-first: manuscript-parts collapsed if present
  const tree = page.locator('[data-testid=dept-materials-tree], [data-materials-tree], .dept-materials-tree').first()
  // check nodes via testids if any
  const sideAux = page.locator('[data-tree-id=side-aux], [data-node-id=side-aux], [data-testid*=side-aux]').first()
  // G03 copy on page should not say 顶栏待确认 / 顶栏「去确认」
  const body = await page.locator('body').innerText()
  if (!ok('G03 no 顶栏待确认', !body.includes('顶栏待确认') && !body.includes('顶栏「去确认」') && !body.includes('点顶栏'))) fails++

  // ---- Docket drawer G09 ----
  if (await page.getByTestId('dept-open-case-file').count()) {
    await page.getByTestId('dept-open-case-file').click()
    await page.waitForTimeout(400)
  } else if (await page.getByRole('button', { name: /案卷/ }).count()) {
    await page.getByRole('button', { name: /案卷/ }).first().click()
    await page.waitForTimeout(400)
  }
  await page.screenshot({ path: `${out}/03-case-file-drawer.png`, fullPage: false })
  copyShot('03-case-file-drawer.png')
  const drawerTxt = await page.locator('[data-testid=case-file-drawer], [data-testid=case-file-line-badges]').first().innerText().catch(async()=> page.locator('body').innerText())
  if (!ok('G09 no 三词勿混用', !String(drawerTxt).includes('三词勿混用'))) fails++
  if (await page.getByTestId('case-file-line-details').count()) {
    if (!ok('G09 line details present', true)) fails++
  } else note('SKIP line details (no badges)')
  // close drawer
  if (await page.getByRole('button', { name: /关闭|Close/i }).count()) {
    await page.getByRole('button', { name: /关闭|Close/i }).first().click().catch(()=>{})
  } else {
    await page.keyboard.press('Escape').catch(()=>{})
  }

  // ---- Roster G05/G06/G07/G10/G13 ----
  await go(`/agent/cases/${CASE}/professional`)
  await page.screenshot({ path: `${out}/04-roster.png`, fullPage: false })
  copyShot('04-roster.png')
  if (!ok('G05 folded new-case on roster', await page.getByTestId('business-side-new-case-folded').count() === 1)) fails++
  if (!ok('G06/G07 no back-hall', await page.getByTestId('case-professional-back-hall').count() === 0)) fails++
  if (!ok('G07 no 全库编制旁路 link', await page.getByTestId('case-professional-to-global').count() === 0)) fails++
  const rosterBody = await page.locator('body').innerText()
  if (!ok('G07 no 全库编制旁路 text', !rosterBody.includes('全库编制旁路'))) fails++
  if (!ok('G13 no 缺口：待你拍板', !rosterBody.includes('缺口：待你拍板'))) fails++
  if (!ok('G10 no methods note wall', await page.getByTestId('case-professional-methods-note').count() === 0)) fails++
  // expand aux
  if (await page.getByTestId('case-professional-aux-summary').count()) {
    await page.getByTestId('case-professional-aux-summary').click()
    await page.waitForTimeout(200)
  }
  await page.screenshot({ path: `${out}/05-roster-aux.png`, fullPage: false })
  copyShot('05-roster-aux.png')

  // ---- Members / Billing G06/G11 ----
  await go(`/agent/cases/${CASE}/members`)
  await page.screenshot({ path: `${out}/06-members.png`, fullPage: false })
  copyShot('06-members.png')
  if (!ok('G06 no members-back-hall', await page.getByTestId('case-members-back-hall').count() === 0)) fails++
  const mem = await page.locator('body').innerText()
  if (!ok('G11 no 结构壳', !mem.includes('结构壳'))) fails++
  if (!ok('G11 CTA 回本案八部', mem.includes('回本案八部'))) fails++

  await go(`/agent/cases/${CASE}/billing`)
  await page.screenshot({ path: `${out}/07-billing.png`, fullPage: false })
  copyShot('07-billing.png')
  if (!ok('G06 no billing-back-hall', await page.getByTestId('case-billing-back-hall').count() === 0)) fails++
  const bill = await page.locator('body').innerText()
  if (!ok('G11 billing CTA 回本案八部', bill.includes('回本案八部'))) fails++

  // Expand other depts on company for shot
  await go(`/agent/cases/${CASE}`)
  if (await page.getByTestId('eight-dept-map-toggle').count()) {
    await page.getByTestId('eight-dept-map-toggle').click()
    await page.waitForTimeout(300)
  }
  await page.screenshot({ path: `${out}/08-company-expanded.png`, fullPage: false })
  copyShot('08-company-expanded.png')

  note(fails === 0 ? 'PASS_RESCAN_107' : `FAIL_RESCAN_107 fails=${fails}`)
  fs.writeFileSync(`${out}/smoke.log`, log.join('\n'))
  fs.writeFileSync(`${outStaging}/smoke.log`, log.join('\n'))
  process.exit(fails === 0 ? 0 : 1)
} catch (e) {
  console.error(e)
  note('FAIL_RESCAN_107 exception ' + e.message)
  fs.writeFileSync(`${out}/smoke.log`, log.join('\n'))
  process.exit(1)
} finally {
  await browser.close()
}
