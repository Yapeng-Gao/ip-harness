import { chromium } from 'playwright'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const OUT = path.dirname(fileURLToPath(import.meta.url))
const BASE = 'http://127.0.0.1:8767'

const browser = await chromium.launch({ headless: true, channel: 'chrome' })
const ctx = await browser.newContext({ viewport: { width: 1440, height: 900 } })
const page = await ctx.newPage()

await page.goto(BASE + '/', { waitUntil: 'networkidle' })
await page.waitForTimeout(400)
await page.screenshot({ path: path.join(OUT, 'V3-site.png'), fullPage: false })
console.log('SITE ok')

// enter product via login CTA on hero
const enter = page.locator('button.btn-primary', { hasText: '进入产品体验' }).first()
if (await enter.count()) await enter.click()
else await page.getByRole('button', { name: '登录' }).first().click()
await page.waitForTimeout(400)
await page.screenshot({ path: path.join(OUT, 'V3-login.png'), fullPage: false })
console.log('LOGIN ok')

await page.getByRole('button', { name: /进入企业研发/ }).click()
await page.waitForTimeout(500)
await page.screenshot({ path: path.join(OUT, 'V3-home.png'), fullPage: false })

const check = await page.evaluate(() => {
  const styles = getComputedStyle(document.documentElement)
  const accent = styles.getPropertyValue('--accent').trim()
  const primaryBtn = document.querySelector('.btn-primary, .btn-ink')
  const pb = primaryBtn ? getComputedStyle(primaryBtn).backgroundColor : null
  const modes = [...document.querySelectorAll('.mode-switch button')].map(b => ({
    t: b.textContent.trim(), pressed: b.getAttribute('aria-pressed'), h: Math.round(b.getBoundingClientRect().height)
  }))
  const roles = [...document.querySelectorAll('.role-switch button')].map(b => ({
    t: b.textContent.trim(), pressed: b.getAttribute('aria-pressed'), h: Math.round(b.getBoundingClientRect().height)
  }))
  const icon = document.querySelector('.icon-btn')
  return {
    accent,
    pb,
    modes,
    roles,
    iconH: icon ? Math.round(icon.getBoundingClientRect().height) : null,
    orangeInCss: !!document.body.innerHTML.includes('#ff5e30'),
  }
})
console.log('HOME_CHECK', JSON.stringify(check, null, 2))

await page.getByRole('button', { name: '项目', exact: true }).click()
await page.waitForTimeout(500)
await page.screenshot({ path: path.join(OUT, 'V3-projects.png'), fullPage: false })
console.log('PROJECTS ok')

await page.getByRole('button', { name: '部门', exact: true }).click()
await page.waitForTimeout(600)
await page.screenshot({ path: path.join(OUT, 'V3-departments.png'), fullPage: false })
console.log('DEPTS ok')

await browser.close()
console.log('DONE')
