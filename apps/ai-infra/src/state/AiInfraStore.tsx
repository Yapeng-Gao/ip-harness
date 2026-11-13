import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useReducer,
  useState,
  type ReactNode,
} from 'react'
import { createInitialState, readPublishedDatasets, type DatasetSource } from './seed'
import type {
  AiInfraState,
  Alert,
  Endpoint,
  Job,
  JobKind,
  LoadTestReport,
  ModelStage,
  PipelinePublishEffect,
  PipelineRun,
  PublishedDataset,
} from './types'
import { jobDatasetPin, poolForQueue, STAGE_ORDER } from './types'

function uid(prefix: string): string {
  return `${prefix}-${Math.random().toString(36).slice(2, 9)}-${Date.now().toString(36)}`
}

function iso(now = Date.now()): string {
  return new Date(now).toISOString()
}

function usedSlotsOnNode(state: AiInfraState, nodeId: string): number {
  return state.jobs
    .filter((j) => j.status === 'running' && j.assignedNodeId === nodeId)
    .reduce((sum, j) => sum + j.gpuSlots, 0)
}

function totalUsedSlots(state: AiInfraState): number {
  return state.jobs
    .filter((j) => j.status === 'running')
    .reduce((sum, j) => sum + j.gpuSlots, 0)
}

function totalSlots(state: AiInfraState): number {
  return state.gpuNodes.reduce((s, n) => s + n.totalSlots, 0)
}

function findSchedulableNode(
  state: AiInfraState,
  need: number,
  queue: string,
): string | null {
  const pool = poolForQueue(queue)
  for (const node of state.gpuNodes) {
    if (node.drained) continue
    if (node.pool !== pool) continue
    const used = usedSlotsOnNode(state, node.id)
    if (node.totalSlots - used >= need) return node.id
  }
  return null
}

/** 排队作业若本 pool 无容量，UI 提示「等待 pool=…」 */
export function poolWaitHint(state: AiInfraState, job: Job): string | null {
  if (job.status !== 'queued') return null
  if (findSchedulableNode(state, job.gpuSlots, job.queue)) return null
  return `等待 pool=${poolForQueue(job.queue)} 可调度节点`
}

function pickPublishRevision(
  state: AiInfraState,
  revisionId?: string,
): { modelId: string; modelName: string; revisionId: string; version: string; stage: ModelStage } | null {
  if (revisionId) {
    for (const m of state.models) {
      const r = m.revisions.find((x) => x.id === revisionId)
      if (r) {
        return {
          modelId: m.id,
          modelName: m.name,
          revisionId: r.id,
          version: r.version,
          stage: r.stage,
        }
      }
    }
  }
  for (const m of state.models) {
    const r = m.revisions.find((x) => x.stage !== 'prod')
    if (r) {
      return {
        modelId: m.id,
        modelName: m.name,
        revisionId: r.id,
        version: r.version,
        stage: r.stage,
      }
    }
  }
  const m = state.models[0]
  const r = m?.revisions[0]
  if (!m || !r) return null
  return {
    modelId: m.id,
    modelName: m.name,
    revisionId: r.id,
    version: r.version,
    stage: r.stage,
  }
}

export function previewPipelinePublish(
  state: AiInfraState,
  revisionId?: string,
  endpointId?: string,
): string {
  const picked = pickPublishRevision(state, revisionId)
  if (!picked) return '样机：无可用 revision，发布将只标记跑次完成（非真流量）。'
  const idx = STAGE_ORDER.indexOf(picked.stage)
  const next = idx >= 0 && idx < STAGE_ORDER.length - 1 ? STAGE_ORDER[idx + 1] : null
  const promote = next
    ? `晋级 ${picked.modelName} · ${picked.version}（${picked.stage}→${next}）`
    : `${picked.modelName} · ${picked.version} 已在 ${picked.stage}（不再晋级）`
  const ep = state.endpoints.find((e) => e.id === (endpointId || state.endpoints[0]?.id))
  const attach = ep ? `挂到 endpoint ${ep.name}` : '新建样机端点并挂上该 revision'
  return `样机：发布将${promote}，并${attach}（非真流量）。`
}

