import { useSyncExternalStore } from 'react'
import { createInitialState, defaultSteps, fakeChecksum } from './seed'
import type {
  AiDataState,
  Dataset,
  DatasetVersion,
  IngestJob,
  JobStatus,
  Pipeline,
  PipeStep,
  PublishedDatasetRef,
  QualityFinding,
  QualityReport,
} from './types'
import { PUBLISHED_DATASETS_LS_KEY, SEED_PUBLISHED } from './types'

let state: AiDataState = createInitialState()
const listeners = new Set<() => void>()
const timers = new Set<ReturnType<typeof setTimeout>>()

function emit() {
  for (const l of listeners) l()
}

function setState(partial: Partial<AiDataState> | ((prev: AiDataState) => AiDataState)) {
  state = typeof partial === 'function' ? partial(state) : { ...state, ...partial }
  emit()
}

function toast(message: string) {
  setState({ toast: message })
  schedule(() => {
    if (state.toast === message) setState({ toast: null })
  }, 3200)
}

function schedule(fn: () => void, ms: number) {
  const id = setTimeout(() => {
    timers.delete(id)
    fn()
  }, ms)
  timers.add(id)
}

function nowIso() {
  return new Date().toISOString()
}

function uid(prefix: string) {
  return `${prefix}-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 7)}`
}

function bumpVersion(tag: string): string {
  // v1 / v1.4 / v1.4.2 / 1.4.2
  const withV = /^v(\d+)(?:\.(\d+))?(?:\.(\d+))?$/.exec(tag)
  if (withV) {
    const major = Number(withV[1])
    const minor = withV[2] != null ? Number(withV[2]) : null
    const patch = withV[3] != null ? Number(withV[3]) : null
    if (patch != null && minor != null) return `v${major}.${minor}.${patch + 1}`
    if (minor != null) return `v${major}.${minor + 1}`
    return `v${major + 1}`
  }
  const sem = /^(\d+)\.(\d+)(?:\.(\d+))?$/.exec(tag)
  if (sem) {
    const major = Number(sem[1])
    const minor = Number(sem[2])
    const patch = sem[3] != null ? Number(sem[3]) + 1 : 1
    return `${major}.${minor}.${patch}`
  }
  return `${tag}.1`
}

function latestTag(ds: Dataset): string {
  return ds.versions[0]?.tag ?? 'v0'
}

function ensureNode(label: string, kind: string, idHint: string) {
  const id = idHint
  if (!state.lineageNodes.some((n) => n.id === id)) {
    setState((s) => ({
      ...s,
      lineageNodes: [...s.lineageNodes, { id, label, kind }],
    }))
  }
  return id
}

function appendEdge(from: string, to: string, label: string) {
  const id = uid('edge')
  setState((s) => ({
    ...s,
    lineageEdges: [{ id, from, to, label, at: nowIso() }, ...s.lineageEdges],
  }))
}

/** Merge-dedupe by id+version into localStorage (same-origin only). */
export function writePublishedToLocalStorage(ref: PublishedDatasetRef) {
  try {
    const raw = localStorage.getItem(PUBLISHED_DATASETS_LS_KEY)
    let list: PublishedDatasetRef[] = []
    if (raw) {
      const parsed: unknown = JSON.parse(raw)
      if (Array.isArray(parsed)) {
        for (const item of parsed) {
          if (!item || typeof item !== 'object') continue
          const rec = item as Record<string, unknown>
          const id = typeof rec.id === 'string' ? rec.id : null
          const name = typeof rec.name === 'string' ? rec.name : null
          const version = typeof rec.version === 'string' ? rec.version : null
          if (id && name && version) {
            list.push({
              id,
              name,
              version,
              checksum: typeof rec.checksum === 'string' ? rec.checksum : undefined,
              purpose: typeof rec.purpose === 'string' ? rec.purpose : undefined,
              publishedAt: typeof rec.publishedAt === 'string' ? rec.publishedAt : undefined,
              rows: typeof rec.rows === 'number' ? rec.rows : undefined,
            })
          }
        }
      }
    }
    list = list.filter((x) => !(x.id === ref.id && x.version === ref.version))
    list.unshift({
      id: ref.id,
      name: ref.name,
      version: ref.version,
      checksum: ref.checksum,
      purpose: ref.purpose,
      publishedAt: ref.publishedAt,
      rows: ref.rows,
    })
    localStorage.setItem(PUBLISHED_DATASETS_LS_KEY, JSON.stringify(list))
  } catch {
    /* ignore quota / private mode */
  }
}

