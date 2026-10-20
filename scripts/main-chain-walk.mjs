/**
 * 业务主链走查：新建「全流程走查样机」→ 4 步向导 → 8 席 advance+confirm
 * 每步确认后验收中台 flowProgressByCase + handoff（经 cross-port snapshot）
 * Base: agent http://127.0.0.1:5175 · mid http://127.0.0.1:5173
 * Run: node scripts/main-chain-walk.mjs  （需本机 Chrome 或已装 PW chromium；勿沙箱）
 */
import { chromium } from 'playwright'

const BASE = process.env.AGENT_BASE || 'http://localhost:5175'
const MID_BASE = process.env.MID_BASE || 'http://localhost:5173'
const SNAPSHOT_KEY = 'ip-harness.cross.v1.snapshot'
const TITLE = '全流程走查样机'
const log = []
const bugs = []

/** 与 src/data/flowSteps.ts FLOW_CATALOG 同源 */
const FLOW_LEN = { intake: 4, research: 5, draft: 4, prosecution: 4 }

const CHAIN = [
  {
    seat: 'expert-intake',
    kind: 'go_nogo',
    next: 'expert-disclosure',
    expect: {
      handoffs: { intake_quote: 'approved' },
      flows: { intake: FLOW_LEN.intake },
    },
  },
  {
    seat: 'expert-disclosure',
    kind: 'disclosure_ready',
    next: 'expert-research',
    expect: {
      handoffs: { disclosure_pack: 'approved' },
      flows: { intake: FLOW_LEN.intake, research: 0, draft: 1 },
    },
  },
  {
    seat: 'expert-research',
    kind: 'research_ready',
    next: 'expert-draft',
    expect: {
      handoffs: { research_report: 'approved' },
      flows: { intake: FLOW_LEN.intake, research: FLOW_LEN.research, draft: 1 },
    },
  },
  {
    seat: 'expert-draft',
    kind: 'claims_ready',
    next: 'expert-research',
    expect: {
      handoffs: { draft_claims: 'approved' },
      flows: { intake: FLOW_LEN.intake, research: FLOW_LEN.research, draft: 2 },
    },
  },
  {
    seat: 'expert-research',
    kind: 'research_ready',
    next: 'expert-figure',
    expect: {
      handoffs: { research_report: 'approved' },
      flows: { intake: FLOW_LEN.intake, research: FLOW_LEN.research, draft: 2 },
    },
  },
  {
    seat: 'expert-figure',
    kind: 'figures_ready',
    next: 'expert-filing',
    expect: {
      handoffs: { draft_claims: 'approved' },
      flows: { intake: FLOW_LEN.intake, research: FLOW_LEN.research, draft: FLOW_LEN.draft },
      handoffNoteIncludes: '确认附图',
    },
  },
  {
    seat: 'expert-filing',
    kind: 'file_authorize',
    next: 'expert-oa',
    expect: {
      handoffs: { draft_claims: 'authorized_to_file' },
      flows: { intake: FLOW_LEN.intake, research: FLOW_LEN.research, draft: FLOW_LEN.draft },
    },
  },
  {
    seat: 'expert-oa',
    kind: 'oa_strategy',
    next: 'expert-oa',
    expect: {
      handoffs: { prosecution_response: 'approved' },
      flows: {
        intake: FLOW_LEN.intake,
        research: FLOW_LEN.research,
        draft: FLOW_LEN.draft,
        prosecution: FLOW_LEN.prosecution,
      },
    },
  },
]

function note(msg) {
  log.push(msg)
  console.log(msg)
}

async function launchBrowser() {
  try {
    return await chromium.launch({ headless: true })
  } catch (e) {
    note(`bundled chromium missing, channel=chrome: ${String(e.message || e).slice(0, 100)}`)
    return await chromium.launch({ channel: 'chrome', headless: true })
  }
}

async function waitIdle(page) {
  await page
    .locator('[data-testid="business-seat-chat-busy"]')
    .waitFor({ state: 'detached', timeout: 8000 })
    .catch(() => {})
  await page.waitForTimeout(100)
}

async function readSnapshotOn(page) {
  return page.evaluate((key) => {
    try {
      const raw = localStorage.getItem(key)
      return raw ? JSON.parse(raw) : null
    } catch {
      return null
    }
  }, SNAPSHOT_KEY)
}

async function waitForDevServers() {
  for (let i = 0; i < 40; i++) {
    try {
      const [a, m] = await Promise.all([
        fetch(`${BASE}/`).then((r) => r.ok),
        fetch(`${MID_BASE}/`).then((r) => r.ok),
      ])
      if (a && m) return true
    } catch {
      /* retry */
    }
    await new Promise((r) => setTimeout(r, 500))
  }
  return false
}

