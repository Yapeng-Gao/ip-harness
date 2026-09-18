import { spawnSync } from 'node:child_process'
import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { openDb } from '../src/db.js'
import { ingestSamples } from '../src/ingest.js'
import { SAMPLES_DIR } from '../src/paths.js'

const APP_ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..')

function ensureSamples(): void {
  const has =
    fs.existsSync(SAMPLES_DIR) &&
    fs.readdirSync(SAMPLES_DIR).some((f) => f.endsWith('.json') && !f.startsWith('_'))
  if (has) return
  console.log('[ingest] samples missing — generating…')
  const r = spawnSync('npx', ['tsx', 'scripts/generate-samples.ts'], {
    cwd: APP_ROOT,
    stdio: 'inherit',
    shell: true,
  })
  if (r.status !== 0) process.exit(r.status ?? 1)
}

ensureSamples()
const db = openDb()
const stats = ingestSamples(db)
console.log(JSON.stringify(stats, null, 2))
console.log(
  `[ingest] ok indexed=${stats.indexed} quarantined=${stats.quarantined} version=${stats.indexVersion.tag}`,
)
db.close()
