import type { StatusTone } from '../components/ui'

export type JobKind = 'train' | 'batch'
export type JobStatus = 'running' | 'queued' | 'succeeded' | 'failed'

export type JobRow = {
  id: string
  name: string
  kind: JobKind
  status: JobStatus
  progress: number
  queue: string
  submitted: string
  note: string
}

export const JOBS: JobRow[] = [
  {
    id: 'job-train-cls',
    name: 'train-cls-v3',
    kind: 'train',
    status: 'running',
    progress: 62,
    queue: 'algo-train',
    submitted: '2026-09-13 08:12',
    note: '假进度条 · 无 checkpoint 落盘',
  },
  {
    id: 'job-train-ner',
    name: 'train-ner-v1',
    kind: 'train',
    status: 'queued',
    progress: 0,
    queue: 'algo-train',
    submitted: '2026-09-13 09:40',
    note: '排队示意 · 无调度器',
  },
  {
    id: 'job-batch-eval',
    name: 'batch-eval-sep',
    kind: 'batch',
    status: 'succeeded',
    progress: 100,
    queue: 'batch',
    submitted: '2026-09-12 21:04',
    note: '评测批 mock · 无真实语料桶',
  },
  {
    id: 'job-batch-backfill',
    name: 'batch-backfill',
    kind: 'batch',
    status: 'failed',
    progress: 18,
    queue: 'batch',
    submitted: '2026-09-12 16:22',
    note: '失败为样机行 · 未打真端点',
  },
]

export const JOB_STATUS_TONE: Record<JobStatus, StatusTone> = {
  running: 'ok',
  queued: 'info',
  succeeded: 'ok',
  failed: 'down',
}

export const JOB_STATUS_LABEL: Record<JobStatus, string> = {
  running: '运行中（假）',
  queued: '排队',
  succeeded: '完成（示意）',
  failed: '失败（示意）',
}

export const JOB_KIND_LABEL: Record<JobKind, string> = {
  train: '训练',
  batch: '批推',
}
