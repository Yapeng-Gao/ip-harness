import type { StatusTone } from '../components/ui'

export type JobStatus = 'queued' | 'running' | 'done' | 'fail' | 'idle' | 'blocked'

export type Source = {
  id: string
  name: string
  kind: string
  status: string
  tone: StatusTone
  note: string
  rawCount: number
  lastIngestAt: string | null
}

export type IngestJob = {
  id: string
  sourceId: string
  sourceName: string
  status: Extract<JobStatus, 'queued' | 'running' | 'done' | 'fail'>
  rawWritten: number
  createdAt: string
  updatedAt: string
  note: string
}

export type PipeStepId = 'ingest' | 'clean' | 'dedup' | 'quality' | 'publish'

export type PipeStep = {
  id: PipeStepId
  label: string
  status: JobStatus
  detail: string
  progress: number
}

export type Pipeline = {
  id: string
  name: string
  targetDatasetId: string
  sourceId: string
  steps: PipeStep[]
  running: boolean
  lastRunAt: string | null
  note: string
  /** ticket that spawned this hard-example refeed, if any */
  fromTicketId: string | null
}

export type DatasetVersion = {
  tag: string
  checksum: string
  rows: number
  publishedAt: string
  immutable: true
  note: string
  pinned: boolean
  tone: StatusTone
}

export type Dataset = {
  id: string
  name: string
  purpose: string
  versions: DatasetVersion[]
  rowEstimate: number
  updated: string
  note: string
  draftNote: string
}

export type RecipeKind = '预训练' | 'SFT' | '偏好' | '评测'

export type Recipe = {
  id: string
  name: string
  kind: RecipeKind
  ratios: { label: string; pct: number }[]
  sampleTotal: number
  note: string
  savedAt: string | null
}

export type QualityFinding = {
  id: string
  kind: '敏感' | '污染'
  severity: 'low' | 'mid' | 'high'
  detail: string
  engineNote: string
}

export type QualityRunStatus = 'idle' | 'scoring' | 'pass' | 'fail'

export type QualityReport = {
  id: string
  datasetId: string
  datasetLabel: string
  score: number | null
  status: QualityRunStatus
  findings: QualityFinding[]
  ranAt: string | null
  tone: StatusTone
  note: string
  /** next score run will fail (demo) */
  forceFailNext: boolean
}

export type LineageNode = {
  id: string
  label: string
  kind: string
}

export type LineageEdge = {
  id: string
  from: string
  to: string
  label: string
  at: string
}

/** deep-demo: requested → approved → done */
export type ExportStatus = 'requested' | 'approved' | 'done'

export type ExportOrder = {
  id: string
  title: string
  from: string
  status: ExportStatus
  requested: string
  note: string
  candidateDatasetId: string | null
}

export type ImprovementTicket = {
  id: string
  title: string
  fromEval: string
  severity: 'low' | 'mid' | 'high'
  status: 'open' | 'linked' | 'done'
  note: string
  linkedPipelineId: string | null
  createdAt: string
}

/**
 * localStorage shape (deep-demo §3). Minimal fields id/name/version;
 * optional extras ignored by ai-infra reader.
 */
export type PublishedDatasetRef = {
  id: string
  name: string
  version: string
  checksum?: string
  purpose?: string
  publishedAt?: string
  rows?: number
}

export const PUBLISHED_DATASETS_LS_KEY = 'ip.harness.aiData.publishedDatasets'

/** Shared seed contract with apps/ai-infra SEED_DATASETS (not via cross-port LS). */
export const SEED_PUBLISHED: PublishedDatasetRef[] = [
  { id: 'ds-claims-sft', name: 'claims-sft', version: 'v1.4' },
  { id: 'ds-eval-hard', name: 'eval-hard', version: 'v2.0' },
  { id: 'ds-pretrain-mix', name: 'pretrain-mix', version: 'v0.9' },
]

export type AiDataState = {
  sources: Source[]
  ingestJobs: IngestJob[]
  pipelines: Pipeline[]
  datasets: Dataset[]
  recipes: Recipe[]
  qualityReports: QualityReport[]
  lineageNodes: LineageNode[]
  lineageEdges: LineageEdge[]
  exports: ExportOrder[]
  tickets: ImprovementTicket[]
  toast: string | null
}
