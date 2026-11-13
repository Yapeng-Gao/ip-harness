/**
 * 成果另存版本 · 时间戳副本
 * 跑：node --import tsx --test apps/agent/src/business/artifactVersions.test.ts
 */
import assert from 'node:assert/strict'
import { describe, it } from 'node:test'
import {
  appendArtifactVersion,
  formatArtifactSavedAt,
  restoreArtifactVersion,
  type ArtifactVersion,
} from './artifactVersions'

describe('artifactVersions', () => {
  it('appendArtifactVersion stamps a copy and returns hint HH:mm', () => {
    const at = new Date('2026-09-29T07:15:30.000Z')
    const { versions, hint } = appendArtifactVersion({
      versions: [],
      markdown: '## v1 权要草稿',
      at,
    })
    assert.equal(versions.length, 1)
    assert.equal(versions[0]?.markdown, '## v1 权要草稿')
    assert.ok(versions[0]?.savedAt)
    assert.match(hint, /^已另存 · \d{2}:\d{2}$/)
    assert.equal(hint, `已另存 · ${formatArtifactSavedAt(at)}`)
  })

  it('keeps prior versions and newest last', () => {
    const prior: ArtifactVersion[] = [
      { savedAt: '2026-09-29T06:00:00.000Z', markdown: 'old' },
    ]
    const { versions } = appendArtifactVersion({
      versions: prior,
      markdown: 'new body',
      at: new Date('2026-09-29T08:00:00.000Z'),
    })
    assert.equal(versions.length, 2)
    assert.equal(versions[0]?.markdown, 'old')
    assert.equal(versions[1]?.markdown, 'new body')
  })

  it('formatArtifactSavedAt yields local HH:mm', () => {
    const s = formatArtifactSavedAt(new Date('2026-09-29T07:05:00.000Z'))
    assert.match(s, /^\d{2}:\d{2}$/)
  })

  it('restoreArtifactVersion returns markdown for index', () => {
    const versions: ArtifactVersion[] = [
      { savedAt: '2026-09-29T06:00:00.000Z', markdown: 'v0' },
      { savedAt: '2026-09-29T07:00:00.000Z', markdown: 'v1 body' },
    ]
    const r = restoreArtifactVersion({ versions, index: 1 })
    assert.ok(r)
    assert.equal(r?.markdown, 'v1 body')
    assert.match(r?.hint ?? '', /^已恢复 · \d{2}:\d{2}$/)
    assert.equal(restoreArtifactVersion({ versions, index: 9 }), null)
  })
})