/** Seed LS on first load so same-port refresh sees the shared contract. */
export function bootstrapPublishedLocalStorage() {
  try {
    const raw = localStorage.getItem(PUBLISHED_DATASETS_LS_KEY)
    if (raw) return
    localStorage.setItem(PUBLISHED_DATASETS_LS_KEY, JSON.stringify(SEED_PUBLISHED))
  } catch {
    /* ignore */
  }
}

function updatePipeline(id: string, fn: (p: Pipeline) => Pipeline) {
  setState((s) => ({
    ...s,
    pipelines: s.pipelines.map((p) => (p.id === id ? fn(p) : p)),
  }))
}

function setStep(
  pipeId: string,
  stepId: PipeStep['id'],
  patch: Partial<PipeStep>,
) {
  updatePipeline(pipeId, (p) => ({
    ...p,
    steps: p.steps.map((st) => (st.id === stepId ? { ...st, ...patch } : st)),
  }))
}

function qualityPassFor(datasetId: string): boolean {
  const q = state.qualityReports.find((r) => r.datasetId === datasetId)
  return q?.status === 'pass'
}

function publishNewVersion(
  datasetId: string,
  opts: { sourceId: string; rows?: number; note?: string },
): DatasetVersion | null {
  const ds = state.datasets.find((d) => d.id === datasetId)
  if (!ds) return null
  const nextTag = bumpVersion(latestTag(ds))
  const rows = opts.rows ?? ds.rowEstimate + 100
  const version: DatasetVersion = {
    tag: nextTag,
    checksum: fakeChecksum(`${ds.id}@${nextTag}@${Date.now()}`),
    rows,
    publishedAt: nowIso(),
    immutable: true,
    note: opts.note ?? 'Pipeline 发布 · 不可变',
    pinned: false,
    tone: 'ok',
  }
  setState((s) => ({
    ...s,
    datasets: s.datasets.map((d) =>
      d.id === datasetId
        ? {
            ...d,
            versions: [version, ...d.versions],
            rowEstimate: rows,
            updated: nowIso().slice(0, 10),
          }
        : d,
    ),
  }))

  const srcNode = ensureNode(
    state.sources.find((x) => x.id === opts.sourceId)?.name ?? opts.sourceId,
    'Source',
    `n-${opts.sourceId}`,
  )
  ensureNode(ds.name, 'Dataset', `n-ds-${ds.id}`)
  const verNode = ensureNode(`${ds.name}@${nextTag}`, 'Version', `n-ver-${ds.id}-${nextTag}`)
  appendEdge(srcNode, verNode, 'publish')

  const ref: PublishedDatasetRef = {
    id: ds.id,
    name: ds.name,
    version: nextTag,
    checksum: version.checksum,
    purpose: ds.purpose,
    publishedAt: version.publishedAt,
    rows: version.rows,
  }
  writePublishedToLocalStorage(ref)
  return version
}

/* ── Actions ─────────────────────────────────────────── */

export function clearToast() {
  setState({ toast: null })
}

export function pullSource(sourceId: string) {
  const src = state.sources.find((s) => s.id === sourceId)
  if (!src) return
  if (state.ingestJobs.some((j) => j.sourceId === sourceId && (j.status === 'queued' || j.status === 'running'))) {
    toast('该源已有进行中的 IngestJob')
    return
  }
  const job: IngestJob = {
    id: uid('ing'),
    sourceId,
    sourceName: src.name,
    status: 'queued',
    rawWritten: 0,
    createdAt: nowIso(),
    updatedAt: nowIso(),
    note: '假 IngestJob · 无 RawBlob 落盘',
  }
  setState((s) => ({ ...s, ingestJobs: [job, ...s.ingestJobs] }))
  toast(`IngestJob 已排队：${src.name}`)

  schedule(() => {
    setState((s) => ({
      ...s,
      ingestJobs: s.ingestJobs.map((j) =>
        j.id === job.id ? { ...j, status: 'running', updatedAt: nowIso() } : j,
      ),
    }))
  }, 600)

  const willFail = Math.random() < 0.12
  schedule(() => {
    if (willFail) {
      setState((s) => ({
        ...s,
        ingestJobs: s.ingestJobs.map((j) =>
          j.id === job.id
            ? { ...j, status: 'fail', updatedAt: nowIso(), note: '模拟拉取失败 · 无真网络' }
            : j,
        ),
      }))
      toast(`拉取失败：${src.name}`)
      return
    }
    const written = 80 + Math.floor(Math.random() * 420)
    setState((s) => ({
      ...s,
      ingestJobs: s.ingestJobs.map((j) =>
        j.id === job.id
          ? {
              ...j,
              status: 'done',
              rawWritten: written,
              updatedAt: nowIso(),
              note: `写入 raw 计数 +${written}（假）`,
            }
          : j,
      ),
      sources: s.sources.map((x) =>
        x.id === sourceId
          ? {
              ...x,
              rawCount: x.rawCount + written,
              lastIngestAt: nowIso(),
              status: '已拉取',
              tone: 'ok',
            }
          : x,
      ),
    }))
    toast(`拉取完成 · raw +${written}`)
  }, 1800)
}

