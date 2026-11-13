import fs from 'fs'
const { chromium } = await import('/Users/gyp-mac/data/innopara/code/ip-harness/node_modules/playwright-core/index.mjs')
const out = '/Users/gyp-mac/data/innopara/code/ip-harness/.tmp/rescan-95-shots'
fs.mkdirSync(out, { recursive: true })
const log = []
const note = (s) => { log.push(s); console.log(s) }
const ok = (n, c) => { note(`${c ? 'PASS' : 'FAIL'} ${n}`); return !!c }
const browser = await chromium.launch({ channel: 'chrome', headless: true })
const page = await browser.newPage({ viewport: { width: 1440, height: 900 } })
const BASE = 'http://127.0.0.1:5175'
const OA = 'case-biz-oa-filed'
let fails = 0
const TEAMUP = /组队讨论|本案团队|讨论组互喊|组队并开群聊|开群聊 room|演练全队|组成专班并建项目|组成专班|请组队|不在此组队|组队建班|组队入口已卸|组队\/讨论组产品面/
const EXPERT_DESK = /专家台|专家工作台|仅专家台|旧项目专家台/
const WEAK = /弱链案卷|弱链进公司|宣传站（弱链）/
const FENZHEN = /分诊|挂号|就诊/
const FULL_ROSTER = /全员编制|八部全员|编制墙/

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
  await page.goto(`${BASE}${p}`, { waitUntil: 'networkidle', timeout: 25000 })
  await page.waitForTimeout(450)
}

