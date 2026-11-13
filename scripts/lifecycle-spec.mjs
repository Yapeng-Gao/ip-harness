#!/usr/bin/env node
/**
 * 从 docs/lifecycle/nodes/*.md 抽取机器可读规格。
 *
 * 单一事实源原则：markdown 是唯一手写源，本脚本只读不写 markdown，
 * 产出 docs/lifecycle/spec/*.json 与 AGENT-CONTEXT.md（生成物，勿手改）。
 *
 * 用法：node scripts/lifecycle-spec.mjs [--check]
 *   --check  只校验不写盘，发现解析异常时退出码 1
 */

import { readFileSync, writeFileSync, readdirSync, mkdirSync, existsSync } from 'node:fs'
import { join, dirname, basename } from 'node:path'
import { fileURLToPath } from 'node:url'

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..')
const NODES_DIR = join(ROOT, 'docs/lifecycle/nodes')
const SPEC_DIR = join(ROOT, 'docs/lifecycle/spec')
const CHECK_ONLY = process.argv.includes('--check')

/* ---------- markdown 表格解析 ---------- */

/** 把一行拆成单元格；支持 \| 转义 */
function splitRow(line) {
  const cells = []
  let cur = ''
  for (let i = 0; i < line.length; i++) {
    const ch = line[i]
    if (ch === '\\' && line[i + 1] === '|') { cur += '|'; i++; continue }
    if (ch === '|') { cells.push(cur); cur = ''; continue }
    cur += ch
  }
  cells.push(cur)
  // 首尾由竖线产生的空单元
  if (cells.length && cells[0].trim() === '') cells.shift()
  if (cells.length && cells[cells.length - 1].trim() === '') cells.pop()
  return cells.map((c) => c.trim())
}

const isSeparator = (line) => /^\|[\s:|-]+\|?$/.test(line.trim())

/** 从 lines 中找出所有表格：{header, rows, line} */
function extractTables(lines) {
  const tables = []
  for (let i = 0; i < lines.length; i++) {
    if (!lines[i].trim().startsWith('|')) continue
    if (i + 1 >= lines.length || !isSeparator(lines[i + 1])) continue
    const header = splitRow(lines[i])
    const rows = []
    let j = i + 2
    while (j < lines.length && lines[j].trim().startsWith('|')) {
      if (!isSeparator(lines[j])) rows.push({ cells: splitRow(lines[j]), line: j + 1 })
      j++
    }
    tables.push({ header, rows, line: i + 1 })
    i = j - 1
  }
  return tables
}

