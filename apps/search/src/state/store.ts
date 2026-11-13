import { useSyncExternalStore } from 'react'
import { buildFamilies, createInitialHits, SEED_HITS } from './seed'
import {
  CURRENT_INDEX_TAG,
  SEED_CORPUS_SOURCES,
  SEED_FIELD_COVERAGE,
  SEED_INDEX_VERSIONS,
} from './corpusSeed'
import type {
  AdvancedRow,
  CorpusIngestJob,
  DownstreamTarget,
  EventLogEntry,
  IndexVersion,
  SearchFilters,
  SearchHit,
  SearchMode,
  SearchResponse,
  SearchState,
} from './types'
import { DOWNSTREAM_PLACEHOLDERS, emptyFilters, STRATEGY_A_TOAST } from './types'
import {
  applyFilters,
  buildQuery,
  runScoring,
  validateQuery,
} from '../lib/searchEngine'
import {
  SEARCH_API_FALLBACK_TOAST,
  checkSearchApiHealth,
  isSearchApiEnabled,
  searchViaApi,
} from '../lib/searchApi'

let state: SearchState = {
  mode: 'keyword',
  text: '',
  advancedRows: [
    { id: 'row-1', field: 'title', value: '' },
    { id: 'row-2', field: 'applicant', value: '' },
  ],
  filters: emptyFilters(true),
  status: 'idle',
  error: null,
  forceNextFail: false,
  hits: [],
  families: [],
  lastQuery: null,
  lastResponse: null,
  selectedHitId: null,
  basketIds: [],
  savedIds: [],
  events: [],
  toast: null,
  limit: 50,
  corpusSources: SEED_CORPUS_SOURCES.map((s) => ({ ...s })),
  corpusJobs: [],
  corpusForceNextFail: false,
  indexVersions: SEED_INDEX_VERSIONS.map((v) => ({
    ...v,
    fieldCoverage: v.fieldCoverage.map((r) => ({ ...r })),
  })),
  currentIndexTag: CURRENT_INDEX_TAG,
  pendingPublishDocs: null,
}

const listeners = new Set<() => void>()
const timers = new Set<ReturnType<typeof setTimeout>>()
const corpus: SearchHit[] = createInitialHits()

function emit() {
  for (const l of listeners) l()
}

