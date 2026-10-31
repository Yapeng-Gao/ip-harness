import assert from 'node:assert/strict'
import { describe, it } from 'node:test'
import {
  buildJudgmentFromConfirm,
  buildBranchJudgment,
  preferenceCandidateFromJudgment,
  savePreference,
  precipitateJudgmentAsPreference,
  gateLabelForKind,
} from './judgmentArchive'

describe('judgmentArchive T10', () => {
  it('confirm writes gate/option/conclusion/reason — not ops log only', () => {
    const j = buildJudgmentFromConfirm({
      caseId: 'c1',
      confirmId: 'cf1',
      kind: 'disclosure_ready',
      summary: '交底事实属实，可交⑤',
      resultPreview: '【成果】交底质检示意全绿，可打包开⑤。\n【对比】对照六段缺测法已备注。',
      processPreview: '【办理过程】事实确认→质检复检→全绿。',
      decision: 'confirmed',
      reason: '接受结论',
    })
    assert.equal(j.gate, '④可交⑤')
    assert.match(j.option, /确认/)
    assert.ok(j.conclusion.length > 4)
    assert.equal(j.reason, '接受结论')
    assert.ok(j.evidenceAnchor)
  })

  it('return captures reject reason', () => {
    const j = buildJudgmentFromConfirm({
      caseId: 'c1',
      confirmId: 'cf2',
      kind: 'oa_strategy',
      summary: '策略 B',
      decision: 'returned',
      reason: '缩限过猛，先争辩',
    })
    assert.match(j.option, /驳回/)
    assert.match(j.reason, /缩限过猛/)
  })

  it('B5 branch judgment does not invent 申请号 narrative', () => {
    const j = buildBranchJudgment({
      caseId: 'c1',
      gate: '⑤申不申',
      conclusion: '不申',
      option: '不申结案',
      reason: '预算与公开节奏 · B5 不出申请号',
      compare: '不申却出申请号 = 禁止假装',
    })
    assert.equal(j.option, '不申结案')
    assert.match(j.reason, /不出申请号/)
  })

  it('preference precipitate marks saved', () => {
    const j = buildBranchJudgment({
      caseId: 'c1',
      gate: '⑤申不申',
      conclusion: '申请发明',
      option: '确认 · 申请',
    })
    const cand = preferenceCandidateFromJudgment(j)
    assert.equal(cand.saved, false)
    assert.equal(cand.precipitable, true)
    const saved = savePreference([cand], cand.id)
    assert.equal(saved[0]!.saved, true)
    const fromJ = precipitateJudgmentAsPreference([], j)
    assert.equal(fromJ[0]!.saved, true)
    assert.equal(fromJ[0]!.caseId, null)
  })

  it('gate labels follow 八部 meaning', () => {
    assert.equal(gateLabelForKind('file_authorize'), '⑤确认递交')
    assert.equal(gateLabelForKind('claims_ready'), '⑤保护范围')
  })
})
