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
  /**
   * Opt-in 增强遥测（signals-and-telemetry §2）。
   * 默认关；heap 永不经此旗标开启。
   * - 'network'：轻量失败/慢请求摘要
   */
  enhancedTelemetry?: 'network'
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


/** 轻量 Network 失败条目（增强档；可选） */
export type NetworkFailure = {
  url: string
  method: string
  reason: string
  status?: number
}

/** 轻量 Network 摘要 / step delta（增强档；可选） */
export type NetworkSummary = {
  failedCount: number
  /** 耗时 >2s 的请求数 */
  slowCount: number
  /** 本窗口内观察到的请求数（可选） */
  requestCount?: number
  failures: NetworkFailure[]
}

/** 报告级遥测元信息（可选，不破 schemaVersion 1.0） */
export type HuntTelemetryMeta = {
  mode: 'network'
  /** 对齐 signals-and-telemetry：heap 默认关 */
  heap: false
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
  /** 增强档 Network delta（opt-in） */
  networkDelta?: NetworkSummary
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
    /** 增强档 Network 汇总（opt-in） */
    network?: NetworkSummary
  }
  casePackId: string
  steps: StepRecord[]
  findings: Finding[]
  /** 增强遥测元信息（可选；heap 恒 false） */
  telemetry?: HuntTelemetryMeta
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
