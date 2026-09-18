#!/usr/bin/env node
/**
 * e2e-hunt CLI
 * Usage:
 *   npx tsx tools/e2e-hunt/src/cli.ts --case CP-search-smoke
 *   npm run hunt:search-smoke
 */

import { randomUUID } from 'node:crypto'
import fs from 'node:fs/promises'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { ADAPTER_ID, getCasePack } from './adapter/ip-harness.js'
import { PlaywrightDriver } from './driver.js'
import { runAgentLoop } from './loop.js'
import { writeReports } from './reporter.js'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const HUNT_ROOT = path.resolve(__dirname, '..')
const ARTIFACTS_ROOT = path.join(HUNT_ROOT, 'artifacts')

function parseArgs(argv: string[]) {
  let caseId = 'CP-search-smoke'
  let headed = false
  for (let i = 0; i < argv.length; i++) {
    const a = argv[i]
    if (a === '--case' && argv[i + 1]) {
      caseId = argv[++i]!
    } else if (a === '--headed') {
      headed = true
    } else if (a === '--help' || a === '-h') {
      console.log(`Usage: tsx tools/e2e-hunt/src/cli.ts --case CP-search-smoke [--headed]`)
      process.exit(0)
    }
  }
  return { caseId, headed }
}

async function ensureSearchUp(baseURL: string): Promise<void> {
  try {
    const res = await fetch(baseURL, { signal: AbortSignal.timeout(2000) })
    if (res.ok) return
  } catch {
    // down
  }
  console.error(`[e2e-hunt] ${baseURL} 未就绪。请先在仓库根执行: npm run dev:search`)
  process.exit(2)
}

async function main() {
  const { caseId, headed } = parseArgs(process.argv.slice(2))
  const pack = getCasePack(caseId)
  await ensureSearchUp(pack.baseURL)

  const runId = randomUUID()
  const outDir = path.join(ARTIFACTS_ROOT, runId)
  await fs.mkdir(outDir, { recursive: true })

  const driver = new PlaywrightDriver()
  const page = await driver.launch({ headless: !headed })

  console.log(`[e2e-hunt] case=${pack.id} runId=${runId}`)
  console.log(`[e2e-hunt] artifacts=${outDir}`)

  try {
    const report = await runAgentLoop({
      driver,
      page,
      pack,
      artifactsDir: outDir,
      runId,
      adapterId: ADAPTER_ID,
    })
    const { jsonPath, mdPath } = await writeReports(report, outDir)
    console.log(`[e2e-hunt] status=${report.summary.status} steps=${report.summary.steps}`)
    console.log(
      `[e2e-hunt] findings fail_hard=${report.summary.findings.fail_hard} suspect=${report.summary.findings.suspect}`,
    )
    console.log(`[e2e-hunt] report.json=${jsonPath}`)
    console.log(`[e2e-hunt] report.md=${mdPath}`)
    if (report.summary.status === 'failed' || report.summary.status === 'aborted') {
      process.exitCode = 1
    }
  } finally {
    await driver.close()
  }
}

main().catch((err) => {
  console.error('[e2e-hunt] fatal', err)
  process.exit(1)
})
