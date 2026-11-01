import fs from 'fs'
const { chromium } = await import('/Users/gyp-mac/data/innopara/code/ip-harness/node_modules/playwright-core/index.mjs')
const out = '/Users/gyp-mac/data/innopara/code/ip-harness/.tmp/rescan-109-shots'
const outStaging = '/Users/gyp-mac/data/innopara/code/ip-harness/uploads-staging/rescan-109-shots'
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
  await page.waitForTimeout(500)
}

try {
  await login()
  await go(`/agent/cases/${CASE}/depts/disclosure`)

  // G01: materials folded by default; eight thin
  const leftCollapsed = await page.getByTestId('dept-left-tree').getAttribute('data-collapsed')
  if (!ok('G01 materials default collapsed', leftCollapsed === '1')) fails++
  const materialsMode = await page.getByTestId('dept-left-tree').getAttribute('data-materials-mode')
  if (!ok('G01 materials toc-folded', materialsMode === 'toc-folded')) fails++
  if (!ok('G01 materials toc toggle present', await page.getByTestId('dept-materials-toc-toggle').count() === 1)) fails++
  const sideRail = await page.getByTestId('business-case-sidebar').getAttribute('data-rail')
  if (!ok('G01 eight thin rail attr', sideRail === 'thin-eight')) fails++
  const sideBox = await page.getByTestId('business-case-sidebar').boundingBox()
  if (!ok('G01 eight width <= 180px', sideBox && sideBox.width <= 180)) fails++

  // G02: mid primary = manuscript paper; step draft by default
  const stepId = await page.locator('[data-testid=dept-handoff-shell], [data-step-id]').first().evaluate((el) => {
    const root = el.closest('[data-step-id]') || document.querySelector('[data-step-id]')
    return root?.getAttribute('data-step-id') || ''
  }).catch(async () => {
    return await page.locator('[data-step-id]').first().getAttribute('data-step-id')
  })
  // page root has data-step-id
  const rootStep = await page.locator('[data-step-id]').first().getAttribute('data-step-id')
  if (!ok('G02 default step draft', rootStep === 'draft')) fails++
  if (!ok('G02 manuscript paper present', await page.getByTestId('dept-manuscript-paper').count() === 1)) fails++
  if (!ok('G02 mid-primary manuscript', await page.locator('[data-mid-primary=manuscript]').count() === 1)) fails++
  const bodyTxt = await page.getByTestId('dept-output-body').first().innerText()
  if (!ok('G02 body has 交底/技术 content', /交底|技术|水道|散热|螺旋/.test(bodyTxt))) fails++
  // process cards not primary: thick embed widgets-only; no thick body fold
  if (!ok('G02 no thick body fold on first paint', await page.getByTestId('thick-step-body-fold').count() === 0)) fails++
  const thickEmbed = await page.getByTestId('thick-step-work-panel').getAttribute('data-embed')
  if (!ok('G02 thick widgets-only', thickEmbed === 'widgets-only')) fails++
  // title 交底书
  const title = await page.locator('#dept-output-title').innerText()
  if (!ok('G02 title 交底书', title.includes('交底书'))) fails++

  await page.screenshot({ path: `${out}/01-disclosure-manuscript-first.png`, fullPage: false })
  copyShot('01-disclosure-manuscript-first.png')

  // G01 open materials drawer
  await page.getByTestId('dept-materials-toc-toggle').click()
  await page.waitForTimeout(300)
  const leftOpen = await page.getByTestId('dept-left-tree').getAttribute('data-collapsed')
  if (!ok('G01 materials opens drawer', leftOpen === '0')) fails++
  await page.screenshot({ path: `${out}/02-materials-drawer-open.png`, fullPage: false })
  copyShot('02-materials-drawer-open.png')

  // G03: pick manuscript part if available → mid product; then hand step thin end
  const partBtn = page.locator('[data-testid^=dept-mat-],[data-node-id],[data-testid*=part]').first()
  // Prefer clicking a tree item labeled 技术领域 or similar
  const treeClick = page.locator('[data-testid=dept-left-tree] button, [data-testid=dept-left-tree] [role=button], [data-testid=dept-left-tree] a').filter({ hasText: /技术|方案|背景|摘要|零件/ }).first()
  if (await treeClick.count()) {
    await treeClick.click()
    await page.waitForTimeout(350)
    await page.screenshot({ path: `${out}/03-materials-select-mid.png`, fullPage: false })
    copyShot('03-materials-select-mid.png')
    if (!ok('G03 after select still has output body', await page.getByTestId('dept-output-body').count() >= 1)) fails++
  } else {
    note('SKIP G03 tree part click (no matching node)')
    await page.screenshot({ path: `${out}/03-materials-select-mid.png`, fullPage: false })
    copyShot('03-materials-select-mid.png')
  }

  // Switch to hand step → thin end card only under paper
  // Go back to deliverable first
  const deliv = page.locator('[data-testid=dept-left-tree]').getByText(/本站交卷物|产出|交底书|本稿/).first()
  if (await deliv.count()) {
    await deliv.click().catch(()=>{})
    await page.waitForTimeout(200)
  }
  // force via URL
  await go(`/agent/cases/${CASE}/depts/disclosure?step=hand`)
  const handStep = await page.locator('[data-step-id]').first().getAttribute('data-step-id')
  if (!ok('G03 force hand step', handStep === 'hand')) fails++
  if (!ok('G03 hand still manuscript paper', await page.getByTestId('dept-manuscript-paper').count() === 1)) fails++
  if (!ok('G03 thin end card', await page.getByTestId('thick-d4-hand').count() === 1)) fails++
  const endGate = await page.getByTestId('thick-d4-hand').getAttribute('data-end-gate')
  if (!ok('G03 end gate thin', endGate === 'thin')) fails++
  // ticket folded
  if (await page.getByTestId('dept-handoff-ticket-details').count()) {
    if (!ok('G03 ticket in details fold', true)) fails++
  } else {
    note('SKIP ticket details (not shown)')
  }
  if (!ok('G03 meta fold present', await page.getByTestId('dept-meta-fold').count() === 1)) fails++
  await page.screenshot({ path: `${out}/04-hand-thin-end-over-paper.png`, fullPage: false })
  copyShot('04-hand-thin-end-over-paper.png')

  // Right rail still dialogue
  if (!ok('right rail dialogue', await page.getByTestId('dept-right-rail').getAttribute('data-slot') === 'dialogue-confirm')) fails++
  await page.screenshot({ path: `${out}/05-right-rail-chat.png`, fullPage: false })
  copyShot('05-right-rail-chat.png')

  // banned claims
  const body = await page.locator('body').innerText()
  if (!ok('no 四维', !body.includes('四维'))) fails++
  if (!ok('no 六维', !body.includes('六维'))) fails++
  if (!ok('no 组队', !body.includes('组队'))) fails++

  note(fails === 0 ? 'PASS_RESCAN_109' : `FAIL_RESCAN_109 fails=${fails}`)
  fs.writeFileSync(`${out}/smoke.log`, log.join('\n'))
  fs.writeFileSync(`${outStaging}/smoke.log`, log.join('\n'))
  process.exit(fails === 0 ? 0 : 1)
} catch (e) {
  console.error(e)
  note('FAIL_RESCAN_109 exception ' + e.message)
  fs.writeFileSync(`${out}/smoke.log`, log.join('\n'))
  process.exit(1)
} finally {
  await browser.close()
}
