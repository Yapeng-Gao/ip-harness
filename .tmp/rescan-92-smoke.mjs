import fs from 'fs'
import path from 'path'
const { chromium } = await import('/Users/gyp-mac/data/innopara/code/ip-harness/node_modules/playwright-core/index.mjs')
const out = '/Users/gyp-mac/data/innopara/code/ip-harness/.tmp/rescan-92-shots'
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
  await page.screenshot({ path: `${out}/01-hall-persona-idle-speak.png`, fullPage: false })
  let body = await page.locator('body').innerText()
  if (!ok('hall brand', await page.getByTestId('shell-brand-hall').count() === 1)) fails++
  if (!ok('hall no 专家台', !EXPERT_DESK.test(body))) fails++
  if (!ok('hall no team', !TEAMUP.test(body))) fails++
  if (!ok('hall no 弱链', !WEAK.test(body))) fails++
  if (!ok('hall no 分诊', !FENZHEN.test(body))) fails++
  if (!ok('hall one-pass v92', await page.getByTestId('agent-home-page').getAttribute('data-hall-screen') === 'one-pass-v92')) fails++
  if (!ok('reception guide present', await page.getByTestId('home-reception-guide').count() === 1)) fails++
  if (!ok('reception mode persona', await page.getByTestId('home-reception-guide').getAttribute('data-reception-mode') === 'persona-speak-v92')) fails++
  if (!ok('reception idle', await page.getByTestId('home-reception-guide').getAttribute('data-reception-phase') === 'idle')) fails++
  if (!ok('persona card', await page.getByTestId('home-reception-persona').isVisible())) fails++
  if (!ok('persona name 小林', await page.getByTestId('home-reception-persona-name').innerText() === '小林')) fails++
  if (!ok('persona tagline', /弄清先去哪/.test(await page.getByTestId('home-reception-persona-tagline').innerText()))) fails++
  if (!ok('speech bubble idle', await page.getByTestId('home-reception-speech').getAttribute('data-speech-phase') === 'idle')) fails++
  const prompt = await page.getByTestId('home-reception-prompt').innerText()
  if (!ok('active speak first', /我是前台小林/.test(prompt))) fails++
  if (!ok('speak guides three paths', /丢材料|八部门牌|一句话/.test(prompt))) fails++
  if (!ok('reception upload CTA', await page.getByTestId('home-reception-upload').isVisible())) fails++
  if (!ok('reception goals', await page.getByTestId('home-reception-goals').isVisible())) fails++
  if (!ok('composer hidden by default', await page.getByTestId('home-composer').count() === 0)) fails++
  if (!ok('line toggle present', await page.getByTestId('home-reception-line-toggle').count() === 1)) fails++
  const lineLabel = await page.getByTestId('home-reception-line-toggle').innerText()
  if (!ok('line says 或一句话交代', /或一句话交代/.test(lineLabel))) fails++
  if (!ok('eight open', await page.getByTestId('home-eight-depts-fold').getAttribute('data-folded') === '0')) fails++
  if (!ok('eight visible', await page.getByTestId('home-eight-depts').isVisible())) fails++
  const eightBox = await page.getByTestId('home-eight-depts').boundingBox()
  if (!ok('eight in first screen', eightBox && eightBox.y + eightBox.height <= 900)) fails++
  if (!ok('boss compact', await page.getByTestId('home-boss-todo').getAttribute('data-compact') === '1')) fails++
  if (!ok('no old home-reception wall', await page.getByTestId('home-reception').count() === 0)) fails++
  if (!ok('no duplicate home-goal-entries', await page.getByTestId('home-goal-entries').count() === 0)) fails++

  const scrollH = await page.evaluate(() => document.querySelector('[data-testid="agent-home-page"]')?.scrollHeight || 0)
  note(`hall scrollHeight=${scrollH}`)
  if (!ok('hall scroll not huge', scrollH > 0 && scrollH < 1900)) fails++

  // expand one-liner
  await page.getByTestId('home-reception-line-toggle').click()
  await page.waitForTimeout(250)
  if (!ok('composer after expand', await page.getByTestId('home-composer').count() === 1)) fails++
  await page.screenshot({ path: `${out}/01b-hall-line-open.png`, fullPage: false })
  await page.getByTestId('home-reception-line-toggle').click()
  await page.waitForTimeout(200)

  // upload → suggest
  const demoFile = path.join(out, 'demo-审查意见通知书.pdf')
  fs.writeFileSync(demoFile, '%PDF-1.4 demo OA notice')
  await page.getByTestId('home-reception-file').setInputFiles(demoFile)
  await page.waitForTimeout(400)
  const phase1 = await page.getByTestId('home-reception-guide').getAttribute('data-reception-phase')
  note(`phase after upload=${phase1}`)
  if (!ok('analyzing or suggest', phase1 === 'analyzing' || phase1 === 'suggest')) fails++
  await page.waitForSelector('[data-testid="home-reception-suggest"]', { timeout: 5000 })
  if (!ok('suggest visible', await page.getByTestId('home-reception-suggest').isVisible())) fails++
  if (!ok('speech still present', await page.getByTestId('home-reception-speech').isVisible())) fails++
  if (!ok('speech suggest phase', await page.getByTestId('home-reception-speech').getAttribute('data-speech-phase') === 'suggest')) fails++
  const suggestSpeech = await page.getByTestId('home-reception-prompt').innerText()
  if (!ok('speech advances suggest', /建议先去|请你确认去向/.test(suggestSpeech))) fails++
  if (!ok('persona still visible', await page.getByTestId('home-reception-persona').isVisible())) fails++
  if (!ok('intents', await page.getByTestId('home-reception-intents').count() === 1)) fails++
  if (!ok('dept picks', await page.getByTestId('home-reception-dept-picks').count() === 1)) fails++
  if (!ok('confirm CTA', await page.getByTestId('home-reception-confirm').isVisible())) fails++
  body = await page.locator('[data-testid="home-reception-suggest"]').innerText()
  if (!ok('suggest OA primary', /答复部|主推/.test(body))) fails++
  if (!ok('suggest DEMO badge', /样机示意/.test(body))) fails++
  await page.screenshot({ path: `${out}/02-hall-suggest-speak.png`, fullPage: false })

  await page.getByTestId('home-reception-confirm').click()
  await page.waitForTimeout(800)
  if (!ok('landed dept after confirm', /\/depts\//.test(page.url()))) fails++
  await page.screenshot({ path: `${out}/03-dept-after-confirm.png`, fullPage: false })

  await go('/agent')
  await page.getByTestId('home-goal-disclosure').click()
  await page.waitForTimeout(700)
  if (!ok('goal chip to disclosure', /\/depts\/disclosure/.test(page.url()))) fails++
  await page.screenshot({ path: `${out}/04-goal-disclosure.png`, fullPage: false })

  await go(`/agent/cases/${OA}`)
  await page.screenshot({ path: `${out}/05-company.png`, fullPage: false })

  const home = fs.readFileSync('/Users/gyp-mac/data/innopara/code/ip-harness/apps/agent/src/pages/HomePage.tsx','utf8')
  if (!ok('src v92', /one-pass-v92/.test(home))) fails++
  if (!ok('src HomeReceptionGuide', /HomeReceptionGuide/.test(home))) fails++
  if (!ok('src no HomeComposer import', !/import \{ HomeComposer \}/.test(home))) fails++
  if (!ok('src no home-reception wall', !/data-testid="home-reception"/.test(home))) fails++
  const guide = fs.readFileSync('/Users/gyp-mac/data/innopara/code/ip-harness/apps/agent/src/components/home/HomeReceptionGuide.tsx','utf8')
  if (!ok('src persona-speak-v92', /persona-speak-v92/.test(guide))) fails++
  if (!ok('src RECEPTION_DESK', /RECEPTION_DESK/.test(guide))) fails++
  if (!ok('src 或一句话交代', /或一句话交代/.test(guide))) fails++
  if (!ok('src no 分诊', !/分诊/.test(guide))) fails++
  if (!ok('src ExpertAvatar', /ExpertAvatar/.test(guide))) fails++
  const av = fs.readFileSync('/Users/gyp-mac/data/innopara/code/ip-harness/apps/agent/src/components/departments/ExpertAvatar.tsx','utf8')
  if (!ok('src ExpertAvatar lg', /'lg'/.test(av))) fails++
  const scan = fs.readFileSync('/Users/gyp-mac/data/innopara/code/ip-harness/docs/产品-老板思路/一期-产品逻辑/apps-agent全站对齐扫描-2026-10-30.md','utf8')
  if (!ok('scan §92', /## 92\./.test(scan))) fails++
  const sec92 = scan.split('## 92.')[1]?.slice(0, 1200) || ''
  if (!ok('scan no claim 四维落地', !/四维落地/.test(sec92))) fails++

  note(fails === 0 ? 'PASS_RESCAN_92' : `FAIL_COUNT=${fails}`)
} catch (e) {
  note('FAIL: ' + (e && e.stack || e))
  fails++
  try { await page.screenshot({ path: `${out}/ERR.png`, fullPage: true }) } catch {}
}
await browser.close()
fs.writeFileSync(`${out}/smoke-log.txt`, log.join('\n'))
process.exit(fails ? 1 : 0)
