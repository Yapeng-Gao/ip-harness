/** AgentLoop：observe → decide → act → judge + maxSteps / 去重 / 中止 */

import type { Page } from 'playwright'
import { decide as adapterDecide } from './adapter/ip-harness.js'
import { CheapSignalCollector } from './cheap-signals.js'
import type { PlaywrightDriver } from './driver.js'
import { observe } from './observer.js'
import {
  actionFingerprint,
  describeActionTarget,
  severityForSignal,
} from './rules.js'
import type {
  AbortReason,
  AgentReasoning,
  CasePack,
  CheckpointId,
  DriverAction,
  Finding,
  HuntReport,
  JudgeResult,
  Observation,
  StepRecord,
} from './types.js'


function serializeAction(action: DriverAction): DriverAction {
  const clone = { ...action } as Record<string, unknown>
  for (const k of Object.keys(clone)) {
    const v = clone[k]
    if (v instanceof RegExp) clone[k] = v.toString()
  }
  return clone as DriverAction
}


function ruleReasoning(
  obs: Observation,
  judgement: string,
  basis: string,
): AgentReasoning {
  const digest = [
    `url=${obs.url}`,
    `next=${obs.nextCheckpointId ?? 'none'}`,
    `reached=${obs.reachedCheckpoints.join(',') || 'none'}`,
  ].join('; ')
  return {
    observation_digest: digest.slice(0, 240),
    judgement,
    judgement_basis: basis.startsWith('rule:') ? basis : `rule:${basis}`,
  }
}

export type LoopOptions = {
  driver: PlaywrightDriver
  page: Page
  pack: CasePack
  artifactsDir: string
  runId: string
  adapterId: string
  maxSteps?: number
  stalledLimit?: number
  loopLimit?: number
}

function judgeStep(opts: {
  obs: Observation
  prevReached: string[]
  action: DriverAction
  actOk: boolean
  actError?: string
  pack: CasePack
}): JudgeResult {
  const { obs, action, actOk, actError, pack } = opts
  const findings: JudgeResult['findings'] = []

  if (!actOk) {
    findings.push({
      severity: 'fail_hard',
      title: `动作失败: ${action.type}`,
      category: 'driver-act',
      evidence: {
        steps: [],
        screenshots: [obs.screenshotRel],
        logs: [actError ?? 'act failed'],
        repro: [`${action.type} ${describeActionTarget(action)}`],
      },
    })
    return { verdict: 'fail_hard', note: actError, findings }
  }

  for (const sig of obs.signals) {
    const sev = severityForSignal(sig)
    if (!sev) continue
    findings.push({
      severity: sev,
      title: `${sig.kind}: ${sig.text.slice(0, 80)}`,
      category: sig.kind,
      evidence: {
        steps: [],
        screenshots: [obs.screenshotRel],
        logs: [`${sig.kind}: ${sig.text}`],
        repro: [],
      },
    })
  }

  if (findings.some((f) => f.severity === 'fail_hard')) {
    return { verdict: 'fail_hard', findings }
  }
  if (findings.some((f) => f.severity === 'suspect')) {
    return { verdict: 'suspect', findings }
  }

  if (action.type === 'stop') {
    return { verdict: 'stop', note: action.reason }
  }

  // Goal complete
  const allDone = pack.checkpoints.every((c) => obs.reachedCheckpoints.includes(c.id))
  if (allDone) {
    return { verdict: 'stop', note: 'success' }
  }

  return { verdict: 'pass_step' }
}

