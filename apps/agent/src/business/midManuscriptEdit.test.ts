/**
 * §136 中栏可编辑 / 选区问 AI
 * 跑：node --import tsx --test apps/agent/src/business/midManuscriptEdit.test.ts
 */
import assert from 'node:assert/strict'
import { describe, it } from 'node:test'
import {
  buildSelectionAskDraft,
  isMidManuscriptDirty,
  midEditSavePayload,
  MID_SAVE_HINT,
} from './midManuscriptEdit'

describe('midManuscriptEdit §136', () => {
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
})
