import { chromium } from 'playwright'
import fs from 'node:fs'
import path from 'node:path'

const OUT = path.resolve('docs/ui-polish/agent-p0-overlay')
fs.mkdirSync(OUT, { recursive: true })
const BASE = 'http://127.0.0.1:5175'

const browser = await chromium.launch({ headless: true })
const page = await browser.newPage({ viewport: { width: 1440, height: 900 } })

const audit = { pages: {} }

async function scan(label) {
  const hits = await page.evaluate(() => {
    const body = document.body.innerText || ''
    const patterns = [
      '样机 · 无真 LLM',
      '样机·无真LLM',
      '无真 LLM',
      '回中台',
      '运营 Inbox',
      '在运营 Inbox',
      '案详',
      '打开费用中心',
      '在作业中台打开',
      '打开案件',
    ]
    const out = {}
    for (const p of patterns) out[p] = (body.match(new RegExp(p.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'g')) || []).length
    // full-width amber bars: elements that are nearly viewport width with amber bg
    const amberBars = [...document.querySelectorAll('*')].filter((el) => {
      const cs = getComputedStyle(el)
      const bg = cs.backgroundColor
      const r = el.getBoundingClientRect()
      if (r.height < 20 || r.height > 120 || r.width < window.innerWidth * 0.7) return false
      // amber-ish
      const m = bg.match(/rgba?\((\d+),\s*(\d+),\s*(\d+)/)
      if (!m) return false
      const [, R, G, B] = m.map(Number)
      return R > 240 && G > 180 && G < 230 && B < 180
    }).slice(0, 8).map((el) => ({
      text: (el.textContent || '').replace(/\s+/g, ' ').trim().slice(0, 80),
      w: Math.round(el.getBoundingClientRect().width),
      h: Math.round(el.getBoundingClientRect().height),
      bg: getComputedStyle(el).backgroundColor,
    }))
    return { copy: out, amberBars }
  })
  audit.pages[label] = hits
  return hits
}

await page.goto(`${BASE}/agent`, { waitUntil: 'networkidle' })
await page.waitForTimeout(700)
await page.screenshot({ path: path.join(OUT, '01-home-after.png'), fullPage: false })
await scan('home')

await page.goto(`${BASE}/agent/sessions`, { waitUntil: 'networkidle' })
await page.waitForTimeout(700)
await page.screenshot({ path: path.join(OUT, '02-sessions-after.png'), fullPage: false })
await scan('sessions')

// open a session if any row
const row = page.locator('tr[role="link"]').first()
if (await row.count()) {
  await row.click()
  await page.waitForTimeout(900)
  await page.screenshot({ path: path.join(OUT, '03-session-workspace-after.png'), fullPage: false })
  await scan('session')
}

await page.goto(`${BASE}/agent/projects`, { waitUntil: 'networkidle' })
await page.waitForTimeout(700)
await page.screenshot({ path: path.join(OUT, '04-projects-list-after.png'), fullPage: false })
await scan('projectsList')

// open first project if any
const proj = page.locator('a[href*="/agent/projects/"]').first()
if (await proj.count()) {
  await proj.click()
  await page.waitForTimeout(900)
  await page.screenshot({ path: path.join(OUT, '05-project-workspace-after.png'), fullPage: false })
  await scan('projectWorkspace')
}

fs.writeFileSync(path.join(OUT, '_audit-after.json'), JSON.stringify(audit, null, 2))
console.log(JSON.stringify(audit, null, 2))
await browser.close()
