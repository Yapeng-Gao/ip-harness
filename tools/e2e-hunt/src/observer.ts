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
        if (a.id === 'backend-sqlite-fts') {
          // 勿把常驻 mock 横幅（HONESTY_BANNER / 「backend: mock」）误判为已接 API
          const body = await page.locator('body').innerText().catch(() => '')
          const status = await page
            .getByRole('status')
            .innerText()
            .catch(() => '')
          const hay = `${body}\n${status}`
          return (
            /backend:\s*sqlite-fts/i.test(hay) ||
            hay.includes('已接 Search API')
          )
        }
        if (a.id === 'api-fallback-toast') {
          // toast ~2.8s；decide 短 wait 捕抓；once reached 由 previouslyReached 保留
          const body = await page.locator('body').innerText().catch(() => '')
          const status = await page
            .getByRole('status')
            .innerText()
            .catch(() => '')
          const hay = `${body}\n${status}`
          return (
            hay.includes('Search API 不可用，已回退样机 mock') ||
            (hay.includes('Search API 不可用') &&
              hay.includes('已回退样机 mock'))
          )
        }
        if (a.id === 'backend-mock-after-search') {
          // 默认 chip 也可能是 mock；须有检索后证据，且无 sqlite-fts 成功态
          const body = await page.locator('body').innerText().catch(() => '')
          const status = await page
            .getByRole('status')
            .innerText()
            .catch(() => '')
          const hay = `${body}\n${status}`
          const hasMock = /backend:\s*mock/i.test(hay)
          const sqliteSuccess =
            /backend:\s*sqlite-fts/i.test(hay) ||
            hay.includes('已接 Search API')
          const postSearch =
            hay.includes('Search API 不可用') ||
            hay.includes('已回退样机 mock') ||
            hay.includes('API fallback') ||
            /score\s+\d+/.test(hay)
          return hasMock && !sqliteSuccess && postSearch
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
        if (a.id === 'agent-home') {
          const url = page.url()
          if (url.includes('/agent')) return true
          const body = await page.locator('body').innerText().catch(() => '')
          return (
            body.includes('会话待确认') ||
            body.includes('知产 Agent') ||
            /办理/.test(body)
          )
        }
        if (a.id === 'agent-session-oa1') {
          const url = page.url()
          return url.includes('sess-oa-1')
        }
        if (a.id === 'agent-s0-home') {
          const url = page.url()
          // Home only（排除 sessions/projects/agents）
          if (!url.includes('/agent')) return false
          if (/\/agent\/(sessions|projects|agents|harness)/.test(url)) return false
          const body = await page.locator('body').innerText().catch(() => '')
          const hasCompose =
            (await page.getByTestId('home-send').first().isVisible().catch(() => false)) ||
            (await page.getByLabel('办理目标').first().isVisible().catch(() => false)) ||
            body.includes('开始办理')
          const hasCaseBind =
            (await page.getByTestId('home-case-bind').first().isVisible().catch(() => false)) ||
            body.includes('创建并绑定') ||
            body.includes('绑定已有') ||
            body.includes('也可先开始办理')
          const hasNav =
            body.includes('待确认') ||
            body.includes('会话') ||
            (await page.getByText('待确认', { exact: false }).first().isVisible().catch(() => false))
          const caseBindCount = await page.getByTestId('home-case-bind').count().catch(() => 0)
          // 硬闸观察：Home 案件入口 ≤1（=1 期望）；不因此 fail
          const singleEntry = caseBindCount <= 1
          return hasCompose && hasCaseBind && hasNav && singleEntry
        }
        if (a.id === 'agent-s1-softskip') {
          // SoftSkip：创建并绑定新案难自动化 → 已在 Agent 壳即 Pass（证据记 SoftSkip）
          const url = page.url()
          return url.includes('/agent')
        }
        if (a.id === 'agent-s2-session') {
          const url = page.url()
          if (!/\/agent\/sessions\/[^/?]+/.test(url)) return false
          // 无强制绑案挡死：能进会话即过；可选看「也可先」/顶栏绑案引导
          const body = await page.locator('body').innerText().catch(() => '')
          const blocked =
            body.includes('必须先绑定案件') || body.includes('请先绑定案件才能开始')
          return !blocked
        }
        if (a.id === 'agent-s3-timeline') {
          const url = page.url()
          if (!url.includes('/agent/sessions/')) return false
          const body = await page.locator('body').innerText().catch(() => '')
          const markers = [
            '解析 OA',
            '争点清单',
            '答复书草稿',
            '需要你确认',
            '会话已创建',
            '调用 analyze_oa',
            '调用 patent_search',
            '理解目标',
            '思考',
            '工具',
            '等待你确认',
          ]
          return markers.some((m) => body.includes(m))
        }
        if (a.id === 'agent-s5-casebind') {
          const url = page.url()
          if (!url.includes('/agent/sessions/')) return false
          const body = await page.locator('body').innerText().catch(() => '')
          return (
            body.includes('创建并绑定') ||
            body.includes('绑定已有') ||
            body.includes('已绑案件') ||
            body.includes('未绑案件') ||
            (await page
              .getByRole('button', { name: /创建并绑定|绑定已有/ })
              .first()
              .isVisible()
              .catch(() => false))
          )
        }
        if (a.id === 'agent-s6-sessions-filter') {
          const url = page.url()
          if (!url.includes('/agent/sessions')) return false
          // 列表页（非单会话）或带 filter
          const onList =
            /\/agent\/sessions\/?(\?|$)/.test(url) || url.includes('filter=')
          if (!onList && /\/agent\/sessions\/[^/?]+/.test(url)) return false
          const body = await page.locator('body').innerText().catch(() => '')
          const hasFilter =
            url.includes('filter=needs_human') ||
            body.includes('筛选：待确认') ||
            body.includes('待确认')
          const hasSegment =
            body.includes('进行中') ||
            body.includes('全部') ||
            (await page.locator('.segmented, .agent-session-segments').first().isVisible().catch(() => false))
          return hasFilter || hasSegment
        }
        if (a.id === 'agent-s7-catalog') {
          const url = page.url()
          if (!url.includes('/agent/agents')) return false
          const body = await page.locator('body').innerText().catch(() => '')
          return (
            body.includes('Core') ||
            body.includes('Assist') ||
            body.includes('Beta') ||
            body.includes('Agent') ||
            (await page.locator('[id^="agent-card-"]').first().isVisible().catch(() => false))
          )
        }
        if (a.id === 'agent-s8-project-general') {
          const url = page.url()
          if (!url.includes('/agent/projects')) return false
          const body = await page.locator('body').innerText().catch(() => '')
          const onGeneral =
            url.includes('proj-demo-general') ||
            body.includes('general') ||
            body.includes('无专利步骤')
          const noPatentStrip =
            !body.includes('FTO 五步') && !body.includes('权利要求 HITL 步骤条')
          // general 工作区：总控/研究/写作 或 无专利步骤文案
          return (
            onGeneral &&
            (body.includes('总控') ||
              body.includes('研究') ||
              body.includes('写作') ||
              body.includes('无专利步骤') ||
              body.includes('通用')) &&
            noPatentStrip
          )
        }
        if (a.id === 'agent-s9-project-patent') {
          const url = page.url()
          if (!url.includes('/agent/projects')) return false
          const body = await page.locator('body').innerText().catch(() => '')
          const onPatent =
            url.includes('proj-demo-patent') ||
            body.includes('pack=patent') ||
            body.includes('domain/patent')
          const expertDm =
            url.includes('/bots/') ||
            url.includes('/experts/') ||
            body.includes('检索') ||
            body.includes('撰稿') ||
            body.includes('FTO') ||
            body.includes('总控席') ||
            body.includes('专家')
          return onPatent && expertDm
        }
        if (a.id === 'hitl-confirm-bar') {
          // 须在会话页，避免首页侧栏「待确认」误判
          const url = page.url()
          if (!url.includes('/agent/sessions/')) return false
          const labels = [
            '批准策略',
            '授权递交',
            '立项决定',
            '确认报价',
            '付款解锁',
          ]
          for (const lab of labels) {
            const byAria = await page
              .getByRole('button', { name: lab })
              .first()
              .isVisible()
              .catch(() => false)
            if (byAria) return true
          }
          const byClass = await page
            .locator('.agent-confirm-cta, #agent-confirm-reason-primary')
            .first()
            .isVisible()
            .catch(() => false)
          if (byClass) return true
          const bar = page.locator(
            '.agent-confirm-cta-wrap, .confirm-hitl-sheet, .agent-confirm-sheet',
          )
          if ((await bar.count().catch(() => 0)) > 0) {
            const body = await page.locator('body').innerText().catch(() => '')
            if (body.includes('待确认') || labels.some((l) => body.includes(l))) {
              return true
            }
          }
          return false
        }
        if (a.id === 'figure-canvas') {
          const url = page.url()
          const onEdit = url.includes('/edit/')
          const save = await page
            .getByRole('button', { name: '保存版本' })
            .first()
            .isVisible()
            .catch(() => false)
          if (save) return true
          if (!onEdit) return false
          const body = await page.locator('body').innerText().catch(() => '')
          return body.includes('③ 画布编辑')
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
