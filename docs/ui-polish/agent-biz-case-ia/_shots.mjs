import { chromium } from 'playwright'
import { mkdirSync } from 'fs'
import { join } from 'path'

const OUT = '/workspace/ip-harness/docs/ui-polish/agent-biz-case-ia'
mkdirSync(OUT, { recursive: true })
const base = 'http://127.0.0.1:5175'
const CASE = 'case-biz-edge-scheduler'

async function shot(page, name) {
  const path = join(OUT, name)
  await page.screenshot({ path, fullPage: true })
  console.log('saved', name)
}

const browser = await chromium.launch({
  headless: true,
  executablePath: '/usr/bin/google-chrome',
  args: ['--no-sandbox', '--disable-dev-shm-usage'],
})
const context = await browser.newContext({
  viewport: { width: 1440, height: 900 },
  locale: 'zh-CN',
})
const page = await context.newPage()

await page.goto(base + '/agent', { waitUntil: 'networkidle' })
await page.evaluate(() => {
  try {
    localStorage.removeItem('ip-harness-agent-business-v1')
    for (const k of Object.keys(localStorage)) {
      if (k.includes('project') || k.includes('folder') || k.includes('thread') || k.includes('room')) {
        localStorage.removeItem(k)
      }
    }
  } catch {}
})
await page.reload({ waitUntil: 'networkidle' })
await page.waitForTimeout(500)
await shot(page, '05-home-intact.png')

await page.goto(base + `/agent/cases/${CASE}?seat=expert-disclosure`, {
  waitUntil: 'networkidle',
})
await page.waitForTimeout(800)
await page.getByTestId('business-case-page').waitFor({ state: 'visible', timeout: 15000 })
await page.getByTestId('business-seat-chat').waitFor({ state: 'visible', timeout: 10000 })
await shot(page, '01-knife1-two-col.png')

// 刀2：有待确认 → 去确认；更多里专家台次级
await page.getByTestId('business-case-primary-cta').waitFor({ state: 'visible' })
const ctaText = await page.getByTestId('business-case-primary-cta').innerText()
console.log('CTA (pending):', ctaText)
await page.getByTestId('business-seat-more').click()
await page.waitForTimeout(200)
await page.getByTestId('business-seat-more-menu').waitFor({ state: 'visible' })
await shot(page, '02-knife2-single-cta.png')
await page.getByTestId('business-seat-more').click() // toggle close
await page.waitForTimeout(150)

// 刀2：成果 tab 默认无工程文件名
await page.getByTestId('business-seat-tab-artifact').click()
await page.waitForTimeout(300)
const bodyText = await page.getByTestId('business-case-page').innerText()
console.log('has 08_ in page chrome?', /08_disclosure/.test(bodyText) && !bodyText.includes('详情'))
await shot(page, '03-knife2-hide-eng.png')
await page.getByTestId('business-seat-toggle-filename').click()
await page.waitForTimeout(200)
await page.getByTestId('business-seat-eng-filename').waitFor({ state: 'visible' })
await shot(page, '03b-knife2-filename-expanded.png')

// 刀3
await page.getByTestId('business-seat-tab-chat').click()
await page.waitForTimeout(200)
await page.getByTestId('business-seat-steps').waitFor({ state: 'visible' })
console.log(
  'timeline',
  await page.getByTestId('business-timeline').count(),
  'rail',
  await page.getByTestId('business-seat-rail').count(),
)
await shot(page, '04-knife3-readonly-steps.png')

// 清本案 pending → 主 CTA 应变「让它干活」
await page.evaluate((caseId) => {
  const key = 'ip-harness-agent-business-v1'
  const raw = localStorage.getItem(key)
  if (!raw) return
  const data = JSON.parse(raw)
  if (Array.isArray(data.confirms)) {
    data.confirms = data.confirms.map((c) =>
      c.caseId === caseId && c.status === 'pending'
        ? { ...c, status: 'approved' }
        : c,
    )
  }
  localStorage.setItem(key, JSON.stringify(data))
}, CASE)
await page.reload({ waitUntil: 'networkidle' })
await page.waitForTimeout(700)
await page.goto(base + `/agent/cases/${CASE}?seat=expert-disclosure`, {
  waitUntil: 'networkidle',
})
await page.waitForTimeout(600)
const cta2 = await page.getByTestId('business-case-primary-cta').innerText()
console.log('CTA (no pending):', cta2)
await shot(page, '02b-knife2-work-cta.png')

await page.getByTestId('business-seat-tab-expert-research').click()
await page.waitForTimeout(400)
await page.getByTestId('business-seat-chat').waitFor({ state: 'visible' })
await shot(page, '06-research-isomorphic.png')

await browser.close()
console.log('done')
