import assert from 'node:assert/strict'
import { describe, it } from 'node:test'
import type { CaseDelegateDispatch } from './BusinessCaseContext'
import { dispatchFromProgress, gapNextReflectsPlan } from './planPersist'

describe('planPersist', () => {
  it('reads delegate off progress', () => {
    const d: CaseDelegateDispatch = {
      at: '2026-10-31T03:00:00.000Z',
      goalKind: 'protect_start',
      goalText: '开案保护散热',
      deptSlug: 'disclosure',
      stepLabel: '交底部 · 技术事实',
    }
    assert.equal(
      dispatchFromProgress({ casePlan: 'x', delegate: d })?.deptSlug,
      'disclosure',
    )
    assert.equal(dispatchFromProgress({ casePlan: 'only' }), null)
  })

  it('gap next reflects plan label', () => {
    assert.equal(
      gapNextReflectsPlan('下一步：交底部 · 技术事实（计划）', {
        delegate: {
          at: '',
          goalKind: 'protect_start',
          goalText: 'g',
          deptSlug: 'disclosure',
          stepLabel: '交底部 · 技术事实',
        },
      }),
      true,
    )
  })
})