function checkSnapshot(snap, caseId, step, label) {
  if (!snap?.cases?.length) {
    bugs.push(`[${step.kind}] ${label} snapshot missing cases`)
    note(`  ${label} verify FAIL: no snapshot`)
    return false
  }
  const caze = snap.cases.find((c) => c.id === caseId)
  if (!caze) {
    bugs.push(`[${step.kind}] case ${caseId} not in ${label} snapshot`)
    note(`  ${label} verify FAIL: case missing`)
    return false
  }
  const flow = snap.flowProgressByCase?.[caseId] ?? {}
  for (const [key, want] of Object.entries(step.expect.handoffs ?? {})) {
    const got = caze.handoffs?.[key]?.status
    if (got !== want) {
      bugs.push(`[${step.kind}] ${label} handoff ${key}: got ${got}, want ${want}`)
      note(`  ${label} handoff ${key}: ${got} (want ${want})`)
    } else {
      note(`  ${label} handoff ${key}: ${got}`)
    }
    const noteText = caze.handoffs?.[key]?.note ?? ''
    if (step.expect.handoffNoteIncludes && !noteText.includes(step.expect.handoffNoteIncludes)) {
      bugs.push(
        `[${step.kind}] ${label} handoff ${key} note missing "${step.expect.handoffNoteIncludes}"`,
      )
      note(`  ${label} handoff note: "${noteText.slice(0, 60)}"`)
    }
  }
  for (const [fk, wantIdx] of Object.entries(step.expect.flows ?? {})) {
    const gotIdx = flow[fk]?.stepIndex
    if (gotIdx !== wantIdx) {
      bugs.push(`[${step.kind}] ${label} flow ${fk}: stepIndex ${gotIdx}, want ${wantIdx}`)
      note(`  ${label} flow ${fk}: s${gotIdx} (want s${wantIdx})`)
    } else {
      note(`  ${label} flow ${fk}: s${gotIdx}`)
    }
  }
  return true
}

/** Agent 写 cross-port snapshot；hub 经 iframe bridge 同步到 mid:5173 */
async function verifyMidSync(agentPage, midPage, caseId, step) {
  await agentPage.waitForTimeout(500)
  const agentSnap = await readSnapshotOn(agentPage)
  const agentOk = checkSnapshot(agentSnap, caseId, step, 'agent')

  let midSnap = null
  for (let i = 0; i < 6; i++) {
    await midPage.goto(`${MID_BASE}/`, { waitUntil: 'domcontentloaded' }).catch(() => {})
    await agentPage.waitForTimeout(350)
    midSnap = await readSnapshotOn(midPage)
    if (midSnap?.cases?.some((c) => c.id === caseId)) break
  }
  if (midSnap?.cases?.some((c) => c.id === caseId)) {
    checkSnapshot(midSnap, caseId, step, 'mid')
  } else if (agentOk) {
    note(`  mid hub: case not replicated yet (agent snapshot ok)`)
  }
}

async function createCase(page) {
  await page.goto(`${BASE}/agent/cases/new`, { waitUntil: 'domcontentloaded' })
  await page.locator('[data-testid="business-case-new-page"]').waitFor({ timeout: 15000 })

  await page.locator('[data-testid="business-new-title"]').fill(TITLE)
  await page.locator('[data-testid="business-new-summary"]').fill('主链走查样机 · Playwright')
  await page.locator('[data-testid="business-new-next"]').click()

  await page.locator('[data-testid="business-wizard-step-route"]').waitFor()
  await page.locator('[data-testid="business-stage-card-intake"]').click()

  await page.locator('[data-testid="business-wizard-step-plan"]').waitFor({ timeout: 8000 })
  const gen = page.locator('[data-testid="business-intake-generate-plan"]')
  if (await gen.isVisible().catch(() => false)) {
    await gen.click()
  }
  const plan = page.locator('[data-testid="business-new-case-plan"]')
  const planText = (await plan.inputValue().catch(() => '')) || ''
  if (!planText.trim()) {
    await plan.fill(
      `案子：${TITLE}\n目标：主链走查\n起点席：expert-research\n阶段：intake\n下一步：去查新开干`,
    )
  }
  note(`wizard plan step ok (len=${(await plan.inputValue()).length})`)
  await page.locator('[data-testid="business-new-next"]').click()

  await page.locator('[data-testid="business-wizard-step-roster"]').waitFor({ timeout: 8000 })
  await page.locator('[data-testid="business-new-submit"]').click()

  await page.locator('[data-testid="business-case-page"]').waitFor({ timeout: 15000 })
  const caseId = await page
    .locator('[data-testid="business-case-page"]')
    .getAttribute('data-case-id')
  note(`created case=${caseId} url=${page.url()}`)
  return caseId
}

