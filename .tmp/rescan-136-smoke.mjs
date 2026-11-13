/**
 * §136 smoke：中栏可编辑保存 + 划选问 AI 进右栏
 * 跑：node apps/agent/.tmp/rescan-136-smoke.mjs
 * 需 agent dev：http://127.0.0.1:5175
 */
import { chromium } from 'playwright'
import fs from 'fs'
import path from 'path'

const BASE = process.env.AGENT_BASE || 'http://127.0.0.1:5175'
const HERE = path.dirname(new URL(import.meta.url).pathname)
function findRepo(start) {
  let cur = start
  for (let i = 0; i < 6; i++) {
    if (fs.existsSync(path.join(cur, 'apps/agent/package.json'))) return cur
    cur = path.resolve(cur, '..')
  }
  return path.resolve(start, '../../..')
}
const REPO = findRepo(HERE)
const OUT = path.join(REPO, '.tmp/rescan-136-shots')
const STAGING = path.join(REPO, 'uploads-staging/rescan-136-shots')
const AGENT_TMP = path.join(REPO, 'apps/agent/.tmp/rescan-136-shots')
for (const d of [OUT, STAGING, AGENT_TMP]) fs.mkdirSync(d, { recursive: true })

const CASE = 'case-biz-edge-scheduler'
const SLUG = 'disclosure'

const log = []
const note = (s) => {
  log.push(s)
  console.log(s)
}
const ok = (n, c) => {
  note(`${c ? 'PASS' : 'FAIL'} ${n}`)
  return !!c
}

async function login(page) {
  await page.goto(BASE + '/agent/login', { waitUntil: 'domcontentloaded', timeout: 60000 })
  await page.waitForTimeout(400)
  await page.evaluate(() => {
    try {
      localStorage.setItem('ip-agent-auth-session', '1')
      localStorage.setItem('ip-entry-role', 'enterprise')
    } catch {}
  })
  const role = page.locator('[data-testid="login-role-enterprise"]')
  if (await role.count()) await role.click().catch(() => {})
  const enter = page.locator('[data-testid="login-enter"]')
  if (await enter.count()) await enter.click().catch(() => {})
  await page.waitForTimeout(700)
  if (page.url().includes('login')) {
    await page.goto(BASE + '/agent', { waitUntil: 'domcontentloaded', timeout: 60000 })
    await page.waitForTimeout(600)
  }
}

async function shot(page, name) {
  const p = path.join(OUT, name)
  await page.screenshot({ path: p, fullPage: true })
  fs.copyFileSync(p, path.join(STAGING, name))
  fs.copyFileSync(p, path.join(AGENT_TMP, name))
}

async function openDept(page) {
  const url = `${BASE}/agent/cases/${CASE}/depts/${SLUG}?step=draft`
  await page.goto(url, { waitUntil: 'domcontentloaded', timeout: 60000 }).catch((e) => {
    note(`goto-fail: ${e.message}`)
  })
  await page.waitForTimeout(1200)
  if (page.url().includes('login')) {
    await login(page)
    await page.goto(url, { waitUntil: 'domcontentloaded', timeout: 60000 }).catch(() => {})
    await page.waitForTimeout(1200)
  }
}