export function setQualityForceFail(datasetId: string, force: boolean) {
  setState((s) => ({
    ...s,
    qualityReports: s.qualityReports.map((q) =>
      q.datasetId === datasetId ? { ...q, forceFailNext: force } : q,
    ),
  }))
}

export function runQualityScore(datasetId: string) {
  const ds = state.datasets.find((d) => d.id === datasetId)
  const report = state.qualityReports.find((q) => q.datasetId === datasetId)
  if (!ds || !report) return
  if (report.status === 'scoring') {
    toast('打分进行中…')
    return
  }
  setState((s) => ({
    ...s,
    qualityReports: s.qualityReports.map((q) =>
      q.datasetId === datasetId
        ? {
            ...q,
            status: 'scoring',
            tone: 'info',
            note: 'scoring · 非真引擎',
            findings: [],
            score: null,
          }
        : q,
    ),
  }))
  toast(`开始打分：${ds.name}`)

  schedule(() => {
    const forceFail = state.qualityReports.find((q) => q.datasetId === datasetId)?.forceFailNext
    const fail = Boolean(forceFail) || Math.random() < 0.25
    const score = fail ? 0.42 + Math.random() * 0.2 : 0.78 + Math.random() * 0.18
    const findings: QualityFinding[] = fail
      ? [
          {
            id: uid('f'),
            kind: '敏感',
            severity: 'high',
            detail: '示意：疑似证件号模式（假命中）',
            engineNote: '非真引擎',
          },
          {
            id: uid('f'),
            kind: '污染',
            severity: 'mid',
            detail: '示意：近重语料污染偏高',
            engineNote: '非真引擎',
          },
        ]
      : [
          {
            id: uid('f'),
            kind: '污染',
            severity: 'low',
            detail: '示意：轻微近重，可接受',
            engineNote: '非真引擎',
          },
        ]
    const status = fail ? 'fail' : 'pass'
    setState((s) => ({
      ...s,
      qualityReports: s.qualityReports.map((q) =>
        q.datasetId === datasetId
          ? {
              ...q,
              status,
              score: Number(score.toFixed(2)),
              findings,
              ranAt: nowIso(),
              tone: fail ? 'down' : 'ok',
              note: fail ? '不达标 · 打红 · 非真引擎' : '达标 · 非真引擎',
              forceFailNext: false,
              datasetLabel: `${ds.name} @ ${latestTag(ds)}`,
            }
          : q,
      ),
    }))
    toast(fail ? `质量不达标（红）：${ds.name}` : `质量达标：${ds.name}`)
  }, 1200)
}

