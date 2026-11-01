/**
 * §136/§138 中栏可编辑 / 选区问 AI / 收口只读
 * 跑：node --import tsx --test apps/agent/src/business/midManuscriptEdit.test.ts
 */
import assert from 'node:assert/strict'
import { describe, it } from 'node:test'
import {
  buildSelectionAskDraft,
  isMidManuscriptDirty,
  isMidManuscriptSealed,
  midEditSavePayload,
  midProcessTopstrip,
  midSaveHintAfterSeal,
  midSelectionChipMode,
  MID_DIRTY_NEED_REASK_HINT,
  MID_SAVE_HINT,
} from './midManuscriptEdit'

describe('midManuscriptEdit §136/§138', () => {
  it('detects dirty vs source', () => {
    assert.equal(isMidManuscriptDirty('a', 'a'), false)
    assert.equal(isMidManuscriptDirty('a', 'b'), true)
  })

  it('buildSelectionAskDraft ask quotes selection', () => {
    const d = buildSelectionAskDraft({
      selection: '螺旋水道散热',
      mode: 'ask',
      manuscriptTitle: '边缘散热 · 交底书',
    })
    assert.match(d, /选自「边缘散热 · 交底书」/)
    assert.match(d, /> 螺旋水道散热/)
    assert.match(d, /请就以上选段回答/)
  })

  it('buildSelectionAskDraft revise asks for rewrite', () => {
    const d = buildSelectionAskDraft({
      selection: '独权过宽',
      mode: 'revise',
    })
    assert.match(d, /> 独权过宽/)
    assert.match(d, /请改这段/)
  })

  it('empty selection yields empty draft', () => {
    assert.equal(buildSelectionAskDraft({ selection: '  ', mode: 'ask' }), '')
  })

  it('midEditSavePayload writes artifactMarkdown', () => {
    assert.deepEqual(midEditSavePayload('正文'), { artifactMarkdown: '正文' })
    assert.equal(MID_SAVE_HINT.includes('保存'), true)
  })

  it('§138 sealed when lookback / stationClosed / awaiting', () => {
    assert.equal(
      isMidManuscriptSealed({
        stationClosed: false,
        awaitingConfirm: false,
        lookback: false,
      }),
      false,
    )
    assert.equal(
      isMidManuscriptSealed({
        stationClosed: true,
        awaitingConfirm: false,
        lookback: false,
      }),
      true,
    )
    assert.equal(
      isMidManuscriptSealed({
        stationClosed: false,
        awaitingConfirm: true,
        lookback: false,
      }),
      true,
    )
    assert.equal(
      isMidManuscriptSealed({
        stationClosed: false,
        awaitingConfirm: false,
        lookback: true,
      }),
      true,
    )
  })

  it('§138 selection chip hide/warn/ok', () => {
    assert.equal(
      midSelectionChipMode({
        sealed: true,
        unlocked: false,
        awaitingConfirm: false,
        lookback: false,
      }),
      'hide',
    )
    assert.equal(
      midSelectionChipMode({
        sealed: true,
        unlocked: true,
        awaitingConfirm: false,
        lookback: false,
      }),
      'warn',
    )
    assert.equal(
      midSelectionChipMode({
        sealed: false,
        unlocked: false,
        awaitingConfirm: true,
        lookback: false,
      }),
      'hide',
    )
    assert.equal(
      midSelectionChipMode({
        sealed: false,
        unlocked: false,
        awaitingConfirm: false,
        lookback: false,
      }),
      'ok',
    )
  })

  it('§138 process topstrip lookback vs step', () => {
    const closed = midProcessTopstrip({
      sealed: true,
      stepOrdinal: 1,
      stepCount: 4,
      stepLabel: '成稿',
    })
    assert.match(closed.line, /本站已确认/)
    assert.equal(closed.density, 'lookback')
    assert.doesNotMatch(closed.line, /1\/4/)
    const open = midProcessTopstrip({
      sealed: false,
      stepOrdinal: 2,
      stepCount: 4,
      stepLabel: '质检',
    })
    assert.match(open.line, /2\/4/)
    assert.equal(open.density, 'step')
  })

  it('§138 save after seal forces reask hint', () => {
    assert.match(midSaveHintAfterSeal(true), new RegExp(MID_DIRTY_NEED_REASK_HINT))
    assert.equal(midSaveHintAfterSeal(false), MID_SAVE_HINT)
  })

  it('§138 selection draft can annotate needReask', () => {
    const d = buildSelectionAskDraft({
      selection: '鳍片',
      mode: 'ask',
      needReask: true,
    })
    assert.match(d, /须再请示/)
  })
})