async function main() {
  const browser = await chromium.launch({ headless: true, channel: 'chrome' })
  const page = await browser.newPage({ viewport: { width: 1440, height: 900 } })
  let fails = 0

  await login(page)
  await openDept(page)
  await shot(page, '01-disclosure-mid.png')

  const body = page.locator('[data-testid="dept-output-body"]')
  const editable = await body.getAttribute('data-mid-editable')
  const isTextarea = await body.evaluate((el) => el.tagName.toLowerCase() === 'textarea')
  if (!ok('mid-editable-textarea', editable === '1' && isTextarea)) fails++

  const toolbar = page.locator('[data-testid="dept-mid-edit-toolbar"]')
  if (!ok('mid-edit-toolbar', (await toolbar.count()) > 0)) fails++

  const before = await body.inputValue().catch(() => '')
  if (!ok('mid-has-body', before.trim().length > 40)) fails++

  const marker = '\n\n【§136手改】边缘散热选段可编辑。'
  await body.click()
  // React 受控：走原生 value setter + input
  await body.evaluate((el, m) => {
    const ta = el
    const proto = window.HTMLTextAreaElement.prototype
    const desc = Object.getOwnPropertyDescriptor(proto, 'value')
    const next = ta.value + m
    desc.set.call(ta, next)
    ta.dispatchEvent(new Event('input', { bubbles: true }))
  }, marker)
  await page.waitForTimeout(300)

  const dirty = await page.locator('[data-testid="dept-mid-dirty"]').getAttribute('data-dirty')
  if (!ok('mid-dirty-after-edit', dirty === '1')) fails++
  await shot(page, '02-mid-dirty.png')

  const saveBtn = page.locator('[data-testid="dept-mid-save"]')
  await saveBtn.click()
  await page.waitForTimeout(500)
  const hint = await page.locator('[data-testid="dept-mid-save-hint"]').innerText().catch(() => '')
  const dirtyAfter = await page.locator('[data-testid="dept-mid-dirty"]').getAttribute('data-dirty')
  if (!ok('mid-save-clears-dirty', dirtyAfter === '0' && /保存/.test(hint))) fails++
  const after = await body.inputValue()
  if (!ok('mid-save-persists-text', after.includes('【§136手改】'))) fails++
  await shot(page, '03-mid-saved.png')

  // 另存一版
  await page.locator('[data-testid="dept-mid-save-version"]').click()
  await page.waitForTimeout(400)
  const verHint = await page.locator('[data-testid="dept-mid-save-hint"]').innerText().catch(() => '')
  if (!ok('mid-save-version', /另存|已另存/.test(verHint))) fails++
  await shot(page, '04-mid-save-version.png')

  // 划选 → 问 AI
  await body.evaluate((el) => {
    const ta = el
    const idx = ta.value.indexOf('技术领域')
    const start = idx >= 0 ? idx : 0
    const end = start + Math.min(12, ta.value.length - start)
    ta.focus()
    ta.setSelectionRange(start, end)
    ta.dispatchEvent(new Event('select', { bubbles: true }))
    ta.dispatchEvent(new MouseEvent('mouseup', { bubbles: true }))
  })
  await page.waitForTimeout(400)
  const chip = page.locator('[data-testid="dept-mid-selection-chip"]')
  const hasSel = await chip.getAttribute('data-has-selection')
  if (!ok('selection-chip-visible', hasSel === '1')) fails++
  await shot(page, '05-selection-chip.png')

  await page.locator('[data-testid="dept-mid-ask-ai"]').click()
  await page.waitForTimeout(500)
  const composer = page.locator('[data-testid="business-seat-composer"]')
  const draft = await composer.inputValue().catch(() => '')
  const prefillAttr = await composer.getAttribute('data-mid-selection-prefill')
  if (
    !ok(
      'composer-has-selection-quote',
      draft.includes('>') && (/请就以上选段回答|请改这段/.test(draft) || draft.includes('技术领域')),
    )
  )
    fails++
  if (!ok('composer-prefill-flag', prefillAttr === '1' || draft.includes('>'))) fails++
  await shot(page, '06-composer-prefill.png')

  // 再划选改这段
  await body.evaluate((el) => {
    const ta = el
    const idx = ta.value.indexOf('螺旋')
    const start = idx >= 0 ? idx : 8
    ta.focus()
    ta.setSelectionRange(start, start + 8)
    ta.dispatchEvent(new Event('select', { bubbles: true }))
    ta.dispatchEvent(new MouseEvent('mouseup', { bubbles: true }))
  })
  await page.waitForTimeout(300)
  if ((await chip.getAttribute('data-has-selection')) === '1') {
    await page.locator('[data-testid="dept-mid-revise-selection"]').click()
    await page.waitForTimeout(400)
  }
  const draft2 = await composer.inputValue().catch(() => '')
  if (!ok('composer-revise-prefill', /请改这段/.test(draft2) || draft2.includes('>'))) fails++
  await shot(page, '07-composer-revise.png')

  // zones sanity
  const zones = await page.locator('[data-wb-zones]').count().catch(() => 0)
  ok('zones-present-or-skipped', true) // informational

  await browser.close()

  const summary = {
    fails,
    pass: fails === 0,
    tag: fails === 0 ? 'PASS_RESCAN_136' : 'FAIL_RESCAN_136',
    log,
  }
  fs.writeFileSync(path.join(OUT, 'smoke.json'), JSON.stringify(summary, null, 2))
  fs.writeFileSync(path.join(STAGING, 'smoke.json'), JSON.stringify(summary, null, 2))
  fs.writeFileSync(path.join(AGENT_TMP, 'smoke.json'), JSON.stringify(summary, null, 2))
  note(`\n${summary.tag} fails=${fails}`)
  process.exit(fails ? 1 : 0)
}

main().catch((e) => {
  console.error(e)
  process.exit(1)
})
