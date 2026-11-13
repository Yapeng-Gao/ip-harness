import type {
  AiInfraState,
  Endpoint,
  GpuNode,
  Job,
  Model,
  PublishedDataset,
} from './types'
import { DATASETS_LS_KEY } from './types'

/** 与 apps/ai-data 共享的契约种子（跨端口不靠 localStorage） */
export const SEED_DATASETS: PublishedDataset[] = [
  { id: 'ds-claims-sft', name: 'claims-sft', version: 'v1.4' },
  { id: 'ds-eval-hard', name: 'eval-hard', version: 'v2.0' },
  { id: 'ds-pretrain-mix', name: 'pretrain-mix', version: 'v0.9' },
]

export type DatasetSource = 'localStorage' | 'seed'

export function readPublishedDatasets(): {
  datasets: PublishedDataset[]
  source: DatasetSource
} {
  try {
    const raw = localStorage.getItem(DATASETS_LS_KEY)
    if (!raw) return { datasets: SEED_DATASETS, source: 'seed' }
    const parsed: unknown = JSON.parse(raw)
    if (!Array.isArray(parsed) || parsed.length === 0) {
      return { datasets: SEED_DATASETS, source: 'seed' }
    }
    const cleaned: PublishedDataset[] = []
    for (const item of parsed) {
      if (!item || typeof item !== 'object') continue
      const rec = item as Record<string, unknown>
      const id = typeof rec.id === 'string' ? rec.id : null
      const name = typeof rec.name === 'string' ? rec.name : null
      const version = typeof rec.version === 'string' ? rec.version : null
      if (id && name && version) cleaned.push({ id, name, version })
    }
    if (cleaned.length === 0) return { datasets: SEED_DATASETS, source: 'seed' }
    return { datasets: cleaned, source: 'localStorage' }
  } catch {
    return { datasets: SEED_DATASETS, source: 'seed' }
  }
}

function isoNow(offsetMs = 0): string {
  return new Date(Date.now() + offsetMs).toISOString()
}

const seedJobs = (now: number): Job[] => [
  {
    id: 'job-seed-train',
    kind: 'train',
    name: 'train-cls-v3',
    datasetId: 'ds-claims-sft',
    datasetVersion: 'v1.4',
    queue: 'algo-train',
    priority: 5,
    status: 'succeeded',
    progress: 100,
    createdAt: isoNow(-3600_000),
    logs: ['[seed] 作业已完成（示意）', '[seed] 无真实 checkpoint'],
    gpuSlots: 2,
    forceFail: false,
    assignedNodeId: null,
    queuedSince: now - 3600_000,
    startedAt: now - 3000_000,
  },
  {
    id: 'job-seed-batch-fail',
    kind: 'batch',
    name: 'batch-backfill-fail',
    datasetId: 'ds-eval-hard',
    datasetVersion: 'v2.0',
    queue: 'batch',
    priority: 3,
    status: 'failed',
    progress: 18,
    createdAt: isoNow(-7200_000),
    logs: ['[seed] OOM 示意失败', '[seed] 可用「重试」再跑'],
    gpuSlots: 1,
    forceFail: true,
    assignedNodeId: null,
    queuedSince: now - 7200_000,
    startedAt: now - 7000_000,
  },
]

const seedGpuNodes: GpuNode[] = [
  {
    id: 'gpu-a',
    name: 'gpu-node-a',
    sku: 'A100 80G ×4',
    totalSlots: 4,
    drained: false,
    pool: 'algo-train',
  },
  {
    id: 'gpu-b',
    name: 'gpu-node-b',
    sku: 'A100 80G ×4',
    totalSlots: 4,
    drained: false,
    pool: 'infer',
  },
  {
    id: 'gpu-c',
    name: 'gpu-node-c',
    sku: 'L40S ×2',
    totalSlots: 2,
    drained: false,
    pool: 'batch',
  },
]

const seedModels: Model[] = [
  {
    id: 'mf-claims',
    name: 'claims-draft',
    revisions: [
      { id: 'rev-claims-20', version: 'v2.0', stage: 'staging' },
      { id: 'rev-claims-21', version: 'v2.1', stage: 'prod' },
      { id: 'rev-claims-22', version: 'v2.2-rc', stage: 'registered' },
    ],
  },
  {
    id: 'mf-prior',
    name: 'prior-art-rank',
    revisions: [{ id: 'rev-prior-14', version: 'v1.4', stage: 'canary' }],
  },
]

const seedEndpoints: Endpoint[] = [
  {
    id: 'ep-claims',
    name: 'claims-draft',
    modelRevisionId: 'rev-claims-21',
    canaryRevisionId: null,
    trafficCanaryPct: 0,
    status: 'published',
  },
  {
    id: 'ep-prior',
    name: 'prior-art-rank',
    modelRevisionId: 'rev-prior-14',
    canaryRevisionId: 'rev-prior-14',
    trafficCanaryPct: 10,
    status: 'canary',
  },
]

export function createInitialState(now = Date.now()): AiInfraState {
  return {
    jobs: seedJobs(now),
    gpuNodes: seedGpuNodes.map((n) => ({ ...n })),
    models: seedModels.map((m) => ({
      ...m,
      revisions: m.revisions.map((r) => ({ ...r })),
    })),
    endpoints: seedEndpoints.map((e) => ({ ...e })),
    pipelineRuns: [],
    loadTests: [],
    alerts: [
      {
        id: 'alert-seed-fail',
        kind: 'job_failed',
        message: '作业 batch-backfill-fail 失败（种子示意）',
        createdAt: isoNow(-7000_000),
        status: 'open',
      },
    ],
    alertKeys: ['job_failed:job-seed-batch-fail'],
    now,
  }
}
