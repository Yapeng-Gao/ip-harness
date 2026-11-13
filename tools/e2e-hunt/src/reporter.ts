/** Reporter：report.json + report.md */

import fs from 'node:fs/promises'
import path from 'node:path'
import type { HuntReport } from './types.js'

export async function writeReports(
  report: HuntReport,
  outDir: string,
): Promise<{ jsonPath: string; mdPath: string }> {
  await fs.mkdir(outDir, { recursive: true })
  const jsonPath = path.join(outDir, 'report.json')
  const mdPath = path.join(outDir, 'report.md')
  await fs.writeFile(jsonPath, JSON.stringify(report, null, 2), 'utf8')
  await fs.writeFile(mdPath, renderMarkdown(report), 'utf8')
  return { jsonPath, mdPath }
}

function renderMarkdown(r: HuntReport): string {
  const lines: string[] = []
  lines.push(`# e2e-hunt report · ${r.casePackId}`)
  lines.push('')
  lines.push(`- **runId**: \`${r.runId}\``)
  lines.push(`- **adapter**: ${r.adapterId}`)
  lines.push(`- **driver**: ${r.driver}`)
  lines.push(`- **status**: **${r.summary.status}**`)
  lines.push(`- **steps**: ${r.summary.steps}`)
  lines.push(
    `- **findings**: fail_hard=${r.summary.findings.fail_hard}, suspect=${r.summary.findings.suspect}`,
  )
  if (r.summary.stopReason) lines.push(`- **stopReason**: ${r.summary.stopReason}`)
  lines.push(`- **started**: ${r.startedAt}`)
  lines.push(`- **finished**: ${r.finishedAt}`)
  lines.push('')
  lines.push('## Steps')
  lines.push('')
  for (const s of r.steps) {
    const act =
      typeof s.action === 'object'
        ? `\`${s.action.type}\` ${JSON.stringify(s.action).slice(0, 120)}`
        : String(s.action)
    lines.push(`### Step ${s.i} · judge=\`${s.judge}\``)
    lines.push('')
    lines.push(`- url: ${s.url}`)
    lines.push(`- action: ${act}`)
    if (s.checkpointId) lines.push(`- nextCheckpoint: ${s.checkpointId}`)
    if (s.note) lines.push(`- note: ${s.note}`)
    if (s.agent_reasoning) {
      lines.push(
        `- agent_reasoning: judgement=\`${s.agent_reasoning.judgement}\` · basis=\`${s.agent_reasoning.judgement_basis}\``,
      )
      lines.push(`  - digest: ${s.agent_reasoning.observation_digest}`)
    }
    lines.push(`- screenshot: ![step-${s.i}](${s.screenshot})`)
    if (s.signals?.length) {
      lines.push(`- signals:`)
      for (const sig of s.signals) {
        const wl = sig.whitelisted ? ' [白名单]' : ''
        lines.push(`  - \`${sig.kind}\`${wl} ${sig.text.slice(0, 100)}`)
      }
    }
    if (s.networkDelta) {
      const nd = s.networkDelta
      lines.push(
        `- networkDelta: failed=${nd.failedCount} slow(>2s)=${nd.slowCount} reqs=${nd.requestCount ?? '?'}`,
      )
      for (const f of nd.failures.slice(0, 5)) {
        lines.push(`  - ${f.method} ${f.url.slice(0, 80)} → ${f.reason}`)
      }
    }
    lines.push('')
  }
  lines.push('## CheapSignals / 失败请求摘要')
  lines.push('')
  if (r.telemetry) {
    lines.push(
      `- **telemetry**: mode=\`${r.telemetry.mode}\` · heap=\`${r.telemetry.heap}\`（默认关）`,
    )
  } else {
    lines.push('- **telemetry**: 未开启增强档（heap 默认关）')
  }
  const allSigs = r.steps.flatMap((s) => s.signals ?? [])
  const byKind: Record<string, number> = {}
  let wlCount = 0
  for (const s of allSigs) {
    byKind[s.kind] = (byKind[s.kind] ?? 0) + 1
    if (s.whitelisted) wlCount += 1
  }
  lines.push(
    `- **CheapSignals**: total=${allSigs.length} · whitelisted=${wlCount}` +
      (Object.keys(byKind).length
        ? ` · byKind={ ${Object.entries(byKind)
            .map(([k, v]) => `${k}:${v}`)
            .join(', ')} }`
        : ' · （本 run 无信号）'),
  )
  if (allSigs.length) {
    lines.push('- 抽样（最多 8 条）:')
    for (const sig of allSigs.slice(0, 8)) {
      const wl = sig.whitelisted ? ' [白名单]' : ''
      lines.push(`  - \`${sig.kind}\`${wl} ${sig.text.slice(0, 120)}`)
    }
  }
  const net = r.summary.network
  if (net) {
    lines.push(
      `- **Network 汇总**: failed=${net.failedCount} · slow(>2s)=${net.slowCount} · reqs=${net.requestCount ?? '?'}`,
    )
    if (net.failures.length) {
      lines.push('- 失败请求:')
      for (const f of net.failures.slice(0, 10)) {
        lines.push(`  - ${f.method} ${f.url} → ${f.reason}`)
      }
    } else {
      lines.push('- 失败请求: _无_')
    }
  } else {
    lines.push('- **Network 汇总**: _未采集（CasePack 未 opt-in enhancedTelemetry: network）_')
  }
  lines.push('')

  lines.push('## Findings')
  lines.push('')
  if (r.findings.length === 0) {
    lines.push('_无 findings（样机白名单信号已过滤）_')
  } else {
    for (const f of r.findings) {
      lines.push(`### ${f.id} · ${f.severity} · ${f.title}`)
      lines.push('')
      lines.push(`- category: ${f.category}`)
      lines.push(`- evidence steps: ${f.evidence.steps.join(', ')}`)
      if (f.evidence.logs.length) {
        lines.push('- logs:')
        for (const l of f.evidence.logs) lines.push(`  - ${l}`)
      }
      lines.push('')
    }
  }
  lines.push('')
  return lines.join('\n')
}
