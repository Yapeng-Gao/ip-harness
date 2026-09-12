import type {
  AiDataState,
  Dataset,
  ExportOrder,
  ImprovementTicket,
  LineageEdge,
  LineageNode,
  Pipeline,
  PipeStep,
  QualityReport,
  Recipe,
  Source,
} from './types'
import { SEED_PUBLISHED } from './types'

function defaultSteps(): PipeStep[] {
  return [
    { id: 'ingest', label: '采集', status: 'idle', detail: '待 Run', progress: 0 },
    { id: 'clean', label: '清洗', status: 'idle', detail: '待 Run', progress: 0 },
    { id: 'dedup', label: '去重', status: 'idle', detail: '待 Run', progress: 0 },
    { id: 'quality', label: '质量门', status: 'idle', detail: '待 Run · 未 pass 阻断发布', progress: 0 },
    { id: 'publish', label: '发布', status: 'idle', detail: '质量门 pass 后可发布', progress: 0 },
  ]
}

function fakeChecksum(tag: string): string {
  let h = 0
  for (let i = 0; i < tag.length; i++) h = (h * 31 + tag.charCodeAt(i)) >>> 0
  return `sha256-mock-${h.toString(16).padStart(8, '0')}`
}

/** Initial datasets aligned with SEED_PUBLISHED (= ai-infra SEED_DATASETS). */
function seedDatasets(): Dataset[] {
  const purposes: Record<string, string> = {
    'ds-claims-sft': 'SFT',
    'ds-eval-hard': '评测',
    'ds-pretrain-mix': '预训练',
  }
  const rows: Record<string, number> = {
    'ds-claims-sft': 12400,
    'ds-eval-hard': 860,
    'ds-pretrain-mix': 2100000,
  }
  return SEED_PUBLISHED.map((s) => ({
    id: s.id,
    name: s.name,
    purpose: purposes[s.id] ?? '通用',
    versions: [
      {
        tag: s.version,
        checksum: fakeChecksum(`${s.id}@${s.version}`),
        rows: rows[s.id] ?? 1000,
        publishedAt: '2026-09-12T10:00:00.000Z',
        immutable: true as const,
        note: '种子发布 · 不可变',
        pinned: s.id === 'ds-claims-sft',
        tone: 'ok' as const,
      },
    ],
    rowEstimate: rows[s.id] ?? 1000,
    updated: '2026-09-12',
    note: '与 ai-infra SEED_DATASETS 同表',
    draftNote: '草稿可改；已发布 version 不可改',
  }))
}

function seedSources(): Source[] {
  return [
    {
      id: 'src-oss',
      name: '公开语料镜像（示意）',
      kind: '对象存储路径',
      status: '已登记',
      tone: 'ok',
      note: '无真 bucket · 可点「拉取」',
      rawCount: 1200,
      lastIngestAt: '2026-09-11T08:00:00.000Z',
    },
    {
      id: 'src-export',
      name: '办案脱敏导出接入',
      kind: '导出单管道',
      status: '已登记',
      tone: 'info',
      note: '仅收脱敏产物 · 禁案正文',
      rawCount: 0,
      lastIngestAt: null,
    },
  ]
}

function seedPipelines(): Pipeline[] {
  return [
    {
      id: 'pipe-claims',
      name: 'claims-sft-dag',
      targetDatasetId: 'ds-claims-sft',
      sourceId: 'src-oss',
      steps: defaultSteps(),
      running: false,
      lastRunAt: null,
      note: '采集→清洗→去重→质量门→发布',
      fromTicketId: null,
    },
    {
      id: 'pipe-eval',
      name: 'eval-hard-dag',
      targetDatasetId: 'ds-eval-hard',
      sourceId: 'src-oss',
      steps: defaultSteps(),
      running: false,
      lastRunAt: null,
      note: '质量门 fail 将阻断发布',
      fromTicketId: null,
    },
  ]
}

function seedRecipes(): Recipe[] {
  return [
    {
      id: 'rcp-pretrain',
      name: 'pretrain-default',
      kind: '预训练',
      ratios: [
        { label: '公开', pct: 70 },
        { label: '脱敏导出', pct: 20 },
        { label: '合成', pct: 10 },
      ],
      sampleTotal: 10000,
      note: 'SamplePlan 示意 · 不改生产流量',
      savedAt: null,
    },
    {
      id: 'rcp-sft',
      name: 'sft-claims',
      kind: 'SFT',
      ratios: [
        { label: '难例', pct: 40 },
        { label: '常规', pct: 60 },
      ],
      sampleTotal: 5000,
      note: '分层采样 · 无真挖掘',
      savedAt: null,
    },
    {
      id: 'rcp-pref',
      name: 'pref-dpo-v0',
      kind: '偏好',
      ratios: [{ label: '成对偏好', pct: 100 }],
      sampleTotal: 2000,
      note: 'RLHF/DPO 形状 · 无真标注平台',
      savedAt: null,
    },
    {
      id: 'rcp-eval',
      name: 'eval-gate',
      kind: '评测',
      ratios: [
        { label: '硬例', pct: 50 },
        { label: '回归', pct: 50 },
      ],
      sampleTotal: 800,
      note: '评测配方 · 不自动改 case handoff',
      savedAt: null,
    },
  ]
}

