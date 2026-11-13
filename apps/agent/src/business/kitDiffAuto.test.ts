import assert from 'node:assert/strict'
import { describe, it } from 'node:test'
import {
  isBodyEmptyForKit,
  isMeaningfulDiff,
  mergeKitDoneWithDiff,
  suggestKitDoneFromDiff,
} from './kitDiffAuto'
import { seedTrueDiff } from './trueDiffDemo'

describe('kitDiffAuto', () => {
  const disclosure = [
    '技术交底正文',
    '附图说明',
    '发明人名单',
    '权属声明（含签字页）',
  ]
  const hold = ['权属声明']

  it('empty body detected', () => {
    assert.equal(isBodyEmptyForKit(''), true)
    assert.equal(isBodyEmptyForKit('暂无产出正文。点右侧专家岗起草后，正文会出现在此。'), true)
    assert.equal(
      isBodyEmptyForKit('# 六段事实稿\n\n## 技术领域\n边缘散热\n权属声明草稿'),
      false,
    )
  })

  it('seed diff stats are meaningful', () => {
    const s = seedTrueDiff().stats
    assert.ok(isMeaningfulDiff(s))
    assert.equal(isMeaningfulDiff({ added: 0, removed: 0 }), false)
  })

  it('part six-sec → 技术交底正文; not hold', () => {
    const s = suggestKitDoneFromDiff({
      labels: disclosure,
      holdLabels: hold,
      materialId: 'part-six-sec',
      partId: 'six-sec',
      bodyText: '# 六段事实稿\n技术领域',
    })
    assert.ok(s.includes('技术交底正文'))
    assert.ok(!s.some((x) => x.includes('权属')))
  })

  it('ownership part warrants hold 权属', () => {
    const s = suggestKitDoneFromDiff({
      labels: disclosure,
      holdLabels: hold,
      materialId: 'part-ownership',
      partId: 'ownership',
      bodyText: '## 权属声明（示意）\n发明人 / 申请人',
    })
    assert.ok(s.some((x) => x.includes('权属')))
  })

  it('seed-diff auto-checks fillable, not hold', () => {
    const s = suggestKitDoneFromDiff({
      labels: disclosure,
      holdLabels: hold,
      materialId: 'seed-diff',
      bodyText: '下方为 seed 左右差分示意',
      diffStats: seedTrueDiff().stats,
    })
    assert.ok(s.includes('技术交底正文'))
    assert.ok(!s.some((x) => x.includes('权属')))
  })

  it('merge monotonic; empty deliverable clears non-hold', () => {
    const mid = mergeKitDoneWithDiff({
      labels: disclosure,
      prevDone: ['技术交底正文'],
      holdLabels: hold,
      materialId: 'part-embod',
      partId: 'embod',
      bodyText: '## 实施例摘录\n步骤',
    })
    assert.ok(mid.includes('技术交底正文'))
    assert.ok(mid.includes('附图说明') || mid.includes('技术交底正文'))

    const cleared = mergeKitDoneWithDiff({
      labels: disclosure,
      prevDone: ['技术交底正文', '权属声明（含签字页）'],
      holdLabels: ['权属声明（含签字页）'],
      materialId: 'deliverable',
      bodyText: '暂无产出正文。点右侧专家岗起草后，正文会出现在此。',
      forceEmpty: true,
    })
    assert.deepEqual(cleared, ['权属声明（含签字页）'])
  })

  it('intake dir-brief → 评分卡汇总; 决议 hold stays off', () => {
    const labels = [
      '评分卡汇总',
      '报价',
      '国际路径意向',
      '会议纪要',
      '决议签署',
    ]
    const s = suggestKitDoneFromDiff({
      labels,
      holdLabels: ['决议签署'],
      materialId: 'part-dir-brief',
      partId: 'dir-brief',
      bodyText: '## 立题一页纸\n方向与边界',
    })
    assert.deepEqual(s, ['评分卡汇总'])
  })
})