function pushAlert(
  state: AiInfraState,
  key: string,
  kind: Alert['kind'],
  message: string,
): AiInfraState {
  if (state.alertKeys.includes(key)) return state
  const alert: Alert = {
    id: uid('alert'),
    kind,
    message,
    createdAt: iso(state.now),
    status: 'open',
  }
  return {
    ...state,
    alerts: [alert, ...state.alerts],
    alertKeys: [...state.alertKeys, key],
  }
}

function maybeGpuHighAlert(state: AiInfraState): AiInfraState {
  const used = totalUsedSlots(state)
  const total = totalSlots(state)
  if (total <= 0) return state
  const util = used / total
  if (util >= 0.8) {
    return pushAlert(
      state,
      `gpu_high:${Math.floor(state.now / 60_000)}`,
      'gpu_high',
      `GPU 占用 ${used}/${total}（≥80%）`,
    )
  }
  return state
}

const LOG_LINES = [
  '初始化 worker…',
  '拉取数据集元数据（不读正文）…',
  '分配假 GPU slot…',
  'epoch 前进…',
  '写假 checkpoint 指针…',
  '校验 loss 曲线（示意）…',
  '同步指标到样机面板…',
]

function appendLog(job: Job, line: string): Job {
  const next = [...job.logs, `[${new Date().toLocaleTimeString('zh-CN', { hour12: false })}] ${line}`]
  return { ...job, logs: next.slice(-80) }
}

function computeLoadReport(concurrency: number, durationSec: number): LoadTestReport {
  const ttftMs = Math.round(80 + concurrency * 12 + Math.min(durationSec, 60) * 0.4)
  const tokensPerSec = Math.round(Math.max(8, 120 - concurrency * 3.5))
  const errorRate =
    Math.round(Math.min(0.45, Math.max(0.002, (concurrency - 20) * 0.008 + (concurrency > 40 ? 0.05 : 0))) * 1000) /
    1000
  return { ttftMs, tokensPerSec, errorRate }
}

export type CreateJobInput = {
  kind: JobKind
  name: string
  datasetId: string
  datasetVersion: string
  queue: string
  priority: number
  forceFail: boolean
  gpuSlots?: number
}

type Action =
  | { type: 'TICK'; now: number }
  | { type: 'CREATE_JOB'; input: CreateJobInput }
  | { type: 'CANCEL_JOB'; id: string }
  | { type: 'RETRY_JOB'; id: string }
  | { type: 'TOGGLE_DRAIN'; nodeId: string }
  | { type: 'REGISTER_MODEL'; name: string }
  | { type: 'ADD_REVISION'; modelId: string; version: string }
  | { type: 'PROMOTE_REVISION'; modelId: string; revisionId: string }
  | { type: 'DEPLOY_ENDPOINT'; name: string; modelRevisionId: string }
  | { type: 'SET_CANARY'; endpointId: string; pct: number; canaryRevisionId?: string | null }
  | { type: 'ROLLBACK_ENDPOINT'; endpointId: string }
  | { type: 'START_PIPELINE' }
  | { type: 'PIPELINE_GATE'; runId: string; pass: boolean }
  | { type: 'PIPELINE_PUBLISH'; runId: string; revisionId?: string; endpointId?: string }
  | { type: 'PIPELINE_RERUN_EVAL'; runId: string }
  | {
      type: 'START_LOADTEST'
      endpointId: string
      concurrency: number
      durationSec: number
    }
  | { type: 'ACK_ALERT'; id: string }
  | { type: 'SILENCE_ALERT'; id: string }

