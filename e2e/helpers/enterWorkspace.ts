import { expect, type Page } from '@playwright/test'

/** Forced IAM origin — never mid `/login` (outer jump only). */
export const IAM_LOGIN = 'http://localhost:5177/login'
export const MID_ORIGIN = 'http://localhost:5173'
export const AGENT_ORIGIN = 'http://localhost:5175'

export type EnterProduct = '作业中台' | '知产 Agent' | 'saas' | 'agent'
export type EnterWorkspaceName = '星河智造' | '德恒'

function productLabel(product: EnterProduct): '作业中台' | '知产 Agent' {
  return product === 'saas' || product === '作业中台' ? '作业中台' : '知产 Agent'
}

/**
 * 登录进仓：强制 iam:5177/login → 选产品 → 进入工作区。
 * VITE_MULTI_APP 下会整页跳到 mid:5173 或 agent:5175。
 */
export async function enterWorkspace(
  page: Page,
  opts: { product: EnterProduct; name: EnterWorkspaceName },
) {
  await page.goto(IAM_LOGIN)
  await expect(page.getByRole('heading', { name: 'IP Harness' })).toBeVisible()

  const switcher = page.getByRole('group', { name: '产品切换' })
  const label = productLabel(opts.product)
  const productBtn = switcher.getByRole('button', { name: label })
  if ((await productBtn.getAttribute('aria-pressed')) !== 'true') {
    await productBtn.click()
  }

  const wsName = opts.name === '星河智造' ? '星河智造' : '德恒'
  await page.getByRole('button', { name: new RegExp(`进入工作区\\s*${wsName}`) }).click()

  const dest = label === '知产 Agent' ? AGENT_ORIGIN : MID_ORIGIN
  await page.waitForURL((url) => url.origin === dest, { timeout: 15_000 })
}
