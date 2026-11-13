/**
 * 确认页成果与席 artifactMarkdown 同源
 * 跑：node --import tsx --test apps/agent/src/business/confirmResultMarkdown.test.ts
 */
import assert from 'node:assert/strict'
import { describe, it } from 'node:test'
import { resolveConfirmResultMarkdown } from './confirmResultMarkdown'

describe('resolveConfirmResultMarkdown', () => {
  it('prefers seat artifactMarkdown when non-empty', () => {
    const md = resolveConfirmResultMarkdown({
      resultPreview: '【成果】草稿已生成（样机）。',
      artifactMarkdown: '## 手改权要\n\n独立权项 1…',
    })
    assert.equal(md, '## 手改权要\n\n独立权项 1…')
  })

  it('falls back to resultPreview when artifact empty/missing', () => {
    assert.equal(
      resolveConfirmResultMarkdown({
        resultPreview: '【成果】立项建议：做。',
        artifactMarkdown: undefined,
      }),
      '【成果】立项建议：做。',
    )
    assert.equal(
      resolveConfirmResultMarkdown({
        resultPreview: '【成果】附图清单。',
        artifactMarkdown: '   \n  ',
      }),
      '【成果】附图清单。',
    )
  })
})
