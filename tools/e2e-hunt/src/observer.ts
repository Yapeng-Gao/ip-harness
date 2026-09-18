/** Observer：截图 + a11y/snapshot 摘要 + 检查点 */

import fs from 'node:fs/promises'
import path from 'node:path'
import type { Page } from 'playwright'
import type {
  A11yNodeSummary,
  CasePack,
  Checkpoint,
  CheckpointId,
  CheapSignal,
  Observation,
} from './types.js'

function matchName(actual: string, expected: string | RegExp): boolean {
  if (typeof expected === 'string') return actual.includes(expected) || actual === expected
  return expected.test(actual)
}

async function checkAssert(
  page: Page,
  cp: Checkpoint,
  pack: CasePack,
): Promise<boolean> {
  const a = cp.assert
  try {
    switch (a.kind) {
      case 'heading': {
        const loc = page.getByRole('heading', { name: a.name })
        return await loc.first().isVisible().catch(() => false)
      }
      case 'role': {
        const opts = a.name != null ? { name: a.name } : undefined
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const loc = page.getByRole(a.role as any, opts as any)
        return await loc.first().isVisible().catch(() => false)
      }
      case 'text': {
        const text = await page.locator('body').innerText()
        return matchName(text, a.text)
      }
      case 'url':
        return page.url().includes(a.includes)
      case 'custom':
        if (a.id === 'search-query-filled') {
          const q = pack.query ?? ''
          const input = page.locator('#search-q')
          if (await input.count()) {
            const val = await input.inputValue().catch(() => '')
            return q ? val.includes(q) : val.length > 0
          }
          return false
        }
        if (a.id === 'search-results') {
          const hasScore = await page
            .getByText(/score\s+\d+/)
            .first()
            .isVisible()
            .catch(() => false)
          const hasList = await page
            .locator('ul.space-y-2 > li, ul.space-y-2 > div')
            .first()
            .isVisible()
            .catch(() => false)
          return hasScore || hasList
        }
        if (a.id === 'basket-nonempty') {
          const body = await page.locator('body').innerText().catch(() => '')
          if (body.includes('已加入工作篮')) return true
          const removeBtn = await page
            .getByRole('button', { name: '移出篮' })
            .first()
            .isVisible()
            .catch(() => false)
          if (removeBtn) return true
          const sendFto = page.getByRole('button', { name: '送 FTO' })
          if ((await sendFto.count()) > 0) {
            const enabled = await sendFto.first().isEnabled().catch(() => false)
            if (enabled) return true
          }
          const badge = await page
            .evaluate(() => {
              const labels = Array.from(document.querySelectorAll('p, span, div'))
              for (const el of labels) {
                const t = (el.textContent ?? '').trim()
                if (t === '工作篮' || t.startsWith('工作篮')) {
                  const m = /工作篮\s*(\d+)/.exec(
                    (el.parentElement?.textContent ?? el.textContent ?? '').replace(/\s+/g, ' '),
                  )
                  if (m && Number(m[1]) > 0) return true
                }
              }
              return false
            })
            .catch(() => false)
          return !!badge
        }
        if (a.id === 'strategy-a-toast') {
          // AgentPanel 常驻 DOWNSTREAM_HONESTY（含「请用共享种子」）≠ 已点「送 FTO」
          // 仅认策略 A toast / 事件 note：跨口未共享 · 已用共享种子
          const body = await page.locator('body').innerText().catch(() => '')
          const status = await page
            .getByRole('status')
            .innerText()
            .catch(() => '')
          const hay = `${body}
${status}`
          return hay.includes('跨口未共享') || hay.includes('已用共享种子')
        }
        if (a.id === 'fto-import-done') {
          // 必须在 FTO 壳：Search 送 FTO 后也会出现策略 A toast，勿误判
          const url = page.url()
          if (!url.includes('localhost:5183') && !url.includes(':5183/')) {
            return false
          }
          const body = await page.locator('body').innerText().catch(() => '')
          const status = await page
            .getByRole('status')
            .innerText()
            .catch(() => '')
          const hay = `${body}
${status}`
          const honesty =
            hay.includes('已用共享种子') || hay.includes('跨口未共享')
          if (!honesty) return false
          const empty = body.includes('工作篮为空')
          const hasHitCard = await page
            .locator('ul li code, ul li')
            .first()
            .isVisible()
            .catch(() => false)
          const hasPub = /CN\d{9,}|US\d+|EP\d+|WO\d+/i.test(body)
          return !empty && (hasHitCard || hasPub)
        }
        return false
      default:
        return false
    }
  } catch {
    return false
  }
}