function tickJobs(state: AiInfraState, now: number): AiInfraState {
  let next: AiInfraState = { ...state, now, jobs: [...state.jobs] }
  const jobs = next.jobs

  // Schedule queued → running (priority desc, then older first)
  const queued = jobs
    .map((j, i) => ({ j, i }))
    .filter(({ j }) => j.status === 'queued')
    .sort((a, b) => b.j.priority - a.j.priority || a.j.queuedSince - b.j.queuedSince)

  for (const { j, i } of queued) {
    // short delay before schedule (~1.2s)
    if (now - j.queuedSince < 1200) continue
    const nodeId = findSchedulableNode(next, j.gpuSlots, j.queue)
    if (!nodeId) continue
    const pool = poolForQueue(j.queue)
    const started: Job = appendLog(
      {
        ...j,
        status: 'running',
        assignedNodeId: nodeId,
        startedAt: now,
        progress: Math.max(j.progress, 1),
      },
      `调度到 ${nodeId}（pool=${pool} · ${j.gpuSlots} slot）`,
    )
    jobs[i] = started
    next = { ...next, jobs: [...jobs] }
  }

  // Advance running
  for (let i = 0; i < jobs.length; i++) {
    const j = jobs[i]!
    if (j.status !== 'running') continue
    const step = j.kind === 'train' ? 4 + (j.priority % 3) : 6 + (j.priority % 4)
    const progress = Math.min(100, j.progress + step)
    let updated = appendLog(j, LOG_LINES[Math.floor(progress / 15) % LOG_LINES.length]!)
    updated = { ...updated, progress }

    if (progress >= 100) {
      const fail = updated.forceFail || /fail/i.test(updated.name)
      if (fail) {
        updated = appendLog(
          {
            ...updated,
            status: 'failed',
            progress: Math.min(progress, 99),
            assignedNodeId: null,
          },
          '作业失败（样机注入）',
        )
        jobs[i] = updated
        next = pushAlert(
          { ...next, jobs: [...jobs] },
          `job_failed:${updated.id}`,
          'job_failed',
          `作业 ${updated.name} 失败`,
        )
        // keep jobs ref in sync for subsequent iterations
        for (let k = 0; k < jobs.length; k++) jobs[k] = next.jobs[k]!
        continue
      }
      updated = appendLog(
        { ...updated, status: 'succeeded', progress: 100, assignedNodeId: null },
        '作业成功（示意）',
      )
    }
    jobs[i] = updated
  }

  next = { ...next, jobs: [...jobs] }
  next = maybeGpuHighAlert(next)
  return next
}

function tickPipelines(state: AiInfraState, now: number): AiInfraState {
  const runs = state.pipelineRuns.map((run) => {
    if (run.finished) return run
    const steps = run.steps.map((s) => ({ ...s }))
    const train = steps.find((s) => s.key === 'train')
    const evalStep = steps.find((s) => s.key === 'eval')
    if (!train || !evalStep) return run

    if (train.status === 'running') {
      // complete train after a tick
      train.status = 'succeeded'
      evalStep.status = 'blocked'
      return { ...run, steps, blockedAtGate: true }
    }
    if (train.status === 'pending') {
      train.status = 'running'
      return { ...run, steps }
    }
    return run
  })
  return { ...state, now, pipelineRuns: runs }
}

function tickLoadTests(state: AiInfraState, now: number): AiInfraState {
  const loadTests = state.loadTests.map((lt) => {
    if (lt.status !== 'running') return lt
    const elapsed = now - (lt.startedAt ?? now)
    const totalMs = Math.max(2000, lt.durationSec * 200) // sped-up demo
    const progress = Math.min(100, Math.round((elapsed / totalMs) * 100))
    if (progress >= 100) {
      return {
        ...lt,
        status: 'succeeded' as const,
        progress: 100,
        report: computeLoadReport(lt.concurrency, lt.durationSec),
      }
    }
    return { ...lt, progress }
  })
  return { ...state, now, loadTests }
}

