import assert from 'node:assert/strict'
import { describe, it, beforeEach } from 'node:test'
import {
  LINE_BASE_MS,
  HANDOFF_BASE_MS,
  advanceDisplayClock,
  formatElapsed,
  handoffDurationMs,
  isStreamComplete,
  lineDelayMs,
  loadDemoSpeed,
  nextStreamShown,
  pickLobbyFocus,
  pipelineIndex,
  pipelineIndexFromStage,
  saveDemoSpeed,
  scriptedDraftLines,
  stepDraftLines,
  visibleDraft,
} from './demoPace'

describe('demoPace streaming and speed', () => {
  beforeEach(() => {
    const mem = new Map<string, string>()
    const g = globalThis as { localStorage?: Storage }
    g.localStorage = {
      getItem: (k) => (mem.has(k) ? mem.get(k)! : null),
      setItem: (k, v) => {
        mem.set(k, String(v))
      },
      removeItem: (k) => {
        mem.delete(k)
      },
      clear: () => mem.clear(),
      key: () => null,
      length: 0,
    } as Storage
  })

  it('scales line and handoff timing and skips motion when reduced', () => {
    assert.equal(lineDelayMs(1, false), LINE_BASE_MS)
    assert.equal(lineDelayMs(2, false), LINE_BASE_MS / 2)
    assert.equal(lineDelayMs(4, false), LINE_BASE_MS / 4)
    assert.equal(lineDelayMs(4, true), 0)
    assert.equal(handoffDurationMs(1, false), HANDOFF_BASE_MS)
    assert.equal(handoffDurationMs(4, false), HANDOFF_BASE_MS / 4)
    assert.equal(handoffDurationMs(2, true), 0)
  })

  it('streams line by line and freezes when aborted', () => {
    const lines = stepDraftLines(
      {
        label: '六段采集',
        script: '【交底】六段清单已开。',
        structuredBody: '背景齐\n\n效果缺',
        tool: { preview: '六段 · 已填 4' },
        triggersHitl: true,
      },
      1,
    )
    assert.deepEqual(lines[0], '2. 六段采集')
    assert.ok(lines.includes('背景齐'))
    assert.ok(lines.includes('效果缺'))
    assert.equal(lines.at(-1), '产出片段：六段 · 已填 4')
    assert.equal(visibleDraft(lines, 2), lines.slice(0, 2).join('\n'))
    assert.equal(nextStreamShown(1, lines.length, false), 2)
    assert.equal(nextStreamShown(1, lines.length, true), 1)
    assert.equal(isStreamComplete(lines.length, lines.length), true)
    assert.equal(isStreamComplete(1, lines.length), false)
    assert.equal(isStreamComplete(0, 0), true)
  })

  it('caps long bodies and speeds the elapsed clock until abort', () => {
    const long = stepDraftLines(
      {
        label: '成稿',
        script: '写交底',
        structuredBody: Array.from({ length: 30 }, (_, i) => `行${i}`).join('\n'),
      },
      0,
    )
    assert.equal(long.length, 18)
    assert.equal(long.at(-1), '其余段落写进交付物。')
    assert.equal(advanceDisplayClock(1000, 500, 4, false), 3000)
    assert.equal(advanceDisplayClock(1000, 500, 1, true), 1000)
    assert.equal(formatElapsed(125000), '2:05')
    saveDemoSpeed(2)
    assert.equal(loadDemoSpeed(), 2)
  })

  it('places the pipeline dot and picks a lobby task', () => {
    assert.equal(
      pipelineIndex({ stepIndex: 0, stepCount: 4, pending: false, done: false, streaming: false }),
      0,
    )
    assert.equal(
      pipelineIndex({ stepIndex: 1, stepCount: 4, pending: false, done: false, streaming: true }),
      2,
    )
    assert.equal(
      pipelineIndex({ stepIndex: 2, stepCount: 4, pending: true, done: false, streaming: false }),
      4,
    )
    assert.equal(pipelineIndexFromStage('drafting', false), 2)
    assert.equal(pipelineIndexFromStage('prepare', true), 4)
    const focus = pickLobbyFocus([
      {
        id: 'seed',
        title: '演示',
        updatedAt: '2026-11-13T03:00:00.000Z',
        seed: true,
        pending: true,
        stageId: 'oa',
      },
      {
        id: 'real',
        title: '真人案',
        updatedAt: '2026-11-13T01:00:00.000Z',
        seed: false,
        pending: false,
        stageId: 'intake',
      },
    ])
    assert.equal(focus?.id, 'real')
    assert.deepEqual(scriptedDraftLines('第一行\n\n第二行'), ['第一行', '第二行'])
    assert.equal(scriptedDraftLines('  ').length, 3)
  })
})