export async function evaluateCheckpoints(
  page: Page,
  pack: CasePack,
  previouslyReached: CheckpointId[] = [],
): Promise<{ reached: CheckpointId[]; next: CheckpointId | null }> {
  const reachedSet = new Set<CheckpointId>(previouslyReached)
  for (const cp of pack.checkpoints) {
    if (await checkAssert(page, cp, pack)) reachedSet.add(cp.id)
  }
  // Preserve CasePack order
  const reached = pack.checkpoints
    .map((c) => c.id)
    .filter((id) => reachedSet.has(id))
  let next: CheckpointId | null = null
  for (const cp of pack.checkpoints) {
    if (!reachedSet.has(cp.id)) {
      next = cp.id
      break
    }
  }
  return { reached, next }
}

/** Parse Playwright ariaSnapshot YAML-ish lines into role/name pairs. */
export function parseAriaSnapshot(aria: string): A11yNodeSummary[] {
  const out: A11yNodeSummary[] = []
  for (const raw of aria.split('\n')) {
    if (out.length >= 80) break
    const line = raw.trim()
    if (!line.startsWith('- ')) continue
    const body = line.slice(2)
    // text: ...
    if (body.startsWith('text:')) {
      const t = body.slice(5).trim()
      if (t) out.push({ role: 'text', name: t.slice(0, 120) })
      continue
    }
    // role "name" [flags]  OR  role: value
    const named = /^(\w+)\s+"([^"]*)"/.exec(body)
    if (named) {
      out.push({ role: named[1]!, name: named[2]!.slice(0, 120) })
      continue
    }
    const colon = /^(\w+):\s*(.+)$/.exec(body)
    if (colon) {
      out.push({ role: colon[1]!, name: colon[2]!.slice(0, 120) })
      continue
    }
    const bare = /^(\w+)\b/.exec(body)
    if (bare && !['generic', 'listitem', 'list', 'group'].includes(bare[1]!)) {
      out.push({ role: bare[1]!, name: '' })
    }
  }
  return out
}

export async function observe(opts: {
  page: Page
  pack: CasePack
  stepIndex: number
  artifactsDir: string
  signals: CheapSignal[]
  /** 多页向导：已达检查点跨页累计（避免离开后丢失） */
  previouslyReached?: CheckpointId[]
}): Promise<Observation> {
  const { page, pack, stepIndex, artifactsDir, signals } = opts
  const previouslyReached = opts.previouslyReached ?? []
  await fs.mkdir(artifactsDir, { recursive: true })
  const shotName = `step-${String(stepIndex).padStart(3, '0')}.png`
  const shotPath = path.join(artifactsDir, shotName)
  await page.screenshot({ path: shotPath, fullPage: false })

  let a11ySummary: A11yNodeSummary[] = []
  let a11yText = ''
  try {
    const aria = await page.locator('body').ariaSnapshot()
    a11ySummary = parseAriaSnapshot(aria)
    a11yText = a11ySummary.map((n) => `${n.role}:${n.name}`).join(' | ').slice(0, 2000)
    if (!a11yText) a11yText = aria.slice(0, 2000)
  } catch {
    a11ySummary = []
    a11yText = '(a11y snapshot unavailable)'
  }

  const { reached, next } = await evaluateCheckpoints(page, pack, previouslyReached)
  const pageTextSnippet = (
    await page
      .locator('body')
      .innerText()
      .catch(() => '')
  ).slice(0, 1500)

  return {
    url: page.url(),
    title: await page.title().catch(() => ''),
    screenshotRel: shotName,
    a11ySummary,
    a11yText,
    signals,
    reachedCheckpoints: reached,
    nextCheckpointId: next,
    pageTextSnippet,
  }
}