function reducer(state: AiInfraState, action: Action): AiInfraState {
  switch (action.type) {
    case 'TICK': {
      let next = tickJobs(state, action.now)
      next = tickPipelines(next, action.now)
      next = tickLoadTests(next, action.now)
      return next
    }
    case 'CREATE_JOB': {
      const { input } = action
      const now = Date.now()
      const pin = jobDatasetPin({
        datasetId: input.datasetId,
        datasetVersion: input.datasetVersion,
      })
      const job: Job = {
        id: uid('job'),
        kind: input.kind,
        name: input.name.trim() || `${input.kind}-${Date.now().toString(36)}`,
        datasetId: input.datasetId,
        datasetVersion: input.datasetVersion,
        queue: input.queue,
        priority: input.priority,
        status: 'queued',
        progress: 0,
        createdAt: iso(now),
        logs: [
          `[create] 已入队 · 数据集 ${pin} · queue=${input.queue}→pool=${poolForQueue(input.queue)}`,
        ],
        gpuSlots: input.gpuSlots ?? (input.kind === 'train' ? 2 : 1),
        forceFail: input.forceFail || /fail/i.test(input.name),
        assignedNodeId: null,
        queuedSince: now,
        startedAt: null,
      }
      return { ...state, jobs: [job, ...state.jobs], now }
    }
    case 'CANCEL_JOB': {
      const jobs = state.jobs.map((j) => {
        if (j.id !== action.id) return j
        if (j.status !== 'queued' && j.status !== 'running') return j
        return appendLog(
          { ...j, status: 'cancelled', assignedNodeId: null },
          '用户取消',
        )
      })
      return maybeGpuHighAlert({ ...state, jobs })
    }
    case 'RETRY_JOB': {
      const origin = state.jobs.find((j) => j.id === action.id)
      if (!origin || origin.status !== 'failed') return state
      const now = Date.now()
      const job: Job = {
        ...origin,
        id: uid('job'),
        status: 'queued',
        progress: 0,
        createdAt: iso(now),
        logs: [`[retry] 自 ${origin.id} 重试`],
        assignedNodeId: null,
        queuedSince: now,
        startedAt: null,
        // keep forceFail so demo fail path still works unless user renames
      }
      // clear prior fail alert key so new fail can alert again
      const alertKeys = state.alertKeys.filter((k) => k !== `job_failed:${job.id}`)
      return { ...state, jobs: [job, ...state.jobs], alertKeys, now }
    }
    case 'TOGGLE_DRAIN': {
      const gpuNodes = state.gpuNodes.map((n) =>
        n.id === action.nodeId ? { ...n, drained: !n.drained } : n,
      )
      return { ...state, gpuNodes }
    }
    case 'REGISTER_MODEL': {
      const name = action.name.trim()
      if (!name) return state
      if (state.models.some((m) => m.name === name)) return state
      return {
        ...state,
        models: [
          ...state.models,
          {
            id: uid('mf'),
            name,
            revisions: [{ id: uid('rev'), version: 'v0.1', stage: 'registered' }],
          },
        ],
      }
    }
    case 'ADD_REVISION': {
      const models = state.models.map((m) => {
        if (m.id !== action.modelId) return m
        const version = action.version.trim() || `v${m.revisions.length + 1}.0`
        return {
          ...m,
          revisions: [
            { id: uid('rev'), version, stage: 'registered' as const },
            ...m.revisions,
          ],
        }
      })
      return { ...state, models }
    }
    case 'PROMOTE_REVISION': {
      const models = state.models.map((m) => {
        if (m.id !== action.modelId) return m
        return {
          ...m,
          revisions: m.revisions.map((r) => {
            if (r.id !== action.revisionId) return r
            const idx = STAGE_ORDER.indexOf(r.stage)
            if (idx < 0 || idx >= STAGE_ORDER.length - 1) return r
            const nextStage = STAGE_ORDER[idx + 1] as ModelStage
            return { ...r, stage: nextStage }
          }),
        }
      })
      return { ...state, models }
    }
    case 'DEPLOY_ENDPOINT': {
      const name = action.name.trim()
      if (!name || !action.modelRevisionId) return state
      const ep: Endpoint = {
        id: uid('ep'),
        name,
        modelRevisionId: action.modelRevisionId,
        canaryRevisionId: null,
        trafficCanaryPct: 0,
        status: 'published',
      }
      return { ...state, endpoints: [ep, ...state.endpoints] }
    }
    case 'SET_CANARY': {
      const endpoints = state.endpoints.map((e) => {
        if (e.id !== action.endpointId) return e
        const pct = Math.max(0, Math.min(100, action.pct))
        const canaryRevisionId =
          action.canaryRevisionId !== undefined
            ? action.canaryRevisionId
            : e.canaryRevisionId ?? e.modelRevisionId
        return {
          ...e,
          trafficCanaryPct: pct,
          canaryRevisionId: pct > 0 ? canaryRevisionId : null,
          status: pct > 0 ? ('canary' as const) : ('published' as const),
        }
      })
      return { ...state, endpoints }
    }
    case 'ROLLBACK_ENDPOINT': {
      const endpoints = state.endpoints.map((e) => {
        if (e.id !== action.endpointId) return e
        // one-click: zero canary traffic; keep stable revision
        return {
          ...e,
          trafficCanaryPct: 0,
          canaryRevisionId: null,
          status: 'published' as const,
        }
      })
      return { ...state, endpoints }
    }
    case 'START_PIPELINE': {
      const now = Date.now()
      const run: PipelineRun = {
        id: uid('pipe'),
        template: '训练→评测门禁→发布',
        createdAt: iso(now),
        blockedAtGate: false,
        finished: false,
        steps: [
          { id: uid('ps'), key: 'train', label: '训练', status: 'pending' },
          { id: uid('ps'), key: 'eval', label: '评测门禁', status: 'pending' },
          { id: uid('ps'), key: 'publish', label: '发布', status: 'pending' },
        ],
      }
      return { ...state, pipelineRuns: [run, ...state.pipelineRuns], now }
    }
    case 'PIPELINE_GATE': {
      const pipelineRuns = state.pipelineRuns.map((run) => {
        if (run.id !== action.runId || run.finished) return run
        const steps = run.steps.map((s) => ({ ...s }))
        const evalStep = steps.find((s) => s.key === 'eval')
        const publish = steps.find((s) => s.key === 'publish')
        if (!evalStep || evalStep.status !== 'blocked') return run
        if (action.pass) {
          evalStep.status = 'succeeded'
          if (publish) publish.status = 'pending'
          return { ...run, steps, blockedAtGate: false }
        }
        evalStep.status = 'failed'
        if (publish) publish.status = 'pending'
        return { ...run, steps, blockedAtGate: false, finished: true }
      })
      return { ...state, pipelineRuns }
    }
    case 'PIPELINE_PUBLISH': {
      const run = state.pipelineRuns.find((r) => r.id === action.runId)
      if (!run || run.finished) return state
      const evalOk = run.steps.find((s) => s.key === 'eval')?.status === 'succeeded'
      if (!evalOk) return state

      const picked = pickPublishRevision(state, action.revisionId)
      let models = state.models
      let fromStage: ModelStage | null = null
      let toStage: ModelStage | null = null
      if (picked) {
        fromStage = picked.stage
        const idx = STAGE_ORDER.indexOf(picked.stage)
        if (idx >= 0 && idx < STAGE_ORDER.length - 1) {
          toStage = STAGE_ORDER[idx + 1] as ModelStage
          models = state.models.map((m) => {
            if (m.id !== picked.modelId) return m
            return {
              ...m,
              revisions: m.revisions.map((r) =>
                r.id === picked.revisionId ? { ...r, stage: toStage! } : r,
              ),
            }
          })
        }
      }

      let endpoints = state.endpoints
      let endpointId = ''
      let endpointName = ''
      if (picked) {
        const targetId = action.endpointId || state.endpoints[0]?.id
        if (targetId) {
          endpoints = state.endpoints.map((e) =>
            e.id === targetId ? { ...e, modelRevisionId: picked.revisionId } : e,
          )
          const ep = endpoints.find((e) => e.id === targetId)
          endpointId = targetId
          endpointName = ep?.name ?? targetId
        } else {
          const ep: Endpoint = {
            id: uid('ep'),
            name: `pipe-pub-${run.id.slice(-4)}`,
            modelRevisionId: picked.revisionId,
            canaryRevisionId: null,
            trafficCanaryPct: 0,
            status: 'published',
          }
          endpoints = [ep, ...state.endpoints]
          endpointId = ep.id
          endpointName = ep.name
        }
      }

      const revLabel = picked ? `${picked.modelName} · ${picked.version}` : ''
      const promoteBit = picked
        ? toStage
          ? `已晋级 revision ${revLabel} ${fromStage}→${toStage}`
          : `revision ${revLabel} 已在 ${fromStage}（未再晋级）`
        : '无可用 revision'
      const attachBit = endpointName ? `已挂到 endpoint ${endpointName}` : ''
      const note = `样机：${promoteBit}${attachBit ? ` / ${attachBit}` : ''}（非真流量）`
      const publishEffect: PipelinePublishEffect | undefined = picked
        ? {
            revisionId: picked.revisionId,
            revisionLabel: revLabel,
            fromStage,
            toStage,
            endpointId,
            endpointName,
            note,
          }
        : { revisionId: '', revisionLabel: '', fromStage: null, toStage: null, endpointId: '', endpointName: '', note }

      const pipelineRuns = state.pipelineRuns.map((r) => {
        if (r.id !== action.runId) return r
        const steps = r.steps.map((s) =>
          s.key === 'publish' ? { ...s, status: 'succeeded' as const } : s,
        )
        return { ...r, steps, finished: true, blockedAtGate: false, publishEffect }
      })
      return { ...state, models, endpoints, pipelineRuns }
    }
    case 'PIPELINE_RERUN_EVAL': {
      const pipelineRuns = state.pipelineRuns.map((run) => {
        if (run.id !== action.runId) return run
        const steps = run.steps.map((s) => {
          if (s.key === 'eval') return { ...s, status: 'blocked' as const }
          if (s.key === 'publish') return { ...s, status: 'pending' as const }
          return s
        })
        return { ...run, steps, blockedAtGate: true, finished: false }
      })
      return { ...state, pipelineRuns }
    }
    case 'START_LOADTEST': {
      const now = Date.now()
      return {
        ...state,
        now,
        loadTests: [
          {
            id: uid('lt'),
            endpointId: action.endpointId,
            concurrency: action.concurrency,
            durationSec: action.durationSec,
            status: 'running',
            progress: 0,
            createdAt: iso(now),
            startedAt: now,
          },
          ...state.loadTests,
        ],
      }
    }
    case 'ACK_ALERT': {
      return {
        ...state,
        alerts: state.alerts.map((a) =>
          a.id === action.id ? { ...a, status: 'acked' as const } : a,
        ),
      }
    }
    case 'SILENCE_ALERT': {
      return {
        ...state,
        alerts: state.alerts.map((a) =>
          a.id === action.id ? { ...a, status: 'silenced' as const } : a,
        ),
      }
    }
    default:
      return state
  }
}

