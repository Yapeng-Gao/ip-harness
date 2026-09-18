/** e2e-hunt shared types — Driver ≤10 actions, report contract aligned. */

export type DriverKind = 'playwright' | 'cursor-browser'

export type ActionType =
  | 'goto'
  | 'click'
  | 'fill'
  | 'scroll'
  | 'wait'
  | 'snapshot'
  | 'stop'

export type DriverAction =
  | { type: 'goto'; url: string }
  | {
      type: 'click'
      role?: string
      name?: string | RegExp
      testId?: string
      /** nth match when multiple (0-based) */
      nth?: number
    }
  | {
      type: 'fill'
      value: string
      role?: string
      name?: string | RegExp
      testId?: string
      label?: string
      placeholder?: string
    }
  | { type: 'scroll'; direction: 'up' | 'down' | 'top' | 'bottom'; amount?: number }
  | { type: 'wait'; ms?: number; selector?: string; role?: string; name?: string | RegExp }
  | { type: 'snapshot' }
  | { type: 'stop'; reason: string }

export type SignalKind = 'console' | 'pageerror' | 'requestfailed'

export type CheapSignal = {
  kind: SignalKind
  level?: string
  text: string
  url?: string
  at: string
  whitelisted?: boolean
}

export type CheckpointId = string

export type Checkpoint = {
  id: CheckpointId
  label: string
  /** How observer verifies this checkpoint was reached */
  assert: CheckpointAssert
}

export type CheckpointAssert =
  | { kind: 'heading'; name: string | RegExp }
  | { kind: 'role'; role: string; name?: string | RegExp }
  | { kind: 'text'; text: string | RegExp }
  | { kind: 'url'; includes: string }
  | { kind: 'custom'; id: string }

export type CasePack = {
  id: string
  title: string
  baseURL: string
  query?: string
  checkpoints: Checkpoint[]
  maxSteps?: number
  abortOnHard?: boolean
  /** Optional seed actions before rule decide takes over */
  allowedActionsNote?: string
}

export type A11yNodeSummary = {
  role: string
  name: string
}

export type Observation = {
  url: string
  title: string
  screenshotRel: string
  a11ySummary: A11yNodeSummary[]
  a11yText: string
  signals: CheapSignal[]
  reachedCheckpoints: CheckpointId[]
  nextCheckpointId: CheckpointId | null
  pageTextSnippet: string
}

export type JudgeVerdict = 'pass_step' | 'suspect' | 'fail_hard' | 'stop'

/** L7 轻量留痕（§3.2）；可选，不破 schemaVersion 1.0 */
export type AgentReasoning = {
  observation_digest: string
  judgement: string
  judgement_basis: string
}

export type StepRecord = {
  i: number
  url: string
  action: DriverAction
  signals: CheapSignal[]
  screenshot: string
  a11ySummary?: A11yNodeSummary[]
  judge: JudgeVerdict
  checkpointId?: CheckpointId | null
  note?: string
  /** 规则短路可填 judgement_basis: "rule:…" */
  agent_reasoning?: AgentReasoning
}

export type FindingSeverity = 'fail_hard' | 'suspect'

export type Finding = {
  id: string
  severity: FindingSeverity
  title: string
  category: string
  evidence: {
    steps: number[]
    screenshots: string[]
    logs: string[]
    repro: string[]
  }
}

export type RunSummaryStatus = 'passed' | 'failed' | 'suspect' | 'aborted'

export type HuntReport = {
  schemaVersion: '1.0'
  runId: string
  adapterId: string
  driver: DriverKind
  startedAt: string
  finishedAt: string
  summary: {
    status: RunSummaryStatus
    steps: number
    findings: { fail_hard: number; suspect: number }
    stopReason?: string
  }
  casePackId: string
  steps: StepRecord[]
  findings: Finding[]
}

export type DecideResult =
  | { kind: 'action'; action: DriverAction }
  | { kind: 'stop'; reason: string }

export type JudgeResult = {
  verdict: JudgeVerdict
  note?: string
  findings?: Omit<Finding, 'id'>[]
}

export type AbortReason =
  | 'success'
  | 'budget_exceeded'
  | 'stalled'
  | 'loop_detected'
  | 'abort_on_hard'
  | 'manual_stop'
