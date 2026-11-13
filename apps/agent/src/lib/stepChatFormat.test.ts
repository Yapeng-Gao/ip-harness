/**
 * 会话气泡人话：禁裸 API id
 * 跑：node --import tsx --test apps/agent/src/lib/stepChatFormat.test.ts
 */
import assert from 'node:assert/strict'
import { describe, it } from 'node:test'
import {
  formatStepToolContent,
  humanizeToolBubble,
  parseRewindIntent,
  projectToolLabel,
} from './stepChatFormat'
import type { ExpertStepDef } from '../projects/types'

describe('stepChatFormat', () => {
  it('maps known tool ids to Chinese', () => {
    assert.equal(projectToolLabel('build_search_query'), '生成检索式')
  })

  it('never leaves snake_case as label', () => {
    assert.equal(projectToolLabel('foo_bar_baz'), 'foo bar baz')
  })

  it('strips multiline legacy tool content', () => {
    const ui = humanizeToolBubble(
      'build_search_query\n主式 + 备用×2 · limit=50',
      'build_search_query',
    )
    assert.equal(ui.title, '生成检索式')
    assert.equal(ui.body, '主式 + 备用×2 · limit=50')
    assert.ok(!ui.body.includes('build_search_query'))
    assert.ok(!ui.title.includes('_'))
  })

  it('strips same-line legacy tool content', () => {
    const ui = humanizeToolBubble(
      'build_search_query 主式 + 备用×2 · limit=50',
    )
    assert.equal(ui.title, '生成检索式')
    assert.match(ui.body, /主式/)
    assert.ok(!ui.body.startsWith('build_search_query'))
  })

  it('strips arrow legacy process-log style', () => {
    const ui = humanizeToolBubble(
      'build_search_query → 主检索式 1 条',
    )
    assert.equal(ui.title, '生成检索式')
    assert.equal(ui.body, '主检索式 1 条')
  })

  it('formatStepToolContent stores preview only', () => {
    const step: ExpertStepDef = {
      id: 'q',
      label: '检索式',
      script: '已就绪',
      tool: { name: 'build_search_query', preview: '主检索式 1 条' },
    }
    assert.equal(formatStepToolContent(step), '主检索式 1 条')
  })

  it('parses rewind by step number', () => {
    const steps = [
      { id: 'a', label: '划定检索范围' },
      { id: 'b', label: '检索式' },
      { id: 'c', label: '命中清单' },
    ]
    assert.deepEqual(parseRewindIntent('回到第2步', steps), { stepIndex: 1 })
    assert.deepEqual(parseRewindIntent('从第2步开始修改', steps), {
      stepIndex: 1,
    })
    assert.equal(parseRewindIntent('继续下一步', steps), null)
  })

  it('parses rewind by step label', () => {
    const steps = [
      { id: 'a', label: '划定检索范围' },
      { id: 'b', label: '检索式' },
    ]
    assert.deepEqual(parseRewindIntent('从检索式重做', steps), { stepIndex: 1 })
  })
})
