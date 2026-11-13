import fs from 'fs'
const { chromium } = await import('/Users/gyp-mac/data/innopara/code/ip-harness/node_modules/playwright-core/index.mjs')
const out = '/Users/gyp-mac/data/innopara/code/ip-harness/.tmp/rescan-86-shots'
fs.mkdirSync(out, { recursive: true })
const log = []
const note = (s) => { log.push(s); console.log(s) }
const ok = (n, c) => { note(`${c ? 'PASS' : 'FAIL'} ${n}`); return !!c }
const browser = await chromium.launch({ channel: 'chrome', headless: true })
const page = await browser.newPage({ viewport: { width: 1440, height: 1100 } })
const BASE = 'http://127.0.0.1:5175'
const OA = 'case-biz-oa-filed'
let fails = 0
const TEAMUP = /组队讨论|本案团队|讨论组互喊|组队并开群聊|开群聊 room|演练全队|组成专班并建项目|组成专班/
const EXPERT_DESK = /专家台|专家工作台|仅专家台|旧项目专家台/
const PRO_TAB = /专业 \/ 编制|看专业能力 \/ 编制/
const L_LEVEL = /L1·见习|L2·熟练|L3·资深|L4·首席|L5·宗师/
const ENG = /DomainCommand|写库须 HITL|\bHITL\b|类型 kind|多 bot|自由 bot/

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
  await page.screenshot({ path: `${out}/01-hall.png`, fullPage: false })
  let body = await page.locator('body').innerText()
  if (!ok('hall brand', await page.getByTestId('shell-brand-hall').count() === 1)) fails++
  if (!ok('hall no 专家台', !EXPERT_DESK.test(body))) fails++
  if (!ok('hall no team', !TEAMUP.test(body))) fails++

  await go(`/agent/cases/${OA}`)
  await page.screenshot({ path: `${out}/02-company.png`, fullPage: false })
  body = await page.locator('body').innerText()
  if (!ok('company gap', await page.getByTestId('company-gap-cta').count() === 1)) fails++
  if (!ok('company 编制名册 link', /编制名册/.test(body))) fails++
  if (!ok('company no 专业/编制', !PRO_TAB.test(body))) fails++

  await go(`/agent/cases/${OA}/depts/disclosure`)
  await page.waitForTimeout(400)
  await page.screenshot({ path: `${out}/03-dept.png`, fullPage: false })
  body = await page.locator('body').innerText()
  if (!ok('dept sidebar 编制名册', await page.getByTestId('business-side-professional').count() === 1)) fails++
  const sideTxt = await page.getByTestId('business-side-professional').innerText()
  if (!ok('side label 编制名册', sideTxt.includes('编制名册'))) fails++
  if (!ok('side no 专业/', !/专业\s*\/\s*编制/.test(sideTxt))) fails++

  await go('/agent/assets')
  await page.waitForTimeout(400)
  await page.screenshot({ path: `${out}/04-assets.png`, fullPage: false })
  if (!ok('assets intro', await page.getByTestId('assets-library-intro').count() === 1)) fails++
  if (!ok('assets no b8 banner', await page.getByTestId('assets-b8').count() === 0)) fails++
  body = await page.locator('body').innerText()
  if (!ok('assets no 情报官入口常显', !/情报官入口（示意）/.test(body))) fails++

  await go('/agent/assets?branch=b8')
  await page.waitForTimeout(350)
  await page.screenshot({ path: `${out}/05-assets-b8.png`, fullPage: false })
  if (!ok('assets b8 banner', await page.getByTestId('assets-b8').count() === 1)) fails++
  if (!ok('assets b8 no library intro', await page.getByTestId('assets-library-intro').count() === 0)) fails++

  await go('/agent/departments')
  await page.waitForTimeout(500)
  await page.screenshot({ path: `${out}/06-departments.png`, fullPage: false })
  body = await page.locator('body').innerText()
  if (!ok('departments no L#档位', !L_LEVEL.test(body))) fails++
  if (!ok('departments 编制名册', /编制名册/.test(body))) fails++

  await go('/agent/sandbox')
  await page.waitForTimeout(400)
  // open chrome for honesty line
  if (await page.getByTestId('general-chrome-toggle').count()) {
    await page.getByTestId('general-chrome-toggle').click()
    await page.waitForTimeout(200)
  }
  await page.screenshot({ path: `${out}/07-sandbox.png`, fullPage: false })
  body = await page.locator('body').innerText()
  if (!ok('sandbox no HITL/DomainCommand/多 bot', !ENG.test(body))) fails++
  if (!ok('sandbox 多助手', /多助手/.test(body))) fails++

  await go('/agent/bots/new')
  await page.waitForTimeout(350)
  await page.screenshot({ path: `${out}/08-bots-new.png`, fullPage: false })
  body = await page.locator('body').innerText()
  if (!ok('bots-new no DomainCommand', !/DomainCommand/.test(body))) fails++
  if (!ok('bots-new no 类型 kind', !/类型 kind/.test(body))) fails++
  if (!ok('bots-new 新建助手', /新建助手/.test(body))) fails++

  await go(`/agent/cases/${OA}/professional`)
  await page.screenshot({ path: `${out}/09-professional.png`, fullPage: false })
  body = await page.locator('body').innerText()
  if (!ok('professional 编制名册', /编制名册/.test(body))) fails++
  if (!ok('professional no team', !TEAMUP.test(body))) fails++

  await go('/agent/seats')
  await page.screenshot({ path: `${out}/10-seats.png`, fullPage: false })
  await go('/agent/lab')
  await page.screenshot({ path: `${out}/11-lab.png`, fullPage: false })
  body = await page.locator('body').innerText()
  if (!ok('lab no 多 bot', !/多 bot/.test(body))) fails++

  await go('/agent/sessions')
  await page.screenshot({ path: `${out}/12-sessions.png`, fullPage: false })

  // src checks
  const assets = fs.readFileSync('/Users/gyp-mac/data/innopara/code/ip-harness/apps/agent/src/pages/AssetsPage.tsx','utf8')
  if (!ok('src assets isB8 gate', /\{isB8 \? \(/.test(assets) && /assets-library-intro/.test(assets))) fails++
  const levels = fs.readFileSync('/Users/gyp-mac/data/innopara/code/ip-harness/apps/agent/src/departments/orgData.ts','utf8')
  if (!ok('src LEVEL no L1·', !/L1·见习/.test(levels) && /1: '见习'/.test(levels))) fails++
  const company = fs.readFileSync('/Users/gyp-mac/data/innopara/code/ip-harness/apps/agent/src/components/business/CaseCompanyHome.tsx','utf8')
  if (!ok('src company no 看专业能力', !/看专业能力/.test(company))) fails++
  const side = fs.readFileSync('/Users/gyp-mac/data/innopara/code/ip-harness/apps/agent/src/components/business/BusinessCaseSidebar.tsx','utf8')
  if (!ok('src side no 专业 / 编制', !/专业 \/ 编制/.test(side))) fails++
  const l1 = fs.readFileSync('/Users/gyp-mac/data/innopara/code/ip-harness/apps/agent/src/pages/AgentL1Shell.tsx','utf8')
  if (!ok('src l1 no HITL', !/写库须 HITL/.test(l1) && !/>\s*多 bot\s*</.test(l1))) fails++
  const botNew = fs.readFileSync('/Users/gyp-mac/data/innopara/code/ip-harness/apps/agent/src/pages/GeneralBotNewPage.tsx','utf8')
  if (!ok('src botNew no DomainCommand', !/DomainCommand/.test(botNew))) fails++
  const scan = fs.readFileSync('/Users/gyp-mac/data/innopara/code/ip-harness/docs/产品-老板思路/一期-产品逻辑/apps-agent全站对齐扫描-2026-10-30.md','utf8')
  if (!ok('scan §86', /## 86\./.test(scan))) fails++

  note(fails === 0 ? 'PASS_RESCAN_86' : `FAIL_COUNT=${fails}`)
} catch (e) {
  note('FAIL: ' + (e && e.stack || e))
  fails++
  try { await page.screenshot({ path: `${out}/ERR.png`, fullPage: true }) } catch {}
}
await browser.close()
fs.writeFileSync(`${out}/smoke-log.txt`, log.join('\n'))
process.exit(fails ? 1 : 0)
