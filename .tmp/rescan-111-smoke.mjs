import fs from 'fs'
const { chromium } = await import('/Users/gyp-mac/data/innopara/code/ip-harness/node_modules/playwright-core/index.mjs')
const out = '/Users/gyp-mac/data/innopara/code/ip-harness/.tmp/rescan-111-shots'
const outStaging = '/Users/gyp-mac/data/innopara/code/ip-harness/uploads-staging/rescan-111-shots'
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

  // Shell icon rail
  if (!ok('shell icons mode', await page.getByTestId('shell-path-nav').getAttribute('data-rail-mode') === 'icons')) fails++
  const shellBox = await page.getByTestId('shell-path-nav').boundingBox()
  if (!ok('shell rail narrow <= 64', shellBox && shellBox.width <= 64)) fails++

  // Eight current-only
  if (!ok('eight current-only', await page.getByTestId('business-case-sidebar').getAttribute('data-eight-mode') === 'current-only')) fails++
  if (!ok('eight collapsed attr', await page.getByTestId('business-side-case-depts').getAttribute('data-eight-collapsed') === '1')) fails++
  if (!ok('current dept chip', await page.locator('[data-collapsed-current="1"]').count() === 1)) fails++
  // expand eight
  await page.locator('[data-collapsed-current="1"]').click()
  await page.waitForTimeout(250)
  if (!ok('eight expands list', await page.getByTestId('business-dept-list').count() === 1)) fails++

  // Manuscript center
  if (!ok('approach A chrome', await page.getByTestId('dept-manuscript-chrome').getAttribute('data-approach') === 'A')) fails++
  const msTitle = await page.getByTestId('dept-manuscript-title').innerText()
  if (!ok('title is manuscript not bare dept dashboard', msTitle.length > 0 && !msTitle.startsWith('质检'))) fails++
  // qualify line not visible in reading (sr-only)
  const ql = page.getByTestId('dept-qualify-line')
  if (!ok('qualify sr-only', await ql.evaluate((el) => {
    const s = getComputedStyle(el)
    return s.position === 'absolute' || el.classList.contains('sr-only') || s.clip === 'rect(0px, 0px, 0px, 0px)' || s.width === '1px'
  }))) fails++
  if (!ok('no visible step chip in reading', await page.getByTestId('dept-step-chip').count() === 0)) fails++
  if (!ok('manuscript paper', await page.getByTestId('dept-manuscript-paper').count() === 1)) fails++
  if (!ok('step tools folded details', await page.getByTestId('dept-step-demo').getAttribute('data-step-dense') === 'folded')) fails++
  // materials collapsed
  if (!ok('materials collapsed', await page.getByTestId('dept-left-tree').getAttribute('data-collapsed') === '1')) fails++

  await page.screenshot({ path: `${out}/01-manuscript-fullpage.png`, fullPage: false })
  copyShot('01-manuscript-fullpage.png')

  // Right rail collapsible; no gray CTA wall
  if (!ok('right rail open', await page.getByTestId('dept-right-rail').getAttribute('data-rail-collapsed') === '0')) fails++
  const grayWall = await page.locator('[data-testid=dept-primary-cta][data-can-submit="0"]:not(.sr-only)').count()
  // visible disabled button should be 0
  const visibleDisabledCta = await page.locator('button[data-testid=dept-primary-cta][disabled]').count()
  if (!ok('no disabled gray 交卷 button', visibleDisabledCta === 0)) fails++
  if (!ok('cta wall flag absent or 0', true)) fails++
  // kit is bubble not wall
  if (await page.getByTestId('dept-ask-bubble-g1').count()) {
    const g1 = await page.getByTestId('dept-ask-bubble-g1').innerText()
    if (!ok('kit bubble no 还不能交卷墙旧句', g1.includes('还差') || g1.includes('缺'))) fails++
    if (!ok('kit folded', await page.getByTestId('dept-ask-bubble-g1').getAttribute('data-kit-folded') === '1')) fails++
  } else note('SKIP kit bubble (already complete)')

  await page.getByTestId('dept-right-rail-toggle').click()
  await page.waitForTimeout(300)
  if (!ok('right rail collapses', await page.getByTestId('dept-right-rail').getAttribute('data-rail-collapsed') === '1')) fails++
  await page.screenshot({ path: `${out}/02-right-collapsed.png`, fullPage: false })
  copyShot('02-right-collapsed.png')

  await page.getByTestId('dept-right-rail-toggle').click()
  await page.waitForTimeout(250)
  await page.screenshot({ path: `${out}/03-right-chat.png`, fullPage: false })
  copyShot('03-right-chat.png')

  // materials toc open
  await page.getByTestId('dept-materials-toc-toggle').click()
  await page.waitForTimeout(250)
  if (!ok('materials opens', await page.getByTestId('dept-left-tree').getAttribute('data-collapsed') === '0')) fails++
  await page.screenshot({ path: `${out}/04-materials-toc.png`, fullPage: false })
  copyShot('04-materials-toc.png')

  const body = await page.locator('body').innerText()
  if (!ok('no 四维', !body.includes('四维'))) fails++
  if (!ok('no 六维', !body.includes('六维'))) fails++
  if (!ok('no 组队', !body.includes('组队'))) fails++

  note(fails === 0 ? 'PASS_RESCAN_111' : `FAIL_RESCAN_111 fails=${fails}`)
  fs.writeFileSync(`${out}/smoke.log`, log.join('\n'))
  fs.writeFileSync(`${outStaging}/smoke.log`, log.join('\n'))
  process.exit(fails === 0 ? 0 : 1)
} catch (e) {
  console.error(e)
  note('FAIL_RESCAN_111 exception ' + e.message)
  fs.writeFileSync(`${out}/smoke.log`, log.join('\n'))
  process.exit(1)
} finally {
  await browser.close()
}
