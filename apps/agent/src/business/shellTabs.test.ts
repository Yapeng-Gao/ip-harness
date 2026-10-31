import assert from 'node:assert/strict'
import { describe, it } from 'node:test'
import {
  professionalLandingHref,
  projectLandingHref,
  resolveShellTab,
} from './shellTabs'

describe('shellTabs landing', () => {
  it('project: active → company; latest → company; none → new', () => {
    assert.equal(
      projectLandingHref({ activeCaseId: 'c1', hasCases: true }),
      '/agent/cases/c1',
    )
    assert.equal(
      projectLandingHref({ latestCaseId: 'c2', hasCases: true }),
      '/agent/cases/c2',
    )
    assert.equal(projectLandingHref({ hasCases: false }), '/agent/cases/new')
    assert.equal(projectLandingHref({ hasCases: true }), '/agent/cases')
  })

  it('professional: needs case; else same funnel as project', () => {
    assert.equal(
      professionalLandingHref({ activeCaseId: 'c1', hasCases: true }),
      '/agent/cases/c1/professional',
    )
    assert.equal(
      professionalLandingHref({ latestCaseId: 'c2', hasCases: true }),
      '/agent/cases/c2/professional',
    )
    assert.equal(professionalLandingHref({ hasCases: false }), '/agent/cases/new')
  })

  it('resolveShellTab maps home/cases/professional', () => {
    assert.equal(resolveShellTab('/agent'), 'assistant')
    assert.equal(resolveShellTab('/agent/cases/c1'), 'project')
    assert.equal(resolveShellTab('/agent/cases/c1/depts/draft'), 'project')
    assert.equal(
      resolveShellTab('/agent/cases/c1/professional'),
      'professional',
    )
    assert.equal(resolveShellTab('/agent/lab'), null)
  })
})
