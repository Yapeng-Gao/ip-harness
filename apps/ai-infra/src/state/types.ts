import type { StatusTone } from '../components/ui'

export type JobKind = 'train' | 'batch'
export type JobStatus = 'queued' | 'running' | 'succeeded' | 'failed' | 'cancelled'

export type Job = {
  id: string
  kind: JobKind
  name: string
  /** 作业钉死的数据集 id（展示+契约，非仅下拉文案） */
  datasetId: string
  /** 作业钉死的数据集 version */
  datasetVersion: string
  queue: string
  priority: number
  status: JobStatus
  progress: number
  createdAt: string
  logs: string[]
  gpuSlots: number
  forceFail: boolean
  assignedNodeId: string | null
  /** epoch ms when entered queued — used by tick */
  queuedSince: number
  /** epoch ms when entered running */
  startedAt: number | null
}

export type GpuNode = {
  id: string
  name: string
  sku: string
  totalSlots: number
  drained: boolean
  pool: string
}

export type ModelStage = 'registered' | 'staging' | 'canary' | 'prod'

export type ModelRevision = {
  id: string
  version: string
  stage: ModelStage
}

export type Model = {
  id: string
  name: string
  revisions: ModelRevision[]
}

export type EndpointStatus = 'published' | 'canary' | 'draft'

export type Endpoint = {
  id: string
  name: string
  modelRevisionId: string
  /** optional canary revision; trafficCanaryPct goes to canary when set */
  canaryRevisionId: string | null
  trafficCanaryPct: number
  status: EndpointStatus
}

export type PipeStepStatus = 'pending' | 'running' | 'succeeded' | 'failed' | 'blocked'

export type PipelineStep = {
  id: string
  key: 'train' | 'eval' | 'publish'
  label: string
  status: PipeStepStatus
}

export type PipelinePublishEffect = {
  revisionId: string
  revisionLabel: string
  fromStage: ModelStage | null
  toStage: ModelStage | null
  endpointId: string
  endpointName: string
  /** 屏上诚实旁注，含「样机 / 非真流量」 */
  note: string
}

export type PipelineRun = {
  id: string
  template: string
  steps: PipelineStep[]
  blockedAtGate: boolean
  createdAt: string
  finished: boolean
  /** 发布后的内存副作用摘要（晋级 + 挂端点） */
  publishEffect?: PipelinePublishEffect
}

export type LoadTestStatus = 'queued' | 'running' | 'succeeded'

export type LoadTestReport = {
  ttftMs: number
  tokensPerSec: number
  errorRate: number
}

export type LoadTestRun = {
  id: string
  endpointId: string
  concurrency: number
  durationSec: number
  status: LoadTestStatus
  progress: number
  createdAt: string
  report?: LoadTestReport
  startedAt: number | null
}

export type AlertStatus = 'open' | 'acked' | 'silenced'

export type Alert = {
  id: string
  kind: 'job_failed' | 'gpu_high' | 'info'
  message: string
  createdAt: string
  status: AlertStatus
}

export type PublishedDataset = {
  id: string
  name: string
  version: string
}

export type AiInfraState = {
  jobs: Job[]
  gpuNodes: GpuNode[]
  models: Model[]
  endpoints: Endpoint[]
  pipelineRuns: PipelineRun[]
  loadTests: LoadTestRun[]
  alerts: Alert[]
  /** dedupe keys for auto alerts already fired */
  alertKeys: string[]
  now: number
}

export const JOB_STATUS_TONE: Record<JobStatus, StatusTone> = {
  running: 'ok',
  queued: 'info',
  succeeded: 'ok',
  failed: 'down',
  cancelled: 'empty',
}

export const JOB_STATUS_LABEL: Record<JobStatus, string> = {
  running: '运行中',
  queued: '排队',
  succeeded: '成功',
  failed: '失败',
  cancelled: '已取消',
}

export const JOB_KIND_LABEL: Record<JobKind, string> = {
  train: '训练',
  batch: '批推',
}

export const MODEL_STAGE_LABEL: Record<ModelStage, string> = {
  registered: '已注册',
  staging: '预发',
  canary: '金丝雀',
  prod: '生产',
}

export const MODEL_STAGE_TONE: Record<ModelStage, StatusTone> = {
  registered: 'empty',
  staging: 'info',
  canary: 'warn',
  prod: 'ok',
}

export const STAGE_ORDER: ModelStage[] = ['registered', 'staging', 'canary', 'prod']

export const PIPE_STEP_TONE: Record<PipeStepStatus, StatusTone> = {
  pending: 'empty',
  running: 'info',
  succeeded: 'ok',
  failed: 'down',
  blocked: 'warn',
}

export const PIPE_STEP_LABEL: Record<PipeStepStatus, string> = {
  pending: '待执行',
  running: '进行中',
  succeeded: '通过',
  failed: '失败',
  blocked: '门禁等待',
}

export const DATASETS_LS_KEY = 'ip.harness.aiData.publishedDatasets'

/** 下拉 / 存储复合键：同一 dataset id 可有多 version */
export function datasetCompositeKey(id: string, version: string): string {
  return `${id}@${version}`
}

export function parseDatasetCompositeKey(
  key: string,
): { datasetId: string; datasetVersion: string } | null {
  const i = key.lastIndexOf('@')
  if (i <= 0 || i === key.length - 1) return null
  return { datasetId: key.slice(0, i), datasetVersion: key.slice(i + 1) }
}

export function jobDatasetPin(job: Pick<Job, 'datasetId' | 'datasetVersion'>): string {
  return datasetCompositeKey(job.datasetId, job.datasetVersion)
}

/** 作业 queue → GPU pool。当前 1:1，batch 有独立节点 gpu-c。 */
export const QUEUE_TO_POOL: Record<string, string> = {
  'algo-train': 'algo-train',
  batch: 'batch',
  infer: 'infer',
}

export const JOB_QUEUES = ['algo-train', 'batch', 'infer'] as const

export function poolForQueue(queue: string): string {
  return QUEUE_TO_POOL[queue] ?? queue
}