/** 每个表格所属的最近上级标题 */
function sectionFor(lines, tableLine) {
  for (let i = tableLine - 1; i >= 0; i--) {
    const m = /^(#{2,4})\s+(.*)$/.exec(lines[i])
    if (m) return { level: m[1].length, title: m[2].trim() }
  }
  return { level: 0, title: '' }
}

/* ---------- 规则分类 ---------- */

const CATEGORY_RULES = [
  [/法定|法律|期限|时限|程序|证据|合规|保密|红线/, 'A-法定/程序'],
  [/决策权|权限|审批|授权|授权额度/, 'B-决策权'],
  [/例外|豁免/, 'C-例外'],
  [/冲突|裁决/, 'D-冲突裁决'],
  [/齐套|校验|质检|质量/, 'E-质量'],
  [/写回|命令|留痕|审计|记录/, 'F-留痕'],
  [/商业|报价|费用|预算|定价/, 'G-商业'],
  [/联动|接口|同步/, 'H-联动'],
  // 未命中以上时，按「这一节讲的是不是核心判断」归类，不留「其他」
  [/提报|提交|立案|受理/, 'I-提报受理'],
  [/判定|核心|结论|新颖性|创造性|侵权|落入/, 'J-核心判定'],
  [/状态|迁移|流转|终止|恢复/, 'K-状态流转'],
  [/对象|字段|数据|结构|建模/, 'L-数据建模'],
  [/专家席|专家|席位|Agent|智能体|路由|编制/, 'M-角色编成'],
  [/条款|许可|费用|发票|逾期|停权|年费|计算/, 'N-商务与计费'],
  [/剧本|处置|响应|升级|阶梯/, 'O-处置与升级'],
  [/版本|回执|规则集|国家阶段|进入|说明书/, 'P-作业规则'],
]

/** 兜底：仍无法归类时按节点归为领域规则，而非「其他」 */
const DOMAIN_FALLBACK = 'Q-领域规则'

function classifyRule(sectionTitle, text) {
  const hay = sectionTitle + ' ' + text
  for (const [re, cat] of CATEGORY_RULES) if (re.test(hay)) return cat
  return DOMAIN_FALLBACK
}

/** 从「现状」列推断实现状态 */
function parseStatus(cell = '') {
  if (/❌/.test(cell)) return 'missing'
  if (/⚠/.test(cell)) return 'partial'
  if (/✅/.test(cell)) return 'done'
  return 'unknown'
}

/* ---------- 站点元信息 ---------- */

const STAGE = {
  '01-research': 'pre_research', '02-decision': 'decision', '03-drafting': 'drafting',
  '04-prosecution': 'prosecution', '05-maintenance': 'maintenance',
  '06-commercialization': 'commercialization', '07-monitoring': 'monitoring',
}

const DECISION_POINT = {
  '00-inventor-disclosure': ['D1', 'D2'], '01-research': [], '01b-fto': [],
  '02-decision': ['D1', 'D2'], '03-drafting': ['D3', 'D4'], '04-prosecution': ['D5'],
  '05-maintenance': ['D6'], '06-commercialization': ['D7'], '07-monitoring': ['D7'],
  '08-layout': ['D4'], '09-pct-international': ['D4'], '22-invalidation': [],
  '23-termination-recovery': ['D6'], '24-litigation': ['D7'], '25-claim-chart': [],
}

/* ---------- 主流程 ---------- */

const files = readdirSync(NODES_DIR).filter((f) => f.endsWith('.md')).sort()
const nodes = []
const rules = []
const decisionTables = []
const schemas = []
const problems = []

for (const file of files) {
  const nodeId = basename(file, '.md')
  const raw = readFileSync(join(NODES_DIR, file), 'utf8')
  const lines = raw.split(/\r?\n/)

  // 标题
  const titleLine = lines.find((l) => l.startsWith('# ')) || ''
  const title = titleLine.replace(/^#\s*/, '').trim()

  // 对象 schema（TypeScript 代码块）
  const codeRe = /```ts\n([\s\S]*?)```/g
  let m
  while ((m = codeRe.exec(raw))) {
    const body = m[1]
    const nameRe = /(?:export\s+)?(?:interface|type)\s+([A-Z][A-Za-z0-9_]*)/g
    let n
    while ((n = nameRe.exec(body))) {
      schemas.push({ name: n[1], node: nodeId, file: `docs/lifecycle/nodes/${file}` })
    }
  }

  const tables = extractTables(lines)
  let ruleCount = 0

  for (const t of tables) {
    const section = sectionFor(lines, t.line)
    const headerLower = t.header.join('|')

    // 规则表：首列是 R<prefix>-<num>
    if (/^(ID|编号)$/i.test(t.header[0] || '')) {
      const statusIdx = t.header.findIndex((h) => /现状|状态/.test(h))
      const noteIdx = t.header.findIndex((h) => /说明|含义|备注/.test(h))
      const suggestIdx = t.header.findIndex((h) => /建议值/.test(h))
      for (const row of t.rows) {
        const id = row.cells[0] || ''
        if (!/^R[0-9A-Z]+-\d+$/.test(id)) {
          if (id) problems.push(`${file}:${row.line} 规则表内非规则行：${id.slice(0, 40)}`)
          continue
        }
        const statement = row.cells[1] || ''
        const statusCell = statusIdx >= 0 ? row.cells[statusIdx] || '' : ''
        const note = noteIdx >= 0 ? row.cells[noteIdx] || '' : ''
        const suggest = suggestIdx >= 0 ? row.cells[suggestIdx] || '' : ''
        rules.push({
          id,
          node: nodeId,
          section: section.title,
          category: classifyRule(section.title, statement),
          statement,
          status: parseStatus(statusCell),
          statusNote: statusCell.replace(/[✅⚠❌]/g, '').trim(),
          suggested: suggest || undefined,
          note: note || undefined,
          source: `docs/lifecycle/nodes/${file}:${row.line}`,
        })
        ruleCount++
      }
      continue
    }

    // 决策权表：表头同时含「决策」与「决定权」
    if (/决策/.test(headerLower) && /决定权/.test(headerLower)) {
      const idx = (re) => t.header.findIndex((h) => re.test(h))
      const decideIdx = idx(/决定权|决定者/)
      for (const row of t.rows) {
        const decision = row.cells[0]
        if (!decision || /^-+$/.test(decision)) continue
        decisionTables.push({
          node: nodeId,
          section: section.title,
          decision,
          advise: row.cells[idx(/建议/) ] ?? '',
          decide: decideIdx >= 0 ? row.cells[decideIdx] ?? '' : '',
          veto: row.cells[idx(/否决/)] ?? '',
          informed: row.cells[idx(/知情/)] ?? '',
          basis: row.cells[idx(/依据|条件/)] ?? '',
          level: row.cells[idx(/级别|分级/)] ?? '',
          source: `docs/lifecycle/nodes/${file}:${row.line}`,
        })
      }
    }
  }

  nodes.push({
    id: nodeId,
    title,
    stage: STAGE[nodeId] ?? null,
    decisionPoints: DECISION_POINT[nodeId] ?? [],
    rules: ruleCount,
    file: `docs/lifecycle/nodes/${file}`,
    lines: lines.length,
  })
}

/* ---------- 校验 ---------- */

const seen = new Map()
for (const r of rules) {
  if (seen.has(r.id)) problems.push(`重复规则编号 ${r.id}：${seen.get(r.id)} 与 ${r.source}`)
  else seen.set(r.id, r.source)
}

const byNode = Object.fromEntries(nodes.map((n) => [n.id, 0]))
for (const r of rules) byNode[r.node] = (byNode[r.node] || 0) + 1

const statusCount = rules.reduce((acc, r) => ((acc[r.status] = (acc[r.status] || 0) + 1), acc), {})
const categoryCount = rules.reduce((acc, r) => ((acc[r.category] = (acc[r.category] || 0) + 1), acc), {})

const summary = {
  generatedFrom: 'docs/lifecycle/nodes/*.md',
  note: '生成物，勿手改。重跑：npm run spec:lifecycle',
  totals: {
    nodes: nodes.length,
    rules: rules.length,
    decisionRows: decisionTables.length,
    schemas: new Set(schemas.map((s) => s.name)).size,
  },
  byNode,
  byStatus: statusCount,
  byCategory: categoryCount,
}

/* ---------- 写盘 ---------- */

if (problems.length) {
  console.error(`解析问题 ${problems.length} 条：`)
  for (const p of problems.slice(0, 30)) console.error('  - ' + p)
  if (CHECK_ONLY) process.exit(1)
}

if (!CHECK_ONLY) {
  if (!existsSync(SPEC_DIR)) mkdirSync(SPEC_DIR, { recursive: true })
  const write = (name, data) =>
    writeFileSync(join(SPEC_DIR, name), JSON.stringify(data, null, 2) + '\n', 'utf8')

  write('nodes.json', nodes)
  write('rules.json', { ...summary, rules })
  write('decisions.json', { generatedFrom: 'docs/lifecycle/nodes/*.md', rows: decisionTables })
  write(
    'schemas.json',
    [...new Map(schemas.map((s) => [s.name, s])).values()],
  )

  // 模型友好的一页摘要
  const digest = [
    '# 业务规则摘要（生成物 · 勿手改）',
    '',
    '> 由 `npm run spec:lifecycle` 从 `docs/lifecycle/nodes/*.md` 生成。',
    '> 人读请读原文档；本文是给模型与工具用的紧凑视图。',
    '',
    `- 节点 ${summary.totals.nodes} · 规则 ${summary.totals.rules} · 决策行 ${summary.totals.decisionRows}`,
    '',
    '## 规则（按节点，仅列编号与一句话）',
    '',
  ]
  for (const n of nodes) {
    const rs = rules
      .filter((r) => r.node === n.id)
      .sort((a, b) => {
        const [pa, na] = [a.id.split('-')[0], Number(a.id.split('-')[1])]
        const [pb, nb] = [b.id.split('-')[0], Number(b.id.split('-')[1])]
        return pa === pb ? na - nb : pa.localeCompare(pb)
      })
    if (!rs.length) continue
    digest.push(`### ${n.id} · ${n.title}（${rs.length} 条）`, '')
    for (const r of rs) {
      digest.push(`- \`${r.id}\` ${r.statement.replace(/\n/g, ' ')}`)
    }
    digest.push('')
  }
  writeFileSync(join(SPEC_DIR, 'AGENT-CONTEXT.md'), digest.join('\n'), 'utf8')
}

console.log(
  `节点 ${nodes.length} · 规则 ${rules.length} · 决策行 ${decisionTables.length} · ` +
    `schema ${new Set(schemas.map((s) => s.name)).size}` +
    (CHECK_ONLY ? ' · check only' : ' · 已写入 docs/lifecycle/spec/'),
)
console.log('状态分布：', statusCount)
console.log('分类分布：', categoryCount)
if (problems.length) console.log(`⚠ 解析问题 ${problems.length} 条（见上）`)
