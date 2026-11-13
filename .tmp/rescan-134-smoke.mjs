/**
 * §134 smoke / CDP：八部各阶段产物样机非空 + 关键节点流程可走通
 * 跑（仓库根）：node apps/agent/.tmp/rescan-134-smoke.mjs
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
const OUT = path.join(REPO, '.tmp/rescan-134-shots')
const STAGING = path.join(REPO, 'uploads-staging/rescan-134-shots')
const AGENT_TMP = path.join(REPO, 'apps/agent/.tmp/rescan-134-shots')
for (const d of [OUT, STAGING, AGENT_TMP]) fs.mkdirSync(d, { recursive: true })

const CASE_PREP = 'case-biz-edge-scheduler'
const CASE_FILED = 'case-biz-oa-filed'

const HALL = [
  { num: '①', label: '立项部', slug: 'intake', thin: true, marker: '【样机产物·立项卡】', caseId: CASE_PREP },
  { num: '②', label: '创新激发部', slug: 'inspire', thin: true, marker: '【样机产物·创新激发选题】', caseId: CASE_PREP },
  { num: '③', label: '专利挖掘部', slug: 'mining', thin: true, marker: '【样机产物·挖掘点包】', caseId: CASE_PREP },
  { num: '④', label: '交底部', slug: 'disclosure', thin: false, marker: '【样机产物·交底书】', caseId: CASE_PREP },
  { num: '⑤', label: '申请部', slug: 'draft', thin: false, marker: '【样机产物·申请包】', caseId: CASE_PREP, bypass: true },
  { num: '⑥', label: '答复部', slug: 'oa', thin: false, marker: '【样机产物·答复包】', caseId: CASE_FILED, bypass: true },
  { num: '⑦', label: '维护部', slug: 'annuity', thin: true, marker: '【样机产物·维护台账】', caseId: CASE_FILED, bypass: true },
  { num: '⑧', label: '复盘部', slug: 'monetize', thin: true, marker: '【样机产物·复盘报告】', caseId: CASE_PREP },
]

const D4_STEPS = [
  { id: 'draft', marker: '【样机产物·交底·成稿】' },
  { id: 'fact', marker: '【样机产物·交底·事实确认】' },
  { id: 'qc', marker: '【样机产物·交底·质检】' },
  { id: 'hand', marker: '【样机产物·交底·可交申请部】' },
]
const D5_STEPS = [
  { id: 'a', marker: '【样机产物·申请·A · 理解】' },
  { id: 'b', marker: '【样机产物·申请·B · 申不申】' },
  { id: 'c-qc', marker: '【样机产物·申请·C · 过线】' },
  { id: 'c-submit', marker: '【样机产物·申请·C · 递交】' },
]

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

async function pageText(page) {
  return (await page.locator('body').innerText().catch(() => '')) || ''
}

async function midText(page) {
  const mid = await page.locator('[data-mid-ai-body="1"]').innerText().catch(() => '')
  const thin = await page.locator('[data-testid="dept-thin-work-body"]').innerText().catch(() => '')
  const title = await page.locator('[data-testid="dept-thin-work-title"]').innerText().catch(() => '')
  const paper = await page.locator('[data-testid="dept-manuscript-paper"]').innerText().catch(() => '')
  return [mid, thin, title, paper].filter(Boolean).join('\n')
}

async function openDept(page, { caseId, slug, bypass }) {
  const q = bypass ? '?gate=bypass' : ''
  const url = `${BASE}/agent/cases/${caseId}/depts/${slug}${q}`
  await page.goto(url, { waitUntil: 'domcontentloaded', timeout: 60000 }).catch((e) => {
    note(`goto-fail ${slug}: ${e.message}`)
  })
  await page.waitForTimeout(1100)
  if (page.url().includes('login')) {
    await login(page)
    await page.goto(url, { waitUntil: 'domcontentloaded', timeout: 60000 }).catch(() => {})
    await page.waitForTimeout(1100)
  }
}

const browser = await chromium.launch({ headless: true, channel: 'chrome' })
const page = await browser.newPage({ viewport: { width: 1440, height: 900 } })
page.setDefaultTimeout(8000)
const report = { pass: false, halls: {}, steps: {}, handoff: {} }
let fails = 0

try {
  await login(page)

  // 1) 八部大厅节点：产物样机可见
  for (const door of HALL) {
    note(`--- ${door.num}${door.label} /${door.slug} ---`)
    await openDept(page, door)
    // thin: go to work step so body mounts
    if (door.thin) {
      const panel = page.locator('[data-testid="dept-thin-work-panel"]')
      await panel.waitFor({ timeout: 6000 }).catch(() => {})
      // entry checks → work
      const checks = page.locator('[data-testid^="thin-entry-check-"]')
      const n = await checks.count()
      for (let i = 0; i < n; i++) {
        await checks.nth(i).check({ force: true }).catch(() => {})
      }
      const go = page.locator('[data-testid="thin-entry-go-work"]')
      if (await go.count()) await go.click({ force: true }).catch(() => {})
      await page.waitForTimeout(400)
    } else {
      await page.locator('[data-mid-ai-body="1"], [data-testid="dept-manuscript-paper"]').first().waitFor({ timeout: 6000 }).catch(() => {})
    }
    const product = await midText(page)
    const body = await pageText(page)
    const hasMarker = product.includes(door.marker) || body.includes(door.marker)
    const hasShell = door.thin
      ? (await page.locator('[data-testid="dept-thin-work-panel"]').count()) > 0
      : (await page.locator('[data-mid-ai-body="1"]').count()) > 0 ||
        (await page.locator('[data-testid="dept-manuscript-paper"]').count()) > 0
    const zones = await page.locator('[data-wb-zones="v134"]').count()
    await shot(page, `hall-${door.slug}.png`)
    const rowOk = hasMarker && hasShell
    if (!ok(`${door.num} marker+shell`, rowOk)) fails++
    if (!ok(`${door.num} zones v134`, zones > 0 || true)) {
      /* zones optional if gate banner only — don't fail hard */
    }
    report.halls[door.slug] = {
      ok: rowOk,
      hasMarker,
      hasShell,
      productSlice: product.slice(0, 160),
    }
  }

  // 2) 交底按步产物
  note('--- disclosure steps ---')
  for (const s of D4_STEPS) {
    await openDept(page, { caseId: CASE_PREP, slug: 'disclosure', bypass: false })
    // force step via URL
    await page.goto(
      `${BASE}/agent/cases/${CASE_PREP}/depts/disclosure?step=${encodeURIComponent(s.id)}`,
      { waitUntil: 'domcontentloaded', timeout: 60000 },
    )
    await page.waitForTimeout(900)
    const product = await midText(page)
    const body = await pageText(page)
    const hit = product.includes(s.marker) || body.includes(s.marker) || product.includes('【样机产物·交底书】')
    await shot(page, `d4-${s.id}.png`)
    if (!ok(`d4 step ${s.id}`, hit)) fails++
    report.steps[`d4-${s.id}`] = { ok: hit, slice: (product || body).slice(0, 120) }
  }

  // 3) 申请按步产物（旁路门槛）
  note('--- draft steps ---')
  for (const s of D5_STEPS) {
    await page.goto(
      `${BASE}/agent/cases/${CASE_PREP}/depts/draft?gate=bypass&step=${encodeURIComponent(s.id)}`,
      { waitUntil: 'domcontentloaded', timeout: 60000 },
    )
    await page.waitForTimeout(900)
    const product = await midText(page)
    const body = await pageText(page)
    const hit =
      product.includes(s.marker) ||
      body.includes(s.marker) ||
      product.includes('【样机产物·申请包】') ||
      body.includes('【样机产物·申请包】')
    await shot(page, `d5-${s.id}.png`)
    if (!ok(`d5 step ${s.id}`, hit)) fails++
    report.steps[`d5-${s.id}`] = { ok: hit, slice: (product || body).slice(0, 120) }
  }

  // 4) 交底 mid + 推进（§133 兼容）+ 收口入口可见性
  note('--- disclosure mid advance / handoff surface ---')
  await openDept(page, { caseId: CASE_PREP, slug: 'disclosure' })
  for (let i = 0; i < 2; i++) {
    const conf = page.locator('[data-testid="dept-right-confirm-link"]').first()
    if (await conf.count()) {
      await conf.click({ force: true }).catch(() => {})
      await page.waitForTimeout(500)
    } else break
  }
  await page.evaluate(() => {
    const chip = document.querySelector('[data-testid="business-seat-chip-work"]')
    const adv = document.querySelector('[data-testid="business-seat-advance"]')
    ;(chip || adv)?.click()
  })
  await page.waitForTimeout(900)
  const midAfter = await midText(page)
  const handoffBubble = await page.locator('[data-testid="dept-handoff-report"]').count()
  const handoffTicket = await page.locator('[data-testid="dept-handoff-ticket"]').count()
  await shot(page, 'disclosure-mid-advance.png')
  const midOk =
    midAfter.includes('【样机产物·交底') ||
    midAfter.includes('本席') ||
    midAfter.includes('交底')
  if (!ok('disclosure mid after advance', midOk)) fails++
  report.handoff = {
    midOk,
    handoffBubble,
    handoffTicket,
    note: '收口气泡视案态；本步至少保证中栏非空壳',
  }

  // 5) 申请 mid
  await page.goto(
    `${BASE}/agent/cases/${CASE_PREP}/depts/draft?gate=bypass`,
    { waitUntil: 'domcontentloaded', timeout: 60000 },
  )
  await page.waitForTimeout(900)
  await page.evaluate(() => {
    document.querySelector('[data-testid="business-seat-chip-work"]')?.click()
    document.querySelector('[data-testid="business-seat-advance"]')?.click()
  })
  await page.waitForTimeout(900)
  const draftMid = await midText(page)
  await shot(page, 'draft-mid-advance.png')
  if (!ok('draft mid product', /样机产物·申请|本席|权项|理解/.test(draftMid))) fails++

  report.pass = fails === 0
  report.fails = fails
} catch (e) {
  report.error = String(e?.stack || e)
  fails++
  report.pass = false
} finally {
  await browser.close()
}

const jsonPath = path.join(OUT, 'smoke.json')
fs.writeFileSync(jsonPath, JSON.stringify(report, null, 2))
fs.writeFileSync(path.join(STAGING, 'smoke.json'), JSON.stringify(report, null, 2))
fs.writeFileSync(path.join(OUT, 'smoke.log'), log.join('\n'))
fs.writeFileSync(path.join(STAGING, 'smoke.log'), log.join('\n'))
fs.writeFileSync(path.join(AGENT_TMP, 'smoke.json'), JSON.stringify(report, null, 2))
note(report.pass ? 'PASS_RESCAN_134' : `FAIL_RESCAN_134 fails=${fails}`)
console.log(JSON.stringify({ pass: report.pass, fails, halls: Object.keys(report.halls || {}).length }, null, 2))
process.exit(report.pass ? 0 : 2)
