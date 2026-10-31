import assert from 'node:assert/strict'
import { describe, it } from 'node:test'
import {
  AUX_VERSION_BIND_HONEST,
  bindSideAuxBodyToRevision,
  buildAuxRevisionStamp,
  materialLabelWithRevision,
  parseVersionMaterialId,
  stripAuxRevisionBlock,
} from './auxVersionBind'

describe('auxVersionBind', () => {
  it('stamp for current draft', () => {
    const s = buildAuxRevisionStamp({
      stepIndex: 2,
      stepLabel: '三轴评分卡',
      versionCount: 1,
    })
    assert.match(s.revCode, /步3/)
    assert.match(s.badge, /本稿修订/)
    assert.match(s.badge, /示意v1/)
    assert.equal(s.honest, AUX_VERSION_BIND_HONEST)
  })

  it('stamp for viewing saved version', () => {
    const s = buildAuxRevisionStamp({
      stepIndex: 1,
      versionCount: 2,
      viewingVersionIndex: 0,
      versionSavedAt: '2026-10-31T04:00:00.000Z',
    })
    assert.match(s.badge, /对照修订版 1/)
    assert.match(s.revCode, /版1/)
  })

  it('bind is idempotent', () => {
    const stamp = buildAuxRevisionStamp({
      stepIndex: 0,
      versionCount: 0,
    })
    const base = '# 对比清单稿\n\n## 对比清单稿（示意）\n表\n'
    const once = bindSideAuxBodyToRevision({
      body: base,
      stamp,
      partLabel: '对比清单稿',
    })
    assert.match(once, /本稿修订（示意）/)
    assert.match(once, /对比清单稿（示意）/)
    const twice = bindSideAuxBodyToRevision({
      body: once,
      stamp: buildAuxRevisionStamp({ stepIndex: 3, versionCount: 2 }),
      partLabel: '对比清单稿',
    })
    assert.equal(
      (twice.match(/## 本稿修订（示意）/g) || []).length,
      1,
    )
    assert.match(twice, /步4/)
  })

  it('strip and tree label', () => {
    const stamp = buildAuxRevisionStamp({ stepIndex: 1, versionCount: 0 })
    const labeled = materialLabelWithRevision({
      baseLabel: '查新 · 对比清单稿',
      stamp,
    })
    assert.match(labeled, /修订/)
    assert.equal(parseVersionMaterialId('version-2'), 2)
    assert.equal(parseVersionMaterialId('side-x'), null)
    const stripped = stripAuxRevisionBlock(
      '# T\n\n## 本稿修订（示意）\n- x\n\n## 正文\nY\n',
    )
    assert.ok(!stripped.includes('本稿修订（示意）'))
    assert.match(stripped, /正文/)
  })
})
