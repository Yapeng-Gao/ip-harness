/**
 * CLI: list index versions / rollback alias search_current
 *   npm run index:list
 *   npm run index:rollback -- <tag>
 */
import { openDb } from '../src/db.js'
import { getCurrentAlias, listIndexVersions, setAlias } from '../src/ingest.js'

const [, , cmd, tagArg] = process.argv
const db = openDb()

if (cmd === 'list') {
  const alias = getCurrentAlias(db)
  const versions = listIndexVersions(db)
  console.log(JSON.stringify({ alias, versions }, null, 2))
} else if (cmd === 'rollback') {
  const versions = listIndexVersions(db)
  const tag = tagArg ?? versions[1]?.tag
  if (!tag) {
    console.error('Usage: npm run index:rollback -- <tag>')
    console.error('Or publish ≥2 versions so default rollback target exists.')
    process.exit(1)
  }
  const alias = setAlias(db, tag)
  console.log(JSON.stringify({ ok: true, alias, versions }, null, 2))
} else {
  console.error('Usage: index-cli list | rollback [tag]')
  process.exit(1)
}

db.close()
