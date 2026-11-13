/**
 * §135 smoke / CDP：八部真实 Office 产物正文 + 关键节点流程可走通
 * 跑（仓库根）：node apps/agent/.tmp/rescan-135-smoke.mjs
 * 需 agent dev：http://127.0.0.1:5175
 * 断言正文内容标记（技术领域/独权/年费等），禁止依赖【样机产物】横幅。
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
const OUT = path.join(REPO, '.tmp/rescan-135-shots')
const STAGING = path.join(REPO, 'uploads-staging/rescan-135-shots')
const AGENT_TMP = path.join(REPO, 'apps/agent/.tmp/rescan-135-shots')
for (const d of [OUT, STAGING, AGENT_TMP]) fs.mkdirSync(d, { recursive: true })

const CASE_PREP = 'case-biz-edge-scheduler'
const CASE_FILED = 'case-biz-oa-filed'

const HALL = [
  { num: '①', label: '立项部', slug: 'intake', thin: true, markers: ['【建项卡】', '边缘散热', '待确认'], caseId: CASE_PREP },
  { num: '②', label: '创新激发部', slug: 'inspire', thin: true, markers: ['【选题卡】', '路径 A', '推荐理由'], caseId: CASE_PREP },
  { num: '③', label: '专利挖掘部', slug: 'mining', thin: true, markers: ['点包', '可专利性', '拆案建议'], caseId: CASE_PREP },
  { num: '④', label: '交底部', slug: 'disclosure', thin: false, markers: ['【技术交底书】', '技术领域', '螺旋水道'], caseId: CASE_PREP },
  { num: '⑤', label: '申请部', slug: 'draft', thin: false, markers: ['【开案理解纪要】', '独权', '交底主张'], caseId: CASE_PREP, bypass: true },
  { num: '⑥', label: '答复部', slug: 'oa', thin: false, markers: ['争点', '审查意见', '创造性'], caseId: CASE_FILED, bypass: true },
  { num: '⑦', label: '维护部', slug: 'annuity', thin: true, markers: ['年费', '台账', '期限'], caseId: CASE_FILED, bypass: true },
  { num: '⑧', label: '复盘部', slug: 'monetize', thin: true, markers: ['阶段复盘', '1 研发', '5 市场'], caseId: CASE_PREP },
]

const D4_STEPS = [
  { id: 'draft', markers: ['【技术交底书】', '技术领域'] },
  { id: 'fact', markers: ['【交底事实确认单】', '待核清单'] },
  { id: 'qc', markers: ['【交底质检卡】', '技术领域清楚'] },
  { id: 'hand', markers: ['交接清单', '可交申请部'] },
]
const D5_STEPS = [
  { id: 'a', markers: ['【开案理解纪要】', '独权'] },
  { id: 'b', markers: ['申不申', '查新'] },
  { id: 'c-qc', markers: ['过线', '权利要求书'] },
  { id: 'c-submit', markers: ['确认递交', '独权摘要'] },
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

function hasAny(text, markers) {
  return markers.some((m) => text.includes(m))
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
const report = { pass: false, halls: {}, steps: {}, handoff: {}, bans: {} }
let fails = 0

try {
  await login(page)

  // 1) 八部大厅节点：真实产物正文可见，无样机横幅
  for (const door of HALL) {
    note(`--- ${door.num}${door.label} /${door.slug} ---`)
    await openDept(page, door)
    if (door.thin) {
      const panel = page.locator('[data-testid="dept-thin-work-panel"]')
      await panel.waitFor({ timeout: 6000 }).catch(() => {})
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
    const blob = product + '\n' + body
    const hasMarker = hasAny(product, door.markers) || hasAny(body, door.markers)
    const noBanner = !blob.includes('【样机产物')
    const hasShell = door.thin
      ? (await page.locator('[data-testid="dept-thin-work-panel"]').count()) > 0
      : (await page.locator('[data-mid-ai-body="1"]').count()) > 0 ||
        (await page.locator('[data-testid="dept-manuscript-paper"]').count()) > 0
    await shot(page, `hall-${door.slug}.png`)
    const rowOk = hasMarker && hasShell && noBanner
    if (!ok(`${door.num} content+shell+no-banner`, rowOk)) fails++
    report.halls[door.slug] = {
      ok: rowOk,
      hasMarker,
      hasShell,
      noBanner,
      productSlice: product.slice(0, 180),
    }
  }

  // 2) 交底按步产物
  note('--- disclosure steps ---')
  for (const s of D4_STEPS) {
    await page.goto(
      `${BASE}/agent/cases/${CASE_PREP}/depts/disclosure?step=${encodeURIComponent(s.id)}`,
      { waitUntil: 'domcontentloaded', timeout: 60000 },
    )
    await page.waitForTimeout(900)
    const product = await midText(page)
    const body = await pageText(page)
    const blob = product + '\n' + body
    const hit = hasAny(product, s.markers) || hasAny(body, s.markers)
    const noBanner = !blob.includes('【样机产物')
    await shot(page, `d4-${s.id}.png`)
    if (!ok(`d4 step ${s.id}`, hit && noBanner)) fails++
    report.steps[`d4-${s.id}`] = { ok: hit && noBanner, slice: (product || body).slice(0, 140) }
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
    const blob = product + '\n' + body
    const hit = hasAny(product, s.markers) || hasAny(body, s.markers)
    const noBanner = !blob.includes('【样机产物')
    await shot(page, `d5-${s.id}.png`)
    if (!ok(`d5 step ${s.id}`, hit && noBanner)) fails++
    report.steps[`d5-${s.id}`] = { ok: hit && noBanner, slice: (product || body).slice(0, 140) }
  }

  // 4) 交底 mid + 推进
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
    /技术交底书|技术领域|交底|本席/.test(midAfter) && !midAfter.includes('【样机产物')
  if (!ok('disclosure mid after advance', midOk)) fails++
  report.handoff = {
    midOk,
    handoffBubble,
    handoffTicket,
    note: '收口气泡视案态；本步至少保证中栏真实交底正文',
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
  if (!ok('draft mid product', /独权|开案理解|权项|理解|本席/.test(draftMid) && !draftMid.includes('【样机产物'))) fails++

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
note(report.pass ? 'PASS_RESCAN_135' : `FAIL_RESCAN_135 fails=${fails}`)
console.log(JSON.stringify({ pass: report.pass, fails, halls: Object.keys(report.halls || {}).length }, null, 2))
process.exit(report.pass ? 0 : 2)
