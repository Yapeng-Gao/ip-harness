import { chromium } from 'playwright'
import fs from 'fs'
import path from 'path'

const outDir = path.resolve('tools/_tmp_shots/mpv3-close')
const url = 'http://127.0.0.1:8767/'
const report = { ok: true, checks: [], shots: [] }
function check(name, pass, detail = '') {
  report.checks.push({ name, pass: !!pass, detail })
  if (!pass) report.ok = false
  console.log(`${pass ? 'PASS' : 'FAIL'} ${name}${detail ? ' — ' + detail : ''}`)
}

const browser = await chromium.launch({ headless: true, channel: 'chrome' })
const page = await browser.newPage({ viewport: { width: 1440, height: 1100 } })
try {
  await page.goto(url, { waitUntil: 'networkidle', timeout: 30000 })
  await page.getByRole('button', { name: '登录' }).first().click()
  await page.getByRole('button', { name: /已有工作/ }).click()
  await page.getByRole('button', { name: /进入企业研发/ }).click()
  await page.waitForTimeout(700)

  // --- plan walk on home ---
  await page.getByRole('textbox', { name: /告诉知产负责人/ }).fill('整理一项研发成果，评估如何保护')
  await page.getByRole('button', { name: /交给顾言/ }).click()
  await page.waitForTimeout(400)
  check('plan confirm CTA', await page.getByRole('button', { name: /确认计划并开始/ }).count() === 1)
  await page.getByRole('button', { name: /确认计划并开始/ }).click()
  await page.waitForTimeout(500)
  check('plan walk visible', await page.locator('.plan-walk').count() === 1)
  check('still on home (no workbench yet)', await page.locator('.workbench').count() === 0)
  check('step 1 label', await page.locator('.plan-walk-body h3').innerText().then(t => t.includes('读取')))
  for (let i = 0; i < 3; i++) {
    await page.getByRole('button', { name: /下一步/ }).click()
    await page.waitForTimeout(350)
  }
  check('final CTA', await page.getByRole('button', { name: /完成并进入工作台/ }).count() === 1)
  await page.screenshot({ path: path.join(outDir, 'verify-plan-step4.png') })
  report.shots.push('verify-plan-step4.png')
  await page.getByRole('button', { name: /完成并进入工作台/ }).click()
  await page.waitForTimeout(800)
  check('entered workbench', await page.locator('.workbench').count() === 1)
  check('no dual tab switch', await page.locator('.work-view-switch').count() === 0)
  check('no 协同工作 tab', await page.getByRole('button', { name: '协同工作' }).count() === 0)
  check('no 文书工作 tab', await page.getByRole('button', { name: '文书工作' }).count() === 0)
  check('three panes', await page.locator('.file-pane').count() === 1 && await page.locator('.editor-pane').count() === 1 && await page.locator('.department-pane').count() === 1)
  check('plan strip step1 active', await page.locator('.workspace-plan-strip > div.active').count() === 1)
  const activeStep = await page.locator('.workspace-plan-strip > div.active strong').innerText()
  check('fresh plan starts at 读取', /读取|核对/.test(activeStep), activeStep)
  check('rail confirm present', await page.locator('.rail-confirm').count() === 1)
  await page.screenshot({ path: path.join(outDir, 'verify-unified-wb.png') })
  report.shots.push('verify-unified-wb.png')

  // mid-demo entry still has no dual tab
  await page.getByRole('button', { name: /返回列表|项目中心/ }).first().click().catch(() => {})
  await page.waitForTimeout(300)
  // go home via assistant tab if needed
  const homeBtn = page.getByRole('button', { name: /^助手$/ }).or(page.locator('button').filter({ hasText: '助手' })).first()
  if (await homeBtn.count()) await homeBtn.click()
  await page.waitForTimeout(400)
} catch (e) {
  report.ok = false
  report.error = String(e)
  console.error(e)
  await page.screenshot({ path: path.join(outDir, 'verify-unified-error.png') }).catch(() => {})
} finally {
  await browser.close()
  fs.writeFileSync(path.join(outDir, 'verify-unified-plan.json'), JSON.stringify(report, null, 2))
  console.log(report.ok ? 'ALL OK' : 'FAILED')
  process.exit(report.ok ? 0 : 1)
}