export type AiInfraApi = {
  state: AiInfraState
  datasets: PublishedDataset[]
  datasetSource: DatasetSource
  usedSlots: (nodeId: string) => number
  gpuUtil: { used: number; total: number }
  openAlertCount: number
  runningJobCount: number
  createJob: (input: CreateJobInput) => void
  cancelJob: (id: string) => void
  retryJob: (id: string) => void
  toggleDrain: (nodeId: string) => void
  registerModel: (name: string) => void
  addRevision: (modelId: string, version: string) => void
  promoteRevision: (modelId: string, revisionId: string) => void
  deployEndpoint: (name: string, modelRevisionId: string) => void
  setCanary: (endpointId: string, pct: number, canaryRevisionId?: string | null) => void
  rollbackEndpoint: (endpointId: string) => void
  startPipeline: () => void
  pipelineGate: (runId: string, pass: boolean) => void
  pipelinePublish: (runId: string, opts?: { revisionId?: string; endpointId?: string }) => void
  pipelineRerunEval: (runId: string) => void
  startLoadTest: (endpointId: string, concurrency: number, durationSec: number) => void
  ackAlert: (id: string) => void
  silenceAlert: (id: string) => void
  refreshDatasets: () => void
  findRevisionLabel: (revisionId: string) => string
}

