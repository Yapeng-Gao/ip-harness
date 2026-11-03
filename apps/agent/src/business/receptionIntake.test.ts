import assert from 'node:assert/strict'
import { test } from 'node:test'
import { assessReceptionIntake, RECEPTION_GOALS } from './receptionIntake'
const assess = (goalText: string, fileNames: string[] = []) => assessReceptionIntake({ goalText, fileNames })
test('vague and empty goals ask for intent rather than default to disclosure', () => {
  for (const text of ['', '帮我看看这个技术', '不知道怎么办']) {
    const r = assess(text)
    assert.equal(r.kind, 'clarify')
    if (r.kind === 'clarify') { assert.equal(r.topic, 'intent'); assert.equal(r.choices.length, 8) }
  }
})
test('files alone never establish intent or prove contents', () => {
  const r = assess('', ['审查意见.pdf'])
  assert.equal(r.kind, 'clarify')
  if (r.kind === 'clarify') assert.match(r.explanation, /尚未读取/)
})
test('multiple goals ask for priority and preserve all original intent in summary', () => {
  const text = '先挖掘创新点，再写交底'
  const r = assess(text)
  assert.equal(r.kind, 'clarify')
  if (r.kind === 'clarify') assert.equal(r.topic, 'priority')
  const chosenGoal = RECEPTION_GOALS.find((g) => g.slug === 'mining')!
  const next = assessReceptionIntake({ goalText: text, fileNames: [], chosenGoal })
  assert.equal(next.kind, 'ready')
  if (next.kind === 'ready') { assert.equal(next.suggest.primary.slug, 'mining'); assert.ok(next.goalSummary.includes(text)) }
})
test('clear human goal takes precedence over filename clues', () => {
  const r = assess('帮我写交底', ['审查意见.pdf'])
  assert.equal(r.kind, 'ready')
  if (r.kind === 'ready') assert.equal(r.suggest.primary.slug, 'disclosure')
})
test('application asks about disclosure even if a filename mentions it', () => {
  const r = assess('想申请专利', ['交底.docx'])
  assert.equal(r.kind, 'clarify')
  if (r.kind === 'clarify') assert.equal(r.topic, 'disclosure')
  for (const state of ['have', 'missing', 'unsure'] as const) {
    const next = assessReceptionIntake({ goalText: '想申请专利', fileNames: ['交底.docx'], chosenGoal: RECEPTION_GOALS.find((g) => g.slug === 'draft'), disclosureState: state })
    assert.equal(next.kind, 'ready')
    if (next.kind === 'ready') assert.equal(next.suggest.primary.slug, state === 'have' ? 'draft' : 'disclosure')
  }
})
test('decision about applying is not confused with a second application task', () => {
  const r = assess('帮我判断要不要申请')
  assert.equal(r.kind, 'ready')
  if (r.kind === 'ready') assert.equal(r.suggest.primary.slug, 'intake')
})
test('negative or uncertain disclosure descriptions never count as confirmed materials', () => {
  for (const text of ['没有完整交底书，想申请', '不确定有没有交底书，想申请']) {
    const r = assess(text)
    assert.equal(r.kind, 'ready')
    if (r.kind === 'ready') assert.equal(r.suggest.primary.slug, 'disclosure')
  }
})
test('all eight explicit choices produce an appropriate handoff', () => {
  for (const chosenGoal of RECEPTION_GOALS) {
    const r = assessReceptionIntake({ goalText: '帮我看看', fileNames: [], chosenGoal, disclosureState: 'have' })
    assert.equal(r.kind, 'ready')
    if (r.kind === 'ready') { assert.equal(r.suggest.primary.slug, chosenGoal.slug); assert.ok(r.suggest.roughGaps.length > 0) }
  }
})