function setState(partial: Partial<SearchState> | ((prev: SearchState) => SearchState)) {
  state = typeof partial === 'function' ? partial(state) : { ...state, ...partial }
  emit()
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

function toast(message: string) {
  setState({ toast: message })
  schedule(() => {
    if (state.toast === message) setState({ toast: null })
  }, 2800)
}

function pushEvent(entry: Omit<EventLogEntry, 'id' | 'at'> & { at?: string }) {
  const full: EventLogEntry = {
    id: uid('evt'),
    at: entry.at ?? nowIso(),
    action: entry.action,
    tool: entry.tool,
    note: entry.note,
    hitIds: entry.hitIds,
    hits: entry.hits,
    payload: entry.payload,
  }
  setState((s) => ({ ...s, events: [full, ...s.events].slice(0, 40) }))
}

function getSnapshot() {
  return state
}

function subscribe(listener: () => void) {
  listeners.add(listener)
  return () => listeners.delete(listener)
}

export function useSearchStore() {
  return useSyncExternalStore(subscribe, getSnapshot, getSnapshot)
}

export const searchActions = {
  setMode(mode: SearchMode) {
    setState({ mode, error: null })
  },
  setText(text: string) {
    setState({ text, error: null })
  },
  setAdvancedRows(rows: AdvancedRow[]) {
    setState({ advancedRows: rows, error: null })
  },
  addAdvancedRow() {
    setState((s) => ({
      ...s,
      advancedRows: [
        ...s.advancedRows,
        { id: uid('row'), field: 'abstract', value: '' },
      ],
    }))
  },
  removeAdvancedRow(id: string) {
    setState((s) => ({
      ...s,
      advancedRows: s.advancedRows.length <= 1 ? s.advancedRows : s.advancedRows.filter((r) => r.id !== id),
    }))
  },
  updateAdvancedRow(id: string, patch: Partial<AdvancedRow>) {
    setState((s) => ({
      ...s,
      advancedRows: s.advancedRows.map((r) => (r.id === id ? { ...r, ...patch } : r)),
      error: null,
    }))
  },
  setFilters(filters: SearchFilters) {
    setState({ filters })
  },
  patchFilters(patch: Partial<SearchFilters>) {
    setState((s) => ({ ...s, filters: { ...s.filters, ...patch } }))
  },
  clearFilters() {
    setState((s) => ({
      ...s,
      filters: emptyFilters(s.filters.collapseFamily ?? true),
    }))
  },
  toggleCollapseFamily() {
    setState((s) => ({
      ...s,
      filters: {
        ...s.filters,
        collapseFamily: !(s.filters.collapseFamily ?? true),
      },
    }))
  },
  setForceNextFail(v: boolean) {
    setState({ forceNextFail: v })
  },
  clearError() {
    setState({ error: null, status: state.status === 'error' ? 'idle' : state.status })
  },
  dismissError() {
    setState({ error: null, status: 'idle' })
  },
  openHit(id: string) {
    setState({ selectedHitId: id })
    const h = [...corpus, ...state.hits].find((x) => x.id === id)
    pushEvent({
      action: 'openDetail',
      tool: 'search.get',
      hitIds: [id],
      hits: h
        ? [{ id: h.id, publicationNumber: h.publicationNumber, title: h.title }]
        : undefined,
      note: '打开详情抽屉',
      payload: { id },
    })
  },
  closeHit() {
    setState({ selectedHitId: null })
  },
  addToBasket(id: string) {
    if (state.basketIds.includes(id)) {
      toast('已在工作篮')
      return
    }
    const h = findHit(id)
    setState((s) => ({ ...s, basketIds: [...s.basketIds, id] }))
    pushEvent({
      action: 'basket.add',
      tool: 'search.basket.add',
      hitIds: [id],
      hits: h
        ? [{ id: h.id, publicationNumber: h.publicationNumber, title: h.title }]
        : undefined,
      note: '加入工作篮',
      payload: { ids: [id] },
    })
    toast('已加入工作篮')
  },
  removeFromBasket(id: string) {
    setState((s) => ({ ...s, basketIds: s.basketIds.filter((x) => x !== id) }))
    pushEvent({
      action: 'basket.remove',
      tool: 'search.basket.remove',
      hitIds: [id],
      note: '移出工作篮',
      payload: { ids: [id] },
    })
  },
  toggleSaved(id: string) {
    setState((s) => {
      const has = s.savedIds.includes(id)
      return {
        ...s,
        savedIds: has ? s.savedIds.filter((x) => x !== id) : [...s.savedIds, id],
      }
    })
    pushEvent({
      action: 'save',
      tool: 'search.saved.toggle',
      hitIds: [id],
      note: '收藏夹（仅内存，不写案）',
      payload: { id },
    })
  },
  sendToAgent() {
    if (state.basketIds.length === 0) return
    const hits = state.basketIds
      .map((id) => findHit(id))
      .filter((h): h is SearchHit => !!h)
      .map((h) => ({
        id: h.id,
        publicationNumber: h.publicationNumber,
        title: h.title,
      }))
    pushEvent({
      action: 'sendToAgent',
      tool: 'search.sendToAgent',
      hitIds: [...state.basketIds],
      hits,
      note: '样机事件·未真派发',
      payload: { hitIds: [...state.basketIds] },
    })
    toast('已记录送 Agent（样机·未真派发）')
  },
  getFamily(familyId: string) {
    const members = corpus.filter((h) => h.familyId === familyId)
    pushEvent({
      action: 'getFamily',
      tool: 'cluster_hits',
      hitIds: members.map((m) => m.id),
      hits: members.map((m) => ({
        id: m.id,
        publicationNumber: m.publicationNumber,
        title: m.title,
      })),
      note: 'getFamily ≡ cluster_hits / get_family',
      payload: { familyId },
    })
    return { familyId, members }
  },
  /** Apply filters to last response hits without full re-score, or re-run if we have a query. */
  applyFiltersNow() {
    if (state.lastQuery) {
      searchActions.runSearch({ fromFilters: true })
    }
  },
  runSearch(opts?: { fromFilters?: boolean }) {
    const err = validateQuery(state.mode, state.text, state.advancedRows)
    if (err) {
      setState({ error: err, status: 'error' })
      return
    }
    const query = buildQuery({
      mode: state.mode,
      text: state.text,
      advancedRows: state.advancedRows,
      filters: state.filters,
      limit: state.limit,
    })
    setState({ status: 'running', error: null, lastQuery: query })

    const finishMock = (optsInner?: {
      fromFilters?: boolean
      delay?: number
      afterApiFallback?: boolean
    }) => {
      const delay = optsInner?.delay ?? 280 + Math.floor(Math.random() * 170)
      schedule(() => {
        if (state.forceNextFail) {
          const failResp: SearchResponse = {
            query,
            hits: [],
            families: [],
            tookMs: delay,
            backend: 'mock',
          }
          setState({
            status: 'error',
            error: '注入故障：下次强制失败（样机）',
            forceNextFail: false,
            hits: [],
            families: [],
            lastResponse: failResp,
          })
          pushEvent({
            action: 'search',
            tool: 'commercial_patent_search',
            note: 'search failed (injected)',
            payload: { query, backend: 'mock' },
          })
          return
        }
        const scored = runScoring(
          corpus,
          query.mode,
          query.text ?? '',
          query.advanced,
        )
        const filtered = applyFilters(scored, query.filters ?? {}).slice(
          0,
          query.limit ?? 50,
        )
        const families = buildFamilies(filtered)
        const response: SearchResponse = {
          query,
          hits: filtered,
          families,
          tookMs: delay,
          backend: 'mock',
        }
        setState({
          status: filtered.length > 0 ? 'done' : 'empty',
          hits: filtered,
          families,
          lastResponse: response,
          error: null,
          filters: {
            ...state.filters,
            collapseFamily: state.filters.collapseFamily ?? true,
          },
        })
        pushEvent({
          action: 'search',
          tool: 'commercial_patent_search',
          note: optsInner?.afterApiFallback
            ? 'API fallback → mock'
            : optsInner?.fromFilters
              ? '过滤后重跑'
              : 'runSearch',
          hitIds: filtered.map((h) => h.id),
          payload: {
            query,
            backend: 'mock',
            hitCount: filtered.length,
            apiFallback: !!optsInner?.afterApiFallback,
          },
        })
      }, delay)
    }

    if (!isSearchApiEnabled()) {
      finishMock({ fromFilters: opts?.fromFilters })
      return
    }

    void (async () => {
      // Optional health probe (best-effort); search failure path toasts + falls back
      await checkSearchApiHealth()
      if (state.forceNextFail) {
        // Keep inject-fail path on mock even when flag is on
        finishMock({ fromFilters: opts?.fromFilters })
        return
      }
      const api = await searchViaApi(query)
      if (!api.ok) {
        toast(SEARCH_API_FALLBACK_TOAST)
        finishMock({ fromFilters: opts?.fromFilters, afterApiFallback: true })
        return
      }
      const response = api.response
      const hits = response.hits
      const families =
        response.families && response.families.length > 0
          ? response.families
          : buildFamilies(hits)
      setState({
        status: hits.length > 0 ? 'done' : 'empty',
        hits,
        families,
        lastResponse: { ...response, families },
        error: null,
        filters: {
          ...state.filters,
          collapseFamily: state.filters.collapseFamily ?? true,
        },
      })
      if (response.warnings && response.warnings.length > 0) {
        toast(response.warnings.join(' · '))
      }
      pushEvent({
        action: 'search',
        tool: 'commercial_patent_search',
        note: opts?.fromFilters ? '过滤后重跑 (API)' : 'runSearch (API)',
        hitIds: hits.map((h) => h.id),
        payload: {
          query,
          backend: response.backend,
          hitCount: hits.length,
          indexVersion: response.indexVersion,
          warnings: response.warnings,
        },
      })
    })()
  },

  setCorpusForceNextFail(v: boolean) {
    setState({ corpusForceNextFail: v })
  },

  startCorpusIngest(sourceId: string) {
    const src = state.corpusSources.find((s) => s.id === sourceId)
    if (!src) return
    if (
      state.corpusJobs.some(
        (j) =>
          j.sourceId === sourceId &&
          (j.status === 'queued' || j.status === 'running'),
      )
    ) {
      toast('该源已有进行中的入库任务')
      return
    }
    const jobId = uid('cing')
    const job: CorpusIngestJob = {
      id: jobId,
      sourceId,
      sourceName: src.name,
      status: 'queued',
      progress: 0,
      docsWritten: 0,
      createdAt: nowIso(),
      updatedAt: nowIso(),
      note: '假入库 · 无真 ES / 对象存储',
    }
    setState((s) => ({ ...s, corpusJobs: [job, ...s.corpusJobs] }))
    pushEvent({
      action: 'corpus.ingest',
      tool: 'search.corpus.ingest',
      note: `入库排队：${src.name}`,
      payload: {
        tool: 'search.corpus.ingest',
        backend: 'mock',
        sourceId,
        sourceName: src.name,
        jobId,
        status: 'queued',
      },
    })
    toast(`入库已排队：${src.name}`)

    const willFail = state.corpusForceNextFail
    if (willFail) setState({ corpusForceNextFail: false })

    schedule(() => {
      setState((s) => ({
        ...s,
        corpusJobs: s.corpusJobs.map((j) =>
          j.id === jobId
            ? { ...j, status: 'running', progress: 8, updatedAt: nowIso() }
            : j,
        ),
      }))
    }, 400)

    const ticks = [22, 40, 58, 75, 90]
    ticks.forEach((pct, i) => {
      schedule(() => {
        setState((s) => {
          const cur = s.corpusJobs.find((j) => j.id === jobId)
          if (!cur || cur.status === 'fail' || cur.status === 'done') return s
          return {
            ...s,
            corpusJobs: s.corpusJobs.map((j) =>
              j.id === jobId
                ? { ...j, progress: pct, status: 'running', updatedAt: nowIso() }
                : j,
            ),
          }
        })
      }, 700 + i * 380)
    })

    schedule(() => {
      if (willFail) {
        setState((s) => ({
          ...s,
          corpusJobs: s.corpusJobs.map((j) =>
            j.id === jobId
              ? {
                  ...j,
                  status: 'fail',
                  progress: 100,
                  updatedAt: nowIso(),
                  note: '注入故障：下次强制失败（样机）',
                }
              : j,
          ),
        }))
        pushEvent({
          action: 'corpus.ingest',
          tool: 'search.corpus.ingest',
          note: `入库失败：${src.name}`,
          payload: {
            tool: 'search.corpus.ingest',
            backend: 'mock',
            sourceId,
            jobId,
            status: 'fail',
          },
        })
        toast(`入库失败：${src.name}`)
        return
      }
      const written = 120 + Math.floor(Math.random() * 380)
      setState((s) => ({
        ...s,
        corpusJobs: s.corpusJobs.map((j) =>
          j.id === jobId
            ? {
                ...j,
                status: 'done',
                progress: 100,
                docsWritten: written,
                updatedAt: nowIso(),
                note: `假写入 +${written} 篇（不写 PatentCase）`,
              }
            : j,
        ),
        corpusSources: s.corpusSources.map((x) =>
          x.id === sourceId
            ? {
                ...x,
                docsIngested: x.docsIngested + written,
                lastIngestAt: nowIso(),
              }
            : x,
        ),
        pendingPublishDocs: (s.pendingPublishDocs ?? 0) + written,
      }))
      pushEvent({
        action: 'corpus.ingest',
        tool: 'search.corpus.ingest',
        note: `入库完成：${src.name} +${written}`,
        payload: {
          tool: 'search.corpus.ingest',
          backend: 'mock',
          sourceId,
          jobId,
          status: 'done',
          docsWritten: written,
        },
      })
      toast(`入库完成 · +${written} 篇（待发布索引）`)
    }, 700 + ticks.length * 380 + 500)
  },

  publishIndex() {
    const pending = state.pendingPublishDocs
    if (pending == null || pending <= 0) {
      toast('无可发布入库增量')
      return
    }
    const hasDone = state.corpusJobs.some((j) => j.status === 'done')
    if (!hasDone) {
      toast('需先有成功入库任务')
      return
    }
    const nextN =
      Math.max(
        ...state.indexVersions.map((v) => {
          const m = /^idx-v(\d+)\.(\d+)$/.exec(v.tag)
          return m ? Number(m[1]) * 100 + Number(m[2]) : 0
        }),
        3,
      ) + 1
    const major = Math.floor(nextN / 100)
    const minor = nextN % 100
    const tag = `idx-v${major}.${minor}`
    const prev = state.indexVersions.find((v) => v.tag === state.currentIndexTag)
    const docs = (prev?.docs ?? 7000) + pending
    const version: IndexVersion = {
      tag,
      docs,
      publishedAt: nowIso(),
      checksum: `sha256:mock-${tag}-${Math.random().toString(36).slice(2, 10)}`,
      fieldCoverage: SEED_FIELD_COVERAGE.map((r) => {
        // slight honest drift after ingest
        const drift = r.field === 'claims' || r.field === 'familyId' ? -1 : 0
        return {
          ...r,
          coveragePct: Math.min(100, Math.max(50, r.coveragePct + drift)),
        }
      }),
      immutable: true,
      note: '已发布 · 不可改',
    }
    setState((s) => ({
      ...s,
      indexVersions: [version, ...s.indexVersions],
      currentIndexTag: tag,
      pendingPublishDocs: null,
    }))
    pushEvent({
      action: 'corpus.publishIndex',
      tool: 'search.corpus.publishIndex',
      note: `发布索引 ${tag}`,
      payload: {
        tool: 'search.corpus.publishIndex',
        backend: 'mock',
        tag,
        docs,
        checksum: version.checksum,
        fieldCoverage: version.fieldCoverage,
      },
    })
    toast(`已发布索引 ${tag}（样机·无真 ES）`)
  },

  sendDownstream(target: DownstreamTarget) {
    if (state.basketIds.length === 0) return
    const ph = DOWNSTREAM_PLACEHOLDERS.find((d) => d.target === target)
    if (!ph) return
    const hits = state.basketIds
      .map((id) => findHit(id))
      .filter((h): h is SearchHit => !!h)
      .map((h) => ({
        id: h.id,
        publicationNumber: h.publicationNumber,
        title: h.title,
      }))
    const note = STRATEGY_A_TOAST
    const publicationNumbers = hits.map((h) => h.publicationNumber)
    pushEvent({
      action: 'sendDownstream',
      tool: 'search.sendDownstream',
      hitIds: [...state.basketIds],
      hits,
      note,
      payload: {
        target: ph.target,
        href: ph.href,
        hitIds: [...state.basketIds],
        publicationNumbers,
        hits,
        note,
      },
    })
    toast(`${ph.label}：${note}`)
  },
}

function findHit(id: string): SearchHit | undefined {
  return state.hits.find((h) => h.id === id) || corpus.find((h) => h.id === id)
}

export function getCorpus(): SearchHit[] {
  return corpus
}

export function getSeedStats() {
  const fam = new Set(SEED_HITS.map((h) => h.familyId).filter(Boolean))
  const multi = [...fam].filter(
    (f) => SEED_HITS.filter((h) => h.familyId === f).length >= 2,
  )
  return { hitCount: SEED_HITS.length, familyCount: fam.size, multiFamilyCount: multi.length }
}