export async function runAgentLoop(opts: LoopOptions): Promise<HuntReport> {
  const {
    driver,
    page,
    pack,
    artifactsDir,
    runId,
    adapterId,
  } = opts
  const maxSteps = opts.maxSteps ?? pack.maxSteps ?? 12
  const stalledLimit = opts.stalledLimit ?? 3
  const loopLimit = opts.loopLimit ?? 2
  const abortOnHard = pack.abortOnHard ?? true

  const signals = new CheapSignalCollector()
  signals.attach(page)

  const startedAt = new Date().toISOString()
  const steps: StepRecord[] = []
  const findings: Finding[] = []
  let findingSeq = 0
  const fingerprintCounts = new Map<string, number>()
  let everReached: CheckpointId[] = []
  let lastCheckpointKey = ''
  let stalledStreak = 0
  let stopReason: AbortReason | string = 'budget_exceeded'
  let summaryStatus: HuntReport['summary']['status'] = 'aborted'

  // Bootstrap: goto baseURL first if needed
  let bootstrapped = false

  for (let i = 1; i <= maxSteps; i++) {
    // Drain pre-step noise then observe
    const preSignals = signals.drain()
    const obs = await observe({
      page,
      pack,
      stepIndex: i,
      artifactsDir,
      signals: preSignals.filter((s) => !s.whitelisted),
      previouslyReached: everReached,
    })
    everReached = obs.reachedCheckpoints

    // Progress tracking
    const cpKey = obs.reachedCheckpoints.join(',')
    if (cpKey === lastCheckpointKey && bootstrapped) {
      stalledStreak += 1
    } else {
      stalledStreak = 0
      lastCheckpointKey = cpKey
    }

    if (stalledStreak >= stalledLimit) {
      stopReason = 'stalled'
      summaryStatus = 'aborted'
      steps.push({
        i,
        url: obs.url,
        action: { type: 'stop', reason: 'stalled' },
        signals: obs.signals,
        screenshot: obs.screenshotRel,
        a11ySummary: obs.a11ySummary.slice(0, 20),
        judge: 'stop',
        checkpointId: obs.nextCheckpointId,
        note: 'stalled: no checkpoint progress',
        agent_reasoning: ruleReasoning(obs, 'stop', 'stalled'),
      })
      break
    }

    // Goal already met on observe
    const allDone = pack.checkpoints.every((c) => obs.reachedCheckpoints.includes(c.id))
    if (allDone && bootstrapped) {
      stopReason = 'success'
      summaryStatus = findings.some((f) => f.severity === 'fail_hard')
        ? 'failed'
        : findings.some((f) => f.severity === 'suspect')
          ? 'suspect'
          : 'passed'
      steps.push({
        i,
        url: obs.url,
        action: { type: 'stop', reason: 'success' },
        signals: obs.signals,
        screenshot: obs.screenshotRel,
        a11ySummary: obs.a11ySummary.slice(0, 20),
        judge: 'stop',
        checkpointId: null,
        note: 'all checkpoints reached',
        agent_reasoning: ruleReasoning(obs, 'stop', `${pack.id}:success`),
      })
      break
    }

    let decision = adapterDecide(obs, pack)
    if (!bootstrapped && decision.kind === 'stop') {
      decision = { kind: 'action', action: { type: 'goto', url: pack.baseURL } }
    }
    if (!bootstrapped) bootstrapped = true

    if (decision.kind === 'stop') {
      stopReason = decision.reason
      summaryStatus =
        decision.reason === 'success'
          ? findings.length === 0
            ? 'passed'
            : findings.some((f) => f.severity === 'fail_hard')
              ? 'failed'
              : 'suspect'
          : 'aborted'
      steps.push({
        i,
        url: obs.url,
        action: { type: 'stop', reason: decision.reason },
        signals: obs.signals,
        screenshot: obs.screenshotRel,
        a11ySummary: obs.a11ySummary.slice(0, 20),
        judge: 'stop',
        checkpointId: obs.nextCheckpointId,
        note: decision.reason,
        agent_reasoning: ruleReasoning(obs, 'stop', `${pack.id}:${decision.reason}`),
      })
      break
    }

    const action = decision.action
    const target = describeActionTarget(action)
    const urlPath = (() => {
      try {
        return new URL(obs.url).pathname
      } catch {
        return obs.url
      }
    })()
    const fp = actionFingerprint(
      action.type,
      target,
      urlPath,
      obs.nextCheckpointId ?? '',
    )
    const fpCount = (fingerprintCounts.get(fp) ?? 0) + 1
    fingerprintCounts.set(fp, fpCount)
    if (fpCount > loopLimit) {
      stopReason = 'loop_detected'
      summaryStatus = 'aborted'
      steps.push({
        i,
        url: obs.url,
        action: { type: 'stop', reason: 'loop_detected' },
        signals: obs.signals,
        screenshot: obs.screenshotRel,
        a11ySummary: obs.a11ySummary.slice(0, 20),
        judge: 'stop',
        checkpointId: obs.nextCheckpointId,
        note: `loop fingerprint ${fp}`,
        agent_reasoning: ruleReasoning(obs, 'stop', 'loop_detected'),
      })
      break
    }

    const actResult = await driver.act(action)
    // Allow UI settle (search shell has ~280–450ms fake delay)
    if (action.type === 'click') {
      await page.waitForTimeout(900)
    } else if (action.type !== 'wait' && action.type !== 'stop') {
      await page.waitForTimeout(250)
    }
    const postSignals = signals.drain().filter((s) => !s.whitelisted)
    const postObs = await observe({
      page,
      pack,
      stepIndex: i,
      artifactsDir,
      signals: postSignals,
      previouslyReached: everReached,
    })
    everReached = postObs.reachedCheckpoints
    // overwrite screenshot with post-act
    const mergedObs: Observation = {
      ...postObs,
      signals: postSignals,
    }

    const judged = judgeStep({
      obs: mergedObs,
      prevReached: obs.reachedCheckpoints,
      action,
      actOk: actResult.ok,
      actError: actResult.error,
      pack,
    })

    if (judged.findings) {
      for (const f of judged.findings) {
        findingSeq += 1
        findings.push({
          ...f,
          id: `F${findingSeq}`,
          evidence: {
            ...f.evidence,
            steps: [i],
          },
        })
      }
    }

    steps.push({
      i,
      url: mergedObs.url,
      action: serializeAction(action),
      signals: mergedObs.signals,
      screenshot: mergedObs.screenshotRel,
      a11ySummary: mergedObs.a11ySummary.slice(0, 20),
      judge: judged.verdict,
      checkpointId: mergedObs.nextCheckpointId,
      note: judged.note,
      agent_reasoning: ruleReasoning(
        mergedObs,
        judged.verdict,
        `${pack.id}:${obs.nextCheckpointId ?? 'act'}→${action.type}`,
      ),
    })

    if (judged.verdict === 'fail_hard' && abortOnHard) {
      stopReason = 'abort_on_hard'
      summaryStatus = 'failed'
      break
    }

    if (judged.verdict === 'stop' || action.type === 'stop') {
      stopReason = judged.note ?? 'manual_stop'
      summaryStatus =
        stopReason === 'success'
          ? findings.length === 0
            ? 'passed'
            : findings.some((f) => f.severity === 'fail_hard')
              ? 'failed'
              : 'suspect'
          : 'aborted'
      break
    }

    // Check success after act
    if (pack.checkpoints.every((c) => mergedObs.reachedCheckpoints.includes(c.id))) {
      stopReason = 'success'
      summaryStatus =
        findings.length === 0
          ? 'passed'
          : findings.some((f) => f.severity === 'fail_hard')
            ? 'failed'
            : 'suspect'
      break
    }

    if (i === maxSteps) {
      stopReason = 'budget_exceeded'
      summaryStatus = 'aborted'
    }
  }

  // Final status refinement
  if (stopReason === 'success' && summaryStatus === 'aborted') {
    summaryStatus = findings.length === 0 ? 'passed' : 'suspect'
  }
  if (findings.some((f) => f.severity === 'fail_hard')) {
    summaryStatus = 'failed'
  } else if (
    summaryStatus === 'passed' &&
    findings.some((f) => f.severity === 'suspect')
  ) {
    summaryStatus = 'suspect'
  }

  const finishedAt = new Date().toISOString()
  return {
    schemaVersion: '1.0',
    runId,
    adapterId,
    driver: 'playwright',
    startedAt,
    finishedAt,
    summary: {
      status: summaryStatus,
      steps: steps.length,
      findings: {
        fail_hard: findings.filter((f) => f.severity === 'fail_hard').length,
        suspect: findings.filter((f) => f.severity === 'suspect').length,
      },
      stopReason: String(stopReason),
    },
    casePackId: pack.id,
    steps,
    findings,
  }
}