const AiInfraContext = createContext<AiInfraApi | null>(null)

export function AiInfraProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(reducer, undefined, () => createInitialState())
  const [datasetPack, setDatasetPack] = useState(() => readPublishedDatasets())

  useEffect(() => {
    const id = window.setInterval(() => {
      dispatch({ type: 'TICK', now: Date.now() })
    }, 500)
    return () => window.clearInterval(id)
  }, [])

  const usedSlots = useCallback(
    (nodeId: string) => usedSlotsOnNode(state, nodeId),
    [state],
  )

  const gpuUtil = useMemo(
    () => ({ used: totalUsedSlots(state), total: totalSlots(state) }),
    [state],
  )

  const findRevisionLabel = useCallback(
    (revisionId: string) => {
      for (const m of state.models) {
        const r = m.revisions.find((x) => x.id === revisionId)
        if (r) return `${m.name} · ${r.version}`
      }
      return revisionId
    },
    [state.models],
  )

  const api: AiInfraApi = useMemo(
    () => ({
      state,
      datasets: datasetPack.datasets,
      datasetSource: datasetPack.source,
      usedSlots,
      gpuUtil,
      openAlertCount: state.alerts.filter((a) => a.status === 'open').length,
      runningJobCount: state.jobs.filter((j) => j.status === 'running').length,
      createJob: (input) => dispatch({ type: 'CREATE_JOB', input }),
      cancelJob: (id) => dispatch({ type: 'CANCEL_JOB', id }),
      retryJob: (id) => dispatch({ type: 'RETRY_JOB', id }),
      toggleDrain: (nodeId) => dispatch({ type: 'TOGGLE_DRAIN', nodeId }),
      registerModel: (name) => dispatch({ type: 'REGISTER_MODEL', name }),
      addRevision: (modelId, version) => dispatch({ type: 'ADD_REVISION', modelId, version }),
      promoteRevision: (modelId, revisionId) =>
        dispatch({ type: 'PROMOTE_REVISION', modelId, revisionId }),
      deployEndpoint: (name, modelRevisionId) =>
        dispatch({ type: 'DEPLOY_ENDPOINT', name, modelRevisionId }),
      setCanary: (endpointId, pct, canaryRevisionId) =>
        dispatch({ type: 'SET_CANARY', endpointId, pct, canaryRevisionId }),
      rollbackEndpoint: (endpointId) => dispatch({ type: 'ROLLBACK_ENDPOINT', endpointId }),
      startPipeline: () => dispatch({ type: 'START_PIPELINE' }),
      pipelineGate: (runId, pass) => dispatch({ type: 'PIPELINE_GATE', runId, pass }),
      pipelinePublish: (runId, opts) =>
        dispatch({ type: 'PIPELINE_PUBLISH', runId, revisionId: opts?.revisionId, endpointId: opts?.endpointId }),
      pipelineRerunEval: (runId) => dispatch({ type: 'PIPELINE_RERUN_EVAL', runId }),
      startLoadTest: (endpointId, concurrency, durationSec) =>
        dispatch({ type: 'START_LOADTEST', endpointId, concurrency, durationSec }),
      ackAlert: (id) => dispatch({ type: 'ACK_ALERT', id }),
      silenceAlert: (id) => dispatch({ type: 'SILENCE_ALERT', id }),
      refreshDatasets: () => setDatasetPack(readPublishedDatasets()),
      findRevisionLabel,
    }),
    [state, datasetPack, usedSlots, gpuUtil, findRevisionLabel],
  )

  return <AiInfraContext.Provider value={api}>{children}</AiInfraContext.Provider>
}

export function useAiInfra(): AiInfraApi {
  const ctx = useContext(AiInfraContext)
  if (!ctx) throw new Error('useAiInfra must be used within AiInfraProvider')
  return ctx
}