async function advanceSeatToPending(page, caseId, seat) {
  const urlSeat = new URL(page.url(), BASE).searchParams.get('seat')
  if (!page.url().includes(`/agent/cases/${caseId}`) || urlSeat !== seat) {
    await page.goto(`${BASE}/agent/cases/${caseId}?seat=${seat}`, {
      waitUntil: 'domcontentloaded',
    })
  }
  await page.locator('[data-testid="business-case-page"]').waitFor({ timeout: 12000 })

  for (let i = 0; i < 18; i++) {
    if (page.url().includes('/agent/pending/')) {
      note(`  [${seat}] auto-landed pending after ${i} advances`)
      return
    }
    await waitIdle(page)
    const cta = page.locator('[data-testid="business-case-primary-cta"]')
    if (!(await cta.isVisible().catch(() => false))) {
      await page.waitForTimeout(500)
      if (page.url().includes('/agent/pending/')) {
        note(`  [${seat}] pending after CTA missing`)
        return
      }
      throw new Error(`[${seat}] primary CTA missing @ ${page.url()}`)
    }
    const kind = await cta.getAttribute('data-cta-kind')
    const label = ((await cta.textContent()) || '').trim()
    if (kind === 'confirm') {
      note(`  [${seat}] confirm CTA="${label}" @ advance ${i}`)
      await cta.click()
      await page.locator('[data-testid="pending-confirm-detail"]').waitFor({ timeout: 10000 })
      return
    }
    await cta.click()
    await waitIdle(page)
    await page.waitForTimeout(200)
  }
  throw new Error(`[${seat}] never reached pending after advances`)
}

async function confirmPending(page, expectedNextSeat, caseId) {
  await page.locator('[data-testid="pending-confirm-detail"]').waitFor({ timeout: 8000 })
  const assistOk = await page
    .locator('[data-testid="hitl-assist-card"]')
    .isVisible()
    .catch(() => false)
  note(`  assist card visible=${assistOk}`)
  await page.locator('[data-testid="pending-confirm-submit"]').click()
  await page.waitForURL(new RegExp(`/agent/cases/${caseId}`), { timeout: 10000 })
  await page.locator('[data-testid="business-case-page"]').waitFor({ timeout: 10000 })
  const seat = new URL(page.url(), BASE).searchParams.get('seat')
  note(`  after confirm → seat=${seat} (expect ${expectedNextSeat})`)
  if (seat !== expectedNextSeat) {
    bugs.push(`confirm next seat: got ${seat}, expect ${expectedNextSeat}`)
  }
  return seat
}

async function spotSidebar(page, caseId) {
  if (!page.url().includes(`/agent/cases/${caseId}`) || page.url().includes('/room')) {
    await page.goto(`${BASE}/agent/cases/${caseId}`, { waitUntil: 'domcontentloaded' })
    await page.locator('[data-testid="business-case-page"]').waitFor()
  }
  const treeOk = await page
    .locator('[data-testid="business-node-list"]')
    .isVisible()
    .catch(() => false)
  note(`spot: node list visible=${treeOk}`)
  const nodes = await page.locator('[data-testid^="business-seat-tab-"]').count()
  note(`spot: seat tabs=${nodes}`)
}

async function main() {
  const browser = await launchBrowser()
  const context = await browser.newContext()
  const page = await context.newPage()
  const midPage = await context.newPage()
  page.setDefaultTimeout(20000)
  const consoleErrors = []
  page.on('pageerror', (e) => consoleErrors.push(String(e)))
  page.on('console', (m) => {
    if (m.type() === 'error') consoleErrors.push(m.text())
  })

  let caseId = null
  let lastHandoff = null
  let lastFlows = null

  try {
    if (!(await waitForDevServers())) {
      throw new Error(`dev servers not ready: agent ${BASE} mid ${MID_BASE}`)
    }
    note('dev servers ready')
    await page.goto(`${BASE}/agent`, { waitUntil: 'domcontentloaded' })
    await midPage.goto(`${MID_BASE}/`, { waitUntil: 'domcontentloaded' })
    await page.waitForTimeout(800)

    caseId = await createCase(page)
    await spotSidebar(page, caseId)

    for (const step of CHAIN) {
      note(`--- seat ${step.seat} (${step.kind}) ---`)
      await advanceSeatToPending(page, caseId, step.seat)
      await confirmPending(page, step.next, caseId)
      await verifyMidSync(page, midPage, caseId, step)
      const snap = await readSnapshotOn(page)
      const caze = snap?.cases?.find((c) => c.id === caseId)
      if (step.kind === 'oa_strategy') {
        lastHandoff = caze?.handoffs?.prosecution_response?.status
      }
      lastFlows = snap?.flowProgressByCase?.[caseId]
    }

    note('=== MAIN CHAIN COMPLETE ===')
    note(`final caseId=${caseId}`)
    note(`final prosecution_response=${lastHandoff}`)
    note(`final flows=${JSON.stringify(lastFlows)}`)
  } catch (e) {
    note(`FAIL: ${e.message || e}`)
    bugs.push(String(e.message || e))
    try {
      await page.screenshot({
        path: 'scripts/main-chain-walk-fail.png',
        fullPage: true,
      })
      note('screenshot → scripts/main-chain-walk-fail.png')
    } catch {}
  } finally {
    if (consoleErrors.length) {
      note(
        `page errors (${consoleErrors.length}): ${consoleErrors.slice(0, 5).join(' | ')}`,
      )
    }
    note(`bugs=${JSON.stringify(bugs)}`)
    await browser.close()
  }

  const ok = log.some((l) => l.includes('MAIN CHAIN COMPLETE'))
  process.exit(ok && bugs.length === 0 ? 0 : 1)
}

main()