try {
  await login()

  await go('/agent')
  await page.screenshot({ path: `${out}/01-hall-idle.png`, fullPage: false })
  let body = await page.locator('body').innerText()
  if (!ok('hall brand', await page.getByTestId('shell-brand-hall').count() === 1)) fails++
  if (!ok('hall no 专家台', !EXPERT_DESK.test(body))) fails++
  if (!ok('hall no team', !TEAMUP.test(body))) fails++
  if (!ok('hall no 弱链', !WEAK.test(body))) fails++
  if (!ok('hall no 分诊', !FENZHEN.test(body))) fails++
  if (!ok('hall no 全员编制墙文案', !FULL_ROSTER.test(body))) fails++
  if (!ok('hall one-pass v95', await page.getByTestId('agent-home-page').getAttribute('data-hall-screen') === 'one-pass-v95')) fails++
  if (!ok('reception present', await page.getByTestId('home-reception-guide').count() === 1)) fails++
  if (!ok('boss compact', await page.getByTestId('home-boss-todo').getAttribute('data-compact') === '1')) fails++
  if (!ok('no branch doors on idle', await page.getByTestId('home-branch-doors').count() === 0)) fails++

  if (!ok('eight open', await page.getByTestId('home-eight-depts').isVisible())) fails++
  if (!ok('eight density v95', await page.getByTestId('home-eight-depts').getAttribute('data-dept-density') === 'preview-v95')) fails++
  if (!ok('eight grid 2x4', await page.getByTestId('home-eight-depts').getAttribute('data-dept-grid') === '2x4')) fails++

  const slugs = ['intake','inspire','mining','disclosure','draft','oa','annuity','monetize']
  for (const slug of slugs) {
    if (!ok(`door ${slug}`, await page.getByTestId(`home-dept-door-${slug}`).count() === 1)) fails++
    if (!ok(`blurb ${slug}`, await page.getByTestId(`home-dept-blurb-${slug}`).isVisible())) fails++
    const blurb = (await page.getByTestId(`home-dept-blurb-${slug}`).innerText()).trim()
    if (!ok(`blurb text ${slug}`, blurb.length >= 4)) fails++
    const experts = page.getByTestId(`home-dept-experts-${slug}`)
    if (!ok(`experts ${slug}`, await experts.count() === 1)) fails++
    const chips = await experts.locator('[data-testid^="home-dept-expert-"]').count()
    if (!ok(`experts bound ${slug}`, chips >= 1 && chips <= 3)) fails++
  }

  // close-up of eight depts
  const eight = page.getByTestId('home-eight-depts-fold')
  await eight.screenshot({ path: `${out}/02-eight-depts-closeup.png` })

  // expand duty on disclosure
  await page.getByTestId('home-dept-duty-toggle-disclosure').click()
  await page.waitForTimeout(200)
  if (!ok('duty open disclosure', await page.getByTestId('home-dept-duty-disclosure').isVisible())) fails++
  const dutyTxt = await page.getByTestId('home-dept-duty-disclosure').innerText()
  if (!ok('duty honest DEMO', /示意编制/.test(dutyTxt))) fails++
  await page.screenshot({ path: `${out}/03-duty-expand-disclosure.png`, fullPage: false })

  // click door still goes to dept
  await page.getByTestId('home-dept-door-disclosure').click()
  await page.waitForTimeout(700)
  if (!ok('door to disclosure', /\/depts\/disclosure/.test(page.url()))) fails++
  await page.screenshot({ path: `${out}/04-dept-disclosure.png`, fullPage: false })

  await go(`/agent/cases/${OA}`)
  await page.screenshot({ path: `${out}/05-company.png`, fullPage: false })

  const scrollH = await (async () => {
    await go('/agent')
    return page.evaluate(() => document.querySelector('[data-testid="agent-home-page"]')?.scrollHeight || 0)
  })()
  note(`hall scrollHeight=${scrollH}`)
  if (!ok('hall scroll not huge', scrollH > 0 && scrollH < 2200)) fails++
  const eightBox = await page.getByTestId('home-eight-depts').boundingBox()
  const receptionBox = await page.getByTestId('home-reception-guide').boundingBox()
  if (!ok('reception before eight', receptionBox && eightBox && eightBox.y > receptionBox.y + receptionBox.height)) fails++
  // eight may extend past first screen slightly; still require reception fully in first screen
  if (!ok('reception in first screen', receptionBox && receptionBox.y + receptionBox.height <= 900)) fails++
  await page.screenshot({ path: `${out}/01b-hall-idle-after.png`, fullPage: false })

  // src checks
  const home = fs.readFileSync('/Users/gyp-mac/data/innopara/code/ip-harness/apps/agent/src/pages/HomePage.tsx','utf8')
  if (!ok('src HallEightDoors', /HallEightDoors/.test(home))) fails++
  if (!ok('src v95', /one-pass-v95/.test(home))) fails++
  if (!ok('src no inline HALL_DEPT map', !/HALL_DEPT_DOORS\.map/.test(home))) fails++
  const doors = fs.readFileSync('/Users/gyp-mac/data/innopara/code/ip-harness/apps/agent/src/components/home/HallEightDoors.tsx','utf8')
  if (!ok('src preview-v95', /preview-v95/.test(doors))) fails++
  if (!ok('src expert bound comment', /≤3|<=3/.test(doors))) fails++
  const preview = fs.readFileSync('/Users/gyp-mac/data/innopara/code/ip-harness/apps/agent/src/business/hallDeptPreview.ts','utf8')
  if (!ok('src hallDeptPreview', /hallDeptExpertPreviews/.test(preview))) fails++
  if (!ok('src no full roster', /禁止铺全员墙|每部 ≤3/.test(preview))) fails++
  const scan = fs.readFileSync('/Users/gyp-mac/data/innopara/code/ip-harness/docs/产品-老板思路/一期-产品逻辑/apps-agent全站对齐扫描-2026-10-30.md','utf8')
  if (!ok('scan §95', /## 95\./.test(scan))) fails++
  const sec95 = scan.split('## 95.')[1]?.slice(0, 2500) || ''
  if (!ok('scan no claim 四维落地', !/四维落地/.test(sec95) || /不宣称四维/.test(sec95))) fails++

  note(fails === 0 ? 'PASS_RESCAN_95' : `FAIL_COUNT=${fails}`)
} catch (e) {
  note('FAIL: ' + (e && e.stack || e))
  fails++
  try { await page.screenshot({ path: `${out}/ERR.png`, fullPage: true }) } catch {}
}
await browser.close()
fs.writeFileSync(`${out}/smoke-log.txt`, log.join('\n'))
process.exit(fails ? 1 : 0)