function runStepSequence(pipeId: string, stepIndex: number) {
  const pipe = state.pipelines.find((p) => p.id === pipeId)
  if (!pipe || !pipe.running) return
  const step = pipe.steps[stepIndex]
  if (!step) {
    updatePipeline(pipeId, (p) => ({ ...p, running: false, lastRunAt: nowIso() }))
    return
  }

  setStep(pipeId, step.id, {
    status: 'running',
    progress: 20,
    detail: '运行中（假）',
  })

  schedule(() => {
    setStep(pipeId, step.id, { progress: 70 })
  }, 400)

  schedule(() => {
    const current = state.pipelines.find((p) => p.id === pipeId)
    if (!current?.running) return

    if (step.id === 'quality') {
      const pass = qualityPassFor(current.targetDatasetId)
      if (!pass) {
        setStep(pipeId, 'quality', {
          status: 'fail',
          progress: 100,
          detail: '质量门 fail · 阻断发布',
        })
        setStep(pipeId, 'publish', {
          status: 'blocked',
          progress: 0,
          detail: '已阻断 · 请先质量打分 pass 后重跑',
        })
        updatePipeline(pipeId, (p) => ({ ...p, running: false, lastRunAt: nowIso() }))
        toast('质量门失败 · 发布已阻断')
        return
      }
      setStep(pipeId, 'quality', {
        status: 'done',
        progress: 100,
        detail: '质量门 pass',
      })
      runStepSequence(pipeId, stepIndex + 1)
      return
    }

    if (step.id === 'publish') {
      // Hard gate: must still be pass
      if (!qualityPassFor(current.targetDatasetId)) {
        setStep(pipeId, 'publish', {
          status: 'blocked',
          progress: 0,
          detail: '质量门未 pass · 禁止发布',
        })
        updatePipeline(pipeId, (p) => ({ ...p, running: false, lastRunAt: nowIso() }))
        toast('质量门未 pass · 禁止发布')
        return
      }
      const ver = publishNewVersion(current.targetDatasetId, {
        sourceId: current.sourceId,
        note: 'Pipeline 发布 · 不可变 version',
      })
      setStep(pipeId, 'publish', {
        status: 'done',
        progress: 100,
        detail: ver ? `已发布 ${ver.tag} · ${ver.checksum.slice(0, 18)}…` : '发布失败',
      })
      updatePipeline(pipeId, (p) => ({ ...p, running: false, lastRunAt: nowIso() }))
      toast(ver ? `发布成功 ${ver.tag}（已写同口 LS）` : '发布失败：无目标数据集')
      return
    }

    setStep(pipeId, step.id, {
      status: 'done',
      progress: 100,
      detail: `${step.label}完成（假）`,
    })
    runStepSequence(pipeId, stepIndex + 1)
  }, 900)
}

export function runPipeline(pipeId: string) {
  const pipe = state.pipelines.find((p) => p.id === pipeId)
  if (!pipe) return
  if (pipe.running) {
    toast('流水线运行中')
    return
  }
  updatePipeline(pipeId, (p) => ({
    ...p,
    running: true,
    steps: defaultSteps().map((st) => ({ ...st })),
  }))
  toast(`Run：${pipe.name}`)
  schedule(() => runStepSequence(pipeId, 0), 200)
}

/** Manual publish from Datasets page — blocked if quality not pass. */
export function tryPublishDataset(datasetId: string) {
  if (!qualityPassFor(datasetId)) {
    toast('质量门未 pass · 发布按钮不可用（请先打分达标）')
    return
  }
  const ds = state.datasets.find((d) => d.id === datasetId)
  if (!ds) return
  const sourceId = state.pipelines.find((p) => p.targetDatasetId === datasetId)?.sourceId ?? 'src-oss'
  const ver = publishNewVersion(datasetId, {
    sourceId,
    note: '手动发布 · 不可变 version',
  })
  toast(ver ? `已发布 ${ds.name}@${ver.tag}` : '发布失败')
}

export function pinVersion(datasetId: string, tag: string) {
  setState((s) => ({
    ...s,
    datasets: s.datasets.map((d) =>
      d.id === datasetId
        ? {
            ...d,
            versions: d.versions.map((v) => ({
              ...v,
              pinned: v.tag === tag,
            })),
          }
        : d,
    ),
  }))
  toast(`已 pin ${tag}`)
}

export function updateDraftNote(datasetId: string, draftNote: string) {
  setState((s) => ({
    ...s,
    datasets: s.datasets.map((d) => (d.id === datasetId ? { ...d, draftNote } : d)),
  }))
}

export function saveRecipe(
  recipeId: string,
  ratios: { label: string; pct: number }[],
  sampleTotal: number,
) {
  const sum = ratios.reduce((a, r) => a + r.pct, 0)
  if (sum <= 0) {
    toast('配比总和需 > 0')
    return
  }
  setState((s) => ({
    ...s,
    recipes: s.recipes.map((r) =>
      r.id === recipeId
        ? { ...r, ratios, sampleTotal, savedAt: nowIso(), note: '已保存（内存）' }
        : r,
    ),
  }))
  toast('配比已保存')
}

export function requestExport() {
  const id = uid('exp')
  setState((s) => ({
    ...s,
    exports: [
      {
        id,
        title: `导出单 · ${id.slice(-6).toUpperCase()}`,
        from: '办案侧申请（示意）',
        status: 'requested',
        requested: nowIso().slice(0, 10),
        note: '无案正文 · 申请中',
        candidateDatasetId: null,
      },
      ...s.exports,
    ],
  }))
  toast('已申请导出单')
}

export function approveExport(exportId: string) {
  const ex = state.exports.find((e) => e.id === exportId)
  if (!ex) return
  if (ex.status !== 'requested') {
    toast('仅 requested 可审批')
    return
  }
  setState((s) => ({
    ...s,
    exports: s.exports.map((e) =>
      e.id === exportId ? { ...e, status: 'approved', note: '已审批 · 待完成（假脱敏）' } : e,
    ),
  }))
  toast('导出单已审批')
}

