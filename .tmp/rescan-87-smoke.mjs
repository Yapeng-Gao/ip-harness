import fs from 'fs'
const { chromium } = await import('/Users/gyp-mac/data/innopara/code/ip-harness/node_modules/playwright-core/index.mjs')
const out = '/Users/gyp-mac/data/innopara/code/ip-harness/.tmp/rescan-87-shots'
fs.mkdirSync(out, { recursive: true })
const log = []
const note = (s) => { log.push(s); console.log(s) }
const ok = (n, c) => { note(`${c ? 'PASS' : 'FAIL'} ${n}`); return !!c }
const browser = await chromium.launch({ channel: 'chrome', headless: true })
const page = await browser.newPage({ viewport: { width: 1440, height: 1100 } })
const BASE = 'http://127.0.0.1:5175'
const OA = 'case-biz-oa-filed'
let fails = 0
const TEAMUP = /组队讨论|本案团队|讨论组互喊|组队并开群聊|开群聊 room|演练全队|组成专班并建项目|组成专班|请组队/
const EXPERT_DESK = /专家台|专家工作台|仅专家台|旧项目专家台/
const PRO_TAB = /专业 \/ 编制|看专业能力 \/ 编制/
const L_LEVEL = /L1·见习|L2·熟练|L3·资深|L4·首席|L5·宗师|已达最高档 L5/
const ENG = /DomainCommand|写库须 HITL|\bHITL\b|类型 kind|多 bot|自由 bot|写库示意|中台节点|超范围blocker|超范围 blocker|编排思考/
const SKILL_UI = /Role · 岗位|Skills · 能力|提示词 ·|新增 skill|专家 skill|配置 role \/ skill/

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
  if (!ok('company 编制名册', /编制名册/.test(body))) fails++
  if (!ok('company no 专业/编制', !PRO_TAB.test(body))) fails++

  await go(`/agent/cases/${OA}/depts/disclosure`)
  await page.waitForTimeout(400)
  await page.screenshot({ path: `${out}/03-dept.png`, fullPage: false })
  body = await page.locator('body').innerText()
  if (!ok('dept sidebar 编制名册', await page.getByTestId('business-side-professional').count() === 1)) fails++
  const sideTxt = await page.getByTestId('business-side-professional').innerText()
  if (!ok('side label 编制名册', sideTxt.includes('编制名册'))) fails++

  await go('/agent/assets')
  await page.waitForTimeout(400)
  await page.screenshot({ path: `${out}/04-assets.png`, fullPage: false })
  if (!ok('assets intro', await page.getByTestId('assets-library-intro').count() === 1)) fails++
  if (!ok('assets no b8 banner', await page.getByTestId('assets-b8').count() === 0)) fails++

  await go('/agent/assets?branch=b8')
  await page.waitForTimeout(350)
  await page.screenshot({ path: `${out}/05-assets-b8.png`, fullPage: false })
  if (!ok('assets b8 banner', await page.getByTestId('assets-b8').count() === 1)) fails++

  await go('/agent/departments')
  await page.waitForTimeout(500)
  await page.screenshot({ path: `${out}/06-departments.png`, fullPage: false })
  body = await page.locator('body').innerText()
  if (!ok('departments no L#档位', !L_LEVEL.test(body))) fails++
  if (!ok('departments 编制名册', /编制名册/.test(body))) fails++
  if (!ok('departments no skill IAM UI', !/\/ skill 为产品心智|真组织 IAM/.test(body))) fails++
  if (!ok('departments 手法隐喻', /手法为办事隐喻|专家手法|配手法/.test(body))) fails++

  // open configure: expand main-chain card or use mini gear / onboarding
  let opened = false
  const card = page.getByTestId('dept-card-disclosure')
  if (await card.count()) {
    await card.locator('button[aria-expanded]').first().click()
    await page.waitForTimeout(250)
  }
  let gear = page.locator('[data-testid="departments-page"] button[title="配置岗位与手法"]').first()
  if (!(await gear.count())) {
    gear = page.locator('[data-testid="departments-page"] button[aria-label^="配置 "]').first()
  }
  if (await gear.count()) {
    await gear.click()
    await page.waitForTimeout(400)
    await page.screenshot({ path: `${out}/07-expert-drawer.png`, fullPage: false })
    const drawer = page.getByTestId('expert-config-drawer')
    if (!ok('drawer open', await drawer.count() === 1)) fails++
    else opened = true
    const dtxt = await drawer.innerText()
    if (!ok('drawer no Role/Skills/提示词/skill/L5', !SKILL_UI.test(dtxt) && !L_LEVEL.test(dtxt) && !/新增 skill|提示词/.test(dtxt))) fails++
    if (!ok('drawer 岗位/手法', /岗位说明/.test(dtxt) && /办事方法/.test(dtxt))) fails++
    if (!ok('drawer prompt folded', await page.locator('[data-testid^="expert-skill-prompt-fold-"]').count() > 0)) fails++
    if (await drawer.getByText('关闭').count()) await drawer.getByText('关闭').click()
    await page.waitForTimeout(200)
  }
  if (!opened) {
    note('WARN no configure gear — skip drawer UI checks')
    fails++
    ok('drawer open', false)
  }

  await go('/agent/sandbox')
  await page.waitForTimeout(400)
  if (await page.getByTestId('general-chrome-toggle').count()) {
    await page.getByTestId('general-chrome-toggle').click()
    await page.waitForTimeout(200)
  }
  await page.screenshot({ path: `${out}/08-sandbox.png`, fullPage: false })
  body = await page.locator('body').innerText()
  if (!ok('sandbox no ENG jargon', !ENG.test(body))) fails++
  if (!ok('sandbox 存稿/关键库', /存稿须确认|关键库须您确认/.test(body))) fails++

  await go('/agent/bots/new')
  await page.waitForTimeout(350)
  await page.screenshot({ path: `${out}/09-bots-new.png`, fullPage: false })
  body = await page.locator('body').innerText()
  if (!ok('bots-new no DomainCommand', !/DomainCommand/.test(body))) fails++
  if (!ok('bots-new no 类型 kind', !/类型 kind/.test(body))) fails++

  await go('/agent/harness')
  await page.waitForTimeout(350)
  await page.screenshot({ path: `${out}/10-harness.png`, fullPage: false })
  body = await page.locator('body').innerText()
  if (!ok('harness no 编排思考', !/编排思考/.test(body))) fails++
  if (!ok('harness 调度/思考步骤', /调度|思考步骤|请你确认/.test(body))) fails++

  await go('/agent/seats')
  await page.screenshot({ path: `${out}/11-seats.png`, fullPage: false })
  await go('/agent/lab')
  await page.screenshot({ path: `${out}/12-lab.png`, fullPage: false })
  body = await page.locator('body').innerText()
  if (!ok('lab no 多 bot', !/多 bot/.test(body))) fails++

  await go(`/agent/cases/${OA}/professional`)
  await page.screenshot({ path: `${out}/13-professional.png`, fullPage: false })

  // src checks
  const patent = fs.readFileSync('/Users/gyp-mac/data/innopara/code/ip-harness/apps/agent/src/projects/expertsPatent.ts','utf8')
  if (!ok('src no 请组队', !/请组队/.test(patent))) fails++
  if (!ok('src 请分派各席', /请分派各席/.test(patent))) fails++
  const drawerSrc = fs.readFileSync('/Users/gyp-mac/data/innopara/code/ip-harness/apps/agent/src/components/departments/ExpertConfigDrawer.tsx','utf8')
  if (!ok('src drawer no Role ·', !/Role · 岗位/.test(drawerSrc) && !/Skills · 能力/.test(drawerSrc))) fails++
  if (!ok('src drawer fold', /expert-skill-prompt-fold/.test(drawerSrc))) fails++
  if (!ok('src drawer no L5文案', !/已达最高档 L5/.test(drawerSrc))) fails++
  const timeline = fs.readFileSync('/Users/gyp-mac/data/innopara/code/ip-harness/apps/agent/src/components/projects/ProjectTimelinePanel.tsx','utf8')
  if (!ok('src timeline 存稿示意', /存稿示意/.test(timeline) && !/写库示意/.test(timeline))) fails++
  const process = fs.readFileSync('/Users/gyp-mac/data/innopara/code/ip-harness/apps/agent/src/components/business/CaseProcessPanel.tsx','utf8')
  if (!ok('src process 超范围拦下', /超范围拦下/.test(process) && !/超范围blocker/.test(process))) fails++
  const harness = fs.readFileSync('/Users/gyp-mac/data/innopara/code/ip-harness/apps/agent/src/pages/AgentHarnessOverview.tsx','utf8')
  if (!ok('src harness no 编排思考', !/编排思考/.test(harness))) fails++
  const scan = fs.readFileSync('/Users/gyp-mac/data/innopara/code/ip-harness/docs/产品-老板思路/一期-产品逻辑/apps-agent全站对齐扫描-2026-10-30.md','utf8')
  if (!ok('scan §87', /## 87\./.test(scan))) fails++

  note(fails === 0 ? 'PASS_RESCAN_87' : `FAIL_COUNT=${fails}`)
} catch (e) {
  note('FAIL: ' + (e && e.stack || e))
  fails++
  try { await page.screenshot({ path: `${out}/ERR.png`, fullPage: true }) } catch {}
}
await browser.close()
fs.writeFileSync(`${out}/smoke-log.txt`, log.join('\n'))
process.exit(fails ? 1 : 0)
