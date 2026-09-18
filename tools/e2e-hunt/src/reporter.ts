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
    lines.push(`- screenshot: ![step-${s.i}](${s.screenshot})`)
    if (s.signals?.length) {
      lines.push(`- signals:`)
      for (const sig of s.signals) {
        lines.push(`  - \`${sig.kind}\` ${sig.text.slice(0, 100)}`)
      }
    }
    lines.push('')
  }
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
