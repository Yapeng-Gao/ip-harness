/**
 * 业务确认 → 中台 DomainCommand / flow 投影
 * 跑：node --import tsx --test apps/agent/src/business/midSync.test.ts
 */
import assert from 'node:assert/strict'
import { describe, it } from 'node:test'
import { stepsForFlow } from '../../../../src/data/flowSteps'
import {
  CONFIRM_META,
  applyMainChainConfirm,
  type BusinessConfirmKind,
  type MainChainSnapshot,
} from './businessSeats'
import {
  BUSINESS_MID_SYNC,
  confirmCommands,
  handoffNoteForConfirm,
  midCaseDraftFromWizard,
  midSyncMeta,
  projectBusinessFlow,
  returnCommands,
  runConfirmCommands,
  runReturnCommands,
  type DomainCommand,
} from './midSync'

const KINDS = Object.keys(CONFIRM_META) as BusinessConfirmKind[]

const CASE_ID = 'proj-mid-sync-1'

function handoffKeyOf(cmd: DomainCommand): string | undefined {
  return 'handoffKey' in cmd ? cmd.handoffKey : undefined
}

function noteOf(cmd: DomainCommand): string | undefined {
  return 'note' in cmd ? cmd.note : undefined
}

describe('midSync mapping', () => {
  it('covers every confirm kind with an existing command and flow step', () => {
    assert.deepEqual(Object.keys(BUSINESS_MID_SYNC).sort(), [...KINDS].sort())
    for (const kind of KINDS) {
      const row = BUSINESS_MID_SYNC[kind]
      assert.equal(row.kind, kind)
      assert.ok(row.command.length > 0)
      assert.ok(row.handoffKey.length > 0)
      const steps = stepsForFlow(row.flowKey)
      assert.ok(
        steps.includes(row.flowStepLabel),
        `${kind} flow step ${row.flowStepLabel} missing on ${row.flowKey}`,
      )
    }
  })

  it('one confirm lands on the pass command for every kind, with no role split', () => {
    const note = handoffNoteForConfirm({
      kind: 'claims_ready',
      artifactMarkdown: '## 权要\n\n独立权项：热失控双阈值',
      fallback: '确认权利要求',
    })
    assert.match(note, /热失控双阈值/)

    for (const kind of KINDS) {
      const row = BUSINESS_MID_SYNC[kind]
      const cmds = confirmCommands({
        kind,
        caseId: CASE_ID,
        note,
      })
      assert.ok(cmds.length >= 1, kind)
      const types = cmds.map((c) => c.type)
      assert.equal(types[types.length - 1], row.command, kind)
      if (kind !== 'figures_ready' && kind !== 'file_authorize') {
        assert.ok(types.includes('startReview'), `${kind} should open review`)
        assert.ok(
          types[types.length - 1] === 'approveHandoff' ||
            types[types.length - 1] === 'confirmQuote',
          `${kind} should finish passed, not submit-only`,
        )
      }
      for (const cmd of cmds) {
        if ('caseId' in cmd) assert.equal(cmd.caseId, CASE_ID, kind)
        const key = handoffKeyOf(cmd)
        if (key) assert.equal(key, row.handoffKey, `${kind} ${cmd.type}`)
        assert.match(noteOf(cmd) ?? '', /热失控双阈值/)
      }
    }
  })

  it('go_nogo confirm is submit → startReview → confirmQuote', () => {
    const cmds = confirmCommands({
      kind: 'go_nogo',
      caseId: CASE_ID,
      note: '确认立项',
    })
    assert.deepEqual(
      cmds.map((c) => c.type),
      ['submitHandoff', 'startReview', 'confirmQuote'],
    )
    assert.equal(handoffKeyOf(cmds[0]!), 'intake_quote')
    assert.equal(handoffKeyOf(cmds[1]!), 'intake_quote')
  })

  it('sync meta asks the dispatcher to pass the role gate without a workspace switch', () => {
    const meta = midSyncMeta({
      kind: 'go_nogo',
      seatId: 'expert-intake',
      action: 'confirm',
    })
    assert.equal(meta.actor, 'agent')
    assert.equal(meta.syncPass, true)
    assert.doesNotMatch(meta.detail ?? '', /代理所|企业租户|请企业批准/)
  })

  it('figures and filing reuse draft_claims instead of a new key', () => {
    assert.equal(BUSINESS_MID_SYNC.figures_ready.handoffKey, 'draft_claims')
    assert.equal(BUSINESS_MID_SYNC.figures_ready.command, 'saveDraft')
    assert.equal(BUSINESS_MID_SYNC.file_authorize.command, 'authorizeFile')
    assert.equal(BUSINESS_MID_SYNC.file_authorize.handoffKey, 'draft_claims')
    assert.equal(BUSINESS_MID_SYNC.research_ready.handoffKey, 'research_report')
    assert.equal(BUSINESS_MID_SYNC.oa_strategy.prelude, 'analyzeAndSubmitOA')
  })

  it('figures_ready writes a readable handoff note via saveDraft on draft_claims', () => {
    const note = handoffNoteForConfirm({
      kind: 'figures_ready',
      artifactMarkdown: '## 附图\n\n图1 系统框图',
      fallback: '确认附图',
    })
    const cmds = confirmCommands({
      kind: 'figures_ready',
      caseId: CASE_ID,
      note,
    })
    assert.deepEqual(cmds.map((c) => c.type), ['saveDraft'])
    assert.equal(handoffKeyOf(cmds[0]!), 'draft_claims')
    assert.match(noteOf(cmds[0]!) ?? '', /图1 系统框图/)
    assert.equal(BUSINESS_MID_SYNC.figures_ready.flowStepLabel, '生成清单')
  })

  it('return ends with requestChanges on the same handoff and caseId', () => {
    for (const kind of KINDS) {
      const cmds = returnCommands({
        kind,
        caseId: CASE_ID,
        note: '请补实施例',
      })
      const last = cmds[cmds.length - 1]!
      assert.equal(last.type, 'requestChanges', kind)
      assert.equal(handoffKeyOf(last), BUSINESS_MID_SYNC[kind].handoffKey)
      if ('caseId' in last) assert.equal(last.caseId, CASE_ID)
      if (last.type === 'requestChanges') assert.equal(last.annotation, '请补实施例')
    }
  })

  it('a finished confirm reports 已通过 rather than a submit-only write', async () => {
    const result = await runConfirmCommands(
      confirmCommands({
        kind: 'go_nogo',
        caseId: CASE_ID,
        note: '确认立项',
      }),
      async () => ({ ok: true, message: 'ok' }),
      midSyncMeta({
        kind: 'go_nogo',
        seatId: 'expert-intake',
        action: 'confirm',
      }),
    )
    assert.equal(result.ok, true)
    assert.equal(result.message, '已通过')
    assert.deepEqual(result.applied, ['submitHandoff', 'startReview', 'confirmQuote'])
  })

  it('confirm dispatch stops on failure and does not pretend later steps ran', async () => {
    const seen: DomainCommand[] = []
    const meta = midSyncMeta({
      kind: 'go_nogo',
      seatId: 'expert-intake',
      action: 'confirm',
    })
    assert.equal(meta.actor, 'agent')
    assert.equal(meta.agentId, 'expert-intake')
    const result = await runConfirmCommands(
      confirmCommands({
        kind: 'go_nogo',
        caseId: CASE_ID,
        note: '确认立项',
      }),
      async (cmd) => {
        seen.push(cmd)
        if (cmd.type === 'startReview') return { ok: false, message: '审核未开' }
        return { ok: true, message: 'ok' }
      },
      meta,
    )
    assert.equal(result.ok, false)
    assert.equal(result.message, '审核未开')
    assert.deepEqual(
      seen.map((c) => c.type),
      ['submitHandoff', 'startReview'],
    )
    assert.equal(seen[0] && 'caseId' in seen[0] ? seen[0].caseId : '', CASE_ID)
  })

  it('return still dispatches requestChanges after a failed submit prelude', async () => {
    const seen: string[] = []
    const result = await runReturnCommands(
      returnCommands({
        kind: 'research_ready',
        caseId: CASE_ID,
        note: '请再查一轮',
      }),
      async (cmd) => {
        seen.push(cmd.type)
        if (cmd.type === 'submitResearch') return { ok: false, message: '已提交' }
        return { ok: true, message: '已退回' }
      },
      midSyncMeta({
        kind: 'research_ready',
        seatId: 'expert-research',
        action: 'return',
      }),
    )
    assert.equal(result.ok, true)
    assert.deepEqual(seen, ['submitResearch', 'requestChanges'])
  })

  it('new case draft keeps the business caseId and a mid stage', () => {
    const draft = midCaseDraftFromWizard({
      id: CASE_ID,
      title: '热失控预警',
      summary: '双阈值',
      stageId: 'intake',
    })
    assert.equal(draft.id, CASE_ID)
    assert.equal(draft.stage, 'decision')
    assert.equal(draft.fulfillmentMode, 'self_serve')
    assert.match(draft.summary, /双阈值/)
    assert.equal(
      midCaseDraftFromWizard({
        id: 'proj-oa',
        title: '答复',
        stageId: 'oa',
      }).stage,
      'prosecution',
    )
  })

  it('projects main-chain progress onto flow step indexes', () => {
    let prog: MainChainSnapshot = {
      stageId: 'intake',
      doneSeatIds: [],
      completedStages: [],
      filed: false,
      oaRound: 0,
      researchPass: 0,
    }
    const intakeAtStart = projectBusinessFlow(prog)
    assert.equal(
      intakeAtStart.find((r) => r.flowKey === 'intake')?.stepIndex,
      0,
    )

    const chain: BusinessConfirmKind[] = [
      'go_nogo',
      'disclosure_ready',
      'research_ready',
      'claims_ready',
      'research_ready',
      'figures_ready',
      'file_authorize',
      'oa_strategy',
    ]
    for (const kind of chain) prog = applyMainChainConfirm(prog, kind)

    const flow = projectBusinessFlow(prog)
    const byKey = Object.fromEntries(flow.map((r) => [r.flowKey, r.stepIndex]))
    assert.equal(byKey.intake, stepsForFlow('intake').length)
    assert.equal(byKey.research, stepsForFlow('research').length)
    assert.equal(byKey.draft, stepsForFlow('draft').length)
    assert.equal(byKey.prosecution, stepsForFlow('prosecution').length)

    const afterDisclosure = applyMainChainConfirm(
      {
        stageId: 'intake',
        doneSeatIds: ['expert-intake'],
        completedStages: ['prepare', 'intake'],
        filed: false,
        oaRound: 0,
        researchPass: 0,
      },
      'disclosure_ready',
    )
    const draftRow = projectBusinessFlow(afterDisclosure).find(
      (r) => r.flowKey === 'draft',
    )
    assert.equal(
      draftRow?.stepIndex,
      stepsForFlow('draft').indexOf('权利要求树'),
    )
  })
})