export function completeExport(exportId: string) {
  const ex = state.exports.find((e) => e.id === exportId)
  if (!ex) return
  if (ex.status !== 'approved') {
    toast('仅 approved 可完成')
    return
  }
  setState((s) => ({
    ...s,
    exports: s.exports.map((e) =>
      e.id === exportId ? { ...e, status: 'done', note: '已完成 · 无案正文 · 可生成候选集' } : e,
    ),
  }))
  toast('导出单已完成')
}

export function createCandidateFromExport(exportId: string) {
  const ex = state.exports.find((e) => e.id === exportId)
  if (!ex || ex.status !== 'done') {
    toast('完成后才能生成候选数据集')
    return
  }
  if (ex.candidateDatasetId) {
    toast('已生成过候选集')
    return
  }
  const id = uid('ds-cand')
  const name = `export-cand-${exportId.slice(-4)}`
  const version: DatasetVersion = {
    tag: 'v0.1',
    checksum: fakeChecksum(`${id}@v0.1`),
    rows: 500,
    publishedAt: nowIso(),
    immutable: true,
    note: '导出候选 · 未进种子契约',
    pinned: false,
    tone: 'info',
  }
  const ds: Dataset = {
    id,
    name,
    purpose: '候选',
    versions: [version],
    rowEstimate: 500,
    updated: nowIso().slice(0, 10),
    note: '由脱敏导出生成 · 无案正文',
    draftNote: '候选草稿',
  }
  setState((s) => ({
    ...s,
    datasets: [ds, ...s.datasets],
    exports: s.exports.map((e) =>
      e.id === exportId ? { ...e, candidateDatasetId: id, note: `已生成候选 ${name}` } : e,
    ),
    qualityReports: [
      {
        id: `q-${id}`,
        datasetId: id,
        datasetLabel: `${name} @ v0.1`,
        score: null,
        status: 'idle',
        findings: [],
        ranAt: null,
        tone: 'empty',
        note: '候选集待打分 · 非真引擎',
        forceFailNext: false,
      },
      ...s.qualityReports,
    ],
  }))
  const srcNode = ensureNode('脱敏导出接入', 'Source', 'n-src-export')
  const verNode = ensureNode(`${name}@v0.1`, 'Version', `n-ver-${id}-v0.1`)
  appendEdge(srcNode, verNode, 'export-candidate')
  toast(`已生成候选数据集 ${name}`)
}

export function createRefeedFromTicket(ticketId: string) {
  const t = state.tickets.find((x) => x.id === ticketId)
  if (!t) return
  if (t.status === 'linked' && t.linkedPipelineId) {
    toast('该 ticket 已挂过 pipeline')
    return
  }
  const pipeId = uid('pipe-refeed')
  const target =
    state.datasets.find((d) => d.id === 'ds-claims-sft') ?? state.datasets[0]
  if (!target) return
  const pipe: Pipeline = {
    id: pipeId,
    name: `refeed-${ticketId.slice(-4)}`,
    targetDatasetId: target.id,
    sourceId: 'src-oss',
    steps: defaultSteps(),
    running: false,
    lastRunAt: null,
    note: `难例回灌 · from ${t.title}`,
    fromTicketId: ticketId,
  }
  setState((s) => ({
    ...s,
    pipelines: [pipe, ...s.pipelines],
    tickets: s.tickets.map((x) =>
      x.id === ticketId
        ? { ...x, status: 'linked', linkedPipelineId: pipeId, note: `已挂 ${pipe.name}` }
        : x,
    ),
  }))
  toast(`已创建回灌任务 ${pipe.name}`)
}

export function jobStatusTone(status: JobStatus): 'ok' | 'warn' | 'down' | 'empty' | 'info' {
  switch (status) {
    case 'done':
      return 'ok'
    case 'running':
    case 'queued':
      return 'info'
    case 'fail':
      return 'down'
    case 'blocked':
      return 'warn'
    default:
      return 'empty'
  }
}

export function getState() {
  return state
}

export function subscribe(listener: () => void) {
  listeners.add(listener)
  return () => listeners.delete(listener)
}

export function useAiDataStore(): AiDataState {
  return useSyncExternalStore(subscribe, getState, getState)
}

export function selectQualityReport(datasetId: string): QualityReport | undefined {
  return state.qualityReports.find((q) => q.datasetId === datasetId)
}

bootstrapPublishedLocalStorage()