/**
 * Seed quality aligned with SEED_PUBLISHED immutable versions.
 * Datasets that already have a published seed version start as `pass`
 * (story: historical publish already gated). New publishes still hard-gate
 * on current qualityPassFor — re-score / force-fail can still block.
 */
function seedQuality(): QualityReport[] {
  return seedDatasets().map((ds) => {
    const hasPublished = ds.versions.some((v) => v.immutable)
    if (hasPublished) {
      return {
        id: `q-${ds.id}`,
        datasetId: ds.id,
        datasetLabel: `${ds.name} @ ${ds.versions[0]?.tag ?? '?'}`,
        score: 0.88,
        status: 'pass' as const,
        findings: [
          {
            id: `f-seed-${ds.id}`,
            kind: '污染' as const,
            severity: 'low' as const,
            detail: '种子历史：示意轻微近重，可接受',
            engineNote: '非真引擎 · 种子初始 pass',
          },
        ],
        ranAt: '2026-09-12T09:55:00.000Z',
        tone: 'ok' as const,
        note: '种子历史已 pass · 对齐已发布 immutable 版 · 非真引擎',
        forceFailNext: false,
      }
    }
    return {
      id: `q-${ds.id}`,
      datasetId: ds.id,
      datasetLabel: `${ds.name} @ ${ds.versions[0]?.tag ?? '?'}`,
      score: null,
      status: 'idle' as const,
      findings: [],
      ranAt: null,
      tone: 'empty' as const,
      note: '尚未打分 · 非真引擎',
      forceFailNext: false,
    }
  })
}

function seedLineageNodes(): LineageNode[] {
  return [
    { id: 'n-src-oss', label: '公开语料镜像', kind: 'Source' },
    { id: 'n-src-export', label: '脱敏导出接入', kind: 'Source' },
    { id: 'n-ds-claims-sft', label: 'claims-sft', kind: 'Dataset' },
    { id: 'n-ver-claims-sft', label: 'claims-sft@v1.4', kind: 'Version' },
    { id: 'n-ds-eval-hard', label: 'eval-hard', kind: 'Dataset' },
    { id: 'n-ver-eval-hard', label: 'eval-hard@v2.0', kind: 'Version' },
    { id: 'n-ds-pretrain-mix', label: 'pretrain-mix', kind: 'Dataset' },
    { id: 'n-ver-prior-pretrain', label: 'pretrain-mix@v0.9', kind: 'Version' },
  ]
}

function seedLineageEdges(): LineageEdge[] {
  return [
    {
      id: 'e-seed-1',
      from: 'n-src-oss',
      to: 'n-ver-claims-sft',
      label: 'publish',
      at: '2026-09-12T10:00:00.000Z',
    },
    {
      id: 'e-seed-2',
      from: 'n-src-oss',
      to: 'n-ver-eval-hard',
      label: 'publish',
      at: '2026-09-12T10:00:00.000Z',
    },
    {
      id: 'e-seed-3',
      from: 'n-src-export',
      to: 'n-ver-prior-pretrain',
      label: 'publish',
      at: '2026-09-12T10:00:00.000Z',
    },
  ]
}

function seedExports(): ExportOrder[] {
  return [
    {
      id: 'exp-101',
      title: '导出单 · EXP-101',
      from: '办案侧申请（示意）',
      status: 'done',
      requested: '2026-09-11',
      note: '无案正文 · 可生成候选数据集',
      candidateDatasetId: null,
    },
    {
      id: 'exp-102',
      title: '导出单 · EXP-102',
      from: '办案侧申请（示意）',
      status: 'requested',
      requested: '2026-09-13',
      note: '申请→审批→完成',
      candidateDatasetId: null,
    },
  ]
}

function seedTickets(): ImprovementTicket[] {
  return [
    {
      id: 'tkt-1',
      title: '评测硬例：权利要求边界混淆',
      fromEval: 'eval-gate · claims',
      severity: 'high',
      status: 'open',
      note: '可「创建难例回灌任务」挂到 pipeline',
      linkedPipelineId: null,
      createdAt: '2026-09-12T12:00:00.000Z',
    },
    {
      id: 'tkt-2',
      title: '评测硬例：难例召回不足',
      fromEval: 'eval-gate · eval-hard',
      severity: 'mid',
      status: 'open',
      note: '回流仅挂流水线 · 不改 case handoff',
      linkedPipelineId: null,
      createdAt: '2026-09-12T14:00:00.000Z',
    },
  ]
}

export function createInitialState(): AiDataState {
  return {
    sources: seedSources(),
    ingestJobs: [],
    pipelines: seedPipelines(),
    datasets: seedDatasets(),
    recipes: seedRecipes(),
    qualityReports: seedQuality(),
    lineageNodes: seedLineageNodes(),
    lineageEdges: seedLineageEdges(),
    exports: seedExports(),
    tickets: seedTickets(),
    toast: null,
  }
}

export { defaultSteps, fakeChecksum }
